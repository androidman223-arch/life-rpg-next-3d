/**
 * プレイヤー召喚プレスキル — 生活改鳳 · 自力整龍（戦闘シーケンス・バリデーション）
 */

import { getMoePlayerPreSkillById } from "../data/moePlayerPreSkills.js";
import { resolvePhoenixHabitAscensionSequence } from "./moePhoenixHabitAscension.js";

/** @param {import("../data/moePlayerPreSkills.js").MoePlayerPreSkill | null | undefined} skill */
export function resolveJirikiKaihouSequence(skill) {
  const row = skill ?? getMoePlayerPreSkillById("jiriki_kaihou");
  return resolvePhoenixHabitAscensionSequence(row);
}

/** @param {import("../data/moePlayerPreSkills.js").MoePlayerPreSkill | null | undefined} skill */
export function resolveJirikiSeiryuSequence(skill) {
  const row = skill ?? getMoePlayerPreSkillById("jiriki_seiryu");
  const damage = row?.combatFixedDamage ?? 333;
  return {
    hits: [{ atMs: 0, opts: { fixedDamage: damage, grantExp: true } }],
  };
}

/** @param {boolean} inDuel */
export function validatePlayerSummonPreSkillCombat(inDuel) {
  if (!inDuel) {
    return { ok: false, toast: "召喚攻撃スキルは戦闘中のみ使えます" };
  }
  return { ok: true };
}

/** @param {string} skillId */
export function isPlayerSummonPreSkillId(skillId) {
  return skillId === "jiriki_kaihou" || skillId === "jiriki_seiryu";
}

/** @param {import("../data/moePlayerPreSkills.js").MoePlayerPreSkill | null | undefined} skill */
export function resolvePlayerSummonPreSkillSequence(skill) {
  if (!skill) return null;
  if (skill.id === "jiriki_kaihou") return resolveJirikiKaihouSequence(skill);
  if (skill.id === "jiriki_seiryu") return resolveJirikiSeiryuSequence(skill);
  return null;
}
