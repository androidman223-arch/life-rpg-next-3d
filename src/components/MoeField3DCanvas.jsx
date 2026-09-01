"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { formatEnemyLevelUi } from "@/data/moeMeerimEnemies";
import {
  applyModelTint,
  createSnakeAnimController,
  fitModelToGround,
  MOE_3D_HALF_D,
  MOE_3D_HALF_W,
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
  pickSnakeAttackClip,
  moe3dYawFaceTarget,
} from "@/lib/moeField3DModels";

const MAP_URL = "/assets/map/3D_MoeMapField02.glb";
/** 各方向の最低タイル数（従来どおり横3枚以上） */
const TILE_GRID_MIN = 3;
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
  targetEnemyId,
  onMapReady,
  cameraYawRef,
  playerFacingRef,
  playerPosRef,
  playerJumpRef,
  playerSprintRef,
  petRunAnimRef,
  petPosRef,
  duelRef,
  petStrikeUntilRef,
  petAttackMsRef,
  enemyStrikeUntilRef,
  enemyAttackMsRef,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({ enemies, battlePopups, targetEnemyId });
  const onEnemyClickRef = useRef(onEnemyClick);
  const onMapReadyRef = useRef(onMapReady);
  const cameraYawRefStable = useRef(cameraYawRef);
  const playerFacingRefStable = useRef(playerFacingRef);
  const playerPosRefStable = useRef(playerPosRef);
  const playerJumpRefStable = useRef(playerJumpRef);
  const playerSprintRefStable = useRef(playerSprintRef);
  const petRunAnimRefStable = useRef(petRunAnimRef);
  const petPosRefStable = useRef(petPosRef);
  const duelRefStable = useRef(duelRef);
  const petStrikeUntilRefStable = useRef(petStrikeUntilRef);
  const petAttackMsRefStable = useRef(petAttackMsRef);
  const enemyStrikeUntilRefStable = useRef(enemyStrikeUntilRef);
  const enemyAttackMsRefStable = useRef(enemyAttackMsRef);

  stateRef.current = { enemies, battlePopups, targetEnemyId };
  onEnemyClickRef.current = onEnemyClick;
  onMapReadyRef.current = onMapReady;
  cameraYawRefStable.current = cameraYawRef;
  playerFacingRefStable.current = playerFacingRef;
  playerPosRefStable.current = playerPosRef;
  playerJumpRefStable.current = playerJumpRef;
  playerSprintRefStable.current = playerSprintRef;
  petRunAnimRefStable.current = petRunAnimRef;
  petPosRefStable.current = petPosRef;
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
    scene.add(petMesh);

    let petRoot = null;
    let petMixer = null;
    let petAnimCtrl = null;
    let lastPetX = 0;
    let lastPetY = 0;
    let lastPetStrikeUntil = 0;
    let lastEnemyStrikeUntil = 0;
    const enemyAnimModes = new Map();

    let monsterTemplate = null;
    let monsterClips = [];
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
    const enemyNameSprites = new Map();

    function syncEnemyNameLabels(enList) {
      const seen = new Set();
      for (const en of enList) {
        if (en.hp <= 0) continue;
        seen.add(en.id);
        const line1 = String(en.name ?? "");
        const line2 = `Lv.${formatEnemyLevelUi(en.level)}`;
        let sprite = enemyNameSprites.get(en.id);
        if (!sprite) {
          const canvas2d = document.createElement("canvas");
          canvas2d.width = 256;
          canvas2d.height = 64;
          const tex = new THREE.CanvasTexture(canvas2d);
          const mat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            depthTest: false,
          });
          sprite = new THREE.Sprite(mat);
          sprite.scale.set(3.4, 0.9, 1);
          sprite.renderOrder = 998;
          enemyNameSprites.set(en.id, sprite);
          popupGroup.add(sprite);
        }
        const canvas2d = sprite.material.map.image;
        const ctx = canvas2d.getContext("2d");
        ctx.clearRect(0, 0, 256, 64);
        ctx.textAlign = "center";
        ctx.font = "bold 15px sans-serif";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeText(line1, 128, 22);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(line1, 128, 22);
        ctx.font = "bold 17px sans-serif";
        ctx.strokeText(line2, 128, 48);
        ctx.fillStyle = "#fde047";
        ctx.fillText(line2, 128, 48);
        sprite.material.map.needsUpdate = true;
        const gy = heightAt(en.x, en.y);
        sprite.position.set(en.x, gy + 1.32, en.y);
        sprite.visible = true;
      }
      for (const [id, sprite] of enemyNameSprites) {
        if (!seen.has(id)) sprite.visible = false;
      }
    }

    function createTargetMarker() {
      const canvas2d = document.createElement("canvas");
      canvas2d.width = 64;
      canvas2d.height = 64;
      const ctx = canvas2d.getContext("2d");
      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4;
      ctx.strokeText("▼", 32, 36);
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("▼", 32, 36);
      const tex = new THREE.CanvasTexture(canvas2d);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(1.1, 1.1, 1);
      sprite.renderOrder = 999;
      return sprite;
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
      targetMarker.position.set(en.x, gy + 1.05 + bob, en.y);
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
      const hits = raycaster.intersectObjects(enemyGroup.children, true);
      for (const hit of hits) {
        let obj = hit.object;
        while (obj && obj.userData.enemyId == null) obj = obj.parent;
        if (obj?.userData.enemyId != null) {
          onEnemyClickRef.current?.(obj.userData.enemyId);
          break;
        }
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
        const targetW = MOE_3D_HALF_W * 2;
        const targetD = MOE_3D_HALF_D * 2;
        const tilesX = Math.max(
          TILE_GRID_MIN,
          Math.ceil(targetW / tileWidth)
        );
        const tilesZ = Math.max(
          TILE_GRID_MIN,
          Math.ceil(targetD / tileDepth)
        );

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
        mapReady = true;
        onMapReadyRef.current?.(playBounds);
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
        petRoot.userData.isPet = true;
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

    loader.load(
      MONSTER_MODEL_URL,
      (gltf) => {
        if (disposed) return;
        monsterTemplate = gltf.scene;
        monsterClips = gltf.animations;
        const attackMsRef = enemyAttackMsRefStable.current;
        const attackClip = pickSnakeAttackClip(monsterClips);
        if (attackMsRef && attackClip) {
          attackMsRef.current = Math.max(
            (attackClip.duration * 1000) / MOE_SNAKE_ATTACK_TIME_SCALE,
            400
          );
        }
        syncEnemyMeshes(stateRef.current.enemies);
      },
      undefined,
      (err) => console.error("3D monster model load failed:", err)
    );

    function heightAt(x, z) {
      if (!mapReady) return 0;
      return groundY(raycaster, terrainGroup, x, z);
    }

    function createEnemyPlaceholder(enId, tintHex) {
      const mesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.55, 1.2, 4),
        new THREE.MeshStandardMaterial({ color: tintHex })
      );
      mesh.castShadow = true;
      mesh.userData.enemyId = enId;
      return { root: mesh, mixer: null, animCtrl: null, placeholder: true };
    }

    function createEnemyModel(enId, tintHex) {
      const root = SkeletonUtils.clone(monsterTemplate);
      applyModelTint(root, tintHex);
      fitModelToGround(root, MOE_MONSTER_MODEL_HEIGHT);
      enableShadows(root);
      root.userData.enemyId = enId;
      let mixer = null;
      let animCtrl = null;
      if (monsterClips.length > 0) {
        mixer = new THREE.AnimationMixer(root);
        animCtrl = createSnakeAnimController(mixer, monsterClips, {
          attackLoop: false,
        });
        animationMixers.push(mixer);
      }
      return { root, mixer, animCtrl, placeholder: false };
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
        const tint = MOE_ENEMY_TINT_BY_KEY[en.key] ?? 0xef4444;
        let entry = enemyMeshes.get(en.id);
        const wantModel = monsterTemplate != null;
        if (!entry) {
          entry = wantModel
            ? createEnemyModel(en.id, tint)
            : createEnemyPlaceholder(en.id, tint);
          enemyMeshes.set(en.id, entry);
          enemyGroup.add(entry.root);
        } else if (wantModel && entry.placeholder) {
          removeEnemyEntry(en.id, entry);
          entry = createEnemyModel(en.id, tint);
          enemyMeshes.set(en.id, entry);
          enemyGroup.add(entry.root);
        }
        let px = en.x;
        let pz = en.y;
        if (mapReady && !isOverTerrain(raycaster, terrainGroup, px, pz)) {
          const angle = Math.atan2(pz, px);
          for (let r = 0; r <= 90; r += 4) {
            const tx = Math.cos(angle) * r;
            const tz = Math.sin(angle) * r;
            if (isOverTerrain(raycaster, terrainGroup, tx, tz)) {
              px = tx;
              pz = tz;
              break;
            }
          }
        }
        const gy = heightAt(px, pz);
        const yOff = entry.placeholder ? 0.6 : 0;
        entry.root.position.set(px, gy + yOff, pz);
        entry.root.visible = en.hp > 0;
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

      let baseMode = "idle";
      if (duel?.phase === "approach") {
        baseMode = "run";
      } else if (
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
          entry.animCtrl.setMode("attack", {
            restart: true,
            afterAttack: "idle",
          });
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

      const { enemies: ens, battlePopups: pops, targetEnemyId: targetId } =
        stateRef.current;
      const pl = playerPosRefStable.current?.current ?? { x: 0, y: 0 };
      const pt = petPosRefStable.current?.current ?? { x: 0, y: 0 };

      syncEnemyMeshes(ens);
      syncEnemyNameLabels(ens);
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
