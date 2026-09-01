/**
 * TrainingExpSystem — 修行タイマー・EXP・ボーナス表（ポータブル単体モジュール）
 *
 * 他ゲームへ持ち込む: このフォルダごとコピー + bridge で configure
 * 公開ビルドから隠す: TRAINING_EXP_SYSTEM マーカー間と training-exp-system/ を削除
 */
(function (global) {
  "use strict";

  const DEFAULT_STORAGE = {
    state: "training_exp_state_v1",
    memos: "training_exp_memos_v1",
    todo: "training_exp_todo_v1",
  };

  let cfg = {
    storageKeys: { ...DEFAULT_STORAGE },
    milestones: [],
    defaultMemos: { self: "", blame: "", task: "", habit: "" },
    formatDuration(sec) {
      const s = Math.max(0, Math.floor(sec));
      const m = Math.floor(s / 60);
      const r = s % 60;
      return m > 0 ? `${m}分${r}秒` : `${r}秒`;
    },
    hasCompanion() { return false; },
    unlockCompanion() { return false; },
    tryAssignItemDrop() { return null; },
    onAfterClaim() {},
    syncGuide: null,
  };

  let mounted = false;
  let mountRoot = null;
  let foldRoot = null;


  function getStorageKey(kind) {
    return (cfg.storageKeys && cfg.storageKeys[kind]) || DEFAULT_STORAGE[kind];
  }

  const SELF_THINKING_BONUS_INTERVAL_SEC = 3600;

  const THINKING_TIMER_KINDS = new Set(["self", "blame"]);
const ACTIVITY_TIMER_KINDS = new Set(["memo", "meditation", "exercise"]);
const MEMO_MEDITATION_KINDS = new Set(["memo", "meditation"]);
const SESSION_EXP_KINDS = new Set(["self", "memo", "meditation", "exercise"]);
const ALL_TIMER_KINDS = new Set([...THINKING_TIMER_KINDS, ...ACTIVITY_TIMER_KINDS]);

const thinkingTimeState = {
  selfTotalSec: 0,
  blameTotalSec: 0,
  memoTotalSec: 0,
  meditationTotalSec: 0,
  exerciseTotalSec: 0,
  selfExp: 0,
  memoExp: 0,
  meditationExp: 0,
  exerciseExp: 0,
  activeKind: null,
  sessionStartMs: null,
  selfBonusCount: 0,
  expBonusClaimed: [],
  activityExpPopupEnabled: false,
};

let expBonusPanelOpen = false;
let todoMemoPanelOpen = false;
let thinkingSettingsPanelOpen = false;
let pendingExpBonusClaimExp = null;
const EXERCISE_EXP_PER_TICK = 0.1;
let thinkingTimerMode = "self";
let activityTimerMode = "memo";
let activitySessionExpTicksClaimed = 0;
const activityExpPopupTimers = {};

const ACTIVITY_EXP_TICK_SEC = 6;
const SELF_EXP_PER_TICK = 0.1;
const MEDITATION_EXP_PER_TICK = 0.1;
const MEMO_EXP_PER_TICK = 0.15;

const THINKING_DETAIL_BTN_LABELS = {
  self: "詳",
  blame: "詳",
  task: "現在の課題",
  habit: "習慣",
};

function loadThinkingTimeState() {
  try {
    const raw = localStorage.getItem(getStorageKey('state'));
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.selfTotalSec != null) thinkingTimeState.selfTotalSec = Math.max(0, Math.floor(parsed.selfTotalSec));
    if (parsed.blameTotalSec != null) thinkingTimeState.blameTotalSec = Math.max(0, Math.floor(parsed.blameTotalSec));
    if (parsed.memoTotalSec != null) thinkingTimeState.memoTotalSec = Math.max(0, Math.floor(parsed.memoTotalSec));
    if (parsed.meditationTotalSec != null) thinkingTimeState.meditationTotalSec = Math.max(0, Math.floor(parsed.meditationTotalSec));
    if (parsed.exerciseTotalSec != null) thinkingTimeState.exerciseTotalSec = Math.max(0, Math.floor(parsed.exerciseTotalSec));
    if (parsed.memoExp != null) thinkingTimeState.memoExp = roundExpTwoDecimal(Number(parsed.memoExp));
    if (parsed.meditationExp != null) thinkingTimeState.meditationExp = roundExpOneDecimal(Number(parsed.meditationExp));
    if (parsed.exerciseExp != null) thinkingTimeState.exerciseExp = roundExpOneDecimal(Number(parsed.exerciseExp));
    if (parsed.selfExp != null) thinkingTimeState.selfExp = roundExpOneDecimal(Number(parsed.selfExp));
    if (parsed.activityExpPopupEnabled != null) thinkingTimeState.activityExpPopupEnabled = !!parsed.activityExpPopupEnabled;
    if (Array.isArray(parsed.expBonusClaimed)) {
      thinkingTimeState.expBonusClaimed = parsed.expBonusClaimed
        .map(n => Math.floor(Number(n)))
        .filter(n => Number.isFinite(n) && n > 0);
    }
    if (parsed.selfBonusCount != null) {
      thinkingTimeState.selfBonusCount = Math.max(0, Math.floor(parsed.selfBonusCount));
    } else if (parsed.selfTotalSec != null) {
      thinkingTimeState.selfBonusCount = Math.floor(Math.max(0, parsed.selfTotalSec) / SELF_THINKING_BONUS_INTERVAL_SEC);
    }
    if (ALL_TIMER_KINDS.has(parsed.activeKind)) {
      thinkingTimeState.activeKind = parsed.activeKind;
      thinkingTimeState.sessionStartMs = parsed.sessionStartMs || Date.now();
    }
    if (parsed.activitySessionExpTicksClaimed != null) {
      activitySessionExpTicksClaimed = Math.max(0, Math.floor(parsed.activitySessionExpTicksClaimed));
    } else if (parsed.activitySessionExpClaimed != null && SESSION_EXP_KINDS.has(thinkingTimeState.activeKind)) {
      const kind = thinkingTimeState.activeKind;
      activitySessionExpTicksClaimed = Math.round(Number(parsed.activitySessionExpClaimed) / getSessionExpPerTick(kind));
    } else if (SESSION_EXP_KINDS.has(thinkingTimeState.activeKind)) {
      activitySessionExpTicksClaimed = getActivityExpTicks(
        getThinkingSessionElapsedSec(thinkingTimeState.activeKind)
      );
    }
  } catch (e) {
    console.warn("思考タイム読込失敗:", e);
  }
}

function saveThinkingTimeState() {
  try {
    localStorage.setItem(getStorageKey('state'), JSON.stringify({
      selfTotalSec: thinkingTimeState.selfTotalSec,
      blameTotalSec: thinkingTimeState.blameTotalSec,
      memoTotalSec: thinkingTimeState.memoTotalSec,
      meditationTotalSec: thinkingTimeState.meditationTotalSec,
      exerciseTotalSec: thinkingTimeState.exerciseTotalSec,
      memoExp: thinkingTimeState.memoExp || 0,
      meditationExp: thinkingTimeState.meditationExp || 0,
      exerciseExp: thinkingTimeState.exerciseExp || 0,
      selfExp: thinkingTimeState.selfExp || 0,
      expBonusClaimed: thinkingTimeState.expBonusClaimed || [],
      activityExpPopupEnabled: !!thinkingTimeState.activityExpPopupEnabled,
      activeKind: thinkingTimeState.activeKind,
      sessionStartMs: thinkingTimeState.sessionStartMs,
      selfBonusCount: thinkingTimeState.selfBonusCount || 0,
      activitySessionExpTicksClaimed: SESSION_EXP_KINDS.has(thinkingTimeState.activeKind)
        ? (activitySessionExpTicksClaimed || 0) : 0,
    }));
  } catch (e) {
    console.warn("思考タイム保存失敗:", e);
  }
}

function getThinkingTotalSec(kind) {
  if (kind === "self") return thinkingTimeState.selfTotalSec;
  if (kind === "blame") return thinkingTimeState.blameTotalSec;
  if (kind === "memo") return thinkingTimeState.memoTotalSec;
  if (kind === "meditation") return thinkingTimeState.meditationTotalSec;
  if (kind === "exercise") return thinkingTimeState.exerciseTotalSec;
  return 0;
}

function setThinkingTotalSec(kind, sec) {
  if (kind === "self") thinkingTimeState.selfTotalSec = sec;
  else if (kind === "blame") thinkingTimeState.blameTotalSec = sec;
  else if (kind === "memo") thinkingTimeState.memoTotalSec = sec;
  else if (kind === "meditation") thinkingTimeState.meditationTotalSec = sec;
  else if (kind === "exercise") thinkingTimeState.exerciseTotalSec = sec;
}

function getActivityExp(kind) {
  if (kind === "self") return thinkingTimeState.selfExp || 0;
  if (kind === "memo") return thinkingTimeState.memoExp || 0;
  if (kind === "meditation") return thinkingTimeState.meditationExp || 0;
  if (kind === "exercise") return thinkingTimeState.exerciseExp || 0;
  return 0;
}

function addActivityExp(kind, gained) {
  if (gained <= 0) return;
  if (kind === "self") thinkingTimeState.selfExp = roundExpOneDecimal((thinkingTimeState.selfExp || 0) + gained);
  else if (kind === "memo") thinkingTimeState.memoExp = roundExpTwoDecimal((thinkingTimeState.memoExp || 0) + gained);
  else if (kind === "meditation") thinkingTimeState.meditationExp = roundExpOneDecimal((thinkingTimeState.meditationExp || 0) + gained);
  else if (kind === "exercise") thinkingTimeState.exerciseExp = roundExpOneDecimal((thinkingTimeState.exerciseExp || 0) + gained);
}

function isActivityExpPopupEnabled() {
  return !!thinkingTimeState.activityExpPopupEnabled;
}

function setActivityExpPopupEnabled(enabled) {
  thinkingTimeState.activityExpPopupEnabled = !!enabled;
  const toggle = document.getElementById("activity-exp-popup-toggle");
  if (toggle) toggle.checked = !!enabled;
  if (!enabled) {
    ["self", "memo", "meditation", "exercise"].forEach(hideActivityExpPopup);
  }
  saveThinkingTimeState();
  syncThinkingTimeUi();
}

function toggleThinkingSettingsPanel() {
  thinkingSettingsPanelOpen = !thinkingSettingsPanelOpen;
  const panel = document.getElementById("thinking-settings-panel");
  const btn = document.getElementById("thinking-settings-btn");
  if (panel) panel.hidden = !thinkingSettingsPanelOpen;
  if (btn) btn.classList.toggle("open", thinkingSettingsPanelOpen);
  if (thinkingSettingsPanelOpen) {
    const toggle = document.getElementById("activity-exp-popup-toggle");
    if (toggle) toggle.checked = isActivityExpPopupEnabled();
    renderSyncGuideSettings();
  }
}

function renderSyncGuideSettings() {
  const wrap = document.getElementById("txs-sync-guide-wrap");
  if (!wrap) return;
  const guide = cfg.syncGuide;
  if (!guide) {
    wrap.hidden = true;
    wrap.innerHTML = "";
    return;
  }
  wrap.hidden = false;
  const target = guide.targetLabel || "別ゲーム";
  const batName = guide.batFileName || "sync-training-exp.bat";
  const folderHint = guide.sourceFolderLabel || "dq10_battle フォルダ";
  const dest = guide.destHint || "";
  const copied = (guide.copiedFiles || ["training-exp-system.js", "training-exp-system.css"])
    .map(f => `<li>${f}</li>`).join("");
  const notCopied = (guide.notCopied || []).map(t => `<li>${t}</li>`).join("");
  wrap.innerHTML = `
    <div class="txs-sync-guide-block">
      <div class="txs-sync-guide-title">${target} へシステム反映</div>
      <p class="txs-sync-guide-steps-title">いちばん簡単なやり方（コピー不要）</p>
      <ol class="txs-sync-guide-steps">
        <li>エクスプローラーで <strong>${folderHint}</strong> を開く</li>
        <li><strong>${batName}</strong> をダブルクリック</li>
        <li><code>[OK]</code> が出たら、${target} のブラウザで <strong>F5</strong>（再読み込み）</li>
      </ol>
      ${dest ? `<p class="txs-sync-guide-dest">反映先: <code>${dest}</code></p>` : ""}
      <p class="txs-sync-guide-copy-hint">bat の場所が分からないとき →</p>
      <button type="button" class="txs-sync-guide-btn" data-txs="copy-sync-bat">${batName} のパスをコピー</button>
      <details class="txs-sync-guide-details">
        <summary>コピーされる／されないもの</summary>
        <div class="txs-sync-guide-columns">
          <div>
            <p class="txs-sync-guide-subtitle">✓ bat でコピーされる</p>
            <ul>${copied}</ul>
          </div>
          <div>
            <p class="txs-sync-guide-subtitle">✗ コピーされない（各ゲーム専用）</p>
            <ul>${notCopied || "<li>（bridge・React組込など）</li>"}</ul>
          </div>
        </div>
      </details>
    </div>`;
}

function copySyncBatPath() {
  const guide = cfg.syncGuide;
  if (!guide || !guide.batPath) {
    showThinkingTimeToast("同期設定がありません", "#f88");
    return;
  }
  const batName = guide.batFileName || "sync-training-exp.bat";
  const target = guide.targetLabel || "別ゲーム";
  const text = guide.batPath;
  const onOk = () => {
    showThinkingTimeToast(
      `★ ${batName} のパスをコピーしました。エクスプローラーでダブルクリック → ${target} に反映 ★`,
      "#8cf"
    );
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onOk).catch(() => {
      showThinkingTimeToast(`bat: ${text}`, "#ffd966");
    });
  } else {
    showThinkingTimeToast(`bat: ${text}`, "#ffd966");
  }
}

