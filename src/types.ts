/**
 * Core type definitions for Evidence-Backed Lending
 */

export interface LoanApplicationInput {
  applicantName: string;
  applicantPan: string;
  monthlyIncome: number;
  existingEmi: number;
  requestedAmount: number;
  tenureMonths: number;
  creditScore: number;
  employmentType: "salaried" | "self-employed" | "business";
  purpose: string;
}

export interface RuleEvaluation {
  id: string;
  ruleName: string;
  threshold: string;
  actualValue: string;
  passed: boolean;
  impact: string;
}

export interface DecisionResult {
  decision: "APPROVED" | "REJECTED";
  riskTier: "LOW_RISK" | "MODERATE_RISK" | "HIGH_RISK";
  creditScore: number;
  approvedAmount: number;
  requestedAmount: number;
  interestRate: number;
  monthlyEmi: number;
  dtiRatio: number;
  maxEligibleAmount: number;
  summaryReason: string;
  rules: RuleEvaluation[];
  modelId: string;
  modelVersion: string;
  timestamp: string;
}

export interface OfficerOverrideInput {
  originalExecutionId: string;
  originalRecordId: string;
  originalDecision: "APPROVED" | "REJECTED";
  overrideDecision: "APPROVED" | "REJECTED";
  officerId: string;
  officerName: string;
  officerBranch: string;
  justification: string;
  exceptionCategory: string;
  additionalCollateral?: string;
  coSignerPan?: string;
}

export interface OfficerOverrideResult {
  status: "OVERRIDE_RECORDED";
  originalDecision: "APPROVED" | "REJECTED";
  finalDecision: "APPROVED" | "REJECTED";
  officerId: string;
  officerName: string;
  officerBranch: string;
  justification: string;
  exceptionCategory: string;
  regulatoryNotice: string;
  timestamp: string;
}

import type { ReceiptV2 } from "cool-nwc";

export type CooLEvidenceReceipt = ReceiptV2;


export interface DomainCheck {
  status: "pass" | "FAILED" | "simulated" | "absent";
  detail: string;
}

export interface VerificationVerdict {
  ok: boolean;
  schema?: string;
  subject?: {
    type?: string;
    application_id?: string;
    record_id?: string;
    signer?: string;
    runtime?: string;
  };
  checks: {
    binding?: DomainCheck;
    signature?: DomainCheck;
    inclusion?: DomainCheck;
    witnesses?: DomainCheck;
    attestation?: DomainCheck;
    enclave?: DomainCheck;
    anchor?: DomainCheck;
    [domain: string]: DomainCheck | undefined;
  };
  reasons: string[];
}

export interface DecisionRecordItem {
  id: string;
  executionId: string;
  recordId: string;
  application: LoanApplicationInput;
  decision: DecisionResult;
  evidence: CooLEvidenceReceipt;
  override?: {
    result: OfficerOverrideResult;
    evidence: CooLEvidenceReceipt;
    recordId: string;
  };
  createdAt: string;
}
