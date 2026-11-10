import * as THREE from "three";
import { moe3dEnsureMeshesBvh } from "./moe3dTerrainBvh.js";

/**
 * 3D フィールド歩行 — 地形レイキャスト（高さスナップ用）
 * 歩行ブロック／コライダーは一旦オフ。Blender 由来メッシュのコライダー統合時に再利用。
 */
export const MOE_TERRAIN_MAX_WALK_SLOPE_DEG = 55;

/** 1回の移動で登れる最大段差（≈ 勇者の身長） */
export const MOE_PLAYER_TERRAIN_MAX_CLIMB = 1.5;

/** 足元よりこれ以上高い地形が頭上にあるときは進入不可（山の横すり抜け防止） */
export const MOE_TERRAIN_OVERHEAD_BLOCK =
  MOE_PLAYER_TERRAIN_MAX_CLIMB + 0.35;

/** 歩行判定のサンプル間隔・体の半径 */
export const MOE_PLAYER_TERRAIN_BODY_RADIUS = 0.55;
export const MOE_TERRAIN_WALK_SAMPLE_STEP = 0.35;

const _rayOrigin = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
// 横の光線の高さ（足もとから）。登れる段差（1.5）より上だけを見る。
// 低い段差は 下向きの光線で「登れるか」を見るので、ここで止めない。
const _horizontalProbeHeights = [
  MOE_PLAYER_TERRAIN_MAX_CLIMB + 0.25,
  MOE_PLAYER_TERRAIN_MAX_CLIMB + 1.1,
];

/**
 * @param {THREE.Object3D} terrainGroup
 * @returns {THREE.Mesh[]}
 */
function terrainRaycastTargets(terrainGroup) {
  if (!terrainGroup) return [];
  const cached = terrainGroup.userData?.moeTerrainRaycastMeshes;
  if (cached) return cached;
  return moe3dRebuildTerrainRaycastCache(terrainGroup);
}

/** GLB 追加・予約タイル配置後に呼ぶ（キャッシュが古いと足元レイが空振りする） */
export function moe3dInvalidateTerrainRaycastCache(terrainGroup) {
  if (!terrainGroup?.userData) return;
  delete terrainGroup.userData.moeTerrainRaycastMeshes;
}

/**
 * @param {THREE.Object3D} terrainGroup
 * @returns {THREE.Mesh[]}
 */
export function moe3dRebuildTerrainRaycastCache(terrainGroup) {
  if (!terrainGroup) return [];
  const meshes = [];
  terrainGroup.traverse((obj) => {
    if (obj.isMesh) meshes.push(obj);
  });
  // 光線を速くする目次（BVH）。形ごとに1回だけ作られる
  moe3dEnsureMeshesBvh(meshes);
  terrainGroup.userData.moeTerrainRaycastMeshes = meshes;
  return meshes;
}

/**
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Object3D} terrainGroup
 */
function raycastTerrain(raycaster, terrainGroup) {
  const targets = terrainRaycastTargets(terrainGroup);
  if (!targets.length) return [];
  return raycaster.intersectObjects(targets, false);
}

/**
 * @param {THREE.Intersection} hit
 */
export function moe3dIsTerrainWallHit(hit) {
  if (hit.object?.userData?.moeWalkDecor) return false;
  if (hit.object?.userData?.moeTerrainCollider) return true;
  const ny = hit.normal?.y ?? 1;
  return ny < 0.45;
}

/**
 * @param {{ point: { y: number } }[]} hits
 */
export function moe3dTerrainHighestY(hits) {
  if (!hits?.length) return 0;
  let highest = hits[0].point.y;
  for (const hit of hits) {
    if (hit.point.y > highest) highest = hit.point.y;
  }
  return highest;
}

/**
 * レイキャスト命中のうち、現在地から登れる最高の地面を選ぶ
 * @param {{ point: { y: number } }[]} hits
 * @param {number | null} currentFootY
 * @param {number} maxClimb
 */
