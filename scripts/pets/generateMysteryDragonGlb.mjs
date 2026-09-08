/**
 * ミステリー ドラゴン — MOE 再現寄り低ポリ
 * 紫ガーゴイル系・長いくちばし・大きな黄目・蝙蝠翼・クリスタル進化の紫アクセント
 * 千年竜／砂漠竜ファミリーに近い異形の四足ドラゴン
 */
import * as THREE from "three";
import { addPart, exportPetGlb, mat } from "../petGlbShared.mjs";

const palette = {
  /** 石像っぽい灰紫スケール */
  scale: 0x7a6b8f,
  scaleMid: 0x6b5b7a,
  scaleDark: 0x4a3f5c,
  scaleDeep: 0x362e42,
  belly: 0xb8afc8,
  bellyLight: 0xd4cce0,
  plate: 0x8b7fa3,
  horn: 0xe8e4ef,
  hornDark: 0xc4bdd4,
  eye: 0xfbbf24,
  eyeRing: 0x1f1630,
  eyeShine: 0xfffbeb,
  pupil: 0x120a18,
  beak: 0x5c4f6e,
  beakLight: 0x7a6d88,
  beakTip: 0x9d93ad,
  wingBone: 0x3d3349,
  wingMem: 0x5b21b6,
  wingMemLight: 0x7c3aed,
  claw: 0xfde68a,
  clawDark: 0xd97706,
  crystal: 0xc084fc,
  crystalCore: 0xe9d5ff,
};

function addEye(head, materials, sx) {
  const { eyeRing, eye, pupil, eyeShine, scaleDark } = materials;
  const ex = sx * 0.15;
  addPart(head, new THREE.BoxGeometry(0.12, 0.1, 0.05), eyeRing, ex, 0.16, 0.06);
  addPart(head, new THREE.SphereGeometry(0.055, 8, 8), eye, ex, 0.17, 0.1);
  addPart(head, new THREE.BoxGeometry(0.018, 0.042, 0.02), pupil, ex, 0.17, 0.132);
  addPart(head, new THREE.SphereGeometry(0.014, 4, 4), eyeShine, ex - sx * 0.018, 0.19, 0.138);
  addPart(head, new THREE.SphereGeometry(0.008, 4, 4), eyeShine, ex + sx * 0.012, 0.165, 0.14);
  addPart(head, new THREE.BoxGeometry(0.1, 0.05, 0.07), scaleDark, ex, 0.24, 0.04, [0.2, 0, sx * 0.15]);
}

function addLeg(body, materials, sx, sz, front) {
  const { scaleDark, scaleDeep, claw, clawDark } = materials;
  const thighY = front ? 0.26 : 0.24;
  addPart(body, new THREE.BoxGeometry(0.11, 0.2, 0.12), scaleDark, sx, thighY, sz);
  addPart(body, new THREE.BoxGeometry(0.09, 0.16, 0.1), scaleDeep, sx, 0.14, sz + (front ? 0.04 : -0.02));
  addPart(body, new THREE.BoxGeometry(0.11, 0.05, 0.13), clawDark, sx, 0.06, sz + 0.05);
  for (const ox of [-0.035, 0, 0.035]) {
    addPart(body, new THREE.BoxGeometry(0.025, 0.07, 0.025), claw, sx + ox, 0.03, sz + 0.1);
  }
}

function addWing(parent, materials, side) {
  const sx = side;
  const wing = new THREE.Group();
  wing.name = sx < 0 ? "MysteryDragonWingL" : "MysteryDragonWingR";
  wing.position.set(sx * 0.34, 0.68, -0.06);
  parent.add(wing);

  const { wingBone, wingMem, wingMemLight, scaleDark } = materials;
  addPart(wing, new THREE.BoxGeometry(0.1, 0.08, 0.22), wingBone, 0, 0, 0);
  addPart(wing, new THREE.BoxGeometry(0.08, 0.05, 0.18), scaleDark, sx * 0.04, -0.02, -0.04);

  const memRot = sx < 0 ? 0.32 : -0.32;
  addPart(
    wing,
    new THREE.BoxGeometry(0.48, 0.045, 0.42),
    wingMem,
    sx * 0.26,
    0.05,
    -0.1,
    [0, 0, memRot]
  );
  addPart(
    wing,
    new THREE.BoxGeometry(0.36, 0.035, 0.3),
    wingMemLight,
    sx * 0.42,
    0.08,
    -0.16,
    [0, 0, memRot * 1.15]
  );
  addPart(
    wing,
    new THREE.BoxGeometry(0.22, 0.03, 0.2),
    wingMem,
    sx * 0.52,
    0.1,
    -0.2,
    [0, 0, memRot * 1.3]
  );

  for (let i = 0; i < 3; i++) {
    addPart(
      wing,
      new THREE.BoxGeometry(0.04, 0.03, 0.14 + i * 0.06),
      wingBone,
      sx * (0.1 + i * 0.14),
      0.01,
      -0.06 - i * 0.04,
      [0, 0, memRot * (0.5 + i * 0.25)]
    );
  }
}

