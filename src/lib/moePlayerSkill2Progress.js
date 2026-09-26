/**
 * プレイヤー技② — スキル値 Lv · 経験値（フェニックス系共通）
 *
 * 使用時55%で経験値獲得。上昇量は現在の技② Lv で段階変化:
 * - Lv20未満: +0.1〜1.0
 * - Lv40未満: +0.1〜0.3
 * - Lv40以上: +0.1 固定
 * 経験値100でスキル値+0.1（MOE風）
 */

import {
  applyPlayerPreSkillExp,
  MOE_PLAYER_PRE_SKILL_EXP_PROC_RATE,
  MOE_PLAYER_SKILL_EXP_PER_TENTH,
} from "./moePlayerPreSkillProgress.js";
import {
  awardPhoenixProficiencyOnUse,
  loadPlayerExperienceTrack,
  savePlayerExperienceTrack,
} from "./moePlayerExperience.js";
import { resolvePlayerSkill2ExpProcRate } from "./moePlayerSkill2Talisman.js";

export const MOE_PLAYER_SKILL2_PROGRESS_STORAGE_KEY =
  "life-rpg-moe-player-skill2-progress";

export const MOE_PLAYER_SKILL2_EXP_PROC_RATE =
  MOE_PLAYER_PRE_SKILL_EXP_PROC_RATE;

/** 実装チェック中はスキル値未達でも使用可 */
export const MOE_PLAYER_SKILL2_DEV_CHECK_USABLE = true;

export const MOE_PLAYER_SKILL2_DEV_NOTE = "★実装チェック中は使用可";

/**
 * @typedef {{ level: number, exp: number }} MoePlayerSkill2Progress
 */

/** @returns {MoePlayerSkill2Progress} */
export function defaultPlayerSkill2Progress() {
  return { level: 0, exp: 0 };
}

/** @param {unknown} raw @returns {MoePlayerSkill2Progress} */
function normalizeProgress(raw) {
  if (!raw || typeof raw !== "object") return defaultPlayerSkill2Progress();
  const level = Math.max(0, Number(raw.level) || 0);
  const exp = Math.max(0, Math.min(99.99, Number(raw.exp) || 0));
  return {
    level: Math.round(level * 10) / 10,
    exp: Math.round(exp * 100) / 100,
  };
}

/** @returns {MoePlayerSkill2Progress} */
export function loadPlayerSkill2Progress() {
  return loadPlayerExperienceTrack("phoenix");
}

/**
 * 旧プレスキル（jiriki_seiran）→ 技② へ一度だけ移行
 * @param {import("./moePlayerPreSkillProgress.js").MoePlayerPreSkillProgressMap} [preMap]
 */
export function migratePlayerSkill2ProgressFromPreSkills(preMap) {
  const loaded = loadPlayerSkill2Progress();
  if (loaded.level > 0 || loaded.exp > 0) return loaded;
  const legacy = preMap?.jiriki_seiran;
  if (!legacy || (legacy.level <= 0 && legacy.exp <= 0)) return loaded;
  const migrated = normalizeProgress(legacy);
  savePlayerSkill2Progress(migrated);
  return migrated;
}

/** @param {MoePlayerSkill2Progress} progress */
export function savePlayerSkill2Progress(progress) {
  savePlayerExperienceTrack("phoenix", normalizeProgress(progress));
}

/** @param {object | null | undefined} skill */
export function getPlayerSkill2RequiredLevel(skill) {
  return skill?.requiredSkillLevel ?? skill?.level ?? 1;
}

/**
 * 技② Lv に応じた EXP 上昇量（0.1刻み）
 * @param {number} currentLevel
 */
export function moePlayerSkill2ExpGainAmount(currentLevel) {
  let amount;
  if (currentLevel < 20) {
    amount = 0.1 + Math.random() * 0.9;
  } else if (currentLevel < 40) {
    amount = 0.1 + Math.random() * 0.2;
  } else {
    amount = 0.1;
  }
  return Math.round(amount * 10) / 10;
}

/**
 * @param {number} currentLevel
 * @param {number} [procRate]
 */
export function rollPlayerSkill2ExpOnUse(
  currentLevel,
  procRate = resolvePlayerSkill2ExpProcRate(
    undefined,
    MOE_PLAYER_SKILL2_EXP_PROC_RATE
  )
) {
  if (Math.random() >= procRate) {
    return { gained: false, amount: 0 };
  }
  const amount = moePlayerSkill2ExpGainAmount(currentLevel);
  return { gained: true, amount };
}

/**
 * @param {MoePlayerSkill2Progress} progress
 * @param {number} amount
 */
export function applyPlayerSkill2Exp(progress, amount) {
  return applyPlayerPreSkillExp(progress, amount);
}

/**
 * @param {object | null | undefined} skill
 * @param {MoePlayerSkill2Progress | undefined} progress
 */
export function canUsePlayerSkill2(skill, progress) {
  if (!skill) return { ok: false, reason: "missing" };
  if (MOE_PLAYER_SKILL2_DEV_CHECK_USABLE) {
    return { ok: true, devCheck: true };
  }
  const required = getPlayerSkill2RequiredLevel(skill);
  const level = progress?.level ?? 0;
  if (level + 1e-6 < required) {
    return { ok: false, reason: "skill_level", required };
  }
  return { ok: true, devCheck: false };
}

/** @param {number} level @param {number} exp */
export function formatPlayerSkill2LevelExp(level, exp) {
  return `技② Lv.${level.toFixed(1)} · EXP ${Math.floor(exp)}/${MOE_PLAYER_SKILL_EXP_PER_TENTH}`;
}

/**
 * 使用成功時の経験値処理
 * @param {MoePlayerSkill2Progress} progress
 */
export function awardPlayerSkill2ExpOnUse(progress, talismanActive) {
  const award = awardPhoenixProficiencyOnUse(progress, talismanActive);
  if (!award.gained) return award;
  const toastLines = award.toastLines.map((line) =>
    line.includes("鳳凰スキル")
      ? line.replace("鳳凰スキル", "プレイヤー技②")
      : line
  );
  return { ...award, toastLines };
}
