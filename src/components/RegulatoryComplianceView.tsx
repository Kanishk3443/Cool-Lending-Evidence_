import React from "react";
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  FileSpreadsheet,
  Cpu,
} from "lucide-react";

export const RegulatoryComplianceView: React.FC = () => {
  const comparisonData = [
    {
      feature: "Tamper Detection",
      traditional: "Easily altered by DB admins or devops with SQL UPDATE or log rewrite",
      cool: "Cryptographically impossible: altering 1 bit breaks deterministic binding & dual signatures",
    },
    {
      feature: "Human Override Recording",
      traditional: "Separate mutable table row or free text comment in internal ticket",
      cool: "Chained event (type: credit.override) sharing the exact same executionId with signed provenance",
    },
    {
      feature: "Auditor / Regulator Access",
      traditional: "Requires bank VPN, internal credentials, or trusted SQL exports",
      cool: "Zero-trust offline verification: auditor only needs the self-contained JSON artifact",
    },
    {
      feature: "Applicant Privacy (PII)",
      traditional: "Plain text applicant records in database logs or unencrypted spreadsheets",
      cool: "Data minimisation: Salted SHA-256 commitments in TEE enclave; plaintext discarded",
    },
    {
      feature: "Signature Longevity",
      traditional: "Standard RSA/ECDSA vulnerable to future quantum computer Shor's algorithm",
      cool: "Hybrid Post-Quantum: NIST FIPS 204 ML-DSA-65 (lattice-based) paired with Ed25519",
    },
    {
      feature: "Independent Transparency",
      traditional: "Single point of failure in internal centralized database",
      cool: "RFC 6962 transparency log with Merkle tree inclusion proofs and Signed Tree Heads",
    },
  ];

  return (
    <div className="space-y-8" id="compliance-view-root">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Reserve Bank of India (RBI) Regulatory Compliance Framework
            </h2>
            <p className="text-xs text-slate-400">
              Draft Model Risk Management Framework (June 2026) & Governor Guidelines for AI Underwriting
            </p>
          </div>
        </div>

        <div className="mt-6 prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
          <p>
            Banks and Non-Banking Financial Companies (NBFCs) in India increasingly rely on automated algorithms and machine learning models to approve or reject credit. However, traditional database logs and screenshots fail compliance standards because they can be quietly modified, deleted, or fabricated retroactively.
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/40 text-amber-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>The Mandate:</strong> RBI requires regulated entities to maintain explainable, tamper-evident audit trails for all automated decisions. Crucially, institutions must maintain an immutable record of <em>when and why a human loan officer overrode the model</em>.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <span>Traditional Log Tables vs. CooL Cryptographic Evidence</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Requirement / Dimension</th>
                <th className="py-3 px-4 font-semibold text-rose-300">Legacy DB Logs / Splunk</th>
                <th className="py-3 px-4 font-semibold text-emerald-300">CooL Cryptographic Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisonData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-medium text-white">{row.feature}</td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{row.traditional}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 font-medium">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{row.cool}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture Deep-Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
            <Lock className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-white text-sm">Offline Verifiability</h4>
          <p className="text-slate-400 leading-relaxed">
            Because signatures, Merkle inclusion proofs, and Signed Tree Heads (STH) travel inside the receipt JSON, third parties verify records with zero network calls and zero access to the bank's infrastructure.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
            <Cpu className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-white text-sm">Post-Quantum Cryptography</h4>
          <p className="text-slate-400 leading-relaxed">
            Employs NIST FIPS 204 ML-DSA-65 alongside Ed25519. Evidence generated today remains verifiable and immune to future quantum computer forgery.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-2">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-white text-sm">Chained Override Provenance</h4>
          <p className="text-slate-400 leading-relaxed">
            Officer overrides inherit the exact same executionId, proving direct linkage to the algorithmic recommendation while capturing the officer's ID, branch, and justification.
          </p>
        </div>
      </div>
    </div>
  );
};
