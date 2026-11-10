/**
 * プレイヤー反射系 — 百花繚乱 / ソードダンス / リベンジガード / リベンジスイング
 * 戦闘中はペット被弾に適用（MOE の身代わり・前方防御の簡略）
 */

import { isMoePhoenixAuraActive } from "./moePhoenixAura.js";
import {
  isMoeDragonCounterClawActive,
  moeCounterDamageSplitFromMitigated,
  moeDragonCounterClawDamageSplit,
} from "./moeDragonCounterClaw.js";

/** 百花繚乱 — 長めの反射バフ */
export const MOE_HYAKKA_RANRAN_DURATION_MS = 8000;
export const MOE_HYAKKA_RANRAN_COOLDOWN_MS = 18000;
export const MOE_HYAKKA_RANRAN_PRESET = { takenPct: 5, reflectPct: 95 };

/** ソードダンス — 反射＋発動時攻撃 */
export const MOE_SWORD_DANCE_DURATION_MS = 3000;
export const MOE_SWORD_DANCE_COOLDOWN_MS = 8000;
export const MOE_SWORD_DANCE_PRESET = { takenPct: 20, reflectPct: 80 };
/** 発動時の扇形攻撃（ペット攻撃力×係数） */
export const MOE_SWORD_DANCE_OPENING_ATTACK_SCALE = 2.4;

/** リベンジガード — 盾構え（最初の1撃で反射して終了 · 上限200） */
export const MOE_REVENGE_GUARD_DURATION_MS = 2000;
export const MOE_REVENGE_GUARD_COOLDOWN_MS = 10000;
export const MOE_REVENGE_GUARD_REFLECT_CAP = 200;

/** リベンジスイング — 短時間 · 固定反射（しびれは将来） */
export const MOE_REVENGE_SWING_DURATION_MS = 1000;
export const MOE_REVENGE_SWING_COOLDOWN_MS = 12000;
export const MOE_REVENGE_SWING_REFLECT_DAMAGE = 150;

/** @param {number} durationMs */
export function moeReflectBuffDurationLabelSec(durationMs) {
  const sec = durationMs / 1000;
  if (Math.abs(sec - Math.round(sec)) < 0.05) {
    return String(Math.round(sec));
  }
  return sec.toFixed(1);
}

/** @param {{ takenPct: number, reflectPct: number }} preset */
export function moeReflectSplitShortLabel(preset) {
  return `被弾${preset.takenPct}% · 反射${preset.reflectPct}%`;
}

/** バフ帯・ツールチップ用（秒数は定数と同期） */
export function moeHyakkaRanranReflectBuffLabel() {
  const sec = moeReflectBuffDurationLabelSec(MOE_HYAKKA_RANRAN_DURATION_MS);
  return `百花繚乱 — 約${sec}秒 · 物理${moeReflectSplitShortLabel(MOE_HYAKKA_RANRAN_PRESET)} · 魔法回避`;
}

export function moeSwordDanceReflectBuffLabel() {
  const sec = moeReflectBuffDurationLabelSec(MOE_SWORD_DANCE_DURATION_MS);
  return `ソードダンス — 約${sec}秒反射 · ${moeReflectSplitShortLabel(MOE_SWORD_DANCE_PRESET)}`;
}

export function moeRevengeGuardReflectBuffLabel() {
  const sec = moeReflectBuffDurationLabelSec(MOE_REVENGE_GUARD_DURATION_MS);
  return `リベンジガード — 約${sec}秒盾構え · 被弾0% · 反射100%（上限${MOE_REVENGE_GUARD_REFLECT_CAP}）`;
}

export function moeRevengeSwingReflectBuffLabel() {
  const sec = moeReflectBuffDurationLabelSec(MOE_REVENGE_SWING_DURATION_MS);
  return `リベンジスイング — 約${sec}秒 · 被弾0% · 反射${MOE_REVENGE_SWING_REFLECT_DAMAGE}固定`;
}

/**
 * フィールド発動トースト（秒数は定数と同期）
 * @param {string} skillId
 * @param {string} [skillName]
 */
