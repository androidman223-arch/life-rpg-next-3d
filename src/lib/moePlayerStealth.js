/**
 * MOE プレイヤー隠密 — 忍び足・隠れ蓑（索敵第3段）
 */

import { moeStealthVisualAvoidRate } from "./moePlayerSkillSuccessRate.js";

/** 忍び足 — 足音は感知されない（聴覚索敵オフ） */
export const MOE_SHINOBIASHI_SOUND_MULT = 0;

export const MOE_KAKUREMINO_DURATION_SEC = 7;
export const MOE_KAKUREMINO_COOLDOWN_SEC = 12;
export const MOE_KAKUREMINO_PLAYER_OPACITY = 0.32;

/**
 * @param {number} untilMs
 * @param {number} [nowMs]
 */
export function isMoeKakureminoActive(untilMs, nowMs = performance.now()) {
  return untilMs > nowMs;
}

/**
 * @param {number} cooldownUntilMs
 * @param {number} [nowMs]
 */
export function moeKakureminoCooldownRemainSec(
  cooldownUntilMs,
  nowMs = performance.now(),
  activeUntilMs = 0
) {
  if (isMoeKakureminoActive(activeUntilMs, nowMs)) return 0;
  if (cooldownUntilMs <= nowMs) return 0;
  return Math.ceil((cooldownUntilMs - nowMs) / 1000);
}

/**
 * @param {number} untilMs
 * @param {number} [nowMs]
 */
export function moeKakureminoActiveRemainSec(
  untilMs,
  nowMs = performance.now()
) {
  if (untilMs <= nowMs) return 0;
  return Math.ceil((untilMs - nowMs) / 1000);
}

/**
 * プレイヤー窓用 — 忍び足・隠れ蓑の表示ラベル
 * @param {{ shinobiashiOn?: boolean, stealthFull?: boolean, kakureminoRemainSec?: number }} opts
 */
export function formatMoePlayerStealthBadge(opts = {}) {
  if (opts.stealthFull) {
    const sec = opts.kakureminoRemainSec ?? 0;
    return {
      label: sec > 0 ? `🥷 隠れ蓑 ${sec}s` : "🥷 隠れ蓑",
      tone: "full",
    };
  }
  if (opts.shinobiashiOn) {
    return { label: "👣 忍び足", tone: "quiet" };
  }
  return null;
}

/**
 * @param {number} [nowMs]
 */
export function activateMoeKakuremino(nowMs = performance.now()) {
  const durationMs = MOE_KAKUREMINO_DURATION_SEC * 1000;
  const cooldownMs = MOE_KAKUREMINO_COOLDOWN_SEC * 1000;
  return {
    untilMs: nowMs + durationMs,
    cooldownUntilMs: nowMs + durationMs + cooldownMs,
  };
}

/**
 * @param {{
 *   playerMoving?: boolean,
 *   shinobiashiOn?: boolean,
 *   kakureminoUntilMs?: number,
 *   stealthProficiency?: number,
 *   stealthRequiredLevel?: number,
 *   nowMs?: number,
 * }} p
 */
export function buildMoeEnemyDetectionOpts(p) {
  const nowMs = p.nowMs ?? performance.now();
  const stealthFull = isMoeKakureminoActive(p.kakureminoUntilMs ?? 0, nowMs);
  const shinobiashiOn = Boolean(p.shinobiashiOn) && !stealthFull;
  const stealthVisualAvoidPct = shinobiashiOn
    ? moeStealthVisualAvoidRate(
        p.stealthProficiency ?? 0,
        p.stealthRequiredLevel ?? 10
      )
    : 0;
  return {
    playerMoving: Boolean(p.playerMoving),
    stealthFull,
    shinobiashiOn,
    stealthVisualAvoidPct,
    soundMult: stealthFull
      ? 0
      : shinobiashiOn
        ? MOE_SHINOBIASHI_SOUND_MULT
        : 1,
  };
}

/**
 * ヘイト解除 — 追跡中の敵を湧き位置へ戻す
 * @param {Record<number, object>} runtimeById
 * @param {object[]} enemies
 * @param {(enemy: object) => number} [resolveIdleFacingYaw]
 */
export function dropMoeEnemyFieldAggro(
  runtimeById,
  enemies,
  resolveIdleFacingYaw
) {
  let changed = false;
  for (const enemy of enemies) {
    const rt = runtimeById[enemy.id];
    if (!rt?.aggro) continue;
    rt.aggro = false;
    rt.lostSightAcc = 0;
    rt.x = rt.spawnX;
    rt.y = rt.spawnY;
    rt.facingYaw = resolveIdleFacingYaw?.(enemy) ?? 0;
    enemy.x = rt.spawnX;
    enemy.y = rt.spawnY;
    changed = true;
  }
  return changed;
}
