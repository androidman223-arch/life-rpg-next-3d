/**
 * 生活改鳳 — リボーンワンス（1回だけ · 倒れてから3秒で復活）
 */

export const MOE_REBIRTH_ONCE_DELAY_MS = 3000;

/**
 * @typedef {{ charges: number, pendingUntilMs?: number }} MoeRebirthOnceState
 */

/** @returns {MoeRebirthOnceState} */
export function grantMoeRebirthOnceCharge() {
  return { charges: 1, pendingUntilMs: 0 };
}

/** @param {MoeRebirthOnceState | null | undefined} state */
export function moeRebirthOnceHasCharge(state) {
  return Boolean(state && state.charges > 0 && !state.pendingUntilMs);
}

/** @param {MoeRebirthOnceState | null | undefined} state @param {number} nowMs */
export function moeRebirthOnceIsPending(state, nowMs) {
  return Boolean(state?.pendingUntilMs && nowMs < state.pendingUntilMs);
}

/**
 * @param {MoeRebirthOnceState | null | undefined} state
 * @param {number} nowMs
 * @param {number} [delayMs]
 */
export function moeRebirthOnceBeginPending(state, nowMs, delayMs = MOE_REBIRTH_ONCE_DELAY_MS) {
  return {
    charges: 0,
    pendingUntilMs: nowMs + delayMs,
  };
}

/** @param {number} hpMax */
export function moeRebirthOnceReviveHp(hpMax) {
  return Math.max(1, Math.floor(hpMax));
}

/** @param {MoeRebirthOnceState | null | undefined} state @param {number} nowMs */
export function moeRebirthOncePendingRemainSec(state, nowMs) {
  if (!state?.pendingUntilMs || nowMs >= state.pendingUntilMs) return null;
  return Math.ceil((state.pendingUntilMs - nowMs) / 1000);
}
