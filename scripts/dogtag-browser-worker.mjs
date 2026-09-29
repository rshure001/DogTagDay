import { chromium } from 'playwright';

const runtime = process.env.DOGTAG_RUNTIME_URL;
const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;

if (!runtime || !requestUrl || !requestToken) {
  throw new Error('Browser worker environment is incomplete');
}

const separator = requestUrl.includes('?') ? '&' : '?';
const tokenResponse = await fetch(requestUrl + separator + 'audience=dogtag-browser', {
  headers: { Authorization: 'Bearer ' + requestToken }
});
if (!tokenResponse.ok) throw new Error('GitHub identity request failed');

const identity = (await tokenResponse.json()).value;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const heartbeat = await fetch(runtime + '?op=heartbeat', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-dogtag-runtime-token': identity
  },
  body: JSON.stringify({ currentUrl: page.url() })
});

if (!heartbeat.ok) {
  throw new Error('Supabase heartbeat failed: ' + heartbeat.status);
}

console.log('Dog Tag browser heartbeat accepted');
await browser.close();
