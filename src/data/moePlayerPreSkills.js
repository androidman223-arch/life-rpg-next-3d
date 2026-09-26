/**
 * プレイヤー・プレスキル（自力系）
 * スキル値 Lv と経験値は moePlayerPreSkillProgress.js
 */

/** @typedef {'support' | 'attack'} MoePlayerPreSkillCategory */

/**
 * @typedef {object} MoePlayerPreSkill
 * @property {string} id
 * @property {string} slotKey
 * @property {string} name
 * @property {number} requiredSkillLevel 習得に必要なスキル値
 * @property {number} mpCost
 * @property {MoePlayerPreSkillCategory} category
 * @property {boolean} devCheckUsable 実装チェック中はスキル値未達でも使用可
 * @property {string} description
 * @property {'planned' | 'done'} status
 * @property {number} [combatOpenFixedDamage]
 * @property {number} [combatFixedDamage]
 * @property {number} [combatWaveHits]
 * @property {number} [combatStepMs]
 */

export const MOE_PLAYER_PRE_SKILL_DEV_NOTE =
  "★実装チェック中は使用可";

export const MOE_PLAYER_PRE_SKILLS = [
  {
    id: "jiriki_kaihou",
    slotKey: "jiriki_kaihou",
    name: "生活改鳳",
    requiredSkillLevel: 100,
    mpCost: 40,
    category: "attack",
    devCheckUsable: true,
    description: "鳳凰召喚＋炎5×7＋炎3×3＋リボーンワンス",
    status: "done",
    combatPhase1Damage: 7,
    combatPhase1Hits: 5,
    combatPhase2Damage: 3,
    combatPhase2Hits: 3,
    combatStepMs: 350,
  },
  {
    id: "jiriki_seiryu",
    slotKey: "jiriki_seiryu",
    name: "自力整龍",
    requiredSkillLevel: 110,
    mpCost: 50,
    category: "attack",
    devCheckUsable: true,
    description: "整龍召喚＋単発大ダメ",
    status: "done",
    combatFixedDamage: 333,
  },
];

export const MOE_PLAYER_PRE_SKILL_SLOT_KEYS = MOE_PLAYER_PRE_SKILLS.map(
  (s) => s.slotKey
);

/** @param {string} id */
export function getMoePlayerPreSkillById(id) {
  return MOE_PLAYER_PRE_SKILLS.find((s) => s.id === id) ?? null;
}

/** @param {string} slotKey */
export function getMoePlayerPreSkillBySlotKey(slotKey) {
  return MOE_PLAYER_PRE_SKILLS.find((s) => s.slotKey === slotKey) ?? null;
}
