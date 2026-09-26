import {
  petUsesPreciseWikiStats,
  roundPetStatInternal,
} from "@/data/moePets";

/** AGE拠点の家 — 室内のみの弱リジェネ（焚き火休息より控えめ） */
export const MOE_AGE_HUB_HOUSE_PET_REGEN = {
  intervalSec: 3,
  hp: 5,
  mp: 1,
};

/**
 * @param {object} pet
 * @param {number} acc
 * @param {number} dt
 * @param {{ active: boolean }} opts
 */
export function tickMoeAgeHubHousePetRegen(pet, acc, dt, opts) {
  if (!opts.active || !pet) {
    return { pet, acc: 0, changed: false, hpGain: 0 };
  }
  if (pet.hp >= pet.hpMax && pet.mp >= pet.mpMax) {
    return { pet, acc: 0, changed: false, hpGain: 0 };
  }

  let nextAcc = acc + dt;
  const { intervalSec, hp: hpStep, mp: mpStep } = MOE_AGE_HUB_HOUSE_PET_REGEN;
  if (nextAcc < intervalSec) {
    return { pet, acc: nextAcc, changed: false, hpGain: 0 };
  }
  nextAcc -= intervalSec;

  const hpRaw = Math.min(pet.hpMax, pet.hp + hpStep);
  const mpRaw = Math.min(pet.mpMax, pet.mp + mpStep);
  const hp = petUsesPreciseWikiStats(pet.id)
    ? roundPetStatInternal(hpRaw)
    : hpRaw;
  const mp = petUsesPreciseWikiStats(pet.id)
    ? roundPetStatInternal(mpRaw)
    : mpRaw;
  const hpGain = Math.max(0, hp - pet.hp);
  if (hpGain <= 0 && mp >= pet.mp) {
    return { pet, acc: nextAcc, changed: false, hpGain: 0 };
  }

  return {
    pet: { ...pet, hp, mp },
    acc: nextAcc,
    changed: true,
    hpGain,
  };
}
