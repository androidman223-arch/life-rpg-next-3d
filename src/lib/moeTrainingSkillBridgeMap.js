/**
 * 修行スキルゲット表 → フィールド実装キー（純粋マップ · smoke 可）
 */

/**
 * @typedef {{ kind: 'skill1', key: string } | { kind: 'skill2', skillId: string } | { kind: 'pre', skillId: string } | { kind: 'ninja', skillId: string } | { kind: 'dragon', skillId: string }} MoeTrainingSkillBridgeAction
 */

/** @type {Record<number, MoeTrainingSkillBridgeAction>} */
export const MOE_PHOENIX_TRAINING_SKILL_ACTIONS = {
  10: { kind: "skill2", skillId: "jiriki_seiran" },
  20: { kind: "skill1", key: "light" },
  30: { kind: "skill2", skillId: "phoenix_hot_spring" },
  40: { kind: "skill1", key: "teleport" },
  50: { kind: "skill1", key: "heal" },
  60: { kind: "skill2", skillId: "phoenix_deep_sleep" },
  70: { kind: "skill2", skillId: "phoenix_life_burst" },
  80: { kind: "skill1", key: "heal-all" },
  90: { kind: "pre", skillId: "jiriki_kaihou" },
};

/** @type {Record<number, MoeTrainingSkillBridgeAction>} */
export const MOE_DRAGON_TRAINING_SKILL_ACTIONS = {
  10: { kind: "skill2", skillId: "phoenix_ansleep_walk" },
  20: { kind: "ninja", skillId: "ninja_shinobiashi" },
  40: { kind: "ninja", skillId: "ninja_shinsoku" },
  50: { kind: "ninja", skillId: "ninja_kakuremino" },
  80: { kind: "dragon", skillId: "dragon_kintoun" },
  90: { kind: "pre", skillId: "jiriki_seiryu" },
};

/**
 * @param {'phoenix' | 'dragon'} track
 * @param {number} level
 * @returns {MoeTrainingSkillBridgeAction | null}
 */
export function getTrainingSkillBridgeAction(track, level) {
  const map =
    track === "dragon"
      ? MOE_DRAGON_TRAINING_SKILL_ACTIONS
      : MOE_PHOENIX_TRAINING_SKILL_ACTIONS;
  return map[level] ?? null;
}

/** @param {'phoenix' | 'dragon'} track @param {number} level */
export function hasTrainingSkillBridgeAction(track, level) {
  return Boolean(getTrainingSkillBridgeAction(track, level));
}
