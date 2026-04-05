// ============================================================
// GUARDIANHQ — js/bungie.js
// Bungie API client — veilig, geen secrets in de frontend
// CLIENT_SECRET staat in netlify/functions/bungie-auth.js
// ============================================================

const BUNGIE_API_KEY   = '4dfc76257eaa472da8d633b338850d21';
const BUNGIE_CLIENT_ID = '51930';
const BUNGIE_ROOT     = 'https://www.bungie.net/Platform';
const OAUTH_URL       = 'https://www.bungie.net/en/OAuth/Authorize';
const TOKEN_FUNCTION  = '/api/bungie-auth'; // Netlify function (veilig)

// ── Subclass kleuren voor thema ───────────────────────────────
const SUBCLASS_THEMES = {
  arc:    { color: '#79c3f4', glow: 'rgba(121,195,244,0.15)', label: 'Arc' },
  solar:  { color: '#f0711c', glow: 'rgba(240,113,28,0.15)',  label: 'Solar' },
  void:   { color: '#b975f0', glow: 'rgba(185,117,240,0.15)', label: 'Void' },
  strand: { color: '#4eeba0', glow: 'rgba(78,235,160,0.15)',  label: 'Strand' },
  stasis: { color: '#4d9ef7', glow: 'rgba(77,158,247,0.15)',  label: 'Stasis' },
};

// ── Token opslag (nooit de secret opslaan!) ──────────────────
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
   'bungie_platform','bungie_profile'].forEach(k => localStorage.removeItem(k));
}

// ── OAuth stap 1: stuur gebruiker naar Bungie ─────────────────
function bungieLogin() {
  const state = Math.random().toString(36).slice(2);
  localStorage.setItem('bungie_oauth_state', state); // localStorage overleeft redirect
  const url = `${OAUTH_URL}?client_id=${BUNGIE_CLIENT_ID}&response_type=code&state=${state}`;
  window.location.href = url;
}

// ── OAuth stap 2: verwerk de code die Bungie terugstuurt ──────
async function handleBungieCallback() {
  const params = new URLSearchParams(window.location.search);
  const code   = params.get('code');
  const state  = params.get('state');

  if (!code) return false;

  // State check (beschermt tegen CSRF aanvallen)
  const savedState = localStorage.getItem('bungie_oauth_state');
  if (savedState && state !== savedState) {
    console.error('OAuth state mismatch!');
    return false;
  }
  localStorage.removeItem('bungie_oauth_state');

  // Stuur code naar onze Netlify function (CLIENT_SECRET blijft op server)
  const res  = await fetch(TOKEN_FUNCTION, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ code, grant_type: 'authorization_code' }),
  });
  const data = await res.json();

  if (data.error) {
    console.error('Token exchange mislukt:', data.error);
    return false;
  }

  saveBungieTokens(data);

  // Verwijder code uit URL zonder pagina te herladen
  window.history.replaceState({}, '', window.location.pathname);
  return true;
}

// ── Token vernieuwen als hij bijna verlopen is ────────────────
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

// ── Haal een geldig access token op (vernieuwt automatisch) ───
async function getValidToken() {
  const t = getBungieTokens();
  if (!t.access_token) return null;

  // Vernieuw als minder dan 5 minuten geldig
  if (Date.now() > t.expires_at - 300000) {
    const ok = await refreshBungieToken();
    if (!ok) return null;
    return getBungieTokens().access_token;
  }
  return t.access_token;
}

// ── Basis API call helper ─────────────────────────────────────
async function bungieGet(endpoint) {
  const token  = await getValidToken();
  const headers = { 'X-API-Key': BUNGIE_API_KEY };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res  = await fetch(BUNGIE_ROOT + endpoint, { headers });
  const data = await res.json();

  if (data.ErrorCode !== 1) {
    throw new Error(data.Message || 'Bungie API fout');
  }
  return data.Response;
}

