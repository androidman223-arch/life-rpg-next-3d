/**
 * MOE コグニート♂ — 背高・細身のエルフ系冒険者（低ポリ）
 * 実行: node scripts/generatePlayerCogniteMaleGlb.mjs
 */
import * as THREE from "three";
import { addPart, exportPlayerGlb, mat } from "./petGlbShared.mjs";

const palette = {
  skin: 0xf3e8d8,
  skinShadow: 0xe7d5c4,
  hair: 0x94a3b8,
  hairDark: 0x64748b,
  eye: 0x1e293b,
  eyeShine: 0xf8fafc,
  coat: 0x1e293b,
  coatLight: 0x334155,
  trim: 0x475569,
  shirt: 0xcbd5e1,
  belt: 0x78716c,
  buckle: 0xfbbf24,
  boot: 0x292524,
  bootTrim: 0x57534e,
  ear: 0xe7d5c4,
};

function addLeg(parent, name, x) {
  const leg = new THREE.Group();
  leg.name = name;
  leg.position.set(x, 0.42, 0.01);
  parent.add(leg);
  return leg;
}

function addArm(parent, name, x) {
  const arm = new THREE.Group();
  arm.name = name;
  arm.position.set(x, 0.72, 0);
  parent.add(arm);
  return arm;
}

