import * as THREE from "three";
import { MOE_3D_COMPASS_MARKER_DIST } from "@/lib/moe3dWorldLayout";

/** @typedef {{ id: string, labelJa: string, labelEn: string, dx: number, dz: number, color: number }} Moe3dCompassMarkerDef */

/** 東西南北磁石（+x=東 · +z=南） */
export const MOE_3D_COMPASS_MARKERS = [
  { id: "north", labelJa: "北", labelEn: "N", dx: 0, dz: -1, color: 0x2563eb },
  { id: "south", labelJa: "南", labelEn: "S", dx: 0, dz: 1, color: 0xdc2626 },
  { id: "east", labelJa: "東", labelEn: "E", dx: 1, dz: 0, color: 0xd97706 },
  { id: "west", labelJa: "西", labelEn: "W", dx: -1, dz: 0, color: 0x16a34a },
];

/**
 * 方位磁石メッシュ（低ポリ · 棒＋先端）
 * @param {Moe3dCompassMarkerDef} marker
 */
export function buildMoe3dCompassMarker(marker) {
  const root = new THREE.Group();
  root.name = `compass-${marker.id}`;

  const mat = new THREE.MeshStandardMaterial({
    color: marker.color,
    metalness: 0.45,
    roughness: 0.42,
  });

  const pole = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.2, 1.1), mat);
  pole.position.y = 1.6;
  pole.castShadow = true;
  root.add(pole);

  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.6, 4), mat);
  tip.position.y = 4.0;
  tip.rotation.y = Math.PI / 4;
  tip.castShadow = true;
  root.add(tip);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.5, 0.35, 10),
    new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.85 })
  );
  base.position.y = 0.18;
  base.receiveShadow = true;
  root.add(base);

  root.userData.compassMarker = marker.id;
  return root;
}

/** 原点マーカー（ビスク中央 0,0） */
export function buildMoe3dOriginMarker() {
  const root = new THREE.Group();
  root.name = "world-origin";

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.22, 8, 24),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.35,
      metalness: 0.5,
      roughness: 0.35,
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.12;
  root.add(ring);

  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 2.4, 8),
    new THREE.MeshStandardMaterial({ color: 0xfde68a, metalness: 0.6 })
  );
  pin.position.y = 1.2;
  pin.castShadow = true;
  root.add(pin);

  root.userData.worldOrigin = true;
  return root;
}

/**
 * @param {Moe3dCompassMarkerDef} marker
 * @param {number} [dist]
 */
export function moe3dCompassMarkerWorldXZ(
  marker,
  dist = MOE_3D_COMPASS_MARKER_DIST
) {
  return { x: marker.dx * dist, z: marker.dz * dist };
}
