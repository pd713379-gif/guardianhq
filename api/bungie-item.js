export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.BUNGIE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'BUNGIE_API_KEY ontbreekt op de server' });
  }

  const hash = req.query.hash;

  if (!hash) {
    return res.status(400).json({ error: 'Missing item hash' });
  }

  try {
    const response = await fetch(
      'https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/' + hash + '/',
      {
        headers: {
          'X-API-Key': API_KEY
        }
      }
    );

    const data = await response.json();

    if (!response.ok || !data.Response) {
      return res.status(404).json({ error: 'Item not found', hash });
    }

    const item = data.Response;

    return res.status(200).json({
      hash: item.hash,
      name: item.displayProperties?.name || 'Unknown Item',
      iconPath: item.displayProperties?.icon || null,
      tier: item.inventory?.tierTypeName || 'Unknown',
      itemType: item.itemTypeDisplayName || 'Unknown'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch item from Bungie API',
      details: error.message
    });
  }
}
