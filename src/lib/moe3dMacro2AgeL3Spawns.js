import * as THREE from "three";
import { MOE_AGE_MAP_SLOT_IDS } from "@/lib/moe3dMacro2AgeConstants";
import { moeMapAltarLayout } from "@/data/moeAltarWarps";

/**
 * AGE 大陸 L3 — 湧き pad（yug_coast は海ヘビ配置済 · 他は座標調整用）
 * @typedef {{ altarTx: number, altarTz: number, altarR: number, kanbanTz: number, respawnMargin: number, playerClear: number }} Macro2AgeL3Zone
 */

/** @type {Record<string, Macro2AgeL3Zone>} */
export const MACRO2_AGE_L3_ZONES = {
  yug_coast: {
    altarTx: 0.5,
    altarTz: 0.5,
    altarR: 0.12,
    kanbanTz: 0.14,
    respawnMargin: 0.14,
    playerClear: 18,
  },
  soles_valley: {
    altarTx: 0.5,
    altarTz: 0.5,
    altarR: 0.11,
    kanbanTz: 0.14,
    respawnMargin: 0.13,
    playerClear: 18,
  },
  geo_abyss_ne: {
    altarTx: 0.5,
    altarTz: 0.66,
    altarR: 0.12,
    kanbanTz: 0.14,
    respawnMargin: 0.14,
    playerClear: 20,
  },
  geo_abyss_s: {
    altarTx: 0.5,
    altarTz: 0.66,
    altarR: 0.12,
    kanbanTz: 0.14,
    respawnMargin: 0.14,
    playerClear: 20,
  },
  geo_abyss_w: {
    altarTx: 0.5,
    altarTz: 0.66,
    altarR: 0.12,
    kanbanTz: 0.14,
    respawnMargin: 0.14,
    playerClear: 20,
  },
  mitoya_great_tree: {
    altarTx: 0.58,
    altarTz: 0.5,
    altarR: 0.13,
    kanbanTz: 0.14,
    respawnMargin: 0.14,
    playerClear: 20,
  },
};

/** 敵未実装 · 湧き pad だけ置く座標（tx/tz は 0〜1） */
export const MACRO2_AGE_L3_PLACEHOLDERS = {
  yug_coast: [
    { tx: 0.62, tz: 0.58 },
    { tx: 0.72, tz: 0.42 },
    { tx: 0.55, tz: 0.34 },
  ],
  soles_valley: [
    { tx: 0.28, tz: 0.58 },
    { tx: 0.42, tz: 0.66 },
    { tx: 0.34, tz: 0.74 },
  ],
  mitoya_great_tree: [{ tx: 0.58, tz: 0.62 }],
};

/** @param {string} mapSlotId */
export function macro2AgeL3Zone(mapSlotId) {
  const base = MACRO2_AGE_L3_ZONES[mapSlotId];
  const layout = moeMapAltarLayout(mapSlotId);
  if (!base) {
    return {
      altarTx: layout?.altarTx ?? 0.5,
      altarTz: layout?.altarTz ?? 0.5,
      altarR: 0.12,
      kanbanTz: 0.14,
      respawnMargin: 0.12,
      playerClear: 18,
    };
  }
  if (layout?.altarTx != null) {
    return { ...base, altarTx: layout.altarTx, altarTz: layout.altarTz ?? base.altarTz };
  }
  return base;
}

/**
 * @param {number} tx
 * @param {number} tz
 * @param {string} mapSlotId
 */
export function macro2AgeL3TunedCoords(tx, tz, mapSlotId) {
  const zone = macro2AgeL3Zone(mapSlotId);
  let nx = tx;
  let nz = tz;

  const adx = nx - zone.altarTx;
  const adz = nz - zone.altarTz;
  let dist = Math.hypot(adx, adz);
  if (dist < zone.altarR) {
    if (dist < 0.001) {
      nx = zone.altarTx + zone.altarR * 1.05;
      nz = zone.altarTz + zone.altarR * 0.6;
    } else {
      const push = (zone.altarR / dist) * 1.04;
      nx = zone.altarTx + adx * push;
      nz = zone.altarTz + adz * push;
    }
  }

  const kdz = Math.abs(nz - zone.kanbanTz);
  if (kdz < 0.06 && Math.abs(nx - 0.5) < 0.18) {
    nz = zone.kanbanTz + (nz >= zone.kanbanTz ? 0.08 : -0.08);
  }

  nx = Math.min(0.88, Math.max(0.12, nx));
  nz = Math.min(0.88, Math.max(0.12, nz));
  return { tx: nx, tz: nz };
}

function padMat(color, emissive) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.55,
    roughness: 0.85,
    side: THREE.DoubleSide,
  });
}

/**
 * AGE L3 湧き pad（プレースホルダ）
 * @param {THREE.Group} tileRoot
 * @param {string} slotId
 * @param {number} tileW
 * @param {number} tileD
 */
export function appendMoe3dMacro2AgeL3SpawnPads(tileRoot, slotId, tileW, tileD) {
  if (!tileRoot || !MOE_AGE_MAP_SLOT_IDS.has(slotId)) return null;

  const placeholders = MACRO2_AGE_L3_PLACEHOLDERS[slotId] ?? [];
  const g = new THREE.Group();
  g.name = `macro2-age-l3-${slotId}`;

  const ringMat = padMat(0x6ee7b7, 0x047857);
  const placeholderMat = padMat(0x93c5fd, 0x1d4ed8);

  for (const spec of placeholders) {
    const { tx, tz } = macro2AgeL3TunedCoords(spec.tx, spec.tz, slotId);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.34, 0.48, 14),
      placeholderMat
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set((tx - 0.5) * tileW * 0.96, 0.36, (tz - 0.5) * tileD * 0.96);
    ring.receiveShadow = true;
    g.add(ring);
  }

  const zone = macro2AgeL3Zone(slotId);
  const centerPad = new THREE.Mesh(
    new THREE.RingGeometry(0.2, 0.3, 12),
    ringMat
  );
  centerPad.rotation.x = -Math.PI / 2;
  centerPad.position.set(
    (zone.altarTx - 0.5) * tileW * 0.96,
    0.34,
    (zone.altarTz - 0.5) * tileD * 0.96
  );
  g.add(centerPad);

  tileRoot.add(g);
  tileRoot.userData.macro2L3 = {
    id: slotId,
    spawnPads: placeholders.length,
    layer: 3,
    age: true,
    placeholder: true,
  };
  return g;
}
