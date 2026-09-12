/**
 * MOE 参考 — 10タイプ別ドラゴン低ポリビルダー（形状それぞれ独立）
 */
import * as THREE from "three";
import { addPart } from "../petGlbShared.mjs";
import {
  addCrystalWingPlates,
  addFinWing,
  addFrontEyes,
  addMembraneWing,
  addQuadrupedLegs,
  addSerpentSegments,
  buildDragonMaterials,
  createDragonBody,
  createDragonRoot,
} from "./dragonShared.mjs";

const PREFIX = {
  phoenix: "PhoenixDragon",
  millennium: "MillenniumDragon",
  desert: "DesertDragon",
  crystal: "CrystalDragon",
  shadow: "ShadowDragon",
  sea: "SeaDragon",
  forest: "ForestDragon",
  ice: "IceDragon",
  ruby: "RubyDragon",
};

/** フェニックス — 細身・炎冠・羽尾（MOE 鳳凰転生系） */
export function buildPhoenixDragon(palette) {
  const prefix = PREFIX.phoenix;
  const { mats, p } = buildDragonMaterials(palette);
  const root = createDragonRoot(prefix, p.id);
  const body = createDragonBody(root, prefix);
  const {
    scale,
    scaleMid,
    scaleDark,
    belly,
    bellyLight,
    horn,
    hornDark,
    wingMem,
    wingMemLight,
    crystal,
    crystalCore,
    beak,
    beakLight,
  } = mats;

  /* 細長い直立胴 */
  addPart(body, new THREE.BoxGeometry(0.38, 0.52, 0.36), scale, 0, 0.58, 0);
  addPart(body, new THREE.BoxGeometry(0.32, 0.38, 0.3), scaleMid, 0, 0.52, 0.02);
  addPart(body, new THREE.BoxGeometry(0.28, 0.22, 0.26), belly, 0, 0.46, 0.04);
  addPart(body, new THREE.BoxGeometry(0.24, 0.12, 0.2), bellyLight, 0, 0.4, 0.05);

  /* 長首 */
  const neck = new THREE.Group();
  neck.position.set(0, 0.78, 0.12);
  body.add(neck);
  addPart(neck, new THREE.BoxGeometry(0.18, 0.28, 0.18), scaleMid, 0, 0.14, 0.08);
  addPart(neck, new THREE.BoxGeometry(0.16, 0.22, 0.16), scale, 0, 0.32, 0.16);

  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, 0.48, 0.22);
  neck.add(head);
  addPart(head, new THREE.BoxGeometry(0.26, 0.22, 0.28), scale, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.14, 0.1, 0.22), beak, 0, -0.02, 0.22);
  addPart(head, new THREE.BoxGeometry(0.11, 0.08, 0.16), beakLight, 0, 0, 0.34);
  addFrontEyes(head, mats, { ex: 0.07, ey: 0.06, ez: 0.14, tag: prefix });

  /* 炎冠 */
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    addPart(
      head,
      new THREE.ConeGeometry(0.035, 0.22 + i * 0.02, 4),
      horn,
      Math.sin(ang) * 0.08,
      0.18 + i * 0.02,
      Math.cos(ang) * 0.06 - 0.04,
      [0.2, ang, 0.15]
    );
  }
  addPart(head, new THREE.ConeGeometry(0.05, 0.32, 4), crystal, 0, 0.28, -0.02, [0.1, 0, 0]);

  /* 大きな炎翼 */
  addMembraneWing(body, mats, -1, prefix, { y: 0.82, span: 1.15 });
  addMembraneWing(body, mats, 1, prefix, { y: 0.82, span: 1.15 });
  for (const sx of [-1, 1]) {
    addPart(body, new THREE.ConeGeometry(0.04, 0.16, 4), wingMemLight, sx * 0.62, 0.95, -0.18, [0.4, 0, sx * 0.3]);
  }

  /* 細脚 */
  for (const [x, z] of [
    [-0.16, 0.14],
    [0.16, 0.14],
    [-0.14, -0.1],
    [0.14, -0.1],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.08, 0.22, 0.08), scaleDark, x, 0.28, z);
    addPart(body, new THREE.BoxGeometry(0.07, 0.18, 0.07), scaleMid, x, 0.14, z + 0.02);
  }

  /* 羽尾ファン */
  for (let i = 0; i < 7; i++) {
    const spread = (i - 3) * 0.12;
    addPart(
      body,
      new THREE.BoxGeometry(0.04, 0.32, 0.14),
      wingMem,
      spread * 0.35,
      0.52 + Math.abs(spread) * 0.08,
      -0.38 - i * 0.04,
      [0.35, spread * 0.4, 0]
    );
    addPart(
      body,
      new THREE.BoxGeometry(0.03, 0.24, 0.1),
      wingMemLight,
      spread * 0.42,
      0.48,
      -0.52 - i * 0.03,
      [0.5, spread * 0.5, 0.05]
    );
  }
  addPart(body, new THREE.OctahedronGeometry(0.06, 0), crystalCore, 0, 0.62, -0.78, [0.3, 0, 0]);

  return root;
}

