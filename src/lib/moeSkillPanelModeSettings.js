/** 縦・横スキルパネル — 技1 / マクロ / セット1 / セット2 / ペット / 鳳凰 / 龍神 */

export const MOE_SKILL_PANEL_MODE_STORAGE_KEY =
  "life-rpg-moe-skill-panel-mode";

/** @typedef {'player1' | 'macro' | 'player2' | 'player3' | 'pet' | 'phoenix' | 'dragon'} MoeSkillPanelMode */

const VALID = new Set([
  "player1",
  "macro",
  "player2",
  "player3",
  "pet",
  "phoenix",
  "dragon",
]);

const ORDER = /** @type {MoeSkillPanelMode[]} */ ([
  "player1",
  "macro",
  "player2",
  "player3",
  "pet",
  "phoenix",
  "dragon",
]);

/**
 * @param {MoeSkillPanelMode} mode
 * @param {'prev' | 'next'} dir
 * @returns {MoeSkillPanelMode}
 */
export function cycleMoeSkillPanelMode(mode, dir) {
  const i = ORDER.indexOf(mode);
  if (i < 0) return "pet";
  if (dir === "next") return ORDER[(i + 1) % ORDER.length];
  return ORDER[(i - 1 + ORDER.length) % ORDER.length];
}

/** @returns {MoeSkillPanelMode} */
export function loadMoeSkillPanelMode() {
  if (typeof window === "undefined") return "pet";
  try {
    const raw = window.localStorage.getItem(MOE_SKILL_PANEL_MODE_STORAGE_KEY);
    return VALID.has(raw) ? raw : "pet";
  } catch {
    return "pet";
  }
}

/** @param {MoeSkillPanelMode} mode */
export function saveMoeSkillPanelMode(mode) {
  if (typeof window === "undefined" || !VALID.has(mode)) return;
  try {
    window.localStorage.setItem(MOE_SKILL_PANEL_MODE_STORAGE_KEY, mode);
  } catch {
    /* quota */
  }
}

/**
 * 縦・横スキルパネルごとのモード（storageKey は位置保存と同じ ID）
 * @param {string} panelStorageKey
 */
export function moeSkillPanelModeStorageKey(panelStorageKey) {
  return `${panelStorageKey}-mode`;
}

/**
 * @param {string} panelStorageKey
 * @param {MoeSkillPanelMode} [fallbackMode] パネル未保存のときの開始ページ
 * @returns {MoeSkillPanelMode}
 */
export function loadMoeSkillPanelModeForPanel(panelStorageKey, fallbackMode) {
  const fallback = VALID.has(fallbackMode) ? fallbackMode : "pet";
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(
      moeSkillPanelModeStorageKey(panelStorageKey)
    );
    if (VALID.has(raw)) return raw;
    if (VALID.has(fallbackMode)) return fallbackMode;
    const legacy = window.localStorage.getItem(MOE_SKILL_PANEL_MODE_STORAGE_KEY);
    return VALID.has(legacy) ? legacy : "pet";
  } catch {
    return fallback;
  }
}

/**
 * @param {string} panelStorageKey
 * @param {MoeSkillPanelMode} mode
 */
export function saveMoeSkillPanelModeForPanel(panelStorageKey, mode) {
  if (typeof window === "undefined" || !VALID.has(mode)) return;
  try {
    window.localStorage.setItem(
      moeSkillPanelModeStorageKey(panelStorageKey),
      mode
    );
  } catch {
    /* quota */
  }
}
