// ============================================================
// GUARDIANHQ — api/bungie-stats.js
// Vercel Serverless Function — Live stats + volledige activiteiten mix
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
    result.steamPlayers = (await steamRes.json())?.response?.player_count ?? null;
  } catch { result.steamPlayers = null; }

  // ── 2. SERVER STATUS ──
  try {
    const alertRes = await fetch('https://www.bungie.net/Platform/GlobalAlerts/', { headers: { 'X-API-Key': API_KEY } });
    const alerts = (await alertRes.json())?.Response ?? [];
    result.serverOnline = alerts.length === 0;
    result.alerts = alerts.map(a => a.AlertHtml || '').slice(0, 2);
  } catch { result.serverOnline = null; result.alerts = []; }

  // ── 3. POWER CAPS ──
  result.softCap = 200; result.powerCap = 550; result.pinnacleFloor = 550;

  // ── 4. RESET TIMERS ──
  const now = new Date();
  const weekly = new Date(now);
  weekly.setUTCHours(17, 0, 0, 0);
  weekly.setUTCDate(weekly.getUTCDate() + ((2 - weekly.getUTCDay() + 7) % 7 || 7));
  result.weeklyResetMs = weekly.getTime();
  const daily = new Date(now);
  daily.setUTCHours(17, 0, 0, 0);
  if (daily <= now) daily.setUTCDate(daily.getUTCDate() + 1);
  result.dailyResetMs = daily.getTime();

  // ── 5. ACTIVITEITEN: live Bungie milestones + altijd-actieve basis ──
  try {
    // Officiële Bungie type-iconen (stabiele CDN URLs uit DestinyActivityTypeDefinition)
    const TYPE_ICONS = {
      raid:       'https://www.bungie.net/img/misc/missing_icon_d2.png', // wordt overschreven door API
      dungeon:    'https://www.bungie.net/img/misc/missing_icon_d2.png',
      nightfall:  'https://www.bungie.net/common/destiny2_content/icons/DestinyMilestoneDefinition_NightfallOrdeal.png',
      strike:     'https://www.bungie.net/common/destiny2_content/icons/DestinyMilestoneDefinition_DailyVanguardModifier.png',
      crucible:   'https://www.bungie.net/common/destiny2_content/icons/DestinyActivityModeDefinition_Crucible.png',
      gambit:     'https://www.bungie.net/common/destiny2_content/icons/DestinyActivityModeDefinition_Gambit.png',
      trials:     'https://www.bungie.net/common/destiny2_content/icons/DestinyActivityModeDefinition_TrialsOfOsiris.png',
      ironbanner: 'https://www.bungie.net/common/destiny2_content/icons/DestinyActivityModeDefinition_IronBanner.png',
      lostsector: 'https://www.bungie.net/common/destiny2_content/icons/DestinyActivityTypeDefinition_LostSector.png',
      exotic:     'https://www.bungie.net/common/destiny2_content/icons/DestinyActivityTypeDefinition_ExoticMission.png',
      seasonal:   'https://www.bungie.net/common/destiny2_content/icons/DestinyActivityTypeDefinition_Seasonal.png',
    };

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

    // Naam → type detectie
    function detectType(name) {
      const n = (name ?? '').toLowerCase();
      if (/(deep stone crypt|vault of glass|vow of the|king's fall|root of nightmare|crota's end|last wish|garden of salvation|salvation's edge|pantheon)/.test(n)) return 'raid';
      if (/(shattered throne|pit of heresy|grasp of avarice|spire of the watcher|warlord's ruin|ghosts of the deep|duality|prophecy)/.test(n)) return 'dungeon';
      if (/grandmaster/.test(n)) return 'nightfall';
      if (/nightfall/.test(n)) return 'nightfall';
      if (/(trials of osiris|trials)/.test(n)) return 'trials';
      if (/iron banner/.test(n)) return 'ironbanner';
      if (/(crucible|clash|control|survival|rumble|momentum|rift|showdown|competitive)/.test(n)) return 'crucible';
      if (/gambit/.test(n)) return 'gambit';
      if (/lost sector/.test(n)) return 'lostsector';
      if (/(battleground|onslaught|nether|court of blades|tomb of elders|breach|enigma)/.test(n)) return 'seasonal';
      if (/(zero hour|the whisper|exotic mission|node\.ovrd|starcrossed|derealize|kell's)/.test(n)) return 'exotic';
      if (/(vanguard ops|strike)/.test(n)) return 'strike';
      return null;
    }

    // Milestone hashes die we kennen
    const MILESTONE_HINTS = {
      '2171429505': { type: 'nightfall' },
      '1942283260': { type: 'nightfall', name: 'Grandmaster Nightfall' },
      '3847642514': { type: 'strike',    name: 'Vanguard Ops' },
      '2594202463': { type: 'strike',    name: 'Vanguard Ops' },
      '3173648095': { type: 'crucible',  name: 'Crucible' },
      '3427325023': { type: 'crucible' },
      '1437935683': { type: 'crucible' },
      '3172444947': { type: 'gambit',    name: 'Gambit' },
      '2985973691': { type: 'gambit',    name: 'Gambit' },
      '1365342439': { type: 'trials',    name: 'Trials of Osiris' },
      '3753505781': { type: 'ironbanner',name: 'Iron Banner' },
      '1714509342': { type: 'ironbanner',name: 'Iron Banner' },
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
      // Dungeons
      '3603098564': { type: 'dungeon' },
      '66424225':   { type: 'dungeon' },
      '2712317340': { type: 'dungeon' },
      '3352500532': { type: 'dungeon' },
      '1077505350': { type: 'dungeon' },
      // Exotic missions
      '3899487295': { type: 'exotic' },
      '3464549905': { type: 'exotic' },
      '1648395561': { type: 'exotic' },
      '2029743966': { type: 'exotic' },
      // Seasonal
      '3789021730': { type: 'seasonal' },
      '1437935682': { type: 'seasonal' },
      '2594202464': { type: 'seasonal' },
    };

    // Haal live milestones op
    const milestoneRes = await fetch('https://www.bungie.net/Platform/Destiny2/Milestones/', { headers: { 'X-API-Key': API_KEY } });
    const milestones = (await milestoneRes.json())?.Response ?? {};

    const SKIP = ['artifact', 'season pass', 'seasonal artifact', 'weekly bounty', 'bright dust', 'guardian rank', 'xur', 'eververse', 'collect', 'seasonal rank'];

    // Verwerk milestones parallel
    const promises = Object.keys(milestones).map(async (hash) => {
      const data = milestones[hash];
      const hint = MILESTONE_HINTS[hash];
      if (!data.activities?.length && !hint) return null;

      let name = hint?.name ?? null;
      let sub = null;
      let type = hint?.type ?? null;
      let typeIconUrl = null;
      let pgcrImage = null;

      if (data.activities?.length) {
        try {
          const defRes = await fetch(
            `https://www.bungie.net/Platform/Destiny2/Manifest/DestinyActivityDefinition/${data.activities[0].activityHash}/`,
            { headers: { 'X-API-Key': API_KEY } }
          );
          const def = (await defRes.json())?.Response;
          if (def) {
            if (!name) name = def.displayProperties?.name;
            sub = def.displayProperties?.description ?? null;
            if (!type) type = detectType(name);

            // pgcrImage = mooie achtergrondafbeelding van de activiteit
            if (def.pgcrImage) pgcrImage = 'https://www.bungie.net' + def.pgcrImage;

            // Bestemming als subtitle
            if (def.destinationHash) {
              try {
                const destRes = await fetch(
                  `https://www.bungie.net/Platform/Destiny2/Manifest/DestinyDestinationDefinition/${def.destinationHash}/`,
                  { headers: { 'X-API-Key': API_KEY } }
                );
                const dest = (await destRes.json())?.Response;
                if (dest?.displayProperties?.name) sub = dest.displayProperties.name;
              } catch {}
            }

            // Officieel type-icoon via DestinyActivityTypeDefinition
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

      if (!name) return null;
      if (SKIP.some(s => name.toLowerCase().includes(s))) return null;
      if (!type) type = detectType(name);
      if (!type) return null;

      const tb = TYPE_BADGE[type] ?? { badge: 'Actief', badgeClass: 'badge-live' };
      return { name, sub: sub ?? 'Beschikbaar deze week', type, typeIconUrl, pgcrImage, badge: tb.badge, badgeClass: tb.badgeClass, isLive: true };
    });

    const settled = await Promise.allSettled(promises);
    const liveActivities = settled.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);

    // Dedupliceer
    const seen = new Set();
    const unique = liveActivities.filter(a => {
      const key = a.name.toLowerCase().replace(/[:\s\-\.\(\)]+/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sorteer: events > raids/dungeons > nightfall > rest
    const ORDER = { ironbanner:0, trials:1, exotic:2, raid:3, dungeon:4, nightfall:5, crucible:6, gambit:7, strike:8, seasonal:9, lostsector:10 };
    unique.sort((a, b) => (ORDER[a.type] ?? 99) - (ORDER[b.type] ?? 99));

    result.activities = unique.length > 0 ? unique : null;

  } catch (e) {
    console.error('[activities]', e.message);
    result.activities = null;
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
  return res.status(200).json(result);
}
