// ============================================================
// GUARDIANHQ — api/bungie-auth.js
// Vercel Serverless Function — Bungie OAuth + API proxy
// ============================================================
// ============================================================
// GUARDIANHQ — js/bungie.js
// ============================================================

const BUNGIE_API_KEY   = '8dde842300df4ffbae605b0f48cf43f9';
const BUNGIE_CLIENT_ID = '51944';
const BUNGIE_ROOT      = 'https://www.bungie.net/Platform';
const OAUTH_URL        = 'https://www.bungie.net/en/OAuth/Authorize';
const TOKEN_FUNCTION   = '/api/bungie-auth';

const SUBCLASS_THEMES = {
  arc:    { color: '#79c3f4', glow: 'rgba(121,195,244,0.15)', label: 'Arc' },
  solar:  { color: '#f0711c', glow: 'rgba(240,113,28,0.15)',  label: 'Solar' },
  void:   { color: '#b975f0', glow: 'rgba(185,117,240,0.15)', label: 'Void' },
  strand: { color: '#4eeba0', glow: 'rgba(78,235,160,0.15)',  label: 'Strand' },
  stasis: { color: '#4d9ef7', glow: 'rgba(77,158,247,0.15)',  label: 'Stasis' },
};

function saveBungieTokens(data) {
  const expires = Date.now() + (data.expires_in * 1000);
  localStorage.setItem('bungie_access_token',  data.access_token);
  localStorage.setItem('bungie_refresh_token', data.refresh_token);
  localStorage.setItem('bungie_token_expires', expires.toString());
  if (data.membership_id) localStorage.setItem('bungie_membership_id', data.membership_id);
}

function getBungieTokens() {
  return {
    access_token:  localStorage.getItem('bungie_access_token'),
    refresh_token: localStorage.getItem('bungie_refresh_token'),
    expires_at:    parseInt(localStorage.getItem('bungie_token_expires') || '0'),
    membership_id: localStorage.getItem('bungie_membership_id'),
  };
}

function isBungieLinked() {
  return !!(getBungieTokens().access_token);
}

function clearBungieTokens() {
  ['bungie_access_token','bungie_refresh_token','bungie_token_expires','bungie_membership_id',
   'bungie_platform','bungie_destiny_id','bungie_display_name'].forEach(k => localStorage.removeItem(k));
}

function bungieLogin() {
  const state = Math.random().toString(36).slice(2);
  localStorage.setItem('bungie_oauth_state', state);
  window.location.href = `${OAUTH_URL}?client_id=${BUNGIE_CLIENT_ID}&response_type=code&state=${state}`;
}

async function handleBungieCallback() {
  const params     = new URLSearchParams(window.location.search);
  const code       = params.get('code');
  const state      = params.get('state');
  if (!code) return false;

  const savedState = localStorage.getItem('bungie_oauth_state');
  if (savedState && state !== savedState) { console.error('State mismatch'); return false; }
  localStorage.removeItem('bungie_oauth_state');

  const res  = await fetch(TOKEN_FUNCTION, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ code, grant_type: 'authorization_code' }),
  });
  const data = await res.json();
  if (data.error) { console.error('Token fout:', data.error); return false; }

  saveBungieTokens(data);
  window.history.replaceState({}, '', window.location.pathname);
  return true;
}

async function refreshBungieToken() {
  const t = getBungieTokens();
  if (!t.refresh_token) return false;
  const res  = await fetch(TOKEN_FUNCTION, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ refresh_token: t.refresh_token, grant_type: 'refresh_token' }),
  });
  const data = await res.json();
  if (data.error) return false;
  saveBungieTokens(data);
  return true;
}

async function getValidToken() {
  const t = getBungieTokens();
  if (!t.access_token) return null;
  if (Date.now() > t.expires_at - 300000) {
    const ok = await refreshBungieToken();
    if (!ok) return null;
    return getBungieTokens().access_token;
  }
  return t.access_token;
}