/** 千年竜 — 東洋蛇形・髭・小翼（MOE 古龍） */
export function buildMillenniumDragon(palette) {
  const prefix = PREFIX.millennium;
  const { mats, p } = buildDragonMaterials(palette);
  const root = createDragonRoot(prefix, p.id);
  const body = createDragonBody(root, prefix);
  const { scale, scaleMid, horn, hornDark, plate, crystal, beak } = mats;

  addSerpentSegments(body, mats, 9, {
    step: 0.24,
    startY: 0.42,
    startZ: 0.35,
    amp: 0.14,
    width: 0.46,
    height: 0.3,
    taper: 0.94,
    spinePlates: true,
  });

  /* 頭 — 扁平・長髭 */
  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, 0.52, 0.62);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.34, 0.2, 0.32), scale, 0, 0, 0.08);
  addPart(head, new THREE.BoxGeometry(0.28, 0.12, 0.38), scaleMid, 0, -0.02, 0.32);
  addPart(head, new THREE.BoxGeometry(0.12, 0.08, 0.24), beak, 0, -0.04, 0.52);
  addFrontEyes(head, mats, { ex: 0.1, ey: 0.04, ez: 0.18, tag: prefix });

  for (const sx of [-1, 1]) {
    addPart(head, new THREE.BoxGeometry(0.02, 0.02, 0.38), horn, sx * 0.14, -0.08, 0.48);
    addPart(head, new THREE.BoxGeometry(0.015, 0.015, 0.28), hornDark, sx * 0.18, -0.1, 0.58);
  }

  /* 枝角 */
  for (const sx of [-1, 1]) {
    addPart(head, new THREE.ConeGeometry(0.035, 0.2, 4), horn, sx * 0.12, 0.16, -0.02, [0.3, 0, sx * 0.4]);
    addPart(head, new THREE.ConeGeometry(0.025, 0.14, 4), hornDark, sx * 0.18, 0.22, 0.02, [0.5, 0, sx * 0.6]);
    addPart(head, new THREE.ConeGeometry(0.02, 0.1, 4), horn, sx * 0.08, 0.24, 0.06, [0.6, 0, sx * -0.3]);
  }

  addPart(head, new THREE.OctahedronGeometry(0.05, 0), crystal, 0, 0.18, 0.12, [0.2, 0.3, 0]);

  /* 第2節に小翼 */
  addFinWing(body, mats, -1, prefix, { x: 0.32, y: 0.48, z: 0.05 });
  addFinWing(body, mats, 1, prefix, { x: 0.32, y: 0.48, z: 0.05 });

  /* 尾先宝珠 */
  addPart(body, new THREE.SphereGeometry(0.08, 8, 8), crystal, 0, 0.22, -1.72);
  addPart(body, new THREE.OctahedronGeometry(0.05, 0), plate, 0, 0.28, -1.78, [0.4, 0, 0]);

  return root;
}

