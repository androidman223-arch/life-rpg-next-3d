/**
 * スルト鉱山 — 火竜神殿迷路（エルアン宮殿と同型 · 赤壁）
 * 生息地: 最深部（サラマンダー地帯）
 */
import {
  buildElanPalaceMazeSpec,
  elanPalaceMazeAltarNorm,
  elanPalaceMazeBlocksPoint,
  elanPalaceMazeCorridorPoint,
  elanPalaceMazeRingCount,
  MOE_ELAN_PALACE_MAZE_CORRIDOR_PLAYER_COUNT,
  MOE_ELAN_PALACE_MAZE_OUTER_SPAWN_LANE,
  MOE_ELAN_PALACE_MAZE_REF_TILE_D,
  MOE_ELAN_PALACE_MAZE_REF_TILE_W,
} from "./moe3dElanPalaceMazeLayout.js";

export const MOE_SULFUR_MINE_MAZE_SLOT_ID = "sulfur_mine";

export {
  buildElanPalaceMazeSpec as buildSulfurMineMazeSpec,
  elanPalaceMazeAltarNorm as sulfurMineMazeAltarNorm,
  elanPalaceMazeBlocksPoint as sulfurMineMazeBlocksPoint,
  elanPalaceMazeCorridorPoint as sulfurMineMazeCorridorPoint,
  elanPalaceMazeRingCount as sulfurMineMazeRingCount,
  MOE_ELAN_PALACE_MAZE_CORRIDOR_PLAYER_COUNT as MOE_SULFUR_MINE_MAZE_CORRIDOR_PLAYER_COUNT,
  MOE_ELAN_PALACE_MAZE_OUTER_SPAWN_LANE as MOE_SULFUR_MINE_MAZE_OUTER_SPAWN_LANE,
  MOE_ELAN_PALACE_MAZE_REF_TILE_D,
  MOE_ELAN_PALACE_MAZE_REF_TILE_W,
};

/**
 * @typedef {{ key: string, ring?: number, segment?: number, along?: number, lane?: number, center?: boolean, variant?: string, slotInZone?: number }} SulfurMineMazeSpawnPlanEntry
 */

/**
 * 火竜神殿周辺 — 白骨·黒骨（外周）· サラマンダー（中庭·内北）
 * @param {number} [tileW]
 * @param {number} [tileD]
 * @returns {SulfurMineMazeSpawnPlanEntry[]}
 */
export function sulfurMineMazeSpawnPlan(
  tileW = MOE_ELAN_PALACE_MAZE_REF_TILE_W,
  tileD = MOE_ELAN_PALACE_MAZE_REF_TILE_D
) {
  const outerLane = MOE_ELAN_PALACE_MAZE_OUTER_SPAWN_LANE;
  const innerRing = Math.max(elanPalaceMazeRingCount(tileW, tileD) - 1, 1);
  return [
    {
      key: "elan_knight_white",
      ring: 0,
      segment: 0,
      along: 0.3,
      lane: outerLane,
      variant: "a",
      slotInZone: 0,
    },
    {
      key: "elan_knight_white",
      ring: 0,
      segment: 0,
      along: 0.62,
      lane: outerLane,
      variant: "b",
      slotInZone: 1,
    },
    {
      key: "elan_knight_black",
      ring: 0,
      segment: 1,
      along: 0.34,
      lane: outerLane,
      variant: "a",
      slotInZone: 0,
    },
    {
      key: "elan_knight_black",
      ring: 0,
      segment: 1,
      along: 0.66,
      lane: outerLane,
      variant: "b",
      slotInZone: 1,
    },
    { key: "salamander", center: true, variant: "a", slotInZone: 0 },
    {
      key: "salamander",
      ring: innerRing,
      segment: 2,
      along: 0.5,
      variant: "b",
      slotInZone: 1,
    },
  ];
}

/**
 * @param {SulfurMineMazeSpawnPlanEntry} entry
 * @param {number} tileW
 * @param {number} tileD
 */
export function sulfurMineMazeSpawnNorm(entry, tileW, tileD) {
  if (entry.center) return { tx: 0.5, tz: 0.5 };
  return elanPalaceMazeCorridorPoint(
    entry.ring ?? 0,
    entry.segment ?? 0,
    entry.along ?? 0.5,
    entry.lane ?? 0.5,
    tileW,
    tileD
  );
}

/**
 * @param {number} [tileW]
 * @param {number} [tileD]
 */
export function sulfurMineMazeActiveSpawnCoords(
  tileW = MOE_ELAN_PALACE_MAZE_REF_TILE_W,
  tileD = MOE_ELAN_PALACE_MAZE_REF_TILE_D
) {
  return sulfurMineMazeSpawnPlan(tileW, tileD).map((entry) =>
    sulfurMineMazeSpawnNorm(entry, tileW, tileD)
  );
}
