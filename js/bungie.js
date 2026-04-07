
// ============================================================
// GUARDIANHQ — js/bungie.js
// ============================================================

const BUNGIE_CLIENT_ID = '51944';
const OAUTH_URL        = 'https://www.bungie.net/en/OAuth/Authorize';
const TOKEN_FUNCTION   = '/api/bungie-auth';

const SUBCLASS_THEMES = {
  arc:    { color: '#79c3f4', glow: 'rgba(121,195,244,0.15)' },
  solar:  { color: '#f0711c', glow: 'rgba(240,113,28,0.15)'  },
  void:   { color: '#b975f0', glow: 'rgba(185,117,240,0.15)' },
  strand: { color: '#4eeba0', glow: 'rgba(78,235,160,0.15)'  },
  stasis: { color: '#4d9ef7', glow: 'rgba(77,158,247,0.15)'  },
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

function isBungieLinked() { return !!(getBungieTokens().access_token); }

function clearBungieTokens() {
  ['bungie_access_token','bungie_refresh_token','bungie_token_expires',
   'bungie_membership_id','bungie_platform','bungie_destiny_id','bungie_display_name']
  .forEach(function(k) { localStorage.removeItem(k); });
}

function bungieLogin() {
  var state = Math.random().toString(36).slice(2);
  localStorage.setItem('bungie_oauth_state', state);
  window.location.href = OAUTH_URL + '?client_id=' + BUNGIE_CLIENT_ID + '&response_type=code&state=' + state;
}

async function handleBungieCallback() {
  var params = new URLSearchParams(window.location.search);
  var code = params.get('code'), state = params.get('state');
  if (!code) return false;
  var savedState = localStorage.getItem('bungie_oauth_state');
  if (savedState && state !== savedState) { console.error('State mismatch'); return false; }
  localStorage.removeItem('bungie_oauth_state');
  var res  = await fetch(TOKEN_FUNCTION, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({code, grant_type:'authorization_code'}) });
  var data = await res.json();
  if (data.error) { console.error('Token fout:', data.error); return false; }
  saveBungieTokens(data);
  window.history.replaceState({}, '', window.location.pathname);
  return true;
}

async function refreshBungieToken() {
  var t = getBungieTokens();
  if (!t.refresh_token) return false;
  var res  = await fetch(TOKEN_FUNCTION, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({refresh_token:t.refresh_token, grant_type:'refresh_token'}) });
  var data = await res.json();
  if (data.error) return false;
  saveBungieTokens(data);
  return true;
}

async function getValidToken() {
  var t = getBungieTokens();
  if (!t.access_token) return null;
  if (Date.now() > t.expires_at - 300000) {
    if (!await refreshBungieToken()) return null;
    return getBungieTokens().access_token;
  }
  return t.access_token;
}

async function bungieGet(endpoint) {
  var token = await getValidToken();
  if (!token) throw new Error('Geen geldige token');
  console.log('Bungie API via server:', endpoint);
  var res  = await fetch(TOKEN_FUNCTION, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'api', endpoint, access_token:token}) });
  var data = await res.json();
  if (data.ErrorCode && data.ErrorCode !== 1) throw new Error(data.Message || 'Bungie API fout ' + data.ErrorCode);
  return data.Response;
}

