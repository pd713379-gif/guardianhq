// ============================================================
// GUARDIANHQ — api/bungie-proxy.js
// Vercel Serverless Function — Avatar + Weapon icon + Character gear proxy
// ============================================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.BUNGIE_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'BUNGIE_API_KEY ontbreekt.' });
  }

  const { action } = req.query;

  // ── HELPER: Bungie API fetch ────────────────────────────────
  async function bFetch(url, accessToken) {
    const headers = { 'X-API-Key': API_KEY };
    if (accessToken) headers['Authorization'] = 'Bearer ' + accessToken;
    const r = await fetch('https://www.bungie.net/Platform' + url, { headers });
    const d = await r.json();
    if (!r.ok || (d.ErrorCode && d.ErrorCode !== 1)) {
      throw new Error(d.Message || `Bungie API ${r.status}`);
    }
    return d.Response;
  }

  // ── AVATAR ─────────────────────────────────────────────────
  if (action === 'avatar') {
    try {
      const searchData = await fetch(
        'https://www.bungie.net/Platform/User/Search/GlobalName/0/',
        { method:'POST', headers:{'X-API-Key':API_KEY,'Content-Type':'application/json'}, body:JSON.stringify({displayNamePrefix:'RemaisNL'}) }
      ).then(r => r.json());

      const users = searchData?.Response?.searchResults ?? [];
      const match = users.find(u => u.bungieGlobalDisplayName?.toLowerCase() === 'remaisnl') ?? users[0];
      if (match?.destinyMemberships?.[0]) {
        const dm = match.destinyMemberships[0];
        const profileData = await fetch(
          `https://www.bungie.net/Platform/Destiny2/${dm.membershipType}/Profile/${dm.membershipId}/?components=100`,
          { headers:{'X-API-Key':API_KEY} }
        ).then(r => r.json());
        const iconPath = profileData?.Response?.profile?.data?.userInfo?.iconPath;
        if (iconPath) return res.status(200).json({
          avatarUrl: 'https://www.bungie.net' + iconPath,
          displayName: match.bungieGlobalDisplayName + '#' + String(match.bungieGlobalDisplayNameCode ?? '').padStart(4,'0'),
        });
      }
      return res.status(200).json({ avatarUrl: null });
    } catch(err) {
      return res.status(200).json({ avatarUrl: null });
    }
  }

  // ── WEAPON ICONS (wishlist) ─────────────────────────────────
  if (action === 'weaponicons') {
    const HASHES = {
      palindrome:1912364120, igneous:2314610827, retrofit:3103325054,
      apex:1851777734, fallingGuillotine:1815105249, wishEnder:814876684, likelySuspect:1994645182,
    };
    const icons = {};
    await Promise.allSettled(Object.entries(HASHES).map(async ([key, hash]) => {
      try {
        const r = await fetch(`https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/${hash}/`, { headers:{'X-API-Key':API_KEY} });
        const d = await r.json();
        const iconPath = d?.Response?.displayProperties?.icon;
        icons[key] = iconPath ? 'https://www.bungie.net' + iconPath : null;
      } catch { icons[key] = null; }
    }));
    res.setHeader('Cache-Control', 's-maxage=86400');
    return res.status(200).json(icons);
  }

  // ── CHARACTER GEAR (live, vereist access token) ─────────────
  // GET /api/bungie-proxy?action=charactergear
  // Header: Authorization: Bearer <access_token>
  if (action === 'charactergear') {
    const authHeader = req.headers['authorization'] || '';
    const accessToken = authHeader.replace('Bearer ', '').trim();
    if (!accessToken) return res.status(401).json({ error: 'Access token vereist' });

    try {
      // 1. Haal memberships op
      const user = await bFetch('/User/GetMembershipsForCurrentUser/', accessToken);
      const memberships = user?.destinyMemberships ?? [];
      let primary = memberships[0];
      for (const m of memberships) {
        if (m.crossSaveOverride === m.membershipType) { primary = m; break; }
      }
      if (!primary) return res.status(404).json({ error: 'Geen Destiny membership gevonden' });

      const mType = primary.membershipType;
      const mId   = primary.membershipId;

      // 2. Haal profiel op: characters (200) + equipment (205) + item instances (300)
      const profile = await bFetch(
        `/Destiny2/${mType}/Profile/${mId}/?components=200,205,300`,
        accessToken
      );

      const charsData    = profile?.characters?.data     ?? {};
      const equipData    = profile?.characterEquipment?.data ?? {};
      const instanceData = profile?.itemComponents?.instances?.data ?? {};

      // 3. Verzamel alle unieke item hashes
      const allHashes = new Set();
      for (const charEquip of Object.values(equipData)) {
        for (const item of (charEquip.items ?? [])) {
          if (item.itemHash) allHashes.add(item.itemHash);
        }
      }

      // 4. Haal item definities parallel op (max 20 gelijktijdig)
      const hashArr = [...allHashes];
      const defs = {};
      const CHUNK = 20;
      for (let i = 0; i < hashArr.length; i += CHUNK) {
        const chunk = hashArr.slice(i, i + CHUNK);
        await Promise.allSettled(chunk.map(async hash => {
          try {
            const r = await fetch(
              `https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/${hash}/`,
              { headers: { 'X-API-Key': API_KEY } }
            );
            const d = await r.json();
            if (d?.Response) defs[hash] = d.Response;
          } catch {}
        }));
      }

      // 5. Bouw karakter response op
      const classNames = { 0:'Titan', 1:'Hunter', 2:'Warlock' };

      // Subclass element detectie via item category hashes
      const ELEMENT_BY_HASH = {
        // Arc subclasses
        2328211300:'arc', 3006627468:'arc', 1751782730:'arc', 2958378809:'arc',
        // Solar
        2240888816:'solar', 3941205951:'solar', 2550323932:'solar',
        // Void
        2453351420:'void', 3887892656:'void', 2842471112:'void',
        // Stasis
        873720784:'stasis', 3291545503:'stasis', 2842471113:'stasis',
        // Strand
        2932390016:'strand', 613647897:'strand', 242419885:'strand',
        // Prismatic
        3855807587:'prismatic', 1216399026:'prismatic', 3452049687:'prismatic',
      };

      // Subclass namen
      const SUBCLASS_NAMES = {
        2328211300:'Arc Strider', 3006627468:'Stormcaller', 1751782730:'Striker',
        2240888816:'Gunslinger',  3941205951:'Dawnblade',   2550323932:'Sunbreaker',
        2453351420:'Nightstalker',3887892656:'Voidwalker',  2842471112:'Sentinel',
        873720784: 'Revenant',    3291545503:'Shadebinder', 2842471113:'Behemoth',
        2932390016:'Threadrunner',613647897: 'Broodweaver', 242419885: 'Berserker',
        3855807587:'Prismatic Hunter',1216399026:'Prismatic Warlock',3452049687:'Prismatic Titan',
      };

      // Armor/weapon bucket hashes
      const WEAPON_BUCKETS = new Set([1498876634, 2465295065, 953998645]);
      const ARMOR_BUCKETS  = new Set([3448274439, 3551918588, 14239492, 20886954, 1585787867]);
      const SUBCLASS_BUCKET = 3284755031;

      const WEAPON_SLOT_NAMES = { 1498876634:'Kinetisch', 2465295065:'Energie', 953998645:'Zwaar' };
      const ARMOR_SLOT_NAMES  = { 3448274439:'Helm', 3551918588:'Gauntlets', 14239492:'Borst', 20886954:'Benen', 1585787867:'Class Item' };

      const characters = [];

      for (const [charId, char] of Object.entries(charsData)) {
        const charItems = equipData[charId]?.items ?? [];

        // Subclass
        const subclassRaw = charItems.find(i => i.bucketHash === SUBCLASS_BUCKET);
        const subclassHash = subclassRaw?.itemHash;
        const subclassDef  = subclassDef ? defs[subclassHash] : null;
        const element      = ELEMENT_BY_HASH[subclassHash] ?? 'void';
        const subclassName = SUBCLASS_NAMES[subclassHash] ?? (defs[subclassHash]?.displayProperties?.name ?? 'Subclass');
        // Subclass icon van manifest
        const subclassIcon = defs[subclassHash]?.displayProperties?.icon
          ? 'https://www.bungie.net' + defs[subclassHash].displayProperties.icon
          : null;

        // Wapens
        const weapons = charItems
          .filter(i => WEAPON_BUCKETS.has(i.bucketHash))
          .map(i => {
            const def      = defs[i.itemHash] ?? {};
            const instance = instanceData[i.itemInstanceId] ?? {};
            return {
              itemHash:    i.itemHash,
              instanceId:  i.itemInstanceId,
              bucketHash:  i.bucketHash,
              slotName:    WEAPON_SLOT_NAMES[i.bucketHash] ?? 'Wapen',
              name:        def.displayProperties?.name ?? 'Wapen',
              icon:        def.displayProperties?.icon ? 'https://www.bungie.net' + def.displayProperties.icon : null,
              tierType:    def.inventory?.tierType ?? 5,
              tierName:    def.inventory?.tierTypeName ?? 'Legendary',
              damageType:  instance.primaryStat?.value ?? 0,
              power:       instance.primaryStat?.value ?? 0,
              isExotic:    (def.inventory?.tierType ?? 5) === 6,
            };
          });

        // Armor
        const armor = charItems
          .filter(i => ARMOR_BUCKETS.has(i.bucketHash))
          .map(i => {
            const def      = defs[i.itemHash] ?? {};
            const instance = instanceData[i.itemInstanceId] ?? {};
            return {
              itemHash:   i.itemHash,
              instanceId: i.itemInstanceId,
              bucketHash: i.bucketHash,
              slotName:   ARMOR_SLOT_NAMES[i.bucketHash] ?? 'Armor',
              name:       def.displayProperties?.name ?? 'Armor',
              icon:       def.displayProperties?.icon ? 'https://www.bungie.net' + def.displayProperties.icon : null,
              tierType:   def.inventory?.tierType ?? 5,
              tierName:   def.inventory?.tierTypeName ?? 'Legendary',
              power:      instance.primaryStat?.value ?? 0,
              isExotic:   (def.inventory?.tierType ?? 5) === 6,
            };
          });

        characters.push({
          charId,
          className:     classNames[char.classType] ?? 'Guardian',
          classType:     char.classType,
          light:         char.light ?? 0,
          emblemIcon:    char.emblemPath            ? 'https://www.bungie.net' + char.emblemPath            : null,
          emblemBg:      char.emblemBackgroundPath  ? 'https://www.bungie.net' + char.emblemBackgroundPath  : null,
          subclass: {
            hash:    subclassHash,
            name:    subclassName,
            element: element,
            icon:    subclassIcon,
          },
          weapons,
          armor,
        });
      }

      // Sorteer Hunter, Warlock, Titan
      const ORDER = ['Hunter','Warlock','Titan'];
      characters.sort((a,b) => ORDER.indexOf(a.className) - ORDER.indexOf(b.className));

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ characters });

    } catch(err) {
      console.error('[charactergear]', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Onbekende actie.' });
}
