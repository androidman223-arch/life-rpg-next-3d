import * as THREE from "three";
import { MOE_AGE_MAP_SLOT_IDS } from "@/lib/moe3dMacro2AgeConstants";
import {
  MOE_MITOYA_TREE_TX,
  MOE_MITOYA_TREE_TZ,
  moe3dMitoyaTileLocalX,
  moe3dMitoyaTileLocalZ,
} from "@/lib/moe3dMitoyaGreatTreeLayout";
import {
  appendGeoAbyssLavaFx,
  isGeoAbyssSlot,
  registerGeoAbyssLavaIdleMotion,
  resetGeoAbyssLavaFx,
  updateGeoAbyssLavaRipples,
} from "@/lib/moe3dGeoAbyssLavaFx";

/** @type {((dt: number, t: number) => void)[]} */
const updaters = [];
let elapsed = 0;

function particleMat(color, opacity = 0.5) {
  return new THREE.PointsMaterial({
    color,
    size: 0.2,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function addWarmLantern(g, x, y, z, color = 0xfbbf24, intensity = 0.42) {
  const light = new THREE.PointLight(color, intensity, 7, 1.8);
  light.position.set(x, y, z);
  g.add(light);
  const base = intensity;
  updaters.push((_dt, t) => {
    light.intensity = base + Math.sin(t * 2.4 + x) * 0.08;
  });
}

function makeSteam(count, tileW, tileD, cx, cz, spreadW, spreadD) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = cx + (Math.random() - 0.5) * spreadW;
    positions[i * 3 + 1] = 0.35 + Math.random() * 0.25;
    positions[i * 3 + 2] = cz + (Math.random() - 0.5) * spreadD;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geo, particleMat(0xe0f2fe, 0.45));
  points.frustumCulled = false;
  return { points, positions, count };
}

/** @param {string} slotId @param {number} tileW @param {number} tileD */
function buildAgeL4Fx(slotId, tileW, tileD) {
  const g = new THREE.Group();
  g.name = `macro2-age-l4-${slotId}`;

  if (slotId === "yug_coast") {
    const canalX = tileW * 0.36;
    const stream = new THREE.Mesh(
      new THREE.PlaneGeometry(tileW * 0.1, tileD * 0.68),
      new THREE.MeshBasicMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      })
    );
    stream.rotation.x = -Math.PI / 2;
    stream.position.set(canalX, 0.36, 0);
    g.add(stream);
    updaters.push((_dt, t) => {
      stream.material.opacity = 0.16 + Math.sin(t * 1.6) * 0.08;
    });

    const count = 28;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * tileW * 0.55;
      positions[i * 3 + 1] = 0.5 + Math.random() * 1.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * tileD * 0.45;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const fireflies = new THREE.Points(geo, particleMat(0xfef08a, 0.55));
    fireflies.frustumCulled = false;
    g.add(fireflies);
    updaters.push((dt, t) => {
      for (let i = 0; i < count; i++) {
        positions[i * 3] += Math.sin(t * 0.8 + i) * dt * 0.18;
        positions[i * 3 + 2] += Math.cos(t * 0.7 + i * 0.6) * dt * 0.15;
        positions[i * 3 + 1] += Math.sin(t * 2 + i) * dt * 0.03;
      }
      fireflies.geometry.attributes.position.needsUpdate = true;
      fireflies.material.opacity = 0.42 + Math.sin(t * 1.5) * 0.12;
    });

    addWarmLantern(g, tileW * -0.12, 0.9, tileD * -0.1);
    addWarmLantern(g, tileW * 0.08, 0.88, tileD * -0.06);
    addWarmLantern(g, canalX, 0.75, tileD * 0.2, 0x93c5fd, 0.28);
  }

  if (slotId === "soles_valley") {
    const pools = [
      { x: -0.04, z: 0.46, n: 22 },
      { x: 0.1, z: 0.34, n: 14 },
    ];
    for (const pool of pools) {
      const { points, positions, count } = makeSteam(
        pool.n,
        tileW,
        tileD,
        tileW * pool.x,
        tileD * pool.z,
        tileW * 0.14,
        tileD * 0.1
      );
      g.add(points);
      updaters.push((dt, t) => {
        for (let i = 0; i < count; i++) {
          positions[i * 3 + 1] += dt * 0.55;
          positions[i * 3] += Math.sin(t * 1.2 + i) * dt * 0.15;
          if (positions[i * 3 + 1] > 2.2) {
            positions[i * 3 + 1] = 0.32 + Math.random() * 0.15;
          }
        }
        points.geometry.attributes.position.needsUpdate = true;
      });
    }

    const stream = new THREE.Mesh(
      new THREE.PlaneGeometry(tileW * 0.14, tileD * 0.68),
      new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      })
    );
    stream.rotation.x = -Math.PI / 2;
    stream.position.set(-tileW * 0.08, 0.38, 0);
    g.add(stream);
    updaters.push((_dt, t) => {
      stream.material.opacity = 0.14 + Math.sin(t * 2) * 0.07;
    });
  }

  if (isGeoAbyssSlot(slotId)) {
    const geoFx = appendGeoAbyssLavaFx(g, slotId, tileW, tileD);
    registerGeoAbyssLavaIdleMotion(geoFx, (fn) => updaters.push(fn));
  }

  if (slotId === "mitoya_great_tree") {
    const westCanalX = -tileW * 0.34;
    const westStream = new THREE.Mesh(
      new THREE.PlaneGeometry(tileW * 0.09, tileD * 0.58),
      new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
      })
    );
    westStream.rotation.x = -Math.PI / 2;
    westStream.position.set(westCanalX, 0.36, tileD * 0.04);
    g.add(westStream);
    updaters.push((_dt, t) => {
      westStream.material.opacity = 0.12 + Math.sin(t * 1.4) * 0.06;
    });
    addWarmLantern(g, tileW * -0.18, 0.85, tileD * 0.34, 0xfde68a, 0.38);
    addWarmLantern(g, tileW * -0.02, 0.82, tileD * 0.38, 0xfbbf24, 0.35);
    addWarmLantern(g, westCanalX, 0.72, tileD * 0.12, 0x93c5fd, 0.25);

    const trunkX = moe3dMitoyaTileLocalX(tileW, MOE_MITOYA_TREE_TX);
    const trunkZ = moe3dMitoyaTileLocalZ(tileD, MOE_MITOYA_TREE_TZ);
    const crownX = trunkX;
    const crownZ = trunkZ;
    const crownBaseY = 38;
    const count = 48;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 4 + Math.random() * 10;
      positions[i * 3] = crownX + Math.cos(angle) * r;
      positions[i * 3 + 1] = crownBaseY + Math.random() * 8;
      positions[i * 3 + 2] = crownZ + Math.sin(angle) * r * 0.85;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const motes = new THREE.Points(geo, particleMat(0xfde68a, 0.62));
    motes.frustumCulled = false;
    g.add(motes);
    updaters.push((dt, t) => {
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += dt * (0.35 + (i % 5) * 0.05);
        positions[i * 3] += Math.sin(t * 1.4 + i * 0.7) * dt * 0.18;
        positions[i * 3 + 2] += Math.cos(t * 1.1 + i) * dt * 0.14;
        if (positions[i * 3 + 1] > crownBaseY + 12) {
          const angle = (i / count) * Math.PI * 2 + t * 0.2;
          const r = 4 + Math.random() * 10;
          positions[i * 3] = crownX + Math.cos(angle) * r;
          positions[i * 3 + 1] = crownBaseY + Math.random() * 2;
          positions[i * 3 + 2] = crownZ + Math.sin(angle) * r * 0.85;
        }
      }
      motes.geometry.attributes.position.needsUpdate = true;
      motes.material.opacity = 0.48 + Math.sin(t * 1.8) * 0.12;
    });

    addWarmLantern(g, trunkX, 37, trunkZ, 0xfef3c7, 0.65);
    addWarmLantern(g, trunkX + tileW * 0.22, 14, trunkZ + tileD * 0.08, 0xfbbf24, 0.42);
    addWarmLantern(g, trunkX - tileW * 0.2, 22, trunkZ + tileD * 0.1, 0xfbbf24, 0.38);
  }

  return g;
}

/**
 * @param {THREE.Group} tileRoot
 * @param {string} slotId
 * @param {number} tileW
 * @param {number} tileD
 */
export function appendMoe3dMacro2AgeL4Fx(tileRoot, slotId, tileW, tileD) {
  if (!tileRoot || !MOE_AGE_MAP_SLOT_IDS.has(slotId)) return null;
  const fx = buildAgeL4Fx(slotId, tileW, tileD);
  if (!fx.children.length) return null;
  tileRoot.add(fx);
  tileRoot.userData.macro2L4 = { id: slotId, layer: 4, age: true };
  return fx;
}

/** @param {number} dt */
export function updateMoe3dMacro2AgeL4Fx(dt) {
  elapsed += dt;
  for (const fn of updaters) fn(dt, elapsed);
  updateGeoAbyssLavaRipples(dt);
}

export function resetMoe3dMacro2AgeL4Fx() {
  updaters.length = 0;
  elapsed = 0;
  resetGeoAbyssLavaFx();
}
