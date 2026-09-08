/**
 * はぐれイクシオン — MOE 魚人参考・低ポリ glb（鱗テクスチャ＋顔ペイント）
 * SnakeIdle.01 / SnakeRun.02 / SnakeAttakc.01 互換
 * 実行: node scripts/generateStrayIxionGlb.mjs
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

const palette = {
  scale: 0x78716c,
  scaleDark: 0x57534e,
  scaleLight: 0xa8a29e,
  skin: 0xd6c4b0,
  skinDark: 0xb8a390,
  belly: 0xe8dcc8,
  fin: 0x64748b,
  finEdge: 0x475569,
  claw: 0x6b7280,
  web: 0x94a3b8,
};

function mat(color, roughness = 0.82, metalness = 0.04) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function flipTextureY(data, size) {
  const rowBytes = size * 4;
  const row = new Uint8Array(rowBytes);
  for (let y = 0; y < Math.floor(size / 2); y++) {
    const top = y * rowBytes;
    const bottom = (size - 1 - y) * rowBytes;
    row.set(data.subarray(top, top + rowBytes));
    data.set(data.subarray(bottom, bottom + rowBytes), top);
    data.set(row, bottom);
  }
}

/** 鱗パターン（グレー＋肌色が混ざる） */
function createScaleTexture(size = 128) {
  const data = new Uint8Array(size * size * 4);
  const base = { r: 120, g: 113, b: 108 };
  const dark = { r: 87, g: 83, b: 78 };
  const light = { r: 168, g: 162, b: 158 };
  const skinHint = { r: 214, g: 196, b: 176 };

  const put = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  };

  const noise = (x, y) => {
    const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };

  const cell = size / 8;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = (x % cell) / cell - 0.5;
      const cy = (y % cell) / cell - 0.5;
      const rowOff = Math.floor(y / cell) % 2 ? 0.5 : 0;
      const dx = cx - rowOff;
      const dist = Math.hypot(dx, cy * 1.15);
      const edge = dist > 0.38 && dist < 0.48;
      const center = dist < 0.28;
      const n = noise(x, y) * 0.06;
      let r = base.r;
      let g = base.g;
      let b = base.b;
      if (edge) {
        r = dark.r;
        g = dark.g;
        b = dark.b;
      } else if (center) {
        r = Math.round(light.r * 0.55 + skinHint.r * 0.45);
        g = Math.round(light.g * 0.55 + skinHint.g * 0.45);
        b = Math.round(light.b * 0.55 + skinHint.b * 0.45);
      }
      put(x, y, Math.min(255, r + n * 255), Math.min(255, g + n * 255), Math.min(255, b + n * 255));
    }
  }

  flipTextureY(data, size);
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** 魚人の顔（肌色ベース＋グレー鳞・目・エラ） */
function createIxionFaceTexture(size = 256) {
  const data = new Uint8Array(size * size * 4);
  const skin = { r: 214, g: 196, b: 176 };
  const scaleGray = { r: 120, g: 113, b: 108 };
  const scaleDark = { r: 90, g: 85, b: 80 };

  const put = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  };

  const fillEllipse = (cx, cy, rx, ry, r, g, b) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) put(x, y, r, g, b);
      }
    }
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      const forehead = ny < 0.28;
      const shade = 1 - Math.abs(nx - 0.5) * 0.18;
      if (forehead) {
        put(
          x,
          y,
          Math.round(scaleGray.r * shade),
          Math.round(scaleGray.g * shade),
          Math.round(scaleGray.b * shade)
        );
      } else {
        put(
          x,
          y,
          Math.round(skin.r * shade),
          Math.round(skin.g * shade),
          Math.round(skin.b * shade)
        );
      }
    }
  }

  // 顔周りの小鳞
  const cell = size / 14;
  for (let gy = 0; gy < 14; gy++) {
    for (let gx = 0; gx < 14; gx++) {
      const cx = gx * cell + cell * 0.5;
      const cy = gy * cell + cell * 0.5;
      if (cy > size * 0.35 && cy < size * 0.72) continue;
      fillEllipse(cx, cy, cell * 0.26, cell * 0.2, scaleDark.r, scaleDark.g, scaleDark.b);
    }
  }

  // 眉
  for (let i = 0; i < 18; i++) {
    put(Math.round(size * 0.28 + i * 0.55), Math.round(size * 0.32 - i * 0.07), 70, 62, 58);
    put(Math.round(size * 0.72 - i * 0.55), Math.round(size * 0.32 - i * 0.07), 70, 62, 58);
  }

  const eye = { r: 255, g: 230, b: 100 };
  const pupil = { r: 30, g: 35, b: 45 };
  fillEllipse(size * 0.34, size * 0.44, 11, 9, eye.r, eye.g, eye.b);
  fillEllipse(size * 0.66, size * 0.44, 11, 9, eye.r, eye.g, eye.b);
  fillEllipse(size * 0.34, size * 0.44, 4, 5, pupil.r, pupil.g, pupil.b);
  fillEllipse(size * 0.66, size * 0.44, 4, 5, pupil.r, pupil.g, pupil.b);

  // エラ
  for (let g = 0; g < 3; g++) {
    for (let i = 0; i < 5; i++) {
      put(Math.round(size * 0.11), Math.round(size * (0.5 + g * 0.045) + i * 0.008), 95, 88, 82);
      put(Math.round(size * 0.89), Math.round(size * (0.5 + g * 0.045) + i * 0.008), 95, 88, 82);
    }
  }

  // 口（平ら・幅広）
  for (let i = 0; i < 16; i++) {
    const mx = size * (0.38 + (i / 15) * 0.24);
    put(Math.round(mx), Math.round(size * 0.68), 120, 95, 88);
    put(Math.round(mx), Math.round(size * 0.685), 100, 82, 76);
  }

  flipTextureY(data, size);
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function scaleMaterial() {
  return new THREE.MeshStandardMaterial({
    map: createScaleTexture(),
    roughness: 0.78,
    metalness: 0.06,
  });
}

