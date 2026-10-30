import type { VercelRequest, VercelResponse } from '@vercel/node';
// No click-level visitor tracking is enabled in this first release.
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  return res.status(202).json({ accepted: true, stored: false });
}
