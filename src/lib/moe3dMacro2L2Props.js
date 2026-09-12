import * as THREE from "three";
import { MACRO2_L1_SLOT_IDS } from "@/lib/moe3dMacro2Constants";

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
}

/** レクスール — 救助ベスト看板 + 角の枝 */
function propsLexurHills(tileW, tileD) {
  const g = propGroup("macro2-l2-lexur_hills");
  const vest = mat(0xf97316, 0.82);
  const horn = mat(0xd4a574, 0.78);
  box(g, 0.5, 0.55, 0.08, vest, tileW * 0.28, 0.55, tileD * 0.18);
  box(g, 0.12, 0.12, 0.06, vest, tileW * 0.28, 0.72, tileD * 0.2);
  for (const sx of [-1, 1]) {
    cyl(g, 0.02, 0.03, 0.45, horn, tileW * 0.28 + sx * 0.14, 0.62, tileD * 0.16, [0.2, 0, sx * 0.35]);
  }
  g.userData.macro2L2 = { id: "lexur_hills", wiki: "レクスール バック · 救助ベスト" };
  return g;
}

/** ミーリム — 海岸花（イーツ） */
function propsMeerimCoast(tileW, tileD) {
  const g = propGroup("macro2-l2-meerim_coast");
  const stem = mat(0x3d7a37);
  const petal = mat(0xff69b4, 0.8);
  for (const [x, z] of [
    [0.22, 0.08],
    [-0.12, 0.24],
  ]) {
    cyl(g, 0.03, 0.04, 0.35, stem, tileW * x, 0.38, tileD * z);
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), petal);
    bloom.position.set(tileW * x, 0.58, tileD * z);
    bloom.castShadow = true;
    g.add(bloom);
  }
  g.userData.macro2L2 = { id: "meerim_coast", wiki: "ミーリム イーツ · 海岸花" };
  return g;
}

/** エルビン — 牧場柵 + 干し草（バイソン） */
function propsElvinValley(tileW, tileD) {
  const g = propGroup("macro2-l2-elvin_valley");
  const wood = mat(0x8b6914, 0.9);
  const hay = mat(0xeab308, 0.92);
  for (let i = 0; i < 4; i++) {
    cyl(g, 0.05, 0.06, 0.7, wood, tileW * (-0.32 + i * 0.08), 0.55, tileD * 0.3);
    if (i < 3) {
      box(g, 0.22, 0.04, 0.04, wood, tileW * (-0.28 + i * 0.08), 0.62, tileD * 0.3);
    }
  }
  box(g, 0.55, 0.35, 0.45, hay, tileW * 0.15, 0.48, tileD * 0.28);
  g.userData.macro2L2 = { id: "elvin_valley", wiki: "エルビン バイソン · 牧場" };
  return g;
}

/** ガルム — 壊れた橋 + コボルト鉱石 */
function propsGarmCorridor(tileW, tileD) {
  const g = propGroup("macro2-l2-garm_corridor");
  const stone = mat(0x78716c, 0.86);
  const ore = mat(0x3b82f6, 0.72, 0.15);
  box(g, tileW * 0.28, 0.12, tileD * 0.14, stone, tileW * 0.12, 0.42, -tileD * 0.08, [0.15, 0.4, 0]);
  box(g, tileW * 0.18, 0.1, tileD * 0.12, stone, -tileW * 0.2, 0.38, tileD * 0.12, [-0.1, -0.25, 0.08]);
  for (let i = 0; i < 3; i++) {
    const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), ore);
    shard.position.set(tileW * (-0.08 + i * 0.06), 0.52, tileD * 0.22);
    shard.castShadow = true;
    g.add(shard);
  }
  g.userData.macro2L2 = { id: "garm_corridor", wiki: "ガルム コボルト · 壊れた橋" };
  return g;
}

/** イルヴァーナ — 狼の爪痕石 + 焚き火 */
function propsIlvanaValley(tileW, tileD) {
  const g = propGroup("macro2-l2-ilvana_valley");
  const rock = mat(0x57534e, 0.9);
  const fire = mat(0xf97316, 0.7, 0.1);
  for (const [x, z, ry] of [
    [0.2, -0.15, 0.3],
    [0.24, -0.1, -0.2],
    [0.16, -0.18, 0.8],
  ]) {
    box(g, 0.35, 0.08, 0.25, rock, tileW * x, 0.38, tileD * z, [0, ry, 0.12]);
  }
  cyl(g, 0.08, 0.12, 0.18, rock, tileW * 0.26, 0.42, tileD * 0.08);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 5), fire);
  flame.position.set(tileW * 0.26, 0.58, tileD * 0.08);
  flame.castShadow = true;
  g.add(flame);
  g.userData.macro2L2 = { id: "ilvana_valley", wiki: "イルヴァーナ ウルフ · 狼爪" };
  return g;
}

/** 砂漠見本 — 蠍尾の杭 + 骨 */
function propsDesertPreview(tileW, tileD) {
  const g = propGroup("macro2-l2-desert_preview");
  const bone = mat(0xf5f5f4, 0.85);
  const tail = mat(0x92400e, 0.88);
  cyl(g, 0.04, 0.05, 0.9, tail, -tileW * 0.15, 0.55, tileD * 0.15);
  const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), mat(0x451a03));
  stinger.position.set(-tileW * 0.15, 1.05, tileD * 0.15);
  stinger.rotation.x = Math.PI;
  g.add(stinger);
  box(g, 0.5, 0.08, 0.12, bone, tileW * 0.1, 0.4, -tileD * 0.2, [0, 0.5, 0.15]);
  g.userData.macro2L2 = { id: "desert_preview", wiki: "デザート スコーピオン · 毒尾" };
  return g;
}

