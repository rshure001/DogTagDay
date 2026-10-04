import { chromium, Page } from 'playwright-core';

const superHouse = process.env.DOGTAG_SUPER_HOUSE_URL || 'https://dog-tag-day-super-house.juvenile-lemming.workers.dev';
const connector = process.env.DOGTAG_CONNECTOR_URL || 'https://dog-tag-day-browser-connector-rtpz8q.v2.appdeploy.ai';
const cdpUrl = process.env.DOGTAG_CDP_URL || 'http://127.0.0.1:9222';
const pollMs = Number(process.env.DOGTAG_POLL_MS || 1200);
let runtimeToken = process.env.DOGTAG_RUNTIME_TOKEN || '';

const actionsTokenUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL || '';
const actionsBearer = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN || '';

async function refreshRuntimeToken() {
  if (!actionsTokenUrl || !actionsBearer) {
    if (!runtimeToken) throw new Error('DOGTAG_RUNTIME_TOKEN is required');
    return runtimeToken;
  }
  const url = new URL(actionsTokenUrl);
  url.searchParams.set('audience', 'dogtag-browser');
  const response = await fetch(url, {
    headers: { Authorization: `bearer ${actionsBearer}` },
  });
  if (!response.ok) throw new Error(`oidc_refresh_${response.status}`);
  const body = (await response.json()) as { value?: string };
  if (!body.value) throw new Error('oidc_refresh_missing_value');
  runtimeToken = body.value;
  return runtimeToken;
}

if (!runtimeToken && !actionsTokenUrl) throw new Error('DOGTAG_RUNTIME_TOKEN is required');

