export const onRequest = async ({ request }: any) => {
  if (request.method !== "GET") return Response.json({ error: "Use GET." }, { status: 405 });
  const minutes = Math.min(1440, Math.max(1, Number(new URL(request.url).searchParams.get("minutes")) || 60));
  return Response.json({ windowMinutes: minutes, totals: { visits: 0, searches: 0, clicks: 0, crawlerRuns: 0, trackedEvents: 0 }, averageTrackedEventsPerMinute: 0, crawler: { pagesIndexed: 0, pagesSkipped: 0, queuedPages: 0, lastCrawledAt: null, lastError: "Analytics are not stored in this privacy-preserving release." }, measurement: "No analytics are collected or stored; zeroes are placeholders, not measured traffic." }, { headers: { "Cache-Control": "no-store" } });
};