/** 砂漠竜 — 低重心トカゲ・背帆（MOE 砂漠エリア） */
export function buildDesertDragon(palette) {
  const prefix = PREFIX.desert;
  const { mats, p } = buildDragonMaterials(palette);
  const root = createDragonRoot(prefix, p.id);
  const body = createDragonBody(root, prefix);
  const { scale, scaleMid, scaleDark, belly, plate, horn, beak, claw } = mats;

  /* 寝そべり胴 */
  addPart(body, new THREE.BoxGeometry(0.72, 0.18, 0.88), scale, 0, 0.28, 0);
  addPart(body, new THREE.BoxGeometry(0.62, 0.1, 0.72), belly, 0, 0.22, 0.04);
  addPart(body, new THREE.BoxGeometry(0.48, 0.08, 0.52), scaleMid, 0, 0.32, -0.08);

  /* 背帆 */
  for (let i = 0; i < 6; i++) {
    const z = 0.28 - i * 0.18;
    const h = 0.14 + (i === 2 || i === 3 ? 0.08 : 0);
    addPart(body, new THREE.BoxGeometry(0.04, h, 0.16), plate, 0, 0.36 + h * 0.5, z, [0.25, 0, 0]);
    addPart(body, new THREE.BoxGeometry(0.03, h * 0.7, 0.1), horn, 0, 0.38 + h * 0.55, z, [0.35, 0, 0]);
  }

  /* 幅広頭 */
  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, 0.3, 0.52);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.38, 0.16, 0.28), scale, 0, 0, 0.1);
  addPart(head, new THREE.BoxGeometry(0.42, 0.1, 0.2), scaleMid, 0, 0.02, 0.28);
  addPart(head, new THREE.BoxGeometry(0.22, 0.08, 0.18), beak, 0, -0.02, 0.42);
  addFrontEyes(head, mats, { ex: 0.12, ey: 0.04, ez: 0.2, tag: prefix });
  for (const sx of [-1, 1]) {
    addPart(head, new THREE.BoxGeometry(0.08, 0.04, 0.14), scaleDark, sx * 0.18, -0.04, 0.32);
  }

  /* 短足 — 横に広げる */
  for (const [x, z] of [
    [-0.32, 0.28],
    [0.32, 0.28],
    [-0.3, -0.22],
    [0.3, -0.22],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.14, 0.08, 0.12), scaleDark, x, 0.18, z);
    addPart(body, new THREE.BoxGeometry(0.12, 0.06, 0.1), scaleMid, x, 0.14, z + 0.06);
    for (const ox of [-0.03, 0.03]) {
      addPart(body, new THREE.BoxGeometry(0.025, 0.05, 0.025), claw, x + ox, 0.1, z + 0.12);
    }
  }

  /* 小さく畳んだ翼 */
  addMembraneWing(body, mats, -1, prefix, { y: 0.38, z: -0.12, span: 0.55 });
  addMembraneWing(body, mats, 1, prefix, { y: 0.38, z: -0.12, span: 0.55 });

  /* 太尾 */
  addPart(body, new THREE.BoxGeometry(0.14, 0.1, 0.38), scaleDark, 0, 0.26, -0.58);
  addPart(body, new THREE.BoxGeometry(0.1, 0.08, 0.28), scaleMid, 0.02, 0.28, -0.82, [0, 0, 0.08]);

  return root;
}

