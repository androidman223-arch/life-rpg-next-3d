"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MAP_URL = "/assets/map/3D_MoeMapField02.glb";
const TILE_COUNT = 3;
const MOVE_SPEED = 7;
const PLAYER_HEIGHT = 1.5;
const CAM_DISTANCE = 17;
const CAM_PITCH = 0.55;
const CAM_YAW = 0;
const MOUSE_SENS = 0.004;
const PITCH_MIN = 0.12;
const PITCH_MAX = 1.35;
const DIST_MIN = 5;
const DIST_MAX = 40;

function cameraOffsetFromOrbit(yaw, pitch, distance) {
  const cosPitch = Math.cos(pitch);
  return new THREE.Vector3(
    distance * cosPitch * Math.sin(yaw),
    distance * Math.sin(pitch),
    distance * cosPitch * Math.cos(yaw)
  );
}

export default function MoeField3D() {
  const mountRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [hint, setHint] = useState("マップを読み込み中…");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let animId = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87b8e8);
    scene.fog = new THREE.Fog(0x87b8e8, 40, 120);

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

    const player = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 0.9, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a90d9 })
    );
    player.castShadow = true;
    scene.add(player);

    const keys = { w: false, a: false, s: false, d: false };
    let camYaw = CAM_YAW;
    let camPitch = CAM_PITCH;
    let camDistance = CAM_DISTANCE;
    let isCamDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k in keys) keys[k] = true;
    };
    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k in keys) keys[k] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const canvas = renderer.domElement;
    canvas.style.touchAction = "none";

    const onContextMenu = (e) => e.preventDefault();

    const onPointerDown = (e) => {
      if (e.button !== 2) return;
      isCamDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerUp = (e) => {
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

    canvas.addEventListener("contextmenu", onContextMenu);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    const raycaster = new THREE.Raycaster();
    const down = new THREE.Vector3(0, -1, 0);
    const rayOrigin = new THREE.Vector3();
    let tileWidth = 10;
    let mapHalfW = tileWidth * TILE_COUNT * 0.5;
    let mapHalfD = 10;

    const loader = new GLTFLoader();
    loader.load(
      MAP_URL,
      (gltf) => {
        if (disposed) return;

        const base = gltf.scene;
        base.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(base);
        const size = box.getSize(new THREE.Vector3());
        tileWidth = Math.max(size.x, 0.1);
        mapHalfW = (tileWidth * TILE_COUNT) / 2;
        mapHalfD = size.z / 2;

        for (let i = 0; i < TILE_COUNT; i++) {
          const tile = base.clone(true);
          tile.position.x = i * tileWidth;
          tile.traverse((obj) => {
            if (obj.isMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          });
          terrainGroup.add(tile);
        }

        terrainGroup.position.x = -(tileWidth * (TILE_COUNT - 1)) / 2;

        player.position.set(0, PLAYER_HEIGHT, 0);
        const startOffset = cameraOffsetFromOrbit(camYaw, camPitch, camDistance);
        camera.position.copy(player.position).add(startOffset);
        camera.lookAt(player.position);

        setStatus("ready");
        setHint("WASD 移動 · 右ドラッグ カメラ · ホイール ズーム");
      },
      undefined,
      (err) => {
        console.error(err);
        setStatus("error");
        setHint("マップの読み込みに失敗しました");
      }
    );

    const clock = new THREE.Clock();

    const tick = () => {
      if (disposed) return;
      animId = requestAnimationFrame(tick);

      const dt = Math.min(clock.getDelta(), 0.05);
      let dx = 0;
      let dz = 0;
      if (keys.w) dz -= 1;
      if (keys.s) dz += 1;
      if (keys.a) dx -= 1;
      if (keys.d) dx += 1;

      if (dx !== 0 || dz !== 0) {
        const len = Math.hypot(dx, dz) || 1;
        dx = (dx / len) * MOVE_SPEED * dt;
        dz = (dz / len) * MOVE_SPEED * dt;

        player.position.x = THREE.MathUtils.clamp(
          player.position.x + dx,
          -mapHalfW + 1,
          mapHalfW - 1
        );
        player.position.z = THREE.MathUtils.clamp(
          player.position.z + dz,
          -mapHalfD + 1,
          mapHalfD - 1
        );
      }

      rayOrigin.set(player.position.x, 80, player.position.z);
      raycaster.set(rayOrigin, down);
      const hits = raycaster.intersectObject(terrainGroup, true);
      if (hits.length > 0) {
        player.position.y = hits[0].point.y + PLAYER_HEIGHT;
      }

      const camTarget = player.position.clone();
      const desiredCam = player.position
        .clone()
        .add(cameraOffsetFromOrbit(camYaw, camPitch, camDistance));
      camera.position.lerp(desiredCam, 0.08);
      camera.lookAt(camTarget);

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
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("contextmenu", onContextMenu);
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
    <div className="relative w-full h-dvh bg-sky-900 overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" />

      <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between gap-2 p-3 pointer-events-none">
        <div className="pointer-events-auto rounded-xl bg-black/55 border border-white/20 px-4 py-2 text-sm text-white backdrop-blur-sm">
          <p className="font-bold text-violet-200">MOEフィールド 3D</p>
          <p className="mt-1 text-zinc-300 text-xs">{hint}</p>
          {status === "ready" && (
            <p className="mt-1 text-zinc-400 text-xs">
              右クリック＋ドラッグで見回し · 右下「BGM 再生」で音楽
            </p>
          )}
        </div>
        <Link
          href="/moe"
          className="pointer-events-auto rounded-xl px-4 py-2 text-sm font-semibold text-white bg-zinc-800/90 border border-zinc-600 hover:bg-zinc-700"
        >
          2D版へ
        </Link>
      </div>

      {status === "error" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6">
          <div className="max-w-sm rounded-2xl border border-red-500/50 bg-zinc-900 p-6 text-center text-white">
            <p className="font-bold text-red-300">glb が読めませんでした</p>
            <p className="mt-2 text-sm text-zinc-400">
              public/assets/map/3D_MoeMapField02.glb があるか確認してください。
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-xl px-5 py-2 text-sm border border-zinc-600 hover:bg-zinc-800"
            >
              メニューへ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
