import React, { useState } from "react";
import { Sparkles, ArrowRight, UserCheck, AlertTriangle, HelpCircle } from "lucide-react";
import { LoanApplicationInput } from "../types";

interface LoanApplicationFormProps {
  onSubmit: (input: LoanApplicationInput) => Promise<void>;
  isLoading: boolean;
}

const PRESETS = [
  {
    label: "Prime Approval",
    badge: "Will Pass",
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-800",
    data: {
      applicantName: "Rahul Sharma",
      applicantPan: "BKAPS9812K",
      monthlyIncome: 85000,
      existingEmi: 12000,
      requestedAmount: 500000,
      tenureMonths: 36,
      creditScore: 765,
      employmentType: "salaried" as const,
      purpose: "Home Renovation & Modernization",
    },
  },
  {
    label: "Sub-Prime Score",
    badge: "Will Reject (<650)",
    badgeColor: "bg-rose-950 text-rose-300 border-rose-800",
    data: {
      applicantName: "Vikas Verma",
      applicantPan: "CVBPM4432Q",
      monthlyIncome: 45000,
      existingEmi: 8000,
      requestedAmount: 350000,
      tenureMonths: 24,
      creditScore: 615,
      employmentType: "self-employed" as const,
      purpose: "Shop Inventory Expansion",
    },
  },
  {
    label: "High DTI Overload",
    badge: "Will Reject (DTI > 50%)",
    badgeColor: "bg-rose-950 text-rose-300 border-rose-800",
    data: {
      applicantName: "Sunita Iyer",
      applicantPan: "AYTPI7721L",
      monthlyIncome: 60000,
      existingEmi: 28000,
      requestedAmount: 700000,
      tenureMonths: 36,
      creditScore: 730,
      employmentType: "salaried" as const,
      purpose: "Vehicle Refinance",
    },
  },
];