function setEl(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

async function loadBungieProfileData() {
  try {
    var user = await bungieGet('/User/GetMembershipsForCurrentUser/');
    var memberships = user.destinyMemberships;
    if (!memberships || !memberships.length) throw new Error('Geen Destiny account');

    var displayName = user.bungieNetUser && (user.bungieNetUser.uniqueName || user.bungieNetUser.displayName) || '';
    var nameEl = document.getElementById('profileId');
    if (nameEl && displayName) nameEl.textContent = 'Bungie: ' + displayName;

    var m = memberships[0];
    for (var i = 0; i < memberships.length; i++) {
      if (memberships[i].crossSaveOverride === memberships[i].membershipType) { m = memberships[i]; break; }
    }
    localStorage.setItem('bungie_platform',   m.membershipType.toString());
    localStorage.setItem('bungie_destiny_id', m.membershipId);

    var profile    = await bungieGet('/Destiny2/' + m.membershipType + '/Profile/' + m.membershipId + '/?components=100,200');
    var characters = profile.characters && profile.characters.data;
    if (!characters) { console.warn('Geen characters'); return null; }

    var classNames = {0:'Titan',1:'Hunter',2:'Warlock'};
    var classIcons = {0:'🛡️',1:'🏹',2:'✨'};
    var charIds    = Object.keys(characters);
    var charBtns   = document.querySelectorAll('.char-btn');
    var totalMinutes = 0, highestPower = 0;

    charIds.forEach(function(charId, idx) {
      var char = characters[charId];
      var power = char.light || 0, minutes = parseInt(char.minutesPlayedTotal || 0);
      totalMinutes += minutes;
      if (power > highestPower) highestPower = power;
      if (charBtns[idx]) {
        charBtns[idx].innerHTML = '<span class="class-icon">' + (classIcons[char.classType]||'⚔️') + '</span>' + (classNames[char.classType]||'Guardian') + '<div class="class-power">' + power + '</div>';
      }
    });

    var powerEl = document.querySelector('[data-bungie="power"]');
    if (powerEl && highestPower > 0) powerEl.textContent = highestPower;
    if (totalMinutes > 0) setEl('hoursPlayed', Math.floor(totalMinutes / 60).toLocaleString('nl-NL'));

    // Stats (K/D)
    try {
      var stats  = await bungieGet('/Destiny2/' + m.membershipType + '/Account/' + m.membershipId + '/Stats/');
      var merged = stats && stats.mergedAllCharacters && stats.mergedAllCharacters.results;
      var pvp    = merged && merged.allPvP && merged.allPvP.allTime;
      var pve    = merged && merged.allPvE && merged.allPvE.allTime;

      if (pvp && pvp.killsDeathsRatio) setEl('kdPvp',     pvp.killsDeathsRatio.basic.displayValue);
      if (pve && pve.killsDeathsRatio) setEl('kdPve',     pve.killsDeathsRatio.basic.displayValue);
      if (pvp && pvp.killsDeathsRatio && pve && pve.killsDeathsRatio) {
        var overall = ((parseFloat(pvp.killsDeathsRatio.basic.value) + parseFloat(pve.killsDeathsRatio.basic.value)) / 2).toFixed(2);
        setEl('kdOverall', overall);
      }
      if (pve && pve.activitiesCleared) setEl('activitiesCleared', Math.round(pve.activitiesCleared.basic.value).toLocaleString('nl-NL'));
      console.log('✅ Stats geladen');
    } catch(statsErr) { console.warn('Stats laden mislukt:', statsErr.message); }

    var linkBtn = document.getElementById('bungieLinkBtn');
    if (linkBtn) {
      linkBtn.textContent       = '✓ Bungie Gekoppeld';
      linkBtn.style.background  = 'rgba(76,175,130,0.15)';
      linkBtn.style.borderColor = 'rgba(76,175,130,0.4)';
      linkBtn.style.color       = '#4caf82';
      linkBtn.onclick = function() { if (confirm('Ontkoppelen?')) { clearBungieTokens(); location.reload(); } };
    }

    console.log('✅ Power:', highestPower, '| Uren:', Math.floor(totalMinutes/60));
    return { characters, membership: m };

  } catch(err) {
    console.warn('❌ Bungie laden mislukt:', err.message);
    return null;
  }
}

function applySubclassTheme(subclassName) {
  var key = (subclassName || '').toLowerCase(), found = null;
  Object.keys(SUBCLASS_THEMES).forEach(function(k) { if (!found && key.indexOf(k) !== -1) found = SUBCLASS_THEMES[k]; });
  if (!found) return;
  document.documentElement.style.setProperty('--subclass-color', found.color);
  document.documentElement.style.setProperty('--subclass-glow',  found.glow);
  var hero = document.querySelector('.profile-hero');
  if (hero) {
    hero.style.background        = 'linear-gradient(180deg, ' + found.glow + ' 0%, transparent 100%)';
    hero.style.borderBottomColor = found.color + '33';
  }
}
