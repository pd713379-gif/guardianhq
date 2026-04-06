// ============================================================
// GUARDIANHQ — api/bungie-auth.js
// Vercel Serverless Function — Bungie OAuth + API proxy
// ============================================================

export default async function handler(req, res) {
  // ── CORS & Headers ────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── Configuratie ──────────────────────────────────────────
  const CLIENT_ID     = process.env.BUNGIE_CLIENT_ID;
  const CLIENT_SECRET = process.env.BUNGIE_CLIENT_SECRET;
  const API_KEY       = process.env.BUNGIE_API_KEY || '8dde842300df4ffbae605b0f48cf43f9';

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('[bungie-auth] Omgevingsvariabelen ontbreken:', {
      CLIENT_ID:     !!CLIENT_ID,
      CLIENT_SECRET: !!CLIENT_SECRET,
    });
    return res.status(500).json({ error: 'Server niet geconfigureerd. Omgevingsvariabelen ontbreken.' });
  }

  try {
    // ── Body parsen ───────────────────────────────────────────
    let body = req.body;

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Ongeldige JSON in request body.' });
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Request body ontbreekt of is ongeldig.' });
    }

    const { code, refresh_token, grant_type, action, endpoint, access_token } = body;

    console.log('[bungie-auth] Request ontvangen:', {
      action,
      grant_type,
      hasCode:         !!code,
      hasRefreshToken: !!refresh_token,
      hasAccessToken:  !!access_token,
      endpoint:        endpoint || null,
    });

    // ── API PROXY ─────────────────────────────────────────────
    if (action === 'api') {
      if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint is verplicht voor api-actie.' });
      }
      if (!access_token) {
        return res.status(400).json({ error: 'access_token is verplicht voor api-actie.' });
      }

      const url = 'https://www.bungie.net/Platform' + endpoint;
      console.log('[bungie-auth] API proxy aanroep:', url);

      const apiRes = await fetch(url, {
        headers: {
          'X-API-Key':     API_KEY,
          'Authorization': 'Bearer ' + access_token,
        },
      });

      const contentType = apiRes.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await apiRes.text();
        console.error('[bungie-auth] Bungie API stuurde geen JSON:', text.slice(0, 300));
        return res.status(500).json({ error: 'Bungie API stuurde geen geldige JSON terug.' });
      }

      const data = await apiRes.json();

      if (!apiRes.ok) {
        console.error('[bungie-auth] Bungie API fout:', apiRes.status, data);
        return res.status(apiRes.status).json({
          error:  'Bungie API fout.',
          detail: data,
        });
      }

      return res.status(200).json(data);
    }

    // ── TOKEN EXCHANGE ────────────────────────────────────────
    let tokenBody;

    if (grant_type === 'refresh_token' && refresh_token) {
      console.log('[bungie-auth] Token vernieuwen via refresh_token...');
      tokenBody = new URLSearchParams({
        grant_type:    'refresh_token',
        refresh_token,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });
    } else if (code) {
      console.log('[bungie-auth] Token ophalen via authorization_code...');
      tokenBody = new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });
    } else {
      console.warn('[bungie-auth] Geen geldige actie, code of refresh_token ontvangen.');
      return res.status(400).json({
        error: 'Geen geldige actie, code of refresh_token meegestuurd.',
      });
    }

    const tokenRes = await fetch('https://www.bungie.net/platform/app/oauth/token/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    tokenBody.toString(),
    });

    const tokenContentType = tokenRes.headers.get('content-type') || '';
    if (!tokenContentType.includes('application/json')) {
      const text = await tokenRes.text();
      console.error('[bungie-auth] Token exchange geen JSON:', text.slice(0, 300));
      return res.status(500).json({ error: 'Bungie token response was geen geldige JSON.' });
    }

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error('[bungie-auth] Token exchange mislukt:', tokenRes.status, tokenData);
      return res.status(tokenRes.status).json({
        error: tokenData.error_description || 'Bungie token exchange mislukt.',
      });
    }

    console.log('[bungie-auth] Token exchange geslaagd voor membership_id:', tokenData.membership_id);

    return res.status(200).json({
      access_token:  tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in:    tokenData.expires_in,
      membership_id: tokenData.membership_id,
    });

  } catch (err) {
    console.error('[bungie-auth] Onverwachte serverfout:', err);
    return res.status(500).json({ error: 'Onverwachte server fout: ' + err.message });
  }
}
