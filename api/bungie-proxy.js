
// ============================================================
// GUARDIANHQ — api/bungie-proxy.js
// Vercel Serverless Function — Avatar + Weapon icon proxy
// Alle Bungie Platform calls lopen via de server (geen CORS problemen)
// ============================================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.BUNGIE_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'BUNGIE_API_KEY ontbreekt in omgevingsvariabelen.' });
  }

  const { action } = req.query;

  // ── AVATAR ophalen voor RemaisNL ──────────────────────────
  if (action === 'avatar') {
    try {
      // Zoek het account op via de exacte Bungie naam
      const searchRes = await fetch(
        'https://www.bungie.net/Platform/User/Search/GlobalName/0/',
        {
          method: 'POST',
          headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayNamePrefix: 'RemaisNL' })
        }
      );
      const searchData = await searchRes.json();
      const users = searchData?.Response?.searchResults ?? [];

      // Zoek exacte match op displayName
      const match = users.find(u =>
        u.bungieGlobalDisplayName?.toLowerCase() === 'remaisnl'
      ) ?? users[0];

      if (match) {
        // Haal profielfoto op (profilePicturePath van bungieNetUserInfo)
        const profilePicPath = match.bungieNetMembershipId
          ? null
          : null;

        // Probeer via destinyMemberships het embleem te pakken
        const destinyMember = match.destinyMemberships?.[0];
        if (destinyMember) {
          const profileRes = await fetch(
            `https://www.bungie.net/Platform/Destiny2/${destinyMember.membershipType}/Profile/${destinyMember.membershipId}/?components=100`,
            { headers: { 'X-API-Key': API_KEY } }
          );
          const profileData = await profileRes.json();
          const iconPath = profileData?.Response?.profile?.data?.userInfo?.iconPath;
          if (iconPath) {
            return res.status(200).json({
              avatarUrl: 'https://www.bungie.net' + iconPath,
              displayName: match.bungieGlobalDisplayName + '#' + String(match.bungieGlobalDisplayNameCode ?? '').padStart(4, '0'),
            });
          }
        }

        // Fallback: profilePicturePath direct op de user
        const picPath = match.bungieNetUserInfo?.iconPath ?? match.iconPath;
        if (picPath) {
          return res.status(200).json({
            avatarUrl: 'https://www.bungie.net' + picPath,
            displayName: match.bungieGlobalDisplayName,
          });
        }
      }

      // Kon geen avatar vinden — stuur lege response, client gebruikt fallback
      return res.status(200).json({ avatarUrl: null });

    } catch (err) {
      console.error('[bungie-proxy/avatar] Fout:', err.message);
      return res.status(200).json({ avatarUrl: null });
    }
  }

  // ── WEAPON ICONS ophalen via hash ──────────────────────────
  if (action === 'weaponicons') {
    // Weapon hashes voor de wishlist wapens
    const HASHES = {
      palindrome:        1912364120,  // The Palindrome
      igneous:           2314610827,  // Igneous Hammer — light.gg verified
      retrofit:          3103325054,  // Retrofit Escapade — light.gg verified
      apex:              1851777734,  // Apex Predator — light.gg verified
      fallingGuillotine: 1815105249,  // Falling Guillotine — light.gg verified
      wishEnder:          814876684,  // Wish-Ender — light.gg verified
      likelySuspect:     1994645182,  // Likely Suspect — light.gg verified
    };

    const icons = {};
    const entries = Object.entries(HASHES);

    // Haal alle wapen-definities parallel op
    await Promise.allSettled(
      entries.map(async ([key, hash]) => {
        try {
          const r = await fetch(
            `https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/${hash}/`,
            { headers: { 'X-API-Key': API_KEY } }
          );
          const d = await r.json();
          const iconPath = d?.Response?.displayProperties?.icon;
          if (iconPath) icons[key] = 'https://www.bungie.net' + iconPath;
          else icons[key] = null;
        } catch {
          icons[key] = null;
        }
      })
    );

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600'); // 24u cache
    return res.status(200).json(icons);
  }

  return res.status(400).json({ error: 'Onbekende actie. Gebruik ?action=avatar of ?action=weaponicons' });
}
