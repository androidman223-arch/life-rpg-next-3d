import * as THREE from "three";
import { MOE_AGE_MAP_SLOT_IDS } from "@/lib/moe3dMacro2AgeConstants";
import { buildMoe3dAgeTreeHouse } from "@/lib/moe3dAgeHomeProps";
import {
  MOE_MITOYA_TREE_TX,
  MOE_MITOYA_TREE_TZ,
  moe3dMitoyaTileLocalX,
  moe3dMitoyaTileLocalZ,
} from "@/lib/moe3dMitoyaGreatTreeLayout";

function mat(color, roughness = 0.88, metalness = 0.04) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function propGroup(name) {
  const g = new THREE.Group();
  g.name = name;
  return g;
}

function box(g, w, h, d, m, x, y, z, rot = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
}

function cyl(g, rTop, rBot, h, m, x, y, z, rot = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 6), m);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}

/** ソレス渓谷 — 川辺の丸太・石段・AGE湯看板 */
function propsSolesValley(tileW, tileD) {
  const g = propGroup("macro2-l2-soles_valley");
  const wood = mat(0x8b6914, 0.9);
  const stone = mat(0x78716c, 0.86);
  const moss = mat(0x4d7c0f, 0.82);
  const sign = mat(0xfef3c7, 0.75);

  for (let i = 0; i < 3; i++) {
    cyl(
      g,
      0.14,
      0.16,
      0.28,
      wood,
      tileW * (-0.02 + i * 0.11),
      0.42,
      tileD * (0.18 + i * 0.06),
      [0, 0.15 * i, 0.08]
    );
  }

  for (const [x, z, ry] of [
    [0.12, 0.28, 0.1],
    [0.18, 0.36, -0.15],
    [0.06, 0.44, 0.35],
  ]) {
    box(g, 0.42, 0.1, 0.32, stone, tileW * x, 0.36, tileD * z, [0, ry, 0.08]);
  }

  box(g, 0.55, 0.04, 0.38, wood, tileW * 0.22, 0.48, tileD * 0.32);
  cyl(g, 0.04, 0.05, 0.55, wood, tileW * 0.08, 0.52, tileD * 0.38);
  cyl(g, 0.04, 0.05, 0.55, wood, tileW * 0.36, 0.52, tileD * 0.38);

  box(g, 0.38, 0.22, 0.06, sign, tileW * 0.3, 0.68, tileD * 0.26);
  box(g, 0.06, 0.28, 0.06, wood, tileW * 0.3, 0.62, tileD * 0.26);

  for (const [x, z] of [
    [0.14, 0.52],
    [-0.04, 0.58],
  ]) {
    const log = cyl(g, 0.1, 0.12, 0.5, moss, tileW * x, 0.45, tileD * z, [0, 0.4, 0.25]);
    log.rotation.z = 0.35;
  }

  const springRock = new THREE.Mesh(new THREE.SphereGeometry(0.22, 7, 6), mat(0x57534e));
  springRock.scale.set(1.3, 0.55, 1.1);
  springRock.position.set(tileW * 0.04, 0.4, tileD * 0.48);
  springRock.castShadow = true;
  g.add(springRock);

  g.userData.macro2L2 = {
    id: "soles_valley",
    wiki: "ソレス渓谷 · AGE湯（川辺の丸太・石段）",
  };
  return g;
}

