import * as THREE from "three";
import { moe3dCircleHitsBox } from "@/lib/moe3dBoxColliderMath";
import { moe3dSpawnBesideMapAltar } from "@/lib/moe3dAltarWarp";
import { MOE_PLAYER_TERRAIN_BODY_RADIUS } from "@/lib/moe3dMacro3Walk";
import {
  moe3dMapSlotById,
  moe3dTerrainGroupOffset,
  moe3dTileLocalOrigin,
  moe3dTileLocalSize,
} from "@/lib/moe3dWorldLayout";
import {
  buildSulfurMineMazeSpec,
  MOE_SULFUR_MINE_MAZE_CORRIDOR_PLAYER_COUNT,
  MOE_SULFUR_MINE_MAZE_SLOT_ID,
} from "@/lib/moe3dSulfurMineMazeLayout";

export {
  buildSulfurMineMazeSpec,
  sulfurMineMazeActiveSpawnCoords,
  sulfurMineMazeAltarNorm,
  sulfurMineMazeBlocksPoint,
  sulfurMineMazeCorridorPoint,
  sulfurMineMazeRingCount,
  sulfurMineMazeSpawnNorm,
  sulfurMineMazeSpawnPlan,
  MOE_SULFUR_MINE_MAZE_CORRIDOR_PLAYER_COUNT,
  MOE_SULFUR_MINE_MAZE_OUTER_SPAWN_LANE,
  MOE_SULFUR_MINE_MAZE_SLOT_ID,
} from "@/lib/moe3dSulfurMineMazeLayout";

export const MOE_SULFUR_MINE_MAZE_WALL_HEIGHT = 6.2;
export const MOE_SULFUR_MINE_MAZE_BASE_Y = 0.3;
export const MOE_SULFUR_MINE_MAZE_CANDLE_SPACING_M = 7.5;
export const MOE_SULFUR_MINE_MAZE_CANDLE_HEIGHT_RATIO = 0.76;

/** @type {{ flame: THREE.Mesh, outerFlame: THREE.Mesh, mat: THREE.MeshStandardMaterial, outerMat: THREE.MeshStandardMaterial, phase: number }[]} */
const candleFlameFx = [];
let candleFxElapsed = 0;

const VOLCANIC_FLOOR = 0x2a1810;
const RED_WALL = 0xb91c1c;
const RED_CAP = 0x991b1b;

/**
 * @param {number} color
 * @param {number} [roughness]
 * @param {number} [metalness]
 * @param {number} [emissive]
 * @param {number} [emissiveIntensity]
 */
function volcanicMaterial(
  color,
  roughness = 0.42,
  metalness = 0.08,
  emissive = 0x000000,
  emissiveIntensity = 0
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    emissive,
    emissiveIntensity,
  });
}

/**
 * @param {THREE.MeshStandardMaterial} waxMat
 * @param {THREE.MeshStandardMaterial} flameMat
 * @param {THREE.MeshStandardMaterial} outerFlameMat
 */
function buildWallCandle(waxMat, flameMat, outerFlameMat) {
  const candle = new THREE.Group();
  const waxH = 0.24;
  const wax = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.062, waxH, 8),
    waxMat
  );
  wax.position.y = waxH * 0.5;
  candle.add(wax);
  const outerMatClone = outerFlameMat.clone();
  const outerFlame = new THREE.Mesh(
    new THREE.SphereGeometry(0.052, 6, 6),
    outerMatClone
  );
  outerFlame.position.y = waxH + 0.05;
  outerFlame.scale.set(1, 1.75, 1);
  candle.add(outerFlame);
  const flameMatClone = flameMat.clone();
  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 6, 6),
    flameMatClone
  );
  flame.position.y = waxH + 0.055;
  flame.scale.set(1, 1.45, 1);
  candle.add(flame);
  candleFlameFx.push({
    flame,
    outerFlame,
    mat: flameMatClone,
    outerMat: outerMatClone,
    phase: Math.random() * Math.PI * 2,
  });
  return candle;
}

