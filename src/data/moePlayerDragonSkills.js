/**
 * 龍神スキルゲット — プレイヤー技①バー（修行② · 実践EXP）
 */

import { MOE_DRAGON_SKILL_GET_LEVELS } from "../lib/moeDragonTraining.js";

/** @typedef {'toggle' | 'press' | 'instant' | 'timed'} MoeDragonSkillActivation */
/** @typedef {'movement' | 'stealth' | 'attack' | 'escape'} MoeDragonSkillCategory */

/**
 * @typedef {object} MoePlayerDragonSkill
 * @property {string} id
 * @property {number} requiredDragonLevel
 * @property {string} name
 * @property {string} [nameEn]
 * @property {MoeDragonSkillCategory} category
 * @property {MoeDragonSkillActivation} activation
 * @property {string} [icon]
 * @property {string} iconComponent
 * @property {string} description
 * @property {'planned' | 'stub' | 'done'} status
 */

/** 固定スロット（将来9枠） */
const MOE_DRAGON_SKILL_SLOT_BY_ID = {
  dragon_kintoun: 7,
};

/** @type {MoePlayerDragonSkill[]} */
export const MOE_PLAYER_DRAGON_SKILLS = [
  {
    id: "dragon_kintoun",
    requiredDragonLevel: MOE_DRAGON_SKILL_GET_LEVELS[7] ?? 80,
    name: "筋斗雲",
    nameEn: "Kintoun",
    category: "movement",
    activation: "toggle",
    iconComponent: "MoeKintounIcon",
    description:
      "トグルONで筋斗雲に乗り山の上を飛ぶ。移動2倍 · Shiftダッシュでさらに2倍。",
    status: "done",
  },
];

/**
 * @param {number} [dragonPracticeLevel=0]
 * @returns {Record<string, MoePlayerDragonSkill | null>}
 */
export function buildPlayerDragonSkillById(dragonPracticeLevel = 0) {
  const out = {};
  for (const skill of MOE_PLAYER_DRAGON_SKILLS) {
    if ((dragonPracticeLevel ?? 0) + 1e-6 < (skill.requiredDragonLevel ?? 0)) {
      continue;
    }
    if (skill.status !== "done") continue;
    out[skill.id] = skill;
  }
  return out;
}

/**
 * @param {number} dragonPracticeLevel
 * @returns {(MoePlayerDragonSkill | null)[]}
 */
export function buildPlayerDragonSkillSlots(dragonPracticeLevel) {
  const byId = buildPlayerDragonSkillById(dragonPracticeLevel);
  const slots = Array(MOE_DRAGON_SKILL_GET_LEVELS.length).fill(null);
  for (const skill of MOE_PLAYER_DRAGON_SKILLS) {
    const idx = MOE_DRAGON_SKILL_SLOT_BY_ID[skill.id];
    if (idx == null || !byId[skill.id]) continue;
    slots[idx] = skill;
  }
  return slots;
}

/** @param {string} skillId */
export function getMoePlayerDragonSkill(skillId) {
  return MOE_PLAYER_DRAGON_SKILLS.find((s) => s.id === skillId) ?? null;
}
