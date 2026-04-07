
// ============================================================
// GUARDIANHQ — MAIN.JS
// Shared utilities, timer, live stats
// ============================================================

// Reset timer
function startResetTimer() {
  const el = document.getElementById('resetTimer');
  const prog = document.getElementById('resetProg');
  if (!el) return;

  function tick() {
    const now = new Date();
    const next = new Date();
    next.setUTCHours(17, 0, 0, 0);
    if (now >= next) next.setDate(next.getDate() + 1);
    const diff = next - now;
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
    if (prog) prog.style.width = Math.max(0, 100 - diff / 864000) + '%';
  }
  tick();
  setInterval(tick, 1000);
}

// Fluctuate online players
function startPlayerFluctuation() {
  const els = document.querySelectorAll('.online-players');
  if (!els.length) return;
  function update() {
    const v = 482391 + Math.floor((Math.random() - 0.5) * 5000);
    els.forEach(el => el.textContent = v.toLocaleString('nl-NL'));
  }
  update();
  setInterval(update, 8000);
}

// Inventory data
const WEAPONS = [
  { e:'🔫', n:'Palindrome',       t:'Hand Cannon',  p:2100, r:'legendary' },
  { e:'⚡', n:'Wish-Ender',       t:'Exotic Bow',   p:2050, r:'exotic'    },
  { e:'🎯', n:'The Messenger',    t:'Pulse Rifle',  p:2095, r:'legendary' },
  { e:'🚀', n:'Gjallarhorn',      t:'Rocket',       p:2100, r:'exotic'    },
  { e:'💥', n:'Apex Predator',    t:'Rocket',       p:2098, r:'legendary' },
  { e:'🌙', n:'Likely Suspect',   t:'Fusion Rifle', p:2090, r:'legendary' },
  { e:'🗡️', n:'Falling Guillotine',t:'Sword',       p:2085, r:'legendary' },
  { e:'🏹', n:'Crooked Fang',     t:'Combat Bow',   p:2080, r:'rare'      },
];
const ARMOR = [
  { e:'🧢', n:'Celestial Hood',   t:'Helmet',    p:2092, r:'exotic'    },
  { e:'🦺', n:'Renewal Grasps',   t:'Gauntlets', p:2088, r:'exotic'    },
  { e:'👕', n:'Athrys Embrace',   t:'Chest',     p:2091, r:'legendary' },
  { e:'👖', n:'Frostreach',       t:'Legs',      p:2086, r:'legendary' },
  { e:'💎', n:'Ophidia Spathe',   t:'Class Item',p:2094, r:'exotic'    },
  { e:'🎭', n:'Dragon Shadow',    t:'Class Item',p:2083, r:'legendary' },
];
const VAULT_ITEMS = [
  {e:'🔫',r:'legendary'},{e:'⚡',r:'exotic'},{e:'🎯',r:'legendary'},{e:'🚀',r:'exotic'},
  {e:'💥',r:'legendary'},{e:'🌙',r:'legendary'},{e:'🗡️',r:'legendary'},{e:'🏹',r:'rare'},
  {e:'🧢',r:'exotic'},{e:'🦺',r:'legendary'},{e:'👕',r:'legendary'},{e:'👖',r:'rare'},
  {e:'💎',r:'exotic'},{e:'🎭',r:'legendary'},{e:'🛡️',r:'legendary'},{e:'⚔️',r:'rare'},
  {e:'🌟',r:'exotic'},{e:'🔮',r:'legendary'},{e:'💫',r:'legendary'},{e:'🌊',r:'rare'},
  {e:'🔥',r:'legendary'},{e:'❄️',r:'legendary'},{e:'🌪️',r:'rare'},{e:'☄️',r:'exotic'},
  {e:'🦅',r:'legendary'},{e:'🐉',r:'exotic'},{e:'👁️',r:'legendary'},{e:'🌙',r:'rare'},
  {e:'⚡',r:'legendary'},{e:'💀',r:'exotic'},
];
const DEFAULT_LOADOUTS = [
  { icon:'🏰', name:'Raid Build',   sub:'Last Wish · Void/Solar',    power:2094, col:'rgba(155,114,207,0.12)', brd:'rgba(155,114,207,0.25)', txt:'#9b72cf' },
  { icon:'🎯', name:'PvP Sweat',    sub:'Crucible · Arc/Kinetic',    power:2087, col:'rgba(79,143,255,0.12)',  brd:'rgba(79,143,255,0.25)',  txt:'#4f8fff' },
  { icon:'⚡', name:'Nightfall',    sub:'Grandmaster · Solar',       power:2100, col:'rgba(212,168,67,0.12)', brd:'rgba(212,168,67,0.25)', txt:'#f5c842' },
  { icon:'🌑', name:'Gambit',       sub:'Prime Mover · Void',        power:2091, col:'rgba(76,175,130,0.12)', brd:'rgba(76,175,130,0.25)', txt:'#4caf82' },
];

function getLoadouts() {
  try {
    return JSON.parse(localStorage.getItem('ghq_loadouts') || 'null') || DEFAULT_LOADOUTS;
  } catch { return DEFAULT_LOADOUTS; }
}
function saveLoadouts(arr) {
  localStorage.setItem('ghq_loadouts', JSON.stringify(arr));
}

