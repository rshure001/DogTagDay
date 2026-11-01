export const onRequest = async ({ request }: any) => {
  if (request.method !== "POST") return Response.json({ error: "Use POST." }, { status: 405 });
  return Response.json({ answer: "Ask AI is not enabled in this release. Use All, News, Images, or Veterans search to find source-linked public information.", sources: [] });
};
