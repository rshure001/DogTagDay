export const onRequest = async ({ request }: any) => {
  if (request.method !== "POST") return Response.json({ error: "Use POST." }, { status: 405 });
  return Response.json({ ok: true, stored: false, privacy: "No search history is stored by this endpoint." });
};