function hideActivityExpPopup(kind) {
  const el = document.getElementById(`thinking-${kind}-exp-popup`);
  if (!el) return;
  el.classList.remove("show", "bump");
  el.textContent = "";
  if (activityExpPopupTimers[kind]) {
    clearTimeout(activityExpPopupTimers[kind]);
    activityExpPopupTimers[kind] = null;
  }
}

function showActivityExpPopup(kind, sessionTotal) {
  const el = document.getElementById(`thinking-${kind}-exp-popup`);
  if (!el) return;
  if (sessionTotal <= 0) {
    hideActivityExpPopup(kind);
    return;
  }
  el.textContent = `EXP+${formatActivityExpDisplay(kind, sessionTotal)}`;
  el.classList.add("show");
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
  if (activityExpPopupTimers[kind]) clearTimeout(activityExpPopupTimers[kind]);
  activityExpPopupTimers[kind] = setTimeout(() => hideActivityExpPopup(kind), 2200);
}

function tickActivitySessionExp() {
  const kind = thinkingTimeState.activeKind;
  if (!SESSION_EXP_KINDS.has(kind)) return;
  const elapsed = getThinkingSessionElapsedSec(kind);
  const ticks = getActivityExpTicks(elapsed);
  const deltaTicks = ticks - activitySessionExpTicksClaimed;
  if (deltaTicks <= 0) return;
  activitySessionExpTicksClaimed = ticks;
  const perTick = getSessionExpPerTick(kind);
  const delta = deltaTicks * perTick;
  addActivityExp(kind, delta);
  if (isActivityExpPopupEnabled()) {
    showActivityExpPopup(kind, calcActivityExpGain(kind, elapsed));
  }
  saveThinkingTimeState();
}

