import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Download,
  ExternalLink,
  UserCog,
  FileKey,
  ShieldCheck,
  Hash,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DecisionRecordItem } from "../types";

interface DecisionDisplayProps {
  record: DecisionRecordItem;
  onVerify: (evidence: any) => void;
  onOpenOverride: (record: DecisionRecordItem) => void;
}

export const DecisionDisplay: React.FC<DecisionDisplayProps> = ({
  record,
  onVerify,
  onOpenOverride,
}) => {
  const [showJson, setShowJson] = useState(false);
  const [showCommitments, setShowCommitments] = useState(false);

  const { decision, evidence, override } = record;
  const isApproved = decision.decision === "APPROVED";

  const downloadJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="decision-display-root">
      {/* Primary Decision Banner */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 shadow-xl ${
          isApproved
            ? "bg-slate-900/90 border-emerald-500/40"
            : "bg-slate-900/90 border-rose-500/40"
        }`}
        id="decision-banner"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                isApproved
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              {isApproved ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {isApproved ? "Credit Assessment: APPROVED" : "Credit Assessment: REJECTED"}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    decision.riskTier === "LOW_RISK"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : decision.riskTier === "MODERATE_RISK"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-rose-950 text-rose-300 border border-rose-800"
                  }`}
                >
                  {decision.riskTier.replace("_", " ")}
                </span>
                {override && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-950 text-violet-300 border border-violet-700">
                    MANUALLY OVERRIDDEN
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 max-w-2xl">
                {decision.summaryReason}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-verify-receipt"
              onClick={() => onVerify(evidence)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Receipt Offline →</span>
            </button>

            <button
              id="btn-download-receipt"
              onClick={() =>
                downloadJson(evidence, `cool-evidence-${record.recordId}.json`)
              }
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download (.json)</span>
            </button>

            {!override && (
              <button
                id="btn-trigger-override"
                onClick={() => onOpenOverride(record)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-violet-950/70 hover:bg-violet-900/80 text-violet-200 border border-violet-700/80 transition cursor-pointer"
              >
                <UserCog className="w-4 h-4 text-violet-300" />
                <span>Officer Override</span>
              </button>
            )}
          </div>
        </div>

        {/* Financial Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-slate-400 block mb-1">
              Sanctioned / Requested
            </span>
            <span className="text-lg font-bold font-mono text-white">
              ₹{(isApproved ? decision.approvedAmount : decision.requestedAmount).toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Tenure: {record.application.tenureMonths} mo
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Interest Rate</span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {isApproved ? `${decision.interestRate}% p.a.` : "N/A"}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Risk-adjusted pricing
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Monthly EMI</span>
            <span className="text-lg font-bold font-mono text-white">
              {isApproved ? `₹${decision.monthlyEmi.toLocaleString("en-IN")}` : "₹0"}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Total debt burden: {(decision.dtiRatio * 100).toFixed(1)}%
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Bureau Score</span>
            <span
              className={`text-lg font-bold font-mono ${
                decision.creditScore >= 720
                  ? "text-emerald-400"
                  : decision.creditScore >= 650
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {decision.creditScore} / 850
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Min. requirement: 650
            </span>
          </div>
        </div>

        {/* Explainability Matrix: Rule Evaluations */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Auditable Rule Evaluations (RBI Model Risk Framework)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {decision.rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                  rule.passed
                    ? "bg-slate-950/40 border-slate-800/80 text-slate-300"
                    : "bg-rose-950/20 border-rose-900/60 text-rose-200"
                }`}
              >
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    {rule.passed ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>{rule.ruleName}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{rule.impact}</p>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <span className="text-slate-400 block text-[10px]">Actual vs Policy</span>
                  <span className={rule.passed ? "text-emerald-400 font-medium" : "text-rose-400 font-bold"}>
                    {rule.actualValue} (req. {rule.threshold})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chained Human Override Section (if present) */}
      {override && (
        <div className="bg-gradient-to-br from-violet-950/30 to-slate-900 border border-violet-700/60 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-violet-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/40 flex items-center justify-center text-violet-300">
                <UserCog className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">
                    Officer Override Evidence Event
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-violet-900/80 text-violet-200 border border-violet-700">
                    type: credit.override
                  </span>
                </div>
                <p className="text-xs text-violet-300/80">
                  Cryptographically chained to executionId:{" "}
                  <span className="font-mono text-white">{record.executionId}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-verify-override"
                onClick={() => onVerify(override.evidence)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500 hover:bg-violet-400 text-slate-950 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Override Receipt →</span>
              </button>
              <button
                id="btn-download-override"
                onClick={() =>
                  downloadJson(
                    override.evidence,
                    `cool-override-${override.recordId}.json`
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download (.json)</span>
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-violet-900/40">
              <span className="text-slate-400 block mb-1">Underwriting Officer</span>
              <span className="font-semibold text-white block">
                {override.result.officerName}
              </span>
              <span className="text-slate-500 text-[11px] font-mono">
                ID: {override.result.officerId} ({override.result.officerBranch})
              </span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-violet-900/40">
              <span className="text-slate-400 block mb-1">Decision Transition</span>
              <div className="flex items-center gap-2 mt-0.5 font-bold">
                <span className="text-rose-400 font-mono">{override.result.originalDecision}</span>
                <span className="text-slate-500">→</span>
                <span className="text-emerald-400 font-mono">{override.result.finalDecision}</span>
              </div>
              <span className="text-violet-300 text-[11px]">
                {override.result.exceptionCategory}
              </span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-violet-900/40">
              <span className="text-slate-400 block mb-1">Chained Override Record ID</span>
              <span className="font-mono text-cyan-300 block truncate font-semibold">
                {override.recordId}
              </span>
              <span className="text-slate-500 text-[11px]">
                {new Date(override.result.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-violet-900/30 text-xs">
            <span className="text-slate-400 font-medium block mb-1">
              Officer Justification & Regulatory Rationale:
            </span>
            <p className="text-slate-200 italic">"{override.result.justification}"</p>
          </div>
        </div>
      )}

      {/* CooL Cryptographic Evidence Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileKey className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                CooL Cryptographic Evidence Receipt
              </h4>
              <p className="text-xs text-slate-400">
                Schema: <span className="font-mono text-slate-300">{evidence.schema}</span> · Self-contained & offline-verifiable
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-commitments"
              onClick={() => setShowCommitments(!showCommitments)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <Hash className="w-3.5 h-3.5" />
              <span>{showCommitments ? "Hide Commitments" : "View Salted Commitments"}</span>
            </button>

            <button
              id="btn-toggle-raw-json"
              onClick={() => setShowJson(!showJson)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {showJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showJson ? "Hide JSON" : "Inspect Raw JSON"}</span>
            </button>
          </div>
        </div>

        {/* Evidence Key Identifiers */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[11px] mb-1 font-sans">
              Record ID (ULID)
            </span>
            <span className="text-emerald-400 font-semibold break-all">
              {record.recordId}
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[11px] mb-1 font-sans">
              Execution ID (Chained Thread)
            </span>
            <span className="text-cyan-400 font-semibold break-all">
              {record.executionId}
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 sm:col-span-2 lg:col-span-1">
            <span className="text-slate-500 block text-[11px] mb-1 font-sans">
              Signatures & Runtime
            </span>
            <span className="text-slate-200">ML-DSA-65 + Ed25519</span>
            <span className="text-amber-400 block text-[11px]">intel-tdx · simulated</span>
          </div>
        </div>

        {/* Salted Commitments & Data Minimisation Explainer */}
        {showCommitments && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 mb-2 text-cyan-300 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Data Minimisation in CooL: Salted SHA-256 Commitments</span>
            </div>
            <p className="text-slate-400 mb-3 text-[11px] leading-relaxed">
              In accordance with RBI privacy mandates, applicant PII (salary, credit score, PAN) never exists in plain text inside the compliance artifact.
              CooL produces cryptographic commitments using random cryptographic salts:
            </p>
            <div className="space-y-2 font-mono text-[11px] bg-black/50 p-3 rounded-lg border border-slate-900">
              <div>
                <span className="text-slate-500">Metadata Hash: </span>
                <span className="text-slate-200 break-all">{record.evidence.record?.event?.metadata_hash}</span>
              </div>
              <div>
                <span className="text-slate-500">Metadata Salt: </span>
                <span className="text-amber-300 break-all">{record.evidence.record?.event?.metadata_salt}</span>
              </div>
              <div>
                <span className="text-slate-500">Input Commitment: </span>
                <span className="text-emerald-400 break-all">
                  {record.evidence.record?.event?.commitments?.input || "Salted hash computed in secure enclave"}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Output Commitment: </span>
                <span className="text-emerald-400 break-all">
                  {record.evidence.record?.event?.commitments?.output || "Salted hash computed in secure enclave"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Raw JSON viewer */}
        {showJson && (
          <div className="mt-4 p-4 rounded-xl bg-black border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-96">
            <pre>{JSON.stringify(evidence, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
