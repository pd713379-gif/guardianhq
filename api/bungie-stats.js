// ============================================================
// GUARDIANHQ — api/bungie-stats.js
// Vercel Serverless Function — Bungie + Steam Live Stats
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

  // ── 3. BUNGIE SEASON INFO (Power Cap + Season naam + einddatum) ──
  try {
    const settingsRes = await fetch('https://www.bungie.net/Platform/Settings/', {
      headers: { 'X-API-Key': API_KEY }
    });
    const settingsData = await settingsRes.json();
    const destiny = settingsData?.Response?.destiny2CoreSettings;

    result.currentSeasonHash = destiny?.currentSeasonHash ?? null;
    result.powerFloor = destiny?.powerFloor ?? null;
    result.softCap = destiny?.softCap ?? null;
    result.powerCap = destiny?.powerCap ?? null;
    result.pinnacleFloor = destiny?.pinnacleFloor ?? null;

  } catch (e) {
    result.powerCap = null;
  }

  // ── 4. WEEKLY + DAILY RESET (berekend server-side) ──
  const now = new Date();
  // Weekly reset = elke dinsdag 17:00 UTC
  const weekly = new Date(now);
  weekly.setUTCHours(17, 0, 0, 0);
  const dayOfWeek = weekly.getUTCDay();
  const daysUntilTuesday = (2 - dayOfWeek + 7) % 7 || 7;
  weekly.setUTCDate(weekly.getUTCDate() + daysUntilTuesday);
  result.weeklyResetMs = weekly.getTime();

  // Daily reset = elke dag 17:00 UTC
  const daily = new Date(now);
  daily.setUTCHours(17, 0, 0, 0);
  if (daily <= now) daily.setUTCDate(daily.getUTCDate() + 1);
  result.dailyResetMs = daily.getTime();

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  return res.status(200).json(result);
}
