import * as THREE from "three";
import { buildMoe3dKanbanSign } from "@/lib/moe3dKanbanSign";

/**
 * ワールド座標の基準
 * - 原点 (0, 0) = 試作 2×4 タイル群の中心（moe3dTerrainGroupOffset）
 * - player.x = Three.js X · player.y = Three.js Z
 * - 東 +X · 西 −X · 南 +Z · 北 −Z
 */

/** 原点から各方位磁石までの距離（ワールド単位） */
export const MOE_3D_COMPASS_ARM = 14;

/** @typedef {{ label: string, subtitle: string, x: number, z: number, color: number, isOrigin?: boolean }} Moe3dCompassMarkerDef */

/** @type {Moe3dCompassMarkerDef[]} */
export const MOE_3D_COMPASS_MARKERS = [
  { label: "原点", subtitle: "0 · 0", x: 0, z: 0, color: 0xfbbf24, isOrigin: true },
  { label: "北", subtitle: "磁石 · −Z", x: 0, z: -MOE_3D_COMPASS_ARM, color: 0xef4444 },
  { label: "南", subtitle: "磁石 · ＋Z", x: 0, z: MOE_3D_COMPASS_ARM, color: 0x3b82f6 },
  { label: "東", subtitle: "磁石 · ＋X", x: MOE_3D_COMPASS_ARM, z: 0, color: 0x22c55e },
  { label: "西", subtitle: "磁石 · −X", x: -MOE_3D_COMPASS_ARM, z: 0, color: 0xa855f7 },
];

/**
 * 磁石型マーカー（色付きバー＋看板）
 * @param {Moe3dCompassMarkerDef} def
 */
export function buildMoe3dCompassMagnet(def) {
  const root = new THREE.Group();
  root.name = `moe-compass-${def.label}`;

  const barMat = new THREE.MeshStandardMaterial({
    color: def.color,
    roughness: 0.55,
    metalness: 0.12,
  });
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.22, 1.05),
    barMat
  );
  bar.position.y = 0.14;
  bar.castShadow = true;
  root.add(bar);

  const capMat = new THREE.MeshStandardMaterial({
    color: def.isOrigin ? 0xfde68a : 0xffffff,
    roughness: 0.4,
    metalness: 0.2,
  });
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.12, 10),
    capMat
  );
  cap.position.y = 0.32;
  cap.castShadow = true;
  root.add(cap);

  const sign = buildMoe3dKanbanSign(def.label, def.subtitle, {
    scale: def.isOrigin ? 0.62 : 0.54,
    boardW: def.isOrigin ? 1.35 : 1.05,
  });
  sign.position.y = 1.05;
  root.add(sign);

  root.userData.moeCompass = { label: def.label, x: def.x, z: def.z };
  return root;
}

/**
 * 原点＋東西南北磁石をシーンに配置
 * @param {THREE.Scene} scene
 * @param {THREE.Group} terrainGroup
 * @param {(rc: THREE.Raycaster, tg: THREE.Group, x: number, z: number) => number} groundY
 * @param {THREE.Raycaster} raycaster
 */
export function addMoe3dWorldCompass(scene, terrainGroup, groundY, raycaster) {
  const placed = [];
  for (const def of MOE_3D_COMPASS_MARKERS) {
    const gy = groundY(raycaster, terrainGroup, def.x, def.z);
    const magnet = buildMoe3dCompassMagnet(def);
    magnet.position.set(def.x, gy, def.z);
    scene.add(magnet);
    placed.push(magnet);
  }
  return placed;
}
