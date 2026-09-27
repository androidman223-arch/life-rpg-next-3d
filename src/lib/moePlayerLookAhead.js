/**
 * 3Dカメラの前方注視点。大きいほどプレイヤーは画面中央より下に見える。
 */

export const MOE_PLAYER_LOOK_AHEAD_STORAGE_KEY =
  "life-rpg-moe-player-look-ahead";

export const MOE_PLAYER_LOOK_AHEAD_DEFAULT = 7;
export const MOE_PLAYER_LOOK_AHEAD_STEP = 0.5;
export const MOE_PLAYER_LOOK_AHEAD_MIN = 0;
export const MOE_PLAYER_LOOK_AHEAD_MAX = 14;

/** @param {unknown} value */
export function clampMoePlayerLookAhead(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return MOE_PLAYER_LOOK_AHEAD_DEFAULT;
  const stepped =
    Math.round(n / MOE_PLAYER_LOOK_AHEAD_STEP) * MOE_PLAYER_LOOK_AHEAD_STEP;
  const rounded = Math.round(stepped * 10) / 10;
  return Math.min(
    MOE_PLAYER_LOOK_AHEAD_MAX,
    Math.max(MOE_PLAYER_LOOK_AHEAD_MIN, rounded)
  );
}

/**
 * 画面上の上下。up は画面中央へ近づける（注視点を戻す）。
 * @param {unknown} value
 * @param {"up"|"down"} direction
 */
export function nudgeMoePlayerLookAhead(value, direction) {
  const delta =
    direction === "up"
      ? -MOE_PLAYER_LOOK_AHEAD_STEP
      : MOE_PLAYER_LOOK_AHEAD_STEP;
  return clampMoePlayerLookAhead(clampMoePlayerLookAhead(value) + delta);
}

export function loadMoePlayerLookAhead() {
  if (typeof localStorage === "undefined") return MOE_PLAYER_LOOK_AHEAD_DEFAULT;
  try {
    const raw = localStorage.getItem(MOE_PLAYER_LOOK_AHEAD_STORAGE_KEY);
    if (raw == null || raw === "") return MOE_PLAYER_LOOK_AHEAD_DEFAULT;
    return clampMoePlayerLookAhead(JSON.parse(raw));
  } catch {
    return MOE_PLAYER_LOOK_AHEAD_DEFAULT;
  }
}

/** @param {unknown} value */
export function saveMoePlayerLookAhead(value) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    MOE_PLAYER_LOOK_AHEAD_STORAGE_KEY,
    JSON.stringify(clampMoePlayerLookAhead(value))
  );
}
