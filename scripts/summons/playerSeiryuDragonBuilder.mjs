/**
 * プレイヤー召喚 — 整龍（自力整龍）
 * 東洋龍 · 碧玉と金 · ミレニアム竜とは別シルエット（頭大・体長め）
 */
import * as THREE from "three";
import { addPart } from "../petGlbShared.mjs";
import {
  addFinWing,
  addFrontEyes,
  addSerpentSegments,
  buildDragonMaterials,
  createDragonBody,
  createDragonRoot,
} from "../pets/dragonShared.mjs";
import { MOE_PLAYER_SUMMON_VARIANTS } from "./playerSummonCatalog.mjs";

const PREFIX = "PlayerSummonDragon";
const DEFAULT_PALETTE = MOE_PLAYER_SUMMON_VARIANTS[1].palette;

/** @param {Record<string, number>} [palette] */
export function buildPlayerSummonSeiryuRoot(palette = DEFAULT_PALETTE) {
  const { mats, p } = buildDragonMaterials(palette);
  const root = createDragonRoot(PREFIX, p.id);
  const body = createDragonBody(root, PREFIX);
  const { scale, scaleMid, horn, hornDark, plate, crystal, crystalCore, beak, beakLight } =
    mats;

  addSerpentSegments(body, mats, 11, {
    step: 0.26,
    startY: 0.44,
    startZ: 0.42,
    amp: 0.18,
    width: 0.5,
    height: 0.32,
    taper: 0.93,
    spinePlates: true,
  });

  /* 頭 — 大きめ・威厳 */
  const head = new THREE.Group();
  head.name = `${PREFIX}Head`;
  head.position.set(0, 0.56, 0.72);
  body.add(head);
  addPart(head, new THREE.BoxGeometry(0.38, 0.22, 0.34), scale, 0, 0, 0.1);
  addPart(head, new THREE.BoxGeometry(0.32, 0.14, 0.42), scaleMid, 0, -0.02, 0.36);
  addPart(head, new THREE.BoxGeometry(0.14, 0.1, 0.28), beak, 0, -0.04, 0.58);
  addPart(head, new THREE.BoxGeometry(0.1, 0.08, 0.18), beakLight, 0, -0.05, 0.72);
  addFrontEyes(head, mats, { ex: 0.11, ey: 0.05, ez: 0.2, tag: PREFIX });

  /* 長髭 */
  for (const sx of [-1, 1]) {
    addPart(head, new THREE.BoxGeometry(0.022, 0.022, 0.48), horn, sx * 0.16, -0.1, 0.55);
    addPart(head, new THREE.BoxGeometry(0.018, 0.018, 0.36), hornDark, sx * 0.2, -0.12, 0.68);
    addPart(head, new THREE.BoxGeometry(0.015, 0.015, 0.24), plate, sx * 0.22, -0.14, 0.78);
  }

  /* 枝角 — 金 */
  for (const sx of [-1, 1]) {
    addPart(head, new THREE.ConeGeometry(0.04, 0.24, 4), horn, sx * 0.14, 0.18, -0.02, [
      0.35,
      0,
      sx * 0.45,
    ]);
    addPart(head, new THREE.ConeGeometry(0.03, 0.18, 4), hornDark, sx * 0.2, 0.26, 0.04, [
      0.55,
      0,
      sx * 0.55,
    ]);
    addPart(head, new THREE.ConeGeometry(0.022, 0.12, 4), horn, sx * 0.1, 0.28, 0.08, [
      0.65,
      0,
      sx * -0.35,
    ]);
  }

  addPart(head, new THREE.OctahedronGeometry(0.06, 0), crystal, 0, 0.2, 0.14, [0.25, 0.35, 0]);
  addPart(head, new THREE.SphereGeometry(0.035, 8, 8), crystalCore, 0, 0.24, 0.16);

  /* 第2〜3節に小翼 */
  addFinWing(body, mats, -1, PREFIX, { x: 0.34, y: 0.5, z: 0.08 });
  addFinWing(body, mats, 1, PREFIX, { x: 0.34, y: 0.5, z: 0.08 });

  /* 背びれ */
  for (let i = 0; i < 5; i++) {
    const z = 0.2 - i * 0.22;
    addPart(
      body,
      new THREE.BoxGeometry(0.05, 0.12 + (i === 2 ? 0.06 : 0), 0.14),
      plate,
      0,
      0.62,
      z,
      [0.3, 0, 0]
    );
  }

  /* 尾先 — 青玉宝珠 */
  addPart(body, new THREE.SphereGeometry(0.1, 10, 10), crystal, 0, 0.24, -2.05);
  addPart(body, new THREE.OctahedronGeometry(0.065, 0), crystalCore, 0, 0.32, -2.12, [0.4, 0.2, 0]);
  addPart(body, new THREE.TorusGeometry(0.08, 0.018, 6, 12), plate, 0, 0.28, -2.08, [1.57, 0, 0]);

  return root;
}