/** 結晶竜 — 多面体・氷晶棘（MOE 千年結晶竜系） */
export function buildCrystalDragon(palette) {
  const prefix = PREFIX.crystal;
  const { mats, p } = buildDragonMaterials(palette);
  const root = createDragonRoot(prefix, p.id);
  const body = createDragonBody(root, prefix);
  const { scale, crystal, crystalCore, wingBone, plate, beak } = mats;

  /* 胴 — 結晶塊 */
  addPart(body, new THREE.OctahedronGeometry(0.32, 0), crystal, 0, 0.52, 0, [0.2, 0.4, 0.1]);
  addPart(body, new THREE.BoxGeometry(0.4, 0.28, 0.52), scale, 0, 0.48, 0, [0, 0.15, 0]);
  addPart(body, new THREE.OctahedronGeometry(0.12, 0), crystalCore, 0, 0.58, 0.12, [0.3, 0, 0]);

  for (const [x, y, z, ry] of [
    [-0.22, 0.56, 0.08, 0.5],
    [0.22, 0.56, 0.08, -0.5],
    [0, 0.68, -0.06, 0],
    [-0.14, 0.62, -0.18, 0.3],
    [0.14, 0.62, -0.18, -0.3],
  ]) {
    addPart(body, new THREE.OctahedronGeometry(0.08, 0), crystal, x, y, z, [0.4, ry, 0.2]);
  }

  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, 0.58, 0.32);
  body.add(head);
  addPart(head, new THREE.OctahedronGeometry(0.18, 0), crystal, 0, 0.06, 0.1, [0.15, 0, 0]);
  addPart(head, new THREE.BoxGeometry(0.2, 0.16, 0.22), scale, 0, 0, 0.02);
  addPart(head, new THREE.ConeGeometry(0.06, 0.2, 4), beak, 0, -0.02, 0.28, [0.35, 0, 0]);
  addFrontEyes(head, mats, { ex: 0.08, ey: 0.08, ez: 0.12, tag: prefix });

  for (const sx of [-1, 1]) {
    addPart(head, new THREE.ConeGeometry(0.04, 0.28, 4), crystalCore, sx * 0.1, 0.2, -0.02, [0.2, 0, sx * 0.35]);
    addPart(head, new THREE.OctahedronGeometry(0.06, 0), crystal, sx * 0.14, 0.14, 0.08, [0.3, sx * 0.4, 0]);
  }

  addCrystalWingPlates(body, mats, -1, prefix);
  addCrystalWingPlates(body, mats, 1, prefix);

  /* 柱脚 */
  for (const [x, z] of [
    [-0.18, 0.2],
    [0.18, 0.2],
    [-0.18, -0.18],
    [0.18, -0.18],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.08, 0.24, 0.08), wingBone, x, 0.22, z);
    addPart(body, new THREE.OctahedronGeometry(0.05, 0), plate, x, 0.08, z + 0.04, [0.5, 0, 0]);
  }

  /* 尾 — 結晶チェーン */
  for (let i = 0; i < 4; i++) {
    addPart(
      body,
      new THREE.OctahedronGeometry(0.07 - i * 0.01, 0),
      crystal,
      0,
      0.5 - i * 0.02,
      -0.38 - i * 0.2,
      [0.2 + i * 0.1, i * 0.2, 0]
    );
  }

  return root;
}

