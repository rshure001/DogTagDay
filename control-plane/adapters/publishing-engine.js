/**
 * Dog Tag Day Publishing Engine Adapter
 *
 * One publishing contract for every platform. The active implementation is
 * injected by the control plane; the existing direct-publishing engine stays
 * available as a fallback until each lane is proven.
 *
 * This adapter never stores OAuth tokens or platform secrets.
 */

const PLATFORMS = ["tiktok", "youtube", "facebook", "instagram"];

export function validatePublishRequest(request = {}) {
  if (!request || typeof request !== "object") {
    return { ok: false, error: "request_required" };
  }

  if (!PLATFORMS.includes(request.platform)) {
    return { ok: false, error: "unsupported_platform" };
  }

  if (!request.mediaUrl) {
    return { ok: false, error: "media_url_required" };
  }

  return { ok: true };
}

export async function publish(request, engines = {}) {
  const validation = validatePublishRequest(request);
  if (!validation.ok) return validation;

  const owned = engines.owned;
  const legacy = engines.legacy;

  if (owned && typeof owned.publish === "function") {
    try {
      const result = await owned.publish(request);
      return {
        ok: true,
        route: "owned",
        platform: request.platform,
        result
      };
    } catch (error) {
      // Fall through to the legacy engine without losing the failure record.
      if (!legacy || typeof legacy.publish !== "function") {
        return {
          ok: false,
          route: "owned",
          platform: request.platform,
          error: error?.message || "owned_publisher_failed"
        };
      }
    }
  }

  if (legacy && typeof legacy.publish === "function") {
    try {
      const result = await legacy.publish(request);
      return {
        ok: true,
        route: "legacy-fallback",
        platform: request.platform,
        result
      };
    } catch (error) {
      return {
        ok: false,
        route: "legacy-fallback",
        platform: request.platform,
        error: error?.message || "legacy_publisher_failed"
      };
    }
  }

  return {
    ok: false,
    platform: request.platform,
    error: "no_publishing_engine_available"
  };
}

export const publishingContract = {
  version: "1.0.0",
  owner: "Dog Tag Day",
  mode: "unified-shell",
  platforms: PLATFORMS,
  policy: {
    ownedFirst: true,
    legacyFallback: true,
    credentialsInSource: false,
    platformAuthMustRemainValid: true,
    failureIsolation: true
  }
};
