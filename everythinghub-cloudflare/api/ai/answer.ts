import type { VercelRequest, VercelResponse } from '@vercel/node';
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  return res.status(200).json({
    answer: 'Ask AI is not enabled in this release. Use the All, News, Images, or Veterans search tabs to find source-linked public information.',
    sources: []
  });
}
