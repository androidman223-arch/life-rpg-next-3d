import * as THREE from "three";
import { buildMoe3dKanbanSign } from "@/lib/moe3dKanbanSign";
import { moe3dDesertPreviewTileIndex } from "@/lib/moe3dDesertPreviewTile";
import {
  MOE_3D_LEGACY_TILES_X,
  MOE_3D_LEGACY_TILES_Z,
} from "@/lib/moeField3DModels";
import { MACRO2_L1_SLOT_IDS } from "@/lib/moe3dMacro2Constants";
import { appendMoe3dMacro2L2Props } from "@/lib/moe3dMacro2L2Props";
import { appendMoe3dMacro2L3SpawnPads } from "@/lib/moe3dMacro2L3Spawns";
import { appendMoe3dMacro2L4Fx, resetMoe3dMacro2L4Fx } from "@/lib/moe3dMacro2L4Fx";
import { resetMoe3dMacro3L4Fx } from "@/lib/moe3dMacro3L4Fx";
import { appendAllMoe3dMacro2CyclePasses } from "@/lib/moe3dMacro2CyclePass";
import { appendMoe3dMacro3Terrain } from "@/lib/moe3dMacro3Apply";
import { MOE_TERRAIN_L1_HILL_BUMPS_ENABLED } from "@/lib/moe3dTerrainFeatures";
import { MOE_MONSTER_FIELD_SPAWN_SPECS } from "@/lib/moe3dMonsterMapSpawns";
import { moe3dLayoutTileD, moe3dLayoutTileW } from "@/lib/moeField3DModels";
import {
  moe3dApplyMapTileScale,
  moe3dTileLocalOrigin,
  moe3dTileLocalSize,
  moe3dMapSlotById,
  moe3dTerrainGroupOffset,
} from "@/lib/moe3dWorldLayout";

export { MACRO2_L1_SLOT_IDS };

const L1_SUBTITLE = "L1-L5 · 10サイクル磨き込み";

function mat(color, roughness = 0.92, metalness = 0.02) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addBase(root, tileW, tileD, groundMat, y = 0.12, h = 0.32) {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.98, h, tileD * 0.98),
    groundMat
  );
  base.position.y = y;
  base.receiveShadow = true;
  root.add(base);
}

function addRim(root, tileW, tileD, color, emissive, intensity = 0.15) {
  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(tileW, 0.06, tileD),
    new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: intensity,
      transparent: true,
      opacity: 0.5,
    })
  );
  rim.position.y = 0.03;
  root.add(rim);
}

function addKanban(root, tileW, tileD, title, subtitle = L1_SUBTITLE) {
  const sign = buildMoe3dKanbanSign(title, subtitle, {
    scale: Math.min(1.05, tileW / 46),
    boardW: Math.min(tileW * 0.44, 3.4),
  });
  sign.position.set(0, 0, -tileD * 0.36);
  root.add(sign);
}

function addHillBump(root, x, z, sx, sy, sz, hillMat) {
  if (!MOE_TERRAIN_L1_HILL_BUMPS_ENABLED) return;
  const bump = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), hillMat);
  bump.scale.set(sx, sy, sz);
  bump.position.set(x, 0.28, z);
  bump.receiveShadow = true;
  bump.castShadow = true;
  root.add(bump);
}

function addSimpleTree(root, x, z, scale, leafColor, trunkColor) {
  const leafMat = mat(leafColor, 0.86);
  const trunkMat = mat(trunkColor, 0.9);
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 0.9 * scale, 5),
    trunkMat
  );
  trunk.position.y = 0.45 * scale;
  trunk.castShadow = true;
  g.add(trunk);
  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.38 * scale, 0.85 * scale, 6),
    leafMat
  );
  crown.position.y = 1.05 * scale;
  crown.castShadow = true;
  g.add(crown);
  g.position.set(x, 0.2, z);
  root.add(g);
}

