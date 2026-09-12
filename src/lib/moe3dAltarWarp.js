import {
  MOE_ALTARS,
  MOE_MAP_ALTAR_LAYOUTS,
  moeAltarDefById,
  moeMapAltarLayout,
} from "@/data/moeAltarWarps";
import {
  moe3dBiskWorldCenter,
  moe3dMapSlotById,
  moe3dSlotSpawnWorld,
} from "@/lib/moe3dWorldLayout";
import {
  MOE_3D_HALF_D,
  MOE_3D_HALF_W,
  MOE_3D_LEGACY_REF_HALF,
  MOE_3D_LEGACY_TILES_X,
  MOE_3D_LEGACY_TILES_Z,
  moe3dPlayerStartPosition,
} from "@/lib/moeField3DModels";

export { moe3dSlotSpawnWorld };

/**
 * @param {import("@/data/moeAltarWarps").MoeMapAltarLayout} layout
 * @param {number} tileW
 * @param {number} tileD
 * @param {number} [halfW]
 * @param {number} [halfD]
 */
function moe3dResolveAltarCoords(layout, mapSlotId, tileW, tileD, halfW, halfD) {
  if (layout.anchor === "player_start") {
    const refHalf = MOE_3D_LEGACY_REF_HALF;
    const start = moe3dPlayerStartPosition(refHalf, refHalf);
    const altarX = start.x + (layout.altarOffX ?? 0);
    const altarZ = start.y + (layout.altarOffZ ?? -5);
    const spawnX = altarX + (layout.spawnOffX ?? 0);
    const spawnZ = altarZ + (layout.spawnOffZ ?? -2.5);
    return {
      altar: { x: altarX, y: altarZ },
      spawn: { x: spawnX, y: spawnZ },
    };
  }

  const spawnTx = layout.altarTx + (layout.spawnOffTx ?? 0);
  const spawnTz = layout.altarTz + (layout.spawnOffTz ?? 0);
  return {
    altar: moe3dSlotSpawnWorld(mapSlotId, tileW, tileD, layout.altarTx, layout.altarTz),
    spawn: moe3dSlotSpawnWorld(mapSlotId, tileW, tileD, spawnTx, spawnTz),
  };
}

/**
 * マップのアルター横（MOE 式 · アルター側）スポーン
 * @param {string} mapSlotId
 * @param {number} tileW
 * @param {number} tileD
 * @param {{ halfW?: number, halfD?: number }} [opts]
 */
export function moe3dSpawnBesideMapAltar(mapSlotId, tileW, tileD, opts = {}) {
  const layout = moeMapAltarLayout(mapSlotId);
  if (!layout || !tileW || !tileD) return null;
  const coords = moe3dResolveAltarCoords(
    layout,
    mapSlotId,
    tileW,
    tileD,
    opts.halfW,
    opts.halfD
  );
  return coords.spawn;
}

/**
 * @param {import("@/data/moeAltarWarps").MoeAltarDef | string} altarOrId
 * @param {number} tileW
 * @param {number} tileD
 * @param {{ halfW?: number, halfD?: number }} [opts]
 */
export function moe3dAltarWorldPos(altarOrId, tileW, tileD, opts = {}) {
  const altar =
    typeof altarOrId === "string" ? moeAltarDefById(altarOrId) : altarOrId;
  if (!altar || !tileW || !tileD) return null;
  const layout = moeMapAltarLayout(altar.mapSlotId);
  if (!layout) return null;
  const coords = moe3dResolveAltarCoords(
    layout,
    altar.mapSlotId,
    tileW,
    tileD,
    opts.halfW,
    opts.halfD
  );
  return coords.altar;
}

/**
 * @param {import("@/data/moeAltarWarps").MoeAltarDestination} dest
 * @param {number} tileW
 * @param {number} tileD
 * @param {{ halfW?: number, halfD?: number }} [opts]
 */
export function moe3dWarpDestSpawnWorld(dest, tileW, tileD, opts = {}) {
  if (!dest || !tileW || !tileD) return null;
  return moe3dSpawnBesideMapAltar(dest.mapSlotId, tileW, tileD, opts);
}

/**
 * @param {number} px
 * @param {number} py
 * @param {number} tileW
 * @param {number} tileD
 * @param {{ halfW?: number, halfD?: number }} [opts]
 */
export function moe3dFindNearbyAltar(px, py, tileW, tileD, opts = {}) {
  if (!tileW || !tileD) return null;
  let best = null;
  let bestDist = Infinity;
  for (const altar of MOE_ALTARS) {
    const pos = moe3dAltarWorldPos(altar, tileW, tileD, opts);
    if (!pos) continue;
    const r = altar.interactRadius ?? 6;
    const d = Math.hypot(px - pos.x, py - pos.y);
    if (d <= r && d < bestDist) {
      bestDist = d;
      best = altar;
    }
  }
  return best;
}

/** 初回スポーン — ビスク中央アルター横 */
export function moe3dBiskDefaultSpawn(tileW, tileD) {
  return moe3dSpawnBesideMapAltar("bisk", tileW, tileD);
}

/** 試作マップ · アルター横（転送先と同じ MOE 式） */
export function moe3dLegacyDefaultSpawn(tileW, tileD, halfW, halfD) {
  return moe3dSpawnBesideMapAltar("legacy_prototype", tileW, tileD, {
    halfW: MOE_3D_LEGACY_REF_HALF,
    halfD: MOE_3D_LEGACY_REF_HALF,
  });
}

/** 地形 glb 未読込時のタイル寸法見積もり */
export function moe3dEstimatedTileSize(
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D
) {
  return {
    tileW: (halfW * 2) / MOE_3D_LEGACY_TILES_X,
    tileD: (halfD * 2) / MOE_3D_LEGACY_TILES_Z,
  };
}

/**
 * プレイヤー初期位置 — 試作マップ · アルター横（MOE 式）
 * @param {number} [halfW]
 * @param {number} [halfD]
 * @param {number} [tileW]
 * @param {number} [tileD]
 */
export function moe3dDefaultPlayerSpawn(
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D,
  tileW,
  tileD
) {
  const est = moe3dEstimatedTileSize(halfW, halfD);
  const tw = tileW ?? est.tileW;
  const td = tileD ?? est.tileD;
  return (
    moe3dBiskDefaultSpawn(tw, td) ??
    moe3dLegacyDefaultSpawn(tw, td, halfW, halfD) ??
    moe3dBiskWorldCenter()
  );
}

/** @param {string} mapSlotId */
export function moe3dMapSlotLabel(mapSlotId) {
  return moe3dMapSlotById(mapSlotId)?.nameJa ?? mapSlotId;
}
