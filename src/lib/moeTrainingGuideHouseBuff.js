/**
 * 育成表の家 — 生命爆神唱和（セッション限定 · リロードまで）
 * フェニックス技②「生命爆神」も +HP ロジックを共有
 */

export const MOE_TRAINING_GUIDE_CHANT_PHRASE = "生命爆神を実装します";
export const MOE_TRAINING_GUIDE_HP_BONUS = 50;
export const MOE_TRAINING_GUIDE_BGM_MAP_SLOT = "training_guide_house";

/** @type {Map<string, number>} */
const sessionBonusByPetId = new Map();

function normChant(s) {
  return String(s ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

/** @param {string} input */
export function moeTrainingGuideChantMatches(input) {
  const n = normChant(input);
  if (!n) return false;
  if (n === normChant(MOE_TRAINING_GUIDE_CHANT_PHRASE)) return true;
  return n.includes("生命爆神");
}

/** @param {string} [petId] */
export function moeTrainingGuideSessionBonus(petId) {
  if (!petId) return 0;
  return sessionBonusByPetId.get(petId) ?? 0;
}

/** セッション Map と pet フィールドの大きい方（戦闘中の再同期用） */
export function moeResolvePetTrainingBonus(pet) {
  const session = moeTrainingGuideSessionBonus(pet?.id);
  const field = pet?.trainingGuideHpBonus ?? 0;
  return Math.max(session, field);
}

/**
 * @param {{ trainingGuideHpBonus?: number, hp?: number, hpMax?: number }} pet
 */
function stripTrainingGuideBonus(pet) {
  const applied = pet.trainingGuideHpBonus ?? 0;
  if (!applied) return pet;
  const prevMax = pet.hpMax ?? 1;
  const baseHpMax = Math.max(1, prevMax - applied);
  return {
    ...pet,
    trainingGuideHpBonus: 0,
    hpMax: baseHpMax,
    // ダメージ後の hp を落とさない（max だけ bonus 分を外す）
    hp: Math.min(prevMax, pet.hp ?? baseHpMax),
  };
}

/**
 * 現在の hp / hpMax に +N（満タンでも max ごと伸ばす）
 * @param {{ hp?: number, hpMax?: number }} pet
 * @param {number} amount
 * @param {{ heal?: boolean }} [opts] heal=false なら max だけ伸ばし現在 hp は維持
 */
export function moeApplyFlatPetHpBonus(pet, amount, opts = {}) {
  const add = Math.max(0, Math.floor(Number(amount) || 0));
  if (!add || !pet) return pet;
  const heal = opts.heal !== false;
  const dead = (Number(pet.hp) || 0) <= 0;
  let hpMax = (Number(pet.hpMax) || 1) + add;
  let hp = dead
    ? 0
    : heal
      ? Math.min(hpMax, (Number(pet.hp) || 0) + add)
      : Math.min(hpMax, Number(pet.hp) || 0);
  hp = Math.round(hp * 100) / 100;
  hpMax = Math.round(hpMax * 100) / 100;
  return { ...pet, hp, hpMax };
}

/**
 * @param {{ id?: string, hp?: number, hpMax?: number, trainingGuideHpBonus?: number }} pet
 * @param {number} bonus
 */
function applySessionBonusToPet(pet, bonus) {
  const stripped = stripTrainingGuideBonus(pet);
  const targetMax = (stripped.hpMax ?? 1) + bonus;
  const alreadyInflated = (pet.hpMax ?? 0) >= targetMax - 0.001;
  const boosted = moeApplyFlatPetHpBonus(stripped, bonus, {
    heal: !alreadyInflated,
  });
  return { ...boosted, trainingGuideHpBonus: bonus };
}

/**
 * @param {{ id?: string, hp?: number, hpMax?: number, trainingGuideHpBonus?: number }} pet
 */
export function moeEnsureTrainingGuideHpBonus(pet) {
  const bonus = moeTrainingGuideSessionBonus(pet?.id);
  if (!bonus) return pet;
  return applySessionBonusToPet(pet, bonus);
}

/**
 * @param {{ id?: string, hp?: number, hpMax?: number, trainingGuideHpBonus?: number }} pet
 * @param {number} [bonus]
 */
export function applyMoeTrainingGuideHpBonus(pet, bonus = MOE_TRAINING_GUIDE_HP_BONUS) {
  if (!pet?.id) return { pet, applied: false, reason: "no_pet" };

  const sessionBonus = sessionBonusByPetId.get(pet.id) ?? 0;
  const targetBonus = sessionBonus > 0 ? sessionBonus : bonus;

  if (!sessionBonus) {
    sessionBonusByPetId.set(pet.id, bonus);
  }

  const expected = applySessionBonusToPet(pet, targetBonus);
  const already =
    sessionBonus > 0 &&
    (pet.trainingGuideHpBonus ?? 0) >= targetBonus &&
    (pet.hpMax ?? 0) >= expected.hpMax - 0.001;

  if (already) {
    return { pet, applied: false, reason: "already" };
  }

  return {
    applied: true,
    pet: expected,
  };
}
