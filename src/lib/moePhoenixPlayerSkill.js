/** プレイヤー技② — フェニックス系（ペットに詠唱 · MPはプレイヤー消費 · 技② Lvで習得） */

import {
  formatPlayerSkill2LevelExp,
  getPlayerSkill2RequiredLevel,
  MOE_PLAYER_SKILL2_DEV_NOTE,
} from "./moePlayerSkill2Progress.js";
import { MOE_PHOENIX_DEEP_SLEEP_CHANT_SEC } from "./moePhoenixDeepSleep.js";

export const MOE_PHOENIX_PLAYER_CHANT_SEC = 3;

/** @param {object | null | undefined} skill */
export function moePhoenixPlayerChantSec(skill) {
  if (skill?.id === "phoenix_deep_sleep") {
    return MOE_PHOENIX_DEEP_SLEEP_CHANT_SEC;
  }
  return MOE_PHOENIX_PLAYER_CHANT_SEC;
}
export const MOE_PHOENIX_PLAYER_MP_SHORTAGE_TOAST = "MPが足りません";

/** @param {object | null | undefined} skill */
export function phoenixPlayerSkillMpCost(skill) {
  return skill?.mpCost ?? 0;
}

/** @param {{ mp?: number }} casterVitals @param {object | null | undefined} skill */
export function canSpendPlayerMpForPhoenixSkill(casterVitals, skill) {
  const mpCost = phoenixPlayerSkillMpCost(skill);
  if (mpCost <= 0) return true;
  return (casterVitals?.mp ?? 0) >= mpCost;
}

/**
 * @param {{ mp?: number, mpMax?: number }} casterVitals
 * @param {object | null | undefined} skill
 * @returns {object | null} 次のプレイヤー vitals、MP不足なら null
 */
export function spendPlayerMpForPhoenixSkill(casterVitals, skill) {
  const mpCost = phoenixPlayerSkillMpCost(skill);
  if (mpCost <= 0) return casterVitals;
  if ((casterVitals?.mp ?? 0) < mpCost) return null;
  return {
    ...casterVitals,
    mp: Math.max(0, (casterVitals.mp ?? 0) - mpCost),
  };
}

/** @param {object | null | undefined} skill */
export function isMoePhoenixPlayerChantSkill(skill) {
  if (!skill) return false;
  if (skill.type === "passive" || skill.type === "buff_permanent") return false;
  if (skill.type === "magic_fire" || skill.type === "buff") return false;
  if (skill.type === "jiriki_seiran") return false;
  if (skill.id === "phoenix_life_burst") return false;
  return (
    skill.type === "field_regen" ||
    skill.type === "cure_status" ||
    skill.type === "heal" ||
    skill.type === "heal_regen" ||
    skill.type === "pet_mp_restore"
  );
}

const PLAYER_SKILL_LINES = {
  jiriki_seiran: "10秒MP回復2倍→5分コンデンス（MP13）",
  phoenix_trait: "転生の証 · フェニックス系スキルが使える",
  phoenix_ansleep_walk: "ペットに詠唱 · 3.5秒ごとにHP20回復",
  phoenix_hot_spring: "ペットに詠唱 · 守り+50 · 温泉付近で眠る体に戻す",
  phoenix_deep_sleep: "ペットに詠唱5秒 · ペットMP中回復（HPはライト/ヒール/オール）",
  phoenix_ultimate_sleep: "戦闘中のみペット攻撃1.5倍（決戦終了でリセット · MP22）",
  phoenix_habit_ascension: "炎5×7＋炎3×3＋リボーンワンス（戦闘中 · MP40）",
  phoenix_life_burst: "ペットHP+50",
  phoenix_scorching_sky: "戦闘中ペット攻撃1.5倍 · 名前は後で考えます",
  phoenix_purify_rebirth: "大爆炎 · 30ダメージ×5",
};

/**
 * @param {object | null | undefined} skill
 * @param {boolean} [locked]
 * @param {{ level?: number, exp?: number, devCheck?: boolean } | null} [skill2Progress]
 */
export function formatMoePhoenixPlayerSkillDescription(
  skill,
  locked = false,
  skill2Progress = null
) {
  if (!skill) return "";
  const name = skill.name ?? "スキル";
  const body =
    PLAYER_SKILL_LINES[skill.id] ??
    skill.note?.trim() ??
    skill.description?.trim() ??
    "";
  const required = getPlayerSkill2RequiredLevel(skill);
  const lines = [name];
  if (body) lines.push(body);
  if (required > 1) lines.push(`習得 技② Lv.${required}`);
  if (skill2Progress) {
    lines.push(
      formatPlayerSkill2LevelExp(
        skill2Progress.level ?? 0,
        skill2Progress.exp ?? 0
      )
    );
    if (skill2Progress.devCheck) lines.push(MOE_PLAYER_SKILL2_DEV_NOTE);
  }
  const mpCost = phoenixPlayerSkillMpCost(skill);
  if (mpCost > 0) lines.push(`消費 MP ${mpCost}`);
  if (locked) lines.unshift(`${name}（技② Lv.${required}で習得）`);
  return lines.join("\n");
}

/** @param {object} pet */
export function petHasMoeAilment(pet) {
  const a = pet?.ailments;
  return Boolean(a?.poison || a?.paralysis);
}

/** @param {object} pet */
export function clearMoePetPoisonParalysis(pet) {
  const a = pet?.ailments;
  if (!a?.poison && !a?.paralysis) return pet;
  return {
    ...pet,
    ailments: {
      ...a,
      poison: false,
      paralysis: false,
    },
  };
}