function getSessionExpPerTick(kind) {
  if (kind === "memo") return MEMO_EXP_PER_TICK;
  if (kind === "self") return SELF_EXP_PER_TICK;
  if (kind === "meditation") return MEDITATION_EXP_PER_TICK;
  if (kind === "exercise") return EXERCISE_EXP_PER_TICK;
  return 0;
}

function roundExpOneDecimal(n) {
  return Math.round(Math.max(0, n) * 10) / 10;
}

function roundExpTwoDecimal(n) {
  return Math.round(Math.max(0, n) * 100) / 100;
}

function getActivityExpTicks(elapsedSec) {
  if (elapsedSec < ACTIVITY_EXP_TICK_SEC) return 0;
  return Math.floor(elapsedSec / ACTIVITY_EXP_TICK_SEC);
}

function formatTotalExpDisplay(value) {
  return roundExpTwoDecimal(Math.max(0, value)).toFixed(2).replace(".", ",");
}

function getTotalActivityExp() {
  return roundExpTwoDecimal(
    (thinkingTimeState.selfExp || 0)
    + (thinkingTimeState.memoExp || 0)
    + (thinkingTimeState.meditationExp || 0)
    + (thinkingTimeState.exerciseExp || 0)
  );
}

function getExpBonusMilestone(exp) {
  return cfg.milestones.find(m => m.exp === exp) || null;
}

function getExpBonusRewardBtnClass(milestone) {
  if (milestone.type === "companion") return "companion";
  if (milestone.type === "future_companion") return "future";
  if (milestone.ultraRare) return "ultra-rare";
  return "";
}

function isExpBonusMilestoneClaimable(milestone) {
  return milestone && milestone.type !== "future_companion";
}

function isExpBonusTrialOnce(milestone) {
  return !!(milestone && milestone.trialOnce);
}

function isExpBonusMilestoneReady(milestone, total) {
  if (!milestone || isExpBonusClaimed(milestone.exp)) return false;
  if (!isExpBonusMilestoneClaimable(milestone)) return false;
  if (isExpBonusTrialOnce(milestone)) return true;
  return total >= milestone.exp;
}

function formatExpBonusRewardHtml(milestone) {
  const notes = [];
  if (milestone.trialOnceNote) notes.push(milestone.trialOnceNote);
  if (milestone.ownerNote) notes.push(milestone.ownerNote);
  const note = notes.length
    ? `<span class="exp-bonus-owner-note">（${notes.join("·")}）</span>`
    : "";
  return `${milestone.rewardLabel}${note}`;
}

function isExpBonusClaimed(exp) {
  const milestone = getExpBonusMilestone(exp);
  if (milestone && isExpBonusTrialOnce(milestone) && milestone.type === "companion"
      && milestone.companionId && !cfg.hasCompanion(milestone.companionId)) {
    return false;
  }
  return (thinkingTimeState.expBonusClaimed || []).includes(exp);
}

function tryAssignExpBonusDrop(milestone) {
  if (typeof cfg.tryAssignItemDrop === "function") return cfg.tryAssignItemDrop(milestone);
  return { role: null, message: milestone.name || milestone.rewardLabel || "" };
}

function claimExpBonusMilestone(milestone) {
  if (isExpBonusClaimed(milestone.exp)) return false;
  if (!isExpBonusMilestoneClaimable(milestone)) return false;
  let message = "";
  if (milestone.type === "companion") {
    if (cfg.hasCompanion(milestone.companionId)) {
      message = `${milestone.rewardLabel}（既に仲間）`;
    } else if (cfg.unlockCompanion(milestone.companionId)) {
      message = `★ ${milestone.rewardLabel}が仲間に加わった！ ★`;
    } else {
      message = `${milestone.rewardLabel}を解放`;
    }
  } else {
    const assigned = tryAssignExpBonusDrop(milestone);
    message = assigned
      ? `★ EXP${milestone.exp}達成！ ${milestone.ultraRare ? "超レア！" : ""}${assigned.message} ★`
      : `★ EXP${milestone.exp}達成！ ${milestone.rewardLabel} ★`;
  }
  if (!thinkingTimeState.expBonusClaimed) thinkingTimeState.expBonusClaimed = [];
  if (!thinkingTimeState.expBonusClaimed.includes(milestone.exp)) {
    thinkingTimeState.expBonusClaimed.push(milestone.exp);
  }
  showThinkingTimeToast(message, "#ffd966");
  saveThinkingTimeState();
  return true;
}

function requestExpBonusClaim(exp) {
  const milestone = getExpBonusMilestone(exp);
  if (!milestone || isExpBonusClaimed(exp)) return;
  if (!isExpBonusMilestoneClaimable(milestone)) return;
  if (!isExpBonusTrialOnce(milestone) && getTotalActivityExp() < exp) return;
  pendingExpBonusClaimExp = exp;
  const msgEl = document.getElementById("exp-bonus-confirm-message");
  const backdrop = document.getElementById("exp-bonus-confirm");
  if (msgEl) {
    msgEl.textContent = isExpBonusTrialOnce(milestone)
      ? `「${milestone.rewardLabel}」をゲットしますか？（今回のみ・EXP不要）`
      : `EXP${exp}p使って「${milestone.rewardLabel}」をゲットしますか？`;
  }
  if (backdrop) backdrop.classList.add("open");
}

function closeExpBonusConfirm() {
  pendingExpBonusClaimExp = null;
  const backdrop = document.getElementById("exp-bonus-confirm");
  if (backdrop) backdrop.classList.remove("open");
}

function confirmExpBonusClaim() {
  const exp = pendingExpBonusClaimExp;
  closeExpBonusConfirm();
  const milestone = getExpBonusMilestone(exp);
  if (!milestone || isExpBonusClaimed(exp)) return;
  if (!isExpBonusTrialOnce(milestone) && getTotalActivityExp() < exp) return;
  if (claimExpBonusMilestone(milestone)) {
    if (typeof cfg.onAfterClaim === "function") cfg.onAfterClaim(milestone);
    syncExpBonusUi();
    syncThinkingTimeUi();
  }
}

