/** 鳳凰・龍神 修行スキル — 習得済みのみ / 全部使える */
export const MOE_TRAINING_SKILL_MODE_STORAGE_KEY =
  "life-rpg-moe-training-skill-mode";

/** @typedef {"learned" | "all"} MoeTrainingSkillMode */

export const MOE_TRAINING_SKILL_MODE_LEARNED = "learned";
export const MOE_TRAINING_SKILL_MODE_ALL = "all";

/** @returns {MoeTrainingSkillMode} */
export function loadMoeTrainingSkillMode() {
  if (typeof localStorage === "undefined") return MOE_TRAINING_SKILL_MODE_ALL;
  const raw = localStorage.getItem(MOE_TRAINING_SKILL_MODE_STORAGE_KEY);
  if (raw === MOE_TRAINING_SKILL_MODE_LEARNED) {
    return MOE_TRAINING_SKILL_MODE_LEARNED;
  }
  return MOE_TRAINING_SKILL_MODE_ALL;
}

/** @param {MoeTrainingSkillMode} mode */
export function saveMoeTrainingSkillMode(mode) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    MOE_TRAINING_SKILL_MODE_STORAGE_KEY,
    mode === MOE_TRAINING_SKILL_MODE_LEARNED
      ? MOE_TRAINING_SKILL_MODE_LEARNED
      : MOE_TRAINING_SKILL_MODE_ALL
  );
}

/** @param {MoeTrainingSkillMode} mode */
export function moeTrainingSkillModeLabel(mode) {
  return mode === MOE_TRAINING_SKILL_MODE_LEARNED ? "習得済みのみ" : "全部使える";
}

/** @param {MoeTrainingSkillMode} mode @param {number} practiceLevel @param {{ level: number }} entry */
export function isTrainingSkillUsableAtLevel(mode, practiceLevel, entry) {
  if (mode === MOE_TRAINING_SKILL_MODE_ALL) return true;
  return practiceLevel + 1e-6 >= entry.level;
}
