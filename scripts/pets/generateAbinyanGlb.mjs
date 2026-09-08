/**
 * ぬいぐるみ あびにゃん — MOE Wiki 参考
 * 大きな黒猫ぬいぐるみ・座り姿・黄色い目・白胸
 */
import * as THREE from "three";
import { addPart, exportPetGlb, mat } from "../petGlbShared.mjs";

const palette = {
  plush: 0x1c1917,
  plushLight: 0x292524,
  chest: 0xf5f5f4,
  eye: 0xfbbf24,
  pupil: 0x09090b,
  eyeShine: 0xfef08a,
  nose: 0xfda4af,
  earIn: 0xfda4af,
  stitch: 0x57534e,
  ribbon: 0x6366f1,
};

export function buildAbinyanRoot() {
  const root = new THREE.Group();
  root.name = "AbinyanRoot";

  const body = new THREE.Group();
  body.name = "AbinyanBody";
  root.add(body);

  const plush = mat(palette.plush);
  const plushLight = mat(palette.plushLight);
  const chest = mat(palette.chest);
  const eye = mat(palette.eye, { emissive: 0xf59e0b, emissiveIntensity: 0.28 });
  const pupil = mat(palette.pupil);
  const eyeShine = mat(palette.eyeShine);
  const nose = mat(palette.nose);
  const earIn = mat(palette.earIn);
  const stitch = mat(palette.stitch);
  const ribbon = mat(palette.ribbon);

  /* 座り姿 — 下重心の丸体 */
  addPart(body, new THREE.SphereGeometry(0.34, 8, 8), plush, 0, 0.46, 0);
  addPart(body, new THREE.SphereGeometry(0.3, 8, 8), plushLight, 0, 0.44, 0.04);
  addPart(body, new THREE.SphereGeometry(0.22, 8, 8), chest, 0, 0.42, 0.12);

  /* 頭 — 大きめ */
  addPart(body, new THREE.SphereGeometry(0.26, 8, 8), plush, 0, 0.72, 0.06);
  addPart(body, new THREE.SphereGeometry(0.2, 8, 8), plushLight, 0, 0.7, 0.12);

  /* 耳 — ぬいぐるみ三角 */
  addPart(body, new THREE.ConeGeometry(0.11, 0.18, 3), plush, -0.18, 0.88, 0.04, [0, 0, 0.22]);
  addPart(body, new THREE.ConeGeometry(0.11, 0.18, 3), plush, 0.18, 0.88, 0.04, [0, 0, -0.22]);
  addPart(body, new THREE.ConeGeometry(0.06, 0.12, 3), earIn, -0.18, 0.88, 0.06, [0, 0, 0.22]);
  addPart(body, new THREE.ConeGeometry(0.06, 0.12, 3), earIn, 0.18, 0.88, 0.06, [0, 0, -0.22]);

  /* 顔 — 大きな黄色い目 */
  addPart(body, new THREE.SphereGeometry(0.07, 6, 6), eye, -0.09, 0.74, 0.24);
  addPart(body, new THREE.SphereGeometry(0.07, 6, 6), eye, 0.09, 0.74, 0.24);
  addPart(body, new THREE.SphereGeometry(0.04, 4, 4), pupil, -0.09, 0.74, 0.28);
  addPart(body, new THREE.SphereGeometry(0.04, 4, 4), pupil, 0.09, 0.74, 0.28);
  addPart(body, new THREE.SphereGeometry(0.018, 4, 4), eyeShine, -0.07, 0.76, 0.29);
  addPart(body, new THREE.SphereGeometry(0.018, 4, 4), eyeShine, 0.11, 0.76, 0.29);
  addPart(body, new THREE.SphereGeometry(0.045, 4, 4), nose, 0, 0.66, 0.28);
  addPart(body, new THREE.TorusGeometry(0.055, 0.012, 4, 8), stitch, 0, 0.62, 0.26, [0.2, 0, 0]);

  /* リボン */
  addPart(body, new THREE.BoxGeometry(0.16, 0.07, 0.07), ribbon, 0, 0.52, 0.2);
  addPart(body, new THREE.BoxGeometry(0.07, 0.12, 0.05), ribbon, -0.11, 0.5, 0.22, [0, 0, 0.45]);
  addPart(body, new THREE.BoxGeometry(0.07, 0.12, 0.05), ribbon, 0.11, 0.5, 0.22, [0, 0, -0.45]);

  /* 座り足 — 短く前に出す */
  addPart(body, new THREE.BoxGeometry(0.13, 0.1, 0.13), plushLight, -0.22, 0.24, 0.18);
  addPart(body, new THREE.BoxGeometry(0.13, 0.1, 0.13), plushLight, 0.22, 0.24, 0.18);
  addPart(body, new THREE.BoxGeometry(0.11, 0.08, 0.11), plush, -0.14, 0.22, 0.28);
  addPart(body, new THREE.BoxGeometry(0.11, 0.08, 0.11), plush, 0.14, 0.22, 0.28);

  /* しっぽ — 曲がったぬいぐるみ尻尾 */
  addPart(body, new THREE.BoxGeometry(0.09, 0.09, 0.22), plush, 0, 0.44, -0.3, [0.35, 0, 0]);
  addPart(body, new THREE.BoxGeometry(0.07, 0.07, 0.16), plushLight, 0.06, 0.48, -0.44, [0.5, 0, 0.25]);

  /* 縫い目 */
  addPart(body, new THREE.BoxGeometry(0.02, 0.28, 0.02), stitch, 0, 0.58, 0.28);

  return root;
}

await exportPetGlb(buildAbinyanRoot, "Abinyan.glb");
