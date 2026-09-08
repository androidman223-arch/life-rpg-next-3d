/**
 * ペット glb 生成 — 共通ユーティリティ
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

export const PET_GLB_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

export function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.rough ?? 0.48,
    metalness: opts.metal ?? 0.04,
    flatShading: true,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
}

export function addPart(parent, geo, material, x, y, z, rot = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(...rot);
  parent.add(mesh);
  return mesh;
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

/** SnakeIdle / SnakeRun / SnakeAttakc 互換クリップ */
export function buildSnakeCompatAnimations(prefix, opts = {}) {
  const { hasArms = false, wingFlap = false, bodyBob = 1 } = opts;
  const rest = [0, 0, 0];
  const armA = [0.25, 0, 0.35];
  const armB = [-0.2, 0, -0.3];
  const wingUp = [0.55, 0, 0];
  const wingDn = [-0.35, 0, 0];
  const idleY = 0.08 * bodyBob;
  const idlePeak = 0.14 * bodyBob;
  const runY = 0.1 * bodyBob;
  const runPeak = 0.14 * bodyBob;

  const idleTracks = [
    posTrack(`${prefix}Body`, [0, 1.1, 2.2], [
      0, idleY, 0, 0, idlePeak, 0, 0, idleY, 0,
    ]),
  ];
  const runTracks = [
    posTrack(`${prefix}Body`, [0, 0.125, 0.25, 0.375, 0.5], [
      0, runY, 0, 0, runPeak, 0, 0, runY, 0, 0, runPeak, 0, 0, runY, 0,
    ]),
  ];
  const attackTracks = [
    posTrack(`${prefix}Root`, [0, 0.04, 0.08, 0.16, 0.24], [
      0, 0, 0, 0, 0, -0.32, 0, 0, 2.05, 0, 0, 0.55, 0, 0, 0,
    ]),
  ];
  const strongTracks = [
    posTrack(`${prefix}Root`, [0, 0.1, 0.22, 0.38, 0.6], [
      0, 0, 0, 0, 0, -1.05, 0, 0, -1.05, 0, 0, 2.35, 0, 0, 0,
    ]),
  ];

  if (hasArms) {
    const armIdle = quatTrack(`${prefix}ArmL`, [0, 0.55, 1.1, 1.65, 2.2], [
      armA, rest, armB, rest, armA,
    ]);
    const armRun = quatTrack(`${prefix}ArmL`, [0, 0.125, 0.25, 0.375, 0.5], [
      armA, rest, armB, rest, armA,
    ]);
    const armRIdle = quatTrack(`${prefix}ArmR`, [0, 0.55, 1.1, 1.65, 2.2], [
      armB, rest, armA, rest, armB,
    ]);
    const armRRun = quatTrack(`${prefix}ArmR`, [0, 0.125, 0.25, 0.375, 0.5], [
      armB, rest, armA, rest, armB,
    ]);
    idleTracks.push(armIdle, armRIdle);
    runTracks.push(armRun, armRRun);
    attackTracks.push(
      quatTrack(`${prefix}ArmL`, [0, 0.04, 0.08, 0.16, 0.24], [armA, armB, armA, armB, rest]),
      quatTrack(`${prefix}ArmR`, [0, 0.04, 0.08, 0.16, 0.24], [armB, armA, armB, armA, rest])
    );
  }

  if (wingFlap) {
    idleTracks.push(
      quatTrack(`${prefix}WingL`, [0, 0.55, 1.1, 1.65, 2.2], [wingUp, wingDn, wingUp, wingDn, wingUp]),
      quatTrack(`${prefix}WingR`, [0, 0.55, 1.1, 1.65, 2.2], [wingDn, wingUp, wingDn, wingUp, wingDn])
    );
    runTracks.push(
      quatTrack(`${prefix}WingL`, [0, 0.125, 0.25, 0.375, 0.5], [wingUp, wingDn, wingUp, wingDn, wingUp]),
      quatTrack(`${prefix}WingR`, [0, 0.125, 0.25, 0.375, 0.5], [wingDn, wingUp, wingDn, wingUp, wingDn])
    );
  }

  return [
    new THREE.AnimationClip("SnakeIdle.01", 2.2, idleTracks),
    new THREE.AnimationClip("SnakeRun.02", 0.5, runTracks),
    new THREE.AnimationClip("SnakeAttakc.01", 0.24, attackTracks),
    new THREE.AnimationClip("SnakeAttakcStrong.01", 0.6, strongTracks),
  ];
}

