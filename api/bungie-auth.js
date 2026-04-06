// ============================================================
// GUARDIANHQ — api/bungie-auth.js
// Vercel Serverless Function — Bungie OAuth + API proxy
// ============================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const CLIENT_ID     = process.env.BUNGIE_CLIENT_ID;
  const CLIENT_SECRET = process.env.BUNGIE_CLIENT_SECRET;
  const API_KEY       = '8dde842300df4ffbae605b0f48cf43f9';

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: 'Server niet geconfigureerd.' });
  }

  try {
    const { code, refresh_token, grant_type, action, endpoint, access_token } = req.body;

    // ── API PROXY — haal Bungie data op via server ──────────
    if (action === 'api' && endpoint && access_token) {
      const response = await fetch('https://www.bungie.net/Platform' + endpoint, {
        headers: {
          'X-API-Key':     API_KEY,
          'Authorization': 'Bearer ' + access_token,
        },
      });
      const data = await response.json();
      return res.status(200).json(data);
    }

    // ── TOKEN EXCHANGE ────────────────────────────────────────
    let body;
    if (grant_type === 'refresh_token' && refresh_token) {
      body = new URLSearchParams({
        grant_type:    'refresh_token',
        refresh_token,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });
    } else if (code) {
      body = new URLSearchParams({
        grant_type:   'authorization_code',
        code,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });
    } else {
      return res.status(400).json({ error: 'Geen code of refresh_token meegestuurd.' });
    }

    const response = await fetch('https://www.bungie.net/platform/app/oauth/token/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error_description || 'Bungie token exchange mislukt.'
      });
    }

    return res.status(200).json({
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_in:    data.expires_in,
      membership_id: data.membership_id,
    });

  } catch (err) {
    return res.status(500).json({ error: 'Server fout: ' + err.message });
  }
}
