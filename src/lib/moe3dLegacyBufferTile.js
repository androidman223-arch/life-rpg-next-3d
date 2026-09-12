import * as THREE from "three";
import { MOE_TERRAIN_BUFFER_PATHS_ENABLED } from "@/lib/moe3dTerrainFeatures";

/** 試作マップ ↔ 本編の間 — 距離用バッファ（1 面） */
export function buildMoe3dLegacyBufferTile(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "legacy-buffer-tile";

  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x6b8f5e,
    roughness: 0.94,
  });
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0xc4a574,
    roughness: 0.9,
  });

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.98, 0.22, tileD * 0.98),
    grassMat
  );
  base.position.y = 0.08;
  base.receiveShadow = true;
  root.add(base);

  if (MOE_TERRAIN_BUFFER_PATHS_ENABLED) {
    const path = new THREE.Mesh(
      new THREE.BoxGeometry(tileW * 0.14, 0.06, tileD * 0.88),
      pathMat
    );
    path.position.set(tileW * 0.08, 0.24, 0);
    path.receiveShadow = true;
    root.add(path);
  }

  return root;
}