export function buildPlayerCogniteMaleRoot() {
  const root = new THREE.Group();
  root.name = "PlayerCogniteMaleRoot";

  const body = new THREE.Group();
  body.name = "PlayerCogniteMaleBody";
  root.add(body);

  const skin = mat(palette.skin);
  const skinShadow = mat(palette.skinShadow);
  const hair = mat(palette.hair);
  const hairDark = mat(palette.hairDark);
  const eye = mat(palette.eye);
  const eyeShine = mat(palette.eyeShine);
  const coat = mat(palette.coat);
  const coatLight = mat(palette.coatLight);
  const trim = mat(palette.trim);
  const shirt = mat(palette.shirt);
  const belt = mat(palette.belt);
  const buckle = mat(palette.buckle, {
    emissive: 0xf59e0b,
    emissiveIntensity: 0.15,
  });
  const boot = mat(palette.boot);
  const bootTrim = mat(palette.bootTrim);
  const ear = mat(palette.ear);

  /* 脚 — 股関節グループで交互スイング */
  const legL = addLeg(body, "PlayerCogniteMaleLegL", -0.1);
  const legR = addLeg(body, "PlayerCogniteMaleLegR", 0.1);
  for (const leg of [legL, legR]) {
    addPart(leg, new THREE.BoxGeometry(0.11, 0.42, 0.12), coat, 0, -0.21, 0);
    addPart(leg, new THREE.BoxGeometry(0.1, 0.38, 0.11), coatLight, 0, -0.19, 0.01);
    addPart(leg, new THREE.BoxGeometry(0.12, 0.14, 0.14), boot, 0, -0.35, 0.02);
    addPart(leg, new THREE.BoxGeometry(0.13, 0.04, 0.15), bootTrim, 0, -0.4, 0.03);
  }

  /* 胴 — 細身コート */
  addPart(body, new THREE.BoxGeometry(0.28, 0.34, 0.16), coat, 0, 0.59, 0);
  addPart(body, new THREE.BoxGeometry(0.24, 0.28, 0.14), shirt, 0, 0.58, 0.02);
  addPart(body, new THREE.BoxGeometry(0.3, 0.08, 0.17), coatLight, 0, 0.44, 0);
  addPart(body, new THREE.BoxGeometry(0.08, 0.22, 0.08), trim, -0.16, 0.58, 0.02);
  addPart(body, new THREE.BoxGeometry(0.08, 0.22, 0.08), trim, 0.16, 0.58, 0.02);
  addPart(body, new THREE.BoxGeometry(0.3, 0.06, 0.17), belt, 0, 0.46, 0.01);
  addPart(body, new THREE.BoxGeometry(0.06, 0.06, 0.04), buckle, 0, 0.46, 0.09);

  /* 腕 — 肩グループで走行スイング */
  const armL = addArm(body, "PlayerCogniteMaleArmL", -0.2);
  const armR = addArm(body, "PlayerCogniteMaleArmR", 0.2);
  for (const arm of [armL, armR]) {
    addPart(arm, new THREE.BoxGeometry(0.09, 0.28, 0.09), coat, 0, -0.14, 0);
    addPart(arm, new THREE.BoxGeometry(0.08, 0.1, 0.08), skin, 0, -0.3, 0.01);
  }

  /* 首 */
  addPart(body, new THREE.BoxGeometry(0.1, 0.08, 0.1), skinShadow, 0, 0.78, 0.01);

  /* 頭 — ひげなし・すっきり */
  addPart(body, new THREE.BoxGeometry(0.22, 0.24, 0.22), skin, 0, 0.94, 0.02);
  addPart(body, new THREE.SphereGeometry(0.028, 6, 6), eye, -0.06, 0.96, 0.12);
  addPart(body, new THREE.SphereGeometry(0.028, 6, 6), eye, 0.06, 0.96, 0.12);
  addPart(body, new THREE.SphereGeometry(0.01, 4, 4), eyeShine, -0.05, 0.97, 0.135);
  addPart(body, new THREE.SphereGeometry(0.01, 4, 4), eyeShine, 0.07, 0.97, 0.135);

  /* 髪 — シルバーグレー・ロング */
  addPart(body, new THREE.BoxGeometry(0.24, 0.1, 0.24), hair, 0, 1.06, -0.01);
  addPart(body, new THREE.BoxGeometry(0.26, 0.14, 0.28), hairDark, 0, 1.0, -0.04);
  addPart(body, new THREE.BoxGeometry(0.1, 0.16, 0.12), hair, -0.13, 0.98, -0.02);
  addPart(body, new THREE.BoxGeometry(0.1, 0.16, 0.12), hair, 0.13, 0.98, -0.02);
  addPart(body, new THREE.BoxGeometry(0.22, 0.28, 0.1), hair, 0, 0.88, -0.12);
  addPart(body, new THREE.BoxGeometry(0.18, 0.24, 0.08), hairDark, 0, 0.76, -0.13);
  addPart(body, new THREE.BoxGeometry(0.14, 0.2, 0.07), hair, 0, 0.64, -0.12);
  addPart(body, new THREE.BoxGeometry(0.1, 0.16, 0.06), hairDark, 0, 0.52, -0.11);
  addPart(body, new THREE.BoxGeometry(0.06, 0.32, 0.08), hair, -0.14, 0.82, -0.02);
  addPart(body, new THREE.BoxGeometry(0.06, 0.32, 0.08), hair, 0.14, 0.82, -0.02);
  addPart(body, new THREE.BoxGeometry(0.05, 0.22, 0.06), hairDark, -0.15, 0.68, -0.04);
  addPart(body, new THREE.BoxGeometry(0.05, 0.22, 0.06), hairDark, 0.15, 0.68, -0.04);
  addPart(body, new THREE.BoxGeometry(0.18, 0.08, 0.08), hair, 0, 0.98, 0.1);

  /* コグニート耳 — 尖り */
  addPart(body, new THREE.ConeGeometry(0.045, 0.16, 3), ear, -0.14, 1.0, -0.02, [
    0, 0, 0.35,
  ]);
  addPart(body, new THREE.ConeGeometry(0.045, 0.16, 3), ear, 0.14, 1.0, -0.02, [
    0, 0, -0.35,
  ]);

  /* マント襟 */
  addPart(body, new THREE.BoxGeometry(0.32, 0.06, 0.2), coatLight, 0, 0.74, -0.06, [
    0.25, 0, 0,
  ]);

  return root;
}

await exportPlayerGlb(buildPlayerCogniteMaleRoot, "CogniteMale.glb", {
  humanoidLegs: true,
});
