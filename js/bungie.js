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
  // redirect_uri MOET overeenkomen met wat in Bungie Developer Portal staat
  var redirectUri = encodeURIComponent('https://guardianhq.vercel.app/profile.html');
  window.location.href = OAUTH_URL + '?client_id=' + BUNGIE_CLIENT_ID + '&response_type=code&state=' + state + '&redirect_uri=' + redirectUri;
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
  // Token bijna verlopen (< 5 min)? Probeer te refreshen
  if (Date.now() > t.expires_at - 300000) {
    var refreshed = await refreshBungieToken();
    if (refreshed) {
      return getBungieTokens().access_token;
    }
    // Refresh mislukt maar token nog niet 100% verlopen? Gewoon doorgaan met oude token
    if (Date.now() < t.expires_at) {
      console.warn('[getValidToken] Refresh mislukt, gebruik bestaand token');
      return t.access_token;
    }
    // Token echt verlopen en refresh ook mislukt
    return null;
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

function updateCharStatBars(charId, characterStats) {
  var container = document.getElementById('charStats');
  if (!container) return;

  var rawStats = characterStats && characterStats[charId] && characterStats[charId].stats;
  if (!rawStats) return;

  // Normaliseer: char.stats geeft directe getallen, component 300 geeft {value:X}
  var stats = {};
  Object.keys(rawStats).forEach(function(k) {
    var v = rawStats[k];
    stats[k] = typeof v === 'object' ? v : { value: v };
  });

  // Bungie stat hashes
  var statMap = [
    { hash: '392767087',  label: 'Health'   },
    { hash: '4244567218', label: 'Melee'    },
    { hash: '1735777505', label: 'Grenade'  },
    { hash: '144602215',  label: 'Super'    },
    { hash: '2996146975', label: 'Mobility' },
    { hash: '1943323491', label: 'Recovery' },
  ];

  var rows = statMap.map(function(entry) {
    var hash = entry.hash, label = entry.label;
    var val = stats[hash] !== undefined ? (typeof stats[hash] === 'object' ? stats[hash].value : stats[hash]) : 0;
    // Balk: max 100 = 100%, boven 100 = goud/neon kleur
    var barPct = Math.min(val, 100);
    var isOver100 = val > 100;
    var barColor = isOver100
      ? 'linear-gradient(90deg,#f5c842,#ffe680)'  // goud/neon
      : 'linear-gradient(90deg,#d4a843,#f5c842)'; // normaal goud
    var valColor = isOver100 ? '#ffe680' : '';
    var valStyle = isOver100 ? 'color:#ffe680;font-weight:800;text-shadow:0 0 8px rgba(255,230,0,0.6);' : '';

    return '<div class="stat-bar-row">'
      + '<div class="stat-bar-top">'
      + '<span class="stat-bar-name">' + label + '</span>'
      + '<span class="stat-bar-val" style="' + valStyle + '">' + val + '</span>'
      + '</div>'
      + '<div class="stat-bar-track">'
      + '<div class="stat-bar-fill" style="width:' + barPct + '%;background:' + barColor + (isOver100 ? ';box-shadow:0 0 6px rgba(255,230,0,0.5)' : '') + ';"></div>'
      + '</div></div>';
  });

  container.innerHTML = rows.join('');
}

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

    var charIds    = Object.keys(characters);
    var classNames = {0:'Titan',1:'Hunter',2:'Warlock'};
    var classImgs  = {0:'img/icons/titanicon.png',1:'img/icons/huntericon.png',2:'img/icons/warlockicon.png'};

    // Sla character stats op voor gebruik bij selectChar
    // Stats zitten in characters.data[charId].stats (component 200)
    // Bouw zelfde structuur als component 300 zou geven
    var characterStats = {};
    charIds.forEach(function(charId) {
      var char = characters[charId];
      if (char && char.stats) {
        characterStats[charId] = { stats: char.stats };
      }
    });
    console.log('[charStats] keys:', Object.keys(characterStats));
    if (charIds[0] && characterStats[charIds[0]]) {
      console.log('[charStats] raw stats:', JSON.stringify(characterStats[charIds[0]].stats));
    }
    window._bungieCharIds = charIds;
    window._bungieCharStats = characterStats;
    window._bungieCharacters = characters;
    var charBtns   = document.querySelectorAll('.char-btn');
    var totalMinutes = 0, highestPower = 0;

    charIds.forEach(function(charId, idx) {
      var char = characters[charId];
      var power = char.light || 0, minutes = parseInt(char.minutesPlayedTotal || 0);
      totalMinutes += minutes;
      if (power > highestPower) highestPower = power;
      if (charBtns[idx]) {
        // Alleen power getal updaten — icoon en naam HTML niet aanraken
        var powerEl = charBtns[idx].querySelector('.class-power');
        if (powerEl) {
          powerEl.textContent = power;
        } else {
          charBtns[idx].innerHTML = '<span class="class-icon"><img src="' + (classImgs[char.classType]||'img/icons/huntericon.png') + '" width="48" height="48" style="display:block;object-fit:cover;border-radius:6px;"></span>' + (classNames[char.classType]||'Guardian') + '<div class="class-power">' + power + '</div>';
        }
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

    // Update stat bars voor eerste character
    updateCharStatBars(charIds[0], characterStats);
    console.log('✅ Power:', highestPower, '| Uren:', Math.floor(totalMinutes/60));

    // ── Recente Activiteiten ──
    try {
      await loadRecentActivities(m, charIds);
    } catch(actErr) {
      console.warn('Activiteiten laden mislukt:', actErr.message);
    }

    // ── Favoriete Wapens ──
    try {
      await loadFavWeapons(m, charIds);
    } catch(wErr) {
      console.warn('Favoriete wapens laden mislukt:', wErr.message);
    }

    return { characters, membership: m };

  } catch(err) {
    console.warn('❌ Bungie laden mislukt:', err.message);
    return null;
  }
}


async function loadFavWeapons(membership, charIds) {
  var list = document.getElementById('favWeaponsList');
  if (!list) return;
  list.innerHTML = '<div style="color:rgba(255,255,255,0.3);font-size:0.8rem;padding:12px 0;text-align:center;">Wapens laden...</div>';

  try {
    // Haal activiteiten van laatste 7 dagen op per character
    // Dan per activiteit de PGCR (post game carnage report) voor wapen gebruik
    // Maar PGCR is te zwaar — gebruik /Stats/UniqueWeapons/ zonder filter
    // en sorteer op uniqueWeaponKillsPrecisionKills ratio voor "recent" gevoel
    var allWeapons = {};

    await Promise.all(charIds.map(function(charId) {
      return bungieGet(
        '/Destiny2/' + membership.membershipType +
        '/Account/' + membership.membershipId +
        '/Character/' + charId +
        '/Stats/UniqueWeapons/'
      ).then(function(data) {
        var weapons = data && data.weapons || [];
        weapons.forEach(function(w) {
          var ref = w.referenceId;
          var kills = w.values && w.values.uniqueWeaponKills && w.values.uniqueWeaponKills.basic.value || 0;
          var lastUsed = w.values && w.values.uniqueWeaponKillsPrecisionKills && w.values.uniqueWeaponKillsPrecisionKills.basic.value || 0;
          if (!allWeapons[ref]) allWeapons[ref] = { ref: ref, kills: 0 };
          allWeapons[ref].kills += kills;
        });
      }).catch(function(){});
    }));

    // Sorteer op kills, pak top 10
    var sorted = Object.values(allWeapons).sort(function(a,b){ return b.kills - a.kills; }).slice(0, 10);

    if (sorted.length === 0) {
      list.innerHTML = '<div style="color:rgba(255,255,255,0.3);font-size:0.8rem;padding:12px 0;text-align:center;">Geen wapendata gevonden</div>';
      return;
    }

    // Haal manifest info op per wapen
    var items = [];
    await Promise.all(sorted.map(async function(w) {
      return bungieGet('/Destiny2/Manifest/DestinyInventoryItemDefinition/' + w.ref + '/').then(async function(def) {
        if (!def) return;
        var tierType = def.inventory && def.inventory.tierType || 5;
        var iconPath = def.displayProperties && def.displayProperties.icon;
        var watermark = def.iconWatermark || def.iconWatermarkShelved || null;

        // Stats
        var stats = [];
        if (def.stats && def.stats.stats) {
          var statDefs = {
            4284893193:'Snelheid', 2523465841:'Reikwijdte', 1240592695:'Schade',
            155624089:'Stabiliteit', 1345609583:'Laadsnelheid', 943549884:'Magazijn',
            3555269338:'Rondborstigheid', 2714457168:'Terugstoot', 1885944937:'Nauwkeurigheid',
            1931675084:'Stofwolk'
          };
          Object.entries(def.stats.stats).forEach(function(entry) {
            var label = statDefs[entry[0]];
            if (label && entry[1].value > 0) stats.push({ label: label, value: entry[1].value });
          });
          stats.sort(function(a,b){ return b.value - a.value; });
        }

        // Perks
        var perkHashes = [];
        if (def.sockets && def.sockets.socketEntries) {
          def.sockets.socketEntries.forEach(function(s) {
            if (s.singleInitialItemHash) perkHashes.push(s.singleInitialItemHash);
          });
        }
        var perks = [];
        var perkResults = await Promise.all(perkHashes.slice(0,6).map(function(hash) {
          return bungieGet('/Destiny2/Manifest/DestinyInventoryItemDefinition/' + hash + '/').catch(function(){ return null; });
        }));
        perkResults.forEach(function(pd) {
          if (!pd) return;
          var dp = pd.displayProperties;
          if (!dp || !dp.name || dp.name.length < 2) return;
          var desc = dp.description || '';
          perks.push({
            name: dp.name,
            desc: desc,
            icon: dp.icon ? 'https://www.bungie.net' + dp.icon : null,
          });
        });

        items.push({
          ref: w.ref,
          kills: w.kills,
          name: def.displayProperties && def.displayProperties.name || '—',
          typeName: def.itemTypeDisplayName || '',
          flavorText: def.flavorText || '',
          icon: iconPath ? 'https://www.bungie.net' + iconPath : null,
          iconOverlay: watermark ? 'https://www.bungie.net' + watermark : null,
          tierType: tierType,
          isExotic: tierType === 6,
          stats: stats.slice(0, 9),
          perks: perks,
        });
      }).catch(function(){});
    }));

    items.sort(function(a,b){ return b.kills - a.kills; });

    if (items.length === 0) {
      list.innerHTML = '<div style="color:rgba(255,255,255,0.3);font-size:0.8rem;padding:12px 0;text-align:center;">Geen wapens gevonden</div>';
      return;
    }

    window._favWeaponsData = items;

    list.innerHTML = items.map(function(w, idx) {
      var borderColor = w.isExotic ? '#f5c842' : '#9b72cf';
      var tierLabel = w.isExotic ? 'Exotic' : 'Legendary';
      var iconHtml = w.icon
        ? '<img src="/api/bungie-proxy?action=img&url=' + encodeURIComponent(w.icon) + '" width="42" height="42" style="object-fit:cover;display:block;border-radius:6px;" onerror="this.style.display=&quot;none&quot;">'
        : '🔫';
      var killsFmt = w.kills >= 1000 ? (w.kills/1000).toFixed(1) + 'k' : w.kills;
      return '<div class="fav-weapon" onclick="openFavWeaponPopup(' + idx + ')">'
        + '<div class="fw-icon" style="border-left:3px solid ' + borderColor + ';padding:0;overflow:hidden;">' + iconHtml + '</div>'
        + '<div style="flex:1;min-width:0;">'
        + '<div class="fw-name">' + w.name + '</div>'
        + '<div class="fw-type">' + tierLabel + ' · ' + w.typeName + '</div>'
        + '</div>'
        + '<div class="fw-kills">' + killsFmt + ' kills</div>'
        + '</div>';
    }).join('');

    console.log("✅ Favoriete wapens geladen:", items.length);
  } catch(e) {
    console.warn("Favoriete wapens fout:", e.message);
    list.innerHTML = '<div style="color:rgba(255,255,255,0.3);font-size:0.8rem;padding:12px 0;text-align:center;">Kon wapens niet laden</div>';
  }
}
