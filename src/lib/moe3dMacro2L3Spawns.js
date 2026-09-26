import * as THREE from "three";
import { moeMapAltarLayout } from "@/data/moeAltarWarps";
import { MACRO2_L1_SLOT_IDS } from "@/lib/moe3dMacro2Constants";

/**
 * マクロ２ L3 — 湧き・座標（祭壇余白 · リスポーン範囲 · 湧き pad 表示）
 * @typedef {{ altarTx: number, altarTz: number, altarR: number, kanbanTz: number, respawnMargin: number, playerClear: number }} Macro2L3Zone
 */

/** @type {Record<string, Macro2L3Zone>} */
export const MACRO2_L3_ZONES = {
  lexur_hills: { altarTx: 0.5, altarTz: 0.5, altarR: 0.13, kanbanTz: 0.14, respawnMargin: 0.14, playerClear: 18 },
  meerim_coast: { altarTx: 0.5, altarTz: 0.5, altarR: 0.13, kanbanTz: 0.14, respawnMargin: 0.14, playerClear: 18 },
  elvin_valley: { altarTx: 0.5, altarTz: 0.5, altarR: 0.13, kanbanTz: 0.14, respawnMargin: 0.14, playerClear: 18 },
  garm_corridor: { altarTx: 0.5, altarTz: 0.5, altarR: 0.13, kanbanTz: 0.14, respawnMargin: 0.14, playerClear: 18 },
  ilvana_valley: { altarTx: 0.5, altarTz: 0.5, altarR: 0.13, kanbanTz: 0.14, respawnMargin: 0.14, playerClear: 18 },
  desert_preview: { altarTx: 0.5, altarTz: 0.5, altarR: 0.13, kanbanTz: 0.14, respawnMargin: 0.16, playerClear: 20 },
  slorim_plain: { altarTx: 0.5, altarTz: 0.5, altarR: 0.15, kanbanTz: 0.14, respawnMargin: 0.16, playerClear: 22 },
  ips_canyon: { altarTx: 0.5, altarTz: 0.52, altarR: 0.14, kanbanTz: 0.14, respawnMargin: 0.15, playerClear: 20 },
  hatiil_desert: { altarTx: 0.5, altarTz: 0.5, altarR: 0.14, kanbanTz: 0.14, respawnMargin: 0.15, playerClear: 22 },
  sulfur_mine: { altarTx: 0.052, altarTz: 0.948, altarR: 0.1, kanbanTz: 0.14, respawnMargin: 0.12, playerClear: 20 },
  elan_palace: { altarTx: 0.052, altarTz: 0.948, altarR: 0.1, kanbanTz: 0.14, respawnMargin: 0.12, playerClear: 20 },
  albeez_forest: { altarTx: 0.5, altarTz: 0.5, altarR: 0.14, kanbanTz: 0.14, respawnMargin: 0.15, playerClear: 20 },
  neoku_mountain: { altarTx: 0.5, altarTz: 0.5, altarR: 0.14, kanbanTz: 0.14, respawnMargin: 0.15, playerClear: 22 },
};

/** L1 以外で L3 湧き pad を出す予約タイル */
export const MACRO2_L3_RESERVED_SLOT_IDS = new Set([
  "sulfur_mine",
  "elan_palace",
  "albeez_forest",
  "neoku_mountain",
]);

/** @param {string} mapSlotId */
export function macro2L3Zone(mapSlotId) {
  const base = MACRO2_L3_ZONES[mapSlotId];
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
 * 祭壇・看板付近から湧き座標を押し出す
 * @param {number} tx
 * @param {number} tz
 * @param {string} mapSlotId
 */
export function macro2L3TunedSpawnCoords(tx, tz, mapSlotId) {
  const zone = macro2L3Zone(mapSlotId);
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

/** @param {string} mapSlotId */
export function macro2L3RespawnMargin(mapSlotId) {
  return macro2L3Zone(mapSlotId).respawnMargin;
}

/** @param {string} mapSlotId */
export function macro2L3PlayerClearDist(mapSlotId) {
  return macro2L3Zone(mapSlotId).playerClear;
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
 * L3 湧き pad（リング）をタイルに追加
 * @param {THREE.Group} tileRoot
 * @param {string} slotId
 * @param {number} tileW
 * @param {number} tileD
 * @param {{ mapSlotId: string, key: string, tx: number, tz: number }[]} [spawnSpecs]
 */
export function appendMoe3dMacro2L3SpawnPads(tileRoot, slotId, tileW, tileD, spawnSpecs = []) {
  if (
    !tileRoot ||
    (!MACRO2_L1_SLOT_IDS.has(slotId) && !MACRO2_L3_RESERVED_SLOT_IDS.has(slotId))
  ) {
    return null;
  }

  const g = new THREE.Group();
  g.name = `macro2-l3-${slotId}`;

  const specs = spawnSpecs.filter((s) => s.mapSlotId === slotId);
  const seen = new Set();
  const ringMat = padMat(0x86efac, 0x166534);
  const bossMat = padMat(0xfbbf24, 0xb45309);

  for (const spec of specs) {
    const key = `${spec.key}:${spec.slotInZone ?? 0}:${spec.tx}:${spec.tz}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const { tx, tz } = macro2L3TunedSpawnCoords(spec.tx, spec.tz, slotId);
    const isBoss = spec.key.includes("boss") || spec.key.includes("punisher") || spec.key === "chimera";
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(isBoss ? 0.55 : 0.38, isBoss ? 0.72 : 0.52, 14),
      isBoss ? bossMat : ringMat
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set((tx - 0.5) * tileW * 0.96, 0.36, (tz - 0.5) * tileD * 0.96);
    ring.receiveShadow = true;
    g.add(ring);
  }

  const zone = macro2L3Zone(slotId);
  const altarPad = new THREE.Mesh(
    new THREE.RingGeometry(0.22, 0.32, 12),
    padMat(0xc4b5fd, 0x7c3aed)
  );
  altarPad.rotation.x = -Math.PI / 2;
  altarPad.position.set(
    (zone.altarTx - 0.5) * tileW * 0.96,
    0.34,
    (zone.altarTz - 0.5) * tileD * 0.96
  );
  g.add(altarPad);

  tileRoot.add(g);
  tileRoot.userData.macro2L3 = { id: slotId, spawnPads: specs.length, layer: 3 };
  return g;
}