/** スローリム — マンモス骨 + ライオン岩積み */
function propsSlorimPlain(tileW, tileD) {
  const g = propGroup("macro2-l2-slorim_plain");
  const bone = mat(0xe7e5e4, 0.88);
  const rock = mat(0xa3a3a3, 0.9);
  box(g, 0.12, 0.12, 0.7, bone, -tileW * 0.22, 0.45, tileD * 0.05, [0.1, 0.6, 0]);
  box(g, 0.55, 0.1, 0.08, bone, -tileW * 0.18, 0.48, tileD * 0.05);
  for (let i = 0; i < 4; i++) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), rock);
    r.position.set(tileW * (0.2 + i * 0.04), 0.42 + i * 0.06, tileD * (-0.18 + i * 0.03));
    r.castShadow = true;
    g.add(r);
  }
  g.userData.macro2L2 = { id: "slorim_plain", wiki: "スローリム ライオン · マンモス骨" };
  return g;
}

/** イプス — 亀甲碑 + 綿花（コットンイーター） */
function propsIpsCanyon(tileW, tileD) {
  const g = propGroup("macro2-l2-ips_canyon");
  const shell = mat(0x84cc16, 0.82);
  const cotton = mat(0xfafafa, 0.92);
  const stem = mat(0x65a30d);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
    shell
  );
  dome.position.set(-tileW * 0.18, 0.52, tileD * 0.22);
  dome.castShadow = true;
  g.add(dome);
  for (let i = 0; i < 5; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 5), cotton);
    const ang = (i / 5) * Math.PI * 2;
    puff.position.set(tileW * 0.12 + Math.cos(ang) * 0.18, 0.55, tileD * (-0.12 + Math.sin(ang) * 0.12));
    g.add(puff);
    cyl(g, 0.02, 0.025, 0.4, stem, tileW * 0.12 + Math.cos(ang) * 0.12, 0.38, tileD * (-0.12 + Math.sin(ang) * 0.08));
  }
  g.userData.macro2L2 = { id: "ips_canyon", wiki: "ジャイアント トータス · コットン イーター" };
  return g;
}

/** ハティル — デスワーム骨 + ドードルバグ卵 */
function propsHatiilDesert(tileW, tileD) {
  const g = propGroup("macro2-l2-hatiil_desert");
  const bone = mat(0xd6d3d1, 0.86);
  const egg = mat(0xfef08a, 0.78);
  const chitin = mat(0x65a30d, 0.8);
  for (let seg = 0; seg < 4; seg++) {
    cyl(g, 0.14, 0.16, 0.22, bone, tileW * (0.08 + seg * 0.07), 0.48, tileD * (-0.22 + seg * 0.04), [0, seg * 0.3, 0.15]);
  }
  const eggMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), egg);
  eggMesh.scale.set(1, 1.25, 1);
  eggMesh.position.set(tileW * 0.24, 0.48, tileD * 0.12);
  eggMesh.castShadow = true;
  g.add(eggMesh);
  box(g, 0.35, 0.06, 0.35, chitin, tileW * 0.24, 0.36, tileD * 0.12);
  g.userData.macro2L2 = { id: "hatiil_desert", wiki: "デスワーム · ドードルバグ" };
  return g;
}

const L2_BUILDERS = {
  lexur_hills: propsLexurHills,
  meerim_coast: propsMeerimCoast,
  elvin_valley: propsElvinValley,
  garm_corridor: propsGarmCorridor,
  ilvana_valley: propsIlvanaValley,
  desert_preview: propsDesertPreview,
  slorim_plain: propsSlorimPlain,
  ips_canyon: propsIpsCanyon,
  hatiil_desert: propsHatiilDesert,
};

/**
 * L2 プロップをタイル root に追加
 * @param {THREE.Group} tileRoot
 * @param {string} slotId
 * @param {number} tileW
 * @param {number} tileD
 */
export function appendMoe3dMacro2L2Props(tileRoot, slotId, tileW, tileD) {
  const build = L2_BUILDERS[slotId];
  if (!build || !tileRoot) return null;
  const props = build(tileW, tileD);
  tileRoot.add(props);
  if (tileRoot.userData.macro2L1) {
    tileRoot.userData.macro2L2 = props.userData.macro2L2;
  }
  return props;
}

/**
 * terrainGroup 内の macro2 L1 タイルへ L2 を一括追加
 * @param {THREE.Group} terrainGroup
 * @param {number} tileW
 * @param {number} tileD
 */
export function addMoe3dMacro2L2Props(terrainGroup, tileW, tileD) {
  if (!terrainGroup) return;
  for (const slotId of MACRO2_L1_SLOT_IDS) {
    const tile = terrainGroup.children.find(
      (c) => c.userData?.macro2L1?.id === slotId || c.name === `macro2-l1-${slotId}`
    );
    if (tile && !tile.userData.macro2L2) {
      appendMoe3dMacro2L2Props(tile, slotId, tileW, tileD);
    }
  }
}
