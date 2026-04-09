// ============================================================
// GUARDIANHQ — api/bungie-proxy.js  (v3 — geen manifest timeout)
// ============================================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.BUNGIE_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'BUNGIE_API_KEY ontbreekt.' });

  const { action } = req.query;

  // ── Helper ─────────────────────────────────────────────────
  async function bFetch(url, token) {
    const h = { 'X-API-Key': API_KEY };
    if (token) h['Authorization'] = 'Bearer ' + token;
    const r = await fetch('https://www.bungie.net/Platform' + url, { headers: h });
    const d = await r.json();
    if (!r.ok || (d.ErrorCode && d.ErrorCode !== 1)) throw new Error(d.Message || 'Bungie ' + r.status);
    return d.Response;
  }

  // ── AVATAR ─────────────────────────────────────────────────
  if (action === 'avatar') {
    try {
      const sd = await fetch('https://www.bungie.net/Platform/User/Search/GlobalName/0/', {
        method: 'POST', headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayNamePrefix: 'RemaisNL' })
      }).then(r => r.json());
      const match = (sd?.Response?.searchResults ?? []).find(u => u.bungieGlobalDisplayName?.toLowerCase() === 'remaisnl') ?? sd?.Response?.searchResults?.[0];
      if (match?.destinyMemberships?.[0]) {
        const dm = match.destinyMemberships[0];
        const pd = await fetch(`https://www.bungie.net/Platform/Destiny2/${dm.membershipType}/Profile/${dm.membershipId}/?components=100`, { headers: { 'X-API-Key': API_KEY } }).then(r => r.json());
        const icon = pd?.Response?.profile?.data?.userInfo?.iconPath;
        if (icon) return res.status(200).json({ avatarUrl: 'https://www.bungie.net' + icon, displayName: match.bungieGlobalDisplayName + '#' + String(match.bungieGlobalDisplayNameCode ?? '').padStart(4, '0') });
      }
      return res.status(200).json({ avatarUrl: null });
    } catch { return res.status(200).json({ avatarUrl: null }); }
  }

  // ── WEAPON ICONS (wishlist) ─────────────────────────────────
  if (action === 'weaponicons') {
    const HASHES = { palindrome:1912364120, igneous:2314610827, retrofit:3103325054, apex:1851777734, fallingGuillotine:1815105249, wishEnder:814876684, likelySuspect:1994645182 };
    const icons = {};
    await Promise.allSettled(Object.entries(HASHES).map(async ([k, h]) => {
      try {
        const r = await fetch(`https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/${h}/`, { headers: { 'X-API-Key': API_KEY } });
        const d = await r.json();
        icons[k] = d?.Response?.displayProperties?.icon ? 'https://www.bungie.net' + d.Response.displayProperties.icon : null;
      } catch { icons[k] = null; }
    }));
    res.setHeader('Cache-Control', 's-maxage=86400');
    return res.status(200).json(icons);
  }

  // ── CHARACTER GEAR ─────────────────────────────────────────
  if (action === 'charactergear') {
    const token = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Token vereist' });

    try {
      // 1. Memberships
      const user = await bFetch('/User/GetMembershipsForCurrentUser/', token);
      const mems = user?.destinyMemberships ?? [];
      let primary = mems[0];
      for (const m of mems) { if (m.crossSaveOverride === m.membershipType) { primary = m; break; } }
      if (!primary) return res.status(404).json({ error: 'Geen Destiny membership' });

      const mType = primary.membershipType;
      const mId   = primary.membershipId;

      // 2. Profile: chars (200) + equipment (205) + instances (300)
      const profile = await bFetch(`/Destiny2/${mType}/Profile/${mId}/?components=200,205,300`, token);

      const charsData    = profile?.characters?.data ?? {};
      const equipData    = profile?.characterEquipment?.data ?? {};
      const instanceData = profile?.itemComponents?.instances?.data ?? {};

      // 3. Verzamel alleen relevante hashes (subclass + wapens + armor, max ~20)
      const RELEVANT_BUCKETS = new Set([
        3284755031,              // subclass
        1498876634, 2465295065, 953998645,   // weapons
        3448274439, 3551918588, 14239492, 20886954, 1585787867, // armor
      ]);
      const allHashes = new Set();
      for (const charEquip of Object.values(equipData)) {
        for (const item of (charEquip.items ?? [])) {
          if (RELEVANT_BUCKETS.has(item.bucketHash)) allHashes.add(item.itemHash);
        }
      }

      // 4. Manifest parallel ophalen — alle ~18 items tegelijk (elk 4s timeout)
      const defs = {};
      await Promise.allSettled([...allHashes].map(async hash => {
        try {
          const ctrl = new AbortController();
          const tid  = setTimeout(() => ctrl.abort(), 5000);
          const r = await fetch(
            `https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/${hash}/`,
            { headers: { 'X-API-Key': API_KEY }, signal: ctrl.signal }
          );
          clearTimeout(tid);
          const d = await r.json();
          if (d?.Response) defs[hash] = d.Response;
        } catch {}
      }));

      // 5. Lookup tabellen
      const CLASS_NAMES   = { 0:'Titan', 1:'Hunter', 2:'Warlock' };
      const ELEMENT_MAP   = {
        2328211300:'arc',  3006627468:'arc',  1751782730:'arc',  2958378809:'arc',
        2240888816:'solar',3941205951:'solar',2550323932:'solar',
        2453351420:'void', 3887892656:'void', 2842471112:'void',
        873720784:'stasis',3291545503:'stasis',2842471113:'stasis',
        2932390016:'strand',613647897:'strand',242419885:'strand',
        3855807587:'prismatic',1216399026:'prismatic',3452049687:'prismatic',
      };
      const SUBCLASS_NAMES = {
        2328211300:'Arc Strider',  3006627468:'Stormcaller', 1751782730:'Striker',     2958378809:'Arc Striker',
        2240888816:'Gunslinger',   3941205951:'Dawnblade',   2550323932:'Sunbreaker',
        2453351420:'Nightstalker', 3887892656:'Voidwalker',  2842471112:'Sentinel',
        873720784:'Revenant',      3291545503:'Shadebinder', 2842471113:'Behemoth',
        2932390016:'Threadrunner', 613647897:'Broodweaver',  242419885:'Berserker',
        3855807587:'Prismatic Hunter',1216399026:'Prismatic Warlock',3452049687:'Prismatic Titan',
      };
      const WEAPON_BUCKETS = new Set([1498876634, 2465295065, 953998645]);
      const ARMOR_BUCKETS  = new Set([3448274439, 3551918588, 14239492, 20886954, 1585787867]);
      const SUBCLASS_BUCKET = 3284755031;
      const SLOT_NAMES = {
        1498876634:'Kinetisch', 2465295065:'Energie', 953998645:'Zwaar',
        3448274439:'Helm', 3551918588:'Gauntlets', 14239492:'Borst', 20886954:'Benen', 1585787867:'Class Item',
      };

      // 6. Bouw karakters op
      const characters = [];
      for (const [charId, char] of Object.entries(charsData)) {
        const items = equipData[charId]?.items ?? [];

        // Subclass
        const scRaw  = items.find(i => i.bucketHash === SUBCLASS_BUCKET);
        const scHash = scRaw?.itemHash;
        const scDef  = defs[scHash];
        const subclass = {
          hash:    scHash,
          name:    SUBCLASS_NAMES[scHash] ?? scDef?.displayProperties?.name ?? 'Subclass',
          element: ELEMENT_MAP[scHash] ?? 'void',
          icon:    scDef?.displayProperties?.icon ? 'https://www.bungie.net' + scDef.displayProperties.icon : null,
        };

        // Wapens
        const weapons = items.filter(i => WEAPON_BUCKETS.has(i.bucketHash)).map(i => {
          const def = defs[i.itemHash] ?? {};
          const ins = instanceData[i.itemInstanceId] ?? {};
          return {
            bucketHash: i.bucketHash,
            slotName:   SLOT_NAMES[i.bucketHash] ?? 'Wapen',
            name:       def.displayProperties?.name ?? SLOT_NAMES[i.bucketHash] ?? 'Wapen',
            icon:       def.displayProperties?.icon ? 'https://www.bungie.net' + def.displayProperties.icon : null,
            tierType:   def.inventory?.tierType ?? 5,
            isExotic:   (def.inventory?.tierType ?? 5) === 6,
            power:      ins.primaryStat?.value ?? 0,
          };
        });

        // Armor
        const armor = items.filter(i => ARMOR_BUCKETS.has(i.bucketHash)).map(i => {
          const def = defs[i.itemHash] ?? {};
          const ins = instanceData[i.itemInstanceId] ?? {};
          return {
            bucketHash: i.bucketHash,
            slotName:   SLOT_NAMES[i.bucketHash] ?? 'Armor',
            name:       def.displayProperties?.name ?? SLOT_NAMES[i.bucketHash] ?? 'Armor',
            icon:       def.displayProperties?.icon ? 'https://www.bungie.net' + def.displayProperties.icon : null,
            tierType:   def.inventory?.tierType ?? 5,
            isExotic:   (def.inventory?.tierType ?? 5) === 6,
            power:      ins.primaryStat?.value ?? 0,
          };
        });

        characters.push({
          charId,
          className: CLASS_NAMES[char.classType] ?? 'Guardian',
          classType: char.classType,
          light:     char.light ?? 0,
          emblemBg:  char.emblemBackgroundPath ? 'https://www.bungie.net' + char.emblemBackgroundPath : null,
          subclass, weapons, armor,
        });
      }

      const ORDER = ['Hunter','Warlock','Titan'];
      characters.sort((a,b) => ORDER.indexOf(a.className) - ORDER.indexOf(b.className));

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ characters });

    } catch(err) {
      console.error('[charactergear] FATAL:', err.message, err.stack);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Onbekende actie.' });
}
