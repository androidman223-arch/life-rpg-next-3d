/**
 * ラブペットの10分バフ。メモリだけ。転送・再読み込みで消える。
 * 戦闘の基礎EXPにだけ掛ける（粉・クリスタルの固定EXPには掛けない）。
 */

import {
  MOE_PET_EXP_ADDITIVE,
  MOE_PET_EXP_MULTIPLIERS,
} from "../data/moePetExpBuffs.js";

export const MOE_LOVE_PET_DURATION_MS = 10 * 60 * 1000;

const LOVE_IDS = new Set(["love_pet", "love_pet_dx", "love_pet_all"]);

/** @type {{ byPet: Record<string, { loveUntilMs: number, dxUntilMs: number }>, allUntilMs: number }} */
let state = { byPet: {}, allUntilMs: 0 };

export function resetMoeLovePetBuffs() {
  state = { byPet: {}, allUntilMs: 0 };
}

/** アルター転送で消す */
export function clearMoeLovePetBuffs() {
  resetMoeLovePetBuffs();
}

/** @param {string | undefined | null} itemId */
export function isMoeLovePetItemId(itemId) {
  return LOVE_IDS.has(itemId ?? "");
}

/**
 * @param {string} itemId
 * @param {string} [petId]
 * @param {number} [nowMs]
 */
export function grantMoeLovePetBuff(itemId, petId, nowMs = Date.now()) {
  const untilMs = nowMs + MOE_LOVE_PET_DURATION_MS;
  if (itemId === "love_pet_all") {
    state = { ...state, allUntilMs: untilMs };
    return { kind: "all", untilMs };
  }
  if ((itemId === "love_pet" || itemId === "love_pet_dx") && petId) {
    const prev = state.byPet[petId] ?? { loveUntilMs: 0, dxUntilMs: 0 };
    const next = {
      loveUntilMs: itemId === "love_pet" ? untilMs : prev.loveUntilMs,
      dxUntilMs: itemId === "love_pet_dx" ? untilMs : prev.dxUntilMs,
    };
    state = { ...state, byPet: { ...state.byPet, [petId]: next } };
    return { kind: itemId, untilMs, petId };
  }
  return null;
}

/** @param {string} petId @param {number} [nowMs] */
export function moeLovePetExpMultiplier(petId, nowMs = Date.now()) {
  const slot = state.byPet[petId];
  let add = 1;
  if (slot && slot.loveUntilMs > nowMs) add += MOE_PET_EXP_ADDITIVE.lovePet;
  if (slot && slot.dxUntilMs > nowMs) add += MOE_PET_EXP_ADDITIVE.lovePetDx;
  let mul = add;
  if (state.allUntilMs > nowMs) mul *= MOE_PET_EXP_MULTIPLIERS.lovePetAll;
  return mul;
}

/** @param {string} petId @param {number} baseExp @param {number} [nowMs] */
export function scaleMoePetHitExp(petId, baseExp, nowMs = Date.now()) {
  const base = Math.max(0, Math.floor(Number(baseExp) || 0));
  if (base <= 0) return 0;
  return Math.max(1, Math.round(base * moeLovePetExpMultiplier(petId, nowMs)));
}
