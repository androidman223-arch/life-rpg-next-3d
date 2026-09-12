/**
 * ドラゴン glb 共通 — マテリアル・目・羽・命名（アニメ互換）
 */
import * as THREE from "three";
import { addPart, mat } from "../petGlbShared.mjs";

/** @param {Record<string, number>} palette */
export function buildDragonMaterials(palette) {
  const p = palette;
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
  const wingMem = mat(p.wingMem, { emissive: p.wingMem, emissiveIntensity: 0.14 });
  const wingMemLight = mat(p.wingMemLight, {
    emissive: p.wingMemLight,
    emissiveIntensity: 0.1,
  });
  const claw = mat(p.claw);
  const clawDark = mat(p.clawDark);
  const crystal = mat(p.crystal, { emissive: p.crystal, emissiveIntensity: 0.22 });
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

/** @param {string} prefix @param {string} [paletteId] */
export function createDragonRoot(prefix, paletteId = "") {
  const root = new THREE.Group();
  root.name = `${prefix}Root`;
  if (paletteId) root.userData.dragonPaletteId = paletteId;
  return root;
}

/** @param {THREE.Group} root @param {string} prefix */
export function createDragonBody(root, prefix) {
  const body = new THREE.Group();
  body.name = `${prefix}Body`;
  root.add(body);
  return body;
}

/**
 * 正面の目（くちばし方向）
 * @param {THREE.Group} head
 * @param {ReturnType<buildDragonMaterials>["mats"]} materials
 * @param {{ ex?: number, ey?: number, ez?: number, tag?: string }} [opts]
 */
export function addFrontEyes(head, materials, opts = {}) {
  const { eyeRing, eye, pupil, eyeShine } = materials;
  const ex = opts.ex ?? 0.085;
  const ey = opts.ey ?? 0.18;
  const ez = opts.ez ?? 0.17;
  const tag = opts.tag ?? "Dragon";

  for (const sx of [-1, 1]) {
    const px = sx * ex;
    let m = addPart(
      head,
      new THREE.BoxGeometry(0.11, 0.09, 0.04),
      eyeRing,
      px,
      ey,
      ez
    );
    m.name = sx < 0 ? `${tag}EyeRingL` : `${tag}EyeRingR`;

    m = addPart(head, new THREE.SphereGeometry(0.052, 8, 8), eye, px, ey, ez + 0.035);
    m.name = sx < 0 ? `${tag}EyeL` : `${tag}EyeR`;

    m = addPart(head, new THREE.BoxGeometry(0.02, 0.04, 0.018), pupil, px, ey, ez + 0.055);
    m.name = sx < 0 ? `${tag}PupilL` : `${tag}PupilR`;

    m = addPart(
      head,
      new THREE.SphereGeometry(0.012, 4, 4),
      eyeShine,
      px - sx * 0.015,
      ey + 0.02,
      ez + 0.062
    );
    m.name = sx < 0 ? `${tag}EyeShineL` : `${tag}EyeShineR`;
  }
}

/** 標準四足 */
export function addQuadrupedLegs(body, materials, sx = 0.22, sz = 0.22) {
  const { scaleDark, scaleDeep, claw, clawDark } = materials;
  for (const [x, z, front] of [
    [-sx, sz, true],
    [sx, sz, true],
    [-sx, -sz, false],
    [sx, -sz, false],
  ]) {
    const thighY = front ? 0.26 : 0.24;
    addPart(body, new THREE.BoxGeometry(0.11, 0.2, 0.12), scaleDark, x, thighY, z);
    addPart(
      body,
      new THREE.BoxGeometry(0.09, 0.16, 0.1),
      scaleDeep,
      x,
      0.14,
      z + (front ? 0.04 : -0.02)
    );
    addPart(body, new THREE.BoxGeometry(0.11, 0.05, 0.13), clawDark, x, 0.06, z + 0.05);
    for (const ox of [-0.035, 0, 0.035]) {
      addPart(body, new THREE.BoxGeometry(0.025, 0.07, 0.025), claw, x + ox, 0.03, z + 0.1);
    }
  }
}

/**
 * 膜翼（アニメ WingL/R）
 * @param {THREE.Group} parent
 * @param {ReturnType<buildDragonMaterials>["mats"]} materials
 * @param {number} side
 * @param {string} prefix
 * @param {{ y?: number, z?: number, span?: number }} [opts]
 */
export function addMembraneWing(parent, materials, side, prefix, opts = {}) {
  const sx = side;
  const wing = new THREE.Group();
  wing.name = sx < 0 ? `${prefix}WingL` : `${prefix}WingR`;
  wing.position.set(sx * (opts.x ?? 0.34), opts.y ?? 0.68, opts.z ?? -0.06);
  parent.add(wing);

  const { wingBone, wingMem, wingMemLight, scaleDark } = materials;
  const span = opts.span ?? 1;
  addPart(wing, new THREE.BoxGeometry(0.1, 0.08, 0.22), wingBone, 0, 0, 0);
  addPart(wing, new THREE.BoxGeometry(0.08, 0.05, 0.18), scaleDark, sx * 0.04, -0.02, -0.04);

  const memRot = sx < 0 ? 0.32 : -0.32;
  addPart(
    wing,
    new THREE.BoxGeometry(0.48 * span, 0.045, 0.42 * span),
    wingMem,
    sx * 0.26 * span,
    0.05,
    -0.1,
    [0, 0, memRot]
  );
  addPart(
    wing,
    new THREE.BoxGeometry(0.36 * span, 0.035, 0.3 * span),
    wingMemLight,
    sx * 0.42 * span,
    0.08,
    -0.16,
    [0, 0, memRot * 1.15]
  );
  addPart(
    wing,
    new THREE.BoxGeometry(0.22 * span, 0.03, 0.2 * span),
    wingMem,
    sx * 0.52 * span,
    0.1,
    -0.2,
    [0, 0, memRot * 1.3]
  );
}

/** ヒレ翼（海竜・千年竜の小翼） */
export function addFinWing(parent, materials, side, prefix, opts = {}) {
  const sx = side;
  const wing = new THREE.Group();
  wing.name = sx < 0 ? `${prefix}WingL` : `${prefix}WingR`;
  wing.position.set(sx * (opts.x ?? 0.28), opts.y ?? 0.55, opts.z ?? 0);
  parent.add(wing);

  const { wingMem, wingMemLight, scaleMid } = materials;
  const tilt = sx < 0 ? 0.45 : -0.45;
  addPart(wing, new THREE.BoxGeometry(0.06, 0.04, 0.14), scaleMid, 0, 0, 0);
  addPart(
    wing,
    new THREE.BoxGeometry(0.34, 0.025, 0.28),
    wingMem,
    sx * 0.18,
    0.02,
    -0.04,
    [0.15, 0, tilt]
  );
  addPart(
    wing,
    new THREE.BoxGeometry(0.22, 0.02, 0.18),
    wingMemLight,
    sx * 0.28,
    0.04,
    -0.08,
    [0.2, 0, tilt * 1.1]
  );
}

/** 結晶翼（板状） */
export function addCrystalWingPlates(parent, materials, side, prefix) {
  const sx = side;
  const wing = new THREE.Group();
  wing.name = sx < 0 ? `${prefix}WingL` : `${prefix}WingR`;
  wing.position.set(sx * 0.3, 0.62, -0.04);
  parent.add(wing);

  const { crystal, crystalCore, wingBone } = materials;
  addPart(wing, new THREE.BoxGeometry(0.08, 0.06, 0.16), wingBone, 0, 0, 0);
  for (const [ox, oy, oz, ry, h] of [
    [0.14, 0.04, -0.06, 0.5, 0.38],
    [0.24, 0.1, -0.12, 0.65, 0.28],
    [0.32, 0.14, -0.16, 0.78, 0.18],
  ]) {
    addPart(
      wing,
      new THREE.OctahedronGeometry(h * 0.5, 0),
      crystal,
      sx * ox,
      oy,
      oz,
      [0.2, ry * sx, 0.35 * sx]
    );
    addPart(
      wing,
      new THREE.BoxGeometry(0.04, h, 0.06),
      crystalCore,
      sx * ox,
      oy,
      oz,
      [0, ry * sx, 0.2 * sx]
    );
  }
}

/** 体節を S 字に並べる（東洋竜・海竜） */
export function addSerpentSegments(body, materials, count, opts = {}) {
  const { scale, scaleMid, belly, plate } = materials;
  const step = opts.step ?? 0.22;
  const startY = opts.startY ?? 0.38;
  const startZ = opts.startZ ?? 0.2;
  const amp = opts.amp ?? 0.08;
  const taper = opts.taper ?? 0.92;
  let w = opts.width ?? 0.42;
  let h = opts.height ?? 0.28;

  for (let i = 0; i < count; i++) {
    const t = i / Math.max(count - 1, 1);
    const y = startY + Math.sin(t * Math.PI * 1.6) * amp;
    const z = startZ - i * step;
    const matUse = i % 3 === 1 ? scaleMid : scale;
    addPart(body, new THREE.BoxGeometry(w, h, step * 0.95), matUse, 0, y, z);
    if (i % 2 === 0) {
      addPart(body, new THREE.BoxGeometry(w * 0.72, h * 0.45, step * 0.55), belly, 0, y - h * 0.22, z + 0.02);
    }
    if (opts.spinePlates && i % 2 === 0) {
      addPart(
        body,
        new THREE.BoxGeometry(w * 0.22, 0.08, step * 0.5),
        plate,
        0,
        y + h * 0.52,
        z
      );
    }
    w *= taper;
    h *= taper;
  }
}
