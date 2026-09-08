/**
 * ヒルトップ ライオン — MOE 風低ポリ四足ライオン glb
 * SnakeIdle.01 / SnakeRun.02 / SnakeAttakc.01 互換
 * 実行: node scripts/generateHilltopLionGlb.mjs
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

const SPHERE_M = [6, 5];
const SPHERE_S = [5, 4];
const CYL_SEG = 6;

/** MOE ヒルトップ ライオン配色（砂色〜黄金） */
const palette = {
  fur: 0xd4a017,
  furLight: 0xe8c868,
  furDark: 0xa16207,
  belly: 0xf0d890,
  nose: 0x3d2817,
  eye: 0x1a1208,
  mane: 0xb45309,
  claw: 0xf5f5f4,
};

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.rough ?? 0.82,
    metalness: 0,
    flatShading: true,
  });
}

function addPart(parent, geo, material, x, y, z, rot = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(...rot);
  parent.add(mesh);
  return mesh;
}

function buildLionRoot() {
  const lionRoot = new THREE.Group();
  lionRoot.name = "HilltopLionRoot";

  const fur = mat(palette.fur);
  const furLight = mat(palette.furLight);
  const furDark = mat(palette.furDark);
  const belly = mat(palette.belly);
  const noseMat = mat(palette.nose, { rough: 0.9 });
  const eyeMat = mat(palette.eye, { rough: 0.4 });
  const maneMat = mat(palette.mane);
  const clawMat = mat(palette.claw, { rough: 0.5 });

  const body = new THREE.Group();
  body.name = "LionBody";
  body.position.set(0, 0.42, 0);
  lionRoot.add(body);

  addPart(
    body,
    new THREE.BoxGeometry(0.52, 0.34, 0.88),
    fur,
    0,
    0,
    0
  );
  addPart(
    body,
    new THREE.BoxGeometry(0.44, 0.22, 0.72),
    belly,
    0,
    -0.12,
    0.02
  );

  const head = new THREE.Group();
  head.name = "LionHead";
  head.position.set(0, 0.12, 0.52);
  body.add(head);

  addPart(
    head,
    new THREE.SphereGeometry(0.22, ...SPHERE_M),
    furLight,
    0,
    0.04,
    0.08
  );
  addPart(
    head,
    new THREE.BoxGeometry(0.16, 0.12, 0.18),
    furLight,
    0,
    -0.02,
    0.22,
    [0.15, 0, 0]
  );
  addPart(
    head,
    new THREE.SphereGeometry(0.045, ...SPHERE_S),
    noseMat,
    0,
    -0.01,
    0.33
  );
  for (const sx of [-1, 1]) {
    addPart(
      head,
      new THREE.SphereGeometry(0.035, ...SPHERE_S),
      eyeMat,
      0.08 * sx,
      0.08,
      0.2
    );
    addPart(
      head,
      new THREE.ConeGeometry(0.06, 0.14, 4),
      furDark,
      0.1 * sx,
      0.16,
      0.02,
      [0, 0, sx > 0 ? -0.35 : 0.35]
    );
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 4) * Math.PI - Math.PI * 0.5;
    addPart(
      head,
      new THREE.ConeGeometry(0.07, 0.16, 4),
      maneMat,
      Math.sin(a) * 0.2,
      0.02,
      Math.cos(a) * 0.06 - 0.02,
      [0.2, a * 0.15, 0]
    );
  }

  /** 尻尾：お尻（太）→ 先端（細）の円錐1本 */
  const tail = new THREE.Group();
  tail.name = "LionTail";
  tail.position.set(0, -0.06, -0.44);
  body.add(tail);
  addPart(
    tail,
    new THREE.ConeGeometry(0.056, 0.42, CYL_SEG),
    furDark,
    0,
    0,
    -0.21,
    [-Math.PI / 2 - 0.32, 0, 0]
  );

  const legDefs = [
    ["LionLegFL", -0.2, 0.06, 0.28],
    ["LionLegFR", 0.2, 0.06, 0.28],
    ["LionLegBL", -0.2, 0.06, -0.28],
    ["LionLegBR", 0.2, 0.06, -0.28],
  ];
  for (const [name, lx, ly, lz] of legDefs) {
    const leg = new THREE.Group();
    leg.name = name;
    leg.position.set(lx, ly, lz);
    body.add(leg);
    addPart(
      leg,
      new THREE.CylinderGeometry(0.07, 0.08, 0.24, CYL_SEG),
      furDark,
      0,
      -0.08,
      0
    );
    addPart(
      leg,
      new THREE.CylinderGeometry(0.05, 0.06, 0.2, CYL_SEG),
      fur,
      0,
      -0.28,
      0
    );
    addPart(
      leg,
      new THREE.BoxGeometry(0.08, 0.04, 0.1),
      clawMat,
      0,
      -0.4,
      0.02
    );
  }

  return lionRoot;
}

