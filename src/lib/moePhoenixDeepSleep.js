/**
 * 深睡眠眠 — ペットMP中回復（HP回復ではない · プレイヤー回復スキルと役割分担）
 */

export const MOE_PHOENIX_DEEP_SLEEP_MP_RATIO = 0.45;
/** 深睡眠眠 — 詠唱秒数（他フェニックス詠唱より長め） */
export const MOE_PHOENIX_DEEP_SLEEP_CHANT_SEC = 5;
export const MOE_PHOENIX_DEEP_SLEEP_SKILL_ID = "phoenix_deep_sleep";

/** @param {{ skillId?: string, kind?: string } | null | undefined} chant */
export function isMoePhoenixDeepSleepChant(chant) {
  if (!chant) return false;
  return (
    chant.skillId === MOE_PHOENIX_DEEP_SLEEP_SKILL_ID ||
    chant.kind === "pet_deep_sleep"
  );
}

/**
 * @param {{ mp?: number, mpMax?: number }} pet
 * @param {number} [ratio]
 */
export function moePhoenixDeepSleepMpAmount(pet, ratio = MOE_PHOENIX_DEEP_SLEEP_MP_RATIO) {
  const mpMax = Math.max(1, pet?.mpMax ?? 1);
  return Math.max(1, Math.floor(mpMax * ratio));
}

/**
 * @param {{ mp?: number, mpMax?: number }} pet
 * @param {number} [ratio]
 */
export function applyMoePhoenixDeepSleepMp(pet, ratio = MOE_PHOENIX_DEEP_SLEEP_MP_RATIO) {
  const gain = moePhoenixDeepSleepMpAmount(pet, ratio);
  const nextMp = Math.min(pet.mpMax ?? gain, (pet.mp ?? 0) + gain);
  return { pet: { ...pet, mp: nextMp }, gain };
}
