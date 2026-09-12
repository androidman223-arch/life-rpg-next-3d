import * as THREE from "three";
import {
  MOE_CLIMB_GENTLE_PEAK_DOME,
  MOE_CLIMB_GENTLE_TIER_HEIGHT,
  MOE_CLIMB_GENTLE_TIER_SHRINK,
  MOE_CLIMB_TIER_COUNT,
  MOE_CLIMB_TIER_HEIGHT,
  MOE_CLIMB_TIER_SHRINK,
  MOE_CLIMBABLE_MOUNTAIN_GROUP_NAME,
  MOE_CLIMBABLE_TIER_NAME,
  MOE_GREEN_COLLIDER_NAME,
  MOE_SIMPLE_MOUNTAIN_DOME_NAME,
  MOE_SIMPLE_MOUNTAIN_GROUP_NAME,
  MOE_SIMPLE_MOUNTAIN_HEIGHT_MULT,
  MOE_SIMPLE_MOUNTAIN_STEM_NAME,
  MOE_SIMPLE_MOUNTAIN_WIDTH_MULT,
} from "./moe3dMacro3Constants.js";

/**
 * @typedef {{
 *   x: number,
 *   z: number,
 *   sx: number,
 *   sz: number,
 *   sy: number,
 *   heightMult?: number,
 *   stackLayers?: number,
 *   climbable?: boolean,
 *   climbTiers?: number,
 *   tierShrink?: number,
 *   climbTierHeight?: number,
 *   gentle?: boolean,
 *   climbTint?: number,
 *   id?: string,
 * }} MoeSimpleMountainSpec
 */

/**
 * @param {MoeSimpleMountainSpec} spec
 */
export function moeClimbableMountainParams(spec) {
  const gentle = spec.gentle ?? false;
  return {
    tiers: spec.climbTiers ?? MOE_CLIMB_TIER_COUNT,
    shrink:
      spec.tierShrink ??
      (gentle ? MOE_CLIMB_GENTLE_TIER_SHRINK : MOE_CLIMB_TIER_SHRINK),
    tierH:
      spec.climbTierHeight ??
      (gentle ? MOE_CLIMB_GENTLE_TIER_HEIGHT : MOE_CLIMB_TIER_HEIGHT),
    peakDome:
      spec.climbTierHeight != null
        ? spec.climbTierHeight * 0.38
        : gentle
          ? MOE_CLIMB_GENTLE_PEAK_DOME
          : MOE_CLIMB_TIER_HEIGHT * 0.38,
    segments: gentle ? 18 : 14,
  };
}

/**
 * @typedef {{
 *   cx: number,
 *   cz: number,
 *   rx: number,
 *   rz: number,
 *   height: number,
 * }} MoeGreenColliderSpec
 */

/**
 * @param {MoeSimpleMountainSpec} spec
 */
export function moeSimpleMountainUnitHeight(spec) {
  return spec.sy * MOE_SIMPLE_MOUNTAIN_HEIGHT_MULT * (spec.heightMult ?? 1);
}

/**
 * @param {MoeSimpleMountainSpec} spec
 */
export function moeSimpleMountainTotalHeight(spec) {
  const layers = spec.stackLayers ?? 1;
  return moeSimpleMountainUnitHeight(spec) * layers;
}

/**
 * @param {MoeSimpleMountainSpec} spec
 * @param {number} [outset]
 * @returns {MoeGreenColliderSpec}
 */
export function moeGreenColliderSpecFromMountain(spec, outset = 1.1) {
  if (spec.climbable) return null;
  const WM = MOE_SIMPLE_MOUNTAIN_WIDTH_MULT;
  return {
    cx: spec.x,
    cz: spec.z,
    rx: spec.sx * WM * outset,
    rz: spec.sz * WM * outset,
    height: moeSimpleMountainTotalHeight(spec),
  };
}

/**
 * @param {MoeSimpleMountainSpec[]} specs
 * @param {number} [outset]
 */
