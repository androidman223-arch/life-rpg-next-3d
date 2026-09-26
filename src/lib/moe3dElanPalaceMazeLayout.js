import { moe3dCircleHitsBox } from "./moe3dBoxColliderMath.js";

export const MOE_ELAN_PALACE_MAZE_SLOT_ID = "elan_palace";
export const MOE_ELAN_PALACE_MAZE_CORRIDOR_PLAYER_COUNT = 15;
/** 最外周湧き — 道幅の外側寄り（0=外壁際 · 1=内側壁際） */
export const MOE_ELAN_PALACE_MAZE_OUTER_SPAWN_LANE = 0.28;
export const MOE_ELAN_PALACE_MAZE_MARGIN = 0.032;
export const MOE_ELAN_PALACE_MAZE_CENTER_HALF = 0.11;
export const MOE_ELAN_PALACE_MAZE_TILE_SPACING = 1.7;
export const MOE_ELAN_PALACE_MAZE_PLAYER_BODY_RADIUS = 0.55;
/** 南西スタート → 時計回り3角 → 北西で内側へ（全リング共通） */
export const MOE_ELAN_PALACE_MAZE_GAP_CORNER = 3;
/** 参照タイル寸法（moe3dEstimatedTileSize 既定） */
export const MOE_ELAN_PALACE_MAZE_REF_TILE_W = 180;
export const MOE_ELAN_PALACE_MAZE_REF_TILE_D = 90;

/**
 * @typedef {{ minTx: number, maxTx: number, minTz: number, maxTz: number }} MoeElanPalaceMazeWallNorm
 * @typedef {{ walls: MoeElanPalaceMazeWallNorm[], ringCount: number, corridor: number, thickness: number, centerHalf: number, margin: number, step: number }} MoeElanPalaceMazeSpec
 */

/** @param {number} tileW @param {number} tileD */
export function elanPalaceMazeCorridorWidthNorm(tileW, tileD) {
  const corridorWorld =
    MOE_ELAN_PALACE_MAZE_CORRIDOR_PLAYER_COUNT *
    2 *
    MOE_ELAN_PALACE_MAZE_PLAYER_BODY_RADIUS;
  const avg =
    (tileW * MOE_ELAN_PALACE_MAZE_TILE_SPACING +
      tileD * MOE_ELAN_PALACE_MAZE_TILE_SPACING) *
    0.5;
  return corridorWorld / Math.max(avg, 1);
}

/** @param {number} tileW @param {number} tileD */
export function elanPalaceMazeWallThicknessNorm(tileW, tileD) {
  const bodyWorld = MOE_ELAN_PALACE_MAZE_PLAYER_BODY_RADIUS * 2;
  const avg =
    (tileW * MOE_ELAN_PALACE_MAZE_TILE_SPACING +
      tileD * MOE_ELAN_PALACE_MAZE_TILE_SPACING) *
    0.5;
  return (bodyWorld * 1.5) / Math.max(avg, 1);
}

/**
 * @param {number} tileW
 * @param {number} tileD
 */
export function elanPalaceMazeLayoutMetrics(
  tileW = MOE_ELAN_PALACE_MAZE_REF_TILE_W,
  tileD = MOE_ELAN_PALACE_MAZE_REF_TILE_D
) {
  const margin = MOE_ELAN_PALACE_MAZE_MARGIN;
  const corridor = elanPalaceMazeCorridorWidthNorm(tileW, tileD);
  const thickness = elanPalaceMazeWallThicknessNorm(tileW, tileD);
  const step = corridor + thickness;
  const lo = margin;
  const hi = 1 - margin;
  return { margin, corridor, thickness, step, lo, hi };
}

/**
 * エルアン宮殿アルター — 南西外周コーナー（出現地点）
 * @param {number} [tileW]
 * @param {number} [tileD]
 */
export function elanPalaceMazeAltarNorm(
  tileW = MOE_ELAN_PALACE_MAZE_REF_TILE_W,
  tileD = MOE_ELAN_PALACE_MAZE_REF_TILE_D
) {
  const { lo, hi, corridor } = elanPalaceMazeLayoutMetrics(tileW, tileD);
  return {
    altarTx: lo + corridor * 0.42,
    altarTz: hi - corridor * 0.42,
    spawnOffTx: corridor * 0.28,
    spawnOffTz: -corridor * 0.12,
  };
}

/**
 * @param {number} ring
 * @param {number} step
 * @param {number} margin
 */