function renderExpBonusTable() {
  const list = document.getElementById("thinking-exp-bonus-list");
  if (!list) return;
  const total = getTotalActivityExp();
  const sorted = [...cfg.milestones].sort((a, b) => a.exp - b.exp);
  list.innerHTML = sorted.map(milestone => {
    const claimed = isExpBonusClaimed(milestone.exp);
    const claimable = isExpBonusMilestoneClaimable(milestone);
    const ready = isExpBonusMilestoneReady(milestone, total);
    const remain = Math.max(0, roundExpTwoDecimal(milestone.exp - total));
    let status;
    if (claimed) status = "受取済";
    else if (!claimable && total >= milestone.exp) status = "準備中";
    else if (ready && isExpBonusTrialOnce(milestone)) status = "ゲット可（今回のみ）";
    else if (ready) status = "ゲット可";
    else status = `あと${formatTotalExpDisplay(remain)}`;
    const rowClass = [
      claimed ? "claimed" : "",
      ready ? "ready" : "",
      milestone.type === "future_companion" ? "future" : "",
    ].filter(Boolean).join(" ");
    const btnClass = getExpBonusRewardBtnClass(milestone);
    const rewardText = formatExpBonusRewardHtml(milestone);
    let rewardHtml;
    if (claimed) {
      rewardHtml = `<span class="exp-bonus-reward ${btnClass}">${rewardText}</span>`;
    } else if (ready) {
      rewardHtml = `<button type="button" class="exp-bonus-reward-btn ${btnClass}" data-txs="claim-exp" data-exp="${milestone.exp}">${rewardText}</button>`;
    } else {
      rewardHtml = `<span class="exp-bonus-reward ${btnClass}">${rewardText}</span>`;
    }
    return `<div class="exp-bonus-row ${rowClass}">
      <span class="exp-bonus-pts">${milestone.exp} EXP</span>
      ${rewardHtml}
      <span class="exp-bonus-status">${status}</span>
    </div>`;
  }).join("");
}

function toggleExpBonusPanel() {
  expBonusPanelOpen = !expBonusPanelOpen;
  if (expBonusPanelOpen) {
    todoMemoPanelOpen = false;
    const todoPanel = document.getElementById("thinking-todo-memo-panel");
    const todoBtn = document.getElementById("thinking-todo-memo-btn");
    if (todoPanel) todoPanel.hidden = true;
    if (todoBtn) todoBtn.classList.remove("open");
  }
  const panel = document.getElementById("thinking-exp-bonus-panel");
  const btn = document.getElementById("thinking-exp-bonus-btn");
  if (panel) panel.hidden = !expBonusPanelOpen;
  if (btn) btn.classList.toggle("open", expBonusPanelOpen);
  if (expBonusPanelOpen) renderExpBonusTable();
}

function toggleTodoMemoPanel() {
  todoMemoPanelOpen = !todoMemoPanelOpen;
  if (todoMemoPanelOpen) {
    expBonusPanelOpen = false;
    const bonusPanel = document.getElementById("thinking-exp-bonus-panel");
    const bonusBtn = document.getElementById("thinking-exp-bonus-btn");
    if (bonusPanel) bonusPanel.hidden = true;
    if (bonusBtn) bonusBtn.classList.remove("open");
  }
  const panel = document.getElementById("thinking-todo-memo-panel");
  const btn = document.getElementById("thinking-todo-memo-btn");
  if (panel) panel.hidden = !todoMemoPanelOpen;
  if (btn) btn.classList.toggle("open", todoMemoPanelOpen);
}

function syncExpBonusUi() {
  const total = getTotalActivityExp();
  const totalEl = document.getElementById("thinking-total-exp");
  const breakdownEl = document.getElementById("thinking-total-exp-breakdown");
  if (totalEl) totalEl.textContent = formatTotalExpDisplay(total);
  if (breakdownEl) {
    breakdownEl.textContent = `（自力${formatActivityExpDisplay("self", thinkingTimeState.selfExp || 0)}＋メモ${formatActivityExpDisplay("memo", thinkingTimeState.memoExp || 0)}＋瞑想${formatActivityExpDisplay("meditation", thinkingTimeState.meditationExp || 0)}＋運動${formatActivityExpDisplay("exercise", thinkingTimeState.exerciseExp || 0)}）`;
  }
  if (expBonusPanelOpen) renderExpBonusTable();
  syncFoldSummary();
}

function formatActivityExpDisplay(kind, value) {
  const v = Math.max(0, value);
  if (kind === "memo") return roundExpTwoDecimal(v).toFixed(2).replace(".", ",");
  return roundExpOneDecimal(v).toFixed(1).replace(".", ",");
}

function calcActivityExpGain(kind, elapsedSec) {
  const ticks = getActivityExpTicks(elapsedSec);
  if (ticks <= 0) return 0;
  return ticks * getSessionExpPerTick(kind);
}

const ACTIVITY_EXP_LABELS = { memo: "メモ整理", meditation: "瞑想" };

function getThinkingSessionElapsedSec(kind) {
  if (thinkingTimeState.activeKind !== kind || !thinkingTimeState.sessionStartMs) return 0;
  return Math.max(0, Math.floor((Date.now() - thinkingTimeState.sessionStartMs) / 1000));
}

function formatThinkingCurrentSec(sec) {
  return `${Math.max(0, Math.floor(sec))}秒`;
}

function getSelfThinkingCombinedSec() {
  return getThinkingTotalSec("self") + getThinkingSessionElapsedSec("self");
}

function showThinkingTimeToast(msg, color) {
  const el = document.getElementById("thinking-time-toast");
  if (!el) return;
  el.textContent = msg;
  el.style.color = color || "#ffd966";
}

function checkSelfThinkingHourlyBonus() {
  const combined = getSelfThinkingCombinedSec();
  const milestones = Math.floor(combined / SELF_THINKING_BONUS_INTERVAL_SEC);
  const claimed = thinkingTimeState.selfBonusCount || 0;
  if (milestones <= claimed) return 0;
  const earned = milestones - claimed;
  thinkingTimeState.selfBonusCount = milestones;
  saveThinkingTimeState();
  const msg = earned === 1
    ? "★ 自力思考1時間達成！ ボーナス +1 ★"
    : `★ 自力思考${earned}時間分のボーナス！ +${earned} ★`;
  showThinkingTimeToast(msg, "#ffd966");
  return earned;
}

function getSelfThinkingNextBonusSec() {
  const combined = getSelfThinkingCombinedSec();
  if (combined <= 0) return SELF_THINKING_BONUS_INTERVAL_SEC;
  const remain = SELF_THINKING_BONUS_INTERVAL_SEC - (combined % SELF_THINKING_BONUS_INTERVAL_SEC);
  return remain === SELF_THINKING_BONUS_INTERVAL_SEC ? 0 : remain;
}

let thinkingTimeIntervalId = null;

function startThinkingTimerTick() {
  stopThinkingTimerTick();
  thinkingTimeIntervalId = setInterval(() => {
    if (!thinkingTimeState.activeKind) {
      stopThinkingTimerTick();
      return;
    }
    if (SESSION_EXP_KINDS.has(thinkingTimeState.activeKind)) tickActivitySessionExp();
    syncThinkingTimeUi();
  }, 1000);
}

function stopThinkingTimerTick() {
  if (thinkingTimeIntervalId != null) {
    clearInterval(thinkingTimeIntervalId);
    thinkingTimeIntervalId = null;
  }
}

