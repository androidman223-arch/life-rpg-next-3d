/**
 * スルト鉱山 — 火竜神殿 GLB（3D_MoeKazan1map.glb）
 * 外アルター（坂手前）→ 転送で箱内1階中央
 */

import * as THREE from "three";
import {
  MOE_PLAYER_TERRAIN_MAX_CLIMB,
  moe3dTerrainFloorGroundY,
} from "@/lib/moe3dMacro3Walk";
import { moe3dMapSlotWorldRect } from "@/lib/moe3dMonsterMapSpawns";
import { moe3dSlotSpawnWorld } from "@/lib/moe3dWorldLayout";

/** 火竜神殿 GLB を載せる専用スロット（旧スルト鉱山とは別マップ） */
export const MOE_SULFUR_KAZAN_MAP_SLOT_ID = "sulfur_kazan_temple";

/** @param {string} [mapSlotId] */
export function moe3dSulfurKazanTempleEnabledFor(mapSlotId) {
  return mapSlotId === MOE_SULFUR_KAZAN_MAP_SLOT_ID;
}

export const MOE_SULFUR_KAZAN_GLB_URL = "/assets/map/3D_MoeKazan1map.glb";

/**
 * 洞窟内出発地点の床高さ（コンパス z）。レイキャスト失敗時の fallback。
 * 実際の足元は GLB 床レイキャスト（moe3dSulfurKazanTerrainGroundY）。
 */
export const MOE_SULFUR_KAZAN_INDOOR_SPAWN_GROUND_Y = 1;

/** 転送直後の床探索帯（z1 付近 · 外壁 z11 を除外） */
export const MOE_SULFUR_KAZAN_INDOOR_FLOOR_MAX_Y =
  MOE_SULFUR_KAZAN_INDOOR_SPAWN_GROUND_Y + 2.5;

/**
 * 火竜神殿 GLB — 床面レイキャスト（固定 z 平面は使わない）
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Object3D} terrainGroup
 * @param {number} x
 * @param {number} z
 * @param {number} tileW
 * @param {number} tileD
 * @param {number | null} [currentFootY]
 * @returns {number | null}
 */
export function moe3dSulfurKazanTerrainGroundY(
  raycaster,
  terrainGroup,
  x,
  z,
  tileW,
  tileD,
  currentFootY = null
) {
  if (!tileW || !tileD) return null;
  if (!moe3dIsOnSulfurKazanField(x, z, tileW, tileD)) return null;

  const teleportSnap = currentFootY == null;
  const maxY = teleportSnap
    ? MOE_SULFUR_KAZAN_INDOOR_FLOOR_MAX_Y
    : currentFootY + MOE_PLAYER_TERRAIN_MAX_CLIMB;
  const floorY = moe3dTerrainFloorGroundY(raycaster, terrainGroup, x, z, {
    maxY,
    minY: teleportSnap ? -0.5 : -Infinity,
    preferLowest: teleportSnap,
  });
  if (floorY != null) return floorY;
  return currentFootY ?? MOE_SULFUR_KAZAN_INDOOR_SPAWN_GROUND_Y;
}

/** @deprecated 互換用 — 常に null（床は moe3dSulfurKazanTerrainGroundY） */
export function moe3dSulfurKazanPlayerGroundY(_x, _z, _tileW, _tileD) {
  return null;
}

/** 全トランスフォーム適用後のメッシュ境界（Blender エクスポート値） */
export const MOE_SULFUR_KAZAN_MESH_BOUNDS = {
  minX: -507.09,
  minY: -28.45,
  maxX: -151.09,
  maxY: 31.86,
  minZ: 33.74,
  maxZ: 468.56,
};

const B = MOE_SULFUR_KAZAN_MESH_BOUNDS;

/**
 * @param {number} tileW
 * @param {number} tileD
 */
export function moe3dSulfurKazanTemplePlacement(tileW, tileD) {
  if (!tileW || !tileD) return null;
  const meshW = B.maxX - B.minX;
  const meshD = B.maxZ - B.minZ;
  const fit = Math.min((tileW * 0.96) / meshW, (tileD * 0.96) / meshD);
  const cx = (B.minX + B.maxX) / 2;
  const cz = (B.minZ + B.maxZ) / 2;
  const floorLift = 0.28;
  // 予約タイル root は面の中心（moe3dReservedMapTile）— 南西角オフセットは不要
  return {
    fit,
    position: {
      x: -cx * fit,
      y: -B.minY * fit + floorLift,
      z: -cz * fit,
    },
  };
}

/**
 * @param {number} mx
 * @param {number} mz
 * @param {number} tileW
 * @param {number} tileD
 */
function moe3dSulfurKazanMeshToTileNorm(mx, mz, tileW, tileD) {
  const p = moe3dSulfurKazanTemplePlacement(tileW, tileD);
  if (!p) return null;
  const lx = mx * p.fit + p.position.x;
  const lz = mz * p.fit + p.position.z;
  return { tx: lx / tileW + 0.5, tz: lz / tileD + 0.5 };
}

/**
 * @param {number} mx
 * @param {number} mz
 * @param {number} tileW
 * @param {number} tileD
 */
export function moe3dSulfurKazanMeshPointWorld(mx, mz, tileW, tileD) {
  const norm = moe3dSulfurKazanMeshToTileNorm(mx, mz, tileW, tileD);
  if (!norm) return null;
  return moe3dSlotSpawnWorld(
    MOE_SULFUR_KAZAN_MAP_SLOT_ID,
    tileW,
    tileD,
    norm.tx,
    norm.tz
  );
}

