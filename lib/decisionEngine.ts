import { LoanApplicationInput, DecisionResult, RuleEvaluation } from "../src/types";

/**
 * Calculates standard Equated Monthly Installment (EMI)
 * Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEmi(principal: number, annualInterestRatePercent: number, tenureMonths: number): number {
  if (tenureMonths <= 0 || principal <= 0) return 0;
  const monthlyRate = annualInterestRatePercent / (12 * 100);
  if (monthlyRate === 0) return Math.round(principal / tenureMonths);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Score loan application against RBI-compliant risk baselines:
 * - Minimum credit score (650)
 * - Maximum DTI (Debt-to-Income) ratio (50%)
 * - Minimum monthly income (₹25,000)
 * - Maximum Loan-to-Income multiplier (36x monthly income)
 */
export function scoreLoanApplication(input: LoanApplicationInput): DecisionResult {
  const modelId = "RBI-MRM-BASELINE-ENGINE";
  const modelVersion = "2026.6.1";
  const timestamp = new Date().toISOString();

  // Baseline interest rate based on credit score bands
  let interestRate = 10.5;
  let riskTier: "LOW_RISK" | "MODERATE_RISK" | "HIGH_RISK" = "MODERATE_RISK";

  if (input.creditScore >= 780) {
    interestRate = 8.5;
    riskTier = "LOW_RISK";
  } else if (input.creditScore >= 720) {
    interestRate = 9.75;
    riskTier = "MODERATE_RISK";
  } else if (input.creditScore >= 650) {
    interestRate = 11.5;
    riskTier = "MODERATE_RISK";
  } else {
    interestRate = 13.5;
    riskTier = "HIGH_RISK";
  }

  const estimatedEmi = calculateEmi(input.requestedAmount, interestRate, input.tenureMonths);
  const totalMonthlyDebt = input.existingEmi + estimatedEmi;
  const dtiRatio = input.monthlyIncome > 0 ? Number((totalMonthlyDebt / input.monthlyIncome).toFixed(4)) : 1.0;
  const maxAllowedLoan = Math.round(input.monthlyIncome * 36);

  const rules: RuleEvaluation[] = [];

  // Rule 1: Credit Score
  const minScore = 650;
  const scorePassed = input.creditScore >= minScore;
  rules.push({
    id: "RULE_CREDIT_SCORE",
    ruleName: "Bureau Credit Score Threshold",
    threshold: `≥ ${minScore}`,
    actualValue: `${input.creditScore}`,
    passed: scorePassed,
    impact: scorePassed
      ? `Credit score of ${input.creditScore} meets minimum regulatory baseline.`
      : `Credit score of ${input.creditScore} is below mandatory baseline of ${minScore}.`,
  });

  // Rule 2: Debt-to-Income (DTI)
  const maxDti = 0.5;
  const dtiPassed = dtiRatio <= maxDti;
  rules.push({
    id: "RULE_DTI_RATIO",
    ruleName: "Debt-to-Income (DTI) Cap",
    threshold: `≤ ${(maxDti * 100).toFixed(0)}%`,
    actualValue: `${(dtiRatio * 100).toFixed(1)}%`,
    passed: dtiPassed,
    impact: dtiPassed
      ? `Combined debt burden of ${(dtiRatio * 100).toFixed(1)}% is within healthy leverage policy.`
      : `Debt-to-income of ${(dtiRatio * 100).toFixed(1)}% exceeds maximum leverage cap of 50%.`,
  });

  // Rule 3: Minimum Income
  const minIncome = 25000;
  const incomePassed = input.monthlyIncome >= minIncome;
  rules.push({
    id: "RULE_MIN_INCOME",
    ruleName: "Minimum Net Monthly Inflow",
    threshold: `≥ ₹${minIncome.toLocaleString("en-IN")}`,
    actualValue: `₹${input.monthlyIncome.toLocaleString("en-IN")}`,
    passed: incomePassed,
    impact: incomePassed
      ? `Monthly income meets underwriting floor.`
      : `Net monthly income of ₹${input.monthlyIncome.toLocaleString("en-IN")} is below eligibility floor of ₹${minIncome.toLocaleString("en-IN")}.`,
  });

  // Rule 4: Loan-to-Income Multiplier
  const ltiPassed = input.requestedAmount <= maxAllowedLoan;
  rules.push({
    id: "RULE_LOAN_MULTIPLIER",
    ruleName: "Max Exposure Multiplier (36x Net Monthly)",
    threshold: `≤ ₹${maxAllowedLoan.toLocaleString("en-IN")}`,
    actualValue: `₹${input.requestedAmount.toLocaleString("en-IN")}`,
    passed: ltiPassed,
    impact: ltiPassed
      ? `Requested principal is within max allowable credit exposure.`
      : `Requested loan of ₹${input.requestedAmount.toLocaleString("en-IN")} exceeds maximum policy limit of ₹${maxAllowedLoan.toLocaleString("en-IN")}.`,
  });

  const allPassed = rules.every((r) => r.passed);
  const decision = allPassed ? "APPROVED" : "REJECTED";

  let summaryReason = "";
  if (decision === "APPROVED") {
    summaryReason = `Credit assessment APPROVED. Applicant possesses an acceptable credit score (${input.creditScore}), manageable DTI ratio (${(dtiRatio * 100).toFixed(1)}%), and verified cash flow adequacy.`;
  } else {
    const failedRules = rules.filter((r) => !r.passed).map((r) => r.ruleName);
    summaryReason = `Credit assessment REJECTED. Application failed regulatory risk criteria: ${failedRules.join(", ")}.`;
  }

  return {
    decision,
    riskTier,
    creditScore: input.creditScore,
    approvedAmount: decision === "APPROVED" ? input.requestedAmount : 0,
    requestedAmount: input.requestedAmount,
    interestRate: decision === "APPROVED" ? interestRate : 0,
    monthlyEmi: decision === "APPROVED" ? estimatedEmi : 0,
    dtiRatio,
    maxEligibleAmount: maxAllowedLoan,
    summaryReason,
    rules,
    modelId,
    modelVersion,
    timestamp,
  };
}