/** 暗影竜 — 細身・長首・低翼（MOE 闇属性） */
export function buildShadowDragon(palette) {
  const prefix = PREFIX.shadow;
  const { mats, p } = buildDragonMaterials(palette);
  const root = createDragonRoot(prefix, p.id);
  const body = createDragonBody(root, prefix);
  const { scale, scaleMid, scaleDark, scaleDeep, belly, horn, beak } = mats;

  addPart(body, new THREE.BoxGeometry(0.34, 0.26, 0.72), scaleDark, 0, 0.48, -0.06);
  addPart(body, new THREE.BoxGeometry(0.28, 0.14, 0.58), scale, 0, 0.42, 0);
  addPart(body, new THREE.BoxGeometry(0.22, 0.08, 0.4), belly, 0, 0.36, 0.04);

  /* S字首 */
  const neck = new THREE.Group();
  neck.position.set(0, 0.52, 0.22);
  body.add(neck);
  addPart(neck, new THREE.BoxGeometry(0.14, 0.12, 0.18), scaleMid, 0, 0.06, 0.1, [0.35, 0, 0]);
  addPart(neck, new THREE.BoxGeometry(0.12, 0.1, 0.16), scale, 0, 0.18, 0.22, [0.25, 0, 0.08]);
  addPart(neck, new THREE.BoxGeometry(0.11, 0.09, 0.14), scaleMid, 0, 0.28, 0.34, [0.15, 0, 0.05]);

  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, 0.36, 0.44);
  neck.add(head);
  addPart(head, new THREE.BoxGeometry(0.22, 0.14, 0.24), scaleDeep, 0, 0, 0.06);
  addPart(head, new THREE.BoxGeometry(0.1, 0.06, 0.2), beak, 0, -0.02, 0.22);
  addFrontEyes(head, mats, { ex: 0.06, ey: 0.04, ez: 0.12, tag: prefix });
  addPart(head, new THREE.ConeGeometry(0.025, 0.12, 4), horn, 0, 0.1, -0.04, [0.2, 0, 0]);

  /* 低く広い翼 */
  addMembraneWing(body, mats, -1, prefix, { y: 0.52, z: -0.02, span: 1.25 });
  addMembraneWing(body, mats, 1, prefix, { y: 0.52, z: -0.02, span: 1.25 });

  addQuadrupedLegs(body, mats, 0.18, 0.2);

  /* 刃尾 */
  addPart(body, new THREE.BoxGeometry(0.06, 0.06, 0.32), scaleMid, 0, 0.44, -0.52);
  addPart(body, new THREE.BoxGeometry(0.04, 0.04, 0.22), scale, 0.02, 0.46, -0.72, [0, 0, 0.1]);
  addPart(body, new THREE.ConeGeometry(0.05, 0.2, 3), horn, 0.04, 0.48, -0.88, [0.6, 0, 0.15]);

  return root;
}

/** 海竜 — 無足蛇・背びれ・マanta翼（MOE 海ヘビ系） */
export function buildSeaDragon(palette) {
  const prefix = PREFIX.sea;
  const { mats, p } = buildDragonMaterials(palette);
  const root = createDragonRoot(prefix, p.id);
  const body = createDragonBody(root, prefix);
  const { scale, scaleMid, belly, plate, wingMem, beak } = mats;

  addSerpentSegments(body, mats, 8, {
    step: 0.26,
    startY: 0.36,
    startZ: 0.4,
    amp: 0.1,
    width: 0.38,
    height: 0.24,
    taper: 0.93,
  });

  /* 背びれ */
  for (let i = 0; i < 7; i++) {
    const z = 0.32 - i * 0.22;
    addPart(body, new THREE.BoxGeometry(0.03, 0.12 + (i % 2) * 0.04, 0.14), plate, 0, 0.52, z, [0.4, 0, 0]);
  }

  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, 0.4, 0.58);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.28, 0.18, 0.26), scale, 0, 0, 0.06);
  addPart(head, new THREE.BoxGeometry(0.2, 0.12, 0.22), scaleMid, 0, -0.02, 0.24);
  addPart(head, new THREE.BoxGeometry(0.14, 0.08, 0.16), beak, 0, -0.04, 0.4);
  addFrontEyes(head, mats, { ex: 0.09, ey: 0.04, ez: 0.16, tag: prefix });

  /* 頭頂ヒレ */
  addPart(head, new THREE.BoxGeometry(0.04, 0.18, 0.2), plate, 0, 0.14, 0.02, [0.35, 0, 0]);
  addPart(head, new THREE.BoxGeometry(0.03, 0.12, 0.14), wingMem, 0, 0.22, -0.06, [0.5, 0, 0]);

  /* マanta翼 */
  for (const sx of [-1, 1]) {
    const wing = new THREE.Group();
    wing.name = sx < 0 ? `${prefix}WingL` : `${prefix}WingR`;
    wing.position.set(sx * 0.22, 0.44, 0.08);
    body.add(wing);
    addPart(wing, new THREE.BoxGeometry(0.5, 0.02, 0.36), wingMem, sx * 0.26, 0, 0, [0.1, 0, sx * 0.55]);
    addPart(wing, new THREE.BoxGeometry(0.32, 0.015, 0.22), plate, sx * 0.38, 0.02, -0.06, [0.15, 0, sx * 0.65]);
  }

  /* 平尾 */
  addPart(body, new THREE.BoxGeometry(0.28, 0.03, 0.22), wingMem, 0, 0.34, -1.55, [0.2, 0, 0]);
  addPart(body, new THREE.BoxGeometry(0.18, 0.025, 0.14), plate, 0, 0.36, -1.68, [0.25, 0, 0.08]);

  return root;
}

