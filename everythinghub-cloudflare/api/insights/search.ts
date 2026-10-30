import type { VercelRequest, VercelResponse } from '@vercel/node';
// Deliberately does not retain raw queries or identify visitors.
// Aggregate analytics storage will be added only with an explicit privacy-reviewed design.
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  return res.status(202).json({ accepted: true, stored: false });
}
