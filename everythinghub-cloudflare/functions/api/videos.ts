export const onRequest = async ({ request }: any) => {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=300" };
  if (request.method !== "GET") return Response.json({ error: "Use GET." }, { status: 405, headers });
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 180);
  if (q.length < 2) return Response.json({ results: [], providers: [] }, { headers });
  try {
    const terms = q.replace(/[+\-!(){}\[\]^"~*?:\\/]/g, " ").trim().split(/\s+/).filter(Boolean).map(term => "title:" + term + "*").join(" AND ");
    const url = new URL("https://archive.org/advancedsearch.php");
    url.search = new URLSearchParams({ q: "mediatype:movies AND (" + terms + ")", fl: "identifier,title,description,creator", rows: "12", page: "1", output: "json" }).toString();
    const response = await fetch(url, { headers: { "User-Agent": "EverythingHub/1.0 (public media search)" }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Internet Archive unavailable");
    const data: any = await response.json();
    const docs: any[] = data.response?.docs || [];
    const results = docs.map(doc => ({ title: String(doc.title || doc.identifier), url: "https://archive.org/details/" + encodeURIComponent(String(doc.identifier)), snippet: String(doc.description || "Public media record in the Internet Archive.").replace(/<[^>]*>/g, "").slice(0, 300), source: "Internet Archive", creator: String(doc.creator || "") }));
    return Response.json({ results, count: results.length, providers: ["Internet Archive"] }, { headers });
  } catch { return Response.json({ error: "Public video search is temporarily unavailable." }, { status: 503, headers }); }
};