/**
 * MOE風スキル成功率 — 熟練度 Lv と必要 Lv の差で決まる
 *
 * 目安（必要 Lv 40 前後のスキル）:
 * - 熟練 46 → 約 80%
 * - 熟練 48 → 約 99%
 */

import { isMoePlayerSkillSuccess100Enabled } from "./moePlayerSkillSuccessSettings.js";

/** @param {number} proficiency 現在の熟練度 Lv */
/** @param {number} requiredLevel スキル習得・安定ラインの Lv */
export function moeSkillSuccessRate(proficiency, requiredLevel = 40) {
  if (isMoePlayerSkillSuccess100Enabled()) return 1;
  const prof = Number(proficiency) || 0;
  const req = Number(requiredLevel) || 0;
  const diff = prof - req;
  if (diff <= -10) return 0.1;
  if (diff < 0) return Math.max(0.1, 0.5 + diff * 0.04);
  if (diff <= 6) return 0.5 + diff * 0.05;
  return Math.min(0.99, 0.8 + (diff - 6) * 0.095);
}

/**
 * @param {number} proficiency
 * @param {number} requiredLevel
 * @param {() => number} [rng]
 */
export function rollMoeSkillSuccess(proficiency, requiredLevel, rng = Math.random) {
  if (isMoePlayerSkillSuccess100Enabled()) {
    return { ok: true, rate: 1, ratePct: 100 };
  }
  const rate = moeSkillSuccessRate(proficiency, requiredLevel);
  const ok = rng() < rate;
  return {
    ok,
    rate,
    ratePct: Math.round(rate * 100),
  };
}

/**
 * @param {number} proficiency
 * @param {number} requiredLevel
 */
export function formatMoeSkillSuccessRatePct(proficiency, requiredLevel) {
  return `${Math.round(moeSkillSuccessRate(proficiency, requiredLevel) * 100)}%`;
}

/**
 * 忍び足 — 視覚索敵を回避する確率（足音は別途ゼロ）
 * @param {number} stealthProficiency
 * @param {number} [requiredLevel=10]
 */
export function moeStealthVisualAvoidRate(stealthProficiency, requiredLevel = 10) {
  return moeSkillSuccessRate(stealthProficiency, requiredLevel);
}
