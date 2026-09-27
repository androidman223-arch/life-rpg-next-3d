/**
 * ペットスキル delaySec — MOE Wiki 帯の平均（docs/moe-pet-loyalty.md）
 * データに delaySec が無いスキル向けのフォールバック
 */

/** @typedef {{ level?: number, delaySec?: number }} MoePetSkillLike */

/**
 * 習得Lv帯の典型 delaySec（秒）— 帯の最小〜最大の中間
 * | Lv帯 | Wiki典型 |
 * | ~40  | 8〜25  → 17 |
 * | 60   | 20〜35 → 28 |
 * | 80   | 25〜45 → 35 |
 * | 100+ | 45〜65 → 55 |
 * @param {number} skillLevel
 */
export function moeDefaultDelaySecForSkillLevel(skillLevel) {
  const lv = Math.max(1, Math.floor(skillLevel ?? 1));
  if (lv >= 100) return 55;
  if (lv >= 80) return 35;
  if (lv >= 60) return 28;
  if (lv >= 40) return 17;
  if (lv >= 20) return 17;
  return 12;
}

/** @param {MoePetSkillLike | null | undefined} skill */
export function moePetSkillEffectiveDelaySec(skill) {
  const raw = skill?.delaySec;
  if (raw != null && raw > 0) return raw;
  return moeDefaultDelaySecForSkillLevel(skill?.level ?? 1);
}
