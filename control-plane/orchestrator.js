/**
 * Dog Tag Day Master Orchestrator
 *
 * Single orchestration entry point. The control plane owns decisions while
 * browser, publishing and legacy providers remain replaceable execution lanes.
 */

import { unifiedHealth } from "./health/unified-health.js";
import { resolveAllLanes } from "./routing/cutover-router.js";
import { BroadcastQueue, executeBroadcast } from "./adapters/broadcast-control.js";
import { publish } from "./adapters/publishing-engine.js";
import { routeBrowserCommand } from "./adapters/browser-control.js";
import { recordEvent, createEvent, recoveryState } from "./operations/unified-operations.js";

export function createControlPlane(deps = {}) {
  const queue = deps.queue instanceof BroadcastQueue
    ? deps.queue
    : new BroadcastQueue(deps.broadcast);

  async function health() {
    return unifiedHealth(deps.health || {});
  }

  async function routes() {
    return resolveAllLanes(deps.lanes || {});
  }

  async function runBroadcast() {
    const result = await executeBroadcast(
      queue,
      request => publish(request, deps.publishers || {}),
      deps.platforms || ["tiktok", "youtube", "facebook", "instagram"]
    );

    const event = createEvent({
      component: "broadcast-control",
      action: "run-broadcast",
      status: result.ok ? "success" : "failed",
      detail: result
    });

    const log = await recordEvent(event, deps.logSink);
    return { result, log };
  }

  async function browser(command) {
    return routeBrowserCommand(command, deps.browsers || {});
  }

  async function status() {
    const [healthState, laneRoutes] = await Promise.all([health(), routes()]);
    const recovery = Object.fromEntries(
      Object.entries(laneRoutes).map(([name, route]) => [
        name,
        recoveryState({
          lane: route,
          fallbackAvailable: route.route === "legacy-fallback"
        })
      ])
    );

    return {
      ok: healthState.overall !== "offline",
      health: healthState,
      routes: laneRoutes,
      recovery,
      queue: queue.peek(),
      generatedAt: new Date().toISOString()
    };
  }

  return { health, routes, runBroadcast, browser, status };
}

export const controlPlaneContract = {
  version: "1.0.0",
  owner: "Dog Tag Day",
  mode: "single-orchestrator",
  guarantees: [
    "one operator-facing control path",
    "owned-first routing",
    "legacy fallback",
    "platform failure isolation",
    "health-aware recovery",
    "credentials remain outside source"
  ]
};
