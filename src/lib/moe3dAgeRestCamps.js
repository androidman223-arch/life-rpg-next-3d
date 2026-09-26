/**
 * AGE — 焚き火（複数拠点）
 */

import { moeAltarDefById } from "@/data/moeAltarWarps";
import { moe3dAltarWorldPos } from "@/lib/moe3dAltarWarp";
import { moe3dAgeHubCampfireWorldPos } from "@/lib/moe3dAgeHubHouse";

export const MOE_AGE_REST_CAMP_RADIUS = 3.8;

/** ソレス渓谷アルター付近（湯エリア手前） */
const SOLES_CAMP_OFF_X = 6;
const SOLES_CAMP_OFF_Z = 4;

/**
 * @param {number} tileW
 * @param {number} tileD
 * @returns {{ x: number, y: number } | null}
 */
export function moe3dSolesValleyCampfireWorldPos(tileW, tileD) {
  const altar = moeAltarDefById("altar_soles_valley");
  const pos = altar ? moe3dAltarWorldPos(altar, tileW, tileD) : null;
  if (!pos) return null;
  return {
    x: pos.x + SOLES_CAMP_OFF_X,
    y: pos.y + SOLES_CAMP_OFF_Z,
  };
}

/**
 * @param {number} tileW
 * @param {number} tileD
 * @returns {{ id: string, mapSlotId: string, x: number, y: number }[]}
 */
export function moe3dAgeRestCampfireWorldPositions(tileW, tileD) {
  const out = [];
  const yug = moe3dAgeHubCampfireWorldPos(tileW, tileD);
  if (yug) {
    out.push({ id: "yug_hub", mapSlotId: "yug_coast", x: yug.x, y: yug.y });
  }
  const soles = moe3dSolesValleyCampfireWorldPos(tileW, tileD);
  if (soles) {
    out.push({
      id: "soles_bath",
      mapSlotId: "soles_valley",
      x: soles.x,
      y: soles.y,
    });
  }
  return out;
}

/** @param {number} [radius] */
export function moe3dIsNearAgeRestCampfire(px, py, tileW, tileD, radius = MOE_AGE_REST_CAMP_RADIUS) {
  return moe3dAgeRestCampfireWorldPositions(tileW, tileD).some(
    (c) => Math.hypot(px - c.x, py - c.y) <= radius
  );
}
