export const onRequest = async ({ request }: any) => {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=300, stale-while-revalidate=900" };
  if (request.method !== "GET") return Response.json({ error: "Use GET for image search." }, { status: 405, headers });
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 200);
  if (q.length < 2) return Response.json({ error: "Enter at least two characters." }, { status: 400, headers });
  try {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.search = new URLSearchParams({ action: "query", generator: "search", gsrsearch: q, gsrnamespace: "6", gsrlimit: "12", prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "640", format: "json" }).toString();
    const response = await fetch(url, { headers: { "User-Agent": "EverythingHub/1.0 (public image search)" }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Image provider unavailable");
    const data: any = await response.json();
    const pages = Object.values(data.query?.pages || {}) as any[];
    const results = pages.map(page => {
      const info = page.imageinfo?.[0];
      if (!info?.thumburl && !info?.url) return null;
      return { title: String(page.title || "").replace(/^File:/, ""), pageUrl: "https://commons.wikimedia.org/wiki/" + encodeURIComponent(String(page.title || "").replace(/ /g, "_")), imageUrl: info.thumburl || info.url, description: String(info.extmetadata?.ImageDescription?.value || "").replace(/<[^>]*>/g, "").slice(0, 300) };
    }).filter(Boolean);
    return Response.json({ results }, { headers });
  } catch {
    return Response.json({ error: "Image search is temporarily unavailable." }, { status: 503, headers });
  }
};
