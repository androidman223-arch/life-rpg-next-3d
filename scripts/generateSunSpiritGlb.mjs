/**
 * 太陽の大精霊 — MOE デザコン12 優秀賞ベースの低ポリ chibi
 * 元気な太陽精霊・マラカス・太陽の髪飾り
 * SnakeIdle.01 / SnakeRun.02 / SnakeAttakc.01 互換
 * 実行: node scripts/generateSunSpiritGlb.mjs
 */
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((ab) => {
        this.result = ab;
        this.onloadend?.({ target: this });
      });
    }
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const palette = {
  skin: 0xfcd9b6,
  hair: 0xfde047,
  hairDark: 0xf59e0b,
  redCrown: 0xff1a3d,
  redCrownDark: 0xd41937,
  outfit: 0xf97316,
  outfitDark: 0xc2410c,
  eye: 0x1e1b4b,
  eyeRing: 0xef4444,
  maraca: 0xfbbf24,
  maracaStripe: 0xea580c,
  ray: 0xfbbf24,
  glow: 0xfff7ed,
};

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.rough ?? 0.48,
    metalness: opts.metal ?? 0.04,
    flatShading: true,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
}

function addPart(parent, geo, material, x, y, z, rot = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(...rot);
  parent.add(mesh);
  return mesh;
}

function buildSunSpiritRoot() {
  const sunRoot = new THREE.Group();
  sunRoot.name = "SunSpiritRoot";

  const body = new THREE.Group();
  body.name = "SunSpiritBody";
  sunRoot.add(body);

  const skin = mat(palette.skin);
  const hairDark = mat(palette.hairDark);
  const outfit = mat(palette.outfit);
  const outfitDark = mat(palette.outfitDark);
  const eye = mat(palette.eye);
  const eyeRing = mat(palette.eyeRing);
  const maraca = mat(palette.maraca);
  const maracaStripe = mat(palette.maracaStripe);
  const ray = mat(palette.ray, {
    emissive: 0x92400e,
    emissiveIntensity: 0.35,
  });
  const redCrown = mat(palette.redCrown, {
    emissive: 0xdc2626,
    emissiveIntensity: 0.36,
  });
  const redCrownDark = mat(palette.redCrownDark, {
    emissive: 0xb91c1c,
    emissiveIntensity: 0.2,
  });
  const glow = mat(palette.glow, {
    emissive: 0xfbbf24,
    emissiveIntensity: 0.45,
    rough: 0.35,
  });

  const head = new THREE.Group();
  head.name = "SunSpiritHead";
  head.position.set(0, 1.05, 0);
  body.add(head);

  addPart(head, new THREE.SphereGeometry(0.38, 10, 8), skin, 0, 0, 0);
  addPart(head, new THREE.SphereGeometry(0.1, 8, 6), eye, -0.12, 0.06, 0.3);
  addPart(head, new THREE.SphereGeometry(0.1, 8, 6), eye, 0.12, 0.06, 0.3);
  addPart(head, new THREE.TorusGeometry(0.17, 0.035, 6, 12), eyeRing, -0.12, 0.06, 0.28, [0.2, 0, 0]);
  addPart(head, new THREE.TorusGeometry(0.17, 0.035, 6, 12), eyeRing, 0.12, 0.06, 0.28, [0.2, 0, 0]);

  const rayCount = 8;
  for (let i = 0; i < rayCount; i++) {
    const a = (i / rayCount) * Math.PI * 2;
    const rx = Math.cos(a) * 0.5;
    const rz = Math.sin(a) * 0.5;
    const isRedCrownRay = i !== 4;
    addPart(
      head,
      new THREE.ConeGeometry(0.105, 0.4, 4),
      isRedCrownRay ? (i % 2 === 0 ? redCrown : redCrownDark) : i % 2 === 0 ? ray : hairDark,
      rx,
      0.32,
      rz,
      [0.38, a, 0]
    );
  }

  /* 目の上 — 赤い帽子風（前後バランス・高く広く） */
  addPart(head, new THREE.BoxGeometry(0.74, 0.26, 0.56), redCrown, 0, 0.38, -0.02);
  addPart(head, new THREE.BoxGeometry(0.72, 0.16, 0.52), redCrownDark, 0, 0.24, -0.06);
  addPart(head, new THREE.BoxGeometry(0.24, 0.13, 0.19), redCrown, -0.36, 0.22, 0.02);
  addPart(head, new THREE.BoxGeometry(0.24, 0.13, 0.19), redCrown, 0.36, 0.22, 0.02);
  addPart(head, new THREE.BoxGeometry(0.42, 0.09, 0.24), redCrownDark, 0, 0.20, 0.21);
  addPart(head, new THREE.BoxGeometry(0.40, 0.10, 0.22), redCrownDark, 0, 0.19, -0.17);
  addPart(head, new THREE.SphereGeometry(0.1, 6, 6), glow, 0, 0.51, -0.02);

  addPart(body, new THREE.BoxGeometry(0.42, 0.38, 0.28), outfit, 0, 0.72, 0);
  addPart(body, new THREE.BoxGeometry(0.46, 0.1, 0.3), outfitDark, 0, 0.58, 0);

  const armL = new THREE.Group();
  armL.name = "SunSpiritArmL";
  armL.position.set(-0.34, 0.78, 0);
  body.add(armL);
  addPart(armL, new THREE.BoxGeometry(0.12, 0.28, 0.12), skin, 0, -0.08, 0.08, [0, 0, 0.45]);
  addPart(armL, new THREE.CylinderGeometry(0.025, 0.025, 0.22, 4), maracaStripe, 0.08, -0.28, 0.18, [0.8, 0, 0.3]);
  addPart(armL, new THREE.SphereGeometry(0.11, 8, 6), maraca, 0.1, -0.42, 0.22);

  const armR = new THREE.Group();
  armR.name = "SunSpiritArmR";
  armR.position.set(0.34, 0.78, 0);
  body.add(armR);
  addPart(armR, new THREE.BoxGeometry(0.12, 0.28, 0.12), skin, 0, -0.08, 0.08, [0, 0, -0.45]);
  addPart(armR, new THREE.CylinderGeometry(0.025, 0.025, 0.22, 4), maracaStripe, -0.08, -0.28, 0.18, [0.8, 0, -0.3]);
  addPart(armR, new THREE.SphereGeometry(0.11, 8, 6), maraca, -0.1, -0.42, 0.22);

  addPart(body, new THREE.BoxGeometry(0.14, 0.22, 0.14), outfitDark, -0.12, 0.42, 0.04);
  addPart(body, new THREE.BoxGeometry(0.14, 0.22, 0.14), outfitDark, 0.12, 0.42, 0.04);

  addPart(body, new THREE.BoxGeometry(0.16, 0.08, 0.2), outfit, 0, 0.52, 0.12);

  return sunRoot;
}

