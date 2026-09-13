"use client";

import { useEffect, useRef } from "react";
import { MOE_DRAGON_LINEUP } from "@/data/moeDragonVariants";
import { MOE_MONSTER_LINEUP } from "@/data/moeMonsterLineup";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  applyModelTint,
  applyMysteryDragonVisualForm,
  applyEarthWormStripeMaterial,
  updateEarthWormStripeUniforms,
  enemyUsesStripeMaterial,
  createBisonAnimController,
  createOrcAnimController,
  createGustavAnimController,
  createSnakeAnimController,
  fitModelToGround,
  MOE_3D_LEGACY_REF_HALF,
  MOE_3D_LEGACY_TILES_X,
  MOE_3D_LEGACY_TILES_Z,
  moe3dLayoutTileD,
  moe3dLayoutTileW,
  MOE_ALL_MONSTER_MODEL_URLS,
  MOE_HILLTOP_LION_MODEL_LAYOUT_REV,
  bisonModelHeightForKey,
  enemyFitHeightForKey,
  enemyUsesBakedModelColors,
  isBisonModelUrl,
  isOrcModelUrl,
  isIxionModelUrl,
  isLionModelUrl,
  isGustavModelUrl,
  moe3dApplyIxionDisplayScale,
  moe3dApplyLionDisplayScale,
  moe3dApplyGustavDisplayScale,
  moe3dMountainBisonSpawnPosition,
  moe3dRoughBisonSpawnPosition,
  moe3dGustavJuniorSpawnPosition,
  moe3dGustavFacePlayerStartYaw,
  moe3dEnemyModelYawOffset,
  moe3dYawFaceTarget,
  MOE_GUSTAV_JUNIOR_LAYOUT_REV,
  MOE_ENEMY_TINT_BY_KEY,
  MOE_MONSTER_MODEL_YAW_OFFSET,
  MOE_PET_MODEL_YAW_OFFSET,
  MOE_SNAKE_ATTACK_TIME_SCALE,
  MOE_PLAYER_RUN_BOB_CYCLE_SEC,
  MOE_PLAYER_WALK_BOB_CYCLE_SEC,
  MOE_SNAKE_RUN_CLIP_DURATION_SEC,
  MOE_SNAKE_WALK_CLIP_DURATION_SEC,
  MOE_SNAKE_RUN_SPRINT_TIME_SCALE,
  MOE_TENTH_BANNER_DURATION_SEC_3D,
  MOE_MONSTER_MODEL_HEIGHT,
  MOE_PLAYER_MODEL_HEIGHT,
  MOE_PLAYER_MODEL_URL,
  MOE_PET_MODEL_HEIGHT,
  MOE_PET_TINT_DEFAULT,
  MONSTER_MODEL_URL,
  monsterModelUrlForKey,
  petFloatLiftForId,
  petModelHeightForId,
  petModelUrlForId,
  petTintForId,
  pickSnakeAttackClip,
  moe3dEnemyDisplayScale,
  moe3dApplyOrcDisplayScale,
  moe3dApplyBisonBossDisplayScale,
  MOE_ORC_MODEL_LAYOUT_REV,
  MOE_BISON_BOSS_LAYOUT_REV,
  MOE_MID_BOSS_DISPLAY_SCALE,
  MOE_SUPER_BOSS_DISPLAY_SCALE,
  MOE_EARTH_WORM_MATERIAL_REV,
  MOE_IXION_MODEL_LAYOUT_REV,
  moe3dBossAreaLayout,
  moe3dPetHousePosition,
  moe3dRhodaPosition,
  moe3dDragonShowcaseLayout,
  moe3dDragonShowcaseCenter,
  moe3dMonsterShowcaseLayout,
  moe3dMonsterShowcaseCenter,
  moe3dMonsterShowcaseTargetHeight,
  moe3dMeasureModelFrontExtent,
  moe3dEnemyUiWorldYs,
  MOE_3D_ENEMY_UI_NAME_TARGET_EXTRA,
  MOE_3D_ENEMY_UI_MARKER_TARGET_EXTRA,
  MOE_3D_ENEMY_UI_HP_WORLD_OFFSET_X,
  MOE_3D_ENEMY_UI_HP_CANVAS_SHIFT_X,
} from "@/lib/moeField3DModels";
import { createMoePhoenixTailFireEffect } from "@/lib/moePhoenixTailFireEffect";
import {
  checkMoeEnemyPlayerDetection,
  moeEnemyUsesHearingSearch,
  moeEnemyUsesVisionSearch,
  resolveMoeEnemyDetection,
  sampleMoeEnemyHearingCirclePoints,
  sampleMoeEnemyVisionArcPoints,
} from "@/lib/moeEnemyDetection";
import {
  isMoeKakureminoActive,
  MOE_KAKUREMINO_PLAYER_OPACITY,
} from "@/lib/moePlayerStealth";
import {
  moe3dDesertPreviewTileIndex,
  MOE_3D_DESERT_SHOWCASE_FAMILIES,
  moe3dDesertMonsterShowcaseSpot,
} from "@/lib/moe3dDesertPreviewTile";
import {
  MOE_3D_IPS_CANYON_SHOWCASE_FAMILIES,
  moe3dIpsCanyonMonsterShowcaseSpot,
} from "@/lib/moe3dIpsCanyonTile";
import { addMoe3dMacro2L1Tiles } from "@/lib/moe3dMacro2L1Tiles";
import { updateMoe3dMacro2L4Fx } from "@/lib/moe3dMacro2L4Fx";
import { updateMoe3dMacro3L4Fx } from "@/lib/moe3dMacro3L4Fx";
import {
  moe3dApplyMapTileScale,
  moe3dTileLocalOrigin,
  moe3dTileLocalSize,
  moe3dMapSlotById,
  moe3dPrototypeFieldStart,
  moe3dReservedMapSlots,
  moe3dTerrainGroupOffset,
} from "@/lib/moe3dWorldLayout";
import { addMoe3dReservedMapTiles } from "@/lib/moe3dReservedMapTile";
import { buildMoe3dBiskTile } from "@/lib/moe3dBiskTile";
import { buildMoe3dLegacyBufferTile } from "@/lib/moe3dLegacyBufferTile";
import { buildMoe3dAltarVisual } from "@/lib/moe3dAltarVisual";
import { MOE_ALTARS } from "@/data/moeAltarWarps";
import { moe3dAltarWorldPos } from "@/lib/moe3dAltarWarp";
import {
  moe3dIsMapSlotFieldEnemy,
  moeEnemyFieldIdleFacingYaw,
} from "@/lib/moe3dMonsterMapSpawns";
import {
  MOE_MEERIM_MOUNTAIN_BISON_KEY,
  MOE_MEERIM_ROUGH_BISON_KEY,
  MOE_MEERIM_GUSTAV_JUNIOR_KEY,
  formatEnemyLevelUi,
} from "@/data/moeMeerimEnemies";
import { MOE_PET_TENTH_LEVEL_UP_LABEL } from "@/data/moePetExpTable";
import { moe3dWalkableGroundY } from "@/lib/moe3dMacro3Walk";

const MAP_URL = "/assets/map/3D_MoeMapField02.glb";
const TERRAIN_EDGE_MARGIN = 5;
const PLAYER_HEIGHT = 0.8;
const CAM_DISTANCE = 17;
const CAM_PITCH = 0.55;
const MOUSE_SENS = 0.004;
const PITCH_MIN = 0.12;
const PITCH_MAX = 1.35;
const DIST_MIN = 5;
const DIST_MAX = 40;

function enableShadows(root) {
  root.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
}

function disposeObject3D(root) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.geometry?.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => m?.dispose());
  });
}

function cameraOffsetFromOrbit(yaw, pitch, distance) {
  const cosPitch = Math.cos(pitch);
  return new THREE.Vector3(
    distance * cosPitch * Math.sin(yaw),
    distance * Math.sin(pitch),
    distance * cosPitch * Math.cos(yaw)
  );
}

function groundY(raycaster, terrainGroup, x, z) {
  raycaster.set(new THREE.Vector3(x, 80, z), new THREE.Vector3(0, -1, 0));
  const hits = raycaster.intersectObject(terrainGroup, true);
  return hits.length > 0 ? hits[0].point.y : 0;
}

function isOverTerrain(raycaster, terrainGroup, x, z) {
  raycaster.set(new THREE.Vector3(x, 80, z), new THREE.Vector3(0, -1, 0));
  return raycaster.intersectObject(terrainGroup, true).length > 0;
}

/** 指定座標の近くで地形上の点を探す（原点へ吸い込まれないよう周囲を探索） */
function snapToNearestTerrain(raycaster, terrainGroup, x, z, maxR = 80) {
  if (isOverTerrain(raycaster, terrainGroup, x, z)) return { x, z };
  for (let r = 4; r <= maxR; r += 4) {
    const steps = Math.max(8, Math.ceil(r / 3));
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const tx = x + Math.cos(a) * r;
      const tz = z + Math.sin(a) * r;
      if (isOverTerrain(raycaster, terrainGroup, tx, tz)) {
        return { x: tx, z: tz };
      }
    }
  }
  return { x, z };
}

/** ボスエリアの2スロットを地形上にスナップ（近すぎる場合は意図方向へ離す） */
function resolveBossAreaOnTerrain(
  raycaster,
  terrainGroup,
  halfW,
  halfD,
  tileW,
  tileD,
  fieldStart
) {
  const layout = moe3dBossAreaLayout(
    halfW,
    halfD,
    tileW,
    tileD,
    fieldStart
  );
  const snapBoss = (pos, maxR = 20) => {
    const s = snapToNearestTerrain(raycaster, terrainGroup, pos.x, pos.y, maxR);
    return { x: s.x, y: s.z };
  };
  const midBossPos = snapBoss(layout.midBossPos);
  let superBossPos = snapBoss(layout.superBossPos);

  const intentDx = layout.superBossPos.x - layout.midBossPos.x;
  const intentDy = layout.superBossPos.y - layout.midBossPos.y;
  const intentLen = Math.hypot(intentDx, intentDy) || 1;
  const minSep = Math.max(14, intentLen * 0.85);
  const sepDx = superBossPos.x - midBossPos.x;
  const sepDy = superBossPos.y - midBossPos.y;
  if (Math.hypot(sepDx, sepDy) < minSep) {
    superBossPos = {
      x: midBossPos.x + (intentDx / intentLen) * minSep,
      y: midBossPos.y + (intentDy / intentLen) * minSep,
    };
    if (!isOverTerrain(raycaster, terrainGroup, superBossPos.x, superBossPos.y)) {
      superBossPos = snapBoss(
        { x: superBossPos.x, y: superBossPos.y },
        32
      );
    }
  }

  return {
    midBossPos,
    superBossPos,
    mountainBisonPos: snapBoss(
      moe3dMountainBisonSpawnPosition(
        halfW,
        halfD,
        tileW,
        tileD,
        fieldStart
      ),
      28
    ),
    roughBisonPos: snapBoss(
      moe3dRoughBisonSpawnPosition(halfW, halfD, tileW, tileD, fieldStart),
      28
    ),
    gustavJuniorPos: snapBoss(
      moe3dGustavJuniorSpawnPosition(halfW, halfD, fieldStart),
      64
    ),
    bossArea: layout,
  };
}

function meshBoundsExcludingPick(root) {
  const box = new THREE.Box3();
  let hasMesh = false;
  root.traverse((obj) => {
    if (obj.userData?.pickProxy || !obj.isMesh || !obj.geometry) return;
    box.expandByObject(obj);
    hasMesh = true;
  });
  if (!hasMesh) {
    box.setFromObject(root);
  }
  return box;
}

function attachEnemyPickTarget(root, enemyId, isBigBoss, isSuperBoss = false) {
  root.userData.enemyId = enemyId;
  root.traverse((obj) => {
    if (obj.isMesh && !obj.userData.pickProxy) obj.userData.enemyId = enemyId;
  });
  root.updateMatrixWorld(true);
  const box = meshBoundsExcludingPick(root);
  const size = box.getSize(new THREE.Vector3());
  const h = Math.max(
    size.y * 0.92,
    isSuperBoss ? 5 : isBigBoss ? 2.8 : 0.85
  );
  const r =
    Math.max(size.x, size.z) * (isBigBoss || isSuperBoss ? 0.42 : 0.52);
  const pick = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r * 0.92, h, 12),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  pick.position.y = box.min.y + h * 0.5;
  pick.userData.enemyId = enemyId;
  pick.userData.pickProxy = true;
  if (isBigBoss || isSuperBoss) pick.userData.bossPick = true;
  root.add(pick);
}

function attachPetPickTarget(root) {
  root.userData.isPet = true;
  root.traverse((obj) => {
    if (obj.isMesh) obj.userData.isPet = true;
  });
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const h = Math.max(size.y, 1.1);
  const r = Math.max(size.x, size.z, 0.55) * 0.72;
  const pick = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r * 0.92, h, 12),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  pick.position.y = h * 0.48;
  pick.userData.isPet = true;
  pick.userData.pickProxy = true;
  root.add(pick);
}

function attachPlayerPickTarget(root) {
  root.userData.isPlayer = true;
  root.traverse((obj) => {
    if (obj.isMesh) obj.userData.isPlayer = true;
  });
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const h = Math.max(size.y, 1.2);
  const r = Math.max(size.x, size.z, 0.5) * 0.68;
  const pick = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r * 0.92, h, 12),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  pick.position.y = h * 0.48;
  pick.userData.isPlayer = true;
  pick.userData.pickProxy = true;
  root.add(pick);
}

function createTreasureChestGroup(treasureId) {
  const root = new THREE.Group();
  root.userData.treasureId = treasureId;
  root.scale.setScalar(1.32);

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x6b4423,
    roughness: 0.82,
    metalness: 0.05,
  });
  const woodDarkMat = new THREE.MeshStandardMaterial({
    color: 0x4a2f18,
    roughness: 0.88,
    metalness: 0.04,
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xdabc76,
    roughness: 0.42,
    metalness: 0.48,
  });
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.55,
    metalness: 0.35,
  });
  const rubyMat = new THREE.MeshStandardMaterial({
    color: 0xe0115f,
    emissive: 0x9b111e,
    emissiveIntensity: 0.42,
    roughness: 0.12,
    metalness: 0.22,
  });
  const rubyDarkMat = new THREE.MeshStandardMaterial({
    color: 0x8b0a1a,
    emissive: 0x4a0510,
    emissiveIntensity: 0.28,
    roughness: 0.2,
    metalness: 0.18,
  });

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.46, 0.68), woodMat);
  base.position.y = 0.23;
  base.castShadow = true;
  base.receiveShadow = true;
  root.add(base);

  const baseTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.96, 0.06, 0.72),
    goldTrimMat
  );
  baseTrim.position.y = 0.44;
  root.add(baseTrim);

  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.18, 0.72), woodDarkMat);
  lid.name = "treasureLid";
  lid.position.set(0, 0.56, -0.04);
  lid.castShadow = true;
  root.add(lid);

  const lidTrim = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.05, 0.74),
    goldTrimMat
  );
  lidTrim.position.set(0, 0.66, -0.04);
  root.add(lidTrim);

  const hasp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.05), ironMat);
  hasp.position.set(0, 0.48, 0.36);
  root.add(hasp);

  const lockPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.1, 0.03),
    goldTrimMat
  );
  lockPlate.position.set(0, 0.47, 0.38);
  root.add(lockPlate);

  /** 正面中央のルビーマーク（MOE 風） */
  const rubySetting = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.15, 0.025),
    goldTrimMat
  );
  rubySetting.position.set(0, 0.3, 0.345);
  root.add(rubySetting);

  const rubyGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.062, 0), rubyMat);
  rubyGem.position.set(0, 0.3, 0.362);
  rubyGem.rotation.y = Math.PI / 4;
  rubyGem.rotation.x = 0.12;
  rubyGem.scale.set(1, 1.22, 0.62);
  rubyGem.castShadow = true;
  root.add(rubyGem);

  const rubyFacet = new THREE.Mesh(new THREE.OctahedronGeometry(0.038, 0), rubyDarkMat);
  rubyFacet.position.set(0.018, 0.312, 0.368);
  rubyFacet.rotation.y = Math.PI / 4;
  rubyFacet.rotation.z = 0.35;
  rubyFacet.scale.set(0.55, 0.85, 0.35);
  root.add(rubyFacet);

  const pick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.78, 0.78, 1.0, 12),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  pick.position.y = 0.48;
  pick.userData.treasureId = treasureId;
  pick.userData.pickProxy = true;
  root.add(pick);

  return { root, spawnTime: performance.now() };
}