export function buildMysteryDragonRoot() {
  const root = new THREE.Group();
  root.name = "MysteryDragonRoot";

  const body = new THREE.Group();
  body.name = "MysteryDragonBody";
  root.add(body);

  const scale = mat(palette.scale);
  const scaleMid = mat(palette.scaleMid);
  const scaleDark = mat(palette.scaleDark);
  const scaleDeep = mat(palette.scaleDeep);
  const belly = mat(palette.belly);
  const bellyLight = mat(palette.bellyLight);
  const plate = mat(palette.plate);
  const horn = mat(palette.horn);
  const hornDark = mat(palette.hornDark);
  const eye = mat(palette.eye, { emissive: 0xf59e0b, emissiveIntensity: 0.42 });
  const eyeRing = mat(palette.eyeRing);
  const eyeShine = mat(palette.eyeShine);
  const pupil = mat(palette.pupil);
  const beak = mat(palette.beak);
  const beakLight = mat(palette.beakLight);
  const beakTip = mat(palette.beakTip);
  const wingBone = mat(palette.wingBone);
  const wingMem = mat(palette.wingMem, { emissive: 0x4c1d95, emissiveIntensity: 0.14 });
  const wingMemLight = mat(palette.wingMemLight, { emissive: 0x6d28d9, emissiveIntensity: 0.1 });
  const claw = mat(palette.claw);
  const clawDark = mat(palette.clawDark);
  const crystal = mat(palette.crystal, { emissive: 0x9333ea, emissiveIntensity: 0.22 });
  const crystalCore = mat(palette.crystalCore, { emissive: 0xc084fc, emissiveIntensity: 0.35 });

  const mats = {
    scaleDark,
    scaleDeep,
    eyeRing,
    eye,
    pupil,
    eyeShine,
    wingBone,
    wingMem,
    wingMemLight,
    claw,
    clawDark,
  };

  /* ── 胴体 ── */
  addPart(body, new THREE.BoxGeometry(0.56, 0.34, 0.68), scale, 0, 0.54, 0);
  addPart(body, new THREE.BoxGeometry(0.48, 0.2, 0.58), belly, 0, 0.44, 0.03);
  addPart(body, new THREE.BoxGeometry(0.42, 0.1, 0.4), bellyLight, 0, 0.38, 0.05);
  addPart(body, new THREE.BoxGeometry(0.18, 0.14, 0.22), scaleMid, -0.28, 0.62, 0.06);
  addPart(body, new THREE.BoxGeometry(0.18, 0.14, 0.22), scaleMid, 0.28, 0.62, 0.06);

  for (const [z, h] of [
    [0.18, 0.1],
    [0.02, 0.11],
    [-0.14, 0.1],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.14, h, 0.12), plate, 0, 0.68 + h * 0.5, z);
  }

  /* 胸のクリスタル（ミステリー ラーヴァ進化のモチーフ） */
  addPart(body, new THREE.OctahedronGeometry(0.07, 0), crystal, 0, 0.58, 0.28, [0.3, 0.4, 0]);
  addPart(body, new THREE.OctahedronGeometry(0.035, 0), crystalCore, 0, 0.58, 0.31, [0.3, 0.4, 0]);

  /* ── 首 ── */
  addPart(body, new THREE.BoxGeometry(0.24, 0.22, 0.24), scaleMid, 0, 0.66, 0.22);
  addPart(body, new THREE.BoxGeometry(0.2, 0.14, 0.18), scale, 0, 0.62, 0.34);

  /* ── 頭 ── */
  const head = new THREE.Group();
  head.name = "MysteryDragonHead";
  head.position.set(0, 0.66, 0.38);
  body.add(head);

  addPart(head, new THREE.BoxGeometry(0.4, 0.3, 0.34), scale, 0, 0.1, 0.06);
  addPart(head, new THREE.BoxGeometry(0.34, 0.08, 0.28), plate, 0, 0.26, 0.02);
  addPart(head, new THREE.BoxGeometry(0.12, 0.06, 0.1), plate, -0.2, 0.08, 0.08);
  addPart(head, new THREE.BoxGeometry(0.12, 0.06, 0.1), plate, 0.2, 0.08, 0.08);

  /* 長いくちばし */
  addPart(head, new THREE.BoxGeometry(0.16, 0.1, 0.32), beak, 0, 0.04, 0.34);
  addPart(head, new THREE.BoxGeometry(0.13, 0.08, 0.26), beakLight, 0, 0.06, 0.48);
  addPart(head, new THREE.BoxGeometry(0.1, 0.07, 0.2), beakTip, 0, 0.05, 0.62);
  addPart(head, new THREE.ConeGeometry(0.045, 0.12, 4), beakTip, 0, 0.04, 0.74, [0.42, 0, 0]);
  addPart(head, new THREE.BoxGeometry(0.14, 0.06, 0.24), scaleDeep, 0, -0.06, 0.32);
  addPart(head, new THREE.BoxGeometry(0.11, 0.05, 0.16), beak, 0, -0.08, 0.44);
  addPart(head, new THREE.BoxGeometry(0.03, 0.025, 0.02), scaleDeep, -0.035, 0.02, 0.56);
  addPart(head, new THREE.BoxGeometry(0.03, 0.025, 0.02), scaleDeep, 0.035, 0.02, 0.56);

  /* 目 */
  addEye(head, mats, -1);
  addEye(head, mats, 1);

  /* 角・額のクリスタル */
  addPart(head, new THREE.ConeGeometry(0.05, 0.24, 4), horn, -0.15, 0.3, -0.02, [0.35, 0, 0.35]);
  addPart(head, new THREE.ConeGeometry(0.05, 0.24, 4), horn, 0.15, 0.3, -0.02, [0.35, 0, -0.35]);
  addPart(head, new THREE.ConeGeometry(0.035, 0.14, 4), hornDark, -0.09, 0.28, 0.06, [0.25, 0, 0.15]);
  addPart(head, new THREE.ConeGeometry(0.035, 0.14, 4), hornDark, 0.09, 0.28, 0.06, [0.25, 0, -0.15]);
  addPart(head, new THREE.OctahedronGeometry(0.05, 0), crystal, 0, 0.32, 0.1, [0.2, 0.5, 0]);
  addPart(head, new THREE.OctahedronGeometry(0.025, 0), crystalCore, 0, 0.32, 0.13, [0.2, 0.5, 0]);

  /* ── 翼 ── */
  addWing(body, mats, -1);
  addWing(body, mats, 1);

  /* ── 脚 ── */
  addLeg(body, mats, -0.22, 0.22, true);
  addLeg(body, mats, 0.22, 0.22, true);
  addLeg(body, mats, -0.22, -0.22, false);
  addLeg(body, mats, 0.22, -0.22, false);

  /* ── 尻尾 ── */
  addPart(body, new THREE.BoxGeometry(0.11, 0.1, 0.24), scaleDark, 0, 0.5, -0.4);
  addPart(body, new THREE.BoxGeometry(0.1, 0.09, 0.22), scaleMid, 0.02, 0.52, -0.58);
  addPart(body, new THREE.BoxGeometry(0.08, 0.08, 0.18), scale, 0.04, 0.54, -0.72, [0, 0, 0.12]);
  addPart(body, new THREE.BoxGeometry(0.06, 0.06, 0.14), scaleDark, 0.06, 0.56, -0.84, [0, 0, 0.22]);
  addPart(body, new THREE.ConeGeometry(0.07, 0.18, 4), horn, 0.08, 0.58, -0.94, [0.55, 0, 0.28]);
  addPart(body, new THREE.OctahedronGeometry(0.045, 0), crystal, 0.09, 0.6, -1.02, [0.4, 0.3, 0.2]);

  return root;
}

await exportPetGlb(buildMysteryDragonRoot, "MysteryDragon.glb", { wingFlap: true });
