/**
 * Dog Tag Day Production Readiness Gate
 *
 * A lane can become owned only after every required proof is present.
 * This module never performs the cutover itself; it produces a deterministic
 * decision for the orchestrator.
 */

const REQUIRED = ["health", "publish", "logging", "rollback"];

export function evaluateReadiness(proof = {}) {
  const missing = REQUIRED.filter(key => proof[key] !== true);

  if (missing.length) {
    return {
      ready: false,
      state: "testing",
      missing,
      reason: "production_proof_incomplete"
    };
  }

  return {
    ready: true,
    state: "owned-ready",
    missing: [],
    reason: "all_production_proofs_present"
  };
}

export function buildCutoverRecord({ platform, proof, fallback = true } = {}) {
  const readiness = evaluateReadiness(proof);

  return {
    platform: platform || "unknown",
    readiness,
    fallbackProtected: Boolean(fallback),
    cutoverAllowed: readiness.ready && Boolean(fallback),
    generatedAt: new Date().toISOString()
  };
}

export const readinessContract = {
  version: "1.0.0",
  owner: "Dog Tag Day",
  requiredProof: REQUIRED,
  policy: {
    fallbackMustRemainProtected: true,
    noImplicitCutover: true,
    noCredentialStorage: true
  }
};
