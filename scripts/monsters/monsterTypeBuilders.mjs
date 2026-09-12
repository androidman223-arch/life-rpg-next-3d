/**
 * MOE 参考 — 敵16タイプ × 形状別ビルダー（variantIndex 0/1 で2匹目）
 */
import * as THREE from "three";
import { addPart } from "../petGlbShared.mjs";
import { buildStormPunisher } from "./stormPunisherBuilder.mjs";
import { buildChimera } from "./chimeraBuilder.mjs";
import {
  addFrontEyes,
  addHumanoidArms,
  addQuadLegs,
  addSnakeSegments,
  buildMonsterMaterials,
  createMonsterBody,
  createMonsterRoot,
} from "./monsterShared.mjs";

const P = {
  rescueAmazoness: "RescueAmazoness",
  rescueHound: "RescueHound",
  rescueLion: "RescueLion",
  rescueBear: "RescueBear",
  rescueBuck: "RescueBuck",
  gigasBoss: "GigasBoss",
  meerimRat: "MeerimRat",
  meerimEats: "MeerimEats",
  meerimSnake: "MeerimSnake",
  seaSnake: "SeaSnake",
  meerimMoose: "MeerimMoose",
  elvinSpider: "ElvinSpider",
  elvinWolf: "ElvinWolf",
  orcGang: "OrcGang",
  orcMagician: "OrcMagician",
  gigasMammoth: "GigasMammoth",
  sandworm: "Sandworm",
  sandScorpion: "SandScorpion",
  deathworm: "Deathworm",
  doodlebugSmall: "DoodlebugSmall",
  doodlebugMedium: "DoodlebugMedium",
  ipsTurtle: "IpsTurtle",
  ipsGiantTortoise: "IpsGiantTortoise",
  elvinBison: "ElvinBison",
  garmDeer: "GarmDeer",
  ilvanaWolf: "IlvanaWolf",
  desertScorpionMed: "DesertScorpionMed",
  slorimLion: "SlorimLion",
  ipsBass: "IpsBass",
  desertScorpionLarge: "DesertScorpionLarge",
  elanKnight: "ElanKnight",
  salamander: "Salamander",
  riversideCrawler: "RiversideCrawler",
  orvanPappy: "OrvanPappy",
  neokuOrvan: "NeokuOrvan",
  nocker: "Nocker",
};

/** レスクール アマゾネス — 人型女戦士 · 槍と盾 */
export function buildRescueAmazoness(palette, variantIndex = 0) {
  const prefix = P.rescueAmazoness;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.32, 0.42, 0.22), m.body, 0, 0.48, 0);
  addPart(body, new THREE.BoxGeometry(0.28, 0.12, 0.2), m.cloth, 0, 0.28, 0.02);
  addPart(body, new THREE.BoxGeometry(0.14, 0.36, 0.14), m.detail, 0, 0.46, 0.1);

  const head = new THREE.Group();
  head.position.set(0, 0.88, 0.04);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.24, 0.26, 0.24), m.bodyLight, 0, 0, 0);
  addPart(head, new THREE.BoxGeometry(0.08, 0.2, 0.06), m.detail, variantIndex ? 0.1 : -0.1, 0.04, -0.1);
  addFrontEyes(head, m, { ex: 0.07, ey: 0.04, ez: 0.1, tag: prefix });

  addHumanoidArms(body, m, prefix);
  addPart(body, new THREE.BoxGeometry(0.12, 0.38, 0.12), m.bodyDark, -0.24, 0.42, 0);
  addPart(body, new THREE.BoxGeometry(0.14, 0.4, 0.04), m.metal, -0.3, 0.44, 0.06);
  addPart(body, new THREE.BoxGeometry(0.04, 0.72, 0.04), m.metal, 0.28, 0.52, 0.08);
  addPart(body, new THREE.ConeGeometry(0.05, 0.14, 4), m.accent, 0.28, 0.92, 0.08, [0, 0, 0]);

  for (const sx of [-1, 1]) {
    addPart(body, new THREE.BoxGeometry(0.1, 0.34, 0.12), m.cloth, sx * 0.1, 0.18, 0);
    addPart(body, new THREE.BoxGeometry(0.11, 0.06, 0.14), m.bodyDark, sx * 0.1, 0.03, 0.04);
  }
  return root;
}

/** レスクール バウンド — 救助犬 */
export function buildRescueHound(palette, variantIndex = 0) {
  const prefix = P.rescueHound;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.42, 0.26, 0.62), m.body, 0, 0.42, 0);
  addPart(body, new THREE.BoxGeometry(0.34, 0.14, 0.48), m.bodyLight, 0, 0.36, 0.04);
  addPart(body, new THREE.BoxGeometry(0.28, 0.08, 0.22), m.accent, 0, 0.48, 0.08);

  const head = new THREE.Group();
  head.position.set(0, 0.5, 0.36);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.26, 0.22, 0.28), m.body, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.14, 0.12, 0.18), m.bodyLight, 0, -0.02, 0.2);
  addPart(head, new THREE.BoxGeometry(0.08, 0.06, 0.06), m.bodyDark, 0, 0.02, 0.3);
  addFrontEyes(head, m, { ex: 0.08, ey: 0.06, ez: 0.16, tag: prefix });

  for (const [sx, tilt] of [
    [-1, variantIndex ? 0.2 : 0.45],
    [1, variantIndex ? 0.2 : 0.45],
  ]) {
    addPart(head, new THREE.BoxGeometry(0.06, variantIndex ? 0.1 : 0.16, 0.04), m.bodyDark, sx * 0.12, 0.12, -0.02, [tilt, 0, 0]);
  }

  addPart(body, new THREE.BoxGeometry(0.12, 0.1, 0.18), m.body, 0, 0.44, -0.34);
  addPart(body, new THREE.BoxGeometry(0.08, 0.08, 0.14), m.bodyDark, 0.02, 0.46, -0.48, [0, 0, 0.15]);
  addQuadLegs(body, m, { spread: 0.16, frontZ: 0.2, backZ: -0.22 });
  return root;
}

/** レスクール ライオン — 救助ベスト付きライオン */
export function buildRescueLion(palette, variantIndex = 0) {
  const prefix = P.rescueLion;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.48, 0.3, 0.68), m.body, 0, 0.44, 0);
  addPart(body, new THREE.BoxGeometry(0.38, 0.14, 0.52), m.bodyLight, 0, 0.36, 0.04);
  addPart(body, new THREE.BoxGeometry(0.36, 0.1, 0.28), m.accent, 0, 0.48, 0.06);

  const head = new THREE.Group();
  head.position.set(0, 0.52, 0.4);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.3, 0.26, 0.3), m.body, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.16, 0.12, 0.16), m.bodyLight, 0, -0.02, 0.2);
  addFrontEyes(head, m, { ex: 0.09, ey: 0.06, ez: 0.14, tag: prefix });

  if (!variantIndex) {
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      addPart(head, new THREE.BoxGeometry(0.04, 0.14, 0.04), m.detail, Math.sin(ang) * 0.16, 0.08, Math.cos(ang) * 0.1 - 0.06, [0.2, ang, 0]);
    }
  } else {
    addPart(head, new THREE.BoxGeometry(0.22, 0.06, 0.18), m.detail, 0, 0.1, -0.04);
  }

  addPart(body, new THREE.BoxGeometry(0.1, 0.08, 0.24), m.bodyDark, 0, 0.42, -0.4);
  addQuadLegs(body, m, { spread: 0.2, frontZ: 0.24, backZ: -0.24 });
  return root;
}

/** レスクール ベア（何か枠）— 救助クマ */
export function buildRescueBear(palette, variantIndex = 0) {
  const prefix = P.rescueBear;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.52, 0.42, 0.48), m.body, 0, 0.46, 0);
  addPart(body, new THREE.BoxGeometry(0.4, 0.18, 0.36), m.bodyLight, 0, 0.38, 0.04);
  addPart(body, new THREE.BoxGeometry(0.22, 0.16, 0.18), m.accent, 0, 0.52, 0.1);

  const head = new THREE.Group();
  head.position.set(0, 0.68, 0.22);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.32, 0.28, 0.28), m.body, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.2, 0.14, 0.14), m.bodyLight, 0, -0.04, 0.16);
  addFrontEyes(head, m, { ex: 0.1, ey: 0.04, ez: 0.12, tag: prefix });
  for (const sx of [-1, 1]) {
    addPart(head, new THREE.SphereGeometry(0.07, 6, 6), m.bodyDark, sx * 0.18, 0.12, -0.02);
  }
  addPart(head, new THREE.BoxGeometry(0.08, 0.06, 0.04), m.detail, 0, 0.08, 0.18);

  addPart(body, new THREE.BoxGeometry(0.14, 0.12, 0.12), m.bodyDark, variantIndex ? -0.28 : 0.28, 0.58, 0.02);
  addQuadLegs(body, m, { spread: 0.22, frontZ: 0.16, backZ: -0.16 });
  return root;
}

