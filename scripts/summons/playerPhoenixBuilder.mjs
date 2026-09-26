/**
 * プレイヤー召喚 — 鳳凰（生活改鳳）
 * ドラゴン型ではなく大鳥シルエット · 炎冠 · 扇状尾羽
 */
import * as THREE from "three";
import { addPart, mat } from "../petGlbShared.mjs";
import { MOE_PLAYER_SUMMON_VARIANTS } from "./playerSummonCatalog.mjs";

const PREFIX = "PlayerSummonPhoenix";
const DEFAULT_PALETTE = MOE_PLAYER_SUMMON_VARIANTS[0].palette;

/** @param {Record<string, number>} palette */
function buildPhoenixMaterials(palette) {
  const p = palette;
  return {
    feather: mat(p.feather),
    featherMid: mat(p.featherMid),
    featherDark: mat(p.featherDark),
    featherDeep: mat(p.featherDeep),
    belly: mat(p.belly),
    bellyLight: mat(p.bellyLight),
    crest: mat(p.crest, { emissive: p.crest, emissiveIntensity: 0.35 }),
    crestHot: mat(p.crestHot, { emissive: p.crestHot, emissiveIntensity: 0.55 }),
    beak: mat(p.beak),
    beakDark: mat(p.beakDark),
    eye: mat(p.eye, { emissive: p.eye, emissiveIntensity: 0.4 }),
    eyeRing: mat(p.eyeRing),
    eyeShine: mat(p.eyeShine),
    pupil: mat(p.pupil),
    claw: mat(p.claw),
    clawDark: mat(p.clawDark),
    ember: mat(p.ember, { emissive: p.ember, emissiveIntensity: 0.45 }),
    emberCore: mat(p.emberCore, { emissive: p.emberCore, emissiveIntensity: 0.65 }),
  };
}

/** @param {THREE.Group} head @param {ReturnType<typeof buildPhoenixMaterials>} mats */
function addPhoenixEyes(head, mats) {
  const { eyeRing, eye, pupil, eyeShine } = mats;
  for (const sx of [-1, 1]) {
    const ex = sx * 0.055;
    addPart(head, new THREE.BoxGeometry(0.07, 0.06, 0.03), eyeRing, ex, 0.04, 0.1);
    const eyeMesh = addPart(head, new THREE.SphereGeometry(0.034, 8, 8), eye, ex, 0.04, 0.12);
    eyeMesh.name = sx < 0 ? `${PREFIX}EyeL` : `${PREFIX}EyeR`;
    addPart(head, new THREE.BoxGeometry(0.014, 0.028, 0.012), pupil, ex, 0.04, 0.138);
    addPart(head, new THREE.SphereGeometry(0.01, 4, 4), eyeShine, ex - sx * 0.01, 0.05, 0.145);
  }
}

/** @param {THREE.Group} parent @param {ReturnType<typeof buildPhoenixMaterials>} mats @param {number} side */
function addPhoenixWing(parent, mats, side) {
  const sx = side;
  const wing = new THREE.Group();
  wing.name = sx < 0 ? `${PREFIX}WingL` : `${PREFIX}WingR`;
  wing.position.set(sx * 0.22, 0.62, -0.04);
  parent.add(wing);

  const { featherMid, feather, featherDark, featherDeep, ember, emberCore } = mats;
  addPart(wing, new THREE.BoxGeometry(0.08, 0.06, 0.18), featherDark, 0, 0, 0);
  const tilt = sx < 0 ? 0.28 : -0.28;

  addPart(
    wing,
    new THREE.BoxGeometry(0.52, 0.04, 0.38),
    feather,
    sx * 0.28,
    0.04,
    -0.08,
    [0.12, 0, tilt]
  );
  addPart(
    wing,
    new THREE.BoxGeometry(0.42, 0.035, 0.3),
    featherMid,
    sx * 0.42,
    0.07,
    -0.14,
    [0.18, 0, tilt * 1.1]
  );
  addPart(
    wing,
    new THREE.BoxGeometry(0.28, 0.03, 0.22),
    featherDark,
    sx * 0.52,
    0.09,
    -0.18,
    [0.22, 0, tilt * 1.2]
  );

  /* 翼先の炎羽 */
  for (let i = 0; i < 4; i++) {
    addPart(
      wing,
      new THREE.ConeGeometry(0.025, 0.16 + i * 0.02, 4),
      i % 2 === 0 ? ember : emberCore,
      sx * (0.58 + i * 0.04),
      0.1 + i * 0.02,
      -0.2 - i * 0.03,
      [0.4, sx * 0.2, tilt * 1.3]
    );
  }

  /* 下層羽 */
  addPart(
    wing,
    new THREE.BoxGeometry(0.34, 0.025, 0.24),
    featherDeep,
    sx * 0.34,
    -0.02,
    -0.06,
    [-0.15, 0, tilt * 0.9]
  );
}

