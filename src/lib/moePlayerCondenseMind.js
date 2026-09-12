/**
 * プレイヤー技 — コンデンスマインド（回復60）
 * Wiki: 消費MP34 · 対象のMP自然回復アップ（MP残量による使用制限なし）
 * ※ペットのマナ増幅法はMP5割以下だが、プレイヤー技にはその条件はない
 */

import {
  ATRUM_CONDENSE_MIND_MP_PER_SEC,
  atrumManaAmpDurationSec,
} from "@/lib/moeAtrumPetSkills";
import {
  canUsePlayerCondenseMind,
  PLAYER_CONDENSE_MIND_MP_COST,
} from "@/lib/moe/moeCondenseMindRules";
import { saveMoePlayerVitals } from "@/lib/moePlayerVitals";

export { PLAYER_CONDENSE_MIND_MP_COST, canUsePlayerCondenseMind };
export const PLAYER_CONDENSE_MIND_MP_PER_SEC = ATRUM_CONDENSE_MIND_MP_PER_SEC;

/** @typedef {'player' | 'pet'} MoeCondenseMindTarget */

/** @param {number} trainerLevel */
export function playerCondenseMindDurationSec(trainerLevel) {
  return atrumManaAmpDurationSec(trainerLevel);
}

/** @param {{ mp?: number, mpMax?: number }} casterVitals @param {{ mp?: number, mpMax?: number }} [_targetVitals] */
export function canUseCondenseMindOnTarget(casterVitals, _targetVitals) {
  return canUsePlayerCondenseMind(casterVitals);
}

/**
 * @param {{ mp?: number, mpMax?: number }} casterVitals
 * @param {{ mp?: number, mpMax?: number }} targetVitals
 * @param {MoeCondenseMindTarget} targetKind
 * @param {number} trainerLevel
 * @param {string} [targetName]
 */
export function activateCondenseMindOnTarget(
  casterVitals,
  targetVitals,
  targetKind,
  trainerLevel,
  targetName = ""
) {
  const check = canUseCondenseMindOnTarget(casterVitals, targetVitals);
  if (!check.ok) {
    if (check.reason === "not_enough_mp") {
      return {
        ok: false,
        toast: `MPが足りません（消費${PLAYER_CONDENSE_MIND_MP_COST}）`,
      };
    }
    return { ok: false, toast: "使えません" };
  }

  const durationSec = playerCondenseMindDurationSec(trainerLevel);
  const casterNext = {
    ...casterVitals,
    mp: Math.max(0, (casterVitals.mp ?? 0) - PLAYER_CONDENSE_MIND_MP_COST),
  };
  const buff = {
    until: Date.now() + durationSec * 1000,
    mpBuffer: 0,
    mpPerSec: PLAYER_CONDENSE_MIND_MP_PER_SEC,
  };
  const who = targetName || (targetKind === "player" ? "プレイヤー" : "ペット");

  return {
    ok: true,
    targetKind,
    casterVitals: casterNext,
    durationSec,
    buff,
    skillToast: "コンデンスマインド！",
    toast: `${who}にコンデンスマインド — ${durationSec}秒間 MP自然回復アップ（約${PLAYER_CONDENSE_MIND_MP_PER_SEC}MP/秒）`,
  };
}

/** @param {{ mp?: number, mpMax?: number }} vitals @param {number} trainerLevel */
export function activatePlayerCondenseMind(vitals, trainerLevel) {
  return activateCondenseMindOnTarget(
    vitals,
    vitals,
    "player",
    trainerLevel,
    "プレイヤー"
  );
}

/** @param {{ current: { until: number, mpBuffer: number, mpPerSec: number } | null }} ref */
export function isPlayerCondenseMindActive(ref) {
  const src = ref.current;
  return Boolean(src && Date.now() < src.until);
}

/**
 * @param {{ current: { until: number, mpBuffer: number, mpPerSec: number } | null }} ref
 * @param {number} dt
 * @param {{ current: object }} playerVitalsRef
 * @param {Function} setPlayerVitals
 * @param {(active: boolean) => void} [setActive]
 */
export function tickPlayerCondenseMind(
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

  src.mpBuffer =
    (src.mpBuffer ?? 0) +
    dt * (src.mpPerSec ?? PLAYER_CONDENSE_MIND_MP_PER_SEC);
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