/** レスクール バック — 救助ベスト付き鹿 · 角 */
export function buildRescueBuck(palette, variantIndex = 0) {
  const prefix = P.rescueBuck;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.38, 0.28, 0.58), m.body, 0, 0.5, 0);
  addPart(body, new THREE.BoxGeometry(0.3, 0.12, 0.44), m.bodyLight, 0, 0.44, 0.04);
  addPart(body, new THREE.BoxGeometry(0.26, 0.08, 0.2), m.accent, 0, 0.52, 0.06);

  const head = new THREE.Group();
  head.position.set(0, 0.58, 0.32);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.22, 0.2, 0.24), m.body, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.14, 0.1, 0.16), m.bodyLight, 0, -0.02, 0.16);
  addPart(head, new THREE.BoxGeometry(0.06, 0.05, 0.05), m.bodyDark, 0, 0.02, 0.24);
  addFrontEyes(head, m, { ex: 0.07, ey: 0.05, ez: 0.12, tag: prefix });

  if (variantIndex) {
    addPart(head, new THREE.ConeGeometry(0.025, 0.18, 4), m.horn, -0.08, 0.16, -0.02, [0.1, 0, 0.4]);
    addPart(head, new THREE.ConeGeometry(0.025, 0.18, 4), m.horn, 0.08, 0.16, -0.02, [0.1, 0, -0.4]);
  } else {
    for (const sx of [-1, 1]) {
      addPart(
        head,
        new THREE.BoxGeometry(0.03, 0.2, 0.03),
        m.horn,
        sx * 0.1,
        0.18,
        -0.04,
        [0.15, 0, sx * 0.45]
      );
      addPart(
        head,
        new THREE.BoxGeometry(0.025, 0.12, 0.025),
        m.detail,
        sx * 0.06,
        0.22,
        0.02,
        [0.35, 0, sx * -0.3]
      );
    }
  }

  addPart(body, new THREE.BoxGeometry(0.08, 0.06, 0.12), m.bodyDark, 0, 0.48, -0.3);
  addQuadLegs(body, m, { spread: 0.14, frontZ: 0.2, backZ: -0.2, legH: 0.38 });
  return root;
}

/** ギガース — MOE レクスールヒルズ系 · 岩肌の超大型人型 */
export function buildGigasBoss(palette, variantIndex = 0) {
  const prefix = P.gigasBoss;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.68, 0.54, 0.4), m.body, 0, 0.5, 0);
  addPart(body, new THREE.BoxGeometry(0.56, 0.2, 0.34), m.bodyLight, 0, 0.42, 0.03);
  addPart(body, new THREE.BoxGeometry(0.86, 0.24, 0.36), m.bodyDark, 0, 0.68, -0.02);
  addPart(body, new THREE.BoxGeometry(0.44, 0.16, 0.28), m.metal, 0, 0.56, 0.08);
  for (const [x, z] of [
    [-0.12, 0.12],
    [0.12, 0.1],
    [0, 0.18],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.14, 0.12, 0.1), m.metal, x, 0.52, z);
  }

  for (const sx of [-1, 1]) {
    addPart(body, new THREE.BoxGeometry(0.26, 0.22, 0.24), m.metal, sx * 0.42, 0.72, 0);
    addPart(body, new THREE.BoxGeometry(0.18, 0.14, 0.18), m.bodyDark, sx * 0.38, 0.66, -0.06);
  }

  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, 0.86, 0.14);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.28, 0.26, 0.28), m.bodyDark, 0, 0, 0);
  addPart(head, new THREE.BoxGeometry(0.18, 0.1, 0.14), m.body, 0, -0.04, 0.14);
  addPart(head, new THREE.BoxGeometry(0.12, 0.08, 0.1), m.bodyLight, 0, -0.06, 0.22);
  addFrontEyes(head, m, { ex: 0.08, ey: 0.04, ez: 0.12, tag: prefix });

  if (variantIndex) {
    addPart(head, new THREE.ConeGeometry(0.055, 0.28, 4), m.horn, -0.11, 0.18, -0.06, [0.15, 0, 0.35]);
    addPart(head, new THREE.ConeGeometry(0.055, 0.28, 4), m.horn, 0.11, 0.18, -0.06, [0.15, 0, -0.35]);
    addPart(head, new THREE.BoxGeometry(0.08, 0.06, 0.06), m.accent, 0, 0.12, 0.1);
  } else {
    addPart(head, new THREE.BoxGeometry(0.32, 0.1, 0.24), m.metal, 0, 0.16, -0.04);
    addPart(head, new THREE.BoxGeometry(0.08, 0.14, 0.06), m.detail, 0, 0.08, 0.12);
  }

  addHumanoidArms(body, m, prefix, 0.4);
  if (variantIndex) {
    addPart(body, new THREE.BoxGeometry(0.16, 0.52, 0.12), m.metal, 0.42, 0.44, 0.1);
    addPart(body, new THREE.BoxGeometry(0.22, 0.14, 0.28), m.metal, 0.48, 0.74, 0.12, [0.55, 0, 0.08]);
    addPart(body, new THREE.BoxGeometry(0.1, 0.1, 0.1), m.accent, 0.52, 0.82, 0.14);
  } else {
    addPart(body, new THREE.BoxGeometry(0.18, 0.56, 0.16), m.detail, 0.4, 0.42, 0.08);
    addPart(body, new THREE.BoxGeometry(0.26, 0.14, 0.26), m.metal, 0.46, 0.8, 0.1);
    addPart(body, new THREE.CylinderGeometry(0.06, 0.08, 0.12, 5), m.metal, 0.48, 0.9, 0.1);
  }

  for (const sx of [-1, 1]) {
    addPart(body, new THREE.BoxGeometry(0.2, 0.52, 0.2), m.bodyDark, sx * 0.18, 0.26, 0);
    addPart(body, new THREE.BoxGeometry(0.22, 0.1, 0.26), m.cloth, sx * 0.18, 0.05, 0.04);
    addPart(body, new THREE.BoxGeometry(0.24, 0.06, 0.28), m.body, sx * 0.18, 0.02, 0.06);
  }
  return root;
}

/** ミーリム ラット */
export function buildMeerimRat(palette, variantIndex = 0) {
  const prefix = P.meerimRat;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  const fat = variantIndex ? 1.15 : 0.92;
  addPart(body, new THREE.BoxGeometry(0.28 * fat, 0.2 * fat, 0.38 * fat), m.body, 0, 0.28, 0);
  addPart(body, new THREE.BoxGeometry(0.2, 0.12, 0.22), m.bodyLight, 0, 0.22, 0.1);

  const head = new THREE.Group();
  head.position.set(0, 0.32, 0.24);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.22, 0.18, 0.22), m.body, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.12, 0.1, 0.14), m.bodyLight, 0, -0.02, 0.16);
  addFrontEyes(head, m, { ex: 0.07, ey: 0.04, ez: 0.1, tag: prefix });
  addPart(head, new THREE.ConeGeometry(0.02, 0.08, 4), m.detail, -0.04, -0.02, 0.22, [0.4, -0.2, 0]);
  addPart(head, new THREE.ConeGeometry(0.02, 0.08, 4), m.detail, 0.04, -0.02, 0.22, [0.4, 0.2, 0]);

  for (const sx of [-1, 1]) {
    addPart(head, new THREE.ConeGeometry(0.025, 0.12, 4), m.bodyDark, sx * 0.12, 0.1, -0.02, [0.3, 0, sx * 0.4]);
  }

  addPart(body, new THREE.BoxGeometry(0.06, 0.06, 0.28), m.bodyDark, 0, 0.3, -0.28);
  for (const [x, z] of [
    [-0.12, 0.12],
    [0.12, 0.12],
    [-0.1, -0.1],
    [0.1, -0.1],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.04, 0.1, 0.04), m.bodyDark, x, 0.08, z);
  }
  return root;
}

/** ミーリム イーツ — 海岸の花植物 */
export function buildMeerimEats(palette, variantIndex = 0) {
  const prefix = P.meerimEats;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.CylinderGeometry(0.06, 0.08, 0.22, 6), m.bodyDark, 0, 0.12, 0);
  for (const sx of [-1, 1]) {
    addPart(
      body,
      new THREE.BoxGeometry(0.14, 0.04, 0.08),
      m.detail,
      sx * 0.12,
      0.08,
      sx * 0.04,
      [0.12, sx * 0.35, 0.08]
    );
  }

  const bloom = new THREE.Group();
  bloom.position.set(0, 0.28, 0);
  body.add(bloom);
  addPart(bloom, new THREE.SphereGeometry(0.14, 8, 8), m.bodyLight, 0, 0.06, 0);
  addPart(bloom, new THREE.SphereGeometry(0.08, 8, 8), m.accent, 0, 0.08, 0.02);
  addFrontEyes(bloom, m, { ex: 0.05, ey: 0.08, ez: 0.1, tag: prefix });

  const petalCount = variantIndex ? 5 : 6;
  for (let i = 0; i < petalCount; i++) {
    const ang = (i / petalCount) * Math.PI * 2;
    addPart(
      bloom,
      new THREE.ConeGeometry(0.05, 0.14, 4),
      i % 2 ? m.body : m.cloth ?? m.bodyLight,
      Math.sin(ang) * 0.12,
      0.04,
      Math.cos(ang) * 0.12,
      [0.55, ang, 0.1]
    );
  }

  if (variantIndex) {
    addPart(bloom, new THREE.SphereGeometry(0.04, 6, 6), m.detail, 0, 0.14, 0.04);
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2 + 0.4;
      addPart(
        bloom,
        new THREE.ConeGeometry(0.028, 0.1, 4),
        m.accent,
        Math.sin(ang) * 0.08,
        0.1,
        Math.cos(ang) * 0.08,
        [0.4, ang, 0.15]
      );
    }
  } else {
    addPart(bloom, new THREE.TorusGeometry(0.1, 0.018, 4, 10), m.detail, 0, 0.02, 0, [Math.PI / 2, 0, 0]);
  }

  return root;
}

