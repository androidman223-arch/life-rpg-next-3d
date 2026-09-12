/**
 * キマイラ — ハティル砂漠 Lv180 超ボス
 * ライオン胴 · 山羊副頭 · 蛇尾 · 生命の檻
 * サイズ ≈ 通常敵の5倍 · 細部多め（6000〜8000三角目標）
 */
import * as THREE from "three";
import { addPart } from "../petGlbShared.mjs";
import {
  buildMonsterMaterials,
  createMonsterBody,
  createMonsterRoot,
} from "./monsterShared.mjs";

/** 通常敵比 ~5倍スケール */
const CHIMERA_SCALE = 2.05;

/** @param {number} v */
function s(v) {
  return v * CHIMERA_SCALE;
}

/** @param {THREE.Group} parent @param {THREE.BufferGeometry} geo @param {THREE.Material} mat @param {number} x @param {number} y @param {number} z @param {[number,number,number]} [rot] */
function cp(parent, geo, mat, x, y, z, rot = [0, 0, 0]) {
  return addPart(parent, geo, mat, s(x), s(y), s(z), rot);
}

/** 節間・関節の肉付け */
function cpJointFill(parent, materials, x, y, z, rw, rh, rz) {
  const { body, bodyLight, bodyDark } = materials;
  cp(parent, new THREE.SphereGeometry(rw, 8, 8), body, x, y, z);
  cp(parent, new THREE.SphereGeometry(rw * 0.78, 8, 8), bodyLight, x, y - rh * 0.25, z + 0.02);
  cp(parent, new THREE.BoxGeometry(rw * 1.55, rh, rz), bodyDark, x, y, z);
}

/**
 * @param {THREE.Group} parent
 * @param {ReturnType<buildMonsterMaterials>} materials
 * @param {number} cx @param {number} cy @param {number} cz
 * @param {number} count @param {number} radius
 */
function addFurRing(parent, materials, cx, cy, cz, count, radius) {
  const { body, bodyDark, bodyLight, detail } = materials;
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2;
    const px = cx + Math.cos(ang) * radius;
    const pz = cz + Math.sin(ang) * radius;
    const matUse = i % 3 === 0 ? bodyDark : i % 3 === 1 ? body : bodyLight;
    cp(
      parent,
      new THREE.ConeGeometry(0.038, 0.12 + (i % 4) * 0.02, 5),
      matUse,
      px,
      cy,
      pz,
      [0.45, ang, 0.1]
    );
    if (i % 2 === 0) {
      cp(
        parent,
        new THREE.BoxGeometry(0.04, 0.02, 0.05),
        detail,
        px,
        cy + 0.05,
        pz,
        [0.15, ang, 0.06]
      );
    }
  }
}

/**
 * @param {THREE.Group} parent
 * @param {ReturnType<buildMonsterMaterials>} materials
 * @param {number} count
 */
function addLifeCage(parent, materials, count, variantIndex) {
  const { accent, metal, detail } = materials;
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(count - 1, 1);
    const ang = -Math.PI * 0.65 + t * Math.PI * 1.3;
    cp(
      parent,
      new THREE.CylinderGeometry(0.025, 0.032, 0.72 + (i % 2) * 0.06, 6),
      i % 3 === 0 ? accent : metal,
      Math.sin(ang) * 0.52,
      0.52 + (i % 3) * 0.04,
      Math.cos(ang) * 0.38 + 0.08,
      [0.08, ang, 0.05]
    );
    cp(
      parent,
      new THREE.SphereGeometry(0.035, 8, 8),
      accent,
      Math.sin(ang) * 0.52,
      0.88 + (i % 2) * 0.03,
      Math.cos(ang) * 0.38 + 0.08
    );
  }
  cp(parent, new THREE.TorusGeometry(0.46, 0.022, 5, 16), accent, 0, 0.86, 0.1, [0.12, 0, 0]);
  cp(parent, new THREE.TorusGeometry(0.38, 0.018, 5, 14), detail, 0, 0.48, 0.12, [Math.PI / 2, 0, 0]);
  if (variantIndex) {
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      cp(
        parent,
        new THREE.OctahedronGeometry(0.05, 0),
        accent,
        Math.sin(ang) * 0.44,
        0.68,
        Math.cos(ang) * 0.32 + 0.1,
        [0.2, ang, 0.15]
      );
    }
  }
}

