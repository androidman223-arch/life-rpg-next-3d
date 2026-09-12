import * as THREE from "three";
import { MACRO2_L1_SLOT_IDS } from "@/lib/moe3dMacro2Constants";
import { macro2L5WikiForSlot } from "@/lib/moe3dMacro2L5Wiki";

/** マクロ２ 目標サイクル数（progress と同期） · 第2フェーズで 30 まで */
export const MACRO2_TARGET_CYCLES = 30;

/** 適用済みサイクル（2〜この値まで追い込み） · 第1フェーズ完了=10 · 第2は1サイクルずつ増やす */
export const MACRO2_APPLIED_CYCLES = 10;

function rockMat(color) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.02 });
}

const PALETTE = {
  lexur_hills: 0x6d28d9,
  meerim_coast: 0xd4b896,
  elvin_valley: 0x166534,
  garm_corridor: 0x4c1d95,
  ilvana_valley: 0x0e7490,
  desert_preview: 0xb8895a,
  slorim_plain: 0x4d7c0f,
  ips_canyon: 0x78716c,
  hatiil_desert: 0x92400e,
};

function cycleOffset(cycle, tileW, tileD) {
  const angle = ((cycle * 37) % 360) * (Math.PI / 180);
  const r = tileW * (0.12 + (cycle % 5) * 0.04);
  return {
    x: Math.cos(angle) * r,
    z: Math.sin(angle) * r * (tileD / tileW),
  };
}

/** L1 — 小石クラスタ */
export function appendMoe3dMacro2CycleL1Pass(tileRoot, slotId, cycle, tileW, tileD) {
  if (!tileRoot || cycle < 2 || !MACRO2_L1_SLOT_IDS.has(slotId)) return null;
  const g = new THREE.Group();
  g.name = `macro2-c${cycle}-l1-${slotId}`;
  const color = PALETTE[slotId] ?? 0x78716c;
  const off = cycleOffset(cycle, tileW, tileD);
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.16 + (cycle % 3) * 0.03, 0),
    rockMat(color)
  );
  rock.scale.set(1.1, 0.65, 0.95);
  rock.position.set(off.x, 0.36 + (cycle % 4) * 0.03, off.z);
  rock.castShadow = true;
  g.add(rock);
  tileRoot.add(g);
  return g;
}

/** L2 — サイクル目印（小さな杭） */
export function appendMoe3dMacro2CycleL2Pass(tileRoot, slotId, cycle, tileW, tileD) {
  if (!tileRoot || cycle < 2 || !MACRO2_L1_SLOT_IDS.has(slotId)) return null;
  const g = new THREE.Group();
  g.name = `macro2-c${cycle}-l2-${slotId}`;
  const off = cycleOffset(cycle + 3, tileW, tileD);
  const stake = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.55 + (cycle % 3) * 0.08, 5),
    rockMat(PALETTE[slotId] ?? 0x78716c)
  );
  stake.position.set(off.x, 0.42, off.z);
  stake.castShadow = true;
  g.add(stake);
  tileRoot.add(g);
  return g;
}

/** L3 — 湧き調整マーカー（淡いリング） */
export function appendMoe3dMacro2CycleL3Pass(tileRoot, slotId, cycle, tileW, tileD) {
  if (!tileRoot || cycle < 2 || !MACRO2_L1_SLOT_IDS.has(slotId)) return null;
  const g = new THREE.Group();
  g.name = `macro2-c${cycle}-l3-${slotId}`;
  const off = cycleOffset(cycle + 7, tileW, tileD);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.2, 0.28, 10),
    new THREE.MeshStandardMaterial({
      color: 0x86efac,
      emissive: 0x166534,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.25 + (cycle % 3) * 0.05,
      side: THREE.DoubleSide,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(off.x, 0.34, off.z);
  g.add(ring);
  tileRoot.add(g);
  return g;
}

/** L4 — 微光（サイクルごとに明るさ追加） */
export function appendMoe3dMacro2CycleL4Pass(tileRoot, slotId, cycle, tileW, tileD) {
  if (!tileRoot || cycle < 2 || !MACRO2_L1_SLOT_IDS.has(slotId)) return null;
  const g = new THREE.Group();
  g.name = `macro2-c${cycle}-l4-${slotId}`;
  const off = cycleOffset(cycle + 11, tileW, tileD);
  const light = new THREE.PointLight(PALETTE[slotId] ?? 0xffffff, 0.08 + cycle * 0.012, 6, 2);
  light.position.set(off.x, 1.2 + (cycle % 4) * 0.15, off.z);
  g.add(light);
  tileRoot.add(g);
  return g;
}

/** L5 — Wikiメモ（userData） */
export function appendMoe3dMacro2CycleL5Pass(tileRoot, slotId, cycle) {
  if (!tileRoot || cycle < 2 || !MACRO2_L1_SLOT_IDS.has(slotId)) return null;
  const wiki = macro2L5WikiForSlot(slotId);
  if (!tileRoot.userData.macro2L5Cycles) tileRoot.userData.macro2L5Cycles = [];
  tileRoot.userData.macro2L5Cycles.push({
    cycle,
    areaJa: wiki?.areaJa ?? slotId,
    wikiUrl: wiki?.wikiUrl ?? "",
    note: `サイクル${cycle} · ${(wiki?.reproduced ?? []).join(" · ")}`,
  });
  return null;
}

/**
 * サイクル 2〜N の L1〜L5 をすべて適用
 * @param {THREE.Group} tileRoot
 * @param {string} slotId
 * @param {number} tileW
 * @param {number} tileD
 */
export function appendAllMoe3dMacro2CyclePasses(tileRoot, slotId, tileW, tileD) {
  if (!tileRoot || !MACRO2_L1_SLOT_IDS.has(slotId)) return;
  const max = Math.min(MACRO2_APPLIED_CYCLES, MACRO2_TARGET_CYCLES);
  for (let cycle = 2; cycle <= max; cycle++) {
    appendMoe3dMacro2CycleL1Pass(tileRoot, slotId, cycle, tileW, tileD);
    appendMoe3dMacro2CycleL2Pass(tileRoot, slotId, cycle, tileW, tileD);
    appendMoe3dMacro2CycleL3Pass(tileRoot, slotId, cycle, tileW, tileD);
    appendMoe3dMacro2CycleL4Pass(tileRoot, slotId, cycle, tileW, tileD);
    appendMoe3dMacro2CycleL5Pass(tileRoot, slotId, cycle);
  }
  tileRoot.userData.macro2Cycles = { applied: max, target: MACRO2_TARGET_CYCLES };
}

/** @deprecated MACRO2_APPLIED_CYCLES を使用 */
export const MACRO2_CURRENT_CYCLE = MACRO2_APPLIED_CYCLES;
