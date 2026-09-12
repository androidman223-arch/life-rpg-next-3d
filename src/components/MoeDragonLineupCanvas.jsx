"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MOE_DRAGON_LINEUP } from "@/data/moeDragonVariants";
import { attachLineupOrbitControls } from "@/lib/moeLineupOrbitControls";

const MODEL_BASE = "/assets/models/pet/";
const SPACING = 2.35;

/**
 * @param {{ variants?: typeof MOE_DRAGON_LINEUP, interactive?: boolean }} props
 */
export default function MoeDragonLineupCanvas({
  variants = MOE_DRAGON_LINEUP,
  interactive = false,
}) {
  const mountRef = useRef(null);
  const lineup = variants;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth || 1200;
    const h = mount.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 12, 28);

    const lookAt = new THREE.Vector3(0, 0.75, 0);
    const initialDist = 9.5;
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 2.2, initialDist);
    camera.lookAt(lookAt);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xfff5e6, 1.15);
    key.position.set(4, 8, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x93c5fd, 0.45);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.92 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    scene.add(floor);

    const grid = new THREE.GridHelper(30, 30, 0x334155, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    const loader = new GLTFLoader();
    const roots = [];
    let raf = 0;
    const t0 = performance.now();

    const offsetX = ((lineup.length - 1) * SPACING) / 2;

    lineup.forEach((variant, i) => {
      loader.load(
        `${MODEL_BASE}${variant.file}`,
        (gltf) => {
          const root = gltf.scene;
          root.position.set(i * SPACING - offsetX, 0, 0);
          root.scale.setScalar(1.35);
          scene.add(root);
          roots.push({ root, i });

          const label = document.createElement("div");
          label.className =
            "pointer-events-none absolute z-10 -translate-x-1/2 text-center";
          label.style.width = "88px";
          label.innerHTML = `<p class="text-[10px] font-bold leading-tight text-amber-100">${variant.nameJa}</p><p class="mt-0.5 text-[8px] text-slate-400">${variant.note ?? ""}</p>`;
          label.dataset.dragonLabel = String(i);
          mount.appendChild(label);
        },
        undefined,
        (err) => {
          console.warn("Dragon load failed:", variant.file, err);
        }
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
          minDist: 3.5,
          maxDist: 22,
          initialPitch: 0.38,
        })
      : null;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = (performance.now() - t0) * 0.001;
      for (const { root, i } of roots) {
        root.rotation.y = Math.sin(t * 0.35 + i * 0.4) * 0.22;
        root.position.y = Math.sin(t * 0.9 + i * 0.55) * 0.03;
      }

      for (const el of mount.querySelectorAll("[data-dragon-label]")) {
        const idx = Number(el.dataset.dragonLabel);
        const item = roots.find((r) => r.i === idx);
        if (!item) continue;
        const wp = new THREE.Vector3(
          item.root.position.x,
          1.55,
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
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      for (const el of mount.querySelectorAll("[data-dragon-label]")) {
        el.remove();
      }
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
        aria-label="ドラゴン10体 横並び展示"
      />
    </div>
  );
}
