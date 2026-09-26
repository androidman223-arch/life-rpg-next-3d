/**
 * プレイヤーステータス画面 — 表示用ビュー（純粋）
 */

import { MOE_PLAYER_PRE_SKILLS } from "../data/moePlayerPreSkills.js";
import { MOE_PLAYER_SKILL_EXP_PER_TENTH } from "./moePlayerPreSkillProgress.js";
import {
  canUsePlayerSkill2,
  getPlayerSkill2RequiredLevel,
  moePlayerSkill2ExpGainAmount,
} from "./moePlayerSkill2Progress.js";
import { moeVitalBarPct } from "./moePlayerVitals.js";
import {
  loadPlayerSkill2TalismanActive,
  resolvePlayerSkill2ExpProcRate,
} from "./moePlayerSkill2Talisman.js";

/** ステ画面のおすすめヒント（固定） */
export const MOE_PLAYER_STATUS_TIPS = [
  "鳳凰スキル — 技②使用で熟練度UP（約55%）。Lv差で成功率が変わる",
  "回復熟練 — ライト/ヒール/オール/リジェネ成功で共通EXP",
  "隠密熟練 — 忍び足ONで上昇。視覚索敵の回避率アップ",
  "訓練士 Lv — 敵撃破で上がる。HP/MP/スタミナ上限が増える",
  "保存 — life-rpg-moe-player-experience に熟練度をまとめて保存",
];

/**
 * @param {number} exp
 * @param {number} [max]
 */
export function moePlayerSkillExpBarPct(exp, max = MOE_PLAYER_SKILL_EXP_PER_TENTH) {
  const m = Math.max(1, Number(max) || 1);
  return Math.max(0, Math.min(100, (Number(exp) / m) * 100));
}

/**
 * @param {number} current
 * @param {number} next
 */
export function moeTrainerExpBarPct(current, next) {
  const m = Math.max(1, Number(next) || 1);
  return Math.max(0, Math.min(100, (Number(current) / m) * 100));
}

/**
 * @param {{
 *   trainerStatus: { level?: number, job?: string, exp?: number, nextExp?: number },
 *   playerVitals: { hp?: number, hpMax?: number, mp?: number, mpMax?: number, stamina?: number, staminaMax?: number },
 *   playerSkill2Progress: { level?: number, exp?: number },
 *   playerHealProficiency?: { level?: number, exp?: number },
 *   playerStealthProficiency?: { level?: number, exp?: number },
 *   playerPreSkillProgress: Record<string, { level?: number, exp?: number }>,
 *   playerBuffStrip?: Array<{ id?: string, icon?: string, label?: string, remainSec?: number|null } | null>,
 *   skill2TalismanActive?: boolean,
 *   skill2Catalog?: Array<{ id?: string, name?: string, level?: number, requiredSkillLevel?: number }>,
 * }} input
 */
export function buildMoePlayerStatusView(input) {
  const trainer = input.trainerStatus ?? {};
  const vitals = input.playerVitals ?? {};
  const skill2 = input.playerSkill2Progress ?? { level: 0, exp: 0 };
  const preMap = input.playerPreSkillProgress ?? {};
  const talismanActive =
    input.skill2TalismanActive ?? loadPlayerSkill2TalismanActive();
  const skill2Level = skill2.level ?? 0;
  const skill2Exp = skill2.exp ?? 0;
  const healProf = input.playerHealProficiency ?? { level: 0, exp: 0 };
  const stealthProf = input.playerStealthProficiency ?? { level: 0, exp: 0 };
  const procRate = resolvePlayerSkill2ExpProcRate(talismanActive);
  const expGainSample = moePlayerSkill2ExpGainAmount(skill2Level);

  const phoenixSkills = (input.skill2Catalog ?? []).map((skill) => {
    const access = canUsePlayerSkill2(skill, skill2);
    return {
      id: skill.id,
      name: skill.name,
      requiredLevel: getPlayerSkill2RequiredLevel(skill),
      unlocked: access.ok,
      devCheck: access.devCheck ?? false,
    };
  });

  const preSkills = MOE_PLAYER_PRE_SKILLS.map((skill) => {
    const row = preMap[skill.id] ?? { level: 0, exp: 0 };
    const level = row.level ?? 0;
    const exp = row.exp ?? 0;
    const required = skill.requiredSkillLevel ?? 0;
    return {
      id: skill.id,
      name: skill.name,
      level,
      exp,
      expMax: MOE_PLAYER_SKILL_EXP_PER_TENTH,
      expPct: moePlayerSkillExpBarPct(exp),
      requiredLevel: required,
      unlocked: level + 1e-6 >= required || skill.devCheckUsable,
      status: skill.status,
    };
  });

  const activeBuffs = (input.playerBuffStrip ?? []).filter(Boolean);

  return {
    job: trainer.job ?? "勇者",
    trainerLevel: trainer.level ?? 1,
    trainerExp: trainer.exp ?? 0,
    trainerNextExp: trainer.nextExp ?? 1000,
    trainerExpPct: moeTrainerExpBarPct(trainer.exp ?? 0, trainer.nextExp ?? 1000),
    vitals: {
      hp: vitals.hp ?? 0,
      hpMax: vitals.hpMax ?? 1,
      mp: vitals.mp ?? 0,
      mpMax: vitals.mpMax ?? 1,
      stamina: vitals.stamina ?? 0,
      staminaMax: vitals.staminaMax ?? 1,
      hpPct: moeVitalBarPct(vitals.hp, vitals.hpMax),
      mpPct: moeVitalBarPct(vitals.mp, vitals.mpMax),
      staminaPct: moeVitalBarPct(vitals.stamina, vitals.staminaMax),
    },
    skill2: {
      level: skill2Level,
      exp: skill2Exp,
      expMax: MOE_PLAYER_SKILL_EXP_PER_TENTH,
      expPct: moePlayerSkillExpBarPct(skill2Exp),
      procRatePct: Math.round(procRate * 100),
      talismanActive,
      expGainHint: `成功時 約${Math.round(procRate * 100)}% で +0.1〜${expGainSample.toFixed(1)}`,
    },
    healProficiency: {
      level: healProf.level ?? 0,
      exp: healProf.exp ?? 0,
      expMax: MOE_PLAYER_SKILL_EXP_PER_TENTH,
      expPct: moePlayerSkillExpBarPct(healProf.exp ?? 0),
    },
    stealthProficiency: {
      level: stealthProf.level ?? 0,
      exp: stealthProf.exp ?? 0,
      expMax: MOE_PLAYER_SKILL_EXP_PER_TENTH,
      expPct: moePlayerSkillExpBarPct(stealthProf.exp ?? 0),
    },
    phoenixSkills,
    preSkills,
    activeBuffs,
    tips: MOE_PLAYER_STATUS_TIPS,
  };
}
