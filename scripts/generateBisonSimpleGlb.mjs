/**
 * マウンテンバイソン（小）・荒くれバイソン（大）glb 生成
 * スマホ向け ~500 三角面 / 実行: node scripts/generateBisonSimpleGlb.mjs
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

/** 低ポリ設定（目標 ~500 三角面） */
const SPHERE_L = [6, 4];
const SPHERE_M = [5, 4];
const SPHERE_S = [4, 3];
const CYL_SEG = 5;

function mat(color, roughness = 0.84, metalness = 0.02) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addPart(group, geometry, material, x, y, z, rot = [0, 0, 0], scl = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(...rot);
  mesh.scale.set(...scl);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function buildBisonRoot(palette, scale) {
  const root = new THREE.Group();
  root.name = "BisonRoot";
  root.scale.setScalar(scale);

  const s = (v) => v;
  const bodyMat = mat(palette.body);
  const darkMat = mat(palette.dark, 0.9);
  const bellyMat = mat(palette.belly, 0.78);
  const hoofMat = mat(palette.hoof, 0.95);
  const hornMat = mat(palette.horn, 0.72, 0.08);
  const muzzleMat = mat(palette.muzzle, 0.8);
  const patchMat = mat(palette.patch, 0.88);
  const eyeMat = mat(palette.eye, 0.35, 0.1);

  addPart(
    root,
    new THREE.SphereGeometry(s(0.74), ...SPHERE_L),
    bodyMat,
    0,
    s(0.64),
    0,
    [0, 0, 0],
    [s(1.18), s(0.92), s(1.62)]
  );
  addPart(
    root,
    new THREE.SphereGeometry(s(0.46), ...SPHERE_M),
    mat(palette.hump ?? palette.body, 0.86),
    0,
    s(1.02),
    s(-0.2),
    [s(-0.42), 0, 0],
    [s(1.15), s(0.72), s(1.05)]
  );
  addPart(
    root,
    new THREE.SphereGeometry(s(0.58), ...SPHERE_M),
    bellyMat,
    0,
    s(0.44),
    s(0.1),
    [0, 0, 0],
    [s(1.08), s(0.58), s(1.38)]
  );
  addPart(
    root,
    new THREE.SphereGeometry(s(0.28), ...SPHERE_S),
    patchMat,
    s(-0.34),
    s(0.78),
    s(-0.08),
    [0, 0.2, 0],
    [1.1, 0.85, 1.0]
  );
  addPart(
    root,
    new THREE.SphereGeometry(s(0.24), ...SPHERE_S),
    patchMat,
    s(0.36),
    s(0.74),
    s(0.12),
    [0, -0.15, 0],
    [1.0, 0.8, 1.05]
  );

  addPart(
    root,
    new THREE.SphereGeometry(s(0.42), ...SPHERE_M),
    bodyMat,
    0,
    s(0.82),
    s(1.02),
    [s(0.18), 0, 0],
    [s(1.05), s(0.92), s(1.08)]
  );
  addPart(
    root,
    new THREE.SphereGeometry(s(0.28), ...SPHERE_S),
    muzzleMat,
    0,
    s(0.68),
    s(1.48),
    [s(0.12), 0, 0],
    [s(1.05), s(0.72), s(1.15)]
  );
  addPart(
    root,
    new THREE.BoxGeometry(s(0.18), s(0.05), s(0.06)),
    mat(palette.nostril, 0.9),
    0,
    s(0.64),
    s(1.72),
    [0, 0, 0]
  );

  for (const sx of [-1, 1]) {
    addPart(
      root,
      new THREE.SphereGeometry(s(0.12), ...SPHERE_S),
      darkMat,
      s(0.28 * sx),
      s(1.02),
      s(1.22),
      [0, sx * 0.35, sx * 0.25],
      [0.85, 1.0, 0.75]
    );
    addPart(
      root,
      new THREE.BoxGeometry(s(0.06), s(0.06), s(0.04)),
      eyeMat,
      s(0.2 * sx),
      s(0.88),
      s(1.38),
      [0, 0, 0]
    );
  }

  for (const sx of [-1, 1]) {
    addPart(
      root,
      new THREE.CylinderGeometry(s(0.05), s(0.07), s(0.52), CYL_SEG),
      hornMat,
      s(0.24 * sx),
      s(1.14),
      s(1.32),
      [s(0.45), sx * 0.28, sx * 0.18]
    );
  }

  for (let i = 0; i < 3; i++) {
    const t = i / 2;
    addPart(
      root,
      new THREE.SphereGeometry(s(0.14), ...SPHERE_S),
      darkMat,
      s(-0.18 + t * 0.36),
      s(0.92),
      s(0.72 + t * 0.18),
      [s(-0.25), 0, 0],
      [0.9, 0.75, 0.85]
    );
  }

  const legPairs = [
    [-0.46, -0.78],
    [0.46, -0.78],
    [-0.46, 0.78],
    [0.46, 0.78],
  ];
  for (const [lx, lz] of legPairs) {
    addPart(
      root,
      new THREE.CylinderGeometry(s(0.13), s(0.15), s(0.68), CYL_SEG),
      darkMat,
      s(lx),
      s(0.34),
      s(lz),
      [0, 0, 0]
    );
    addPart(
      root,
      new THREE.BoxGeometry(s(0.22), s(0.1), s(0.26)),
      hoofMat,
      s(lx),
      s(0.05),
      s(lz),
      [0, 0, 0]
    );
  }

  addPart(
    root,
    new THREE.CylinderGeometry(s(0.05), s(0.08), s(0.34), CYL_SEG),
    darkMat,
    0,
    s(0.72),
    s(-1.08),
    [s(-0.55), 0, 0]
  );
  addPart(
    root,
    new THREE.SphereGeometry(s(0.1), ...SPHERE_S),
    patchMat,
    0,
    s(0.58),
    s(-1.24),
    [0, 0, 0],
    [0.85, 0.75, 1.1]
  );

  return root;
}

function buildAnimations() {
  const idleClip = new THREE.AnimationClip("Idle01", 2.4, [
    new THREE.VectorKeyframeTrack(
      "BisonRoot.position",
      [0, 1.2, 2.4],
      [0, 0, 0, 0, 0.07, 0, 0, 0, 0]
    ),
  ]);

  const walkClip = new THREE.AnimationClip("Walk01", 0.55, [
    new THREE.VectorKeyframeTrack(
      "BisonRoot.position",
      [0, 0.1375, 0.275, 0.4125, 0.55],
      [0, 0, 0, 0, 0.05, 0.05, 0, 0.1, 0.1, 0, 0.05, 0.05, 0, 0, 0]
    ),
  ]);

  const attackClip = new THREE.AnimationClip("Attack01", 0.65, [
    new THREE.VectorKeyframeTrack(
      "BisonRoot.position",
      [0, 0.12, 0.32, 0.5, 0.65],
      [0, 0, 0, 0, 0.04, 0.12, 0, 0.06, 0.42, 0, 0.03, 0.18, 0, 0, 0]
    ),
  ]);

  const attackStrongClip = new THREE.AnimationClip("AttackPow02", 0.85, [
    new THREE.VectorKeyframeTrack(
      "BisonRoot.position",
      [0, 0.18, 0.4, 0.62, 0.85],
      [0, 0, 0, 0, 0.1, 0.22, 0, 0.14, 0.78, 0, 0.07, 0.3, 0, 0, 0]
    ),
  ]);

  return [idleClip, walkClip, attackClip, attackStrongClip];
}

function exportGlb(scene, animations, fileName) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (arrayBuffer) => {
        const buf = Buffer.from(arrayBuffer);
        const outPaths = [
          path.join(root, "public/assets/models/monster", fileName),
          path.join(root, "src/app/monster", fileName),
        ];
        for (const outPath of outPaths) {
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

const animations = buildAnimations();

const mountainPalette = {
  body: 0x8a7358,
  dark: 0x5c4a3a,
  belly: 0xb8a48c,
  hoof: 0x3a2f28,
  horn: 0x6b5a48,
  muzzle: 0xa89278,
  patch: 0xd8d0c4,
  nostril: 0x4a3c32,
  eye: 0x1a1410,
  hump: 0x7a6652,
};

const roughPalette = {
  body: 0x3d2818,
  dark: 0x241810,
  belly: 0x5a4030,
  hoof: 0x120c08,
  horn: 0x2a1a10,
  muzzle: 0x4a3224,
  patch: 0x6b3828,
  nostril: 0x180f0a,
  eye: 0xff5533,
  hump: 0x322018,
};

const variants = [
  {
    fileName: "MountainBison.glb",
    scale: 0.78,
    palette: mountainPalette,
  },
  {
    fileName: "RoughBison.glb",
    scale: 1.28,
    palette: roughPalette,
  },
];

for (const variant of variants) {
  const scene = new THREE.Scene();
  scene.add(buildBisonRoot(variant.palette, variant.scale));
  const tris = countTriangles(scene);
  await exportGlb(scene, animations, variant.fileName);
  console.log(`${variant.fileName}: ~${tris} triangles, scale ${variant.scale}`);
}

const legacyScene = new THREE.Scene();
legacyScene.add(buildBisonRoot(mountainPalette, 1));
await exportGlb(legacyScene, animations, "BisonSimple.glb");
console.log("Legacy BisonSimple.glb updated");
