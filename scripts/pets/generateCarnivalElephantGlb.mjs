/**
 * カーニバル象 — MOE Wiki 参考
 * 灰色の象・カーニバル風カラフル装飾
 */
import * as THREE from "three";
import { addPart, exportPetGlb, mat } from "../petGlbShared.mjs";

const palette = {
  skin: 0xa8a29e,
  skinDark: 0x78716c,
  ear: 0xd6d3d1,
  tusk: 0xf8fafc,
  eye: 0x1c1917,
  hatRed: 0xef4444,
  hatYellow: 0xfbbf24,
  hatBlue: 0x3b82f6,
  collar: 0x8b5cf6,
};

export function buildCarnivalElephantRoot() {
  const root = new THREE.Group();
  root.name = "CarnivalElephantRoot";

  const body = new THREE.Group();
  body.name = "CarnivalElephantBody";
  root.add(body);

  const skin = mat(palette.skin);
  const skinDark = mat(palette.skinDark);
  const ear = mat(palette.ear);
  const tusk = mat(palette.tusk);
  const eye = mat(palette.eye);
  const hatRed = mat(palette.hatRed);
  const hatYellow = mat(palette.hatYellow);
  const hatBlue = mat(palette.hatBlue);
  const collar = mat(palette.collar);

  /* 胴体 — 大きめ */
  addPart(body, new THREE.BoxGeometry(0.72, 0.52, 0.88), skin, 0, 0.62, 0);
  addPart(body, new THREE.BoxGeometry(0.64, 0.16, 0.78), skinDark, 0, 0.4, 0);

  /* 頭 */
  addPart(body, new THREE.BoxGeometry(0.48, 0.42, 0.44), skin, 0, 0.88, 0.42);
  addPart(body, new THREE.SphereGeometry(0.05, 6, 6), eye, -0.12, 0.92, 0.62);
  addPart(body, new THREE.SphereGeometry(0.05, 6, 6), eye, 0.12, 0.92, 0.62);

  /* 耳 */
  addPart(body, new THREE.BoxGeometry(0.28, 0.36, 0.06), ear, -0.38, 0.9, 0.18, [0, 0.3, 0]);
  addPart(body, new THREE.BoxGeometry(0.28, 0.36, 0.06), ear, 0.38, 0.9, 0.18, [0, -0.3, 0]);

  /* 鼻 */
  addPart(body, new THREE.BoxGeometry(0.14, 0.14, 0.38), skin, 0, 0.72, 0.72);
  addPart(body, new THREE.BoxGeometry(0.12, 0.1, 0.22), skinDark, 0, 0.66, 0.96);
  addPart(body, new THREE.CylinderGeometry(0.04, 0.05, 0.14, 4), tusk, -0.08, 0.62, 0.68, [0.4, 0, 0.2]);
  addPart(body, new THREE.CylinderGeometry(0.04, 0.05, 0.14, 4), tusk, 0.08, 0.62, 0.68, [0.4, 0, -0.2]);

  /* カーニバル帽子 */
  addPart(body, new THREE.CylinderGeometry(0.22, 0.24, 0.12, 6), hatRed, 0, 1.16, 0.38);
  addPart(body, new THREE.ConeGeometry(0.1, 0.18, 4), hatYellow, 0, 1.28, 0.38);
  addPart(body, new THREE.SphereGeometry(0.06, 6, 6), hatBlue, 0.18, 1.2, 0.42);

  /* カラフル首輪 */
  addPart(body, new THREE.TorusGeometry(0.28, 0.04, 4, 8), collar, 0, 0.78, 0.08, [1.57, 0, 0]);
  addPart(body, new THREE.BoxGeometry(0.08, 0.08, 0.08), hatYellow, -0.28, 0.78, 0.36);
  addPart(body, new THREE.BoxGeometry(0.08, 0.08, 0.08), hatBlue, 0.28, 0.78, 0.36);
  addPart(body, new THREE.BoxGeometry(0.08, 0.08, 0.08), hatRed, 0, 0.78, -0.32);

  /* 脚 ×4 */
  for (const [sx, sz] of [
    [-0.26, 0.3],
    [0.26, 0.3],
    [-0.26, -0.3],
    [0.26, -0.3],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.18, 0.32, 0.18), skinDark, sx, 0.22, sz);
    addPart(body, new THREE.BoxGeometry(0.2, 0.06, 0.2), skinDark, sx, 0.04, sz);
  }

  return root;
}

await exportPetGlb(buildCarnivalElephantRoot, "CarnivalElephant.glb");
