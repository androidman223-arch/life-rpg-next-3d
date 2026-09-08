/**
 * オーク歩兵 — MOE「ダーイン オーク」系を参考にした低ポリ glb
 * SnakeIdle.01 / SnakeRun.02 / SnakeAttakc.01 互換
 * 実行: node scripts/generateOrcInfantryGlb.mjs
 */
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import fs from "fs";
import path from "path";
import zlib from "zlib";
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

/** Node 用 OffscreenCanvas（GLTFExporter がテクスチャ PNG 化するため） */
function setupCanvasPolyfill() {
  if (typeof globalThis.OffscreenCanvas !== "undefined") return;

  globalThis.ImageData =
    globalThis.ImageData ||
    class ImageData {
      constructor(data, width, height) {
        this.data = data;
        this.width = width;
        this.height = height;
      }
    };

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c >>> 0;
  }
  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
    return Buffer.concat([len, typeBuf, data, crc]);
  };
  const encodePng = (rgba, width, height) => {
    const stride = width * 4;
    const raw = Buffer.alloc((stride + 1) * height);
    for (let y = 0; y < height; y++) {
      const row = y * (stride + 1);
      raw[row] = 0;
      Buffer.from(rgba.subarray(y * stride, (y + 1) * stride)).copy(raw, row + 1);
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;
    return Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", ihdr),
      chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]);
  };

  globalThis.OffscreenCanvas = class OffscreenCanvas {
    constructor(width = 256, height = 256) {
      this.width = width;
      this.height = height;
      this._pixels = null;
    }
    getContext() {
      const canvas = this;
      return {
        translate() {},
        scale() {},
        putImageData(img) {
          canvas.width = img.width;
          canvas.height = img.height;
          canvas._pixels = img.data;
        },
        drawImage() {},
      };
    }
    convertToBlob({ type = "image/png" } = {}) {
      const png = encodePng(this._pixels, this.width, this.height);
      return Promise.resolve(new Blob([png], { type }));
    }
  };
}

setupCanvasPolyfill();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const SPHERE_L = [6, 4];
const SPHERE_M = [5, 4];
const SPHERE_S = [4, 3];
const CYL_SEG = 5;

/** 豚オーク配色（ピンク〜茶） */
const palette = {
  skin: 0xe8b4a8,
  skinDark: 0xc98878,
  skinLight: 0xf5d4c8,
  /** 豚鼻（やや濃いめ） */
  muzzle: 0xe8a898,
  muzzleDark: 0xc98878,
  nostril: 0x5c3828,
  strap: 0x6b4a2e,
  cloth: 0x5c4030,
  boot: 0x2a2018,
  metal: 0x8a9098,
  metalDark: 0x5a6068,
  wood: 0x6b4423,
};

function mat(color, roughness = 0.84, metalness = 0.02) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