export function moe3dPickWalkableTerrainY(hits, currentFootY, maxClimb) {
  if (!hits?.length) return 0;
  if (currentFootY == null) return hits[0].point.y;

  const ceiling = currentFootY + maxClimb;
  let bestY = -Infinity;
  for (const hit of hits) {
    const y = hit.point.y;
    if (y <= ceiling + 1e-3 && y > bestY) bestY = y;
  }
  if (bestY > -Infinity) return bestY;
  return currentFootY;
}

/**
 * 室内 GLB 向け — 法線が上向きの面だけから足元を選ぶ（天井レイを除外）
 * @param {{ point: { y: number }, normal?: { y: number } }[]} hits
 * @param {number} [maxY]
 */
export function moe3dPickFloorTerrainY(hits, maxY = Infinity) {
  if (!hits?.length) return null;
  let bestY = -Infinity;
  for (const hit of hits) {
    const ny = hit.normal?.y ?? 0;
    if (ny < 0.45) continue;
    const y = hit.point.y;
    if (y > maxY + 1e-3) continue;
    if (y > bestY) bestY = y;
  }
  return bestY > -Infinity ? bestY : null;
}

/**
 * 転送直後向け — 上階床を避けて最も低い床面を選ぶ
 * @param {{ point: { y: number }, normal?: { y: number } }[]} hits
 * @param {number} [minY]
 * @param {number} [maxY]
 */
export function moe3dPickLowestFloorTerrainY(hits, minY = -Infinity, maxY = Infinity) {
  if (!hits?.length) return null;
  let bestY = Infinity;
  for (const hit of hits) {
    const ny = hit.normal?.y ?? 0;
    if (ny < 0.45) continue;
    const y = hit.point.y;
    if (y < minY - 1e-3 || y > maxY + 1e-3) continue;
    if (y < bestY) bestY = y;
  }
  return bestY < Infinity ? bestY : null;
}

/**
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Object3D} terrainGroup
 * @param {number} x
 * @param {number} z
 * @param {{ maxY?: number, minY?: number, preferLowest?: boolean }} [opts]
 */
export function moe3dTerrainFloorGroundY(
  raycaster,
  terrainGroup,
  x,
  z,
  opts = {}
) {
  const { maxY = Infinity, minY = -Infinity, preferLowest = false } = opts;
  const hits = terrainHits(raycaster, terrainGroup, x, z);
  if (preferLowest) {
    return moe3dPickLowestFloorTerrainY(hits, minY, maxY);
  }
  return moe3dPickFloorTerrainY(hits, maxY);
}

/**
 * @param {{ point: { y: number } }[]} hits
 * @param {number} walkFootY
 * @param {number} [overheadBlock]
 */
export function moe3dHasBlockingOverhead(
  hits,
  walkFootY,
  overheadBlock = MOE_TERRAIN_OVERHEAD_BLOCK
) {
  if (!hits?.length) return false;
  const minY = walkFootY + 0.12;
  const maxY = walkFootY + overheadBlock;
  for (const hit of hits) {
    const y = hit.point.y;
    if (y <= minY) continue;
    if (y > maxY) continue;
    const ny = hit.normal?.y ?? 0;
    if (ny >= 0.55) continue;
    return true;
  }
  return false;
}

/**
 * @param {{ point: { y: number } }[]} hits
 * @param {number | null} currentFootY
 * @param {number} [maxClimb]
 * @param {number} [overheadBlock]
 * @returns {{ blocked: boolean, walkY: number }}
 */
export function moe3dEvaluateStandPoint(
  hits,
  currentFootY,
  maxClimb = MOE_PLAYER_TERRAIN_MAX_CLIMB,
  overheadBlock = MOE_TERRAIN_OVERHEAD_BLOCK
) {
  const walkY = moe3dPickWalkableTerrainY(hits, currentFootY, maxClimb);
  if (moe3dHasBlockingOverhead(hits, walkY, overheadBlock)) {
    return { blocked: true, walkY };
  }
  if (
    currentFootY != null &&
    walkY - currentFootY > maxClimb + 0.05
  ) {
    return { blocked: true, walkY };
  }
  return { blocked: false, walkY };
}

