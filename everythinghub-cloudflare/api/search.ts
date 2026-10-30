import type { VercelRequest, VercelResponse } from '@vercel/node';

type Item = { title: string; url: string; snippet: string; source: string };
const clean = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/\\s+/g, ' ').trim();
function parseDuck(html: string, limit: number): Item[] {
  const rows = html.split(/<div[^>]+class="[^"]*result results_links[^"]*"[^>]*>/i).slice(1);
  const out: Item[] = [];
  for (const row of rows) {
    const m = row.match(/<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\\s\\S]*?)<\\/a>/i);
    if (!m) continue;
    let url = m[1].replace(/&amp;/g, '&');
    try { const parsed = new URL(url, 'https://html.duckduckgo.com'); url = parsed.searchParams.get('uddg') || parsed.href; } catch { continue; }
    if (!/^https?:\\/\\//i.test(url)) continue;
    let source = ''; try { source = new URL(url).hostname.replace(/^www\\./, ''); } catch { continue; }
    const sm = row.match(/class="[^"]*result__snippet[^"]*"[^>]*>([\\s\\S]*?)<\\/[^>]+>/i);
    out.push({ title: clean(m[2]), url, snippet: sm ? clean(sm[1]) : '', source });
    if (out.length >= limit) break;
  }
  return out;
}
async function wiki(q: string, limit: number): Promise<Item[]> {
  const u = 'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&utf8=1&srlimit=' + limit + '&srsearch=' + encodeURIComponent(q);
  const response = await fetch(u, { headers: { 'User-Agent': 'EverythingHub/1.0' } });
  if (!response.ok) throw new Error('Wikipedia returned ' + response.status);
  const body = await response.json() as { query?: { search?: Array<{ title: string; snippet: string }> } };
  return (body.query?.search || []).map(x => ({ title: x.title, url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(x.title.replace(/ /g, '_')), snippet: clean(x.snippet), source: 'en.wikipedia.org' }));
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET for search.' });
  const q = String(req.query.q || '').trim().slice(0, 240);
  const vertical = String(req.query.vertical || 'web');
  const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 10));
  if (q.length < 2) return res.status(400).json({ error: 'Enter at least two characters.' });
  const scoped = vertical === 'veterans' ? q + ' site:va.gov OR site:militaryonesource.mil OR site:legion.org OR site:dav.org' : vertical === 'news' ? q + ' news' : q;
  try {
    const response = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(scoped), { headers: { 'User-Agent': 'Mozilla/5.0 EverythingHub/1.0' } });
    if (!response.ok) throw new Error('Primary search unavailable');
    const results = parseDuck(await response.text(), limit);
    if (results.length) return res.status(200).json({ results, count: results.length, providers: ['DuckDuckGo'] });
  } catch { /* continue to fallback */ }
  try {
    const results = await wiki(q, limit);
    return res.status(200).json({ results, count: results.length, providers: results.length ? ['Wikipedia'] : [], note: 'Fallback reference results; not a full-web index.' });
  } catch {
    return res.status(502).json({ error: 'Both public search sources are unavailable right now.' });
  }
}
