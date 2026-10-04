/**
 * Dog Tag Day End-to-End Control-Path Test
 *
 * Safe test: validates contracts and routing only. It never calls a live
 * publisher and never sends a commercial to a platform.
 */

import { BroadcastQueue } from "../adapters/broadcast-control.js";
import { validatePublishRequest } from "../adapters/publishing-engine.js";
import { validateBrowserCommand } from "../adapters/browser-control.js";
import { resolveLane, canCutover } from "../routing/cutover-router.js";

export function runSafeControlPathTest() {
  const queue = new BroadcastQueue({
    items: [{ id: "commercial-1-test", mediaUrl: "test://commercial-1" }],
    cadenceHours: 3
  });

  const queued = queue.peek();
  const publishContract = validatePublishRequest({
    platform: "youtube",
    mediaUrl: "test://commercial-1"
  });
  const browserContract = validateBrowserCommand({ action: "status" });

  const pendingRoute = resolveLane(
    { state: "pending" },
    { owned: "healthy", fallback: "healthy" }
  );

  const cutoverBlocked = canCutover({
    tests: { health: true, publish: false, logging: true, rollback: true }
  });

  return {
    safe: true,
    livePublishTriggered: false,
    checks: {
      queue: queued.ok,
      publishingContract: publishContract.ok,
      browserContract: browserContract.ok,
      pendingUsesFallbackUntilCutover: pendingRoute.route === "legacy-fallback",
      incompleteCutoverRejected: cutoverBlocked === false
    },
    generatedAt: new Date().toISOString()
  };
}
