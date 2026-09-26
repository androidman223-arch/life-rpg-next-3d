/** @typedef {'battle-log' | 'minimap' | 'pet-side-panel'} MoePanelCollapseId */

export const MOE_PANEL_COLLAPSE_STORAGE_KEY = "life-rpg-moe-panel-collapse";

/** @type {Record<MoePanelCollapseId, boolean>} */
const DEFAULTS = {
  "battle-log": false,
  minimap: false,
  "pet-side-panel": false,
};

function readAll() {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(MOE_PANEL_COLLAPSE_STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * @param {MoePanelCollapseId} panelId
 */
export function loadMoePanelCollapsed(panelId) {
  return Boolean(readAll()[panelId]);
}

/**
 * @param {MoePanelCollapseId} panelId
 * @param {boolean} collapsed
 */
export function saveMoePanelCollapsed(panelId, collapsed) {
  if (typeof window === "undefined") return;
  try {
    const next = { ...readAll(), [panelId]: collapsed };
    localStorage.setItem(MOE_PANEL_COLLAPSE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}