/** ミーリム スネーク */
export function buildMeerimSnake(palette, variantIndex = 0) {
  const prefix = P.meerimSnake;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  if (variantIndex) {
    addSnakeSegments(body, m, 7, { step: 0.18, startY: 0.22, width: 0.2, taper: 0.95 });
  } else {
    addSnakeSegments(body, m, 5, { step: 0.16, startY: 0.32, width: 0.24, taper: 0.94, rise: 0.04 });
    addPart(body, new THREE.BoxGeometry(0.26, 0.18, 0.16), m.body, 0, 0.38, 0.28);
  }

  const head = new THREE.Group();
  head.position.set(0, variantIndex ? 0.22 : 0.48, variantIndex ? 0.1 : 0.42);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.2, 0.14, 0.24), m.body, 0, 0, 0.06);
  addPart(head, new THREE.BoxGeometry(0.1, 0.06, 0.16), m.bodyLight, 0, -0.02, 0.2);
  addFrontEyes(head, m, { ex: 0.06, ey: 0.04, ez: 0.12, tag: prefix });
  addPart(head, new THREE.ConeGeometry(0.02, 0.06, 4), m.detail, 0, -0.03, 0.28, [0.5, 0, 0]);
  return root;
}

/** 海ヘビ */
export function buildSeaSnake(palette, variantIndex = 0) {
  const prefix = P.seaSnake;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addSnakeSegments(body, m, variantIndex ? 9 : 7, {
    step: 0.2,
    startY: 0.26,
    width: variantIndex ? 0.18 : 0.22,
    taper: 0.95,
    fins: true,
  });

  const head = new THREE.Group();
  head.position.set(0, 0.28, 0.38);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.22, 0.16, 0.26), m.body, 0, 0, 0.06);
  addPart(head, new THREE.BoxGeometry(0.14, 0.08, 0.18), m.bodyLight, 0, -0.02, 0.2);
  addFrontEyes(head, m, { ex: 0.07, ey: 0.04, ez: 0.12, tag: prefix });
  addPart(head, new THREE.BoxGeometry(0.04, 0.14, 0.16), m.accent, 0, 0.12, -0.02, [0.35, 0, 0]);

  if (variantIndex) {
    for (let i = 0; i < 3; i++) {
      addPart(body, new THREE.OctahedronGeometry(0.04, 0), m.detail, (i - 1) * 0.06, 0.34, -0.2 - i * 0.18, [0.2, 0, 0]);
    }
  }
  return root;
}

/** ミーリム ムース */
export function buildMeerimMoose(palette, variantIndex = 0) {
  const prefix = P.meerimMoose;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.46, 0.34, 0.62), m.body, 0, 0.52, 0);
  addPart(body, new THREE.BoxGeometry(0.36, 0.16, 0.48), m.bodyLight, 0, 0.44, 0.04);
  addPart(body, new THREE.BoxGeometry(0.28, 0.28, 0.24), m.bodyDark, 0, 0.72, 0.18);

  const head = new THREE.Group();
  head.position.set(0, 0.78, 0.38);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.24, 0.22, 0.28), m.body, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.16, 0.12, 0.16), m.bodyLight, 0, -0.04, 0.18);
  addFrontEyes(head, m, { ex: 0.08, ey: 0.04, ez: 0.12, tag: prefix });

  if (variantIndex) {
    addPart(head, new THREE.BoxGeometry(0.22, 0.04, 0.08), m.horn, -0.1, 0.18, -0.02);
    addPart(head, new THREE.BoxGeometry(0.08, 0.04, 0.12), m.horn, -0.02, 0.18, -0.06);
  } else {
    for (const sx of [-1, 1]) {
      addPart(head, new THREE.BoxGeometry(0.04, 0.22, 0.04), m.horn, sx * 0.18, 0.2, -0.04, [0.15, 0, sx * 0.35]);
      addPart(head, new THREE.BoxGeometry(0.04, 0.16, 0.04), m.horn, sx * 0.1, 0.24, 0.02, [0.35, 0, sx * -0.25]);
    }
  }

  addQuadLegs(body, m, { spread: 0.2, frontZ: 0.22, backZ: -0.22 });
  return root;
}

/** エルビン スパイダー */
export function buildElvinSpider(palette, variantIndex = 0) {
  const prefix = P.elvinSpider;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  if (variantIndex) {
    addPart(body, new THREE.BoxGeometry(0.22, 0.14, 0.42), m.body, 0, 0.32, 0);
    addPart(body, new THREE.BoxGeometry(0.16, 0.1, 0.28), m.bodyDark, 0, 0.36, -0.12);
  } else {
    addPart(body, new THREE.SphereGeometry(0.22, 8, 8), m.body, 0, 0.34, 0);
    addPart(body, new THREE.SphereGeometry(0.14, 6, 6), m.bodyDark, 0, 0.38, -0.08);
  }

  const head = new THREE.Group();
  head.position.set(0, 0.28, 0.22);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.18, 0.12, 0.16), m.bodyDark, 0, 0, 0.04);
  addFrontEyes(head, m, { ex: 0.06, ey: 0.04, ez: 0.08, tag: prefix });
  for (const sx of [-1, 1]) {
    addPart(head, new THREE.ConeGeometry(0.015, 0.08, 4), m.detail, sx * 0.04, -0.02, 0.12, [0.5, sx * 0.3, 0]);
  }

  for (let i = 0; i < 4; i++) {
    for (const sx of [-1, 1]) {
      const ang = (i / 4) * Math.PI * 0.5 + (sx < 0 ? Math.PI : 0);
      addPart(
        body,
        new THREE.BoxGeometry(0.04, 0.04, 0.32),
        m.bodyDark,
        Math.sin(ang) * 0.28,
        0.12,
        Math.cos(ang) * 0.28,
        [0, ang, 0.35]
      );
    }
  }
  return root;
}

/** エルビン ウルフ */
export function buildElvinWolf(palette, variantIndex = 0) {
  const prefix = P.elvinWolf;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  if (variantIndex) {
    addPart(body, new THREE.BoxGeometry(0.34, 0.48, 0.28), m.body, 0, 0.52, 0);
    addPart(body, new THREE.BoxGeometry(0.28, 0.16, 0.22), m.bodyLight, 0, 0.38, 0.04);
  } else {
    addPart(body, new THREE.BoxGeometry(0.42, 0.26, 0.68), m.body, 0, 0.4, 0);
    addPart(body, new THREE.BoxGeometry(0.34, 0.12, 0.52), m.bodyLight, 0, 0.34, 0.04);
  }

  const head = new THREE.Group();
  head.position.set(0, variantIndex ? 0.88 : 0.48, variantIndex ? 0.08 : 0.38);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.24, 0.22, 0.28), m.body, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.12, 0.1, 0.2), m.bodyLight, 0, -0.02, 0.18);
  addFrontEyes(head, m, { ex: 0.07, ey: 0.05, ez: 0.12, tag: prefix });
  addPart(head, new THREE.ConeGeometry(0.03, 0.1, 4), m.bodyDark, 0, 0.02, 0.28, [0.35, 0, 0]);
  for (const sx of [-1, 1]) {
    addPart(head, new THREE.ConeGeometry(0.025, 0.14, 4), m.bodyDark, sx * 0.1, 0.14, -0.02, [0.25, 0, sx * 0.2]);
  }

  if (!variantIndex) {
    addQuadLegs(body, m, { spread: 0.18, frontZ: 0.22, backZ: -0.24 });
    addPart(body, new THREE.BoxGeometry(0.08, 0.08, 0.22), m.bodyDark, 0, 0.38, -0.42);
  } else {
    addPart(body, new THREE.BoxGeometry(0.12, 0.36, 0.12), m.bodyDark, -0.14, 0.22, 0);
    addPart(body, new THREE.BoxGeometry(0.12, 0.36, 0.12), m.bodyDark, 0.14, 0.22, 0);
  }
  return root;
}

