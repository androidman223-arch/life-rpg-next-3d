/** プレイヤースキル — 成功率100%（設定 · 開発・お試し用） */
export const MOE_PLAYER_SKILL_SUCCESS_100_STORAGE_KEY =
  "life-rpg-moe-player-skill-success-100";

/** @type {boolean | null} */
let cachedSuccess100 = null;

/** @returns {boolean} */
export function loadMoePlayerSkillSuccess100() {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(MOE_PLAYER_SKILL_SUCCESS_100_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** @returns {boolean} */
export function isMoePlayerSkillSuccess100Enabled() {
  if (cachedSuccess100 !== null) return cachedSuccess100;
  cachedSuccess100 = loadMoePlayerSkillSuccess100();
  return cachedSuccess100;
}

/** @param {boolean} enabled */
export function saveMoePlayerSkillSuccess100(enabled) {
  cachedSuccess100 = Boolean(enabled);
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      MOE_PLAYER_SKILL_SUCCESS_100_STORAGE_KEY,
      enabled ? "1" : "0"
    );
  } catch {
    /* quota */
  }
}

/** テスト用 — モジュールキャッシュをクリア */
export function resetMoePlayerSkillSuccess100Cache() {
  cachedSuccess100 = null;
}
