import * as THREE from "three";

const COUNT = 42;

/**
 * 天使の息吹 — ペットのまわりのキラキラ
 * @param {THREE.Scene} scene
 */
export function createMoeWhiteAngelSparkle(scene) {
  const positions = new Float32Array(COUNT * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xfff6c8,
    size: 0.16,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    fog: false,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.visible = false;
  points.renderOrder = 12;
  scene.add(points);

  return {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {boolean} active
     * @param {number} now
     */
    update(x, y, z, active, now) {
      points.visible = active;
      if (!active) return;
      for (let i = 0; i < COUNT; i += 1) {
        const spin = now * 0.003 + i * 0.7;
        const rise = (now * 0.0012 + i * 0.17) % 1;
        const radius = 0.28 + (i % 6) * 0.11;
        positions[i * 3] = x + Math.cos(spin) * radius;
        positions[i * 3 + 1] = y + rise * 1.7;
        positions[i * 3 + 2] = z + Math.sin(spin * 1.15) * radius;
      }
      geo.attributes.position.needsUpdate = true;
    },
    dispose() {
      scene.remove(points);
      geo.dispose();
      mat.dispose();
    },
  };
}