/** オーク ギャング */
export function buildOrcGang(palette, variantIndex = 0) {
  const prefix = P.orcGang;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.38, 0.44, 0.26), m.body, 0, 0.5, 0);
  addPart(body, new THREE.BoxGeometry(0.34, 0.14, 0.24), m.cloth, 0, 0.3, 0.02);

  const head = new THREE.Group();
  head.position.set(0, 0.86, 0.04);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.3, 0.28, 0.28), m.body, 0, 0, 0);
  addPart(head, new THREE.BoxGeometry(0.16, 0.12, 0.14), m.bodyLight, 0, -0.04, 0.14);
  addPart(head, new THREE.BoxGeometry(0.12, 0.1, 0.08), m.bodyDark, 0, -0.02, 0.2);
  addFrontEyes(head, m, { ex: 0.09, ey: 0.04, ez: 0.12, tag: prefix });

  addHumanoidArms(body, m, prefix);
  if (variantIndex) {
    addPart(body, new THREE.BoxGeometry(0.08, 0.08, 0.08), m.metal, 0.32, 0.62, 0.08);
    addPart(body, new THREE.BoxGeometry(0.08, 0.08, 0.08), m.metal, 0.38, 0.56, 0.1);
  } else {
    addPart(body, new THREE.BoxGeometry(0.1, 0.42, 0.1), m.detail, 0.32, 0.48, 0.06);
    addPart(body, new THREE.BoxGeometry(0.14, 0.12, 0.14), m.detail, 0.36, 0.72, 0.08);
  }

  for (const sx of [-1, 1]) {
    addPart(body, new THREE.BoxGeometry(0.12, 0.36, 0.12), m.bodyDark, sx * 0.1, 0.18, 0);
    addPart(body, new THREE.BoxGeometry(0.13, 0.07, 0.15), m.cloth, sx * 0.1, 0.03, 0.04);
  }
  return root;
}

/** オーク マジシャン */
export function buildOrcMagician(palette, variantIndex = 0) {
  const prefix = P.orcMagician;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.34, 0.42, 0.24), m.cloth, 0, 0.48, 0);
  addPart(body, new THREE.BoxGeometry(0.28, 0.1, 0.2), m.detail, 0, 0.3, 0.02);

  const head = new THREE.Group();
  head.position.set(0, 0.84, 0.04);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.28, 0.26, 0.26), m.body, 0, 0, 0);
  addPart(head, new THREE.BoxGeometry(0.14, 0.1, 0.12), m.bodyLight, 0, -0.04, 0.14);
  addFrontEyes(head, m, { ex: 0.08, ey: 0.04, ez: 0.12, tag: prefix });
  addPart(head, new THREE.BoxGeometry(0.24, 0.06, 0.2), m.cloth, 0, 0.16, -0.02);

  addHumanoidArms(body, m, prefix);
  if (variantIndex) {
    addPart(body, new THREE.BoxGeometry(0.12, 0.08, 0.16), m.detail, 0.3, 0.72, 0.06);
    addPart(body, new THREE.SphereGeometry(0.06, 8, 8), m.accent, 0.34, 0.82, 0.08);
  } else {
    addPart(body, new THREE.BoxGeometry(0.04, 0.68, 0.04), m.detail, 0.28, 0.52, 0.08);
    addPart(body, new THREE.OctahedronGeometry(0.06, 0), m.accent, 0.28, 0.92, 0.08, [0.2, 0.4, 0]);
  }

  for (const sx of [-1, 1]) {
    addPart(body, new THREE.BoxGeometry(0.1, 0.34, 0.1), m.bodyDark, sx * 0.1, 0.18, 0);
  }
  return root;
}

/** ギガース マンモス — MOE スローリム平原 · 超巨大踏みつけ型 */
export function buildGigasMammoth(palette, variantIndex = 0) {
  const prefix = P.gigasMammoth;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.92, 0.58, 1.08), m.body, 0, 0.56, 0);
  addPart(body, new THREE.BoxGeometry(0.72, 0.28, 0.78), m.bodyLight, 0, 0.44, 0.05);
  addPart(body, new THREE.BoxGeometry(0.52, 0.32, 0.42), m.bodyDark, 0, 0.78, -0.12);
  if (!variantIndex) {
    for (let i = 0; i < 9; i++) {
      addPart(
        body,
        new THREE.BoxGeometry(0.07, 0.16 + (i % 2) * 0.04, 0.07),
        m.detail,
        (i % 2 ? 0.22 : -0.22),
        0.76 - (i % 3) * 0.05,
        -0.08 - i * 0.09,
        [0.25, 0, (i % 3) * 0.08]
      );
    }
  } else {
    for (const [x, z] of [
      [-0.18, 0.1],
      [0.16, -0.05],
      [0, -0.2],
    ]) {
      addPart(body, new THREE.OctahedronGeometry(0.06, 0), m.accent, x, 0.74, z, [0.2, 0.3, 0]);
    }
  }

  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, 0.62, 0.58);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.38, 0.32, 0.36), m.body, 0, 0.04, 0.04);
  addPart(head, new THREE.BoxGeometry(0.28, 0.2, 0.32), m.bodyLight, 0, -0.06, 0.28);
  addPart(head, new THREE.BoxGeometry(0.16, 0.12, 0.22), m.body, 0, -0.1, 0.48);
  addFrontEyes(head, m, { ex: 0.11, ey: 0.06, ez: 0.18, tag: prefix });

  for (const sx of [-1, 1]) {
    addPart(
      head,
      new THREE.CylinderGeometry(0.05, 0.08, variantIndex ? 0.62 : 0.54, 6),
      m.horn,
      sx * 0.14,
      -0.12,
      0.36,
      [0.75, sx * 0.25, sx * 0.35]
    );
    addPart(
      head,
      new THREE.CylinderGeometry(0.035, 0.05, 0.28, 5),
      m.horn,
      sx * 0.08,
      -0.08,
      0.52,
      [0.85, sx * 0.15, sx * 0.2]
    );
  }

  addPart(body, new THREE.BoxGeometry(0.18, 0.14, 0.28), m.bodyDark, 0, 0.5, -0.58);
  addPart(body, new THREE.BoxGeometry(0.12, 0.1, 0.2), m.body, 0.02, 0.52, -0.72, [0, 0, 0.1]);

  for (const [x, z] of [
    [-0.3, 0.34],
    [0.3, 0.34],
    [-0.28, -0.34],
    [0.28, -0.34],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.18, 0.36, 0.18), m.bodyDark, x, 0.24, z);
    addPart(body, new THREE.BoxGeometry(0.3, 0.1, 0.34), m.detail, x, 0.05, z + 0.02);
    addPart(body, new THREE.BoxGeometry(0.26, 0.04, 0.28), m.bodyLight, x, 0.02, z + 0.04);
  }
  return root;
}

/** サンドワーム */
export function buildSandworm(palette, variantIndex = 0) {
  const prefix = P.sandworm;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.CylinderGeometry(0.28, 0.34, 0.12, 8), m.bodyDark, 0, 0.06, 0);
  addSnakeSegments(body, m, variantIndex ? 6 : 5, {
    step: 0.22,
    startY: 0.24,
    width: variantIndex ? 0.32 : 0.28,
    taper: 0.97,
  });

  const head = new THREE.Group();
  head.position.set(0, 0.32, 0.42);
  body.add(head);
  addPart(head, new THREE.ConeGeometry(0.2, 0.28, 6), m.body, 0, 0.04, 0.12, [0.5, 0, 0]);
  addPart(head, new THREE.BoxGeometry(0.24, 0.08, 0.12), m.bodyLight, 0, -0.02, 0.24);
  addFrontEyes(head, m, { ex: 0.1, ey: 0.06, ez: 0.08, tag: prefix });

  if (variantIndex) {
    for (const sx of [-1, 1]) {
      addPart(head, new THREE.ConeGeometry(0.04, 0.12, 4), m.detail, sx * 0.14, 0.02, 0.18, [0.4, 0, sx * 0.3]);
    }
  }
  return root;
}

/**
 * デスワーム — ハティル砂漠 · 巨大环节虫（サンドワームより大型）
 * variant 0: 赤褐 / 1: 紫黒
 */
