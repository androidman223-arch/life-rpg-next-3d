/**
 * 修行② 龍の武練 — 行動ログ＋タイマー · 龍神スキルゲット用 EXP
 */

import { applyPlayerProficiencyExp } from "./moePlayerProficiencyCore.js";
import {
  loadPlayerExperienceTrack,
  savePlayerExperienceTrack,
} from "./moePlayerExperience.js";

export const MOE_DRAGON_TRAINING_STORAGE_KEY = "life-rpg-moe-dragon-training-v1";

/** 龍神ボタン下のサブメッセージ */
export const MOE_DRAGON_BUTTON_SUB_HINT =
  "（実践、体験、リアル経験を積む、学ぶ、運動する、 ALL OK）";

/** 鳳凰と同じ — 6秒で +0.1 実践EXP */
export const MOE_DRAGON_EXP_TICK_SEC = 6;
export const MOE_DRAGON_EXP_PER_TICK = 0.1;

/** 鳳凰と同じ — 60分ごとの🎁ボーナス */
export const MOE_DRAGON_BONUS_INTERVAL_SEC = 3600;

/** 龍スキルゲット解放 Lv（累計修行EXP の目安） */
export const MOE_DRAGON_SKILL_GET_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

/** @typedef {'hunt' | 'traverse' | 'challenge' | 'seiran'} MoeDragonActionLogKey */

export const MOE_DRAGON_ACTION_LOG_FIELDS = [
  {
    key: "hunt",
    label: "討伐",
    hint: "今日倒した敵・強かった敵",
    placeholder: "例: スカイドラゴン Lv45 · 3体",
  },
  {
    key: "traverse",
    label: "走破",
    hint: "走った・探索した距離感",
    placeholder: "例: 飛竜の谷を一周 · 走行多め",
  },
  {
    key: "challenge",
    label: "挑戦",
    hint: "やってみたこと（高Lv帯など）",
    placeholder: "例: 初めてドラゴン谷の高台へ",
  },
  {
    key: "seiran",
    label: "整然",
    hint: "自力整然の客観視（一行）",
    placeholder: "例: 焦らず一歩ずつ進めた",
  },
];

/**
 * @typedef {{
 *   hunt: string,
 *   traverse: string,
 *   challenge: string,
 *   seiran: string,
 * }} MoeDragonActionLogs
 * @typedef {{
 *   logs: MoeDragonActionLogs,
 *   checked: Record<string, boolean>,
 *   timerRunning: boolean,
 *   timerStartedAtMs: number | null,
 *   accumulatedSec: number,
 *   dragonTotalSec: number,
 *   sessionExpTicksClaimed: number,
 *   dragonBonusCount: number,
 *   lastSessionSec: number,
 *   totalSessions: number,
 * }} MoeDragonTrainingState
 */

/** @returns {MoeDragonActionLogs} */
export function defaultDragonActionLogs() {
  return { hunt: "", traverse: "", challenge: "", seiran: "" };
}

/** @returns {MoeDragonTrainingState} */
export function defaultDragonTrainingState() {
  return {
    logs: defaultDragonActionLogs(),
    checked: {},
    timerRunning: false,
    timerStartedAtMs: null,
    accumulatedSec: 0,
    dragonTotalSec: 0,
    sessionExpTicksClaimed: 0,
    dragonBonusCount: 0,
    lastSessionSec: 0,
    totalSessions: 0,
  };
}

/** @param {unknown} raw @returns {MoeDragonTrainingState} */
export function normalizeDragonTrainingState(raw) {
  const base = defaultDragonTrainingState();
  if (!raw || typeof raw !== "object") return base;
  const logs = raw.logs && typeof raw.logs === "object" ? raw.logs : {};
  for (const field of MOE_DRAGON_ACTION_LOG_FIELDS) {
    base.logs[field.key] =
      typeof logs[field.key] === "string" ? logs[field.key] : "";
  }
  base.checked =
    raw.checked && typeof raw.checked === "object" ? { ...raw.checked } : {};
  base.timerRunning = Boolean(raw.timerRunning);
  base.timerStartedAtMs =
    raw.timerStartedAtMs == null ? null : Number(raw.timerStartedAtMs) || null;
  base.accumulatedSec = Math.max(0, Number(raw.accumulatedSec) || 0);
  base.dragonTotalSec = Math.max(0, Math.floor(Number(raw.dragonTotalSec) || 0));
  base.sessionExpTicksClaimed = Math.max(
    0,
    Math.floor(Number(raw.sessionExpTicksClaimed) || 0)
  );
  base.dragonBonusCount = Math.max(0, Math.floor(Number(raw.dragonBonusCount) || 0));
  base.lastSessionSec = Math.max(0, Number(raw.lastSessionSec) || 0);
  base.totalSessions = Math.max(0, Math.floor(Number(raw.totalSessions) || 0));
  return base;
}

