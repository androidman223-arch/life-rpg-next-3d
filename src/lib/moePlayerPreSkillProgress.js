/**
 * プレイヤー・プレスキル進行（スキル値 Lv · 経験値）
 *
 * MOE風: 経験値100でスキル値+0.1。使用時55%で経験値+0.1〜1.0（難易度で変動）。
 * 必要スキル値に近い行動ほど多く入る（同値付近で約0.4 · 楽すぎ/難しすぎは0.1前後）。
 */

import { MOE_PLAYER_PRE_SKILLS } from "../data/moePlayerPreSkills.js";
import {
  loadPlayerPreSkillProficiencyMap,
  savePlayerPreSkillProficiencyMap,
} from "./moePlayerExperience.js";

export const MOE_PLAYER_PRE_SKILL_PROGRESS_STORAGE_KEY =
  "life-rpg-moe-player-pre-skill-progress";

/** スキル値 +0.1 に必要な経験値 */
export const MOE_PLAYER_SKILL_EXP_PER_TENTH = 100;

/** 使用時に経験値が入る確率 */
export const MOE_PLAYER_PRE_SKILL_EXP_PROC_RATE = 0.55;

/**
 * @typedef {{ level: number, exp: number }} MoePlayerPreSkillProgress
 * @typedef {Record<string, MoePlayerPreSkillProgress>} MoePlayerPreSkillProgressMap
 */

/** @returns {MoePlayerPreSkillProgress} */
export function defaultPlayerPreSkillProgress() {
  return { level: 0, exp: 0 };
}

/** @returns {MoePlayerPreSkillProgressMap} */
export function defaultPlayerPreSkillProgressMap() {
  /** @type {MoePlayerPreSkillProgressMap} */
  const map = {};
  for (const skill of MOE_PLAYER_PRE_SKILLS) {
    map[skill.id] = defaultPlayerPreSkillProgress();
  }
  return map;
}

/** @param {unknown} raw @returns {MoePlayerPreSkillProgressMap} */
function normalizeProgressMap(raw) {
  const base = defaultPlayerPreSkillProgressMap();
  if (!raw || typeof raw !== "object") return base;
  for (const skill of MOE_PLAYER_PRE_SKILLS) {
    const row = raw[skill.id];
    if (!row || typeof row !== "object") continue;
    const level = Math.max(0, Number(row.level) || 0);
    const exp = Math.max(0, Math.min(99.99, Number(row.exp) || 0));
    base[skill.id] = {
      level: Math.round(level * 10) / 10,
      exp: Math.round(exp * 100) / 100,
    };
  }
  return base;
}

/** @returns {MoePlayerPreSkillProgressMap} */
export function loadPlayerPreSkillProgress() {
  return loadPlayerPreSkillProficiencyMap();
}

/** @param {MoePlayerPreSkillProgressMap} map */
export function savePlayerPreSkillProgress(map) {
  savePlayerPreSkillProficiencyMap(normalizeProgressMap(map));
}

/**
 * MOE風 — 必要スキルと現在値の差で上昇量（0.1〜1.0）
 * @param {number} currentLevel
 * @param {number} requiredLevel
 */
export function moePlayerSkillExpGainAmount(currentLevel, requiredLevel) {
  const gap = requiredLevel - currentLevel;
  let base;
  if (gap >= 0 && gap <= 1) base = 0.38 + Math.random() * 0.06;
  else if (gap > 1 && gap <= 4) base = 0.28 + Math.random() * 0.08;
  else if (gap > 4 && gap <= 10) base = 0.18 + Math.random() * 0.08;
  else if (gap < 0 && gap >= -5) base = 0.08 + Math.random() * 0.06;
  else if (gap < -5) base = 0.1;
  else base = 0.12 + Math.random() * 0.06;
  return Math.min(1, Math.max(0.1, Math.round(base * 10) / 10));
}

