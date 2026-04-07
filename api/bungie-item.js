// ============================================================
// GUARDIANHQ — api/bungie-item.js
// Vercel Serverless Function — Bungie Manifest item lookup
// Geeft iconPath + tier terug voor een item hash
// Gebruik: /api/bungie-item?hash=432476743
// ============================================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.BUNGIE_API_KEY;
  const hash    = req.query?.hash ?? req.url?.split('hash=')[1]?.split('&')[0];

  if (!hash) {
    return res.status(400).json({ error: 'hash parameter ontbreekt' });
  }

  try {
    const manifestRes = await fetch(
      `https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/${hash}/`,
      { headers: { 'X-API-Key': API_KEY } }
    );
    const manifestData = await manifestRes.json();
    const item = manifestData?.Response;

    if (!item) {
      return res.status(404).json({ error: 'Item niet gevonden' });
    }

    const iconPath = item.displayProperties?.icon ?? null;
    const tier     = item.inventory?.tierTypeName ?? null;

    // Cache 24 uur — item iconen veranderen nooit
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
    return res.status(200).json({ iconPath, tier, name: item.displayProperties?.name ?? null });

  } catch (err) {
    console.error('[bungie-item] Fout:', err.message);
    return res.status(500).json({ error: 'Bungie API fout', detail: err.message });
  }
}