/** 森竜 — 丸体・葉板・枝角（MOE 自然系） */
export function buildForestDragon(palette) {
  const prefix = PREFIX.forest;
  const { mats, p } = buildDragonMaterials(palette);
  const root = createDragonRoot(prefix, p.id);
  const body = createDragonBody(root, prefix);
  const { scale, scaleMid, belly, bellyLight, plate, horn, hornDark, crystal, beak } = mats;

  /* 丸み胴 */
  addPart(body, new THREE.BoxGeometry(0.52, 0.36, 0.56), scale, 0, 0.46, 0);
  addPart(body, new THREE.BoxGeometry(0.44, 0.24, 0.48), scaleMid, 0, 0.42, 0.02);
  addPart(body, new THREE.BoxGeometry(0.38, 0.14, 0.38), belly, 0, 0.36, 0.04);
  addPart(body, new THREE.BoxGeometry(0.32, 0.08, 0.28), bellyLight, 0, 0.32, 0.05);

  /* 葉板 */
  for (const [x, z, ry] of [
    [-0.08, 0.12, 0.4],
    [0.1, -0.02, -0.3],
    [-0.12, -0.14, 0.2],
    [0.06, 0.2, -0.15],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.18, 0.04, 0.12), plate, x, 0.64, z, [0.2, ry, 0.35]);
    addPart(body, new THREE.BoxGeometry(0.12, 0.03, 0.08), hornDark, x + 0.04, 0.67, z, [0.25, ry, 0.4]);
  }

  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, 0.52, 0.34);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.32, 0.26, 0.28), scale, 0, 0.04, 0.06);
  addPart(head, new THREE.BoxGeometry(0.2, 0.14, 0.18), beak, 0, -0.02, 0.24);
  addFrontEyes(head, mats, { ex: 0.09, ey: 0.1, ez: 0.14, tag: prefix });

  /* 枝角 */
  for (const sx of [-1, 1]) {
    addPart(head, new THREE.BoxGeometry(0.04, 0.18, 0.04), horn, sx * 0.1, 0.22, -0.02, [0.2, 0, sx * 0.25]);
    addPart(head, new THREE.BoxGeometry(0.03, 0.12, 0.03), hornDark, sx * 0.16, 0.28, 0.04, [0.35, 0, sx * 0.5]);
    addPart(head, new THREE.BoxGeometry(0.025, 0.08, 0.025), plate, sx * 0.06, 0.26, 0.08, [0.5, 0, sx * -0.2]);
  }

  /* 鼻花 */
  addPart(head, new THREE.SphereGeometry(0.04, 6, 6), crystal, 0, 0.02, 0.36);
  addPart(head, new THREE.BoxGeometry(0.03, 0.06, 0.03), plate, 0, 0.08, 0.38);

  addMembraneWing(body, mats, -1, prefix, { y: 0.58, span: 0.85 });
  addMembraneWing(body, mats, 1, prefix, { y: 0.58, span: 0.85 });
  addQuadrupedLegs(body, mats, 0.2, 0.18);

  /* 葉尾 */
  addPart(body, new THREE.BoxGeometry(0.08, 0.08, 0.2), scaleMid, 0, 0.44, -0.38);
  addPart(body, new THREE.BoxGeometry(0.14, 0.04, 0.1), plate, 0, 0.5, -0.48, [0.4, 0, 0]);
  addPart(body, new THREE.BoxGeometry(0.1, 0.03, 0.08), hornDark, 0.04, 0.52, -0.54, [0.5, 0.2, 0.1]);

  return root;
}