export function formatMoePlayerReflectSkillActivateToast(skillId, skillName = "") {
  const name = skillName || "スキル";
  if (skillId === "hyakka_ranran") {
    return `🌸 ${name} — ${moeHyakkaRanranReflectBuffLabel().replace(/^百花繚乱 — /, "")}`;
  }
  if (skillId === "sword_dance") {
    const sec = moeReflectBuffDurationLabelSec(MOE_SWORD_DANCE_DURATION_MS);
    const split = moeReflectSplitShortLabel(MOE_SWORD_DANCE_PRESET);
    return `⚔️ ${name} — 斬撃＋約${sec}秒反射 · ${split}`;
  }
  if (skillId === "revenge_guard") {
    const sec = moeReflectBuffDurationLabelSec(MOE_REVENGE_GUARD_DURATION_MS);
    return `🛡️ ${name} — 約${sec}秒盾構え · 被弾0% · 反射100%（上限${MOE_REVENGE_GUARD_REFLECT_CAP}）`;
  }
  if (skillId === "revenge_swing") {
    const sec = moeReflectBuffDurationLabelSec(MOE_REVENGE_SWING_DURATION_MS);
    return `💥 ${name} — 約${sec}秒 · 被弾0% · 反射${MOE_REVENGE_SWING_REFLECT_DAMAGE}固定`;
  }
  return name;
}

/** @param {number} untilMs @param {number} [nowMs] */
export function isMoeReflectBuffActive(untilMs, nowMs = performance.now()) {
  return untilMs > nowMs;
}

function cooldownRemainSec(cooldownUntilMs, nowMs, effectUntilMs = 0) {
  if (isMoeReflectBuffActive(effectUntilMs, nowMs)) return 0;
  if (cooldownUntilMs <= nowMs) return 0;
  return Math.ceil((cooldownUntilMs - nowMs) / 1000);
}

/** @param {number} [nowMs] */
export function activateMoeHyakkaRanran(nowMs = performance.now()) {
  return {
    effectUntilMs: nowMs + MOE_HYAKKA_RANRAN_DURATION_MS,
    cooldownUntilMs: nowMs + MOE_HYAKKA_RANRAN_COOLDOWN_MS,
  };
}

export function moeHyakkaRanranCooldownRemainSec(
  cooldownUntilMs,
  nowMs = performance.now(),
  effectUntilMs = 0
) {
  return cooldownRemainSec(cooldownUntilMs, nowMs, effectUntilMs);
}

/** @param {number} [nowMs] */
export function activateMoeSwordDance(nowMs = performance.now()) {
  return {
    effectUntilMs: nowMs + MOE_SWORD_DANCE_DURATION_MS,
    cooldownUntilMs: nowMs + MOE_SWORD_DANCE_COOLDOWN_MS,
  };
}

export function moeSwordDanceCooldownRemainSec(
  cooldownUntilMs,
  nowMs = performance.now(),
  effectUntilMs = 0
) {
  return cooldownRemainSec(cooldownUntilMs, nowMs, effectUntilMs);
}

/** @param {number} [nowMs] */
export function activateMoeRevengeGuard(nowMs = performance.now()) {
  return {
    effectUntilMs: nowMs + MOE_REVENGE_GUARD_DURATION_MS,
    cooldownUntilMs: nowMs + MOE_REVENGE_GUARD_COOLDOWN_MS,
    /** ジャストガード相当 — 最初の被弾で消費 */
    armed: true,
  };
}

export function moeRevengeGuardCooldownRemainSec(
  cooldownUntilMs,
  nowMs = performance.now(),
  effectUntilMs = 0
) {
  return cooldownRemainSec(cooldownUntilMs, nowMs, effectUntilMs);
}

/** @param {number} [nowMs] */
export function activateMoeRevengeSwing(nowMs = performance.now()) {
  return {
    effectUntilMs: nowMs + MOE_REVENGE_SWING_DURATION_MS,
    cooldownUntilMs: nowMs + MOE_REVENGE_SWING_COOLDOWN_MS,
  };
}

export function moeRevengeSwingCooldownRemainSec(
  cooldownUntilMs,
  nowMs = performance.now(),
  effectUntilMs = 0
) {
  return cooldownRemainSec(cooldownUntilMs, nowMs, effectUntilMs);
}

/**
 * @param {number} mitigatedIncoming
 * @param {boolean} revengeGuardArmed
 */
export function moeRevengeGuardReflectAmount(mitigatedIncoming, revengeGuardArmed) {
  if (!revengeGuardArmed) return 0;
  const base = Math.max(0, Math.floor(mitigatedIncoming));
  return Math.min(base, MOE_REVENGE_GUARD_REFLECT_CAP);
}

/**
 * @typedef {'physical' | 'magic'} MoeIncomingAttackKind
 * @typedef {{
 *   phoenixAuraUntilMs?: number,
 *   hyakkaUntilMs?: number,
 *   swordDanceUntilMs?: number,
 *   revengeGuardUntilMs?: number,
 *   revengeGuardArmed?: boolean,
 *   revengeSwingUntilMs?: number,
 *   counterClawUntilMs?: number,
 *   attackKind?: MoeIncomingAttackKind,
 *   phoenixNowMs?: number,
 * }} MoePetReflectStrikeCtx
 */

