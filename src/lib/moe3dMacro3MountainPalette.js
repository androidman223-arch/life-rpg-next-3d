/**
 * マクロ３ — 簡易山のカラー（バイオーム別 · 同一タイル内で交互）
 */

/** @typedef {'desert'|'forest'|'volcano'|'sulfur_mine'|'stone'|'hills'|'canyon'|'coast'|'plain'|'cave'|'ruins'} MoeMacro3MountainBiome */

/** @type {Record<MoeMacro3MountainBiome, number[]>} */
export const MOE_MACRO3_BIOME_COLORS = {
  desert: [0xd4a574, 0xb8895a],
  forest: [0x4ade80, 0x166534],
  volcano: [0xb45309, 0x7c2d12],
  sulfur_mine: [0xdc2626, 0xb91c1c, 0x7c2d12],
  stone: [0x78716c, 0x57534e],
  hills: [0xa78bfa, 0x7c3aed],
  canyon: [0xfb923c, 0xc2410c],
  coast: [0xd4b896, 0xa8a29e],
  plain: [0x84cc16, 0x4d7c0f],
  cave: [0x64748b, 0x475569],
  ruins: [0xd6d3d1, 0xa8a29e],
};

/** @type {Record<string, MoeMacro3MountainBiome>} */
export const MOE_MACRO3_SLOT_BIOME = {
  desert_preview: "desert",
  hatiil_desert: "desert",
  elvin_valley: "forest",
  albeez_forest: "forest",
  ilvana_valley: "forest",
  elvin_mountains: "stone",
  darin_mountain: "stone",
  neoku_mountain: "volcano",
  neoku_plateau: "volcano",
  sulfur_mine: "sulfur_mine",
  lexur_hills: "hills",
  garm_corridor: "stone",
  ips_canyon: "canyon",
  slorim_plain: "plain",
  meerim_coast: "coast",
  ark_ruins: "ruins",
  eisis_cave: "cave",
};

/**
 * @param {string} slotId
 * @param {number} [index]
 */
export function moeMacro3MountainColorForSlot(slotId, index = 0) {
  const biome = MOE_MACRO3_SLOT_BIOME[slotId] ?? "stone";
  const colors = MOE_MACRO3_BIOME_COLORS[biome] ?? MOE_MACRO3_BIOME_COLORS.stone;
  return colors[Math.abs(Math.floor(index)) % colors.length];
}
