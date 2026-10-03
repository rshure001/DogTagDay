const VERSION = "1.0.0";

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        system: "Dog Tag Day Super House",
        version: env.SUPER_HOUSE_VERSION || VERSION,
        timestamp: new Date().toISOString()
      });
    }

    if (url.pathname === "/api/runners" && request.method === "GET") {
      return json({
        ok: true,
        runners: [
          { id: 1, name: "TryPost", configured: Boolean(env.TRYPOST_API_KEY && env.TRYPOST_API_URL) },
          { id: 2, name: "Publisher B", configured: Boolean(env.PUBLISHER_B_URL) },
          { id: 3, name: "Publisher C", configured: Boolean(env.PUBLISHER_C_URL) },
          { id: 4, name: "Publisher D", configured: Boolean(env.PUBLISHER_D_URL) },
          { id: 5, name: "Publisher E", configured: Boolean(env.PUBLISHER_E_URL) }
        ]
      });
    }

    if (url.pathname === "/api/commercials" && request.method === "GET") {
      return json({
        ok: true,
        commercials: [
          { id: "commercial-1", title: "Commercial #1", status: "APPROVED" },
          { id: "commercial-2", title: "Commercial #2", status: "APPROVED" },
          { id: "commercial-3", title: "Soldiers Step Out", status: "APPROVED" }
        ]
      });
    }

    if (url.pathname === "/api/queue-all" && request.method === "POST") {
      const platforms = ["facebook", "instagram", "tiktok", "youtube"];
      const jobs = [];
      for (const commercial of ["commercial-1", "commercial-2", "commercial-3"]) {
        const job = {
          id: crypto.randomUUID(),
          commercial,
          platforms,
          createdAt: new Date().toISOString(),
          attempts: 0,
          state: "QUEUED"
        };
        await env.BROADCAST_QUEUE.send(job);
        jobs.push(job);
      }
      return json({ ok: true, jobs });
    }

    if (url.pathname === "/api/relay" && request.method === "POST") {
      const body = await request.json().catch(() => null);
      const commercials = body?.commercials?.length
        ? body.commercials
        : ["commercial-1", "commercial-2", "commercial-3"];

      const relay = {
        id: crypto.randomUUID(),
        stage: 1,
        stages: [
          { stage: 1, runner: "Runner 1", platforms: ["facebook", "instagram"] },
          { stage: 2, runner: "Runner 2", platforms: ["tiktok"] },
          { stage: 3, runner: "Runner 3", platforms: ["youtube"] }
        ],
        commercials,
        createdAt: new Date().toISOString(),
        state: "QUEUED"
      };

      await env.BROADCAST_QUEUE.send({
        type: "relay",
        relay,
        commercial: commercials[0],
        platforms: relay.stages[0].platforms
      });

      return json({ ok: true, relay });
    }

    if (url.pathname === "/api/queue" && request.method === "POST") {
      const body = await request.json().catch(() => null);
      if (!body?.commercial || !body?.platforms?.length) {
        return json({ ok: false, error: "commercial_and_platforms_required" }, 400);
      }

      const job = {
        id: crypto.randomUUID(),
        commercial: body.commercial,
        platforms: body.platforms,
        createdAt: new Date().toISOString(),
        attempts: 0,
        state: "QUEUED"
      };

      await env.BROADCAST_QUEUE.send(job);
      return json({ ok: true, job });
    }

    return env.ASSETS
      ? env.ASSETS.fetch(request)
      : json({ ok: false, error: "route_not_found" }, 404);
  },

  async queue(batch, env) {
    for (const message of batch.messages) {
      const job = message.body;

      // Super House rule:
      // failed engines are replaced, not patched.
      // Actual platform adapters are isolated behind this dispatch boundary.
      try {
        await dispatchWithFailover(job, env);
        message.ack();
      } catch (error) {
        console.error("broadcast_failed", {
          jobId: job.id,
          error: String(error)
        });
        message.retry();
      }
    }
  }
};

