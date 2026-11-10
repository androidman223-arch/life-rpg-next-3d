/**
 * 全部セーブ（引っこし用）— このサイトの localStorage を全部 1 つの JSON にする。
 * ペット・アイテム・訓練士Lv・修行・スキルの並び・設定もまとめて持ち出せる。
 * 読みこみは上書きだけ。ファイルに無いキーは消さない。
 */

export const MOE_FULL_BACKUP_FORMAT = "life-rpg-full-backup";
export const MOE_FULL_BACKUP_VERSION = 1;

/**
 * @param {Pick<Storage, "length" | "key" | "getItem">} storage
 * @param {Date} [date]
 */
export function buildMoeFullBackupPayload(storage, date = new Date()) {
  /** @type {Record<string, string>} */
  const keys = {};
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key == null) continue;
    const value = storage.getItem(key);
    if (value != null) keys[key] = value;
  }
  const sorted = Object.fromEntries(
    Object.keys(keys)
      .sort()
      .map((k) => [k, keys[k]])
  );
  return {
    format: MOE_FULL_BACKUP_FORMAT,
    version: MOE_FULL_BACKUP_VERSION,
    savedAt: date.toISOString(),
    keyCount: Object.keys(sorted).length,
    keys: sorted,
  };
}

/**
 * @param {unknown} payload
 * @returns {{ ok: true, keys: Record<string, string> } | { ok: false, message: string }}
 */
export function parseMoeFullBackupPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, message: "ファイルの中身が読めませんでした" };
  }
  const row = /** @type {Record<string, unknown>} */ (payload);
  if (row.format !== MOE_FULL_BACKUP_FORMAT) {
    return {
      ok: false,
      message: "全部セーブのファイルではありません（ペットの外部セーブはフィールドで読みこみます）",
    };
  }
  if (Number(row.version) > MOE_FULL_BACKUP_VERSION) {
    return { ok: false, message: "新しい版のファイルです。ゲームを新しくしてください" };
  }
  if (!row.keys || typeof row.keys !== "object" || Array.isArray(row.keys)) {
    return { ok: false, message: "セーブの中身がありません" };
  }
  /** @type {Record<string, string>} */
  const keys = {};
  for (const [key, value] of Object.entries(row.keys)) {
    if (typeof value === "string") keys[key] = value;
  }
  if (Object.keys(keys).length === 0) {
    return { ok: false, message: "セーブの中身がありません" };
  }
  return { ok: true, keys };
}

/**
 * @param {Pick<Storage, "setItem">} storage
 * @param {Record<string, string>} keys
 * @returns {{ written: number, failed: string[] }}
 */
export function applyMoeFullBackupKeys(storage, keys) {
  let written = 0;
  /** @type {string[]} */
  const failed = [];
  for (const [key, value] of Object.entries(keys)) {
    try {
      storage.setItem(key, value);
      written += 1;
    } catch {
      failed.push(key);
    }
  }
  return { written, failed };
}

export function buildMoeFullBackupFilename(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `life-rpg-zenbu-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}-${pad(date.getHours())}${pad(date.getMinutes())}.json`;
}
