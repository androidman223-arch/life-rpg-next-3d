/**
 * 反射火の玉が敵に当たったときの短い点滅（3D）
 */

export const MOE_ENEMY_REFLECT_FIREBALL_HIT_FLASH_MS = 420;
export const MOE_ENEMY_REFLECT_FIREBALL_HIT_EMISSIVE = 0xffaa44;

/**
 * @param {Record<number, number>} untilByEnemyId
 * @param {number} enemyId
 * @param {number} [nowMs]
 */
export function triggerMoeEnemyReflectFireballHitFlash(
  untilByEnemyId,
  enemyId,
  nowMs = performance.now()
) {
  untilByEnemyId[enemyId] = nowMs + MOE_ENEMY_REFLECT_FIREBALL_HIT_FLASH_MS;
}

/** 0..1 — 残り時間で減衰＋軽い点滅 */
export function moeEnemyReflectFireballHitFlashStrength(untilMs, nowMs) {
  if (!untilMs || untilMs <= nowMs) return 0;
  const remain = untilMs - nowMs;
  const t = remain / MOE_ENEMY_REFLECT_FIREBALL_HIT_FLASH_MS;
  return t * (0.5 + 0.5 * Math.sin(nowMs * 0.038));
}

/**
 * @param {import("three").Object3D | null | undefined} root
 * @param {number} untilMs
 * @param {number} nowMs
 * @param {Map<object, { emissive: number, emissiveIntensity: number }>} origins
 */
export function tickMoe3dEnemyReflectFireballHitFlash(
  root,
  untilMs,
  nowMs,
  origins
) {
  const strength = moeEnemyReflectFireballHitFlashStrength(untilMs, nowMs);
  const active = strength > 0.03;
  if (!root) return active;
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (!mat.emissive) continue;
      if (active) {
        if (!origins.has(mat)) {
          origins.set(mat, {
            emissive: mat.emissive.getHex(),
            emissiveIntensity: mat.emissiveIntensity ?? 0,
          });
        }
        mat.emissive.setHex(MOE_ENEMY_REFLECT_FIREBALL_HIT_EMISSIVE);
        mat.emissiveIntensity = 0.1 + strength * 0.32;
      } else if (origins.has(mat)) {
        const orig = origins.get(mat);
        mat.emissive.setHex(orig.emissive);
        mat.emissiveIntensity = orig.emissiveIntensity;
        origins.delete(mat);
      }
    }
  });
  return active;
}