async function dispatchWithFailover(job, env) {
  const runners = [
    async () => publishWithTryPost(job, env),
    async () => publishWithHttpRunner(job, env.PUBLISHER_B_URL),
    async () => publishWithHttpRunner(job, env.PUBLISHER_C_URL),
    async () => publishWithHttpRunner(job, env.PUBLISHER_D_URL),
    async () => publishWithHttpRunner(job, env.PUBLISHER_E_URL)
  ];

  let lastError;
  for (let i = 0; i < runners.length; i++) {
    try {
      await runners[i]();
      return;
    } catch (error) {
      lastError = new Error("runner_" + (i + 1) + "_failed: " + String(error));
    }
  }
  throw lastError || new Error("all_publishers_failed");
}

async function publishWithHttpRunner(job, base) {
  if (!base) throw new Error("runner_not_configured");
  const response = await fetch(base.replace(/\/$/, "") + "/publish", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(job)
  });
  if (!response.ok) throw new Error("publisher_http_" + response.status);
}

async function publishWithTryPost(job, env) {
  if (!env.TRYPOST_API_URL || !env.TRYPOST_API_KEY) {
    throw new Error("trypost_not_configured");
  }

  const ids = JSON.parse(env.TRYPOST_SOCIAL_ACCOUNT_IDS || "{}");
  const platformMap = {
    facebook: { id: ids.facebook, content_type: "facebook_reel" },
    instagram: { id: ids.instagram, content_type: "instagram_reel" },
    tiktok: { id: ids.tiktok, content_type: "tiktok_video" },
    youtube: { id: ids.youtube, content_type: "youtube_short" }
  };

  const media = {
    "commercial-1": "https://ynleeweezwkdbisaiovq.supabase.co/storage/v1/object/public/broadcast-masters/commercial-1-approved.mp4",
    "commercial-2": "https://ynleeweezwkdbisaiovq.supabase.co/storage/v1/object/public/broadcast-masters/commercial-2-approved.mp4",
    "commercial-3": "https://ynleeweezwkdbisaiovq.supabase.co/storage/v1/object/public/broadcast-masters/commercial-3-soldiers-step-out-approved.mp4"
  }[job.commercial];

  if (!media) throw new Error("commercial_not_found");

  const captions = {
    "commercial-1": "Dog Tag Day — April 18. Put them on. Acknowledge one. DogTagDay.org",
    "commercial-2": "Dog Tag Day — April 18. Make veterans visible. Put them on. Acknowledge one. DogTagDay.org",
    "commercial-3": "Dog Tag Day — April 18. Watch the mission step off the screen. Put them on. Acknowledge one. DogTagDay.org #DogTagDay #Veterans #April18."
  };
  const caption = captions[job.commercial];
  if (!caption) throw new Error("caption_not_found");

  const base = env.TRYPOST_API_URL.replace(/\/$/, "");
  const headers = {
    "Authorization": "Bearer " + env.TRYPOST_API_KEY,
    "Content-Type": "application/json"
  };

  for (const platform of job.platforms) {
    const target = platformMap[platform];
    if (!target?.id) throw new Error("trypost_account_missing_" + platform);

    const created = await fetch(base + "/posts", {
      method: "POST",
      headers,
      body: JSON.stringify({
        content: caption,
        platforms: [{ social_account_id: target.id, content_type: target.content_type }]
      })
    });
    if (!created.ok) throw new Error("trypost_create_" + platform + "_" + created.status);
    const post = await created.json();

    const attached = await fetch(base + "/posts/" + post.id + "/media/from-url", {
      method: "POST",
      headers,
      body: JSON.stringify({ url: media })
    });
    if (!attached.ok) throw new Error("trypost_media_" + platform + "_" + attached.status);

    const published = await fetch(base + "/posts/" + post.id, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status: "publishing" })
    });
    if (!published.ok) throw new Error("trypost_publish_" + platform + "_" + published.status);
  }
}