/** 氷竜 — 太躯・氷柱棘（MOE 極寒） */
export function buildIceDragon(palette) {
  const prefix = PREFIX.ice;
  const { mats, p } = buildDragonMaterials(palette);
  const root = createDragonRoot(prefix, p.id);
  const body = createDragonBody(root, prefix);
  const { scale, scaleMid, scaleDark, belly, plate, horn, crystal, crystalCore, beak } = mats;

  addPart(body, new THREE.BoxGeometry(0.58, 0.38, 0.62), scale, 0, 0.48, 0);
  addPart(body, new THREE.BoxGeometry(0.5, 0.22, 0.52), scaleMid, 0, 0.44, 0.02);
  addPart(body, new THREE.BoxGeometry(0.42, 0.12, 0.38), belly, 0, 0.36, 0.04);

  /* 氷柱棘 */
  for (const [x, z, h] of [
    [-0.2, 0.1, 0.18],
    [0.18, 0.05, 0.22],
    [0, -0.12, 0.2],
    [-0.14, -0.2, 0.16],
    [0.16, 0.18, 0.14],
  ]) {
    addPart(body, new THREE.ConeGeometry(0.035, h, 4), crystal, x, 0.62 + h * 0.4, z, [0.15, 0, 0]);
    addPart(body, new THREE.ConeGeometry(0.025, h * 0.7, 4), crystalCore, x, 0.64 + h * 0.45, z, [0.2, 0.3, 0]);
  }

  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, 0.58, 0.36);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.36, 0.28, 0.3), scale, 0, 0.04, 0.04);
  addPart(head, new THREE.BoxGeometry(0.22, 0.12, 0.2), beak, 0, -0.04, 0.24);
  addFrontEyes(head, mats, { ex: 0.1, ey: 0.08, ez: 0.14, tag: prefix });

  for (const sx of [-1, 1]) {
    addPart(head, new THREE.ConeGeometry(0.04, 0.32, 4), crystal, sx * 0.12, 0.24, -0.04, [0.15, 0, sx * 0.2]);
    addPart(head, new THREE.ConeGeometry(0.03, 0.2, 4), horn, sx * 0.06, 0.18, 0.06, [0.25, 0, sx * -0.15]);
  }

  /* 鼻先霜 */
  for (let i = 0; i < 3; i++) {
    addPart(head, new THREE.OctahedronGeometry(0.035, 0), crystalCore, (i - 1) * 0.04, -0.02, 0.36 + i * 0.04, [0.3, 0, 0]);
  }

  addMembraneWing(body, mats, -1, prefix, { y: 0.64, span: 0.75 });
  addMembraneWing(body, mats, 1, prefix, { y: 0.64, span: 0.75 });
  for (const sx of [-1, 1]) {
    addPart(body, new THREE.ConeGeometry(0.03, 0.14, 4), plate, sx * 0.48, 0.72, -0.12, [0.4, 0, sx * 0.25]);
  }

  addQuadrupedLegs(body, mats, 0.24, 0.2);

  addPart(body, new THREE.BoxGeometry(0.1, 0.08, 0.28), scaleDark, 0, 0.46, -0.42);
  addPart(body, new THREE.ConeGeometry(0.06, 0.22, 4), crystal, 0, 0.52, -0.62, [0.55, 0, 0]);

  return root;
}

