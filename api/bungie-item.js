export default async function handler(req, res) {
  try {
    const hash = req.query.hash;
    if (!hash) {
      return res.status(400).json({ error: 'Missing hash' });
    }

    const apiKey = process.env.BUNGIE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'BUNGIE_API_KEY missing in Vercel env' });
    }

    const manifestRes = await fetch('https://www.bungie.net/Platform/Destiny2/Manifest/', {
      headers: { 'X-API-Key': apiKey }
    });

    const manifestData = await manifestRes.json();

    const itemPath = manifestData?.Response?.jsonWorldComponentContentPaths?.en?.DestinyInventoryItemDefinition;
    if (!itemPath) {
      return res.status(500).json({ error: 'Manifest item definition path not found' });
    }

    const dbUrl = 'https://www.bungie.net' + itemPath;
    const dbRes = await fetch(dbUrl);
    const db = await dbRes.json();

    const item = db[String(hash)];
    if (!item) {
      return res.status(404).json({ error: 'Item not found', hash });
    }

    const tier = item?.inventory?.tierTypeName || null;

    return res.status(200).json({
      hash: Number(hash),
      name: item.displayProperties?.name || null,
      iconPath: item.displayProperties?.icon || null,
      tier,
      itemType: item.itemTypeDisplayName || null
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
}
