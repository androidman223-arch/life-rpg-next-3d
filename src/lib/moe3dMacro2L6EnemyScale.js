/**
 * マクロ２ L6 — 敵サイズ（プレイヤー身長基準 · MOE公式体型ティア）
 *
 *   表示高さ = MOE_MACRO2_PLAYER_REF_HEIGHT × ratioVsPlayer
 *
 * ティア表: `moeMacro2OfficialSizeTiers.js`
 * レジストリ: `moeMacro2EnemyScaleRegistry.js`（マクロ１配置敵31種）
 */

import {
  moeMacro2EnemyScaleEntry,
  MOE_MACRO2_ENEMY_SCALE_REGISTRY,
  MOE_MACRO2_PLAYER_REF_HEIGHT,
} from "@/data/moeMacro2EnemyScaleRegistry";

export { MOE_MACRO2_ENEMY_SCALE_REGISTRY };

/**
 * @param {string} key
 * @returns {number|null} fitModelToGround 目標高さ。未登録は null（従来ロジックへ）
 */
export function moeMacro2EnemyDisplayHeight(key) {
  const entry = moeMacro2EnemyScaleEntry(key);
  if (!entry) return null;
  return MOE_MACRO2_PLAYER_REF_HEIGHT * entry.ratioVsPlayer;
}

/**
 * @param {string} key
 * @returns {string|null}
 */
export function moeMacro2EnemyScaleNote(key) {
  return moeMacro2EnemyScaleEntry(key)?.note ?? null;
}