/** 火山神殿タイル面上か（全体 bbox クランプを避ける） */
export function moe3dIsOnSulfurKazanField(x, z, tileW, tileD) {
  const rect = moe3dMapSlotWorldRect(MOE_SULFUR_KAZAN_MAP_SLOT_ID, tileW, tileD);
  if (!rect) return false;
  return (
    x >= rect.minX &&
    x <= rect.maxX &&
    z >= rect.minZ &&
    z <= rect.maxZ
  );
}

/** GLB 床面の歩行矩形（ワールド xz） */
export function moe3dSulfurKazanWalkWorldRect(tileW, tileD) {
  if (!tileW || !tileD) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const mx of [B.minX, B.maxX]) {
    for (const mz of [B.minZ, B.maxZ]) {
      const w = moe3dSulfurKazanMeshPointWorld(mx, mz, tileW, tileD);
      if (!w) continue;
      minX = Math.min(minX, w.x);
      maxX = Math.max(maxX, w.x);
      minZ = Math.min(minZ, w.y);
      maxZ = Math.max(maxZ, w.y);
    }
  }
  if (!Number.isFinite(minX)) return null;
  return { minX, maxX, minZ, maxZ };
}

/** @param {number} [pad] */
export function moe3dIsInsideSulfurKazanWalkArea(x, z, tileW, tileD, pad = 0) {
  const rect = moe3dSulfurKazanWalkWorldRect(tileW, tileD);
  if (!rect) return false;
  return (
    x >= rect.minX - pad &&
    x <= rect.maxX + pad &&
    z >= rect.minZ - pad &&
    z <= rect.maxZ + pad
  );
}

/** 神殿内歩行クランプ — タイル外の全体 bbox ではなく GLB 床面 */
export function moe3dClampSulfurKazanWalkPosition(
  x,
  z,
  tileW,
  tileD,
  margin = 0.35
) {
  const rect = moe3dSulfurKazanWalkWorldRect(tileW, tileD);
  if (!rect) return { x, y: z };
  return {
    x: Math.max(rect.minX + margin, Math.min(rect.maxX - margin, x)),
    y: Math.max(rect.minZ + margin, Math.min(rect.maxZ - margin, z)),
  };
}

/** 坂の手前 — 外アルター（南側入口付近） */
export function moe3dSulfurKazanOutdoorAltarNorm(tileW, tileD) {
  const cx = (B.minX + B.maxX) / 2;
  const entranceZ = B.minZ + (B.maxZ - B.minZ) * 0.06;
  return (
    moe3dSulfurKazanMeshToTileNorm(cx, entranceZ, tileW, tileD) ?? {
      tx: 0.5,
      tz: 0.14,
    }
  );
}

/** 洞窟内出発 — 南入口から少し奥（外壁上ではなく室内床 z≈1） */
export function moe3dSulfurKazanIndoorSpawnNorm(tileW, tileD) {
  const cx = (B.minX + B.maxX) / 2;
  const indoorZ = B.minZ + (B.maxZ - B.minZ) * 0.42;
  return (
    moe3dSulfurKazanMeshToTileNorm(cx, indoorZ, tileW, tileD) ?? {
      tx: 0.5,
      tz: 0.42,
    }
  );
}

/**
 * @param {number} tileW
 * @param {number} tileD
 */
export function moe3dSulfurKazanOutdoorAltarWorld(tileW, tileD) {
  const norm = moe3dSulfurKazanOutdoorAltarNorm(tileW, tileD);
  return moe3dSlotSpawnWorld(
    MOE_SULFUR_KAZAN_MAP_SLOT_ID,
    tileW,
    tileD,
    norm.tx,
    norm.tz
  );
}

/**
 * @param {number} tileW
 * @param {number} tileD
 */
export function moe3dSulfurKazanIndoorSpawnWorld(tileW, tileD) {
  const norm = moe3dSulfurKazanIndoorSpawnNorm(tileW, tileD);
  return moe3dSlotSpawnWorld(
    MOE_SULFUR_KAZAN_MAP_SLOT_ID,
    tileW,
    tileD,
    norm.tx,
    norm.tz
  );
}

/**
 * @param {THREE.Object3D} tileRoot
 * @param {THREE.Object3D} gltfScene
 * @param {number} tileW
 * @param {number} tileD
 */
export function attachMoe3dSulfurKazanTemple(tileRoot, gltfScene, tileW, tileD) {
  if (!tileRoot || !gltfScene || !tileW || !tileD) return null;
  const placement = moe3dSulfurKazanTemplePlacement(tileW, tileD);
  if (!placement) return null;

  const root = new THREE.Group();
  root.name = "sulfur-kazan-temple";

  const mesh = gltfScene.clone(true);
  mesh.scale.setScalar(placement.fit);
  mesh.position.set(
    placement.position.x,
    placement.position.y,
    placement.position.z
  );
  mesh.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  root.add(mesh);

  tileRoot.add(root);
  tileRoot.userData.sulfurKazanTemple = {
    fit: placement.fit,
    outdoorAltar: moe3dSulfurKazanOutdoorAltarNorm(tileW, tileD),
    indoorSpawn: moe3dSulfurKazanIndoorSpawnNorm(tileW, tileD),
  };
  return root;
}
