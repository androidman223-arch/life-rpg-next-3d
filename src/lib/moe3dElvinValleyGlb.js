/**
 * 新エルビン渓谷 — GLB（3D_MoeElvinkeikoku.glb）
 * ワープ専用スロット（旧エルビン渓谷マクロ２ L1 とは別）
 */

import * as THREE from "three";
import {
  MOE_PLAYER_TERRAIN_MAX_CLIMB,
  moe3dTerrainFloorGroundY,
} from "@/lib/moe3dMacro3Walk";
import { moe3dMapSlotWorldRect } from "@/lib/moe3dMonsterMapSpawns";
import { moe3dSlotSpawnWorld } from "@/lib/moe3dWorldLayout";

/** 渓谷 GLB を載せる専用スロット（旧 elvin_valley とは別マップ） */
export const MOE_ELVIN_KEIKOKU_MAP_SLOT_ID = "elvin_keikoku";

export const MOE_ELVIN_VALLEY_GLB_URL = "/assets/map/3D_MoeElvinkeikoku.glb";

export const MOE_ELVIN_VALLEY_GLB_ROOT_NAME = "elvin-valley-glb";

/** 予約タイル低ポリ床（〜0.28）より上 — GLB 床だけ拾う */
export const MOE_ELVIN_KEIKOKU_FLOOR_MIN_Y = 0.35;

/** 転送直後の床探索帯上端 */
export const MOE_ELVIN_KEIKOKU_SPAWN_FLOOR_MAX_Y = 8;

/**
 * レイキャスト失敗時の fallback（コンパス z）
 * 渓谷中央スポーンの目安（実測 z≈1〜2）
 */
export const MOE_ELVIN_KEIKOKU_SPAWN_GROUND_Y = 1.5;

/** 全トランスフォーム適用後のメッシュ境界（Blender エクスポート値） */
export const MOE_ELVIN_VALLEY_MESH_BOUNDS = {
  minX: -203.39,
  minY: -12.23,
  maxX: 328.89,
  maxY: 145.68,
  minZ: -294.38,
  maxZ: 294.38,
};

const B = MOE_ELVIN_VALLEY_MESH_BOUNDS;

/**
 * @param {number} tileW
 * @param {number} tileD
 */