function stopThinkingTimer(kind, addToTotal) {
  if (thinkingTimeState.activeKind !== kind) return 0;
  const elapsed = getThinkingSessionElapsedSec(kind);
  if (addToTotal) {
    setThinkingTotalSec(kind, getThinkingTotalSec(kind) + elapsed);
    if (kind === "self") checkSelfThinkingHourlyBonus();
    if (SESSION_EXP_KINDS.has(kind)) {
      tickActivitySessionExp();
      activitySessionExpTicksClaimed = 0;
    }
  }
  thinkingTimeState.activeKind = null;
  thinkingTimeState.sessionStartMs = null;
  saveThinkingTimeState();
  if (!thinkingTimeState.activeKind) stopThinkingTimerTick();
  return elapsed;
}

function startThinkingTimer(kind) {
  if (thinkingTimeState.activeKind && thinkingTimeState.activeKind !== kind) {
    stopThinkingTimer(thinkingTimeState.activeKind, true);
  }
  thinkingTimeState.activeKind = kind;
  thinkingTimeState.sessionStartMs = Date.now();
  if (SESSION_EXP_KINDS.has(kind)) activitySessionExpTicksClaimed = 0;
  saveThinkingTimeState();
  syncThinkingTimeUi();
  startThinkingTimerTick();
}

function formatBonusRemainMinutes(sec) {
  if (sec <= 0) return "ボーナスまであと少し";
  const m = Math.max(1, Math.ceil(sec / 60));
  return `ボーナスまで${m}分`;
}

function selectThinkingMode(mode) {
  if (!THINKING_TIMER_KINDS.has(mode)) return;
  thinkingTimerMode = mode;
  syncThinkingTimeUi();
}

function selectActivityMode(mode) {
  if (!MEMO_MEDITATION_KINDS.has(mode)) return;
  activityTimerMode = mode;
  syncThinkingTimeUi();
}

function toggleThinkingTimerUnified() {
  if (thinkingTimeState.activeKind && THINKING_TIMER_KINDS.has(thinkingTimeState.activeKind)) {
    stopThinkingTimer(thinkingTimeState.activeKind, true);
  } else {
    if (thinkingTimeState.activeKind) stopThinkingTimer(thinkingTimeState.activeKind, true);
    startThinkingTimer(thinkingTimerMode);
  }
  syncThinkingTimeUi();
}

function toggleActivityTimerUnified() {
  if (thinkingTimeState.activeKind && MEMO_MEDITATION_KINDS.has(thinkingTimeState.activeKind)) {
    stopThinkingTimer(thinkingTimeState.activeKind, true);
  } else {
    if (thinkingTimeState.activeKind) stopThinkingTimer(thinkingTimeState.activeKind, true);
    startThinkingTimer(activityTimerMode);
  }
  syncThinkingTimeUi();
}

function toggleExerciseTimerUnified() {
  if (thinkingTimeState.activeKind === "exercise") {
    stopThinkingTimer("exercise", true);
  } else {
    if (thinkingTimeState.activeKind) stopThinkingTimer(thinkingTimeState.activeKind, true);
    startThinkingTimer("exercise");
  }
  syncThinkingTimeUi();
}

function toggleThinkingTimer(kind) {
  if (thinkingTimeState.activeKind === kind) {
    stopThinkingTimer(kind, true);
  } else {
    startThinkingTimer(kind);
  }
  syncThinkingTimeUi();
}

function toggleThinkingDetail(kind) {
  const panel = document.getElementById(`thinking-${kind}-detail`);
  const btn = document.getElementById(`thinking-${kind}-detail-btn`);
  if (!panel) return;
  const open = !panel.classList.contains("open");
  panel.classList.toggle("open", open);
  if (btn) {
    btn.classList.toggle("open", open);
    const label = THINKING_DETAIL_BTN_LABELS[kind] || "詳細";
    btn.textContent = open ? `${label}▲` : label;
  }
}



function loadUserMemosRaw() {
  try {
    const raw = localStorage.getItem(getStorageKey('memos'));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    console.warn("メモ読込失敗:", e);
    return {};
  }
}

function getUserMemo(key) {
  const saved = loadUserMemosRaw()[key];
  if (saved != null) return saved;
  return cfg.defaultMemos[key] || "";
}

function saveUserMemo(key, text) {
  const memos = loadUserMemosRaw();
  memos[key] = text;
  try {
    localStorage.setItem(getStorageKey('memos'), JSON.stringify(memos));
  } catch (e) {
    console.warn("メモ保存失敗:", e);
  }
}

const USER_MEMO_LABELS = {
  self: "自力思考",
  blame: "他責思考",
  task: "現在の課題",
  habit: "習慣",
};
let pendingMemoCancelKey = null;

function saveUserMemoFromEditor(key) {
  const el = document.getElementById(`memo-editor-${key}`);
  if (!el) return;
  saveUserMemo(key, el.value);
  const label = USER_MEMO_LABELS[key] || "メモ";
  showThinkingTimeToast(`${label}を保存しました`, "#8cf");
}

function cancelUserMemoEdit(key) {
  const el = document.getElementById(`memo-editor-${key}`);
  if (!el) return;
  pendingMemoCancelKey = key;
  const dialog = document.getElementById("memo-cancel-confirm");
  if (dialog) dialog.classList.add("open");
}

function closeMemoCancelConfirm() {
  pendingMemoCancelKey = null;
  const dialog = document.getElementById("memo-cancel-confirm");
  if (dialog) dialog.classList.remove("open");
}

function confirmUserMemoCancel() {
  const key = pendingMemoCancelKey;
  closeMemoCancelConfirm();
  if (!key) return;
  const el = document.getElementById(`memo-editor-${key}`);
  if (!el) return;
  el.value = getUserMemo(key);
}

function loadTodoMemo() {
  try {
    const raw = localStorage.getItem(getStorageKey('todo'));
    return raw != null ? raw : "";
  } catch (e) {
    console.warn("やることメモ読込失敗:", e);
    return "";
  }
}

function saveTodoMemo(text) {
  try {
    localStorage.setItem(getStorageKey('todo'), text ?? "");
  } catch (e) {
    console.warn("やることメモ保存失敗:", e);
  }
}

function initTodoMemoEditor() {
  const el = document.getElementById("todo-memo-editor");
  if (el) el.value = loadTodoMemo();
}

function saveTodoMemoFromEditor() {
  const el = document.getElementById("todo-memo-editor");
  if (!el) return;
  saveTodoMemo(el.value);
  showThinkingTimeToast("やることメモを保存しました", "#8cf");
}

function cancelTodoMemoEdit() {
  const el = document.getElementById("todo-memo-editor");
  if (!el) return;
  el.value = loadTodoMemo();
  showThinkingTimeToast("やることメモを元に戻しました", "#aaa");
}

function initUserMemoEditors() {
  Object.keys(cfg.defaultMemos).forEach(key => {
    const el = document.getElementById(`memo-editor-${key}`);
    if (el) el.value = getUserMemo(key);
  });
  initTodoMemoEditor();
}

