/**
 * 3D フィールドの見た目 — テクスチャの「絵」を作る純粋関数（three.js を使わない）
 *
 * MOE 風: ローポリの面に、のばしたテクスチャを世界座標で張る。
 * ここでは絵（グレーの明るさ 0〜255）だけ作る。張るのは moe3dFieldLook.js。
 * 絵はすべて「つなぎ目なし（タイル状にくり返せる）」。
 */

/** 同じ種(seed)なら同じ乱数 */
export function moeLookRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeLattice(cellsX, cellsY, rng) {
  const g = new Float32Array(cellsX * cellsY);
  for (let i = 0; i < g.length; i++) g[i] = rng();
  return g;
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

/** つなぎ目なしの値ノイズ（u,v は 0〜1、cellsX×cellsY の格子） */
function periodicValueNoise(u, v, lattice, cellsX, cellsY) {
  const x = u * cellsX;
  const y = v * cellsY;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smooth(x - x0);
  const fy = smooth(y - y0);
  const ix0 = ((x0 % cellsX) + cellsX) % cellsX;
  const iy0 = ((y0 % cellsY) + cellsY) % cellsY;
  const ix1 = (ix0 + 1) % cellsX;
  const iy1 = (iy0 + 1) % cellsY;
  const a = lattice[iy0 * cellsX + ix0];
  const b = lattice[iy0 * cellsX + ix1];
  const c = lattice[iy1 * cellsX + ix0];
  const d = lattice[iy1 * cellsX + ix1];
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/**
 * つなぎ目なし fbm（重ねたノイズ）
 * @returns {(u:number, v:number) => number} 0〜1
 */
export function moeLookPeriodicFbm(seed, cellsX, cellsY, octaves = 4) {
  const rng = moeLookRng(seed);
  const layers = [];
  let cx = cellsX;
  let cy = cellsY;
  for (let o = 0; o < octaves; o++) {
    layers.push({ cx, cy, lat: makeLattice(cx, cy, rng) });
    cx *= 2;
    cy *= 2;
  }
  return (u, v) => {
    let sum = 0;
    let amp = 1;
    let norm = 0;
    for (const L of layers) {
      sum += periodicValueNoise(u, v, L.lat, L.cx, L.cy) * amp;
      norm += amp;
      amp *= 0.5;
    }
    return sum / norm;
  };
}

/** 平均を 0.5 に、ばらつきを contrast にそろえる（張ったとき色が暗く/明るくなりすぎない） */
export function moeLookNormalize(values, contrast = 0.22) {
  let mean = 0;
  for (let i = 0; i < values.length; i++) mean += values[i];
  mean /= values.length || 1;
  let varSum = 0;
  for (let i = 0; i < values.length; i++) {
    const d = values[i] - mean;
    varSum += d * d;
  }
  const sd = Math.sqrt(varSum / (values.length || 1)) || 1;
  const out = new Uint8Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const v = 0.5 + ((values[i] - mean) / sd) * contrast;
    out[i] = Math.max(0, Math.min(255, Math.round(v * 255)));
  }
  return out;
}

/** 草: こまかいノイズ ＋ 短い草の葉のすじ */
export function moeLookGrassPixels(size = 256, seed = 11) {
  const f = moeLookPeriodicFbm(seed, 16, 16, 4);
  const vals = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      vals[y * size + x] = f(x / size, y / size);
    }
  }
  const rng = moeLookRng(seed + 101);
  const blades = Math.round(size * size * 0.035);
  for (let i = 0; i < blades; i++) {
    const bx = rng() * size;
    const by = rng() * size;
    const len = 3 + rng() * 6;
    const lean = (rng() - 0.5) * 0.8;
    const tone = rng() < 0.5 ? 0.22 : -0.2;
    for (let s = 0; s < len; s++) {
      const px = Math.floor(bx + lean * s + size) % size;
      const py = Math.floor(by - s + size) % size;
      vals[py * size + px] += tone * (1 - s / len);
    }
  }
  return moeLookNormalize(vals, 0.2);
}

/** 土・石だたみ: ノイズ ＋ ゆがんだ石のつなぎ目（ほんのり） */
export function moeLookStonePixels(size = 256, seed = 23) {
  const f = moeLookPeriodicFbm(seed, 8, 8, 5);
  const warp = moeLookPeriodicFbm(seed + 7, 4, 4, 2);
  const rng = moeLookRng(seed + 3);
  const cells = 6;
  const pts = [];
  for (let j = 0; j < cells; j++) {
    for (let i = 0; i < cells; i++) {
      pts.push([(i + 0.15 + rng() * 0.7) / cells, (j + 0.15 + rng() * 0.7) / cells]);
    }
  }
  const vals = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const wu = u + (warp(u, v) - 0.5) * 0.08;
      const wv = v + (warp(v, u) - 0.5) * 0.08;
      let d1 = 9;
      let d2 = 9;
      for (const [px, py] of pts) {
        let dx = Math.abs(wu - px);
        let dy = Math.abs(wv - py);
        if (dx > 0.5) dx = 1 - dx;
        if (dy > 0.5) dy = 1 - dy;
        const d = dx * dx + dy * dy;
        if (d < d1) {
          d2 = d1;
          d1 = d;
        } else if (d < d2) {
          d2 = d;
        }
      }
      const edge = Math.sqrt(d2) - Math.sqrt(d1);
      const seam = edge < 0.012 ? -0.35 * (1 - edge / 0.012) : 0;
      vals[y * size + x] = f(u, v) + seam;
    }
  }
  return moeLookNormalize(vals, 0.18);
}

