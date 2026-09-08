/**
 * ギュスターヴ ジャイアント（簡易）— 低ポリ緑ワニ glb
 * SnakeIdle.01 / SnakeRun.02 / SnakeAttakc.01 互換
 * 実行: node scripts/generateGustavGiantGlb.mjs
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
  hide: 0x15803d,
  scale: 0x14532d,
  belly: 0x86efac,
  eye: 0xfbbf24,
};

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.rough ?? 0.52,
    metalness: opts.metal ?? 0.05,
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

function buildGustavRoot() {
  const gustavRoot = new THREE.Group();
  gustavRoot.name = "GustavGiantRoot";

  const hide = mat(palette.hide);
  const scale = mat(palette.scale, { metal: 0.08 });
  const belly = mat(palette.belly, { rough: 0.62 });
  const eye = mat(palette.eye, {
    emissive: 0x713f12,
    emissiveIntensity: 0.35,
    rough: 0.4,
  });

  const body = new THREE.Group();
  body.name = "GustavBody";
  gustavRoot.add(body);

  addPart(body, new THREE.BoxGeometry(2.4, 0.62, 0.95), hide, 0, 0.38, 0);
  addPart(body, new THREE.BoxGeometry(1.8, 0.12, 0.72), belly, 0.05, 0.18, 0);

  const tail = new THREE.Group();
  tail.name = "GustavTail";
  body.add(tail);
  addPart(tail, new THREE.BoxGeometry(1.35, 0.3, 0.38), scale, -1.72, 0.42, 0, [0, 0, -0.12]);
  addPart(tail, new THREE.BoxGeometry(0.55, 0.22, 0.28), hide, -2.35, 0.48, 0, [0, 0, -0.28]);

  const legGeo = new THREE.BoxGeometry(0.28, 0.32, 0.36);
  const legNames = ["GustavLegFL", "GustavLegFR", "GustavLegBL", "GustavLegBR"];
  const legPos = [
    [0.75, 0.16, 0.38],
    [0.75, 0.16, -0.38],
    [-0.55, 0.16, 0.36],
    [-0.55, 0.16, -0.36],
  ];
  for (let i = 0; i < legNames.length; i++) {
    const legGroup = new THREE.Group();
    legGroup.name = legNames[i];
    body.add(legGroup);
    addPart(legGroup, legGeo, scale, ...legPos[i]);
  }

  const ridgeCount = 5;
  for (let i = 0; i < ridgeCount; i++) {
    const t = i / (ridgeCount - 1);
    const rx = -0.9 + t * 1.8;
    addPart(
      body,
      new THREE.ConeGeometry(0.11, 0.18, 4),
      scale,
      rx,
      0.72,
      0
    );
  }

  const snout = new THREE.Group();
  snout.name = "GustavSnout";
  snout.position.set(1.55, 0.34, 0);
  body.add(snout);

  addPart(snout, new THREE.BoxGeometry(1.05, 0.38, 0.52), scale, 0, 0, 0);
  addPart(snout, new THREE.BoxGeometry(0.75, 0.14, 0.44), belly, -0.2, -0.18, 0);

  const eyeGeo = new THREE.SphereGeometry(0.09, 8, 8);
  addPart(snout, eyeGeo, eye, 0.3, 0.14, 0.18);
  addPart(snout, eyeGeo, eye, 0.3, 0.14, -0.18);

  return gustavRoot;
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
  return new THREE.VectorKeyframeTrack(`${name}.position`, times, positions);
}

function buildAnimations() {
  const restLeg = [0, 0, 0];
  const swingA = [0.35, 0, 0];
  const swingB = [-0.35, 0, 0];

  return [
    new THREE.AnimationClip("SnakeIdle.01", 2.4, [
      posTrack("GustavBody", [0, 1.2, 2.4], [0, 0, 0, 0, 0.03, 0, 0, 0, 0]),
      legTrack("GustavTail", [0, 1.2, 2.4], [restLeg, [0, 0, 0.08], restLeg]),
    ]),
    new THREE.AnimationClip("SnakeRun.02", 0.55, [
      legTrack(
        "GustavLegFL",
        [0, 0.1375, 0.275, 0.4125, 0.55],
        [swingA, restLeg, swingB, restLeg, swingA]
      ),
      legTrack(
        "GustavLegFR",
        [0, 0.1375, 0.275, 0.4125, 0.55],
        [swingB, restLeg, swingA, restLeg, swingB]
      ),
      legTrack(
        "GustavLegBL",
        [0, 0.1375, 0.275, 0.4125, 0.55],
        [swingB, restLeg, swingA, restLeg, swingB]
      ),
      legTrack(
        "GustavLegBR",
        [0, 0.1375, 0.275, 0.4125, 0.55],
        [swingA, restLeg, swingB, restLeg, swingA]
      ),
      posTrack(
        "GustavBody",
        [0, 0.1375, 0.275, 0.4125, 0.55],
        [0, 0, 0, 0, 0.05, 0, 0, 0, 0, 0, 0.05, 0, 0, 0, 0]
      ),
    ]),
    new THREE.AnimationClip("SnakeAttakc.01", 0.55, [
      posTrack(
        "GustavGiantRoot",
        [0, 0.1, 0.2, 0.55],
        [
          0, 0, 0,
          2.0, 0, 0,
          2.0, 0, 0,
          0, 0, 0,
        ]
      ),
    ]),
    new THREE.AnimationClip("SnakeAttakcStrong.01", 1.1, [
      posTrack(
        "GustavGiantRoot",
        [0, 0.12, 0.42, 0.58, 0.72, 1.1],
        [
          0, 0, 0,
          -2.0, 0, 0,
          -2.0, 0, 0,
          3.2, 0, 0,
          3.2, 0, 0,
          0, 0, 0,
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
const gustav = buildGustavRoot();
scene.add(gustav);
const animations = buildAnimations();
const tris = countTriangles(gustav);
await exportGlb(scene, animations, "GustavGiant.glb");
console.log(`GustavGiant.glb: ~${tris} triangles`);
