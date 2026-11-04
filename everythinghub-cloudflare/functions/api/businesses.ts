type Company = { name: string; ticker: string; cik: string; category: string; source: string; url: string };
export const onRequest = async ({ request }: any) => {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=3600" };
  if (request.method !== "GET") return Response.json({ error: "Use GET." }, { status: 405, headers });
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 100).toLowerCase();
  if (q.length < 2) return Response.json({ results: [], scope: "SEC reporting companies; not a complete business directory." }, { headers });
  try {
    const response = await fetch("https://www.sec.gov/files/company_tickers.json", { headers: { "User-Agent": "EverythingHub contact support@everythinghub.org" }, signal: AbortSignal.timeout(9000) });
    if (!response.ok) throw new Error("SEC directory unavailable");
    const data: Record<string, any> = await response.json();
    const results: Company[] = Object.values(data).filter((item: any) => String(item.title || "").toLowerCase().includes(q) || String(item.ticker || "").toLowerCase().includes(q)).slice(0, 20).map((item: any) => {
      const cik = String(item.cik_str).padStart(10, "0");
      return { name: item.title, ticker: item.ticker, cik, category: "SEC reporting company", source: "U.S. Securities and Exchange Commission", url: "https://www.sec.gov/edgar/browse/?CIK=" + cik };
    });
    return Response.json({ results, scope: "SEC reporting companies and listed tickers; not a complete business directory.", provider: "SEC company_tickers.json" }, { headers });
  } catch { return Response.json({ results: [], scope: "SEC company directory temporarily unavailable." }, { headers }); }
};