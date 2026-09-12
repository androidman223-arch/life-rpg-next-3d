/** プレイヤースキル枠 — 技①（回復・忍者）/ 技②（フェニックス） */
export const MOE_PLAYER_SKILL_SET_STORAGE_KEY = "life-rpg-moe-player-skill-set";

/** @typedef {1 | 2} MoePlayerSkillSet */

/** @returns {MoePlayerSkillSet} */
export function loadMoePlayerActiveSkillSet() {
  if (typeof localStorage === "undefined") return 1;
  return localStorage.getItem(MOE_PLAYER_SKILL_SET_STORAGE_KEY) === "2" ? 2 : 1;
}

/** @param {MoePlayerSkillSet} set */
export function saveMoePlayerActiveSkillSet(set) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    MOE_PLAYER_SKILL_SET_STORAGE_KEY,
    set === 2 ? "2" : "1"
  );
}
