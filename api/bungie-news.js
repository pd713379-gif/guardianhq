// ============================================================
// GUARDIANHQ — api/bungie-news.js
// Vercel Serverless Function — Bungie NewsArticles RSS
// GEEN edge-cache — altijd verse data van Bungie
// ============================================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  // Geen cache op Vercel edge — altijd verse data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.BUNGIE_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'BUNGIE_API_KEY ontbreekt.' });
  }

  // Probeer endpoints in volgorde
  const endpoints = [
    'https://www.bungie.net/Platform/Content/Rss/NewsArticles/0/?categoryfilter=destiny2&includebody=false',
    'https://www.bungie.net/Platform/Content/Rss/NewsArticles/0/?includebody=false',
    'https://www.bungie.net/en/Rss/NewsByCategory?category=news&currentpage=1&itemsperpage=10',
  ];

  for (const url of endpoints) {
    try {
      console.log('[bungie-news] Probeer:', url);

      const r = await fetch(url, {
        headers: {
          'X-API-Key': API_KEY,
          'User-Agent': 'GuardianHQ/1.0',
          'Accept': 'application/json, application/rss+xml, text/xml, */*',
          // Voorkom dat Bungie zelf ook een gecachte response stuurt
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!r.ok) {
        console.warn('[bungie-news]', url, '→ HTTP', r.status);
        continue;
      }

      const raw = await r.text();
      console.log('[bungie-news] Preview:', raw.slice(0, 300));

      let items = [];

      if (raw.trim().startsWith('{')) {
        // JSON wrapper van Bungie Platform API
        const json = JSON.parse(raw);
        if (json.ErrorCode && json.ErrorCode !== 1) {
          console.warn('[bungie-news] Bungie fout:', json.ErrorCode, json.Message);
          continue;
        }
        // Response is een string met RSS XML erin
        const xmlStr = typeof json.Response === 'string' ? json.Response : '';
        if (xmlStr) items = parseRss(xmlStr);
      } else if (raw.trim().startsWith('<')) {
        // Directe RSS/XML
        items = parseRss(raw);
      }

      console.log('[bungie-news] Items gevonden:', items.length, 'via', url);

      if (items.length > 0) {
        return res.status(200).json({
          results: items,
          source: url,
          fetchedAt: new Date().toISOString()
        });
      }

    } catch (err) {
      console.error('[bungie-news] Fout bij', url, ':', err.message);
    }
  }

  return res.status(200).json({ results: [], error: 'Geen nieuws beschikbaar' });
}

function parseRss(xml) {
  const items = [];
  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  for (const m of blocks) {
    const b = m[1];
    const get = tag => {
      const re = new RegExp(
        '<' + tag + '[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/' + tag + '>|' +
        '<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>',
        'i'
      );
      const match = b.match(re);
      return match ? (match[1] ?? match[2] ?? '').trim() : '';
    };

    const title = get('title');
    if (!title) continue;

    // Link ophalen — staat soms als tekst node
    let rawUrl = get('link');
    if (!rawUrl) {
      const lm = b.match(/<link\s*\/?>(.*?)<\/?link>/i) || b.match(/<link[^>]*>([^<]+)/i);
      rawUrl = lm ? lm[1].trim() : '';
    }
    const url = rawUrl
      ? (rawUrl.startsWith('http') ? rawUrl : 'https://www.bungie.net' + rawUrl)
      : 'https://www.bungie.net/7/en/rss/News';

    const enc = b.match(/<enclosure[^>]+url="([^"]+)"/i);
    const med = b.match(/<media:content[^>]+url="([^"]+)"/i);
    const image = enc?.[1] || med?.[1] || '';

    const desc = get('description').replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').trim().slice(0, 150);

    items.push({
      Subject: title,
      CreationDate: get('pubDate'),
      Url: url,
      Image: image,
      Subtitle: desc,
      Content: { properties: { Title: title } }
    });
  }
  return items;
}