/** ユグ海岸 — 珊瑚・流木・貝殻かご（AGE入口） */
function propsYugCoast(tileW, tileD) {
  const g = propGroup("macro2-l2-yug_coast");
  const wood = mat(0x9a7b4f, 0.92);
  const coral = mat(0xf472b6, 0.82);
  const shell = mat(0xfef3c7, 0.78);
  const rope = mat(0xc4a574, 0.9);

  const drift = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.72, 5), wood);
  drift.rotation.set(0.4, 0.2, 0.55);
  drift.position.set(tileW * 0.2, 0.38, tileD * 0.08);
  drift.castShadow = true;
  g.add(drift);

  const drift2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.55, 5), wood);
  drift2.rotation.set(-0.25, -0.35, 0.3);
  drift2.position.set(tileW * -0.12, 0.34, tileD * 0.14);
  drift2.castShadow = true;
  g.add(drift2);

  for (const [x, z, s] of [
    [0.26, 0.22, 1.1],
    [0.32, 0.18, 0.85],
    [0.18, 0.26, 0.95],
  ]) {
    const rock = new THREE.Mesh(new THREE.SphereGeometry(0.18 * s, 6, 5), coral);
    rock.scale.set(1.2, 0.5, 1);
    rock.position.set(tileW * x, 0.32, tileD * z);
    rock.castShadow = true;
    g.add(rock);
  }

  cyl(g, 0.05, 0.06, 0.48, rope, tileW * 0.34, 0.46, tileD * 0.36);
  cyl(g, 0.05, 0.06, 0.48, rope, tileW * 0.46, 0.46, tileD * 0.36);
  box(g, 0.52, 0.04, 0.08, wood, tileW * 0.4, 0.5, tileD * 0.36);

  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.12, 8), shell);
  basket.position.set(tileW * 0.38, 0.42, tileD * 0.28);
  basket.castShadow = true;
  g.add(basket);

  for (const z of [0.12, 0.24, 0.36]) {
    box(g, 0.1, 0.14, 0.1, shell, tileW * 0.34, 0.36, tileD * z);
  }

  g.userData.macro2L2 = {
    id: "yug_coast",
    wiki: "ユグ海岸 · 家AGE入口（番地の道·小川·灯り）",
  };
  return g;
}

/** ミトヤの大樹 — 根の露出・苔石・古い灯籠 */
function propsMitoyaGreatTree(tileW, tileD) {
  const g = propGroup("macro2-l2-mitoya_great_tree");
  const bark = mat(0x57534e, 0.92);
  const moss = mat(0x4d7c0f, 0.84);
  const stone = mat(0x78716c, 0.88);
  const gold = mat(0xfbbf24, 0.55, 0.15);
  const trunkX = moe3dMitoyaTileLocalX(tileW, MOE_MITOYA_TREE_TX);
  const trunkZ = moe3dMitoyaTileLocalZ(tileD, MOE_MITOYA_TREE_TZ);

  for (const [x, z, ry, sx] of [
    [0.08, 0.12, 0.2, 1.1],
    [-0.1, 0.18, -0.35, 0.95],
    [0.14, -0.06, 0.55, 1.25],
    [-0.16, 0.04, -0.15, 1.05],
  ]) {
    const root = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * sx, 0.14 * sx, 0.42, 5), bark);
    root.rotation.set(0.55, ry, 0.12);
    root.position.set(trunkX + tileW * x, 0.28, trunkZ + tileD * z);
    root.castShadow = true;
    g.add(root);
    const mossCap = new THREE.Mesh(new THREE.SphereGeometry(0.1 * sx, 5, 4), moss);
    mossCap.scale.set(1.4, 0.45, 1.2);
    mossCap.position.copy(root.position);
    mossCap.position.y += 0.08;
    g.add(mossCap);
  }

  for (const [x, z, s] of [
    [0.22, 0.28, 1],
    [-0.2, 0.32, 0.85],
    [0.04, 0.42, 1.15],
    [-0.08, 0.48, 0.9],
  ]) {
    const rock = new THREE.Mesh(new THREE.SphereGeometry(0.16 * s, 6, 5), stone);
    rock.scale.set(1.1, 0.55, 1);
    rock.position.set(trunkX + tileW * x, 0.34, trunkZ + tileD * z);
    rock.castShadow = true;
    g.add(rock);
  }

  cyl(g, 0.05, 0.07, 0.62, bark, trunkX + tileW * -0.28, 0.52, trunkZ + tileD * 0.22);
  box(g, 0.14, 0.18, 0.14, gold, trunkX + tileW * -0.28, 0.72, trunkZ + tileD * 0.22);
  cyl(g, 0.03, 0.04, 0.08, gold, trunkX + tileW * -0.28, 0.84, trunkZ + tileD * 0.22);

  const branchMat = mat(0x57534e, 0.9);
  for (const [y, tx, tz, r] of [
    [12, 0.22, 0.08, 2.4],
    [20, -0.2, 0.1, 2.2],
    [28, 0.12, -0.06, 2.6],
  ]) {
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.35, r * 0.55, 2.8, 8),
      branchMat
    );
    branch.rotation.z = tx * 0.55;
    branch.position.set(trunkX + tileW * tx, y, trunkZ + tileD * tz);
    branch.castShadow = true;
    g.add(branch);
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r * 1.05, 0.28, 10),
      mat(0x78716c, 0.86)
    );
    pad.position.set(trunkX + tileW * tx, y + 1.2, trunkZ + tileD * tz);
    pad.receiveShadow = true;
    g.add(pad);
  }

  const sideHouseA = buildMoe3dAgeTreeHouse({ main: false });
  sideHouseA.position.set(trunkX + tileW * 0.22, 13.2, trunkZ + tileD * 0.08);
  g.add(sideHouseA);

  const sideHouseB = buildMoe3dAgeTreeHouse({ main: false, bodyW: 3, bodyH: 2.2 });
  sideHouseB.position.set(trunkX - tileW * 0.2, 21.2, trunkZ + tileD * 0.1);
  g.add(sideHouseB);

  const mainHouse = buildMoe3dAgeTreeHouse({ main: true });
  mainHouse.position.set(trunkX, 36.5, trunkZ);
  g.add(mainHouse);

  for (const z of [-0.08, 0.08, 0.24]) {
    const stone = new THREE.Mesh(new THREE.SphereGeometry(0.12, 5, 4), moss);
    stone.scale.set(1.2, 0.5, 1);
    stone.position.set(tileW * -0.32, 0.34, trunkZ + tileD * z);
    stone.castShadow = true;
    g.add(stone);
  }

  g.userData.macro2L2 = {
    id: "mitoya_great_tree",
    wiki: "ミトヤの大樹 · 巨木上の本家と枝住宅",
  };
  return g;
}

