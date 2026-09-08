import * as THREE from "three";

/** @type {THREE.CanvasTexture | null} */
let moeFireBlockTex = null;
/** @type {THREE.CanvasTexture | null} */
let moeFireEmojiTex = null;

function getFireBlockTexture() {
  if (moeFireBlockTex) return moeFireBlockTex;
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const blocks = [
    [7, 1, "#ffee66"],
    [6, 3, "#ffbb33"],
    [7, 3, "#ffdd55"],
    [8, 3, "#ff9922"],
    [5, 5, "#ff6600"],
    [6, 5, "#ff8833"],
    [7, 5, "#ff4400"],
    [8, 5, "#ff6622"],
    [9, 5, "#ff5500"],
    [10, 5, "#dd3300"],
    [6, 7, "#cc2200"],
    [7, 7, "#ee3311"],
    [8, 7, "#cc2200"],
    [9, 7, "#aa1100"],
    [7, 9, "#881100"],
    [8, 9, "#771100"],
  ];
  for (const [x, y, color] of blocks) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 2, 2);
  }
  moeFireBlockTex = new THREE.CanvasTexture(canvas);
  moeFireBlockTex.magFilter = THREE.NearestFilter;
  moeFireBlockTex.minFilter = THREE.NearestFilter;
  return moeFireBlockTex;
}

function getFireEmojiTexture() {
  if (moeFireEmojiTex) return moeFireEmojiTex;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, 32, 32);
  ctx.font = "28px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🔥", 16, 17);
  moeFireEmojiTex = new THREE.CanvasTexture(canvas);
  moeFireEmojiTex.magFilter = THREE.LinearFilter;
  moeFireEmojiTex.minFilter = THREE.LinearFilter;
  return moeFireEmojiTex;
}

/**
 * ペット root からしっぽ付近のワールド座標
 * @param {import("three").Object3D} petRoot
 * @param {THREE.Vector3} [out]
 */
export function moe3dPetTailWorldPosition(petRoot, out = new THREE.Vector3()) {
  if (!petRoot) return out.set(0, 0, 0);
  petRoot.updateMatrixWorld(true);
  const box = new THREE.Box3();
  let hasMesh = false;
  petRoot.traverse((obj) => {
    if (obj.userData?.pickProxy || !obj.isMesh || !obj.geometry) return;
    box.expandByObject(obj);
    hasMesh = true;
  });
  if (!hasMesh) box.setFromObject(petRoot);
  const size = box.getSize(new THREE.Vector3());
  const local = new THREE.Vector3(0, size.y * 0.3, -size.z * 0.43);
  return out.copy(local).applyMatrix4(petRoot.matrixWorld);
}

const POOL_SIZE = 7;
/** 🔥 スプライト数（従来2 + 追加2） */
const EMOJI_FIRE_COUNT = 4;
const SPAWN_INTERVAL_SEC = 0.12;
/** 表示サイズ倍率 */
const FIRE_SCALE_MULT = 3;

/**
 * フェニックス形態 — しっぽから炎（ブロック＋🔥×4 · 3倍サイズ）
 * @param {import("three").Scene} scene
 */
export function createMoePhoenixTailFireEffect(scene) {
  const group = new THREE.Group();
  group.name = "phoenixTailFire";
  scene.add(group);

  const blockTex = getFireBlockTexture();
  const emojiTex = getFireEmojiTexture();

  /** @type {{ sprite: THREE.Sprite, mat: THREE.SpriteMaterial, active: boolean, age: number, life: number, x: number, y: number, z: number, vy: number, driftX: number, driftZ: number, baseScale: number }[]} */
  const pool = [];

  for (let i = 0; i < POOL_SIZE; i += 1) {
    const useEmoji = i < EMOJI_FIRE_COUNT && emojiTex;
    const mat = new THREE.SpriteMaterial({
      map: useEmoji ? emojiTex : blockTex,
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.visible = false;
    sprite.renderOrder = 860;
    group.add(sprite);
    pool.push({
      sprite,
      mat,
      isEmoji: !!useEmoji,
      active: false,
      age: 0,
      life: 0.55,
      x: 0,
      y: 0,
      z: 0,
      vy: 0.3,
      driftX: 0,
      driftZ: 0,
      baseScale: 0.12 * FIRE_SCALE_MULT,
    });
  }

  let spawnTimer = 0;
  let enabled = false;
  const tailPos = new THREE.Vector3();

  function hideAll() {
    for (const p of pool) {
      p.active = false;
      p.sprite.visible = false;
      p.mat.opacity = 0;
    }
  }

  function spawnAt(x, y, z) {
    const p = pool.find((q) => !q.active);
    if (!p) return;
    p.active = true;
    p.age = 0;
    p.life = 0.42 + Math.random() * 0.32;
    p.x = x + (Math.random() - 0.5) * 0.07;
    p.y = y + (Math.random() - 0.5) * 0.05;
    p.z = z + (Math.random() - 0.5) * 0.07;
    p.vy = 0.22 + Math.random() * 0.18;
    p.driftX = (Math.random() - 0.5) * 0.06;
    p.driftZ = (Math.random() - 0.5) * 0.06;
    const sizeBase = p.isEmoji ? 0.11 : 0.09;
    p.baseScale = (sizeBase + Math.random() * 0.05) * FIRE_SCALE_MULT;
    p.sprite.visible = true;
    p.mat.opacity = 0.82;
  }

  function spawnBurst(x, y, z) {
    spawnAt(x, y, z);
    spawnAt(x, y, z);
  }

  return {
    setEnabled(on) {
      enabled = on;
      if (!on) hideAll();
    },
    update(dt, petRoot) {
      if (!enabled || !petRoot) {
        hideAll();
        return;
      }
      moe3dPetTailWorldPosition(petRoot, tailPos);
      spawnTimer += dt;
      if (spawnTimer >= SPAWN_INTERVAL_SEC) {
        spawnTimer = 0;
        spawnBurst(tailPos.x, tailPos.y, tailPos.z);
      }
      for (const p of pool) {
        if (!p.active) continue;
        p.age += dt;
        if (p.age >= p.life) {
          p.active = false;
          p.sprite.visible = false;
          continue;
        }
        const t = p.age / p.life;
        p.y += p.vy * dt;
        p.x += p.driftX * dt;
        p.z += p.driftZ * dt;
        p.mat.opacity = (1 - t * t) * 0.9;
        const scale = p.baseScale * (1 + t * 0.2);
        p.sprite.position.set(p.x, p.y, p.z);
        p.sprite.scale.set(scale, scale, 1);
      }
    },
    dispose() {
      hideAll();
      scene.remove(group);
      for (const p of pool) {
        p.mat.dispose();
      }
    },
  };
}
