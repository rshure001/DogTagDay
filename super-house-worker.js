const VERSION = "1.1.0-secure";
const MAX_CONTROL_BODY_BYTES = 16 * 1024;
const ALLOWED_COMMERCIALS = new Set(["commercial-1", "commercial-2", "commercial-3"]);
const ALLOWED_PLATFORMS = new Set(["facebook", "instagram", "tiktok", "youtube"]);

async function authorizeControlRequest(request, env) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return json({ ok: false, error: "unauthorized" }, 401);
  const token = header.slice(7).trim();
  if (!token) return json({ ok: false, error: "unauthorized" }, 401);
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("bad_jwt");
    const decode = (v) => JSON.parse(atob(v.replace(/-/g, "+").replace(/_/g, "/")));
    const headerPart = decode(parts[0]);
    const claims = decode(parts[1]);
    if (claims.iss !== "https://token.actions.githubusercontent.com") throw new Error("bad_issuer");
    if (claims.aud !== "dogtag-browser") throw new Error("bad_audience");
    if (!claims.exp || claims.exp < Math.floor(Date.now() / 1000)) throw new Error("expired");
    const jwks = await fetch("https://token.actions.githubusercontent.com/.well-known/jwks", { cf: { cacheTtl: 300 } }).then(r => r.json());
    const jwk = jwks.keys.find(k => k.kid === headerPart.kid);
    if (!jwk) throw new Error("unknown_kid");
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const data = new TextEncoder().encode(parts[0] + "." + parts[1]);
    const signature = Uint8Array.from(atob(parts[2].replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, data);
    if (!valid) throw new Error("bad_signature");
    return null;
  } catch {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
}
async function readControlJson(request) {
  const declared = Number(request.headers.get("content-length") || "0");
  if (declared > MAX_CONTROL_BODY_BYTES) throw new Error("request_too_large");
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAX_CONTROL_BODY_BYTES) throw new Error("request_too_large");
  if (!bytes.byteLength) return {};
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new Error("invalid_json"); }
}

function validateCommercials(values) {
  if (!Array.isArray(values) || values.length < 1 || values.length > 3) throw new Error("invalid_commercials");
  const unique = [...new Set(values)];
  if (unique.length !== values.length || unique.some(v => !ALLOWED_COMMERCIALS.has(v))) {
    throw new Error("invalid_commercials");
  }
  return unique;
}

