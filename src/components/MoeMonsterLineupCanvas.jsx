"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MOE_MONSTER_LINEUP } from "@/data/moeMonsterLineup";
import { attachLineupOrbitControls } from "@/lib/moeLineupOrbitControls";

const MODEL_BASE = "/assets/models/monster/";
const COLS = 8;
const SP_X = 1.55;
const SP_Z = 2.55;

/**
 * @param {{ variants?: typeof MOE_MONSTER_LINEUP, interactive?: boolean }} props
 */
export default function MoeMonsterLineupCanvas({
  variants = MOE_MONSTER_LINEUP,
  interactive = false,
}) {
  const mountRef = useRef(null);
  const lineup = variants;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth || 1200;
    const h = mount.clientHeight || 640;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1222);
    scene.fog = new THREE.Fog(0x0c1222, 14, 32);

    const rows = Math.ceil(lineup.length / COLS);
    const lookAt = new THREE.Vector3(0, 0.5, -((rows - 1) * SP_Z) / 2);
    const initialDist = rows * 1.05 + 7;
    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 120);
    camera.position.set(0, rows * 0.55 + 2.5, initialDist);
    camera.lookAt(lookAt);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.52));
    const key = new THREE.DirectionalLight(0xfff0dd, 1.1);
    key.position.set(5, 10, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x7dd3fc, 0.4);
    rim.position.set(-6, 4, -5);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(COLS * SP_X + 4, rows * SP_Z + 4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.92 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.02, -((rows - 1) * SP_Z) / 2);
    scene.add(floor);

    const loader = new GLTFLoader();
    const roots = [];
    let raf = 0;
    const t0 = performance.now();
    const offsetX = ((COLS - 1) * SP_X) / 2;

    lineup.forEach((variant, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      loader.load(
        `${MODEL_BASE}${variant.file}`,
        (gltf) => {
          const root = gltf.scene;
          const scale =
            variant.familyId === "gigas_boss" || variant.familyId === "gigas_mammoth"
              ? 1.05
              : 1.22;
          root.scale.setScalar(scale);
          root.position.set(col * SP_X - offsetX, 0, -row * SP_Z);
          scene.add(root);
          roots.push({ root, i, variant });

          const label = document.createElement("div");
          label.className =
            "pointer-events-none absolute z-10 -translate-x-1/2 text-center";
          label.style.width = "72px";
          label.innerHTML = `<p class="text-[9px] font-bold leading-tight text-rose-100">${variant.nameJa}</p><p class="mt-0.5 text-[8px] text-rose-200/80">${variant.variantLabel ?? ""}</p>`;
          label.dataset.monsterLabel = String(i);
          mount.appendChild(label);
        },
        undefined,
        (err) => console.warn("Monster load failed:", variant.file, err)
      );
    });

    const onResize = () => {
      const nw = mount.clientWidth || w;
      const nh = mount.clientHeight || h;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    const detachOrbit = interactive
      ? attachLineupOrbitControls(renderer.domElement, camera, lookAt, {
          initialDist,
          minDist: 4,
          maxDist: 28,
          initialPitch: 0.42,
        })
      : null;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = (performance.now() - t0) * 0.001;
      for (const { root, i } of roots) {
        root.rotation.y = Math.sin(t * 0.4 + i * 0.31) * 0.28;
      }

      for (const el of mount.querySelectorAll("[data-monster-label]")) {
        const idx = Number(el.dataset.monsterLabel);
        const item = roots.find((r) => r.i === idx);
        if (!item) continue;
        const wp = new THREE.Vector3(
          item.root.position.x,
          item.variant.familyId === "gigas_boss" ||
            item.variant.familyId === "gigas_mammoth"
            ? 1.85
            : 1.32,
          item.root.position.z
        );
        wp.project(camera);
        const rect = mount.getBoundingClientRect();
        el.style.left = `${((wp.x + 1) / 2) * rect.width}px`;
        el.style.top = `${((1 - wp.y) / 2) * rect.height}px`;
        el.style.display = wp.z < 1 ? "block" : "none";
      }

      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      detachOrbit?.();
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      for (const el of mount.querySelectorAll("[data-monster-label]")) el.remove();
    };
  }, [lineup, interactive]);

  return (
    <div className="w-full">
      {interactive ? (
        <p className="mb-1 text-center text-[9px] text-slate-400">
          ドラッグ＝カメラ回転 · ホイール＝拡大／縮小
        </p>
      ) : null}
      <div
        ref={mountRef}
        className="relative h-[min(52vh,520px)] w-full overflow-hidden rounded-xl border border-slate-600/50 bg-slate-950 shadow-inner"
        aria-label="敵32体 グリッド展示"
      />
    </div>
  );
}