export function moeGreenColliderSpecs(specs, outset = 1.1) {
  return specs
    .map((s) => moeGreenColliderSpecFromMountain(s, outset))
    .filter(Boolean);
}

/**
 * @param {MoeSimpleMountainSpec} spec
 */
export function moeClimbableMountainTotalHeight(spec) {
  const { tiers, tierH, peakDome } = moeClimbableMountainParams(spec);
  return tiers * tierH + peakDome;
}

/**
 * @param {MoeSimpleMountainSpec} spec
 */
export function moeClimbableMountainTierSlopeDeg(spec) {
  const { shrink, tierH } = moeClimbableMountainParams(spec);
  const WM = MOE_SIMPLE_MOUNTAIN_WIDTH_MULT;
  const bottomR = Math.max(spec.sx * WM, spec.sz * WM) * 0.5;
  const topR = bottomR * shrink;
  return (Math.atan2(bottomR - topR, tierH) * 180) / Math.PI;
}

/**
 * 簡易山ステム（下）+ 簡易山ドーム（上）
 * @param {THREE.Group} parent
 * @param {number} x
 * @param {number} z
 * @param {number} sx
 * @param {number} sy
 * @param {number} sz
 * @param {number} baseTopY
 * @param {THREE.Material} mat
 */
export function appendSimpleMountainLayer(
  parent,
  x,
  z,
  sx,
  sy,
  sz,
  baseTopY,
  mat
) {
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 12), mat);
  stem.name = MOE_SIMPLE_MOUNTAIN_STEM_NAME;
  stem.scale.set(sx, sy, sz);
  stem.position.set(x, baseTopY + sy / 2, z);
  stem.castShadow = true;
  stem.receiveShadow = true;
  parent.add(stem);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    mat
  );
  dome.name = MOE_SIMPLE_MOUNTAIN_DOME_NAME;
  dome.scale.set(sx, sy, sz);
  dome.position.set(x, baseTopY + sy, z);
  dome.castShadow = true;
  dome.receiveShadow = true;
  parent.add(dome);
}

/**
 * @param {THREE.Group} tileRoot
 * @param {number} tileW
 * @param {number} tileD
 * @param {MoeSimpleMountainSpec} spec
 * @param {THREE.Material} mat
 * @param {number} baseTopY
 */
export function appendSimpleMountain(
  tileRoot,
  tileW,
  tileD,
  spec,
  mat,
  baseTopY
) {
  const unitSy = moeSimpleMountainUnitHeight(spec);
  const sx = tileW * spec.sx * MOE_SIMPLE_MOUNTAIN_WIDTH_MULT;
  const sz = tileD * spec.sz * MOE_SIMPLE_MOUNTAIN_WIDTH_MULT;
  const x = tileW * spec.x;
  const z = tileD * spec.z;
  const layers = spec.stackLayers ?? 1;

  const g = new THREE.Group();
  g.name = MOE_SIMPLE_MOUNTAIN_GROUP_NAME;
  if (spec.id) g.userData.mountainId = spec.id;

  let layerBaseY = baseTopY;
  for (let i = 0; i < layers; i++) {
    appendSimpleMountainLayer(g, x, z, sx, unitSy, sz, layerBaseY, mat);
    layerBaseY += unitSy * 2;
  }

  tileRoot.add(g);
  return g;
}

/**
 * 登れる山 — 低い狭い円錐台を3段重ね（緑コライダーなし · メッシュ斜面で登る）
 * @param {THREE.Group} tileRoot
 * @param {number} tileW
 * @param {number} tileD
 * @param {MoeSimpleMountainSpec} spec
 * @param {THREE.Material} mat
 * @param {number} baseTopY
 */
