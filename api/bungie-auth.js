// ============================================================
// GUARDIANHQ — api/bungie-auth.js
// Vercel Serverless Function — Veilige Bungie OAuth
// CLIENT_SECRET staat NOOIT in de frontend
// ============================================================

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, refresh_token, grant_type } = req.body;

    const CLIENT_ID     = process.env.BUNGIE_CLIENT_ID;
    const CLIENT_SECRET = process.env.BUNGIE_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({
        error: 'Server niet geconfigureerd. Stel BUNGIE_CLIENT_ID en BUNGIE_CLIENT_SECRET in als Vercel environment variables.'
      });
    }

    let body;
    if (grant_type === 'refresh_token' && refresh_token) {
      body = new URLSearchParams({
        grant_type:    'refresh_token',
        refresh_token: refresh_token,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });
    } else if (code) {
      body = new URLSearchParams({
        grant_type:   'authorization_code',
        code:          code,
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
