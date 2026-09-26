/**
 * MOE バトルログ — フローティングパネル位置・サイズ（localStorage）
 */

export const MOE_BATTLE_LOG_LAYOUT_STORAGE_KEY =
  "life-rpg-moe-battle-log-layout";

export const MOE_BATTLE_LOG_DEFAULT_WIDTH = 274;
export const MOE_BATTLE_LOG_DEFAULT_HEIGHT = 195;
export const MOE_BATTLE_LOG_MIN_WIDTH = 160;
export const MOE_BATTLE_LOG_MIN_HEIGHT = 72;

/** @returns {{ x: number, y: number, width: number, height: number }} */
export function moeBattleLogDefaultLayout() {
  if (typeof window === "undefined") {
    return {
      x: 12,
      y: 12,
      width: MOE_BATTLE_LOG_DEFAULT_WIDTH,
      height: MOE_BATTLE_LOG_DEFAULT_HEIGHT,
    };
  }
  const height = MOE_BATTLE_LOG_DEFAULT_HEIGHT;
  return {
    x: 12,
    y: Math.max(8, window.innerHeight - height - 12),
    width: MOE_BATTLE_LOG_DEFAULT_WIDTH,
    height,
  };
}

/** @param {{ x: number, y: number, width: number, height: number }} layout */
export function clampMoeBattleLogLayout(layout) {
  const maxW =
    typeof window !== "undefined"
      ? Math.max(MOE_BATTLE_LOG_MIN_WIDTH, window.innerWidth - 16)
      : 9999;
  const maxH =
    typeof window !== "undefined"
      ? Math.max(
          MOE_BATTLE_LOG_MIN_HEIGHT,
          Math.floor(window.innerHeight * 0.55)
        )
      : 9999;
  const width = Math.max(
    MOE_BATTLE_LOG_MIN_WIDTH,
    Math.min(maxW, layout.width)
  );
  const height = Math.max(
    MOE_BATTLE_LOG_MIN_HEIGHT,
    Math.min(maxH, layout.height)
  );
  if (typeof window === "undefined") {
    return {
      x: Math.max(4, layout.x),
      y: Math.max(4, layout.y),
      width,
      height,
    };
  }
  const x = Math.max(4, Math.min(window.innerWidth - width - 4, layout.x));
  const y = Math.max(4, Math.min(window.innerHeight - height - 4, layout.y));
  return { x, y, width, height };
}

/** @returns {{ x: number, y: number, width: number, height: number } | null} */
export function loadMoeBattleLogLayout() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MOE_BATTLE_LOG_LAYOUT_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (
      typeof p?.x === "number" &&
      typeof p?.y === "number" &&
      typeof p?.width === "number" &&
      typeof p?.height === "number"
    ) {
      return clampMoeBattleLogLayout(p);
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** @param {{ x: number, y: number, width: number, height: number }} layout */
export function saveMoeBattleLogLayout(layout) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      MOE_BATTLE_LOG_LAYOUT_STORAGE_KEY,
      JSON.stringify(clampMoeBattleLogLayout(layout))
    );
  } catch {
    /* quota */
  }
}
