/**
 * Dog Tag Day Unified Health Router
 *
 * Health is control-plane state, not a platform-specific feature.
 * Each dependency reports independently so one failure never masks another.
 */

const STATES = new Set(["healthy", "degraded", "offline", "unknown"]);

function normalize(name, result = {}) {
  const state = STATES.has(result.state) ? result.state : "unknown";
  return {
    name,
    state,
    checkedAt: result.checkedAt || new Date().toISOString(),
    latencyMs: Number.isFinite(result.latencyMs) ? result.latencyMs : null,
    error: result.error || null,
    route: result.route || null
  };
}

export async function checkComponent(name, checker) {
  if (typeof checker !== "function") return normalize(name);

  const started = Date.now();
  try {
    const result = await checker();
    return normalize(name, {
      ...result,
      latencyMs: result.latencyMs ?? Date.now() - started
    });
  } catch (error) {
    return normalize(name, {
      state: "offline",
      latencyMs: Date.now() - started,
      error: error?.message || "health_check_failed"
    });
  }
}

export async function unifiedHealth(checkers = {}) {
  const entries = await Promise.all(
    Object.entries(checkers).map(([name, checker]) =>
      checkComponent(name, checker)
    )
  );

  const components = Object.fromEntries(
    entries.map(entry => [entry.name, entry])
  );

  const states = entries.map(entry => entry.state);
  const overall =
    states.length === 0
      ? "unknown"
      : states.every(state => state === "healthy")
        ? "healthy"
        : states.some(state => state === "offline")
          ? "degraded"
          : "degraded";

  return {
    ok: overall !== "offline",
    overall,
    components,
    checkedAt: new Date().toISOString()
  };
}

export const healthContract = {
  version: "1.0.0",
  owner: "Dog Tag Day",
  mode: "unified-shell",
  policy: {
    independentChecks: true,
    platformFailureIsolation: true,
    secretsNeverReturned: true,
    fallbackRoutingUsesHealth: true
  }
};