/**
 * 建物の中（GLB の神殿など）向け — 上向きの床だけを見る。天井は見ない。
 * 登れる高さに床がない（穴・高すぎる床）なら止める。
 * @param {{ point: { y: number }, normal?: { y: number } }[]} hits
 * @param {number | null} currentFootY
 * @param {number} [maxClimb]
 * @returns {{ blocked: boolean, walkY: number }}
 */
export function moe3dEvaluateFloorStandPoint(
  hits,
  currentFootY,
  maxClimb = MOE_PLAYER_TERRAIN_MAX_CLIMB
) {
  const maxY = currentFootY == null ? Infinity : currentFootY + maxClimb;
  let bestY = -Infinity;
  for (const hit of hits ?? []) {
    if (moe3dHitFaceUpY(hit) < 0.45) continue;
    const y = hit.point.y;
    if (y > maxY + 1e-3) continue;
    if (y > bestY) bestY = y;
  }
  if (bestY === -Infinity) return { blocked: true, walkY: currentFootY ?? 0 };
  return { blocked: false, walkY: bestY };
}

const _faceNormal = new THREE.Vector3();

/**
 * 当たった面の「ほんとうの上向き度」（世界座標）。
 * three.js の hit.normal は 両面の材質だと 光線のほうへ ひっくり返るので、
 * 天井の下側も「床」に見えてしまう。face.normal を 世界の向きにして見る。
 * @param {{ normal?: { y: number }, face?: { normal: THREE.Vector3 }, object?: THREE.Object3D }} hit
 */
export function moe3dHitFaceUpY(hit) {
  if (hit?.face?.normal && hit.object?.matrixWorld) {
    return _faceNormal
      .copy(hit.face.normal)
      .transformDirection(hit.object.matrixWorld).y;
  }
  return hit?.normal?.y ?? 0;
}

/**
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Object3D} terrainGroup
 * @param {number} x
 * @param {number} z
 */
function terrainHits(raycaster, terrainGroup, x, z) {
  raycaster.set(new THREE.Vector3(x, 140, z), new THREE.Vector3(0, -1, 0));
  // 横の光線が near/far を短くしたままだと 足もとが見つからないので もどす
  raycaster.near = 0;
  raycaster.far = Infinity;
  const hits = raycastTerrain(raycaster, terrainGroup);
  // 横壁用の不可視コライダーは垂直レイから除外（足元の頭上判定に柱全体が乗ると歩行不能になる）
  return hits.filter((hit) => !hit.object?.userData?.moeTerrainCollider);
}

/**
 * 横方向レイ — 円柱の壁など垂直面を検出（上から落とすだけでは拾えない）
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Object3D} terrainGroup
 * @param {number} x0
 * @param {number} z0
 * @param {number} footY
 * @param {number} x1
 * @param {number} z1
 * @param {number} [bodyRadius]
 */
export function moe3dHorizontalTerrainBlocks(
  raycaster,
  terrainGroup,
  x0,
  z0,
  footY,
  x1,
  z1,
  bodyRadius = MOE_PLAYER_TERRAIN_BODY_RADIUS
) {
  const dx = x1 - x0;
  const dz = z1 - z0;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.02) return false;

  const nx = dx / dist;
  const nz = dz / dist;
  // うしろから体の半径ぶん はじめて、前の体の半径ぶんまで
  const far = dist + bodyRadius * 2;
  const prevNear = raycaster.near;
  const prevFar = raycaster.far;
  try {
    for (const h of _horizontalProbeHeights) {
      _rayOrigin.set(
        x0 - nx * bodyRadius,
        footY + h,
        z0 - nz * bodyRadius
      );
      _rayDir.set(nx, 0, nz);
      raycaster.set(_rayOrigin, _rayDir);
      raycaster.near = 0.02;
      raycaster.far = far;
      const hits = raycastTerrain(raycaster, terrainGroup);
      for (const hit of hits) {
        if (!moe3dIsTerrainWallHit(hit)) continue;
        if (hit.distance <= far) return true;
      }
    }
    return false;
  } finally {
    raycaster.near = prevNear;
    raycaster.far = prevFar;
  }
}

