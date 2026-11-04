export const onRequest = async ({ request }: any) => {
  if (request.method !== "POST") return Response.json({ error: "Use POST." }, { status: 405 });
  return Response.json({ ok: true, stored: false, privacy: "Visits are not tracked or stored in this release." }, { headers: { "Cache-Control": "no-store" } });
};