const PICK_SCREEN_MAX_PX = 44;
const PICK_PROXY_PENALTY_PX = 14;
const PICK_BOSS_SCREEN_MAX_PX = 72;

/** レイキャスト全ヒットから、クリック位置に最も近い交点の敵／ペットを選ぶ */
function resolvePickFromHits(hits, pointer, camera, rect, treasures = []) {
  const closedTreasureIds = new Set(
    treasures.filter((t) => t.state === "closed").map((t) => t.id)
  );
  const cx = ((pointer.x + 1) / 2) * rect.width;
  const cy = ((-pointer.y + 1) / 2) * rect.height;
  const projected = new THREE.Vector3();

  let bestEnemyId = null;
  let bestEnemyScore = Infinity;
  let bestTreasureId = null;
  let bestTreasureScore = Infinity;
  let bestPet = false;
  let bestPetScore = Infinity;
  let bestPlayer = false;
  let bestPlayerScore = Infinity;

  for (const hit of hits) {
    let obj = hit.object;
    let enemyId = null;
    let treasureId = null;
    let isPet = false;
    let isPlayer = false;
    while (obj) {
      if (obj.userData.enemyId != null) {
        enemyId = obj.userData.enemyId;
        break;
      }
      if (obj.userData.treasureId != null) {
        treasureId = obj.userData.treasureId;
        break;
      }
      if (obj.userData.isPet) {
        isPet = true;
        break;
      }
      if (obj.userData.isPlayer) {
        isPlayer = true;
        break;
      }
      obj = obj.parent;
    }
    if (enemyId == null && treasureId == null && !isPet && !isPlayer) {
      continue;
    }
    if (treasureId != null && !closedTreasureIds.has(treasureId)) continue;

    projected.copy(hit.point).project(camera);
    if (projected.z > 1) continue;
    const sx = (projected.x * 0.5 + 0.5) * rect.width;
    const sy = (-projected.y * 0.5 + 0.5) * rect.height;
    const screenDist = Math.hypot(sx - cx, sy - cy);
    const proxyPenalty = hit.object.userData.bossPick
      ? 0
      : hit.object.userData.pickProxy
        ? PICK_PROXY_PENALTY_PX
        : 0;
    const maxPx = hit.object.userData.bossPick
      ? PICK_BOSS_SCREEN_MAX_PX
      : PICK_SCREEN_MAX_PX;
    const score = screenDist + proxyPenalty;
    if (score > maxPx) continue;

    if (enemyId != null && score < bestEnemyScore) {
      bestEnemyScore = score;
      bestEnemyId = enemyId;
    }
    if (treasureId != null && score < bestTreasureScore) {
      bestTreasureScore = score;
      bestTreasureId = treasureId;
    }
    if (isPet && score < bestPetScore) {
      bestPetScore = score;
      bestPet = true;
    }
    if (isPlayer && score < bestPlayerScore) {
      bestPlayerScore = score;
      bestPlayer = true;
    }
  }

  /** 画面距離が最も近い対象を優先 */
  const candidates = [];
  if (bestEnemyId != null) {
    candidates.push({ type: "enemy", id: bestEnemyId, score: bestEnemyScore });
  }
  if (bestTreasureId != null) {
    candidates.push({ type: "treasure", id: bestTreasureId, score: bestTreasureScore });
  }
  if (bestPet) {
    candidates.push({ type: "pet", score: bestPetScore });
  }
  if (bestPlayer) {
    candidates.push({ type: "player", score: bestPlayerScore });
  }
  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];
  if (!best) return null;
  if (best.type === "enemy") return { type: "enemy", id: best.id };
  if (best.type === "treasure") return { type: "treasure", id: best.id };
  if (best.type === "player") return { type: "player" };
  return { type: "pet" };
}

/** 中・超ボス：同期済みアンカー＋モデル bbox から画面楕円ヒット判定 */
function bossScreenHitScore(cx, cy, camera, rect, en, entry) {
  if (!entry?.pickAnchor) return null;
  const { x, groundY, z } = entry.pickAnchor;
  let footY = groundY;
  let bodyY = groundY;
  let heightWorld = 4;
  let widthWorld = 3;

  if (entry.root && !entry.placeholder) {
    entry.root.updateMatrixWorld(true);
    const box = new THREE.Box3();
    entry.root.traverse((obj) => {
      if (obj.userData?.pickProxy || !obj.isMesh || !obj.geometry) return;
      box.expandByObject(obj);
    });
    if (!box.isEmpty()) {
      const size = box.getSize(new THREE.Vector3());
      footY = box.min.y;
      bodyY = (box.min.y + box.max.y) * 0.5;
      heightWorld = Math.max(size.y, 2);
      widthWorld = Math.max(size.x, size.z, 2);
    }
  } else {
    const scale = moe3dEnemyDisplayScale(en);
    const modelH = bisonModelHeightForKey(en.key) * scale;
    footY = groundY;
    bodyY = groundY + modelH * 0.45;
    heightWorld = modelH;
    widthWorld = modelH * (en.superBoss ? 0.95 : 0.82);
  }

  const foot = new THREE.Vector3(x, footY, z);
  const body = new THREE.Vector3(x, bodyY, z);
  foot.project(camera);
  body.project(camera);
  if (foot.z > 1 && body.z > 1) return null;

  const fx = (foot.x * 0.5 + 0.5) * rect.width;
  const fy = (-foot.y * 0.5 + 0.5) * rect.height;
  const bx = (body.x * 0.5 + 0.5) * rect.width;
  const by = (-body.y * 0.5 + 0.5) * rect.height;
  const heightPx = Math.max(36, Math.abs(by - fy));
  const widthPx = Math.max(heightPx * 0.82, (widthWorld / heightWorld) * heightPx * 0.55);
  const mx = (fx + bx) * 0.5;
  const my = (fy + by) * 0.5;
  const pad = en.superBoss ? 32 : 22;
  const rx = widthPx * 0.5 + pad;
  const ry = heightPx * 0.5 + pad;
  const dx = (cx - mx) / rx;
  const dy = (cy - my) / ry;
  if (dx * dx + dy * dy > 1) return null;
  return Math.hypot(cx - mx, cy - my);
}

function pickBossAtScreenPoint(cx, cy, camera, rect, enList, enemyMeshes) {
  const candidates = [];

  for (const en of enList) {
    if (en.hp <= 0 || (!en.midBoss && !en.superBoss)) continue;
    const entry = enemyMeshes.get(en.id);
    if (!entry) continue;
    const score = bossScreenHitScore(cx, cy, camera, rect, en, entry);
    if (score == null) continue;
    candidates.push({ id: en.id, score, superBoss: !!en.superBoss });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    if (Math.abs(a.score - b.score) > 4) return a.score - b.score;
    if (a.superBoss !== b.superBoss) return a.superBoss ? 1 : -1;
    return a.score - b.score;
  });
  return candidates[0].id;
}

/** レイキャスト完全外れ時のみ：クリック位置に最も近い敵／ペット（画面 px） */
function pickEntityNearPointer(
  pointer,
  camera,
  rect,
  enList,
  petPos,
  playerPos,
  enemyMeshes,
  thresholdPx = 32
) {
  const cx = ((pointer.x + 1) / 2) * rect.width;
  const cy = ((-pointer.y + 1) / 2) * rect.height;
  const projected = new THREE.Vector3();
  let best = null;
  let bestDist = thresholdPx;

  for (const en of enList) {
    if (en.hp <= 0) continue;
    const entry = enemyMeshes?.get(en.id);
    let py = 0.6;
    let thresh = thresholdPx;
    if (en.midBoss || en.superBoss) {
      thresh = en.superBoss ? 58 : 46;
      if (entry?.root && !entry.placeholder) {
        entry.root.updateMatrixWorld(true);
        const box = new THREE.Box3();
        entry.root.traverse((obj) => {
          if (obj.userData?.pickProxy || !obj.isMesh || !obj.geometry) return;
          box.expandByObject(obj);
        });
        if (!box.isEmpty()) {
          py = (box.min.y + box.max.y) * 0.5;
        } else if (entry.pickAnchor) {
          py = entry.pickAnchor.groundY + (en.superBoss ? 8 : 3);
        }
      } else if (entry?.pickAnchor) {
        py = entry.pickAnchor.groundY + (en.superBoss ? 8 : 3);
      } else {
        py = en.superBoss ? 8 : 3;
      }
    }
    projected.set(en.x, py, en.y);
    projected.project(camera);
    if (projected.z > 1) continue;
    const sx = (projected.x * 0.5 + 0.5) * rect.width;
    const sy = (-projected.y * 0.5 + 0.5) * rect.height;
    const d = Math.hypot(sx - cx, sy - cy);
    if (d < thresh && d < bestDist) {
      bestDist = d;
      best = { type: "enemy", id: en.id };
    }
  }

  if (petPos) {
    projected.set(petPos.x, 0.6, petPos.y);
    projected.project(camera);
    if (projected.z <= 1) {
      const sx = (projected.x * 0.5 + 0.5) * rect.width;
      const sy = (-projected.y * 0.5 + 0.5) * rect.height;
      const d = Math.hypot(sx - cx, sy - cy);
      if (d < bestDist) {
        bestDist = d;
        best = { type: "pet" };
      }
    }
  }

  if (playerPos) {
    projected.set(playerPos.x, 0.75, playerPos.y);
    projected.project(camera);
    if (projected.z <= 1) {
      const sx = (projected.x * 0.5 + 0.5) * rect.width;
      const sy = (-projected.y * 0.5 + 0.5) * rect.height;
      const d = Math.hypot(sx - cx, sy - cy);
      if (d < bestDist) {
        bestDist = d;
        best = { type: "player" };
      }
    }
  }

  return best;
}

function terrainPlayBoundsFromGroup(terrainGroup) {
  const box = new THREE.Box3().setFromObject(terrainGroup);
  const m = TERRAIN_EDGE_MARGIN;
  const halfW = Math.max(8, (box.max.x - box.min.x) / 2 - m);
  const halfD = Math.max(8, (box.max.z - box.min.z) / 2 - m);
  return {
    minX: box.min.x + m,
    maxX: box.max.x - m,
    minZ: box.min.z + m,
    maxZ: box.max.z - m,
    halfW,
    halfD,
    centerX: (box.min.x + box.max.x) / 2,
    centerZ: (box.min.z + box.max.z) / 2,
  };
}

/**
 * 3D 表示専用。座標は MoeFieldMap の player.x / player.y（= Three.js の x / z）と同期。
 */