/** レクスール・ヒルズ — 紫丘陵 */
function buildLexurHillsL1(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "macro2-l1-lexur_hills";
  const ground = mat(0xc4b5fd, 0.94);
  const hill = mat(0x7c3aed, 0.9);
  const dark = mat(0x5b21b6, 0.93);
  addBase(root, tileW, tileD, ground);
  addHillBump(root, -tileW * 0.2, tileD * 0.1, tileW * 0.28, 1.6, tileD * 0.22, hill);
  addHillBump(root, tileW * 0.22, -tileD * 0.15, tileW * 0.32, 2.0, tileD * 0.26, dark);
  addHillBump(root, tileW * 0.05, tileD * 0.28, tileW * 0.2, 1.2, tileD * 0.18, hill);
  addSimpleTree(root, -tileW * 0.32, -tileD * 0.22, 1.1, 0x4ade80, 0x57534e);
  addSimpleTree(root, tileW * 0.34, tileD * 0.18, 0.95, 0x22c55e, 0x44403c);
  addKanban(root, tileW, tileD, "レクスール・ヒルズ");
  addRim(root, tileW, tileD, 0xddd6fe, 0x7c3aed);
  root.userData.macro2L1 = { id: "lexur_hills", layer: 1 };
  return root;
}

/** ミーリム海岸 — 砂浜と浅瀬 */
function buildMeerimCoastL1(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "macro2-l1-meerim_coast";
  const sand = mat(0xfde68a, 0.96);
  const wet = mat(0x38bdf8, 0.72, 0.08);
  const drift = mat(0xd4b896, 0.9);
  addBase(root, tileW, tileD, sand);
  const shore = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.98, 0.04, tileD * 0.38),
    wet
  );
  shore.position.set(0, 0.14, tileD * 0.32);
  shore.receiveShadow = true;
  root.add(shore);
  for (const [x, z] of [
    [-0.28, 0.12],
    [0.18, 0.22],
    [-0.08, -0.18],
  ]) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.4, 5), drift);
    log.rotation.z = Math.PI * 0.5;
    log.position.set(tileW * x, 0.32, tileD * z);
    log.castShadow = true;
    root.add(log);
  }
  addKanban(root, tileW, tileD, "ミーリム海岸");
  addRim(root, tileW, tileD, 0xfef08a, 0x0284c7);
  root.userData.macro2L1 = { id: "meerim_coast", layer: 1 };
  return root;
}

/** エルビン渓谷 — 草原 */
function buildElvinValleyL1(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "macro2-l1-elvin_valley";
  const grass = mat(0x4ade80, 0.93);
  const grassDark = mat(0x166534, 0.92);
  addBase(root, tileW, tileD, grass);
  addHillBump(root, -tileW * 0.18, tileD * 0.08, tileW * 0.24, 0.9, tileD * 0.2, grassDark);
  addHillBump(root, tileW * 0.2, -tileD * 0.12, tileW * 0.22, 0.75, tileD * 0.18, grassDark);
  for (const [x, z, s] of [
    [-0.3, -0.2, 1.0],
    [0.28, 0.24, 1.15],
    [-0.05, 0.3, 0.85],
    [0.12, -0.28, 0.9],
  ]) {
    addSimpleTree(root, tileW * x, tileD * z, s, 0x15803d, 0x57534e);
  }
  addKanban(root, tileW, tileD, "エルビン渓谷");
  addRim(root, tileW, tileD, 0x86efac, 0x166534);
  root.userData.macro2L1 = { id: "elvin_valley", layer: 1 };
  return root;
}

/** ガルム回廊 — 石柱回廊 */
function buildGarmCorridorL1(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "macro2-l1-garm_corridor";
  const floor = mat(0xa78bfa, 0.9);
  const pillar = mat(0x5b21b6, 0.82);
  const wall = mat(0x4c1d95, 0.88);
  addBase(root, tileW, tileD, floor, 0.1, 0.28);
  for (const sx of [-1, 1]) {
    const side = new THREE.Mesh(
      new THREE.BoxGeometry(tileW * 0.12, 2.8, tileD * 0.88),
      wall
    );
    side.position.set(sx * tileW * 0.42, 1.5, 0);
    side.receiveShadow = true;
    side.castShadow = true;
    root.add(side);
  }
  for (let i = 0; i < 4; i++) {
    for (const sx of [-1, 1]) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.42, 2.6, 6),
        pillar
      );
      col.position.set(sx * tileW * 0.22, 1.4, (i - 1.5) * tileD * 0.22);
      col.castShadow = true;
      col.receiveShadow = true;
      root.add(col);
    }
  }
  addKanban(root, tileW, tileD, "ガルム回廊");
  addRim(root, tileW, tileD, 0xc4b5fd, 0x5b21b6);
  root.userData.macro2L1 = { id: "garm_corridor", layer: 1 };
  return root;
}