/** @param {THREE.Group} body @param {ReturnType<typeof buildPhoenixMaterials>} mats */
function addPhoenixTailFan(body, mats) {
  const { feather, featherMid, featherDark, ember, emberCore } = mats;
  const tail = new THREE.Group();
  tail.position.set(0, 0.48, -0.38);
  body.add(tail);

  addPart(tail, new THREE.BoxGeometry(0.14, 0.1, 0.22), featherDark, 0, 0, -0.08);

  const fanAngles = [-0.55, -0.28, 0, 0.28, 0.55];
  for (let i = 0; i < fanAngles.length; i++) {
    const ang = fanAngles[i];
    const len = 0.62 + (i === 2 ? 0.14 : 0);
    const matUse = i === 2 ? feather : i % 2 === 0 ? featherMid : feather;
    addPart(
      tail,
      new THREE.BoxGeometry(0.06, 0.025, len),
      matUse,
      Math.sin(ang) * 0.08,
      0.02,
      -len * 0.48,
      [0.35, ang, 0]
    );
    addPart(
      tail,
      new THREE.ConeGeometry(0.028, 0.18, 4),
      i === 2 ? emberCore : ember,
      Math.sin(ang) * 0.1,
      0.06,
      -len * 0.92,
      [0.5, ang, 0]
    );
  }
}

/** @param {Record<string, number>} [palette] */
export function buildPlayerSummonPhoenixRoot(palette = DEFAULT_PALETTE) {
  const mats = buildPhoenixMaterials(palette);
  const root = new THREE.Group();
  root.name = `${PREFIX}Root`;
  root.userData.summonId = palette.id ?? "phoenix";

  const body = new THREE.Group();
  body.name = `${PREFIX}Body`;
  root.add(body);

  const {
    feather,
    featherMid,
    featherDark,
    belly,
    bellyLight,
    crest,
    crestHot,
    beak,
    beakDark,
    claw,
    clawDark,
    ember,
    emberCore,
  } = mats;

  /* 胸〜腹 — 直立 */
  addPart(body, new THREE.BoxGeometry(0.28, 0.34, 0.22), feather, 0, 0.48, 0);
  addPart(body, new THREE.BoxGeometry(0.24, 0.28, 0.18), featherMid, 0, 0.44, 0.02);
  addPart(body, new THREE.BoxGeometry(0.2, 0.2, 0.14), belly, 0, 0.4, 0.04);
  addPart(body, new THREE.BoxGeometry(0.16, 0.1, 0.1), bellyLight, 0, 0.36, 0.05);

  /* 首 */
  const neck = new THREE.Group();
  neck.position.set(0, 0.66, 0.06);
  body.add(neck);
  addPart(neck, new THREE.BoxGeometry(0.12, 0.18, 0.12), featherMid, 0, 0.1, 0.04);
  addPart(neck, new THREE.BoxGeometry(0.1, 0.14, 0.1), feather, 0, 0.22, 0.1);

  /* 頭 */
  const head = new THREE.Group();
  head.name = `${PREFIX}Head`;
  head.position.set(0, 0.34, 0.14);
  neck.add(head);
  addPart(head, new THREE.BoxGeometry(0.2, 0.16, 0.2), feather, 0, 0, 0.02);
  addPart(head, new THREE.BoxGeometry(0.08, 0.06, 0.16), beak, 0, -0.02, 0.18);
  addPart(head, new THREE.BoxGeometry(0.06, 0.05, 0.1), beakDark, 0, -0.03, 0.28);
  addPhoenixEyes(head, mats);

  /* 炎冠 */
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const h = 0.16 + (i % 3) * 0.05;
    addPart(
      head,
      new THREE.ConeGeometry(0.028, h, 4),
      i % 2 === 0 ? crestHot : crest,
      Math.cos(ang) * 0.06,
      0.1 + h * 0.35,
      Math.sin(ang) * 0.06 - 0.02,
      [0.2, ang, 0.1]
    );
  }
  addPart(head, new THREE.SphereGeometry(0.04, 6, 6), emberCore, 0, 0.14, 0);

  addPhoenixWing(body, mats, -1);
  addPhoenixWing(body, mats, 1);
  addPhoenixTailFan(body, mats);

  /* 脚・鉤爪 */
  for (const sx of [-1, 1]) {
    addPart(body, new THREE.BoxGeometry(0.06, 0.22, 0.06), featherDark, sx * 0.1, 0.2, 0.06);
    addPart(body, new THREE.BoxGeometry(0.05, 0.08, 0.1), clawDark, sx * 0.1, 0.1, 0.1);
    for (const ox of [-0.02, 0, 0.02]) {
      addPart(body, new THREE.BoxGeometry(0.018, 0.06, 0.018), claw, sx * 0.1 + ox, 0.06, 0.14);
    }
  }

  /* 腹の灯 */
  addPart(body, new THREE.SphereGeometry(0.05, 8, 8), ember, 0, 0.42, 0.08);
  addPart(body, new THREE.SphereGeometry(0.028, 6, 6), emberCore, 0, 0.42, 0.1);

  return root;
}
