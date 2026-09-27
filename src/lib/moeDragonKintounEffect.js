import * as THREE from "three";
import {
  MOE_KINTOUN_CLOUD_FOOT_OFFSET,
  MOE_KINTOUN_CLOUD_REAR_LENGTH_MULT,
  MOE_KINTOUN_CLOUD_RIDE_DROP,
  MOE_KINTOUN_CLOUD_VISUAL_SCALE,
  kintounCloudCenterOffsetFromPlayer,
} from "./moeDragonKintoun.js";

const REAR_Z = MOE_KINTOUN_CLOUD_REAR_LENGTH_MULT;

const CLOUD_FRONT_BODY_Z = 0;
const CLOUD_REAR_BODY_Z = -1.35 * REAR_Z;

/** 前後（Z）に長い筋斗雲 — [x, y, z, scaleX, scaleY, scaleZ] */
const CLOUD_BLOBS = [
  [0, 0.3, CLOUD_FRONT_BODY_Z, 0.95, 0.48, 1.45],
  [0, 0.26, CLOUD_REAR_BODY_Z, 0.82, 0.44, 1.55 * REAR_Z],
];

/** 乗車デッキ — プレイヤー（手前 z+） */
const RIDING_DECK_BLOBS = [
  [0, 0.92, 0.68, 1.22, 0.82, 1.02],
  [0, 0.68, 0.55, 1.52, 0.7, 1.25],
];

/** 乗車デッキ — ペット（後方 z-） */
const PET_RIDE_DECK_BLOBS = [
  [0, 0.86, -1.55 * REAR_Z, 1.2, 0.76, 1.22 * REAR_Z],
];

/** 悟空風 — 雲のお尻（後方 -Z）に伸びる細長い尾 */
const TAIL_BLOBS = [
  [0, 0.12, -2.45 * REAR_Z, 0.38, 0.16, 1.55 * REAR_Z],
  [0, 0.01, -7.1 * REAR_Z, 0.09, 0.05, 0.42 * REAR_Z],
];

/**
 * 筋斗雲 — 3D 雲メッシュ（召喚突進 · 乗車 · 尾雲）
 * @param {import("three").Scene} scene
 */
