import * as THREE from "three";

/** @type {((dt: number, t: number) => void)[]} */
const updaters = [];
let elapsed = 0;

function particleMat(color, opacity = 0.5) {
  return new THREE.PointsMaterial({
    color,
    size: 0.18,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/**
 * 城下町ビスク L4 — 中央アルター池・南水辺のきらめき
 * @param {THREE.Group} tileRoot
 * @param {number} tileW
 * @param {number} tileD
 */
export function appendMoe3dBiskL4Fx(tileRoot, tileW, tileD) {
  if (!tileRoot || !tileW || !tileD) return null;

  const g = new THREE.Group();
  g.name = "bisk-l4-fx";

  const pools = [
    { cx: tileW * 0.02, cz: tileD * 0.08, n: 18, spread: 0.12 },
    { cx: -tileW * 0.16, cz: tileD * 0.32, n: 14, spread: 0.1 },
    { cx: tileW * 0.16, cz: tileD * 0.28, n: 14, spread: 0.1 },
  ];

  for (const pool of pools) {
    const positions = new Float32Array(pool.n * 3);
    for (let i = 0; i < pool.n; i++) {
      positions[i * 3] = pool.cx + (Math.random() - 0.5) * tileW * pool.spread;
      positions[i * 3 + 1] = 0.38 + Math.random() * 0.12;
      positions[i * 3 + 2] = pool.cz + (Math.random() - 0.5) * tileD * pool.spread;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(geo, particleMat(0x7dd3fc, 0.52));
    points.frustumCulled = false;
    g.add(points);

    const count = pool.n;
    updaters.push((dt, t) => {
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += dt * (0.28 + (i % 3) * 0.06);
        positions[i * 3] += Math.sin(t * 2.1 + i) * dt * 0.08;
        positions[i * 3 + 2] += Math.cos(t * 1.7 + i * 0.6) * dt * 0.06;
        if (positions[i * 3 + 1] > 0.72) {
          positions[i * 3 + 1] = 0.36 + Math.random() * 0.08;
        }
      }
      points.geometry.attributes.position.needsUpdate = true;
      points.material.opacity = 0.42 + Math.sin(t * 2.4 + pool.cx) * 0.1;
    });
  }

  const ripple = new THREE.Mesh(
    new THREE.RingGeometry(
      Math.min(tileW, tileD) * 0.1,
      Math.min(tileW, tileD) * 0.15,
      20
    ),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    })
  );
  ripple.rotation.x = -Math.PI / 2;
  ripple.position.set(tileW * 0.02, 0.37, tileD * 0.08);
  g.add(ripple);
  updaters.push((_dt, t) => {
    const pulse = 0.16 + Math.sin(t * 1.8) * 0.08;
    ripple.material.opacity = pulse;
    ripple.scale.setScalar(1 + Math.sin(t * 2.2) * 0.06);
  });

  tileRoot.add(g);
  tileRoot.userData.biskL4 = { layer: 4, pools: pools.length };
  return g;
}

/** @param {number} dt */
export function updateMoe3dBiskL4Fx(dt) {
  elapsed += dt;
  for (const fn of updaters) fn(dt, elapsed);
}

export function resetMoe3dBiskL4Fx() {
  updaters.length = 0;
  elapsed = 0;
}