export function buildDeathworm(palette, variantIndex = 0) {
  const prefix = P.deathworm;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  const segCount = variantIndex ? 10 : 9;
  const baseW = variantIndex ? 0.44 : 0.4;
  addPart(body, new THREE.CylinderGeometry(baseW * 0.9, baseW, 0.14, 8), m.bodyDark, 0, 0.07, 0.08);

  let w = baseW;
  let y = 0.28;
  let z = 0.2;
  const step = 0.24;
  for (let i = 0; i < segCount; i++) {
    const matUse = i % 2 === 0 ? m.body : m.bodyDark;
    addPart(body, new THREE.BoxGeometry(w, w * 0.82, step), matUse, 0, y, z);
    if (i % 3 === 1) {
      addPart(
        body,
        new THREE.BoxGeometry(w * 0.72, w * 0.28, step * 0.55),
        m.bodyLight,
        0,
        y - w * 0.38,
        z + 0.02
      );
    }
    for (const sx of [-1, 1]) {
      addPart(
        body,
        new THREE.ConeGeometry(w * 0.12, w * 0.35, 4),
        m.detail,
        sx * w * 0.62,
        y,
        z,
        [0, 0, sx * (variantIndex ? 0.55 : 0.45)]
      );
    }
    y += 0.018;
    z -= step;
    w *= 0.975;
  }

  const head = new THREE.Group();
  head.position.set(0, y + 0.06, z + 0.38);
  body.add(head);
  addPart(head, new THREE.ConeGeometry(w * 1.1, w * 1.4, 7), m.body, 0, 0.08, 0.18, [0.45, 0, 0]);
  addPart(head, new THREE.BoxGeometry(w * 1.35, w * 0.35, w * 0.55), m.bodyDark, 0, -0.02, 0.32);
  addPart(head, new THREE.BoxGeometry(w * 0.5, w * 0.22, w * 0.35), m.bodyLight, 0, 0.02, 0.48);

  for (const sx of [-1, 1]) {
    addPart(
      head,
      new THREE.ConeGeometry(w * 0.18, w * 0.55, 4),
      m.accent,
      sx * w * 0.55,
      -0.04,
      0.42,
      [0.35, sx * 0.25, 0.15]
    );
    addPart(
      head,
      new THREE.BoxGeometry(w * 0.14, w * 0.08, w * 0.28),
      m.detail,
      sx * w * 0.38,
      0.04,
      0.52,
      [0.2, sx * 0.15, 0]
    );
  }

  addFrontEyes(head, m, {
    ex: w * 0.32,
    ey: w * 0.22,
    ez: w * 0.28,
    tag: prefix,
  });

  if (variantIndex) {
    for (let i = 0; i < 3; i++) {
      addPart(
        body,
        new THREE.SphereGeometry(w * 0.22, 6, 6),
        m.accent,
        0,
        0.22 + i * 0.04,
        0.5 - i * 0.35
      );
    }
  }

  return root;
}

/**
 * ドードルバグ（小）— ハティル砂漠 · 地上型アントライオン幼虫
 * 低重心 · 大顎 · 円形徘徊（範囲攻撃）のイメージ
 */
export function buildDoodlebugSmall(palette, variantIndex = 0) {
  const prefix = P.doodlebugSmall;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  const segCount = variantIndex ? 5 : 4;
  let w = variantIndex ? 0.26 : 0.24;
  let y = 0.14;
  let z = 0.08;
  for (let i = 0; i < segCount; i++) {
    const matUse = i % 2 === 0 ? m.body : m.bodyDark;
    addPart(body, new THREE.BoxGeometry(w, w * 0.42, w * 0.78), matUse, 0, y, z);
    if (i % 2 === 1) {
      addPart(body, new THREE.BoxGeometry(w * 0.55, w * 0.12, w * 0.35), m.bodyLight, 0, y + w * 0.18, z + 0.02);
    }
    z -= w * 0.62;
    w *= 0.92;
  }

  const head = new THREE.Group();
  head.position.set(0, y + 0.04, z + 0.42);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(w * 1.35, w * 0.55, w * 0.95), m.bodyDark, 0, 0, 0.06);
  addPart(head, new THREE.BoxGeometry(w * 0.9, w * 0.28, w * 0.55), m.bodyLight, 0, w * 0.12, 0.18);

  for (const sx of [-1, 1]) {
    addPart(
      head,
      new THREE.ConeGeometry(w * 0.22, w * 1.05, 5),
      m.detail,
      sx * w * 0.42,
      -w * 0.08,
      0.38,
      [0.85, sx * 0.35, sx * 0.12]
    );
    addPart(
      head,
      new THREE.BoxGeometry(w * 0.12, w * 0.08, w * 0.42),
      m.accent,
      sx * w * 0.28,
      w * 0.02,
      0.52,
      [0.55, sx * 0.2, 0.08]
    );
  }

  addFrontEyes(head, m, {
    ex: w * 0.22,
    ey: w * 0.18,
    ez: w * 0.22,
    tag: prefix,
  });

  const legPairs = [
    [0.16, 0.22],
    [0.1, 0.02],
    [-0.06, -0.18],
  ];
  for (const [lz, spread] of legPairs) {
    for (const sx of [-1, 1]) {
      addPart(
        body,
        new THREE.BoxGeometry(0.04, 0.04, spread * 0.55),
        m.bodyDark,
        sx * spread,
        0.06,
        lz,
        [0.55, sx * 0.35, 0.18]
      );
      addPart(
        body,
        new THREE.BoxGeometry(0.035, 0.025, 0.06),
        m.detail,
        sx * (spread + 0.06),
        0.03,
        lz + spread * 0.22,
        [0, sx * 0.15, 0.1]
      );
    }
  }

  if (variantIndex) {
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2;
      addPart(
        body,
        new THREE.BoxGeometry(0.03, 0.02, 0.08),
        m.accent,
        Math.sin(ang) * 0.34,
        0.02,
        Math.cos(ang) * 0.34,
        [0, ang, 0.12]
      );
    }
  } else {
    addPart(body, new THREE.TorusGeometry(0.38, 0.018, 4, 12), m.accent, 0, 0.015, 0.02, [Math.PI / 2, 0, 0]);
  }

  return root;
}

/**
 * ドードルバグ（中）— ハティル砂漠 · 地中型
 * 砂丘に半埋まり · 上半身と大顎のみ露出 · 追加魔法ダメの雰囲気
 */
export function buildDoodlebugMedium(palette, variantIndex = 0) {
  const prefix = P.doodlebugMedium;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.CylinderGeometry(0.56, 0.62, 0.12, 8), m.cloth, 0, 0.06, 0);
  addPart(
    body,
    new THREE.SphereGeometry(0.5, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.52),
    m.cloth,
    0,
    0.1,
    0,
    [0.04, 0, 0]
  );
  addPart(body, new THREE.TorusGeometry(0.62, 0.022, 4, 14), m.detail, 0, 0.04, 0, [Math.PI / 2, 0, 0]);

  const emerge = new THREE.Group();
  emerge.position.set(0, 0.12, 0.04);
  emerge.rotation.set(-0.35, 0, 0);
  body.add(emerge);

  const segCount = variantIndex ? 6 : 5;
  let w = variantIndex ? 0.38 : 0.34;
  let y = 0.1;
  let z = 0.06;
  for (let i = 0; i < segCount; i++) {
    const matUse = i % 2 === 0 ? m.body : m.bodyDark;
    const visible = i < 3;
    if (visible) {
      addPart(emerge, new THREE.BoxGeometry(w, w * 0.48, w * 0.82), matUse, 0, y, z);
      if (i % 2 === 0) {
        addPart(
          emerge,
          new THREE.BoxGeometry(w * 0.62, w * 0.14, w * 0.38),
          m.bodyLight,
          0,
          y + w * 0.2,
          z + 0.02
        );
      }
    } else {
      addPart(
        emerge,
        new THREE.BoxGeometry(w * 0.85, w * 0.22, w * 0.55),
        m.bodyDark,
        0,
        y - w * 0.12,
        z,
        [0.15, 0, 0]
      );
    }
    z -= w * 0.58;
    w *= 0.93;
  }

  const head = new THREE.Group();
  head.position.set(0, y + 0.06, z + 0.48);
  emerge.add(head);
  addPart(head, new THREE.BoxGeometry(w * 1.5, w * 0.62, w * 1.05), m.bodyDark, 0, 0, 0.08);
  addPart(head, new THREE.BoxGeometry(w, w * 0.32, w * 0.62), m.bodyLight, 0, w * 0.14, 0.22);

  for (const sx of [-1, 1]) {
    addPart(
      head,
      new THREE.ConeGeometry(w * 0.24, w * 1.2, 5),
      m.detail,
      sx * w * 0.48,
      -w * 0.1,
      0.42,
      [0.9, sx * 0.38, sx * 0.1]
    );
    addPart(
      head,
      new THREE.BoxGeometry(w * 0.14, w * 0.1, w * 0.48),
      m.accent,
      sx * w * 0.32,
      w * 0.04,
      0.58,
      [0.6, sx * 0.22, 0.06]
    );
  }

  addFrontEyes(head, m, {
    ex: w * 0.24,
    ey: w * 0.2,
    ez: w * 0.24,
    tag: prefix,
  });

  for (let i = 0; i < 3; i++) {
    for (const sx of [-1, 1]) {
      addPart(
        emerge,
        new THREE.BoxGeometry(0.045, 0.035, 0.08),
        m.detail,
        sx * (0.18 + i * 0.05),
        0.04,
        0.12 - i * 0.14,
        [0.7, sx * 0.4, 0.2]
      );
    }
  }

  if (variantIndex) {
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2 + 0.4;
      addPart(
        body,
        new THREE.OctahedronGeometry(0.06, 0),
        m.accent,
        Math.sin(ang) * 0.38,
        0.28 + i * 0.06,
        Math.cos(ang) * 0.38,
        [0.2, ang, 0.35]
      );
    }
    addPart(body, new THREE.SphereGeometry(0.05, 6, 6), m.accent, 0, 0.34, 0.12);
  } else {
    for (let i = 0; i < 2; i++) {
      addPart(
        body,
        new THREE.BoxGeometry(0.04, 0.025, 0.12),
        m.bodyLight,
        i ? 0.14 : -0.14,
        0.16,
        -0.08,
        [0.3, i ? 0.2 : -0.2, 0]
      );
    }
  }

  return root;
}

