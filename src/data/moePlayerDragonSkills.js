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
  dragon_skateboard: 3,
  dragon_kintoun: 7,
};

/** @type {MoePlayerDragonSkill[]} */
export const MOE_PLAYER_DRAGON_SKILLS = [
  {
    id: "dragon_skateboard",
    requiredDragonLevel: MOE_DRAGON_SKILL_GET_LEVELS[3] ?? 40,
    name: "板乗り",
    nameEn: "Board Ride",
    category: "movement",
    activation: "toggle",
    iconComponent: "MoeSkateboardIcon",
    description:
      "トグルONで板が滑り込み乗車。地上移動1.75倍 · Shiftダッシュでさらに1.75倍。",
    status: "done",
  },
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
 * 旧神速（Lv30相当）または龍神Lv40で板乗り解禁
 * @param {number} [dragonPracticeLevel=0]
 * @param {{ trainerLevel?: number, skillUnlocks?: Set<string> }} [opts]
 */
export function isDragonSkateboardUnlocked(
  dragonPracticeLevel = 0,
  opts = {}
) {
  const dragonLevel = dragonPracticeLevel ?? 0;
  const trainerLevel = opts.trainerLevel ?? 0;
  const unlocks = opts.skillUnlocks ?? new Set();
  if (dragonLevel + 1e-6 >= (MOE_DRAGON_SKILL_GET_LEVELS[3] ?? 40)) return true;
  if (trainerLevel + 1e-6 >= 30) return true;
  if (unlocks.has("dragon_skateboard") || unlocks.has("ninja_shinsoku")) {
    return true;
  }
  return false;
}

/**
 * @param {number} [dragonPracticeLevel=0]
 * @param {{ trainerLevel?: number, skillUnlocks?: Set<string> }} [opts]
 * @returns {Record<string, MoePlayerDragonSkill | null>}
 */
export function buildPlayerDragonSkillById(dragonPracticeLevel = 0, opts = {}) {
  const out = {};
  for (const skill of MOE_PLAYER_DRAGON_SKILLS) {
    if (skill.status !== "done") continue;
    if (skill.id === "dragon_skateboard") {
      if (!isDragonSkateboardUnlocked(dragonPracticeLevel, opts)) continue;
      out[skill.id] = skill;
      continue;
    }
    if ((dragonPracticeLevel ?? 0) + 1e-6 < (skill.requiredDragonLevel ?? 0)) {
      continue;
    }
    out[skill.id] = skill;
  }
  return out;
}

/**
 * @param {number} dragonPracticeLevel
 * @returns {(MoePlayerDragonSkill | null)[]}
 */
export function buildPlayerDragonSkillSlots(dragonPracticeLevel, opts = {}) {
  const byId = buildPlayerDragonSkillById(dragonPracticeLevel, opts);
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
