/**
 * オークマジシャン — プレイヤー索敵後にペットへゆっくり火の玉
 * 反射成功時はペットから敵へ返す
 */

import { checkMoeEnemyPlayerDetection } from "./moeEnemyDetection.js";
import { moeResolveEnemyFieldStrike } from "./moeEnemyFieldStrike.js";

/** プレイヤー歩行より遅め — 逃げられる程度 */
export const MOE_ORC_MAG_FIREBALL_SPEED = 6;
export const MOE_ORC_MAG_FIREBALL_HIT_RADIUS = 1.55;
export const MOE_ORC_MAG_FIREBALL_COOLDOWN_MS = 5000;
export const MOE_ORC_MAG_FIREBALL_MAX_TRAVEL = 90;

/** @typedef {'enemyToPet' | 'petToEnemy'} MoeFieldFireballTargetKind */

/**
 * @typedef {{
 *   id: string,
 *   enemyId: number,
 *   enemyName: string,
 *   enemyKey: string,
 *   targetKind: MoeFieldFireballTargetKind,
 *   x: number,
 *   z: number,
 *   y: number,
 *   vx: number,
 *   vz: number,
 *   damageRaw: number,
 *   travel: number,
 * }} MoeFieldFireball
 */

/**
 * @param {object} enemy
 * @param {{ x: number, y: number }} petPos
 * @param {number} [nowMs]
 * @returns {MoeFieldFireball}
 */
export function spawnMoeOrcMagicianFireball(enemy, petPos, nowMs = performance.now()) {
  const strike = moeResolveEnemyFieldStrike(enemy, { useStrong: false });
  const dx = petPos.x - enemy.x;
  const dz = petPos.y - enemy.y;
  const dist = Math.hypot(dx, dz) || 1;
  const sp = MOE_ORC_MAG_FIREBALL_SPEED;
  return {
    id: `fb-${enemy.id}-${nowMs}`,
    enemyId: enemy.id,
    enemyName: enemy.name ?? "オーク マジシャン",
    enemyKey: enemy.key ?? "orc_magician",
    targetKind: "enemyToPet",
    x: enemy.x,
    z: enemy.y,
    y: 1.15,
    vx: (dx / dist) * sp,
    vz: (dz / dist) * sp,
    damageRaw: strike.damageRaw,
    travel: 0,
  };
}

/**
 * 反射で跳ね返す火の玉（着弾時に敵へダメージ）
 * @param {{ x: number, y: number }} petPos
 * @param {object} enemy
 * @param {number} damageRaw
 * @param {number} [nowMs]
 */
export function spawnMoeReflectReturnFireball(
  petPos,
  enemy,
  damageRaw,
  nowMs = performance.now()
) {
  const dx = enemy.x - petPos.x;
  const dz = enemy.y - petPos.y;
  const dist = Math.hypot(dx, dz) || 1;
  const sp = MOE_ORC_MAG_FIREBALL_SPEED;
  return {
    id: `fb-ret-${enemy.id}-${nowMs}`,
    enemyId: enemy.id,
    enemyName: enemy.name ?? "敵",
    enemyKey: enemy.key ?? "",
    targetKind: "petToEnemy",
    x: petPos.x,
    z: petPos.y,
    y: 1.15,
    vx: (dx / dist) * sp,
    vz: (dz / dist) * sp,
    damageRaw: Math.max(0, Math.floor(damageRaw)),
    travel: 0,
  };
}

/**
 * @param {{ reflect: number, fullGuard: boolean, logLabel: string | null }} reflectResolved
 * @param {number} damageRaw 敵の火の玉の威力
 */
export function moeReflectReturnFireballDamage(
  reflectResolved,
  damageRaw
) {
  if (reflectResolved.reflect > 0) {
    return { spawn: true, damage: reflectResolved.reflect };
  }
  if (
    reflectResolved.fullGuard &&
    reflectResolved.logLabel &&
    /魔法/.test(reflectResolved.logLabel)
  ) {
    return { spawn: true, damage: damageRaw };
  }
  return { spawn: false, damage: 0 };
}

/**
 * @param {MoeFieldFireball[]} balls
 * @param {number} dt
 * @param {{
 *   petPos: { x: number, y: number },
 *   enemyPos: (enemyId: number) => { x: number, y: number } | null,
 * }} ctx
 */