/** サンドスコーピオン */
export function buildSandScorpion(palette, variantIndex = 0) {
  const prefix = P.sandScorpion;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.34, 0.16, 0.48), m.body, 0, 0.28, 0);
  addPart(body, new THREE.BoxGeometry(0.26, 0.1, 0.36), m.bodyLight, 0, 0.24, 0.04);

  const head = new THREE.Group();
  head.position.set(0, 0.28, 0.28);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.22, 0.14, 0.18), m.bodyDark, 0, 0, 0.04);
  addFrontEyes(head, m, { ex: 0.07, ey: 0.04, ez: 0.08, tag: prefix });
  addPart(head, new THREE.ConeGeometry(0.025, 0.1, 4), m.detail, -0.05, -0.02, 0.12, [0.4, -0.2, 0]);
  addPart(head, new THREE.ConeGeometry(0.025, 0.1, 4), m.detail, 0.05, -0.02, 0.12, [0.4, 0.2, 0]);

  for (const sx of [-1, 1]) {
    addPart(
      body,
      new THREE.BoxGeometry(0.06, 0.06, variantIndex ? 0.38 : 0.28),
      m.accent,
      sx * 0.28,
      0.32,
      0.08,
      [0.4, sx * 0.25, 0.15]
    );
    addPart(body, new THREE.BoxGeometry(0.05, 0.05, 0.12), m.metal, sx * 0.34, 0.36, 0.22, [0.5, sx * 0.2, 0.2]);
  }

  const tail = new THREE.Group();
  tail.position.set(0, 0.32, -0.28);
  body.add(tail);
  addPart(tail, new THREE.BoxGeometry(0.08, 0.06, 0.2), m.bodyDark, 0, 0, -0.1, [0, 0, 0.15]);
  addPart(tail, new THREE.BoxGeometry(0.06, 0.05, 0.18), m.bodyDark, 0, 0.06, -0.26, [0, 0, 0.35]);
  addPart(tail, new THREE.ConeGeometry(0.035, 0.14, 4), m.accent, 0, 0.12, -0.38, [0.55, 0, 0]);

  for (let i = 0; i < 4; i++) {
    for (const sx of [-1, 1]) {
      addPart(body, new THREE.BoxGeometry(0.04, 0.04, 0.22), m.bodyDark, sx * (0.14 + i * 0.04), 0.08, (i - 1.5) * 0.1, [0, sx * 0.2, 0.25]);
    }
  }
  return root;
}

/** トータス — 峡谷の亀 */
export function buildIpsTurtle(palette, variantIndex = 0) {
  const prefix = P.ipsTurtle;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  const shell = new THREE.Group();
  shell.position.set(0, 0.22, 0);
  body.add(shell);
  addPart(
    shell,
    new THREE.SphereGeometry(0.34, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    m.body,
    0,
    0.08,
    0,
    [0.08, 0, 0]
  );
  addPart(shell, new THREE.BoxGeometry(0.52, 0.08, 0.58), m.bodyDark, 0, 0.02, 0);
  if (!variantIndex) {
    for (let i = 0; i < 6; i++) {
      addPart(
        shell,
        new THREE.BoxGeometry(0.1, 0.04, 0.12),
        m.detail,
        (i % 2 ? 0.12 : -0.12),
        0.18,
        -0.14 + i * 0.1,
        [0.15, 0, 0]
      );
    }
  } else {
    addPart(shell, new THREE.BoxGeometry(0.14, 0.06, 0.16), m.accent, 0, 0.2, 0.02);
  }

  const head = new THREE.Group();
  head.position.set(0, 0.18, 0.34);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.16, 0.12, 0.14), m.bodyLight, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.1, 0.08, 0.12), m.body, 0, -0.02, 0.12);
  addFrontEyes(head, m, { ex: 0.05, ey: 0.04, ez: 0.08, tag: prefix });

  addPart(body, new THREE.BoxGeometry(0.12, 0.08, 0.1), m.bodyDark, 0, 0.14, -0.32);

  for (const [x, z] of [
    [-0.22, 0.18],
    [0.22, 0.18],
    [-0.2, -0.18],
    [0.2, -0.18],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.1, 0.08, 0.12), m.bodyDark, x, 0.08, z);
    addPart(body, new THREE.BoxGeometry(0.08, 0.04, 0.1), m.detail, x, 0.04, z + 0.02);
  }
  return root;
}

/** ジャイアント トータス — 超巨大亀 */
export function buildIpsGiantTortoise(palette, variantIndex = 0) {
  const prefix = P.ipsGiantTortoise;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  const shell = new THREE.Group();
  shell.position.set(0, 0.42, 0);
  body.add(shell);
  addPart(
    shell,
    new THREE.SphereGeometry(0.62, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.52),
    m.body,
    0,
    0.12,
    0,
    [0.06, 0, 0]
  );
  addPart(shell, new THREE.BoxGeometry(0.96, 0.12, 1.08), m.bodyDark, 0, 0.04, 0);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      addPart(
        shell,
        new THREE.BoxGeometry(0.14, 0.06, 0.16),
        row % 2 ? m.detail : m.bodyLight,
        (col - 1.5) * 0.2,
        0.28 - row * 0.06,
        -0.28 + row * 0.28,
        [0.12, 0, 0]
      );
    }
  }
  if (variantIndex) {
    for (const [x, z] of [
      [-0.28, 0.1],
      [0.28, -0.08],
    ]) {
      addPart(shell, new THREE.ConeGeometry(0.06, 0.18, 5), m.horn, x, 0.34, z, [0.2, 0, 0]);
    }
  }

  const neck = new THREE.Group();
  neck.position.set(0, 0.28, 0.52);
  body.add(neck);
  addPart(neck, new THREE.CylinderGeometry(0.12, 0.16, 0.28, 6), m.bodyLight, 0, 0.08, 0.04);
  const head = new THREE.Group();
  head.position.set(0, 0.18, 0.18);
  neck.add(head);
  addPart(head, new THREE.BoxGeometry(0.24, 0.18, 0.22), m.bodyLight, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.16, 0.12, 0.18), m.body, 0, -0.04, 0.18);
  addFrontEyes(head, m, { ex: 0.08, ey: 0.05, ez: 0.1, tag: prefix });

  addPart(body, new THREE.BoxGeometry(0.18, 0.1, 0.14), m.bodyDark, 0, 0.26, -0.58);

  for (const [x, z] of [
    [-0.38, 0.32],
    [0.38, 0.32],
    [-0.34, -0.32],
    [0.34, -0.32],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.18, 0.14, 0.2), m.bodyDark, x, 0.12, z);
    addPart(body, new THREE.BoxGeometry(0.22, 0.06, 0.26), m.detail, x, 0.05, z + 0.02);
  }
  return root;
}

/** エルビン バイソン 牡 — 肩瘤 · 短角 */
export function buildElvinBison(palette, variantIndex = 0) {
  const prefix = P.elvinBison;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.58, 0.38, 0.82), m.body, 0, 0.56, 0);
  addPart(body, new THREE.BoxGeometry(0.44, 0.22, 0.58), m.bodyLight, 0, 0.46, 0.04);
  addPart(body, new THREE.BoxGeometry(0.36, 0.24, 0.32), m.bodyDark, 0, 0.78, 0.12);

  const head = new THREE.Group();
  head.position.set(0, 0.72, 0.46);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.28, 0.24, 0.3), m.body, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.18, 0.12, 0.18), m.bodyLight, 0, -0.04, 0.18);
  addFrontEyes(head, m, { ex: 0.08, ey: 0.05, ez: 0.12, tag: prefix });

  if (variantIndex) {
    addPart(head, new THREE.BoxGeometry(0.06, 0.12, 0.06), m.horn, -0.1, 0.16, -0.04, [0.2, 0, 0.35]);
    addPart(head, new THREE.BoxGeometry(0.06, 0.12, 0.06), m.horn, 0.1, 0.16, -0.04, [0.2, 0, -0.35]);
  } else {
    for (const sx of [-1, 1]) {
      addPart(head, new THREE.BoxGeometry(0.05, 0.18, 0.05), m.horn, sx * 0.12, 0.18, -0.02, [0.15, 0, sx * 0.4]);
    }
  }

  addPart(body, new THREE.BoxGeometry(0.1, 0.08, 0.16), m.bodyDark, 0, 0.52, -0.42);
  addQuadLegs(body, m, { spread: 0.22, frontZ: 0.28, backZ: -0.28, legH: 0.42 });
  return root;
}