function faceMaterial() {
  return new THREE.MeshStandardMaterial({
    map: createIxionFaceTexture(),
    roughness: 0.8,
    metalness: 0.04,
  });
}

/** カッパ風の大きな蹼手（指はテクスチャで描画） */
function createIxionHandTexture(size = 128) {
  const data = new Uint8Array(size * size * 4);
  const palm = { r: 214, g: 196, b: 176 };
  const palmShadow = { r: 184, g: 163, b: 144 };
  const web = { r: 148, g: 178, b: 198 };
  const webDark = { r: 96, g: 118, b: 138 };
  const nail = { r: 92, g: 86, b: 80 };

  const put = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  };

  const fillEllipse = (cx, cy, rx, ry, r, g, b) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) put(x, y, r, g, b);
      }
    }
  };

  const fillRect = (x0, y0, x1, y1, r, g, b) => {
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
        put(x, y, r, g, b);
      }
    }
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      put(x, y, palm.r, palm.g, palm.b);
    }
  }

  fillEllipse(size * 0.5, size * 0.72, size * 0.38, size * 0.22, palmShadow.r, palmShadow.g, palmShadow.b);

  // 指の間のヒレ（蹼）
  for (let i = 0; i < 3; i++) {
    const x0 = size * (0.24 + i * 0.17);
    const x1 = size * (0.36 + i * 0.17);
    for (let y = Math.floor(size * 0.34); y <= Math.floor(size * 0.62); y++) {
      const t = (y - size * 0.34) / (size * 0.28);
      const w = (x1 - x0) * (0.55 + t * 0.45);
      const cx = (x0 + x1) * 0.5;
      for (let x = Math.floor(cx - w * 0.5); x <= Math.ceil(cx + w * 0.5); x++) {
        const edge = Math.min(
          1,
          Math.min((x - (cx - w * 0.5)) / 3, ((cx + w * 0.5) - x) / 3)
        );
        put(
          x,
          y,
          Math.round(web.r * edge + palm.r * (1 - edge)),
          Math.round(web.g * edge + palm.g * (1 - edge)),
          Math.round(web.b * edge + palm.b * (1 - edge))
        );
      }
    }
  }

  // 4本指（短く太いカッパ風）
  const fingers = [
    { cx: 0.2, spread: 0.09 },
    { cx: 0.38, spread: 0.095 },
    { cx: 0.56, spread: 0.095 },
    { cx: 0.74, spread: 0.09 },
  ];
  for (const f of fingers) {
    const cx = size * f.cx;
    const rx = size * f.spread;
    const ry = size * 0.17;
    fillEllipse(cx, size * 0.38, rx, ry, palm.r, palm.g, palm.b);
    fillEllipse(cx, size * 0.22, rx * 0.72, ry * 0.55, palmShadow.r, palmShadow.g, palmShadow.b);
    fillEllipse(cx, size * 0.12, rx * 0.55, ry * 0.35, nail.r, nail.g, nail.b);
    // 指の縦ライン
    for (let i = -2; i <= 2; i++) {
      put(Math.round(cx + i * 1.2), Math.round(size * 0.28), webDark.r, webDark.g, webDark.b);
      put(Math.round(cx + i * 1.2), Math.round(size * 0.18), webDark.r, webDark.g, webDark.b);
    }
  }

  // 手の甲ヒレ
  fillRect(size * 0.12, size * 0.58, size * 0.88, size * 0.68, web.r, web.g, web.b);
  for (let i = 0; i < 8; i++) {
    const lx = size * (0.18 + i * 0.09);
    put(Math.round(lx), Math.round(size * 0.64), webDark.r, webDark.g, webDark.b);
    put(Math.round(lx + 2), Math.round(size * 0.67), webDark.r, webDark.g, webDark.b);
  }

  flipTextureY(data, size);
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function handMaterial() {
  return new THREE.MeshStandardMaterial({
    map: createIxionHandTexture(),
    roughness: 0.76,
    metalness: 0.05,
  });
}