function validatePlatforms(values) {
  if (!Array.isArray(values) || values.length < 1 || values.length > 4) throw new Error("invalid_platforms");
  const unique = [...new Set(values)];
  if (unique.length !== values.length || unique.some(v => !ALLOWED_PLATFORMS.has(v))) {
    throw new Error("invalid_platforms");
  }
  return unique;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" }
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

    if (url.pathname === "/api/browser/next" && request.method === "POST") {
      const denied = await authorizeControlRequest(request, env);
      if (denied) return denied;
      const id = env.BROWSER_RELAY.idFromName("primary");
      return env.BROWSER_RELAY.get(id).fetch(new Request("https://relay/next", { method: "POST" }));
    }

    if (url.pathname === "/api/browser/result" && request.method === "POST") {
      const denied = await authorizeControlRequest(request, env);
      if (denied) return denied;
      const body = await readControlJson(request).catch(() => ({}));
      const id = env.BROWSER_RELAY.idFromName("primary");
      return env.BROWSER_RELAY.get(id).fetch(new Request("https://relay/result", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      }));
    }

    if (url.pathname === "/api/queue-all" && request.method === "POST") {
      const denied = await authorizeControlRequest(request, env);
      if (denied) return denied;
      let body;
      try { body = await readControlJson(request); } catch (error) { return json({ ok: false, error: String(error.message || error) }, 400); }
      let selected;
      try { selected = validateCommercials(body?.commercials || ["commercial-1", "commercial-2", "commercial-3"]); } catch (error) { return json({ ok: false, error: String(error.message || error) }, 400); }
      const platforms = ["facebook", "instagram", "tiktok", "youtube"];
      const jobs = [];
      for (const commercial of selected) {
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
      const denied = await authorizeControlRequest(request, env);
      if (denied) return denied;
      let body;
      try { body = await readControlJson(request); } catch (error) { return json({ ok: false, error: String(error.message || error) }, 400); }
      let commercials;
      try { commercials = validateCommercials(body?.commercials?.length ? body.commercials : ["commercial-1", "commercial-2", "commercial-3"]); } catch (error) { return json({ ok: false, error: String(error.message || error) }, 400); }

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

      const relayId = env.BROWSER_RELAY.idFromName("primary");
      await env.BROWSER_RELAY.get(relayId).fetch(new Request("https://relay/enqueue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: relay.id,
          action: "broadcast",
          commercials,
          relay
        })
      }));

      return json({ ok: true, relay });
    }

    if (url.pathname === "/api/queue" && request.method === "POST") {
      const denied = await authorizeControlRequest(request, env);
      if (denied) return denied;
      let body;
      try { body = await readControlJson(request); } catch (error) { return json({ ok: false, error: String(error.message || error) }, 400); }
      let commercial;
      let platforms;
      try {
        commercial = validateCommercials([body?.commercial])[0];
        platforms = validatePlatforms(body?.platforms);
      } catch (error) {
        return json({ ok: false, error: String(error.message || error) }, 400);
      }

      const job = {
        id: crypto.randomUUID(),
        commercial,
        platforms,
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
        if (job.type === "relay") {
          await processRelay(job, env);
        } else {
          await dispatchWithFailover(job, env);
        }
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

async function processRelay(job, env) {
  const relay = job.relay;
  const commercialIndex = Number.isInteger(job.commercialIndex) ? job.commercialIndex : 0;
  const stageIndex = Number.isInteger(job.stageIndex) ? job.stageIndex : 0;
  const stage = relay?.stages?.[stageIndex];
  const commercial = relay?.commercials?.[commercialIndex];

  if (!relay || !stage || !commercial) {
    throw new Error("relay_state_invalid");
  }

  const stageJob = {
    id: relay.id + "-commercial-" + (commercialIndex + 1) + "-stage-" + (stageIndex + 1),
    commercial,
    platforms: stage.platforms,
    relayId: relay.id,
    relayStage: stage.stage,
    createdAt: relay.createdAt,
    attempts: 0,
    state: "QUEUED"
  };

  console.log("relay_stage_start", {
    relayId: relay.id,
    commercial,
    commercialIndex,
    stageIndex,
    runner: stage.runner,
    platforms: stage.platforms
  });

  await dispatchWithFailover(stageJob, env);

  const nextStageIndex = stageIndex + 1;
  const nextCommercialIndex = commercialIndex + 1;

  if (nextStageIndex < relay.stages.length) {
    await env.BROADCAST_QUEUE.send({
      type: "relay",
      relay: {
        ...relay,
        stage: nextStageIndex + 1,
        state: "IN_PROGRESS"
      },
      commercialIndex,
      stageIndex: nextStageIndex
    });
    console.log("relay_baton_pass", {
      relayId: relay.id,
      fromStage: stageIndex + 1,
      toStage: nextStageIndex + 1,
      commercial
    });
    return;
  }

  if (nextCommercialIndex < relay.commercials.length) {
    await env.BROADCAST_QUEUE.send({
      type: "relay",
      relay: {
        ...relay,
        stage: 1,
        state: "IN_PROGRESS"
      },
      commercialIndex: nextCommercialIndex,
      stageIndex: 0
    });
    console.log("relay_next_commercial", {
      relayId: relay.id,
      completedCommercial: commercial,
      nextCommercial: relay.commercials[nextCommercialIndex]
    });
    return;
  }

  console.log("relay_finished", {
    relayId: relay.id,
    commercials: relay.commercials,
    stagesPerCommercial: relay.stages.length
  });
}

async function dispatchWithFailover(job, env) {
  const id = env.BROWSER_RELAY.idFromName("primary");
  const response = await env.BROWSER_RELAY.get(id).fetch(new Request("https://relay/enqueue", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: job.id, action: "publish", job })
  }));
  if (!response.ok) throw new Error("browser_relay_" + response.status);
}
async function publishWithHttpRunner(job, base) {
  if (!base) throw new Error("runner_not_configured");
  const target = new URL(base);
  if (target.protocol !== "https:") throw new Error("publisher_https_required");
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


export class BrowserRelay {
  constructor(state) { this.state = state; }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
    if (url.pathname === "/enqueue") {
      const job = await request.json();
      const queue = (await this.state.storage.get("queue")) || [];
      queue.push(job);
      await this.state.storage.put("queue", queue.slice(-100));
      return json({ ok: true, queued: job.id });
    }
    if (url.pathname === "/next") {
      const queue = (await this.state.storage.get("queue")) || [];
      const command = queue.shift() || null;
      await this.state.storage.put("queue", queue);
      return json({ ok: true, command });
    }
    if (url.pathname === "/result") {
      const result = await request.json();
      const results = (await this.state.storage.get("results")) || [];
      results.push({ ...result, receivedAt: new Date().toISOString() });
      await this.state.storage.put("results", results.slice(-100));
      return json({ ok: true });
    }
    return json({ ok: false, error: "route_not_found" }, 404);
  }
}
