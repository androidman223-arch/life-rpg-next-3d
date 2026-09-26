/**
 * アルター — 明日やることメモ（自由追加 · 日末チェック用）
 */

export const MOE_TOMORROW_MEMO_STORAGE_KEY = "life-rpg-moe-tomorrow-memo-v2";
export const MOE_TOMORROW_MEMO_LEGACY_KEY = "life-rpg-moe-tomorrow-memo-v1";

/** @typedef {{ id: string, text: string, done: boolean }} MoeTomorrowMemoEntry */
/** @typedef {{ entries: MoeTomorrowMemoEntry[], panelOpen: boolean }} MoeTomorrowMemoState */

let nextMemoId = 1;

/** @returns {string} */
export function createTomorrowMemoId() {
  nextMemoId += 1;
  return `memo-${Date.now()}-${nextMemoId}`;
}

/** 育成設計メモ（アルターに追記 · 固定リストではない） */
export const MOE_TOMORROW_MEMO_DESIGN_NOTES = [
  "【鳳凰①】自分メモ・目標設定・習慣整える・企画・問題解決・人生設計（お金・人生・仕事など）",
  "【鳳凰①】タイマー開始＝静かに整える。メモを開いて目標・人生などに書いていく",
  "【龍②】タイマー開始＝集中して実践 · 動く · 経験を積む",
  "【龍②】行動後ログ — 討伐 / 走破 / 挑戦 / 整然（自力整然の客観視一行）",
  "【龍②】タイマー完了 → 龍修行EXP → Lv10/20/30…でスキルゲット",
];

/** 初回のひな形（実装タスク） */
export const MOE_TOMORROW_MEMO_STARTER_TEXTS = [
  ...MOE_TOMORROW_MEMO_DESIGN_NOTES,
  "鳳凰/龍スキルゲット9 — データ定義と解放UI",
  "龍の武練 — フィールド実績の自動取り込み（討伐・走破）",
  "訓練士Lv ← ペット育成EXP連動",
  "ボス戦場（小・中・大）＋EXP倍率",
];

/** @returns {MoeTomorrowMemoState} */
export function defaultTomorrowMemoState() {
  return {
    panelOpen: false,
    entries: MOE_TOMORROW_MEMO_STARTER_TEXTS.map((text) => ({
      id: createTomorrowMemoId(),
      text,
      done: false,
    })),
  };
}

/** @param {unknown} raw @returns {MoeTomorrowMemoEntry} */
function normalizeEntry(raw, fallbackText = "") {
  if (!raw || typeof raw !== "object") {
    return { id: createTomorrowMemoId(), text: fallbackText, done: false };
  }
  const text =
    typeof raw.text === "string" && raw.text.trim()
      ? raw.text.trim()
      : fallbackText;
  const id =
    typeof raw.id === "string" && raw.id.trim()
      ? raw.id.trim()
      : createTomorrowMemoId();
  return { id, text, done: Boolean(raw.done) };
}

/** @param {unknown} raw @returns {MoeTomorrowMemoState} */
export function normalizeTomorrowMemoState(raw) {
  const base = defaultTomorrowMemoState();
  if (!raw || typeof raw !== "object") return base;
  const panelOpen = Boolean(raw.panelOpen);
  const entries = Array.isArray(raw.entries)
    ? raw.entries
        .map((row) => normalizeEntry(row))
        .filter((row) => row.text.length > 0)
    : [];
  if (entries.length === 0 && Array.isArray(raw.slots)) {
    for (const row of raw.slots) {
      const entry = normalizeEntry(row);
      if (entry.text) entries.push(entry);
    }
  }
  return {
    panelOpen,
    entries: entries.length > 0 ? entries : base.entries,
  };
}

function migrateLegacyTomorrowMemo() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MOE_TOMORROW_MEMO_LEGACY_KEY);
    if (!raw) return null;
    return normalizeTomorrowMemoState(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** 設計メモを既存リストに不足分だけ追記 */
export function mergeDesignNotesIntoMemo(state) {
  const existing = new Set((state.entries ?? []).map((e) => e.text.trim()));
  const additions = MOE_TOMORROW_MEMO_DESIGN_NOTES.filter(
    (text) => !existing.has(text)
  );
  if (additions.length === 0) return state;
  let next = state;
  for (const text of additions) {
    next = appendTomorrowMemoEntry(next, text);
  }
  return next;
}

/** @returns {MoeTomorrowMemoState} */
export function loadTomorrowMemoState() {
  if (typeof window === "undefined") return defaultTomorrowMemoState();
  try {
    const raw = window.localStorage.getItem(MOE_TOMORROW_MEMO_STORAGE_KEY);
    if (!raw) {
      const legacy = migrateLegacyTomorrowMemo();
      if (legacy) {
        const merged = mergeDesignNotesIntoMemo(legacy);
        saveTomorrowMemoState(merged);
        return merged;
      }
      return defaultTomorrowMemoState();
    }
    const loaded = normalizeTomorrowMemoState(JSON.parse(raw));
    const merged = mergeDesignNotesIntoMemo(loaded);
    if (merged.entries.length !== loaded.entries.length) {
      saveTomorrowMemoState(merged);
    }
    return merged;
  } catch {
    return defaultTomorrowMemoState();
  }
}

/** @param {MoeTomorrowMemoState} state */
export function saveTomorrowMemoState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MOE_TOMORROW_MEMO_STORAGE_KEY,
      JSON.stringify(normalizeTomorrowMemoState(state))
    );
  } catch {
    /* quota */
  }
}

/** @param {MoeTomorrowMemoState} state */
export function countTomorrowMemoDone(state) {
  return (state.entries ?? []).filter((s) => s.done).length;
}

/** @param {MoeTomorrowMemoState} state */
export function countTomorrowMemoTotal(state) {
  return (state.entries ?? []).length;
}

/** @param {MoeTomorrowMemoState} state @param {string} [text] */
export function appendTomorrowMemoEntry(state, text = "") {
  const entries = [
    ...(state.entries ?? []),
    { id: createTomorrowMemoId(), text: text.trim(), done: false },
  ];
  return { ...state, entries };
}

/** @param {MoeTomorrowMemoState} state @param {string} id */
export function removeTomorrowMemoEntry(state, id) {
  return {
    ...state,
    entries: (state.entries ?? []).filter((e) => e.id !== id),
  };
}
