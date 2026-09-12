import * as THREE from "three";
import { MACRO2_L1_SLOT_IDS } from "@/lib/moe3dMacro2Constants";
import {
  MOE_MACRO3_BASE_TOP_Y,
  MOE_MACRO3_RESERVED_BASE_TOP_Y,
} from "@/lib/moe3dMacro3Constants";
import { moeMacro3MountainColorForSlot } from "@/lib/moe3dMacro3MountainPalette";
import {
  MOE_MACRO3_MOUNTAIN_SLOT_IDS,
  moeMacro3MountainSpecsForSlot,
} from "@/lib/moe3dMacro3MountainRegistry";
import {
  appendClimbableMountain,
  appendGreenColliderVisuals,
  appendSimpleMountain,
  moeGreenColliderSpecs,
} from "@/lib/moe3dMacro3SimpleMountain";
import { appendMoe3dMacro3L4Fx } from "@/lib/moe3dMacro3L4Fx";

/**
 * @param {string} slotId
 */
function macro3BaseTopY(slotId) {
  return MACRO2_L1_SLOT_IDS.has(slotId)
    ? MOE_MACRO3_BASE_TOP_Y
    : MOE_MACRO3_RESERVED_BASE_TOP_Y;
}

/**
 * @param {number} color
 */
function simpleMountainMat(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.92,
    metalness: 0.02,
  });
}

/**
 * マクロ３ — 簡易山 + 緑コライダー
 * @param {import("three").Group} tileRoot
 * @param {string} slotId
 * @param {number} tileW
 * @param {number} tileD
 */
export function appendMoe3dMacro3Terrain(tileRoot, slotId, tileW, tileD) {
  const specs = moeMacro3MountainSpecsForSlot(slotId);
  if (!tileRoot || !MOE_MACRO3_MOUNTAIN_SLOT_IDS.has(slotId) || !specs.length) {
    return null;
  }

  const baseTopY = macro3BaseTopY(slotId);

  for (let i = 0; i < specs.length; i++) {
    const color =
      specs[i].climbTint ?? moeMacro3MountainColorForSlot(slotId, i);
    const mat = simpleMountainMat(color);
    if (specs[i].climbable) {
      appendClimbableMountain(tileRoot, tileW, tileD, specs[i], mat, baseTopY);
    } else {
      appendSimpleMountain(tileRoot, tileW, tileD, specs[i], mat, baseTopY);
    }
  }

  appendGreenColliderVisuals(
    tileRoot,
    tileW,
    tileD,
    moeGreenColliderSpecs(specs),
    baseTopY
  );

  appendMoe3dMacro3L4Fx(tileRoot, slotId, tileW, tileD);

  tileRoot.userData.macro3Terrain = {
    id: slotId,
    mountains: specs.length,
    type: "simple-mountain",
  };
  return tileRoot.userData.macro3Terrain;
}