function addKappaHand(parent, side) {
  const palmMat = handMaterial();
  const edgeMat = mat(palette.skinDark, 0.82);
  const handMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.06, 0.34),
    [edgeMat, edgeMat, edgeMat, edgeMat, palmMat, edgeMat]
  );
  handMesh.position.set(0, -0.5, 0.08);
  handMesh.rotation.set(0.22, 0.32 * side, 0.12 * side);
  handMesh.castShadow = true;
  handMesh.receiveShadow = true;
  parent.add(handMesh);
  addPart(
    parent,
    new THREE.BoxGeometry(0.3, 0.025, 0.12),
    mat(palette.web, 0.72, 0.06),
    0,
    -0.48,
    0.12,
    [0.35, 0.2 * side, 0],
    [1, 1, side]
  );
}

function addPart(parent, geometry, material, x, y, z, rot = [0, 0, 0], scl = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(...rot);
  mesh.scale.set(...scl);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function buildIxionRoot() {
  const root = new THREE.Group();
  root.name = "IxionRoot";

  const scaleMat = scaleMaterial();
  const faceMat = faceMaterial();
  const skinMat = mat(palette.skin, 0.78);
  const skinDarkMat = mat(palette.skinDark, 0.82);
  const finMat = mat(palette.fin, 0.72, 0.08);
  const finEdgeMat = mat(palette.finEdge, 0.85);
  const bellyMat = mat(palette.belly, 0.75);
  const clawMat = mat(palette.claw, 0.88);
  const webMat = mat(palette.web, 0.8);

  /** 腕に対して胴・背を 1.5 倍ほど延長 */
  const torsoStretch = 1.5;
  const torsoLift = 0.26;

  // 胴（鱗）— 背を長く
  addPart(
    root,
    new THREE.SphereGeometry(0.32, ...SPHERE_L),
    scaleMat,
    0,
    0.5 + torsoLift * 0.35,
    0,
    [0, 0, 0],
    [1.0, 0.92 * torsoStretch, 0.78]
  );
  // 背中〜腰の延長（筒）
  addPart(
    root,
    new THREE.CylinderGeometry(0.24, 0.28, 0.22 * torsoStretch, CYL_SEG),
    scaleMat,
    0,
    0.48 + torsoLift * 0.28,
    -0.03
  );
  addPart(
    root,
    new THREE.SphereGeometry(0.2, ...SPHERE_S),
    bellyMat,
    0,
    0.38 + torsoLift * 0.12,
    0.05,
    [0, 0, 0],
    [0.9, 0.55 * torsoStretch, 0.75]
  );

  // 背びれ
  for (let i = 0; i < 4; i++) {
    addPart(
      root,
      new THREE.BoxGeometry(0.04, 0.16 + i * 0.02, 0.18 - i * 0.02),
      finMat,
      0,
      0.58 + torsoLift * 0.72 + i * 0.06,
      -0.14 - i * 0.03,
      [0.35, 0, 0]
    );
    addPart(
      root,
      new THREE.BoxGeometry(0.025, 0.1, 0.12),
      finEdgeMat,
      0,
      0.62 + torsoLift * 0.72 + i * 0.06,
      -0.16 - i * 0.03,
      [0.45, 0, 0]
    );
  }

  // 尻尾（小・角ばりすぎない）
  addPart(
    root,
    new THREE.BoxGeometry(0.1, 0.08, 0.2),
    finMat,
    0,
    0.4,
    -0.24,
    [0.15, 0, 0]
  );

  // 頭（幅広・▲ にならない）
  const headY = 0.88 + torsoLift;
  const faceZ = 0.04;
  const shoulderY = 0.58 + torsoLift * 0.85;
  const headMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.38, 0.4),
    [scaleMat, scaleMat, scaleMat, scaleMat, faceMat, skinDarkMat]
  );
  headMesh.position.set(0, headY, faceZ);
  headMesh.rotation.set(-0.05, 0, 0);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  root.add(headMesh);

  // 頬（丸み）— 目の横ではなく口元寄り
  for (const sx of [-1, 1]) {
    addPart(
      root,
      new THREE.SphereGeometry(0.07, ...SPHERE_S),
      skinMat,
      0.22 * sx,
      headY - 0.14,
      faceZ + 0.14,
      [0, 0, 0],
      [0.95, 0.85, 0.8]
    );
  }

  // 吻（短く平ら・三角 Cone をやめる）
  addPart(
    root,
    new THREE.BoxGeometry(0.24, 0.11, 0.14),
    skinMat,
    0,
    headY - 0.08,
    faceZ + 0.22,
    [0.08, 0, 0]
  );
  addPart(
    root,
    new THREE.BoxGeometry(0.18, 0.05, 0.06),
    skinDarkMat,
    0,
    headY - 0.1,
    faceZ + 0.3,
    [0.05, 0, 0]
  );

  // 頭頂びれ
  addPart(
    root,
    new THREE.BoxGeometry(0.03, 0.14, 0.16),
    finMat,
    0,
    headY + 0.18,
    faceZ - 0.02,
    [0.2, 0, 0]
  );

  // 腕（長め）＋カッパ風蹼手
  const leftArm = new THREE.Group();
  leftArm.name = "IxionLeftArm";
  leftArm.position.set(-0.36, shoulderY, 0);
  addPart(
    leftArm,
    new THREE.CylinderGeometry(0.065, 0.075, 0.34, CYL_SEG),
    scaleMat,
    0,
    -0.1,
    0
  );
  addPart(
    leftArm,
    new THREE.CylinderGeometry(0.055, 0.06, 0.2, CYL_SEG),
    skinDarkMat,
    0,
    -0.34,
    0.02
  );
  addKappaHand(leftArm, -1);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.name = "IxionRightArm";
  rightArm.position.set(0.36, shoulderY, 0);
  addPart(
    rightArm,
    new THREE.CylinderGeometry(0.065, 0.075, 0.34, CYL_SEG),
    scaleMat,
    0,
    -0.1,
    0
  );
  addPart(
    rightArm,
    new THREE.CylinderGeometry(0.055, 0.06, 0.2, CYL_SEG),
    skinDarkMat,
    0,
    -0.34,
    0.02
  );
  addKappaHand(rightArm, 1);
  root.add(rightArm);

  // 脚・蹼
  for (const sx of [-1, 1]) {
    addPart(
      root,
      new THREE.CylinderGeometry(0.08, 0.09, 0.24, CYL_SEG),
      scaleMat,
      0.13 * sx,
      0.18,
      0
    );
    addPart(
      root,
      new THREE.BoxGeometry(0.18, 0.04, 0.22),
      webMat,
      0.14 * sx,
      0.04,
      0.03,
      [0, 0, 0],
      [1, 1, sx === 1 ? 1 : -1]
    );
  }

  return root;
}