/** イルヴァーナ渓谷 — 渓谷と浅瀬 */
function buildIlvanaValleyL1(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "macro2-l1-ilvana_valley";
  const grass = mat(0x67e8f9, 0.92);
  const cliff = mat(0x0e7490, 0.86);
  const water = mat(0x22d3ee, 0.7, 0.06);
  addBase(root, tileW, tileD, grass);
  const stream = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.18, 0.05, tileD * 0.82),
    water
  );
  stream.position.set(-tileW * 0.08, 0.16, 0);
  stream.receiveShadow = true;
  root.add(stream);
  for (const sx of [-1, 1]) {
    const cliffWall = new THREE.Mesh(
      new THREE.BoxGeometry(tileW * 0.14, 2.8, tileD * 0.75),
      cliff
    );
    cliffWall.position.set(sx * tileW * 0.38, 1.45, tileD * 0.05);
    cliffWall.castShadow = true;
    root.add(cliffWall);
  }
  addKanban(root, tileW, tileD, "イルヴァーナ渓谷");
  addRim(root, tileW, tileD, 0xa5f3fc, 0x0e7490);
  root.userData.macro2L1 = { id: "ilvana_valley", layer: 1 };
  return root;
}

/** 砂漠プレビュー — 砂丘 · サボテン · 蟻地獄縁 */
function buildDesertPreviewL1(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "macro2-l1-desert_preview";
  const sand = mat(0xd4a574, 0.94);
  const sandDark = mat(0xb8895a, 0.96);
  const rock = mat(0x8b7355, 0.88);
  const cactus = mat(0x3d7a37, 0.82);
  addBase(root, tileW, tileD, sand, 0.12, 0.35);
  const pit = new THREE.Mesh(
    new THREE.CylinderGeometry(tileW * 0.12, tileW * 0.16, 0.5, 12, 1, true),
    sandDark
  );
  pit.position.set(tileW * 0.28, 0.08, tileD * 0.08);
  pit.rotation.x = Math.PI;
  root.add(pit);
  for (const [x, z] of [[-0.08, 0.02], [0.24, 0.26]]) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.1, 6), cactus);
    trunk.position.y = 0.55;
    trunk.castShadow = true;
    g.add(trunk);
    g.position.set(tileW * x, 0.2, tileD * z);
    root.add(g);
  }
  const rockMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), rock);
  rockMesh.scale.set(1.8, 0.9, 1.1);
  rockMesh.position.set(-tileW * 0.32, 0.55, tileD * 0.22);
  rockMesh.castShadow = true;
  root.add(rockMesh);
  addKanban(root, tileW, tileD, "砂漠プレビュー", "L1 · ハティル見本");
  addRim(root, tileW, tileD, 0xeab308, 0x854d0e);
  root.userData.macro2L1 = { id: "desert_preview", layer: 1 };
  return root;
}

/** スローリム平原 — 黄金平原 */
function buildSlorimPlainL1(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "macro2-l1-slorim_plain";
  const plain = mat(0xa3e635, 0.93);
  const hill = mat(0x4d7c0f, 0.9);
  addBase(root, tileW, tileD, plain);
  addHillBump(root, -tileW * 0.25, -tileD * 0.2, tileW * 0.35, 0.65, tileD * 0.2, hill);
  addHillBump(root, tileW * 0.28, tileD * 0.22, tileW * 0.3, 0.55, tileD * 0.18, hill);
  const warpPad = new THREE.Mesh(
    new THREE.CylinderGeometry(tileW * 0.14, tileW * 0.14, 0.06, 16),
    mat(0xfef08a, 0.85)
  );
  warpPad.position.set(0, 0.3, tileD * 0.05);
  warpPad.receiveShadow = true;
  root.add(warpPad);
  addKanban(root, tileW, tileD, "スローリム平原", "L1 · ワープ pad");
  addRim(root, tileW, tileD, 0xd9f99d, 0x4d7c0f);
  root.userData.macro2L1 = { id: "slorim_plain", layer: 1 };
  return root;
}