/** @param {number} dt */
export function updateSulfurMineMazeFx(dt) {
  candleFxElapsed += dt;
  const t = candleFxElapsed;
  for (const { flame, outerFlame, mat, outerMat, phase } of candleFlameFx) {
    const sway = Math.sin(t * 11 + phase) * 0.11 + Math.sin(t * 17 + phase * 1.4) * 0.07;
    const flick = 0.88 + sway;
    const stretch = 1.55 + Math.sin(t * 13 + phase * 0.8) * 0.22;
    const outerStretch = 1.75 + Math.sin(t * 12 + phase * 0.9) * 0.28;
    flame.scale.set(flick, flick * stretch, flick * 0.9);
    outerFlame.scale.set(flick * 1.12, flick * outerStretch, flick * 1.05);
    flame.position.x = Math.sin(t * 9 + phase) * 0.006;
    flame.position.z = Math.cos(t * 8 + phase * 1.2) * 0.005;
    outerFlame.position.x = flame.position.x * 1.15;
    outerFlame.position.z = flame.position.z * 1.15;
    mat.emissiveIntensity = 0.95 + flick * 0.5;
    mat.opacity = 0.9 + flick * 0.08;
    outerMat.emissiveIntensity = 0.65 + flick * 0.35;
    outerMat.opacity = 0.42 + flick * 0.12;
  }
}

export function resetSulfurMineMazeFx() {
  candleFlameFx.length = 0;
  candleFxElapsed = 0;
}

/**
 * @param {import("@/lib/moe3dElanPalaceMazeLayout.js").MoeElanPalaceMazeWallNorm} wall
 */
function placeWallCandles(group, wall, tileW, tileD, waxMat, flameMat, outerFlameMat) {
  const x0 = (wall.minTx - 0.5) * tileW;
  const x1 = (wall.maxTx - 0.5) * tileW;
  const z0 = (wall.minTz - 0.5) * tileD;
  const z1 = (wall.maxTz - 0.5) * tileD;
  const spanX = Math.max(x1 - x0, 0.02);
  const spanZ = Math.max(z1 - z0, 0.02);
  const cx = (wall.minTx + wall.maxTx) * 0.5;
  const cz = (wall.minTz + wall.maxTz) * 0.5;
  const toCenterX = 0.5 - cx;
  const toCenterZ = 0.5 - cz;
  const mountY =
    MOE_SULFUR_MINE_MAZE_BASE_Y +
    MOE_SULFUR_MINE_MAZE_WALL_HEIGHT * MOE_SULFUR_MINE_MAZE_CANDLE_HEIGHT_RATIO;
  const inset = 0.12;
  const spacing = MOE_SULFUR_MINE_MAZE_CANDLE_SPACING_M;

  const addCandle = (x, z) => {
    const candle = buildWallCandle(waxMat, flameMat, outerFlameMat);
    candle.position.set(x, mountY, z);
    group.add(candle);
  };

  if (spanX >= spanZ) {
    if (spanX < spacing * 0.9) return;
    const count = Math.max(1, Math.floor(spanX / spacing));
    const step = spanX / (count + 1);
    const zFace = toCenterZ >= 0 ? z1 : z0;
    const zOff = toCenterZ >= 0 ? inset : -inset;
    for (let i = 1; i <= count; i += 1) {
      addCandle(x0 + step * i, zFace + zOff);
    }
    return;
  }

  if (spanZ < spacing * 0.9) return;
  const count = Math.max(1, Math.floor(spanZ / spacing));
  const step = spanZ / (count + 1);
  const xFace = toCenterX >= 0 ? x1 : x0;
  const xOff = toCenterX >= 0 ? inset : -inset;
  for (let i = 1; i <= count; i += 1) {
    addCandle(xFace + xOff, z0 + step * i);
  }
}

/**
 * @param {number} tileW
 * @param {number} tileD
 */
function sulfurMineTileFrame(tileW, tileD) {
  const slot = moe3dMapSlotById(MOE_SULFUR_MINE_MAZE_SLOT_ID);
  if (!slot || !tileW || !tileD) return null;
  const off = moe3dTerrainGroupOffset(tileW, tileD);
  const origin = moe3dTileLocalOrigin(slot.ix, slot.iz, tileW, tileD);
  const size = moe3dTileLocalSize(slot.ix, slot.iz, tileW, tileD);
  return {
    minX: off.x + origin.x,
    maxX: off.x + origin.x + size.w,
    minZ: off.z + origin.z,
    maxZ: off.z + origin.z + size.d,
    tileW: size.w,
    tileD: size.d,
  };
}

/** @param {number} px @param {number} pz @param {number} tileW @param {number} tileD */
export function moe3dIsInSulfurMineTile(px, pz, tileW, tileD) {
  const frame = sulfurMineTileFrame(tileW, tileD);
  if (!frame) return false;
  return (
    px >= frame.minX &&
    px <= frame.maxX &&
    pz >= frame.minZ &&
    pz <= frame.maxZ
  );
}

/**
 * @param {import("@/lib/moe3dElanPalaceMazeLayout.js").MoeElanPalaceMazeWallNorm} wall
 * @param {ReturnType<typeof sulfurMineTileFrame>} frame
 */
