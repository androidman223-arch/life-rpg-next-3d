import * as THREE from "three";
import { MACRO2_L1_SLOT_IDS } from "@/lib/moe3dMacro2Constants";
import {
  MOE_MACRO3_BASE_TOP_Y,
  MOE_MACRO3_RESERVED_BASE_TOP_Y,
} from "@/lib/moe3dMacro3Constants";
import { moeMacro3MountainSpecsForSlot } from "@/lib/moe3dMacro3MountainRegistry";
import { moeClimbableMountainTotalHeight } from "@/lib/moe3dMacro3SimpleMountain";

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
 * @param {import("./moe3dMacro3SimpleMountain.js").MoeSimpleMountainSpec} spec
 */
function climbFxColor(spec) {
  if (spec.climbTint != null) return spec.climbTint;
  if (spec.id?.includes("bone-white")) return 0xe7e5e4;
  if (spec.id?.includes("bone-black")) return 0xa8a29e;
  if (
    spec.id?.includes("volcano") ||
    spec.id?.includes("neoku") ||
    spec.id?.includes("darin")
  ) {
    return 0xfbbf24;
  }
  return 0xc4b5fd;
}

/** @param {string} slotId */
function macro3BaseTopY(slotId) {
  return MACRO2_L1_SLOT_IDS.has(slotId)
    ? MOE_MACRO3_BASE_TOP_Y
    : MOE_MACRO3_RESERVED_BASE_TOP_Y;
}

/**
 * @param {import("./moe3dMacro3SimpleMountain.js").MoeSimpleMountainSpec} spec
 */
function isVolcanoClimb(spec) {
  return (
    spec.id?.includes("volcano") ||
    spec.id?.includes("neoku") ||
    spec.id?.includes("darin")
  );
}

/**
 * マクロ３ L4 — 登攀丘の頂上演出（煙 · 骨丘の微光）
 * @param {THREE.Group} tileRoot
 * @param {string} slotId
 * @param {number} tileW
 * @param {number} tileD
 */
export function appendMoe3dMacro3L4Fx(tileRoot, slotId, tileW, tileD) {
  const specs = moeMacro3MountainSpecsForSlot(slotId).filter((s) => s.climbable);
  if (!tileRoot || !specs.length) return null;

  const g = new THREE.Group();
  g.name = `macro3-l4-${slotId}`;
  const baseY = macro3BaseTopY(slotId);

  for (const spec of specs) {
    const x = tileW * spec.x;
    const z = tileD * spec.z;
    const topY = baseY + moeClimbableMountainTotalHeight(spec);
    const color = climbFxColor(spec);
    const volcano = isVolcanoClimb(spec);
    const spread = (spec.sx ?? 0.34) * tileW * 0.35;
    const count = volcano ? 18 : 12;

    const { points, positions, count: n } = makeParticles(
      count,
      (c, pos) => {
        for (let i = 0; i < c; i++) {
          const r = spread * Math.random();
          const a = Math.random() * Math.PI * 2;
          pos[i * 3] = x + Math.cos(a) * r;
          pos[i * 3 + 1] = topY + Math.random() * 0.35;
          pos[i * 3 + 2] = z + Math.sin(a) * r;
        }
      },
      particleMat(color, volcano ? 0.52 : 0.34)
    );
    g.add(points);

    updaters.push((dt, t) => {
      const rise = volcano ? 0.38 : 0.14;
      for (let i = 0; i < n; i++) {
        positions[i * 3 + 1] += dt * rise;
        positions[i * 3] += Math.sin(t * 1.2 + i * 0.4) * dt * 0.1;
        positions[i * 3 + 2] += Math.cos(t * 1.1 + i * 0.3) * dt * 0.08;
        if (positions[i * 3 + 1] > topY + 2.4) {
          const r = spread * Math.random();
          const a = Math.random() * Math.PI * 2;
          positions[i * 3] = x + Math.cos(a) * r;
          positions[i * 3 + 1] = topY + Math.random() * 0.15;
          positions[i * 3 + 2] = z + Math.sin(a) * r;
        }
      }
      points.geometry.attributes.position.needsUpdate = true;
    });
  }

  tileRoot.add(g);
  tileRoot.userData.macro3L4 = { id: slotId, climbs: specs.length, layer: 4 };
  return g;
}

/** @param {number} dt */
export function updateMoe3dMacro3L4Fx(dt) {
  elapsed += dt;
  for (const fn of updaters) fn(dt, elapsed);
}

/** シーン再構築時 */
export function resetMoe3dMacro3L4Fx() {
  updaters.length = 0;
  elapsed = 0;
}
