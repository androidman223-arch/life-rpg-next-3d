/**
 * たましいのマスター — ビスク中央アルターの脇。
 * 英語の魂は soul。部屋の英語名はあとから付ける。
 */

/** ビスク中央アルター（layout id） */
export const MOE_SOUL_MASTER_ALTAR_ID = "bisk_central";

/** アルターの西へ少し離す。転送スポーン（南）は塞がない */
export const MOE_SOUL_MASTER_OFF_X = -48;
export const MOE_SOUL_MASTER_OFF_Z = 1.5;
/** 扉の正面に立つ位置（部屋ローカル +Z） */
export const MOE_SOUL_MASTER_STAND_Z = 5.4;

/** 竜巻ワープの長さ */
export const MOE_SOUL_WARP_MS = 2500;
/** 生き返りの光が戻る長さ */
export const MOE_SOUL_RETURN_MS = 2000;
export const MOE_SOUL_GHOST_OPACITY = 0.28;

/**
 * @param {number} started
 * @param {number} until
 * @param {number} now
 * @returns {number | null}
 */
export function moeSoulReturnProgress(started, until, now) {
  if (!Number.isFinite(started) || !Number.isFinite(until)) return null;
  const span = until - started;
  if (span <= 0) return 1;
  if (now >= until) return 1;
  return Math.min(1, Math.max(0, (now - started) / span));
}

/** ぽよぽよぽよーん — 2秒で3回ほど伸び縮みして元の大きさへ */
export function moeSoulPoyoScale(progress) {
  const t = Math.min(1, Math.max(0, progress));
  const poyo = Math.sin(t * Math.PI * 6);
  const amp = 0.2 * (1 - t * 0.25);
  return { y: 1 + poyo * amp, xz: 1 - poyo * amp * 0.55 };
}

export function moeSoulReturnOpacity(progress) {
  const t = Math.min(1, Math.max(0, progress));
  return MOE_SOUL_GHOST_OPACITY + (1 - MOE_SOUL_GHOST_OPACITY) * t;
}

/**
 * @param {{ x: number, y: number } | null | undefined} altarPos
 * @returns {{ x: number, y: number } | null}
 */
export function moeSoulMasterRoomPos(altarPos) {
  if (!altarPos || !Number.isFinite(altarPos.x) || !Number.isFinite(altarPos.y)) {
    return null;
  }
  return {
    x: altarPos.x + MOE_SOUL_MASTER_OFF_X,
    y: altarPos.y + MOE_SOUL_MASTER_OFF_Z,
  };
}

/**
 * @param {{ x: number, y: number } | null | undefined} altarPos
 * @returns {{ x: number, y: number } | null}
 */
export function moeSoulMasterStandPos(altarPos) {
  const room = moeSoulMasterRoomPos(altarPos);
  if (!room) return null;
  return { x: room.x, y: room.y + MOE_SOUL_MASTER_STAND_Z };
}
