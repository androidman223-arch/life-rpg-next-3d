/**
 * 修行スキルゲット表 → 既存フィールド実装へのブリッジ（クライアント）
 */

import { getMoePlayerDragonSkill } from "@/data/moePlayerDragonSkills";
import { MOE_PLAYER_NINJA_SKILLS } from "@/data/moePlayerNinjaSkills";
import { getMoePlayerPreSkillById } from "@/data/moePlayerPreSkills";
import { MOE_PLAYER_SKILL2_ONLY_SKILLS } from "@/data/moePlayerSkill2Skills";
import { MOE_PHOENIX_DRAGON_SKILLS } from "@/data/moePhoenixDragon";
import {
  getTrainingSkillBridgeAction,
  hasTrainingSkillBridgeAction,
  MOE_DRAGON_TRAINING_SKILL_ACTIONS,
  MOE_PHOENIX_TRAINING_SKILL_ACTIONS,
} from "./moeTrainingSkillBridgeMap.js";

export {
  getTrainingSkillBridgeAction,
  hasTrainingSkillBridgeAction,
  MOE_DRAGON_TRAINING_SKILL_ACTIONS,
  MOE_PHOENIX_TRAINING_SKILL_ACTIONS,
};

/** @param {string} skillId */
export function resolveTrainingSkill2(skillId) {
  if (skillId === "jiriki_seiran") {
    return (
      MOE_PLAYER_SKILL2_ONLY_SKILLS.find((s) => s.id === skillId) ?? null
    );
  }
  return MOE_PHOENIX_DRAGON_SKILLS.find((s) => s.id === skillId) ?? null;
}

/** @param {string} skillId */
export function resolveTrainingNinjaSkill(skillId) {
  return MOE_PLAYER_NINJA_SKILLS.find((s) => s.id === skillId) ?? null;
}

/**
 * @param {'phoenix' | 'dragon'} track
 * @param {number} level
 * @param {{
 *   onSkill1?: (key: string) => void,
 *   onSkill2?: (skill: object) => void,
 *   onPreSkill?: (skill: object) => void,
 *   onNinja?: (skill: object) => void,
 *   onDragon?: (skill: object) => void,
 *   setToast?: (msg: string) => void,
 * }} ctx
 * @returns {boolean} 発動したら true
 */
export function runTrainingSkillBridgeAction(track, level, ctx) {
  const action = getTrainingSkillBridgeAction(track, level);
  if (!action) {
    ctx.setToast?.("実装予定です");
    return false;
  }

  if (action.kind === "skill1") {
    ctx.onSkill1?.(action.key);
    return true;
  }

  if (action.kind === "skill2") {
    const skill = resolveTrainingSkill2(action.skillId);
    if (!skill) {
      ctx.setToast?.("スキルデータが見つかりません");
      return false;
    }
    ctx.onSkill2?.(skill);
    return true;
  }

  if (action.kind === "pre") {
    const skill = getMoePlayerPreSkillById(action.skillId);
    if (!skill) {
      ctx.setToast?.("スキルデータが見つかりません");
      return false;
    }
    ctx.onPreSkill?.(skill);
    return true;
  }

  if (action.kind === "ninja") {
    const skill = resolveTrainingNinjaSkill(action.skillId);
    if (!skill) {
      ctx.setToast?.("スキルデータが見つかりません");
      return false;
    }
    ctx.onNinja?.(skill);
    return true;
  }

  if (action.kind === "dragon") {
    const skill = getMoePlayerDragonSkill(action.skillId);
    if (!skill) {
      ctx.setToast?.("スキルデータが見つかりません");
      return false;
    }
    ctx.onDragon?.(skill);
    return true;
  }

  return false;
}
