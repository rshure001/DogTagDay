import type { VercelRequest, VercelResponse } from '@vercel/node';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET for image search.' });
  const q = String(req.query.q || '').trim().slice(0, 200);
  if (q.length < 2) return res.status(400).json({ error: 'Enter at least two characters.' });
  try {
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    url.search = new URLSearchParams({
      action: 'query', generator: 'search', gsrsearch: q, gsrnamespace: '6',
      gsrlimit: '12', prop: 'imageinfo', iiprop: 'url|extmetadata',
      iiurlwidth: '640', format: 'json', origin: '*'
    }).toString();
    const response = await fetch(url, { headers: { 'User-Agent': 'EverythingHub/1.0 (public search)' }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Wikimedia request failed');
    const data = await response.json() as any;
    const pages = Object.values(data?.query?.pages || {}) as any[];
    const results = pages.map(page => {
      const info = page.imageinfo?.[0];
      if (!info?.thumburl && !info?.url) return null;
      return {
        title: String(page.title || '').replace(/^File:/, ''),
        pageUrl: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(String(page.title || '').replace(/ /g, '_')),
        imageUrl: info.thumburl || info.url,
        description: String(info.extmetadata?.ImageDescription?.value || '').replace(/<[^>]*>/g, '').slice(0, 300)
      };
    }).filter(Boolean);
    return res.status(200).json({ results });
  } catch {
    return res.status(503).json({ error: 'Image search is temporarily unavailable.' });
  }
}
