/**
 * プレイヤー経験値・スキル熟練度 — 単一保存ファイル
 *
 * 訓練士 Lv は gameStatus.js。ここはスキル熟練度のみ:
 * - phoenix … 技②フェニックス系（使用時 EXP · 修行ボーナス予定）
 * - dragon … 龍系（敵撃破ボーナス予定）
 * - heal … 回復魔法・リジェネ共通
 * - stealth … 忍び足・隠密
 * - preSkills … 技③プレスキル個別
 */

import { MOE_PLAYER_PRE_SKILLS } from "../data/moePlayerPreSkills.js";
import {
  applyPlayerProficiencyExp,
  defaultPlayerSkillProficiency,
  MOE_PLAYER_PRE_SKILL_EXP_PROC_RATE,
  MOE_PLAYER_SKILL_EXP_PER_TENTH,
  moePlayerSkillExpGainAmount,
} from "./moePlayerProficiencyCore.js";
import { resolvePlayerSkill2ExpProcRate } from "./moePlayerSkill2Talisman.js";

/** 技②フェニックス — EXP 上昇量（moePlayerSkill2Progress と同期） */
function phoenixExpGainAmount(currentLevel) {
  const lv = Number(currentLevel) || 0;
  let amount;
  if (lv < 20) amount = 0.1 + Math.random() * 0.9;
  else if (lv < 40) amount = 0.1 + Math.random() * 0.2;
  else amount = 0.1;
  return Math.round(amount * 10) / 10;
}

const MOE_PHOENIX_EXP_PROC_BASE = MOE_PLAYER_PRE_SKILL_EXP_PROC_RATE;

export const MOE_PLAYER_EXPERIENCE_STORAGE_KEY =
  "life-rpg-moe-player-experience";

export const MOE_PLAYER_EXPERIENCE_VERSION = 1;

/** 旧キー（移行元） */
export const MOE_PLAYER_EXPERIENCE_LEGACY_KEYS = {
  skill2: "life-rpg-moe-player-skill2-progress",
  preSkill: "life-rpg-moe-player-pre-skill-progress",
};

/**
 * @typedef {{ level: number, exp: number }} MoePlayerSkillProficiency
 * @typedef {{
 *   version: number,
 *   phoenix: MoePlayerSkillProficiency,
 *   dragon: MoePlayerSkillProficiency,
 *   heal: MoePlayerSkillProficiency,
 *   stealth: MoePlayerSkillProficiency,
 *   preSkills: Record<string, MoePlayerSkillProficiency>,
 * }} MoePlayerExperience
 */

export { defaultPlayerSkillProficiency } from "./moePlayerProficiencyCore.js";

/** @param {unknown} raw @returns {MoePlayerSkillProficiency} */
export function normalizePlayerSkillProficiency(raw) {
  if (!raw || typeof raw !== "object") return defaultPlayerSkillProficiency();
  const level = Math.max(0, Number(raw.level) || 0);
  const exp = Math.max(0, Math.min(99.99, Number(raw.exp) || 0));
  return {
    level: Math.round(level * 10) / 10,
    exp: Math.round(exp * 100) / 100,
  };
}

/** @returns {Record<string, MoePlayerSkillProficiency>} */
function defaultPreSkillProficiencyMap() {
  /** @type {Record<string, MoePlayerSkillProficiency>} */
  const map = {};
  for (const skill of MOE_PLAYER_PRE_SKILLS) {
    map[skill.id] = defaultPlayerSkillProficiency();
  }
  return map;
}

/** @returns {MoePlayerExperience} */
export function defaultPlayerExperience() {
  return {
    version: MOE_PLAYER_EXPERIENCE_VERSION,
    phoenix: defaultPlayerSkillProficiency(),
    dragon: defaultPlayerSkillProficiency(),
    heal: defaultPlayerSkillProficiency(),
    stealth: defaultPlayerSkillProficiency(),
    preSkills: defaultPreSkillProficiencyMap(),
  };
}