export function elanPalaceMazeRingBounds(ring, step, margin = MOE_ELAN_PALACE_MAZE_MARGIN) {
  const lo = margin + ring * step;
  const hi = 1 - margin - ring * step;
  const ilo = margin + (ring + 1) * step;
  const ihi = 1 - margin - (ring + 1) * step;
  return { lo, hi, ilo, ihi };
}

/**
 * 螺旋通路の座標（南西スタート · 時計回り）
 * @param {number} ring 0=最外周
 * @param {number} segment 0=南, 1=東, 2=北, 3=西
 * @param {number} along 0..1 辺に沿った位置
 * @param {number} [lane] 0..1 道幅内（0.5=中央）
 * @param {number} [tileW]
 * @param {number} [tileD]
 */
export function elanPalaceMazeCorridorPoint(
  ring,
  segment,
  along,
  lane = 0.5,
  tileW = MOE_ELAN_PALACE_MAZE_REF_TILE_W,
  tileD = MOE_ELAN_PALACE_MAZE_REF_TILE_D
) {
  const { margin, corridor, step } = elanPalaceMazeLayoutMetrics(tileW, tileD);
  const { lo, hi } = elanPalaceMazeRingBounds(ring, step, margin);
  const c = corridor;
  const span = Math.max(hi - lo - 2 * c, 0.001);
  const pos = lo + c + span * along;

  switch (segment % 4) {
    case 0:
      return { tx: pos, tz: hi - c * lane };
    case 1:
      return { tx: hi - c * lane, tz: pos };
    case 2:
      return { tx: hi - c - span * along, tz: lo + c * lane };
    default:
      return { tx: lo + c * lane, tz: hi - c - span * along };
  }
}

/**
 * @param {MoeElanPalaceMazeWallNorm[]} walls
 * @param {number} minTx
 * @param {number} maxTx
 * @param {number} minTz
 * @param {number} maxTz
 */
function pushWall(walls, minTx, maxTx, minTz, maxTz) {
  if (maxTx - minTx < 1e-5 || maxTz - minTz < 1e-5) return;
  walls.push({ minTx, maxTx, minTz, maxTz });
}

/**
 * 外周 — 南西コーナーに祭壇・入口（南と西に通路）
 * @param {MoeElanPalaceMazeWallNorm[]} walls
 */
function pushPerimeterWallsSwStart(walls, lo, hi, t, c) {
  pushWall(walls, lo + c, hi, hi - t, hi);
  pushWall(walls, hi - t, hi, lo, hi);
  pushWall(walls, lo, hi, lo, lo + t);
  pushWall(walls, lo, lo + t, lo, hi - c);
}

/**
 * 内側リング境界 — 北西だけ開口（3角曲がった先で内へ）
 * @param {MoeElanPalaceMazeWallNorm[]} walls
 */
function pushInnerRingWallsNwGap(walls, ilo, ihi, t, c) {
  pushWall(walls, ilo + c, ihi, ilo, ilo + t);
  pushWall(walls, ilo, ilo + t, ilo + c, ihi - c);
  pushWall(walls, ilo, ihi - c, ihi - t, ihi);
  pushWall(walls, ihi - t, ihi, ilo + c, ihi);
}

/**
 * 中庭を除く内側の塞ぎ — 次リングより深い中心だけ
 * @param {MoeElanPalaceMazeWallNorm[]} walls
 */
function pushInnerHolePlug(walls, ilo, ihi, c, centerHalf) {
  const plugLo = ilo + c;
  const plugHi = ihi - c;
  if (plugHi - plugLo < c * 0.4) return;

  const cx0 = 0.5 - centerHalf;
  const cx1 = 0.5 + centerHalf;
  const overlapsCourtyard = plugHi > cx0 && plugLo < cx1;

  if (!overlapsCourtyard) {
    pushWall(walls, plugLo, plugHi, plugLo, plugHi);
    return;
  }

  if (plugLo < cx0) {
    pushWall(walls, plugLo, plugHi, plugLo, cx0);
  }
  if (plugHi > cx1) {
    pushWall(walls, plugLo, plugHi, cx1, plugHi);
  }
  if (plugLo < cx0) {
    pushWall(walls, plugLo, cx0, cx0, cx1);
  }
  if (plugHi > cx1) {
    pushWall(walls, cx1, plugHi, cx0, cx1);
  }
}