export default function MoeField3DCanvas({
  enemies,
  treasures = [],
  battlePopups,
  onEnemyClick,
  onTreasureClick,
  onPetClick,
  onPlayerClick,
  onPetDoubleClick = () => {},
  onRhodaClick,
  onAltarClick,
  targetEnemyId,
  enemyStatSearchOpen = false,
  targetEnemyFacingYawRef,
  enemyChaseRuntimeRef,
  enemyFieldSyncRef,
  enemyDetectionOptsRef,
  playerKakureminoUntilRef,
  petFocused,
  petLabel,
  petId = "sun_spirit",
  petDragonVisualForm = 0,
  onMapReady,
  cameraYawRef,
  playerFacingRef,
  playerPosRef,
  playerJumpRef,
  playerSprintRef,
  petRunAnimRef,
  petPosRef,
  petSpawnEpochRef,
  petCommandRef,
  petHoldYawRef,
  duelRef,
  duelCombatSessionRef,
  petStrikeUntilRef,
  petAttackMsRef,
  enemyStrikeUntilRef,
  enemyAttackMsRef,
  battleSpeedMultRef,
  overlayProjectRef,
  enemyStrikeVariantRef,
  moe3dCombatExtentsRef,
  hiddenShowcaseIds = { monsters: [], dragons: [] },
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    enemies,
    treasures,
    battlePopups,
    targetEnemyId,
    enemyStatSearchOpen,
    petFocused,
    petLabel,
  });
  const onEnemyClickRef = useRef(onEnemyClick);
  const onTreasureClickRef = useRef(onTreasureClick);
  const onPetClickRef = useRef(onPetClick);
  const onPlayerClickRef = useRef(onPlayerClick);
  const onPetDoubleClickRef = useRef(onPetDoubleClick);
  /** @deprecated 旧名 — ホットリロード互換 */
  const onPetRightClickRef = onPetDoubleClickRef;
  const onRhodaClickRef = useRef(onRhodaClick);
  const onAltarClickRef = useRef(onAltarClick);
  const onMapReadyRef = useRef(onMapReady);
  const cameraYawRefStable = useRef(cameraYawRef);
  const playerFacingRefStable = useRef(playerFacingRef);
  const playerPosRefStable = useRef(playerPosRef);
  const playerJumpRefStable = useRef(playerJumpRef);
  const playerSprintRefStable = useRef(playerSprintRef);
  const petRunAnimRefStable = useRef(petRunAnimRef);
  const petPosRefStable = useRef(petPosRef);
  const petSpawnEpochRefStable = useRef(petSpawnEpochRef);
  const petCommandRefStable = useRef(petCommandRef);
  const petHoldYawRefStable = useRef(petHoldYawRef);
  const duelRefStable = useRef(duelRef);
  const duelCombatSessionRefStable = useRef(duelCombatSessionRef);
  const petStrikeUntilRefStable = useRef(petStrikeUntilRef);
  const petAttackMsRefStable = useRef(petAttackMsRef);
  const enemyStrikeUntilRefStable = useRef(enemyStrikeUntilRef);
  const enemyAttackMsRefStable = useRef(enemyAttackMsRef);
  const battleSpeedMultRefStable = useRef(battleSpeedMultRef);
  const overlayProjectRefStable = useRef(overlayProjectRef);
  const enemyStrikeVariantRefStable = useRef(enemyStrikeVariantRef);
  const moe3dCombatExtentsRefStable = useRef(moe3dCombatExtentsRef);
  const targetEnemyFacingYawRefStable = useRef(targetEnemyFacingYawRef);
  const enemyChaseRuntimeRefStable = useRef(enemyChaseRuntimeRef);
  const enemyFieldSyncRefStable = useRef(enemyFieldSyncRef);
  const enemyDetectionOptsRefStable = useRef(enemyDetectionOptsRef);
  const playerKakureminoUntilRefStable = useRef(playerKakureminoUntilRef);

  stateRef.current = {
    enemies,
    treasures,
    battlePopups,
    targetEnemyId,
    enemyStatSearchOpen,
    petFocused,
    petLabel,
  };
  onEnemyClickRef.current = onEnemyClick;
  onTreasureClickRef.current = onTreasureClick;
  onPetClickRef.current = onPetClick;
  onPlayerClickRef.current = onPlayerClick;
  onPetDoubleClickRef.current = onPetDoubleClick;
  onPetRightClickRef.current = onPetDoubleClick;
  onRhodaClickRef.current = onRhodaClick;
  onAltarClickRef.current = onAltarClick;
  onMapReadyRef.current = onMapReady;
  cameraYawRefStable.current = cameraYawRef;
  playerFacingRefStable.current = playerFacingRef;
  playerPosRefStable.current = playerPosRef;
  playerJumpRefStable.current = playerJumpRef;
  playerSprintRefStable.current = playerSprintRef;
  petRunAnimRefStable.current = petRunAnimRef;
  petPosRefStable.current = petPosRef;
  petSpawnEpochRefStable.current = petSpawnEpochRef;
  petCommandRefStable.current = petCommandRef;
  petHoldYawRefStable.current = petHoldYawRef;
  duelRefStable.current = duelRef;
  duelCombatSessionRefStable.current = duelCombatSessionRef;
  petStrikeUntilRefStable.current = petStrikeUntilRef;
  petAttackMsRefStable.current = petAttackMsRef;
  enemyStrikeUntilRefStable.current = enemyStrikeUntilRef;
  enemyAttackMsRefStable.current = enemyAttackMsRef;
  battleSpeedMultRefStable.current = battleSpeedMultRef;
  overlayProjectRefStable.current = overlayProjectRef;
  enemyStrikeVariantRefStable.current = enemyStrikeVariantRef;
  moe3dCombatExtentsRefStable.current = moe3dCombatExtentsRef;
  targetEnemyFacingYawRefStable.current = targetEnemyFacingYawRef;
  enemyChaseRuntimeRefStable.current = enemyChaseRuntimeRef;
  enemyFieldSyncRefStable.current = enemyFieldSyncRef;
  enemyDetectionOptsRefStable.current = enemyDetectionOptsRef;
  playerKakureminoUntilRefStable.current = playerKakureminoUntilRef;

  const petIdStable = useRef(petId);
  petIdStable.current = petId;
  const petDragonVisualFormStable = useRef(petDragonVisualForm);
  petDragonVisualFormStable.current = petDragonVisualForm;
  const hiddenShowcaseIdsRef = useRef(hiddenShowcaseIds);
  hiddenShowcaseIdsRef.current = hiddenShowcaseIds;
  const applyHiddenShowcaseRef = useRef(null);
  /** 3D: ペット id 変更時に glb を差し替え */
  const petSwapRef = useRef(null);
  /** 3D: 転生など見た目だけ変えるときに glb を再マウント */
  const petRemountRef = useRef(null);

  useEffect(() => {
    petSwapRef.current?.(petId);
  }, [petId]);

  useEffect(() => {
    petRemountRef.current?.();
  }, [petDragonVisualForm]);

  useEffect(() => {
    applyHiddenShowcaseRef.current?.();
  }, [hiddenShowcaseIds]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let animId = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87b8e8);
    scene.fog = new THREE.Fog(0x87b8e8, 55, 190);

    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.1,
      300
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xddeeff, 0x446633, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(12, 24, 8);
    sun.castShadow = true;
    scene.add(sun);

    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    /** プレイヤー（glb 読込前は紫ボックス） */
    const playerRoot = new THREE.Group();
    scene.add(playerRoot);
    const playerPlaceholder = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 1.4, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x6366f1 })
    );
    playerPlaceholder.castShadow = true;
    playerRoot.add(playerPlaceholder);
    attachPlayerPickTarget(playerRoot);
    let playerModel = null;
    let playerGroundLift = 0;
    let playerMixer = null;
    let playerAnimCtrl = null;
    let lastPlayerX =
      playerPosRefStable.current?.current?.x ?? 0;
    let lastPlayerY =
      playerPosRefStable.current?.current?.y ?? 0;
    let lastPlayerFootY = 0;
    let lastKakureminoVisual = false;

    /** ペット ○（glb 読込前のプレースホルダ） */
    const petMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24 })
    );
    petMesh.castShadow = true;
    attachPetPickTarget(petMesh);
    scene.add(petMesh);

    let petRoot = null;
    let petGroundLift = 0;
    let petFloatLift = 0;
    let petFrontExtent = petModelHeightForId(petIdStable.current) * 0.5;
    let petMixer = null;
    let petAnimCtrl = null;
    let lastPetX =
      petPosRefStable.current?.current?.x ??
      playerPosRefStable.current?.current?.x ??
      0;
    let lastPetY =
      petPosRefStable.current?.current?.y ??
      playerPosRefStable.current?.current?.y ??
      0;
    let lastPetSpawnEpoch = petSpawnEpochRefStable.current?.current ?? 0;
    let lastPetStrikeUntil = 0;
    let lastEnemyStrikeUntil = 0;
    const enemyAnimModes = new Map();
    /** 両者チャージ中の向き固定（毎フレーム snap によるブレ防止） */
    let duelChargeFaceLock = null;
    /** チャージ中ペットの地面Y固定 */
    let petCombatGroundY = null;
    /** チャージ中ペットの XYZ 固定 */
    let petCombatPosLock = null;
    /** 戦闘終了後の_pose 固定（スナップによるブレ防止） */
    let petPostCombatUntil = 0;
    let petPostCombatPos = null;
    let petPostCombatYaw = null;
    const POST_COMBAT_SETTLE_MS = 480;
    let lastDuelBusy = false;
    let lastCombatSession =
      duelCombatSessionRefStable.current?.current ?? 0;

    function clearPetCombatVisualState() {
      petCombatPosLock = null;
      petCombatGroundY = null;
      petPostCombatUntil = 0;
      petPostCombatPos = null;
      petPostCombatYaw = null;
      duelChargeFaceLock = null;
      lastPetStrikeUntil = 0;
      lastEnemyStrikeUntil = 0;
      for (const entry of enemyMeshes.values()) {
        entry.combatPosLock = null;
        entry.combatYawLock = null;
        entry.postCombatUntil = 0;
        entry.postCombatPose = null;
        entry.postCombatYaw = null;
      }
      if (petAnimCtrl?.getMode() === "attack") {
        petAnimCtrl.setMode("idle");
      }
    }

    let monsterAssets = new Map();
    const animationMixers = [];
    const overlayProjVec = new THREE.Vector3();

    camera.position.set(0, 14, 18);
    camera.lookAt(0, 0, 0);

    const enemyMeshes = new Map(); // id -> { root, mixer, placeholder }
    const enemyGroup = new THREE.Group();
    scene.add(enemyGroup);

    const treasureGroup = new THREE.Group();
    scene.add(treasureGroup);
    const treasureMeshes = new Map();

    const popupSprites = new Map();
    const popupGroup = new THREE.Group();
    scene.add(popupGroup);
    const phoenixTailFire = createMoePhoenixTailFireEffect(scene);

    let targetMarker = null;
    /** @type {{ group: THREE.Group, visionLine: THREE.Line, hearingLine: THREE.LineLoop, visionMat: THREE.LineBasicMaterial, hearingMat: THREE.LineBasicMaterial } | null} */
    let detectionOverlay = null;
    const enemyUntargetMarkers = new Map();
    let targetHpSprite = null;
    let petLabelSprite = null;
    let petFocusMarker = null;
    const enemyNameSprites = new Map();
    /** @type {{ sprite: THREE.Sprite, root: THREE.Object3D, yLift: number, maxDist: number }[]} */
    const showcaseNameLabels = [];
    const showcaseLabelPos = new THREE.Vector3();

    function createShowcaseNameSprite(title, subtitle, theme = "dragon") {
      const canvas2d = document.createElement("canvas");
      const twoLine = Boolean(subtitle);
      canvas2d.width = 320;
      canvas2d.height = twoLine ? 46 : 30;
      const ctx = canvas2d.getContext("2d");
      ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
      ctx.textAlign = "center";
      const mainColor = theme === "monster" ? "#fecdd3" : "#fde68a";
      const subColor = theme === "monster" ? "#fda4af" : "#fcd34d";
      const cx = canvas2d.width / 2;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000000";
      ctx.font = "bold 13px sans-serif";
      ctx.strokeText(String(title), cx, twoLine ? 16 : 20);
      ctx.fillStyle = mainColor;
      ctx.fillText(String(title), cx, twoLine ? 16 : 20);
      if (twoLine) {
        ctx.font = "11px sans-serif";
        ctx.strokeText(String(subtitle), cx, 36);
        ctx.fillStyle = subColor;
        ctx.fillText(String(subtitle), cx, 36);
      }
      const tex = new THREE.CanvasTexture(canvas2d);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(twoLine ? 2.85 : 2.35, twoLine ? 0.52 : 0.38, 1);
      sprite.renderOrder = 996;
      return sprite;
    }

    function attachShowcaseNameLabel(
      root,
      yLift,
      title,
      subtitle,
      theme,
      maxDist = 42,
      meta = null
    ) {
      const sprite = createShowcaseNameSprite(title, subtitle, theme);
      popupGroup.add(sprite);
      showcaseNameLabels.push({
        sprite,
        root,
        yLift,
        maxDist,
        variantId: meta?.variantId ?? null,
        kind: meta?.kind ?? null,
        userHidden: false,
      });
    }

    function applyHiddenShowcaseVisibility() {
      const hidden = hiddenShowcaseIdsRef.current ?? {};
      const hiddenM = new Set(hidden.monsters ?? []);
      const hiddenD = new Set(hidden.dragons ?? []);
      for (const item of showcaseNameLabels) {
        if (!item.variantId || !item.kind) continue;
        const hiddenSet = item.kind === "monster" ? hiddenM : hiddenD;
        item.userHidden = hiddenSet.has(item.variantId);
        if (item.root) item.root.visible = !item.userHidden;
      }
    }
    applyHiddenShowcaseRef.current = applyHiddenShowcaseVisibility;

    function syncShowcaseNameLabels(playerX, playerZ) {
      for (const item of showcaseNameLabels) {
        if (!item.root.parent || item.userHidden) {
          item.sprite.visible = false;
          continue;
        }
        item.root.getWorldPosition(showcaseLabelPos);
        const dist = Math.hypot(
          showcaseLabelPos.x - playerX,
          showcaseLabelPos.z - playerZ
        );
        item.sprite.position.set(
          showcaseLabelPos.x,
          showcaseLabelPos.y + item.yLift,
          showcaseLabelPos.z
        );
        item.sprite.visible = dist <= item.maxDist;
      }
    }

    function uiYsForEnemy(en, entry) {
      const gy = entry?.pickAnchor?.groundY ?? heightAt(en.x, en.y);
      return moe3dEnemyUiWorldYs(entry, en.key, gy);
    }

    function chaseRuntimeForEnemy(en) {
      return enemyChaseRuntimeRefStable.current?.current?.[en.id];
    }

    function applyPlayerStealthVisual(root, stealthActive) {
      if (!root) return;
      root.traverse((obj) => {
        if (!obj.isMesh || !obj.material) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of mats) {
          if (stealthActive) {
            mat.transparent = true;
            mat.opacity = MOE_KAKUREMINO_PLAYER_OPACITY;
            mat.depthWrite = false;
          } else {
            mat.opacity = 1;
            mat.transparent = false;
            mat.depthWrite = true;
          }
        }
      });
    }

    function syncPlayerKakureminoVisual() {
      const until = playerKakureminoUntilRefStable.current?.current ?? 0;
      const stealthActive = isMoeKakureminoActive(until, performance.now());
      if (stealthActive === lastKakureminoVisual) return;
      lastKakureminoVisual = stealthActive;
      applyPlayerStealthVisual(playerModel ?? playerPlaceholder, stealthActive);
    }

    function enemyWorldPos(en, entry) {
      const chaseRt = chaseRuntimeForEnemy(en);
      if (chaseRt?.aggro) {
        return { x: chaseRt.x, z: chaseRt.y };
      }
      return {
        x: entry?.pickAnchor?.x ?? en.x,
        z: entry?.pickAnchor?.z ?? en.y,
      };
    }

    function enemyDetectionFacingYaw(en, chaseRt, entry) {
      if (chaseRt?.aggro) return chaseRt.facingYaw;
      if (fieldTileW > 0 && fieldTileD > 0) {
        return moeEnemyFieldIdleFacingYaw(en, fieldTileW, fieldTileD);
      }
      return entry?.root?.rotation?.y ?? 0;
    }

    function syncEnemyNameLabels(enList, targetId) {
      const seen = new Set();
      for (const en of enList) {
        if (en.hp <= 0) continue;
        seen.add(en.id);
        const prefix = en.superBoss ? "◆ " : en.midBoss ? "★ " : "";
        const showLv = targetId != null && en.id === targetId;
        const chasing = Boolean(chaseRuntimeForEnemy(en)?.aggro);
        const displayName = en.mapLabel ?? en.name ?? "";
        const line1 = `${prefix}${String(displayName)}${
          chasing ? " ‼" : ""
        }${showLv ? ` Lv.${formatEnemyLevelUi(en.level)}` : ""}`;
        let sprite = enemyNameSprites.get(en.id);
        if (!sprite) {
          const canvas2d = document.createElement("canvas");
          canvas2d.width = 320;
          canvas2d.height = 32;
          const tex = new THREE.CanvasTexture(canvas2d);
          const mat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            depthTest: false,
          });
          sprite = new THREE.Sprite(mat);
          sprite.scale.set(showLv ? 3.8 : 3.2, 0.42, 1);
          sprite.renderOrder = 997;
          enemyNameSprites.set(en.id, sprite);
          popupGroup.add(sprite);
        }
        sprite.scale.set(showLv ? 3.8 : 3.2, 0.42, 1);
        const canvas2d = sprite.material.map.image;
        const ctx = canvas2d.getContext("2d");
        ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
        ctx.textAlign = "center";
        ctx.font = showLv ? "bold 14px sans-serif" : "bold 16px sans-serif";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        const textX = canvas2d.width / 2;
        ctx.strokeText(line1, textX, 20);
        ctx.fillStyle = chasing ? "#fca5a5" : showLv ? "#bfdbfe" : "#ffffff";
        ctx.fillText(line1, textX, 20);
        sprite.material.map.needsUpdate = true;
        const entry = enemyMeshes.get(en.id);
        const { nameY } = uiYsForEnemy(en, entry);
        const nameLift = showLv ? MOE_3D_ENEMY_UI_NAME_TARGET_EXTRA : 0;
        const { x, z } = enemyWorldPos(en, entry);
        sprite.position.set(x, nameY + nameLift, z);
        sprite.visible = true;
      }
      for (const [id, sprite] of enemyNameSprites) {
        if (!seen.has(id)) sprite.visible = false;
      }
    }

    function syncTargetHpBar(enList, targetId) {
      if (targetId == null) {
        if (targetHpSprite) targetHpSprite.visible = false;
        return;
      }
      const en = enList.find((e) => e.id === targetId && e.hp > 0);
      if (!en) {
        if (targetHpSprite) targetHpSprite.visible = false;
        return;
      }
      const hpPct = en.hpMax > 0 ? Math.max(0, Math.min(1, en.hp / en.hpMax)) : 0;
      const hpPctUi = Math.round(hpPct * 100);
      if (!targetHpSprite) {
        const canvas2d = document.createElement("canvas");
        canvas2d.width = 320;
        canvas2d.height = 24;
        const tex = new THREE.CanvasTexture(canvas2d);
        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          depthTest: false,
        });
        targetHpSprite = new THREE.Sprite(mat);
        targetHpSprite.scale.set(3.2, 0.38, 1);
        targetHpSprite.renderOrder = 998;
        popupGroup.add(targetHpSprite);
      }
      const canvas2d = targetHpSprite.material.map.image;
      const ctx = canvas2d.getContext("2d");
      ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
      const barW = 132;
      const barH = 10;
      const barX = 96 + MOE_3D_ENEMY_UI_HP_CANVAS_SHIFT_X;
      const barY = 6;
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle =
        hpPctUi <= 25 ? "#dc2626" : hpPctUi <= 50 ? "#ef4444" : "#f87171";
      ctx.fillRect(barX, barY, barW * hpPct, barH);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);
      targetHpSprite.material.map.needsUpdate = true;
      const entry = enemyMeshes.get(en.id);
      const { hpY } = uiYsForEnemy(en, entry);
      const { x, z } = enemyWorldPos(en, entry);
      targetHpSprite.position.set(
        x + MOE_3D_ENEMY_UI_HP_WORLD_OFFSET_X,
        hpY,
        z
      );
      targetHpSprite.visible = true;
    }

    function drawCrystalMarker(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const top = h * 0.08;
      const mid = h * 0.48;
      const tip = h * 0.92;
      const halfW = w * 0.42;

      ctx.save();
      ctx.shadowColor = "rgba(52,211,153,0.95)";
      ctx.shadowBlur = 10;

      const grad = ctx.createLinearGradient(cx, top, cx, tip);
      grad.addColorStop(0, "#f0fdf4");
      grad.addColorStop(0.28, "#a7f3d0");
      grad.addColorStop(0.62, "#34d399");
      grad.addColorStop(1, "#047857");

      ctx.beginPath();
      ctx.moveTo(cx, top);
      ctx.lineTo(cx + halfW, mid);
      ctx.lineTo(cx, tip);
      ctx.lineTo(cx - halfW, mid);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(cx, top);
      ctx.lineTo(cx - halfW, mid);
      ctx.lineTo(cx, tip);
      ctx.closePath();
      ctx.fillStyle = "rgba(4,120,87,0.32)";
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.58)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, top + 2);
      ctx.lineTo(cx, tip - 3);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.42)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(cx, top + 1);
      ctx.lineTo(cx + halfW * 0.45, mid - 2);
      ctx.stroke();
    }

    function createCrystalMarkerSprite() {
      const canvas2d = document.createElement("canvas");
      canvas2d.width = 32;
      canvas2d.height = 32;
      drawCrystalMarker(canvas2d.getContext("2d"), 32, 32);
      const tex = new THREE.CanvasTexture(canvas2d);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.58, 0.58, 1);
      sprite.renderOrder = 999;
      return sprite;
    }

    function createTargetMarker() {
      return createCrystalMarkerSprite();
    }

    function drawCircleMarker(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const r = w * 0.36;
      ctx.save();
      ctx.shadowColor = "rgba(250,204,21,0.9)";
      ctx.shadowBlur = 8;
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "rgba(250,204,21,0.2)";
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function createCircleMarkerSprite() {
      const canvas2d = document.createElement("canvas");
      canvas2d.width = 28;
      canvas2d.height = 28;
      drawCircleMarker(canvas2d.getContext("2d"), 28, 28);
      const tex = new THREE.CanvasTexture(canvas2d);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.52, 0.52, 1);
      sprite.renderOrder = 998;
      return sprite;
    }

    function syncUntargetMarkers(enList, targetId) {
      const seen = new Set();
      for (const en of enList) {
        if (en.hp <= 0) continue;
        if (en.id === targetId) {
          const hidden = enemyUntargetMarkers.get(en.id);
          if (hidden) hidden.visible = false;
          continue;
        }
        seen.add(en.id);
        let sprite = enemyUntargetMarkers.get(en.id);
        if (!sprite) {
          sprite = createCircleMarkerSprite();
          enemyUntargetMarkers.set(en.id, sprite);
          popupGroup.add(sprite);
        }
        sprite.visible = true;
        const entry = enemyMeshes.get(en.id);
        const { markerY } = uiYsForEnemy(en, entry);
        const { x, z } = enemyWorldPos(en, entry);
        const bob = Math.sin(performance.now() * 0.005 + en.id * 0.3) * 0.04;
        sprite.position.set(x, markerY + bob, z);
      }
      for (const [id, sprite] of enemyUntargetMarkers) {
        if (!seen.has(id)) sprite.visible = false;
      }
    }

    function syncTargetMarker(enList, targetId) {
      if (targetId == null) {
        if (targetMarker) targetMarker.visible = false;
        return;
      }
      const en = enList.find((e) => e.id === targetId && e.hp > 0);
      if (!en) {
        if (targetMarker) targetMarker.visible = false;
        return;
      }
      if (!targetMarker) {
        targetMarker = createTargetMarker();
        popupGroup.add(targetMarker);
      }
      targetMarker.visible = true;
      const entry = enemyMeshes.get(en.id);
      const { markerY } = uiYsForEnemy(en, entry);
      const { x, z } = enemyWorldPos(en, entry);
      const bob = Math.sin(performance.now() * 0.006) * 0.06;
      targetMarker.position.set(
        x,
        markerY + MOE_3D_ENEMY_UI_MARKER_TARGET_EXTRA + bob,
        z
      );
    }

    function ensureDetectionOverlay() {
      if (detectionOverlay) return detectionOverlay;
      const group = new THREE.Group();
      const visionMat = new THREE.LineBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.58,
        depthTest: true,
      });
      const hearingMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.42,
        depthTest: true,
      });
      const visionLine = new THREE.Line(new THREE.BufferGeometry(), visionMat);
      const hearingLine = new THREE.LineLoop(
        new THREE.BufferGeometry(),
        hearingMat
      );
      visionLine.frustumCulled = false;
      hearingLine.frustumCulled = false;
      group.add(visionLine, hearingLine);
      scene.add(group);
      detectionOverlay = {
        group,
        visionLine,
        hearingLine,
        visionMat,
        hearingMat,
      };
      return detectionOverlay;
    }

    function syncTargetEnemyFacingYaw(enList, targetId) {
      const yawOut = targetEnemyFacingYawRefStable.current;
      if (!yawOut) return;
      if (targetId == null) {
        yawOut.current = 0;
        return;
      }
      const en = enList.find((e) => e.id === targetId && e.hp > 0);
      if (!en) {
        yawOut.current = 0;
        return;
      }
      const entry = enemyMeshes.get(en.id);
      const chaseRt = chaseRuntimeForEnemy(en);
      yawOut.current = enemyDetectionFacingYaw(en, chaseRt, entry);
    }

    function syncEnemyDetectionOverlay(enList, targetId, statSearchOpen, playerPos) {
      if (!statSearchOpen || targetId == null) {
        if (detectionOverlay) detectionOverlay.group.visible = false;
        return;
      }
      const en = enList.find((e) => e.id === targetId && e.hp > 0);
      if (!en) {
        if (detectionOverlay) detectionOverlay.group.visible = false;
        return;
      }
      const overlay = ensureDetectionOverlay();
      overlay.group.visible = true;
      const entry = enemyMeshes.get(en.id);
      const { x, z } = enemyWorldPos(en, entry);
      const gy = heightAt(x, z);
      const y = gy + 0.14;
      const chaseRt = chaseRuntimeForEnemy(en);
      const facingYaw = enemyDetectionFacingYaw(en, chaseRt, entry);
      const det = resolveMoeEnemyDetection(en);
      const detectOpts =
        enemyDetectionOptsRefStable.current?.current ?? {};
      const detect = checkMoeEnemyPlayerDetection(
        en,
        playerPos,
        { x, y: z },
        facingYaw,
        detectOpts
      );
      const chasing = Boolean(chaseRt?.aggro);
      const soundMult = detectOpts.soundMult ?? 1;
      const toVec3 = (p) => new THREE.Vector3(p.x, p.y, p.z);

      const showVision = moeEnemyUsesVisionSearch(det);
      if (showVision) {
        const arcPts = sampleMoeEnemyVisionArcPoints({
          cx: x,
          cz: z,
          facingYaw,
          visionDeg: det.visionDeg,
          visionRange: det.visionRange,
          y,
        }).map(toVec3);
        overlay.visionLine.geometry.dispose();
        overlay.visionLine.geometry = new THREE.BufferGeometry().setFromPoints(
          arcPts
        );
        overlay.visionLine.visible = true;
        if (chasing) {
          overlay.visionMat.color.setHex(0xfb923c);
          overlay.visionMat.opacity = 0.78;
        } else {
          const visionHit = detect.via.includes("visual");
          overlay.visionMat.color.setHex(visionHit ? 0xf87171 : 0xfbbf24);
          overlay.visionMat.opacity = visionHit ? 0.82 : 0.55;
        }
      } else {
        overlay.visionLine.visible = false;
      }

      const showHearing = moeEnemyUsesHearingSearch(det);
      if (showHearing) {
        // 忍び足でも敵の基準足音射程は表示（判定のみ soundMult で短縮）
        const hearingRange = det.hearingRange;
        const circlePts = sampleMoeEnemyHearingCirclePoints({
          cx: x,
          cz: z,
          hearingRange,
          y,
        }).map(toVec3);
        overlay.hearingLine.geometry.dispose();
        overlay.hearingLine.geometry = new THREE.BufferGeometry().setFromPoints(
          circlePts
        );
        overlay.hearingLine.visible = true;
        const hearingHit = detect.via.includes("hearing");
        const quietFootsteps = soundMult <= 0;
        if (chasing) {
          overlay.hearingMat.color.setHex(0xfb923c);
          overlay.hearingMat.opacity = 0.55;
        } else {
          overlay.hearingMat.color.setHex(hearingHit ? 0x22d3ee : 0x38bdf8);
          overlay.hearingMat.opacity = hearingHit
            ? 0.72
            : quietFootsteps
              ? 0.3
              : 0.38;
        }
      } else {
        overlay.hearingLine.visible = false;
      }
    }

    function createPetFocusMarker() {
      return createCrystalMarkerSprite();
    }

    function syncPetLabel(pt, label, focused) {
      if (!focused || !label) {
        if (petLabelSprite) petLabelSprite.visible = false;
        if (petFocusMarker) petFocusMarker.visible = false;
        return;
      }
      if (!petLabelSprite) {
        const canvas2d = document.createElement("canvas");
        canvas2d.width = 256;
        canvas2d.height = 92;
        const tex = new THREE.CanvasTexture(canvas2d);
        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          depthTest: false,
        });
        petLabelSprite = new THREE.Sprite(mat);
        petLabelSprite.scale.set(3.5, 0.88, 1);
        petLabelSprite.renderOrder = 997;
        popupGroup.add(petLabelSprite);
      }
      if (!petFocusMarker) {
        petFocusMarker = createPetFocusMarker();
        popupGroup.add(petFocusMarker);
      }
      const hpPct =
        label.hpMax > 0 ? Math.max(0, Math.min(1, label.hp / label.hpMax)) : 0;
      const hpPctUi = Math.round(hpPct * 100);
      const line1 = String(label.name ?? "ペット");
      const canvas2d = petLabelSprite.material.map.image;
      const ctx = canvas2d.getContext("2d");
      ctx.clearRect(0, 0, 256, 92);
      ctx.textAlign = "center";
      ctx.font = "bold 15px sans-serif";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeText(line1, 128, 22);
      ctx.fillStyle = "#ecfdf5";
      ctx.fillText(line1, 128, 22);
      const barShiftX = 16;
      const barX = 44 + barShiftX;
      const barY = 34;
      const barW = 152;
      const barH = 10;
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle =
        hpPctUi <= 25 ? "#15803d" : hpPctUi <= 50 ? "#22c55e" : "#4ade80";
      ctx.fillRect(barX, barY, barW * hpPct, barH);
      ctx.strokeStyle = "rgba(167,243,208,0.45)";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);
      petLabelSprite.material.map.needsUpdate = true;
      const gy = heightAt(pt.x, pt.y);
      petLabelSprite.position.set(pt.x, gy + 1.48, pt.y);
      petLabelSprite.visible = true;
      const bob = Math.sin(performance.now() * 0.006) * 0.06;
      petFocusMarker.visible = true;
      petFocusMarker.position.set(pt.x, gy + 1.95 + bob, pt.y);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const clock = new THREE.Clock();

    let camYaw = 0;
    let camPitch = CAM_PITCH;
    let camDistance = CAM_DISTANCE;
    let isCamDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let mapReady = false;
    let fieldTileW = 0;
    let fieldTileD = 0;
    let midBossTerrainPos = null;
    let superBossTerrainPos = null;
    let mountainBisonTerrainPos = null;
    let roughBisonTerrainPos = null;
    let gustavJuniorTerrainPos = null;
    let rhodaPickGroup = null;
    /** @type {import("three").Object3D[]} */
    let altarPickMeshes = [];

    const canvas = renderer.domElement;
    canvas.style.touchAction = "none";
    canvas.oncontextmenu = () => false;

    const blockContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const PET_DOUBLE_CLICK_MS = 400;
    const PET_DOUBLE_CLICK_PX = 28;
    let lastPetPointerClickAt = 0;
    let lastPetPointerClickX = 0;
    let lastPetPointerClickY = 0;

    const pickAltarFromPointer = (clientX, clientY) => {
      if (!altarPickMeshes.length) return null;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(altarPickMeshes, true);
      if (!hits.length) return null;
      let node = hits[0].object;
      while (node && !node.userData?.moeAltarId) node = node.parent;
      return node?.userData?.moeAltarId ?? null;
    };

    const onPointerDown = (e) => {
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        const altarId = pickAltarFromPointer(e.clientX, e.clientY);
        if (altarId) {
          onAltarClickRef.current?.(altarId);
          return;
        }
        isCamDragging = true;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      if (e.button !== 0 || !mapReady) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const pickRoots = [
        ...enemyGroup.children,
        ...treasureGroup.children,
        playerRoot,
      ];
      if (petRoot) pickRoots.push(petRoot);
      else pickRoots.push(petMesh);
      const hits = raycaster.intersectObjects(pickRoots, true);
      const picked = resolvePickFromHits(
        hits,
        pointer,
        camera,
        rect,
        stateRef.current.treasures
      );
      if (picked?.type === "enemy") {
        onEnemyClickRef.current?.(picked.id);
        return;
      }
      if (picked?.type === "treasure") {
        onTreasureClickRef.current?.(picked.id);
        return;
      }
      if (picked?.type === "player") {
        onPlayerClickRef.current?.();
        return;
      }
      if (picked?.type === "pet") {
        const now = performance.now();
        const dx = e.clientX - lastPetPointerClickX;
        const dy = e.clientY - lastPetPointerClickY;
        if (
          now - lastPetPointerClickAt < PET_DOUBLE_CLICK_MS &&
          dx * dx + dy * dy < PET_DOUBLE_CLICK_PX * PET_DOUBLE_CLICK_PX
        ) {
          lastPetPointerClickAt = 0;
          onPetDoubleClickRef.current?.();
          return;
        }
        lastPetPointerClickAt = now;
        lastPetPointerClickX = e.clientX;
        lastPetPointerClickY = e.clientY;
        onPetClickRef.current?.();
        return;
      }
      if (rhodaPickGroup) {
        const rhodaHits = raycaster.intersectObject(rhodaPickGroup, true);
        if (rhodaHits.length > 0) {
          onRhodaClickRef.current?.();
          return;
        }
      }

      const cx = ((pointer.x + 1) / 2) * rect.width;
      const cy = ((-pointer.y + 1) / 2) * rect.height;
      const bossId = pickBossAtScreenPoint(
        cx,
        cy,
        camera,
        rect,
        stateRef.current.enemies,
        enemyMeshes
      );
      if (bossId != null) {
        onEnemyClickRef.current?.(bossId);
        return;
      }

      const petPosNow = petPosRefStable.current?.current;
      const playerPosNow = playerPosRefStable.current?.current;
      const fallback = pickEntityNearPointer(
        pointer,
        camera,
        rect,
        stateRef.current.enemies,
        petPosNow,
        playerPosNow,
        enemyMeshes
      );
      if (fallback?.type === "enemy") {
        onEnemyClickRef.current?.(fallback.id);
      } else if (fallback?.type === "player") {
        onPlayerClickRef.current?.();
      } else if (fallback?.type === "pet") {
        onPetClickRef.current?.();
      }
    };

    const onPointerUp = (e) => {
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!isCamDragging) return;
      isCamDragging = false;
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    };

    const onPointerMove = (e) => {
      if (!isCamDragging) return;
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      camYaw -= dx * MOUSE_SENS;
      camPitch = THREE.MathUtils.clamp(
        camPitch + dy * MOUSE_SENS,
        PITCH_MIN,
        PITCH_MAX
      );
    };

    const onWheel = (e) => {
      e.preventDefault();
      camDistance = THREE.MathUtils.clamp(
        camDistance + e.deltaY * 0.02,
        DIST_MIN,
        DIST_MAX
      );
    };

    canvas.addEventListener("contextmenu", blockContextMenu, { capture: true });
    mount.addEventListener("contextmenu", blockContextMenu, { capture: true });
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    const onDocContextMenu = (e) => {
      if (mount.contains(e.target)) blockContextMenu(e);
    };
    document.addEventListener("contextmenu", onDocContextMenu, { capture: true });

    const loader = new GLTFLoader();
    loader.load(
      MAP_URL,
      (gltf) => {
        if (disposed) return;
        const base = gltf.scene;
        base.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(base);
        const size = box.getSize(new THREE.Vector3());
        const tileWidth = Math.max(size.x, 0.1);
        const tileDepth = Math.max(size.z, 0.1);
        fieldTileW = tileWidth;
        fieldTileD = tileDepth;
        const layoutW = moe3dLayoutTileW(tileWidth);
        const layoutD = moe3dLayoutTileD(tileDepth);

        for (let iz = 0; iz < MOE_3D_LEGACY_TILES_Z; iz++) {
          for (let ix = 0; ix < MOE_3D_LEGACY_TILES_X; ix++) {
            const tile = base.clone(true);
            moe3dApplyMapTileScale(tile);
            const legacyOrigin = moe3dTileLocalOrigin(
              ix,
              iz,
              tileWidth,
              tileDepth
            );
            tile.position.set(legacyOrigin.x, 0, legacyOrigin.z);
            tile.traverse((obj) => {
              if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
              }
            });
            terrainGroup.add(tile);
          }
        }
        const terrainOff = moe3dTerrainGroupOffset(tileWidth, tileDepth);
        terrainGroup.position.set(terrainOff.x, 0, terrainOff.z);
        terrainGroup.updateMatrixWorld(true);

        const biskSlot = moe3dMapSlotById("bisk");
        if (biskSlot) {
          const biskTile = buildMoe3dBiskTile(tileWidth, tileDepth);
          moe3dApplyMapTileScale(biskTile);
          const biskOrigin = moe3dTileLocalOrigin(
            biskSlot.ix,
            biskSlot.iz,
            tileWidth,
            tileDepth
          );
          const biskSize = moe3dTileLocalSize(
            biskSlot.ix,
            biskSlot.iz,
            tileWidth,
            tileDepth
          );
          biskTile.position.set(biskOrigin.x, 0, biskOrigin.z);
          const biskSampleX =
            terrainGroup.position.x + biskOrigin.x + biskSize.w * 0.5;
          const biskSampleZ =
            terrainGroup.position.z + biskOrigin.z + biskSize.d * 0.46;
          biskTile.position.y = groundY(
            raycaster,
            terrainGroup,
            biskSampleX,
            biskSampleZ
          );
          terrainGroup.add(biskTile);
          attachShowcaseNameLabel(
            biskTile,
            3.2,
            "城下町ビスク",
            "新エリア v1",
            "pet",
            72
          );
        }

        const bufferSlot = moe3dMapSlotById("legacy_buffer");
        if (bufferSlot) {
          const bufferTile = buildMoe3dLegacyBufferTile(tileWidth, tileDepth);
          moe3dApplyMapTileScale(bufferTile);
          const bufOrigin = moe3dTileLocalOrigin(
            bufferSlot.ix,
            bufferSlot.iz,
            tileWidth,
            tileDepth
          );
          const bufSize = moe3dTileLocalSize(
            bufferSlot.ix,
            bufferSlot.iz,
            tileWidth,
            tileDepth
          );
          bufferTile.position.set(bufOrigin.x, 0, bufOrigin.z);
          const bufSampleX =
            terrainGroup.position.x + bufOrigin.x + bufSize.w * 0.5;
          const bufSampleZ =
            terrainGroup.position.z + bufOrigin.z + bufSize.d * 0.5;
          bufferTile.position.y = groundY(
            raycaster,
            terrainGroup,
            bufSampleX,
            bufSampleZ
          );
          terrainGroup.add(bufferTile);
        }

        addMoe3dReservedMapTiles(
          terrainGroup,
          tileWidth,
          tileDepth,
          moe3dReservedMapSlots(),
          (tile, slot) => {
            const sampleX =
              terrainGroup.position.x + (slot.ix + 0.5) * layoutW;
            const sampleZ =
              terrainGroup.position.z + (slot.iz + 0.5) * layoutD;
            const baseY = groundY(raycaster, terrainGroup, sampleX, sampleZ);
            tile.position.y = baseY;
          }
        );

        addMoe3dMacro2L1Tiles(terrainGroup, tileWidth, tileDepth, {
          groundY,
          raycaster,
          attachShowcaseNameLabel,
        });

        const ipsSlot = moe3dMapSlotById("ips_canyon");
        let ipsLocalX = 0;
        let ipsLocalZ = 0;
        let ipsBaseY = 0;
        if (ipsSlot) {
          ipsLocalX = ipsSlot.ix * layoutW;
          ipsLocalZ = ipsSlot.iz * layoutD;
          const ipsSampleX =
            terrainGroup.position.x + ipsLocalX + layoutW * 0.5;
          const ipsSampleZ =
            terrainGroup.position.z + ipsLocalZ + layoutD * 0.5;
          ipsBaseY = groundY(raycaster, terrainGroup, ipsSampleX, ipsSampleZ);
        }

        /** @type {{ id: string, x: number, y: number, groundY: number }[]} */
        let altarNodes = [];
        for (const altarDef of MOE_ALTARS) {
          const pos = moe3dAltarWorldPos(altarDef, tileWidth, tileDepth);
          if (!pos) continue;
          const gy = groundY(raycaster, terrainGroup, pos.x, pos.y);
          const altarMesh = buildMoe3dAltarVisual({
            scale:
              altarDef.kind === "hub"
                ? 1.05
                : altarDef.kind === "warp"
                  ? 0.92
                  : 0.88,
            variant: altarDef.kind === "hub" ? "hub" : "portal",
          });
          altarMesh.position.set(pos.x, gy, pos.y);
          altarMesh.userData.moeAltarId = altarDef.id;
          altarPickMeshes.push(altarMesh);
          scene.add(altarMesh);
          altarNodes.push({
            id: altarDef.id,
            x: pos.x,
            y: pos.y,
            groundY: gy,
          });
          attachShowcaseNameLabel(
            altarMesh,
            3.8,
            altarDef.nameJa,
            "転送",
            "dragon",
            58
          );
        }

        const desertIdx = moe3dDesertPreviewTileIndex(
          MOE_3D_LEGACY_TILES_X,
          MOE_3D_LEGACY_TILES_Z
        );
        const desertOrigin = moe3dTileLocalOrigin(
          desertIdx.ix,
          desertIdx.iz,
          tileWidth,
          tileDepth
        );
        const desertSize = moe3dTileLocalSize(
          desertIdx.ix,
          desertIdx.iz,
          tileWidth,
          tileDepth
        );
        const desertSampleWorldX =
          terrainGroup.position.x + desertOrigin.x + desertSize.w * 0.5;
        const desertSampleWorldZ =
          terrainGroup.position.z + desertOrigin.z + desertSize.d * 0.5;
        const desertBaseY = groundY(
          raycaster,
          terrainGroup,
          desertSampleWorldX,
          desertSampleWorldZ
        );

        const protoFieldStart = moe3dPrototypeFieldStart(tileWidth, tileDepth);

        terrainGroup.updateMatrixWorld(true);
        const playBounds = terrainPlayBoundsFromGroup(terrainGroup);
        const hills = resolveBossAreaOnTerrain(
          raycaster,
          terrainGroup,
          MOE_3D_LEGACY_REF_HALF,
          MOE_3D_LEGACY_REF_HALF,
          tileWidth,
          tileDepth,
          protoFieldStart
        );
        midBossTerrainPos = hills.midBossPos;
        superBossTerrainPos = hills.superBossPos;
        mountainBisonTerrainPos = hills.mountainBisonPos;
        roughBisonTerrainPos = hills.roughBisonPos;
        gustavJuniorTerrainPos = hills.gustavJuniorPos;
        mapReady = true;

        const houseIntent = moe3dPetHousePosition(
          playBounds.halfW,
          playBounds.halfD
        );
        const houseSnap = snapToNearestTerrain(
          raycaster,
          terrainGroup,
          houseIntent.x,
          houseIntent.y
        );
        const houseGy = groundY(
          raycaster,
          terrainGroup,
          houseSnap.x,
          houseSnap.z
        );
        const houseGroup = new THREE.Group();
        houseGroup.position.set(houseSnap.x, houseGy, houseSnap.z);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xc4a574 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 3.6), bodyMat);
        body.position.y = 1.3;
        body.castShadow = true;
        body.receiveShadow = true;
        houseGroup.add(body);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.65, 4.2), roofMat);
        roof.position.y = 2.85;
        roof.castShadow = true;
        houseGroup.add(roof);
        const door = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 1.6, 0.12),
          new THREE.MeshStandardMaterial({ color: 0x5d3a1a })
        );
        door.position.set(0, 0.82, 1.82);
        houseGroup.add(door);
        scene.add(houseGroup);

        const rhodaIntent = moe3dRhodaPosition(
          playBounds.halfW,
          playBounds.halfD
        );
        const rhodaSnap = snapToNearestTerrain(
          raycaster,
          terrainGroup,
          rhodaIntent.x,
          rhodaIntent.y,
          14
        );
        const rhodaGy = groundY(
          raycaster,
          terrainGroup,
          rhodaSnap.x,
          rhodaSnap.z
        );
        const rhodaGroup = new THREE.Group();
        rhodaGroup.position.set(rhodaSnap.x, rhodaGy, rhodaSnap.z);
        const shrineMat = new THREE.MeshStandardMaterial({ color: 0x6b7280 });
        const crystalMat = new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          emissive: 0x4c1d95,
          emissiveIntensity: 0.35,
        });
        const shrineBase = new THREE.Mesh(
          new THREE.CylinderGeometry(1.35, 1.65, 0.55, 8),
          shrineMat
        );
        shrineBase.position.y = 0.28;
        shrineBase.castShadow = true;
        shrineBase.receiveShadow = true;
        rhodaGroup.add(shrineBase);
        const shrinePillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.52, 1.05, 6),
          shrineMat
        );
        shrinePillar.position.y = 1.05;
        shrinePillar.castShadow = true;
        rhodaGroup.add(shrinePillar);
        const crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.62, 0),
          crystalMat
        );
        crystal.position.y = 1.95;
        crystal.rotation.y = Math.PI / 4;
        crystal.castShadow = true;
        rhodaGroup.add(crystal);
        scene.add(rhodaGroup);
        rhodaPickGroup = rhodaGroup;

        const dragonSpots = moe3dDragonShowcaseLayout(
          playBounds.halfW,
          playBounds.halfD,
          MOE_DRAGON_LINEUP.length
        );
        const dragonRoots = [];
        const dragonTargetH = petModelHeightForId("mystery_dragon") * 0.88;
        MOE_DRAGON_LINEUP.forEach((variant, i) => {
          loader.load(
            `/assets/models/pet/${variant.file}`,
            (dragonGltf) => {
              if (disposed) return;
              const root = SkeletonUtils.clone(dragonGltf.scene);
              const intent = dragonSpots[i];
              const snap = snapToNearestTerrain(
                raycaster,
                terrainGroup,
                intent.x,
                intent.y,
                24
              );
              const gy = groundY(raycaster, terrainGroup, snap.x, snap.z);
              const { groundLift } = fitModelToGround(root, dragonTargetH);
              root.position.set(snap.x, gy + groundLift, snap.z);
              root.rotation.y = Math.PI;
              enableShadows(root);
              scene.add(root);
              dragonRoots.push(root);
              attachShowcaseNameLabel(
                root,
                dragonTargetH * 0.92,
                variant.nameJa,
                variant.note ?? "",
                "dragon",
                38,
                { variantId: variant.id, kind: "dragon" }
              );
              applyHiddenShowcaseVisibility();
            },
            undefined,
            (err) => console.warn("Dragon showcase load:", variant.file, err)
          );
        });

        const dragonCenterIntent = moe3dDragonShowcaseCenter(
          playBounds.halfW,
          playBounds.halfD
        );
        const dragonCenterSnap = snapToNearestTerrain(
          raycaster,
          terrainGroup,
          dragonCenterIntent.x,
          dragonCenterIntent.y,
          28
        );
        const dragonCenterGy = groundY(
          raycaster,
          terrainGroup,
          dragonCenterSnap.x,
          dragonCenterSnap.z
        );
        const signMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0x92400e,
          emissiveIntensity: 0.25,
        });
        const signGroup = new THREE.Group();
        signGroup.position.set(
          dragonCenterSnap.x,
          dragonCenterGy,
          dragonCenterSnap.z - 5.5
        );
        const signPost = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 2.4, 0.35),
          signMat
        );
        signPost.position.y = 1.2;
        signPost.castShadow = true;
        signGroup.add(signPost);
        const signBoard = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.55, 0.12),
          signMat
        );
        signBoard.position.y = 2.55;
        signBoard.castShadow = true;
        signGroup.add(signBoard);
        scene.add(signGroup);

        const monsterSpots = moe3dMonsterShowcaseLayout(
          playBounds.halfW,
          playBounds.halfD,
          MOE_MONSTER_LINEUP.length
        );
        const terrainOriginX = terrainGroup.position.x;
        const terrainOriginZ = terrainGroup.position.z;

        MOE_MONSTER_LINEUP.forEach((variant, i) => {
          loader.load(
            `/assets/models/monster/${variant.file}`,
            (monsterGltf) => {
              if (disposed) return;
              const root = SkeletonUtils.clone(monsterGltf.scene);
              const desertSpot = MOE_3D_DESERT_SHOWCASE_FAMILIES.has(
                variant.familyId
              )
                ? moe3dDesertMonsterShowcaseSpot(
                    variant.familyId,
                    desertLocalX,
                    desertLocalZ,
                    tileWidth,
                    tileDepth,
                    terrainOriginX,
                    terrainOriginZ
                  )
                : null;
              const ipsSpot = MOE_3D_IPS_CANYON_SHOWCASE_FAMILIES.has(
                variant.familyId
              )
                ? moe3dIpsCanyonMonsterShowcaseSpot(
                    variant.familyId,
                    ipsLocalX,
                    ipsLocalZ,
                    tileWidth,
                    tileDepth,
                    terrainOriginX,
                    terrainOriginZ
                  )
                : null;
              const tileSpot = ipsSpot ?? desertSpot;
              const intent = tileSpot ?? monsterSpots[i];
              const snap = snapToNearestTerrain(
                raycaster,
                terrainGroup,
                intent.x,
                intent.y,
                tileSpot ? 12 : 32
              );
              const tileBaseY = ipsSpot ? ipsBaseY : desertSpot ? desertBaseY : null;
              const gy =
                tileBaseY != null
                  ? tileBaseY
                  : groundY(raycaster, terrainGroup, snap.x, snap.z);
              const targetH = moe3dMonsterShowcaseTargetHeight(variant.familyId);
              const { groundLift } = fitModelToGround(root, targetH);
              root.position.set(snap.x, gy + groundLift, snap.z);
              root.rotation.y = tileSpot?.yaw ?? Math.PI * 0.5;
              enableShadows(root);
              scene.add(root);
              attachShowcaseNameLabel(
                root,
                targetH * 1.12,
                variant.nameJa,
                variant.variantLabel ?? "",
                "monster",
                44,
                { variantId: variant.id, kind: "monster" }
              );
              applyHiddenShowcaseVisibility();
            },
            undefined,
            (err) => console.warn("Monster showcase load:", variant.file, err)
          );
        });

        const monsterCenterIntent = moe3dMonsterShowcaseCenter(
          playBounds.halfW,
          playBounds.halfD
        );
        const monsterCenterSnap = snapToNearestTerrain(
          raycaster,
          terrainGroup,
          monsterCenterIntent.x,
          monsterCenterIntent.y,
          36
        );
        const monsterCenterGy = groundY(
          raycaster,
          terrainGroup,
          monsterCenterSnap.x,
          monsterCenterSnap.z
        );
        const monsterSignMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          emissive: 0x881337,
          emissiveIntensity: 0.28,
        });
        const monsterSignGroup = new THREE.Group();
        monsterSignGroup.position.set(
          monsterCenterSnap.x - 4.5,
          monsterCenterGy,
          monsterCenterSnap.z
        );
        const monsterSignPost = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 2.4, 0.35),
          monsterSignMat
        );
        monsterSignPost.position.y = 1.2;
        monsterSignPost.castShadow = true;
        monsterSignGroup.add(monsterSignPost);
        const monsterSignBoard = new THREE.Mesh(
          new THREE.BoxGeometry(3.4, 0.55, 0.12),
          monsterSignMat
        );
        monsterSignBoard.position.y = 2.55;
        monsterSignBoard.castShadow = true;
        monsterSignGroup.add(monsterSignBoard);
        scene.add(monsterSignGroup);

        onMapReadyRef.current?.({
          ...playBounds,
          tileWidth,
          tileDepth,
          altars: altarNodes,
          midBossPos: midBossTerrainPos,
          superBossPos: superBossTerrainPos,
          mountainBisonPos: mountainBisonTerrainPos,
          roughBisonPos: roughBisonTerrainPos,
          gustavJuniorPos: gustavJuniorTerrainPos,
          rhodaPos: { x: rhodaSnap.x, y: rhodaSnap.z },
          dragonShowcasePos: {
            x: dragonCenterSnap.x,
            y: dragonCenterSnap.z,
          },
          monsterShowcasePos: {
            x: monsterCenterSnap.x,
            y: monsterCenterSnap.z,
          },
        });
      },
      undefined,
      (err) => {
        console.error("3D map load failed:", err);
        mapReady = true;
        onMapReadyRef.current?.();
      }
    );

    const activePetId = petIdStable.current;
    const petModelUrl = petModelUrlForId(activePetId);
    const petTargetHeight = petModelHeightForId(activePetId);
    petFloatLift = petFloatLiftForId(activePetId);

    let loadedPetId = activePetId;
    let petLoadGen = 0;

    function disposePetModel() {
      if (petRoot) {
        scene.remove(petRoot);
        disposeObject3D(petRoot);
        petRoot = null;
      }
      if (petMixer) {
        const idx = animationMixers.indexOf(petMixer);
        if (idx >= 0) animationMixers.splice(idx, 1);
        petMixer.stopAllAction();
        petMixer = null;
      }
      petAnimCtrl = null;
      petMesh.visible = true;
    }

    function mountPetModel(gltf, nextPetId) {
      petRoot = SkeletonUtils.clone(gltf.scene);
      const dragonForm =
        nextPetId === "mystery_dragon" ? petDragonVisualFormStable.current : 0;
      if (dragonForm === 1 || dragonForm === 2) {
        applyMysteryDragonVisualForm(petRoot, dragonForm);
      } else {
        const petTint = petTintForId(nextPetId);
        if (petTint != null) applyModelTint(petRoot, petTint);
      }
      ({ groundLift: petGroundLift } = fitModelToGround(
        petRoot,
        petModelHeightForId(nextPetId)
      ));
      petFloatLift = petFloatLiftForId(nextPetId);
      petFrontExtent = moe3dMeasureModelFrontExtent(petRoot);
      enableShadows(petRoot);
      attachPetPickTarget(petRoot);
      scene.add(petRoot);
      petMesh.visible = false;

      const ptLoad = petPosRefStable.current?.current;
      if (ptLoad) {
        petRoot.position.set(ptLoad.x, 0, ptLoad.y);
        lastPetX = ptLoad.x;
        lastPetY = ptLoad.y;
      }

      petMixer = new THREE.AnimationMixer(petRoot);
      petAnimCtrl = createSnakeAnimController(petMixer, gltf.animations, {
        attackLoop: false,
      });
      const attackMsRef = petAttackMsRefStable.current;
      if (attackMsRef) {
        attackMsRef.current = petAnimCtrl.attackDurationMs;
      }
      animationMixers.push(petMixer);
      loadedPetId = nextPetId;
    }

    function loadPetModel(nextPetId) {
      if (disposed || nextPetId === loadedPetId) return;
      const gen = ++petLoadGen;
      const modelUrl = petModelUrlForId(nextPetId);
      petMesh.visible = true;
      loader.load(
        modelUrl,
        (gltf) => {
          if (disposed || gen !== petLoadGen) return;
          if (nextPetId !== petIdStable.current) {
            loadPetModel(petIdStable.current);
            return;
          }
          disposePetModel();
          mountPetModel(gltf, nextPetId);
        },
        undefined,
        (err) => console.error("3D pet model load failed:", modelUrl, err)
      );
    }

    loader.load(
      petModelUrl,
      (gltf) => {
        if (disposed) return;
        mountPetModel(gltf, activePetId);
      },
      undefined,
      (err) => console.error("3D pet model load failed:", petModelUrl, err)
    );

    petSwapRef.current = (nextPetId) => {
      if (!nextPetId || nextPetId === loadedPetId) return;
      loadPetModel(nextPetId);
    };

    petRemountRef.current = () => {
      const id = petIdStable.current;
      if (!id || !loadedPetId) return;
      loadedPetId = null;
      loadPetModel(id);
    };

    loader.load(
      MOE_PLAYER_MODEL_URL,
      (gltf) => {
        if (disposed) return;
        playerModel = SkeletonUtils.clone(gltf.scene);
        ({ groundLift: playerGroundLift } = fitModelToGround(
          playerModel,
          MOE_PLAYER_MODEL_HEIGHT
        ));
        enableShadows(playerModel);
        playerRoot.add(playerModel);
        playerPlaceholder.visible = false;
        lastKakureminoVisual = false;
        syncPlayerKakureminoVisual();
        playerMixer = new THREE.AnimationMixer(playerModel);
        playerAnimCtrl = createSnakeAnimController(playerMixer, gltf.animations, {
          attackLoop: false,
        });
        animationMixers.push(playerMixer);
      },
      undefined,
      (err) => console.error("3D player model load failed:", MOE_PLAYER_MODEL_URL, err)
    );

    for (const modelUrl of MOE_ALL_MONSTER_MODEL_URLS) {
      loader.load(
        modelUrl,
        (gltf) => {
          if (disposed) return;
          monsterAssets.set(modelUrl, {
            scene: gltf.scene,
            clips: gltf.animations,
          });
          if (modelUrl === MONSTER_MODEL_URL) {
            const attackMsRef = enemyAttackMsRefStable.current;
            const attackClip = pickSnakeAttackClip(gltf.animations);
            if (attackMsRef && attackClip) {
              attackMsRef.current = Math.max(
                (attackClip.duration * 1000) / MOE_SNAKE_ATTACK_TIME_SCALE,
                400
              );
            }
          }
          syncEnemyMeshes(stateRef.current.enemies);
        },
        undefined,
        (err) => console.error("3D monster model load failed:", modelUrl, err)
      );
    }

    function heightAt(x, z, currentFootY = null) {
      if (!mapReady) return 0;
      return moe3dWalkableGroundY(raycaster, terrainGroup, x, z, {
        currentFootY,
      });
    }

    function createEnemyPlaceholder(enId, tintHex, bossFlags = {}) {
      const { midBoss = false, superBoss = false } = bossFlags;
      const isBig = midBoss || superBoss;
      const mesh = new THREE.Mesh(
        new THREE.ConeGeometry(
          superBoss ? 1.6 : midBoss ? 1.25 : 0.55,
          superBoss ? 3.2 : midBoss ? 2.45 : 1.2,
          4
        ),
        new THREE.MeshStandardMaterial({ color: tintHex })
      );
      mesh.castShadow = true;
      const frontExtent = moe3dMeasureModelFrontExtent(mesh);
      attachEnemyPickTarget(mesh, enId, isBig, superBoss);
      return { root: mesh, mixer: null, animCtrl: null, placeholder: true, frontExtent };
    }

    function createEnemyModel(en) {
      const modelUrl = monsterModelUrlForKey(en.key, en.modelVariantId);
      const asset = monsterAssets.get(modelUrl);
      if (!asset) return null;
      const tint = MOE_ENEMY_TINT_BY_KEY[en.key] ?? 0xef4444;
      const isBison = isBisonModelUrl(modelUrl);
      const isOrc = isOrcModelUrl(modelUrl);
      const isIxion = isIxionModelUrl(modelUrl);
      const isLion = isLionModelUrl(modelUrl);
      const isGustav = isGustavModelUrl(modelUrl);
      const root = SkeletonUtils.clone(asset.scene);
      const isBossBison = isBison && (en.midBoss || en.superBoss);
      let fitScale = 1;
      let groundLift = 0;
      if (isBossBison) {
        const ds = en.superBoss
          ? MOE_SUPER_BOSS_DISPLAY_SCALE
          : MOE_MID_BOSS_DISPLAY_SCALE;
        ({ scale: fitScale, groundLift } = moe3dApplyBisonBossDisplayScale(root, ds));
      } else if (isOrc) {
        ({ scale: fitScale, groundLift } = moe3dApplyOrcDisplayScale(root));
      } else if (isIxion) {
        ({ scale: fitScale, groundLift } = moe3dApplyIxionDisplayScale(root));
      } else if (isLion) {
        ({ scale: fitScale, groundLift } = moe3dApplyLionDisplayScale(root));
      } else if (isGustav) {
        ({ scale: fitScale, groundLift } = moe3dApplyGustavDisplayScale(root));
      } else {
        ({ scale: fitScale, groundLift } = fitModelToGround(
          root,
          enemyFitHeightForKey(en.key)
        ));
      }
      let stripeMaterial = false;
      if (enemyUsesStripeMaterial(en.key)) {
        applyEarthWormStripeMaterial(root);
        stripeMaterial = true;
      } else if (en.key !== "elvin_bison" && !enemyUsesBakedModelColors(en.key)) {
        applyModelTint(root, tint);
      }
      const frontExtent = moe3dMeasureModelFrontExtent(root);
      enableShadows(root);
      attachEnemyPickTarget(
        root,
        en.id,
        Boolean(en.midBoss || en.superBoss),
        Boolean(en.superBoss)
      );
      let mixer = null;
      let animCtrl = null;
      if (asset.clips.length > 0) {
        mixer = new THREE.AnimationMixer(root);
        animCtrl = isBison
          ? createBisonAnimController(mixer, asset.clips, { attackLoop: false })
          : isOrc
            ? createOrcAnimController(mixer, asset.clips, { attackLoop: false })
            : isGustav
              ? createGustavAnimController(mixer, asset.clips, {
                  attackLoop: false,
                })
              : createSnakeAnimController(mixer, asset.clips, {
                  attackLoop: false,
                });
        animationMixers.push(mixer);
      }
      return {
        root,
        mixer,
        animCtrl,
        placeholder: false,
        modelUrl,
        strikeCount: 0,
        lastAttackVariant: null,
        isBison,
        isOrc,
        isGustav,
        scaleLocked:
          isBossBison ||
          isOrc ||
          isIxion ||
          isLion ||
          isGustav ||
          stripeMaterial ||
          en.key === "brown_serpent" ||
          en.key === MOE_MEERIM_GUSTAV_JUNIOR_KEY ||
          en.key === "turtle" ||
          en.key === "giant_tortoise",
        layoutRev: isBossBison
          ? MOE_BISON_BOSS_LAYOUT_REV
          : isOrc
          ? MOE_ORC_MODEL_LAYOUT_REV
          : en.key === "earth_worm"
            ? MOE_EARTH_WORM_MATERIAL_REV
            : en.key === "stray_ixion"
              ? MOE_IXION_MODEL_LAYOUT_REV
              : en.key === "hilltop_lion"
                ? MOE_HILLTOP_LION_MODEL_LAYOUT_REV
                : en.key === MOE_MEERIM_GUSTAV_JUNIOR_KEY
                  ? MOE_GUSTAV_JUNIOR_LAYOUT_REV
                  : 0,
        combatPosLock: null,
        combatYawLock: null,
        postCombatUntil: 0,
        postCombatPose: null,
        postCombatYaw: null,
        lastDisplayScale: fitScale,
        groundLift,
        stripeMaterial,
        frontExtent,
      };
    }

    function removeEnemyEntry(id, entry) {
      if (entry.mixer) {
        entry.mixer.stopAllAction();
        const idx = animationMixers.indexOf(entry.mixer);
        if (idx >= 0) animationMixers.splice(idx, 1);
      }
      enemyGroup.remove(entry.root);
      enemyAnimModes.delete(id);
      if (entry.placeholder) {
        entry.root.geometry.dispose();
        entry.root.material.dispose();
      } else {
        disposeObject3D(entry.root);
      }
    }

    function syncEnemyMeshes(enList) {
      const seen = new Set();
      const duel = duelRefStable.current?.current;
      const duelCharge = duel?.phase === "simultaneous_charge";
      const duelEnemyId = duel?.enemyId ?? null;
      for (const en of enList) {
        seen.add(en.id);
        const modelUrl = monsterModelUrlForKey(en.key, en.modelVariantId);
        const assetReady = monsterAssets.has(modelUrl);
        let entry = enemyMeshes.get(en.id);
        const bossFlags = { midBoss: en.midBoss, superBoss: en.superBoss };
        const tint = MOE_ENEMY_TINT_BY_KEY[en.key] ?? 0xef4444;
        if (!entry && assetReady) {
          entry =
            createEnemyModel(en) ??
            createEnemyPlaceholder(en.id, tint, bossFlags);
          enemyMeshes.set(en.id, entry);
          enemyGroup.add(entry.root);
        } else if (!entry) {
          entry = createEnemyPlaceholder(en.id, tint, bossFlags);
          enemyMeshes.set(en.id, entry);
          enemyGroup.add(entry.root);
        } else if (
          assetReady &&
          (entry.placeholder ||
            entry.modelUrl !== modelUrl ||
            (en.key === "orc_infantry" &&
              entry.layoutRev !== MOE_ORC_MODEL_LAYOUT_REV) ||
            (en.key === "earth_worm" &&
              entry.layoutRev !== MOE_EARTH_WORM_MATERIAL_REV) ||
            (en.key === "stray_ixion" &&
              entry.layoutRev !== MOE_IXION_MODEL_LAYOUT_REV) ||
            (en.key === "hilltop_lion" &&
              entry.layoutRev !== MOE_HILLTOP_LION_MODEL_LAYOUT_REV) ||
            (en.key === MOE_MEERIM_GUSTAV_JUNIOR_KEY &&
              entry.layoutRev !== MOE_GUSTAV_JUNIOR_LAYOUT_REV) ||
            ((en.midBoss || en.superBoss) &&
              entry.layoutRev !== MOE_BISON_BOSS_LAYOUT_REV))
        ) {
          removeEnemyEntry(en.id, entry);
          entry =
            createEnemyModel(en) ??
            createEnemyPlaceholder(en.id, tint, bossFlags);
          enemyMeshes.set(en.id, entry);
          enemyGroup.add(entry.root);
        }
        const chaseRt = chaseRuntimeForEnemy(en);
        let px = chaseRt?.aggro ? chaseRt.x : en.x;
        let pz = chaseRt?.aggro ? chaseRt.y : en.y;
        const legacyBossArena =
          (en.midBoss || en.superBoss) && !moe3dIsMapSlotFieldEnemy(en);
        if (en.superBoss && superBossTerrainPos && legacyBossArena) {
          px = superBossTerrainPos.x;
          pz = superBossTerrainPos.y;
        } else if (en.midBoss && midBossTerrainPos && legacyBossArena) {
          px = midBossTerrainPos.x;
          pz = midBossTerrainPos.y;
        } else if (
          en.key === MOE_MEERIM_MOUNTAIN_BISON_KEY &&
          mountainBisonTerrainPos
        ) {
          px = mountainBisonTerrainPos.x;
          pz = mountainBisonTerrainPos.y;
        } else if (
          en.key === MOE_MEERIM_ROUGH_BISON_KEY &&
          roughBisonTerrainPos
        ) {
          px = roughBisonTerrainPos.x;
          pz = roughBisonTerrainPos.y;
        } else if (
          en.key === MOE_MEERIM_GUSTAV_JUNIOR_KEY &&
          gustavJuniorTerrainPos
        ) {
          px = gustavJuniorTerrainPos.x;
          pz = gustavJuniorTerrainPos.y;
        } else if (
          mapReady &&
          !moe3dIsMapSlotFieldEnemy(en) &&
          !isOverTerrain(raycaster, terrainGroup, px, pz)
        ) {
          const snapped = snapToNearestTerrain(raycaster, terrainGroup, px, pz);
          px = snapped.x;
          pz = snapped.z;
        }
        const gy = heightAt(px, pz);
        const yOff = entry.placeholder ? 0.6 : 0;
        const groundLift = entry.groundLift ?? 0;
        const baseY = gy + yOff + groundLift;
        const lockCombat = duelCharge && duelEnemyId === en.id;
        const nowMs = performance.now();
        const postCombatSettling =
          entry.postCombatUntil > 0 && nowMs < entry.postCombatUntil;
        if (lockCombat) {
          entry.postCombatUntil = 0;
          entry.postCombatPose = null;
          entry.postCombatYaw = null;
          if (!entry.combatPosLock) {
            entry.combatPosLock = new THREE.Vector3(px, baseY, pz);
            const ptNow = petPosRefStable.current?.current;
            entry.combatYawLock =
              ptNow != null
                ? moe3dYawFaceTarget(px, pz, ptNow.x, ptNow.y) +
                  moe3dEnemyModelYawOffset(en.key)
                : entry.root.rotation.y;
          }
          entry.root.position.copy(entry.combatPosLock);
          if (entry.combatYawLock != null) {
            entry.root.rotation.y = entry.combatYawLock;
          }
        } else {
          if (entry.combatPosLock) {
            entry.postCombatPose = entry.combatPosLock.clone();
            entry.postCombatYaw = entry.combatYawLock ?? entry.root.rotation.y;
            entry.postCombatUntil = nowMs + POST_COMBAT_SETTLE_MS;
            entry.combatPosLock = null;
            entry.combatYawLock = null;
          }
          if (postCombatSettling && entry.postCombatPose) {
            entry.root.position.copy(entry.postCombatPose);
            if (entry.postCombatYaw != null) {
              entry.root.rotation.y = entry.postCombatYaw;
            }
          } else {
            entry.postCombatUntil = 0;
            entry.postCombatPose = null;
            entry.postCombatYaw = null;
            entry.root.position.set(px, baseY, pz);
            if (chaseRt?.aggro) {
              entry.root.rotation.y =
                chaseRt.facingYaw + moe3dEnemyModelYawOffset(en.key);
            } else if (!postCombatSettling) {
              entry.root.rotation.y = enemyDetectionFacingYaw(
                en,
                chaseRt,
                entry
              );
            }
          }
        }
        const sc = moe3dEnemyDisplayScale(en);
        // sc=1 は「fit 済みスケールを維持」。mountain/rough バイソンだけ sc が絶対高さ
        if (
          !entry.scaleLocked &&
          sc !== 1 &&
          entry.lastDisplayScale !== sc
        ) {
          entry.root.scale.setScalar(sc);
          entry.lastDisplayScale = sc;
        }
        entry.frontExtent = moe3dMeasureModelFrontExtent(entry.root);
        entry.root.traverse((obj) => {
          if (obj.userData?.pickProxy) {
            obj.visible =
              en.hp > 0 && !lockCombat && !postCombatSettling;
          }
        });
        entry.root.visible = en.hp > 0;
        entry.pickAnchor = { x: px, groundY: baseY, z: pz };
        const fieldSyncRef = enemyFieldSyncRefStable.current;
        if (fieldSyncRef?.current && en.hp > 0) {
          fieldSyncRef.current[en.id] = {
            x: px,
            y: pz,
            idleFacingYaw: enemyDetectionFacingYaw(en, chaseRt, entry),
          };
        }
        const gustavIdle =
          en.key === MOE_MEERIM_GUSTAV_JUNIOR_KEY &&
          !lockCombat &&
          !postCombatSettling &&
          !(
            duel?.enemyId === en.id &&
            (duel?.phase === "approach" ||
              duel?.phase === "simultaneous_charge")
          );
        if (gustavIdle) {
          entry.root.rotation.y = moe3dGustavFacePlayerStartYaw(px, pz);
        }
        if (en.key === "earth_worm" && entry.stripeMaterial) {
          updateEarthWormStripeUniforms(entry.root);
        }
      }
      for (const [id, entry] of enemyMeshes) {
        if (!seen.has(id)) {
          removeEnemyEntry(id, entry);
          enemyMeshes.delete(id);
          const fieldSyncRef = enemyFieldSyncRefStable.current;
          if (fieldSyncRef?.current) {
            delete fieldSyncRef.current[id];
          }
        }
      }
      const extRef = moe3dCombatExtentsRefStable.current;
      if (extRef?.current) {
        const byEnemy = {};
        for (const [id, entry] of enemyMeshes) {
          if (entry.frontExtent != null) byEnemy[id] = entry.frontExtent;
        }
        extRef.current.pet = petFrontExtent;
        extRef.current.enemies = byEnemy;
      }
    }

    function syncPetAnimation(pt, dt) {
      if (!petAnimCtrl) return;
      const duel = duelRefStable.current?.current;
      const strikeUntil = petStrikeUntilRefStable.current?.current ?? 0;
      const now = performance.now();

      const inCombatCharge = duel?.phase === "simultaneous_charge";
      if (inCombatCharge) {
        lastPetX = pt.x;
        lastPetY = pt.y;
      }
      const petSpeed = inCombatCharge
        ? 0
        : Math.hypot(pt.x - lastPetX, pt.y - lastPetY) / Math.max(dt, 0.001);
      const petMoving = petSpeed > 0.2;
      const petRunForced = petRunAnimRefStable.current?.current ?? false;
      const playerSprinting = playerSprintRefStable.current?.current ?? false;
      const petCmd = petCommandRefStable.current?.current ?? "follow";
      const holdStill = petCmd === "wait" || petCmd === "sit";

      let baseMode = "idle";
      if (duel?.phase === "simultaneous_charge") {
        baseMode = "idle";
      } else if (duel?.phase === "approach") {
        baseMode = "run";
      } else if (
        !holdStill &&
        (petMoving || petRunForced) &&
        duel?.phase !== "approach"
      ) {
        baseMode = "run";
      }

      if (petAnimCtrl.setRunTimeScale) {
        petAnimCtrl.setRunTimeScale(
          playerSprinting && baseMode === "run"
            ? MOE_SNAKE_RUN_SPRINT_TIME_SCALE
            : 1
        );
      }

      if (strikeUntil > lastPetStrikeUntil) {
        lastPetStrikeUntil = strikeUntil;
        const isSunSpirit = petIdStable.current === "sun_spirit";
        const inAttack = petAnimCtrl.getMode() === "attack";
        if (isSunSpirit || !inAttack) {
          petAnimCtrl.setMode("attack", {
            restart: true,
            afterAttack: baseMode,
          });
        }
      } else if (
        !inCombatCharge &&
        duel?.phase !== "approach" &&
        petAnimCtrl.getMode() === "attack"
      ) {
        petAnimCtrl.setMode(baseMode);
      } else if (
        petAnimCtrl.getMode() !== "attack" &&
        petAnimCtrl.getMode() !== baseMode
      ) {
        petAnimCtrl.setMode(baseMode);
      }

      lastPetX = pt.x;
      lastPetY = pt.y;
    }

    function syncEnemyAnimations() {
      const duel = duelRefStable.current?.current;
      const strikeUntil = enemyStrikeUntilRefStable.current?.current ?? 0;

      for (const [id, entry] of enemyMeshes) {
        if (!entry.animCtrl) continue;
        const isDuelEnemy =
          duel?.phase === "simultaneous_charge" && duel.enemyId === id;

        if (!isDuelEnemy) {
          const chaseRt = chaseRuntimeForEnemy({ id });
          const chaseMode = chaseRt?.aggro ? "run" : "idle";
          if (enemyAnimModes.get(id) !== chaseMode) {
            entry.animCtrl.setMode(chaseMode);
            enemyAnimModes.set(id, chaseMode);
          }
          continue;
        }

        if (isDuelEnemy && strikeUntil > lastEnemyStrikeUntil) {
          lastEnemyStrikeUntil = strikeUntil;
          const strikePick = enemyStrikeVariantRefStable.current?.current;
          const variant =
            strikePick?.enemyId === id ? strikePick.variant : "weak";
          const inAttack = entry.animCtrl.getMode() === "attack";
          if (inAttack) {
            enemyAnimModes.set(id, "attack");
            continue;
          }
          entry.animCtrl.setMode("attack", {
            restart: true,
            afterAttack: "idle",
            variant,
          });
          entry.lastAttackVariant = variant;
          if ((entry.isBison || entry.isOrc || entry.isGustav) && entry.animCtrl?.attackDurationMs) {
            const msRef = enemyAttackMsRefStable.current;
            if (msRef) msRef.current = entry.animCtrl.attackDurationMs;
          }
          enemyAnimModes.set(id, "attack");
        } else if (isDuelEnemy && entry.animCtrl.getMode() === "attack") {
          enemyAnimModes.set(id, "attack");
        } else if (isDuelEnemy) {
          enemyAnimModes.set(id, entry.animCtrl.getMode());
        }
      }
    }

    function syncDuelFacing(ens, pt, dt) {
      const duel = duelRefStable.current?.current;
      const petCmd = petCommandRefStable.current?.current ?? "follow";
      const holdStill = petCmd === "wait" || petCmd === "sit";

      if (holdStill) {
        const holdYaw = petHoldYawRefStable.current?.current;
        if (holdYaw != null) {
          if (petRoot) petRoot.rotation.y = holdYaw;
          else petMesh.rotation.y = holdYaw;
        }
        return;
      }

      const inDuelFace =
        duel?.phase === "simultaneous_charge" || duel?.phase === "approach";
      const petSettling =
        petPostCombatUntil > 0 && performance.now() < petPostCombatUntil;

      if (!inDuelFace && !petSettling) {
        duelChargeFaceLock = null;
        if (petRoot) petRoot.rotation.y = playerRoot.rotation.y;
        else petMesh.rotation.y = playerRoot.rotation.y;
        return;
      }

      if (petSettling) {
        if (petPostCombatYaw != null) {
          if (petRoot) petRoot.rotation.y = petPostCombatYaw;
          else petMesh.rotation.y = petPostCombatYaw;
        }
        return;
      }

      const enemy = ens.find((e) => e.id === duel.enemyId);
      if (!enemy || enemy.hp <= 0) {
        duelChargeFaceLock = null;
        return;
      }

      const petYaw =
        moe3dYawFaceTarget(pt.x, pt.y, enemy.x, enemy.y) +
        MOE_PET_MODEL_YAW_OFFSET;
      const enemyYaw =
        moe3dYawFaceTarget(enemy.x, enemy.y, pt.x, pt.y) +
        moe3dEnemyModelYawOffset(enemy.key);

      if (duel?.phase === "simultaneous_charge") {
        if (
          !duelChargeFaceLock ||
          duelChargeFaceLock.enemyId !== duel.enemyId
        ) {
          duelChargeFaceLock = {
            enemyId: duel.enemyId,
            petYaw,
            enemyYaw,
          };
        }
        const lock = duelChargeFaceLock;
        if (petRoot) petRoot.rotation.y = lock.petYaw;
        else petMesh.rotation.y = lock.petYaw;
        const entry = enemyMeshes.get(enemy.id);
        if (entry?.root) {
          entry.root.rotation.y = lock.enemyYaw;
          entry.combatYawLock = lock.enemyYaw;
        }
        return;
      }

      duelChargeFaceLock = null;
      const t = 1 - Math.exp(-22 * dt);

      if (petRoot) {
        petRoot.rotation.y = THREE.MathUtils.lerp(petRoot.rotation.y, petYaw, t);
      } else {
        petMesh.rotation.y = THREE.MathUtils.lerp(petMesh.rotation.y, petYaw, t);
      }

      const entry = enemyMeshes.get(enemy.id);
      if (entry?.root) {
        entry.root.rotation.y = THREE.MathUtils.lerp(
          entry.root.rotation.y,
          enemyYaw,
          t
        );
      }
    }

    function drawTenthBannerCanvas(ctx, w, h, text) {
      ctx.clearRect(0, 0, w, h);
      const label = String(text ?? MOE_PET_TENTH_LEVEL_UP_LABEL);
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.88)";
      ctx.lineWidth = 5;
      ctx.strokeText(label, w / 2, h / 2);
      ctx.fillStyle = "#fde047";
      ctx.fillText(label, w / 2, h / 2);
    }

    function getPetBodyAnchor() {
      if (petRoot) {
        return {
          x: petRoot.position.x,
          groundY: petRoot.position.y,
          z: petRoot.position.z,
        };
      }
      if (petMesh) {
        return {
          x: petMesh.position.x,
          groundY: petMesh.position.y - 0.55,
          z: petMesh.position.z,
        };
      }
      const pt = petPosRefStable.current?.current ?? { x: 0, y: 0 };
      const gy = heightAt(pt.x, pt.y);
      return { x: pt.x, groundY: gy, z: pt.y };
    }

    function syncPopups(pops) {
      const seen = new Set();
      const now = performance.now();

      for (const pop of pops) {
        if (pop.type !== "tenthBanner") continue;
        seen.add(pop.id);
        let sprite = popupSprites.get(pop.id);

        if (!sprite) {
          const canvas2d = document.createElement("canvas");
          canvas2d.width = 256;
          canvas2d.height = 40;
          const tex = new THREE.CanvasTexture(canvas2d);
          const mat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            depthTest: false,
          });
          sprite = new THREE.Sprite(mat);
          sprite.userData.popId = pop.id;
          sprite.userData.kind = "tenthBanner";
          sprite.userData.spawnTime = performance.now();
          drawTenthBannerCanvas(
            canvas2d.getContext("2d"),
            canvas2d.width,
            canvas2d.height,
            String(pop.value ?? MOE_PET_TENTH_LEVEL_UP_LABEL)
          );
          tex.needsUpdate = true;
          popupSprites.set(pop.id, sprite);
          popupGroup.add(sprite);
        }
        const spawnTime = sprite.userData.spawnTime ?? now;
        const elapsed = Math.max(0, (now - spawnTime) / 1000);
        const dur = MOE_TENTH_BANNER_DURATION_SEC_3D;
        const fadeInEnd = dur * 0.1;
        const fadeOutStart = dur * 0.68;
        const fadeOutDur = dur - fadeOutStart;
        const ptNow = petPosRefStable.current?.current ?? {
          x: pop.x,
          y: pop.y,
        };
        const gy = heightAt(ptNow.x, ptNow.y);
        const t = Math.min(1, elapsed / dur);
        const ease = 1 - (1 - t) * (1 - t);
        const rise = ease * 2.6;
        const fade =
          elapsed > fadeOutStart
            ? Math.max(0, 1 - (elapsed - fadeOutStart) / fadeOutDur)
            : Math.min(1, elapsed / fadeInEnd);
        const scaleMul = 0.86 + ease * 0.14;
        sprite.scale.set(3.1 * scaleMul, 0.48 * scaleMul, 1);
        sprite.material.opacity = fade;
        sprite.position.set(ptNow.x, gy + 0.72 + rise, ptNow.y);
      }
      for (const [id, sprite] of popupSprites) {
        if (!seen.has(id)) {
          popupGroup.remove(sprite);
          sprite.material.map.dispose();
          sprite.material.dispose();
          popupSprites.delete(id);
        }
      }
    }

    function syncTreasureMeshes(trList) {
      const seen = new Set();
      for (const tr of trList) {
        if (tr.state === "looted") continue;
        seen.add(tr.id);
        let entry = treasureMeshes.get(tr.id);
        if (!entry) {
          entry = createTreasureChestGroup(tr.id);
          treasureMeshes.set(tr.id, entry);
          treasureGroup.add(entry.root);
        }
        let px = tr.x;
        let pz = tr.y;
        if (mapReady && !isOverTerrain(raycaster, terrainGroup, px, pz)) {
          const snapped = snapToNearestTerrain(raycaster, terrainGroup, px, pz);
          px = snapped.x;
          pz = snapped.z;
        }
        const gy = heightAt(px, pz);
        entry.root.position.set(px, gy, pz);

        const spawnAge = (performance.now() - entry.spawnTime) / 1000;
        const bounce =
          spawnAge < 0.55
            ? 1 + Math.sin(spawnAge * Math.PI * 3.5) * 0.1 * Math.max(0, 1 - spawnAge * 1.8)
            : 1;
        entry.root.scale.setScalar(bounce);

        const lid = entry.root.getObjectByName("treasureLid");
        if (lid) {
          lid.rotation.x = tr.state === "open" ? -Math.PI * 0.62 : 0;
        }
        entry.root.traverse((obj) => {
          if (obj.userData?.pickProxy && obj.userData?.treasureId != null) {
            obj.visible = tr.state === "closed";
          }
        });
      }
      for (const [id, entry] of treasureMeshes) {
        if (!seen.has(id)) {
          treasureGroup.remove(entry.root);
          disposeObject3D(entry.root);
          treasureMeshes.delete(id);
        }
      }
    }

    const tick = () => {
      if (disposed) return;
      animId = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);

      const {
        enemies: ens,
        treasures: trs,
        battlePopups: pops,
        targetEnemyId: targetId,
        enemyStatSearchOpen: statSearchOpen,
        petFocused: petFocus,
        petLabel: petLbl,
      } = stateRef.current;
      const pl = playerPosRefStable.current?.current ?? { x: 0, y: 0 };
      const pt = petPosRefStable.current?.current ?? pl;
      const combatSession =
        duelCombatSessionRefStable.current?.current ?? 0;
      if (combatSession !== lastCombatSession) {
        lastCombatSession = combatSession;
        clearPetCombatVisualState();
      }
      const spawnEpoch = petSpawnEpochRefStable.current?.current ?? 0;
      if (spawnEpoch !== lastPetSpawnEpoch) {
        lastPetSpawnEpoch = spawnEpoch;
        lastPetX = pt.x;
        lastPetY = pt.y;
      }

      updateMoe3dMacro2L4Fx(dt);
      updateMoe3dMacro3L4Fx(dt);

      syncEnemyMeshes(ens);
      syncTreasureMeshes(trs ?? []);
      syncEnemyNameLabels(ens, targetId);
      syncShowcaseNameLabels(pl.x, pl.y);
      syncTargetHpBar(ens, targetId);
      syncPetLabel(pt, petLbl, petFocus);
      syncUntargetMarkers(ens, targetId);
      syncTargetMarker(ens, targetId);
      syncTargetEnemyFacingYaw(ens, targetId);
      syncEnemyDetectionOverlay(ens, targetId, statSearchOpen, pl);
      syncPetAnimation(pt, dt);
      syncEnemyAnimations();
      syncDuelFacing(ens, pt, dt);

      const duelPhase = duelRefStable.current?.current?.phase;
      const battleMult = battleSpeedMultRefStable.current?.current ?? 1;
      const mixerTimeScale =
        battleMult > 1 &&
        (duelPhase === "approach" || duelPhase === "simultaneous_charge")
          ? battleMult
          : 1;
      for (const mixer of animationMixers) {
        mixer.timeScale = mixerTimeScale;
        mixer.update(dt);
      }

      const duelNow = duelRefStable.current?.current;
      const duelBusy =
        duelNow?.phase === "approach" ||
        duelNow?.phase === "simultaneous_charge";
      if (!duelBusy && lastDuelBusy) {
        lastEnemyStrikeUntil = 0;
        lastPetStrikeUntil = 0;
      }
      lastDuelBusy = duelBusy;

      const playerTeleport =
        Math.hypot(pl.x - lastPlayerX, pl.y - lastPlayerY) > 18;
      const pgY = playerTeleport
        ? heightAt(pl.x, pl.y, null)
        : heightAt(pl.x, pl.y, lastPlayerFootY);
      lastPlayerFootY = pgY;
      const jumpY = playerJumpRefStable.current?.current?.offset ?? 0;
      const playerYOffset = playerModel ? playerGroundLift : PLAYER_HEIGHT;
      playerRoot.position.set(pl.x, pgY + playerYOffset + jumpY, pl.y);
      syncPlayerKakureminoVisual();

      const facingRef = playerFacingRefStable.current;
      if (facingRef) {
        playerRoot.rotation.y = THREE.MathUtils.lerp(
          playerRoot.rotation.y,
          facingRef.current,
          1 - Math.exp(-14 * dt)
        );
      }

      if (playerAnimCtrl) {
        const sprinting = playerSprintRefStable.current?.current ?? false;
        const playerSpeed =
          Math.hypot(pl.x - lastPlayerX, pl.y - lastPlayerY) / Math.max(dt, 0.001);
        const moving = playerSpeed > 0.35;
        let mode = "idle";
        if (moving && sprinting) {
          mode = "run";
          if (playerAnimCtrl.setRunTimeScale) {
            playerAnimCtrl.setRunTimeScale(
              MOE_SNAKE_RUN_CLIP_DURATION_SEC / MOE_PLAYER_RUN_BOB_CYCLE_SEC
            );
          }
        } else if (moving) {
          mode = "walk";
          if (playerAnimCtrl.setWalkTimeScale) {
            playerAnimCtrl.setWalkTimeScale(
              MOE_SNAKE_WALK_CLIP_DURATION_SEC / MOE_PLAYER_WALK_BOB_CYCLE_SEC
            );
          }
        }
        if (playerAnimCtrl.getMode() !== mode) {
          playerAnimCtrl.setMode(mode);
        }
        lastPlayerX = pl.x;
        lastPlayerY = pl.y;
      }

      const petGY = heightAt(pt.x, pt.y);
      let petGroundY = petGY + petGroundLift + petFloatLift;
      const inCombatCharge = duelNow?.phase === "simultaneous_charge";
      const nowMs = performance.now();
      const petSettling =
        petPostCombatUntil > 0 && nowMs < petPostCombatUntil;
      if (inCombatCharge) {
        petPostCombatUntil = 0;
        petPostCombatPos = null;
        petPostCombatYaw = null;
        if (petCombatGroundY == null) petCombatGroundY = petGY + petGroundLift;
        petGroundY = petCombatGroundY;
        if (petCombatPosLock == null) {
          petCombatPosLock = new THREE.Vector3(pt.x, petGroundY, pt.y);
        }
      } else {
        if (petCombatPosLock) {
          petPostCombatPos = petCombatPosLock.clone();
          petPostCombatYaw = petRoot?.rotation.y ?? petMesh.rotation.y;
          petPostCombatUntil = nowMs + POST_COMBAT_SETTLE_MS;
          petCombatPosLock = null;
        }
        petCombatGroundY = null;
      }
      if (petRoot) {
        if (inCombatCharge && petCombatPosLock) {
          petRoot.position.copy(petCombatPosLock);
        } else if (petSettling && petPostCombatPos) {
          petRoot.position.copy(petPostCombatPos);
        } else {
          petRoot.position.set(pt.x, petGroundY, pt.y);
        }
        petRoot.traverse((obj) => {
          if (obj.userData?.pickProxy) {
            obj.visible = !inCombatCharge && !petSettling;
          }
        });
      } else if (petSettling && petPostCombatPos) {
        petMesh.position.set(
          petPostCombatPos.x,
          petPostCombatPos.y + 0.55,
          petPostCombatPos.z
        );
      } else {
        petMesh.position.set(pt.x, petGroundY + 0.55, pt.y);
      }

      const showPhoenixTailFire =
        petIdStable.current === "mystery_dragon" &&
        petDragonVisualFormStable.current === 2 &&
        !!petRoot;
      phoenixTailFire.setEnabled(showPhoenixTailFire);
      if (showPhoenixTailFire) {
        phoenixTailFire.update(dt, petRoot);
      }

      syncPopups(pops || []);

      const overlayOut = overlayProjectRefStable.current;
      if (overlayOut) {
        const el = renderer.domElement;
        const ow = el.clientWidth;
        const oh = el.clientHeight;
        const petBodyLift =
          petModelHeightForId(petIdStable.current) * 0.62 + petFloatLift;
        overlayOut.current = {
          ready: ow > 0 && oh > 0,
          width: ow,
          height: oh,
          petBodyLift,
          getPetAnchor: getPetBodyAnchor,
          getEnemyUiYs(enemyId) {
            const entry = enemyMeshes.get(enemyId);
            const en = ens.find((e) => e.id === enemyId);
            if (!en) return null;
            const gy = entry?.pickAnchor?.groundY ?? heightAt(en.x, en.y);
            const ys = moe3dEnemyUiWorldYs(entry, en.key, gy);
            const pos = entry?.pickAnchor
              ? { x: entry.pickAnchor.x, z: entry.pickAnchor.z }
              : { x: en.x, z: en.y };
            return { ...pos, ...ys };
          },
          project(worldX, worldZ, yOffset) {
            const gy = heightAt(worldX, worldZ);
            overlayProjVec.set(worldX, gy + yOffset, worldZ);
            overlayProjVec.project(camera);
            return {
              x: (overlayProjVec.x * 0.5 + 0.5) * ow,
              y: (-overlayProjVec.y * 0.5 + 0.5) * oh,
              visible:
                overlayProjVec.z >= -1 && overlayProjVec.z <= 1,
            };
          },
          projectAt(worldX, worldY, worldZ) {
            overlayProjVec.set(worldX, worldY, worldZ);
            overlayProjVec.project(camera);
            return {
              x: (overlayProjVec.x * 0.5 + 0.5) * ow,
              y: (-overlayProjVec.y * 0.5 + 0.5) * oh,
              visible:
                overlayProjVec.z >= -1 && overlayProjVec.z <= 1,
            };
          },
        };
      }

      const focus = playerRoot.position.clone();
      const desiredCam = focus
        .clone()
        .add(cameraOffsetFromOrbit(camYaw, camPitch, camDistance));
      const camLerp = 1 - Math.exp(-10 * dt);
      camera.position.lerp(desiredCam, camLerp);
      camera.lookAt(focus);

      const yawOut = cameraYawRefStable.current;
      if (yawOut) yawOut.current = camYaw;

      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      petSwapRef.current = null;
      petLoadGen += 1;
      disposePetModel();
      phoenixTailFire.dispose();
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("contextmenu", blockContextMenu, { capture: true });
      mount.removeEventListener("contextmenu", blockContextMenu, { capture: true });
      document.removeEventListener("contextmenu", onDocContextMenu, { capture: true });
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("wheel", onWheel);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      applyHiddenShowcaseRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 min-h-dvh w-full select-none"
      onContextMenu={(e) => e.preventDefault()}
      aria-hidden={false}
    />
  );
}
