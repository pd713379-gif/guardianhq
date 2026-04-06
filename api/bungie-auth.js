// ============================================================
// GUARDIANHQ — api/bungie-auth.js
// Vercel Serverless Function — Bungie OAuth + API proxy
// ============================================================

e// ============================================================
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
    console.error('[bungie-auth] Omgevingsvariabelen ontbreken:', { CLIENT_ID: !!CLIENT_ID, CLIENT_SECRET: !!CLIENT_SECRET });
    return res.status(500).json({ error: 'Server niet geconfigureerd.' });
  }

  try {
    // Bescherm tegen lege of ongeldige body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Ongeldige request body.' });
    }

    const { code, refresh_token, grant_type, action, endpoint, access_token } = req.body;

    console.log('[bungie-auth] Request ontvangen:', { action, grant_type, hasCode: !!code, hasRefresh: !!refresh_token, hasToken: !!access_token });

    // ── API PROXY — haal Bungie data op via server ──────────
    if (action === 'api') {
      if (!endpoint || !access_token) {
        return res.status(400).json({ error: 'Endpoint en access_token zijn verplicht voor api-actie.' });
      }

      const url = 'https://www.bungie.net/Platform' + endpoint;
      console.log('[bungie-auth] API proxy aanroep:', url);

      const response = await fetch(url, {
        headers: {
          'X-API-Key':     API_KEY,
          'Authorization': 'Bearer ' + access_token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[bungie-auth] Bungie API fout:', response.status, data);
        return res.status(response.status).json({ error: 'Bungie API fout.', detail: data });
      }

      return res.status(200).json(data);
    }

    // ── TOKEN EXCHANGE ────────────────────────────────────────
    let body;

    if (grant_type === 'refresh_token' && refresh_token) {
      console.log('[bungie-auth] Token vernieuwen via refresh_token...');
      body = new URLSearchParams({
        grant_type:    'refresh_token',
        refresh_token,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });
    } else if (code) {
      console.log('[bungie-auth] Token ophalen via authorization_code...');
      body = new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });
    } else {
      console.warn('[bungie-auth] Geen geldige actie, code of refresh_token ontvangen. Body:', req.body);
      return res.status(400).json({ error: 'Geen geldige actie, code of refresh_token meegestuurd.' });
    }

    const response = await fetch('https://www.bungie.net/platform/app/oauth/token/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[bungie-auth] Token exchange mislukt:', response.status, data);
      return res.status(response.status).json({
        error: data.error_description || 'Bungie token exchange mislukt.',
      });
    }

    console.log('[bungie-auth] Token exchange geslaagd voor membership_id:', data.membership_id);

    return res.status(200).json({
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_in:    data.expires_in,
      membership_id: data.membership_id,
    });

  } catch (err) {
    console.error('[bungie-auth] Onverwachte serverfout:', err);
    return res.status(500).json({ error: 'Server fout: ' + err.message });
  }
}

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