/** @returns {MoeDragonTrainingState} */
export function loadDragonTrainingState() {
  if (typeof window === "undefined") return defaultDragonTrainingState();
  try {
    const raw = window.localStorage.getItem(MOE_DRAGON_TRAINING_STORAGE_KEY);
    if (!raw) return defaultDragonTrainingState();
    return normalizeDragonTrainingState(JSON.parse(raw));
  } catch {
    return defaultDragonTrainingState();
  }
}

/** @param {MoeDragonTrainingState} state */
export function saveDragonTrainingState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MOE_DRAGON_TRAINING_STORAGE_KEY,
      JSON.stringify(normalizeDragonTrainingState(state))
    );
  } catch {
    /* quota */
  }
}

/** @param {number} elapsedSec */
export function getDragonExpTicks(elapsedSec) {
  const sec = Math.max(0, Number(elapsedSec) || 0);
  if (sec < MOE_DRAGON_EXP_TICK_SEC) return 0;
  return Math.floor(sec / MOE_DRAGON_EXP_TICK_SEC);
}

/** @param {number} elapsedSec */
export function calcDragonSessionExpGain(elapsedSec) {
  return getDragonExpTicks(elapsedSec) * MOE_DRAGON_EXP_PER_TICK;
}

/** @param {number} value */
export function formatDragonExpDisplay(value) {
  const v = Math.max(0, Number(value) || 0);
  return (Math.round(v * 10) / 10).toFixed(1).replace(".", ",");
}

/** @param {number} gainAmount */
function grantDragonTrainingExp(gainAmount) {
  const gain = Math.round(Math.max(0, gainAmount) * 10) / 10;
  if (gain <= 0) {
    return {
      applied: loadPlayerExperienceTrack("dragon"),
      gainAmount: 0,
    };
  }
  const prevDragon = loadPlayerExperienceTrack("dragon");
  const applied = applyPlayerProficiencyExp(prevDragon, gain);
  savePlayerExperienceTrack("dragon", {
    level: applied.level,
    exp: applied.exp,
  });
  return { applied, gainAmount: gain };
}

/**
 * 未付与のティック分を龍EXPへ（タイマー中・停止時）
 * @param {MoeDragonTrainingState} state
 * @param {number} [nowMs]
 */
export function flushDragonSessionTicks(state, nowMs = Date.now()) {
  const elapsed = dragonTrainingElapsedSec(state, nowMs);
  const ticks = getDragonExpTicks(elapsed);
  const claimed = state.sessionExpTicksClaimed ?? 0;
  const deltaTicks = ticks - claimed;
  if (deltaTicks <= 0) {
    return {
      state,
      gainAmount: 0,
      sessionTotal: calcDragonSessionExpGain(elapsed),
      applied: loadPlayerExperienceTrack("dragon"),
    };
  }
  const gainAmount = Math.round(deltaTicks * MOE_DRAGON_EXP_PER_TICK * 10) / 10;
  const { applied } = grantDragonTrainingExp(gainAmount);
  const next = { ...state, sessionExpTicksClaimed: ticks };
  saveDragonTrainingState(next);
  return {
    state: next,
    gainAmount,
    sessionTotal: calcDragonSessionExpGain(elapsed),
    applied,
  };
}

