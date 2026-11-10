/**
 * ペット — プレイヤー反射スキル中の黄色点滅（3D）
 */

import { isMoeReflectBuffActive } from "./moePlayerReflectSkills.js";

export const MOE_PET_REFLECT_COUNTER_EMISSIVE = 0xffcc00;

/**
 * @param {{
 *   hyakkaUntilMs?: number,
 *   swordDanceUntilMs?: number,
 *   revengeGuardUntilMs?: number,
 *   revengeSwingUntilMs?: number,
 * }} ctx
 * @param {number} [nowMs]
 */
export function moePetReflectCounterActive(ctx, nowMs = performance.now()) {
  return (
    isMoeReflectBuffActive(ctx.hyakkaUntilMs ?? 0, nowMs) ||
    isMoeReflectBuffActive(ctx.swordDanceUntilMs ?? 0, nowMs) ||
    isMoeReflectBuffActive(ctx.revengeGuardUntilMs ?? 0, nowMs) ||
    isMoeReflectBuffActive(ctx.revengeSwingUntilMs ?? 0, nowMs)
  );
}

/** 0..1 — カウンター中の点滅（弱めの振幅） */
export function moePetReflectCounterPulse(nowMs = performance.now()) {
  return 0.35 + 0.3 * Math.sin(nowMs * 0.012);
}

/** 3D ポイントライト強度 */
export function moePetReflectCounterLightIntensity(pulse01) {
  return 0.18 + pulse01 * 0.42;
}

/**
 * @param {import("three").Object3D | null | undefined} root
 * @param {boolean} active
 * @param {number} pulse01
 * @param {Map<object, { emissive: number, emissiveIntensity: number, opacity: number, transparent: boolean }>} origins
 */
export function applyMoe3dPetReflectCounterVisual(root, active, pulse01, origins) {
  if (!root) return;
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
            opacity: mat.opacity ?? 1,
            transparent: Boolean(mat.transparent),
          });
        }
        mat.emissive.setHex(MOE_PET_REFLECT_COUNTER_EMISSIVE);
        mat.emissiveIntensity = 0.08 + pulse01 * 0.28;
        const orig = origins.get(mat);
        const nextOpacity = orig.opacity * (0.76 + pulse01 * 0.1);
        if (nextOpacity < orig.opacity) {
          mat.transparent = true;
          mat.opacity = nextOpacity;
        }
      } else if (origins.has(mat)) {
        const orig = origins.get(mat);
        mat.emissive.setHex(orig.emissive);
        mat.emissiveIntensity = orig.emissiveIntensity;
        mat.opacity = orig.opacity;
        mat.transparent = orig.transparent;
        origins.delete(mat);
      }
    }
  });
}
