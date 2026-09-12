/** マクロ３ — 簡易山 · 緑コライダー */

/** 見た目 sy に掛ける高さ倍率 */
export const MOE_SIMPLE_MOUNTAIN_HEIGHT_MULT = 3;
/** 見た目 sx/sz に掛ける広さ倍率 */
export const MOE_SIMPLE_MOUNTAIN_WIDTH_MULT = 0.5;
/** 緑コライダーを斜坡より外側へ（すき間・高さスナップ防止） */
export const MOE_GREEN_COLLIDER_OUTSET = 1.1;

/** 簡易山グループ */
export const MOE_SIMPLE_MOUNTAIN_GROUP_NAME = "macro3-simple-mountain";
/** 下ブロック — CylinderGeometry（円柱ステム · 地面側の空洞を埋める） */
export const MOE_SIMPLE_MOUNTAIN_STEM_NAME = "macro3-simple-mountain-stem";
/** 上ブロック — SphereGeometry 半球（ドーム · 見た目の山頂） */
export const MOE_SIMPLE_MOUNTAIN_DOME_NAME = "macro3-simple-mountain-dome";
/** 緑ワイヤー円柱コライダー */
export const MOE_GREEN_COLLIDER_NAME = "macro3-green-collider";

/** 登れる山 — 3段の狭い円錐台を重ねる */
export const MOE_CLIMBABLE_MOUNTAIN_GROUP_NAME = "macro3-climbable-mountain";
export const MOE_CLIMBABLE_TIER_NAME = "macro3-climbable-tier";
export const MOE_CLIMB_TIER_COUNT = 3;
/** 1段の高さ（MOE_PLAYER_TERRAIN_MAX_CLIMB=1.5 以下で登れる） */
export const MOE_CLIMB_TIER_HEIGHT = 1.32;
/** 上の段はこの倍率で狭くなる */
export const MOE_CLIMB_TIER_SHRINK = 0.68;
/** なだらか登攀 — 段差を緩く · 広めの台地 */
export const MOE_CLIMB_GENTLE_TIER_SHRINK = 0.88;
export const MOE_CLIMB_GENTLE_TIER_HEIGHT = 1.18;
export const MOE_CLIMB_GENTLE_PEAK_DOME = 0.26;

/** L1 専用タイル — 簡易山の基準地面高 */
export const MOE_MACRO3_BASE_TOP_Y = 0.12 + 0.35 / 2;
/** 予約タイル（低ポリ pad）— 簡易山の基準地面高 */
export const MOE_MACRO3_RESERVED_BASE_TOP_Y = 0.1 + 0.28 / 2;
