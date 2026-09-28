/** セット1 / セット2 — 元スキルのコピー枠（10）。元の並びは変えない */

import { MOE_SKILL_MACRO_COUNT } from "./moeSkillMacro.js";

export const MOE_SKILL_SET_COPIES_STORAGE_KEY =
  "life-rpg-moe-skill-set-copies";

export const MOE_SKILL_SET_SLOT_COUNT = 10;

const SET_IDS = ["set1", "set2"];
const SOURCES = new Set(["player1", "pet", "phoenix", "dragon", "macro"]);

/** @typedef {'set1' | 'set2'} MoeSkillSetId */
/** @typedef {{ source: 'player1' | 'pet' | 'phoenix' | 'dragon' | 'macro', slotKey: string }} MoeSkillSetRef */

export function emptyMoeSkillSetCopies() {
  return {
    set1: Array(MOE_SKILL_SET_SLOT_COUNT).fill(null),
    set2: Array(MOE_SKILL_SET_SLOT_COUNT).fill(null),
  };
}

/** @param {unknown} raw */
function normalizeRef(raw) {
  if (!raw || typeof raw !== "object") return null;
  const source = /** @type {{ source?: string, slotKey?: string }} */ (raw).source;
  const slotKey = /** @type {{ slotKey?: string }} */ (raw).slotKey;
  if (!SOURCES.has(source) || typeof slotKey !== "string" || !slotKey) return null;
  if (source === "macro") {
    const index = Number(slotKey.slice("macro:".length));
    if (!Number.isInteger(index) || index < 0 || index >= MOE_SKILL_MACRO_COUNT) {
      return null;
    }
    return { source, slotKey: `macro:${index}` };
  }
  return { source, slotKey };
}

/** @param {unknown} raw */
export function normalizeMoeSkillSetCopies(raw) {
  const empty = emptyMoeSkillSetCopies();
  if (!raw || typeof raw !== "object") return empty;
  for (const id of SET_IDS) {
    const list = /** @type {{ set1?: unknown, set2?: unknown }} */ (raw)[id];
    if (!Array.isArray(list)) continue;
    empty[id] = Array.from({ length: MOE_SKILL_SET_SLOT_COUNT }, (_, i) =>
      normalizeRef(list[i])
    );
  }
  return empty;
}

export function loadMoeSkillSetCopies() {
  if (typeof window === "undefined") return emptyMoeSkillSetCopies();
  try {
    const raw = window.localStorage.getItem(MOE_SKILL_SET_COPIES_STORAGE_KEY);
    if (!raw) return emptyMoeSkillSetCopies();
    return normalizeMoeSkillSetCopies(JSON.parse(raw));
  } catch {
    return emptyMoeSkillSetCopies();
  }
}

/** @param {ReturnType<typeof emptyMoeSkillSetCopies>} state */
export function saveMoeSkillSetCopies(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MOE_SKILL_SET_COPIES_STORAGE_KEY,
      JSON.stringify(normalizeMoeSkillSetCopies(state))
    );
  } catch {
    /* quota */
  }
}

/**
 * 元スキルをセットの枠へコピーする。元リストは触らない。
 * @param {ReturnType<typeof emptyMoeSkillSetCopies>} state
 * @param {MoeSkillSetId} setId
 * @param {number} index
 * @param {MoeSkillSetRef} ref
 */
export function copyMoeSkillIntoSet(state, setId, index, ref) {
  const next = normalizeMoeSkillSetCopies(state);
  const clean = normalizeRef(ref);
  if (!SET_IDS.includes(setId) || !clean) return next;
  if (index < 0 || index >= MOE_SKILL_SET_SLOT_COUNT) return next;
  next[setId] = next[setId].map((item, i) => (i === index ? clean : item));
  return next;
}

/**
 * セット内のコピー同士だけ入れ替える。
 * @param {ReturnType<typeof emptyMoeSkillSetCopies>} state
 * @param {MoeSkillSetId} setId
 * @param {number} a
 * @param {number} b
 */
export function swapMoeSkillSetSlots(state, setId, a, b) {
  const next = normalizeMoeSkillSetCopies(state);
  if (!SET_IDS.includes(setId)) return next;
  if (a === b || a < 0 || b < 0 || a >= MOE_SKILL_SET_SLOT_COUNT || b >= MOE_SKILL_SET_SLOT_COUNT) {
    return next;
  }
  const row = [...next[setId]];
  [row[a], row[b]] = [row[b], row[a]];
  next[setId] = row;
  return next;
}