/**
 * @param {number} mitigatedIncoming 防御後ダメ
 * @param {number} rawIncoming 生ダメ（未使用だが将来魔法用）
 * @param {MoePetReflectStrikeCtx} ctx
 * @param {number} [nowMs]
 * @returns {{
 *   taken: number,
 *   reflect: number,
 *   fullGuard: boolean,
 *   logLabel: string | null,
 *   consumeRevengeGuard: boolean,
 * }}
 */
export function moeResolvePetIncomingReflect(
  mitigatedIncoming,
  rawIncoming,
  ctx,
  nowMs = performance.now()
) {
  const attackKind = ctx.attackKind ?? "physical";
  const mitigated = Math.max(0, Math.floor(mitigatedIncoming));
  const phoenixNow =
    ctx.phoenixNowMs != null ? ctx.phoenixNowMs : Date.now();

  if (isMoePhoenixAuraActive(ctx.phoenixAuraUntilMs ?? 0, phoenixNow)) {
    return {
      taken: 0,
      reflect: 0,
      fullGuard: true,
      logLabel: null,
      consumeRevengeGuard: false,
    };
  }

  if (
    attackKind === "magic" &&
    isMoeReflectBuffActive(ctx.hyakkaUntilMs ?? 0, nowMs)
  ) {
    return {
      taken: 0,
      reflect: 0,
      fullGuard: true,
      logLabel: "百花繚乱 — 魔法を完全回避",
      consumeRevengeGuard: false,
    };
  }

  if (isMoeReflectBuffActive(ctx.revengeGuardUntilMs ?? 0, nowMs)) {
    const reflect = moeRevengeGuardReflectAmount(
      mitigated,
      Boolean(ctx.revengeGuardArmed)
    );
    if (reflect > 0) {
      return {
        taken: 0,
        reflect,
        fullGuard: false,
        logLabel: "リベンジガード — 盾で反射",
        consumeRevengeGuard: true,
      };
    }
  }

  if (
    mitigated > 0 &&
    isMoeReflectBuffActive(ctx.revengeSwingUntilMs ?? 0, nowMs)
  ) {
    return {
      taken: 0,
      reflect: MOE_REVENGE_SWING_REFLECT_DAMAGE,
      fullGuard: false,
      logLabel: "リベンジスイング — 反射",
      consumeRevengeGuard: false,
    };
  }

  if (isMoeReflectBuffActive(ctx.hyakkaUntilMs ?? 0, nowMs) && mitigated > 0) {
    const split = moeCounterDamageSplitFromMitigated(
      mitigated,
      MOE_HYAKKA_RANRAN_PRESET
    );
    return {
      taken: split.taken,
      reflect: split.reflect,
      fullGuard: false,
      logLabel: "百花繚乱 — 反射",
      consumeRevengeGuard: false,
    };
  }

  if (
    attackKind === "magic" &&
    isMoeReflectBuffActive(ctx.swordDanceUntilMs ?? 0, nowMs) &&
    mitigated > 0
  ) {
    const split = moeCounterDamageSplitFromMitigated(
      mitigated,
      MOE_SWORD_DANCE_PRESET
    );
    return {
      taken: split.taken,
      reflect: split.reflect,
      fullGuard: false,
      logLabel: "ソードダンス — 魔法反射",
      consumeRevengeGuard: false,
    };
  }

  if (
    isMoeReflectBuffActive(ctx.swordDanceUntilMs ?? 0, nowMs) &&
    mitigated > 0
  ) {
    const split = moeCounterDamageSplitFromMitigated(
      mitigated,
      MOE_SWORD_DANCE_PRESET
    );
    return {
      taken: split.taken,
      reflect: split.reflect,
      fullGuard: false,
      logLabel: "ソードダンス — 反射",
      consumeRevengeGuard: false,
    };
  }

  if (
    isMoeDragonCounterClawActive(
      ctx.counterClawUntilMs ?? 0,
      ctx.phoenixNowMs ?? Date.now()
    ) &&
    mitigated > 0
  ) {
    const split = moeDragonCounterClawDamageSplit(mitigated, rawIncoming);
    return {
      taken: split.taken,
      reflect: split.reflect,
      fullGuard: false,
      logLabel: "カウンタークロウ — 反射",
      consumeRevengeGuard: false,
    };
  }

  return {
    taken: mitigated,
    reflect: 0,
    fullGuard: false,
    logLabel: null,
    consumeRevengeGuard: false,
  };
}