// ── Haal gebruikersprofiel op ─────────────────────────────────
async function getBungieProfile() {
  return await bungieGet('/User/GetCurrentUser/');
}

// ── Haal Destiny membership op ───────────────────────────────
async function getDestinyMemberships() {
  const profile = await getBungieProfile();
  const memberships = profile.destinyMemberships;
  if (!memberships || !memberships.length) throw new Error('Geen Destiny account gevonden');

  // Sla membership op voor later gebruik
  const m = memberships[0];
  localStorage.setItem('bungie_platform',    m.membershipType.toString());
  localStorage.setItem('bungie_destiny_id',  m.membershipId);
  return m;
}

// ── Haal characters + stats op ───────────────────────────────
async function getCharacters(membershipType, membershipId) {
  return await bungieGet(
    `/Destiny2/${membershipType}/Profile/${membershipId}/?components=200,204,205`
  );
}

// ── Haal historische stats op (K/D, uren gespeeld etc.) ──────
async function getHistoricalStats(membershipType, membershipId, characterId) {
  return await bungieGet(
    `/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/`
  );
}

// ── Haal uitgerust wapen op ───────────────────────────────────
async function getEquippedItems(membershipType, membershipId, characterId) {
  return await bungieGet(
    `/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/?components=205`
  );
}

// ── Pas subclass thema toe op de pagina ──────────────────────
function applySubclassTheme(subclassName) {
  const key   = (subclassName || '').toLowerCase();
  const theme = Object.entries(SUBCLASS_THEMES).find(([k]) => key.includes(k));
  if (!theme) return;

  const [, t] = theme;
  document.documentElement.style.setProperty('--subclass-color', t.color);
  document.documentElement.style.setProperty('--subclass-glow',  t.glow);

  // Pas profiel hero achtergrond aan
  const hero = document.querySelector('.profile-hero');
  if (hero) {
    hero.style.background = `linear-gradient(180deg, ${t.glow} 0%, transparent 100%)`;
    hero.style.borderBottomColor = t.color + '33';
  }
}

// ── Vul profiel pagina met echte Bungie data ──────────────────
async function loadBungieProfileData() {
  try {
    const membership = await getDestinyMemberships();
    const profile    = await getCharacters(membership.membershipType, membership.membershipId);

    const characters = profile.characters?.data;
    if (!characters) return;

    // Pak eerste character
    const charId = Object.keys(characters)[0];
    const char   = characters[charId];

    // Power level
    const power = char.light;
    const powerEl = document.querySelector('[data-bungie="power"]');
    if (powerEl) powerEl.textContent = power;

    // Class naam
    const classNames = { 0: 'Titan', 1: 'Hunter', 2: 'Warlock' };
    const className  = classNames[char.classType] || 'Guardian';

    // Subclass thema
    const subclassHashes = { 0: 'titan', 1: 'hunter', 2: 'warlock' };
    // (echte subclass data vereist extra API call, dit is een basis versie)

    // Uren gespeeld (minuten → uren)
    const minutesEl = document.querySelector('[data-bungie="minutes"]');
    if (minutesEl) {
      const hours = Math.floor(char.minutesPlayedTotal / 60);
      minutesEl.textContent = hours.toLocaleString('nl-NL');
    }

    // Markeer als gekoppeld
    const linkBtn = document.getElementById('bungieLinkBtn');
    if (linkBtn) {
      linkBtn.textContent = '✓ Bungie Gekoppeld';
      linkBtn.style.background = 'rgba(76,175,130,0.15)';
      linkBtn.style.borderColor = 'rgba(76,175,130,0.4)';
      linkBtn.style.color = '#4caf82';
      linkBtn.onclick = () => {
        if (confirm('Bungie account ontkoppelen?')) {
          clearBungieTokens();
          location.reload();
        }
      };
    }

    return { char, membership, charId };

  } catch (err) {
    console.warn('Bungie data laden mislukt:', err.message);
    return null;
  }
}
