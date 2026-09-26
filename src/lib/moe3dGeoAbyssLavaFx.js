import * as THREE from "three";

/** @type {Record<string, { lava: number, ripple: number, ember: number }>} */
export const MOE_GEO_ABYSS_LAVA_PALETTES = {
  geo_abyss_ne: { lava: 0xdc2626, ripple: 0xfca5a5, ember: 0xfbbf24 },
  geo_abyss_s: { lava: 0x7c3aed, ripple: 0xc4b5fd, ember: 0xf0abfc },
  geo_abyss_w: { lava: 0x1d4ed8, ripple: 0x93c5fd, ember: 0x67e8f9 },
};

/** @type {{ mesh: THREE.Mesh, age: number, maxAge: number }[]} */
const ripples = [];
/** @type {THREE.Group | null} */
let rippleRoot = null;

function isGeoAbyssSlot(slotId) {
  return Boolean(MOE_GEO_ABYSS_LAVA_PALETTES[slotId]);
}

/**
 * ゲオ深淵3面共通 — 溶岩帯クリック + リップル
 * @param {THREE.Group} g
 * @param {string} slotId
 * @param {number} tileW
 * @param {number} tileD
 */
export function appendGeoAbyssLavaFx(g, slotId, tileW, tileD) {
  const palette = MOE_GEO_ABYSS_LAVA_PALETTES[slotId];
  if (!palette || !g) return null;

  const lava = new THREE.Mesh(
    new THREE.PlaneGeometry(tileW * 0.36, tileD * 0.11),
    new THREE.MeshStandardMaterial({
      color: palette.lava,
      emissive: palette.lava,
      emissiveIntensity: 0.42,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      roughness: 0.35,
      metalness: 0.12,
    })
  );
  lava.rotation.x = -Math.PI / 2;
  lava.position.set(0, 0.23, tileD * 0.02);
  lava.userData.moeGeoLavaClick = { slotId, color: palette.ripple };
  g.add(lava);

  const emberCount = 16;
  const positions = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * tileW * 0.45;
    positions[i * 3 + 1] = 0.3 + Math.random() * 0.35;
    positions[i * 3 + 2] = tileD * 0.05 + (Math.random() - 0.5) * tileD * 0.1;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const embers = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: palette.ember,
      size: 0.14,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  embers.frustumCulled = false;
  g.add(embers);

  return {
    lava,
    embers,
    positions,
    emberCount,
    palette,
  };
}

/**
 * @param {ReturnType<typeof appendGeoAbyssLavaFx>} fx
 * @param {(fn: (dt: number, t: number) => void) => void} registerUpdater
 */
export function registerGeoAbyssLavaIdleMotion(fx, registerUpdater) {
  if (!fx) return;
  const { lava, positions, emberCount, palette } = fx;
  registerUpdater((dt, t) => {
    lava.material.emissiveIntensity = 0.34 + Math.sin(t * 3.2) * 0.12;
    lava.material.opacity = 0.72 + Math.sin(t * 2.1) * 0.08;
    for (let i = 0; i < emberCount; i++) {
      positions[i * 3 + 1] += dt * 0.35;
      positions[i * 3] += Math.sin(t * 2 + i) * dt * 0.08;
      if (positions[i * 3 + 1] > 1.2) {
        positions[i * 3 + 1] = 0.28 + Math.random() * 0.2;
      }
    }
    fx.embers.geometry.attributes.position.needsUpdate = true;
    lava.material.emissive.setHex(palette.lava);
  });
}

/** @param {THREE.Object3D} obj */
export function moeGeoLavaClickFromObject(obj) {
  let node = obj;
  while (node) {
    if (node.userData?.moeGeoLavaClick) return node.userData.moeGeoLavaClick;
    node = node.parent;
  }
  return null;
}

/**
 * @param {THREE.Vector3} worldPoint
 * @param {number} color
 * @param {THREE.Group} parent
 */
export function triggerGeoAbyssLavaRipple(worldPoint, color, parent) {
  if (!parent) return;
  if (!rippleRoot) {
    rippleRoot = new THREE.Group();
    rippleRoot.name = "geo-abyss-lava-ripples";
    parent.add(rippleRoot);
  }
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.28, 20),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.copy(worldPoint);
  ring.position.y = Math.max(ring.position.y, 0.26);
  rippleRoot.add(ring);
  ripples.push({ mesh: ring, age: 0, maxAge: 0.85 });
}

/** @param {number} dt */
export function updateGeoAbyssLavaRipples(dt) {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.age += dt;
    const t = r.age / r.maxAge;
    const scale = 1 + t * 3.2;
    r.mesh.scale.set(scale, scale, scale);
    r.mesh.material.opacity = 0.75 * (1 - t);
    if (r.age >= r.maxAge) {
      rippleRoot?.remove(r.mesh);
      r.mesh.geometry.dispose();
      r.mesh.material.dispose();
      ripples.splice(i, 1);
    }
  }
}

export function resetGeoAbyssLavaFx() {
  for (const r of ripples) {
    rippleRoot?.remove(r.mesh);
    r.mesh.geometry.dispose();
    r.mesh.material.dispose();
  }
  ripples.length = 0;
  rippleRoot = null;
}

export { isGeoAbyssSlot };