// Render inventory grid
function renderInvGrid(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = items.map(i => `
    <div class="inv-item" title="${i.n} · ${i.t} · ⚡${i.p}" onclick="showToast('${i.n} geselecteerd!')">
      <div class="tag tag-${i.r}"></div>
      ${i.e}
      <div class="pwr">${i.p}</div>
    </div>
  `).join('');
}

// Render vault
function renderVault(filter = 'all') {
  const el = document.getElementById('vaultGrid');
  const countEl = document.getElementById('vaultCount');
  if (!el) return;

  const rarityColor = { exotic:'#f5c518', legendary:'#9b72cf', rare:'#4f8fff' };
  const filtered = filter === 'all' ? VAULT_ITEMS : VAULT_ITEMS.filter(i => {
    const weaponEmojis = ['🔫','⚡','🎯','🚀','💥','🌙','🗡️','🏹','🔥','❄️','🌪️','☄️'];
    const armorEmojis  = ['🧢','🦺','👕','👖','💎','🎭','🛡️','🦅'];
    if (filter === 'weapons')  return weaponEmojis.includes(i.e);
    if (filter === 'armor')    return armorEmojis.includes(i.e);
    if (filter === 'exotic')   return i.r === 'exotic';
    if (filter === 'legendary')return i.r === 'legendary';
    return true;
  });

  el.innerHTML = filtered.map(i => `
    <div class="vault-item" style="border-left:3px solid ${rarityColor[i.r]||'var(--border)'}"
         onclick="showToast('Item geselecteerd uit Vault!')">
      ${i.e}
      <div class="pwr">${2050 + Math.floor(Math.random() * 50)}</div>
    </div>
  `).join('');
  if (countEl) countEl.textContent = filtered.length;
}

// Render loadouts
function renderLoadouts() {
  const el = document.getElementById('loadoutList');
  if (!el) return;
  const loadouts = getLoadouts();
  el.innerHTML = loadouts.map((l, idx) => `
    <div class="loadout-item">
      <div class="loadout-icon" style="background:${l.col};border:1px solid ${l.brd}">${l.icon}</div>
      <div>
        <div class="loadout-name">${l.name}</div>
        <div class="loadout-sub">${l.sub}</div>
      </div>
      <div class="loadout-power">⚡${l.power}</div>
      <button class="loadout-equip" onclick="event.stopPropagation();showToast('✓ ${l.name} uitgerust!')">Equip</button>
    </div>
  `).join('');
}

// Add loadout
function addLoadout() {
  const name = prompt('Naam van de nieuwe loadout:');
  if (name && name.trim()) {
    const loadouts = getLoadouts();
    loadouts.push({
      icon:'⭐', name: name.trim(), sub:'Aangepaste build',
      power: 2080 + Math.floor(Math.random() * 20),
      col:'rgba(212,168,67,0.12)', brd:'rgba(212,168,67,0.25)', txt:'#f5c842'
    });
    saveLoadouts(loadouts);
    renderLoadouts();
    showToast('✓ Loadout "' + name + '" aangemaakt!');
  }
}

// Tab switching
function switchTab(tab) {
  document.querySelectorAll('.d-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.d-pane').forEach(p => p.classList.remove('active'));
  const tabs = ['overview','dim','loadouts','vault','wishlist'];
  const idx = tabs.indexOf(tab);
  const tabEls = document.querySelectorAll('.d-tab');
  if (tabEls[idx]) tabEls[idx].classList.add('active');
  const pane = document.getElementById('pane-' + tab);
  if (pane) pane.classList.add('active');

  if (tab === 'dim')      { renderInvGrid('weaponsGrid', WEAPONS); renderInvGrid('armorGrid', ARMOR); }
  if (tab === 'vault')    renderVault();
  if (tab === 'loadouts') renderLoadouts();
}

// Vault filter
function filterVault(btn, f) {
  document.querySelectorAll('.vf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderVault(f);
}

// Select character
function selectChar(el, name) {
  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('active-char'));
  el.classList.add('active-char');
  const t1 = document.getElementById('invTitle1');
  const t2 = document.getElementById('invTitle2');
  if (t1) t1.textContent = '🔫 Wapens — ' + name;
  if (t2) t2.textContent = '🛡️ Armor — ' + name;
  showToast(name + ' geselecteerd');
}

// DIM search
function doSearch() {
  const q = document.getElementById('dimSearch');
  if (!q || !q.value.trim()) { showToast('Typ iets om op te zoeken'); return; }
  showToast('🔍 Zoeken naar: "' + q.value + '"');
}

// Open Bungie
function openBungie() {
  showToast('Opent Bungie.net...');
  setTimeout(() => window.open('https://www.bungie.net', '_blank'), 400);
}

// Open DIM
function openDIM() {
  showToast('Opent DIM...');
  setTimeout(() => window.open('https://app.destinyitemmanager.com', '_blank'), 400);
}

// Init on page load
window.addEventListener('DOMContentLoaded', () => {
  startResetTimer();
  startPlayerFluctuation();
});