/** @param {MoeDragonTrainingState} state @param {number} [nowMs] */
export function tickDragonSessionExp(state, nowMs = Date.now()) {
  if (!state.timerRunning) {
    return {
      state,
      gainAmount: 0,
      sessionTotal: calcDragonSessionExpGain(dragonTrainingElapsedSec(state, nowMs)),
      applied: loadPlayerExperienceTrack("dragon"),
    };
  }
  return flushDragonSessionTicks(state, nowMs);
}

export function dragonTrainingElapsedSec(state, nowMs = Date.now()) {
  let sec = state.accumulatedSec ?? 0;
  if (state.timerRunning && state.timerStartedAtMs) {
    sec += Math.max(0, (nowMs - state.timerStartedAtMs) / 1000);
  }
  return sec;
}

/** @param {number} sec */
export function formatDragonCurrentSec(sec) {
  return `${Math.max(0, Math.floor(sec))}秒`;
}

/**
 * 鳳凰UI — 現在の走行分のみ（停止中は0秒）
 * @param {MoeDragonTrainingState} state
 * @param {number} [nowMs]
 */
export function getDragonCurrentRunSec(state, nowMs = Date.now()) {
  if (!state.timerRunning || !state.timerStartedAtMs) return 0;
  return Math.max(0, Math.floor((nowMs - state.timerStartedAtMs) / 1000));
}

/**
 * 鳳凰UI — 累計（走行中は今の走行分を除く）
 * @param {MoeDragonTrainingState} state
 */
export function getDragonDisplayTotalSec(state) {
  return (state.dragonTotalSec ?? 0) + (state.accumulatedSec ?? 0);
}

/**
 * @param {MoeDragonTrainingState} state
 * @param {number} [nowMs]
 */
export function getDragonCombinedSec(state, nowMs = Date.now()) {
  return (state.dragonTotalSec ?? 0) + Math.floor(dragonTrainingElapsedSec(state, nowMs));
}

/**
 * @param {{ level?: number, exp?: number }} track
 */
export function getDragonPracticeExpDisplay(track) {
  return (Number(track?.level) || 0) + (Number(track?.exp) || 0) / 100;
}

/** @param {MoeDragonTrainingState} state @param {number} [nowMs] */
export function getDragonNextBonusSec(state, nowMs = Date.now()) {
  const combined = getDragonCombinedSec(state, nowMs);
  if (combined <= 0) return MOE_DRAGON_BONUS_INTERVAL_SEC;
  const remain =
    MOE_DRAGON_BONUS_INTERVAL_SEC - (combined % MOE_DRAGON_BONUS_INTERVAL_SEC);
  return remain === MOE_DRAGON_BONUS_INTERVAL_SEC ? 0 : remain;
}

/** @param {MoeDragonTrainingState} state @param {number} [nowMs] */
export function formatDragonBonusRemain(state, nowMs = Date.now()) {
  const combined = getDragonCombinedSec(state, nowMs);
  const remain = getDragonNextBonusSec(state, nowMs);
  if (remain <= 0 && combined > 0) return "ボーナスまであと少し";
  if (combined > 0) {
    const m = Math.max(1, Math.ceil(remain / 60));
    return `ボーナスまで${m}分`;
  }
  return "ボーナスまで60分";
}

/**
 * @param {MoeDragonTrainingState} state
 * @param {number} [nowMs]
 */
export function checkDragonHourlyBonus(state, nowMs = Date.now()) {
  const combined = getDragonCombinedSec(state, nowMs);
  const milestones = Math.floor(combined / MOE_DRAGON_BONUS_INTERVAL_SEC);
  const claimed = state.dragonBonusCount ?? 0;
  if (milestones <= claimed) {
    return { state, earned: 0, toastLine: null };
  }
  const earned = milestones - claimed;
  const next = { ...state, dragonBonusCount: milestones };
  saveDragonTrainingState(next);
  const toastLine =
    earned === 1
      ? "★ 龍神修行1時間達成！ ボーナス +1 ★"
      : `★ 龍神修行${earned}時間分のボーナス！ +${earned} ★`;
  return { state: next, earned, toastLine };
}

/** @param {MoeDragonTrainingState} state @param {number} [nowMs] */
export function startDragonTrainingTimer(state, nowMs = Date.now()) {
  if (state.timerRunning) return state;
  const freshSession = (state.accumulatedSec ?? 0) <= 0;
  return {
    ...state,
    timerRunning: true,
    timerStartedAtMs: nowMs,
    sessionExpTicksClaimed: freshSession ? 0 : (state.sessionExpTicksClaimed ?? 0),
  };
}

