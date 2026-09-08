/**
 * エレメンタル アトルーム — プルルーム亜種
 * 紫髪の chibi 少女・開いた魔導書
 */
import * as THREE from "three";
import { addPart, exportPetGlb, mat } from "../petGlbShared.mjs";

const palette = {
  skin: 0xffedd5,
  hair: 0xa78bfa,
  hairDark: 0x7c3aed,
  dress: 0x6366f1,
  dressLight: 0x818cf8,
  book: 0x334155,
  bookPage: 0x475569,
  pageGlow: 0x86efac,
  eye: 0x1e1b4b,
  cheek: 0xfda4af,
};

export function buildElementalAtrumRoot() {
  const root = new THREE.Group();
  root.name = "ElementalAtrumRoot";

  const body = new THREE.Group();
  body.name = "ElementalAtrumBody";
  root.add(body);

  const skin = mat(palette.skin);
  const hair = mat(palette.hair);
  const hairDark = mat(palette.hairDark);
  const dress = mat(palette.dress);
  const dressLight = mat(palette.dressLight);
  const book = mat(palette.book);
  const bookPage = mat(palette.bookPage);
  const pageGlow = mat(palette.pageGlow, { emissive: 0x22c55e, emissiveIntensity: 0.2 });
  const eye = mat(palette.eye);
  const cheek = mat(palette.cheek);

  /* 頭 */
  addPart(body, new THREE.SphereGeometry(0.22, 8, 8), skin, 0, 1.02, 0);
  addPart(body, new THREE.SphereGeometry(0.04, 6, 6), eye, -0.07, 1.05, 0.18);
  addPart(body, new THREE.SphereGeometry(0.04, 6, 6), eye, 0.07, 1.05, 0.18);
  addPart(body, new THREE.SphereGeometry(0.03, 4, 4), cheek, -0.12, 0.98, 0.14);
  addPart(body, new THREE.SphereGeometry(0.03, 4, 4), cheek, 0.12, 0.98, 0.14);

  /* 髪 — 紫ボブ（頭頂・後頭部まで被る） */
  addPart(body, new THREE.BoxGeometry(0.42, 0.14, 0.38), hair, 0, 1.22, -0.02);
  addPart(body, new THREE.BoxGeometry(0.44, 0.2, 0.4), hairDark, 0, 1.1, -0.04);
  addPart(body, new THREE.BoxGeometry(0.4, 0.12, 0.36), hair, 0, 1.0, -0.06);
  addPart(body, new THREE.BoxGeometry(0.14, 0.26, 0.14), hairDark, -0.2, 1.02, 0);
  addPart(body, new THREE.BoxGeometry(0.14, 0.26, 0.14), hairDark, 0.2, 1.02, 0);
  addPart(body, new THREE.BoxGeometry(0.32, 0.1, 0.18), hair, 0, 1.04, 0.16);
  addPart(body, new THREE.BoxGeometry(0.34, 0.1, 0.18), hairDark, 0, 0.98, -0.18);

  /* 胴 — ローブ */
  addPart(body, new THREE.BoxGeometry(0.34, 0.36, 0.24), dress, 0, 0.72, 0);
  addPart(body, new THREE.BoxGeometry(0.36, 0.1, 0.26), dressLight, 0, 0.56, 0);
  addPart(body, new THREE.BoxGeometry(0.14, 0.08, 0.14), dressLight, 0, 0.88, 0.02);

  /* 腕 */
  const armL = new THREE.Group();
  armL.name = "ElementalAtrumArmL";
  armL.position.set(-0.22, 0.82, 0);
  body.add(armL);
  addPart(armL, new THREE.BoxGeometry(0.08, 0.22, 0.08), skin, 0, -0.06, 0);

  const armR = new THREE.Group();
  armR.name = "ElementalAtrumArmR";
  armR.position.set(0.22, 0.82, 0);
  body.add(armR);
  addPart(armR, new THREE.BoxGeometry(0.08, 0.22, 0.08), skin, 0, -0.06, 0.04, [0.3, 0, -0.2]);

  /* 魔導書 — 開いた本 */
  addPart(armR, new THREE.BoxGeometry(0.22, 0.28, 0.04), book, 0.06, -0.22, 0.18, [0.5, 0, -0.3]);
  addPart(armR, new THREE.BoxGeometry(0.1, 0.24, 0.02), bookPage, 0.0, -0.22, 0.2, [0.5, 0, -0.3]);
  addPart(armR, new THREE.BoxGeometry(0.1, 0.24, 0.02), bookPage, 0.12, -0.22, 0.2, [0.5, 0, -0.3]);
  addPart(armR, new THREE.BoxGeometry(0.04, 0.08, 0.02), pageGlow, 0.06, -0.18, 0.22, [0.5, 0, -0.3]);

  /* スカート裾 */
  addPart(body, new THREE.BoxGeometry(0.38, 0.08, 0.28), dressLight, 0, 0.48, 0);

  return root;
}

await exportPetGlb(buildElementalAtrumRoot, "ElementalAtrum.glb", { hasArms: true });
