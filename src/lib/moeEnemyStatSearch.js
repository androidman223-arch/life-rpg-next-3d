/**
 * 敵ステサーチ — ターゲット敵のステータス表示用
 */

/** 敵ステサーチパネルのドラッグ位置（localStorage） */
export const MOE_ENEMY_STAT_SEARCH_PANEL_POS_KEY =
  "life-rpg-moe-enemy-stat-search-pos";

import {
  checkMoeEnemyPlayerDetection,
  formatMoeEnemyDetectionForSearch,
  moeEnemyChaseMaxRangeFromSpawn,
  moeEnemyUsesHearingSearch,
  resolveMoeEnemyDetection,
} from "./moeEnemyDetection.js";
import {
  formatMoeEnemyFieldActiveHint,
  formatMoeEnemyFieldActiveLabel,
  resolveMoeEnemyFieldActive,
} from "./moeEnemyFieldActive.js";

/**
 * @param {object|null|undefined} enemy
 * @returns {object|null}
 */
export function buildMoeEnemyStatSearchView(enemy) {
  if (!enemy) return null;
  const wiki = enemy.wiki ?? {};
  const skills =
    Array.isArray(enemy.skills) && enemy.skills.length > 0
      ? enemy.skills
      : ["（スキルデータなし）"];
  const detection = resolveMoeEnemyDetection(enemy);
  const detectionUi = formatMoeEnemyDetectionForSearch(detection);
  const fieldActive = resolveMoeEnemyFieldActive(enemy);

  return {
    id: enemy.id,
    name: enemy.name ?? "？？？",
    emoji: enemy.emoji ?? "❓",
    level: enemy.level ?? "?",
    hp: Math.max(0, Math.ceil(Number(enemy.hp) || 0)),
    hpMax: Math.max(1, Math.ceil(Number(enemy.hpMax) || 1)),
    mp: formatStat(wiki.mp),
    attack: formatStat(wiki.attack),
    defense: formatStat(wiki.defense),
    hit: formatStat(wiki.hit),
    magic: formatStat(wiki.magic),
    evasion: formatStat(wiki.evasion),
    fieldDamage: Math.max(0, Math.round(Number(enemy.petDamage) || 0)),
    attackIntervalSec:
      enemy.attackInterval != null
        ? Math.round(Number(enemy.attackInterval) * 10) / 10
        : null,
    skills,
    captureLife: enemy.captureLife ?? null,
    midBoss: Boolean(enemy.midBoss),
    superBoss: Boolean(enemy.superBoss),
    detection,
    detectionUi,
    fieldActive,
    fieldActiveLabel: formatMoeEnemyFieldActiveLabel(fieldActive),
    fieldActiveHint: formatMoeEnemyFieldActiveHint(fieldActive),
    chaseMaxRange: detection
      ? Math.round(moeEnemyChaseMaxRangeFromSpawn(detection) * 10) / 10
      : null,
  };
}

/**
 * 忍び足・隠れ蓑の現在効果（敵ステサーチ用）
 * @param {{ stealthFull?: boolean, soundMult?: number }} [opts]
 */
export function formatMoeEnemyStealthNote(opts = {}) {
  if (opts.stealthFull) {
    return {
      label: "隠れ蓑",
      detail: "完全ステルス — 視野・足音どちらも無効",
      tone: "stealth",
    };
  }
  const mult = opts.soundMult ?? 1;
  if (mult <= 0) {
    return {
      label: "忍び足",
      detail: "足音を感知されない",
      tone: "quiet",
    };
  }
  if (mult < 0.99) {
    const pct = Math.round(mult * 100);
    return {
      label: "忍び足",
      detail: `足音の感知距離が約${pct}%に`,
      tone: "quiet",
    };
  }
  return null;
}

/**
 * 足音索敵の現在射程（倍率込み）
 * @param {import("./moeEnemyDetection.js").MoeEnemyDetection} detection
 * @param {{ stealthFull?: boolean, soundMult?: number }} [opts]
 */
export function moeEnemyLiveHearingReach(detection, opts = {}) {
  if (!detection || !moeEnemyUsesHearingSearch(detection)) return null;
  if (opts.stealthFull) {
    return Math.round(detection.hearingRange * 10) / 10;
  }
  const mult = opts.soundMult ?? 1;
  if (mult <= 0) {
    return Math.round(detection.hearingRange * 10) / 10;
  }
  return Math.round(detection.hearingRange * mult * 10) / 10;
}

/**
 * 敵ステサーチ — プレイヤーが現在索敵範囲内か（3D 向きは canvas が供給）
 * @param {object|null|undefined} enemy
 * @param {{ x: number, y: number }|null|undefined} playerPos
 * @param {number} [enemyFacingYaw]
 * @param {{ stealthFull?: boolean, soundMult?: number, playerMoving?: boolean }} [opts]
 */
export function buildMoeEnemyLiveDetectionSnapshot(
  enemy,
  playerPos,
  enemyFacingYaw = 0,
  opts = {}
) {
  if (!enemy || !playerPos) return null;
  const result = checkMoeEnemyPlayerDetection(
    enemy,
    playerPos,
    { x: enemy.x, y: enemy.y },
    enemyFacingYaw,
    opts
  );
  const viaLabels = result.via.map((v) => (v === "visual" ? "視野" : "足音"));
  const fieldActive = resolveMoeEnemyFieldActive(enemy);
  if (result.detected && !fieldActive) {
    return {
      detected: true,
      statusLabel: "検知済み",
      viaLabels,
      detail:
        viaLabels.length > 0
          ? `${viaLabels.join("・")}で感知 — ノンアクティブのため追跡しない`
          : "感知 — ノンアクティブのため追跡しない",
      tone: "passive",
    };
  }
  return {
    detected: result.detected,
    statusLabel: result.detected ? "発見中" : "範囲外",
    viaLabels,
    detail: result.detected
      ? viaLabels.length > 0
        ? `${viaLabels.join("・")}で感知`
        : "感知"
      : "索敵範囲外",
    tone: result.detected ? "alert" : "safe",
  };
}

/** @param {unknown} v */
function formatStat(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return Math.round(n * 10) / 10;
}
