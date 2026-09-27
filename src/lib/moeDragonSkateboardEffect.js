import * as THREE from "three";
import { MOE_SKATEBOARD_FOOT_OFFSET } from "./moeDragonSkateboard.js";

/**
 * 地龍板 — 3D スケボメッシュ（召喚突進 · 乗車）
 * @param {import("three").Scene} scene
 */
export function createMoeSkateboardEffect(scene) {
  const group = new THREE.Group();
  group.name = "skateboardFx";
  group.visible = false;
  scene.add(group);

  const deckMat = new THREE.MeshStandardMaterial({
    color: 0x7c2d12,
    emissive: 0xea580c,
    emissiveIntensity: 0.12,
    roughness: 0.72,
    metalness: 0.08,
  });
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x292524,
    roughness: 0.95,
    metalness: 0,
  });
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f4,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.08,
    roughness: 0.55,
    metalness: 0.15,
  });
  const truckMat = new THREE.MeshStandardMaterial({
    color: 0xa8a29e,
    metalness: 0.65,
    roughness: 0.35,
  });

  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.07, 0.34), deckMat);
  deck.position.y = 0.08;
  deck.castShadow = true;
  deck.receiveShadow = true;
  group.add(deck);

  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.02, 0.24), gripMat);
  grip.position.set(0, 0.125, 0);
  group.add(grip);

  const wheelGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.055, 12);
  const wheelOffsets = [
    [-0.38, 0.045, 0.13],
    [0.38, 0.045, 0.13],
    [-0.38, 0.045, -0.13],
    [0.38, 0.045, -0.13],
  ];
  for (const [x, y, z] of wheelOffsets) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    group.add(wheel);
  }

  const truck = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.28), truckMat);
  truck.position.set(0, 0.055, 0);
  group.add(truck);

  let bobPhase = 0;
  let lastPlayerX = 0;
  let lastPlayerZ = 0;
  let wheelSpin = 0;

  return {
    /**
     * @param {number} dt
     * @param {import("three").Object3D | null} playerRoot
     * @param {number} groundY
     * @param {import("./moeDragonSkateboard.js").MoeSkateboardApproachState | null | undefined} approach
     * @param {boolean} skateboardOn
     * @param {number} jumpY
     */
    update(dt, playerRoot, groundY, approach, skateboardOn, jumpY = 0) {
      const visible = Boolean(approach || skateboardOn);
      group.visible = visible;
      if (!visible || !playerRoot) return;

      let ox = 0;
      let oz = 0;
      let oy = MOE_SKATEBOARD_FOOT_OFFSET;
      const rushSpeed = approach ? Math.hypot(approach.ox, approach.oz) : 0;

      if (approach) {
        ox = approach.ox;
        oz = approach.oz;
        oy = approach.oy ?? oy;
      }

      const riding = skateboardOn || jumpY > 0.12;

      bobPhase += dt * (rushSpeed > 3 ? 14 : 6);
      const bob = Math.sin(bobPhase) * (rushSpeed > 3 ? 0.025 : 0.012);

      if (rushSpeed > 1.2) {
        group.rotation.y = Math.atan2(approach.ox, approach.oz);
      } else {
        group.rotation.y = THREE.MathUtils.lerp(
          group.rotation.y,
          playerRoot.rotation.y,
          1 - Math.exp(-10 * dt)
        );
      }

      const moveSpeed =
        Math.hypot(
          playerRoot.position.x - lastPlayerX,
          playerRoot.position.z - lastPlayerZ
        ) / Math.max(dt, 0.001);
      lastPlayerX = playerRoot.position.x;
      lastPlayerZ = playerRoot.position.z;

      wheelSpin += dt * (rushSpeed > 2 ? rushSpeed * 0.35 : moveSpeed * 2.4);
      group.children.forEach((child) => {
        if (!child.geometry || child.geometry.type !== "CylinderGeometry") return;
        child.rotation.x = wheelSpin;
      });

      const lean = Math.min(0.22, moveSpeed * 0.018 + rushSpeed * 0.0018);
      group.rotation.z = Math.sin(bobPhase * 0.8) * 0.03;
      group.rotation.x = riding ? -lean : 0;

      group.position.set(
        playerRoot.position.x + ox,
        groundY + oy + (skateboardOn ? 0 : jumpY) + bob,
        playerRoot.position.z + oz
      );
    },
    dispose() {
      group.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.geometry?.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m?.dispose());
      });
      deckMat.dispose();
      gripMat.dispose();
      wheelMat.dispose();
      truckMat.dispose();
      scene.remove(group);
    },
  };
}
