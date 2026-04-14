// ============================================================
// GUARDIANHQ — api/bungie-news.js
// Vercel Serverless Function — Bungie Content API (NewsArticle)
// Haalt nieuws op via dezelfde API als bungie.net/7/en/news
// ============================================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.BUNGIE_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'BUNGIE_API_KEY ontbreekt in omgevingsvariabelen.' });
  }

  try {
    // Officiële Bungie Content API — zelfde bron als bungie.net/7/en/news
    const url = 'https://www.bungie.net/Platform/Content/GetContentByTagAndType/news/NewsArticle/en/?lc=en&fmt=json&head=false&currentpage=1&itemsperpage=10';

    console.log('[bungie-news] Ophalen via Content API:', url);

    const bungieRes = await fetch(url, {
      headers: {
        'X-API-Key': API_KEY,
        'User-Agent': 'GuardianHQ/1.0',
        'Accept': 'application/json'
      }
    });

    const data = await bungieRes.json();
    console.log('[bungie-news] Status:', bungieRes.status, '| ErrorCode:', data.ErrorCode);

    if (!bungieRes.ok || data.ErrorCode !== 1) {
      console.warn('[bungie-news] Content API mislukt, probeer RSS fallback...');
      return await rssFallback(res);
    }

    const results = data.Response?.results || [];
    console.log('[bungie-news] Gevonden artikelen:', results.length);

    const items = results.map(item => {
      const props = item.properties || {};
      const image = props.ArticleBanner || props.HighResImage || props.FeaturedImage || '';
      const subtitle = props.Subtitle || props.Tagline || '';

      const articleUrl = item.url
        ? (item.url.startsWith('http') ? item.url : 'https://www.bungie.net' + item.url)
        : 'https://www.bungie.net/7/en/News';

      return {
        Subject: item.subject || '',
        CreationDate: item.creationDate || '',
        Url: articleUrl,
        Image: image ? (image.startsWith('http') ? image : 'https://www.bungie.net' + image) : '',
        Subtitle: subtitle,
        Tags: item.tags || '',
        Content: {
          properties: {
            Title: item.subject || '',
            Subtitle: subtitle
          }
        }
      };
    });

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ results: items, source: 'content-api' });

  } catch (err) {
    console.error('[bungie-news] Fout:', err.message);
    return await rssFallback(res);
  }
}

// ─── RSS Fallback ──────────────────────────────────────────
async function rssFallback(res) {
  try {
    const rssUrl = 'https://www.bungie.net/en/Rss/NewsByCategory?category=news&currentpage=1&itemsperpage=10';
    console.log('[bungie-news] RSS fallback:', rssUrl);

    const rssRes = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'GuardianHQ/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });

    const text = await rssRes.text();
    if (!rssRes.ok) {
      return res.status(500).json({ error: 'Bungie RSS gaf HTTP ' + rssRes.status });
    }

    const items = [];
    const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g);

    for (const match of itemMatches) {
      const block = match[1];
      const get = (tag) => {
        const m = block.match(new RegExp('<' + tag + '[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/' + tag + '>|<' + tag + '[^>]*>([^<]*)<\\/' + tag + '>'));
        return m ? (m[1] || m[2] || '').trim() : '';
      };

      const enclosure = block.match(/<enclosure[^>]+url="([^"]+)"/);
      const mediaContent = block.match(/<media:content[^>]+url="([^"]+)"/);
      const image = (enclosure && enclosure[1]) || (mediaContent && mediaContent[1]) || '';

      const rawUrl = get('link');
      const articleUrl = rawUrl
        ? (rawUrl.startsWith('http') ? rawUrl : 'https://www.bungie.net' + rawUrl)
        : 'https://www.bungie.net/7/en/News';

      items.push({
        Subject: get('title'),
        CreationDate: get('pubDate'),
        Url: articleUrl,
        Image: image,
        Subtitle: get('description').replace(/<[^>]+>/g, '').slice(0, 120),
        Content: {
          properties: {
            Title: get('title')
          }
        }
      });
    }

    console.log('[bungie-news] RSS items:', items.length);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ results: items, source: 'rss-fallback' });

  } catch (rssErr) {
    console.error('[bungie-news] RSS fallback fout:', rssErr.message);
    return res.status(500).json({ error: rssErr.message });
  }
}
