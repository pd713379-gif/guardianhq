// ============================================================
// GUARDIANHQ — api/bungie-news.js
// Vercel Serverless Function
//
// Gebruikt de OFFICIËLE nieuwe Bungie RSS endpoint:
//   GET /Platform/Content/Rss/NewsArticles/{pageToken}/
//   ?categoryfilter=destiny2  ← alleen Destiny 2 nieuws
//
// Deze endpoint geeft een RSS XML string terug (niet JSON).
// We parsen de XML en sturen JSON terug naar de frontend.
// ============================================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.BUNGIE_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'BUNGIE_API_KEY ontbreekt.' });
  }

  // Probeer eerst met categoryfilter=destiny2, dan zonder filter (alles)
  const urlsToTry = [
    'https://www.bungie.net/Platform/Content/Rss/NewsArticles/0/?categoryfilter=destiny2&includebody=false',
    'https://www.bungie.net/Platform/Content/Rss/NewsArticles/0/?includebody=false',
  ];

  for (const url of urlsToTry) {
    try {
      console.log('[bungie-news] Probeer:', url);

      const r = await fetch(url, {
        headers: {
          'X-API-Key': API_KEY,
          'User-Agent': 'GuardianHQ/1.0',
          'Accept': 'application/json, application/rss+xml, text/xml, */*'
        }
      });

      const raw = await r.text();
      console.log('[bungie-news] Status:', r.status, '| Eerste 200 tekens:', raw.slice(0, 200));

      if (!r.ok) continue;

      // De response kan JSON zijn (met RSS string erin) of pure XML
      let xmlText = '';

      if (raw.trim().startsWith('{')) {
        // JSON wrapper — de RSS zit als string in Response veld
        try {
          const json = JSON.parse(raw);
          if (json.ErrorCode && json.ErrorCode !== 1) {
            console.warn('[bungie-news] Bungie ErrorCode:', json.ErrorCode, json.Message);
            continue;
          }
          // Response is een string met RSS XML erin
          xmlText = typeof json.Response === 'string' ? json.Response : JSON.stringify(json.Response);
        } catch (e) {
          console.warn('[bungie-news] JSON parse fout:', e.message);
          continue;
        }
      } else if (raw.trim().startsWith('<')) {
        // Pure XML/RSS
        xmlText = raw;
      } else {
        console.warn('[bungie-news] Onbekend formaat, sla over');
        continue;
      }

      // Parse de RSS XML
      const items = parseRssItems(xmlText);
      console.log('[bungie-news] Geparseerde items:', items.length);

      if (items.length > 0) {
        res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60');
        return res.status(200).json({ results: items, source: url });
      }

    } catch (err) {
      console.warn('[bungie-news] Fout bij', url, ':', err.message);
    }
  }

  // Alle pogingen mislukt — stuur lege lijst
  console.error('[bungie-news] Alle endpoints mislukt');
  return res.status(200).json({ results: [], source: 'none', error: 'Geen nieuws beschikbaar' });
}

// ── RSS XML parser ─────────────────────────────────────────
function parseRssItems(xml) {
  const items = [];

  // Haal alle <item> blokken op
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  for (const match of itemMatches) {
    const block = match[1];

    // Helper: haal waarde op uit XML tag (met of zonder CDATA)
    const get = (tag) => {
      const re = new RegExp(
        '<' + tag + '[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/' + tag + '>|' +
        '<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>',
        'i'
      );
      const m = block.match(re);
      return m ? (m[1] ?? m[2] ?? '').trim() : '';
    };

    const title = get('title');
    if (!title) continue;

    // URL: <link> tag in RSS staat soms tussen andere tags, haal hem goed op
    let rawUrl = get('link');
    // Soms staat link als tekst node na </title> zonder echte tag
    if (!rawUrl) {
      const linkMatch = block.match(/<link>(.*?)<\/link>/i) || block.match(/<link\s*\/?>([^<]+)/i);
      rawUrl = linkMatch ? linkMatch[1].trim() : '';
    }
    const articleUrl = rawUrl
      ? (rawUrl.startsWith('http') ? rawUrl : 'https://www.bungie.net' + rawUrl)
      : 'https://www.bungie.net/7/en/News';

    // Afbeelding uit enclosure of media:content
    const enclosure = block.match(/<enclosure[^>]+url="([^"]+)"/i);
    const mediaUrl  = block.match(/<media:content[^>]+url="([^"]+)"/i);
    const image     = (enclosure?.[1]) || (mediaUrl?.[1]) || '';

    // Beschrijving/subtitel (HTML strippen)
    const desc = get('description').replace(/<[^>]+>/g, '').trim().slice(0, 150);

    items.push({
      Subject:      title,
      CreationDate: get('pubDate'),
      Url:          articleUrl,
      Image:        image,
      Subtitle:     desc,
      Content: { properties: { Title: title } }
    });
  }

  return items;
}
