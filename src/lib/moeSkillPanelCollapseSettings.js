/**
 * スキルUIパネル — ◆たたみ状態（設定の表示オン/オフとは別）
 */

import { MOE_SKILL_PANEL_IDS } from "./moeSkillPanelVisibilitySettings.js";

export const MOE_SKILL_PANEL_COLLAPSE_STORAGE_KEY =
  "life-rpg-moe-skill-panel-collapsed";

/** @returns {Record<import("@/lib/moeSkillPanelVisibilitySettings").MoeSkillPanelId, boolean>} */
export function defaultMoeSkillPanelCollapse() {
  return {
    vertical1: false,
    vertical2: false,
    verticalPhoenix: false,
    verticalDragon: false,
    horizontal1: false,
    horizontal2: false,
    horizontal3: false,
    horizontal4: false,
  };
}

/** @param {unknown} raw @returns {Record<import("@/lib/moeSkillPanelVisibilitySettings").MoeSkillPanelId, boolean>} */
export function normalizeMoeSkillPanelCollapse(raw) {
  const base = defaultMoeSkillPanelCollapse();
  if (!raw || typeof raw !== "object") return base;
  for (const id of MOE_SKILL_PANEL_IDS) {
    if (typeof raw[id] === "boolean") base[id] = raw[id];
  }
  return base;
}

/** @returns {Record<import("@/lib/moeSkillPanelVisibilitySettings").MoeSkillPanelId, boolean>} */
export function loadMoeSkillPanelCollapse() {
  if (typeof localStorage === "undefined") return defaultMoeSkillPanelCollapse();
  try {
    const raw = localStorage.getItem(MOE_SKILL_PANEL_COLLAPSE_STORAGE_KEY);
    if (!raw) return defaultMoeSkillPanelCollapse();
    return normalizeMoeSkillPanelCollapse(JSON.parse(raw));
  } catch {
    return defaultMoeSkillPanelCollapse();
  }
}

/** @param {Record<import("@/lib/moeSkillPanelVisibilitySettings").MoeSkillPanelId, boolean>} collapsed */
export function saveMoeSkillPanelCollapse(collapsed) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      MOE_SKILL_PANEL_COLLAPSE_STORAGE_KEY,
      JSON.stringify(normalizeMoeSkillPanelCollapse(collapsed))
    );
  } catch {
    /* quota */
  }
}

/**
 * @param {Record<import("@/lib/moeSkillPanelVisibilitySettings").MoeSkillPanelId, boolean>} collapsed
 * @param {import("@/lib/moeSkillPanelVisibilitySettings").MoeSkillPanelId} id
 * @param {boolean} isCollapsed
 */
export function setMoeSkillPanelCollapsed(collapsed, id, isCollapsed) {
  const next = {
    ...normalizeMoeSkillPanelCollapse(collapsed),
    [id]: isCollapsed,
  };
  saveMoeSkillPanelCollapse(next);
  return next;
}
