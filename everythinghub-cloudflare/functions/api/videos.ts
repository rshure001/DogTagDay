export const onRequest = async ({ request }: any) => {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=300, stale-while-revalidate=900", "Access-Control-Allow-Origin": "*" };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "GET") return Response.json({ error: "Use GET." }, { status: 405, headers });
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 180);
  if (q.length < 2) return Response.json({ results: [], count: 0, providers: [] }, { headers });
  const terms = q.toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]/g, " ").split(/\\s+/).filter(Boolean);
  const score = (item: any) => {
    const title = String(item.title || "").toLowerCase();
    const snippet = String(item.snippet || "").toLowerCase();
    const all = title + " " + snippet;
    const hits = terms.filter((term: string) => all.includes(term)).length;
    const titleHits = terms.filter((term: string) => title.includes(term)).length;
    const coverage = hits / Math.max(terms.length, 1);
    return coverage * 60 + titleHits / Math.max(terms.length, 1) * 40 - (terms.length > 1 && coverage < 0.5 ? 60 : 0);
  };
  const hosts = ["https://peertube.tv", "https://diode.zone"];
  const settled = await Promise.allSettled(hosts.map(async host => {
    const endpoint = host + "/api/v1/search/videos?search=" + encodeURIComponent(q) + "&count=30&sort=-match";
    const response = await fetch(endpoint, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("PeerTube provider unavailable");
    const payload: any = await response.json();
    return (payload.data || []).filter((video: any) => video.name && video.url).map((video: any) => {
      const thumb = video.thumbnails?.find((image: any) => image.width >= 640)?.fileUrl || (video.thumbnailPath ? (video.thumbnailPath.startsWith("http") ? video.thumbnailPath : host + video.thumbnailPath) : "");
      return {
        title: String(video.name),
        url: String(video.url),
        snippet: String(video.truncatedDescription || video.description || "").replace(/<[^>]*>/g, "").slice(0, 420),
        source: "PeerTube · " + new URL(host).hostname,
        thumbnailUrl: thumb,
        creator: video.account?.displayName || video.account?.name || "",
        publishedAt: video.publishedAt || video.createdAt || undefined,
        embedUrl: video.embedPath ? host + video.embedPath : undefined
      };
    });
  }));
  const all = settled.flatMap(result => result.status === "fulfilled" ? result.value : []);
  const seen = new Set<string>();
  const results = all.map((item: any) => ({ ...item, relevance: score(item) }))
    .filter((item: any) => item.relevance >= (terms.length > 1 ? 55 : 45))
    .sort((a: any, b: any) => b.relevance - a.relevance)
    .filter((item: any) => { if (seen.has(item.url)) return false; seen.add(item.url); return true; })
    .slice(0, 24)
    .map(({ relevance, ...item }: any) => item);
  return Response.json({
    results, count: results.length,
    providers: settled.flatMap((result, index) => result.status === "fulfilled" ? [hosts[index]] : []),
    unavailableProviders: settled.flatMap((result, index) => result.status === "rejected" ? [hosts[index]] : []),
    note: "Public PeerTube results ranked by title and description relevance. Videos open at their source; embedding depends on each creator's settings."
  }, { headers });
};
