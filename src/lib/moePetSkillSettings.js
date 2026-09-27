/** ペットスキル — 習得済みのみ / 仮習得済（Lv未達も使用可） */
export const MOE_PET_SKILL_MODE_STORAGE_KEY = "life-rpg-moe-pet-skill-mode";

/** @typedef {"learned" | "all"} MoePetSkillMode */

export const MOE_PET_SKILL_MODE_LEARNED = "learned";
export const MOE_PET_SKILL_MODE_ALL = "all";

/** @returns {MoePetSkillMode} */
export function loadMoePetSkillMode() {
  if (typeof localStorage === "undefined") return MOE_PET_SKILL_MODE_ALL;
  const raw = localStorage.getItem(MOE_PET_SKILL_MODE_STORAGE_KEY);
  if (raw === MOE_PET_SKILL_MODE_LEARNED) return MOE_PET_SKILL_MODE_LEARNED;
  return MOE_PET_SKILL_MODE_ALL;
}

/** @param {MoePetSkillMode} mode */
export function saveMoePetSkillMode(mode) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    MOE_PET_SKILL_MODE_STORAGE_KEY,
    mode === MOE_PET_SKILL_MODE_LEARNED
      ? MOE_PET_SKILL_MODE_LEARNED
      : MOE_PET_SKILL_MODE_ALL
  );
}

export function moePetSkillModeLabel(mode) {
  return mode === MOE_PET_SKILL_MODE_LEARNED ? "習得済みのみ" : "仮習得済";
}
