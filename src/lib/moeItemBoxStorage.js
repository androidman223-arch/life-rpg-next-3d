export const MOE_ITEM_BOX_COLS = 5;
export const MOE_ITEM_BOX_ROWS = 4;
export const MOE_ITEM_SLOT_COUNT = MOE_ITEM_BOX_COLS * MOE_ITEM_BOX_ROWS;

export const MOE_ITEM_BOX_SLOTS_KEY = "life-rpg-moe-item-box-slots";
export const MOE_ITEM_BOX_SLOTS_EVENT = "moe-item-box-slots";
export const MOE_ITEM_BOX_SELECTED_KEY = "life-rpg-moe-item-box-selected";
export const MOE_ITEM_BOX_SELECTED_EVENT = "moe-item-box-selected";

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   emoji?: string,
 *   iconKind?: string,
 *   expAmount?: number,
 *   recordStoneId?: string,
 *   recordX?: number,
 *   recordY?: number,
 * }} MoeItemBoxItem
 */

function emptySlots() {
  return Array.from({ length: MOE_ITEM_SLOT_COUNT }, () => null);
}

/** @returns {(MoeItemBoxItem | null)[]} */
export function loadMoeItemBoxSlots() {
  if (typeof window === "undefined") return emptySlots();
  try {
    const raw = localStorage.getItem(MOE_ITEM_BOX_SLOTS_KEY);
    if (!raw) return emptySlots();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== MOE_ITEM_SLOT_COUNT) {
      return emptySlots();
    }
    return parsed.map((entry) => {
      if (!entry || typeof entry !== "object" || typeof entry.id !== "string") {
        return null;
      }
      const item = {
        id: entry.id,
        label: entry.label ?? entry.id,
      };
      if (entry.emoji != null) item.emoji = entry.emoji;
      if (entry.iconKind != null) item.iconKind = entry.iconKind;
      if (entry.expAmount != null) item.expAmount = entry.expAmount;
      if (entry.recordStoneId != null) item.recordStoneId = entry.recordStoneId;
      if (entry.recordX != null) item.recordX = entry.recordX;
      if (entry.recordY != null) item.recordY = entry.recordY;
      return item;
    });
  } catch {
    return emptySlots();
  }
}

/** @param {(MoeItemBoxItem | null)[]} slots */
export function saveMoeItemBoxSlots(slots) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MOE_ITEM_BOX_SLOTS_KEY, JSON.stringify(slots));
  } catch {
    /* quota */
  }
}

export function notifyMoeItemBoxSlotsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MOE_ITEM_BOX_SLOTS_EVENT));
}

/** @returns {number | null} */
export function loadMoeItemBoxSelectedIndex() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MOE_ITEM_BOX_SELECTED_KEY);
    if (raw == null || raw === "") return null;
    const n = Math.floor(Number(raw));
    if (!Number.isFinite(n) || n < 0 || n >= MOE_ITEM_SLOT_COUNT) return null;
    return n;
  } catch {
    return null;
  }
}

/** @param {number | null} index */
export function saveMoeItemBoxSelectedIndex(index) {
  if (typeof window === "undefined") return;
  try {
    if (index == null) {
      localStorage.removeItem(MOE_ITEM_BOX_SELECTED_KEY);
    } else {
      localStorage.setItem(MOE_ITEM_BOX_SELECTED_KEY, String(index));
    }
  } catch {
    /* quota */
  }
}

export function notifyMoeItemBoxSelectedChanged(index) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(MOE_ITEM_BOX_SELECTED_EVENT, { detail: { index } })
  );
}

/** @param {string} stoneId @returns {boolean} */
export function selectMoeItemBoxByRecordStoneId(stoneId) {
  if (!stoneId) return false;
  const slots = loadMoeItemBoxSlots();
  const index = slots.findIndex(
    (item) =>
      item?.recordStoneId === stoneId || item?.id === `hr_item_${stoneId}`
  );
  if (index < 0) return false;
  saveMoeItemBoxSelectedIndex(index);
  notifyMoeItemBoxSelectedChanged(index);
  return true;
}

/**
 * 空きスロットにアイテムを追加
 * @param {MoeItemBoxItem} item
 * @returns {boolean} 追加できたか
 */
export function addMoeItemBoxItem(item) {
  if (!item?.id) return false;
  const slots = loadMoeItemBoxSlots();
  const index = slots.findIndex((s) => s == null);
  if (index < 0) return false;
  slots[index] = {
    id: item.id,
    label: item.label ?? item.id,
    ...(item.emoji != null ? { emoji: item.emoji } : {}),
    ...(item.iconKind != null ? { iconKind: item.iconKind } : {}),
    ...(item.expAmount != null ? { expAmount: item.expAmount } : {}),
    ...(item.recordStoneId != null ? { recordStoneId: item.recordStoneId } : {}),
    ...(item.recordX != null ? { recordX: item.recordX } : {}),
    ...(item.recordY != null ? { recordY: item.recordY } : {}),
  };
  saveMoeItemBoxSlots(slots);
  notifyMoeItemBoxSlotsChanged();
  return true;
}

/** @param {number} index */
export function removeMoeItemBoxSlot(index) {
  const slots = loadMoeItemBoxSlots();
  if (index < 0 || index >= slots.length || !slots[index]) return false;
  slots[index] = null;
  saveMoeItemBoxSlots(slots);
  notifyMoeItemBoxSlotsChanged();
  return true;
}

/** @param {import("@/data/moeFieldTreasures").MoeFieldLootItem} loot */
export function moeFieldLootToBoxItem(loot) {
  if (!loot?.id) return null;
  return {
    id: loot.id,
    label: loot.label,
    ...(loot.emoji != null ? { emoji: loot.emoji } : {}),
    ...(loot.iconKind != null ? { iconKind: loot.iconKind } : {}),
    ...(loot.expAmount != null ? { expAmount: loot.expAmount } : {}),
  };
}
