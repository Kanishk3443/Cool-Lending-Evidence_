import React from "react";
import { Database, FileText, CheckCircle, XCircle, ArrowRight, ShieldCheck, Download, UserCog } from "lucide-react";
import { DecisionRecordItem } from "../types";

interface VaultViewProps {
  records: DecisionRecordItem[];
  onSelectRecord: (record: DecisionRecordItem) => void;
  onVerify: (evidence: any) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  records,
  onSelectRecord,
  onVerify,
}) => {
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
    <div className="space-y-6" id="vault-view-root">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Cryptographic Evidence Vault
              </h2>
              <p className="text-xs text-slate-400">
                In-memory ledger of sealed AI credit decisions & chained human overrides in this runtime session
              </p>
            </div>
          </div>

          <div className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            {records.length} Total Receipts
          </div>
        </div>

        {records.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-slate-300 font-medium">No decisions generated yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Go to "Apply & Score" to submit a loan application and mint cryptographic CooL evidence.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 mt-4">
            {records.map((rec) => {
              const isApproved = rec.decision.decision === "APPROVED";
              return (
                <div
                  key={rec.recordId}
                  className="py-4.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-800/20 transition rounded-xl px-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {rec.application.applicantName}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        ({rec.application.applicantPan})
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isApproved
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-rose-950 text-rose-300 border border-rose-800"
                        }`}
                      >
                        {isApproved ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {rec.decision.decision}
                      </span>
                      {rec.override && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-950 text-violet-300 border border-violet-700">
                          <UserCog className="w-3 h-3" /> OVERRIDDEN TO {rec.override.result.finalDecision}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>Loan: ₹{rec.application.requestedAmount.toLocaleString("en-IN")}</span>
                      <span>Income: ₹{rec.application.monthlyIncome.toLocaleString("en-IN")}/mo</span>
                      <span>Score: {rec.decision.creditScore}</span>
                      <span className="font-mono text-slate-500">
                        {new Date(rec.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 flex flex-wrap items-center gap-3">
                      <span>
                        Record: <span className="text-emerald-400">{rec.recordId}</span>
                      </span>
                      <span>
                        Execution: <span className="text-cyan-400">{rec.executionId}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                    <button
                      id={`btn-inspect-record-${rec.recordId}`}
                      onClick={() => onSelectRecord(rec)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    >
                      View Details
                    </button>
                    <button
                      id={`btn-vault-verify-${rec.recordId}`}
                      onClick={() => onVerify(rec.evidence)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify
                    </button>
                    <button
                      id={`btn-vault-download-${rec.recordId}`}
                      onClick={() => downloadJson(rec.evidence, `cool-evidence-${rec.recordId}.json`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                      title="Download Evidence JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