/**
 * リング空洞の縁と次リング通路の間を塞ぐ（内側リングの道は残す）
 * 北西コーナーは開口側なので塞がない
 * @param {MoeElanPalaceMazeWallNorm[]} walls
 */
function pushShortcutSeals(walls, holeLo, holeHi, innerLo, innerHi, c, centerHalf) {
  if (innerHi - innerLo < c * 2.2) return;

  pushWall(walls, innerLo + c, innerHi - c, innerHi, holeHi - c);
  pushWall(walls, innerHi, holeHi - c, innerLo + c, innerHi - c);
  pushWall(walls, innerLo + c, innerHi - c, holeLo + c, innerLo);
  pushWall(walls, holeLo + c, innerLo, innerLo + c, innerHi - c);

  if (innerHi - innerLo <= centerHalf * 2.8 + c * 2) {
    pushInnerHolePlug(walls, innerLo, innerHi, c, centerHalf);
  }
}

/**
 * @param {MoeElanPalaceMazeWallNorm} wall
 * @param {number} centerHalf
 */
function wallOverlapsCourtyard(wall, centerHalf) {
  const cx0 = 0.5 - centerHalf;
  const cx1 = 0.5 + centerHalf;
  return (
    wall.maxTx > cx0 &&
    wall.minTx < cx1 &&
    wall.maxTz > cx0 &&
    wall.minTz < cx1
  );
}

/**
 * @param {number} tileW
 * @param {number} tileD
 * @param {{ margin?: number, centerHalf?: number }} [opts]
 */
export function elanPalaceMazeRingCount(tileW, tileD, opts = {}) {
  const margin = opts.margin ?? MOE_ELAN_PALACE_MAZE_MARGIN;
  const centerHalf = opts.centerHalf ?? MOE_ELAN_PALACE_MAZE_CENTER_HALF;
  const corridor = elanPalaceMazeCorridorWidthNorm(tileW, tileD);
  const thickness = elanPalaceMazeWallThicknessNorm(tileW, tileD);
  const step = corridor + thickness;
  let ring = 0;
  while (true) {
    const ilo = margin + (ring + 1) * step;
    const ihi = 1 - margin - (ring + 1) * step;
    if (ihi - ilo <= centerHalf * 2) break;
    ring += 1;
  }
  return ring;
}

/**
 * @param {number} tileW
 * @param {number} tileD
 * @param {{ margin?: number, centerHalf?: number }} [opts]
 * @returns {MoeElanPalaceMazeSpec}
 */
export function buildElanPalaceMazeSpec(tileW, tileD, opts = {}) {
  const margin = opts.margin ?? MOE_ELAN_PALACE_MAZE_MARGIN;
  const centerHalf = opts.centerHalf ?? MOE_ELAN_PALACE_MAZE_CENTER_HALF;
  const corridor = elanPalaceMazeCorridorWidthNorm(tileW, tileD);
  const thickness = elanPalaceMazeWallThicknessNorm(tileW, tileD);
  const step = corridor + thickness;
  const walls = [];

  const lo = margin;
  const hi = 1 - margin;
  pushPerimeterWallsSwStart(walls, lo, hi, thickness, corridor);

  const ring = elanPalaceMazeRingCount(tileW, tileD, opts);
  for (let r = 0; r < ring; r += 1) {
    const ilo = margin + (r + 1) * step;
    const ihi = 1 - margin - (r + 1) * step;
    pushInnerRingWallsNwGap(walls, ilo, ihi, thickness, corridor);
    const innerLo = margin + (r + 2) * step;
    const innerHi = 1 - margin - (r + 2) * step;
    if (innerHi - innerLo > corridor * 1.5) {
      pushShortcutSeals(walls, ilo, ihi, innerLo, innerHi, corridor, centerHalf);
    }
  }

  const filtered = walls.filter(
    (wall) => !wallOverlapsCourtyard(wall, centerHalf)
  );

  return {
    walls: filtered,
    ringCount: ring,
    corridor,
    thickness,
    centerHalf,
    margin,
    step,
  };
}

/**
 * @param {number} tx
 * @param {number} tz
 * @param {MoeElanPalaceMazeWallNorm[]} walls
 * @param {number} [clearance]
 */
export function elanPalaceMazeBlocksPoint(tx, tz, walls, clearance = 0.008) {
  for (const wall of walls) {
    if (
      moe3dCircleHitsBox(tx, tz, clearance, {
        minX: wall.minTx,
        maxX: wall.maxTx,
        minZ: wall.minTz,
        maxZ: wall.maxTz,
      })
    ) {
      return true;
    }
  }
  return false;
}

