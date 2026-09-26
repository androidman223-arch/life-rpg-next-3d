/**
 * プレイヤースキル使用フロー — 成功率判定 + 熟練度付与（純粋）
 */

import {
  awardHealProficiencyOnUse,
  awardPhoenixProficiencyOnUse,
  awardStealthProficiencyOnUse,
  defaultPlayerSkillProficiency,
} from "./moePlayerExperience.js";
import {
  MOE_PLAYER_HEAL_REQUIRED_LEVELS,
} from "./moePlayerHealSkills.js";
import {
  formatMoeSkillSuccessRatePct,
  rollMoeSkillSuccess,
} from "./moePlayerSkillSuccessRate.js";

/**
 * @param {object | null | undefined} skill
 */
export function resolvePlayerSkillRequiredLevel(skill) {
  return skill?.requiredSkillLevel ?? skill?.level ?? 1;
}

/**
 * 技②フェニックス等 — 成功率ロール
 * @param {object} skill
 * @param {{ level?: number }} proficiency
 * @param {() => number} [rng]
 */
export function rollPlayerPhoenixSkillSuccess(skill, proficiency, rng = Math.random) {
  const prof = proficiency?.level ?? 0;
  const required = resolvePlayerSkillRequiredLevel(skill);
  const roll = rollMoeSkillSuccess(prof, required, rng);
  return {
    ...roll,
    requiredLevel: required,
    failToast: roll.ok
      ? null
      : `「${skill?.name ?? "スキル"}」失敗…（成功率${roll.ratePct}%）`,
  };
}

/**
 * @param {{ level?: number }} proficiency
 * @param {"light"|"healing"|"healAll"|"regen"} healKey
 * @param {() => number} [rng]
 */
export function rollPlayerHealSkillSuccess(proficiency, healKey, rng = Math.random) {
  const prof = proficiency?.level ?? 0;
  const required = MOE_PLAYER_HEAL_REQUIRED_LEVELS[healKey] ?? 10;
  const roll = rollMoeSkillSuccess(prof, required, rng);
  const names = {
    light: "ライトヒーリング",
    healing: "ヒーリング",
    healAll: "ヒーリングオール",
    regen: "リジェネレイション",
  };
  const label = names[healKey] ?? healKey;
  return {
    ...roll,
    requiredLevel: required,
    failToast: roll.ok
      ? null
      : `「${label}」失敗…（成功率${roll.ratePct}%）`,
  };
}

/**
 * 技②成功後の EXP 付与
 * @param {{ level?: number, exp?: number }} progress
 * @param {boolean} [talismanActive]
 */
export function grantPhoenixProficiencyAfterSuccess(progress, talismanActive) {
  return awardPhoenixProficiencyOnUse(progress, talismanActive);
}

/**
 * 回復成功後の EXP 付与
 * @param {{ level?: number, exp?: number }} progress
 * @param {"light"|"healing"|"healAll"|"regen"} healKey
 */
export function grantHealProficiencyAfterSuccess(progress, healKey) {
  const required = MOE_PLAYER_HEAL_REQUIRED_LEVELS[healKey] ?? 10;
  return awardHealProficiencyOnUse(progress, required);
}

/**
 * 忍び足トグル時の EXP 付与
 * @param {{ level?: number, exp?: number }} progress
 * @param {number} [requiredLevel=10]
 */
export function grantStealthProficiencyOnToggle(progress, requiredLevel = 10) {
  return awardStealthProficiencyOnUse(progress, requiredLevel);
}

/**
 * @param {{ level?: number }} proficiency
 * @param {number} requiredLevel
 */
export function describePlayerSkillSuccessHint(proficiency, requiredLevel) {
  const prof = proficiency ?? defaultPlayerSkillProficiency();
  return `成功率 ${formatMoeSkillSuccessRatePct(prof.level ?? 0, requiredLevel)}`;
}
