import * as THREE from "three";
import {
  MOE_YUG_COAST_HOME_PATH,
  MOE_YUG_COAST_PATH_ASPHALT,
  MOE_YUG_COAST_PATH_CURB,
  moe3dYugCoastPathLocalX,
  moe3dYugCoastPathLocalZ,
} from "@/lib/moe3dYugCoastHomePath";
import {
  MOE_MITOYA_TREE_TX,
  MOE_MITOYA_TREE_TZ,
  moe3dMitoyaTileLocalX,
  moe3dMitoyaTileLocalZ,
} from "@/lib/moe3dMitoyaGreatTreeLayout";
import { buildMoe3dKanbanSign } from "@/lib/moe3dKanbanSign";
import { MOE_AGE_MAP_SLOT_IDS } from "@/lib/moe3dMacro2AgeConstants";
import { appendMoe3dMacro2AgeL2Props } from "@/lib/moe3dMacro2AgeL2Props";
import { appendMoe3dMacro2AgeL3SpawnPads } from "@/lib/moe3dMacro2AgeL3Spawns";
import {
  appendMoe3dMacro2AgeL4Fx,
  resetMoe3dMacro2AgeL4Fx,
} from "@/lib/moe3dMacro2AgeL4Fx";
import { resetMoe3dMacro2L4Fx } from "@/lib/moe3dMacro2L4Fx";
import { resetMoe3dMacro3L4Fx } from "@/lib/moe3dMacro3L4Fx";
import { appendAllMoe3dMacro2CyclePasses } from "@/lib/moe3dMacro2CyclePass";
import { appendMoe3dMacro3Terrain } from "@/lib/moe3dMacro3Apply";
import {
  moe3dApplyMapTileScale,
  moe3dMapSlotById,
  moe3dTileLocalOrigin,
  moe3dTileLocalSize,
} from "@/lib/moe3dWorldLayout";

const AGE_SUBTITLE = "AGE大陸 · マクロ２ L1";

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

function addRim(root, tileW, tileD, color, emissive, intensity = 0.15, inset = 1) {
  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * inset, 0.06, tileD * inset),
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

function addKanban(root, tileW, tileD, title, subtitle = AGE_SUBTITLE) {
  const sign = buildMoe3dKanbanSign(title, subtitle, {
    scale: Math.min(1.05, tileW / 46),
    boardW: Math.min(tileW * 0.44, 3.4),
  });
  sign.position.set(0, 0, -tileD * 0.36);
  root.add(sign);
}

function addTree(root, x, z, scale, leaf, trunk = 0x44403c) {
  const g = new THREE.Group();
  const trunkM = mat(trunk, 0.9);
  const leafM = mat(leaf, 0.86);
  const t = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 0.9 * scale, 5),
    trunkM
  );
  t.position.y = 0.45 * scale;
  t.castShadow = true;
  g.add(t);
  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.38 * scale, 0.85 * scale, 6),
    leafM
  );
  crown.position.y = 1.05 * scale;
  crown.castShadow = true;
  g.add(crown);
  g.position.set(x, 0.2, z);
  root.add(g);
}

