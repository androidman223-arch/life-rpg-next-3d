/**
 * MOE 敵フィールド追跡 — 索敵後プレイヤーへ接近（第2段）
 */

import {
  chaseDetectionForgetRange,
  checkMoeEnemyPlayerDetection,
  moeEnemyChaseMaxRangeFromSpawn,
} from "./moeEnemyDetection.js";
import { resolveMoeEnemyFieldActive } from "./moeEnemyFieldActive.js";
import { MOE_SHINOBIASHI_SOUND_MULT } from "./moePlayerStealth.js";

export { MOE_SHINOBIASHI_SOUND_MULT };

/** 3D プレイヤー歩行速度（MoeFieldMap MOVE_SPEED_3D * 60） */
export const MOE_PLAYER_FIELD_SPEED_3D = 0.2 * 60;
/** 敵追跡はプレイヤー歩行の約 1/3 */
export const MOE_ENEMY_CHASE_SPEED_RATIO = 1 / 3;
export const MOE_ENEMY_CHASE_ENGAGE_DIST_3D = 2.85;
/** 足音型など：索敵圏外が続いたら追跡解除（秒） */
export const MOE_ENEMY_CHASE_FORGET_SEC = 2;

function resetEnemyChaseHome(rt, enemy, resolveIdleFacingYaw) {
  rt.aggro = false;
  rt.lostSightAcc = 0;
  rt.x = rt.spawnX;
  rt.y = rt.spawnY;
  rt.facingYaw = resolveIdleFacingYaw?.(enemy) ?? 0;
  enemy.x = rt.spawnX;
  enemy.y = rt.spawnY;
}

export function moeEnemyChaseSpeedPerSec() {
  return MOE_PLAYER_FIELD_SPEED_3D * MOE_ENEMY_CHASE_SPEED_RATIO;
}

/**
 * @param {object|null|undefined} enemy
 * @param {object|null|undefined} duel
 */
export function canMoeEnemyFieldChase(enemy, duel) {
  if (!enemy || enemy.hp <= 0) return false;
  if (duel) return false;
  if (enemy.fieldGustav) return false;
  if (
    (enemy.midBoss || enemy.superBoss) &&
    !enemy.mapSlotId &&
    !enemy.spawnArea
  ) {
    return false;
  }
  return true;
}

/**
 * @param {object} enemy
 * @param {Record<number, object>} runtimeById
 * @param {(enemy: object) => { x?: number, y?: number, idleFacingYaw?: number }|null|undefined} [resolveFieldSync]
 */
function ensureChaseRuntime(enemy, runtimeById, resolveFieldSync) {
  const sync = resolveFieldSync?.(enemy);
  const baseX = sync?.x ?? enemy.x;
  const baseY = sync?.y ?? enemy.y;
  let rt = runtimeById[enemy.id];
  if (!rt) {
    rt = {
      aggro: false,
      facingYaw: sync?.idleFacingYaw ?? 0,
      spawnX: baseX,
      spawnY: baseY,
      x: baseX,
      y: baseY,
      lostSightAcc: 0,
    };
    runtimeById[enemy.id] = rt;
  } else if (!rt.aggro && sync) {
    rt.x = baseX;
    rt.y = baseY;
    rt.spawnX = baseX;
    rt.spawnY = baseY;
    if (sync.idleFacingYaw != null) {
      rt.facingYaw = sync.idleFacingYaw;
    }
  }
  return rt;
}

/**
 * @param {object} p
 * @param {object[]} p.enemies
 * @param {Record<number, object>} p.runtimeById
 * @param {{ x: number, y: number }} p.playerPos
 * @param {boolean} p.playerMoving
 * @param {number} p.dt
 * @param {object|null|undefined} p.duel
 * @param {{ stealthFull?: boolean, soundMult?: number }} [p.detectionOpts]
 * @param {number} [p.speedPerSec]
 * @param {number} [p.engageDist]
 * @param {number} [p.forgetSec]
 * @param {(fromX: number, fromZ: number, toX: number, toZ: number) => { x: number, z: number }} [p.resolveMove]
 * @param {(enemy: object) => number} [p.resolveIdleFacingYaw]
 * @param {(enemy: object) => { x?: number, y?: number, idleFacingYaw?: number }|null|undefined} [p.resolveFieldSync]
 */
