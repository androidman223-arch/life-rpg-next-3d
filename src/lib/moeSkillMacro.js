/**
 * マクロ 1〜10 — MoE 公式によせた形（docs/参考メモ_MoEマクロ.md）
 *
 * 1つのマクロ = タイトル ＋ 6行。上から順に 実行する。
 * 1行は「技」か「待ち（/pause）」か「空き」。
 * 待ちは MoE の /pause と同じ きざみ: 1 = 0.1秒（例 /pause 2 = 0.2秒）。
 *
 * 前の形 { skillA, waitSec, skillB } は 読みこむときに 6行へ うつす。
 */

export const MOE_SKILL_MACRO_STORAGE_KEY = "life-rpg-moe-skill-macro";

export const MOE_SKILL_MACRO_COUNT = 10;
/** 1つのマクロの行数（MoE 公式と同じ 6行） */
export const MOE_SKILL_MACRO_LINES = 6;
/** /pause 1 の秒数 */
export const MOE_SKILL_MACRO_PAUSE_UNIT_SEC = 0.1;
export const MOE_SKILL_MACRO_PAUSE_MIN = 1;
/** 60秒（前のマクロの いちばん長い待ち） */
export const MOE_SKILL_MACRO_PAUSE_MAX = 600;
export const MOE_SKILL_MACRO_TITLE_MAX = 12;

/** 前の形の待ち（秒） — 古いテスト・読みこみ用 */
export const MOE_SKILL_MACRO_WAIT_MIN = 1;
export const MOE_SKILL_MACRO_WAIT_MAX = 60;

const SOURCES = new Set(["player1", "pet", "phoenix", "dragon"]);

/** @typedef {{ source: 'player1' | 'pet' | 'phoenix' | 'dragon', slotKey: string }} MoeSkillMacroRef */
/** @typedef {{ kind: 'skill', ref: MoeSkillMacroRef } | { kind: 'pause', ticks: number } | null} MoeSkillMacroLine */
/** @typedef {{ title: string, lines: MoeSkillMacroLine[] }} MoeSkillMacroSet */

function emptyLines() {
  return Array.from({ length: MOE_SKILL_MACRO_LINES }, () => null);
}

function emptySet() {
  return { title: "", lines: emptyLines() };
}

export function emptyMoeSkillMacros() {
  return Array.from({ length: MOE_SKILL_MACRO_COUNT }, emptySet);
}

/** 待ちの えらべる数（/pause の数） */
export function moeSkillMacroPauseChoices() {
  return [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15, 18, 20, 25, 30, 40, 50, 60, 80,
    100, 150, 200, 300, 450, 600,
  ];
}

/** @param {number} ticks */
export function moeSkillMacroPauseSec(ticks) {
  return Math.round(ticks * MOE_SKILL_MACRO_PAUSE_UNIT_SEC * 10) / 10;
}

/** 「0.2秒」のような 表示 @param {number} ticks */
export function moeSkillMacroPauseLabel(ticks) {
  return `${moeSkillMacroPauseSec(ticks)}秒`;
}

/** @param {unknown} raw */
function normalizeRef(raw) {
  if (!raw || typeof raw !== "object") return null;
  const source = /** @type {{ source?: string }} */ (raw).source;
  const slotKey = /** @type {{ slotKey?: string }} */ (raw).slotKey;
  if (!SOURCES.has(source) || typeof slotKey !== "string" || !slotKey) return null;
  return { source, slotKey };
}

/** @param {unknown} raw */
function normalizeTicks(raw) {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n)) return null;
  if (n < MOE_SKILL_MACRO_PAUSE_MIN || n > MOE_SKILL_MACRO_PAUSE_MAX) return null;
  return n;
}

/** @param {unknown} raw @returns {MoeSkillMacroLine} */
function normalizeLine(raw) {
  if (!raw || typeof raw !== "object") return null;
  const row = /** @type {{ kind?: string, ref?: unknown, ticks?: unknown }} */ (raw);
  if (row.kind === "skill") {
    const ref = normalizeRef(row.ref);
    return ref ? { kind: "skill", ref } : null;
  }
  if (row.kind === "pause") {
    const ticks = normalizeTicks(row.ticks);
    return ticks != null ? { kind: "pause", ticks } : null;
  }
  return null;
}

/** @param {unknown} raw */
function normalizeTitle(raw) {
  if (typeof raw !== "string") return "";
  return raw.replace(/[\r\n\t]/g, " ").trim().slice(0, MOE_SKILL_MACRO_TITLE_MAX);
}

/**
 * 前の形 { skillA, waitSec, skillB } → 6行
 * @param {{ skillA?: unknown, waitSec?: unknown, skillB?: unknown }} row
 */
function legacyToLines(row) {
  const lines = emptyLines();
  const a = normalizeRef(row.skillA);
  const b = normalizeRef(row.skillB);
  const sec = Math.round(Number(row.waitSec));
  const ticks =
    Number.isFinite(sec) &&
    sec >= MOE_SKILL_MACRO_WAIT_MIN &&
    sec <= MOE_SKILL_MACRO_WAIT_MAX
      ? normalizeTicks(sec / MOE_SKILL_MACRO_PAUSE_UNIT_SEC)
      : null;
  if (a) lines[0] = { kind: "skill", ref: a };
  if (ticks != null) lines[1] = { kind: "pause", ticks };
  if (b) lines[2] = { kind: "skill", ref: b };
  return lines;
}

