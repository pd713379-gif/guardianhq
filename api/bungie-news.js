// ============================================================
// GUARDIANHQ — api/bungie-news.js
// Vercel Serverless Function — Bungie Nieuws
//
// Volgorde van proberen:
//   1. /Platform/Content/Rss/NewsArticle/1/  ← NIEUWSTE endpoint (alle games)
//   2. /Platform/Content/GetContentByTagAndType/  ← oude endpoint (backup)
//   3. /en/Rss/NewsByCategory  ← oude RSS (laatste redmiddel)
// ============================================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.BUNGIE_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'BUNGIE_API_KEY ontbreekt in omgevingsvariabelen.' });
  }

  // ── 1. Nieuwe RSS NewsArticle endpoint (Bungie + Marathon nieuws) ──
  try {
    // categoryfilter: leeg = alle categorieën (Destiny2, Marathon, etc.)
    // includebody=false = sneller, we hebben alleen titel/datum/url nodig
    const url = 'https://www.bungie.net/Platform/Content/Rss/NewsArticle/1/?categoryfilter=&includebody=false';
    console.log('[bungie-news] Probeer nieuwe RSS endpoint:', url);

    const r = await fetch(url, {
      headers: {
        'X-API-Key': API_KEY,
        'User-Agent': 'GuardianHQ/1.0',
        'Accept': 'application/json'
      }
    });

    const data = await r.json();
    console.log('[bungie-news] Nieuwe RSS status:', r.status, '| ErrorCode:', data.ErrorCode);

    if (r.ok && data.ErrorCode === 1 && data.Response) {
      const feed = data.Response;
      // De response is een RSS-achtige structuur via JSON
      // items zitten in feed.NewsArticles of feed.results of feed.items
      const articles = feed.NewsArticles || feed.results || feed.items || [];
      console.log('[bungie-news] Nieuwe RSS artikelen:', articles.length);

      if (articles.length > 0) {
        const items = articles.slice(0, 10).map(a => {
          const props = a.properties || a.Properties || {};
          const image = props.ArticleBanner || props.HighResImage || props.FeaturedImage
                     || a.imagePath || a.ImagePath || '';
          const subtitle = props.Subtitle || props.Tagline || a.description || '';
          const rawUrl = a.link || a.Url || a.url || '';
          const articleUrl = rawUrl
            ? (rawUrl.startsWith('http') ? rawUrl : 'https://www.bungie.net' + rawUrl)
            : 'https://www.bungie.net/7/en/News';

          return {
            Subject: a.title || a.Title || a.subject || a.Subject || '',
            CreationDate: a.pubDate || a.PubDate || a.creationDate || a.CreationDate || '',
            Url: articleUrl,
            Image: image ? (image.startsWith('http') ? image : 'https://www.bungie.net' + image) : '',
            Subtitle: subtitle.replace ? subtitle.replace(/<[^>]+>/g, '').slice(0, 150) : '',
            Content: { properties: { Title: a.title || a.Title || a.subject || '' } }
          };
        });

        res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=60');
        return res.status(200).json({ results: items, source: 'rss-newsarticle-api' });
      }
    }
  } catch (e) {
    console.warn('[bungie-news] Nieuwe RSS endpoint fout:', e.message);
  }

  // ── 2. Oude GetContentByTagAndType (backup) ──
  try {
    const url2 = 'https://www.bungie.net/Platform/Content/GetContentByTagAndType/news/NewsArticle/en/?lc=en&fmt=json&head=false&currentpage=1&itemsperpage=10';
    console.log('[bungie-news] Probeer GetContentByTagAndType:', url2);

    const r2 = await fetch(url2, {
      headers: { 'X-API-Key': API_KEY, 'User-Agent': 'GuardianHQ/1.0', 'Accept': 'application/json' }
    });

    const data2 = await r2.json();
    console.log('[bungie-news] GetContentByTagAndType status:', r2.status, '| ErrorCode:', data2.ErrorCode);

    if (r2.ok && data2.ErrorCode === 1) {
      const results = data2.Response?.results || [];
      if (results.length > 0) {
        const items = results.slice(0, 10).map(item => {
          const props = item.properties || {};
          const image = props.ArticleBanner || props.HighResImage || props.FeaturedImage || '';
          const subtitle = props.Subtitle || props.Tagline || '';
          const rawUrl = item.url || '';
          const articleUrl = rawUrl
            ? (rawUrl.startsWith('http') ? rawUrl : 'https://www.bungie.net' + rawUrl)
            : 'https://www.bungie.net/7/en/News';

          return {
            Subject: item.subject || '',
            CreationDate: item.creationDate || '',
            Url: articleUrl,
            Image: image ? (image.startsWith('http') ? image : 'https://www.bungie.net' + image) : '',
            Subtitle: subtitle,
            Content: { properties: { Title: item.subject || '' } }
          };
        });

        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
        return res.status(200).json({ results: items, source: 'content-api' });
      }
    }
  } catch (e) {
    console.warn('[bungie-news] GetContentByTagAndType fout:', e.message);
  }

  // ── 3. Oude RSS feed (laatste redmiddel) ──
  try {
    const rssUrl = 'https://www.bungie.net/en/Rss/NewsByCategory?category=news&currentpage=1&itemsperpage=10';
    console.log('[bungie-news] Probeer oude RSS:', rssUrl);

    const rssRes = await fetch(rssUrl, {
      headers: { 'User-Agent': 'GuardianHQ/1.0', 'Accept': 'application/rss+xml, text/xml' }
    });

    const text = await rssRes.text();
    if (!rssRes.ok) throw new Error('RSS HTTP ' + rssRes.status);

    const items = [];
    const matches = text.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const m of matches) {
      const b = m[1];
      const get = tag => {
        const r = b.match(new RegExp('<' + tag + '[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/' + tag + '>|<' + tag + '[^>]*>([^<]*)<\\/' + tag + '>'));
        return r ? (r[1] || r[2] || '').trim() : '';
      };
      const enc = b.match(/<enclosure[^>]+url="([^"]+)"/);
      const med = b.match(/<media:content[^>]+url="([^"]+)"/);
      const image = (enc && enc[1]) || (med && med[1]) || '';
      const rawUrl = get('link');
      items.push({
        Subject: get('title'),
        CreationDate: get('pubDate'),
        Url: rawUrl ? (rawUrl.startsWith('http') ? rawUrl : 'https://www.bungie.net' + rawUrl) : 'https://www.bungie.net/7/en/News',
        Image: image,
        Subtitle: get('description').replace(/<[^>]+>/g, '').slice(0, 150),
        Content: { properties: { Title: get('title') } }
      });
    }

    console.log('[bungie-news] Oude RSS items:', items.length);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ results: items, source: 'rss-old' });

  } catch (e) {
    console.error('[bungie-news] Alle methodes mislukt:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
