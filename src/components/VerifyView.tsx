import React, { useState } from "react";
import {
  FileCheck2,
  Bug,
  RotateCcw,
  Upload,
  AlertOctagon,
  HelpCircle,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { VerdictTable } from "./VerdictTable";
import { VerificationVerdict, DecisionRecordItem } from "../types";

interface VerifyViewProps {
  initialEvidence: any;
  recentRecords: DecisionRecordItem[];
  onEvidenceChange?: (evidence: any) => void;
}

export const VerifyView: React.FC<VerifyViewProps> = ({
  initialEvidence,
  recentRecords,
  onEvidenceChange,
}) => {
  const [evidenceJson, setEvidenceJson] = useState<string>(
    initialEvidence ? JSON.stringify(initialEvidence, null, 2) : ""
  );
  const [verdict, setVerdict] = useState<VerificationVerdict | null>(null);
  const [formattedOutput, setFormattedOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTampered, setIsTampered] = useState(false);
  const [tamperExplanation, setTamperExplanation] = useState<string | null>(null);
  const [originalBackup, setOriginalBackup] = useState<any>(initialEvidence || null);
  const [copied, setCopied] = useState(false);

  // When initialEvidence prop changes
  React.useEffect(() => {
    if (initialEvidence) {
      const formatted = JSON.stringify(initialEvidence, null, 2);
      setEvidenceJson(formatted);
      setOriginalBackup(initialEvidence);
      setIsTampered(false);
      setTamperExplanation(null);
      // Auto verify when routed
      void runVerification(initialEvidence);
    }
  }, [initialEvidence]);

  const runVerification = async (evidenceObj: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidence: evidenceObj }),
      });
      const data = await res.json();
      if (data.verdict) {
        setVerdict(data.verdict);
        setFormattedOutput(data.formatted || "");
      } else if (data.error) {
        setVerdict({
          ok: false,
          checks: {
            binding: { status: "FAILED", detail: data.error },
          },
          reasons: [data.details || data.error],
        });
      }
    } catch (err) {
      setVerdict({
        ok: false,
        checks: {
          binding: { status: "FAILED", detail: "Network/verification failure" },
        },
        reasons: [String(err)],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = async () => {
    try {
      const parsed = JSON.parse(evidenceJson);
      setIsTampered(false);
      setTamperExplanation(null);
      setOriginalBackup(parsed);
      await runVerification(parsed);
    } catch (e) {
      alert("Invalid JSON format in editor. Please check syntax.");
    }
  };

  const handleTamperDemo = async () => {
    let baseObj: any;
    try {
      baseObj = JSON.parse(evidenceJson);
    } catch (e) {
      alert("Please load or paste valid evidence JSON first.");
      return;
    }

    if (!originalBackup) {
      setOriginalBackup(baseObj);
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/tamper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidence: baseObj, tamperType: "event_type" }),
      });
      const data = await res.json();
      if (data.tamperedEvidence) {
        setEvidenceJson(JSON.stringify(data.tamperedEvidence, null, 2));
        setIsTampered(true);
        setTamperExplanation(data.description || "Altered 1 byte in record payload");
        await runVerification(data.tamperedEvidence);
      }
    } catch (err) {
      console.error("Tamper call failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (originalBackup) {
      setEvidenceJson(JSON.stringify(originalBackup, null, 2));
      setIsTampered(false);
      setTamperExplanation(null);
      await runVerification(originalBackup);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        setEvidenceJson(JSON.stringify(parsed, null, 2));
        setOriginalBackup(parsed);
        setIsTampered(false);
        setTamperExplanation(null);
        void runVerification(parsed);
      } catch (err) {
        alert("Failed to parse uploaded JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleSelectRecent = (rec: DecisionRecordItem) => {
    setEvidenceJson(JSON.stringify(rec.evidence, null, 2));
    setOriginalBackup(rec.evidence);
    setIsTampered(false);
    setTamperExplanation(null);
    void runVerification(rec.evidence);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(evidenceJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="verify-view-root">
      {/* Top Banner & Quick Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <FileCheck2 className="w-6 h-6 text-emerald-400" />
              Offline Cryptographic Verification & Tamper Lab
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              CooL receipts carry their own signatures (ML-DSA-65 + Ed25519) and RFC 6962 inclusion proofs.
              Third parties (auditors, regulators, applicants) verify them completely offline without database or API access.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-run-verify"
              onClick={handleManualVerify}
              disabled={isLoading || !evidenceJson}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>Verify Evidence</span>
            </button>

            <button
              id="btn-tamper-demo"
              onClick={handleTamperDemo}
              disabled={isLoading || !evidenceJson}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer disabled:opacity-50 shadow-md shadow-rose-600/20"
            >
              <Bug className="w-4 h-4" />
              <span>Tamper 1 Byte & Re-Verify</span>
            </button>

            {isTampered && (
              <button
                id="btn-reset-authentic"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Revert to Authentic</span>
              </button>
            )}
          </div>
        </div>

        {/* Load Recent or Upload Bar */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Load Recent:</span>
            {recentRecords.length === 0 ? (
              <span className="text-slate-500 italic">No previous decisions in this session</span>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {recentRecords.slice(0, 4).map((rec, i) => (
                  <button
                    key={rec.recordId}
                    id={`btn-load-recent-${i}`}
                    onClick={() => handleSelectRecent(rec)}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono transition"
                  >
                    {rec.application.applicantName.split(" ")[0]} (
                    <span className={rec.decision.decision === "APPROVED" ? "text-emerald-400" : "text-rose-400"}>
                      {rec.decision.decision[0]}
                    </span>
                    )
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="file-upload-evidence"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition font-medium"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .json</span>
              <input
                id="file-upload-evidence"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              id="btn-copy-evidence-json"
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Tamper Alert Bar if active */}
        {isTampered && (
          <div className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white mb-0.5">
                Tamper Experiment Active: {tamperExplanation}
              </div>
              <p className="text-slate-300 leading-relaxed">
                Notice below how the deterministic <strong>binding</strong> recomputation failed and the <strong>signature</strong> verification failed.
                An attacker or bank employee cannot alter a single character of a decision without invalidating the cryptographic proof.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Structured Verdict Results */}
      {verdict && (
        <VerdictTable
          verdict={verdict}
          formattedOutput={formattedOutput}
          isTampered={isTampered}
        />
      )}

      {/* JSON Payload Editor */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block" htmlFor="textarea-evidence-json">
            Evidence Receipt JSON (Verifiable Artifact)
          </label>
          <span className="text-xs font-mono text-slate-500">
            {evidenceJson.length.toLocaleString()} bytes
          </span>
        </div>
        <textarea
          id="textarea-evidence-json"
          rows={10}
          value={evidenceJson}
          onChange={(e) => setEvidenceJson(e.target.value)}
          className="w-full bg-black border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          placeholder="Paste CooL evidence receipt JSON here..."
        />
      </div>
    </div>
  );
};
