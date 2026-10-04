/**
 * Dog Tag Day Cutover Router
 *
 * Chooses the owned implementation when its lane is proven healthy and
 * otherwise keeps the existing implementation available as a fallback.
 * Cutover state is explicit; existence of new code never triggers cutover.
 */

const ALLOWED = new Set(["pending", "testing", "owned", "fallback"]);

export function resolveLane(lane = {}, health = {}) {
  const state = ALLOWED.has(lane.state) ? lane.state : "pending";
  const ownedHealthy = health.owned === "healthy";
  const fallbackHealthy = health.fallback === "healthy";

  if (state === "owned" && ownedHealthy) {
    return { route: "owned", reason: "owned_lane_proven_healthy" };
  }

  if (state === "testing" && ownedHealthy) {
    return { route: "testing", reason: "owned_lane_healthy_but_not_cut_over" };
  }

  if (fallbackHealthy) {
    return {
      route: "legacy-fallback",
      reason: state === "owned"
        ? "owned_lane_failed_health_check"
        : "owned_lane_not_cut_over"
    };
  }

  return { route: "blocked", reason: "no_healthy_runtime" };
}

export function resolveAllLanes(lanes = {}) {
  return Object.fromEntries(
    Object.entries(lanes).map(([name, lane]) => [
      name,
      resolveLane(lane.config, lane.health)
    ])
  );
}

export function canCutover(lane = {}) {
  return Boolean(
    lane.tests?.health &&
    lane.tests?.publish &&
    lane.tests?.logging &&
    lane.tests?.rollback
  );
}

export function approveCutover(lane = {}) {
  if (!canCutover(lane)) {
    return {
      ok: false,
      state: "testing",
      error: "cutover_requirements_not_met"
    };
  }

  return {
    ok: true,
    state: "owned",
    route: "owned",
    approvedAt: new Date().toISOString()
  };
}

export const cutoverContract = {
  version: "1.0.0",
  owner: "Dog Tag Day",
  policy: {
    newCodeNeverAutoCutsOver: true,
    ownedRequiresProof: true,
    legacyFallbackRetained: true,
    rollbackRequired: true,
    platformLanesIndependent: true
  }
};
