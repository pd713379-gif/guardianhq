// ============================================================
// GUARDIANHQ — api/bungie-news.js (STABLE VERSION)
// Gebruikt Bungie JSON endpoint (GEEN RSS parsing meer)
// Met caching + fallback
// ============================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Slimme cache (sneller + minder API issues)
  res.setHeader(
    'Cache-Control',
    's-maxage=60, stale-while-revalidate=120'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.BUNGIE_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'BUNGIE_API_KEY ontbreekt.' });
  }

  // ✅ NIEUWE STABIELE ENDPOINTS (JSON)
  const endpoints = [
    'https://www.bungie.net/Platform/Content/GetContentByTagAndType/destiny2/NewsArticles/0/0/10?lc=en',
    'https://www.bungie.net/Platform/Content/GetContentByTagAndType/news/NewsArticles/0/0/10?lc=en'
  ];

  for (const url of endpoints) {
    try {
      console.log('[bungie-news] Probeer:', url);

      const r = await fetch(url, {
        headers: {
          'X-API-Key': API_KEY,
          'User-Agent': 'GuardianHQ/2.0'
        }
      });

      if (!r.ok) {
        console.warn('[bungie-news] HTTP fout:', r.status);
        continue;
      }

      const json = await r.json();

      if (json.ErrorCode !== 1) {
        console.warn('[bungie-news] Bungie fout:', json.Message);
        continue;
      }

      const data = json.Response?.results || [];

      if (!data.length) {
        console.warn('[bungie-news] Geen results, volgende endpoint...');
        continue;
      }

      // 🔄 Map naar jouw frontend format
      const items = data.map(x => ({
        Subject: x.properties?.Title || '',
        CreationDate: x.properties?.ReleaseDate || '',
        Url: x.properties?.Slug
          ? `https://www.bungie.net${x.properties.Slug}`
          : '',
        Image: x.properties?.ImagePath
          ? `https://www.bungie.net${x.properties.ImagePath}`
          : '',
        Subtitle: x.properties?.Subtitle || '',
        Content: x
      }));

      console.log('[bungie-news] Items:', items.length);

      return res.status(200).json({
        results: items,
        source: url,
        fetchedAt: new Date().toISOString()
      });

    } catch (err) {
      console.error('[bungie-news] Error:', err.message);
    }
  }

  return res.status(200).json({
    results: [],
    error: 'Geen nieuws beschikbaar (alle endpoints faalden)'
  });
}