/** イプス峡谷 — 峡谷（L1強化） */
function buildIpsCanyonL1(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "macro2-l1-ips_canyon";
  const floorMat = mat(0xd4a574, 0.94);
  const floorDarkMat = mat(0xb8895a, 0.96);
  const cliffMat = mat(0xc2410c, 0.88, 0.04);
  const cliffLightMat = mat(0xfdba74, 0.9);
  const rockMat = mat(0x78716c, 0.86);
  addBase(root, tileW, tileD, floorMat, 0.1, 0.32);
  const riverbed = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.22, 0.06, tileD * 0.88),
    floorDarkMat
  );
  riverbed.position.set(0, 0.14, 0);
  riverbed.receiveShadow = true;
  root.add(riverbed);
  function addCliffWall(x, z, sx, sy, sz) {
    const cliff = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), cliffMat);
    cliff.position.set(x, 0.1 + sy / 2, z);
    cliff.castShadow = true;
    cliff.receiveShadow = true;
    root.add(cliff);
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(sx * 1.02, sy * 0.12, sz * 1.02),
      cliffLightMat
    );
    cap.position.set(x, 0.1 + sy + sy * 0.04, z);
    cap.castShadow = true;
    root.add(cap);
  }
  addCliffWall(-tileW * 0.42, 0, tileW * 0.14, 3.6, tileD * 0.92);
  addCliffWall(tileW * 0.42, 0, tileW * 0.14, 4.2, tileD * 0.88);
  for (const p of [
    { x: -0.28, z: -0.22, h: 2.4 },
    { x: 0.24, z: 0.18, h: 3.1 },
    { x: -0.12, z: 0.32, h: 1.8 },
  ]) {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.72, p.h, 6),
      rockMat
    );
    pillar.position.set(tileW * p.x, 0.1 + p.h / 2, tileD * p.z);
    pillar.castShadow = true;
    root.add(pillar);
  }
  addKanban(root, tileW, tileD, "イプス峡谷");
  addRim(root, tileW, tileD, 0xf97316, 0x9a3412);
  root.userData.macro2L1 = { id: "ips_canyon", layer: 1, altarTx: 0.5, altarTz: 0.52 };
  return root;
}

/** ハティル砂漠 — 大砂丘 */
function buildHatiilDesertL1(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "macro2-l1-hatiil_desert";
  const sand = mat(0xd4a574, 0.94);
  const sandDark = mat(0xb45309, 0.92);
  const dead = mat(0x78716c, 0.88);
  addBase(root, tileW, tileD, sand, 0.12, 0.34);
  for (const d of [
    { x: -0.15, z: 0.1, sx: 0.45, sy: 2.8, sz: 0.3 },
    { x: 0.22, z: -0.18, sx: 0.38, sy: 2.2, sz: 0.26 },
    { x: -0.28, z: -0.25, sx: 0.32, sy: 1.6, sz: 0.22 },
  ]) {
    const dune = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), sandDark);
    dune.scale.set(tileW * d.sx, d.sy, tileD * d.sz);
    dune.position.set(tileW * d.x, 0.32, tileD * d.z);
    dune.castShadow = true;
    root.add(dune);
  }
  const pit = new THREE.Mesh(
    new THREE.CylinderGeometry(tileW * 0.14, tileW * 0.18, 0.55, 12, 1, true),
    mat(0x92400e, 0.95)
  );
  pit.position.set(-tileW * 0.22, 0.06, tileD * 0.18);
  pit.rotation.x = Math.PI;
  root.add(pit);
  for (const [x, z] of [[0.3, 0.28], [-0.08, -0.32]]) {
    const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.6, 5), dead);
    stump.position.set(tileW * x, 0.38, tileD * z);
    const branch = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.5), dead);
    branch.position.set(tileW * x + 0.15, 0.55, tileD * z);
    branch.rotation.y = 0.6;
    root.add(stump, branch);
  }
  addKanban(root, tileW, tileD, "ハティル砂漠");
  addRim(root, tileW, tileD, 0xfcd34d, 0xb45309);
  root.userData.macro2L1 = { id: "hatiil_desert", layer: 1 };
  return root;
}

/** @param {string} slotId @param {number} tileW @param {number} tileD */
export function buildMoe3dMacro2L1Tile(slotId, tileW, tileD) {
  switch (slotId) {
    case "lexur_hills":
      return buildLexurHillsL1(tileW, tileD);
    case "meerim_coast":
      return buildMeerimCoastL1(tileW, tileD);
    case "elvin_valley":
      return buildElvinValleyL1(tileW, tileD);
    case "garm_corridor":
      return buildGarmCorridorL1(tileW, tileD);
    case "ilvana_valley":
      return buildIlvanaValleyL1(tileW, tileD);
    case "desert_preview":
      return buildDesertPreviewL1(tileW, tileD);
    case "slorim_plain":
      return buildSlorimPlainL1(tileW, tileD);
    case "ips_canyon":
      return buildIpsCanyonL1(tileW, tileD);
    case "hatiil_desert":
      return buildHatiilDesertL1(tileW, tileD);
    default:
      throw new Error(`macro2 L1: unknown slot ${slotId}`);
  }
}

