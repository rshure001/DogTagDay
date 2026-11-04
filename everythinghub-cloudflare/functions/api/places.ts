export const onRequest = async ({ request }: any) => {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=300" };
  if (request.method !== "GET") return Response.json({ error: "Use GET." }, { status: 405, headers });
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 180);
  if (q.length < 2) return Response.json({ results: [] }, { headers });
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.search = new URLSearchParams({ q, format: "jsonv2", limit: "10", addressdetails: "1" }).toString();
    const response = await fetch(url, { headers: { "User-Agent": "EverythingHub/1.0 (public place search)" }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("OpenStreetMap search unavailable");
    const data: any[] = await response.json();
    const results = data.map((item, i) => {
      const lat = Number(item.lat), lon = Number(item.lon);
      return { id: String(item.place_id || i), name: String(item.name || item.display_name?.split(",")[0] || "Place"), address: String(item.display_name || ""), latitude: lat, longitude: lon, category: String(item.type || item.class || "place"), mapUrl: "https://www.openstreetmap.org/?mlat=" + lat + "&mlon=" + lon + "#map=16/" + lat + "/" + lon };
    }).filter(item => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
    return Response.json({ results, provider: "OpenStreetMap Nominatim" }, { headers });
  } catch { return Response.json({ error: "Place search is temporarily unavailable." }, { status: 503, headers }); }
};