/**
 * @param {number} dx
 * @param {number} dz
 * @param {number} radius
 */
function bodySampleOffsets(dx, dz, radius) {
  const len = Math.hypot(dx, dz);
  if (len < 0.02) {
    return [
      { x: 0, z: 0 },
      { x: radius, z: 0 },
      { x: -radius, z: 0 },
      { x: 0, z: radius },
      { x: 0, z: -radius },
    ];
  }
  const px = (-dz / len) * radius;
  const pz = (dx / len) * radius;
  return [
    { x: 0, z: 0 },
    { x: px, z: pz },
    { x: -px, z: -pz },
  ];
}

/**
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Object3D} terrainGroup
 * @param {number} x
 * @param {number} z
 * @param {number | null} currentFootY
 * @param {{ maxClimb?: number, overheadBlock?: number, bodyRadius?: number }} [opts]
 * @returns {{ blocked: boolean, walkY: number }}
 */
function moe3dEvaluateStandAt(
  raycaster,
  terrainGroup,
  x,
  z,
  currentFootY,
  opts = {}
) {
  const {
    maxClimb = MOE_PLAYER_TERRAIN_MAX_CLIMB,
    overheadBlock = MOE_TERRAIN_OVERHEAD_BLOCK,
    floorOnly = false,
  } = opts;
  const hits = terrainHits(raycaster, terrainGroup, x, z);
  if (floorOnly) {
    return moe3dEvaluateFloorStandPoint(hits, currentFootY, maxClimb);
  }
  return moe3dEvaluateStandPoint(hits, currentFootY, maxClimb, overheadBlock);
}

/**
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Object3D} terrainGroup
 * @param {number} x
 * @param {number} z
 * @param {{ currentFootY?: number | null, maxClimb?: number }} [opts]
 */
export function moe3dWalkableGroundY(raycaster, terrainGroup, x, z, opts = {}) {
  const { currentFootY = null, maxClimb = MOE_PLAYER_TERRAIN_MAX_CLIMB } = opts;
  const hits = terrainHits(raycaster, terrainGroup, x, z);
  return moe3dPickWalkableTerrainY(hits, currentFootY, maxClimb);
}

/**
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Object3D} terrainGroup
 * @param {number} x0
 * @param {number} z0
 * @param {number} x1
 * @param {number} z1
 * @param {{ currentFootY?: number | null, maxClimb?: number, maxSlopeDeg?: number, bodyRadius?: number }} [opts]
 */