/**
 * @param {MoePlayerPreSkillProgress} progress
 * @param {number} amount 0.1〜1.0
 */
export function applyPlayerPreSkillExp(progress, amount) {
  const prev = progress ?? defaultPlayerPreSkillProgress();
  let level = prev.level ?? 0;
  // MOE表示 0.1〜1.0 → 内部EXP +1〜10（100でスキル値+0.1）
  let exp = (prev.exp ?? 0) + amount * 10;
  /** @type {number[]} */
  const levelUps = [];
  while (exp >= MOE_PLAYER_SKILL_EXP_PER_TENTH) {
    exp -= MOE_PLAYER_SKILL_EXP_PER_TENTH;
    level = Math.round((level + 0.1) * 10) / 10;
    levelUps.push(0.1);
  }
  return {
    level,
    exp: Math.round(exp * 100) / 100,
    levelUps,
  };
}

/**
 * @param {number} currentLevel
 * @param {number} requiredLevel
 * @param {number} [procRate]
 */
export function rollPlayerPreSkillExpOnUse(
  currentLevel,
  requiredLevel,
  procRate = MOE_PLAYER_PRE_SKILL_EXP_PROC_RATE
) {
  if (Math.random() >= procRate) {
    return { gained: false, amount: 0 };
  }
  const amount = moePlayerSkillExpGainAmount(currentLevel, requiredLevel);
  return { gained: true, amount };
}

/**
 * @param {import("../data/moePlayerPreSkills.js").MoePlayerPreSkill} skill
 * @param {MoePlayerPreSkillProgress | undefined} progress
 */
export function canUsePlayerPreSkill(skill, progress) {
  if (!skill) return { ok: false, reason: "missing" };
  if (skill.devCheckUsable) {
    return { ok: true, devCheck: true };
  }
  const level = progress?.level ?? 0;
  if (level + 1e-6 < skill.requiredSkillLevel) {
    return {
      ok: false,
      reason: "skill_level",
      required: skill.requiredSkillLevel,
    };
  }
  return { ok: true, devCheck: false };
}

/** @param {number} level @param {number} exp */
export function formatPlayerPreSkillLevelExp(level, exp) {
  return `スキル値 Lv.${level.toFixed(1)} · EXP ${Math.floor(exp)}/${MOE_PLAYER_SKILL_EXP_PER_TENTH}`;
}

/**
 * 使用後のプレスキル EXP 付与（純粋 · 保存は呼び出し側）
 * @param {MoePlayerPreSkillProgressMap} progressMap
 * @param {import("../data/moePlayerPreSkills.js").MoePlayerPreSkill} skill
 */
export function awardPlayerPreSkillExpOnUse(progressMap, skill) {
  const base = progressMap ?? defaultPlayerPreSkillProgressMap();
  if (!skill) {
    return {
      progressMap: base,
      gained: false,
      amount: 0,
      toastLines: [],
      leveledUp: false,
    };
  }
  const prev = base[skill.id] ?? defaultPlayerPreSkillProgress();
  const roll = rollPlayerPreSkillExpOnUse(
    prev.level ?? 0,
    skill.requiredSkillLevel
  );
  if (!roll.gained) {
    return {
      progressMap: base,
      gained: false,
      amount: 0,
      toastLines: [],
      leveledUp: false,
    };
  }
  const applied = applyPlayerPreSkillExp(prev, roll.amount);
  const nextMap = {
    ...base,
    [skill.id]: { level: applied.level, exp: applied.exp },
  };
  const toastLines = [`EXP +${roll.amount}（${skill.name}）`];
  const leveledUp = applied.levelUps.length > 0;
  if (leveledUp) {
    toastLines.push(`${skill.name} スキル値 Lv.${applied.level.toFixed(1)}！`);
  }
  return {
    progressMap: nextMap,
    gained: true,
    amount: roll.amount,
    toastLines,
    leveledUp,
    nextLevel: applied.level,
  };
}