/** @param {unknown} raw @returns {MoeSkillMacroSet[]} */
export function normalizeMoeSkillMacros(raw) {
  const base = emptyMoeSkillMacros();
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray(/** @type {{ sets?: unknown }} */ (raw).sets)
      ? /** @type {{ sets: unknown[] }} */ (raw).sets
      : [];
  return base.map((fallback, i) => {
    const item = list[i];
    if (!item || typeof item !== "object") return fallback;
    const row = /** @type {Record<string, unknown>} */ (item);
    if (Array.isArray(row.lines)) {
      const lines = emptyLines().map((_, j) => normalizeLine(row.lines[j]));
      return { title: normalizeTitle(row.title), lines };
    }
    return { title: "", lines: legacyToLines(row) };
  });
}

export function loadMoeSkillMacros() {
  if (typeof window === "undefined") return emptyMoeSkillMacros();
  try {
    const raw = window.localStorage.getItem(MOE_SKILL_MACRO_STORAGE_KEY);
    if (!raw) return emptyMoeSkillMacros();
    return normalizeMoeSkillMacros(JSON.parse(raw));
  } catch {
    return emptyMoeSkillMacros();
  }
}

/** @param {MoeSkillMacroSet[]} state */
export function saveMoeSkillMacros(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MOE_SKILL_MACRO_STORAGE_KEY,
      JSON.stringify({ v: 2, sets: normalizeMoeSkillMacros(state) })
    );
  } catch {
    /* quota */
  }
}

/**
 * @param {MoeSkillMacroSet[]} state
 * @param {number} macroIndex
 * @param {number} lineIndex
 * @param {MoeSkillMacroLine} line
 */
function editLine(state, macroIndex, lineIndex, line) {
  const next = normalizeMoeSkillMacros(state);
  if (macroIndex < 0 || macroIndex >= next.length) return next;
  if (lineIndex < 0 || lineIndex >= MOE_SKILL_MACRO_LINES) return next;
  const lines = next[macroIndex].lines.slice();
  lines[lineIndex] = line;
  next[macroIndex] = { ...next[macroIndex], lines };
  return next;
}

/**
 * 行に 技を入れる
 * @param {MoeSkillMacroSet[]} state
 * @param {number} macroIndex
 * @param {number} lineIndex 0〜5
 * @param {MoeSkillMacroRef} ref
 */
export function setMoeSkillMacroSkill(state, macroIndex, lineIndex, ref) {
  const clean = normalizeRef(ref);
  if (!clean) return normalizeMoeSkillMacros(state);
  return editLine(state, macroIndex, lineIndex, { kind: "skill", ref: clean });
}

/**
 * 行に 待ち（/pause）を入れる
 * @param {MoeSkillMacroSet[]} state
 * @param {number} macroIndex
 * @param {number} lineIndex 0〜5
 * @param {number} ticks 1 = 0.1秒
 */
export function setMoeSkillMacroPause(state, macroIndex, lineIndex, ticks) {
  const clean = normalizeTicks(ticks);
  if (clean == null) return normalizeMoeSkillMacros(state);
  return editLine(state, macroIndex, lineIndex, { kind: "pause", ticks: clean });
}

/** 行を 空にする */
export function clearMoeSkillMacroLine(state, macroIndex, lineIndex) {
  return editLine(state, macroIndex, lineIndex, null);
}

/** タイトル（スロットに出る名前） */
export function setMoeSkillMacroTitle(state, macroIndex, title) {
  const next = normalizeMoeSkillMacros(state);
  if (macroIndex < 0 || macroIndex >= next.length) return next;
  next[macroIndex] = { ...next[macroIndex], title: normalizeTitle(title) };
  return next;
}

/** いちばん上の技（アイコンに使う） @param {MoeSkillMacroSet | null | undefined} set */
export function moeSkillMacroFirstSkill(set) {
  for (const line of set?.lines ?? []) {
    if (line?.kind === "skill") return line.ref;
  }
  return null;
}

/**
 * 実行の手順。技が1つもなければ null。
 * 技は 上から順に、それまでの 待ちの合計（ミリ秒）で 出す。さいごの待ちは 「うけつけない時間」になる。
 * @param {MoeSkillMacroSet | null | undefined} set
 * @returns {{ steps: { ref: MoeSkillMacroRef, atMs: number }[], totalMs: number } | null}
 */
export function planMoeSkillMacroRun(set) {
  const steps = [];
  let atMs = 0;
  for (const line of set?.lines ?? []) {
    if (!line) continue;
    if (line.kind === "pause") {
      atMs += Math.round(line.ticks * MOE_SKILL_MACRO_PAUSE_UNIT_SEC * 1000);
    } else if (line.kind === "skill") {
      steps.push({ ref: line.ref, atMs });
    }
  }
  if (!steps.length) return null;
  return { steps, totalMs: atMs };
}
