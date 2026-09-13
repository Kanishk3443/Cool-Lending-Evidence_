import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { cool, verifyEvidence, formatVerdict } from "./lib/cool.js";
import { scoreLoanApplication } from "./lib/decisionEngine.js";
import {
  LoanApplicationInput,
  OfficerOverrideInput,
  OfficerOverrideResult,
  DecisionRecordItem,
} from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// In-memory record store for active session convenience
const decisionStore: Map<string, DecisionRecordItem> = new Map();

/**
 * Health check endpoint
 */
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "cool-lending-evidence",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/records
 * Returns list of decisions generated in this runtime session
 */
app.get("/api/records", (_req: Request, res: Response) => {
  const records = Array.from(decisionStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ records });
});

/**
 * POST /api/decide
 * Runs rule-based underwriting engine and generates CooL cryptographic evidence receipt
 */
app.post("/api/decide", async (req: Request, res: Response): Promise<void> => {
  try {
    const input: LoanApplicationInput = req.body;

    if (!input || !input.applicantName || !input.monthlyIncome) {
      res.status(400).json({ error: "Invalid application payload: name and income required" });
      return;
    }

    // 1. Run rule-based scoring engine
    const decision = scoreLoanApplication(input);

    // 2. Wrap decision into CooL evidence receipt
    // Sensitive applicant PII is committed under salted SHA-256 hashes and discarded
    const recordResult = await cool.record({
      type: "credit.decision",
      metadata: {
        modelId: decision.modelId,
        modelVersion: decision.modelVersion,
        decision: decision.decision,
        riskTier: decision.riskTier,
        creditScore: decision.creditScore,
        requestedAmount: decision.requestedAmount,
        approvedAmount: decision.approvedAmount,
        interestRate: decision.interestRate,
        applicantMasked: `${input.applicantName.slice(0, 2)}*** (${input.applicantPan || "PAN-NA"})`,
        timestamp: decision.timestamp,
      },
      payloads: {
        input: JSON.stringify({
          applicantName: input.applicantName,
          applicantPan: input.applicantPan,
          monthlyIncome: input.monthlyIncome,
          existingEmi: input.existingEmi,
          requestedAmount: input.requestedAmount,
          tenureMonths: input.tenureMonths,
          creditScore: input.creditScore,
          employmentType: input.employmentType,
          purpose: input.purpose,
        }),
        output: JSON.stringify(decision),
      },
    });

    const item: DecisionRecordItem = {
      id: recordResult.recordId,
      executionId: recordResult.executionId,
      recordId: recordResult.recordId,
      application: input,
      decision,
      evidence: recordResult.evidence,
      createdAt: new Date().toISOString(),
    };

    decisionStore.set(recordResult.executionId, item);

    res.json({
      success: true,
      decision,
      recordId: recordResult.recordId,
      executionId: recordResult.executionId,
      digest: recordResult.digest,
      evidence: recordResult.evidence,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Error in /api/decide:", err);
    res.status(500).json({
      error: "Failed to record credit decision evidence",
      details: errorMsg,
    });
  }
});

/**
 * POST /api/override
 * Records a human officer override chained directly to the original executionId!
 */
app.post("/api/override", async (req: Request, res: Response): Promise<void> => {
  try {
    const input: OfficerOverrideInput = req.body;

    if (!input || !input.originalExecutionId || !input.overrideDecision || !input.officerId) {
      res.status(400).json({ error: "Missing required override parameters" });
      return;
    }

    const originalRecord = decisionStore.get(input.originalExecutionId);
    if (!originalRecord) {
      res.status(404).json({ error: "Original decision executionId not found in local session" });
      return;
    }

    const timestamp = new Date().toISOString();
    const overrideResult: OfficerOverrideResult = {
      status: "OVERRIDE_RECORDED",
      originalDecision: input.originalDecision,
      finalDecision: input.overrideDecision,
      officerId: input.officerId,
      officerName: input.officerName || "Authorized Credit Officer",
      officerBranch: input.officerBranch || "Central Risk Committee",
      justification: input.justification || "Senior underwriter discretionary authorization",
      exceptionCategory: input.exceptionCategory || "COLLATERAL_BACKED_EXCEPTION",
      regulatoryNotice:
        "Recorded in accordance with RBI Model Risk Management Framework (June 2026) human-in-the-loop audit guidelines.",
      timestamp,
    };

    // CooL's evidence model chains the two events together with the SAME executionId!
    const recordResult = await cool.record({
      type: "credit.override",
      executionId: input.originalExecutionId,
      metadata: {
        officerId: input.officerId,
        officerName: input.officerName,
        originalDecision: input.originalDecision,
        finalDecision: input.overrideDecision,
        exceptionCategory: input.exceptionCategory,
        reason: input.justification,
        timestamp,
      },
      payloads: {
        input: JSON.stringify({
          originalExecutionId: input.originalExecutionId,
          originalRecordId: input.originalRecordId,
          originalDecision: input.originalDecision,
          overrideDecision: input.overrideDecision,
          officerId: input.officerId,
          justification: input.justification,
          additionalCollateral: input.additionalCollateral,
          coSignerPan: input.coSignerPan,
        }),
        output: JSON.stringify(overrideResult),
      },
    });

    originalRecord.override = {
      result: overrideResult,
      evidence: recordResult.evidence,
      recordId: recordResult.recordId,
    };
    decisionStore.set(input.originalExecutionId, originalRecord);

    res.json({
      success: true,
      overrideResult,
      recordId: recordResult.recordId,
      executionId: recordResult.executionId,
      digest: recordResult.digest,
      evidence: recordResult.evidence,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Error in /api/override:", err);
    res.status(500).json({
      error: "Failed to record officer override evidence",
      details: errorMsg,
    });
  }
});

/**
 * POST /api/verify
 * Offline verification using verifyEvidence()
 */
app.post("/api/verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const { evidence } = req.body;
    if (!evidence) {
      res.status(400).json({ error: "No evidence receipt provided for verification" });
      return;
    }

    const verdict = await verifyEvidence(evidence);
    const formatted = formatVerdict(verdict);

    res.json({
      success: true,
      verdict,
      formatted,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Verification execution error:", err);
    res.status(422).json({
      success: false,
      error: "Verification failed to evaluate structure",
      details: errorMsg,
    });
  }
});

/**
 * POST /api/tamper
 * Generates a tampered copy of an evidence receipt for live tamper demo
 */
app.post("/api/tamper", (req: Request, res: Response): void => {
  try {
    const { evidence, tamperType = "event_type" } = req.body;
    if (!evidence) {
      res.status(400).json({ error: "No evidence provided" });
      return;
    }

    const tampered = JSON.parse(JSON.stringify(evidence));
    let description = "";

    if (tamperType === "event_type") {
      const original = tampered.record?.event?.type || "credit.decision";
      tampered.record.event.type = original === "credit.decision" ? "credit.fraud" : "credit.decision";
      description = `Altered event.type from '${original}' to '${tampered.record.event.type}'`;
    } else if (tamperType === "record_id") {
      const orig = tampered.record?.record_id || "01M2E4...";
      tampered.record.record_id = orig.slice(0, -1) + (orig.slice(-1) === "A" ? "B" : "A");
      description = `Mutated 1 byte in record_id from ${orig} to ${tampered.record.record_id}`;
    } else if (tamperType === "metadata_hash") {
      const origHash = tampered.record?.event?.metadata_hash || "";
      tampered.record.event.metadata_hash = origHash.slice(0, -2) + "ff";
      description = "Tampered metadata_hash digest bytes";
    } else if (tamperType === "signature") {
      if (tampered.signatures) {
        const firstKey = Object.keys(tampered.signatures)[0];
        if (firstKey) {
          const sig = tampered.signatures[firstKey] as { ml_dsa_signature?: string };
          if (sig && sig.ml_dsa_signature) {
            sig.ml_dsa_signature = sig.ml_dsa_signature.slice(0, -4) + "AAAA";
            description = `Corrupted ML-DSA-65 post-quantum signature bytes under key ${firstKey}`;
          }
        }
      }
    }

    res.json({
      success: true,
      tamperedEvidence: tampered,
      description,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: "Failed to tamper evidence", details: String(err) });
  }
});

async function seedInitialDecision() {
  try {
    const sampleInput: LoanApplicationInput = {
      applicantName: "Rahul Sharma",
      applicantPan: "BKAPS9812K",
      monthlyIncome: 85000,
      existingEmi: 12000,
      requestedAmount: 500000,
      tenureMonths: 36,
      creditScore: 765,
      employmentType: "salaried",
      purpose: "Home Renovation & Modernization",
    };

    const decision = scoreLoanApplication(sampleInput);
    const recordResult = await cool.record({
      type: "credit.decision",
      metadata: {
        modelId: decision.modelId,
        modelVersion: decision.modelVersion,
        decision: decision.decision,
        riskTier: decision.riskTier,
        creditScore: decision.creditScore,
        requestedAmount: decision.requestedAmount,
        approvedAmount: decision.approvedAmount,
        interestRate: decision.interestRate,
        applicantMasked: "Ra*** (BKAPS9812K)",
        timestamp: decision.timestamp,
      },
      payloads: {
        input: JSON.stringify(sampleInput),
        output: JSON.stringify(decision),
      },
    });

    const item: DecisionRecordItem = {
      id: recordResult.recordId,
      executionId: recordResult.executionId,
      recordId: recordResult.recordId,
      application: sampleInput,
      decision,
      evidence: recordResult.evidence,
      createdAt: new Date().toISOString(),
    };

    decisionStore.set(recordResult.executionId, item);
    console.log(`Seeded initial demo decision: ${recordResult.recordId} (${decision.decision})`);
  } catch (err) {
    console.error("Failed to seed initial demo decision:", err);
  }
}

// Start server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await seedInitialDecision();
  });
}

startServer();
