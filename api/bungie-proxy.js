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

  // ── AVATAR — dynamisch via OAuth token of via naam zoeken ──
  if (action === 'avatar') {
    const token = (req.headers['authorization'] || '').replace('Bearer ', '').trim();

    // Als OAuth token beschikbaar → gebruik dat (voor ingelogde gebruiker)
    if (token) {
      try {
        const user = await bFetch('/User/GetMembershipsForCurrentUser/', token);
        const mems = user?.destinyMemberships ?? [];
        let primary = mems[0];
        for (const m of mems) { if (m.crossSaveOverride === m.membershipType) { primary = m; break; } }
        if (primary) {
          const profile = await bFetch(`/Destiny2/${primary.membershipType}/Profile/${primary.membershipId}/?components=100`, token);
          const iconPath = profile?.profile?.data?.userInfo?.iconPath;
          const bungieUser = user?.bungieNetUser;
          const displayName = bungieUser
            ? (bungieUser.cachedBungieGlobalDisplayName || bungieUser.uniqueName || bungieUser.displayName) + (bungieUser.cachedBungieGlobalDisplayNameCode ? '#' + String(bungieUser.cachedBungieGlobalDisplayNameCode).padStart(4,'0') : '')
            : null;
          return res.status(200).json({
            avatarUrl:   iconPath ? 'https://www.bungie.net' + iconPath : null,
            displayName: displayName,
          });
        }
      } catch {}
      return res.status(200).json({ avatarUrl: null });
    }

    // Geen token → zoek op naam (publieke fallback, alleen als ?name= meegegeven)
    const searchName = req.query.name;
    if (searchName) {
      try {
        const sd = await fetch('https://www.bungie.net/Platform/User/Search/GlobalName/0/', {
          method: 'POST', headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayNamePrefix: searchName })
        }).then(r => r.json());
        const match = (sd?.Response?.searchResults ?? []).find(u => u.bungieGlobalDisplayName?.toLowerCase() === searchName.toLowerCase()) ?? sd?.Response?.searchResults?.[0];
        if (match?.destinyMemberships?.[0]) {
          const dm = match.destinyMemberships[0];
          const pd = await fetch(`https://www.bungie.net/Platform/Destiny2/${dm.membershipType}/Profile/${dm.membershipId}/?components=100`, { headers: { 'X-API-Key': API_KEY } }).then(r => r.json());
          const icon = pd?.Response?.profile?.data?.userInfo?.iconPath;
          if (icon) return res.status(200).json({
            avatarUrl: 'https://www.bungie.net' + icon,
            displayName: match.bungieGlobalDisplayName + '#' + String(match.bungieGlobalDisplayNameCode ?? '').padStart(4,'0'),
            membershipType: dm.membershipType,
            membershipId: dm.membershipId,
          });
        }
      } catch {}
    }
    return res.status(200).json({ avatarUrl: null });
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

      // 2. Profile: chars (200) + renders (204) + equipment (205) + instances (300) + sockets (302) + char stats (304) + plugs (309)
      const profile = await bFetch(`/Destiny2/${mType}/Profile/${mId}/?components=200,204,205,300,302,304,309`, token);

      const charsData      = profile?.characters?.data ?? {};
      const renderData     = profile?.characterRenderData?.data ?? {};
      const equipData      = profile?.characterEquipment?.data ?? {};
      const instanceData = profile?.itemComponents?.instances?.data ?? {};
      const plugsData    = profile?.itemComponents?.reusablePlugs?.data ?? {};
      const socketsData  = profile?.itemComponents?.sockets?.data ?? {};
      const statsData    = profile?.characterStats?.data ?? {};

      // 3. Verzamel relevante hashes
      const RELEVANT_BUCKETS = new Set([
        3284755031,                                                      // subclass
        1498876634, 2465295065, 953998645,                               // weapons
        3448274439, 3551918588, 14239492, 20886954, 1585787867,          // armor
      ]);
      const allHashes = new Set();
      const allPlugHashes = new Set();

      for (const charEquip of Object.values(equipData)) {
        for (const item of (charEquip.items ?? [])) {
          if (RELEVANT_BUCKETS.has(item.bucketHash)) {
            allHashes.add(item.itemHash);
            // Verzamel plug hashes voor mods via reusablePlugs (309)
            const plugs = plugsData[item.itemInstanceId]?.plugs ?? {};
            for (const plugArr of Object.values(plugs)) {
              for (const plug of plugArr) {
                if (plug.plugItemHash) allPlugHashes.add(plug.plugItemHash);
              }
            }
            // Verzamel socket plug hashes (302) — meer betrouwbaar voor uitgeruste mods
            const sockets = socketsData[item.itemInstanceId]?.sockets ?? [];
            for (const socket of sockets) {
              if (socket.plugHash) allPlugHashes.add(socket.plugHash);
            }
          }
        }
      }

      // 4. Manifest ophalen — alle items + plugs tegelijk
      const defs = {};
      const allToFetch = [...new Set([...allHashes, ...allPlugHashes])];
      await Promise.allSettled(allToFetch.map(async hash => {
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
        4282591831:'prismatic',3168997075:'arc',
      };
      const SUBCLASS_NAMES = {
        2328211300:'Arc Strider',  3006627468:'Stormcaller',       1751782730:'Striker',      2958378809:'Arc Striker',
        2240888816:'Gunslinger',   3941205951:'Dawnblade',          2550323932:'Sunbreaker',
        2453351420:'Nightstalker', 3887892656:'Voidwalker',         2842471112:'Sentinel',
        873720784:'Revenant',      3291645503:'Shadebinder',        2842471113:'Behemoth',
        2932390016:'Threadrunner', 613647897:'Broodweaver',         242419885:'Berserker',
        3855807587:'Prismatic',    1216399026:'Prismatic',          3452049687:'Prismatic',
        4282591831:'Prismatic',    3168997075:'Stormcaller',
      };
      const WEAPON_BUCKETS  = new Set([1498876634, 2465295065, 953998645]);
      const ARMOR_BUCKETS   = new Set([3448274439, 3551918588, 14239492, 20886954, 1585787867]);
      const SUBCLASS_BUCKET = 3284755031;
      const SLOT_NAMES = {
        1498876634:'Kinetisch', 2465295065:'Energie', 953998645:'Zwaar',
        3448274439:'Helm', 3551918588:'Gauntlets', 14239492:'Borst', 20886954:'Benen', 1585787867:'Class Item',
      };

      // Mod slot bucket hashes die we willen tonen (armor mods, niet intrinsics/perks)
      const MOD_SLOT_CATEGORIES = new Set([
        59,    // Armor mods
        4104513227, // Combat Style mods
        2685412949, // General mods
      ]);

      // Helper: haal mod-iconen op uit plugsData voor een item
      function getArmorMods(itemInstanceId) {
        const mods = [];
        const seen = new Set();

        // Primaire bron: component 302 (sockets) — geeft de daadwerkelijk uitgeruste plugs
        const sockets = socketsData[itemInstanceId]?.sockets ?? [];
        for (const socket of sockets) {
          const hash = socket.plugHash;
          if (!hash || seen.has(hash)) continue;
          const plugDef = defs[hash];
          if (!plugDef) continue;
          const name = plugDef.displayProperties?.name ?? '';
          const icon = plugDef.displayProperties?.icon;
          if (!name || !icon) continue;
          if (name === 'Empty Mod Socket' || name === 'Default Shader' ||
              name === 'Armor Perks' || name === 'Intrinsic' ||
              name.startsWith('Empty ') || name.startsWith('Default ') ||
              name.includes('Deprecated')) continue;
          seen.add(hash);
          const cats = plugDef.itemCategoryHashes ?? [];
          const plugId = plugDef.plug?.plugCategoryIdentifier ?? '';
          const isMod = cats.some(h => MOD_SLOT_CATEGORIES.has(h)) ||
                        cats.includes(4104513227) || cats.includes(2685412949) ||
                        cats.includes(59) || cats.includes(4173924323) ||
                        plugId.includes('mod') || plugId.includes('armor_mod');
          if (isMod) {
            mods.push({ name, icon: 'https://www.bungie.net' + icon, hash });
            if (mods.length >= 5) break;
          }
        }

        // Fallback: reusablePlugs (component 309) als sockets leeg zijn
        if (mods.length === 0) {
          const plugs = plugsData[itemInstanceId]?.plugs ?? {};
          for (const plugArr of Object.values(plugs)) {
            for (const plug of (plugArr ?? [])) {
              const plugDef = defs[plug.plugItemHash];
              if (!plugDef || seen.has(plug.plugItemHash)) continue;
              const name = plugDef.displayProperties?.name ?? '';
              const icon = plugDef.displayProperties?.icon;
              if (!name || !icon) continue;
              if (name === 'Empty Mod Socket' || name.startsWith('Empty ') ||
                  name === 'Default Shader' || name.startsWith('Default ') ||
                  name === 'Armor Perks') continue;
              seen.add(plug.plugItemHash);
              const cats = plugDef.itemCategoryHashes ?? [];
              const plugId = plugDef.plug?.plugCategoryIdentifier ?? '';
              const isMod = cats.some(h => MOD_SLOT_CATEGORIES.has(h)) ||
                            plugId.includes('mod');
              if (isMod) {
                mods.push({ name, icon: 'https://www.bungie.net' + icon, hash: plug.plugItemHash });
                if (mods.length >= 5) break;
              }
            }
            if (mods.length >= 5) break;
          }
        }
        return mods;
      }

      // Helper: haal weapon perks op
      function getWeaponPerks(itemInstanceId, itemHash) {
        const plugs = plugsData[itemInstanceId]?.plugs ?? {};
        const perks = [];
        for (const [, plugArr] of Object.entries(plugs)) {
          for (const plug of (plugArr ?? [])) {
            const plugDef = defs[plug.plugItemHash];
            if (!plugDef) continue;
            const name = plugDef.displayProperties?.name ?? '';
            const icon = plugDef.displayProperties?.icon;
            if (!name || !icon || name.includes('Default') || name.includes('Empty') || name.includes('Intrinsic')) continue;
            const cats = plugDef.itemCategoryHashes ?? [];
            // Alleen echte weapon perks (cat 2237006975 = weapon perk)
            if (cats.includes(2237006975) || cats.includes(610365472)) {
              perks.push({ name, icon: 'https://www.bungie.net' + icon });
              if (perks.length >= 4) break;
            }
          }
          if (perks.length >= 4) break;
        }
        return perks;
      }

      // 6. Bouw karakters op
      const characters = [];
      for (const [charId, char] of Object.entries(charsData)) {
        const items = equipData[charId]?.items ?? [];

        // Subclass
        const scRaw  = items.find(i => i.bucketHash === SUBCLASS_BUCKET);
        const scHash = scRaw?.itemHash;
        const scDef  = defs[scHash];
        const element = ELEMENT_MAP[scHash] ?? 'void';
        const subclass = {
          hash:    scHash,
          name:    SUBCLASS_NAMES[scHash] ?? scDef?.displayProperties?.name ?? 'Subclass',
          element: element,
          icon:    scDef?.displayProperties?.icon ? 'https://www.bungie.net' + scDef.displayProperties.icon : null,
          screenshot: scDef?.screenshot ? 'https://www.bungie.net' + scDef.screenshot : null,
        };

        // Wapens
        const weapons = items.filter(i => WEAPON_BUCKETS.has(i.bucketHash)).map(i => {
          const def = defs[i.itemHash] ?? {};
          const ins = instanceData[i.itemInstanceId] ?? {};
          const perks = getWeaponPerks(i.itemInstanceId, i.itemHash);
          return {
            bucketHash: i.bucketHash,
            slotName:   SLOT_NAMES[i.bucketHash] ?? 'Wapen',
            name:       def.displayProperties?.name ?? SLOT_NAMES[i.bucketHash] ?? 'Wapen',
            icon:       def.displayProperties?.icon ? 'https://www.bungie.net' + def.displayProperties.icon : null,
            typeName:   def.itemTypeDisplayName ?? '',
            tierType:   def.inventory?.tierType ?? 5,
            isExotic:   (def.inventory?.tierType ?? 5) === 6,
            power:      ins.primaryStat?.value ?? 0,
            perks,
          };
        });

        // Armor
        const armor = items.filter(i => ARMOR_BUCKETS.has(i.bucketHash)).map(i => {
          const def = defs[i.itemHash] ?? {};
          const ins = instanceData[i.itemInstanceId] ?? {};
          const mods = getArmorMods(i.itemInstanceId);
          const tierType = def.inventory?.tierType ?? 5;
          // Gebruik screenshot als primaire afbeelding (volledig gevuld), icon als fallback
          const screenshot = def.screenshot ? 'https://www.bungie.net' + def.screenshot : null;
          const icon = def.displayProperties?.icon ? 'https://www.bungie.net' + def.displayProperties.icon : null;
          const iconWatermark = def.iconWatermark ? 'https://www.bungie.net' + def.iconWatermark : null;
          return {
            bucketHash: i.bucketHash,
            slotName:   SLOT_NAMES[i.bucketHash] ?? 'Armor',
            name:       def.displayProperties?.name ?? SLOT_NAMES[i.bucketHash] ?? 'Armor',
            icon,
            screenshot,
            iconWatermark,
            tierType,
            isExotic:   tierType === 6,
            power:      ins.primaryStat?.value ?? 0,
            mods,
          };
        });

        // Character stats (component 304): Mobility, Resilience, Recovery, Discipline, Intellect, Strength
        // Verified Bungie stat hash mapping (https://data.destinysets.com/):
        // Mobility    = 2996146975
        // Resilience  = 1943323491
        // Recovery    = 1735777505
        // Discipline  = 144602215
        // Intellect   = 392767087
        // Strength    = 4244567218
        const STAT_HASHES = {
          2996146975: 'mobility',
          1943323491: 'resilience',
          1735777505: 'recovery',
          144602215:  'discipline',
          392767087:  'intellect',
          4244567218: 'strength',
        };
        const rawStats = statsData[charId]?.stats ?? {};
        const stats = {};
        for (const [hash, key] of Object.entries(STAT_HASHES)) {
          stats[key] = rawStats[hash]?.value ?? 0;
        }

        // Character render URL
        // Bungie's echte karakter render is ALLEEN beschikbaar via hun eigen website renderer
        // De enige publiek toegankelijke afbeelding IS de emblemBackgroundPath
        // maar die is 474x96 panorama.
        // De subclass screenshot (groot, ~1920px breed) is de beste bron voor het portret.
        const charRenderData = renderData[charId];
        const portraitUrl = null; // Bungie portrait widget werkt niet zonder cookies/session

        characters.push({
          charId,
          mType,
          mId,
          className: CLASS_NAMES[char.classType] ?? 'Guardian',
          classType: char.classType,
          light:     char.light ?? 0,
          emblemBg:  char.emblemBackgroundPath ? 'https://www.bungie.net' + char.emblemBackgroundPath : null,
          emblemIcon: char.emblemPath ? 'https://www.bungie.net' + char.emblemPath : null,
          emblemHash: char.emblemHash ?? null,
          renderPath: char.emblemBackgroundPath ?? null,
          portraitUrl,
          subclass, weapons, armor, stats,
        });
      }

      const ORDER = ['Hunter','Warlock','Titan'];
      characters.sort((a,b) => ORDER.indexOf(a.className) - ORDER.indexOf(b.className));

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      return res.status(200).json({ characters });

    } catch(err) {
      console.error('[charactergear] FATAL:', err.message, err.stack);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Onbekende actie.' });
}
