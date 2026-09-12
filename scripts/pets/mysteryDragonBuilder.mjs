/**
 * ミステリー ドラゴン — 低ポリビルダー（パレット差し替え可）
 * 目は正面（くちばし上）に2つ — 横目のスケールバンプは付けない
 */
import * as THREE from "three";
import { addPart, mat } from "../petGlbShared.mjs";
import { MOE_DRAGON_VARIANTS } from "./dragonVariantCatalog.mjs";

const DEFAULT_PALETTE = MOE_DRAGON_VARIANTS[0].palette;

/** 正面の目（左右2つ · くちばし方向を向く） */
function addFrontEyes(head, materials) {
  const { eyeRing, eye, pupil, eyeShine } = materials;
  for (const sx of [-1, 1]) {
    const ex = sx * 0.085;
    const ey = 0.18;
    const ez = 0.17;

    let m = addPart(
      head,
      new THREE.BoxGeometry(0.11, 0.09, 0.04),
      eyeRing,
      ex,
      ey,
      ez
    );
    m.name = sx < 0 ? "MysteryDragonEyeRingL" : "MysteryDragonEyeRingR";

    m = addPart(
      head,
      new THREE.SphereGeometry(0.052, 8, 8),
      eye,
      ex,
      ey,
      ez + 0.035
    );
    m.name = sx < 0 ? "MysteryDragonEyeL" : "MysteryDragonEyeR";

    m = addPart(
      head,
      new THREE.BoxGeometry(0.02, 0.04, 0.018),
      pupil,
      ex,
      ey,
      ez + 0.055
    );
    m.name = sx < 0 ? "MysteryDragonPupilL" : "MysteryDragonPupilR";

    m = addPart(
      head,
      new THREE.SphereGeometry(0.012, 4, 4),
      eyeShine,
      ex - sx * 0.015,
      ey + 0.02,
      ez + 0.062
    );
    m.name = sx < 0 ? "MysteryDragonEyeShineL" : "MysteryDragonEyeShineR";
  }
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

function buildMaterials(palette) {
  const p = { ...DEFAULT_PALETTE, ...palette };
  const scale = mat(p.scale);
  const scaleMid = mat(p.scaleMid);
  const scaleDark = mat(p.scaleDark);
  const scaleDeep = mat(p.scaleDeep);
  const belly = mat(p.belly);
  const bellyLight = mat(p.bellyLight);
  const plate = mat(p.plate);
  const horn = mat(p.horn);
  const hornDark = mat(p.hornDark);
  const eye = mat(p.eye, { emissive: p.eye & 0xfefefe, emissiveIntensity: 0.42 });
  const eyeRing = mat(p.eyeRing);
  const eyeShine = mat(p.eyeShine);
  const pupil = mat(p.pupil);
  const beak = mat(p.beak);
  const beakLight = mat(p.beakLight);
  const beakTip = mat(p.beakTip);
  const wingBone = mat(p.wingBone);
  const wingMem = mat(p.wingMem, {
    emissive: p.wingMem,
    emissiveIntensity: 0.14,
  });
  const wingMemLight = mat(p.wingMemLight, {
    emissive: p.wingMemLight,
    emissiveIntensity: 0.1,
  });
  const claw = mat(p.claw);
  const clawDark = mat(p.clawDark);
  const crystal = mat(p.crystal, {
    emissive: p.crystal,
    emissiveIntensity: 0.22,
  });
  const crystalCore = mat(p.crystalCore, {
    emissive: p.crystalCore,
    emissiveIntensity: 0.35,
  });

  return {
    mats: {
      scale,
      scaleMid,
      scaleDark,
      scaleDeep,
      belly,
      bellyLight,
      plate,
      horn,
      hornDark,
      eyeRing,
      eye,
      pupil,
      eyeShine,
      wingBone,
      wingMem,
      wingMemLight,
      claw,
      clawDark,
      crystal,
      crystalCore,
      beak,
      beakLight,
      beakTip,
    },
    p,
  };
}

/** @param {import("./dragonVariantCatalog.mjs").DragonPalette} [palette] */
export function buildMysteryDragonRoot(palette = DEFAULT_PALETTE) {
  const { mats, p } = buildMaterials(palette);
  const {
    scale,
    scaleMid,
    scaleDark,
    scaleDeep,
    belly,
    bellyLight,
    plate,
    horn,
    hornDark,
    crystal,
    crystalCore,
    beak,
    beakLight,
    beakTip,
  } = mats;

  const root = new THREE.Group();
  root.name = "MysteryDragonRoot";

  const body = new THREE.Group();
  body.name = "MysteryDragonBody";
  root.add(body);

  /* ── 胴体（横の目っぽいバンプは付けない） ── */
  addPart(body, new THREE.BoxGeometry(0.56, 0.34, 0.68), scale, 0, 0.54, 0);
  addPart(body, new THREE.BoxGeometry(0.48, 0.2, 0.58), belly, 0, 0.44, 0.03);
  addPart(body, new THREE.BoxGeometry(0.42, 0.1, 0.4), bellyLight, 0, 0.38, 0.05);

  for (const [z, h] of [
    [0.18, 0.1],
    [0.02, 0.11],
    [-0.14, 0.1],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.14, h, 0.12), plate, 0, 0.68 + h * 0.5, z);
  }

  addPart(body, new THREE.OctahedronGeometry(0.07, 0), crystal, 0, 0.58, 0.28, [0.3, 0.4, 0]);
  addPart(body, new THREE.OctahedronGeometry(0.035, 0), crystalCore, 0, 0.58, 0.31, [0.3, 0.4, 0]);

  addPart(body, new THREE.BoxGeometry(0.24, 0.22, 0.24), scaleMid, 0, 0.66, 0.22);
  addPart(body, new THREE.BoxGeometry(0.2, 0.14, 0.18), scale, 0, 0.62, 0.34);

  const head = new THREE.Group();
  head.name = "MysteryDragonHead";
  head.position.set(0, 0.66, 0.38);
  body.add(head);

  addPart(head, new THREE.BoxGeometry(0.4, 0.3, 0.34), scale, 0, 0.1, 0.06);
  addPart(head, new THREE.BoxGeometry(0.34, 0.08, 0.28), plate, 0, 0.26, 0.02);

  addPart(head, new THREE.BoxGeometry(0.16, 0.1, 0.32), beak, 0, 0.04, 0.34);
  addPart(head, new THREE.BoxGeometry(0.13, 0.08, 0.26), beakLight, 0, 0.06, 0.48);
  addPart(head, new THREE.BoxGeometry(0.1, 0.07, 0.2), beakTip, 0, 0.05, 0.62);
  addPart(head, new THREE.ConeGeometry(0.045, 0.12, 4), beakTip, 0, 0.04, 0.74, [0.42, 0, 0]);
  addPart(head, new THREE.BoxGeometry(0.14, 0.06, 0.24), scaleDeep, 0, -0.06, 0.32);
  addPart(head, new THREE.BoxGeometry(0.11, 0.05, 0.16), beak, 0, -0.08, 0.44);
  addPart(head, new THREE.BoxGeometry(0.03, 0.025, 0.02), scaleDeep, -0.035, 0.02, 0.56);
  addPart(head, new THREE.BoxGeometry(0.03, 0.025, 0.02), scaleDeep, 0.035, 0.02, 0.56);

  addFrontEyes(head, mats);

  addPart(head, new THREE.ConeGeometry(0.05, 0.24, 4), horn, -0.15, 0.3, -0.02, [0.35, 0, 0.35]);
  addPart(head, new THREE.ConeGeometry(0.05, 0.24, 4), horn, 0.15, 0.3, -0.02, [0.35, 0, -0.35]);
  addPart(head, new THREE.ConeGeometry(0.035, 0.14, 4), hornDark, -0.09, 0.28, 0.06, [0.25, 0, 0.15]);
  addPart(head, new THREE.ConeGeometry(0.035, 0.14, 4), hornDark, 0.09, 0.28, 0.06, [0.25, 0, -0.15]);
  addPart(head, new THREE.OctahedronGeometry(0.05, 0), crystal, 0, 0.32, 0.1, [0.2, 0.5, 0]);
  addPart(head, new THREE.OctahedronGeometry(0.025, 0), crystalCore, 0, 0.32, 0.13, [0.2, 0.5, 0]);

  addWing(body, mats, -1);
  addWing(body, mats, 1);

  addLeg(body, mats, -0.22, 0.22, true);
  addLeg(body, mats, 0.22, 0.22, true);
  addLeg(body, mats, -0.22, -0.22, false);
  addLeg(body, mats, 0.22, -0.22, false);

  addPart(body, new THREE.BoxGeometry(0.11, 0.1, 0.24), scaleDark, 0, 0.5, -0.4);
  addPart(body, new THREE.BoxGeometry(0.1, 0.09, 0.22), scaleMid, 0.02, 0.52, -0.58);
  addPart(body, new THREE.BoxGeometry(0.08, 0.08, 0.18), scale, 0.04, 0.54, -0.72, [0, 0, 0.12]);
  addPart(body, new THREE.BoxGeometry(0.06, 0.06, 0.14), scaleDark, 0.06, 0.56, -0.84, [0, 0, 0.22]);
  addPart(body, new THREE.ConeGeometry(0.07, 0.18, 4), horn, 0.08, 0.58, -0.94, [0.55, 0, 0.28]);
  addPart(body, new THREE.OctahedronGeometry(0.045, 0), crystal, 0.09, 0.6, -1.02, [0.4, 0.3, 0.2]);

  root.userData.dragonPaletteId = p.id;
  return root;
}
