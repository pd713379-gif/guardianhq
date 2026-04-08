// ============================================================
// GUARDIANHQ — api/bungie-stats.js
// Vercel Serverless Function — Bungie + Steam Live Stats + Activities
// ============================================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.BUNGIE_API_KEY;
  const result = {};

  // ── 1. STEAM LIVE PLAYERS ──
  try {
    const steamRes = await fetch('https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=1085660');
    const steamData = await steamRes.json();
    result.steamPlayers = steamData?.response?.player_count ?? null;
  } catch (e) { result.steamPlayers = null; }

  // ── 2. BUNGIE SERVER STATUS ──
  try {
    const alertRes = await fetch('https://www.bungie.net/Platform/GlobalAlerts/', { headers: { 'X-API-Key': API_KEY } });
    const alertData = await alertRes.json();
    const alerts = alertData?.Response ?? [];
    result.serverOnline = alerts.length === 0;
    result.alerts = alerts.map(a => a.AlertHtml || a.AlertKey || '').slice(0, 2);
  } catch (e) { result.serverOnline = null; result.alerts = []; }

  // ── 3. POWER CAPS ──
  result.softCap = 200; result.powerCap = 550; result.pinnacleFloor = 550;

  // ── 4. WEEKLY + DAILY RESET ──
  const now = new Date();
  const weekly = new Date(now);
  weekly.setUTCHours(17, 0, 0, 0);
  const daysUntilTuesday = (2 - weekly.getUTCDay() + 7) % 7 || 7;
  weekly.setUTCDate(weekly.getUTCDate() + daysUntilTuesday);
  result.weeklyResetMs = weekly.getTime();
  const daily = new Date(now);
  daily.setUTCHours(17, 0, 0, 0);
  if (daily <= now) daily.setUTCDate(daily.getUTCDate() + 1);
  result.dailyResetMs = daily.getTime();

  // ── 5. LIVE ACTIVITIES via Bungie Milestones ──
  try {
    const milestoneRes = await fetch('https://www.bungie.net/Platform/Destiny2/Milestones/', { headers: { 'X-API-Key': API_KEY } });
    const milestones = (await milestoneRes.json())?.Response ?? {};

    // Alle bekende milestone hashes — zo breed mogelijk
    const MILESTONE_MAP = {
      // Raids
      '2712317338': { type: 'raid' },
      '4253138191': { type: 'raid' },
      '541780856':  { type: 'raid' },
      '2122313384': { type: 'raid' },
      '3034186474': { type: 'raid' },
      '1485311587': { type: 'raid' },
      '2897305076': { type: 'raid' },
      '1551479837': { type: 'raid' },
      '1186140085': { type: 'raid' },
      '2259621230': { type: 'raid' },
      // Dungeons
      '3603098564': { type: 'dungeon' },
      '66424225':   { type: 'dungeon' },
      '2712317340': { type: 'dungeon' },
      '3352500532': { type: 'dungeon' },
      '1077505350': { type: 'dungeon' },
      // Nightfall
      '2171429505': { name: 'Nightfall', type: 'nightfall' },
      '1942283260': { name: 'Grandmaster Nightfall', type: 'nightfall' },
      // Vanguard
      '3847642514': { name: 'Vanguard Ops', type: 'strike' },
      '2594202463': { name: 'Vanguard Ops', type: 'strike' },
      // Crucible
      '3173648095': { name: 'Crucible', type: 'crucible' },
      '3427325023': { type: 'crucible' },
      '1437935683': { type: 'crucible' },
      // Gambit
      '3172444947': { name: 'Gambit', type: 'gambit' },
      '2985973691': { name: 'Gambit', type: 'gambit' },
      // Trials
      '1365342439': { name: 'Trials of Osiris', type: 'trials' },
      // Iron Banner
      '3753505781': { name: 'Iron Banner', type: 'ironbanner' },
      '1714509342': { name: 'Iron Banner', type: 'ironbanner' },
      // Exotic Missions
      '3899487295': { type: 'exotic' },
      '3464549905': { type: 'exotic' },
      '1648395561': { type: 'exotic' },
      '2029743966': { type: 'exotic' },
      // Seasonal / Battleground
      '3789021730': { type: 'seasonal' },
      '1437935682': { type: 'seasonal' },
      '2594202464': { type: 'seasonal' },
    };

    // Naam-gebaseerde type detectie
    function detectType(name) {
      const nm = (name ?? '').toLowerCase();
      if (/(deep stone|vault of glass|vow of|king's fall|root of nightmare|crota|last wish|garden of|salvation's edge|pantheon|salvation)/.test(nm)) return 'raid';
      if (/(shattered throne|pit of heresy|grasp of|spire of|warlord|ghosts of the|duality|dungeon)/.test(nm)) return 'dungeon';
      if (/grandmaster/.test(nm)) return 'nightfall';
      if (/nightfall/.test(nm)) return 'nightfall';
      if (/(trial|osiris)/.test(nm)) return 'trials';
      if (/iron banner/.test(nm)) return 'ironbanner';
      if (/(crucible|clash|control|survival|rumble|momentum|rift|showdown|competitive)/.test(nm)) return 'crucible';
      if (/gambit/.test(nm)) return 'gambit';
      if (/lost sector/.test(nm)) return 'lostsector';
      if (/(battleground|seasonal|onslaught|breach|the nether|court of blades|tomb of elders)/.test(nm)) return 'seasonal';
      if (/(zero hour|the whisper|exotic|node\.ovrd|starcrossed|derealize|kell's vengeance)/.test(nm)) return 'exotic';
      if (/(strike|vanguard)/.test(nm)) return 'strike';
      return null;
    }

    const TYPE_BADGE = {
      raid:       { badge: 'Raid',          badgeClass: 'badge-hot'   },
      dungeon:    { badge: 'Dungeon',        badgeClass: 'badge-hot'   },
      nightfall:  { badge: 'Nightfall',      badgeClass: 'badge-live'  },
      trials:     { badge: 'Trials',         badgeClass: 'badge-event' },
      ironbanner: { badge: 'Iron Banner',    badgeClass: 'badge-event' },
      crucible:   { badge: 'Crucible',       badgeClass: 'badge-live'  },
      gambit:     { badge: 'Gambit',         badgeClass: 'badge-live'  },
      lostsector: { badge: 'Lost Sector',    badgeClass: 'badge-live'  },
      strike:     { badge: 'Vanguard',       badgeClass: 'badge-live'  },
      exotic:     { badge: 'Exotic Mission', badgeClass: 'badge-event' },
      seasonal:   { badge: 'Seizoen',        badgeClass: 'badge-live'  },
    };

    // Sla ongewenste milestones over
    const SKIP_NAMES = ['artifact', 'season pass', 'seasonal artifact', 'weekly bounty', 'bright dust', 'seasonal rank', 'guardian rank', 'collect', 'xur', 'eververse'];

    // Haal alle activiteiten PARALLEL op voor snelheid
    const activityPromises = Object.keys(milestones).map(async (hash) => {
      const data = milestones[hash];
      const preset = MILESTONE_MAP[hash];
      if (!data.activities?.length && !preset) return null;

      let actName  = preset?.name ?? null;
      let actSub   = null;
      let actType  = preset?.type ?? null;
      let typeIconUrl = null;
      let imgUrl   = null;

      if (data.activities?.length) {
        try {
          const defRes = await fetch(
            `https://www.bungie.net/Platform/Destiny2/Manifest/DestinyActivityDefinition/${data.activities[0].activityHash}/`,
            { headers: { 'X-API-Key': API_KEY } }
          );
          const def = (await defRes.json())?.Response;
          if (def) {
            if (!actName) actName = def.displayProperties?.name;
            actSub = def.displayProperties?.description ?? null;
            if (!actType) actType = detectType(actName);
            const iconPath = def.displayProperties?.icon;
            if (iconPath) imgUrl = 'https://www.bungie.net' + iconPath;

            // Bestemming als subtitle
            if (def.destinationHash) {
              try {
                const destRes = await fetch(
                  `https://www.bungie.net/Platform/Destiny2/Manifest/DestinyDestinationDefinition/${def.destinationHash}/`,
                  { headers: { 'X-API-Key': API_KEY } }
                );
                const dest = (await destRes.json())?.Response;
                if (dest?.displayProperties?.name) actSub = dest.displayProperties.name;
              } catch {}
            }

            // Officieel Bungie type-icoon
            if (def.activityTypeHash) {
              try {
                const typeRes = await fetch(
                  `https://www.bungie.net/Platform/Destiny2/Manifest/DestinyActivityTypeDefinition/${def.activityTypeHash}/`,
                  { headers: { 'X-API-Key': API_KEY } }
                );
                const typeDef = (await typeRes.json())?.Response;
                const tp = typeDef?.displayProperties?.icon;
                if (tp && !tp.includes('missing_icon')) typeIconUrl = 'https://www.bungie.net' + tp;
              } catch {}
            }
          }
        } catch {}
      }

      if (!actName) return null;
      if (SKIP_NAMES.some(s => actName.toLowerCase().includes(s))) return null;

      // Detecteer type als nog steeds onbekend
      if (!actType) actType = detectType(actName);
      if (!actType) return null; // filter totaal onbekende activiteiten

      const tb = TYPE_BADGE[actType] ?? { badge: 'Actief', badgeClass: 'badge-live' };

      return { name: actName, sub: actSub ?? 'Beschikbaar deze week', type: actType, typeIconUrl, imgUrl, badge: tb.badge, badgeClass: tb.badgeClass };
    });

    const rawResults = await Promise.allSettled(activityPromises);
    const activities = rawResults.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);

    // Dedupliceer
    const seen = new Set();
    const unique = activities.filter(a => {
      const key = a.name.toLowerCase().replace(/[:\s\-\.]+/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sorteer zodat mix goed is: events eerst, dan raids/dungeons, dan rest
    const ORDER = { ironbanner: 0, trials: 1, exotic: 2, raid: 3, dungeon: 4, nightfall: 5, crucible: 6, gambit: 7, strike: 8, seasonal: 9, lostsector: 10 };
    unique.sort((a, b) => (ORDER[a.type] ?? 99) - (ORDER[b.type] ?? 99));

    result.activities = unique.length > 0 ? unique : null;

  } catch (e) {
    console.error('[activities] Fout:', e.message);
    result.activities = null;
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
  return res.status(200).json(result);
}
