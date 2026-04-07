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
    const steamRes = await fetch(
      'https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=1085660'
    );
    const steamData = await steamRes.json();
    result.steamPlayers = steamData?.response?.player_count ?? null;
  } catch (e) {
    result.steamPlayers = null;
  }

  // ── 2. BUNGIE SERVER STATUS + ALERTS ──
  try {
    const alertRes = await fetch('https://www.bungie.net/Platform/GlobalAlerts/', {
      headers: { 'X-API-Key': API_KEY }
    });
    const alertData = await alertRes.json();
    const alerts = alertData?.Response ?? [];
    result.serverOnline = alerts.length === 0;
    result.alerts = alerts.map(a => a.AlertHtml || a.AlertKey || '').slice(0, 2);
  } catch (e) {
    result.serverOnline = null;
    result.alerts = [];
  }

  // ── 3. POWER CAPS ──
  result.softCap       = 200;
  result.powerCap      = 550;
  result.pinnacleFloor = 550;

  // ── 4. WEEKLY + DAILY RESET ──
  const now = new Date();
  const weekly = new Date(now);
  weekly.setUTCHours(17, 0, 0, 0);
  const dayOfWeek = weekly.getUTCDay();
  const daysUntilTuesday = (2 - dayOfWeek + 7) % 7 || 7;
  weekly.setUTCDate(weekly.getUTCDate() + daysUntilTuesday);
  result.weeklyResetMs = weekly.getTime();

  const daily = new Date(now);
  daily.setUTCHours(17, 0, 0, 0);
  if (daily <= now) daily.setUTCDate(daily.getUTCDate() + 1);
  result.dailyResetMs = daily.getTime();

  // ── 5. LIVE ACTIVITIES via Bungie Milestones ──
  try {
    const milestoneRes = await fetch(
      'https://www.bungie.net/Platform/Destiny2/Milestones/',
      { headers: { 'X-API-Key': API_KEY } }
    );
    const milestoneData = await milestoneRes.json();
    const milestones = milestoneData?.Response ?? {};

    // Well-known milestone hash → display info
    const MILESTONE_MAP = {
      '2171429505': { name: 'Nightfall: The Ordeal', icon: '⚡', badge: 'actief',    badgeClass: 'badge-live'  },
      '3899487295': { name: 'Weekly Story',          icon: '📖', badge: 'featured',  badgeClass: 'badge-hot'   },
      '3173648095': { name: 'Crucible',              icon: '🎯', badge: 'actief',    badgeClass: 'badge-live'  },
      '3172444947': { name: 'Gambit',                icon: '🗡️', badge: 'actief',    badgeClass: 'badge-live'  },
      '3847642514': { name: 'Vanguard Ops',          icon: '🏃', badge: 'actief',    badgeClass: 'badge-live'  },
      '2712317338': { name: 'Featured Raid',         icon: '🏰', badge: 'featured',  badgeClass: 'badge-hot'   },
      '3603098564': { name: 'Featured Dungeon',      icon: '🌑', badge: 'featured',  badgeClass: 'badge-hot'   },
      '3753505781': { name: 'Iron Banner',           icon: '🛡️', badge: 'event',     badgeClass: 'badge-event' },
      '1365342439': { name: 'Trials of Osiris',      icon: '☀️', badge: 'event',     badgeClass: 'badge-event' },
    };

    const activities = [];

    for (const [hash, data] of Object.entries(milestones)) {
      const preset = MILESTONE_MAP[hash];
      if (!preset && !data.activities?.length) continue;

      let activityName = preset?.name ?? null;
      let activitySub  = null;
      let icon         = preset?.icon ?? '🎮';
      let badge        = preset?.badge ?? 'actief';
      let badgeClass   = preset?.badgeClass ?? 'badge-live';

      // Fetch activity definition for real name + subtitle
      if (data.activities?.length) {
        const act = data.activities[0];
        try {
          const defRes = await fetch(
            `https://www.bungie.net/Platform/Destiny2/Manifest/DestinyActivityDefinition/${act.activityHash}/`,
            { headers: { 'X-API-Key': API_KEY } }
          );
          const def = (await defRes.json())?.Response;
          if (def) {
            if (!activityName) activityName = def.displayProperties?.name;
            activitySub = def.displayProperties?.description ?? null;
            // Sla het echte Bungie-icoon op
            const iconPath = def.displayProperties?.icon;
            if (iconPath) result._activityIconTmp = 'https://www.bungie.net' + iconPath;

            // Try to get the destination/place as subtitle
            if (def.destinationHash) {
              try {
                const destRes = await fetch(
                  `https://www.bungie.net/Platform/Destiny2/Manifest/DestinyDestinationDefinition/${def.destinationHash}/`,
                  { headers: { 'X-API-Key': API_KEY } }
                );
                const dest = (await destRes.json())?.Response;
                if (dest?.displayProperties?.name) activitySub = dest.displayProperties.name;
              } catch {}
            }
          }
        } catch {}
      }

      if (activityName) {
        activities.push({
          name: activityName,
          sub:  activitySub ?? 'Beschikbaar deze week',
          icon,
          imgUrl: result._activityIconTmp ?? null,
          badge,
          badgeClass,
        });
        delete result._activityIconTmp;
      }

      if (activities.length >= 5) break;
    }

    result.activities = activities.length > 0 ? activities : null;
  } catch (e) {
    console.error('[activities] Fout:', e.message);
    result.activities = null;
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
  return res.status(200).json(result);
}
