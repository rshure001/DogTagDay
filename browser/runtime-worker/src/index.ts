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
  const body = await response.json() as { value?: string };
  if (!body.value) throw new Error('oidc_refresh_missing_value');
  runtimeToken = body.value;
  return runtimeToken;
}

if (!runtimeToken && !actionsTokenUrl) throw new Error('DOGTAG_RUNTIME_TOKEN is required');

function runtimeHeaders(extra: Record<string, string> = {}) {
  return { 'x-dogtag-runtime-token': runtimeToken, ...extra };
}

async function authorizedFetch(url: URL, init: RequestInit = {}) {
  if (!runtimeToken) await refreshRuntimeToken();
  let response = await fetch(url, init);
  if (response.status !== 401) return response;
  await refreshRuntimeToken();
  const headers = new Headers(init.headers || {});
  headers.set('x-dogtag-runtime-token', runtimeToken);
  response = await fetch(url, { ...init, headers });
  return response;
}

function connectorUrl(op: string, params: Record<string, string> = {}) {
  const isAppDeploy = connector.includes('appdeploy.ai');
  let url: URL;
  if (isAppDeploy) {
    const paths: Record<string, string> = {
      heartbeat: '/api/runtime/heartbeat',
      next: '/api/runtime/next',
      result: '/api/runtime/result',
      status: '/api/status',
    };
    const path = paths[op];
    if (!path) throw new Error(`unsupported_appdeploy_op_${op}`);
    url = new URL(path, connector.endsWith('/') ? connector : connector + '/');
  } else {
    url = new URL(connector);
    url.searchParams.set('op', op);
  }
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url;
}

async function connectorGet(op: string, params: Record<string, string> = {}) {
  const url = connectorUrl(op, params);
  const response = await authorizedFetch(url, { headers: runtimeHeaders() });
  if (!response.ok) throw new Error(`connector_get_${response.status}`);
  return response.json();
}

async function connectorPost(op: string, body: unknown) {
  const url = connectorUrl(op);
  const response = await authorizedFetch(url, {
    method: 'POST',
    headers: runtimeHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`connector_post_${response.status}${detail ? ':' + detail.slice(0, 300) : ''}`);
  }
  return response.json();
}

function currentPage(pages: Page[]) {
  if (!pages.length) throw new Error('no_page');
  const webPage = [...pages].reverse().find(page => /^https?:\/\//i.test(page.url()));
  return webPage || pages[pages.length - 1];
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
      return {
        mimeType: 'image/jpeg',
        base64: base64.length <= 180000 ? base64 : undefined,
        byteLength: data.length,
        omittedBecauseTooLarge: base64.length > 180000,
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
  if (!context.pages().length) await context.newPage();

  await connectorPost('heartbeat', { currentUrl: currentPage(context.pages()).url() });
  console.log('DOGTAG_MANAGER_ATTACHED');

  let heartbeatAt = Date.now();
  for (;;) {
    try {
      const page = currentPage(context.pages());
      const now = Date.now();
      if (now - heartbeatAt > 5000) {
        await connectorPost('heartbeat', { currentUrl: page.url() });
        heartbeatAt = now;
      }

      const next = await connectorGet('next');
      if (!next.command) {
        await new Promise(resolve => setTimeout(resolve, pollMs));
        continue;
      }

      const command = next.command as {
        id: string;
        action: string;
        payload: Record<string, string>;
      };

      try {
        const result = await execute(page, command.action, command.payload || {});
        await connectorPost('result', {
          id: command.id,
          ok: true,
          currentUrl: page.url(),
          result,
        });
      } catch (error) {
        await connectorPost('result', {
          id: command.id,
          ok: false,
          currentUrl: page.url(),
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
