/**
 * モンスター glb 共通 — 低ポリ · Snake アニメ互換
 */
import * as THREE from "three";
import { addPart, mat } from "../petGlbShared.mjs";

/** @param {Record<string, number>} palette */
export function buildMonsterMaterials(palette) {
  const p = palette;
  return {
    p,
    body: mat(p.body),
    bodyDark: mat(p.bodyDark ?? p.body, { rough: 0.55 }),
    bodyLight: mat(p.bodyLight ?? p.body, { rough: 0.42 }),
    accent: mat(p.accent ?? p.body, {
      emissive: p.accent ?? 0,
      emissiveIntensity: p.accentEmissive ?? 0,
    }),
    detail: mat(p.detail ?? p.bodyDark ?? p.body),
    eye: mat(p.eye ?? 0xfbbf24, { emissive: p.eye ?? 0, emissiveIntensity: 0.35 }),
    pupil: mat(p.pupil ?? 0x1a1008),
    eyeShine: mat(p.eyeShine ?? 0xfffbeb),
    metal: mat(p.metal ?? 0x9ca3af, { metal: 0.35, rough: 0.38 }),
    cloth: mat(p.cloth ?? p.bodyDark ?? p.body),
    horn: mat(p.horn ?? p.detail ?? p.body),
  };
}

export function createMonsterRoot(prefix, id = "") {
  const root = new THREE.Group();
  root.name = `${prefix}Root`;
  if (id) root.userData.monsterVariantId = id;
  return root;
}

export function createMonsterBody(root, prefix) {
  const body = new THREE.Group();
  body.name = `${prefix}Body`;
  root.add(body);
  return body;
}

/** 正面の目（四足・虫など） */
export function addFrontEyes(parent, materials, opts = {}) {
  const { eye, pupil, eyeShine } = materials;
  const ex = opts.ex ?? 0.08;
  const ey = opts.ey ?? 0.12;
  const ez = opts.ez ?? 0.14;
  const tag = opts.tag ?? "Monster";
  for (const sx of [-1, 1]) {
    const px = sx * ex;
    addPart(parent, new THREE.SphereGeometry(0.045, 6, 6), eye, px, ey, ez);
    addPart(parent, new THREE.SphereGeometry(0.02, 4, 4), pupil, px, ey, ez + 0.03);
    addPart(parent, new THREE.SphereGeometry(0.012, 4, 4), eyeShine, px - sx * 0.012, ey + 0.012, ez + 0.035);
  }
}

/** 人型 — 腕グループ（SnakeAttakc 互換） */
export function addHumanoidArms(body, materials, prefix, sideOffset = 0.22) {
  const { body: bodyMat, cloth } = materials;
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.name = sx < 0 ? `${prefix}ArmL` : `${prefix}ArmR`;
    arm.position.set(sx * sideOffset, 0.72, 0);
    body.add(arm);
    addPart(arm, new THREE.BoxGeometry(0.1, 0.28, 0.1), bodyMat, 0, -0.12, 0);
    addPart(arm, new THREE.BoxGeometry(0.09, 0.1, 0.09), cloth, 0, -0.28, 0);
  }
}

/** 人型 — 簡易頭 */
export function addHumanoidHead(body, materials, prefix, opts = {}) {
  const { body: bodyMat, bodyLight, detail, eye, pupil } = materials;
  const head = new THREE.Group();
  head.name = `${prefix}Head`;
  head.position.set(0, opts.y ?? 0.88, opts.z ?? 0.06);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.28, 0.28, 0.26), bodyMat, 0, 0, 0);
  addPart(head, new THREE.BoxGeometry(0.2, 0.12, 0.12), bodyLight, 0, -0.04, 0.14);
  if (opts.hair) {
    addPart(head, new THREE.BoxGeometry(0.26, 0.08, 0.22), detail, 0, 0.16, -0.02);
    addPart(head, new THREE.BoxGeometry(0.08, 0.22, 0.08), detail, sx => 0, 0.08, -0.12);
  }
  for (const sx of [-1, 1]) {
    addPart(head, new THREE.SphereGeometry(0.035, 6, 6), eye, sx * 0.08, 0.04, 0.12);
    addPart(head, new THREE.SphereGeometry(0.015, 4, 4), pupil, sx * 0.08, 0.04, 0.145);
  }
  return head;
}

/** 蛇形 — セグメント */
export function addSnakeSegments(body, materials, count, opts = {}) {
  const { body: bodyMat, bodyDark, bodyLight, accent } = materials;
  const step = opts.step ?? 0.2;
  let w = opts.width ?? 0.22;
  let y = opts.startY ?? 0.28;
  let z = opts.startZ ?? 0.15;
  for (let i = 0; i < count; i++) {
    const matUse = i % 2 === 0 ? bodyMat : bodyDark;
    addPart(body, new THREE.BoxGeometry(w, w * 0.85, step), matUse, 0, y, z);
    if (bodyLight && i % 3 === 1) {
      addPart(body, new THREE.BoxGeometry(w * 0.7, w * 0.35, step * 0.6), bodyLight, 0, y - w * 0.35, z + 0.02);
    }
    if (accent && opts.fins && i % 2 === 0) {
      addPart(body, new THREE.BoxGeometry(0.04, 0.12, 0.08), accent, 0, y + w * 0.5, z, [0.5, 0, 0]);
    }
    y += opts.rise ?? 0;
    z -= step;
    w *= opts.taper ?? 0.96;
  }
}

/** 四足 — 簡易脚 */
export function addQuadLegs(body, materials, opts = {}) {
  const { bodyDark, detail } = materials;
  const sx = opts.spread ?? 0.18;
  const sz = opts.frontZ ?? 0.16;
  const backZ = opts.backZ ?? -0.16;
  for (const [x, z] of [
    [-sx, sz],
    [sx, sz],
    [-sx, backZ],
    [sx, backZ],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.08, 0.22, 0.08), bodyDark, x, 0.14, z);
    addPart(body, new THREE.BoxGeometry(0.07, 0.08, 0.07), detail, x, 0.04, z + 0.03);
  }
}