/**
 * @param {THREE.Group} body
 * @param {ReturnType<buildMonsterMaterials>} materials
 * @param {[number, number, boolean][]} specs
 */
function addChimeraLegs(body, materials, specs) {
  const { bodyDark, bodyLight, detail, horn, metal } = materials;
  for (const [x, z, front] of specs) {
    cp(body, new THREE.SphereGeometry(0.1, 8, 8), bodyDark, x, 0.36, z);
    cp(body, new THREE.BoxGeometry(0.16, 0.34, 0.18), bodyDark, x, 0.24, z);
    cp(body, new THREE.SphereGeometry(0.08, 8, 8), bodyLight, x, 0.14, z + (front ? 0.02 : -0.01));
    cp(body, new THREE.CylinderGeometry(0.07, 0.09, 0.26, 8), bodyLight, x, 0.1, z + (front ? 0.04 : -0.02));
    cp(body, new THREE.BoxGeometry(0.14, 0.1, 0.16), detail, x, 0.03, z + 0.06);
    cp(body, new THREE.BoxGeometry(0.15, 0.05, 0.18), bodyDark, x, 0.01, z + 0.1);
    for (const ox of [-0.045, -0.015, 0.015, 0.045]) {
      cp(body, new THREE.ConeGeometry(0.018, 0.1, 4), horn, x + ox, 0.005, z + 0.18, [0.5, 0, 0.06]);
    }
    cp(body, new THREE.SphereGeometry(0.05, 8, 8), bodyLight, x, 0.18, z);
    cp(body, new THREE.BoxGeometry(0.08, 0.06, 0.1), metal, x, 0.28, z - 0.04, [0.12, 0, 0]);
  }
}

/**
 * @param {Record<string, number>} palette
 * @param {number} [variantIndex=0]
 */
