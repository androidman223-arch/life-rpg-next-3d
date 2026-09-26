/**
 * 睡眠絶崩 / 攻撃強化 — 戦闘中ペット攻撃倍率（決戦後リセット）
 */

export const MOE_PHOENIX_COMBAT_ATK_MULT = 1.5;

/**
 * @param {number} mult
 */
export function moePhoenixCombatAtkMultActive(mult) {
  return mult > 1.0001;
}

/**
 * @param {object | null | undefined} skill
 */
export function moePhoenixCombatAtkMultFromSkill(skill) {
  const m = skill?.combatAttackMult;
  return m > 1 ? m : MOE_PHOENIX_COMBAT_ATK_MULT;
}
