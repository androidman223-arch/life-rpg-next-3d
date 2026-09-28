import * as THREE from "three";

/** ビスク中央アルター脇 — 手前が開いた魂の復活部屋 */
export function buildMoe3dSoulMasterChapel() {
  const g = new THREE.Group();
  g.name = "soul-master-chapel";

  const stone = new THREE.MeshStandardMaterial({
    color: 0x3a3f55,
    roughness: 0.82,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x1e2233,
    roughness: 0.9,
  });
  const soul = new THREE.MeshStandardMaterial({
    color: 0xb8f3ff,
    emissive: 0x7ee7ff,
    emissiveIntensity: 0.85,
    roughness: 0.35,
  });

  const floor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.28, 4.4), dark);
  floor.position.y = 0.14;
  floor.receiveShadow = true;
  g.add(floor);

  const back = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.8, 0.28), stone);
  back.position.set(0, 1.5, -2.06);
  back.castShadow = true;
  g.add(back);

  const left = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.8, 4.4), stone);
  left.position.set(-2.46, 1.5, 0);
  left.castShadow = true;
  g.add(left);

  const right = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.8, 4.4), stone);
  right.position.set(2.46, 1.5, 0);
  right.castShadow = true;
  g.add(right);

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.35, 4.6), stone);
  lintel.position.y = 3.05;
  lintel.castShadow = true;
  g.add(lintel);

  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 14), soul);
  orb.position.set(0, 1.35, -0.4);
  g.add(orb);

  const glow = new THREE.PointLight(0x9aefff, 1.4, 8, 2);
  glow.position.set(0, 1.5, -0.2);
  g.add(glow);

  return g;
}
