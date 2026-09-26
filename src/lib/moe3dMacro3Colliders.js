import {
  MOE_3D_TILE_SPACING,
  MOE_3D_LEGACY_TILES_X,
  MOE_3D_LEGACY_TILES_Z,
} from "@/lib/moe3dLayoutConstants";
import { moe3dDesertPreviewTileIndex } from "@/lib/moe3dDesertPreviewTile";
import {
  MOE_DARIN_MOUNTAIN_MOUNTAINS,
  MOE_DESERT_PREVIEW_MOUNTAINS,
  MOE_ELVIN_MOUNTAINS_MOUNTAINS,
  MOE_HATIIL_DESERT_MOUNTAINS,
  MOE_NEOUKU_MOUNTAIN_MOUNTAINS,
  MOE_NEOUKU_PLATEAU_MOUNTAINS,
  moeGreenColliderSpecs,
} from "@/lib/moe3dMacro3SimpleMountain";
import { MOE_GREEN_COLLIDER_OUTSET } from "@/lib/moe3dMacro3Constants";
import { MOE_MACRO3_MOUNTAIN_SLOT_IDS } from "@/lib/moe3dMacro3MountainRegistry";
import { MOE_AGE_MAP_SLOT_IDS } from "@/lib/moe3dMacro2AgeConstants";
import { moe3dSpawnBesideMapAltar } from "@/lib/moe3dAltarWarp";
import {
  moe3dMapSlotById,
  moe3dTerrainGroupOffset,
  moe3dTileLocalOrigin,
  moe3dTileLocalSize,
} from "@/lib/moe3dWorldLayout";
import {
  moe3dCircleHitsColumn,
  moe3dClampMoveAgainstColumnColliders,
} from "@/lib/moe3dColumnColliderMath";

export {
  moe3dCircleHitsColumn,
  moe3dClampMoveAgainstColumnColliders,
};

/** アルタースポーン付近で山コライダーを無視する半径（ワールド） */
const ALTAR_SPAWN_COLLIDER_BYPASS_RADIUS = 7;
/** スポーン円がコライダー内か判定するプレイヤー半径 */
const ALTAR_SPAWN_BODY_RADIUS = 0.6;

/** @type {Record<string, import("@/lib/moe3dMacro3SimpleMountain.js").MoeSimpleMountainSpec[]>} */
const SLOT_MOUNTAINS = {
  desert_preview: MOE_DESERT_PREVIEW_MOUNTAINS,
  hatiil_desert: MOE_HATIIL_DESERT_MOUNTAINS,
  neoku_mountain: MOE_NEOUKU_MOUNTAIN_MOUNTAINS,
  neoku_plateau: MOE_NEOUKU_PLATEAU_MOUNTAINS,
  darin_mountain: MOE_DARIN_MOUNTAIN_MOUNTAINS,
  elvin_mountains: MOE_ELVIN_MOUNTAINS_MOUNTAINS,
};

/** 砂漠プレビュー pit */
const DESERT_PIT_COLLIDER = {
  cx: 0.28,
  cz: 0.08,
  rx: 0.12 * MOE_GREEN_COLLIDER_OUTSET,
  rz: 0.12 * MOE_GREEN_COLLIDER_OUTSET,
  height: 1.0,
};

/** AGE プロップ用 円柱コライダー（tx/tz 正規化 · rx/rz 半径） */
const AGE_PROP_COLUMN_COLLIDERS = {
  mitoya_great_tree: [{ cx: 0.38, cz: 0.44, rx: 0.14, rz: 0.14 }],
};

/**
 * @param {string} mapSlotId
 * @param {number} tileW
 * @param {number} tileD
 */
export function moe3dMacro3TileFrame(mapSlotId, tileW, tileD) {
  if (mapSlotId === "desert_preview") {
    const placement = moe3dDesertPreviewTileIndex(
      MOE_3D_LEGACY_TILES_X,
      MOE_3D_LEGACY_TILES_Z
    );
    const off = moe3dTerrainGroupOffset(tileW, tileD);
    const origin = moe3dTileLocalOrigin(
      placement.ix,
      placement.iz,
      tileW,
      tileD
    );
    const size = moe3dTileLocalSize(placement.ix, placement.iz, tileW, tileD);
    return {
      rootX: off.x + origin.x,
      rootZ: off.z + origin.z,
      minX: off.x + origin.x,
      maxX: off.x + origin.x + size.w,
      minZ: off.z + origin.z,
      maxZ: off.z + origin.z + size.d,
      tileW,
      tileD,
      anchor: "sw",
    };
  }

  const slot = moe3dMapSlotById(mapSlotId);
  if (!slot) return null;
  const off = moe3dTerrainGroupOffset(tileW, tileD);
  const origin = moe3dTileLocalOrigin(slot.ix, slot.iz, tileW, tileD);
  const size = moe3dTileLocalSize(slot.ix, slot.iz, tileW, tileD);
  const centerX = off.x + origin.x + size.w * 0.5;
  const centerZ = off.z + origin.z + size.d * 0.5;
  return {
    rootX: centerX,
    rootZ: centerZ,
    minX: off.x + origin.x,
    maxX: off.x + origin.x + size.w,
    minZ: off.z + origin.z,
    maxZ: off.z + origin.z + size.d,
    tileW,
    tileD,
    anchor: "center",
  };
}

