// ============================================================
// GUARDIANHQ — js/bungie.js (FIXED VERSION)
// ============================================================

const BUNGIE_CLIENT_ID = '51944';
const OAUTH_URL        = 'https://www.bungie.net/en/OAuth/Authorize';
const TOKEN_FUNCTION   = '/api/bungie-auth';
const BUNGIE_BASE      = 'https://www.bungie.net';

// 👉 ICON FIX
function getIcon(path) {
  if (!path) return '';
  return `${BUNGIE_BASE}${path}`;
}

// 👉 ITEM DEFINITION HELPER
function getItemDef(hash) {
  return window.manifest?.DestinyInventoryItemDefinition?.[hash];
}

// ============================================================
// TOKENS (ONGEWIJZIGD)
// ============================================================

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

// ============================================================
// 🔥 SUBCLASS FIX
// ============================================================

export function getSubclass(equipment) {
  const subclassItem = equipment.find(i => i.bucketHash === 3284755031);
  if (!subclassItem) return null;

  const def = getItemDef(subclassItem.itemHash);
  if (!def) return null;

  return {
    name: def.displayProperties.name,
    icon: getIcon(def.displayProperties.icon)
  };
}

// ============================================================
// 🔥 ARMOR + MODS FIX (BELANGRIJK)
// ============================================================

export function buildArmor(item, instance) {
  const def = getItemDef(item.itemHash);
  if (!def) return null;

  const armor = {
    name: def.displayProperties.name,
    icon: getIcon(def.displayProperties.icon),
    energy: instance?.energy?.energyCapacity || 0,
    mods: []
  };

  // 👉 SOCKETS UITLEZEN (FIX)
  const sockets = instance?.sockets?.data?.sockets;
  if (sockets) {
    sockets.forEach(socket => {
      const plugHash = socket.plugHash;
      if (!plugHash) return;

      const plugDef = getItemDef(plugHash);
      if (!plugDef) return;

      armor.mods.push({
        name: plugDef.displayProperties.name,
        icon: getIcon(plugDef.displayProperties.icon),
        energy: plugDef.investmentStats?.[0]?.value || 0
      });
    });
  }

  return armor;
}

// ============================================================
// 🔥 WEAPON / ARMOR ICON FIX (UNIFIED)
// ============================================================

export function buildItem(item) {
  const def = getItemDef(item.itemHash);
  if (!def) return null;

  return {
    name: def.displayProperties.name,
    icon: getIcon(def.displayProperties.icon)
  };
}
