/**
 * プレイヤー座標がどの 3D マップ面にいるか（terrain タイル矩形）
 */

import { MOE_AGE_MAP_SLOT_IDS } from "@/lib/moe3dMacro2AgeConstants";
import { moe3dIsOnElvinKeikokuField } from "@/lib/moe3dElvinValleyGlb";
import { moe3dIsOnSulfurKazanField } from "@/lib/moe3dSulfurKazanTemple";
import { MOE_3D_WORLD_MAP_REGISTRY } from "@/lib/moe3dWorldLayout";
import { moe3dClampToPlayBounds } from "@/lib/moeField3DModels";
import { moe3dMapSlotWorldRect } from "@/lib/moe3dMonsterMapSpawns";

/**
 * @param {number} px
 * @param {number} py
 * @param {number} tileW
 * @param {number} tileD
 * @returns {string | null}
 */
/**
 * マップ面矩形内にクランプ（AGE転送面 · player.y = Three.js Z）
 */
export function moe3dClampToMapSlotRect(
  x,
  z,
  mapSlotId,
  tileW,
  tileD,
  margin = 2.5
) {
  const rect = moe3dMapSlotWorldRect(mapSlotId, tileW, tileD);
  if (!rect) return { x, y: z };
  return {
    x: Math.max(rect.minX + margin, Math.min(rect.maxX - margin, x)),
    y: Math.max(rect.minZ + margin, Math.min(rect.maxZ - margin, z)),
  };
}

/**
 * ワールド座標がマップ面矩形内か
 */
export function moe3dIsInsideMapSlotRect(px, py, mapSlotId, tileW, tileD) {
  const rect = moe3dMapSlotWorldRect(mapSlotId, tileW, tileD);
  if (!rect) return false;
  return (
    px >= rect.minX &&
    px <= rect.maxX &&
    py >= rect.minZ &&
    py <= rect.maxZ
  );
}

/**
 * 歩行クランプ — AGE面は面矩形、それ以外は地形 bbox
 */
export function moe3dClampFieldPlayPosition(
  x,
  z,
  bounds,
  tileW,
  tileD,
  margin = 1.5
) {
  // GLB マップはタイル矩形内で歩行。全体 terrain bbox で切らない
  if (tileW && tileD && moe3dIsOnSulfurKazanField(x, z, tileW, tileD)) {
    return { x, y: z };
  }
  if (tileW && tileD && moe3dIsOnElvinKeikokuField(x, z, tileW, tileD)) {
    return { x, y: z };
  }
  if (tileW && tileD) {
    const slotId = moe3dMapSlotAtWorldPos(x, z, tileW, tileD);
    if (slotId && MOE_AGE_MAP_SLOT_IDS.has(slotId)) {
      return moe3dClampToMapSlotRect(
        x,
        z,
        slotId,
        tileW,
        tileD,
        Math.max(2.5, margin)
      );
    }
  }
  return moe3dClampToPlayBounds(x, z, bounds, margin);
}

export function moe3dMapSlotAtWorldPos(px, py, tileW, tileD) {
  if (!tileW || !tileD) return null;
  /** @type {string | null} */
  let hit = null;
  for (const slot of MOE_3D_WORLD_MAP_REGISTRY) {
    if (slot.buildPhase < 1) continue;
    const rect = moe3dMapSlotWorldRect(slot.id, tileW, tileD);
    if (!rect) continue;
    if (
      px >= rect.minX &&
      px <= rect.maxX &&
      py >= rect.minZ &&
      py <= rect.maxZ
    ) {
      hit = slot.id;
    }
  }
  return hit;
}