/**
 * @typedef {{ key: string, ring?: number, segment?: number, along?: number, lane?: number, center?: boolean, variant?: string, slotInZone?: number }} ElanPalaceMazeSpawnPlanEntry
 */

/**
 * 螺旋区画ごとの湧き計画（南西スタート · 時計回り）
 * @param {number} [tileW]
 * @param {number} [tileD]
 * @returns {ElanPalaceMazeSpawnPlanEntry[]}
 */
export function elanPalaceMazeSpawnPlan(
  tileW = MOE_ELAN_PALACE_MAZE_REF_TILE_W,
  tileD = MOE_ELAN_PALACE_MAZE_REF_TILE_D
) {
  const ringCount = elanPalaceMazeRingCount(tileW, tileD);
  const innerRing = Math.max(ringCount - 1, 3);
  const lizardRing = Math.max(ringCount - 2, 3);
  return [
    { key: "elan_knight_white", ring: 0, segment: 0, along: 0.3, lane: MOE_ELAN_PALACE_MAZE_OUTER_SPAWN_LANE, variant: "a", slotInZone: 0 },
    { key: "elan_knight_white", ring: 0, segment: 0, along: 0.62, lane: MOE_ELAN_PALACE_MAZE_OUTER_SPAWN_LANE, variant: "b", slotInZone: 1 },
    { key: "elan_knight_black", ring: 0, segment: 1, along: 0.34, lane: MOE_ELAN_PALACE_MAZE_OUTER_SPAWN_LANE, variant: "a", slotInZone: 0 },
    { key: "elan_knight_black", ring: 0, segment: 1, along: 0.66, lane: MOE_ELAN_PALACE_MAZE_OUTER_SPAWN_LANE, variant: "b", slotInZone: 1 },
    { key: "giant_destroyer", ring: 0, segment: 2, along: 0.5, lane: MOE_ELAN_PALACE_MAZE_OUTER_SPAWN_LANE, variant: "a", slotInZone: 0 },
    { key: "frost_wolf", ring: 1, segment: 0, along: 0.35, variant: "a", slotInZone: 0 },
    { key: "frost_wolf", ring: 1, segment: 0, along: 0.68, variant: "b", slotInZone: 1 },
    { key: "gargoyle_lord", ring: 2, segment: 0, along: 0.35, variant: "a", slotInZone: 0 },
    { key: "gargoyle_lord", ring: 2, segment: 1, along: 0.65, variant: "b", slotInZone: 1 },
    { key: "gargoyle_lord_strong", ring: 3, segment: 0, along: 0.35, variant: "a", slotInZone: 0 },
    { key: "gargoyle_lord_strong", ring: 3, segment: 1, along: 0.65, variant: "b", slotInZone: 1 },
    { key: "lizardman_soldier", ring: lizardRing, segment: 0, along: 0.32, variant: "a", slotInZone: 0 },
    { key: "lizardman_soldier", ring: lizardRing, segment: 0, along: 0.68, variant: "b", slotInZone: 1 },
    { key: "lizardman_mage", ring: lizardRing, segment: 1, along: 0.5, variant: "a", slotInZone: 0 },
    { key: "lizardman_captain", ring: lizardRing, segment: 2, along: 0.5, variant: "a", slotInZone: 0 },
    { key: "minotaur_boss", ring: innerRing, segment: 2, along: 0.5, variant: "a", slotInZone: 0 },
    { key: "dullahan", center: true, variant: "a", slotInZone: 0 },
  ];
}

/**
 * @param {ElanPalaceMazeSpawnPlanEntry} entry
 * @param {number} tileW
 * @param {number} tileD
 */
export function elanPalaceMazeSpawnNorm(entry, tileW, tileD) {
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
 * 湧き pad 用 — 現在配置中の正規化座標
 * @param {number} [tileW]
 * @param {number} [tileD]
 */
export function elanPalaceMazeActiveSpawnCoords(
  tileW = MOE_ELAN_PALACE_MAZE_REF_TILE_W,
  tileD = MOE_ELAN_PALACE_MAZE_REF_TILE_D
) {
  return elanPalaceMazeSpawnPlan(tileW, tileD).map((entry) =>
    elanPalaceMazeSpawnNorm(entry, tileW, tileD)
  );
}
