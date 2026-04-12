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
      const profile = await bFetch(`/Destiny2/${mType}/Profile/${mId}/?components=200,204,205,300,302,304,305,309`, token);

      const charsData      = profile?.characters?.data ?? {};
      const renderData     = profile?.characterRenderData?.data ?? {};
      const equipData      = profile?.characterEquipment?.data ?? {};
      const instanceData = profile?.itemComponents?.instances?.data ?? {};
      const plugsData    = profile?.itemComponents?.reusablePlugs?.data ?? {};
      const socketsData  = profile?.itemComponents?.sockets?.data ?? {};
      // Component 305 geeft per item alle socket states inclusief plugHash
      const plugStatesData = profile?.itemComponents?.plugStates?.data ?? {};
      const statsData    = profile?.characterStats?.data ?? {};

      // DEBUG: log wat Bungie teruggeeft voor stats (zie Vercel logs)
      console.log('[stats-debug] profile keys:', Object.keys(profile ?? {}));
      console.log('[stats-debug] characterStats aanwezig:', !!profile?.characterStats);
      console.log('[stats-debug] statsData keys:', Object.keys(statsData));
      const _firstChar = Object.keys(statsData)[0];
      if (_firstChar) {
        console.log('[stats-debug] rawStats sample:', JSON.stringify(statsData[_firstChar]?.stats ?? {}).slice(0, 400));
      }

      // 3. Verzamel relevante hashes
      const RELEVANT_BUCKETS = new Set([
        3284755031,                                                      // subclass
        1498876634, 2465295065, 953998645,                               // weapons
        3448274439, 3551918588, 14239492, 20886954, 1585787867,          // armor
        4023194814,                                                      // ghost shell
        284967655,                                                       // ship
        2025709351,                                                      // sparrow
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
            // Verzamel socket plug hashes (302) — uitgeruste plugs
            const sockets = socketsData[item.itemInstanceId]?.sockets ?? [];
            for (const socket of sockets) {
              if (socket.plugHash) allPlugHashes.add(socket.plugHash);
              // Ook reusable plugs uit socket meenemen
              for (const rp of (socket.reusablePlugs ?? [])) {
                if (rp.plugItemHash) allPlugHashes.add(rp.plugItemHash);
              }
            }
            // Component 305 plug states
            for (const [plugHash] of Object.entries(plugStatesData)) {
              const h = parseInt(plugHash);
              if (h) allPlugHashes.add(h);
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
      const GHOST_BUCKET    = 4023194814;
      const SHIP_BUCKET     = 284967655;
      const SPARROW_BUCKET  = 2025709351;
      const SLOT_NAMES = {
        1498876634:'Kinetisch', 2465295065:'Energie', 953998645:'Zwaar',
        3448274439:'Helm', 3551918588:'Gauntlets', 14239492:'Borst', 20886954:'Benen', 1585787867:'Class Item',
        4023194814:'Ghost Shell', 284967655:'Ship', 2025709351:'Sparrow',
      };

      // Mod slot bucket hashes die we willen tonen (armor mods, niet intrinsics/perks)
      // Echte armor mods: plugCategoryIdentifier begint met 'enhancements.'
      // maar NIET cosmetics zoals shaders/ornaments (die hebben 'shader','ornaments','ghost_projections')
      const COSMETIC_PLUG_SKIP = ['shader','ornament','ghost_projection','transmat','emote','finisher'];
      function isRealArmorMod(plugDef) {
        const plugId = (plugDef.plug?.plugCategoryIdentifier ?? '').toLowerCase();
        if (!plugId.startsWith('enhancements.')) return false;
        // Skip cosmetische enhancements
        if (COSMETIC_PLUG_SKIP.some(s => plugId.includes(s))) return false;
        return true;
      }

      // Helper: haal armor mods EN cosmetics op per socket slot
      // Geeft { mods: [...], cosmetics: [...] }
      // mods = enhancements.* (geen cosmetics) — alle slots, geen maximum
      // cosmetics = shaders + ornaments
      function getArmorMods(itemInstanceId) {
        const mods = [];
        const cosmetics = [];
        const sockets = socketsData[itemInstanceId]?.sockets ?? [];

        for (const socket of sockets) {
          const hash = socket.plugHash;
          if (!hash) continue;
          const plugDef = defs[hash];
          if (!plugDef) continue;

          const plugId = (plugDef.plug?.plugCategoryIdentifier ?? '').toLowerCase();
          const name   = plugDef.displayProperties?.name ?? '';
          const icon   = plugDef.displayProperties?.icon ?? '';

          // COSMETICS: shaders en ornaments apart bijhouden
          if (plugId.includes('shader') || plugId.includes('ornament') || plugId.includes('transmat')) {
            if (name && icon && !name.startsWith('Default') && !name.startsWith('Empty')) {
              cosmetics.push({ name, icon: 'https://www.bungie.net' + icon, hash });
            } else {
              cosmetics.push(null); // lege cosmetische slot
            }
            continue;
          }

          // MODS: alle enhancements.* sockets (geen cosmetics)
          if (!plugId.startsWith('enhancements.')) continue;

          if (!name || name.startsWith('Empty') || name.startsWith('Default') || name.startsWith('Deprecated') || !icon) {
            mods.push(null); // lege mod slot
          } else {
            mods.push({ name, icon: 'https://www.bungie.net' + icon, hash });
          }
        }

        // Fallback via reusablePlugs als sockets leeg zijn
        if (mods.filter(Boolean).length === 0 && cosmetics.filter(Boolean).length === 0) {
          const plugs = plugsData[itemInstanceId]?.plugs ?? {};
          for (const plugArr of Object.values(plugs)) {
            const plug = plugArr?.[0];
            if (!plug?.plugItemHash) continue;
            const plugDef = defs[plug.plugItemHash];
            if (!plugDef) continue;
            const plugId = (plugDef.plug?.plugCategoryIdentifier ?? '').toLowerCase();
            const name   = plugDef.displayProperties?.name ?? '';
            const icon   = plugDef.displayProperties?.icon ?? '';
            if (plugId.includes('shader') || plugId.includes('ornament')) {
              if (name && icon && !name.startsWith('Default') && !name.startsWith('Empty'))
                cosmetics.push({ name, icon: 'https://www.bungie.net' + icon, hash: plug.plugItemHash });
              continue;
            }
            if (!plugId.startsWith('enhancements.')) continue;
            if (!name || name.startsWith('Empty') || name.startsWith('Default') || !icon) {
              mods.push(null);
            } else {
              mods.push({ name, icon: 'https://www.bungie.net' + icon, hash: plug.plugItemHash });
            }
          }
        }

        console.log('[mods]', itemInstanceId, '=> mods:', mods.length, 'cosmetics:', cosmetics.length);
        return { mods, cosmetics };
      }

      // Helper: haal weapon perks op
      // Echte perks hebben itemCategoryHash 2237006975 (Weapon Perks)
      // Frames/barrels/etc hebben andere categorieen
      function getWeaponPerks(itemInstanceId, itemHash) {
        const perks = [];
        const seen  = new Set();

        // Loop alle socket plugs — filter op categorie 2237006975
        const sockets = socketsData[itemInstanceId]?.sockets ?? [];
        for (const socket of sockets) {
          if (perks.length >= 4) break;
          const hash = socket.plugHash;
          if (!hash || seen.has(hash)) continue;
          seen.add(hash);
          const plugDef = defs[hash];
          if (!plugDef) continue;
          const cats = plugDef.itemCategoryHashes ?? [];
          // Alleen echte weapon perks
          if (!cats.includes(2237006975)) continue;
          const name = plugDef.displayProperties?.name ?? '';
          const icon = plugDef.displayProperties?.icon ?? '';
          const desc = plugDef.displayProperties?.description ?? '';
          if (!name || !icon) continue;
          if (name.startsWith('Empty') || name.startsWith('Default') || name.startsWith('Deprecated')) continue;
          perks.push({ name, icon: 'https://www.bungie.net' + icon, desc });
        }

        // Fallback via reusablePlugs als sockets leeg zijn
        if (perks.length === 0) {
          const plugs = plugsData[itemInstanceId]?.plugs ?? {};
          for (const [, plugArr] of Object.entries(plugs)) {
            if (perks.length >= 4) break;
            for (const plug of (plugArr ?? [])) {
              const hash = plug.plugItemHash;
              if (!hash || seen.has(hash)) continue;
              seen.add(hash);
              const plugDef = defs[hash];
              if (!plugDef) continue;
              const cats = plugDef.itemCategoryHashes ?? [];
              if (!cats.includes(2237006975)) continue;
              const name = plugDef.displayProperties?.name ?? '';
              const icon = plugDef.displayProperties?.icon ?? '';
              const desc = plugDef.displayProperties?.description ?? '';
              if (!name || !icon) continue;
              if (name.startsWith('Empty') || name.startsWith('Default') || name.startsWith('Deprecated')) continue;
              perks.push({ name, icon: 'https://www.bungie.net' + icon, desc });
              if (perks.length >= 4) break;
            }
          }
        }
        return perks;
      }

      // Helper: haal weapon stats op uit manifest definitie
      // Stat hashes: https://data.destinysets.com/
      function getWeaponStats(itemHash) {
        const def = defs[itemHash] ?? {};
        const statsBlock = def.stats?.stats ?? {};

        // Alle bekende wapen stat hashes — volgorde bepaalt weergave
        const WEAPON_STAT_ORDER = [
          [2523465841, 'Rounds/Min'],
          [2961396640, 'Zoom'],
          [4284893193, 'Impact'],
          [1240592695, 'Range'],
          [155624089,  'Stability'],
          [943549884,  'Handling'],
          [4188031367, 'Reload Speed'],
          [1030428403, 'Blast Radius'],
          [2762071195, 'Velocity'],
          [3614673599, 'Charge Time'],
          [447667954,  'Draw Time'],
          [3597844532, 'Aim Assistance'],
          [1345609583, 'Airborne'],
          [3555269338, 'Recoil Direction'],
          [1931675084, 'Inventory Size'],
          [925767036,  'Ammo Capacity'],
          [3871231066, 'Magazine'],
          // Sword stats
          [2396949875, 'Swing Speed'],
          [1842278070, 'Guard Efficiency'],
          [3736848092, 'Guard Resistance'],
          [1305347063, 'Charge Rate'],
          [3022301683, 'Guard Endurance'],
          [2714457168, 'Shield Duration'],
        ];

        const result = [];
        const seenLabels = new Set();
        for (const [hash, label] of WEAPON_STAT_ORDER) {
          if (seenLabels.has(label)) continue;
          const entry = statsBlock[hash];
          if (entry !== undefined && entry.value > 0) {
            result.push({ label, value: entry.value });
            seenLabels.add(label);
          }
        }
        return result;
      }

      // Helper: haal weapon mods op (barrel, magazine, perk1, perk2, masterwork, mod)
      // Wapen sockets in volgorde: barrel/scope | magazine/battery | perk1 | perk2 | masterwork | mod
      // Wij willen alleen de echte equipped "mod" socket — plugId bevat 'weapon_mods' of 'enhancements.weapons'
      function getWeaponMods(itemInstanceId) {
        const mods = [];
        const sockets = socketsData[itemInstanceId]?.sockets ?? [];

        for (const socket of sockets) {
          const hash = socket.plugHash;
          if (!hash) continue;
          const plugDef = defs[hash];
          if (!plugDef) continue;

          const plugId = (plugDef.plug?.plugCategoryIdentifier ?? '').toLowerCase();
          const name   = plugDef.displayProperties?.name ?? '';
          const icon   = plugDef.displayProperties?.icon ?? '';

          // Wapen mod sockets: enhancements.weapons.* of plugId bevat 'weapon_mod'
          const isWeaponMod = plugId.startsWith('enhancements.weapons') || plugId.includes('weapon_mod');
          if (!isWeaponMod) continue;
          if (!name || !icon) continue;
          if (name.startsWith('Empty') || name.startsWith('Default') || name.startsWith('Deprecated')) {
            mods.push(null);
            continue;
          }
          mods.push({ name, icon: 'https://www.bungie.net' + icon, hash });
        }

        // Fallback via reusablePlugs
        if (mods.filter(Boolean).length === 0) {
          const plugs = plugsData[itemInstanceId]?.plugs ?? {};
          for (const plugArr of Object.values(plugs)) {
            const plug = plugArr?.[0];
            if (!plug?.plugItemHash) continue;
            const plugDef = defs[plug.plugItemHash];
            if (!plugDef) continue;
            const plugId = (plugDef.plug?.plugCategoryIdentifier ?? '').toLowerCase();
            if (!plugId.startsWith('enhancements.weapons') && !plugId.includes('weapon_mod')) continue;
            const name = plugDef.displayProperties?.name ?? '';
            const icon = plugDef.displayProperties?.icon ?? '';
            if (!name || !icon) continue;
            if (name.startsWith('Empty') || name.startsWith('Default') || name.startsWith('Deprecated')) {
              mods.push(null);
              continue;
            }
            mods.push({ name, icon: 'https://www.bungie.net' + icon, hash: plug.plugItemHash });
          }
        }

        return mods;
      }

      // Helper: haal ghost/ship/sparrow perks op
      // Skip shaders, projections, cosmetics — pak alleen echte perks
      function getCollectiblePerks(itemInstanceId) {
        const sockets = socketsData[itemInstanceId]?.sockets ?? [];
        const perks   = [];
        const COLL_SKIP = ['shader','projection','transmat','ornament','ghost_mod_shader','ghost_mod_projection'];
        for (const socket of sockets) {
          const hash = socket.plugHash;
          if (!hash) continue;
          const plugDef = defs[hash];
          if (!plugDef) continue;
          const name   = plugDef.displayProperties?.name ?? '';
          const icon   = plugDef.displayProperties?.icon ?? '';
          const desc   = plugDef.displayProperties?.description ?? '';
          const plugId = (plugDef.plug?.plugCategoryIdentifier ?? '').toLowerCase();
          if (!name || !icon) continue;
          if (name.startsWith('Empty') || name.startsWith('Default') || name.startsWith('Deprecated') || name === 'Armor Perks') continue;
          if (COLL_SKIP.some(s => plugId.includes(s))) continue;
          perks.push({ name, icon: 'https://www.bungie.net' + icon, desc });
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
          const wStats = getWeaponStats(i.itemHash);
          const wMods  = getWeaponMods(i.itemInstanceId);
          return {
            bucketHash: i.bucketHash,
            slotName:   SLOT_NAMES[i.bucketHash] ?? 'Wapen',
            name:       def.displayProperties?.name ?? SLOT_NAMES[i.bucketHash] ?? 'Wapen',
            icon:       def.displayProperties?.icon ? 'https://www.bungie.net' + def.displayProperties.icon : null,
            flavorText: def.flavorText ?? '',
            typeName:   def.itemTypeDisplayName ?? '',
            tierType:   def.inventory?.tierType ?? 5,
            isExotic:   (def.inventory?.tierType ?? 5) === 6,
            power:      ins.primaryStat?.value ?? 0,
            perks,
            stats:      wStats,
            mods:       wMods,
          };
        });

        // Armor
        const armor = items.filter(i => ARMOR_BUCKETS.has(i.bucketHash)).map(i => {
          const def = defs[i.itemHash] ?? {};
          const ins = instanceData[i.itemInstanceId] ?? {};
          const { mods, cosmetics } = getArmorMods(i.itemInstanceId);
          const tierType = def.inventory?.tierType ?? 5;
          // Gebruik screenshot als primaire afbeelding (volledig gevuld), icon als fallback
          const screenshot = def.screenshot ? 'https://www.bungie.net' + def.screenshot : null;
          const icon = def.displayProperties?.icon ? 'https://www.bungie.net' + def.displayProperties.icon : null;
          const iconWatermark = def.iconWatermark ? 'https://www.bungie.net' + def.iconWatermark : null;
          const armorPerks = getCollectiblePerks(i.itemInstanceId);
          return {
            bucketHash: i.bucketHash,
            slotName:   SLOT_NAMES[i.bucketHash] ?? 'Armor',
            name:       def.displayProperties?.name ?? SLOT_NAMES[i.bucketHash] ?? 'Armor',
            icon,
            screenshot,
            iconWatermark,
            flavorText: def.flavorText ?? '',
            tierType,
            isExotic:   tierType === 6,
            power:      ins.primaryStat?.value ?? 0,
            mods,
            cosmetics,
            perks:      armorPerks,
          };
        });

        // Character stats: Bungie component 200 (characters.data) bevat al een 'stats' object
        // met de exacte hash->value mapping. Dit is betrouwbaarder dan component 304.
        // Hashes: https://data.destinysets.com/
        const STAT_HASHES = {
          2996146975: 'mobility',
          1943323491: 'resilience',
          1735777505: 'recovery',
          144602215:  'discipline',
          392767087:  'intellect',
          4244567218: 'strength',
        };

        // Primair: stats uit char object (component 200) — altijd beschikbaar
        const charRawStats = char.stats ?? {};
        // Fallback: component 304 als char.stats leeg is
        const c304RawStats = statsData[charId]?.stats ?? {};

        const stats = {};
        for (const [hash, key] of Object.entries(STAT_HASHES)) {
          const fromChar = charRawStats[hash]?.value ?? charRawStats[hash];
          const from304  = c304RawStats[hash]?.value;
          const val = (typeof fromChar === 'number') ? fromChar
                    : (typeof from304  === 'number') ? from304
                    : 0;
          stats[key] = Math.min(val, 100);
        }
        console.log('[stats] charId', charId, 'char.stats keys:', Object.keys(charRawStats).join(','), '| final:', JSON.stringify(stats));

        // Ghost Shell, Ship, Sparrow
        function extractCollectible(bucketHash, slotLabel) {
          const raw = items.find(i => i.bucketHash === bucketHash);
          if (!raw) return null;
          const def = defs[raw.itemHash] ?? {};
          const perks = getCollectiblePerks(raw.itemInstanceId);
          return {
            bucketHash,
            slotName:   slotLabel,
            name:       def.displayProperties?.name ?? slotLabel,
            icon:       def.displayProperties?.icon ? 'https://www.bungie.net' + def.displayProperties.icon : null,
            screenshot: def.screenshot ? 'https://www.bungie.net' + def.screenshot : null,
            flavorText: def.flavorText ?? '',
            tierType:   def.inventory?.tierType ?? 4,
            isExotic:   (def.inventory?.tierType ?? 4) === 6,
            perks,
          };
        }
        const ghost   = extractCollectible(GHOST_BUCKET,   'Ghost Shell');
        const ship    = extractCollectible(SHIP_BUCKET,    'Ship');
        const sparrow = extractCollectible(SPARROW_BUCKET, 'Sparrow');

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
          subclass, weapons, armor, ghost, ship, sparrow, stats,
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
