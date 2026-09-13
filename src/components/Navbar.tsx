import React from "react";
import { ShieldCheck, FileCheck2, Scale, Database, Cpu } from "lucide-react";

export type ActiveTab = "apply" | "verify" | "compliance" | "ledger";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  recordCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  recordCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">
                  Evidence-Backed Lending
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950/90 text-emerald-300 border border-emerald-800/80">
                  CooL SDK v3.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Tamper-evident AI credit decisions with officer override chaining
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="tab-btn-apply"
              onClick={() => setActiveTab("apply")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === "apply"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Apply & Score</span>
            </button>

            <button
              id="tab-btn-verify"
              onClick={() => setActiveTab("verify")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === "verify"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Verify & Tamper Lab</span>
            </button>

            <button
              id="tab-btn-compliance"
              onClick={() => setActiveTab("compliance")}
              className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === "compliance"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>RBI Framework</span>
            </button>

            <button
              id="tab-btn-ledger"
              onClick={() => setActiveTab("ledger")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === "ledger"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Vault</span>
              {recordCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 text-xs font-mono flex items-center justify-center font-bold">
                  {recordCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
