/**
 * MOE 交戦タイムバー — 位置・幅（localStorage）
 */

export const MOE_DUEL_TIME_BAR_LAYOUT_STORAGE_KEY =
  "life-rpg-moe-duel-time-bar-layout";

export const MOE_DUEL_TIME_BAR_DEFAULT_WIDTH = 352;
export const MOE_DUEL_TIME_BAR_MIN_WIDTH = 200;
export const MOE_DUEL_TIME_BAR_MAX_WIDTH = 560;

/** @returns {{ x: number, y: number, width: number }} */
export function moeDuelTimeBarDefaultLayout() {
  const width = MOE_DUEL_TIME_BAR_DEFAULT_WIDTH;
  if (typeof window === "undefined") {
    return { x: 12, y: 12, width };
  }
  return {
    x: Math.max(8, Math.floor((window.innerWidth - width) / 2)),
    y: Math.max(56, window.innerHeight - 108),
    width,
  };
}

/** @param {{ x: number, y: number, width: number }} layout */
export function clampMoeDuelTimeBarLayout(layout) {
  const maxW =
    typeof window !== "undefined"
      ? Math.max(
          MOE_DUEL_TIME_BAR_MIN_WIDTH,
          Math.min(MOE_DUEL_TIME_BAR_MAX_WIDTH, window.innerWidth - 16)
        )
      : MOE_DUEL_TIME_BAR_MAX_WIDTH;
  const width = Math.max(
    MOE_DUEL_TIME_BAR_MIN_WIDTH,
    Math.min(maxW, layout.width)
  );
  if (typeof window === "undefined") {
    return {
      x: Math.max(4, layout.x),
      y: Math.max(4, layout.y),
      width,
    };
  }
  const x = Math.max(4, Math.min(window.innerWidth - width - 4, layout.x));
  const y = Math.max(4, Math.min(window.innerHeight - 80, layout.y));
  return { x, y, width };
}

/** @returns {{ x: number, y: number, width: number } | null} */
export function loadMoeDuelTimeBarLayout() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MOE_DUEL_TIME_BAR_LAYOUT_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (
      typeof p?.x === "number" &&
      typeof p?.y === "number" &&
      typeof p?.width === "number"
    ) {
      return clampMoeDuelTimeBarLayout(p);
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** @param {{ x: number, y: number, width: number }} layout */
export function saveMoeDuelTimeBarLayout(layout) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      MOE_DUEL_TIME_BAR_LAYOUT_STORAGE_KEY,
      JSON.stringify(clampMoeDuelTimeBarLayout(layout))
    );
  } catch {
    /* quota */
  }
}