/** @param {unknown} raw @returns {MoePlayerExperience} */
export function normalizePlayerExperience(raw) {
  const base = defaultPlayerExperience();
  if (!raw || typeof raw !== "object") return base;
  base.phoenix = normalizePlayerSkillProficiency(raw.phoenix);
  base.dragon = normalizePlayerSkillProficiency(raw.dragon);
  base.heal = normalizePlayerSkillProficiency(raw.heal);
  base.stealth = normalizePlayerSkillProficiency(raw.stealth);
  const pre = defaultPreSkillProficiencyMap();
  if (raw.preSkills && typeof raw.preSkills === "object") {
    for (const skill of MOE_PLAYER_PRE_SKILLS) {
      pre[skill.id] = normalizePlayerSkillProficiency(raw.preSkills[skill.id]);
    }
  }
  base.preSkills = pre;
  return base;
}

/**
 * 旧 localStorage から一度だけ取り込む
 * @param {MoePlayerExperience} current
 */
function migrateLegacyPlayerExperience(current) {
  if (typeof window === "undefined") return current;
  const next = normalizePlayerExperience(current);
  let changed = false;

  try {
    const skill2Raw = window.localStorage.getItem(
      MOE_PLAYER_EXPERIENCE_LEGACY_KEYS.skill2
    );
    if (
      skill2Raw &&
      next.phoenix.level <= 0 &&
      next.phoenix.exp <= 0
    ) {
      next.phoenix = normalizePlayerSkillProficiency(JSON.parse(skill2Raw));
      changed = true;
    }
  } catch {
    /* ignore */
  }

  try {
    const preRaw = window.localStorage.getItem(
      MOE_PLAYER_EXPERIENCE_LEGACY_KEYS.preSkill
    );
    if (preRaw) {
      const legacy = JSON.parse(preRaw);
      if (legacy && typeof legacy === "object") {
        for (const skill of MOE_PLAYER_PRE_SKILLS) {
          const row = legacy[skill.id];
          const cur = next.preSkills[skill.id];
          if (
            row &&
            (cur.level <= 0 && cur.exp <= 0)
          ) {
            next.preSkills[skill.id] = normalizePlayerSkillProficiency(row);
            changed = true;
          }
        }
        const seiran = legacy.jiriki_seiran;
        if (
          seiran &&
          next.phoenix.level <= 0 &&
          next.phoenix.exp <= 0
        ) {
          next.phoenix = normalizePlayerSkillProficiency(seiran);
          changed = true;
        }
      }
    }
  } catch {
    /* ignore */
  }

  if (changed) savePlayerExperience(next);
  return next;
}

/** @returns {MoePlayerExperience} */
export function loadPlayerExperience() {
  if (typeof window === "undefined") return defaultPlayerExperience();
  try {
    const raw = window.localStorage.getItem(MOE_PLAYER_EXPERIENCE_STORAGE_KEY);
    if (!raw) return migrateLegacyPlayerExperience(defaultPlayerExperience());
    return migrateLegacyPlayerExperience(normalizePlayerExperience(JSON.parse(raw)));
  } catch {
    return migrateLegacyPlayerExperience(defaultPlayerExperience());
  }
}

/** @param {MoePlayerExperience} data */
export function savePlayerExperience(data) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MOE_PLAYER_EXPERIENCE_STORAGE_KEY,
      JSON.stringify(normalizePlayerExperience(data))
    );
  } catch {
    /* quota */
  }
}

/** @param {Partial<MoePlayerExperience>} patch */
export function patchPlayerExperience(patch) {
  const next = normalizePlayerExperience({
    ...loadPlayerExperience(),
    ...patch,
  });
  savePlayerExperience(next);
  return next;
}

/** @param {"phoenix"|"dragon"|"heal"|"stealth"} track */
export function loadPlayerExperienceTrack(track) {
  const data = loadPlayerExperience();
  return data[track] ?? defaultPlayerSkillProficiency();
}

/**
 * @param {"phoenix"|"dragon"|"heal"|"stealth"} track
 * @param {MoePlayerSkillProficiency} progress
 */