// ── API calls via Vercel server (geen CORS problemen!) ────────
async function bungieGet(endpoint) {
  const token = await getValidToken();
  if (!token) throw new Error('Geen geldige token');

  console.log('Bungie API via server:', endpoint);

  const res  = await fetch(TOKEN_FUNCTION, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ action: 'api', endpoint, access_token: token }),
  });
  const data = await res.json();

  if (data.ErrorCode && data.ErrorCode !== 1) {
    throw new Error(data.Message || 'Bungie API fout ' + data.ErrorCode);
  }
  return data.Response;
}

async function loadBungieProfileData() {
  try {
    // Stap 1: haal Bungie gebruiker op via server
    const user = await bungieGet('/User/GetCurrentUser/');
    console.log('Bungie user:', user);

    const memberships = user.destinyMemberships;
    if (!memberships || !memberships.length) throw new Error('Geen Destiny account');

    // Naam tonen
    const displayName = user.uniqueName || user.displayName || '';
    const nameEl = document.getElementById('profileId');
    if (nameEl && displayName) nameEl.textContent = 'Bungie: ' + displayName;

    // Beste membership
    const m = memberships.find(x => x.crossSaveOverride === x.membershipType) || memberships[0];
    localStorage.setItem('bungie_platform',   m.membershipType.toString());
    localStorage.setItem('bungie_destiny_id', m.membershipId);

    // Stap 2: haal characters op via server
    const profile    = await bungieGet(`/Destiny2/${m.membershipType}/Profile/${m.membershipId}/?components=100,200`);
    const characters = profile.characters?.data;
    if (!characters) { console.warn('Geen characters'); return; }

    const classNames = { 0: 'Titan', 1: 'Hunter', 2: 'Warlock' };
    const classIcons = { 0: '🛡️', 1: '🏹', 2: '✨' };
    const charIds    = Object.keys(characters);
    const charBtns   = document.querySelectorAll('.char-btn');

    let totalMinutes = 0;
    let highestPower = 0;

    charIds.forEach((charId, idx) => {
      const char      = characters[charId];
      const className = classNames[char.classType] ?? 'Guardian';
      const icon      = classIcons[char.classType] ?? '⚔️';
      const power     = char.light || 0;
      const minutes   = parseInt(char.minutesPlayedTotal || 0);

      totalMinutes += minutes;
      if (power > highestPower) highestPower = power;

      if (charBtns[idx]) {
        charBtns[idx].innerHTML = `<span class="class-icon">${icon}</span>${className}<div class="class-power">${power}</div>`;
      }
    });

    const powerEl = document.querySelector('[data-bungie="power"]');
    if (powerEl && highestPower > 0) powerEl.textContent = highestPower;

    const hoursEl = document.getElementById('hoursPlayed');
    if (hoursEl && totalMinutes > 0) hoursEl.textContent = Math.floor(totalMinutes / 60).toLocaleString('nl-NL');

    const linkBtn = document.getElementById('bungieLinkBtn');
    if (linkBtn) {
      linkBtn.textContent       = '✓ Bungie Gekoppeld';
      linkBtn.style.background  = 'rgba(76,175,130,0.15)';
      linkBtn.style.borderColor = 'rgba(76,175,130,0.4)';
      linkBtn.style.color       = '#4caf82';
      linkBtn.onclick = () => { if (confirm('Ontkoppelen?')) { clearBungieTokens(); location.reload(); } };
    }

    console.log('✅ Power:', highestPower, '| Uren:', Math.floor(totalMinutes/60));
    return { characters, membership: m };

  } catch (err) {
    console.warn('❌ Bungie laden mislukt:', err.message);
    return null;
  }
}

function applySubclassTheme(subclassName) {
  const key   = (subclassName || '').toLowerCase();
  const theme = Object.entries(SUBCLASS_THEMES).find(([k]) => key.includes(k));
  if (!theme) return;
  const [, t] = theme;
  document.documentElement.style.setProperty('--subclass-color', t.color);
  document.documentElement.style.setProperty('--subclass-glow',  t.glow);
  const hero = document.querySelector('.profile-hero');
  if (hero) {
    hero.style.background        = `linear-gradient(180deg, ${t.glow} 0%, transparent 100%)`;
    hero.style.borderBottomColor = t.color + '33';
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
