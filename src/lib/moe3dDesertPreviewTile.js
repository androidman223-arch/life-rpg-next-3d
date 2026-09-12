import { buildMoe3dDesertPreviewTile as buildMacro2DesertPreviewTile } from "@/lib/moe3dMacro2L1Tiles";

/** 砂漠プレビュー — マクロ２ L1 地形（`moe3dMacro2L1Tiles.js`） */
export function buildMoe3dDesertPreviewTile(tileW, tileD) {
  return buildMacro2DesertPreviewTile(tileW, tileD);
}

/** 砂漠プレビュー面のローカル配置（既存タイル列の東） */
export function moe3dDesertPreviewTileIndex(tilesX, _tilesZ) {
  return {
    ix: tilesX,
    iz: 2,
  };
}

/** 砂漠面に展示する敵（サンドワーム · スコーピオン） */
export const MOE_3D_DESERT_SHOWCASE_FAMILIES = new Set([
  "sandworm",
  "sand_scorpion",
]);

/**
 * 砂漠1面上の展示座標（Three.js x / z · フィールド y = z）
 * @param {string} familyId
 * @param {number} desertLocalX
 * @param {number} desertLocalZ
 * @param {number} tileW
 * @param {number} tileD
 * @param {number} terrainOriginX
 * @param {number} terrainOriginZ
 */
export function moe3dDesertMonsterShowcaseSpot(
  familyId,
  desertLocalX,
  desertLocalZ,
  tileW,
  tileD,
  terrainOriginX,
  terrainOriginZ
) {
  const spots = {
    sandworm: { tx: 0.55, tz: 0.62, yaw: Math.PI * 0.35 },
    sand_scorpion: { tx: 0.3, tz: 0.38, yaw: Math.PI * 0.15 },
  };
  const s = spots[familyId];
  if (!s) return null;
  return {
    x: terrainOriginX + desertLocalX + tileW * s.tx,
    y: terrainOriginZ + desertLocalZ + tileD * s.tz,
    yaw: s.yaw,
  };
}
