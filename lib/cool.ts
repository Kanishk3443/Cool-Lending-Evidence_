import { CooL, verifyEvidence, formatVerdict } from "cool-nwc";

/**
 * Shared CooL client instance for the lending application.
 * Default runs in honest simulated mode, producing self-contained
 * receipts with hybrid Ed25519 + ML-DSA-65 post-quantum signatures
 * and RFC 6962 transparency log inclusion proofs.
 */
export const cool = new CooL({
  applicationId: "cool-lending",
});

export { verifyEvidence, formatVerdict };
