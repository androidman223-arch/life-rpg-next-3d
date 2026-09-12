/**
 * ストーム パニッシャー — ハティル砂漠 Lv180 大ボス
 * 超大型ドラゴン · ポリゴン数 ≈ 通常敵の10倍（6000〜8000三角）
 */
import * as THREE from "three";
import { addPart } from "../petGlbShared.mjs";
import {
  buildDragonMaterials,
  createDragonBody,
  createDragonRoot,
} from "../pets/dragonShared.mjs";

/** @param {number} v */
function s(v) {
  return v * 2.85;
}

/** @param {THREE.Group} parent @param {THREE.BufferGeometry} geo @param {THREE.Material} mat @param {number} x @param {number} y @param {number} z @param {[number,number,number]} [rot] */
function sp(parent, geo, mat, x, y, z, rot = [0, 0, 0]) {
  return addPart(parent, geo, mat, s(x), s(y), s(z), rot);
}

/** 節間の肉付け（球 + 短円柱） */
function spJointFill(parent, mats, x, y, z, rw, rh, rz) {
  const { scaleMid, belly, scaleDark } = mats;
  sp(parent, new THREE.SphereGeometry(rw, 8, 8), scaleMid, x, y, z);
  sp(parent, new THREE.SphereGeometry(rw * 0.82, 8, 8), belly, x, y - rh * 0.35, z + 0.02);
  sp(
    parent,
    new THREE.BoxGeometry(rw * 1.65, rh, rz),
    scaleDark,
    x,
    y,
    z
  );
}

/**
 * @param {THREE.Group} parent
 * @param {ReturnType<buildDragonMaterials>["mats"]} mats
 * @param {number} cx @param {number} cy @param {number} cz
 * @param {number} count
 */
function addScaleRing(parent, mats, cx, cy, cz, count, radius = 0.22) {
  const { scaleMid, plate, horn } = mats;
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2;
    const px = cx + Math.cos(ang) * radius;
    const pz = cz + Math.sin(ang) * radius;
    sp(
      parent,
      new THREE.ConeGeometry(0.045, 0.11, 5),
      i % 3 === 0 ? plate : scaleMid,
      px,
      cy,
      pz,
      [0.55, ang, 0.12]
    );
    if (i % 2 === 0) {
      sp(
        parent,
        new THREE.BoxGeometry(0.06, 0.025, 0.05),
        horn,
        px,
        cy + 0.04,
        pz,
        [0.2, ang, 0.08]
      );
    }
  }
}

/**
 * @param {THREE.Group} parent
 * @param {ReturnType<buildDragonMaterials>["mats"]} mats
 * @param {number} side
 * @param {number} span
 */