function syncThinkingTimeUi() {
  const highlightThinking = thinkingTimeState.activeKind && THINKING_TIMER_KINDS.has(thinkingTimeState.activeKind)
    ? thinkingTimeState.activeKind
    : thinkingTimerMode;
  ["self", "blame"].forEach(kind => {
    const modeBtn = document.getElementById(`thinking-mode-${kind}`);
    const curEl = document.getElementById(`thinking-${kind}-current`);
    const totalEl = document.getElementById(`thinking-${kind}-total`);
    const running = thinkingTimeState.activeKind === kind;
    const currentSec = running ? getThinkingSessionElapsedSec(kind) : 0;
    const totalSec = getThinkingTotalSec(kind);
    if (modeBtn) modeBtn.classList.toggle("selected", highlightThinking === kind);
    if (curEl) curEl.textContent = formatThinkingCurrentSec(currentSec);
    if (totalEl) totalEl.textContent = cfg.formatDuration(totalSec);
    if (kind === "self") {
      const expEl = document.getElementById("thinking-self-exp");
      if (expEl) expEl.textContent = formatActivityExpDisplay("self", getActivityExp("self"));
      const sessionExpEl = document.getElementById("thinking-self-session-exp");
      if (sessionExpEl) {
        const sessionExp = running ? calcActivityExpGain("self", currentSec) : 0;
        sessionExpEl.textContent = sessionExp > 0 ? ` EXP+${formatActivityExpDisplay("self", sessionExp)}` : "";
      }
    }
  });
  const highlightActivity = thinkingTimeState.activeKind && MEMO_MEDITATION_KINDS.has(thinkingTimeState.activeKind)
    ? thinkingTimeState.activeKind
    : activityTimerMode;
  ["memo", "meditation"].forEach(kind => {
    const modeBtn = document.getElementById(`thinking-mode-${kind}`);
    const curEl = document.getElementById(`thinking-${kind}-current`);
    const totalEl = document.getElementById(`thinking-${kind}-total`);
    const expEl = document.getElementById(`thinking-${kind}-exp`);
    const running = thinkingTimeState.activeKind === kind;
    const currentSec = running ? getThinkingSessionElapsedSec(kind) : 0;
    const totalSec = getThinkingTotalSec(kind);
    if (modeBtn) modeBtn.classList.toggle("selected", highlightActivity === kind);
    if (curEl) curEl.textContent = formatThinkingCurrentSec(currentSec);
    if (totalEl) totalEl.textContent = cfg.formatDuration(totalSec);
    if (expEl) expEl.textContent = formatActivityExpDisplay(kind, getActivityExp(kind));
    const sessionExpEl = document.getElementById(`thinking-${kind}-session-exp`);
    if (sessionExpEl) {
      const sessionExp = running && thinkingTimeState.activeKind === kind
        ? calcActivityExpGain(kind, currentSec) : 0;
      if (sessionExp > 0) {
        sessionExpEl.textContent = ` EXP+${formatActivityExpDisplay(kind, sessionExp)}`;
      } else {
        sessionExpEl.textContent = "";
      }
    }
  });
  {
    const kind = "exercise";
    const modeBtn = document.getElementById(`thinking-mode-${kind}`);
    const curEl = document.getElementById(`thinking-${kind}-current`);
    const totalEl = document.getElementById(`thinking-${kind}-total`);
    const expEl = document.getElementById(`thinking-${kind}-exp`);
    const exerciseBtn = document.getElementById("thinking-exercise-btn");
    const running = thinkingTimeState.activeKind === kind;
    const currentSec = running ? getThinkingSessionElapsedSec(kind) : 0;
    const totalSec = getThinkingTotalSec(kind);
    if (modeBtn) modeBtn.classList.toggle("selected", running);
    if (curEl) curEl.textContent = formatThinkingCurrentSec(currentSec);
    if (totalEl) totalEl.textContent = cfg.formatDuration(totalSec);
    if (expEl) expEl.textContent = formatActivityExpDisplay(kind, getActivityExp(kind));
    const sessionExpEl = document.getElementById(`thinking-${kind}-session-exp`);
    if (sessionExpEl) {
      const sessionExp = running ? calcActivityExpGain(kind, currentSec) : 0;
      sessionExpEl.textContent = sessionExp > 0 ? ` EXP+${formatActivityExpDisplay(kind, sessionExp)}` : "";
    }
    if (exerciseBtn) {
      exerciseBtn.textContent = running ? "停止" : "スタート";
      exerciseBtn.classList.toggle("running", running);
    }
  }
  const mainBtn = document.getElementById("thinking-main-btn");
  const blameStartBtn = document.getElementById("thinking-blame-start-btn");
  const thinkingRunning = THINKING_TIMER_KINDS.has(thinkingTimeState.activeKind);
  if (mainBtn) {
    mainBtn.textContent = thinkingRunning ? "停止" : "スタート";
    mainBtn.classList.toggle("running", thinkingRunning);
  }
  if (blameStartBtn) {
    const blameRunning = thinkingTimeState.activeKind === "blame";
    blameStartBtn.textContent = blameRunning ? "停止" : "スタート";
    blameStartBtn.classList.toggle("running", blameRunning);
  }
  const activityBtn = document.getElementById("thinking-activity-btn");
  if (activityBtn) {
    const running = MEMO_MEDITATION_KINDS.has(thinkingTimeState.activeKind);
    activityBtn.textContent = running ? "停止" : "スタート";
    activityBtn.classList.toggle("running", running);
  }
  const bonusEl = document.getElementById("thinking-self-bonus-count");
  if (bonusEl) bonusEl.textContent = String(thinkingTimeState.selfBonusCount || 0);
  const nextEl = document.getElementById("thinking-self-next-bonus");
  if (nextEl) {
    const remain = getSelfThinkingNextBonusSec();
    if (remain <= 0 && getSelfThinkingCombinedSec() > 0) {
      nextEl.textContent = "ボーナスまであと少し";
    } else if (getSelfThinkingCombinedSec() > 0) {
      nextEl.textContent = formatBonusRemainMinutes(remain);
    } else {
      nextEl.textContent = "ボーナスまで60分";
    }
  }
  syncExpBonusUi();
}

