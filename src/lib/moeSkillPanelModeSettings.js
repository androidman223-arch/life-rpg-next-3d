/** 縦・横スキルパネル — プレイヤー技① / 技② / ペット の表示モード */

export const MOE_SKILL_PANEL_MODE_STORAGE_KEY =
  "life-rpg-moe-skill-panel-mode";

/** @typedef {'player1' | 'player2' | 'player3' | 'pet'} MoeSkillPanelMode */

const VALID = new Set(["player1", "player2", "player3", "pet"]);

const ORDER = /** @type {MoeSkillPanelMode[]} */ ([
  "player1",
  "player2",
  "player3",
  "pet",
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
 * @returns {MoeSkillPanelMode}
 */
export function loadMoeSkillPanelModeForPanel(panelStorageKey) {
  if (typeof window === "undefined") return "pet";
  try {
    const raw = window.localStorage.getItem(
      moeSkillPanelModeStorageKey(panelStorageKey)
    );
    if (VALID.has(raw)) return raw;
    const legacy = window.localStorage.getItem(MOE_SKILL_PANEL_MODE_STORAGE_KEY);
    return VALID.has(legacy) ? legacy : "pet";
  } catch {
    return "pet";
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