/** ユグ海岸 — 珊瑚砂浜 · AGE入口 */
function buildYugCoastL1(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "macro2-l1-yug_coast";
  const sand = mat(0x5eead4, 0.94);
  const sea = mat(0x0ea5e9, 0.75, 0.1);
  const coral = mat(0xf472b6, 0.85);
  addBase(root, tileW, tileD, sand);
  const shallows = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.42, 0.08, tileD * 0.35),
    sea
  );
  shallows.position.set(tileW * 0.28, 0.18, tileD * 0.32);
  shallows.receiveShadow = true;
  root.add(shallows);
  for (const [x, z] of [
    [-0.22, -0.12],
    [0.08, 0.18],
    [0.26, -0.08],
  ]) {
    const rock = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), coral);
    rock.scale.set(1.2, 0.55, 1);
    rock.position.set(tileW * x, 0.28, tileD * z);
    rock.castShadow = true;
    root.add(rock);
  }
  const canal = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.1, 0.06, tileD * 0.72),
    mat(0x38bdf8, 0.65, 0.12)
  );
  canal.position.set(tileW * 0.36, 0.2, tileD * 0.02);
  canal.receiveShadow = true;
  root.add(canal);
  const pathSpanTx =
    MOE_YUG_COAST_HOME_PATH.txMax - MOE_YUG_COAST_HOME_PATH.txMin;
  const pathCenterTx =
    (MOE_YUG_COAST_HOME_PATH.txMin + MOE_YUG_COAST_HOME_PATH.txMax) / 2;
  const path = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * pathSpanTx, 0.05, tileD * MOE_YUG_COAST_HOME_PATH.widthTz),
    mat(MOE_YUG_COAST_PATH_ASPHALT, 0.96)
  );
  path.position.set(
    moe3dYugCoastPathLocalX(tileW, pathCenterTx),
    0.24,
    moe3dYugCoastPathLocalZ(tileD, MOE_YUG_COAST_HOME_PATH.centerTz)
  );
  path.receiveShadow = true;
  root.add(path);
  const pathRim = new THREE.Mesh(
    new THREE.BoxGeometry(
      tileW * pathSpanTx * 1.03,
      0.02,
      tileD * MOE_YUG_COAST_HOME_PATH.widthTz * 1.1
    ),
    mat(MOE_YUG_COAST_PATH_CURB, 0.9)
  );
  pathRim.position.copy(path.position);
  pathRim.position.y = 0.2;
  pathRim.receiveShadow = true;
  root.add(pathRim);
  addTree(root, -tileW * 0.3, -tileD * 0.2, 0.9, 0x34d399);
  addKanban(root, tileW, tileD, "ユグ海岸", "家AGE番地 · 道");
  addRim(root, tileW, tileD, 0xa7f3d0, 0x14b8a6);
  root.userData.macro2L1 = { id: "yug_coast", layer: 1, age: true };
  return root;
}

/** ソレス渓谷 — 緑渓谷 · AGE湯 */
function buildSolesValleyL1(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "macro2-l1-soles_valley";
  const ground = mat(0x4ade80, 0.93);
  const cliff = mat(0x57534e, 0.9);
  const spring = mat(0x2dd4bf, 0.72, 0.12);
  addBase(root, tileW, tileD, ground);

  const stream = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.14, 0.07, tileD * 0.78),
    mat(0x38bdf8, 0.68, 0.15)
  );
  stream.position.set(-tileW * 0.08, 0.2, 0);
  root.add(stream);

  const pool = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.22, 0.05, tileD * 0.18),
    spring
  );
  pool.position.set(tileW * 0.04, 0.22, tileD * 0.46);
  pool.receiveShadow = true;
  root.add(pool);

  for (const [x, z] of [
    [0.1, 0.3],
    [0.16, 0.38],
    [0.06, 0.5],
  ]) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(tileW * 0.14, 0.08, tileD * 0.1),
      mat(0x78716c, 0.88)
    );
    step.position.set(tileW * x, 0.28, tileD * z);
    step.castShadow = true;
    root.add(step);
  }

  boxCliff(root, tileW, tileD, cliff, 0.32, -0.28);
  boxCliff(root, tileW, tileD, cliff, -0.3, 0.22);
  addTree(root, tileW * 0.25, -tileD * 0.15, 1.05, 0x22c55e);
  addTree(root, tileW * 0.32, tileD * 0.2, 0.85, 0x16a34a);
  addKanban(root, tileW, tileD, "ソレス渓谷", "AGE湯 · 渓谷の湯");
  addRim(root, tileW, tileD, 0x86efac, 0x15803d);
  root.userData.macro2L1 = { id: "soles_valley", layer: 1, age: true };
  return root;
}

function boxCliff(root, tileW, tileD, cliff, tx, tz) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.22, 1.1, tileD * 0.18),
    cliff
  );
  wall.position.set(tileW * tx, 0.62, tileD * tz);
  wall.castShadow = true;
  wall.userData.moeWalkDecor = true;
  root.add(wall);
}

