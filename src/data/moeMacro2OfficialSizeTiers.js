/**
 * マクロ２ L6 — MOE公式体型ティア（プレイヤー身長 = 1.0）
 *
 * 基準: コグニート♂トレーナー公式背高 1.52（フィールド表示高さとは別）
 * 出典: MOE_MONSTER_FAMILIES.shapeNote · Wiki エリアガイド体型
 * 旧マクロ１一律倍率（0.525×3 ≈ 1.575m）≈ ratio 1.036 を「標準フィールド mob」基準とする。
 *
 * fitModelToGround 目標高さ = 1.52 × ratioVsPlayer
 */

/** @typedef {'xs'|'s'|'m'|'mPlus'|'l'|'xl'|'xxl'|'boss'|'superBoss'} MoeOfficialSizeTier */

/** @type {Record<MoeOfficialSizeTier, { ratioVsPlayer: number, label: string }>} */
export const MOE_OFFICIAL_SIZE_TIERS = {
  xs: { ratioVsPlayer: 0.55, label: "地上花·魚型·極低" },
  s: { ratioVsPlayer: 0.82, label: "小型四足·幼体·低蝎" },
  m: { ratioVsPlayer: 1.04, label: "標準 mob（人型·大型ネズミ·中蝎）" },
  mPlus: { ratioVsPlayer: 1.14, label: "やや大（鹿·ライオン·砂虫）" },
  l: { ratioVsPlayer: 1.36, label: "大型捕食（狼·蜘蛛·平原ライオン）" },
  xl: { ratioVsPlayer: 1.78, label: "巨大（渓谷牛·巨亀·デスワーム）" },
  xxl: { ratioVsPlayer: 2.28, label: "超巨大（ギガース·マンモス）" },
  boss: { ratioVsPlayer: 3.75, label: "大ボス（キマイラ）" },
  superBoss: { ratioVsPlayer: 5.75, label: "超ボス（ストームパニッシャー）" },
};

/**
 * familyId / field key → 公式体型ティア
 * @type {Record<string, MoeOfficialSizeTier>}
 */
export const MOE_OFFICIAL_SIZE_TIER_BY_KEY = {
  // レクスール・ヒルズ
  rescue_hound: "s",
  rescue_lion: "mPlus",
  rescue_buck: "mPlus",
  rescue_bear: "mPlus",
  rescue_amazoness: "m",
  gigas_boss: "xxl",

  // ミーリム海岸
  meerim_rat: "m",
  meerim_eats: "xs",
  meerim_snake: "s",
  sea_snake_field: "s",
  yug_sea_snake: "s",
  soles_rescue_hound: "s",
  geo_abyss_salamander: "l",
  mitoya_treant_guard: "xxl",

  // エイシス洞
  great_tarantula: "xl",

  // エルビン渓谷
  elvin_spider: "l",
  elvin_wolf: "l",
  elvin_bison: "xl",

  // ガルム回廊
  orc_gang: "m",
  garm_deer: "mPlus",
  orc_magician: "m",

  // イルヴァーナ渓谷
  ilvana_wolf: "l",

  // デザート見本
  sandworm: "mPlus",
  sand_scorpion: "s",
  desert_scorpion_med: "m",

  // スローリム平原
  gigas_mammoth: "xxl",
  slorim_lion: "l",

  // イプス峡谷
  turtle: "s",
  giant_tortoise: "xl",
  ips_bass: "xs",

  // ハティル砂漠
  deathworm: "xl",
  doodlebug_small: "s",
  doodlebug_medium: "m",
  storm_punisher: "superBoss",
  chimera: "boss",
  desert_scorpion_large: "mPlus",

  // スルト鉱山（マクロ１ · Wiki エリアガイド体型）
  elan_knight_white: "mPlus",
  elan_knight_black: "mPlus",
  giant_destroyer: "boss",
  frost_wolf: "m",
  gargoyle_lord: "l",
  gargoyle_lord_strong: "l",
  lizardman_soldier: "mPlus",
  lizardman_mage: "m",
  lizardman_captain: "mPlus",
  minotaur_boss: "superBoss",
  dullahan: "superBoss",
  salamander: "l",

  // アルビーズの森
  riverside_crawler: "m",
  orvan_pappy: "m",

  // ネオク山
  neoku_orvan: "l",
  nocker: "s",

  // エルビン山脈（追加）
  pygmy_gryphon: "m",
  tyrant_gryphon: "superBoss",
  soil_basilisk: "l",

  // 飛竜の谷
  wild_orvan: "xl",
  ancient_treant: "xxl",
  sky_dragon: "xl",
};

/**
 * ティア基準値からの微調整（公式体型メモ + フィールド見え方）
 * @type {Record<string, number>}
 */
export const MOE_OFFICIAL_SIZE_RATIO_OVERRIDE = {
  meerim_rat: 1.12,
  elvin_spider: 1.38,
  great_tarantula: 1.72,
  elvin_wolf: 1.4,
  elvin_bison: 1.82,
  rescue_bear: 1.18,
  gigas_boss: 2.35,
  gigas_mammoth: 2.32,
  storm_punisher: 5.8,
  chimera: 3.85,
  elan_knight_white: 1.1,
  elan_knight_black: 1.16,
  giant_destroyer: 2.4,
  frost_wolf: 1.35,
  gargoyle_lord: 1.85,
  gargoyle_lord_strong: 2.1,
  lizardman_soldier: 1.12,
  lizardman_mage: 1.05,
  lizardman_captain: 1.18,
  minotaur_boss: 3.2,
  dullahan: 1.2,
  salamander: 1.28,
  riverside_crawler: 1.05,
  orvan_pappy: 1.28,
  neoku_orvan: 1.22,
  nocker: 0.92,
  pygmy_gryphon: 0.95,
  tyrant_gryphon: 3.4,
  soil_basilisk: 1.35,
  wild_orvan: 1.85,
  ancient_treant: 2.4,
  sky_dragon: 1.78,
};

/** @param {string} key */
export function moeOfficialSizeTierForKey(key) {
  return MOE_OFFICIAL_SIZE_TIER_BY_KEY[key] ?? "m";
}

/** @param {string} key */
export function moeOfficialRatioVsPlayer(key) {
  if (MOE_OFFICIAL_SIZE_RATIO_OVERRIDE[key] != null) {
    return MOE_OFFICIAL_SIZE_RATIO_OVERRIDE[key];
  }
  const tier = moeOfficialSizeTierForKey(key);
  return MOE_OFFICIAL_SIZE_TIERS[tier].ratioVsPlayer;
}

/** @param {string} key */
export function moeOfficialSizeNote(key) {
  const tier = moeOfficialSizeTierForKey(key);
  return MOE_OFFICIAL_SIZE_TIERS[tier].label;
}
