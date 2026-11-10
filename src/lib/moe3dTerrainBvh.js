import * as THREE from "three";
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from "three-mesh-bvh";

/**
 * 3D フィールド — 地形の光線（レイ）を速くする（three-mesh-bvh）
 *
 * 地面の形ごとに「さがす用の目次（BVH）」を1回だけ作る。
 * 光線は 当たりそうな三角だけを しらべるので、何十倍も速くなる。
 * 目次のない形は、ふつうの three.js の しらべかたのまま（こわれない）。
 */

/** これより三角が少ない形は 目次を作らない（作るほうが むだ） */
export const MOE_TERRAIN_BVH_MIN_TRIANGLES = 64;

let installed = false;

/** three.js に「目次があれば使う」しらべかたを入れる（1回だけ） */
export function moe3dInstallTerrainBvh() {
  if (installed) return;
  installed = true;
  THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
  THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
  THREE.Mesh.prototype.raycast = acceleratedRaycast;
}

/**
 * 形の三角の数
 * @param {THREE.BufferGeometry} geometry
 */
export function moe3dGeometryTriangleCount(geometry) {
  const pos = geometry?.attributes?.position;
  if (!pos) return 0;
  const n = geometry.index ? geometry.index.count : pos.count;
  return Math.floor(n / 3);
}

/**
 * 1つのメッシュに目次を作る（まだなら）
 * @param {THREE.Mesh} mesh
 * @returns {boolean} 作ったら true
 */
export function moe3dEnsureMeshBvh(mesh) {
  if (!mesh?.isMesh || mesh.isSkinnedMesh || mesh.isInstancedMesh) return false;
  const geometry = mesh.geometry;
  if (!geometry || geometry.boundsTree) return false;
  if (moe3dGeometryTriangleCount(geometry) < MOE_TERRAIN_BVH_MIN_TRIANGLES) {
    return false;
  }
  moe3dInstallTerrainBvh();
  try {
    geometry.computeBoundsTree();
    return true;
  } catch (err) {
    console.warn("terrain BVH build failed", err);
    return false;
  }
}

/**
 * メッシュの一覧に目次を作る
 * @param {THREE.Mesh[]} meshes
 * @returns {number} 作った数
 */
export function moe3dEnsureMeshesBvh(meshes) {
  let built = 0;
  for (const mesh of meshes ?? []) {
    if (moe3dEnsureMeshBvh(mesh)) built++;
  }
  return built;
}