/** MOE 風オーク頭テクスチャ（目はペイント） */
function createOrcHeadTexture(size = 256) {
  const data = new Uint8Array(size * size * 4);
  const skin = { r: 232, g: 180, b: 168 };
  const skinDark = { r: 201, g: 136, b: 120 };
  const skinLight = { r: 245, g: 212, b: 200 };

  const idx = (x, y) => (y * size + x) * 4;
  const put = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = idx(x, y);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  };

  const noise = (x, y) => {
    const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      const n = noise(x, y) * 0.08;
      const vignette = 1 - Math.hypot(nx - 0.5, ny - 0.48) * 0.55;
      const r = Math.min(
        255,
        Math.round((skin.r + (skinLight.r - skin.r) * (1 - ny) * 0.35) * vignette + n * 255)
      );
      const g = Math.min(
        255,
        Math.round((skin.g + (skinLight.g - skin.g) * (1 - ny) * 0.35) * vignette + n * 255)
      );
      const b = Math.min(
        255,
        Math.round((skin.b + (skinLight.b - skin.b) * (1 - ny) * 0.35) * vignette + n * 255)
      );
      put(x, y, r, g, b);
    }
  }

  const fillEllipse = (cx, cy, rx, ry, r, g, b) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) put(x, y, r, g, b);
      }
    }
  };

  // 目のくぼみ（暗め）
  fillEllipse(size * 0.36, size * 0.4, 22, 16, skinDark.r, skinDark.g, skinDark.b);
  fillEllipse(size * 0.64, size * 0.4, 22, 16, skinDark.r, skinDark.g, skinDark.b);

  // MOE 風イエローアイ（ペイント）
  const eye = { r: 255, g: 204, b: 51 };
  const pupil = { r: 26, g: 18, b: 8 };
  fillEllipse(size * 0.36, size * 0.4, 16, 12, eye.r, eye.g, eye.b);
  fillEllipse(size * 0.64, size * 0.4, 16, 12, eye.r, eye.g, eye.b);
  fillEllipse(size * 0.36, size * 0.41, 6, 6, pupil.r, pupil.g, pupil.b);
  fillEllipse(size * 0.64, size * 0.41, 6, 6, pupil.r, pupil.g, pupil.b);

  // 口（ペイント・鼻は3D豚鼻）
  for (let x = size * 0.42; x <= size * 0.58; x++) {
    put(Math.round(x), Math.round(size * 0.68), skinDark.r, skinDark.g, skinDark.b);
    put(Math.round(x), Math.round(size * 0.685), skinDark.r, skinDark.g, skinDark.b);
  }

  // BoxGeometry 前面 UV は上下反転するため Y 反転
  const rowBytes = size * 4;
  const row = new Uint8Array(rowBytes);
  for (let y = 0; y < Math.floor(size / 2); y++) {
    const top = y * rowBytes;
    const bottom = (size - 1 - y) * rowBytes;
    row.set(data.subarray(top, top + rowBytes));
    data.set(data.subarray(bottom, bottom + rowBytes), top);
    data.set(row, bottom);
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function headMaterial() {
  return new THREE.MeshStandardMaterial({
    map: createOrcHeadTexture(),
    roughness: 0.84,
    metalness: 0.02,
  });
}

function addPartTo(parent, geometry, material, x, y, z, rot = [0, 0, 0], scl = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(...rot);
  mesh.scale.set(...scl);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addPart(group, geometry, material, x, y, z, rot = [0, 0, 0], scl = [1, 1, 1]) {
  return addPartTo(group, geometry, material, x, y, z, rot, scl);
}

function buildOrcRoot() {
  const orcRoot = new THREE.Group();
  orcRoot.name = "OrcRoot";

  const skin = mat(palette.skin);
  const skinDark = mat(palette.skinDark, 0.88);
  const skinLight = mat(palette.skinLight, 0.8);
  const muzzleMat = mat(palette.muzzle, 0.78);
  const nostrilMat = mat(palette.nostril, 0.9);
  const strapMat = mat(palette.strap, 0.9);
  const clothMat = mat(palette.cloth, 0.92);
  const bootMat = mat(palette.boot, 0.95);
  const metalMat = mat(palette.metal, 0.55, 0.35);
  const metalDarkMat = mat(palette.metalDark, 0.6, 0.25);
  const woodMat = mat(palette.wood, 0.9);

  // --- 胴 ---
  addPart(
    orcRoot,
    new THREE.SphereGeometry(0.34, ...SPHERE_L),
    skin,
    0,
    0.52,
    0,
    [0, 0, 0],
    [1.05, 0.95, 0.82]
  );
  addPart(
    orcRoot,
    new THREE.SphereGeometry(0.22, ...SPHERE_S),
    skinLight,
    0,
    0.38,
    0.06,
    [0, 0, 0],
    [0.95, 0.55, 0.85]
  );

  // --- 革ベルト・胸当て ---
  addPart(
    orcRoot,
    new THREE.BoxGeometry(0.52, 0.1, 0.12),
    strapMat,
    0,
    0.48,
    0.14
  );
  addPart(
    orcRoot,
    new THREE.BoxGeometry(0.38, 0.28, 0.08),
    strapMat,
    0,
    0.58,
    0.15
  );
  addPart(
    orcRoot,
    new THREE.BoxGeometry(0.34, 0.22, 0.1),
    clothMat,
    0,
    0.34,
    -0.1,
    [0.12, 0, 0]
  );

  // --- 頭（前面だけテクスチャ・目はペイント） ---
  const headY = 0.93;
  const faceZ = 0.03;
  const faceMat = headMaterial();
  const headMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.46, 0.44),
    [skinDark, skinDark, skinDark, skinDark, faceMat, skinDark]
  );
  headMesh.position.set(0, headY, faceZ);
  headMesh.rotation.set(-0.06, 0, 0);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  orcRoot.add(headMesh);

  // 下顎
  addPart(
    orcRoot,
    new THREE.BoxGeometry(0.4, 0.17, 0.24),
    skinDark,
    0,
    headY - 0.125,
    faceZ + 0.02,
    [0.03, 0, 0]
  );

  // 豚鼻（横長・ぶた色）
  const faceFrontZ = faceZ + 0.22;
  const snoutDepth = 0.15;
  const snoutZ = faceFrontZ + snoutDepth * 0.45;
  addPart(
    orcRoot,
    new THREE.SphereGeometry(0.075, ...SPHERE_S),
    muzzleMat,
    0,
    headY - 0.108,
    snoutZ,
    [0, 0, 0],
    [2.05, 1, 1]
  );
  for (const sx of [-1, 1]) {
    addPart(
      orcRoot,
      new THREE.SphereGeometry(0.021, 4, 3),
      nostrilMat,
      0.051 * sx,
      headY - 0.114,
      faceFrontZ + snoutDepth * 0.82
    );
  }

  // 耳
  for (const sx of [-1, 1]) {
    addPart(
      orcRoot,
      new THREE.ConeGeometry(0.065, 0.15, 4),
      skinDark,
      0.28 * sx,
      headY + 0.08,
      faceZ - 0.08,
      [0, sx * 0.55, sx * 0.4]
    );
  }

  // --- 腕（右腕＋斧は OrcRightArm で振り下ろしアニメ） ---
  addPart(
    orcRoot,
    new THREE.CylinderGeometry(0.07, 0.08, 0.28, CYL_SEG),
    skin,
    -0.38,
    0.52,
    0,
    [0, 0, -0.25]
  );
  addPart(
    orcRoot,
    new THREE.SphereGeometry(0.08, ...SPHERE_S),
    skinDark,
    -0.48,
    0.36,
    0.04,
    [0, 0, -0.15]
  );

  const rightArm = new THREE.Group();
  rightArm.name = "OrcRightArm";
  rightArm.position.set(0.38, 0.58, 0);
  rightArm.rotation.set(0.05, 0.15, -0.35);
  addPartTo(
    rightArm,
    new THREE.CylinderGeometry(0.07, 0.08, 0.28, CYL_SEG),
    skin,
    0,
    -0.14,
    0,
    [0, 0, 0.15]
  );
  addPartTo(
    rightArm,
    new THREE.SphereGeometry(0.08, ...SPHERE_S),
    skinDark,
    0,
    -0.28,
    0.04,
    [0, 0, 0.1]
  );

  const axe = new THREE.Group();
  axe.name = "OrcAxe";
  axe.position.set(0.04, -0.31, 0.07);
  // 逆持ち・短め・刃は体の外側（+X）向き
  axe.rotation.set(0.08, 0.05, 0.42);
  addPartTo(
    axe,
    new THREE.CylinderGeometry(0.022, 0.028, 0.26, 4),
    woodMat,
    0,
    0,
    0
  );
  addPartTo(
    axe,
    new THREE.BoxGeometry(0.17, 0.11, 0.035),
    metalMat,
    0.06,
    -0.12,
    0.05,
    [0.1, 0, 0.28]
  );
  addPartTo(
    axe,
    new THREE.BoxGeometry(0.05, 0.12, 0.04),
    metalDarkMat,
    -0.07,
    -0.12,
    0.02,
    [0.06, 0, 0.18]
  );
  rightArm.add(axe);
  orcRoot.add(rightArm);

  // --- 脚・ブーツ ---
  for (const sx of [-1, 1]) {
    addPart(
      orcRoot,
      new THREE.CylinderGeometry(0.09, 0.1, 0.26, CYL_SEG),
      skinDark,
      0.14 * sx,
      0.18,
      0
    );
    addPart(
      orcRoot,
      new THREE.BoxGeometry(0.16, 0.1, 0.22),
      bootMat,
      0.14 * sx,
      0.05,
      0.02
    );
  }

  return orcRoot;
}

