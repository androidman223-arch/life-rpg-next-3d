/** アイテム枠数（moeItemBoxStorage と同期） */
export const MOE_ITEM_BOX_SLOT_COUNT = 20;

export const MOE_ITEM_BOX_LAYOUT_STORAGE_KEY = "life-rpg-moe-item-box-layout";

export const MOE_ITEM_BOX_DEFAULT_COLS = 5;
export const MOE_ITEM_BOX_MIN_COLS = 4;
export const MOE_ITEM_BOX_MAX_COLS = 10;

export const MOE_ITEM_BOX_SLOT_PX = 32;
export const MOE_ITEM_BOX_SLOT_GAP_PX = 2;
export const MOE_ITEM_BOX_RESIZE_STEP_PX =
  MOE_ITEM_BOX_SLOT_PX + MOE_ITEM_BOX_SLOT_GAP_PX;

/** @param {number} cols @param {number} [slotCount] */
export function moeItemBoxRowsForCols(cols, slotCount = MOE_ITEM_BOX_SLOT_COUNT) {
  return Math.ceil(slotCount / cols);
}

/** @param {number} cols @param {number} [slotCount] */
export function moeItemBoxCellCount(cols, slotCount = MOE_ITEM_BOX_SLOT_COUNT) {
  return cols * moeItemBoxRowsForCols(cols, slotCount);
}

/** @param {number} cols @param {number} [slotCount] */
export function moeItemBoxGridPx(cols, slotCount = MOE_ITEM_BOX_SLOT_COUNT) {
  const rows = moeItemBoxRowsForCols(cols, slotCount);
  const width =
    cols * MOE_ITEM_BOX_SLOT_PX + (cols - 1) * MOE_ITEM_BOX_SLOT_GAP_PX;
  const height =
    rows * MOE_ITEM_BOX_SLOT_PX + (rows - 1) * MOE_ITEM_BOX_SLOT_GAP_PX;
  return { width, height, rows };
}

/** @param {number} cols */
export function clampMoeItemBoxCols(cols) {
  return Math.max(
    MOE_ITEM_BOX_MIN_COLS,
    Math.min(MOE_ITEM_BOX_MAX_COLS, Math.round(cols))
  );
}

/** @returns {{ cols: number }} */
export function moeItemBoxDefaultLayout() {
  return { cols: MOE_ITEM_BOX_DEFAULT_COLS };
}

/**
 * 右下ドラッグ — 横は列数、縦は行数（列は自動再計算）
 * 例: 5列×4行 → 高さを縮める → 7列×3行（空白1）
 * @param {number} startCols
 * @param {number} deltaX
 * @param {number} deltaY
 */
export function moeItemBoxColsFromResize(
  startCols,
  deltaX,
  deltaY,
  slotStep = MOE_ITEM_BOX_RESIZE_STEP_PX
) {
  const startRows = moeItemBoxRowsForCols(startCols);
  const colsTarget = startCols + Math.round(deltaX / slotStep);
  const rowsTarget = Math.max(
    2,
    Math.min(5, startRows + Math.round(deltaY / slotStep))
  );
  const colsForRows = Math.ceil(MOE_ITEM_BOX_SLOT_COUNT / rowsTarget);

  let next;
  if (deltaY < 0) next = Math.max(colsTarget, colsForRows);
  else if (deltaY > 0) next = Math.min(colsTarget, colsForRows);
  else next = colsTarget;

  return clampMoeItemBoxCols(next);
}

/** @param {{ cols: number }} layout */
export function clampMoeItemBoxLayout(layout) {
  return { cols: clampMoeItemBoxCols(layout.cols) };
}

/** @returns {{ cols: number } | null} */
export function loadMoeItemBoxLayout() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MOE_ITEM_BOX_LAYOUT_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.cols === "number") {
      return clampMoeItemBoxLayout(p);
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** @param {{ cols: number }} layout */
export function saveMoeItemBoxLayout(layout) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      MOE_ITEM_BOX_LAYOUT_STORAGE_KEY,
      JSON.stringify(clampMoeItemBoxLayout(layout))
    );
  } catch {
    /* quota */
  }
}
