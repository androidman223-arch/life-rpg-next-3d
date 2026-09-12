import { loadMoeItemBoxSlots } from "@/lib/moeItemBoxStorage";

/**
 * ホーリーレコード — 詠唱で現在地の記録がアイテム枠に入る（マップに石は出さない）。
 * テレポートスキルで、選択中のホーリーレコードの地点へテレポ（未選択ならビスク中央）。
 */

/** 詠唱時間（秒） */
export const MOE_HOLY_RECORD_CHANT_SEC = 3;

/** テレポート詠唱時間（秒） */
export const MOE_TELEPORT_CHANT_SEC = 3;

/** アイテム枠に持てるホーリーレコードの上限 */
export const MOE_HOLY_RECORD_MAX_STONES = 5;

/**
 * @typedef {object} MoeHolyRecordStone
 * @property {string} id
 * @property {number} x
 * @property {number} y
 * @property {string} label
 * @property {number} createdAt
 */

/** @param {number} x @param {number} y @param {number} [index] @returns {MoeHolyRecordStone} */
export function createMoeHolyRecordStone(x, y, index = 1) {
  return {
    id: `hr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    x: Number(x) || 0,
    y: Number(y) || 0,
    label: `ホーリーRレコード${index}`,
    createdAt: Date.now(),
  };
}

/** @param {MoeHolyRecordStone} stone @returns {import("@/lib/moeItemBoxStorage").MoeItemBoxItem} */
export function moeHolyRecordToBoxItem(stone) {
  return {
    id: `hr_item_${stone.id}`,
    label: stone.label,
    iconKind: "holy_record",
    recordStoneId: stone.id,
    recordX: stone.x,
    recordY: stone.y,
  };
}

/** @param {import("@/lib/moeItemBoxStorage").MoeItemBoxItem | null | undefined} item */
export function isMoeHolyRecordBoxItem(item) {
  return (
    item?.iconKind === "holy_record" &&
    typeof item.recordStoneId === "string" &&
    item.recordStoneId.length > 0
  );
}

/** @returns {number} */
export function countMoeHolyRecordItems() {
  if (typeof window === "undefined") return 0;
  return loadMoeItemBoxSlots().filter(isMoeHolyRecordBoxItem).length;
}
