/**
 * スキルアップの御札 — プレイヤー技② EXP 成功率アップ（課金・お試し用）
 */

export const MOE_PLAYER_SKILL2_TALISMAN_STORAGE_KEY =
  "life-rpg-moe-player-skill2-talisman";

/** 基本55%に加算（最大95%） */
export const MOE_PLAYER_SKILL2_TALISMAN_PROC_BONUS = 0.12;

export const MOE_ITEM_SKILL2_TALISMAN = {
  id: "skill2_talisman",
  label: "スキルアップの御札",
  emoji: "🎴",
  iconKind: "skill2_talisman",
  note: "技②の成長が少し楽になる",
};

/** @returns {boolean} */
export function loadPlayerSkill2TalismanActive() {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.localStorage.getItem(MOE_PLAYER_SKILL2_TALISMAN_STORAGE_KEY) === "1"
    );
  } catch {
    return false;
  }
}

/** @param {boolean} active */
export function savePlayerSkill2TalismanActive(active) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MOE_PLAYER_SKILL2_TALISMAN_STORAGE_KEY,
      active ? "1" : "0"
    );
  } catch {
    /* quota */
  }
}

/**
 * @param {boolean} [talismanActive]
 * @param {number} [baseRate]
 */
export function resolvePlayerSkill2ExpProcRate(
  talismanActive = loadPlayerSkill2TalismanActive(),
  baseRate = 0.55
) {
  let rate = baseRate;
  if (talismanActive) {
    rate += MOE_PLAYER_SKILL2_TALISMAN_PROC_BONUS;
  }
  return Math.min(0.95, Math.max(0, rate));
}
