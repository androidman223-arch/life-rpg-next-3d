/** マクロ 1〜10。各セットは 技・待ち・技 の3枠 */

export const MOE_SKILL_MACRO_STORAGE_KEY = "life-rpg-moe-skill-macro";

export const MOE_SKILL_MACRO_COUNT = 10;
export const MOE_SKILL_MACRO_WAIT_MIN = 1;
export const MOE_SKILL_MACRO_WAIT_MAX = 60;

const SOURCES = new Set(["player1", "pet", "phoenix", "dragon"]);

/** @typedef {{ source: 'player1' | 'pet' | 'phoenix' | 'dragon', slotKey: string }} MoeSkillMacroRef */
/** @typedef {{ skillA: MoeSkillMacroRef | null, waitSec: number | null, skillB: MoeSkillMacroRef | null }} MoeSkillMacroSet */

function emptySet() {
  return { skillA: null, waitSec: null, skillB: null };
}

export function emptyMoeSkillMacros() {
  return Array.from({ length: MOE_SKILL_MACRO_COUNT }, emptySet);
}

/** @returns {number[]} */
export function moeSkillMacroWaitChoices() {
  const list = [];
  for (let sec = MOE_SKILL_MACRO_WAIT_MIN; sec <= MOE_SKILL_MACRO_WAIT_MAX; sec += 1) {
    list.push(sec);
  }
  return list;
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
function normalizeWait(raw) {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n)) return null;
  if (n < MOE_SKILL_MACRO_WAIT_MIN || n > MOE_SKILL_MACRO_WAIT_MAX) return null;
  return n;
}

/** @param {unknown} raw */
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
    const row = /** @type {{ skillA?: unknown, skillB?: unknown, waitSec?: unknown }} */ (item);
    return {
      skillA: normalizeRef(row.skillA),
      waitSec: normalizeWait(row.waitSec),
      skillB: normalizeRef(row.skillB),
    };
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
      JSON.stringify({ v: 1, sets: normalizeMoeSkillMacros(state) })
    );
  } catch {
    /* quota */
  }
}

/**
 * 技枠（0 または 2）へコピーする。待ち枠（1）には入れない。
 * @param {MoeSkillMacroSet[]} state
 * @param {number} macroIndex
 * @param {number} slotIndex
 * @param {MoeSkillMacroRef} ref
 */
export function setMoeSkillMacroSkill(state, macroIndex, slotIndex, ref) {
  const next = normalizeMoeSkillMacros(state);
  const clean = normalizeRef(ref);
  if (macroIndex < 0 || macroIndex >= next.length || !clean) return next;
  if (slotIndex === 0) next[macroIndex] = { ...next[macroIndex], skillA: clean };
  if (slotIndex === 2) next[macroIndex] = { ...next[macroIndex], skillB: clean };
  return next;
}

/**
 * @param {MoeSkillMacroSet[]} state
 * @param {number} macroIndex
 * @param {number} sec
 */
export function setMoeSkillMacroWait(state, macroIndex, sec) {
  const next = normalizeMoeSkillMacros(state);
  const waitSec = normalizeWait(sec);
  if (macroIndex < 0 || macroIndex >= next.length || waitSec == null) return next;
  next[macroIndex] = { ...next[macroIndex], waitSec };
  return next;
}

/**
 * 技・待ち・技が揃っているときだけ再生手順を返す。
 * @param {MoeSkillMacroSet | null | undefined} set
 */
export function planMoeSkillMacroRun(set) {
  if (!set?.skillA || !set?.skillB || set.waitSec == null) return null;
  return {
    skillA: set.skillA,
    waitSec: set.waitSec,
    skillB: set.skillB,
  };
}
