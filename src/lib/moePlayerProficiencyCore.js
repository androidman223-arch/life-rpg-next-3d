/**
 * プレイヤースキル熟練度 — 共通計算（循環 import 回避用）
 */

/** スキル値 +0.1 に必要な経験値 */
export const MOE_PLAYER_SKILL_EXP_PER_TENTH = 100;

/** 使用時に経験値が入る確率 */
export const MOE_PLAYER_PRE_SKILL_EXP_PROC_RATE = 0.55;

/**
 * @typedef {{ level: number, exp: number }} MoePlayerSkillProficiency
 */

/** @returns {MoePlayerSkillProficiency} */
export function defaultPlayerSkillProficiency() {
  return { level: 0, exp: 0 };
}

/**
 * MOE風 — 必要スキルと現在値の差で上昇量（0.1〜1.0）
 * @param {number} currentLevel
 * @param {number} requiredLevel
 */
export function moePlayerSkillExpGainAmount(currentLevel, requiredLevel) {
  const gap = requiredLevel - currentLevel;
  let base;
  if (gap >= 0 && gap <= 1) base = 0.38 + Math.random() * 0.06;
  else if (gap > 1 && gap <= 4) base = 0.28 + Math.random() * 0.08;
  else if (gap > 4 && gap <= 10) base = 0.18 + Math.random() * 0.08;
  else if (gap < 0 && gap >= -5) base = 0.08 + Math.random() * 0.06;
  else if (gap < -5) base = 0.1;
  else base = 0.12 + Math.random() * 0.06;
  return Math.min(1, Math.max(0.1, Math.round(base * 10) / 10));
}

/**
 * @param {MoePlayerSkillProficiency} progress
 * @param {number} amount 0.1〜1.0
 */
export function applyPlayerProficiencyExp(progress, amount) {
  const prev = progress ?? defaultPlayerSkillProficiency();
  let level = prev.level ?? 0;
  let exp = (prev.exp ?? 0) + amount * 10;
  /** @type {number[]} */
  const levelUps = [];
  while (exp >= MOE_PLAYER_SKILL_EXP_PER_TENTH) {
    exp -= MOE_PLAYER_SKILL_EXP_PER_TENTH;
    level = Math.round((level + 0.1) * 10) / 10;
    levelUps.push(0.1);
  }
  return {
    level,
    exp: Math.round(exp * 100) / 100,
    levelUps,
  };
}