function tickThinkingTimeUi() {
  if (!thinkingTimeState.activeKind) return;
  if (thinkingTimeState.activeKind === "self") checkSelfThinkingHourlyBonus();
  syncThinkingTimeUi();
}

  function getHtmlTemplate() {
    return `
<div id="training-exp-fold" class="trial-menu-fold txs-training-fold menu-collapsed">
  <button type="button" class="menu-fold-toggle txs-fold-toggle" aria-expanded="false">
    <span class="menu-fold-arrow" aria-hidden="true">▼</span>
    <span>🧘 修行</span>
    <span class="txs-fold-summary" id="txs-fold-summary"></span>
  </button>
  <div class="menu-fold-panel">
    <div id="trial-thinking-time-panel">
      <div class="thinking-time-main-row">
        <button type="button" class="thinking-mode-chip self selected" id="thinking-mode-self" data-txs="select-thinking" data-mode="self">自力思考</button>
        <span class="thinking-compact-stat thinking-stat-with-popup"><span id="thinking-self-current">0秒</span>/<strong id="thinking-self-total">0秒</strong><span id="thinking-self-session-exp" class="activity-session-exp self"></span><span id="thinking-self-exp-popup" class="activity-exp-popup self"></span></span>
        <span class="thinking-exp-stat">EXP<strong id="thinking-self-exp">0</strong></span>
        <span class="thinking-time-bonus-wrap">🎁<strong id="thinking-self-bonus-count">0</strong></span>
        <button type="button" id="thinking-self-detail-btn" class="thinking-time-detail-btn" data-txs="toggle-detail" data-kind="self">詳</button>
        <button type="button" id="thinking-main-btn" class="thinking-time-btn" data-txs="toggle-thinking-timer">スタート</button>
        <span class="thinking-time-next-bonus" id="thinking-self-next-bonus">ボーナスまで60分</span>
        <span class="thinking-time-sep">｜</span>
        <button type="button" class="thinking-mode-chip exercise" id="thinking-mode-exercise">運動</button>
        <span class="thinking-compact-stat thinking-stat-with-popup"><span id="thinking-exercise-current">0秒</span>/<strong id="thinking-exercise-total">0秒</strong><span id="thinking-exercise-session-exp" class="activity-session-exp exercise"></span><span id="thinking-exercise-exp-popup" class="activity-exp-popup exercise"></span></span>
        <span class="thinking-exp-stat">EXP<strong id="thinking-exercise-exp">0</strong></span>
        <button type="button" id="thinking-exercise-btn" class="thinking-time-btn" data-txs="toggle-exercise-timer">スタート</button>
      </div>
      <div class="thinking-time-main-row thinking-time-activity-row">
        <button type="button" class="thinking-mode-chip memo selected" id="thinking-mode-memo" data-txs="select-activity" data-mode="memo">メモ整理</button>
        <span class="memo-exp-bonus-note">（重要EXP1.5倍）</span>
        <span class="thinking-compact-stat thinking-stat-with-popup"><span id="thinking-memo-current">0秒</span>/<strong id="thinking-memo-total">0秒</strong><span id="thinking-memo-session-exp" class="activity-session-exp memo"></span><span id="thinking-memo-exp-popup" class="activity-exp-popup memo"></span></span>
        <span class="thinking-exp-stat">EXP<strong id="thinking-memo-exp">0</strong></span>
        <span class="thinking-time-sep">｜</span>
        <button type="button" class="thinking-mode-chip meditation" id="thinking-mode-meditation" data-txs="select-activity" data-mode="meditation">瞑想</button>
        <span class="thinking-compact-stat thinking-stat-with-popup"><span id="thinking-meditation-current">0秒</span>/<strong id="thinking-meditation-total">0秒</strong><span id="thinking-meditation-session-exp" class="activity-session-exp meditation"></span><span id="thinking-meditation-exp-popup" class="activity-exp-popup meditation"></span></span>
        <span class="thinking-exp-stat">EXP<strong id="thinking-meditation-exp">0</strong></span>
        <button type="button" id="thinking-activity-btn" class="thinking-time-btn" data-txs="toggle-activity-timer">スタート</button>
      </div>
      <div class="thinking-time-main-row thinking-time-activity-row">
        <button type="button" class="thinking-mode-chip blame" id="thinking-mode-blame" data-txs="select-thinking" data-mode="blame">他責思考</button>
        <span class="thinking-compact-stat"><span id="thinking-blame-current">0秒</span>/<strong id="thinking-blame-total">0秒</strong></span>
        <button type="button" id="thinking-blame-detail-btn" class="thinking-time-detail-btn" data-txs="toggle-detail" data-kind="blame">詳</button>
        <button type="button" id="thinking-blame-start-btn" class="thinking-time-btn" data-txs="toggle-thinking-timer">スタート</button>
      </div>
      <div class="thinking-exp-total-row">
        <span>総EXP</span>
        <strong id="thinking-total-exp">0</strong>
        <span id="thinking-total-exp-breakdown" class="thinking-exp-breakdown"></span>
        <button type="button" id="thinking-exp-bonus-btn" class="thinking-exp-bonus-btn" data-txs="toggle-bonus-panel">ボーナス表🎁</button>
        <button type="button" id="thinking-todo-memo-btn" class="thinking-todo-memo-btn" data-txs="toggle-todo-panel">やることメモ</button>
        <button type="button" id="thinking-settings-btn" class="thinking-settings-btn" data-txs="toggle-settings-panel">設定</button>
      </div>
      <div id="thinking-settings-panel" class="thinking-settings-panel" hidden>
        <label><input type="checkbox" id="activity-exp-popup-toggle" data-txs="exp-popup-toggle"> EXPポップアップ表示</label>
        <div id="txs-sync-guide-wrap" class="txs-sync-guide-wrap" hidden></div>
      </div>
      <div id="thinking-exp-bonus-panel" class="thinking-exp-bonus-panel" hidden>
        <div class="exp-bonus-title">ボーナス表🎁</div>
        <div class="exp-bonus-header">EXPボーナス → お宝 ↓</div>
        <div id="thinking-exp-bonus-list" class="exp-bonus-list"></div>
      </div>
      <div id="thinking-todo-memo-panel" class="thinking-todo-memo-panel" hidden>
        <div class="thinking-todo-memo-title-row">
          <div class="thinking-todo-memo-title">やることメモ <span class="memo-edit-hint">（編集後は保存を押す）</span></div>
          <span class="memo-detail-actions">
            <button type="button" class="memo-cancel-btn" data-txs="cancel-todo-memo">キャンセル</button>
            <button type="button" class="memo-save-btn" data-txs="save-todo-memo">保存</button>
          </span>
        </div>
        <textarea id="todo-memo-editor" class="user-memo-editor todo-memo-editor" rows="8" placeholder="やることを書いてね…"></textarea>
      </div>
      <div id="thinking-self-detail" class="thinking-time-detail self-detail">
        <div class="thinking-time-detail-title-row">
          <div class="thinking-time-detail-title">自力思考メモ <span class="memo-edit-hint">（編集後は保存を押す）</span></div>
          <span class="memo-detail-actions">
            <button type="button" class="memo-cancel-btn" data-txs="cancel-memo" data-key="self">キャンセル</button>
            <button type="button" class="memo-save-btn" data-txs="save-memo" data-key="self">保存</button>
          </span>
        </div>
        <textarea id="memo-editor-self" class="user-memo-editor" rows="7"></textarea>
      </div>
      <div id="thinking-blame-detail" class="thinking-time-detail blame-detail">
        <div class="thinking-time-detail-title-row">
          <div class="thinking-time-detail-title">他責思考メモ <span class="memo-edit-hint">（編集後は保存を押す）</span></div>
          <span class="memo-detail-actions">
            <button type="button" class="memo-cancel-btn" data-txs="cancel-memo" data-key="blame">キャンセル</button>
            <button type="button" class="memo-save-btn" data-txs="save-memo" data-key="blame">保存</button>
          </span>
        </div>
        <textarea id="memo-editor-blame" class="user-memo-editor" rows="8"></textarea>
      </div>
      <div id="thinking-time-toast"></div>
      <div class="thinking-time-sub-row">
        <button type="button" id="thinking-habit-detail-btn" class="thinking-sub-btn habit-btn" data-txs="toggle-detail" data-kind="habit">習慣</button>
        <button type="button" id="thinking-task-detail-btn" class="thinking-sub-btn task-btn" data-txs="toggle-detail" data-kind="task">現在の課題</button>
      </div>
      <div id="thinking-task-detail" class="thinking-time-detail task-detail">
        <div class="thinking-time-detail-title-row">
          <div class="thinking-time-detail-title">現在の課題 <span class="memo-edit-hint">（編集後は保存を押す）</span></div>
          <span class="memo-detail-actions">
            <button type="button" class="memo-cancel-btn" data-txs="cancel-memo" data-key="task">キャンセル</button>
            <button type="button" class="memo-save-btn" data-txs="save-memo" data-key="task">保存</button>
          </span>
        </div>
        <textarea id="memo-editor-task" class="user-memo-editor task-memo" rows="10"></textarea>
      </div>
      <div id="thinking-habit-detail" class="thinking-time-detail habit-detail">
        <div class="thinking-time-detail-title-row">
          <div class="thinking-time-detail-title">習慣メモ <span class="memo-edit-hint">（編集後は保存を押す）</span></div>
          <span class="memo-detail-actions">
            <button type="button" class="memo-cancel-btn" data-txs="cancel-memo" data-key="habit">キャンセル</button>
            <button type="button" class="memo-save-btn" data-txs="save-memo" data-key="habit">保存</button>
          </span>
        </div>
        <textarea id="memo-editor-habit" class="user-memo-editor" rows="5"></textarea>
      </div>
    </div>
  </div>
</div>
<div id="exp-bonus-confirm" class="memo-confirm-backdrop txs-dialog" role="dialog" aria-modal="true" aria-labelledby="exp-bonus-confirm-title">
  <div class="memo-confirm-dialog">
    <div id="exp-bonus-confirm-title" class="memo-confirm-title">お宝をゲットしますか？</div>
    <p id="exp-bonus-confirm-message" class="memo-confirm-message"></p>
    <div class="memo-confirm-actions">
      <button type="button" class="memo-confirm-no" data-txs="close-exp-confirm">いいえ</button>
      <button type="button" class="memo-confirm-yes" data-txs="confirm-exp-claim">はい</button>
    </div>
  </div>
</div>
<div id="memo-cancel-confirm" class="memo-confirm-backdrop txs-dialog" role="dialog" aria-modal="true" aria-labelledby="memo-cancel-confirm-title">
  <div class="memo-confirm-dialog">
    <div id="memo-cancel-confirm-title" class="memo-confirm-title">キャンセルしますか？</div>
    <p class="memo-confirm-message">未保存の編集は元に戻ります。</p>
    <div class="memo-confirm-actions">
      <button type="button" class="memo-confirm-no" data-txs="close-memo-cancel">いいえ</button>
      <button type="button" class="memo-confirm-yes" data-txs="confirm-memo-cancel">はい</button>
    </div>
  </div>
</div>`;
  }

  function toggleTrainingFold(forceOpen) {
    if (!foldRoot) return;
    const btn = foldRoot.querySelector(".txs-fold-toggle");
    const open = typeof forceOpen === "boolean" ? forceOpen : !foldRoot.classList.contains("menu-open");
    foldRoot.classList.toggle("menu-open", open);
    foldRoot.classList.toggle("menu-collapsed", !open);
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function syncFoldSummary() {
    const el = document.getElementById("txs-fold-summary");
    if (!el) return;
    el.textContent = `総EXP ${formatTotalExpDisplay(getTotalActivityExp())}`;
  }

  function onRootClick(ev) {
    const btn = ev.target.closest("[data-txs]");
    if (!btn || !mountRoot || !mountRoot.contains(btn)) return;
    const action = btn.getAttribute("data-txs");
    const mode = btn.getAttribute("data-mode");
    const kind = btn.getAttribute("data-kind");
    const exp = btn.getAttribute("data-exp");
  switch (action) {
      case "toggle-fold": toggleTrainingFold(); break;
      case "select-thinking": selectThinkingMode(mode); break;
      case "select-activity": selectActivityMode(mode); break;
      case "toggle-thinking-timer": toggleThinkingTimerUnified(); break;
      case "toggle-activity-timer": toggleActivityTimerUnified(); break;
      case "toggle-exercise-timer": toggleExerciseTimerUnified(); break;
      case "toggle-detail": toggleThinkingDetail(kind); break;
      case "toggle-bonus-panel": toggleExpBonusPanel(); break;
      case "toggle-todo-panel": toggleTodoMemoPanel(); break;
      case "toggle-settings-panel": toggleThinkingSettingsPanel(); break;
      case "save-memo": saveUserMemoFromEditor(kind); break;
      case "cancel-memo": cancelUserMemoEdit(kind); break;
      case "save-todo-memo": saveTodoMemoFromEditor(); break;
      case "cancel-todo-memo": cancelTodoMemoEdit(); break;
      case "claim-exp": requestExpBonusClaim(Number(exp)); break;
      case "close-exp-confirm": closeExpBonusConfirm(); break;
      case "confirm-exp-claim": confirmExpBonusClaim(); break;
      case "close-memo-cancel": closeMemoCancelConfirm(); break;
      case "confirm-memo-cancel": confirmUserMemoCancel(); break;
      case "exp-popup-toggle": setActivityExpPopupEnabled(btn.checked); break;
      case "copy-sync-bat": copySyncBatPath(); break;
    }
  }

  function configure(userCfg) {
    cfg = Object.assign({}, cfg, userCfg || {});
    if (userCfg && userCfg.storageKeys) {
      cfg.storageKeys = Object.assign({}, DEFAULT_STORAGE, userCfg.storageKeys);
    }
    if (userCfg && userCfg.defaultMemos) {
      cfg.defaultMemos = Object.assign({}, cfg.defaultMemos, userCfg.defaultMemos);
    }
    if (userCfg && userCfg.syncGuide) {
      cfg.syncGuide = userCfg.syncGuide;
    }
  }

  function mount(containerId, userCfg) {
    if (userCfg) configure(userCfg);
    const host = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    if (!host) {
      console.warn("TrainingExpSystem: mount container not found");
      return false;
    }
    unmount();
    host.innerHTML = getHtmlTemplate();
    mountRoot = host;
    foldRoot = host.querySelector("#training-exp-fold");
    const foldBtn = foldRoot && foldRoot.querySelector(".txs-fold-toggle");
    if (foldBtn) foldBtn.setAttribute("data-txs", "toggle-fold");
    host.addEventListener("click", onRootClick);
    host.addEventListener("change", onRootClick);
    renderSyncGuideSettings();
    loadThinkingTimeState();
    initUserMemoEditors();
    if (thinkingTimeState.activeKind) startThinkingTimerTick();
    syncThinkingTimeUi();
    mounted = true;
    return true;
  }

  function unmount() {
    stopThinkingTimerTick();
    if (thinkingTimeState.activeKind) stopThinkingTimer(thinkingTimeState.activeKind, true);
    if (mountRoot) {
      mountRoot.removeEventListener("click", onRootClick);
      mountRoot.removeEventListener("change", onRootClick);
      mountRoot.innerHTML = "";
    }
    mountRoot = null;
    foldRoot = null;
    mounted = false;
  }


  global.TrainingExpSystem = {
    mount,
    unmount,
    configure,
    get mounted() { return mounted; },
    getTotalExp: getTotalActivityExp,
    getState: () => ({ ...thinkingTimeState }),
    syncUi: syncThinkingTimeUi,
    toggleFold: toggleTrainingFold,
    tickUi: tickThinkingTimeUi,
    showToast: showThinkingTimeToast,
  };
})(typeof window !== "undefined" ? window : this);