/** 紅玉竜 — 筋肉質・交差角・尾槌（MOE 攻撃型） */
export function buildRubyDragon(palette) {
  const prefix = PREFIX.ruby;
  const { mats, p } = buildDragonMaterials(palette);
  const root = createDragonRoot(prefix, p.id);
  const body = createDragonBody(root, prefix);
  const {
    scale,
    scaleMid,
    scaleDark,
    scaleDeep,
    belly,
    plate,
    horn,
    hornDark,
    beak,
    claw,
  } = mats;

  /* 幅広肩 */
  addPart(body, new THREE.BoxGeometry(0.64, 0.32, 0.52), scaleDark, 0, 0.56, 0.02);
  addPart(body, new THREE.BoxGeometry(0.52, 0.28, 0.48), scale, 0, 0.5, 0);
  addPart(body, new THREE.BoxGeometry(0.44, 0.16, 0.38), belly, 0, 0.42, 0.04);

  for (const sx of [-1, 1]) {
    addPart(body, new THREE.BoxGeometry(0.18, 0.22, 0.2), scaleMid, sx * 0.28, 0.58, 0.08);
    addPart(body, new THREE.BoxGeometry(0.14, 0.16, 0.14), plate, sx * 0.32, 0.62, 0.12);
  }

  /* 胸装甲 */
  for (let i = 0; i < 3; i++) {
    addPart(body, new THREE.BoxGeometry(0.16, 0.1, 0.12), plate, 0, 0.52 + i * 0.06, 0.2 + i * 0.04);
  }

  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, 0.62, 0.38);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.34, 0.26, 0.3), scale, 0, 0.02, 0.06);
  addPart(head, new THREE.BoxGeometry(0.16, 0.1, 0.24), beak, 0, -0.04, 0.26);
  addFrontEyes(head, mats, { ex: 0.1, ey: 0.06, ez: 0.14, tag: prefix });

  /* 交差刃角 */
  addPart(head, new THREE.ConeGeometry(0.045, 0.28, 4), horn, -0.08, 0.22, 0, [0.3, 0.5, 0.4]);
  addPart(head, new THREE.ConeGeometry(0.045, 0.28, 4), horn, 0.08, 0.22, 0, [0.3, -0.5, -0.4]);
  addPart(head, new THREE.ConeGeometry(0.035, 0.18, 4), hornDark, 0, 0.26, -0.06, [0.2, 0, 0]);

  addMembraneWing(body, mats, -1, prefix, { y: 0.72, span: 1.05 });
  addMembraneWing(body, mats, 1, prefix, { y: 0.72, span: 1.05 });

  /* 太脚 */
  for (const [x, z] of [
    [-0.26, 0.22],
    [0.26, 0.22],
    [-0.24, -0.2],
    [0.24, -0.2],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.14, 0.26, 0.14), scaleDeep, x, 0.3, z);
    addPart(body, new THREE.BoxGeometry(0.12, 0.2, 0.12), scaleDark, x, 0.16, z + 0.02);
    for (const ox of [-0.04, 0, 0.04]) {
      addPart(body, new THREE.BoxGeometry(0.03, 0.08, 0.03), claw, x + ox, 0.06, z + 0.1);
    }
  }

  /* 尾槌 */
  addPart(body, new THREE.BoxGeometry(0.12, 0.1, 0.32), scaleMid, 0, 0.48, -0.42);
  addPart(body, new THREE.BoxGeometry(0.16, 0.14, 0.18), scaleDark, 0, 0.5, -0.62);
  addPart(body, new THREE.BoxGeometry(0.2, 0.16, 0.14), plate, 0, 0.52, -0.76);
  for (const sx of [-1, 1]) {
    addPart(body, new THREE.ConeGeometry(0.04, 0.12, 4), hornDark, sx * 0.1, 0.56, -0.78, [0.5, 0, sx * 0.3]);
  }

  return root;
}

/** @type {Record<string, (palette: Record<string, number>) => THREE.Group>} */
export const DRAGON_TYPE_BUILDERS = {
  phoenix: buildPhoenixDragon,
  millennium: buildMillenniumDragon,
  desert: buildDesertDragon,
  crystal: buildCrystalDragon,
  shadow: buildShadowDragon,
  sea: buildSeaDragon,
  forest: buildForestDragon,
  ice: buildIceDragon,
  ruby: buildRubyDragon,
};
