// ============================================================
// GUARDIANHQ — render.js (FULL FIXED)
// ============================================================

// 🔹 Subclass render
export function renderSubclass(subclass) {
  if (!subclass) return '';

  return `
    <div class="subclass">
      <img src="${subclass.icon}" class="subclass-icon"/>
      <span class="subclass-name">${subclass.name}</span>
    </div>
  `;
}

// 🔹 Armor render (MET MODS)
export function renderArmor(armor) {
  if (!armor) return '';

  return `
    <div class="armor-item">
      
      <img src="${armor.icon}" class="armor-icon"/>

      <div class="armor-info">
        <div class="armor-name">${armor.name}</div>
        <div class="armor-energy">⚡ ${armor.energy}</div>

        <div class="mods">
          ${armor.mods.map(mod => `
            <div class="mod">
              <img src="${mod.icon}" class="mod-icon"/>
              <div class="mod-info">
                <span class="mod-name">${mod.name}</span>
                <span class="mod-energy">⚡ ${mod.energy}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

    </div>
  `;
}

// 🔹 Generic item (weapons etc.)
export function renderItem(item) {
  if (!item) return '';

  return `
    <div class="item">
      <img src="${item.icon}" class="item-icon"/>
      <span>${item.name}</span>
    </div>
  `;
}