function armQuat(x, y, z) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, "XYZ"));
  return [q.x, q.y, q.z, q.w];
}

function armSwingTrack(times, rots) {
  const values = [];
  for (const [x, y, z] of rots) values.push(...armQuat(x, y, z));
  return new THREE.QuaternionKeyframeTrack("IxionRightArm.quaternion", times, values);
}

function buildAnimations() {
  const restArm = [0.1, -0.2, -0.55];
  const windUpArm = [-1.1, -0.15, -1.35];
  const chopArm = [0.85, -0.25, 0.45];
  const followArm = [0.2, -0.2, -0.15];

  return [
    new THREE.AnimationClip("SnakeIdle.01", 2.2, [
      armSwingTrack(
        [0, 1.1, 2.2],
        [restArm, [0.05, -0.18, -0.62], restArm]
      ),
    ]),
    new THREE.AnimationClip("SnakeRun.02", 0.5, [
      armSwingTrack(
        [0, 0.25, 0.5],
        [
          [0.2, -0.22, -0.85],
          [-0.4, -0.2, -1.05],
          [0.2, -0.22, -0.85],
        ]
      ),
    ]),
    new THREE.AnimationClip("SnakeAttakc.01", 0.62, [
      armSwingTrack(
        [0, 0.1, 0.24, 0.38, 0.52, 0.62],
        [restArm, windUpArm, windUpArm, chopArm, followArm, restArm]
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
scene.add(buildIxionRoot());
const tris = countTriangles(scene);
const animations = buildAnimations();
await exportGlb(scene, animations, "StrayIxion.glb");
console.log(`StrayIxion.glb: ~${tris} triangles`);