/** 人型プレイヤー — 足・腕の交互スイング（SnakeWalk / SnakeRun 互換、胴ボブなし） */
export function buildHumanoidPlayerAnimations(prefix) {
  const rest = [0, 0, 0];
  const moveTimes = [0, 0.125, 0.25, 0.375, 0.5];

  const legSwing = (amp) => {
    const mid = amp * 0.26;
    return {
      back: [-amp, 0, 0],
      fwd: [amp, 0, 0],
      midB: [-mid, 0, 0],
      midF: [mid, 0, 0],
    };
  };
  const armSwing = (backAmp, fwdAmp) => ({
    back: [-backAmp, 0, 0.06],
    fwd: [fwdAmp, 0, -0.04],
  });

  const walkLeg = legSwing(0.5);
  const runLeg = legSwing(1.0);
  const walkArm = armSwing(0.28, 0.38);

  const legTracks = (legL, legR) => [
    quatTrack(`${prefix}LegL`, moveTimes, [
      legL.back, legL.midB, legL.fwd, legL.midF, legL.back,
    ]),
    quatTrack(`${prefix}LegR`, moveTimes, [
      legR.fwd, legR.midF, legR.back, legR.midB, legR.fwd,
    ]),
  ];
  const armTracks = (arm) => [
    quatTrack(`${prefix}ArmL`, moveTimes, [
      arm.fwd, rest, arm.back, rest, arm.fwd,
    ]),
    quatTrack(`${prefix}ArmR`, moveTimes, [
      arm.back, rest, arm.fwd, rest, arm.back,
    ]),
  ];

  const idleTracks = [
    quatTrack(`${prefix}LegL`, [0], [rest]),
    quatTrack(`${prefix}LegR`, [0], [rest]),
    quatTrack(`${prefix}ArmL`, [0], [rest]),
    quatTrack(`${prefix}ArmR`, [0], [rest]),
  ];
  const walkTracks = [...legTracks(walkLeg, walkLeg), ...armTracks(walkArm)];
  const runTracks = [...legTracks(runLeg, runLeg), ...armTracks(walkArm)];
  const attackTracks = [
    posTrack(`${prefix}Root`, [0, 0.04, 0.08, 0.16, 0.24], [
      0, 0, 0, 0, 0, -0.32, 0, 0, 2.05, 0, 0, 0.55, 0, 0, 0,
    ]),
    quatTrack(`${prefix}ArmL`, [0, 0.04, 0.08, 0.16, 0.24], [
      rest, walkArm.fwd, walkArm.fwd, rest, rest,
    ]),
    quatTrack(`${prefix}ArmR`, [0, 0.04, 0.08, 0.16, 0.24], [
      rest, walkArm.back, walkArm.back, rest, rest,
    ]),
  ];
  const strongTracks = [
    posTrack(`${prefix}Root`, [0, 0.1, 0.22, 0.38, 0.6], [
      0, 0, 0, 0, 0, -1.05, 0, 0, -1.05, 0, 0, 2.35, 0, 0, 0,
    ]),
    quatTrack(`${prefix}ArmL`, [0, 0.1, 0.22, 0.38, 0.6], [
      rest, walkArm.fwd, walkArm.fwd, rest, rest,
    ]),
    quatTrack(`${prefix}ArmR`, [0, 0.1, 0.22, 0.38, 0.6], [
      rest, walkArm.back, walkArm.back, rest, rest,
    ]),
  ];

  return [
    new THREE.AnimationClip("SnakeIdle.01", 2.2, idleTracks),
    new THREE.AnimationClip("SnakeWalk.01", 0.5, walkTracks),
    new THREE.AnimationClip("SnakeRun.02", 0.5, runTracks),
    new THREE.AnimationClip("SnakeAttakc.01", 0.24, attackTracks),
    new THREE.AnimationClip("SnakeAttakcStrong.01", 0.6, strongTracks),
  ];
}

export function countTriangles(object) {
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

export function exportGlb(scene, animations, fileName) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (arrayBuffer) => {
        const buf = Buffer.from(arrayBuffer);
        for (const outPath of [
          path.join(PET_GLB_ROOT, "public/assets/models/pet", fileName),
          path.join(PET_GLB_ROOT, "src/app/pet", fileName),
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

export async function exportPetGlb(buildRoot, fileName, animOpts = {}) {
  return exportModelGlb(buildRoot, fileName, "pet", animOpts);
}

export async function exportPlayerGlb(buildRoot, fileName, animOpts = {}) {
  return exportModelGlb(buildRoot, fileName, "player", animOpts);
}

export async function exportModelGlb(
  buildRoot,
  fileName,
  folder,
  animOpts = {}
) {
  const root = buildRoot();
  const prefix = root.name.replace(/Root$/, "");
  const scene = new THREE.Scene();
  scene.add(root);
  const animations = animOpts.humanoidLegs
    ? buildHumanoidPlayerAnimations(prefix)
    : buildSnakeCompatAnimations(prefix, animOpts);
  const tris = countTriangles(root);
  await exportGlbToFolder(scene, animations, fileName, folder);
  console.log(`${fileName}: ~${tris} triangles`);
}

function exportGlbToFolder(scene, animations, fileName, folder) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (arrayBuffer) => {
        const buf = Buffer.from(arrayBuffer);
        for (const outPath of [
          path.join(PET_GLB_ROOT, "public/assets/models", folder, fileName),
          path.join(PET_GLB_ROOT, "src/app", folder, fileName),
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
