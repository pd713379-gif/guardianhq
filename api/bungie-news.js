// ============================================================
// GUARDIANHQ — api/bungie-news.js
// Vercel Serverless Function — Bungie News Feed
// ============================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.BUNGIE_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'API key ontbreekt' });

  try {
    const url = 'https://www.bungie.net/Platform/Content/GetContentByTagAndType/en/news/NewsArticle/?currentpage=1&itemsperpage=8&head=true';
    const bungieRes = await fetch(url, {
      headers: { 'X-API-Key': API_KEY }
    });

    if (!bungieRes.ok) {
      return res.status(bungieRes.status).json({ error: 'Bungie API fout' });
    }

    const data = await bungieRes.json();
    if (!data.Response) return res.status(500).json({ error: 'Geen data' });

    // Stuur alleen wat we nodig hebben
    const results = (data.Response.results || []).map(item => ({
      Subject:      item.Subject,
      CreationDate: item.CreationDate,
      Url:          item.Url,
      Content: {
        properties: {
          Title: item.Content && item.Content.properties && item.Content.properties.Title
        }
      }
    }));

    // Cache 5 minuten
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ results });

  } catch(err) {
    console.error('[bungie-news] Fout:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