export function moe3dElvinValleyGlbPlacement(tileW, tileD) {
  if (!tileW || !tileD) return null;
  const meshW = B.maxX - B.minX;
  const meshD = B.maxZ - B.minZ;
  const fit = Math.min((tileW * 0.96) / meshW, (tileD * 0.96) / meshD);
  const cx = (B.minX + B.maxX) / 2;
  const cz = (B.minZ + B.maxZ) / 2;
  const floorLift = 0.28;
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
 * @param {number} tileW
 * @param {number} tileD
 */
function moe3dElvinKeikokuOutdoorFloorMaxY(tileW, tileD) {
  const p = moe3dElvinValleyGlbPlacement(tileW, tileD);
  if (!p) return 45;
  return p.position.y + (B.maxY - B.minY) * p.fit + 2;
}

/**
 * @param {number} mx
 * @param {number} mz
 * @param {number} tileW
 * @param {number} tileD
 */
function moe3dElvinValleyMeshToTileNorm(mx, mz, tileW, tileD) {
  const p = moe3dElvinValleyGlbPlacement(tileW, tileD);
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
export function moe3dElvinValleyMeshPointWorld(mx, mz, tileW, tileD) {
  const norm = moe3dElvinValleyMeshToTileNorm(mx, mz, tileW, tileD);
  if (!norm) return null;
  return moe3dSlotSpawnWorld(
    MOE_ELVIN_KEIKOKU_MAP_SLOT_ID,
    tileW,
    tileD,
    norm.tx,
    norm.tz
  );
}

/** 新渓谷タイル面上か（全体 terrain bbox クランプを避ける） */
export function moe3dIsOnElvinKeikokuField(x, z, tileW, tileD) {
  const rect = moe3dMapSlotWorldRect(
    MOE_ELVIN_KEIKOKU_MAP_SLOT_ID,
    tileW,
    tileD
  );
  if (!rect) return false;
  return (
    x >= rect.minX &&
    x <= rect.maxX &&
    z >= rect.minZ &&
    z <= rect.maxZ
  );
}

/**
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Object3D} terrainGroup
 * @param {number} x
 * @param {number} z
 * @param {number} tileW
 * @param {number} tileD
 * @param {number | null} [currentFootY]
 * @returns {number | null}
 */
export function moe3dElvinKeikokuTerrainGroundY(
  raycaster,
  terrainGroup,
  x,
  z,
  tileW,
  tileD,
  currentFootY = null
) {
  if (!tileW || !tileD) return null;
  if (!moe3dIsOnElvinKeikokuField(x, z, tileW, tileD)) return null;

  const teleportSnap = currentFootY == null;
  const sunkBelowGlb =
    currentFootY != null &&
    currentFootY < MOE_ELVIN_KEIKOKU_FLOOR_MIN_Y + 0.15;
  const resnap = teleportSnap || sunkBelowGlb;
  const maxY = resnap
    ? MOE_ELVIN_KEIKOKU_SPAWN_FLOOR_MAX_Y
    : currentFootY + MOE_PLAYER_TERRAIN_MAX_CLIMB;
  // 屋外 GLB — 低ポリ予約床を除外し、足元付近の GLB 面を拾う（最低床 preferLowest は使わない）
  const floorY = moe3dTerrainFloorGroundY(raycaster, terrainGroup, x, z, {
    maxY,
    minY: MOE_ELVIN_KEIKOKU_FLOOR_MIN_Y,
    preferLowest: false,
  });
  if (floorY != null) return floorY;
  return currentFootY ?? MOE_ELVIN_KEIKOKU_SPAWN_GROUND_Y;
}

/** 外アルター — 山脈側（西 · mesh minX）入口 */
export function moe3dElvinKeikokuOutdoorAltarNorm(tileW, tileD) {
  const entranceX = B.minX + (B.maxX - B.minX) * 0.05;
  const entranceZ = (B.minZ + B.maxZ) / 2;
  return (
    moe3dElvinValleyMeshToTileNorm(entranceX, entranceZ, tileW, tileD) ?? {
      tx: 0.08,
      tz: 0.5,
    }
  );
}

/**
 * タイラントグリフォン山頂 — プレイ実測（コンパス x-1488 y-324 · 足元 z21）
 * HUD y-324 → ワールド z=+324 · 山上コライダー未実装のため足元高さは固定
 */
export const MOE_ELVIN_KEIKOKU_TYRANT_SPAWN_WORLD = {
  x: -1488,
  z: 324,
};

/** コンパス z 表示（Three.js 足元 Y）— 谷床 z≈1 へのレイ落ちを避ける */
export const MOE_ELVIN_KEIKOKU_TYRANT_SPAWN_GROUND_Y = 21;

/** @deprecated mesh レイキャスト — ワールド座標を優先 */
export const MOE_ELVIN_KEIKOKU_TYRANT_SUMMIT_MESH = {
  mx: 182.5,
  mz: -117.8,
};

/** 山頂ワールド xz（enemy.x / enemy.y）＋固定足元高さ */
export function moe3dElvinKeikokuTyrantSpawnWorld() {
  const { x, z } = MOE_ELVIN_KEIKOKU_TYRANT_SPAWN_WORLD;
  return {
    x,
    y: z,
    groundY: MOE_ELVIN_KEIKOKU_TYRANT_SPAWN_GROUND_Y,
  };
}

/** 山頂 — タイラントグリフォン（タイル norm · フォールバック） */
export function moe3dElvinKeikokuSummitSpawnNorm(tileW, tileD) {
  const rect = moe3dMapSlotWorldRect(
    MOE_ELVIN_KEIKOKU_MAP_SLOT_ID,
    tileW,
    tileD
  );
  if (rect) {
    const w = rect.maxX - rect.minX;
    const d = rect.maxZ - rect.minZ;
    const { x, z } = MOE_ELVIN_KEIKOKU_TYRANT_SPAWN_WORLD;
    if (w > 0 && d > 0) {
      return {
        tx: (x - rect.minX) / w,
        tz: (z - rect.minZ) / d,
      };
    }
  }
  const { mx, mz } = MOE_ELVIN_KEIKOKU_TYRANT_SUMMIT_MESH;
  return (
    moe3dElvinValleyMeshToTileNorm(mx, mz, tileW, tileD) ?? {
      tx: 0.741,
      tz: 0.308,
    }
  );
}

/** 転送スポーン — 渓谷中央 */
export function moe3dElvinKeikokuSpawnNorm(tileW, tileD) {
  const cx = (B.minX + B.maxX) / 2;
  const cz = (B.minZ + B.maxZ) / 2;
  return (
    moe3dElvinValleyMeshToTileNorm(cx, cz, tileW, tileD) ?? {
      tx: 0.5,
      tz: 0.5,
    }
  );
}

/**
 * @param {number} tileW
 * @param {number} tileD
 */
export function moe3dElvinKeikokuOutdoorAltarWorld(tileW, tileD) {
  const norm = moe3dElvinKeikokuOutdoorAltarNorm(tileW, tileD);
  return moe3dSlotSpawnWorld(
    MOE_ELVIN_KEIKOKU_MAP_SLOT_ID,
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
export function moe3dElvinKeikokuSpawnWorld(tileW, tileD) {
  const norm = moe3dElvinKeikokuSpawnNorm(tileW, tileD);
  return moe3dSlotSpawnWorld(
    MOE_ELVIN_KEIKOKU_MAP_SLOT_ID,
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
export function attachMoe3dElvinValleyGlb(tileRoot, gltfScene, tileW, tileD) {
  if (!tileRoot || !gltfScene || !tileW || !tileD) return null;
  const placement = moe3dElvinValleyGlbPlacement(tileW, tileD);
  if (!placement) return null;

  const root = new THREE.Group();
  root.name = MOE_ELVIN_VALLEY_GLB_ROOT_NAME;

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
  tileRoot.userData.elvinKeikokuGlb = {
    fit: placement.fit,
    outdoorAltar: moe3dElvinKeikokuOutdoorAltarNorm(tileW, tileD),
    spawn: moe3dElvinKeikokuSpawnNorm(tileW, tileD),
  };
  return root;
}