export function savePlayerExperienceTrack(track, progress) {
  const data = loadPlayerExperience();
  data[track] = normalizePlayerSkillProficiency(progress);
  savePlayerExperience(data);
  return data;
}

/** @returns {Record<string, MoePlayerSkillProficiency>} */
export function loadPlayerPreSkillProficiencyMap() {
  return loadPlayerExperience().preSkills;
}

/** @param {Record<string, MoePlayerSkillProficiency>} map */
export function savePlayerPreSkillProficiencyMap(map) {
  const data = loadPlayerExperience();
  const pre = defaultPreSkillProficiencyMap();
  for (const skill of MOE_PLAYER_PRE_SKILLS) {
    pre[skill.id] = normalizePlayerSkillProficiency(map?.[skill.id]);
  }
  data.preSkills = pre;
  savePlayerExperience(data);
  return data;
}

/**
 * @param {number} level
 * @param {number} exp
 * @param {number} [max]
 */
export function formatPlayerProficiencyBar(level, exp, max = MOE_PLAYER_SKILL_EXP_PER_TENTH) {
  return `Lv.${level.toFixed(1)} · EXP ${Math.floor(exp)}/${max}`;
}

/**
 * 汎用 — 使用成功時に熟練 EXP を抽選付与
 * @param {MoePlayerSkillProficiency} progress
 * @param {{
 *   procRate?: number,
 *   gainAmount?: number,
 *   expLabel?: string,
 *   levelLabel?: string,
 * }} [opts]
 */
export function awardPlayerProficiencyExpOnUse(progress, opts = {}) {
  const prev = progress ?? defaultPlayerSkillProficiency();
  const procRate = opts.procRate ?? MOE_PLAYER_PRE_SKILL_EXP_PROC_RATE;
  if (Math.random() >= procRate) {
    return {
      progress: prev,
      gained: false,
      amount: 0,
      toastLines: [],
      leveledUp: false,
    };
  }
  const amount =
    opts.gainAmount ??
    moePlayerSkillExpGainAmount(prev.level ?? 0, prev.level ?? 0);
  const applied = applyPlayerProficiencyExp(prev, amount);
  const expLabel = opts.expLabel ?? "熟練EXP";
  const levelLabel = opts.levelLabel ?? "熟練度";
  const toastLines = [`${expLabel} +${amount.toFixed(1)}`];
  const leveledUp = applied.levelUps.length > 0;
  if (leveledUp) {
    toastLines.push(`${levelLabel} Lv.${applied.level.toFixed(1)}！`);
  }
  return {
    progress: { level: applied.level, exp: applied.exp },
    gained: true,
    amount,
    toastLines,
    leveledUp,
    nextLevel: applied.level,
  };
}

/**
 * 技②フェニックス — 使用成功時 EXP
 * @param {MoePlayerSkillProficiency} progress
 * @param {boolean} [talismanActive]
 */
export function awardPhoenixProficiencyOnUse(progress, talismanActive) {
  const prev = progress ?? defaultPlayerSkillProficiency();
  const procRate = resolvePlayerSkill2ExpProcRate(
    talismanActive,
    MOE_PHOENIX_EXP_PROC_BASE
  );
  if (Math.random() >= procRate) {
    return {
      progress: prev,
      gained: false,
      amount: 0,
      toastLines: [],
      leveledUp: false,
    };
  }
  const amount = phoenixExpGainAmount(prev.level ?? 0);
  const applied = applyPlayerProficiencyExp(prev, amount);
  const toastLines = [`スキルEXP +${amount.toFixed(1)}`];
  const leveledUp = applied.levelUps.length > 0;
  if (leveledUp) {
    toastLines.push(`鳳凰スキル Lv.${applied.level.toFixed(1)}！`);
  }
  return {
    progress: { level: applied.level, exp: applied.exp },
    gained: true,
    amount,
    toastLines,
    leveledUp,
    nextLevel: applied.level,
  };
}

