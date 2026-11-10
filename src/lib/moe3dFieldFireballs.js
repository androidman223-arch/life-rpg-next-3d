import * as THREE from "three";

const FIREBALL_GEO = new THREE.SphereGeometry(0.38, 12, 10);
const FIREBALL_MAT = new THREE.MeshStandardMaterial({
  color: 0xffaa33,
  emissive: 0xff5500,
  emissiveIntensity: 1.35,
  roughness: 0.35,
  metalness: 0.05,
});

/**
 * @param {THREE.Object3D} sceneRoot
 * @param {{ id: string, x: number, z: number, y: number }[]} balls
 * @param {(x: number, z: number) => number} [groundYAt]
 */
export function syncMoe3dFieldFireballs(sceneRoot, balls, groundYAt) {
  let group = sceneRoot.getObjectByName("moe-field-fireballs");
  if (!group) {
    group = new THREE.Group();
    group.name = "moe-field-fireballs";
    sceneRoot.add(group);
  }
  const live = new Set(balls.map((b) => b.id));
  for (const child of [...group.children]) {
    if (!live.has(child.userData.fbId)) {
      group.remove(child);
    }
  }
  for (const b of balls) {
    let mesh = group.children.find((c) => c.userData.fbId === b.id);
    if (!mesh) {
      mesh = new THREE.Mesh(FIREBALL_GEO, FIREBALL_MAT);
      mesh.userData.fbId = b.id;
      group.add(mesh);
    }
    const gy = groundYAt ? groundYAt(b.x, b.z) : 0;
    mesh.position.set(b.x, gy + (b.y ?? 1.1), b.z);
  }
}