function addStormWing(parent, mats, side, span) {
  const sx = side;
  const prefix = "StormPunisher";
  const wing = new THREE.Group();
  wing.name = sx < 0 ? `${prefix}WingL` : `${prefix}WingR`;
  wing.position.set(s(sx * 0.52), s(1.05), s(-0.08));
  parent.add(wing);

  const { wingBone, wingMem, wingMemLight, scaleDark, crystal, horn } = mats;
  const memRot = sx < 0 ? 0.28 : -0.28;

  sp(wing, new THREE.BoxGeometry(0.22, 0.16, 0.24), scaleDark, sx * 0.06, 0.04, -0.02);
  sp(wing, new THREE.SphereGeometry(0.11, 8, 8), wingBone, sx * 0.04, 0.06, 0.02);
  for (let i = 0; i < 4; i++) {
    sp(wing, new THREE.BoxGeometry(0.12, 0.09, 0.28), wingBone, sx * i * 0.08, 0.02 - i * 0.02, -i * 0.06);
    sp(
      wing,
      new THREE.CylinderGeometry(0.035, 0.05, 0.18, 8),
      scaleDark,
      sx * (0.06 + i * 0.05),
      -0.04,
      -0.04 - i * 0.05,
      [0.4, sx * 0.15, 0]
    );
    if (i < 3) {
      sp(
        wing,
        new THREE.SphereGeometry(0.055, 8, 8),
        wingBone,
        sx * (0.04 + i * 0.05),
        0,
        -0.03 - i * 0.05
      );
    }
  }

  const layers = [
    [0.62 * span, 0.06, 0.52 * span, 0.28, 0.06, -0.12, memRot],
    [0.52 * span, 0.05, 0.44 * span, 0.42, 0.08, -0.18, memRot * 1.1],
    [0.42 * span, 0.045, 0.36 * span, 0.54, 0.1, -0.24, memRot * 1.2],
    [0.32 * span, 0.04, 0.28 * span, 0.64, 0.12, -0.3, memRot * 1.35],
    [0.22 * span, 0.035, 0.2 * span, 0.72, 0.14, -0.36, memRot * 1.5],
  ];
  for (const [w, h, d, ox, oy, oz, rot] of layers) {
    sp(
      wing,
      new THREE.BoxGeometry(w, h, d),
      wingMem,
      sx * ox,
      oy,
      oz,
      [0, 0, rot]
    );
    sp(
      wing,
      new THREE.BoxGeometry(w * 0.82, h * 0.75, d * 0.78),
      wingMemLight,
      sx * (ox + 0.06),
      oy + 0.025,
      oz - 0.04,
      [0.05, 0, rot * 1.05]
    );
  }

  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    sp(
      wing,
      new THREE.ConeGeometry(0.035, 0.16 + t * 0.08, 5),
      horn,
      sx * (0.35 + t * 0.48) * span,
      0.1 + t * 0.04,
      -0.14 - t * 0.22,
      [0.35, sx * 0.2, memRot * (1 + t * 0.2)]
    );
  }

  for (let i = 0; i < 3; i++) {
    sp(
      wing,
      new THREE.OctahedronGeometry(0.07 + i * 0.015, 0),
      crystal,
      sx * (0.5 + i * 0.12) * span,
      0.12 + i * 0.03,
      -0.2 - i * 0.08,
      [0.2, sx * 0.3, 0.15]
    );
  }
}

/**
 * @param {THREE.Group} body
 * @param {ReturnType<buildDragonMaterials>["mats"]} mats
 * @param {[number,number,number, boolean][]} legSpecs [x,z,front]
 */
function addStormLegs(body, mats, legSpecs) {
  const { scaleDark, scaleDeep, scaleMid, claw, clawDark, plate } = mats;
  for (const [x, z, front] of legSpecs) {
    const thighH = front ? 0.38 : 0.34;
    sp(body, new THREE.SphereGeometry(0.12, 8, 8), scaleDark, x, 0.38, z);
    sp(body, new THREE.BoxGeometry(0.18, thighH, 0.2), scaleDark, x, 0.22, z);
    sp(body, new THREE.SphereGeometry(0.1, 8, 8), scaleMid, x, 0.12, z + (front ? 0.03 : -0.01));
    sp(body, new THREE.CylinderGeometry(0.09, 0.11, 0.28, 10), scaleMid, x, 0.08, z + (front ? 0.06 : -0.02));
    sp(body, new THREE.BoxGeometry(0.14, 0.12, 0.16), scaleDeep, x, 0.02, z + 0.08);
    sp(body, new THREE.BoxGeometry(0.16, 0.06, 0.2), clawDark, x, 0.01, z + 0.12);
    for (const ox of [-0.05, -0.015, 0.02, 0.055]) {
      sp(body, new THREE.ConeGeometry(0.022, 0.12, 4), claw, x + ox, 0.005, z + 0.2, [0.45, 0, 0.08]);
    }
    sp(body, new THREE.BoxGeometry(0.1, 0.08, 0.12), plate, x, 0.28, z - 0.04, [0.15, 0, 0]);
    sp(body, new THREE.SphereGeometry(0.06, 8, 8), scaleMid, x, 0.18, z + 0.02);
  }
}