export function moe3dCanWalkTerrain(
  raycaster,
  terrainGroup,
  x0,
  z0,
  x1,
  z1,
  opts = {}
) {
  const {
    currentFootY = null,
    maxClimb = MOE_PLAYER_TERRAIN_MAX_CLIMB,
    maxSlopeDeg = MOE_TERRAIN_MAX_WALK_SLOPE_DEG,
    bodyRadius = MOE_PLAYER_TERRAIN_BODY_RADIUS,
  } = opts;
  const dist = Math.hypot(x1 - x0, z1 - z0);
  if (dist < 0.02) return true;

  const dx = x1 - x0;
  const dz = z1 - z0;
  const quickMove = dist < 0.85;
  const steps = quickMove
    ? 1
    : Math.max(1, Math.ceil(dist / MOE_TERRAIN_WALK_SAMPLE_STEP));
  const offsets = quickMove
    ? [{ x: 0, z: 0 }]
    : bodySampleOffsets(dx, dz, bodyRadius);

  let footY =
    currentFootY ??
    moe3dEvaluateStandAt(raycaster, terrainGroup, x0, z0, null, opts).walkY;
  let prevX = x0;
  let prevZ = z0;
  let prevFootY = footY;

  if (
    moe3dHorizontalTerrainBlocks(
      raycaster,
      terrainGroup,
      x0,
      z0,
      footY,
      x1,
      z1,
      bodyRadius
    )
  ) {
    return false;
  }

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + dx * t;
    const z = z0 + dz * t;

    if (
      moe3dHorizontalTerrainBlocks(
        raycaster,
        terrainGroup,
        prevX,
        prevZ,
        footY,
        x,
        z,
        bodyRadius
      )
    ) {
      return false;
    }

    for (const off of offsets) {
      const sample = moe3dEvaluateStandAt(
        raycaster,
        terrainGroup,
        x + off.x,
        z + off.z,
        footY,
        opts
      );
      if (sample.blocked) return false;
    }

    const center = moe3dEvaluateStandAt(
      raycaster,
      terrainGroup,
      x,
      z,
      footY,
      opts
    );
    if (center.blocked) return false;

    const stepDist = Math.hypot(x - prevX, z - prevZ) || dist / steps;
    const rise = center.walkY - prevFootY;
    if (rise > maxClimb + 0.05) return false;
    const slopeDeg = (Math.atan2(Math.abs(rise), stepDist) * 180) / Math.PI;
    if (slopeDeg > maxSlopeDeg) return false;

    prevX = x;
    prevZ = z;
    prevFootY = center.walkY;
    footY = center.walkY;
  }

  return true;
}

/**
 * プレイヤーの1コマの移動を、地形のかべ・高い段差で止める（かべに そって すべる）
 * - 足もとに地面がない所（マップのすきま）からは止めない（出られなくならないように）
 * - 1コマは みじかいので、坂の角度は見ない（段差の高さ maxClimb と かべだけ見る）
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Object3D} terrainGroup
 * @param {number} x0
 * @param {number} z0
 * @param {number} x1
 * @param {number} z1
 * @param {{ currentFootY?: number | null, maxClimb?: number, bodyRadius?: number, floorOnly?: boolean }} [opts]
 *   floorOnly: 建物の中（火山の神殿など）。上向きの床だけ見て、床がない所へは行かない
 * @returns {{ x: number, z: number, blocked: boolean }}
 */
export function moe3dResolveTerrainMove(
  raycaster,
  terrainGroup,
  x0,
  z0,
  x1,
  z1,
  opts = {}
) {
  const dist = Math.hypot(x1 - x0, z1 - z0);
  if (dist < 0.002 || !terrainGroup) return { x: x1, z: z1, blocked: false };
  if (!terrainHits(raycaster, terrainGroup, x0, z0).length) {
    return { x: x1, z: z1, blocked: false };
  }
  const walkOpts = { ...opts, maxSlopeDeg: 90 };
  const can = (ax, az) =>
    moe3dCanWalkTerrain(raycaster, terrainGroup, x0, z0, ax, az, walkOpts);
  if (can(x1, z1)) return { x: x1, z: z1, blocked: false };
  // かべに そって すべる: 大きく動いた向きを先に ためす
  const tryX = () => Math.abs(x1 - x0) > 0.001 && can(x1, z0);
  const tryZ = () => Math.abs(z1 - z0) > 0.001 && can(x0, z1);
  if (Math.abs(x1 - x0) >= Math.abs(z1 - z0)) {
    if (tryX()) return { x: x1, z: z0, blocked: true };
    if (tryZ()) return { x: x0, z: z1, blocked: true };
  } else {
    if (tryZ()) return { x: x0, z: z1, blocked: true };
    if (tryX()) return { x: x1, z: z0, blocked: true };
  }
  return { x: x0, z: z0, blocked: true };
}
