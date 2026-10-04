/**
 * Dog Tag Day Browser Control Adapter
 *
 * The control plane talks to this adapter, not directly to a vendor runtime.
 * The adapter preserves the existing Browser Connector as a fallback while
 * giving Dog Tag Day one stable command contract.
 *
 * No credentials are stored here.
 */

const ACTIONS = new Set([
  "open", "click", "type", "read", "screenshot", "back", "forward", "status"
]);

export function validateBrowserCommand(command = {}) {
  if (!command || typeof command !== "object") {
    return { ok: false, error: "command_required" };
  }

  const { action } = command;
  if (!ACTIONS.has(action)) {
    return { ok: false, error: "unsupported_action" };
  }

  return { ok: true };
}

/**
 * Normalize a command before routing it to the active runtime.
 * The runtime implementation is deliberately injected so the control plane
 * is independent of AppDeploy or any other deployment provider.
 */
export async function routeBrowserCommand(command, runtimes = {}) {
  const validation = validateBrowserCommand(command);
  if (!validation.ok) return validation;

  const owned = runtimes.owned;
  const legacy = runtimes.legacy;

  if (owned && typeof owned.execute === "function") {
    try {
      const result = await owned.execute(command);
      return { ok: true, route: "owned", result };
    } catch (error) {
      if (!legacy || typeof legacy.execute !== "function") {
        return {
          ok: false,
          route: "owned",
          error: error?.message || "owned_runtime_failed"
        };
      }
    }
  }

  if (legacy && typeof legacy.execute === "function") {
    try {
      const result = await legacy.execute(command);
      return { ok: true, route: "legacy-fallback", result };
    } catch (error) {
      return {
        ok: false,
        route: "legacy-fallback",
        error: error?.message || "legacy_runtime_failed"
      };
    }
  }

  return { ok: false, error: "no_browser_runtime_available" };
}

export const browserControlContract = {
  version: "1.0.0",
  owner: "Dog Tag Day",
  mode: "unified-shell",
  actions: [...ACTIONS],
  policy: {
    ownedFirst: true,
    legacyFallback: true,
    credentialsInSource: false,
    bypassAuthentication: false,
    preserveUserApproval: true
  }
};