/** ゲオ深淵（北東）— 溶岩クリスタル・黒岩 */
function propsGeoAbyssNe(tileW, tileD) {
  const g = propGroup("macro2-l2-geo_abyss_ne");
  const rock = mat(0x292524, 0.9);
  const crystal = mat(0xdc2626, 0.55, 0.25);
  const glow = mat(0xfca5a5, 0.45, 0.2);

  for (const [x, z, h, s] of [
    [-0.22, -0.12, 0.42, 0.9],
    [0.2, 0.16, 0.38, 0.75],
    [0.06, -0.22, 0.48, 1.0],
  ]) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.13 * s, h, 4), rock);
    spike.position.set(tileW * x, h * 0.45, tileD * z);
    spike.rotation.y = x * 2.5;
    spike.castShadow = true;
    g.add(spike);
  }

  for (const [x, z, ry] of [
    [-0.08, 0.08, 0.3],
    [0.14, -0.04, -0.4],
    [-0.18, 0.2, 0.8],
  ]) {
    const shard = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 4), crystal);
    shard.position.set(tileW * x, 0.42, tileD * z);
    shard.rotation.set(0.15, ry, 0.55);
    shard.castShadow = true;
    g.add(shard);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5), glow);
    halo.scale.set(0.6, 1.4, 0.6);
    halo.position.copy(shard.position);
    halo.position.y += 0.12;
    g.add(halo);
  }

  g.userData.macro2L2 = {
    id: "geo_abyss_ne",
    wiki: "ゲオ深淵（北東）· 溶岩クリスタル",
  };
  return g;
}

const AGE_L2_BUILDERS = {
  yug_coast: propsYugCoast,
  soles_valley: propsSolesValley,
  mitoya_great_tree: propsMitoyaGreatTree,
  geo_abyss_ne: propsGeoAbyssNe,
};

/**
 * AGE 大陸 L2 プロップ
 * @param {THREE.Group} tileRoot
 * @param {string} slotId
 * @param {number} tileW
 * @param {number} tileD
 */
export function appendMoe3dMacro2AgeL2Props(tileRoot, slotId, tileW, tileD) {
  if (!MOE_AGE_MAP_SLOT_IDS.has(slotId)) return null;
  const build = AGE_L2_BUILDERS[slotId];
  if (!build || !tileRoot) return null;
  const props = build(tileW, tileD);
  tileRoot.add(props);
  if (tileRoot.userData.macro2L1) {
    tileRoot.userData.macro2L2 = props.userData.macro2L2;
  }
  return props;
}
