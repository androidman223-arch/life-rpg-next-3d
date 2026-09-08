export const MOE_ITEM_BOX_COLS = 5;
export const MOE_ITEM_BOX_ROWS = 4;
export const MOE_ITEM_SLOT_COUNT = MOE_ITEM_BOX_COLS * MOE_ITEM_BOX_ROWS;

export const MOE_ITEM_BOX_SLOTS_KEY = "life-rpg-moe-item-box-slots";
export const MOE_ITEM_BOX_SLOTS_EVENT = "moe-item-box-slots";

/** @typedef {{ id: string, label: string, emoji?: string, iconKind?: string, expAmount?: number }} MoeItemBoxItem */

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
    return parsed.map((entry) =>
      entry && typeof entry === "object" && typeof entry.id === "string"
        ? entry
        : null
    );
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
