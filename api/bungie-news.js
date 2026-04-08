// ============================================================
// GUARDIANHQ — api/bungie-news.js
// Vercel Serverless Function — Bungie RSS Feed
// ============================================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const url = 'https://www.bungie.net/en/Rss/NewsByCategory?category=news&currentpage=1&itemsperpage=8';
    console.log('[bungie-news] Ophalen:', url);

    const bungieRes = await fetch(url, {
      headers: {
        'User-Agent': 'GuardianHQ/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });

    const text = await bungieRes.text();
    console.log('[bungie-news] Status:', bungieRes.status, 'Preview:', text.slice(0, 300));

    if (!bungieRes.ok) {
      return res.status(500).json({ error: `Bungie gaf HTTP ${bungieRes.status}`, preview: text.slice(0, 200) });
    }

    // Parse RSS XML
    const items = [];
    const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g);

    for (const match of itemMatches) {
      const block = match[1];
      const get = (tag) => {
        const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`));
        return m ? (m[1] || m[2] || '').trim() : '';
      };

      items.push({
        Subject:      get('title'),
        CreationDate: get('pubDate'),
        Url:          get('link'),
        Content: {
          properties: {
            Title: get('title')
          }
        }
      });
    }

    console.log('[bungie-news] Gevonden items:', items.length);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ results: items });

  } catch (err) {
    console.error('[bungie-news] Fout:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
