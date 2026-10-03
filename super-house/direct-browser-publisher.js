/**
 * Dog Tag Day direct browser publisher contract.
 *
 * This module is intentionally platform-neutral: the browser runner owns
 * navigation, upload, publish, and verification. No third-party scheduler
 * or publishing service is involved.
 */

export const APPROVED_COMMERCIALS = {
  "commercial-1": {
    mediaUrl: "https://ynleeweezwkdbisaiovq.supabase.co/storage/v1/object/public/broadcast-masters/commercial-1-approved.mp4",
    caption: "Dog Tag Day — April 18. Put them on. Acknowledge one. DogTagDay.org"
  },
  "commercial-2": {
    mediaUrl: "https://ynleeweezwkdbisaiovq.supabase.co/storage/v1/object/public/broadcast-masters/commercial-2-approved.mp4",
    caption: "Dog Tag Day — April 18. Make veterans visible. Put them on. Acknowledge one. DogTagDay.org"
  },
  "commercial-3": {
    mediaUrl: "https://ynleeweezwkdbisaiovq.supabase.co/storage/v1/object/public/broadcast-masters/commercial-3-soldiers-step-out-approved.mp4",
    caption: "Dog Tag Day — April 18. Watch the mission step off the screen. Put them on. Acknowledge one. DogTagDay.org #DogTagDay #Veterans #April18."
  }
};

export const PLATFORMS = ["facebook", "instagram", "tiktok", "youtube"];

export function buildDirectPublishCommand(job) {
  if (!APPROVED_COMMERCIALS[job.commercial]) {
    throw new Error("commercial_not_approved");
  }

  const approved = APPROVED_COMMERCIALS[job.commercial];
  const requested = Array.isArray(job.platforms) && job.platforms.length
    ? job.platforms
    : PLATFORMS;

  return {
    id: job.id,
    action: "publish_direct",
    publisher: "dog-tag-day-browser",
    commercial: job.commercial,
    mediaUrl: approved.mediaUrl,
    caption: approved.caption,
    platforms: requested,
    verifyAfterPublish: true
  };
}

/**
 * Browser implementations must return one result per requested platform.
 * A platform is only marked PUBLISHED when the browser has observed the
 * platform's post/published state and captured its resulting URL when
 * available.
 */
export function validatePublishResult(result, requestedPlatforms) {
  if (!result || result.action !== "publish_direct") {
    throw new Error("invalid_publish_result");
  }

  const rows = Array.isArray(result.platforms) ? result.platforms : [];
  const expected = new Set(requestedPlatforms);
  for (const row of rows) {
    if (!expected.has(row.platform)) throw new Error("unexpected_platform");
    if (!["PUBLISHED", "FAILED", "BLOCKED"].includes(row.status)) {
      throw new Error("invalid_platform_status");
    }
  }

  const missing = requestedPlatforms.filter(
    platform => !rows.some(row => row.platform === platform)
  );
  if (missing.length) throw new Error("missing_platform_results");
  return true;
}
