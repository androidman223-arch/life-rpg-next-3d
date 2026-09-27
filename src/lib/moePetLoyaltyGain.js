/**
 * ペット愛着度 — 戦闘終了時の上昇（餌なし · 強敵戦闘）
 */

export const MOE_PET_LOYALTY_MAX = 100;
/** 敵Lv − ペットLv がこれ以上で「強敵」（MOE EXP表の Lv7上） */
export const MOE_PET_LOYALTY_GAIN_MIN_LEVEL_DIFF = 7;
export const MOE_PET_LOYALTY_GAIN_FIRST_CHANCE = 0.5;

/**
 * @param {number | null | undefined} loyalty
 * @returns {number}
 */
export function moePetLoyaltyValue(loyalty) {
  if (loyalty == null || Number.isNaN(Number(loyalty))) return MOE_PET_LOYALTY_MAX;
  return Math.max(0, Math.min(MOE_PET_LOYALTY_MAX, Math.floor(Number(loyalty))));
}

/**
 * @param {number} enemyLevel
 * @param {number} petLevel
 */
export function moePetLoyaltyQualifiesForGain(enemyLevel, petLevel) {
  const diff =
    Math.floor(enemyLevel ?? 0) - Math.floor(petLevel ?? 0);
  return diff >= MOE_PET_LOYALTY_GAIN_MIN_LEVEL_DIFF;
}

/**
 * @param {{
 *   loyalty?: number | null,
 *   loyaltyPityMiss?: boolean,
 * }} petState
 * @param {number} enemyLevel
 * @param {number} petLevel
 * @param {() => number} [rng] 0〜1
 */
export function rollMoePetLoyaltyGain(petState, enemyLevel, petLevel, rng = Math.random) {
  const loyalty = moePetLoyaltyValue(petState?.loyalty);
  if (loyalty >= MOE_PET_LOYALTY_MAX) {
    return {
      loyalty,
      loyaltyPityMiss: false,
      gained: false,
      qualified: false,
    };
  }
  if (!moePetLoyaltyQualifiesForGain(enemyLevel, petLevel)) {
    return {
      loyalty,
      loyaltyPityMiss: !!petState?.loyaltyPityMiss,
      gained: false,
      qualified: false,
    };
  }

  const pity = !!petState?.loyaltyPityMiss;
  const success = pity || rng() < MOE_PET_LOYALTY_GAIN_FIRST_CHANCE;
  if (!success) {
    return {
      loyalty,
      loyaltyPityMiss: true,
      gained: false,
      qualified: true,
    };
  }
  return {
    loyalty: Math.min(MOE_PET_LOYALTY_MAX, loyalty + 1),
    loyaltyPityMiss: false,
    gained: true,
    qualified: true,
  };
}