/** ガルム鹿 — 回廊の高速鹿 */
export function buildGarmDeer(palette, variantIndex = 0) {
  const prefix = P.garmDeer;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.36, 0.26, 0.56), m.body, 0, 0.48, 0);
  addPart(body, new THREE.BoxGeometry(0.28, 0.1, 0.42), m.bodyLight, 0, 0.42, 0.04);

  const head = new THREE.Group();
  head.position.set(0, 0.56, 0.3);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.2, 0.18, 0.22), m.body, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.12, 0.1, 0.14), m.bodyLight, 0, -0.02, 0.16);
  addFrontEyes(head, m, { ex: 0.07, ey: 0.05, ez: 0.12, tag: prefix });

  if (variantIndex) {
    addPart(head, new THREE.ConeGeometry(0.022, 0.16, 4), m.horn, -0.07, 0.14, -0.02, [0.1, 0, 0.4]);
    addPart(head, new THREE.ConeGeometry(0.022, 0.16, 4), m.horn, 0.07, 0.14, -0.02, [0.1, 0, -0.4]);
  } else {
    for (const sx of [-1, 1]) {
      addPart(head, new THREE.BoxGeometry(0.028, 0.18, 0.028), m.horn, sx * 0.09, 0.16, -0.04, [0.15, 0, sx * 0.45]);
    }
  }

  addPart(body, new THREE.BoxGeometry(0.07, 0.06, 0.1), m.bodyDark, 0, 0.46, -0.28);
  addQuadLegs(body, m, { spread: 0.13, frontZ: 0.18, backZ: -0.18, legH: 0.36 });
  return root;
}

/** イルヴァーナ ウルフ — 渓谷の低足速狼 */
export function buildIlvanaWolf(palette, variantIndex = 0) {
  const root = buildElvinWolf(palette, variantIndex);
  root.name = `${P.ilvanaWolf}Root`;
  return root;
}

/** デザート スコーピオン（中）— 砂漠プレビュー */
export function buildDesertScorpionMed(palette, variantIndex = 0) {
  const root = buildSandScorpion(palette, variantIndex);
  root.scale.set(1.38, 1.38, 1.38);
  return root;
}

/** スローリム ライオン — 平原の大型猫 */
export function buildSlorimLion(palette, variantIndex = 0) {
  const prefix = P.slorimLion;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.54, 0.32, 0.76), m.body, 0, 0.46, 0);
  addPart(body, new THREE.BoxGeometry(0.42, 0.14, 0.58), m.bodyLight, 0, 0.38, 0.04);

  const head = new THREE.Group();
  head.position.set(0, 0.54, 0.44);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.32, 0.28, 0.32), m.body, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.18, 0.12, 0.18), m.bodyLight, 0, -0.02, 0.2);
  addFrontEyes(head, m, { ex: 0.09, ey: 0.06, ez: 0.14, tag: prefix });

  if (!variantIndex) {
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      addPart(head, new THREE.BoxGeometry(0.04, 0.16, 0.04), m.detail, Math.sin(ang) * 0.18, 0.1, Math.cos(ang) * 0.1 - 0.06, [0.2, ang, 0]);
    }
  } else {
    addPart(head, new THREE.BoxGeometry(0.24, 0.08, 0.2), m.detail, 0, 0.12, -0.04);
  }

  addPart(body, new THREE.BoxGeometry(0.12, 0.08, 0.28), m.bodyDark, 0, 0.44, -0.44);
  addQuadLegs(body, m, { spread: 0.22, frontZ: 0.26, backZ: -0.26 });
  return root;
}

/** ジャイアント イプス バス（大）— 峡谷の低攻撃魚 */
export function buildIpsBass(palette, variantIndex = 0) {
  const prefix = P.ipsBass;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  const fat = variantIndex ? 1.12 : 0.95;
  addPart(body, new THREE.BoxGeometry(0.52 * fat, 0.22 * fat, 0.28 * fat), m.body, 0, 0.28, 0);
  addPart(body, new THREE.BoxGeometry(0.38, 0.12, 0.2), m.bodyLight, 0, 0.3, 0.02);
  addPart(body, new THREE.BoxGeometry(0.14, 0.18, 0.08), m.bodyDark, 0, 0.34, 0.04);

  const head = new THREE.Group();
  head.position.set(0, 0.28, 0.22);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.18, 0.16, 0.14), m.body, 0, 0, 0.04);
  addFrontEyes(head, m, { ex: 0.06, ey: 0.04, ez: 0.08, tag: prefix });
  addPart(head, new THREE.ConeGeometry(0.03, 0.08, 4), m.detail, 0, -0.02, 0.12, [0.45, 0, 0]);

  addPart(body, new THREE.BoxGeometry(0.04, 0.16, 0.22), m.accent, 0, 0.42, 0, [0.15, 0, 0]);
  addPart(body, new THREE.BoxGeometry(0.06, 0.1, 0.18), m.detail, 0, 0.36, -0.08, [0.35, 0, 0]);

  const tail = new THREE.Group();
  tail.position.set(0, 0.28, -0.18);
  body.add(tail);
  addPart(tail, new THREE.BoxGeometry(0.08, 0.06, 0.16), m.bodyDark, 0, 0, -0.08, [0, 0, 0.2]);
  addPart(tail, new THREE.BoxGeometry(0.06, 0.04, 0.14), m.bodyDark, 0, 0.02, -0.22, [0, 0, 0.45]);
  addPart(tail, new THREE.ConeGeometry(0.04, 0.12, 4), m.accent, 0, 0.04, -0.32, [0.5, 0, 0]);

  for (const sx of [-1, 1]) {
    addPart(body, new THREE.BoxGeometry(0.04, 0.08, 0.12), m.bodyDark, sx * 0.22, 0.14, 0.04, [0.2, sx * 0.35, 0.1]);
  }
  return root;
}

/** デザート スコーピオン（大）— ハティル砂漠 */
export function buildDesertScorpionLarge(palette, variantIndex = 0) {
  const root = buildSandScorpion(palette, variantIndex);
  root.scale.set(1.72, 1.72, 1.72);
  return root;
}

/** エルアン ナイト — 白骨·黒骨 · 骨鎧人型 */
export function buildElanKnight(palette, variantIndex = 0) {
  const prefix = P.elanKnight;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.3, 0.36, 0.18), m.body, 0, 0.52, 0);
  addPart(body, new THREE.BoxGeometry(0.24, 0.08, 0.16), m.bodyDark, 0, 0.44, 0.02);
  addPart(body, new THREE.BoxGeometry(0.26, 0.1, 0.16), m.bodyLight, 0, 0.34, 0);
  for (const z of [-0.04, 0.04]) {
    addPart(body, new THREE.BoxGeometry(0.04, 0.22, 0.04), m.bodyDark, 0.12, 0.5, z);
    addPart(body, new THREE.BoxGeometry(0.04, 0.22, 0.04), m.bodyDark, -0.12, 0.5, z);
  }

  const head = new THREE.Group();
  head.position.set(0, 0.84, 0.04);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.22, 0.24, 0.22), m.bodyLight, 0, 0, 0);
  addPart(head, new THREE.BoxGeometry(0.16, 0.1, 0.12), m.bodyDark, 0, -0.04, 0.1);
  if (variantIndex) {
    addPart(head, new THREE.ConeGeometry(0.04, 0.16, 4), m.metal, 0, 0.18, -0.02);
  } else {
    addPart(head, new THREE.BoxGeometry(0.2, 0.06, 0.18), m.metal, 0, 0.14, -0.02);
  }
  addFrontEyes(head, m, { ex: 0.06, ey: 0.02, ez: 0.1, tag: prefix });

  addHumanoidArms(body, m, prefix);
  addPart(body, new THREE.BoxGeometry(0.06, 0.52, 0.04), m.metal, 0.34, 0.56, 0.1);
  addPart(body, new THREE.BoxGeometry(0.1, 0.14, 0.06), m.detail, 0.34, 0.86, 0.1);
  addPart(body, new THREE.BoxGeometry(0.04, 0.36, 0.28), m.metal, -0.32, 0.5, 0.06);
  if (variantIndex) {
    addPart(body, new THREE.BoxGeometry(0.08, 0.08, 0.08), m.accent, -0.32, 0.62, 0.12);
  }

  for (const sx of [-1, 1]) {
    addPart(body, new THREE.BoxGeometry(0.1, 0.32, 0.1), m.bodyDark, sx * 0.09, 0.18, 0);
    addPart(body, new THREE.BoxGeometry(0.11, 0.06, 0.12), m.body, sx * 0.09, 0.03, 0.04);
  }
  return root;
}

/** サラマンダー — 赤蜥蜴 · 背びれ · 火尾 */
export function buildSalamander(palette, variantIndex = 0) {
  const prefix = P.salamander;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.52, 0.22, 0.88), m.body, 0, 0.38, 0);
  addPart(body, new THREE.BoxGeometry(0.38, 0.14, 0.62), m.bodyLight, 0, 0.42, 0.06);
  for (let i = 0; i < 5; i++) {
    addPart(
      body,
      new THREE.ConeGeometry(0.03, 0.12 + (variantIndex ? 0.05 : 0), 4),
      variantIndex ? m.accent : m.bodyDark,
      (i - 2) * 0.07,
      0.52,
      -0.08 - i * 0.12,
      [0.4, 0, (i - 2) * 0.15]
    );
  }

  const head = new THREE.Group();
  head.position.set(0, 0.36, 0.48);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.24, 0.18, 0.28), m.body, 0, 0, 0.06);
  addPart(head, new THREE.BoxGeometry(0.08, 0.06, 0.12), m.bodyDark, 0, -0.02, 0.22);
  addFrontEyes(head, m, { ex: 0.07, ey: 0.04, ez: 0.12, tag: prefix });

  addQuadLegs(body, m, { spread: 0.2, frontZ: 0.28, backZ: -0.32 });
  addPart(body, new THREE.BoxGeometry(0.1, 0.08, 0.42), m.bodyDark, 0, 0.34, -0.58);
  addPart(body, new THREE.SphereGeometry(0.08, 6, 6), m.accent, 0, 0.34, -0.82);

  return root;
}

