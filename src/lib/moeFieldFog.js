/**
 * フィールドの霧 — 森だけ。筋斗雲のあいだは晴れ。
 */

import { MOE_MACRO3_SLOT_BIOME } from "./moe3dMacro3MountainPalette.js";

/** 森の地上。従来の近い霧 */
export const MOE_FIELD_FOG_FOREST = { near: 55, far: 190 };

/** 森以外・筋斗雲。カメラの先までほぼ晴れ */
export const MOE_FIELD_FOG_CLEAR = { near: 260, far: 320 };

/**
 * @param {string | null | undefined} slotId
 */
export function moeFieldSlotIsForest(slotId) {
  return Boolean(slotId) && MOE_MACRO3_SLOT_BIOME[slotId] === "forest";
}

/**
 * @param {string | null | undefined} slotId
 * @param {boolean} kintounOn
 * @returns {{ near: number, far: number }}
 */
export function moeFieldFogDistances(slotId, kintounOn) {
  if (kintounOn) return MOE_FIELD_FOG_CLEAR;
  if (moeFieldSlotIsForest(slotId)) return MOE_FIELD_FOG_FOREST;
  return MOE_FIELD_FOG_CLEAR;
}
