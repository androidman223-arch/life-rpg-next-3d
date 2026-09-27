/**
 * MOE UI — フローティングパネル横ドッキング（v1: 全体マップ ← バトルログ）
 */

export const MOE_PANEL_DOCK_STORAGE_KEY = "life-rpg-moe-panel-dock";

export {
  MOE_PANEL_ID_BATTLE_LOG as MOE_DOCK_PANEL_BATTLE_LOG,
  MOE_PANEL_ID_MINIMAP_3D as MOE_DOCK_PANEL_MINIMAP_3D,
} from "./moePanelStack.js";

/** @typedef {{ x: number, y: number, width: number, height: number }} MoeDockBounds */
/** @typedef {{ childId: string, parentId: string }} MoePanelDockRelation */

export const MOE_PANEL_DOCK_SNAP_X = 28;
export const MOE_PANEL_DOCK_SNAP_Y = 36;

/**
 * 親パネル右端に子をスナップできるか
 * @param {{ x: number, y: number }} childPos
 * @param {MoeDockBounds} parentBounds
 */
export function trySnapMoePanelDockRight(childPos, parentBounds) {
  const targetX = parentBounds.x + parentBounds.width;
  const targetY = parentBounds.y;
  const dx = Math.abs(childPos.x - targetX);
  const dy = Math.abs(childPos.y - targetY);
  if (dx <= MOE_PANEL_DOCK_SNAP_X && dy <= MOE_PANEL_DOCK_SNAP_Y) {
    return { x: targetX, y: targetY };
  }
  return null;
}

/**
 * ドラッグ中プレビュー用 — スナップ圏内か
 * @param {{ x: number, y: number }} childPos
 * @param {MoeDockBounds} parentBounds
 */
export function isNearMoePanelDockRight(childPos, parentBounds) {
  return trySnapMoePanelDockRight(childPos, parentBounds) != null;
}

/**
 * @param {{ x: number, y: number }} parentPos
 * @param {number} parentWidth
 */
export function moeDockedChildPosition(parentPos, parentWidth) {
  return {
    x: parentPos.x + parentWidth,
    y: parentPos.y,
  };
}

/** @returns {MoePanelDockRelation | null} */
export function loadMoePanelDock() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MOE_PANEL_DOCK_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.childId === "string" && typeof p?.parentId === "string") {
      return { childId: p.childId, parentId: p.parentId };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** @param {MoePanelDockRelation | null} relation */
export function saveMoePanelDock(relation) {
  if (typeof window === "undefined") return;
  try {
    if (!relation) {
      localStorage.removeItem(MOE_PANEL_DOCK_STORAGE_KEY);
      return;
    }
    localStorage.setItem(MOE_PANEL_DOCK_STORAGE_KEY, JSON.stringify(relation));
  } catch {
    /* quota */
  }
}