/**
 * @param {string} mapSlotId
 */
function tileColliderSpecs(mapSlotId) {
  const mountains = SLOT_MOUNTAINS[mapSlotId];
  if (!mountains?.length) return [];
  const cols = moeGreenColliderSpecs(mountains, MOE_GREEN_COLLIDER_OUTSET);
  if (mapSlotId === "desert_preview") cols.push(DESERT_PIT_COLLIDER);
  return cols;
}

/**
 * @param {number} px
 * @param {number} pz
 * @param {number} tileW
 * @param {number} tileD
 */
export function moe3dIsInMacro3Tile(px, pz, mapSlotId, tileW, tileD) {
  const frame = moe3dMacro3TileFrame(mapSlotId, tileW, tileD);
  if (!frame) return false;
  return (
    px >= frame.minX &&
    px <= frame.maxX &&
    pz >= frame.minZ &&
    pz <= frame.maxZ
  );
}

/**
 * @param {string} mapSlotId
 * @param {number} tileW
 * @param {number} tileD
 */
export function moe3dMacro3WorldCollidersForSlot(mapSlotId, tileW, tileD) {
  const frame = moe3dMacro3TileFrame(mapSlotId, tileW, tileD);
  const specs = tileColliderSpecs(mapSlotId);
  if (!frame || !specs.length) return [];

  const sx = MOE_3D_TILE_SPACING;
  return specs.map((spec) => ({
    cx: frame.rootX + frame.tileW * sx * spec.cx,
    cz: frame.rootZ + frame.tileD * sx * spec.cz,
    rx: frame.tileW * sx * spec.rx,
    rz: frame.tileD * sx * spec.rz,
  }));
}

/**
 * アルター移動直後: スポーンが緑コライダー内だと動けないので、
 * スポーン付近にいる間だけそのコライダーを外す（山は端に置くのが本筋）。
 * @param {string} mapSlotId
 * @param {ReturnType<typeof moe3dMacro3WorldCollidersForSlot>} colliders
 * @param {number} tileW
 * @param {number} tileD
 * @param {number} px
 * @param {number} pz
 */
export function moe3dMacro3FilterAltarSpawnColliders(
  mapSlotId,
  colliders,
  tileW,
  tileD,
  px,
  pz
) {
  const spawn = moe3dSpawnBesideMapAltar(mapSlotId, tileW, tileD);
  if (!spawn || !colliders.length) return colliders;
  const nearSpawn =
    Math.hypot(px - spawn.x, pz - spawn.y) <= ALTAR_SPAWN_COLLIDER_BYPASS_RADIUS;
  if (!nearSpawn) return colliders;
  return colliders.filter(
    (col) =>
      !moe3dCircleHitsColumn(
        spawn.x,
        spawn.y,
        ALTAR_SPAWN_BODY_RADIUS,
        col
      )
  );
}

/**
 * プレイヤー位置のマクロ３タイル上なら緑コライダー一覧
 * @param {number} px
 * @param {number} pz
 * @param {number} tileW
 * @param {number} tileD
 */
function moe3dAgePropWorldCollidersForSlot(mapSlotId, tileW, tileD) {
  const specs = AGE_PROP_COLUMN_COLLIDERS[mapSlotId];
  if (!specs?.length) return [];
  const frame = moe3dMacro3TileFrame(mapSlotId, tileW, tileD);
  if (!frame) return [];
  const sx = MOE_3D_TILE_SPACING;
  return specs.map((spec) => ({
    cx: frame.rootX + frame.tileW * sx * spec.cx,
    cz: frame.rootZ + frame.tileD * sx * spec.cz,
    rx: frame.tileW * sx * spec.rx,
    rz: frame.tileD * sx * spec.rz,
  }));
}

export function moe3dMacro3WorldCollidersAt(px, pz, tileW, tileD) {
  for (const slotId of MOE_MACRO3_MOUNTAIN_SLOT_IDS) {
    if (moe3dIsInMacro3Tile(px, pz, slotId, tileW, tileD)) {
      const colliders = moe3dMacro3WorldCollidersForSlot(slotId, tileW, tileD);
      return moe3dMacro3FilterAltarSpawnColliders(
        slotId,
        colliders,
        tileW,
        tileD,
        px,
        pz
      );
    }
  }
  for (const slotId of MOE_AGE_MAP_SLOT_IDS) {
    if (!AGE_PROP_COLUMN_COLLIDERS[slotId]) continue;
    if (moe3dIsInMacro3Tile(px, pz, slotId, tileW, tileD)) {
      const colliders = moe3dAgePropWorldCollidersForSlot(slotId, tileW, tileD);
      return moe3dMacro3FilterAltarSpawnColliders(
        slotId,
        colliders,
        tileW,
        tileD,
        px,
        pz
      );
    }
  }
  return [];
}
