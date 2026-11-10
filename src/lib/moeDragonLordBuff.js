/**
 * ドラゴンロード（龍神 Lv130）— ペット攻撃2倍
 */

export const MOE_DRAGON_LORD_DURATION_MS = 30_000;
export const MOE_DRAGON_LORD_PET_ATTACK_MULT = 2;

/** @param {number} [nowMs] */
export function beginMoeDragonLordBuff(nowMs = Date.now()) {
  return nowMs + MOE_DRAGON_LORD_DURATION_MS;
}

/** @param {number} untilMs @param {number} [nowMs] */
export function isMoeDragonLordActive(untilMs, nowMs = Date.now()) {
  return untilMs > nowMs;
}

/** @param {number} untilMs @param {number} [nowMs] */
export function moeDragonLordPetAttackMult(untilMs, nowMs = Date.now()) {
  return isMoeDragonLordActive(untilMs, nowMs)
    ? MOE_DRAGON_LORD_PET_ATTACK_MULT
    : 1;
}
