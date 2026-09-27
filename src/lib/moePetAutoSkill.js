/**
 * ペット戦闘オートAI — MOE寄り（高Lvスキル優先 · loyaltyMin · MP · delaySec）
 */

import {
  MOE_PET_SKILL_MODE_ALL,
  MOE_PET_SKILL_MODE_LEARNED,
} from "./moePetSkillSettings.js";
import { moePetSkillEffectiveDelaySec } from "./moePetSkillDelay.js";

/** Wiki: base/growth MP ともに 0 のペット（カルゴーシュ等） */
const MOE_ZERO_MP_PET_IDS = new Set(["calgoche"]);

/** @param {object} skill @param {number} petLevel @param {import("./moePetSkillSettings.js").MoePetSkillMode} [skillMode] */
function isMoePetSkillUsableAtLevel(skill, petLevel, skillMode = MOE_PET_SKILL_MODE_ALL) {
  if (!skill) return false;
  if (skillMode === MOE_PET_SKILL_MODE_ALL) return true;
  return (skill.level ?? 1) <= petLevel;
}

/** @param {string} petId */
export function moePetUsesMp(petId) {
  return !MOE_ZERO_MP_PET_IDS.has(petId);
}

/** @param {object} skill */
export function moePetSkillDelayKey(skill) {
  if (!skill) return "";
  if (skill.id) return String(skill.id);
  return `${skill.name}@${skill.level ?? 0}`;
}

/**
 * @param {object} skill
 * @param {number} petHp
 * @param {number} petHpMax
 */
export function moePetSkillHpConditionOk(skill, petHp, petHpMax) {
  const threshold = skill?.hpUseThreshold;
  if (threshold == null) return true;
  const max = Math.max(1, petHpMax ?? petHp ?? 1);
  const ratio = Math.max(0, (petHp ?? 0) / max);
  return ratio < threshold;
}

/**
 * @param {object} skill
 * @param {number} loyalty
 */
export function moePetSkillLoyaltyOk(skill, loyalty) {
  const min = skill?.loyaltyMin ?? 0;
  return (loyalty ?? 0) >= min;
}

/**
 * 手動スキル — オートAIのみ時は常に不可（愛着度は関係なし）
 * @param {object} _pet
 * @param {boolean} autoOnlyMode true = オートAIのみ
 */
export function moePetManualSkillLoyaltyOk(_pet, autoOnlyMode) {
  return !autoOnlyMode;
}

/**
 * @param {object} skill
 * @param {object} pet
 * @param {string} petId
 */
export function moePetSkillMpOk(skill, pet, petId) {
  const cost = skill?.mpCost ?? 0;
  if (cost <= 0) return true;
  if (!moePetUsesMp(petId)) return true;
  return (pet?.mp ?? 0) >= cost;
}

/**
 * @param {Record<string, number>} cooldownUntil
 * @param {object} skill
 * @param {number} nowMs
 */
export function moePetSkillDelayReady(cooldownUntil, skill, nowMs) {
  const key = moePetSkillDelayKey(skill);
  if (!key) return true;
  return (cooldownUntil[key] ?? 0) <= nowMs;
}

/**
 * @param {Record<string, number>} cooldownUntil
 * @param {object} skill
 * @param {number} nowMs
 * @returns {number} 残り秒（0 = 待ちなし）
 */
export function moePetSkillDelayRemainSec(cooldownUntil, skill, nowMs) {
  const key = moePetSkillDelayKey(skill);
  if (!key) return 0;
  const until = cooldownUntil[key] ?? 0;
  if (until <= nowMs) return 0;
  return Math.ceil((until - nowMs) / 1000);
}

/**
 * @param {Record<string, number>} cooldownUntil
 * @param {object} skill
 * @param {number} nowMs
 */
export function markMoePetSkillDelay(cooldownUntil, skill, nowMs) {
  const key = moePetSkillDelayKey(skill);
  const sec = moePetSkillEffectiveDelaySec(skill);
  if (!key || sec <= 0) return;
  cooldownUntil[key] = nowMs + sec * 1000;
}

/**
 * @param {object[]} slots
 * @param {object} skill
 */
export function findPetCombatSkillSlotIndex(slots, skill) {
  if (!skill || !Array.isArray(slots)) return -1;
  const skillId = skill.id;
  return slots.findIndex((s) => {
    if (!s) return false;
    if (
      skillId != null &&
      skillId !== "" &&
      s.id != null &&
      s.id !== ""
    ) {
      return s.id === skillId;
    }
    return (
      s.name === skill.name && (s.level ?? 0) === (skill.level ?? 0)
    );
  });
}

/**
 * @param {object} skill
 */
export function isMoePetAutoSkillCandidate(skill) {
  if (!skill) return false;
  if (skill.type === "passive") return false;
  if (skill.name === "アタック" && (skill.level ?? 1) <= 1) return false;
  return true;
}

/**
 * @param {{
 *   petId: string,
 *   pet: object,
 *   petLevel: number,
 *   skills: object[],
 *   skillMode?: import("@/lib/moePetSkillSettings").MoePetSkillMode,
 *   loyalty?: number,
 *   nowMs: number,
 *   cooldownUntil: Record<string, number>,
 * }} ctx
 * @returns {object|null}
 */
export function pickMoePetAutoSkill(ctx) {
  const {
    petId,
    pet,
    petLevel,
    skills,
    skillMode = MOE_PET_SKILL_MODE_ALL,
    loyalty = 0,
    nowMs,
    cooldownUntil,
  } = ctx;

  const candidates = [...(skills || [])]
    .filter(isMoePetAutoSkillCandidate)
    .filter((s) => isMoePetSkillUsableAtLevel(s, petLevel, skillMode))
    .sort((a, b) => (b.level ?? 0) - (a.level ?? 0));

  for (const skill of candidates) {
    if (!moePetSkillLoyaltyOk(skill, loyalty)) continue;
    if (!moePetSkillMpOk(skill, pet, petId)) continue;
    const hpMax = pet?.hpMax ?? pet?.hp ?? 1;
    if (!moePetSkillHpConditionOk(skill, pet?.hp, hpMax)) continue;
    // 高Lv順 — 待ち時間中は次のスキルを試す（全部待ちなら攻撃のみ）
    if (!moePetSkillDelayReady(cooldownUntil, skill, nowMs)) continue;
    return skill;
  }
  return null;
}
