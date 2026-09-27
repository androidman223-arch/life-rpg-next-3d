/**
 * 龍神スキル — 筋斗雲（フィールド移動 · 飛行オフセット）
 */

/** 山の上を飛ぶ高さ（ワールドY） */
export const MOE_KINTOUN_FLY_HEIGHT = 14;

export const MOE_KINTOUN_ASCENT_PER_SEC = 20;
export const MOE_KINTOUN_DESCENT_PER_SEC = 24;

/** 筋斗雲 ON — 通常移動2倍 */
export const MOE_KINTOUN_WALK_SPEED_MULT = 2;

/** Shiftダッシュ時にさらに2倍（走行2×＋ダッシュ2×＝合計4倍、神速なし時） */
export const MOE_KINTOUN_DASH_EXTRA_MULT = 2;

/**
 * @param {boolean} sprinting
 * @param {boolean} kintounOn
 */
export function moeKintounMoveSpeedMult(sprinting, kintounOn) {
  if (!kintounOn) return 1;
  let mult = MOE_KINTOUN_WALK_SPEED_MULT;
  if (sprinting) mult *= MOE_KINTOUN_DASH_EXTRA_MULT;
  return mult;
}

/**
 * @param {number} offset
 * @param {boolean} kintounOn
 * @param {number} dt
 */
export function tickKintounFlyOffset(offset, kintounOn, dt) {
  const target = kintounOn ? MOE_KINTOUN_FLY_HEIGHT : 0;
  const rate = kintounOn ? MOE_KINTOUN_ASCENT_PER_SEC : MOE_KINTOUN_DESCENT_PER_SEC;
  if (Math.abs(target - offset) < 0.04) return target;
  if (target > offset) return Math.min(target, offset + rate * dt);
  return Math.max(target, offset - rate * dt);
}

/** 雲メッシュ全体の表示スケール */
export const MOE_KINTOUN_CLOUD_VISUAL_SCALE = 0.7;

/** 雲ベース（地面からのオフセット） */
export const MOE_KINTOUN_CLOUD_FOOT_OFFSET = 0.12;

/** 乗車中 — 雲を足元より下げてプレイヤーがうずもれない（小さいほど雲が上） */
export const MOE_KINTOUN_CLOUD_RIDE_DROP = 0.68;

/** この高度以上で敵索敵オフ（空中の筋斗雲） */
export const MOE_KINTOUN_STEALTH_MIN_ALTITUDE = 2;

/** 雲中心をプレイヤーより少し後ろ（前後に長い雲の手前に立つ） */
export const MOE_KINTOUN_CLOUD_PLAYER_FORWARD = 0.62;

/** ペット — プレイヤー真後ろの乗車スロット */
export const MOE_KINTOUN_PET_BEHIND_DIST = 2.05;

/** 雲の後方（ペット側）の長さ倍率 */
export const MOE_KINTOUN_CLOUD_REAR_LENGTH_MULT = 1.3;

/**
 * @param {boolean} kintounOn
 * @param {number} flyOffset
 */
export function isMoeKintounStealthActive(kintounOn, flyOffset) {
  return Boolean(kintounOn) && flyOffset >= MOE_KINTOUN_STEALTH_MIN_ALTITUDE;
}

/**
 * @param {number} facingY
 * @returns {{ x: number, z: number }}
 */
export function kintounCloudCenterOffsetFromPlayer(facingY) {
  return {
    x: -Math.sin(facingY) * MOE_KINTOUN_CLOUD_PLAYER_FORWARD,
    z: -Math.cos(facingY) * MOE_KINTOUN_CLOUD_PLAYER_FORWARD,
  };
}

/**
 * @param {number} playerX
 * @param {number} playerZ
 * @param {number} facingY
 * @returns {{ x: number, y: number }}
 */
export function kintounPetRideSlot(playerX, playerZ, facingY) {
  return {
    x: playerX - Math.sin(facingY) * MOE_KINTOUN_PET_BEHIND_DIST,
    y: playerZ - Math.cos(facingY) * MOE_KINTOUN_PET_BEHIND_DIST,
  };
}

/**
 * @param {number} petX
 * @param {number} petZ
 * @param {number} slotX
 * @param {number} slotZ
 * @param {number} dt
 */
export function lerpKintounPetRideSlot(petX, petZ, slotX, slotZ, dt) {
  const t = 1 - Math.exp(-18 * dt);
  return {
    x: petX + (slotX - petX) * t,
    y: petZ + (slotZ - petZ) * t,
  };
}

/** 召喚開始 — プレイヤーからの水平オフセット */
export const MOE_KINTOUN_APPROACH_START_DIST = 54;

/** 雲の突進速度（ユニット/秒） */
export const MOE_KINTOUN_APPROACH_RUSH_SPEED = 56;

/** この距離でプレイヤー自動ジャンプ */
export const MOE_KINTOUN_APPROACH_JUMP_DIST = 9;

/** 足元に到達したとみなす距離 */
export const MOE_KINTOUN_APPROACH_MOUNT_DIST = 1.05;

export const MOE_KINTOUN_APPROACH_MOUNT_SEC = 0.55;

/**
 * @typedef {{ phase: 'rush' | 'mount', ox: number, oz: number, oy: number, jumped: boolean, mountT?: number }} MoeKintounApproachState
 */

/**
 * @param {number} playerFacing
 * @returns {MoeKintounApproachState}
 */
export function beginKintounApproach(playerFacing) {
  const spawnAngle = playerFacing + Math.PI + 0.42;
  const dist = MOE_KINTOUN_APPROACH_START_DIST;
  return {
    phase: "rush",
    ox: Math.sin(spawnAngle) * dist,
    oz: Math.cos(spawnAngle) * dist,
    oy: 3.2,
    jumped: false,
    mountT: 0,
  };
}

/**
 * @param {MoeKintounApproachState} state
 * @param {number} dt
 * @returns {{ done: boolean, triggerJump: boolean, assistJump: boolean }}
 */
export function tickKintounApproach(state, dt) {
  const dist = Math.hypot(state.ox, state.oz);
  let triggerJump = false;

  if (state.phase === "rush") {
    if (!state.jumped && dist <= MOE_KINTOUN_APPROACH_JUMP_DIST) {
      state.jumped = true;
      triggerJump = true;
    }
    const rushBoost = 1 + Math.min(0.55, dist / MOE_KINTOUN_APPROACH_START_DIST);
    const step = MOE_KINTOUN_APPROACH_RUSH_SPEED * rushBoost * dt;
    if (dist <= step || dist <= MOE_KINTOUN_APPROACH_MOUNT_DIST) {
      state.ox = 0;
      state.oz = 0;
      state.oy = MOE_KINTOUN_CLOUD_FOOT_OFFSET;
      state.phase = "mount";
      state.mountT = 0;
    } else {
      const scale = Math.max(0, (dist - step) / dist);
      state.ox *= scale;
      state.oz *= scale;
      state.oy = Math.max(
        MOE_KINTOUN_CLOUD_FOOT_OFFSET,
        state.oy - 9 * dt
      );
    }
  }

  if (state.phase === "mount") {
    state.mountT = (state.mountT ?? 0) + dt;
    state.oy =
      MOE_KINTOUN_CLOUD_FOOT_OFFSET +
      Math.sin(state.mountT * 16) * 0.035;
    if (state.mountT >= MOE_KINTOUN_APPROACH_MOUNT_SEC) {
      return { done: true, triggerJump, assistJump: false };
    }
    return { done: false, triggerJump, assistJump: state.jumped };
  }

  return { done: false, triggerJump, assistJump: false };
}
