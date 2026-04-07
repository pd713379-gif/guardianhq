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
    const url = 'https://www.bungie.net/Platform/Content/GetContentByTagAndType/news/NewsArticle/en/?currentpage=1&itemsperpage=8&head=true';
    console.log('[bungie-news] Ophalen:', url);

    const bungieRes = await fetch(url, {
      headers: { 'X-API-Key': API_KEY }
    });

    const text = await bungieRes.text();
    console.log('[bungie-news] Status:', bungieRes.status, 'Body preview:', text.slice(0, 300));

    let data;
    try { data = JSON.parse(text); } catch(e) {
      return res.status(500).json({ error: 'Geen JSON van Bungie', preview: text.slice(0, 200) });
    }

    if (!data.Response) {
      return res.status(500).json({ error: 'Geen Response veld', errorCode: data.ErrorCode, message: data.Message });
    }

    const items = data.Response.results || [];
    const results = items.map(item => ({
      Subject:      item.Subject || '',
      CreationDate: item.CreationDate || '',
      Url:          item.Url || '',
      Content: {
        properties: {
          Title: item.Content && item.Content.properties && item.Content.properties.Title
            ? item.Content.properties.Title
            : item.Subject || ''
        }
      }
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ results });

  } catch(err) {
    console.error('[bungie-news] Fout:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
