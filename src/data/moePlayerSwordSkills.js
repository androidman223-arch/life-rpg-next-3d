/**
 * プレイヤー刀剣・盾 — 反射スキル（技①スロット）
 */

import {
  MOE_HYAKKA_RANRAN_DURATION_MS,
  MOE_HYAKKA_RANRAN_PRESET,
  MOE_REVENGE_GUARD_DURATION_MS,
  MOE_REVENGE_GUARD_REFLECT_CAP,
  MOE_REVENGE_SWING_DURATION_MS,
  MOE_REVENGE_SWING_REFLECT_DAMAGE,
  MOE_SWORD_DANCE_DURATION_MS,
  MOE_SWORD_DANCE_PRESET,
  moeReflectBuffDurationLabelSec,
  moeReflectSplitShortLabel,
} from "../lib/moePlayerReflectSkills.js";

/** @typedef {'hyakka_ranran' | 'sword_dance' | 'revenge_guard' | 'revenge_swing'} MoePlayerSwordSkillKey */

/** @type {object[]} */
export const MOE_PLAYER_SWORD_SKILLS = [
  {
    id: "hyakka_ranran",
    level: 50,
    name: "百花繚乱",
    category: "defense",
    activation: "instant",
    icon: "🌸",
    description: `約${moeReflectBuffDurationLabelSec(MOE_HYAKKA_RANRAN_DURATION_MS)}秒 · 物理${moeReflectSplitShortLabel(MOE_HYAKKA_RANRAN_PRESET)} · 魔法回避（ペット被弾）`,
    moeReference: "戦技50+ダンス50",
    status: "done",
    devCheckUsable: true,
  },
  {
    id: "sword_dance",
    level: 60,
    name: "ソードダンス",
    category: "attack",
    activation: "instant",
    icon: "⚔️",
    description: `約${moeReflectBuffDurationLabelSec(MOE_SWORD_DANCE_DURATION_MS)}秒反射 · ${moeReflectSplitShortLabel(MOE_SWORD_DANCE_PRESET)} · 発動斬撃（デュエル）`,
    moeReference: "刀剣90",
    status: "done",
    devCheckUsable: true,
  },
  {
    id: "revenge_guard",
    level: 70,
    name: "リベンジガード",
    category: "defense",
    activation: "instant",
    icon: "🛡️",
    description: `約${moeReflectBuffDurationLabelSec(MOE_REVENGE_GUARD_DURATION_MS)}秒盾構え · 被弾0% · 反射100%（上限${MOE_REVENGE_GUARD_REFLECT_CAP}） · 最初の一撃`,
    moeReference: "盾70",
    status: "done",
    devCheckUsable: true,
  },
  {
    id: "revenge_swing",
    level: 75,
    name: "リベンジスイング",
    category: "attack",
    activation: "instant",
    icon: "💥",
    description: `約${moeReflectBuffDurationLabelSec(MOE_REVENGE_SWING_DURATION_MS)}秒 · 被弾0% · 反射${MOE_REVENGE_SWING_REFLECT_DAMAGE}固定（ペット被弾）`,
    moeReference: "刀剣75",
    status: "done",
    devCheckUsable: true,
  },
];

/** @type {Record<MoePlayerSwordSkillKey, MoePlayerSwordSkillKey>} */
export const MOE_PLAYER_SWORD_SLOT_KEY_BY_SKILL_ID = {
  hyakka_ranran: "hyakka_ranran",
  sword_dance: "sword_dance",
  revenge_guard: "revenge_guard",
  revenge_swing: "revenge_swing",
};

/**
 * @param {string} slotKey
 * @param {number} [trainerLevel=50]
 */
export function getMoePlayerSwordSkillForSlotKey(slotKey, trainerLevel = 50) {
  const skill = MOE_PLAYER_SWORD_SKILLS.find((s) => s.id === slotKey);
  if (!skill) return null;
  if (skill.devCheckUsable) return skill;
  if ((skill.level ?? 1) > trainerLevel) return null;
  return skill;
}

/**
 * @param {number} [trainerLevel=50]
 * @returns {Record<string, object>}
 */
export function buildPlayerSwordSkillById(trainerLevel = 50) {
  const out = {};
  for (const skill of MOE_PLAYER_SWORD_SKILLS) {
    if ((skill.level ?? 1) <= trainerLevel) {
      out[skill.id] = skill;
    }
  }
  return out;
}
