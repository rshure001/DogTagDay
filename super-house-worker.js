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
  const engines = [
    env.PUBLISHER_A_URL,
    env.PUBLISHER_B_URL,
    env.PUBLISHER_EMERGENCY_URL
  ].filter(Boolean);

  if (!engines.length) {
    throw new Error("No publisher engine configured");
  }

  let lastError;
  for (const base of engines) {
    try {
      const response = await fetch(base.replace(/\/$/, "") + "/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(job)
      });

      if (response.ok) return;
      lastError = new Error("publisher_http_" + response.status);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("all_publishers_failed");
}