async function superHouseCall(path: string, body: Record<string, unknown> = {}) {
  if (!runtimeToken) await refreshRuntimeToken();
  const response = await fetch(superHouse + path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${runtimeToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`super_house_${response.status}_${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : {};
}

async function relayCall(
  relayPage: Page,
  method: 'heartbeat' | 'next' | 'result',
  payload: Record<string, unknown>,
) {
  if (!runtimeToken) await refreshRuntimeToken();
  const invoke = async () =>
    relayPage.evaluate(
      async ({ methodName, data }) => {
        const runtime = (window as unknown as {
          dogtagRuntime?: Record<string, (payload: Record<string, unknown>) => Promise<unknown>>;
        }).dogtagRuntime;
        if (!runtime || !runtime[methodName]) throw new Error('runtime_relay_not_ready');
        return runtime[methodName](data);
      },
      {
        methodName: method,
        data: { ...payload, token: runtimeToken },
      },
    );

  try {
    return await invoke();
  } catch {
    await refreshRuntimeToken();
    return invoke();
  }
}

async function execute(page: Page, relayPage: Page, action: string, payload: Record<string, string>) {
  switch (action) {
    case 'open':
      if (!payload.url) throw new Error('missing_url');
      await page.goto(payload.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      return { title: await page.title(), url: page.url() };
    case 'click':
      if (!payload.selector) throw new Error('missing_selector');
      await page.locator(payload.selector).first().click({ timeout: 15000 });
      return { clicked: payload.selector, url: page.url() };
    case 'clickAt': {
      const x = Number(payload.x);
      const y = Number(payload.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('missing_coordinates');
      await page.mouse.click(x, y);
      return { clickedAt: { x, y }, url: page.url() };
    }
    case 'type':
      if (!payload.selector) throw new Error('missing_selector');
      await page.locator(payload.selector).first().fill(payload.text || '');
      return { typed: true, selector: payload.selector };
    case 'read': {
      const selector = payload.selector || 'body';
      const text = await page.locator(selector).first().innerText({ timeout: 15000 });
      return { text: text.slice(0, 120000), selector, url: page.url() };
    }
    case 'screenshot': {
      const data = await page.screenshot({ type: 'jpeg', quality: 35, fullPage: false });
      const base64 = data.toString('base64');
      const viewport = page.viewportSize();
      return {
        mimeType: 'image/jpeg',
        base64: base64.length <= 180000 ? base64 : undefined,
        byteLength: data.length,
        omittedBecauseTooLarge: base64.length > 180000,
        viewportWidth: viewport?.width || 0,
        viewportHeight: viewport?.height || 0,
        url: page.url(),
      };
    }
    case 'back':
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null);
      return { url: page.url() };
    case 'forward':
      await page.goForward({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null);
      return { url: page.url() };
    case 'status':
      return { title: await page.title(), url: page.url() };
    case 'reconnect':
      await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
      await relayPage.goto(connector + '/?runtime=1', {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });
      await relayPage.waitForFunction(
        () => Boolean((window as unknown as { dogtagRuntime?: unknown }).dogtagRuntime),
        undefined,
        { timeout: 30000 },
      );
      await relayCall(relayPage, 'heartbeat', { currentUrl: page.url() });
      return { reconnected: true, url: page.url() };
    default:
      throw new Error('unsupported_action');
  }
}

async function publishDirect(command: { id: string; commercial?: string; platforms?: string[] }) {
  const commercial = String(command.commercial || "");
  if (!/^commercial-[123]$/.test(commercial)) throw new Error("commercial_not_approved");

  const publisher = process.env.DOGTAG_PUBLISHER_URL ||
    "https://ynleeweezwkdbisaiovq.supabase.co/functions/v1/dogtag-publish-now";

  const response = await fetch(publisher, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${runtimeToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ commercials: [commercial] }),
  });

  const body = await response.text();
  let parsed: unknown = {};
  try { parsed = body ? JSON.parse(body) : {}; } catch { parsed = { raw: body.slice(0, 2000) }; }

  if (!response.ok) {
    throw new Error(`publisher_${response.status}_${body.slice(0, 1000)}`);
  }

  return {
    action: "publish_direct",
    commercial,
    requestedPlatforms: command.platforms || ["facebook", "instagram", "tiktok", "youtube"],
    publisher,
    result: parsed,
  };
}

async function main() {
  if (!runtimeToken) await refreshRuntimeToken();

  const browser = await chromium.connectOverCDP(cdpUrl);
  const contexts = browser.contexts();
  const context = contexts[0] || (await browser.newContext());

  const existing = context.pages();
  const relayPage = existing[0] || (await context.newPage());
  await relayPage.goto(connector + "/?runtime=1", {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await relayPage.waitForFunction(
    () => Boolean((window as unknown as { dogtagRuntime?: unknown }).dogtagRuntime),
    undefined,
    { timeout: 30000 },
  );

  const targetPage = await context.newPage();
  console.log("DOGTAG_MANAGER_ATTACHED");
  await relayCall(relayPage, "heartbeat", { currentUrl: targetPage.url() });

  let heartbeatAt = Date.now();
  for (;;) {
    try {
      const now = Date.now();
      if (now - heartbeatAt > 5000) {
        await relayCall(relayPage, "heartbeat", { currentUrl: targetPage.url() });
        heartbeatAt = now;
      }

      const broker = await superHouseCall("/api/browser/next");
      if (broker.command) {
        const command = broker.command as {
          id: string;
          action: string;
          commercial?: string;
          platforms?: string[];
          payload?: Record<string, string>;
          [key: string]: unknown;
        };

        try {
          let result: unknown;

          if (command.action === "publish_direct") {
            result = await publishDirect(command);
          } else if (command.action === "publish" || command.action === "broadcast") {
            result = {
              accepted: false,
              command: command.action,
              error: "legacy_broadcast_command_replaced_use_publish_direct",
            };
            throw new Error("legacy_broadcast_command_replaced_use_publish_direct");
          } else {
            result = await execute(
              targetPage,
              relayPage,
              command.action,
              (command.payload || {}) as Record<string, string>,
            );
          }

          await superHouseCall("/api/browser/result", {
            id: command.id,
            ok: true,
            currentUrl: targetPage.url(),
            result,
          });
        } catch (error) {
          await superHouseCall("/api/browser/result", {
            id: command.id,
            ok: false,
            currentUrl: targetPage.url(),
            result: {
              error: error instanceof Error ? error.message : String(error),
            },
          });
        }
      }
    } catch (error) {
      console.error("[dog-tag-day-browser-worker]", error);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

main().catch(error => {
  console.error("[dog-tag-day-browser-worker:fatal]", error);
  process.exit(1);
});