/** @param {MoeDragonTrainingState} state @param {number} [nowMs] */
export function pauseDragonTrainingTimer(state, nowMs = Date.now()) {
  if (!state.timerRunning || !state.timerStartedAtMs) {
    return { ...state, timerRunning: false, timerStartedAtMs: null };
  }
  const add = Math.max(0, (nowMs - state.timerStartedAtMs) / 1000);
  const sessionSec = Math.floor((state.accumulatedSec ?? 0) + add);
  return {
    ...state,
    timerRunning: false,
    timerStartedAtMs: null,
    accumulatedSec: sessionSec,
  };
}

/** @param {MoeDragonTrainingState} state @param {number} sec */
export function addDragonTrainingTotalSec(state, sec) {
  const add = Math.max(0, Math.floor(sec));
  if (add <= 0) return state;
  return {
    ...state,
    dragonTotalSec: (state.dragonTotalSec ?? 0) + add,
  };
}

/** @param {MoeDragonTrainingState} state @param {number} [nowMs] */
export function toggleDragonTrainingTimer(state, nowMs = Date.now()) {
  if (state.timerRunning) {
    const paused = pauseDragonTrainingTimer(state, nowMs);
    return flushDragonSessionTicks(paused, nowMs).state;
  }
  return startDragonTrainingTimer(state, nowMs);
}

/**
 * タイマー完了 — 龍修行EXP付与
 * @param {MoeDragonTrainingState} state
 * @param {number} [nowMs]
 */
export function completeDragonTrainingSession(state, nowMs = Date.now()) {
  const paused = pauseDragonTrainingTimer(state, nowMs);
  const flushed = flushDragonSessionTicks(paused, nowMs);
  const sessionSec = Math.max(1, Math.floor(paused.accumulatedSec || 1));
  const checkedCount = MOE_DRAGON_ACTION_LOG_FIELDS.filter(
    (f) => flushed.state.checked?.[f.key]
  ).length;
  const logBonus = Math.round(checkedCount * 0.2 * 10) / 10;
  const logGrant = grantDragonTrainingExp(logBonus);
  const gainAmount = Math.round((flushed.gainAmount + logGrant.gainAmount) * 10) / 10;
  const applied = logGrant.gainAmount > 0 ? logGrant.applied : flushed.applied;

  const next = addDragonTrainingTotalSec(
    {
      ...flushed.state,
      accumulatedSec: 0,
      sessionExpTicksClaimed: 0,
      lastSessionSec: sessionSec,
      totalSessions: (flushed.state.totalSessions ?? 0) + 1,
    },
    sessionSec
  );
  saveDragonTrainingState(next);

  const toastLines = [
    `🐉 龍の武練完了（${formatDragonTrainingDuration(sessionSec)}）`,
    `龍修行EXP +${gainAmount.toFixed(1)}（実践 ${formatDragonExpDisplay(flushed.sessionTotal)}${logBonus > 0 ? ` + ログ ${formatDragonExpDisplay(logBonus)}` : ""}）`,
  ];
  if (applied.levelUps.length > 0) {
    toastLines.push(`龍神スキル値 Lv.${applied.level.toFixed(1)}！`);
  }
  const nextGet = nextDragonSkillGetLevel(applied.level);
  if (nextGet) {
    toastLines.push(`次のゲット目安: Lv.${nextGet}`);
  }

  return {
    state: next,
    sessionSec,
    gainAmount,
    dragonProgress: { level: applied.level, exp: applied.exp },
    leveledUp: applied.levelUps.length > 0,
    toastLines,
  };
}

/** @param {number} level */
export function nextDragonSkillGetLevel(level) {
  const lv = Number(level) || 0;
  for (const target of MOE_DRAGON_SKILL_GET_LEVELS) {
    if (lv + 1e-6 < target) return target;
  }
  return null;
}

/** @param {number} sec */
export function formatDragonTrainingDuration(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}秒`;
  return `${m}分${r}秒`;
}