/**
 * @param {Record<string, number>} palette
 * @param {number} [variantIndex=0]
 */
export function buildStormPunisher(palette, variantIndex = 0) {
  const prefix = "StormPunisher";
  const { mats } = buildDragonMaterials(palette);
  const root = createDragonRoot(prefix, palette.id);
  const body = createDragonBody(root, prefix);
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
    beak,
    beakLight,
    crystal,
    crystalCore,
    wingMemLight,
  } = mats;

  /* ── 胸郭・肩 ── */
  sp(body, new THREE.BoxGeometry(0.92, 0.62, 1.05), scale, 0, 0.72, 0.18);
  sp(body, new THREE.BoxGeometry(0.78, 0.48, 0.88), scaleMid, 0, 0.68, 0.22);
  sp(body, new THREE.BoxGeometry(0.62, 0.32, 0.72), belly, 0, 0.58, 0.28);
  sp(body, new THREE.BoxGeometry(0.48, 0.18, 0.52), bellyLight, 0, 0.52, 0.32);
  for (const sx of [-1, 1]) {
    sp(body, new THREE.BoxGeometry(0.38, 0.42, 0.48), scaleDark, sx * 0.52, 0.78, 0.08);
    sp(body, new THREE.SphereGeometry(0.14, 10, 10), scaleMid, sx * 0.58, 0.92, 0.02);
    sp(body, new THREE.ConeGeometry(0.08, 0.28, 6), horn, sx * 0.48, 1.02, -0.06, [0.15, sx * 0.2, 0.25]);
  }

  /* ── 胴体〜尾（20節 · 鱗リング） ── */
  const torsoCount = 20;
  let tw = 0.72;
  let th = 0.48;
  let ty = 0.66;
  let tz = -0.22;
  for (let i = 0; i < torsoCount; i++) {
    const t = i / Math.max(torsoCount - 1, 1);
    const wave = Math.sin(t * Math.PI * 1.8) * 0.06;
    const matUse = i % 3 === 1 ? scaleMid : i % 3 === 2 ? scaleDark : scale;
    sp(body, new THREE.BoxGeometry(tw, th, 0.38), matUse, 0, ty + wave, tz);
    sp(body, new THREE.BoxGeometry(tw * 0.88, th * 0.72, 0.28), matUse, 0, ty + wave, tz);
    sp(body, new THREE.BoxGeometry(tw * 0.78, th * 0.42, 0.22), belly, 0, ty + wave - th * 0.28, tz + 0.03);
    sp(
      body,
      new THREE.BoxGeometry(tw * 0.28, 0.1, 0.26),
      plate,
      0,
      ty + wave + th * 0.52,
      tz
    );
    addScaleRing(body, mats, 0, ty + wave + th * 0.38, tz, 10 + (i % 3), tw * 0.42);
    if (i % 4 === 0) {
      sp(body, new THREE.ConeGeometry(0.07, 0.22, 6), hornDark, 0, ty + wave + th * 0.62, tz, [0.2, 0, 0]);
    }
    if (i < torsoCount - 1) {
      spJointFill(body, mats, 0, ty + wave - th * 0.08, tz - 0.16, tw * 0.36, th * 0.55, 0.14);
      for (const sx of [-1, 1]) {
        sp(
          body,
          new THREE.BoxGeometry(tw * 0.22, th * 0.48, 0.12),
          scaleMid,
          sx * tw * 0.42,
          ty + wave,
          tz - 0.12
        );
      }
    }
    tz -= 0.24;
    tw *= 0.965;
    th *= 0.962;
  }

  spJointFill(body, mats, 0, 0.7, 0.08, 0.38, 0.42, 0.22);

  /* ── 尾先（棘 · 扇） ── */
  for (let i = 0; i < 8; i++) {
    const spread = (i - 3.5) * 0.14;
    sp(
      body,
      new THREE.BoxGeometry(0.06, 0.38 + Math.abs(spread) * 0.12, 0.16),
      wingMemLight,
      spread * 0.32,
      0.52 + Math.abs(spread) * 0.08,
      tz - 0.12 - i * 0.08,
      [0.35, spread * 0.45, 0]
    );
    sp(
      body,
      new THREE.ConeGeometry(0.04, 0.18, 5),
      horn,
      spread * 0.28,
      0.48,
      tz - 0.18 - i * 0.07,
      [0.5, spread * 0.35, 0.05]
    );
  }
  sp(body, new THREE.ConeGeometry(0.12, 0.42, 7), crystalCore, 0, 0.58, tz - 0.55, [0.35, 0, 0]);
  sp(body, new THREE.SphereGeometry(0.1, 10, 10), crystal, 0, 0.62, tz - 0.62);

  /* ── 首（6節） ── */
  const neck = new THREE.Group();
  neck.position.set(0, s(0.82), s(0.62));
  body.add(neck);
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < 6; i++) {
    const nw = 0.34 - i * 0.025;
    sp(neck, new THREE.BoxGeometry(nw, 0.28, 0.3), i % 2 ? scaleMid : scale, 0, ny, nz);
    sp(neck, new THREE.BoxGeometry(nw * 0.85, 0.22, 0.22), i % 2 ? scale : scaleMid, 0, ny, nz);
    sp(neck, new THREE.BoxGeometry(nw * 0.72, 0.12, 0.18), belly, 0, ny - 0.08, nz + 0.02);
    addScaleRing(neck, mats, 0, ny + 0.06, nz, 8, nw * 0.38);
    if (i < 5) {
      spJointFill(neck, mats, 0, ny + 0.12, nz + 0.12, nw * 0.34, 0.18, 0.12);
    }
    ny += 0.17;
    nz += 0.15;
  }

  spJointFill(body, mats, 0, 0.88, 0.52, 0.32, 0.28, 0.18);

  /* ── 頭 ── */
  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, s(ny + 0.08), s(nz + 0.12));
  body.add(head);
  sp(head, new THREE.BoxGeometry(0.48, 0.38, 0.52), scale, 0, 0, 0.06);
  sp(head, new THREE.BoxGeometry(0.42, 0.32, 0.44), scaleMid, 0, 0.02, 0.1);
  sp(head, new THREE.SphereGeometry(0.2, 10, 10), scale, 0, 0.04, 0.02);
  sp(head, new THREE.BoxGeometry(0.36, 0.22, 0.38), scaleMid, 0, 0.06, 0.28);
  sp(head, new THREE.BoxGeometry(0.22, 0.14, 0.42), beak, 0, -0.02, 0.48);
  sp(head, new THREE.BoxGeometry(0.16, 0.1, 0.28), beakLight, 0, 0.02, 0.62);
  sp(head, new THREE.BoxGeometry(0.38, 0.12, 0.22), scaleDark, 0, -0.12, 0.22);

  for (const sx of [-1, 1]) {
    sp(head, new THREE.BoxGeometry(0.14, 0.08, 0.18), beak, sx * 0.18, -0.06, 0.42, [0.35, sx * 0.15, 0.08]);
    for (let t = 0; t < 5; t++) {
      sp(
        head,
        new THREE.ConeGeometry(0.018, 0.08, 4),
        beakLight,
        sx * 0.1,
        -0.1,
        0.34 + t * 0.06,
        [0.6, sx * 0.1, 0]
      );
    }
  }

  for (const sx of [-1, 1]) {
    sp(head, new THREE.BoxGeometry(0.16, 0.12, 0.05), mats.eyeRing, sx * 0.14, 0.12, 0.2);
    sp(head, new THREE.SphereGeometry(0.08, 12, 12), mats.eye, sx * 0.14, 0.12, 0.24);
    sp(head, new THREE.BoxGeometry(0.03, 0.05, 0.02), mats.pupil, sx * 0.14, 0.11, 0.29);
    sp(head, new THREE.SphereGeometry(0.018, 6, 6), mats.eyeShine, sx * 0.12, 0.14, 0.3);
  }

  for (let i = 0; i < 7; i++) {
    const ang = (i / 7) * Math.PI * 2;
    sp(
      head,
      new THREE.ConeGeometry(0.045, 0.28 + (i % 3) * 0.06, 6),
      i % 2 ? horn : hornDark,
      Math.sin(ang) * 0.12,
      0.24 + (i % 2) * 0.04,
      Math.cos(ang) * 0.1 - 0.08,
      [0.15, ang, 0.2]
    );
  }
  sp(head, new THREE.ConeGeometry(0.08, 0.48, 7), crystal, 0, 0.34, -0.06, [0.1, 0, 0]);
  sp(head, new THREE.OctahedronGeometry(0.09, 0), crystalCore, 0, 0.42, 0.02);

  /* ── 背中の嵐結晶列 ── */
  const crystalCount = variantIndex ? 16 : 12;
  for (let i = 0; i < crystalCount; i++) {
    const t = i / Math.max(crystalCount - 1, 1);
    sp(
      body,
      new THREE.OctahedronGeometry(0.06 + (i % 3) * 0.015, 0),
      i % 4 === 0 ? crystalCore : crystal,
      (i % 2 ? 0.08 : -0.08),
      0.92 + Math.sin(t * Math.PI) * 0.08,
      0.42 - i * 0.22,
      [0.25, i * 0.4, 0.15]
    );
    if (variantIndex && i % 2 === 0) {
      sp(
        body,
        new THREE.SphereGeometry(0.05, 8, 8),
        wingMemLight,
        (i % 3 ? 0.12 : -0.12),
        1.02 + (i % 4) * 0.04,
        0.3 - i * 0.2
      );
    }
  }

  /* ── 巨翼 ── */
  const wingSpan = variantIndex ? 2.65 : 2.45;
  for (const sx of [-1, 1]) {
    sp(body, new THREE.BoxGeometry(0.28, 0.22, 0.32), scaleMid, sx * 0.46, 0.86, 0.02);
    sp(body, new THREE.SphereGeometry(0.14, 8, 8), scale, sx * 0.5, 0.9, -0.04);
    sp(body, new THREE.BoxGeometry(0.18, 0.14, 0.2), scaleDark, sx * 0.44, 0.78, 0.06);
  }
  addStormWing(body, mats, -1, wingSpan);
  addStormWing(body, mats, 1, wingSpan);

  /* ── 四足 ── */
  addStormLegs(body, mats, [
    [-0.38, 0.42, true],
    [0.38, 0.42, true],
    [-0.34, -0.28, false],
    [0.34, -0.28, false],
  ]);

  /* ── 腹甲・肋骨ディテール ── */
  for (let i = 0; i < 10; i++) {
    sp(
      body,
      new THREE.BoxGeometry(0.52 - i * 0.02, 0.06, 0.08),
      scaleDeep,
      0,
      0.46,
      0.08 - i * 0.24,
      [0.12, 0, 0]
    );
    for (const sx of [-1, 1]) {
      sp(
        body,
        new THREE.BoxGeometry(0.08, 0.14, 0.06),
        plate,
        sx * (0.28 - i * 0.008),
        0.54,
        0.04 - i * 0.24,
        [0.2, sx * 0.15, 0]
      );
    }
  }

  if (variantIndex) {
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      sp(
        body,
        new THREE.CylinderGeometry(0.02, 0.035, 0.55, 6),
        crystalCore,
        Math.sin(ang) * 0.72,
        1.18,
        Math.cos(ang) * 0.42 - 0.1,
        [0.5, ang, 0.35]
      );
    }
  }

  return root;
}