/**
 * 回復スキル — 成功時に heal トラックへ EXP
 * @param {MoePlayerSkillProficiency} progress
 * @param {number} requiredLevel
 */
export function awardHealProficiencyOnUse(progress, requiredLevel) {
  const prev = progress ?? defaultPlayerSkillProficiency();
  const procRate = MOE_PLAYER_PRE_SKILL_EXP_PROC_RATE;
  if (Math.random() >= procRate) {
    return {
      progress: prev,
      gained: false,
      amount: 0,
      toastLines: [],
      leveledUp: false,
    };
  }
  const amount = moePlayerSkillExpGainAmount(prev.level ?? 0, requiredLevel);
  const applied = applyPlayerProficiencyExp(prev, amount);
  const toastLines = [`回復熟練EXP +${amount.toFixed(1)}`];
  const leveledUp = applied.levelUps.length > 0;
  if (leveledUp) {
    toastLines.push(`回復熟練 Lv.${applied.level.toFixed(1)}！`);
  }
  return {
    progress: { level: applied.level, exp: applied.exp },
    gained: true,
    amount,
    toastLines,
    leveledUp,
    nextLevel: applied.level,
  };
}

/**
 * 忍び足など — stealth トラックへ EXP
 * @param {MoePlayerSkillProficiency} progress
 * @param {number} requiredLevel
 */
export function awardStealthProficiencyOnUse(progress, requiredLevel = 10) {
  const prev = progress ?? defaultPlayerSkillProficiency();
  const procRate = MOE_PLAYER_PRE_SKILL_EXP_PROC_RATE;
  if (Math.random() >= procRate) {
    return {
      progress: prev,
      gained: false,
      amount: 0,
      toastLines: [],
      leveledUp: false,
    };
  }
  const amount = moePlayerSkillExpGainAmount(prev.level ?? 0, requiredLevel);
  const applied = applyPlayerProficiencyExp(prev, amount);
  const toastLines = [`隠密熟練EXP +${amount.toFixed(1)}`];
  const leveledUp = applied.levelUps.length > 0;
  if (leveledUp) {
    toastLines.push(`隠密熟練 Lv.${applied.level.toFixed(1)}！`);
  }
  return {
    progress: { level: applied.level, exp: applied.exp },
    gained: true,
    amount,
    toastLines,
    leveledUp,
    nextLevel: applied.level,
  };
}

/**
 * 技③プレスキル — preSkills へ EXP
 * @param {Record<string, MoePlayerSkillProficiency>} progressMap
 * @param {import("../data/moePlayerPreSkills.js").MoePlayerPreSkill} skill
 */
export function awardPreSkillProficiencyOnUse(progressMap, skill) {
  const base = progressMap ?? defaultPreSkillProficiencyMap();
  if (!skill) {
    return {
      progressMap: base,
      gained: false,
      amount: 0,
      toastLines: [],
      leveledUp: false,
    };
  }
  const prev = base[skill.id] ?? defaultPlayerSkillProficiency();
  const procRate = MOE_PLAYER_PRE_SKILL_EXP_PROC_RATE;
  if (Math.random() >= procRate) {
    return {
      progressMap: base,
      gained: false,
      amount: 0,
      toastLines: [],
      leveledUp: false,
    };
  }
  const amount = moePlayerSkillExpGainAmount(
    prev.level ?? 0,
    skill.requiredSkillLevel
  );
  const applied = applyPlayerProficiencyExp(prev, amount);
  const nextMap = {
    ...base,
    [skill.id]: { level: applied.level, exp: applied.exp },
  };
  const toastLines = [`EXP +${amount}（${skill.name}）`];
  const leveledUp = applied.levelUps.length > 0;
  if (leveledUp) {
    toastLines.push(`${skill.name} スキル値 Lv.${applied.level.toFixed(1)}！`);
  }
  return {
    progressMap: nextMap,
    gained: true,
    amount,
    toastLines,
    leveledUp,
    nextLevel: applied.level,
  };
}
