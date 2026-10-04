/**
 * Dog Tag Day Unified Operations Log + Recovery State
 */

const LEVELS = new Set(["info", "warn", "error", "critical"]);

export function createEvent({
  level = "info", component, action, route = null, platform = null,
  status = "unknown", detail = null, correlationId = null
} = {}) {
  return {
    id: globalThis.crypto?.randomUUID?.() || "evt-" + Date.now(),
    timestamp: new Date().toISOString(),
    level: LEVELS.has(level) ? level : "info",
    component: component || "control-plane",
    action: action || "unknown",
    route, platform, status, detail, correlationId
  };
}

export async function recordEvent(event, sink) {
  const normalized = createEvent(event);
  if (typeof sink !== "function") return { ok: false, event: normalized, error: "log_sink_not_configured" };
  try {
    await sink(normalized);
    return { ok: true, event: normalized };
  } catch (error) {
    return { ok: false, event: normalized, error: error?.message || "log_sink_failed" };
  }
}

export function recoveryState({ lane, lastEvent, fallbackAvailable } = {}) {
  if (!lane) return "unknown";
  if (lastEvent?.status === "success" && lane.route === "owned") return "owned-healthy";
  if (fallbackAvailable) return "fallback-ready";
  if (lastEvent?.status === "failed") return "blocked";
  return "monitoring";
}

export const operationsContract = {
  version: "1.0.0", owner: "Dog Tag Day", mode: "unified-shell",
  policy: { appendOnlyEvents: true, credentialsNeverLogged: true, platformFailureIsolation: true, recoveryStateRequired: true, fallbackStateVisible: true }
};
