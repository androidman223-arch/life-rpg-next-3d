"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  calcDragonSessionExpGain,
  checkDragonHourlyBonus,
  completeDragonTrainingSession,
  dragonTrainingElapsedSec,
  flushDragonSessionTicks,
  formatDragonBonusRemain,
  formatDragonCurrentSec,
  formatDragonExpDisplay,
  formatDragonTrainingDuration,
  getDragonCurrentRunSec,
  getDragonDisplayTotalSec,
  getDragonPracticeExpDisplay,
  loadDragonTrainingState,
  MOE_DRAGON_ACTION_LOG_FIELDS,
  MOE_DRAGON_BUTTON_SUB_HINT,
  pauseDragonTrainingTimer,
  saveDragonTrainingState,
  startDragonTrainingTimer,
  tickDragonSessionExp,
} from "@/lib/moeDragonTraining";
import { MOE_DRAGON_SKILL_GET_CATALOG } from "@/data/moeDragonSkillGetCatalog";
import { loadPlayerExperienceTrack } from "@/lib/moePlayerExperience";

const CSS_HREF = "/training-exp-system/training-exp-system.css?v=12";

function ensureTrainingExpCss() {
  if (typeof document === "undefined") return;
  if (document.querySelector(`link[href="${CSS_HREF}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = CSS_HREF;
  document.head.appendChild(link);
}

/** @param {import("@/data/moeDragonSkillGetCatalog").MoeDragonSkillGetEntry} entry */
function dragonSkillGetStatus(entry, practiceLevel) {
  const unlocked = practiceLevel + 1e-6 >= entry.level;
  if (unlocked) {
    return entry.status === "done" ? "解放済" : "Lv到達";
  }
  return `あとLv.${entry.level}`;
}

/**
 * @param {{
 *   open: boolean,
 *   onDragonExpGranted?: (lines: string[]) => void,
 * }} props
 */
export default function DragonTrainingPanel({ open, onDragonExpGranted }) {
  const [state, setState] = useState(() => loadDragonTrainingState());
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [dragon, setDragon] = useState(() => loadPlayerExperienceTrack("dragon"));
  const [bonusPanelOpen, setBonusPanelOpen] = useState(false);
  const [actionLogOpen, setActionLogOpen] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupShow, setPopupShow] = useState(false);
  const [popupBump, setPopupBump] = useState(false);
  const popupTimerRef = useRef(null);

  const showExpPopup = useCallback((sessionTotal) => {
    if (sessionTotal <= 0) return;
    setPopupText(`EXP+${formatDragonExpDisplay(sessionTotal)}`);
    setPopupShow(true);
    setPopupBump(false);
    requestAnimationFrame(() => setPopupBump(true));
    if (popupTimerRef.current) window.clearTimeout(popupTimerRef.current);
    popupTimerRef.current = window.setTimeout(() => {
      setPopupShow(false);
      setPopupBump(false);
    }, 2200);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    ensureTrainingExpCss();
    setState(loadDragonTrainingState());
    setDragon(loadPlayerExperienceTrack("dragon"));
    setNowMs(Date.now());
    const id = window.setInterval(() => {
      setNowMs(Date.now());
      setState((prev) => {
        if (!prev.timerRunning) return prev;
        let next = prev;
        const bonus = checkDragonHourlyBonus(prev);
        if (bonus.earned > 0) {
          next = bonus.state;
          if (bonus.toastLine) onDragonExpGranted?.([bonus.toastLine]);
        }
        const result = tickDragonSessionExp(next);
        if (result.gainAmount > 0) {
          setDragon({
            level: result.applied.level,
            exp: result.applied.exp,
          });
          showExpPopup(result.sessionTotal);
          return result.state;
        }
        return bonus.earned > 0 ? bonus.state : prev;
      });
    }, 1000);
    return () => {
      window.clearInterval(id);
      if (popupTimerRef.current) window.clearTimeout(popupTimerRef.current);
    };
  }, [open, showExpPopup, onDragonExpGranted]);

  useEffect(() => {
    if (!open) return;
    saveDragonTrainingState(state);
  }, [state, open]);

  const currentRunSec = getDragonCurrentRunSec(state, nowMs);
  const displayTotalSec = getDragonDisplayTotalSec(state);
  const sessionSec = dragonTrainingElapsedSec(state, nowMs);
  const sessionExpGain = state.timerRunning
    ? calcDragonSessionExpGain(sessionSec)
    : 0;
  const practiceExp = formatDragonExpDisplay(getDragonPracticeExpDisplay(dragon));
  const practiceLevel = dragon.level ?? 0;
  const bonusRemain = formatDragonBonusRemain(state, nowMs);

  const patchLog = useCallback((key, value) => {
    setState((prev) => ({
      ...prev,
      logs: { ...prev.logs, [key]: value },
    }));
  }, []);

  const toggleChecked = useCallback((key) => {
    setState((prev) => ({
      ...prev,
      checked: { ...prev.checked, [key]: !prev.checked?.[key] },
    }));
  }, []);

  const toggleBonusPanel = useCallback(() => {
    setBonusPanelOpen((v) => {
      const next = !v;
      if (next) setActionLogOpen(false);
      return next;
    });
  }, []);

  const toggleActionLog = useCallback(() => {
    setActionLogOpen((v) => {
      const next = !v;
      if (next) setBonusPanelOpen(false);
      return next;
    });
  }, []);

  const handleToggleTimer = useCallback(() => {
    setState((prev) => {
      const now = Date.now();
      if (prev.timerRunning) {
        const paused = pauseDragonTrainingTimer(prev, now);
        const flushed = flushDragonSessionTicks(paused, now);
        const bonus = checkDragonHourlyBonus(flushed.state, now);
        const finalState = bonus.state;
        if (flushed.gainAmount > 0) {
          setDragon({
            level: flushed.applied.level,
            exp: flushed.applied.exp,
          });
          showExpPopup(flushed.sessionTotal);
        }
        if (bonus.toastLine) onDragonExpGranted?.([bonus.toastLine]);
        setNowMs(now);
        return finalState;
      }
      setNowMs(now);
      return startDragonTrainingTimer(prev, now);
    });
  }, [showExpPopup, onDragonExpGranted]);

  const handleComplete = useCallback(() => {
    setState((prev) => {
      const result = completeDragonTrainingSession(prev);
      setDragon({
        level: result.dragonProgress.level,
        exp: result.dragonProgress.exp,
      });
      onDragonExpGranted?.(result.toastLines);
      setNowMs(Date.now());
      return result.state;
    });
  }, [onDragonExpGranted]);

  if (!open) return null;

  return (
    <div className="mt-4 w-full" id="trial-dragon-time-panel" aria-label="龍の武練">
      <div className="thinking-dragon-block">
        <div className="thinking-time-main-row thinking-dragon-main-row">
          <span className="thinking-dragon-title">🐉 龍神</span>
          <span className="thinking-compact-stat thinking-stat-with-popup">
            <span>{formatDragonCurrentSec(currentRunSec)}</span>
            /<strong>{formatDragonTrainingDuration(displayTotalSec)}</strong>
            {sessionExpGain > 0 && (
              <span className="activity-session-exp dragon">
                {` EXP+${formatDragonExpDisplay(sessionExpGain)}`}
              </span>
            )}
            <span
              className={`activity-exp-popup dragon${popupShow ? " show" : ""}${popupBump ? " bump" : ""}`}
              aria-hidden={!popupShow}
            >
              {popupText}
            </span>
          </span>
          <span className="thinking-exp-stat thinking-dragon-exp-stat">
            実践EXP<strong>{practiceExp}</strong>
          </span>
          <span className="thinking-time-bonus-wrap">
            🎁<strong>{state.dragonBonusCount ?? 0}</strong>
          </span>
          <button
            type="button"
            onClick={handleToggleTimer}
            className={`thinking-time-btn thinking-dragon-btn${state.timerRunning ? " running" : ""}`}
          >
            {state.timerRunning ? "停止" : "スタート"}
          </button>
        </div>
        <p className="thinking-dragon-sub-hint">{MOE_DRAGON_BUTTON_SUB_HINT}</p>
        <p className="thinking-time-next-bonus">{bonusRemain}</p>
      </div>

      <div className="thinking-exp-total-row thinking-dragon-exp-total-row">
        <span>総EXP</span>
        <strong>{practiceExp}</strong>
        <span className="thinking-exp-breakdown">（龍神・実践）</span>
        <button
          type="button"
          onClick={toggleBonusPanel}
          className={`thinking-exp-bonus-btn thinking-dragon-bonus-btn${bonusPanelOpen ? " open" : ""}`}
          aria-expanded={bonusPanelOpen}
        >
          ボーナス表🎁
        </button>
        <button
          type="button"
          onClick={toggleActionLog}
          className={`thinking-todo-memo-btn thinking-dragon-action-btn${actionLogOpen ? " open" : ""}`}
          aria-expanded={actionLogOpen}
        >
          行動ログ
        </button>
      </div>

      {!bonusPanelOpen ? null : (
        <div className="thinking-exp-bonus-panel thinking-dragon-bonus-panel">
          <div className="exp-bonus-title thinking-dragon-bonus-title">ボーナス表🎁</div>
          <div className="exp-bonus-header">実践EXP Lv → スキルゲット ↓</div>
          <div className="exp-skill-get-title">● 龍神スキルゲット（実践 Lv10〜90）</div>
          <div className="exp-skill-get-list">
            {MOE_DRAGON_SKILL_GET_CATALOG.map((entry) => {
              const unlocked = practiceLevel + 1e-6 >= entry.level;
              return (
                <div
                  key={entry.level}
                  className={`exp-skill-get-row${unlocked ? " unlocked" : ""}${entry.status === "done" ? " implemented" : ""}`}
                >
                  <span className="exp-skill-get-lv">Lv.{entry.level}</span>
                  <span className="exp-skill-get-name">
                    {entry.originalName
                      ? `${entry.name}（${entry.originalName}）`
                      : entry.name}
                  </span>
                  <span className="exp-skill-get-hint">{entry.hint}</span>
                  {entry.status === "done" && (
                    <span className="exp-skill-get-tag done">実装済</span>
                  )}
                  <span className="exp-bonus-status" style={{ marginLeft: "auto" }}>
                    {dragonSkillGetStatus(entry, practiceLevel)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!actionLogOpen ? null : (
        <div className="thinking-todo-memo-panel thinking-dragon-action-panel">
          <p className="thinking-dragon-action-panel-title">
            行動ログ（討伐 · 走破 · 挑戦 · 整然）
          </p>
          {MOE_DRAGON_ACTION_LOG_FIELDS.map((field) => (
            <div
              key={field.key}
              className="thinking-time-detail open"
              style={{
                background: "rgba(40, 32, 24, 0.55)",
                border: "1px solid rgba(255, 180, 100, 0.25)",
                marginBottom: "8px",
              }}
            >
              <div className="thinking-time-detail-title-row">
                <div className="thinking-time-detail-title" style={{ color: "#ffd4a8" }}>
                  {field.label}
                  <span className="memo-edit-hint"> — {field.hint}</span>
                </div>
                <span className="memo-detail-actions">
                  <button
                    type="button"
                    onClick={() => toggleChecked(field.key)}
                    className="thinking-time-detail-btn"
                    style={
                      state.checked?.[field.key]
                        ? { color: "#9fd", borderColor: "#6da" }
                        : undefined
                    }
                  >
                    {state.checked?.[field.key] ? "✓記録済" : "✓する"}
                  </button>
                </span>
              </div>
              <textarea
                value={state.logs?.[field.key] ?? ""}
                onChange={(e) => patchLog(field.key, e.target.value)}
                rows={2}
                placeholder={field.placeholder}
                className="user-memo-editor"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleComplete}
            className="thinking-dragon-complete-btn"
          >
            完了 → 龍EXP（ログ✓ボーナス）
          </button>
        </div>
      )}
    </div>
  );
}
