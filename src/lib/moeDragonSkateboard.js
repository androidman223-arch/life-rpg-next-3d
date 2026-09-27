/**
 * 龍神スキル — 地龍板（地上スケボ · 筋斗雲の地上版）
 */

/** 乗車中 — 徒歩より速い（足元を下げたあと板の優位が出る） */
export const MOE_SKATEBOARD_WALK_SPEED_MULT = 1.6;

/** Shiftダッシュ時にさらに乗算 */
export const MOE_SKATEBOARD_DASH_EXTRA_MULT = 1.55;

/**
 * @param {boolean} sprinting
 * @param {boolean} skateboardOn
 */
export function moeSkateboardMoveSpeedMult(sprinting, skateboardOn) {
  if (!skateboardOn) return 1;
  let mult = MOE_SKATEBOARD_WALK_SPEED_MULT;
  if (sprinting) mult *= MOE_SKATEBOARD_DASH_EXTRA_MULT;
  return mult;
}

/** 板の足元オフセット */
export const MOE_SKATEBOARD_FOOT_OFFSET = 0.04;

/** ペット — プレイヤー真後ろの乗車スロット */
export const MOE_SKATEBOARD_PET_BEHIND_DIST = 1.35;

/**
 * @param {number} playerX
 * @param {number} playerZ
 * @param {number} facingY
 * @returns {{ x: number, y: number }}
 */
export function skateboardPetRideSlot(playerX, playerZ, facingY) {
  return {
    x: playerX - Math.sin(facingY) * MOE_SKATEBOARD_PET_BEHIND_DIST,
    y: playerZ - Math.cos(facingY) * MOE_SKATEBOARD_PET_BEHIND_DIST,
  };
}

/**
 * @param {number} petX
 * @param {number} petZ
 * @param {number} slotX
 * @param {number} slotZ
 * @param {number} dt
 */
export function lerpSkateboardPetRideSlot(petX, petZ, slotX, slotZ, dt) {
  const t = 1 - Math.exp(-18 * dt);
  return {
    x: petX + (slotX - petX) * t,
    y: petZ + (slotZ - petZ) * t,
  };
}

export const MOE_SKATEBOARD_APPROACH_START_DIST = 42;

export const MOE_SKATEBOARD_APPROACH_RUSH_SPEED = 52;

export const MOE_SKATEBOARD_APPROACH_JUMP_DIST = 8;

export const MOE_SKATEBOARD_APPROACH_MOUNT_DIST = 1.05;

export const MOE_SKATEBOARD_APPROACH_MOUNT_SEC = 0.5;

/**
 * @typedef {{ phase: 'rush' | 'mount', ox: number, oz: number, oy: number, jumped: boolean, mountT?: number }} MoeSkateboardApproachState
 */

/**
 * @param {number} playerFacing
 * @returns {MoeSkateboardApproachState}
 */
export function beginSkateboardApproach(playerFacing) {
  const spawnAngle = playerFacing + Math.PI + 0.55;
  const dist = MOE_SKATEBOARD_APPROACH_START_DIST;
  return {
    phase: "rush",
    ox: Math.sin(spawnAngle) * dist,
    oz: Math.cos(spawnAngle) * dist,
    oy: 0.28,
    jumped: false,
    mountT: 0,
  };
}

/**
 * @param {MoeSkateboardApproachState} state
 * @param {number} dt
 * @returns {{ done: boolean, triggerJump: boolean, assistJump: boolean }}
 */
export function tickSkateboardApproach(state, dt) {
  const dist = Math.hypot(state.ox, state.oz);
  let triggerJump = false;

  if (state.phase === "rush") {
    if (!state.jumped && dist <= MOE_SKATEBOARD_APPROACH_JUMP_DIST) {
      state.jumped = true;
      triggerJump = true;
    }
    const rushBoost = 1 + Math.min(0.5, dist / MOE_SKATEBOARD_APPROACH_START_DIST);
    const step = MOE_SKATEBOARD_APPROACH_RUSH_SPEED * rushBoost * dt;
    if (dist <= step || dist <= MOE_SKATEBOARD_APPROACH_MOUNT_DIST) {
      state.ox = 0;
      state.oz = 0;
      state.oy = MOE_SKATEBOARD_FOOT_OFFSET;
      state.phase = "mount";
      state.mountT = 0;
    } else {
      const scale = Math.max(0, (dist - step) / dist);
      state.ox *= scale;
      state.oz *= scale;
      state.oy = Math.max(
        MOE_SKATEBOARD_FOOT_OFFSET,
        state.oy - 4.5 * dt
      );
    }
  }

  if (state.phase === "mount") {
    state.mountT = (state.mountT ?? 0) + dt;
    state.oy =
      MOE_SKATEBOARD_FOOT_OFFSET +
      Math.sin(state.mountT * 18) * 0.02;
    if (state.mountT >= MOE_SKATEBOARD_APPROACH_MOUNT_SEC) {
      return { done: true, triggerJump, assistJump: false };
    }
    return { done: false, triggerJump, assistJump: state.jumped };
  }

  return { done: false, triggerJump, assistJump: false };
}
