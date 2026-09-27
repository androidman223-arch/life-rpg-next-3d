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
  pantsYellow: 0xfacc15,
  pantsOrange: 0xf97316,
  pantsGreen: 0x22c55e,
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
  const pantsYellow = mat(palette.pantsYellow);
  const pantsOrange = mat(palette.pantsOrange);
  const pantsGreen = mat(palette.pantsGreen);
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

  const face = new THREE.Group();
  face.name = "SunSpiritFace";
  head.add(face);
  addPart(face, new THREE.SphereGeometry(0.38, 10, 8), skin, 0, 0, 0);
  addPart(face, new THREE.SphereGeometry(0.1, 8, 6), eye, -0.12, 0.06, 0.3);
  addPart(face, new THREE.SphereGeometry(0.1, 8, 6), eye, 0.12, 0.06, 0.3);
  addPart(face, new THREE.TorusGeometry(0.17, 0.035, 6, 12), eyeRing, -0.12, 0.06, 0.28, [0.2, 0, 0]);
  addPart(face, new THREE.TorusGeometry(0.17, 0.035, 6, 12), eyeRing, 0.12, 0.06, 0.28, [0.2, 0, 0]);
  /* 髪はそのまま。顔だけ少し小さく */
  face.scale.setScalar(0.88);

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

  /* 赤い髪 — つばの下。帽子の上には出さない */
  for (let i = 0; i < 10; i++) {
    const a = ((i + 0.35) / 10) * Math.PI * 2;
    const rx = Math.cos(a) * 0.4;
    const rz = Math.sin(a) * 0.4;
    addPart(
      head,
      new THREE.ConeGeometry(0.065, 0.24, 4),
      i % 2 === 0 ? redCrown : redCrownDark,
      rx,
      0.06,
      rz,
      [2.15, a, 0]
    );
  }

  /* お試しソンブレロ中 — 赤い帽子箱は非表示（戻すときはこの6つを足す） */
  const straw = mat(0xf6d36b);
  const strawDark = mat(0xc9922a);
  const hatBand = mat(0x16a34a);
  const hatBandRed = mat(0xef4444);
  const sombrero = new THREE.Group();
  sombrero.name = "SunSpiritSombrero";
  head.add(sombrero);
  addPart(sombrero, new THREE.CylinderGeometry(0.82, 0.58, 0.07, 14), straw, 0, 0.28, 0);
  addPart(
    sombrero,
    new THREE.TorusGeometry(0.74, 0.045, 6, 16),
    strawDark,
    0,
    0.31,
    0,
    [Math.PI / 2, 0, 0]
  );
  addPart(sombrero, new THREE.CylinderGeometry(0.2, 0.28, 0.3, 8), straw, 0, 0.46, 0);
  addPart(sombrero, new THREE.SphereGeometry(0.2, 8, 6), straw, 0, 0.6, 0);
  addPart(sombrero, new THREE.CylinderGeometry(0.29, 0.29, 0.06, 8), hatBand, 0, 0.34, 0);
  addPart(sombrero, new THREE.BoxGeometry(0.07, 0.09, 0.04), hatBandRed, 0, 0.34, 0.28);
  addPart(sombrero, new THREE.SphereGeometry(0.08, 6, 6), glow, 0, 0.74, 0);

  /* 太陽の髪 — いまの大きさのまま */
  head.scale.setScalar(0.9);

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

  for (const sx of [-0.12, 0.12]) {
    addPart(body, new THREE.BoxGeometry(0.14, 0.08, 0.14), pantsOrange, sx, 0.49, 0.04);
    addPart(body, new THREE.BoxGeometry(0.14, 0.08, 0.14), pantsYellow, sx, 0.41, 0.04);
    addPart(body, new THREE.BoxGeometry(0.14, 0.07, 0.14), pantsGreen, sx, 0.335, 0.04);
  }

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