export function appendClimbableMountain(
  tileRoot,
  tileW,
  tileD,
  spec,
  mat,
  baseTopY
) {
  const { tiers, shrink, tierH, peakDome, segments } =
    moeClimbableMountainParams(spec);
  const WM = MOE_SIMPLE_MOUNTAIN_WIDTH_MULT;
  const x = tileW * spec.x;
  const z = tileD * spec.z;
  const baseRx = tileW * spec.sx * WM;
  const baseRz = tileD * spec.sz * WM;

  const g = new THREE.Group();
  g.name = MOE_CLIMBABLE_MOUNTAIN_GROUP_NAME;
  if (spec.id) g.userData.mountainId = spec.id;
  g.userData.moeClimbableMountain = true;

  let y = baseTopY;
  for (let t = 0; t < tiers; t++) {
    const scale = Math.pow(shrink, t);
    const bottomRx = Math.max(baseRx * scale, 0.35);
    const bottomRz = Math.max(baseRz * scale, 0.35);
    const topRx = Math.max(bottomRx * shrink, 0.22);
    const topRz = Math.max(bottomRz * shrink, 0.22);
    const avgBottom = (bottomRx + bottomRz) * 0.5;
    const avgTop = (topRx + topRz) * 0.5;

    const tier = new THREE.Mesh(
      new THREE.CylinderGeometry(avgTop, avgBottom, tierH, segments),
      mat
    );
    tier.name = MOE_CLIMBABLE_TIER_NAME;
    tier.scale.set(bottomRx / avgBottom, 1, bottomRz / avgBottom);
    tier.position.set(x, y + tierH / 2, z);
    tier.castShadow = true;
    tier.receiveShadow = true;
    g.add(tier);
    y += tierH;
  }

  const peakScale = Math.pow(shrink, tiers);
  const peakRx = Math.max(baseRx * peakScale * 0.9, 0.2);
  const peakRz = Math.max(baseRz * peakScale * 0.9, 0.2);
  const peakSy = peakDome;
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1, segments, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    mat
  );
  dome.name = MOE_SIMPLE_MOUNTAIN_DOME_NAME;
  dome.scale.set(peakRx, peakSy, peakRz);
  dome.position.set(x, y, z);
  dome.castShadow = true;
  dome.receiveShadow = true;
  g.add(dome);

  tileRoot.add(g);
  return g;
}

/**
 * @param {THREE.Group} tileRoot
 * @param {number} tileW
 * @param {number} tileD
 * @param {MoeGreenColliderSpec[]} specs
 * @param {number} baseTopY
 */
export function appendGreenColliderVisuals(
  tileRoot,
  tileW,
  tileD,
  specs,
  baseTopY
) {
  if (!tileRoot || !specs?.length) return null;
  const g = new THREE.Group();
  g.name = "macro3-green-colliders";

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.92,
  });

  for (const spec of specs) {
    const sizeY = Math.max(0.8, spec.height);
    const rx = tileW * spec.rx;
    const rz = tileD * spec.rz;
    const unit = new THREE.CylinderGeometry(1, 1, sizeY, 20, 1, true);
    const edges = new THREE.EdgesGeometry(unit);
    const wire = new THREE.LineSegments(edges, lineMat);
    wire.name = MOE_GREEN_COLLIDER_NAME;
    wire.position.set(
      tileW * spec.cx,
      baseTopY + sizeY * 0.5,
      tileD * spec.cz
    );
    wire.scale.set(rx, 1, rz);
    g.add(wire);
    unit.dispose();
    edges.dispose();
  }

  tileRoot.add(g);
  return g;
}

/** desert_preview 見本 */
/** @type {MoeSimpleMountainSpec[]} */
export const MOE_DESERT_PREVIEW_MOUNTAINS = [
  { id: "dune-a", x: -0.22, z: -0.18, sx: 0.34, sy: 1.8, sz: 0.22 },
  {
    id: "dune-b",
    x: 0.18,
    z: 0.12,
    sx: 0.42,
    sy: 2.4,
    sz: 0.28,
    heightMult: 2,
  },
  { id: "dune-c", x: 0.05, z: -0.28, sx: 0.28, sy: 1.4, sz: 0.2 },
  {
    id: "climb-dune",
    x: 0.24,
    z: 0.2,
    sx: 0.38,
    sz: 0.28,
    sy: 1,
    climbable: true,
    climbTiers: 3,
    gentle: true,
  },
];

