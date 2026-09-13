import React, { useState, useEffect } from "react";
import { Navbar, ActiveTab } from "./components/Navbar";
import { LoanApplicationForm } from "./components/LoanApplicationForm";
import { DecisionDisplay } from "./components/DecisionDisplay";
import { OverrideModal } from "./components/OverrideModal";
import { VerifyView } from "./components/VerifyView";
import { RegulatoryComplianceView } from "./components/RegulatoryComplianceView";
import { VaultView } from "./components/VaultView";
import {
  LoanApplicationInput,
  OfficerOverrideInput,
  DecisionRecordItem,
} from "./types";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("apply");
  const [records, setRecords] = useState<DecisionRecordItem[]>([]);
  const [currentRecord, setCurrentRecord] = useState<DecisionRecordItem | null>(null);
  const [evidenceToVerify, setEvidenceToVerify] = useState<any>(null);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // Fetch past decisions on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/records");
      const data = await res.json();
      if (data.records && Array.isArray(data.records)) {
        setRecords(data.records);
        if (data.records.length > 0 && !currentRecord) {
          setCurrentRecord(data.records[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load records:", err);
    }
  };

  // Submit loan application
  const handleApplicationSubmit = async (input: LoanApplicationInput) => {
    setIsSubmittingApp(true);
    try {
      const res = await fetch("/api/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data.success) {
        const newRecord: DecisionRecordItem = {
          id: data.recordId,
          executionId: data.executionId,
          recordId: data.recordId,
          application: input,
          decision: data.decision,
          evidence: data.evidence,
          createdAt: new Date().toISOString(),
        };
        setCurrentRecord(newRecord);
        setRecords((prev) => [newRecord, ...prev]);
      } else {
        alert(data.error || "Failed to process application");
      }
    } catch (err) {
      console.error("Application error:", err);
      alert("Failed to submit loan application");
    } finally {
      setIsSubmittingApp(false);
    }
  };

  // Submit officer override
  const handleOverrideSubmit = async (overrideInput: OfficerOverrideInput) => {
    setIsSubmittingOverride(true);
    try {
      const res = await fetch("/api/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overrideInput),
      });
      const data = await res.json();
      if (data.success && currentRecord) {
        const updatedRecord: DecisionRecordItem = {
          ...currentRecord,
          override: {
            result: data.overrideResult,
            evidence: data.evidence,
            recordId: data.recordId,
          },
        };
        setCurrentRecord(updatedRecord);
        setRecords((prev) =>
          prev.map((r) => (r.executionId === updatedRecord.executionId ? updatedRecord : r))
        );
        setIsOverrideOpen(false);
      } else {
        alert(data.error || "Failed to record officer override");
      }
    } catch (err) {
      console.error("Override error:", err);
      alert("Failed to record officer override");
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  // Direct route to verify with evidence payload
  const handleRouteToVerify = (evidenceObj: any) => {
    setEvidenceToVerify(evidenceObj);
    setActiveTab("verify");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="app-root">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recordCount={records.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tab 1: Apply & Underwrite Flow */}
        {activeTab === "apply" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Quick Hero Banner */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-900/50 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                  Proof-of-Execution for Credit Underwriting
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Compliance Evidence Layer for AI Lending Decisions
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                  Every decision commits applicant data as salted hashes inside a secure enclave and outputs a post-quantum signed evidence receipt (`cool-nwc`).
                </p>
              </div>

              <button
                id="btn-learn-rbi-mrm"
                onClick={() => setActiveTab("compliance")}
                className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition shrink-0"
              >
                <span>Read RBI MRM Mandate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Application Input Form */}
            <LoanApplicationForm
              onSubmit={handleApplicationSubmit}
              isLoading={isSubmittingApp}
            />

            {/* Current Decision & Evidence Results */}
            {currentRecord && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Latest Underwriting Decision & Evidence
                </h3>
                <DecisionDisplay
                  record={currentRecord}
                  onVerify={handleRouteToVerify}
                  onOpenOverride={() => setIsOverrideOpen(true)}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Verify & Tamper Lab */}
        {activeTab === "verify" && (
          <div className="animate-in fade-in duration-200">
            <VerifyView
              initialEvidence={evidenceToVerify || currentRecord?.evidence}
              recentRecords={records}
            />
          </div>
        )}

        {/* Tab 3: Regulatory Compliance Context */}
        {activeTab === "compliance" && (
          <div className="animate-in fade-in duration-200">
            <RegulatoryComplianceView />
          </div>
        )}

        {/* Tab 4: Vault / Ledger */}
        {activeTab === "ledger" && (
          <div className="animate-in fade-in duration-200">
            <VaultView
              records={records}
              onSelectRecord={(rec) => {
                setCurrentRecord(rec);
                setActiveTab("apply");
              }}
              onVerify={handleRouteToVerify}
            />
          </div>
        )}
      </main>

      {/* Override Modal */}
      <OverrideModal
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        record={currentRecord}
        onSubmitOverride={handleOverrideSubmit}
        isLoading={isSubmittingOverride}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>Evidence-Backed Lending · Built directly on </span>
            <a
              href="https://github.com/Northwind-Cipher/cool-sdk"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline font-mono"
            >
              CooL SDK (cool-nwc)
            </a>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>ML-DSA-65 + Ed25519</span>
            <span>·</span>
            <span>RFC 6962 Log</span>
            <span>·</span>
            <span>RBI MRM 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
