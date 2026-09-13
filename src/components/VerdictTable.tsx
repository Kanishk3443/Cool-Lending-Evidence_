import React from "react";
import { CheckCircle2, XCircle, AlertCircle, HelpCircle, Terminal } from "lucide-react";
import { VerificationVerdict, DomainCheck } from "../types";

interface VerdictTableProps {
  verdict: VerificationVerdict;
  formattedOutput?: string;
  isTampered?: boolean;
}

export const VerdictTable: React.FC<VerdictTableProps> = ({
  verdict,
  formattedOutput,
  isTampered = false,
}) => {
  const [showTerminal, setShowTerminal] = React.useState(false);

  const getStatusBadge = (check?: DomainCheck) => {
    if (!check) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400">
          <HelpCircle className="w-3 h-3" /> N/A
        </span>
      );
    }

    switch (check.status) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> VALID
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80 animate-pulse">
            <XCircle className="w-3.5 h-3.5 text-rose-400" /> FAILED
          </span>
        );
      case "simulated":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/60">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> SIMULATED
          </span>
        );
      case "absent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
            ABSENT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
            {check.status}
          </span>
        );
    }
  };

  const domainDefinitions = [
    {
      id: "binding",
      name: "Binding Commitment",
      subtext: "Deterministic hash commitment over record core",
      check: verdict.checks?.binding,
    },
    {
      id: "signature",
      name: "Post-Quantum Signature",
      subtext: "Dual hybrid ML-DSA-65 (NIST FIPS 204) + Ed25519",
      check: verdict.checks?.signature,
    },
    {
      id: "inclusion",
      name: "Transparency Log Inclusion",
      subtext: "RFC 6962 Merkle tree inclusion proof & Signed Tree Head (STH)",
      check: verdict.checks?.inclusion,
    },
    {
      id: "attestation",
      name: "Hardware Remote Attestation",
      subtext: "Intel TDX hardware quote (runs honestly in simulated mode)",
      check: verdict.checks?.attestation,
    },
    {
      id: "enclave",
      name: "Enclave Measurement",
      subtext: "Runtime identity & sealed key measurement verification",
      check: verdict.checks?.enclave,
    },
    {
      id: "witnesses",
      name: "Independent Witnesses",
      subtext: "Secondary multi-party consistency cosignatures",
      check: verdict.checks?.witnesses,
    },
    {
      id: "anchor",
      name: "Public Chain Anchor",
      subtext: "Immutable blockchain checkpoint timestamp",
      check: verdict.checks?.anchor,
    },
  ];

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl" id="verdict-table-container">
      {/* Header Result Bar */}
      <div
        className={`px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b ${
          verdict.ok
            ? "bg-emerald-950/40 border-emerald-900/50"
            : "bg-rose-950/40 border-rose-900/60"
        }`}
        id="verdict-header"
      >
        <div className="flex items-center gap-3">
          {verdict.ok ? (
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <XCircle className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">
                {verdict.ok ? "Cryptographic Verification Succeeded" : "Verification Failed: Tamper Detected"}
              </h3>
              {isTampered && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-rose-900/80 text-rose-200 border border-rose-700 rounded">
                  TAMPERED ARTIFACT
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {verdict.ok
                ? "All primary cryptographic domains (binding, signatures, Merkle inclusion) verified offline."
                : "One or more cryptographic commitments do not match the signed payload."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {formattedOutput && (
            <button
              id="btn-toggle-terminal"
              onClick={() => setShowTerminal(!showTerminal)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            >
              <Terminal className="w-3.5 h-3.5" />
              {showTerminal ? "Hide CLI Output" : "View CLI Output"}
            </button>
          )}
        </div>
      </div>

      {/* Terminal View */}
      {showTerminal && formattedOutput && (
        <div className="p-4 bg-black border-b border-slate-800 text-xs font-mono text-emerald-400 whitespace-pre overflow-x-auto selection:bg-emerald-900">
          {formattedOutput}
        </div>
      )}

      {/* Subject details if present */}
      {verdict.subject && (
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-slate-400">
          <div>
            <span className="text-slate-500">Subject: </span>
            <span className="text-slate-200 font-semibold">{verdict.subject.type || "credit.decision"}</span>
          </div>
          {verdict.subject.signer && (
            <div>
              <span className="text-slate-500">Signer Key: </span>
              <span className="text-cyan-300">{verdict.subject.signer}</span>
            </div>
          )}
          {verdict.subject.runtime && (
            <div>
              <span className="text-slate-500">Runtime: </span>
              <span className="text-amber-300">{verdict.subject.runtime}</span>
            </div>
          )}
        </div>
      )}

      {/* Domain Verification Matrix */}
      <div className="divide-y divide-slate-800/70">
        {domainDefinitions.map((domain) => (
          <div
            key={domain.id}
            id={`domain-row-${domain.id}`}
            className={`px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:bg-slate-800/40 ${
              domain.check?.status === "FAILED" ? "bg-rose-950/20" : ""
            }`}
          >
            <div className="space-y-0.5 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200">{domain.name}</span>
                <span className="text-xs font-mono text-slate-500">({domain.id})</span>
              </div>
              <p className="text-xs text-slate-400">{domain.subtext}</p>
              {domain.check?.detail && (
                <p
                  className={`text-xs font-mono pt-1 ${
                    domain.check.status === "FAILED"
                      ? "text-rose-400 font-semibold"
                      : domain.check.status === "pass"
                      ? "text-slate-300"
                      : "text-slate-500"
                  }`}
                >
                  {domain.check.detail}
                </p>
              )}
            </div>

            <div className="self-start sm:self-center shrink-0">
              {getStatusBadge(domain.check)}
            </div>
          </div>
        ))}
      </div>

      {/* Failure details if any */}
      {verdict.reasons && verdict.reasons.length > 0 && (
        <div className="p-4 bg-rose-950/30 border-t border-rose-900/60" id="verdict-failures-box">
          <div className="text-xs font-semibold text-rose-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Verification Failures Detected:
          </div>
          <ul className="space-y-1 text-xs font-mono text-rose-200 list-disc list-inside">
            {verdict.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