function legQuat(x, y, z) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, "XYZ"));
  return [q.x, q.y, q.z, q.w];
}

function legTrack(name, times, rots) {
  const values = [];
  for (const [x, y, z] of rots) values.push(...legQuat(x, y, z));
  return new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, times, values);
}

function posTrack(name, times, positions) {
  return new THREE.VectorKeyframeTrack(
    `${name}.position`,
    times,
    positions
  );
}

function buildAnimations() {
  const restLeg = [0, 0, 0];
  const swingA = [0.45, 0, 0];
  const swingB = [-0.45, 0, 0];

  return [
    new THREE.AnimationClip("SnakeIdle.01", 2.0, [
      posTrack("LionBody", [0, 1.0, 2.0], [0, 0.42, 0, 0, 0.44, 0, 0, 0.42, 0]),
      legTrack("LionLegFL", [0, 1.0, 2.0], [restLeg, [0.08, 0, 0], restLeg]),
      legTrack("LionLegFR", [0, 1.0, 2.0], [restLeg, [-0.08, 0, 0], restLeg]),
    ]),
    new THREE.AnimationClip("SnakeRun.02", 0.5, [
      legTrack(
        "LionLegFL",
        [0, 0.125, 0.25, 0.375, 0.5],
        [swingA, restLeg, swingB, restLeg, swingA]
      ),
      legTrack(
        "LionLegFR",
        [0, 0.125, 0.25, 0.375, 0.5],
        [swingB, restLeg, swingA, restLeg, swingB]
      ),
      legTrack(
        "LionLegBL",
        [0, 0.125, 0.25, 0.375, 0.5],
        [swingB, restLeg, swingA, restLeg, swingB]
      ),
      legTrack(
        "LionLegBR",
        [0, 0.125, 0.25, 0.375, 0.5],
        [swingA, restLeg, swingB, restLeg, swingA]
      ),
      posTrack(
        "LionBody",
        [0, 0.125, 0.25, 0.375, 0.5],
        [0, 0.42, 0, 0, 0.46, 0, 0, 0.42, 0, 0, 0.46, 0, 0, 0.42, 0]
      ),
    ]),
    new THREE.AnimationClip("SnakeAttakc.01", 0.62, [
      posTrack(
        "HilltopLionRoot",
        [0, 0.12, 0.28, 0.42, 0.62],
        [0, 0, 0, 0, 0, 0.04, 0, 0, 0.22, 0, 0, 0.1, 0, 0, 0]
      ),
      legTrack(
        "LionHead",
        [0, 0.12, 0.28, 0.42, 0.62],
        [
          [0, 0, 0],
          [-0.25, 0, 0],
          [-0.35, 0, 0],
          [-0.1, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),
    new THREE.AnimationClip("SnakeAttakcStrong.01", 1.2, [
      posTrack(
        "HilltopLionRoot",
        [0, 0.35, 0.7, 0.95, 1.2],
        [0, 0, 0, 0, 0, 0.06, 0, 0, 0.28, 0, 0, 0.12, 0, 0, 0]
      ),
      legTrack(
        "LionHead",
        [0, 0.35, 0.7, 0.95, 1.2],
        [
          [0, 0, 0],
          [-0.45, 0, 0],
          [-0.55, 0, 0],
          [-0.15, 0, 0],
          [0, 0, 0],
        ]
      ),
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
          path.join(root, "public/assets/models/monster", fileName),
          path.join(root, "src/app/monster", fileName),
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
scene.add(buildLionRoot());
const tris = countTriangles(scene);
const animations = buildAnimations();
await exportGlb(scene, animations, "HilltopLion.glb");
console.log(`HilltopLion.glb: ~${tris} triangles`);
