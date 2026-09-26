import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { moePlayerSummonModelForSkill } from "../data/moePlayerSummonModels.js";
import { fitModelToGround } from "./moeField3DModels.js";

const SUMMON_DURATION_SEC = 4.5;
const BOB_AMPLITUDE = 0.22;
const BOB_CYCLE_SEC = 1.6;

/** @type {Record<string, number>} */
const SUMMON_TARGET_HEIGHT = {
  jiriki_kaihou: 2.6,
  jiriki_seiryu: 3.1,
};

/** @type {Record<string, { back: number, up: number, side: number }>} */
const SUMMON_OFFSET = {
  jiriki_kaihou: { back: 2.4, up: 2.2, side: 0.35 },
  jiriki_seiryu: { back: 2.8, up: 2.6, side: -0.2 },
};

/**
 * プレイヤー召喚 GLB — スキル使用時にプレイヤー横へ一時表示
 * @param {import("three").Scene} scene
 */
export function createMoePlayerSummonEffect(scene) {
  const group = new THREE.Group();
  group.name = "playerSummonFx";
  scene.add(group);

  const loader = new GLTFLoader();
  /** @type {Map<string, THREE.Object3D>} */
  const templates = new Map();
  /** @type {Map<string, Promise<THREE.Object3D | null>>} */
  const loadingPromises = new Map();

  /** @type {{ root: THREE.Object3D, skillId: string, age: number, duration: number } | null} */
  let active = null;
  let lastSeq = -1;
  const offsetVec = new THREE.Vector3();

  function disposeRoot(root) {
    if (!root) return;
    root.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.geometry?.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => m?.dispose());
    });
    group.remove(root);
  }

  async function ensureTemplate(skillId) {
    const meta = moePlayerSummonModelForSkill(skillId);
    if (!meta) return null;
    if (templates.has(meta.url)) return templates.get(meta.url);
    if (!loadingPromises.has(meta.url)) {
      loadingPromises.set(
        meta.url,
        loader
          .loadAsync(meta.url)
          .then((gltf) => {
            const src = gltf.scene;
            fitModelToGround(src, SUMMON_TARGET_HEIGHT[skillId] ?? 2.5);
            templates.set(meta.url, src);
            return src;
          })
          .catch((err) => {
            console.error("player summon model load failed:", meta.url, err);
            return null;
          })
      );
    }
    return loadingPromises.get(meta.url);
  }

  async function play(skillId) {
    const template = await ensureTemplate(skillId);
    if (!template) return;
    disposeRoot(active?.root ?? null);
    const root = SkeletonUtils.clone(template);
    root.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    group.add(root);
    active = {
      root,
      skillId,
      age: 0,
      duration: SUMMON_DURATION_SEC,
    };
  }

  function hide() {
    disposeRoot(active?.root ?? null);
    active = null;
  }

  return {
    /**
     * @param {{ skillId: string, seq: number }} req
     */
    consumeRequest(req) {
      if (!req?.skillId || req.seq == null || req.seq === lastSeq) return;
      lastSeq = req.seq;
      void play(req.skillId);
    },
    update(dt, playerRoot) {
      if (!active || !playerRoot) {
        if (!active) return;
        hide();
        return;
      }
      active.age += dt;
      if (active.age >= active.duration) {
        hide();
        return;
      }

      const off = SUMMON_OFFSET[active.skillId] ?? SUMMON_OFFSET.jiriki_kaihou;
      const yaw = playerRoot.rotation.y;
      const backX = -Math.sin(yaw) * off.back;
      const backZ = -Math.cos(yaw) * off.back;
      const sideX = Math.cos(yaw) * off.side;
      const sideZ = -Math.sin(yaw) * off.side;
      const bob =
        Math.sin((active.age / BOB_CYCLE_SEC) * Math.PI * 2) * BOB_AMPLITUDE;
      const fadeT = Math.min(1, Math.max(0, (active.duration - active.age) / 0.8));
      offsetVec.set(
        playerRoot.position.x + backX + sideX,
        playerRoot.position.y + off.up + bob,
        playerRoot.position.z + backZ + sideZ
      );
      active.root.position.copy(offsetVec);
      active.root.rotation.y = yaw + Math.PI * 0.08;
      active.root.traverse((obj) => {
        if (!obj.isMesh || !obj.material) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of mats) {
          if (!mat) continue;
          mat.transparent = true;
          mat.opacity = 0.55 + fadeT * 0.45;
        }
      });
    },
    dispose() {
      hide();
      scene.remove(group);
      templates.clear();
    },
  };
}
