type Item = { title: string; url: string; snippet: string; source: string };
const clean = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&#x2F;/g, "/").replace(/\\s+/g, " ").trim();
function parseDuck(html: string, limit: number): Item[] {
  const out: Item[] = [];
  const blocks = html.split(/<div[^>]+class=["'][^"']*result results_links[^"']*["'][^>]*>/i).slice(1);
  for (const block of blocks) {
    const match = block.match(/<a[^>]+class=["'][^"']*result__a[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>/i);
    if (!match) continue;
    let url = match[1].replace(/&amp;/g, "&");
    try {
      const parsed = new URL(url, "https://html.duckduckgo.com");
      url = parsed.searchParams.get("uddg") || parsed.href;
      const target = new URL(url);
      if (!["http:", "https:"].includes(target.protocol)) continue;
      const snippetMatch = block.match(/class=["'][^"']*result__snippet[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>/i);
      out.push({ title: clean(match[2]), url: target.href, snippet: snippetMatch ? clean(snippetMatch[1]) : "", source: target.hostname.replace(/^www\\./, "") });
      if (out.length >= limit) break;
    } catch { /* ignore malformed result */ }
  }
  return out;
}
async function wiki(q: string, limit: number): Promise<Item[]> {
  const url = "https://en.wikipedia.org/w/api.php?" + new URLSearchParams({ action: "query", list: "search", format: "json", utf8: "1", srlimit: String(limit), srsearch: q });
  const response = await fetch(url, { headers: { "User-Agent": "EverythingHub/1.0 (public search)" } });
  if (!response.ok) throw new Error("Reference fallback unavailable");
  const data: any = await response.json();
  return (data.query?.search || []).map((item: any) => ({
    title: item.title,
    url: "https://en.wikipedia.org/wiki/" + encodeURIComponent(item.title.replace(/ /g, "_")),
    snippet: clean(item.snippet || ""),
    source: "en.wikipedia.org"
  }));
}
export const onRequest = async ({ request }: any) => {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60, stale-while-revalidate=300" };
  if (request.method !== "GET") return Response.json({ error: "Use GET for search." }, { status: 405, headers });
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 240);
  const vertical = url.searchParams.get("vertical") || "web";
  const limit = Math.min(10, Math.max(1, Number(url.searchParams.get("limit")) || 10));
  if (q.length < 2) return Response.json({ error: "Enter at least two characters." }, { status: 400, headers });
  const scoped = vertical === "veterans" ? q + " (site:va.gov OR site:militaryonesource.mil OR site:legion.org OR site:dav.org)" : vertical === "news" ? q + " news" : q;
  try {
    const response = await fetch("https://html.duckduckgo.com/html/?" + new URLSearchParams({ q: scoped }), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; EverythingHub/1.0; public search)" },
      signal: AbortSignal.timeout(9000)
    });
    if (response.ok) {
      const results = parseDuck(await response.text(), limit);
      if (results.length) return Response.json({ results, count: results.length, providers: ["DuckDuckGo"] }, { headers });
    }
  } catch { /* use the public reference fallback */ }
  try {
    const results = await wiki(q, limit);
    return Response.json({ results, count: results.length, providers: results.length ? ["Wikipedia"] : [], note: "Reference fallback results; not a full-web index." }, { headers });
  } catch {
    return Response.json({ error: "Public search sources are temporarily unavailable." }, { status: 502, headers });
  }
};
