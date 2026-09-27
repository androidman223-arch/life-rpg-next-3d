/**
 * ボールド イーグル — MOE Wiki 参考
 * 茶体・白頭・黄金の嘴と爪・大きな翼
 */
import * as THREE from "three";
import { addPart, exportPetGlb, mat } from "../petGlbShared.mjs";

const palette = {
  body: 0x92400e,
  bodyLight: 0xb45309,
  head: 0xf8fafc,
  beak: 0xfbbf24,
  beakDark: 0xd97706,
  eye: 0x1e1b4b,
  wing: 0x78350f,
  wingFeather: 0xa16207,
  talon: 0xfde68a,
};

export function buildBoldEagleRoot() {
  const root = new THREE.Group();
  root.name = "BoldEagleRoot";

  const body = new THREE.Group();
  body.name = "BoldEagleBody";
  root.add(body);

  const bodyM = mat(palette.body);
  const bodyLight = mat(palette.bodyLight);
  const headM = mat(palette.head);
  const beak = mat(palette.beak);
  const beakDark = mat(palette.beakDark);
  const eye = mat(palette.eye);
  const wing = mat(palette.wing);
  const wingFeather = mat(palette.wingFeather);
  const talon = mat(palette.talon);

  /* 胴体 — 飛行姿勢 */
  addPart(body, new THREE.BoxGeometry(0.36, 0.28, 0.48), bodyM, 0, 0.58, 0);
  addPart(body, new THREE.BoxGeometry(0.28, 0.12, 0.38), bodyLight, 0, 0.48, 0.02);

  /* 頭 — 白頭。上が広く下が尖った ▼ */
  addPart(body, new THREE.ConeGeometry(0.12, 0.24, 4), headM, 0, 0.86, 0.24, [Math.PI, 0, 0]);
  addPart(body, new THREE.ConeGeometry(0.045, 0.14, 4), beak, 0, 0.74, 0.36, [1.15, 0, 0]);
  addPart(body, new THREE.BoxGeometry(0.035, 0.03, 0.05), beakDark, 0, 0.72, 0.4);
  addPart(body, new THREE.SphereGeometry(0.028, 6, 6), eye, -0.05, 0.9, 0.3);
  addPart(body, new THREE.SphereGeometry(0.028, 6, 6), eye, 0.05, 0.9, 0.3);

  /* 翼 — 左右 */
  const wingL = new THREE.Group();
  wingL.name = "BoldEagleWingL";
  wingL.position.set(-0.2, 0.62, 0);
  body.add(wingL);
  addPart(wingL, new THREE.BoxGeometry(0.08, 0.06, 0.22), wing, 0, 0, 0);
  addPart(wingL, new THREE.BoxGeometry(0.52, 0.05, 0.32), wingFeather, -0.28, 0.02, -0.06, [0, 0, 0.22]);
  addPart(wingL, new THREE.BoxGeometry(0.38, 0.04, 0.22), wing, -0.48, 0.04, -0.12, [0, 0, 0.38]);

  const wingR = new THREE.Group();
  wingR.name = "BoldEagleWingR";
  wingR.position.set(0.2, 0.62, 0);
  body.add(wingR);
  addPart(wingR, new THREE.BoxGeometry(0.08, 0.06, 0.22), wing, 0, 0, 0);
  addPart(wingR, new THREE.BoxGeometry(0.52, 0.05, 0.32), wingFeather, 0.28, 0.02, -0.06, [0, 0, -0.22]);
  addPart(wingR, new THREE.BoxGeometry(0.38, 0.04, 0.22), wing, 0.48, 0.04, -0.12, [0, 0, -0.38]);

  /* 尾羽 */
  addPart(body, new THREE.BoxGeometry(0.06, 0.22, 0.14), wingFeather, 0, 0.52, -0.28, [0.3, 0, 0]);
  addPart(body, new THREE.BoxGeometry(0.04, 0.18, 0.1), wing, -0.08, 0.5, -0.26, [0.25, 0, 0.15]);
  addPart(body, new THREE.BoxGeometry(0.04, 0.18, 0.1), wing, 0.08, 0.5, -0.26, [0.25, 0, -0.15]);

  /* 脚・爪 */
  addPart(body, new THREE.BoxGeometry(0.06, 0.14, 0.06), bodyM, -0.08, 0.38, 0.08);
  addPart(body, new THREE.BoxGeometry(0.06, 0.14, 0.06), bodyM, 0.08, 0.38, 0.08);
  for (const sx of [-0.08, 0.08]) {
    addPart(body, new THREE.BoxGeometry(0.02, 0.08, 0.02), talon, sx - 0.04, 0.28, 0.12);
    addPart(body, new THREE.BoxGeometry(0.02, 0.08, 0.02), talon, sx, 0.28, 0.14);
    addPart(body, new THREE.BoxGeometry(0.02, 0.08, 0.02), talon, sx + 0.04, 0.28, 0.12);
  }

  return root;
}

await exportPetGlb(buildBoldEagleRoot, "BoldEagle.glb", { wingFlap: true });