function armQuat(x, y, z) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, "XYZ"));
  return [q.x, q.y, q.z, q.w];
}

function armSwingTrack(times, rots) {
  const values = [];
  for (const [x, y, z] of rots) values.push(...armQuat(x, y, z));
  return new THREE.QuaternionKeyframeTrack("OrcRightArm.quaternion", times, values);
}

function buildAnimations() {
  const restArm = [0.05, 0.15, -0.35];
  const windUpArm = [-1.05, 0.2, -1.45];
  const chopArm = [0.75, 0.35, 0.55];
  const followArm = [0.25, 0.25, -0.05];
  /** 強攻撃: 真上 → 前方へ振り下ろし（腕は外側へ） */
  const strongWindUpArm = [-2.36, 0.38, 0.18];
  const strongChopStartArm = [-1.05, 0.35, 0.35];
  const strongChopArm = [0.92, 0.32, 0.88];

  return [
    new THREE.AnimationClip("SnakeIdle.01", 2.2, [
      armSwingTrack(
        [0, 1.1, 2.2],
        [restArm, [0.02, 0.14, -0.42], restArm]
      ),
    ]),
    new THREE.AnimationClip("SnakeRun.02", 0.5, [
      armSwingTrack(
        [0, 0.25, 0.5],
        [
          [0.15, 0.2, -0.75],
          [-0.35, 0.18, -1.05],
          [0.15, 0.2, -0.75],
        ]
      ),
    ]),
    new THREE.AnimationClip("SnakeAttakc.01", 0.62, [
      armSwingTrack(
        [0, 0.1, 0.24, 0.38, 0.52, 0.62],
        [restArm, windUpArm, windUpArm, chopArm, followArm, restArm]
      ),
    ]),
    /** 強攻撃: 真上 → 前方へ振り下ろし（体の位置は固定・腕のみ） */
    new THREE.AnimationClip("SnakeAttakcStrong.01", 2.65, [
      armSwingTrack(
        [0, 1.0, 2.0, 2.12, 2.35, 2.65],
        [
          restArm,
          strongWindUpArm,
          strongWindUpArm,
          strongChopStartArm,
          strongChopArm,
          restArm,
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
scene.add(buildOrcRoot());
const tris = countTriangles(scene);
const animations = buildAnimations();
await exportGlb(scene, animations, "OrcInfantry.glb");
console.log(`OrcInfantry.glb: ~${tris} triangles`);
