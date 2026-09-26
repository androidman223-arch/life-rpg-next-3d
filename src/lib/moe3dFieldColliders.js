import { moe3dClampMoveAgainstBoxColliders } from "@/lib/moe3dBoxColliderMath";
import {
  moe3dClampMoveAgainstColumnColliders,
  moe3dMacro3WorldCollidersAt,
} from "@/lib/moe3dMacro3Colliders";
import { moe3dElanPalaceMazeWorldBoxesAt } from "@/lib/moe3dElanPalaceMaze";
import { moe3dSulfurMineMazeWorldBoxesAt } from "@/lib/moe3dSulfurMineMaze";
import { MOE_PLAYER_TERRAIN_BODY_RADIUS } from "@/lib/moe3dMacro3Walk";
import { moe3dIsOnElvinKeikokuField } from "@/lib/moe3dElvinValleyGlb";
import { moe3dIsOnSulfurKazanField } from "@/lib/moe3dSulfurKazanTemple";

/**
 * 3D フィールド移動 — 緑コライダー（円柱）＋エルアン宮殿迷路（箱）
 * @param {number} px
 * @param {number} pz
 * @param {number} nx
 * @param {number} nz
 * @param {number} tileW
 * @param {number} tileD
 * @param {number} [bodyRadius]
 * @returns {{ x: number, z: number }}
 */
export function moe3dClampFieldMove(
  px,
  pz,
  nx,
  nz,
  tileW,
  tileD,
  bodyRadius = MOE_PLAYER_TERRAIN_BODY_RADIUS
) {
  if (
    moe3dIsOnSulfurKazanField(px, pz, tileW, tileD) ||
    moe3dIsOnElvinKeikokuField(px, pz, tileW, tileD)
  ) {
    return { x: nx, z: nz };
  }
  const columns = moe3dMacro3WorldCollidersAt(px, pz, tileW, tileD);
  let resolved = moe3dClampMoveAgainstColumnColliders(
    px,
    pz,
    nx,
    nz,
    columns
  );
  const mazeBoxes = [
    ...moe3dElanPalaceMazeWorldBoxesAt(px, pz, tileW, tileD, bodyRadius),
    ...moe3dSulfurMineMazeWorldBoxesAt(px, pz, tileW, tileD, bodyRadius),
  ];
  if (mazeBoxes.length) {
    resolved = moe3dClampMoveAgainstBoxColliders(
      px,
      pz,
      resolved.x,
      resolved.z,
      mazeBoxes,
      bodyRadius
    );
  }
  return resolved;
}