export function buildChimera(palette, variantIndex = 0) {
  const prefix = "Chimera";
  const m = buildMonsterMaterials(palette);
  const root = createMonsterRoot(prefix, palette.id);
  const body = createMonsterBody(root, prefix);

  /* ── ライオン胴体 ── */
  cp(body, new THREE.BoxGeometry(0.82, 0.52, 1.12), m.body, 0, 0.58, 0.02);
  cp(body, new THREE.BoxGeometry(0.74, 0.46, 1.0), m.body, 0, 0.56, 0.04);
  cp(body, new THREE.BoxGeometry(0.68, 0.38, 0.92), m.bodyLight, 0, 0.54, 0.06);
  cp(body, new THREE.BoxGeometry(0.54, 0.22, 0.72), m.bodyDark, 0, 0.48, 0.1);
  for (const sx of [-1, 1]) {
    cp(body, new THREE.BoxGeometry(0.28, 0.36, 0.42), m.bodyDark, sx * 0.38, 0.62, 0.18);
    cp(body, new THREE.SphereGeometry(0.12, 10, 10), m.body, sx * 0.42, 0.72, 0.12);
    cp(body, new THREE.BoxGeometry(0.2, 0.18, 0.24), m.bodyLight, sx * 0.36, 0.58, 0.22);
  }
  cpJointFill(body, m, 0, 0.64, 0.68, 0.22, 0.26, 0.16);

  for (let i = 0; i < 10; i++) {
    cp(
      body,
      new THREE.BoxGeometry(0.14 - i * 0.004, 0.08, 0.12),
      i % 2 ? m.detail : m.horn,
      0,
      0.78,
      0.42 - i * 0.22,
      [0.18, 0, 0]
    );
    addFurRing(body, m, 0, 0.74, 0.38 - i * 0.22, 8, 0.18 - i * 0.004);
  }

  addLifeCage(body, m, variantIndex ? 10 : 8, variantIndex);

  /* ── ライオン頭 ── */
  const lionHead = new THREE.Group();
  lionHead.name = `${prefix}LionHead`;
  lionHead.position.set(0, s(0.72), s(0.72));
  body.add(lionHead);

  cp(lionHead, new THREE.BoxGeometry(0.42, 0.36, 0.44), m.body, 0, 0, 0.06);
  cp(lionHead, new THREE.SphereGeometry(0.18, 10, 10), m.body, 0, 0.02, 0.04);
  cp(lionHead, new THREE.BoxGeometry(0.36, 0.28, 0.36), m.bodyLight, 0, 0.02, 0.14);
  cp(lionHead, new THREE.BoxGeometry(0.32, 0.24, 0.32), m.bodyLight, 0, 0.04, 0.22);
  cpJointFill(body, m, 0, 0.7, 0.66, 0.2, 0.22, 0.14);
  cp(lionHead, new THREE.BoxGeometry(0.2, 0.14, 0.24), m.bodyDark, 0, -0.04, 0.38);
  cp(lionHead, new THREE.BoxGeometry(0.28, 0.1, 0.18), m.bodyDark, 0, -0.1, 0.24);

  for (const sx of [-1, 1]) {
    cp(lionHead, new THREE.BoxGeometry(0.1, 0.08, 0.12), m.body, sx * 0.2, -0.02, 0.32, [0.2, sx * 0.12, 0.05]);
    for (let t = 0; t < 4; t++) {
      cp(
        lionHead,
        new THREE.ConeGeometry(0.016, 0.07, 4),
        m.detail,
        sx * 0.12,
        -0.08,
        0.28 + t * 0.05,
        [0.55, sx * 0.08, 0]
      );
    }
  }

  for (const sx of [-1, 1]) {
    cp(lionHead, new THREE.BoxGeometry(0.1, 0.08, 0.04), m.detail, sx * 0.11, 0.08, 0.16);
    cp(lionHead, new THREE.SphereGeometry(0.055, 10, 10), m.eye, sx * 0.11, 0.08, 0.2);
    cp(lionHead, new THREE.SphereGeometry(0.014, 6, 6), m.eyeShine, sx * 0.095, 0.1, 0.24);
  }

  for (let i = 0; i < 24; i++) {
    const ang = (i / 24) * Math.PI * 2;
    const rad = 0.28 + (i % 3) * 0.02;
    cp(
      lionHead,
      new THREE.ConeGeometry(0.032, 0.18 + (i % 4) * 0.04, 5),
      i % 2 ? m.bodyDark : m.body,
      Math.sin(ang) * rad,
      0.12 + (i % 2) * 0.04,
      Math.cos(ang) * rad * 0.75 - 0.04,
      [0.35, ang, 0.12]
    );
  }
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    cp(
      lionHead,
      new THREE.BoxGeometry(0.05, 0.08, 0.04),
      m.detail,
      Math.sin(ang) * 0.22,
      0.2,
      Math.cos(ang) * 0.18 - 0.06,
      [0.2, ang, 0.08]
    );
  }

  /* ── 山羊副頭（背中） ── */
  const goatHead = new THREE.Group();
  goatHead.name = `${prefix}GoatHead`;
  goatHead.position.set(0, s(0.98), s(-0.08));
  body.add(goatHead);

  cp(goatHead, new THREE.BoxGeometry(0.22, 0.24, 0.22), m.bodyLight, 0, 0, 0);
  cp(goatHead, new THREE.SphereGeometry(0.1, 8, 8), m.body, 0, -0.02, 0.06);
  cp(goatHead, new THREE.BoxGeometry(0.16, 0.14, 0.18), m.body, 0, -0.02, 0.12);
  cpJointFill(body, m, 0, 0.88, -0.02, 0.14, 0.2, 0.12);
  cp(goatHead, new THREE.BoxGeometry(0.1, 0.08, 0.12), m.bodyDark, 0, -0.06, 0.2);
  for (const sx of [-1, 1]) {
    cp(
      goatHead,
      new THREE.ConeGeometry(0.035, 0.32, 6),
      m.horn,
      sx * 0.1,
      0.16,
      -0.02,
      [0.2, sx * 0.25, sx * 0.35]
    );
    cp(
      goatHead,
      new THREE.ConeGeometry(0.025, 0.22, 5),
      m.detail,
      sx * 0.14,
      0.12,
      0.02,
      [0.35, sx * 0.15, sx * 0.2]
    );
    cp(goatHead, new THREE.SphereGeometry(0.028, 8, 8), m.eye, sx * 0.07, 0.04, 0.1);
  }
  for (let i = 0; i < 6; i++) {
    cp(
      goatHead,
      new THREE.ConeGeometry(0.018, 0.1, 4),
      m.bodyDark,
      (i % 2 ? 0.04 : -0.04),
      -0.1 - (i % 3) * 0.02,
      0.16 + i * 0.025,
      [0.5, 0, 0.05]
    );
  }

  /* ── 蛇尾 ── */
  let sw = 0.2;
  let sy = 0.48;
  let sz = -0.48;
  const snakeSegs = 14;
  for (let i = 0; i < snakeSegs; i++) {
    const wave = Math.sin(i * 0.55) * 0.08;
    cp(body, new THREE.BoxGeometry(sw, sw * 0.72, 0.32), i % 2 ? m.bodyDark : m.detail, wave, sy, sz);
    cp(
      body,
      new THREE.BoxGeometry(sw * 0.88, sw * 0.62, 0.24),
      i % 2 ? m.detail : m.bodyDark,
      wave,
      sy,
      sz
    );
    addFurRing(body, m, wave, sy + sw * 0.28, sz, 6, sw * 0.38);
    if (i % 3 === 1) {
      cp(body, new THREE.BoxGeometry(sw * 0.55, sw * 0.18, 0.14), m.accent, wave, sy - sw * 0.2, sz + 0.02);
    }
    if (i < snakeSegs - 1) {
      cpJointFill(body, m, wave, sy + 0.02, sz - 0.14, sw * 0.34, sw * 0.48, 0.12);
    }
    if (i === 0) {
      cpJointFill(body, m, 0, 0.5, -0.38, 0.2, 0.24, 0.14);
    }
    sz -= 0.2;
    sw *= 0.94;
    sy += 0.02;
  }

  const tailWave = Math.sin((snakeSegs - 1) * 0.55) * 0.08;
  const snakeHead = new THREE.Group();
  snakeHead.position.set(s(tailWave), s(sy + 0.04), s(sz + 0.18));
  body.add(snakeHead);
  cpJointFill(body, m, tailWave, sy + 0.02, sz + 0.06, sw * 0.38, sw * 0.42, 0.1);
  cp(snakeHead, new THREE.ConeGeometry(0.12, 0.22, 7), m.detail, 0, 0.02, 0.1, [0.55, 0, 0]);
  cp(snakeHead, new THREE.SphereGeometry(0.08, 8, 8), m.bodyDark, 0, 0.02, 0.08);
  cp(snakeHead, new THREE.BoxGeometry(0.14, 0.08, 0.16), m.bodyDark, 0, -0.02, 0.18);
  for (const sx of [-1, 1]) {
    cp(snakeHead, new THREE.ConeGeometry(0.022, 0.12, 4), m.accent, sx * 0.05, -0.04, 0.22, [0.4, sx * 0.25, 0.1]);
    cp(snakeHead, new THREE.SphereGeometry(0.022, 8, 8), m.eye, sx * 0.06, 0.04, 0.14);
  }

  /* ── 四足 ── */
  addChimeraLegs(body, m, [
    [-0.34, 0.38, true],
    [0.34, 0.38, true],
    [-0.32, -0.32, false],
    [0.32, -0.32, false],
  ]);

  /* ── 脇腹の筋肉・魔法痕 ── */
  for (let i = 0; i < 8; i++) {
    for (const sx of [-1, 1]) {
      cp(
        body,
        new THREE.BoxGeometry(0.06, 0.14, 0.05),
        i % 2 ? m.bodyLight : m.bodyDark,
        sx * (0.36 - i * 0.01),
        0.42,
        0.2 - i * 0.18,
        [0.15, sx * 0.1, 0]
      );
    }
  }

  if (variantIndex) {
    cp(body, new THREE.TorusGeometry(0.52, 0.015, 4, 18), m.accent, 0, 0.02, 0.08, [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 4; i++) {
      cp(
        body,
        new THREE.CylinderGeometry(0.015, 0.025, 0.38, 6),
        m.accent,
        (i % 2 ? 0.22 : -0.22),
        0.62,
        -0.12 - i * 0.14,
        [0.35, i * 0.4, 0.15]
      );
    }
  }

  return root;
}