export function tickMoeEnemyFieldChaseBatch({
  enemies,
  runtimeById,
  playerPos,
  playerMoving,
  dt,
  duel,
  detectionOpts = {},
  speedPerSec = moeEnemyChaseSpeedPerSec(),
  engageDist = MOE_ENEMY_CHASE_ENGAGE_DIST_3D,
  forgetSec = MOE_ENEMY_CHASE_FORGET_SEC,
  resolveMove,
  resolveIdleFacingYaw,
  resolveFieldSync,
}) {
  /** @type {number|null} */
  let engageEnemyId = null;
  /** @type {number|null} */
  let newAggroEnemyId = null;
  /** @type {number|null} */
  let leashBrokenEnemyId = null;
  let anyChasing = false;

  for (const enemy of enemies) {
    if (!canMoeEnemyFieldChase(enemy, duel)) {
      delete runtimeById[enemy.id];
      continue;
    }

    const rt = ensureChaseRuntime(enemy, runtimeById, resolveFieldSync);
    const sync = resolveFieldSync?.(enemy);
    const pos = rt.aggro
      ? { x: rt.x, y: rt.y }
      : {
          x: sync?.x ?? rt.x,
          y: sync?.y ?? rt.y,
        };
    const detectionFacingYaw = rt.aggro
      ? rt.facingYaw
      : (sync?.idleFacingYaw ??
        resolveIdleFacingYaw?.(enemy) ??
        rt.facingYaw);
    const detect = checkMoeEnemyPlayerDetection(
      enemy,
      playerPos,
      pos,
      detectionFacingYaw,
      { ...detectionOpts, playerMoving }
    );

    if (!rt.aggro && detect.detected && resolveMoeEnemyFieldActive(enemy)) {
      rt.aggro = true;
      rt.lostSightAcc = 0;
      // 待機向きで感知した直後に facingYaw=0 へ戻ると視覚型が即リセットされる
      rt.facingYaw = detectionFacingYaw;
      newAggroEnemyId = enemy.id;
    }

    if (!rt.aggro) continue;

    const detection = detect.detection;
    const maxFromSpawn = moeEnemyChaseMaxRangeFromSpawn(detection);
    const distPlayerFromSpawn = Math.hypot(
      playerPos.x - rt.spawnX,
      playerPos.y - rt.spawnY
    );
    if (distPlayerFromSpawn > maxFromSpawn) {
      resetEnemyChaseHome(rt, enemy, resolveIdleFacingYaw);
      leashBrokenEnemyId = enemy.id;
      continue;
    }

    if (!detect.detected) {
      if (detection.searchType === "visual") {
        resetEnemyChaseHome(rt, enemy, resolveIdleFacingYaw);
        continue;
      }
      rt.lostSightAcc += dt;
      const forgetRange = chaseDetectionForgetRange(detection);
      const dx = playerPos.x - pos.x;
      const dz = playerPos.y - pos.y;
      const outOfRange = Math.hypot(dx, dz) > forgetRange;
      if (rt.lostSightAcc >= forgetSec || outOfRange) {
        resetEnemyChaseHome(rt, enemy, resolveIdleFacingYaw);
        continue;
      }
    } else {
      rt.lostSightAcc = 0;
    }

    const dx = playerPos.x - pos.x;
    const dz = playerPos.y - pos.y;
    const dist = Math.hypot(dx, dz);
    if (dist <= engageDist) {
      engageEnemyId = enemy.id;
      continue;
    }

    const step = Math.min(dist, speedPerSec * dt);
    const nx = pos.x + (dx / dist) * step;
    const nz = pos.y + (dz / dist) * step;
    const resolved = resolveMove
      ? resolveMove(pos.x, pos.y, nx, nz)
      : { x: nx, z: nz };
    rt.x = resolved.x;
    rt.y = resolved.z;
    rt.facingYaw = Math.atan2(dx, dz);
    enemy.x = rt.x;
    enemy.y = rt.y;
    anyChasing = true;
  }

  return {
    engageEnemyId,
    newAggroEnemyId,
    leashBrokenEnemyId,
    anyChasing,
    runtimeById,
  };
}

/**
 * @param {number} enemyId
 * @param {Record<number, object>} runtimeById
 */
export function clearMoeEnemyChaseRuntime(enemyId, runtimeById) {
  delete runtimeById[enemyId];
}
