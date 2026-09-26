/**
 * フィールド上の +HP ポップ（リジェネ・回復魔法）
 */

/** @param {number} amount @param {number} [maxAmount] */
export function formatWorldHealPopupAmount(amount, maxAmount = 999) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0 || n > maxAmount) return null;
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
}