export function tickMoeFieldFireballs(balls, dt, ctx) {
  /** @type {MoeFieldFireball[]} */
  const next = [];
  /** @type {MoeFieldFireball[]} */
  const petHits = [];
  /** @type {MoeFieldFireball[]} */
  const enemyHits = [];
  const sp = MOE_ORC_MAG_FIREBALL_SPEED;

  for (const b of balls) {
    if (b.targetKind === "petToEnemy") {
      const ep = ctx.enemyPos(b.enemyId);
      if (!ep) continue;
      const dx = ep.x - b.x;
      const dz = ep.y - b.z;
      const dist = Math.hypot(dx, dz) || 1;
      const vx = (dx / dist) * sp;
      const vz = (dz / dist) * sp;
      const nx = b.x + vx * dt;
      const nz = b.z + vz * dt;
      const travel = b.travel + sp * dt;
      const hitDist = Math.hypot(ep.x - nx, ep.y - nz);
      if (hitDist <= MOE_ORC_MAG_FIREBALL_HIT_RADIUS) {
        enemyHits.push({ ...b, x: nx, z: nz, travel, vx, vz });
        continue;
      }
      if (travel >= MOE_ORC_MAG_FIREBALL_MAX_TRAVEL) continue;
      next.push({ ...b, x: nx, z: nz, travel, vx, vz });
      continue;
    }

    const nx = b.x + b.vx * dt;
    const nz = b.z + b.vz * dt;
    const travel = b.travel + sp * dt;
    const hitDist = Math.hypot(ctx.petPos.x - nx, ctx.petPos.y - nz);
    if (hitDist <= MOE_ORC_MAG_FIREBALL_HIT_RADIUS) {
      petHits.push({ ...b, x: nx, z: nz, travel });
      continue;
    }
    if (travel >= MOE_ORC_MAG_FIREBALL_MAX_TRAVEL) continue;
    next.push({ ...b, x: nx, z: nz, travel });
  }
  return { balls: next, petHits, enemyHits, hits: petHits };
}

/** @deprecated use tickMoeFieldFireballs */
export function tickMoeOrcMagicianFireballs(balls, dt, petPos) {
  return tickMoeFieldFireballs(balls, dt, {
    petPos,
    enemyPos: () => null,
  });
}

/**
 * プレイヤーが索敵に入った瞬間に1発（クールダウン付き）
 * @param {{
 *   enemies: object[],
 *   runtimeById: Record<number, { x: number, y: number, facingYaw: number }>,
 *   playerPos: { x: number, y: number },
 *   petPos: { x: number, y: number },
 *   detectionOpts: object,
 *   playerSeenByEnemy: Record<number, boolean>,
 *   lastShotMsByEnemy: Record<number, number>,
 *   nowMs?: number,
 * }} ctx
 * @returns {MoeFieldFireball[]}
 */
export function tickMoeOrcMagicianSalvo(ctx) {
  const nowMs = ctx.nowMs ?? performance.now();
  const spawned = [];
  for (const enemy of ctx.enemies) {
    if (enemy.hp <= 0 || enemy.key !== "orc_magician") continue;
    const rt = ctx.runtimeById[enemy.id];
    const ex = rt?.x ?? enemy.x;
    const ez = rt?.y ?? enemy.y;
    const facingYaw = rt?.facingYaw ?? 0;
    const detect = checkMoeEnemyPlayerDetection(
      enemy,
      ctx.playerPos,
      { x: ex, y: ez },
      facingYaw,
      ctx.detectionOpts
    );
    const seen = Boolean(detect.detected);
    const wasSeen = Boolean(ctx.playerSeenByEnemy[enemy.id]);
    ctx.playerSeenByEnemy[enemy.id] = seen;
    if (!seen) continue;
    const last = ctx.lastShotMsByEnemy[enemy.id] ?? 0;
    const edge = !wasSeen;
    const cooled = nowMs - last >= MOE_ORC_MAG_FIREBALL_COOLDOWN_MS;
    if (!edge && !cooled) continue;
    ctx.lastShotMsByEnemy[enemy.id] = nowMs;
    spawned.push(
      spawnMoeOrcMagicianFireball(
        { ...enemy, x: ex, y: ez },
        ctx.petPos,
        nowMs
      )
    );
  }
  return spawned;
}
