/** 支援スキル用 — 味方ターゲット（プレイヤー / ペット） */

export const MOE_ALLY_TARGET_STORAGE_KEY = "life-rpg-moe-ally-target";

/** @typedef {'player' | 'pet'} MoeAllyTargetId */

/** @returns {MoeAllyTargetId} */
export function loadMoeAllyTarget() {
  if (typeof window === "undefined") return "pet";
  try {
    const raw = window.localStorage.getItem(MOE_ALLY_TARGET_STORAGE_KEY);
    return raw === "player" ? "player" : "pet";
  } catch {
    return "pet";
  }
}

/** @param {MoeAllyTargetId} id */
export function saveMoeAllyTarget(id) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MOE_ALLY_TARGET_STORAGE_KEY,
      id === "player" ? "player" : "pet"
    );
  } catch {
    /* quota */
  }
}
