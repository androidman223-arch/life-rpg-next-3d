/** ペット戦闘 — オートAI（Lv降順でスキル選択） */
export const MOE_PET_AUTO_SKILL_STORAGE_KEY = "life-rpg-moe-pet-auto-skill";

/** @returns {boolean} */
export function loadMoePetAutoSkillEnabled() {
  if (typeof localStorage === "undefined") return true;
  const raw = localStorage.getItem(MOE_PET_AUTO_SKILL_STORAGE_KEY);
  if (raw === "0" || raw === "false") return false;
  return true;
}

/** @param {boolean} enabled */
export function saveMoePetAutoSkillEnabled(enabled) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(MOE_PET_AUTO_SKILL_STORAGE_KEY, enabled ? "1" : "0");
}
