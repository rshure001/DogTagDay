/**
 * Dog Tag Day Live Publishing Status Adapter
 *
 * Normalizes the existing backend status response for the unified control
 * plane. It does not expose tokens or provider credentials.
 */

const PLATFORMS = ["tiktok", "youtube", "facebook", "instagram"];

export function normalizePublishingStatus(raw = {}) {
  const result = {};

  for (const platform of PLATFORMS) {
    const value = raw[platform] ?? raw.platforms?.[platform] ?? {};
    result[platform] = {
      connected: Boolean(value.connected ?? value.authorized ?? value.ready),
      healthy: value.healthy !== false,
      lastAction: value.lastAction ?? null,
      lastError: value.lastError ?? null
    };
  }

  return {
    platforms: result,
    generatedAt: new Date().toISOString()
  };
}

export async function readPublishingStatus(fetchStatus) {
  if (typeof fetchStatus !== "function") {
    return { ok: false, error: "status_reader_not_configured" };
  }

  try {
    const raw = await fetchStatus();
    return { ok: true, ...normalizePublishingStatus(raw) };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || "publishing_status_unavailable"
    };
  }
}

export const publishingStatusContract = {
  version: "1.0.0",
  owner: "Dog Tag Day",
  policy: {
    credentialsNeverReturned: true,
    platformIsolation: true,
    backendIsSourceOfLiveStatus: true
  }
};
