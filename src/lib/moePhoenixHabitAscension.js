/**
 * 生活改鳳 — 炎5連(各7)＋炎3連(各3)＋リボーンワンス
 */

import { grantMoeRebirthOnceCharge } from "./moePhoenixRebirthOnce.js";

const MOE_HABIT_FRAME_RATE = 60;

/**
 * 再使用待ち（秒）— MP40級の目安 · 公式値が判明したら差し替え
 * @param {number} delayFrames
 */
export const MOE_PHOENIX_HABIT_ASCENSION_DELAY_FRAMES = 2700;

export const MOE_PHOENIX_HABIT_ASCENSION_COOLDOWN_SEC = Math.round(
  MOE_PHOENIX_HABIT_ASCENSION_DELAY_FRAMES / MOE_HABIT_FRAME_RATE
);

/**
 * @param {object | null | undefined} skill
 * @param {{
 *   phase1Damage?: number,
 *   phase1Hits?: number,
 *   phase2Damage?: number,
 *   phase2Hits?: number,
 *   stepMs?: number,
 * }} [defaults]
 */
export function resolvePhoenixHabitAscensionSequence(skill, defaults = {}) {
  const phase1 = skill?.combatPhase1Damage ?? defaults.phase1Damage ?? 7;
  const phase2 = skill?.combatPhase2Damage ?? defaults.phase2Damage ?? 3;
  const n1 = skill?.combatPhase1Hits ?? defaults.phase1Hits ?? 5;
  const n2 = skill?.combatPhase2Hits ?? defaults.phase2Hits ?? 3;
  const step = skill?.combatStepMs ?? defaults.stepMs ?? 350;
  const hits = [];
  let atMs = 0;
  for (let i = 0; i < n1; i++) {
    hits.push({ atMs, opts: { fixedDamage: phase1, grantExp: false } });
    atMs += step;
  }
  for (let i = 0; i < n2; i++) {
    hits.push({
      atMs,
      opts: { fixedDamage: phase2, grantExp: i === n2 - 1 },
    });
    atMs += step;
  }
  return { hits };
}

/** @param {boolean} inDuel */
export function validatePhoenixHabitAscension(inDuel) {
  if (!inDuel) {
    return { ok: false, toast: "生活改鳳は戦闘中のみ使えます" };
  }
  return { ok: true };
}

/** 生活改鳳使用時 — リボーンワンスを付与 */
export function moePhoenixHabitAscensionRebirthGrant() {
  return grantMoeRebirthOnceCharge();
}

/**
 * @param {number} cooldownUntilMs
 * @param {number} nowMs
 */
export function moePhoenixHabitAscensionCooldownRemainSec(cooldownUntilMs, nowMs) {
  if (!cooldownUntilMs || nowMs >= cooldownUntilMs) return 0;
  return Math.ceil((cooldownUntilMs - nowMs) / 1000);
}

/** @param {number} nowMs */
export function beginMoePhoenixHabitAscensionCooldown(nowMs) {
  return nowMs + MOE_PHOENIX_HABIT_ASCENSION_COOLDOWN_SEC * 1000;
}

/**
 * @param {number} cooldownUntilMs
 * @param {number} nowMs
 */
export function canUseMoePhoenixHabitAscension(cooldownUntilMs, nowMs) {
  const remain = moePhoenixHabitAscensionCooldownRemainSec(cooldownUntilMs, nowMs);
  if (remain > 0) {
    return {
      ok: false,
      toast: `生活改鳳 · 待機中（${remain}秒）`,
    };
  }
  return { ok: true };
}