/** リバーサイド クローラー — 川沿いの百足虫 */
export function buildRiversideCrawler(palette, variantIndex = 0) {
  const prefix = P.riversideCrawler;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  const segCount = variantIndex ? 7 : 6;
  let w = variantIndex ? 0.14 : 0.12;
  let y = 0.18;
  let z = 0.28;
  for (let i = 0; i < segCount; i++) {
    const matUse = i % 2 === 0 ? m.body : m.bodyDark;
    addPart(body, new THREE.BoxGeometry(w * 1.6, w, w * 1.4), matUse, 0, y, z);
    for (const sx of [-1, 1]) {
      addPart(
        body,
        new THREE.BoxGeometry(0.03, 0.12, 0.03),
        m.detail,
        sx * w * 0.9,
        y - w * 0.35,
        z + (i % 2 ? 0.04 : -0.04),
        [0, 0, sx * 0.4]
      );
    }
    y += 0.01;
    z -= 0.16;
    w *= 0.98;
  }

  const head = new THREE.Group();
  head.position.set(0, y + 0.02, z + 0.2);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(w * 1.8, w * 0.9, w * 1.2), m.bodyLight, 0, 0, 0.04);
  addFrontEyes(head, m, { ex: w * 0.55, ey: 0.02, ez: 0.06, tag: prefix });
  for (const sx of [-1, 1]) {
    addPart(
      head,
      new THREE.ConeGeometry(w * 0.35, w * 0.9, 4),
      m.accent,
      sx * w * 0.45,
      -0.02,
      0.1,
      [0.4, 0, sx * 0.25]
    );
  }
  return root;
}

/** オルヴァン パピー — 小型ドラゴン · 青系 */
export function buildOrvanPappy(palette, variantIndex = 0) {
  const prefix = P.orvanPappy;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);
  const scale = variantIndex ? 0.92 : 1;

  addPart(body, new THREE.BoxGeometry(0.34 * scale, 0.2 * scale, 0.48 * scale), m.body, 0, 0.34, 0);
  addPart(body, new THREE.BoxGeometry(0.24 * scale, 0.12 * scale, 0.34 * scale), m.bodyLight, 0, 0.38, 0.06);

  const head = new THREE.Group();
  head.position.set(0, 0.42 * scale, 0.28 * scale);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.2 * scale, 0.16 * scale, 0.22 * scale), m.body, 0, 0, 0.04);
  addPart(head, new THREE.BoxGeometry(0.1 * scale, 0.08 * scale, 0.12 * scale), m.bodyDark, 0, -0.02, 0.14);
  addFrontEyes(head, m, { ex: 0.06 * scale, ey: 0.03 * scale, ez: 0.1 * scale, tag: prefix });

  for (const sx of [-1, 1]) {
    addPart(
      body,
      new THREE.BoxGeometry(0.18 * scale, 0.04 * scale, 0.22 * scale),
      variantIndex ? m.accent : m.bodyLight,
      sx * 0.2 * scale,
      0.44 * scale,
      -0.04,
      [0.2, sx * 0.35, 0]
    );
  }

  addQuadLegs(body, m, { spread: 0.14 * scale, frontZ: 0.16 * scale, backZ: -0.18 * scale });
  addPart(body, new THREE.BoxGeometry(0.08 * scale, 0.06 * scale, 0.28 * scale), m.bodyDark, 0, 0.32, -0.3 * scale);
  return root;
}

/** ネオク オルヴァン — 青ドラゴン · テイム可 */
export function buildNeokuOrvan(palette, variantIndex = 0) {
  const prefix = P.neokuOrvan;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.46, 0.26, 0.72), m.body, 0, 0.42, 0);
  addPart(body, new THREE.BoxGeometry(0.34, 0.14, 0.52), m.bodyLight, 0, 0.46, 0.08);
  if (variantIndex) {
    addPart(body, new THREE.BoxGeometry(0.12, 0.08, 0.42), m.accent, 0, 0.5, -0.12);
  }

  const head = new THREE.Group();
  head.position.set(0, 0.52, 0.38);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.26, 0.2, 0.28), m.body, 0, 0, 0.06);
  addPart(head, new THREE.BoxGeometry(0.12, 0.08, 0.14), m.bodyDark, 0, -0.02, 0.18);
  addFrontEyes(head, m, { ex: 0.08, ey: 0.04, ez: 0.12, tag: prefix });

  for (const sx of [-1, 1]) {
    addPart(
      body,
      new THREE.BoxGeometry(0.22, 0.06, 0.28),
      variantIndex ? m.detail : m.bodyLight,
      sx * 0.24,
      0.54,
      -0.02,
      [0.15, sx * 0.4, 0]
    );
  }

  addQuadLegs(body, m, { spread: 0.2, frontZ: 0.26, backZ: -0.28 });
  addPart(body, new THREE.BoxGeometry(0.1, 0.08, 0.38), m.bodyDark, 0, 0.4, -0.48);
  addPart(body, new THREE.SphereGeometry(0.06, 6, 6), m.accent, 0, 0.4, -0.66);
  return root;
}

/** ノッカー — 小人型 · 棍棒 */
export function buildNocker(palette, variantIndex = 0) {
  const prefix = P.nocker;
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  addPart(body, new THREE.BoxGeometry(0.22, 0.28, 0.16), m.body, 0, 0.38, 0);
  addPart(body, new THREE.BoxGeometry(0.18, 0.1, 0.14), m.cloth ?? m.bodyDark, 0, 0.28, 0.02);

  const head = new THREE.Group();
  head.position.set(0, 0.58, 0.02);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.2, 0.2, 0.2), m.bodyLight, 0, 0, 0);
  addPart(head, new THREE.BoxGeometry(0.16, 0.06, 0.1), m.bodyDark, 0, -0.06, 0.08);
  addFrontEyes(head, m, { ex: 0.06, ey: 0.02, ez: 0.09, tag: prefix });
  if (variantIndex) {
    addPart(head, new THREE.BoxGeometry(0.04, 0.12, 0.04), m.detail, 0, 0.14, -0.02);
  } else {
    for (const sx of [-1, 1]) {
      addPart(head, new THREE.ConeGeometry(0.03, 0.1, 4), m.detail, sx * 0.1, 0.12, -0.02, [0, 0, sx * 0.4]);
    }
  }

  addHumanoidArms(body, m, prefix);
  addPart(body, new THREE.BoxGeometry(0.05, 0.42, 0.05), m.detail, 0.28, 0.44, 0.06);
  addPart(body, new THREE.BoxGeometry(0.1, 0.1, 0.1), m.bodyDark, 0.28, 0.68, 0.06);

  for (const sx of [-1, 1]) {
    addPart(body, new THREE.BoxGeometry(0.08, 0.22, 0.08), m.bodyDark, sx * 0.08, 0.14, 0);
    addPart(body, new THREE.BoxGeometry(0.09, 0.05, 0.1), m.body, sx * 0.08, 0.03, 0.04);
  }
  return root;
}

/** @type {Record<string, (palette: Record<string, number>, variantIndex?: number) => THREE.Group>} */
export const MONSTER_TYPE_BUILDERS = {
  rescue_amazoness: buildRescueAmazoness,
  rescue_hound: buildRescueHound,
  rescue_lion: buildRescueLion,
  rescue_bear: buildRescueBear,
  rescue_buck: buildRescueBuck,
  gigas_boss: buildGigasBoss,
  meerim_rat: buildMeerimRat,
  meerim_eats: buildMeerimEats,
  meerim_snake: buildMeerimSnake,
  sea_snake: buildSeaSnake,
  meerim_moose: buildMeerimMoose,
  elvin_spider: buildElvinSpider,
  elvin_wolf: buildElvinWolf,
  orc_gang: buildOrcGang,
  orc_magician: buildOrcMagician,
  gigas_mammoth: buildGigasMammoth,
  sandworm: buildSandworm,
  sand_scorpion: buildSandScorpion,
  deathworm: buildDeathworm,
  doodlebug_small: buildDoodlebugSmall,
  doodlebug_medium: buildDoodlebugMedium,
  storm_punisher: buildStormPunisher,
  chimera: buildChimera,
  turtle: buildIpsTurtle,
  giant_tortoise: buildIpsGiantTortoise,
  elvin_bison: buildElvinBison,
  garm_deer: buildGarmDeer,
  ilvana_wolf: buildIlvanaWolf,
  desert_scorpion_med: buildDesertScorpionMed,
  slorim_lion: buildSlorimLion,
  ips_bass: buildIpsBass,
  desert_scorpion_large: buildDesertScorpionLarge,
  elan_knight: buildElanKnight,
  salamander: buildSalamander,
  riverside_crawler: buildRiversideCrawler,
  orvan_pappy: buildOrvanPappy,
  neoku_orvan: buildNeokuOrvan,
  nocker: buildNocker,
};
