/**
 * 龍神スキル — 筋斗雲（フィールド移動 · 飛行オフセット）
 */

/** 山の上を飛ぶ高さ（ワールドY） */
export const MOE_KINTOUN_FLY_HEIGHT = 14;

export const MOE_KINTOUN_ASCENT_PER_SEC = 20;
export const MOE_KINTOUN_DESCENT_PER_SEC = 24;

/** 筋斗雲 ON — 通常移動2倍 */
export const MOE_KINTOUN_WALK_SPEED_MULT = 2;

/** Shiftダッシュ時にさらに2倍（走行2×＋ダッシュ2×＝合計4倍、神速なし時） */
export const MOE_KINTOUN_DASH_EXTRA_MULT = 2;

/**
 * @param {boolean} sprinting
 * @param {boolean} kintounOn
 */
export function moeKintounMoveSpeedMult(sprinting, kintounOn) {
  if (!kintounOn) return 1;
  let mult = MOE_KINTOUN_WALK_SPEED_MULT;
  if (sprinting) mult *= MOE_KINTOUN_DASH_EXTRA_MULT;
  return mult;
}

/**
 * @param {number} offset
 * @param {boolean} kintounOn
 * @param {number} dt
 */
export function tickKintounFlyOffset(offset, kintounOn, dt) {
  const target = kintounOn ? MOE_KINTOUN_FLY_HEIGHT : 0;
  const rate = kintounOn ? MOE_KINTOUN_ASCENT_PER_SEC : MOE_KINTOUN_DESCENT_PER_SEC;
  if (Math.abs(target - offset) < 0.04) return target;
  if (target > offset) return Math.min(target, offset + rate * dt);
  return Math.max(target, offset - rate * dt);
}
