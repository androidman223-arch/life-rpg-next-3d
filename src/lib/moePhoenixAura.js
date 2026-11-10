/**
 * フェニックスオーラ（鳳凰 Lv130）— 短時間完全ガード（物理・魔法）
 */

export const MOE_PHOENIX_AURA_DURATION_MS = 5000;

/** @param {number} [nowMs] */
export function beginMoePhoenixAura(nowMs = Date.now()) {
  return nowMs + MOE_PHOENIX_AURA_DURATION_MS;
}

/** @param {number} untilMs @param {number} [nowMs] */
export function isMoePhoenixAuraActive(untilMs, nowMs = Date.now()) {
  return untilMs > nowMs;
}
