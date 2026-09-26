import * as THREE from "three";

/**
 * AGE拠点 — 焚き火（丸太4本が円を描き、中心に炎）
 * @returns {THREE.Group}
 */
export function buildMoe3dTrainingGuideRestCamp() {
  const root = new THREE.Group();
  root.name = "training-guide-rest-camp";

  const wood = new THREE.MeshStandardMaterial({
    color: 0x5d3a1a,
    roughness: 0.92,
  });
  const fireMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 0.9,
    roughness: 0.35,
  });
  const emberMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    emissive: 0x7c2d12,
    emissiveIntensity: 0.45,
  });

  const LOG_COUNT = 4;
  const LOG_RADIUS = 0.52;
  const LOG_LEN = 0.82;
  const LOG_THICK = 0.11;
  const LOG_SIT_Y = LOG_THICK * 0.52;
  const fireY = 0.34;

  const ember = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.26, 0.1, 8),
    emberMat
  );
  ember.position.set(0, LOG_SIT_Y + 0.04, 0);
  ember.receiveShadow = true;
  root.add(ember);

  for (let i = 0; i < LOG_COUNT; i++) {
    const ang = (i / LOG_COUNT) * Math.PI * 2 + Math.PI / 8;
    const log = new THREE.Mesh(
      new THREE.BoxGeometry(LOG_LEN, LOG_THICK, LOG_THICK),
      wood
    );
    const cx = Math.cos(ang) * LOG_RADIUS;
    const cz = Math.sin(ang) * LOG_RADIUS;
    log.position.set(cx, LOG_SIT_Y, cz);
    log.rotation.y = ang + Math.PI / 2;
    log.castShadow = true;
    log.receiveShadow = true;
    root.add(log);
  }

  for (const [ox, oz, scale] of [
    [0, 0, 1],
    [0.06, 0.04, 0.88],
    [-0.05, -0.04, 0.92],
  ]) {
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.11 * scale, 0.4 * scale, 5),
      fireMat
    );
    flame.position.set(ox, fireY * scale, oz);
    flame.castShadow = true;
    root.add(flame);
  }

  root.userData.trainingGuideCamp = { fireZ: 0, fireY };
  root.userData.moeCampfirePick = true;
  return root;
}