export const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<LoanApplicationInput>(PRESETS[0].data);

  const applyPreset = (presetData: LoanApplicationInput) => {
    setFormData({ ...presetData });
  };

  // Quick live estimations for UI preview
  const estimatedRate = formData.creditScore >= 780 ? 0.085 : formData.creditScore >= 720 ? 0.0975 : formData.creditScore >= 650 ? 0.115 : 0.135;
  const monthlyRate = estimatedRate / 12;
  const emiFactor = Math.pow(1 + monthlyRate, formData.tenureMonths);
  const approxEmi = formData.requestedAmount > 0
    ? Math.round((formData.requestedAmount * monthlyRate * emiFactor) / (emiFactor - 1))
    : 0;
  const totalMonthlyDebt = formData.existingEmi + approxEmi;
  const dtiPercent = formData.monthlyIncome > 0
    ? Math.round((totalMonthlyDebt / formData.monthlyIncome) * 100)
    : 100;
  const maxAllowableAmount = formData.monthlyIncome * 36;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      {/* Header & Scenario Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Loan Underwriting Application
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate credit scoring and generate cryptographically sealed CooL evidence
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Presets:</span>
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              id={`btn-preset-${idx}`}
              type="button"
              onClick={() => applyPreset(preset.data)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
            >
              <span>{preset.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] border ${preset.badgeColor}`}>
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Row 1: Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="input-applicant-name">
              Applicant Full Name
            </label>
            <input
              id="input-applicant-name"
              type="text"
              required
              value={formData.applicantName}
              onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="input-applicant-pan">
              Permanent Account Number (PAN)
            </label>
            <input
              id="input-applicant-pan"
              type="text"
              required
              value={formData.applicantPan}
              onChange={(e) => setFormData({ ...formData, applicantPan: e.target.value.toUpperCase() })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white uppercase font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="select-employment">
              Employment Classification
            </label>
            <select
              id="select-employment"
              value={formData.employmentType}
              onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60"
            >
              <option value="salaried">Salaried (Corporate / Govt)</option>
              <option value="self-employed">Self-Employed Professional</option>
              <option value="business">Business Enterprise</option>
            </select>
          </div>
        </div>

        {/* Row 2: Financial Inflows & Debt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300" htmlFor="input-monthly-income">
                Net Monthly Inflow (₹)
              </label>
              <span className="text-xs font-mono font-semibold text-emerald-400">
                ₹{formData.monthlyIncome.toLocaleString("en-IN")}
              </span>
            </div>
            <input
              id="input-monthly-income"
              type="range"
              min="15000"
              max="300000"
              step="5000"
              value={formData.monthlyIncome}
              onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>₹15K (Min ₹25K)</span>
              <span>₹300K</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300" htmlFor="input-existing-emi">
                Existing Monthly Debt / EMIs (₹)
              </label>
              <span className="text-xs font-mono font-semibold text-amber-400">
                ₹{formData.existingEmi.toLocaleString("en-IN")}
              </span>
            </div>
            <input
              id="input-existing-emi"
              type="range"
              min="0"
              max="150000"
              step="2000"
              value={formData.existingEmi}
              onChange={(e) => setFormData({ ...formData, existingEmi: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>₹0</span>
              <span>₹150K</span>
            </div>
          </div>
        </div>

        {/* Row 3: Loan Amount & Credit Score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300" htmlFor="input-requested-amount">
                Requested Loan Principal (₹)
              </label>
              <span className="text-xs font-mono font-semibold text-emerald-400">
                ₹{formData.requestedAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <input
              id="input-requested-amount"
              type="range"
              min="50000"
              max="3500000"
              step="50000"
              value={formData.requestedAmount}
              onChange={(e) => setFormData({ ...formData, requestedAmount: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>₹50K</span>
              <span>Max: ₹{maxAllowableAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-slate-300" htmlFor="input-credit-score">
                  Credit Bureau Score (CIBIL / Experian)
                </label>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  formData.creditScore >= 720
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : formData.creditScore >= 650
                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                    : "bg-rose-950 text-rose-300 border border-rose-800"
                }`}
              >
                {formData.creditScore}
              </span>
            </div>
            <input
              id="input-credit-score"
              type="range"
              min="400"
              max="850"
              step="5"
              value={formData.creditScore}
              onChange={(e) => setFormData({ ...formData, creditScore: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span className="text-rose-400">Poor (&lt;650)</span>
              <span className="text-amber-400">Fair (650-719)</span>
              <span className="text-emerald-400">Prime (720+)</span>
            </div>
          </div>
        </div>

        {/* Row 4: Tenure and Purpose */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="select-tenure">
              Tenure (Months)
            </label>
            <select
              id="select-tenure"
              value={formData.tenureMonths}
              onChange={(e) => setFormData({ ...formData, tenureMonths: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60"
            >
              <option value="12">12 Months (1 Year)</option>
              <option value="24">24 Months (2 Years)</option>
              <option value="36">36 Months (3 Years)</option>
              <option value="48">48 Months (4 Years)</option>
              <option value="60">60 Months (5 Years)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="input-purpose">
              Stated Loan Purpose
            </label>
            <input
              id="input-purpose"
              type="text"
              required
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60"
            />
          </div>
        </div>

        {/* Real-time Pre-Flight Metrics */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-500 block">Est. Monthly EMI</span>
              <span className="font-mono text-sm font-semibold text-slate-200">
                ₹{approxEmi.toLocaleString("en-IN")}/mo
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Estimated DTI</span>
              <span
                className={`font-mono text-sm font-semibold ${
                  dtiPercent <= 50 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {dtiPercent}% {dtiPercent > 50 && "(Exceeds 50% limit)"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {formData.creditScore < 650 || dtiPercent > 50 || formData.monthlyIncome < 25000 || formData.requestedAmount > maxAllowableAmount ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-950/70 text-rose-300 border border-rose-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                Expected AI Assessment: REJECTED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800">
                <UserCheck className="w-3.5 h-3.5" />
                Expected AI Assessment: APPROVED
              </span>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex justify-end">
          <button
            id="btn-submit-application"
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Underwriting & Sealing Evidence...</span>
              </>
            ) : (
              <>
                <span>Underwrite & Sign Evidence Receipt</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