function buildGeoAbyssL1(tileW, tileD, variant) {
  const root = new THREE.Group();
  root.name = `macro2-l1-geo_abyss_${variant}`;
  const palettes = {
    ne: { ground: 0x450a0a, accent: 0xdc2626, rim: 0xfca5a5, title: "ゲオの深淵（北東）" },
    s: { ground: 0x3b0764, accent: 0x7c3aed, rim: 0xc4b5fd, title: "ゲオの深淵（南）" },
    w: { ground: 0x0f172a, accent: 0x1d4ed8, rim: 0x93c5fd, title: "ゲオの深淵（西）" },
  };
  const p = palettes[variant];
  const ground = mat(p.ground, 0.95);
  const lava = mat(p.accent, 0.6, 0.2);
  addBase(root, tileW, tileD, ground, 0.1, 0.28);
  const crack = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.38, 0.08, tileD * 0.11),
    lava
  );
  crack.position.set(0, 0.21, tileD * 0.02);
  root.add(crack);
  for (const [x, z, s] of [
    [-0.2, -0.18, 0.95],
    [0.18, 0.2, 1.15],
    [0.05, -0.25, 0.75],
  ]) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.16 * s, 0.55 * s, 4), mat(0x1c1917));
    spike.position.set(tileW * x, 0.38, tileD * z);
    spike.castShadow = true;
    root.add(spike);
  }
  addKanban(root, tileW, tileD, p.title);
  addRim(root, tileW, tileD, p.rim, p.accent, 0.12, 0.9);
  root.userData.macro2L1 = {
    id: `geo_abyss_${variant}`,
    layer: 1,
    age: true,
  };
  return root;
}

/** ミトヤの大樹 — MOE 想定の巨木（従来の約10倍スケール） */
function buildMitoyaGreatTreeL1(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "macro2-l1-mitoya_great_tree";
  const ground = mat(0x365314, 0.94);
  addBase(root, tileW, tileD, ground);

  const trunkX = moe3dMitoyaTileLocalX(tileW, MOE_MITOYA_TREE_TX);
  const trunkZ = moe3dMitoyaTileLocalZ(tileD, MOE_MITOYA_TREE_TZ);
  const trunkH = 22;
  const trunkY = 0.28 + trunkH / 2;
  const bark = mat(0x44403c, 0.9);
  const leaf = mat(0x15803d, 0.88);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(5.8, 7.8, trunkH, 14),
    bark
  );
  trunk.position.set(trunkX, trunkY, trunkZ);
  trunk.castShadow = true;
  root.add(trunk);

  for (const [ox, oz, sy] of [
    [0.42, 0.18, 1.1],
    [-0.38, 0.12, 0.95],
    [0.28, -0.22, 1.2],
    [-0.3, -0.16, 1.05],
  ]) {
    const rootFlare = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8 * sy, 3.2 * sy, 4.5, 8),
      bark
    );
    rootFlare.position.set(trunkX + tileW * ox, 2.4, trunkZ + tileD * oz);
    rootFlare.rotation.z = ox * 0.35;
    rootFlare.castShadow = true;
    root.add(rootFlare);
  }

  const crownY = 0.28 + trunkH + 9;
  const crown = new THREE.Mesh(new THREE.SphereGeometry(10, 14, 10), leaf);
  crown.position.set(trunkX, crownY, trunkZ);
  crown.castShadow = true;
  root.add(crown);

  const crownUpper = new THREE.Mesh(new THREE.SphereGeometry(9, 10, 8), mat(0x22c55e, 0.86));
  crownUpper.position.set(trunkX, crownY + 7, trunkZ);
  crownUpper.castShadow = true;
  root.add(crownUpper);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 10, 8),
    mat(0xfde047, 0.55, 0.12)
  );
  glow.position.set(trunkX, crownY + 10, trunkZ);
  root.add(glow);

  root.userData.mitoyaTree = {
    trunkTopY: 0.28 + trunkH,
    crownY,
    crownTopY: crownY + 12,
  };
  const westCanal = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.09, 0.06, tileD * 0.62),
    mat(0x38bdf8, 0.62, 0.12)
  );
  westCanal.position.set(-tileW * 0.34, 0.2, tileD * 0.04);
  westCanal.receiveShadow = true;
  root.add(westCanal);
  const gardenPath = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.22, 0.04, tileD * 0.14),
    mat(0xd6d3d1, 0.9)
  );
  gardenPath.position.set(-tileW * 0.12, 0.22, tileD * 0.22);
  gardenPath.receiveShadow = true;
  root.add(gardenPath);
  const altarPad = new THREE.Mesh(
    new THREE.CylinderGeometry(tileW * 0.07, tileW * 0.075, 0.06, 12),
    mat(0xe7e5e4, 0.92)
  );
  altarPad.position.set(
    moe3dMitoyaTileLocalX(tileW, 0.58),
    0.24,
    moe3dMitoyaTileLocalZ(tileD, 0.5)
  );
  altarPad.receiveShadow = true;
  root.add(altarPad);
  addKanban(root, tileW, tileD, "ミトヤの大樹", "巨木の上に本家 · 家AGE奥");
  addRim(root, tileW, tileD, 0xbbf7d0, 0x22c55e);
  root.userData.macro2L1 = { id: "mitoya_great_tree", layer: 1, age: true };
  return root;
}

