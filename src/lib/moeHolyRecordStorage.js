/** @deprecated ワールド上のレコード石は廃止 — 旧データ削除用 */
export const MOE_HOLY_RECORD_STORAGE_KEY = "life-rpg-moe-holy-records";

/** 旧仕様のマップ上レコード石データを削除 */
export function clearHolyRecordWorldStones() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(MOE_HOLY_RECORD_STORAGE_KEY);
  } catch {
    /* quota */
  }
}
