"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  applyModelTint,
  createBisonAnimController,
  createSnakeAnimController,
  fitModelToGround,
  MOE_3D_TILES_X,
  MOE_3D_TILES_Z,
  MOE_BISON_MODEL_HEIGHT,
  MOE_BISON_MODEL_URL,
  MOE_ENEMY_TINT_BY_KEY,
  MOE_MONSTER_MODEL_YAW_OFFSET,
  MOE_PET_MODEL_YAW_OFFSET,
  MOE_SNAKE_ATTACK_TIME_SCALE,
  MOE_SNAKE_RUN_SPRINT_TIME_SCALE,
  MOE_MONSTER_MODEL_HEIGHT,
  MOE_PET_MODEL_HEIGHT,
  MOE_PET_TINT_DEFAULT,
  MONSTER_MODEL_URL,
  PET_MODEL_URL,
  monsterModelUrlForKey,
  pickSnakeAttackClip,
  moe3dYawFaceTarget,
  moe3dEnemyDisplayScale,
  moe3dBossAreaLayout,
  moe3dPetHousePosition,
} from "@/lib/moeField3DModels";

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
function resolveBossAreaOnTerrain(raycaster, terrainGroup, halfW, halfD) {
  const layout = moe3dBossAreaLayout(halfW, halfD);
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
    bossArea: layout,
  };
}

function attachEnemyPickTarget(root, enemyId, isBigBoss, isSuperBoss = false) {
  root.userData.enemyId = enemyId;
  root.traverse((obj) => {
    if (obj.isMesh) obj.userData.enemyId = enemyId;
  });
  // 中・超ボスはスケールが大きく透明当たりが隣の敵を吸うため、モデル mesh のみ
  if (isBigBoss || isSuperBoss) return;

  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const h = Math.max(size.y, 0.85);
  const r = Math.max(size.x, size.z, 0.45) * 0.52;
  const pick = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r * 0.92, h, 12),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  pick.position.y = h * 0.48;
  pick.userData.enemyId = enemyId;
  pick.userData.pickProxy = true;
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

const PICK_SCREEN_MAX_PX = 44;
const PICK_PROXY_PENALTY_PX = 14;

/** レイキャスト全ヒットから、クリック位置に最も近い交点の敵／ペットを選ぶ */
function resolvePickFromHits(hits, pointer, camera, rect) {
  const cx = ((pointer.x + 1) / 2) * rect.width;
  const cy = ((-pointer.y + 1) / 2) * rect.height;
  const projected = new THREE.Vector3();

  let bestEnemyId = null;
  let bestEnemyScore = Infinity;
  let bestPet = false;
  let bestPetScore = Infinity;

  for (const hit of hits) {
    let obj = hit.object;
    let enemyId = null;
    let isPet = false;
    while (obj) {
      if (obj.userData.enemyId != null) {
        enemyId = obj.userData.enemyId;
        break;
      }
      if (obj.userData.isPet) {
        isPet = true;
        break;
      }
      obj = obj.parent;
    }
    if (enemyId == null && !isPet) continue;

    projected.copy(hit.point).project(camera);
    if (projected.z > 1) continue;
    const sx = (projected.x * 0.5 + 0.5) * rect.width;
    const sy = (-projected.y * 0.5 + 0.5) * rect.height;
    const screenDist = Math.hypot(sx - cx, sy - cy);
    const proxyPenalty = hit.object.userData.pickProxy ? PICK_PROXY_PENALTY_PX : 0;
    const score = screenDist + proxyPenalty;
    if (score > PICK_SCREEN_MAX_PX) continue;

    if (enemyId != null && score < bestEnemyScore) {
      bestEnemyScore = score;
      bestEnemyId = enemyId;
    }
    if (isPet && score < bestPetScore) {
      bestPetScore = score;
      bestPet = true;
    }
  }

  if (bestPet && bestPetScore <= bestEnemyScore) {
    return { type: "pet" };
  }
  if (bestEnemyId != null) {
    return { type: "enemy", id: bestEnemyId };
  }
  return null;
}

