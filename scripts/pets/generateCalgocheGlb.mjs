/**
 * カルゴーシュ — デザコン11 最優秀賞
 * 緑の縦髪・白い毛・長いしっぽ・うるわしき顔（ウサギ系の優美な四足獣）
 */
import * as THREE from "three";
import { addPart, exportPetGlb, mat } from "../petGlbShared.mjs";

const palette = {
  fur: 0xf5f5f4,
  furLight: 0xffffff,
  furShadow: 0xe7e5e4,
  mane: 0x22c55e,
  maneDark: 0x16a34a,
  maneDeep: 0x15803d,
  earIn: 0xfda4af,
  eye: 0xfbbf24,
  eyeShine: 0xfef9c3,
  pupil: 0x1c1917,
  nose: 0x78716c,
  muzzle: 0xfafaf9,
};

export function buildCalgocheRoot() {
  const root = new THREE.Group();
  root.name = "CalgocheRoot";

  const body = new THREE.Group();
  body.name = "CalgocheBody";
  root.add(body);

  const fur = mat(palette.fur);
  const furLight = mat(palette.furLight);
  const furShadow = mat(palette.furShadow);
  const mane = mat(palette.mane, { emissive: 0x14532d, emissiveIntensity: 0.06 });
  const maneDark = mat(palette.maneDark, { emissive: 0x14532d, emissiveIntensity: 0.05 });
  const maneDeep = mat(palette.maneDeep);
  const earIn = mat(palette.earIn);
  const eye = mat(palette.eye, { emissive: 0xf59e0b, emissiveIntensity: 0.18 });
  const eyeShine = mat(palette.eyeShine);
  const pupil = mat(palette.pupil);
  const nose = mat(palette.nose);
  const muzzle = mat(palette.muzzle);

  /* 胴 — 白い優雅な四足 */
  addPart(body, new THREE.BoxGeometry(0.44, 0.26, 0.7), fur, 0, 0.48, 0);
  addPart(body, new THREE.BoxGeometry(0.36, 0.14, 0.56), furLight, 0, 0.42, 0.02);
  addPart(body, new THREE.BoxGeometry(0.4, 0.08, 0.32), furShadow, 0, 0.56, 0.04);

  /* 首 */
  addPart(body, new THREE.BoxGeometry(0.22, 0.2, 0.22), fur, 0, 0.64, 0.28);
  addPart(body, new THREE.BoxGeometry(0.18, 0.12, 0.16), furLight, 0, 0.6, 0.36);

  /* 頭 — 細めの鼻先・整った顔立ち */
  addPart(body, new THREE.BoxGeometry(0.28, 0.24, 0.28), fur, 0, 0.68, 0.46);
  addPart(body, new THREE.BoxGeometry(0.18, 0.16, 0.2), muzzle, 0, 0.62, 0.6);
  addPart(body, new THREE.BoxGeometry(0.1, 0.08, 0.1), furLight, 0, 0.64, 0.68);
  addPart(body, new THREE.SphereGeometry(0.035, 6, 6), nose, 0, 0.66, 0.72);

  /* 目 — 大きめ・アーモンド風 */
  addPart(body, new THREE.BoxGeometry(0.07, 0.05, 0.04), eye, -0.09, 0.72, 0.62);
  addPart(body, new THREE.BoxGeometry(0.07, 0.05, 0.04), eye, 0.09, 0.72, 0.62);
  addPart(body, new THREE.SphereGeometry(0.018, 4, 4), pupil, -0.09, 0.72, 0.645);
  addPart(body, new THREE.SphereGeometry(0.018, 4, 4), pupil, 0.09, 0.72, 0.645);
  addPart(body, new THREE.SphereGeometry(0.012, 4, 4), eyeShine, -0.085, 0.725, 0.652);
  addPart(body, new THREE.SphereGeometry(0.012, 4, 4), eyeShine, 0.095, 0.725, 0.652);

  /* 緑の縦髪 — 頭頂 */
  addPart(body, new THREE.BoxGeometry(0.06, 0.26, 0.06), mane, 0, 0.89, 0.4);
  addPart(body, new THREE.BoxGeometry(0.05, 0.22, 0.05), maneDark, -0.07, 0.86, 0.36);
  addPart(body, new THREE.BoxGeometry(0.05, 0.22, 0.05), maneDark, 0.07, 0.86, 0.36);
  addPart(body, new THREE.BoxGeometry(0.04, 0.16, 0.04), maneDeep, -0.12, 0.82, 0.28);
  addPart(body, new THREE.BoxGeometry(0.04, 0.16, 0.04), maneDeep, 0.12, 0.82, 0.28);

  /* 緑の縦髪 — 首〜背中（やや低め） */
  const backMane = [
    [0, 0.84, 0.24, 0.28],
    [0, 0.81, 0.14, 0.25],
    [0, 0.78, 0.04, 0.23],
    [0, 0.75, -0.06, 0.21],
    [0, 0.72, -0.16, 0.19],
    [0, 0.69, -0.26, 0.17],
    [0, 0.66, -0.34, 0.14],
  ];
  for (const [x, y, z, h] of backMane) {
    addPart(body, new THREE.BoxGeometry(0.05, h, 0.05), mane, x, y + h * 0.5, z);
  }
  for (const [x, y, z, h] of backMane.slice(0, 5)) {
    addPart(body, new THREE.BoxGeometry(0.04, h * 0.8, 0.04), maneDark, x - 0.06, y + h * 0.4, z);
    addPart(body, new THREE.BoxGeometry(0.04, h * 0.8, 0.04), maneDark, x + 0.06, y + h * 0.4, z);
  }
  addPart(body, new THREE.BoxGeometry(0.04, 0.12, 0.04), maneDeep, -0.05, 0.67, 0.08);
  addPart(body, new THREE.BoxGeometry(0.04, 0.12, 0.04), maneDeep, 0.05, 0.67, 0.08);

  /* うさ耳 — 白く（高さ半分） */
  addPart(body, new THREE.BoxGeometry(0.08, 0.19, 0.06), fur, -0.14, 0.845, 0.38, [0.14, 0, -0.12]);
  addPart(body, new THREE.BoxGeometry(0.08, 0.19, 0.06), fur, 0.14, 0.845, 0.38, [0.14, 0, 0.12]);
  addPart(body, new THREE.BoxGeometry(0.04, 0.15, 0.03), earIn, -0.14, 0.86, 0.4, [0.14, 0, -0.12]);
  addPart(body, new THREE.BoxGeometry(0.04, 0.15, 0.03), earIn, 0.14, 0.86, 0.4, [0.14, 0, 0.12]);
  addPart(body, new THREE.BoxGeometry(0.04, 0.05, 0.04), maneDark, -0.14, 0.91, 0.36, [0.14, 0, -0.12]);
  addPart(body, new THREE.BoxGeometry(0.04, 0.05, 0.04), maneDark, 0.14, 0.91, 0.36, [0.14, 0, 0.12]);

  /* 脚 ×4 — 細身 */
  for (const [sx, sz] of [
    [-0.15, 0.24],
    [0.15, 0.24],
    [-0.15, -0.24],
    [0.15, -0.24],
  ]) {
    addPart(body, new THREE.BoxGeometry(0.09, 0.22, 0.09), furShadow, sx, 0.24, sz);
    addPart(body, new THREE.BoxGeometry(0.1, 0.04, 0.1), furLight, sx, 0.1, sz + 0.03);
  }

  /* 尻尾 — 長く白いふさふさ */
  addPart(body, new THREE.BoxGeometry(0.08, 0.08, 0.28), fur, 0, 0.52, -0.42);
  addPart(body, new THREE.BoxGeometry(0.07, 0.07, 0.24), furLight, 0.02, 0.54, -0.62);
  addPart(body, new THREE.BoxGeometry(0.06, 0.06, 0.2), furLight, 0.04, 0.56, -0.8);
  addPart(body, new THREE.BoxGeometry(0.05, 0.05, 0.16), furShadow, 0.06, 0.58, -0.94, [0, 0, 0.15]);
  addPart(body, new THREE.BoxGeometry(0.04, 0.08, 0.04), maneDark, 0.07, 0.58, -1.02, [0.2, 0, 0.22]);

  return root;
}

await exportPetGlb(buildCalgocheRoot, "Calgoche.glb");
