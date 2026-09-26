/**
 * マクロ４（タイマー付き）— 席外し用カウントダウン（1秒刻み · sessionStorage）
 */

export const MOE_MACRO_TIMER_STORAGE_KEY = "moe_macro_session_timer_v1";

/** @type {readonly number[]} */
export const MOE_MACRO_TIMER_PRESET_MINUTES = [5, 10, 20, 30, 45, 60];

/**
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatMacroTimerClock(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * @param {string | number} input
 * @returns {number | null} minutes
 */
export function parseMacroTimerMinutes(input) {
  if (typeof input === "number" && Number.isFinite(input)) {
    const n = Math.floor(input);
    return n > 0 && n <= 180 ? n : null;
  }
  const raw = String(input ?? "").trim().toLowerCase();
  if (!raw) return null;
  const m = raw.match(/(\d+)\s*(?:分|m|min)?/);
  if (!m) return null;
  const n = Math.floor(Number(m[1]));
  return n > 0 && n <= 180 ? n : null;
}

/**
 * @returns {{ active: boolean, endsAtMs: number, totalSec: number, label?: string } | null}
 */
export function readMacroTimerSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(MOE_MACRO_TIMER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.endsAtMs || !parsed?.totalSec) return null;
    return {
      active: true,
      endsAtMs: Math.floor(Number(parsed.endsAtMs)),
      totalSec: Math.max(1, Math.floor(Number(parsed.totalSec))),
      label: typeof parsed.label === "string" ? parsed.label : undefined,
    };
  } catch {
    return null;
  }
}

function writeMacroTimerSession(data) {
  if (typeof window === "undefined") return;
  try {
    if (!data) {
      sessionStorage.removeItem(MOE_MACRO_TIMER_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(MOE_MACRO_TIMER_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* private mode */
  }
}

/**
 * @param {number} minutes
 * @param {{ label?: string }} [opts]
 */
export function startMacroTimer(minutes, opts = {}) {
  const m = parseMacroTimerMinutes(minutes);
  if (!m) return null;
  const totalSec = m * 60;
  const endsAtMs = Date.now() + totalSec * 1000;
  const state = {
    active: true,
    endsAtMs,
    totalSec,
    label: opts.label ?? `マクロ４ · ${m}分`,
  };
  writeMacroTimerSession(state);
  return state;
}

export function stopMacroTimer() {
  writeMacroTimerSession(null);
}

/**
 * @param {number} [nowMs]
 * @returns {{
 *   running: boolean,
 *   finished: boolean,
 *   remainingSec: number,
 *   totalSec: number,
 *   label?: string,
 * }}
 */
export function getMacroTimerSnapshot(nowMs = Date.now()) {
  const session = readMacroTimerSession();
  if (!session) {
    return {
      running: false,
      finished: false,
      remainingSec: 0,
      totalSec: 0,
    };
  }
  const remainingMs = session.endsAtMs - nowMs;
  const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const finished = remainingMs <= 0;
  return {
    running: !finished,
    finished,
    remainingSec,
    totalSec: session.totalSec,
    label: session.label,
  };
}