/** 中・超ボス：同期済みアンカー＋表示スケールから画面楕円ヒット判定 */
function bossScreenHitScore(cx, cy, camera, rect, en, entry) {
  if (!entry?.pickAnchor) return null;
  const scale = moe3dEnemyDisplayScale(en);
  const modelH =
    (en.key === "elvin_bison" || en.key === "auzun_bura"
      ? MOE_BISON_MODEL_HEIGHT
      : MOE_MONSTER_MODEL_HEIGHT) * scale;
  const { x, groundY, z } = entry.pickAnchor;
  const foot = new THREE.Vector3(x, groundY, z);
  const body = foot.clone().add(new THREE.Vector3(0, modelH * 0.45, 0));
  foot.project(camera);
  body.project(camera);
  if (foot.z > 1 && body.z > 1) return null;

  const fx = (foot.x * 0.5 + 0.5) * rect.width;
  const fy = (-foot.y * 0.5 + 0.5) * rect.height;
  const bx = (body.x * 0.5 + 0.5) * rect.width;
  const by = (-body.y * 0.5 + 0.5) * rect.height;
  const heightPx = Math.max(28, Math.abs(by - fy));
  const widthPx = heightPx * (en.superBoss ? 0.95 : 0.82);
  const mx = (fx + bx) * 0.5;
  const my = (fy + by) * 0.5;
  const pad = en.superBoss ? 18 : 12;
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
function pickEntityNearPointer(pointer, camera, rect, enList, petPos, thresholdPx = 32) {
  const cx = ((pointer.x + 1) / 2) * rect.width;
  const cy = ((-pointer.y + 1) / 2) * rect.height;
  const projected = new THREE.Vector3();
  let best = null;
  let bestDist = thresholdPx;

  for (const en of enList) {
    if (en.hp <= 0) continue;
    projected.set(en.x, 0.6, en.y);
    projected.project(camera);
    if (projected.z > 1) continue;
    const sx = (projected.x * 0.5 + 0.5) * rect.width;
    const sy = (-projected.y * 0.5 + 0.5) * rect.height;
    const d = Math.hypot(sx - cx, sy - cy);
    if (d < bestDist) {
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
        best = { type: "pet" };
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
  battlePopups,
  onEnemyClick,
  onPetClick,
  targetEnemyId,
  petFocused,
  petLabel,
  onMapReady,
  cameraYawRef,
  playerFacingRef,
  playerPosRef,
  playerJumpRef,
  playerSprintRef,
  petRunAnimRef,
  petPosRef,
  petCommandRef,
  petHoldYawRef,
  duelRef,
  petStrikeUntilRef,
  petAttackMsRef,
  enemyStrikeUntilRef,
  enemyAttackMsRef,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({ enemies, battlePopups, targetEnemyId, petFocused, petLabel });
  const onEnemyClickRef = useRef(onEnemyClick);
  const onPetClickRef = useRef(onPetClick);
  const onMapReadyRef = useRef(onMapReady);
  const cameraYawRefStable = useRef(cameraYawRef);
  const playerFacingRefStable = useRef(playerFacingRef);
  const playerPosRefStable = useRef(playerPosRef);
  const playerJumpRefStable = useRef(playerJumpRef);
  const playerSprintRefStable = useRef(playerSprintRef);
  const petRunAnimRefStable = useRef(petRunAnimRef);
  const petPosRefStable = useRef(petPosRef);
  const petCommandRefStable = useRef(petCommandRef);
  const petHoldYawRefStable = useRef(petHoldYawRef);
  const duelRefStable = useRef(duelRef);
  const petStrikeUntilRefStable = useRef(petStrikeUntilRef);
  const petAttackMsRefStable = useRef(petAttackMsRef);
  const enemyStrikeUntilRefStable = useRef(enemyStrikeUntilRef);
  const enemyAttackMsRefStable = useRef(enemyAttackMsRef);

  stateRef.current = { enemies, battlePopups, targetEnemyId, petFocused, petLabel };
  onEnemyClickRef.current = onEnemyClick;
  onPetClickRef.current = onPetClick;
  onMapReadyRef.current = onMapReady;
  cameraYawRefStable.current = cameraYawRef;
  playerFacingRefStable.current = playerFacingRef;
  playerPosRefStable.current = playerPosRef;
  playerJumpRefStable.current = playerJumpRef;
  playerSprintRefStable.current = playerSprintRef;
  petRunAnimRefStable.current = petRunAnimRef;
  petPosRefStable.current = petPosRef;
  petCommandRefStable.current = petCommandRef;
  petHoldYawRefStable.current = petHoldYawRef;
  duelRefStable.current = duelRef;
  petStrikeUntilRefStable.current = petStrikeUntilRef;
  petAttackMsRefStable.current = petAttackMsRef;
  enemyStrikeUntilRefStable.current = enemyStrikeUntilRef;
  enemyAttackMsRefStable.current = enemyAttackMsRef;

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

    /** プレイヤー □ */
    const playerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 1.4, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x6366f1 })
    );
    playerMesh.castShadow = true;
    scene.add(playerMesh);

    /** ペット ○（glb 読込前のプレースホルダ） */
    const petMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24 })
    );
    petMesh.castShadow = true;
    attachPetPickTarget(petMesh);
    scene.add(petMesh);

    let petRoot = null;
    let petMixer = null;
    let petAnimCtrl = null;
    let lastPetX = 0;
    let lastPetY = 0;
    let lastPetStrikeUntil = 0;
    let lastEnemyStrikeUntil = 0;
    const enemyAnimModes = new Map();

    let monsterAssets = new Map();
    const animationMixers = [];

    camera.position.set(0, 14, 18);
    camera.lookAt(0, 0, 0);

    const enemyMeshes = new Map(); // id -> { root, mixer, placeholder }
    const enemyGroup = new THREE.Group();
    scene.add(enemyGroup);

    const popupSprites = new Map();
    const popupGroup = new THREE.Group();
    scene.add(popupGroup);

    let targetMarker = null;
    let targetHpSprite = null;
    let petLabelSprite = null;
    let petFocusMarker = null;
    const enemyNameSprites = new Map();

    function syncEnemyNameLabels(enList) {
      const seen = new Set();
      for (const en of enList) {
        if (en.hp <= 0) continue;
        seen.add(en.id);
        const line1 = `${en.superBoss ? "◆ " : en.midBoss ? "★ " : ""}${String(en.name ?? "")}`;
        let sprite = enemyNameSprites.get(en.id);
        if (!sprite) {
          const canvas2d = document.createElement("canvas");
          canvas2d.width = 256;
          canvas2d.height = 32;
          const tex = new THREE.CanvasTexture(canvas2d);
          const mat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            depthTest: false,
          });
          sprite = new THREE.Sprite(mat);
          sprite.scale.set(3.2, 0.42, 1);
          sprite.renderOrder = 997;
          enemyNameSprites.set(en.id, sprite);
          popupGroup.add(sprite);
        }
        const canvas2d = sprite.material.map.image;
        const ctx = canvas2d.getContext("2d");
        ctx.clearRect(0, 0, 256, 32);
        ctx.textAlign = "center";
        ctx.font = "bold 16px sans-serif";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeText(line1, 128, 20);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(line1, 128, 20);
        sprite.material.map.needsUpdate = true;
        const gy = heightAt(en.x, en.y);
        sprite.position.set(en.x, gy + 1.78, en.y);
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
      const hpLine = `${Math.ceil(en.hp)}/${en.hpMax}`;
      if (!targetHpSprite) {
        const canvas2d = document.createElement("canvas");
        canvas2d.width = 256;
        canvas2d.height = 48;
        const tex = new THREE.CanvasTexture(canvas2d);
        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          depthTest: false,
        });
        targetHpSprite = new THREE.Sprite(mat);
        targetHpSprite.scale.set(3.0, 0.58, 1);
        targetHpSprite.renderOrder = 998;
        popupGroup.add(targetHpSprite);
      }
      const canvas2d = targetHpSprite.material.map.image;
      const ctx = canvas2d.getContext("2d");
      ctx.clearRect(0, 0, 256, 48);
      const barW = 132;
      const barH = 10;
      const barX = 96;
      const barY = 6;
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle =
        hpPctUi <= 25 ? "#dc2626" : hpPctUi <= 50 ? "#ef4444" : "#f87171";
      ctx.fillRect(barX, barY, barW * hpPct, barH);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeText(hpLine, barX + 4, barY + barH + 14);
      ctx.fillStyle = "#fecaca";
      ctx.fillText(hpLine, barX + 4, barY + barH + 14);
      targetHpSprite.material.map.needsUpdate = true;
      const gy = heightAt(en.x, en.y);
      targetHpSprite.position.set(en.x, gy + 1.48, en.y);
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
      const gy = heightAt(en.x, en.y);
      const bob = Math.sin(performance.now() * 0.006) * 0.06;
      targetMarker.position.set(en.x, gy + 1.95 + bob, en.y);
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
        petLabelSprite.scale.set(3.5, 1.28, 1);
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
      const line2 = `Lv.${label.level ?? 1}`;
      const hpLine = `HP ${Math.ceil(label.hp)}/${label.hpMax}`;
      const canvas2d = petLabelSprite.material.map.image;
      const ctx = canvas2d.getContext("2d");
      ctx.clearRect(0, 0, 256, 92);
      ctx.textAlign = "center";
      ctx.font = "bold 15px sans-serif";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeText(line1, 128, 20);
      ctx.fillStyle = "#ecfdf5";
      ctx.fillText(line1, 128, 20);
      ctx.font = "bold 16px sans-serif";
      ctx.strokeText(line2, 128, 40);
      ctx.fillStyle = "#6ee7b7";
      ctx.fillText(line2, 128, 40);
      const barX = 44;
      const barY = 48;
      const barW = 168;
      const barH = 10;
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle =
        hpPctUi <= 25 ? "#15803d" : hpPctUi <= 50 ? "#22c55e" : "#4ade80";
      ctx.fillRect(barX, barY, barW * hpPct, barH);
      ctx.strokeStyle = "rgba(167,243,208,0.45)";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);
      ctx.font = "bold 12px sans-serif";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeText(hpLine, 128, 74);
      ctx.fillStyle = "#bbf7d0";
      ctx.fillText(hpLine, 128, 74);
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
    let midBossTerrainPos = null;
    let superBossTerrainPos = null;

    const canvas = renderer.domElement;
    canvas.style.touchAction = "none";
    canvas.oncontextmenu = () => false;

    const blockContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const onPointerDown = (e) => {
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
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
      const pickRoots = [...enemyGroup.children];
      if (petRoot) pickRoots.push(petRoot);
      else pickRoots.push(petMesh);
      const hits = raycaster.intersectObjects(pickRoots, true);
      const picked = resolvePickFromHits(hits, pointer, camera, rect);
      if (picked?.type === "enemy") {
        onEnemyClickRef.current?.(picked.id);
        return;
      }
      if (picked?.type === "pet") {
        onPetClickRef.current?.();
        return;
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
      const fallback = pickEntityNearPointer(
        pointer,
        camera,
        rect,
        stateRef.current.enemies,
        petPosNow
      );
      if (fallback?.type === "enemy") {
        onEnemyClickRef.current?.(fallback.id);
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
        const tilesX = MOE_3D_TILES_X;
        const tilesZ = MOE_3D_TILES_Z;

        for (let iz = 0; iz < tilesZ; iz++) {
          for (let ix = 0; ix < tilesX; ix++) {
            const tile = base.clone(true);
            tile.position.set(ix * tileWidth, 0, iz * tileDepth);
            tile.traverse((obj) => {
              if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
              }
            });
            terrainGroup.add(tile);
          }
        }
        terrainGroup.position.set(
          -(tileWidth * (tilesX - 1)) / 2,
          0,
          -(tileDepth * (tilesZ - 1)) / 2
        );
        terrainGroup.updateMatrixWorld(true);
        const playBounds = terrainPlayBoundsFromGroup(terrainGroup);
        const hills = resolveBossAreaOnTerrain(
          raycaster,
          terrainGroup,
          playBounds.halfW,
          playBounds.halfD
        );
        midBossTerrainPos = hills.midBossPos;
        superBossTerrainPos = hills.superBossPos;
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

        onMapReadyRef.current?.({
          ...playBounds,
          midBossPos: midBossTerrainPos,
          superBossPos: superBossTerrainPos,
        });
      },
      undefined,
      (err) => {
        console.error("3D map load failed:", err);
        mapReady = true;
        onMapReadyRef.current?.();
      }
    );

    loader.load(
      PET_MODEL_URL,
      (gltf) => {
        if (disposed) return;
        petRoot = SkeletonUtils.clone(gltf.scene);
        applyModelTint(petRoot, MOE_PET_TINT_DEFAULT);
        fitModelToGround(petRoot, MOE_PET_MODEL_HEIGHT);
        enableShadows(petRoot);
        attachPetPickTarget(petRoot);
        scene.add(petRoot);
        petMesh.visible = false;
        petMixer = new THREE.AnimationMixer(petRoot);
        petAnimCtrl = createSnakeAnimController(petMixer, gltf.animations, {
          attackLoop: false,
        });
        const attackMsRef = petAttackMsRefStable.current;
        if (attackMsRef) {
          attackMsRef.current = petAnimCtrl.attackDurationMs;
        }
        animationMixers.push(petMixer);
      },
      undefined,
      (err) => console.error("3D pet model load failed:", err)
    );

    for (const modelUrl of [MONSTER_MODEL_URL, MOE_BISON_MODEL_URL]) {
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

    function heightAt(x, z) {
      if (!mapReady) return 0;
      return groundY(raycaster, terrainGroup, x, z);
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
      attachEnemyPickTarget(mesh, enId, isBig, superBoss);
      return { root: mesh, mixer: null, animCtrl: null, placeholder: true };
    }

    function createEnemyModel(en) {
      const modelUrl = monsterModelUrlForKey(en.key);
      const asset = monsterAssets.get(modelUrl);
      if (!asset) return null;
      const tint = MOE_ENEMY_TINT_BY_KEY[en.key] ?? 0xef4444;
      const isBison = modelUrl === MOE_BISON_MODEL_URL;
      const root = SkeletonUtils.clone(asset.scene);
      if (en.key === "auzun_bura") {
        applyModelTint(root, tint);
      } else if (!isBison) {
        applyModelTint(root, tint);
      }
      fitModelToGround(
        root,
        isBison ? MOE_BISON_MODEL_HEIGHT : MOE_MONSTER_MODEL_HEIGHT
      );
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
        isBison,
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
      for (const en of enList) {
        seen.add(en.id);
        const modelUrl = monsterModelUrlForKey(en.key);
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
          (entry.placeholder || entry.modelUrl !== modelUrl)
        ) {
          removeEnemyEntry(en.id, entry);
          entry =
            createEnemyModel(en) ??
            createEnemyPlaceholder(en.id, tint, bossFlags);
          enemyMeshes.set(en.id, entry);
          enemyGroup.add(entry.root);
        }
        let px = en.x;
        let pz = en.y;
        if (en.superBoss && superBossTerrainPos) {
          px = superBossTerrainPos.x;
          pz = superBossTerrainPos.y;
        } else if (en.midBoss && midBossTerrainPos) {
          px = midBossTerrainPos.x;
          pz = midBossTerrainPos.y;
        } else if (mapReady && !isOverTerrain(raycaster, terrainGroup, px, pz)) {
          const snapped = snapToNearestTerrain(raycaster, terrainGroup, px, pz);
          px = snapped.x;
          pz = snapped.z;
        }
        const gy = heightAt(px, pz);
        const yOff = entry.placeholder ? 0.6 : 0;
        entry.root.position.set(px, gy + yOff, pz);
        entry.root.scale.setScalar(moe3dEnemyDisplayScale(en));
        entry.root.visible = en.hp > 0;
        entry.pickAnchor = { x: px, groundY: gy + yOff, z: pz };
      }
      for (const [id, entry] of enemyMeshes) {
        if (!seen.has(id)) {
          removeEnemyEntry(id, entry);
          enemyMeshes.delete(id);
        }
      }
    }

    function syncPetAnimation(pt, dt) {
      if (!petAnimCtrl) return;
      const duel = duelRefStable.current?.current;
      const strikeUntil = petStrikeUntilRefStable.current?.current ?? 0;
      const now = performance.now();
      const striking = now < strikeUntil;

      const petSpeed =
        Math.hypot(pt.x - lastPetX, pt.y - lastPetY) / Math.max(dt, 0.001);
      const petMoving = petSpeed > 0.2;
      const petRunForced = petRunAnimRefStable.current?.current ?? false;
      const playerSprinting = playerSprintRefStable.current?.current ?? false;
      const petCmd = petCommandRefStable.current?.current ?? "follow";
      const holdStill = petCmd === "wait" || petCmd === "sit";

      let baseMode = "idle";
      if (duel?.phase === "approach") {
        baseMode = "run";
      } else if (
        !holdStill &&
        (petMoving || petRunForced) &&
        duel?.phase !== "simultaneous_charge" &&
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
        petAnimCtrl.setMode("attack", {
          restart: true,
          afterAttack: baseMode,
        });
        lastPetStrikeUntil = strikeUntil;
      } else if (!striking && petAnimCtrl.getMode() !== baseMode) {
        petAnimCtrl.setMode(baseMode);
      }

      lastPetX = pt.x;
      lastPetY = pt.y;
    }

    function syncEnemyAnimations() {
      const duel = duelRefStable.current?.current;
      const strikeUntil = enemyStrikeUntilRefStable.current?.current ?? 0;
      const now = performance.now();
      const striking = now < strikeUntil;

      for (const [id, entry] of enemyMeshes) {
        if (!entry.animCtrl) continue;
        const isDuelEnemy =
          duel?.phase === "simultaneous_charge" && duel.enemyId === id;

        if (!isDuelEnemy) {
          if (enemyAnimModes.get(id) !== "idle") {
            entry.animCtrl.setMode("idle");
            enemyAnimModes.set(id, "idle");
          }
          continue;
        }

        if (isDuelEnemy && strikeUntil > lastEnemyStrikeUntil) {
          const useStrong = entry.isBison && (entry.strikeCount ?? 0) % 2 === 1;
          entry.strikeCount = (entry.strikeCount ?? 0) + 1;
          entry.animCtrl.setMode("attack", {
            restart: true,
            afterAttack: "idle",
            variant: useStrong ? "strong" : "weak",
          });
          if (entry.isBison && entry.animCtrl?.attackDurationMs) {
            const msRef = enemyAttackMsRefStable.current;
            if (msRef) msRef.current = entry.animCtrl.attackDurationMs;
          }
          lastEnemyStrikeUntil = strikeUntil;
          enemyAnimModes.set(id, "attack");
        } else if (isDuelEnemy && !striking && enemyAnimModes.get(id) !== "idle") {
          entry.animCtrl.setMode("idle");
          enemyAnimModes.set(id, "idle");
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

      if (!inDuelFace) {
        if (petRoot) petRoot.rotation.y = playerMesh.rotation.y;
        else petMesh.rotation.y = playerMesh.rotation.y;
        return;
      }

      const enemy = ens.find((e) => e.id === duel.enemyId);
      if (!enemy || enemy.hp <= 0) return;

      const petYaw =
        moe3dYawFaceTarget(pt.x, pt.y, enemy.x, enemy.y) +
        MOE_PET_MODEL_YAW_OFFSET;
      const enemyYaw =
        moe3dYawFaceTarget(enemy.x, enemy.y, pt.x, pt.y) +
        MOE_MONSTER_MODEL_YAW_OFFSET;
      const t = 1 - Math.exp(-22 * dt);

      if (petRoot) {
        petRoot.rotation.y = THREE.MathUtils.lerp(
          petRoot.rotation.y,
          petYaw,
          t
        );
      } else {
        petMesh.rotation.y = THREE.MathUtils.lerp(
          petMesh.rotation.y,
          petYaw,
          t
        );
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

    function syncPopups(pops) {
      const seen = new Set();
      for (const pop of pops) {
        seen.add(pop.id);
        let sprite = popupSprites.get(pop.id);
        if (!sprite) {
          const canvas2d = document.createElement("canvas");
          canvas2d.width = 128;
          canvas2d.height = 64;
          const tex = new THREE.CanvasTexture(canvas2d);
          const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
          sprite = new THREE.Sprite(mat);
          sprite.scale.set(2.5, 1.25, 1);
          sprite.userData.popId = pop.id;
          popupSprites.set(pop.id, sprite);
          popupGroup.add(sprite);
        }
        const canvas2d = sprite.material.map.image;
        const ctx = canvas2d.getContext("2d");
        ctx.clearRect(0, 0, 128, 64);
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = pop.fromEnemy ? "#60a5fa" : "#ef4444";
        ctx.fillText(String(pop.value), 64, 42);
        sprite.material.map.needsUpdate = true;
        const gy = heightAt(pop.x, pop.y);
        sprite.position.set(pop.x, gy + 2.2, pop.y);
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

    const tick = () => {
      if (disposed) return;
      animId = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);

      const { enemies: ens, battlePopups: pops, targetEnemyId: targetId, petFocused: petFocus, petLabel: petLbl } =
        stateRef.current;
      const pl = playerPosRefStable.current?.current ?? { x: 0, y: 0 };
      const pt = petPosRefStable.current?.current ?? { x: 0, y: 0 };

      syncEnemyMeshes(ens);
      syncEnemyNameLabels(ens);
      syncTargetHpBar(ens, targetId);
      syncPetLabel(pt, petLbl, petFocus);
      syncPopups(pops || []);
      syncTargetMarker(ens, targetId);
      syncPetAnimation(pt, dt);
      syncEnemyAnimations();
      syncDuelFacing(ens, pt, dt);

      for (const mixer of animationMixers) {
        mixer.update(dt);
      }

      const pgY = heightAt(pl.x, pl.y);
      const jumpY = playerJumpRefStable.current?.current?.offset ?? 0;
      playerMesh.position.set(pl.x, pgY + PLAYER_HEIGHT + jumpY, pl.y);

      const facingRef = playerFacingRefStable.current;
      if (facingRef) {
        playerMesh.rotation.y = THREE.MathUtils.lerp(
          playerMesh.rotation.y,
          facingRef.current,
          1 - Math.exp(-14 * dt)
        );
      }

      const petGY = heightAt(pt.x, pt.y);
      if (petRoot) {
        petRoot.position.set(pt.x, petGY, pt.y);
      } else {
        petMesh.position.set(pt.x, petGY + 0.55, pt.y);
      }

      const focus = playerMesh.position.clone();
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