/** @param {string} slotId */
export function moe3dMacro2L1TilePlacement(slotId, tilesX, tilesZ) {
  if (slotId === "desert_preview") {
    return moe3dDesertPreviewTileIndex(tilesX, tilesZ);
  }
  const slot = moe3dMapSlotById(slotId);
  if (!slot) return null;
  return { ix: slot.ix, iz: slot.iz };
}

const MACRO2_L1_LABELS = {
  lexur_hills: { title: "レクスール・ヒルズ", sub: L1_SUBTITLE, emoji: "pet", size: 68 },
  meerim_coast: { title: "ミーリム海岸", sub: L1_SUBTITLE, emoji: "pet", size: 68 },
  elvin_valley: { title: "エルビン渓谷", sub: L1_SUBTITLE, emoji: "pet", size: 68 },
  garm_corridor: { title: "ガルム回廊", sub: L1_SUBTITLE, emoji: "pet", size: 68 },
  ilvana_valley: { title: "イルヴァーナ渓谷", sub: L1_SUBTITLE, emoji: "pet", size: 68 },
  desert_preview: { title: "砂漠プレビュー", sub: "L1+L2+L3 · 蠍尾+湧き", emoji: "dragon", size: 52 },
  slorim_plain: { title: "スローリム平原", sub: "L1+L2+L3 · マンモス骨+湧き", emoji: "dragon", size: 58 },
  ips_canyon: { title: "イプス峡谷", sub: L1_SUBTITLE, emoji: "dragon", size: 68 },
  hatiil_desert: { title: "ハティル砂漠", sub: L1_SUBTITLE, emoji: "dragon", size: 68 },
};

/**
 * マクロ２ L1 専用タイルを terrainGroup に配置
 * @param {THREE.Group} terrainGroup
 * @param {number} tileW
 * @param {number} tileD
 * @param {{ groundY: Function, raycaster: THREE.Raycaster, attachShowcaseNameLabel?: Function }} opts
 */
export function addMoe3dMacro2L1Tiles(terrainGroup, tileW, tileD, opts) {
  const { groundY, raycaster, attachShowcaseNameLabel } = opts;
  resetMoe3dMacro2L4Fx();
  resetMoe3dMacro3L4Fx();
  const off = moe3dTerrainGroupOffset(tileW, tileD);

  for (const slotId of MACRO2_L1_SLOT_IDS) {
    const placement = moe3dMacro2L1TilePlacement(
      slotId,
      MOE_3D_LEGACY_TILES_X,
      MOE_3D_LEGACY_TILES_Z
    );
    if (!placement) continue;

    const localOrigin = moe3dTileLocalOrigin(
      placement.ix,
      placement.iz,
      tileW,
      tileD
    );
    const localSize = moe3dTileLocalSize(
      placement.ix,
      placement.iz,
      tileW,
      tileD
    );
    const localX = localOrigin.x;
    const localZ = localOrigin.z;
    const sampleX = off.x + localX + localSize.w * 0.5;
    const sampleZ = off.z + localZ + localSize.d * 0.5;
    const baseY = groundY(raycaster, terrainGroup, sampleX, sampleZ);

    const tile = buildMoe3dMacro2L1Tile(slotId, tileW, tileD);
    moe3dApplyMapTileScale(tile);
    appendMoe3dMacro2L2Props(tile, slotId, tileW, tileD);
    appendMoe3dMacro2L3SpawnPads(
      tile,
      slotId,
      tileW,
      tileD,
      MOE_MONSTER_FIELD_SPAWN_SPECS
    );
    appendMoe3dMacro2L4Fx(tile, slotId, tileW, tileD);
    appendAllMoe3dMacro2CyclePasses(tile, slotId, tileW, tileD);
    appendMoe3dMacro3Terrain(tile, slotId, tileW, tileD);
    tile.position.set(localX, baseY, localZ);
    terrainGroup.add(tile);

    const label = MACRO2_L1_LABELS[slotId];
    if (label && attachShowcaseNameLabel) {
      attachShowcaseNameLabel(
        tile,
        slotId === "desert_preview" ? 2.8 : 3.2,
        label.title,
        label.sub,
        label.emoji,
        label.size
      );
    }
  }
}

/** イプス峡谷 L1 タイル（旧 export 互換） */
export function buildMoe3dIpsCanyonTile(tileW, tileD) {
  return buildIpsCanyonL1(tileW, tileD);
}

/** 砂漠プレビュー L1 タイル（旧 export 互換） */
export function buildMoe3dDesertPreviewTile(tileW, tileD) {
  return buildDesertPreviewL1(tileW, tileD);
}
