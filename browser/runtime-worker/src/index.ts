import { chromium, Page } from 'playwright-core';

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

async function execute(page: Page, action: string, payload: Record<string, string>) {
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
    default:
      throw new Error('unsupported_action');
  }
}

async function main() {
  if (!runtimeToken) await refreshRuntimeToken();

  const browser = await chromium.connectOverCDP(cdpUrl);
  const contexts = browser.contexts();
  const context = contexts[0] || (await browser.newContext());

  const existing = context.pages();
  const relayPage = existing[0] || (await context.newPage());
  await relayPage.goto(connector + '/?runtime=1', {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  });
  await relayPage.waitForFunction(
    () => Boolean((window as unknown as { dogtagRuntime?: unknown }).dogtagRuntime),
    undefined,
    { timeout: 30000 },
  );

  const targetPage = await context.newPage();
  await relayCall(relayPage, 'heartbeat', { currentUrl: targetPage.url() });
  console.log('DOGTAG_MANAGER_ATTACHED');

  let heartbeatAt = Date.now();
  for (;;) {
    try {
      const now = Date.now();
      if (now - heartbeatAt > 5000) {
        await relayCall(relayPage, 'heartbeat', { currentUrl: targetPage.url() });
        heartbeatAt = now;
      }

      const next = (await relayCall(relayPage, 'next', {})) as {
        command?: {
          id: string;
          action: string;
          payload: Record<string, string>;
        } | null;
      };

      if (!next.command) {
        await new Promise(resolve => setTimeout(resolve, pollMs));
        continue;
      }

      const command = next.command;
      try {
        const result = await execute(targetPage, command.action, command.payload || {});
        await relayCall(relayPage, 'result', {
          id: command.id,
          ok: true,
          currentUrl: targetPage.url(),
          result,
        });
      } catch (error) {
        await relayCall(relayPage, 'result', {
          id: command.id,
          ok: false,
          currentUrl: targetPage.url(),
          result: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    } catch (error) {
      console.error('[dog-tag-day-browser-worker]', error);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

main().catch(error => {
  console.error('[dog-tag-day-browser-worker:fatal]', error);
  process.exit(1);
});
