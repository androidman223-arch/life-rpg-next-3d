/**
 * プレイヤー技 — 自力整然（Lv10）
 * 消費MP13 · 最初10秒はコンデンス2倍回復 → 以降5分は通常コンデンス（2MP/秒）
 */

import { saveMoePlayerVitals } from "./moePlayerVitals.js";

/** コンデンスマインド相当（moeAtrumPetSkills と同値） */
const CONDENSE_MP_PER_SEC = 2;

export const JIRIKI_SEIRAN_REQUIRED_SKILL_LEVEL = 10;
export const JIRIKI_SEIRAN_MP_COST = 13;
export const JIRIKI_SEIRAN_BOOST_SEC = 10;
export const JIRIKI_SEIRAN_NORMAL_SEC = 300;
export const JIRIKI_SEIRAN_BOOST_MP_PER_SEC = CONDENSE_MP_PER_SEC * 2;
export const JIRIKI_SEIRAN_NORMAL_MP_PER_SEC = CONDENSE_MP_PER_SEC;
export const JIRIKI_SEIRAN_TOTAL_SEC =
  JIRIKI_SEIRAN_BOOST_SEC + JIRIKI_SEIRAN_NORMAL_SEC;

/** @param {{ mp?: number }} vitals */
export function canUseJirikiSeiran(vitals) {
  const mp = vitals?.mp ?? 0;
  if (mp < JIRIKI_SEIRAN_MP_COST) {
    return { ok: false, reason: "not_enough_mp" };
  }
  return { ok: true };
}

/**
 * @param {{ mp?: number, mpMax?: number }} vitals
 * @param {number} [nowMs]
 */
export function activateJirikiSeiran(vitals, nowMs = Date.now()) {
  const check = canUseJirikiSeiran(vitals);
  if (!check.ok) {
    if (check.reason === "not_enough_mp") {
      return {
        ok: false,
        toast: `MPが足りません（消費${JIRIKI_SEIRAN_MP_COST}）`,
      };
    }
    return { ok: false, toast: "使えません" };
  }

  const casterNext = {
    ...vitals,
    mp: Math.max(0, (vitals.mp ?? 0) - JIRIKI_SEIRAN_MP_COST),
  };
  const buff = {
    until: nowMs + JIRIKI_SEIRAN_TOTAL_SEC * 1000,
    boostUntil: nowMs + JIRIKI_SEIRAN_BOOST_SEC * 1000,
    mpBuffer: 0,
    mpPerSec: JIRIKI_SEIRAN_BOOST_MP_PER_SEC,
    boostMpPerSec: JIRIKI_SEIRAN_BOOST_MP_PER_SEC,
    normalMpPerSec: JIRIKI_SEIRAN_NORMAL_MP_PER_SEC,
  };

  return {
    ok: true,
    casterVitals: casterNext,
    buff,
    skillToast: "自力整然！",
    toast: `自力整然 — ${JIRIKI_SEIRAN_BOOST_SEC}秒間 MP回復2倍 → ${JIRIKI_SEIRAN_NORMAL_SEC}秒間コンデンス（約${JIRIKI_SEIRAN_NORMAL_MP_PER_SEC}MP/秒）`,
  };
}

/** @param {{ current: object | null }} ref @param {number} [nowMs] */
export function isJirikiSeiranActive(ref, nowMs = Date.now()) {
  const src = ref.current;
  return Boolean(src && nowMs < src.until);
}

/** @param {object} src @param {number} nowMs */
export function syncJirikiSeiranPhase(src, nowMs) {
  if (nowMs >= src.boostUntil) {
    src.mpPerSec = src.normalMpPerSec ?? JIRIKI_SEIRAN_NORMAL_MP_PER_SEC;
  }
}

/**
 * @param {{ current: object | null }} ref
 * @param {number} dt
 * @param {{ current: object }} playerVitalsRef
 * @param {Function} setPlayerVitals
 * @param {(active: boolean) => void} [setActive]
 */
export function tickJirikiSeiran(
  ref,
  dt,
  playerVitalsRef,
  setPlayerVitals,
  setActive
) {
  const src = ref.current;
  if (!src) return;
  const now = Date.now();
  if (now >= src.until) {
    ref.current = null;
    setActive?.(false);
    return;
  }

  syncJirikiSeiranPhase(src, now);

  src.mpBuffer =
    (src.mpBuffer ?? 0) + dt * (src.mpPerSec ?? JIRIKI_SEIRAN_NORMAL_MP_PER_SEC);
  const gain = Math.floor(src.mpBuffer);
  if (gain <= 0) return;
  src.mpBuffer -= gain;

  const prev = playerVitalsRef.current;
  if ((prev.mp ?? 0) >= (prev.mpMax ?? 0)) return;
  const mp = Math.min(prev.mpMax ?? 0, (prev.mp ?? 0) + gain);
  if (mp <= (prev.mp ?? 0)) return;
  const next = { ...prev, mp: Math.floor(mp) };
  playerVitalsRef.current = next;
  setPlayerVitals(next);
  saveMoePlayerVitals(next);
}