function quatFromEuler(x, y, z) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, "XYZ"));
  return [q.x, q.y, q.z, q.w];
}

function quatTrack(name, times, rots) {
  const values = [];
  for (const [x, y, z] of rots) values.push(...quatFromEuler(x, y, z));
  return new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, times, values);
}

function posTrack(name, times, positions) {
  return new THREE.VectorKeyframeTrack(`${name}.position`, times, positions);
}

function buildAnimations() {
  const restArm = [0, 0, 0];
  const maracaA = [0.25, 0, 0.35];
  const maracaB = [-0.2, 0, -0.3];

  return [
    new THREE.AnimationClip("SnakeIdle.01", 2.2, [
      posTrack("SunSpiritBody", [0, 1.1, 2.2], [0, 0.08, 0, 0, 0.14, 0, 0, 0.08, 0]),
      quatTrack("SunSpiritHead", [0, 1.1, 2.2], [restArm, [0, 0.08, 0], restArm]),
      quatTrack("SunSpiritArmL", [0, 0.55, 1.1, 1.65, 2.2], [maracaA, restArm, maracaB, restArm, maracaA]),
      quatTrack("SunSpiritArmR", [0, 0.55, 1.1, 1.65, 2.2], [maracaB, restArm, maracaA, restArm, maracaB]),
    ]),
    new THREE.AnimationClip("SnakeRun.02", 0.5, [
      posTrack("SunSpiritBody", [0, 0.125, 0.25, 0.375, 0.5], [0, 0.1, 0, 0, 0.14, 0, 0, 0.1, 0, 0, 0.14, 0, 0, 0.1, 0]),
      quatTrack("SunSpiritArmL", [0, 0.125, 0.25, 0.375, 0.5], [maracaA, restArm, maracaB, restArm, maracaA]),
      quatTrack("SunSpiritArmR", [0, 0.125, 0.25, 0.375, 0.5], [maracaB, restArm, maracaA, restArm, maracaB]),
    ]),
    new THREE.AnimationClip("SnakeAttakc.01", 0.24, [
      posTrack("SunSpiritRoot", [0, 0.04, 0.08, 0.16, 0.24], [
        0, 0, 0,
        0, 0, -0.32,
        0, 0, 2.05,
        0, 0, 0.55,
        0, 0, 0,
      ]),
      quatTrack("SunSpiritArmL", [0, 0.04, 0.08, 0.16, 0.24], [maracaA, maracaB, maracaA, maracaB, restArm]),
      quatTrack("SunSpiritArmR", [0, 0.04, 0.08, 0.16, 0.24], [maracaB, maracaA, maracaB, maracaA, restArm]),
    ]),
    new THREE.AnimationClip("SnakeAttakcStrong.01", 0.6, [
      posTrack("SunSpiritRoot", [0, 0.1, 0.22, 0.38, 0.6], [
        0, 0, 0,
        0, 0, -1.05,
        0, 0, -1.05,
        0, 0, 2.35,
        0, 0, 0,
      ]),
    ]),
  ];
}

function countTriangles(object) {
  let count = 0;
  object.traverse((obj) => {
    if (obj.isMesh && obj.geometry?.index) {
      count += obj.geometry.index.count / 3;
    } else if (obj.isMesh && obj.geometry?.attributes?.position) {
      count += obj.geometry.attributes.position.count / 3;
    }
  });
  return Math.round(count);
}

function exportGlb(scene, animations, fileName) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (arrayBuffer) => {
        const buf = Buffer.from(arrayBuffer);
        for (const outPath of [
          path.join(root, "public/assets/models/pet", fileName),
          path.join(root, "src/app/pet", fileName),
        ]) {
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, buf);
          console.log("Wrote", outPath, `(${buf.length} bytes)`);
        }
        resolve(buf.length);
      },
      (err) => reject(err),
      { binary: true, animations }
    );
  });
}

const scene = new THREE.Scene();
const sunSpirit = buildSunSpiritRoot();
scene.add(sunSpirit);
const animations = buildAnimations();
const tris = countTriangles(sunSpirit);
await exportGlb(scene, animations, "SunSpirit.glb");
console.log(`SunSpirit.glb: ~${tris} triangles`);
