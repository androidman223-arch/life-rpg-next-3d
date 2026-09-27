import {
  MOE_OFFICIAL_SIZE_TIER_BY_KEY,
  MOE_OFFICIAL_SIZE_TIERS,
  moeOfficialRatioVsPlayer,
  moeOfficialSizeNote,
} from "@/data/moeMacro2OfficialSizeTiers";
import { MOE_MONSTER_FAMILIES } from "@/data/moeMonsterLineup";

/** 敵サイズの公式比率の基準背高。フィールドのプレイヤー表示高さとは別 */
export const MOE_MACRO2_PLAYER_REF_HEIGHT = 1.52;

/**
 * マクロ２ L6 — 敵表示サイズ（プレイヤー身長基準 · MOE公式体型ティア）
 *
 * ratioVsPlayer = 敵 fit 目標高さ ÷ 1.52
 * ティア定義: `moeMacro2OfficialSizeTiers.js`
 * 出典: MOE_MONSTER_FAMILIES.shapeNote · https://wikiwiki.jp/moe-pet/
 *
 * @typedef {{ ratioVsPlayer: number, tier: string, note?: string, shapeNote?: string }} MoeMacro2EnemyScaleEntry
 */

/** @param {string} key */
function buildEntry(key) {
  const tier = MOE_OFFICIAL_SIZE_TIER_BY_KEY[key] ?? "m";
  const family = MOE_MONSTER_FAMILIES.find((f) => f.id === key);
  return {
    ratioVsPlayer: moeOfficialRatioVsPlayer(key),
    tier,
    note: moeOfficialSizeNote(key),
    shapeNote: family?.shapeNote,
  };
}

/** @type {Record<string, MoeMacro2EnemyScaleEntry>} */
export const MOE_MACRO2_ENEMY_SCALE_REGISTRY = Object.fromEntries(
  Object.keys(MOE_OFFICIAL_SIZE_TIER_BY_KEY).map((key) => [key, buildEntry(key)])
);

export { MOE_OFFICIAL_SIZE_TIERS };

/** @param {string} key */
export function moeMacro2EnemyScaleEntry(key) {
  return MOE_MACRO2_ENEMY_SCALE_REGISTRY[key] ?? null;
}