/** @param {string} slotId @param {number} tileW @param {number} tileD */
export function buildMoe3dMacro2AgeTile(slotId, tileW, tileD) {
  switch (slotId) {
    case "yug_coast":
      return buildYugCoastL1(tileW, tileD);
    case "soles_valley":
      return buildSolesValleyL1(tileW, tileD);
    case "geo_abyss_ne":
      return buildGeoAbyssL1(tileW, tileD, "ne");
    case "geo_abyss_s":
      return buildGeoAbyssL1(tileW, tileD, "s");
    case "geo_abyss_w":
      return buildGeoAbyssL1(tileW, tileD, "w");
    case "mitoya_great_tree":
      return buildMitoyaGreatTreeL1(tileW, tileD);
    default:
      throw new Error(`macro2 AGE L1: unknown slot ${slotId}`);
  }
}

const AGE_LABELS = {
  yug_coast: { title: "ユグ海岸", sub: "AGE入口 · L1", emoji: "dragon", size: 58 },
  soles_valley: { title: "ソレス渓谷", sub: "AGE湯 · L1〜L3", emoji: "dragon", size: 58 },
  geo_abyss_ne: { title: "ゲオの深淵（北東）", sub: AGE_SUBTITLE, emoji: "dragon", size: 38 },
  geo_abyss_s: { title: "ゲオの深淵（南）", sub: AGE_SUBTITLE, emoji: "dragon", size: 38 },
  geo_abyss_w: { title: "ゲオの深淵（西）", sub: AGE_SUBTITLE, emoji: "dragon", size: 38 },
  mitoya_great_tree: { title: "ミトヤの大樹", sub: AGE_SUBTITLE, emoji: "dragon", size: 62 },
};

/**
 * @param {THREE.Group} terrainGroup
 * @param {number} tileW
 * @param {number} tileD
 * @param {{ groundY: Function, raycaster: THREE.Raycaster, attachShowcaseNameLabel?: Function }} opts
 */
export function addMoe3dMacro2AgeTiles(terrainGroup, tileW, tileD, opts) {
  const { attachShowcaseNameLabel } = opts;
  resetMoe3dMacro2L4Fx();
  resetMoe3dMacro2AgeL4Fx();
  resetMoe3dMacro3L4Fx();

  for (const slotId of MOE_AGE_MAP_SLOT_IDS) {
    const slot = moe3dMapSlotById(slotId);
    if (!slot) continue;

    const localOrigin = moe3dTileLocalOrigin(slot.ix, slot.iz, tileW, tileD);
    const localSize = moe3dTileLocalSize(slot.ix, slot.iz, tileW, tileD);
    const localX = localOrigin.x;
    const localZ = localOrigin.z;
    // iz=4（AGE列）は下に GLB がない。groundY だと iz=3 の飛び出しメッシュに吸われて
    // タイルが宙に浮く／見えない位置になることがある → 常に y=0
    const baseY = 0;

    let tile;
    try {
      tile = buildMoe3dMacro2AgeTile(slotId, tileW, tileD);
      moe3dApplyMapTileScale(tile);
      appendMoe3dMacro2AgeL2Props(tile, slotId, tileW, tileD);
      appendMoe3dMacro2AgeL3SpawnPads(tile, slotId, tileW, tileD);
      appendMoe3dMacro2AgeL4Fx(tile, slotId, tileW, tileD);
      appendAllMoe3dMacro2CyclePasses(tile, slotId, tileW, tileD);
      appendMoe3dMacro3Terrain(tile, slotId, tileW, tileD);
    } catch (err) {
      console.error(`AGE tile build failed: ${slotId}`, err);
      continue;
    }
    // 予約タイルと同じ — 原点＝面の中心（moe3dSlotSpawnWorld の tx/tz=0.5 と一致）
    tile.position.set(
      localX + localSize.w * 0.5,
      baseY,
      localZ + localSize.d * 0.5
    );
    tile.userData.moeMapSlotId = slotId;
    tile.frustumCulled = false;
    terrainGroup.add(tile);

    const label = AGE_LABELS[slotId];
    if (label && attachShowcaseNameLabel) {
      attachShowcaseNameLabel(
        tile,
        3.2,
        label.title,
        label.sub,
        label.emoji,
        label.size
      );
    }
  }
}
