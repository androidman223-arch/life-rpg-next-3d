import * as THREE from "three";
import { buildMoe3dKanbanSign } from "@/lib/moe3dKanbanSign";

/**
 * 城下町ビスク — 1 面（低ポリ · 新エリア v1）
 * 中央広場 + 簡易建物。GLB 差し替え前のプレイ可能タイル。
 * @param {number} tileW
 * @param {number} tileD
 */
export function buildMoe3dBiskTile(tileW, tileD) {
  const root = new THREE.Group();
  root.name = "bisk-town-tile";

  const cobbleMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.9,
    metalness: 0.04,
  });
  const cobbleDarkMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.92,
  });
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xc4b5a0,
    roughness: 0.88,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.85,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.7,
  });

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.98, 0.32, tileD * 0.98),
    cobbleMat
  );
  base.position.y = 0.14;
  base.receiveShadow = true;
  root.add(base);

  const plaza = new THREE.Mesh(
    new THREE.CylinderGeometry(
      Math.min(tileW, tileD) * 0.22,
      Math.min(tileW, tileD) * 0.24,
      0.08,
      20
    ),
    cobbleDarkMat
  );
  plaza.position.set(0, 0.34, tileD * -0.02);
  plaza.receiveShadow = true;
  root.add(plaza);

  const buildingSpecs = [
    { x: -tileW * 0.32, z: -tileD * 0.28, w: tileW * 0.22, h: 3.2, d: tileD * 0.18 },
    { x: tileW * 0.3, z: -tileD * 0.22, w: tileW * 0.2, h: 2.8, d: tileD * 0.16 },
    { x: -tileW * 0.28, z: tileD * 0.26, w: tileW * 0.18, h: 2.5, d: tileD * 0.15 },
    { x: tileW * 0.28, z: tileD * 0.24, w: tileW * 0.19, h: 2.6, d: tileD * 0.14 },
  ];
  for (const b of buildingSpecs) {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(b.w, b.h, b.d),
      wallMat
    );
    body.position.set(b.x, 0.32 + b.h / 2, b.z);
    body.castShadow = true;
    body.receiveShadow = true;
    root.add(body);
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(b.w * 1.08, 0.35, b.d * 1.12),
      roofMat
    );
    roof.position.set(b.x, 0.32 + b.h + 0.18, b.z);
    roof.castShadow = true;
    root.add(roof);
  }

  const wallH = 1.8;
  const gateGap = tileW * 0.18;
  const northWall = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.98, wallH, 0.45),
    trimMat
  );
  northWall.position.set(0, 0.32 + wallH / 2, -tileD * 0.46);
  northWall.receiveShadow = true;
  root.add(northWall);

  for (const sx of [-1, 1]) {
    const sideWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, wallH, tileD * 0.38),
      trimMat
    );
    sideWall.position.set(sx * (tileW * 0.46), 0.32 + wallH / 2, tileD * 0.08);
    sideWall.receiveShadow = true;
    root.add(sideWall);
  }

  const sign = buildMoe3dKanbanSign("城下町ビスク", "新エリア", {
    scale: Math.min(1.1, tileW / 46),
    boardW: Math.min(tileW * 0.48, 3.4),
  });
  sign.position.set(0, 0, -tileD * 0.36);
  root.add(sign);

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.15,
    metalness: 0.35,
    transparent: true,
    opacity: 0.72,
  });
  const altarPool = new THREE.Mesh(
    new THREE.CylinderGeometry(
      Math.min(tileW, tileD) * 0.14,
      Math.min(tileW, tileD) * 0.16,
      0.06,
      24
    ),
    waterMat
  );
  altarPool.position.set(tileW * 0.02, 0.36, tileD * 0.08);
  altarPool.receiveShadow = true;
  root.add(altarPool);

  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.35,
    roughness: 0.6,
  });
  const postMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.75,
  });
  const lanternSpecs = [
    { x: -tileW * 0.14, z: tileD * 0.02, h: 2.4 },
    { x: tileW * 0.14, z: tileD * 0.02, h: 2.4 },
    { x: -tileW * 0.2, z: -tileD * 0.12, h: 2.1 },
    { x: tileW * 0.2, z: -tileD * 0.1, h: 2.1 },
    { x: 0, z: tileD * 0.2, h: 2.6 },
  ];
  for (const ln of lanternSpecs) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, ln.h, 6),
      postMat
    );
    post.position.set(ln.x, 0.32 + ln.h / 2, ln.z);
    post.castShadow = true;
    root.add(post);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 6),
      lanternMat
    );
    lamp.position.set(ln.x, 0.32 + ln.h + 0.12, ln.z);
    lamp.castShadow = true;
    root.add(lamp);
  }

  root.userData.biskTile = {
    id: "bisk",
    nameJa: "城下町ビスク",
    version: 1,
    altarTx: 0.5,
    altarTz: 0.46,
    gateGap,
  };

  return root;
}

/** @param {{ ix: number, iz: number }} slot */
export function moe3dBiskTileIndex(slot) {
  return { ix: slot.ix, iz: slot.iz };
}
