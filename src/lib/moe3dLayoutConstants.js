/**
 * 3D ワールドレイアウトの共有定数（循環 import 防止 · 他モジュールへ依存しない）
 *
 * moe3dWorldLayout / moeAltarWarps / moe3dMonsterMapSpawns はここから読む。
 * 詳細: docs/moe-lessons.md「3D 循環 import」 · __MOE_DEV__.guide() → worldLayout3d
 */

/** 試作マップ（既存 2×4 プロトタイプ）の敷き詰め枚数 */
export const MOE_3D_LEGACY_TILES_X = 2;
export const MOE_3D_LEGACY_TILES_Z = 4;

/**
 * 1マップ面あたりのワールド間隔倍率（マクロ追い込み後の余裕 · 推奨 1.6〜1.8）
 * 位置間隔とタイル mesh の xz スケールに共通利用
 */
export const MOE_3D_TILE_SPACING = 1.7;

/** @param {number} tileW */
export function moe3dLayoutTileW(tileW) {
  return tileW * MOE_3D_TILE_SPACING;
}

/** @param {number} tileD */
export function moe3dLayoutTileD(tileD) {
  return tileD * MOE_3D_TILE_SPACING;
}

/** 砂漠プレビュー面のローカル配置（既存タイル列の東） */
export function moe3dDesertPreviewTileIndex(tilesX, _tilesZ) {
  return {
    ix: tilesX,
    iz: 2,
  };
}