function wallNormToWorldBox(wall, frame) {
  return {
    minX: frame.minX + frame.tileW * wall.minTx,
    maxX: frame.minX + frame.tileW * wall.maxTx,
    minZ: frame.minZ + frame.tileD * wall.minTz,
    maxZ: frame.minZ + frame.tileD * wall.maxTz,
  };
}

/**
 * @param {number} px
 * @param {number} pz
 * @param {number} tileW
 * @param {number} tileD
 * @param {number} [bodyRadius]
 */
export function moe3dSulfurMineMazeWorldBoxesAt(px, pz, tileW, tileD, bodyRadius) {
  if (!moe3dIsInSulfurMineTile(px, pz, tileW, tileD)) return [];
  const frame = sulfurMineTileFrame(tileW, tileD);
  if (!frame) return [];
  const spec = buildSulfurMineMazeSpec(tileW, tileD);
  let boxes = spec.walls.map((wall) => wallNormToWorldBox(wall, frame));

  const spawn = moe3dSpawnBesideMapAltar(
    MOE_SULFUR_MINE_MAZE_SLOT_ID,
    tileW,
    tileD
  );
  if (spawn) {
    const bypassR = 3.2;
    if (Math.hypot(px - spawn.x, pz - spawn.y) <= bypassR) {
      const r = bodyRadius ?? MOE_PLAYER_TERRAIN_BODY_RADIUS;
      boxes = boxes.filter(
        (box) => !moe3dCircleHitsBox(spawn.x, spawn.y, r, box)
      );
    }
  }

  return boxes;
}

/**
 * @param {import("three").Group} tileRoot
 * @param {number} tileW
 * @param {number} tileD
 */
export function appendSulfurMineMazeMeshes(tileRoot, tileW, tileD) {
  if (!tileRoot || !tileW || !tileD) return null;
  const spec = buildSulfurMineMazeSpec(tileW, tileD);
  const group = new THREE.Group();
  group.name = "sulfur-mine-maze";

  const floorMat = volcanicMaterial(VOLCANIC_FLOOR, 0.55, 0.04, 0x3f1010, 0.08);
  const wallMat = volcanicMaterial(RED_WALL, 0.48, 0.12, 0x5c1010, 0.18);
  const capMat = volcanicMaterial(RED_CAP, 0.44, 0.14, 0x450a0a, 0.22);
  const waxMat = new THREE.MeshStandardMaterial({
    color: 0x3f1010,
    roughness: 0.92,
    metalness: 0,
  });
  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xffe08a,
    emissive: 0xffb020,
    emissiveIntensity: 1.15,
    roughness: 0.4,
    metalness: 0,
    transparent: true,
    opacity: 0.94,
  });
  const outerFlameMat = new THREE.MeshStandardMaterial({
    color: 0xff4422,
    emissive: 0xdd2200,
    emissiveIntensity: 0.85,
    roughness: 0.55,
    metalness: 0,
    transparent: true,
    opacity: 0.48,
  });

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.96, 0.05, tileD * 0.96),
    floorMat
  );
  floor.position.y = MOE_SULFUR_MINE_MAZE_BASE_Y + 0.025;
  floor.receiveShadow = true;
  group.add(floor);

  for (const wall of spec.walls) {
    const x0 = (wall.minTx - 0.5) * tileW;
    const x1 = (wall.maxTx - 0.5) * tileW;
    const z0 = (wall.minTz - 0.5) * tileD;
    const z1 = (wall.maxTz - 0.5) * tileD;
    const w = Math.max(x1 - x0, 0.02);
    const d = Math.max(z1 - z0, 0.02);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, MOE_SULFUR_MINE_MAZE_WALL_HEIGHT, d),
      wallMat
    );
    mesh.position.set(
      (x0 + x1) * 0.5,
      MOE_SULFUR_MINE_MAZE_BASE_Y + MOE_SULFUR_MINE_MAZE_WALL_HEIGHT * 0.5,
      (z0 + z1) * 0.5
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(w * 1.04, 0.14, d * 1.04),
      capMat
    );
    cap.position.set(
      mesh.position.x,
      MOE_SULFUR_MINE_MAZE_BASE_Y + MOE_SULFUR_MINE_MAZE_WALL_HEIGHT + 0.05,
      mesh.position.z
    );
    cap.castShadow = true;
    group.add(cap);

    placeWallCandles(group, wall, tileW, tileD, waxMat, flameMat, outerFlameMat);
  }

  tileRoot.add(group);
  tileRoot.userData.sulfurMineMaze = {
    ringCount: spec.ringCount,
    wallCount: spec.walls.length,
    corridorPlayers: MOE_SULFUR_MINE_MAZE_CORRIDOR_PLAYER_COUNT,
  };
  return group;
}
