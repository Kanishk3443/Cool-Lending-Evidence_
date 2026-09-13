import React, { useState } from "react";
import { X, UserCog, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { DecisionRecordItem, OfficerOverrideInput } from "../types";

interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DecisionRecordItem | null;
  onSubmitOverride: (input: OfficerOverrideInput) => Promise<void>;
  isLoading: boolean;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  isOpen,
  onClose,
  record,
  onSubmitOverride,
  isLoading,
}) => {
  if (!isOpen || !record) return null;

  const originalDecision = record.decision.decision;
  const targetDecision = originalDecision === "APPROVED" ? "REJECTED" : "APPROVED";

  const [officerId, setOfficerId] = useState("OFFICER-742");
  const [officerName, setOfficerName] = useState("Vikram Malhotra");
  const [officerBranch, setOfficerBranch] = useState("Central Credit Underwriting Desk");
  const [exceptionCategory, setExceptionCategory] = useState(
    originalDecision === "REJECTED" ? "ADDITIONAL_COLLATERAL_200_PERCENT" : "SUSPICIOUS_EMPLOYER_VERIFICATION"
  );
  const [justification, setJustification] = useState(
    originalDecision === "REJECTED"
      ? "Approved under discretionary risk authority: Applicant provided unencumbered commercial real estate collateral with 200% LTV cover and a corporate guarantor with AAA rating under circular RBI/2026-MRM/42."
      : "Sanction revoked post bureau re-run: Suspicious payroll anomaly detected during physical site verification."
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitOverride({
      originalExecutionId: record.executionId,
      originalRecordId: record.recordId,
      originalDecision,
      overrideDecision: targetDecision,
      officerId,
      officerName,
      officerBranch,
      justification,
      exceptionCategory,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Officer Discretionary Override
              </h3>
              <p className="text-xs text-slate-400">
                RBI Model Risk Management Framework (June 2026) Chained Audit
              </p>
            </div>
          </div>
          <button
            id="btn-close-override-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cryptographic linkage explainer */}
        <div className="px-6 py-3 bg-violet-950/30 border-b border-violet-900/40 text-xs text-violet-200 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
          <p>
            This action calls <code className="font-mono text-cyan-300">cool.record()</code> with <code className="font-mono text-emerald-300">type: "credit.override"</code> and the <strong>exact same executionId</strong> ({record.executionId.slice(0, 14)}...), immutably linking the human intervention to the AI model run.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Decision transition visual */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Current AI Assessment</span>
              <span
                className={`font-bold font-mono text-sm ${
                  originalDecision === "APPROVED" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {originalDecision}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
              <span>OVERRIDE TO</span>
              <ArrowRight className="w-4 h-4 text-violet-400" />
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Final Authorized Decision</span>
              <span
                className={`font-bold font-mono text-sm ${
                  targetDecision === "APPROVED" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {targetDecision}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="input-officer-id">
                Authorized Officer ID
              </label>
              <input
                id="input-officer-id"
                type="text"
                required
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="input-officer-name">
                Officer Full Name & Title
              </label>
              <input
                id="input-officer-name"
                type="text"
                required
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="input-officer-branch">
                Operating Branch / Risk Desk
              </label>
              <input
                id="input-officer-branch"
                type="text"
                required
                value={officerBranch}
                onChange={(e) => setOfficerBranch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="select-exception-category">
                Regulatory Exception Category
              </label>
              <select
                id="select-exception-category"
                value={exceptionCategory}
                onChange={(e) => setExceptionCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="ADDITIONAL_COLLATERAL_200_PERCENT">Collateral / Asset Lien Pledged (&gt;150% LTV)</option>
                <option value="CREDIT_GUARANTOR_AAA">Sovereign / Corporate Credit Guarantor</option>
                <option value="REPUTATIONAL_RELATIONSHIP_BANKING">High Net Worth Customer Relationship</option>
                <option value="DATA_REPORTING_BUREAU_DISPUTE">Legitimate Bureau Scoring Error Under Review</option>
                <option value="SUSPICIOUS_EMPLOYER_VERIFICATION">Negative Field Investigation Finding</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="textarea-justification">
              Mandatory Underwriting Justification
            </label>
            <textarea
              id="textarea-justification"
              required
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="State explicit factual rationale and policy exceptions..."
            />
            <span className="text-[11px] text-slate-500 block mt-1">
              This statement is committed under cryptographic salt and signed into the transparency log.
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              id="btn-cancel-override"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>

            <button
              id="btn-submit-override"
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Recording Override Evidence...</span>
              ) : (
                <>
                  <span>Sign & Record Override</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
