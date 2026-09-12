import * as THREE from "three";
import { MACRO2_L1_SLOT_IDS } from "@/lib/moe3dMacro2Constants";

/** @type {((dt: number, t: number) => void)[]} */
const updaters = [];
let elapsed = 0;

function particleMat(color, opacity = 0.55) {
  return new THREE.PointsMaterial({
    color,
    size: 0.22,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/**
 * @param {number} count
 * @param {(i: number, positions: Float32Array) => void} place
 */
function makeParticles(count, place, material) {
  const positions = new Float32Array(count * 3);
  place(count, positions);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  return { points, positions, count };
}

/**
 * @param {THREE.Group} g
 * @param {string} slotId
 * @param {number} tileW
 * @param {number} tileD
 */
function addMist(g, slotId, tileW, tileD, color, count = 28) {
  const { points, positions, count: n } = makeParticles(
    count,
    (c, pos) => {
      for (let i = 0; i < c; i++) {
        pos[i * 3] = (Math.random() - 0.5) * tileW * 0.85;
        pos[i * 3 + 1] = 0.4 + Math.random() * 1.8;
        pos[i * 3 + 2] = (Math.random() - 0.5) * tileD * 0.85;
      }
    },
    particleMat(color, 0.42)
  );
  g.add(points);
  updaters.push((dt, t) => {
    for (let i = 0; i < n; i++) {
      positions[i * 3] += Math.sin(t * 0.4 + i) * dt * 0.35;
      positions[i * 3 + 1] += dt * 0.12;
      positions[i * 3 + 2] += Math.cos(t * 0.35 + i * 0.7) * dt * 0.25;
      if (positions[i * 3 + 1] > 2.6) positions[i * 3 + 1] = 0.35;
    }
    points.geometry.attributes.position.needsUpdate = true;
  });
}

function addFlickerLight(g, x, y, z, color, intensity = 0.55) {
  const light = new THREE.PointLight(color, intensity, 8, 1.6);
  light.position.set(x, y, z);
  g.add(light);
  const base = intensity;
  updaters.push((_dt, t) => {
    light.intensity = base + Math.sin(t * 9 + x) * 0.12 + Math.sin(t * 13) * 0.08;
  });
}

/** @param {string} slotId */
function buildMacro2L4Fx(slotId, tileW, tileD) {
  const g = new THREE.Group();
  g.name = `macro2-l4-${slotId}`;

  switch (slotId) {
    case "lexur_hills":
      addMist(g, slotId, tileW, tileD, 0xc4b5fd, 24);
      addFlickerLight(g, 0, 1.2, 0, 0xa78bfa, 0.35);
      break;
    case "meerim_coast": {
      const { points, positions, count: n } = makeParticles(
        20,
        (c, pos) => {
          for (let i = 0; i < c; i++) {
            pos[i * 3] = (Math.random() - 0.5) * tileW * 0.7;
            pos[i * 3 + 1] = 0.5 + Math.random() * 0.4;
            pos[i * 3 + 2] = tileD * 0.28 + Math.random() * tileD * 0.12;
          }
        },
        particleMat(0x7dd3fc, 0.5)
      );
      g.add(points);
      updaters.push((dt, t) => {
        for (let i = 0; i < n; i++) {
          positions[i * 3 + 1] += dt * 0.45;
          if (positions[i * 3 + 1] > 1.4) positions[i * 3 + 1] = 0.45;
        }
        points.geometry.attributes.position.needsUpdate = true;
      });
      break;
    }
    case "elvin_valley": {
      const { points, positions, count: n } = makeParticles(
        18,
        (c, pos) => {
          for (let i = 0; i < c; i++) {
            pos[i * 3] = (Math.random() - 0.5) * tileW * 0.8;
            pos[i * 3 + 1] = 0.6 + Math.random() * 1.2;
            pos[i * 3 + 2] = (Math.random() - 0.5) * tileD * 0.8;
          }
        },
        particleMat(0x86efac, 0.38)
      );
      g.add(points);
      updaters.push((dt, t) => {
        for (let i = 0; i < n; i++) {
          positions[i * 3] += Math.sin(t + i) * dt * 0.2;
          positions[i * 3 + 2] += Math.cos(t * 0.8 + i) * dt * 0.2;
        }
        points.geometry.attributes.position.needsUpdate = true;
      });
      break;
    }
    case "garm_corridor":
      addFlickerLight(g, -tileW * 0.2, 1.8, -tileD * 0.15, 0xc4b5fd, 0.5);
      addFlickerLight(g, tileW * 0.2, 1.8, tileD * 0.1, 0xa78bfa, 0.45);
      addMist(g, slotId, tileW, tileD, 0x8b5cf6, 12);
      break;
    case "ilvana_valley": {
      const stream = new THREE.Mesh(
        new THREE.PlaneGeometry(tileW * 0.16, tileD * 0.75),
        new THREE.MeshBasicMaterial({
          color: 0x67e8f9,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
        })
      );
      stream.rotation.x = -Math.PI / 2;
      stream.position.set(-tileW * 0.08, 0.38, 0);
      g.add(stream);
      updaters.push((_dt, t) => {
        stream.material.opacity = 0.16 + Math.sin(t * 2.2) * 0.08;
      });
      addMist(g, slotId, tileW, tileD, 0x22d3ee, 14);
      break;
    }
    case "desert_preview":
      addMist(g, slotId, tileW, tileD, 0xfcd34d, 16);
      break;
    case "slorim_plain": {
      const { points, positions, count: n } = makeParticles(
        22,
        (c, pos) => {
          for (let i = 0; i < c; i++) {
            pos[i * 3] = (Math.random() - 0.5) * tileW * 0.9;
            pos[i * 3 + 1] = 0.25 + Math.random() * 0.5;
            pos[i * 3 + 2] = (Math.random() - 0.5) * tileD * 0.9;
          }
        },
        particleMat(0xd9f99d, 0.35)
      );
      g.add(points);
      updaters.push((dt, t) => {
        for (let i = 0; i < n; i++) {
          positions[i * 3] += dt * 0.5;
          if (positions[i * 3] > tileW * 0.45) positions[i * 3] = -tileW * 0.45;
        }
        points.geometry.attributes.position.needsUpdate = true;
      });
      break;
    }
    case "ips_canyon": {
      const { points, positions, count: n } = makeParticles(
        26,
        (c, pos) => {
          for (let i = 0; i < c; i++) {
            pos[i * 3] = (Math.random() - 0.5) * tileW * 0.35;
            pos[i * 3 + 1] = 0.5 + Math.random() * 2.2;
            pos[i * 3 + 2] = (Math.random() - 0.5) * tileD * 0.75;
          }
        },
        particleMat(0xfdba74, 0.32)
      );
      g.add(points);
      updaters.push((dt, t) => {
        for (let i = 0; i < n; i++) {
          positions[i * 3 + 1] -= dt * 0.08;
          positions[i * 3] += Math.sin(t + i) * dt * 0.05;
          if (positions[i * 3 + 1] < 0.3) positions[i * 3 + 1] = 2.5;
        }
        points.geometry.attributes.position.needsUpdate = true;
      });
      break;
    }
    case "hatiil_desert": {
      const { points, positions, count: n } = makeParticles(
        48,
        (c, pos) => {
          for (let i = 0; i < c; i++) {
            pos[i * 3] = (Math.random() - 0.5) * tileW * 0.95;
            pos[i * 3 + 1] = 0.3 + Math.random() * 2.4;
            pos[i * 3 + 2] = (Math.random() - 0.5) * tileD * 0.95;
          }
        },
        particleMat(0xd97706, 0.48)
      );
      g.add(points);
      updaters.push((dt, t) => {
        const wind = 1.2 + Math.sin(t * 0.5) * 0.4;
        for (let i = 0; i < n; i++) {
          positions[i * 3] += dt * wind;
          positions[i * 3 + 2] += Math.sin(t * 2 + i) * dt * 0.35;
          positions[i * 3 + 1] += Math.sin(t + i * 0.3) * dt * 0.05;
          if (positions[i * 3] > tileW * 0.48) {
            positions[i * 3] = -tileW * 0.48;
            positions[i * 3 + 1] = 0.3 + Math.random() * 2.2;
          }
        }
        points.geometry.attributes.position.needsUpdate = true;
      });
      break;
    }
    default:
      break;
  }

  return g;
}

/**
 * L4 演出をタイルに追加
 * @param {THREE.Group} tileRoot
 * @param {string} slotId
 * @param {number} tileW
 * @param {number} tileD
 */
export function appendMoe3dMacro2L4Fx(tileRoot, slotId, tileW, tileD) {
  if (!tileRoot || !MACRO2_L1_SLOT_IDS.has(slotId)) return null;
  const fx = buildMacro2L4Fx(slotId, tileW, tileD);
  tileRoot.add(fx);
  tileRoot.userData.macro2L4 = { id: slotId, layer: 4 };
  return fx;
}

/** @param {number} dt */
export function updateMoe3dMacro2L4Fx(dt) {
  elapsed += dt;
  for (const fn of updaters) fn(dt, elapsed);
}

/** シーン再構築時 */
export function resetMoe3dMacro2L4Fx() {
  updaters.length = 0;
  elapsed = 0;
}