/** 硫黄丘 — 中央はアルター(0.5,0.5)＋スポーン南寄り。山は四隅へ */
/** @type {MoeSimpleMountainSpec[]} */
export const MOE_SULFUR_MINE_MOUNTAINS = [
  {
    id: "sulfur-main",
    x: 0.32,
    z: -0.3,
    sx: 0.46,
    sz: 0.34,
    sy: 2.3,
    heightMult: 2,
  },
  { id: "vent-east", x: 0.34, z: 0.26, sx: 0.28, sz: 0.2, sy: 1.4 },
  { id: "vent-west", x: -0.34, z: 0.22, sx: 0.3, sz: 0.22, sy: 1.55 },
  { id: "tailings", x: -0.3, z: -0.32, sx: 0.38, sz: 0.26, sy: 1.65 },
  {
    id: "climb-volcano",
    x: 0.02,
    z: 0.34,
    sx: 0.38,
    sz: 0.28,
    sy: 1,
    climbable: true,
    climbTiers: 3,
    gentle: true,
  },
  {
    id: "climb-bone-white",
    x: -0.24,
    z: 0.05,
    sx: 0.34,
    sz: 0.26,
    sy: 1,
    climbable: true,
    climbTiers: 3,
    gentle: true,
    climbTint: 0xe7e5e4,
  },
  {
    id: "climb-bone-black",
    x: 0.24,
    z: -0.05,
    sx: 0.34,
    sz: 0.26,
    sy: 1,
    climbable: true,
    climbTiers: 3,
    gentle: true,
    climbTint: 0x44403c,
  },
];

/** ネオク山 — なだらか登攀丘 */
/** @type {MoeSimpleMountainSpec[]} */
export const MOE_NEOUKU_MOUNTAIN_MOUNTAINS = [
  {
    id: "climb-neoku",
    x: 0.26,
    z: 0.18,
    sx: 0.38,
    sz: 0.28,
    sy: 1,
    climbable: true,
    climbTiers: 3,
    gentle: true,
  },
];

/** ネオク高原 */
/** @type {MoeSimpleMountainSpec[]} */
export const MOE_NEOUKU_PLATEAU_MOUNTAINS = [
  {
    id: "climb-plateau",
    x: -0.22,
    z: 0.24,
    sx: 0.36,
    sz: 0.26,
    sy: 1,
    climbable: true,
    climbTiers: 3,
    gentle: true,
  },
];

/** ダーイン山 */
/** @type {MoeSimpleMountainSpec[]} */
export const MOE_DARIN_MOUNTAIN_MOUNTAINS = [
  {
    id: "climb-darin",
    x: 0.28,
    z: -0.2,
    sx: 0.38,
    sz: 0.28,
    sy: 1,
    climbable: true,
    climbTiers: 3,
    gentle: true,
  },
];

/** エルビン山岳 */
/** @type {MoeSimpleMountainSpec[]} */
export const MOE_ELVIN_MOUNTAINS_MOUNTAINS = [
  {
    id: "climb-elvin",
    x: -0.24,
    z: 0.22,
    sx: 0.36,
    sz: 0.26,
    sy: 1,
    climbable: true,
    climbTiers: 3,
    gentle: true,
  },
];

/** ハティル砂漠 — 登れる砂丘 */
/** @type {MoeSimpleMountainSpec[]} */
export const MOE_HATIIL_DESERT_MOUNTAINS = [
  {
    id: "climb-hatiil",
    x: 0.28,
    z: 0.22,
    sx: 0.38,
    sz: 0.28,
    sy: 1,
    climbable: true,
    climbTiers: 3,
    gentle: true,
  },
];
