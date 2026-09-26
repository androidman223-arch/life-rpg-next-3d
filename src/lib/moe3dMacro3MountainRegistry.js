import {
  MOE_DARIN_MOUNTAIN_MOUNTAINS,
  MOE_DESERT_PREVIEW_MOUNTAINS,
  MOE_ELVIN_MOUNTAINS_MOUNTAINS,
  MOE_HATIIL_DESERT_MOUNTAINS,
  MOE_NEOUKU_MOUNTAIN_MOUNTAINS,
  MOE_NEOUKU_PLATEAU_MOUNTAINS,
} from "./moe3dMacro3SimpleMountain.js";

/** マクロ３ 簡易山ありの面 */
export const MOE_MACRO3_MOUNTAIN_SLOT_IDS = new Set([
  "desert_preview",
  "hatiil_desert",
  "neoku_mountain",
  "neoku_plateau",
  "darin_mountain",
  "elvin_mountains",
]);

/**
 * 面ごとの簡易山リスト — **sx / sz / sy / heightMult だけ調整**
 * @type {Record<string, import("./moe3dMacro3SimpleMountain.js").MoeSimpleMountainSpec[]>}
 */
export const MOE_MACRO3_MOUNTAIN_SPECS_BY_SLOT = {
  desert_preview: MOE_DESERT_PREVIEW_MOUNTAINS,
  sulfur_mine: [],
  hatiil_desert: MOE_HATIIL_DESERT_MOUNTAINS,
  neoku_mountain: MOE_NEOUKU_MOUNTAIN_MOUNTAINS,
  neoku_plateau: MOE_NEOUKU_PLATEAU_MOUNTAINS,
  darin_mountain: MOE_DARIN_MOUNTAIN_MOUNTAINS,
  elvin_mountains: MOE_ELVIN_MOUNTAINS_MOUNTAINS,
  lexur_hills: [],
  meerim_coast: [],
  elvin_valley: [],
  garm_corridor: [],
  ilvana_valley: [],
  slorim_plain: [],
  ips_canyon: [],
};

/**
 * @param {string} slotId
 */
export function moeMacro3MountainSpecsForSlot(slotId) {
  return MOE_MACRO3_MOUNTAIN_SPECS_BY_SLOT[slotId] ?? [];
}
