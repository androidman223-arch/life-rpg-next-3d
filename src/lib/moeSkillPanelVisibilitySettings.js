/**
 * スキルUIパネル — 表示オン/オフ（設定）
 */

export const MOE_SKILL_PANEL_VISIBILITY_STORAGE_KEY =
  "life-rpg-moe-skill-panel-visibility";

/** @typedef {'vertical1' | 'vertical2' | 'verticalPhoenix' | 'verticalDragon' | 'horizontal1' | 'horizontal2' | 'horizontal3' | 'horizontal4'} MoeSkillPanelId */

export const MOE_SKILL_PANEL_IDS = /** @type {MoeSkillPanelId[]} */ ([
  "vertical1",
  "vertical2",
  "verticalPhoenix",
  "verticalDragon",
  "horizontal1",
  "horizontal2",
  "horizontal3",
  "horizontal4",
]);

/** @type {Record<MoeSkillPanelId, string>} */
export const MOE_SKILL_PANEL_LABELS = {
  vertical1: "縦スキルUI 1",
  vertical2: "縦スキルUI 2",
  verticalPhoenix: "縦スキルUI 3",
  verticalDragon: "縦スキルUI 4",
  horizontal1: "横スキルUI 1",
  horizontal2: "横スキルUI 2",
  horizontal3: "横スキルUI 3",
  horizontal4: "横スキルUI 4",
};

/** @returns {Record<MoeSkillPanelId, boolean>} */
export function defaultMoeSkillPanelVisibility() {
  return {
    vertical1: true,
    vertical2: true,
    verticalPhoenix: true,
    verticalDragon: true,
    horizontal1: true,
    horizontal2: true,
    horizontal3: true,
    horizontal4: true,
  };
}

/** @param {unknown} raw @returns {Record<MoeSkillPanelId, boolean>} */
export function normalizeMoeSkillPanelVisibility(raw) {
  const base = defaultMoeSkillPanelVisibility();
  if (!raw || typeof raw !== "object") return base;
  for (const id of MOE_SKILL_PANEL_IDS) {
    if (typeof raw[id] === "boolean") base[id] = raw[id];
  }
  return base;
}

/** @returns {Record<MoeSkillPanelId, boolean>} */
export function loadMoeSkillPanelVisibility() {
  if (typeof localStorage === "undefined") return defaultMoeSkillPanelVisibility();
  try {
    const raw = localStorage.getItem(MOE_SKILL_PANEL_VISIBILITY_STORAGE_KEY);
    if (!raw) return defaultMoeSkillPanelVisibility();
    return normalizeMoeSkillPanelVisibility(JSON.parse(raw));
  } catch {
    return defaultMoeSkillPanelVisibility();
  }
}

/** @param {Record<MoeSkillPanelId, boolean>} visibility */
export function saveMoeSkillPanelVisibility(visibility) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      MOE_SKILL_PANEL_VISIBILITY_STORAGE_KEY,
      JSON.stringify(normalizeMoeSkillPanelVisibility(visibility))
    );
  } catch {
    /* quota */
  }
}

/**
 * @param {Record<MoeSkillPanelId, boolean>} visibility
 * @param {MoeSkillPanelId} id
 * @param {boolean} visible
 */
export function setMoeSkillPanelVisible(visibility, id, visible) {
  const next = { ...normalizeMoeSkillPanelVisibility(visibility), [id]: visible };
  saveMoeSkillPanelVisibility(next);
  return next;
}
