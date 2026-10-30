import type { VercelRequest, VercelResponse } from '@vercel/node';

type SearchResult = { title: string; url: string; snippet: string; source: string };

function decode(value: string): string {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function textOnly(value: string): string {
  return decode(value.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ')).trim();
}
function unwrap(raw: string): string {
  try {
    const u = new URL(raw.startsWith('//') ? 'https:' + raw : raw, 'https://html.duckduckgo.com');
    const target = u.searchParams.get('uddg');
    return target ? decodeURIComponent(target) : u.href;
  } catch { return raw; }
}
function parseResults(html: string, limit: number): SearchResult[] {
  const blocks = html.split(/<div[^>]+class="[^"]*result results_links[^"]*"[^>]*>/i).slice(1);
  const found: SearchResult[] = [];
  for (const block of blocks) {
    const a = block.match(/<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\\s\\S]*?)<\\/a>/i);
    if (!a) continue;
    const url = unwrap(decode(a[1]));
    if (!/^https?:\\/\\//i.test(url)) continue;
    let host = '';
    try { host = new URL(url).hostname.replace(/^www\\./, ''); } catch { continue; }
    const snippetMatch = block.match(/class="[^"]*result__snippet[^"]*"[^>]*>([\\s\\S]*?)<\\/[^>]+>/i);
    found.push({ title: textOnly(a[2]), url, snippet: snippetMatch ? textOnly(snippetMatch[1]) : '', source: host });
    if (found.length >= limit) break;
  }
  return found;
}
async function wikipediaFallback(q: string, limit: number): Promise<SearchResult[]> {
  const endpoint = 'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&utf8=1&srlimit=' + limit + '&srsearch=' + encodeURIComponent(q);
  const response = await fetch(endpoint, {
    headers: { 'User-Agent': 'EverythingHub/1.0 (public search; contact: hello@dogtagday.org)' },
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw new Error('Fallback source returned ' + response.status);
  const data = await response.json() as { query?: { search?: Array<{ title: string; snippet: string }> } };
  return (data.query?.search || []).map(item => ({
    title: item.title,
    url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(item.title.replace(/ /g, '_')),
    snippet: textOnly(item.snippet),
    source: 'en.wikipedia.org'
  }));
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET for search.' });
  const q = String(req.query.q || '').trim().slice(0, 240);
  const vertical = String(req.query.vertical || 'web');
  const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 10));
  if (q.length < 2) return res.status(400).json({ error: 'Enter at least two characters.' });
  const scoped = vertical === 'veterans'
    ? q + ' (site:va.gov OR site:militaryonesource.mil OR site:legion.org OR site:dav.org)'
    : vertical === 'news' ? q + ' news' : q;
  try {
    const endpoint = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(scoped);
    const response = await fetch(endpoint, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EverythingHubSearch/1.0; +https://dogtagday.org)' },
      signal: AbortSignal.timeout(7000)
    });
    if (!response.ok) throw new Error('Primary search provider returned ' + response.status);
    const results = parseResults(await response.text(), limit);
    if (results.length) return res.status(200).json({ results, count: results.length, providers: ['DuckDuckGo public web index'] });
    throw new Error('Primary provider returned no readable results');
  } catch {
    try {
      const results = await wikipediaFallback(q, limit);
      return res.status(200).json({
        results, count: results.length, providers: results.length ? ['Wikipedia search fallback'] : [],
        note: 'The main public-web provider did not respond. These are encyclopedia results, not full-web results.'
      });
    } catch {
      return res.status(503).json({ error: 'Search providers are temporarily unavailable. Please try again shortly.' });
    }
  }
}
