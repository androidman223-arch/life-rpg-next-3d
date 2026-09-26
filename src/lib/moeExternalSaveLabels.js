/**
 * 外部保存 — 表示用ラベル（ブラウザが渡すフォルダ名 → 日本語の場所）
 * フルパスは取得できないため、選んだフォルダ名を「デスクトップ」等に寄せて表示する。
 */

/** @type {Record<string, string>} */
const MOE_SAVE_PLACE_LABELS = {
  Desktop: "デスクトップ",
  デスクトップ: "デスクトップ",
  Downloads: "ダウンロードフォルダ",
  ダウンロード: "ダウンロードフォルダ",
  Download: "ダウンロードフォルダ",
  Documents: "ドキュメント",
  ドキュメント: "ドキュメント",
  書類: "ドキュメント",
  Library: "ライブラリ",
  ライブラリ: "ライブラリ",
  Music: "ミュージック",
  Pictures: "ピクチャ",
  ピクチャ: "ピクチャ",
};

/**
 * @param {string | null | undefined} folderName
 * @returns {string | null}
 */
export function describeMoeExternalSavePlace(folderName) {
  const raw = folderName?.trim();
  if (!raw) return null;
  return MOE_SAVE_PLACE_LABELS[raw] ?? raw;
}

/** @param {string | null | undefined} folderName */
export function formatMoeExternalSavePlaceStatus(folderName) {
  const place = describeMoeExternalSavePlace(folderName);
  if (!place) return "現在の保存先は、未設定です。";
  return `現在の保存先は、${place}です。`;
}

/**
 * @param {string | null | undefined} fileName
 * @returns {string | null}
 */
export function formatMoeExternalSaveFileHint(fileName) {
  const file = fileName?.trim();
  if (!file) return null;
  return `直近のファイル：${file}`;
}

/** @param {{ folderName?: string | null, fileName?: string | null }} loc */
export function formatMoeExternalSaveLocationBlock(loc) {
  const lines = [formatMoeExternalSavePlaceStatus(loc.folderName ?? null)];
  const fileLine = formatMoeExternalSaveFileHint(loc.fileName ?? null);
  if (fileLine) lines.push(fileLine);
  return lines.join("\n");
}

/** AGE面など — 保存時に添えるフィールド地名 */
/** @type {Record<string, string>} */
const MOE_FIELD_MAP_SAVE_LABELS = {
  bisk: "ビスク城下町",
  yug_coast: "ユグ海岸",
  soles_valley: "ソレス渓谷",
  geo_abyss_ne: "ゲオの深淵（北東）",
  geo_abyss_s: "ゲオの深淵（南）",
  geo_abyss_w: "ゲオの深淵（西）",
  mitoya_great_tree: "ミトヤの巨木",
};

/**
 * @param {string | null | undefined} mapSlotId
 * @returns {string | null}
 */
export function describeMoeFieldMapSaveContext(mapSlotId) {
  const id = mapSlotId?.trim();
  if (!id) return null;
  return MOE_FIELD_MAP_SAVE_LABELS[id] ?? null;
}

/** @param {string | null | undefined} mapSlotId */
export function formatMoeExternalSaveFieldHint(mapSlotId) {
  const place = describeMoeFieldMapSaveContext(mapSlotId);
  if (!place) return null;
  return `現在地：${place}`;
}
