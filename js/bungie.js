// ============================================================
// GUARDIANHQ — js/bungie.js
// Bungie API client — veilig, geen secrets in de frontend
// CLIENT_SECRET staat in api/bungie-auth.js (Vercel)
// ============================================================

const BUNGIE_API_KEY   = '4dfc76257eaa472da8d633b338850d21';
const BUNGIE_CLIENT_ID = '51930';
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
  localStorage.setItem('bungie_membership_id', data.membership_id);
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
  const t = getBungieTokens();
  return !!(t.access_token && t.membership_id);
}

function clearBungieTokens() {
  ['bungie_access_token','bungie_refresh_token','bungie_token_expires','bungie_membership_id',
   'bungie_platform','bungie_destiny_id','bungie_profile'].forEach(k => localStorage.removeItem(k));
}

function bungieLogin() {
  const state = Math.random().toString(36).slice(2);
  localStorage.setItem('bungie_oauth_state', state);
  const url = `${OAUTH_URL}?client_id=${BUNGIE_CLIENT_ID}&response_type=code&state=${state}`;
  window.location.href = url;
}

async function handleBungieCallback() {
  const params = new URLSearchParams(window.location.search);
  const code   = params.get('code');
  const state  = params.get('state');
  if (!code) return false;

  const savedState = localStorage.getItem('bungie_oauth_state');
  if (savedState && state !== savedState) {
    console.error('OAuth state mismatch!');
    return false;
  }
  localStorage.removeItem('bungie_oauth_state');

  const res  = await fetch(TOKEN_FUNCTION, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ code, grant_type: 'authorization_code' }),
  });
  const data = await res.json();
  if (data.error) { console.error('Token exchange mislukt:', data.error); return false; }

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

async function bungieGet(endpoint) {
  const token   = await getValidToken();
  const headers = { 'X-API-Key': BUNGIE_API_KEY };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res  = await fetch(BUNGIE_ROOT + endpoint, { headers });
  const data = await res.json();
  if (data.ErrorCode !== 1) throw new Error(data.Message || 'Bungie API fout');
  return data.Response;
}

async function getBungieProfile() {
  return await bungieGet('/User/GetCurrentUser/');
}

async function getDestinyMemberships() {
  const profile     = await getBungieProfile();
  const memberships = profile.destinyMemberships;
  if (!memberships || !memberships.length) throw new Error('Geen Destiny account gevonden');
  const m = memberships[0];
  localStorage.setItem('bungie_platform',    m.membershipType.toString());
  localStorage.setItem('bungie_destiny_id',  m.membershipId);
  localStorage.setItem('bungie_display_name', profile.uniqueName || m.bungieGlobalDisplayName || '');
  return { membership: m, bungieUser: profile };
}

async function getCharacters(membershipType, membershipId) {
  return await bungieGet(
    `/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,200,204,205`
  );
}

async function loadBungieProfileData() {
  try {
    const { membership, bungieUser } = await getDestinyMemberships();
    const profile = await getCharacters(membership.membershipType, membership.membershipId);

    const characters = profile.characters?.data;
    if (!characters) return;

    // Bungie naam tonen
    const bungieNameEl = document.getElementById('profileId');
    const displayName  = bungieUser.uniqueName || bungieUser.displayName || '';
    if (bungieNameEl && displayName) {
      bungieNameEl.textContent = 'Bungie: ' + displayName;
    }

    // Alle characters verwerken
    const classNames  = { 0: 'Titan', 1: 'Hunter', 2: 'Warlock' };
    const classIcons  = { 0: '🛡️', 1: '🏹', 2: '✨' };
    const charIds     = Object.keys(characters);
    const charBtns    = document.querySelectorAll('.char-btn');

    let totalMinutes = 0;
    let highestPower = 0;

    charIds.forEach((charId, idx) => {
      const char      = characters[charId];
      const className = classNames[char.classType] || 'Guardian';
      const icon      = classIcons[char.classType] || '⚔️';
      const power     = char.light || 0;
      const minutes   = parseInt(char.minutesPlayedTotal || 0);

      totalMinutes += minutes;
      if (power > highestPower) highestPower = power;

      // Update character knop
      if (charBtns[idx]) {
        charBtns[idx].innerHTML = `
          <span class="class-icon">${icon}</span>
          ${className}
          <div class="class-power">${power}</div>
        `;
      }
    });

    // Power level
    const powerEl = document.querySelector('[data-bungie="power"]');
    if (powerEl && highestPower > 0) powerEl.textContent = highestPower;

    // Uren gespeeld
    const hoursEl = document.getElementById('hoursPlayed');
    if (hoursEl && totalMinutes > 0) {
      hoursEl.textContent = Math.floor(totalMinutes / 60).toLocaleString('nl-NL');
    }

    // Knop updaten naar "gekoppeld"
    const linkBtn = document.getElementById('bungieLinkBtn');
    if (linkBtn) {
      linkBtn.textContent       = '✓ Bungie Gekoppeld';
      linkBtn.style.background  = 'rgba(76,175,130,0.15)';
      linkBtn.style.borderColor = 'rgba(76,175,130,0.4)';
      linkBtn.style.color       = '#4caf82';
      linkBtn.onclick = () => {
        if (confirm('Bungie account ontkoppelen?')) {
          clearBungieTokens();
          location.reload();
        }
      };
    }

    return { characters, membership };

  } catch (err) {
    console.warn('Bungie data laden mislukt:', err.message);
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
