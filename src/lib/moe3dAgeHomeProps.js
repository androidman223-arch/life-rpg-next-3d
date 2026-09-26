import * as THREE from "three";
import { MOE_AGE_TILE_FLOOR_Y } from "@/lib/moe3dAgeHubHouse";
import { moe3dSlotSpawnWorld } from "@/lib/moe3dWorldLayout";
import {
  MOE_YUG_COAST_HOME_LOTS,
  MOE_YUG_COAST_SHOW_FIELD_HOMES,
  moe3dYugCoastHomeLotRotationY,
  moe3dYugCoastHomeLotTz,
} from "@/lib/moe3dYugCoastHomePath";

/**
 * 家AGE — プレイヤー宅（低ポリ · ワールド or タイルに載せる）
 * @param {{ bodyW?: number, bodyH?: number, bodyD?: number, wallColor?: number, roofColor?: number, doorColor?: number }} [opts]
 */
export function buildMoe3dAgeHomeCottage(opts = {}) {
  const bodyW = opts.bodyW ?? 3.4;
  const bodyH = opts.bodyH ?? 2.6;
  const bodyD = opts.bodyD ?? 3;
  const wallColor = opts.wallColor ?? 0xf5f5f4;
  const roofColor = opts.roofColor ?? 0xc2410c;
  const doorColor = opts.doorColor ?? 0x44403c;

  const g = new THREE.Group();
  g.name = "age-home-cottage";

  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.88 });
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.84 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.75 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyD), wallMat);
  body.position.y = bodyH / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW * 1.1, 0.42, bodyD * 1.12),
    roofMat
  );
  roof.position.y = bodyH + 0.2;
  roof.castShadow = true;
  g.add(roof);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW * 0.22, bodyH * 0.52, 0.12),
    new THREE.MeshStandardMaterial({ color: doorColor, roughness: 0.9 })
  );
  door.position.set(0, bodyH * 0.28, bodyD * 0.5 + 0.02);
  g.add(door);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 6, 5),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.55,
      roughness: 0.45,
    })
  );
  lamp.position.set(-bodyW * 0.55, bodyH * 0.55, bodyD * 0.35);
  g.add(lamp);

  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.06, 0.7, 5),
    trimMat
  );
  post.position.set(-bodyW * 0.55, 0.35, bodyD * 0.35);
  g.add(post);

  return g;
}

/**
 * 樹上の家（ミトヤ本家・枝住宅）
 * @param {{ main?: boolean, bodyW?: number, bodyH?: number }} [opts]
 */
export function buildMoe3dAgeTreeHouse(opts = {}) {
  const main = opts.main ?? false;
  const bodyW = opts.bodyW ?? (main ? 5.5 : 3.2);
  const bodyH = opts.bodyH ?? (main ? 3.4 : 2.4);
  const bodyD = opts.bodyD ?? (main ? 4.8 : 2.8);

  const g = buildMoe3dAgeHomeCottage({
    bodyW,
    bodyH,
    bodyD,
    wallColor: main ? 0xfff7ed : 0xf5f5f4,
    roofColor: main ? 0x9a3412 : 0x65a30d,
    doorColor: 0x292524,
  });
  g.name = main ? "age-tree-house-main" : "age-tree-house";

  const deck = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyW * 0.72, bodyW * 0.78, 0.22, 10),
    new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.86 })
  );
  deck.position.y = -0.08;
  deck.receiveShadow = true;
  g.add(deck);

  if (main) {
    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW * 0.55, 0.5, 0.08),
      new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        emissive: 0xfbbf24,
        emissiveIntensity: 0.2,
        roughness: 0.7,
      })
    );
    banner.position.set(0, bodyH + 0.55, bodyD * 0.52);
    g.add(banner);
  }

  return g;
}

/**
 * ユグ海岸 — 道に沿った家AGE番地（ワールド座標）
 * @param {number} tileW
 * @param {number} tileD
 */
export function moe3dYugAgeHomeRowSpecs(tileW, tileD) {
  if (!tileW || !tileD) return [];

  return MOE_YUG_COAST_HOME_LOTS.map((lot) => {
    const pos = moe3dSlotSpawnWorld(
      "yug_coast",
      tileW,
      tileD,
      lot.tx,
      moe3dYugCoastHomeLotTz(lot)
    );
    if (!pos) return null;
    return {
      x: pos.x,
      y: pos.y,
      rotationY: moe3dYugCoastHomeLotRotationY(lot),
      label: lot.label,
      sub: lot.sub,
      roofColor: lot.roofColor,
      wallColor: lot.wallColor,
      bodyScale: lot.bodyScale ?? 1,
    };
  }).filter(Boolean);
}

/** @param {number} floorY */
export function moe3dPlaceYugAgeHomeRow(scene, tileW, tileD, floorY = MOE_AGE_TILE_FLOOR_Y) {
  if (!MOE_YUG_COAST_SHOW_FIELD_HOMES) return [];
  const specs = moe3dYugAgeHomeRowSpecs(tileW, tileD);
  const groups = [];
  for (const spec of specs) {
    const scale = spec.bodyScale ?? 1;
    const cottage = buildMoe3dAgeHomeCottage({
      wallColor: spec.wallColor ?? 0xfafaf9,
      roofColor: spec.roofColor,
      bodyW: 3.6 * scale,
      bodyH: 2.8 * scale,
      bodyD: 3.1 * scale,
    });
    cottage.position.set(spec.x, floorY, spec.y);
    cottage.rotation.y = spec.rotationY ?? 0;
    scene.add(cottage);
    groups.push({ group: cottage, label: spec.label, sub: spec.sub });
  }
  return groups;
}
