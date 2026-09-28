import { chromium, Page } from 'playwright-core';

const connector = process.env.DOGTAG_CONNECTOR_URL || 'https://ynleeweezwkdbisaiovq.supabase.co/functions/v1/dogtag-browser-runtime';
const cdpUrl = process.env.DOGTAG_CDP_URL || 'http://127.0.0.1:9222';
const pollMs = Number(process.env.DOGTAG_POLL_MS || 1200);
const runtimeToken = process.env.DOGTAG_RUNTIME_TOKEN || '';

if (!runtimeToken) throw new Error('DOGTAG_RUNTIME_TOKEN is required');

function runtimeHeaders(extra: Record<string, string> = {}) {
  return { 'x-dogtag-runtime-token': runtimeToken, ...extra };
}

async function connectorGet(path: string) {
  const response = await fetch(connector + path, { headers: runtimeHeaders() });
  if (!response.ok) throw new Error(`connector_get_${response.status}`);
  return response.json();
}

async function connectorPost(path: string, body: unknown) {
  const response = await fetch(connector + path, {
    method: 'POST',
    headers: runtimeHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`connector_post_${response.status}`);
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
      return { clicked: payload.selector };
    case 'type':
      if (!payload.selector) throw new Error('missing_selector');
      await page.locator(payload.selector).first().fill(payload.text || '');
      return { typed: true, selector: payload.selector };
    case 'read': {
      const selector = payload.selector || 'body';
      const text = await page.locator(selector).first().innerText({ timeout: 15000 });
      return { text: text.slice(0, 120000), selector };
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
  const browser = await chromium.connectOverCDP(cdpUrl);
  const contexts = browser.contexts();
  const context = contexts[0] || (await browser.newContext());
  if (!context.pages().length) await context.newPage();

  let heartbeatAt = 0;
  for (;;) {
    try {
      const page = currentPage(context.pages());
      const now = Date.now();
      if (now - heartbeatAt > 5000) {
        await connectorPost('/heartbeat', { currentUrl: page.url() });
        heartbeatAt = now;
      }

      const next = await connectorGet('/next');
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
        await connectorPost('/result', {
          id: command.id,
          ok: true,
          currentUrl: page.url(),
          result,
        });
      } catch (error) {
        await connectorPost('/result', {
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