export function createMoeKintounCloudEffect(scene) {
  const group = new THREE.Group();
  group.name = "kintounCloudFx";
  group.visible = false;
  scene.add(group);

  const visualGroup = new THREE.Group();
  visualGroup.scale.setScalar(MOE_KINTOUN_CLOUD_VISUAL_SCALE);
  group.add(visualGroup);

  const bodyGroup = new THREE.Group();
  visualGroup.add(bodyGroup);

  const deckGroup = new THREE.Group();
  visualGroup.add(deckGroup);

  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xfff7d6,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.28,
    roughness: 0.9,
    metalness: 0,
    transparent: true,
    opacity: 0.93,
  });

  const deckMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    emissive: 0xfde68a,
    emissiveIntensity: 0.22,
    roughness: 0.92,
    metalness: 0,
    transparent: true,
    opacity: 0.97,
    depthWrite: true,
  });

  for (const [x, y, z, sx, sy, sz] of CLOUD_BLOBS) {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 12), cloudMat);
    blob.scale.set(sx, sy, sz);
    blob.position.set(x, y, z);
    blob.castShadow = true;
    blob.receiveShadow = true;
    bodyGroup.add(blob);
  }

  for (const [x, y, z, sx, sy, sz] of [
    ...RIDING_DECK_BLOBS,
    ...PET_RIDE_DECK_BLOBS,
  ]) {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), deckMat);
    blob.scale.set(sx, sy, sz);
    blob.position.set(x, y, z);
    blob.castShadow = false;
    blob.receiveShadow = true;
    blob.renderOrder = 2;
    deckGroup.add(blob);
  }

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.88, 0.05, 8, 26),
    new THREE.MeshBasicMaterial({
      color: 0xfef3c7,
      transparent: true,
      opacity: 0.28,
    })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 0.14, 0.15);
  bodyGroup.add(rim);

  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.02, -1.85 * REAR_Z);
  visualGroup.add(tailGroup);

  const tailMats = TAIL_BLOBS.map((_, i) => {
    const fade = 1 - i * 0.14;
    return new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfde68a,
      emissiveIntensity: 0.18 * fade,
      roughness: 0.94,
      metalness: 0,
      transparent: true,
      opacity: 0.82 * fade,
    });
  });

  for (let i = 0; i < TAIL_BLOBS.length; i += 1) {
    const [x, y, z, sx, sy, sz] = TAIL_BLOBS[i];
    const blob = new THREE.Mesh(
      new THREE.SphereGeometry(1, 10, 8),
      tailMats[i]
    );
    blob.scale.set(sx, sy, sz);
    blob.position.set(x, y, z);
    blob.castShadow = false;
    tailGroup.add(blob);
  }

  let bobPhase = 0;
  let lastPlayerX = 0;
  let lastPlayerZ = 0;
  let tailSway = 0;
  const cloudCenterOffset = new THREE.Vector3();

  return {
    /**
     * @param {number} dt
     * @param {import("three").Object3D | null} playerRoot
     * @param {number} groundY
     * @param {import("./moeDragonKintoun.js").MoeKintounApproachState | null | undefined} approach
     * @param {boolean} kintounOn
     * @param {number} jumpY
     * @param {number} kintounFlyY
     */
    update(dt, playerRoot, groundY, approach, kintounOn, jumpY = 0, kintounFlyY = 0) {
      const visible = Boolean(approach || kintounOn);
      group.visible = visible;
      if (!visible || !playerRoot) return;

      let ox = 0;
      let oz = 0;
      let oy = MOE_KINTOUN_CLOUD_FOOT_OFFSET;
      const rushSpeed = approach ? Math.hypot(approach.ox, approach.oz) : 0;

      if (approach) {
        ox = approach.ox;
        oz = approach.oz;
        oy = approach.oy ?? oy;
      }

      const riseY = kintounOn ? kintounFlyY : jumpY;
      const riding = kintounOn || jumpY > 0.12;
      const rideDrop = riding
        ? MOE_KINTOUN_CLOUD_RIDE_DROP * MOE_KINTOUN_CLOUD_VISUAL_SCALE
        : 0;

      bobPhase += dt * (rushSpeed > 3 ? 12 : 5);
      const bob = Math.sin(bobPhase) * (rushSpeed > 3 ? 0.04 : 0.022);

      if (rushSpeed > 1.2) {
        group.rotation.y = Math.atan2(approach.ox, approach.oz);
      } else {
        group.rotation.y = THREE.MathUtils.lerp(
          group.rotation.y,
          playerRoot.rotation.y,
          1 - Math.exp(-8 * dt)
        );
      }

      if (riding) {
        const back = kintounCloudCenterOffsetFromPlayer(group.rotation.y);
        cloudCenterOffset.set(back.x, 0, back.z);
      } else {
        cloudCenterOffset.set(0, 0, 0);
      }

      group.position.set(
        playerRoot.position.x + ox + cloudCenterOffset.x,
        groundY + oy + riseY - rideDrop + bob,
        playerRoot.position.z + oz + cloudCenterOffset.z
      );

      const bodyStretch = 1 + Math.min(0.2, rushSpeed * 0.0035);
      bodyGroup.scale.set(
        1 / Math.sqrt(bodyStretch),
        1,
        bodyStretch
      );

      const moveSpeed =
        Math.hypot(
          playerRoot.position.x - lastPlayerX,
          playerRoot.position.z - lastPlayerZ
        ) / Math.max(dt, 0.001);
      lastPlayerX = playerRoot.position.x;
      lastPlayerZ = playerRoot.position.z;

      tailSway += dt * (rushSpeed > 2 ? 9 : 4);
      const tailWobble = Math.sin(tailSway) * 0.05;
      tailGroup.rotation.y = tailWobble;
      tailGroup.rotation.x = -0.06 + Math.sin(tailSway * 0.7) * 0.03;

      const tailStretch = rushSpeed > 1.5
        ? 1 + Math.min(1.9, rushSpeed * 0.03)
        : kintounOn
          ? 0.9 + Math.min(1.15, moveSpeed * 0.07)
          : 0.6;
      tailGroup.scale.set(1, 1, tailStretch);
      tailGroup.visible = rushSpeed > 0.8 || kintounOn || jumpY > 0.15;
      deckGroup.visible = riding;

      rim.material.opacity = rushSpeed > 5 ? 0.36 : 0.2;
    },
    dispose() {
      group.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.geometry?.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m?.dispose());
      });
      tailMats.forEach((m) => m.dispose());
      deckMat.dispose();
      scene.remove(group);
    },
  };
}
