/**
 * マクロ２ L6 — MOE公式体型ティア（プレイヤー身長 = 1.0）
 *
 * 基準: コグニート♂トレーナー背高 1.52（`MOE_PLAYER_MODEL_HEIGHT`）
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
  salamander: "l",

  // アルビーズの森
  riverside_crawler: "m",
  orvan_pappy: "m",

  // ネオク山
  neoku_orvan: "l",
  nocker: "s",
};

/**
 * ティア基準値からの微調整（公式体型メモ + フィールド見え方）
 * @type {Record<string, number>}
 */
export const MOE_OFFICIAL_SIZE_RATIO_OVERRIDE = {
  meerim_rat: 1.12,
  elvin_spider: 1.38,
  elvin_wolf: 1.4,
  elvin_bison: 1.82,
  rescue_bear: 1.18,
  gigas_boss: 2.35,
  gigas_mammoth: 2.32,
  storm_punisher: 5.8,
  chimera: 3.85,
  elan_knight_white: 1.1,
  elan_knight_black: 1.16,
  salamander: 1.28,
  riverside_crawler: 1.05,
  orvan_pappy: 1.12,
  neoku_orvan: 1.22,
  nocker: 0.92,
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
