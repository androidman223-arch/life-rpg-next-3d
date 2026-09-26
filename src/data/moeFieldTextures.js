/**
 * フィールド地面テクスチャ（Diffuse / Color）
 * public/assets/textures/field/ — AmbientCG / Poly Haven / OpenGameArt CC0
 */

/** @typedef {'grass'|'forest_floor'|'basalt_rock'|'sulfur_rock'|'cave_stone'|'cave_stone_dark'|'sand'|'beach_sand'|'cliff_rock'|'cobble'|'marble_white_glossy'|'marble_tiles_white'|'marble_dark'|'moss_stone'|'mud_wet'|'path_gravel'|'path_dirt'|'path_dirt_yellow'|'path_stone'|'lava_pool'|'lava_pool_bright_red'|'sea'|'sea_shallow'|'sea_deep'|'snow'|'ice'|'soil_dark_brown'|'soil_brown_black'|'soil_red_brown'} MoeFieldTextureKey */

/** @type {Record<MoeFieldTextureKey, string>} */
export const FIELD_TEXTURES_MEDIA = {
  grass: "/assets/textures/field/grass.jpg",
  forest_floor: "/assets/textures/field/forest_floor.jpg",
  basalt_rock: "/assets/textures/field/basalt_rock.jpg",
  sulfur_rock: "/assets/textures/field/sulfur_rock.jpg",
  cave_stone: "/assets/textures/field/cave_stone.jpg",
  cave_stone_dark: "/assets/textures/field/cave_stone_dark.jpg",
  sand: "/assets/textures/field/sand.jpg",
  beach_sand: "/assets/textures/field/beach_sand.jpg",
  cliff_rock: "/assets/textures/field/cliff_rock.jpg",
  cobble: "/assets/textures/field/cobble.jpg",
  marble_white_glossy: "/assets/textures/field/marble_white_glossy.jpg",
  marble_tiles_white: "/assets/textures/field/marble_tiles_white.jpg",
  marble_dark: "/assets/textures/field/marble_dark.jpg",
  moss_stone: "/assets/textures/field/moss_stone.jpg",
  mud_wet: "/assets/textures/field/mud_wet.jpg",
  path_gravel: "/assets/textures/field/path_gravel.jpg",
  path_dirt: "/assets/textures/field/path_dirt.jpg",
  path_dirt_yellow: "/assets/textures/field/path_dirt_yellow.jpg",
  path_stone: "/assets/textures/field/path_stone.jpg",
  lava_pool: "/assets/textures/field/lava_pool.jpg",
  lava_pool_bright_red: "/assets/textures/field/lava_pool_bright_red.jpg",
  sea: "/assets/textures/field/sea.jpg",
  sea_shallow: "/assets/textures/field/sea_shallow.jpg",
  sea_deep: "/assets/textures/field/sea_deep.jpg",
  snow: "/assets/textures/field/snow.jpg",
  ice: "/assets/textures/field/ice.jpg",
  soil_dark_brown: "/assets/textures/field/soil_dark_brown.jpg",
  soil_brown_black: "/assets/textures/field/soil_brown_black.jpg",
  soil_red_brown: "/assets/textures/field/soil_red_brown.jpg",
};

/** @typedef {import('@/lib/moe3dMacro3MountainPalette').MoeMacro3MountainBiome} MoeMacro3MountainBiome */

/** @type {Record<MoeMacro3MountainBiome, MoeFieldTextureKey>} */
export const MOE_FIELD_BIOME_TEXTURE = {
  plain: "grass",
  forest: "forest_floor",
  volcano: "basalt_rock",
  sulfur_mine: "sulfur_rock",
  cave: "cave_stone_dark",
  desert: "sand",
  stone: "soil_brown_black",
  hills: "moss_stone",
  canyon: "soil_red_brown",
  coast: "beach_sand",
  ruins: "marble_white_glossy",
};

/**
 * @param {MoeMacro3MountainBiome | string} biome
 * @returns {string}
 */
export function moeFieldTextureUrlForBiome(biome) {
  const key = MOE_FIELD_BIOME_TEXTURE[biome] ?? "grass";
  return FIELD_TEXTURES_MEDIA[key];
}