/** 岩・がけ（横の地層っぽいすじ） */
export function moeLookRockPixels(size = 256, seed = 37) {
  const strata = moeLookPeriodicFbm(seed, 4, 24, 3);
  const grain = moeLookPeriodicFbm(seed + 5, 16, 16, 4);
  const vals = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      vals[y * size + x] = strata(u, v) * 0.6 + grain(u, v) * 0.4;
    }
  }
  return moeLookNormalize(vals, 0.2);
}

/** 大きな色むら（広い面がのっぺりしないように） */
export function moeLookMacroPixels(size = 128, seed = 53) {
  const f = moeLookPeriodicFbm(seed, 3, 3, 3);
  const vals = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      vals[y * size + x] = f(x / size, y / size);
    }
  }
  return moeLookNormalize(vals, 0.24);
}

/**
 * 遠くの山なみ（RGBA）。横にくり返せる。下は不透明、山の上は透明。
 * 2層: うしろは青っぽく高い、手前は緑がかって低い。
 */
export function moeLookMountainPixels(width = 1024, height = 128, seed = 71) {
  const backN = moeLookPeriodicFbm(seed, 5, 1, 4);
  const backFine = moeLookPeriodicFbm(seed + 3, 40, 1, 2);
  const frontN = moeLookPeriodicFbm(seed + 9, 9, 1, 4);
  // なだらかな山 ＋ ほんのり尾根（とがりすぎない）
  const ridge = (n) => 1 - Math.abs(2 * n - 1);
  const back = (u, v) =>
    ridge(backN(u, v)) * 0.45 + backN(u, v + 0.5) * 0.45 + backFine(u, v) * 0.1;
  const front = (u, v) => ridge(frontN(u, v)) * 0.3 + frontN(u, v + 0.5) * 0.7;
  const out = new Uint8Array(width * height * 4);
  const backCol = [150, 172, 196];
  const frontCol = [112, 140, 128];
  const hazeCol = [170, 190, 200];
  for (let x = 0; x < width; x++) {
    const u = x / width;
    const hb = 0.35 + back(u, 0.3) * 0.6;
    const hf = 0.18 + front(u, 0.7) * 0.42;
    for (let y = 0; y < height; y++) {
      // DataTexture は 1行目が下。v=0 が いちばん下
      const v = y / (height - 1);
      const i = (y * width + x) * 4;
      let c = null;
      let a = 0;
      if (v <= hf) {
        const t = v / Math.max(hf, 0.001);
        c = frontCol.map((k, j) => k + (hazeCol[j] - k) * (1 - t) * 0.35);
        a = 255;
      } else if (v <= hb) {
        const t = (v - hf) / Math.max(hb - hf, 0.001);
        c = backCol.map((k, j) => k + (hazeCol[j] - k) * (1 - t) * 0.4);
        a = 255;
      }
      if (c) {
        out[i] = Math.round(c[0]);
        out[i + 1] = Math.round(c[1]);
        out[i + 2] = Math.round(c[2]);
        out[i + 3] = a;
      }
    }
  }
  return out;
}

/** 土・砂: つなぎ目なし。ノイズ ＋ 小石の点々 */
export function moeLookDirtPixels(size = 256, seed = 29) {
  const f = moeLookPeriodicFbm(seed, 10, 10, 5);
  const vals = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      vals[y * size + x] = f(x / size, y / size);
    }
  }
  const rng = moeLookRng(seed + 17);
  const pebbles = Math.round(size * size * 0.004);
  for (let i = 0; i < pebbles; i++) {
    const cx = rng() * size;
    const cy = rng() * size;
    const r = 0.8 + rng() * 1.6;
    const tone = rng() < 0.6 ? 0.25 : -0.22;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const d = Math.hypot(dx, dy);
        if (d > r) continue;
        const px = Math.floor(cx + dx + size) % size;
        const py = Math.floor(cy + dy + size) % size;
        vals[py * size + px] += tone * (1 - d / (r + 0.5));
      }
    }
  }
  return moeLookNormalize(vals, 0.19);
}

/**
 * どの上面テクスチャを使うか（材質の色で決める）
 * r,g,b は three.js の材質の色（リニア 0〜1）
 * @returns {"grass" | "stone" | "dirt" | "skip"}
 */
export function moeLookPickSurface(r, g, b) {
  // こい青の面（水）はそのまま
  if (b > r * 2.2 && b > g * 1.15) return "skip";
  if (g > r * 1.04 && g > b * 1.04) return "grass";
  // 見た目の色（sRGB に近い値）で あざやかさを見る
  const sr = Math.pow(Math.max(r, 0), 1 / 2.2);
  const sg = Math.pow(Math.max(g, 0), 1 / 2.2);
  const sb = Math.pow(Math.max(b, 0), 1 / 2.2);
  const mx = Math.max(sr, sg, sb);
  const mn = Math.min(sr, sg, sb);
  const sat = mx > 0 ? (mx - mn) / mx : 0;
  // 灰色っぽい → 石だたみ ／ 色がある（砂・土・茶色）→ 土
  return sat < 0.32 ? "stone" : "dirt";
}
