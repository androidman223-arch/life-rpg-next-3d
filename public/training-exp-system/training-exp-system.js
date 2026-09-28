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
    phoenixUi: {
      buttonSubHint:
        "（静かに整える、自力思考、めいそう、メモ整理、習慣整え、休む、断捨離、人生の目標、 ALL OK）",
      reflectionPlaceholder: "今日わかったこと（一行・任意）…",
      reflectionKinds: ["phoenix"],
    },
  };

  let mounted = false;
  let mountRoot = null;
  let foldRoot = null;


  function getStorageKey(kind) {
    return (cfg.storageKeys && cfg.storageKeys[kind]) || DEFAULT_STORAGE[kind];
  }

  const PHOENIX_BONUS_INTERVAL_SEC = 3600;
  const PHOENIX_TIMER_KIND = "phoenix";
  const SESSION_EXP_KINDS = new Set([PHOENIX_TIMER_KIND]);
  const ALL_TIMER_KINDS = new Set([PHOENIX_TIMER_KIND]);
  const PHOENIX_LEGACY_ACTIVE_KINDS = new Set(["self", "memo", "meditation", "rest"]);

const thinkingTimeState = {
  phoenixTotalSec: 0,
  phoenixExp: 0,
  reflectionLog: [],
  activeKind: null,
  sessionStartMs: null,
  phoenixBonusCount: 0,
  expBonusClaimed: [],
  activityExpPopupEnabled: false,
};

let expBonusPanelOpen = false;
let todoMemoPanelOpen = false;
let thinkingSettingsPanelOpen = false;
let pendingExpBonusClaimExp = null;
const REFLECTION_LOG_MAX = 40;
let phoenixGuidePanelOpen = false;
let pendingReflectionKind = null;
let activitySessionExpTicksClaimed = 0;
const activityExpPopupTimers = {};

const ACTIVITY_EXP_TICK_SEC = 6;
const PHOENIX_EXP_PER_TICK = 0.1;

const THINKING_DETAIL_BTN_LABELS = {
  task: "現在の課題",
  habit: "習慣",
};

function migrateLegacyPhoenixTotals(parsed) {
  if (parsed.phoenixTotalSec != null) {
    return {
      totalSec: Math.max(0, Math.floor(parsed.phoenixTotalSec)),
      exp: Math.round(Math.max(0, Number(parsed.phoenixExp) || 0) * 10) / 10,
      bonusCount: Math.max(
        0,
        Math.floor(parsed.phoenixBonusCount ?? parsed.selfBonusCount ?? 0)
      ),
    };
  }
  let totalSec = 0;
  let exp = 0;
  for (const key of ["self", "memo", "meditation", "rest"]) {
    const secField = `${key}TotalSec`;
    const expField = key === "memo" ? "memoExp" : `${key}Exp`;
    if (parsed[secField] != null) {
      totalSec += Math.max(0, Math.floor(parsed[secField]));
    }
    if (parsed[expField] != null) {
      exp += Number(parsed[expField]) || 0;
    }
  }
  const bonusCount =
    parsed.phoenixBonusCount ??
    parsed.selfBonusCount ??
    Math.floor(totalSec / PHOENIX_BONUS_INTERVAL_SEC);
  return {
    totalSec,
    exp: Math.round(Math.max(0, exp) * 10) / 10,
    bonusCount: Math.max(0, Math.floor(bonusCount)),
  };
}

function loadThinkingTimeState() {
  try {
    const raw = localStorage.getItem(getStorageKey('state'));
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const migrated = migrateLegacyPhoenixTotals(parsed);
    thinkingTimeState.phoenixTotalSec = migrated.totalSec;
    thinkingTimeState.phoenixExp = migrated.exp;
    thinkingTimeState.phoenixBonusCount = migrated.bonusCount;
    if (Array.isArray(parsed.reflectionLog)) {
      thinkingTimeState.reflectionLog = parsed.reflectionLog
        .filter((row) => row && typeof row.text === "string" && row.text.trim())
        .slice(0, REFLECTION_LOG_MAX)
        .map((row) => ({
          text: row.text.trim(),
          kind: typeof row.kind === "string" ? row.kind : "",
          atMs: Number(row.atMs) || Date.now(),
        }));
    }
    if (parsed.activityExpPopupEnabled != null) {
      thinkingTimeState.activityExpPopupEnabled = !!parsed.activityExpPopupEnabled;
    }
    if (Array.isArray(parsed.expBonusClaimed)) {
      thinkingTimeState.expBonusClaimed = parsed.expBonusClaimed
        .map((n) => Math.floor(Number(n)))
        .filter((n) => Number.isFinite(n) && n > 0);
    }
    if (
      parsed.activeKind === PHOENIX_TIMER_KIND ||
      PHOENIX_LEGACY_ACTIVE_KINDS.has(parsed.activeKind)
    ) {
      thinkingTimeState.activeKind = PHOENIX_TIMER_KIND;
      thinkingTimeState.sessionStartMs = parsed.sessionStartMs || Date.now();
    }
    if (parsed.activitySessionExpTicksClaimed != null) {
      activitySessionExpTicksClaimed = Math.max(
        0,
        Math.floor(parsed.activitySessionExpTicksClaimed)
      );
    } else if (
      parsed.activitySessionExpClaimed != null &&
      thinkingTimeState.activeKind === PHOENIX_TIMER_KIND
    ) {
      activitySessionExpTicksClaimed = Math.round(
        Number(parsed.activitySessionExpClaimed) / PHOENIX_EXP_PER_TICK
      );
    } else if (thinkingTimeState.activeKind === PHOENIX_TIMER_KIND) {
      activitySessionExpTicksClaimed = getActivityExpTicks(
        getThinkingSessionElapsedSec(PHOENIX_TIMER_KIND)
      );
    }
  } catch (e) {
    console.warn("思考タイム読込失敗:", e);
  }
}

function saveThinkingTimeState() {
  try {
    localStorage.setItem(
      getStorageKey("state"),
      JSON.stringify({
        phoenixTotalSec: thinkingTimeState.phoenixTotalSec,
        phoenixExp: thinkingTimeState.phoenixExp || 0,
        reflectionLog: thinkingTimeState.reflectionLog || [],
        expBonusClaimed: thinkingTimeState.expBonusClaimed || [],
        activityExpPopupEnabled: !!thinkingTimeState.activityExpPopupEnabled,
        activeKind: thinkingTimeState.activeKind,
        sessionStartMs: thinkingTimeState.sessionStartMs,
        phoenixBonusCount: thinkingTimeState.phoenixBonusCount || 0,
        activitySessionExpTicksClaimed:
          thinkingTimeState.activeKind === PHOENIX_TIMER_KIND
            ? activitySessionExpTicksClaimed || 0
            : 0,
      })
    );
  } catch (e) {
    console.warn("思考タイム保存失敗:", e);
  }
}

function getThinkingTotalSec(kind) {
  if (kind === PHOENIX_TIMER_KIND) return thinkingTimeState.phoenixTotalSec;
  return 0;
}

function setThinkingTotalSec(kind, sec) {
  if (kind === PHOENIX_TIMER_KIND) thinkingTimeState.phoenixTotalSec = sec;
}

function getActivityExp(kind) {
  if (kind === PHOENIX_TIMER_KIND) return thinkingTimeState.phoenixExp || 0;
  return 0;
}

function addActivityExp(kind, gained) {
  if (gained <= 0) return;
  if (kind === PHOENIX_TIMER_KIND) {
    thinkingTimeState.phoenixExp = roundExpOneDecimal(
      (thinkingTimeState.phoenixExp || 0) + gained
    );
  }
}

function isActivityExpPopupEnabled() {
  return !!thinkingTimeState.activityExpPopupEnabled;
}

function setActivityExpPopupEnabled(enabled) {
  thinkingTimeState.activityExpPopupEnabled = !!enabled;
  const toggle = document.getElementById("activity-exp-popup-toggle");
  if (toggle) toggle.checked = !!enabled;
  if (!enabled) {
    [PHOENIX_TIMER_KIND].forEach(hideActivityExpPopup);
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
  if (kind === PHOENIX_TIMER_KIND) return PHOENIX_EXP_PER_TICK;
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
  return roundExpTwoDecimal(thinkingTimeState.phoenixExp || 0);
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

function renderPhoenixSkillGetTable() {
  const list = document.getElementById("thinking-phoenix-skill-get-list");
  const catalog = cfg.phoenixSkillGetCatalog || [];
  if (!list || !catalog.length) return;
  const practiceLv =
    typeof cfg.getPhoenixPracticeLevel === "function"
      ? Number(cfg.getPhoenixPracticeLevel()) || 0
      : 0;
  list.innerHTML = catalog
    .map((entry) => {
      const unlocked = practiceLv + 1e-6 >= (entry.level || 0);
      const rowClass = [
        "exp-skill-get-row",
        unlocked ? "unlocked" : "",
        entry.status === "done" ? "implemented" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const statusTag =
        entry.status === "done"
          ? '<span class="exp-skill-get-tag done">実装済</span>'
          : entry.status === "stub"
            ? '<span class="exp-skill-get-tag stub">試作</span>'
            : "";
      const nameLabel = entry.originalName
        ? `${entry.name}（${entry.originalName}）`
        : entry.name;
      return `<div class="${rowClass}">
      <span class="exp-skill-get-lv">Lv.${entry.level}</span>
      <span class="exp-skill-get-name">${nameLabel}</span>
      <span class="exp-skill-get-hint">${entry.hint}</span>
      ${statusTag}
    </div>`;
    })
    .join("");
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
  renderPhoenixSkillGetTable();
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
    breakdownEl.textContent = `（鳳凰・知恵 ${formatActivityExpDisplay(PHOENIX_TIMER_KIND, thinkingTimeState.phoenixExp || 0)}）`;
  }
  if (expBonusPanelOpen) renderExpBonusTable();
  syncFoldSummary();
}

function formatActivityExpDisplay(kind, value) {
  const v = Math.max(0, value);
  return roundExpOneDecimal(v).toFixed(1).replace(".", ",");
}

function calcActivityExpGain(kind, elapsedSec) {
  const ticks = getActivityExpTicks(elapsedSec);
  if (ticks <= 0) return 0;
  return ticks * getSessionExpPerTick(kind);
}

const ACTIVITY_EXP_LABELS = { phoenix: "鳳凰" };

function getThinkingSessionElapsedSec(kind) {
  if (thinkingTimeState.activeKind !== kind || !thinkingTimeState.sessionStartMs) return 0;
  return Math.max(0, Math.floor((Date.now() - thinkingTimeState.sessionStartMs) / 1000));
}

function formatThinkingCurrentSec(sec) {
  return `${Math.max(0, Math.floor(sec))}秒`;
}

function getPhoenixCombinedSec() {
  return (
    getThinkingTotalSec(PHOENIX_TIMER_KIND) +
    getThinkingSessionElapsedSec(PHOENIX_TIMER_KIND)
  );
}

function showThinkingTimeToast(msg, color) {
  const el = document.getElementById("thinking-time-toast");
  if (!el) return;
  el.textContent = msg;
  el.style.color = color || "#ffd966";
}

function checkPhoenixHourlyBonus() {
  const combined = getPhoenixCombinedSec();
  const milestones = Math.floor(combined / PHOENIX_BONUS_INTERVAL_SEC);
  const claimed = thinkingTimeState.phoenixBonusCount || 0;
  if (milestones <= claimed) return 0;
  const earned = milestones - claimed;
  thinkingTimeState.phoenixBonusCount = milestones;
  saveThinkingTimeState();
  const msg =
    earned === 1
      ? "★ 鳳凰修行1時間達成！ ボーナス +1 ★"
      : `★ 鳳凰修行${earned}時間分のボーナス！ +${earned} ★`;
  showThinkingTimeToast(msg, "#ffd966");
  return earned;
}

function getPhoenixNextBonusSec() {
  const combined = getPhoenixCombinedSec();
  if (combined <= 0) return PHOENIX_BONUS_INTERVAL_SEC;
  const remain =
    PHOENIX_BONUS_INTERVAL_SEC - (combined % PHOENIX_BONUS_INTERVAL_SEC);
  return remain === PHOENIX_BONUS_INTERVAL_SEC ? 0 : remain;
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
    if (kind === PHOENIX_TIMER_KIND) checkPhoenixHourlyBonus();
    if (SESSION_EXP_KINDS.has(kind)) {
      tickActivitySessionExp();
      activitySessionExpTicksClaimed = 0;
    }
  }
  thinkingTimeState.activeKind = null;
  thinkingTimeState.sessionStartMs = null;
  saveThinkingTimeState();
  if (!thinkingTimeState.activeKind) stopThinkingTimerTick();
  if (addToTotal) maybeOpenReflectionPanel(kind);
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

function togglePhoenixTimer() {
  if (thinkingTimeState.activeKind === PHOENIX_TIMER_KIND) {
    stopThinkingTimer(PHOENIX_TIMER_KIND, true);
  } else {
    if (thinkingTimeState.activeKind) {
      stopThinkingTimer(thinkingTimeState.activeKind, true);
    }
    startThinkingTimer(PHOENIX_TIMER_KIND);
  }
  syncThinkingTimeUi();
}

function getPhoenixReflectionKinds() {
  const kinds = cfg.phoenixUi && cfg.phoenixUi.reflectionKinds;
  return Array.isArray(kinds) ? kinds : [PHOENIX_TIMER_KIND];
}

function shouldPromptReflection(kind) {
  return getPhoenixReflectionKinds().includes(kind);
}

function escapeHtmlText(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderReflectionLogList() {
  const list = document.getElementById("thinking-reflection-log");
  if (!list) return;
  const rows = (thinkingTimeState.reflectionLog || []).slice(0, 8);
  if (rows.length === 0) {
    list.innerHTML = '<li class="thinking-reflection-empty">まだ振り返りはありません</li>';
    return;
  }
  list.innerHTML = rows
    .map((row) => {
      const d = new Date(row.atMs || Date.now());
      const stamp = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      const kindLabel = USER_MEMO_LABELS[row.kind] || row.kind || "";
      const prefix = kindLabel ? `${stamp} · ${kindLabel}` : stamp;
      return `<li><span class="thinking-reflection-stamp">${prefix}</span> ${escapeHtmlText(row.text)}</li>`;
    })
    .join("");
}

function maybeOpenReflectionPanel(kind) {
  if (!shouldPromptReflection(kind)) return;
  pendingReflectionKind = kind;
  const panel = document.getElementById("thinking-reflection-panel");
  const input = document.getElementById("thinking-reflection-input");
  if (panel) panel.hidden = false;
  if (input) {
    input.value = "";
    input.placeholder =
      (cfg.phoenixUi && cfg.phoenixUi.reflectionPlaceholder) ||
      "今日わかったこと（一行・任意）…";
    try {
      input.focus();
    } catch {
      /* ignore */
    }
  }
  renderReflectionLogList();
}

function dismissReflectionPanel() {
  pendingReflectionKind = null;
  const panel = document.getElementById("thinking-reflection-panel");
  if (panel) panel.hidden = true;
}

function saveReflectionLine() {
  const input = document.getElementById("thinking-reflection-input");
  if (!input) return;
  const text = (input.value || "").trim();
  if (!text) {
    dismissReflectionPanel();
    return;
  }
  thinkingTimeState.reflectionLog = [
    {
      text,
      kind: pendingReflectionKind || "",
      atMs: Date.now(),
    },
    ...(thinkingTimeState.reflectionLog || []),
  ].slice(0, REFLECTION_LOG_MAX);
  saveThinkingTimeState();
  input.value = "";
  pendingReflectionKind = null;
  renderReflectionLogList();
  dismissReflectionPanel();
  showThinkingTimeToast("振り返りを記録しました", "#c9f");
}

function togglePhoenixGuidePanel() {
  phoenixGuidePanelOpen = !phoenixGuidePanelOpen;
  const panel = document.getElementById("thinking-phoenix-guide-panel");
  const btn = document.getElementById("thinking-phoenix-guide-btn");
  if (panel) panel.hidden = !phoenixGuidePanelOpen;
  if (btn) {
    btn.classList.toggle("open", phoenixGuidePanelOpen);
    btn.setAttribute("aria-expanded", phoenixGuidePanelOpen ? "true" : "false");
  }
}

function initPhoenixGuideUi() {
  const hint = document.getElementById("thinking-phoenix-sub-hint");
  if (hint && cfg.phoenixUi && cfg.phoenixUi.buttonSubHint) {
    hint.textContent = cfg.phoenixUi.buttonSubHint;
  }
  renderReflectionLogList();
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
  task: "現在の課題",
  habit: "習慣",
  rest: "休み",
  guide: "説明",
  forbidden: "禁止事項",
  phoenix: "鳳凰",
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
  const kind = PHOENIX_TIMER_KIND;
  const running = thinkingTimeState.activeKind === kind;
  const currentSec = running ? getThinkingSessionElapsedSec(kind) : 0;
  const totalSec = getThinkingTotalSec(kind);
  const phoenixBtn = document.getElementById("thinking-phoenix-btn");
  const curEl = document.getElementById("thinking-phoenix-current");
  const totalEl = document.getElementById("thinking-phoenix-total");
  const expEl = document.getElementById("thinking-phoenix-exp");
  const sessionExpEl = document.getElementById("thinking-phoenix-session-exp");
  if (phoenixBtn) {
    phoenixBtn.textContent = running ? "停止" : "スタート";
    phoenixBtn.classList.toggle("running", running);
  }
  if (curEl) curEl.textContent = formatThinkingCurrentSec(currentSec);
  if (totalEl) totalEl.textContent = cfg.formatDuration(totalSec);
  if (expEl) {
    expEl.textContent = formatActivityExpDisplay(kind, getActivityExp(kind));
  }
  if (sessionExpEl) {
    const sessionExp = running ? calcActivityExpGain(kind, currentSec) : 0;
    sessionExpEl.textContent =
      sessionExp > 0
        ? ` EXP+${formatActivityExpDisplay(kind, sessionExp)}`
        : "";
  }
  const bonusEl = document.getElementById("thinking-phoenix-bonus-count");
  if (bonusEl) {
    bonusEl.textContent = String(thinkingTimeState.phoenixBonusCount || 0);
  }
  const nextEl = document.getElementById("thinking-phoenix-next-bonus");
  if (nextEl) {
    const remain = getPhoenixNextBonusSec();
    if (remain <= 0 && getPhoenixCombinedSec() > 0) {
      nextEl.textContent = "ボーナスまであと少し";
    } else if (getPhoenixCombinedSec() > 0) {
      nextEl.textContent = formatBonusRemainMinutes(remain);
    } else {
      nextEl.textContent = "ボーナスまで60分";
    }
  }
  syncExpBonusUi();
}

function tickThinkingTimeUi() {
  if (!thinkingTimeState.activeKind) return;
  if (thinkingTimeState.activeKind === PHOENIX_TIMER_KIND) {
    checkPhoenixHourlyBonus();
  }
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
      <div class="thinking-phoenix-block">
        <div class="thinking-time-main-row thinking-phoenix-main-row">
          <span class="thinking-phoenix-title">🪶 鳳凰</span>
          <span class="thinking-compact-stat thinking-stat-with-popup"><span id="thinking-phoenix-current">0秒</span>/<strong id="thinking-phoenix-total">0秒</strong><span id="thinking-phoenix-session-exp" class="activity-session-exp phoenix"></span><span id="thinking-phoenix-exp-popup" class="activity-exp-popup phoenix"></span></span>
          <span class="thinking-exp-stat">知恵EXP<strong id="thinking-phoenix-exp">0</strong></span>
          <span class="thinking-time-bonus-wrap">🎁<strong id="thinking-phoenix-bonus-count">0</strong></span>
          <button type="button" id="thinking-phoenix-btn" class="thinking-time-btn thinking-phoenix-btn" data-txs="toggle-phoenix-timer">スタート</button>
        </div>
        <p id="thinking-phoenix-sub-hint" class="thinking-phoenix-sub-hint"></p>
        <p class="thinking-time-next-bonus" id="thinking-phoenix-next-bonus">ボーナスまで60分</p>
      </div>
      <div class="thinking-phoenix-guide-fold">
        <button type="button" id="thinking-phoenix-guide-btn" class="thinking-phoenix-guide-toggle" data-txs="toggle-phoenix-guide" aria-expanded="false">
          <span class="thinking-phoenix-guide-arrow">▼</span> 鳳凰の知恵 — 説明・禁止事項
        </button>
        <div id="thinking-phoenix-guide-panel" class="thinking-phoenix-guide-panel" hidden>
          <div class="thinking-time-detail rest-guide-detail">
            <div class="thinking-time-detail-title-row">
              <div class="thinking-time-detail-title thinking-rest-guide-title">休みメモ <span class="memo-edit-hint">（編集後は保存を押す）</span></div>
              <span class="memo-detail-actions">
                <button type="button" class="memo-cancel-btn" data-txs="cancel-memo" data-key="rest">キャンセル</button>
                <button type="button" class="memo-save-btn" data-txs="save-memo" data-key="rest">保存</button>
              </span>
            </div>
            <textarea id="memo-editor-rest" class="user-memo-editor rest-memo" rows="6"></textarea>
          </div>
          <div class="thinking-time-detail guide-detail">
            <div class="thinking-time-detail-title-row">
              <div class="thinking-time-detail-title">説明メモ <span class="memo-edit-hint">（編集後は保存を押す）</span></div>
              <span class="memo-detail-actions">
                <button type="button" class="memo-cancel-btn" data-txs="cancel-memo" data-key="guide">キャンセル</button>
                <button type="button" class="memo-save-btn" data-txs="save-memo" data-key="guide">保存</button>
              </span>
            </div>
            <textarea id="memo-editor-guide" class="user-memo-editor guide-memo" rows="8"></textarea>
          </div>
          <div class="thinking-time-detail forbidden-detail">
            <div class="thinking-time-detail-title-row">
              <div class="thinking-time-detail-title thinking-forbidden-title">★禁止事項メモ <span class="memo-edit-hint">（編集後は保存を押す）</span></div>
              <span class="memo-detail-actions">
                <button type="button" class="memo-cancel-btn" data-txs="cancel-memo" data-key="forbidden">キャンセル</button>
                <button type="button" class="memo-save-btn" data-txs="save-memo" data-key="forbidden">保存</button>
              </span>
            </div>
            <textarea id="memo-editor-forbidden" class="user-memo-editor forbidden-memo" rows="10"></textarea>
          </div>
        </div>
      </div>
      <div id="thinking-reflection-panel" class="thinking-reflection-panel" hidden>
        <div class="thinking-reflection-title">振り返り一行（任意）</div>
        <p class="thinking-reflection-hint">セッション終わり — 今日わかったことを一行で（メモと瞑想の橋渡し）</p>
        <div class="thinking-reflection-input-row">
          <input type="text" id="thinking-reflection-input" class="thinking-reflection-input" maxlength="200" />
          <button type="button" class="memo-save-btn" data-txs="save-reflection">記録</button>
          <button type="button" class="memo-cancel-btn" data-txs="dismiss-reflection">スキップ</button>
        </div>
        <ul id="thinking-reflection-log" class="thinking-reflection-log"></ul>
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
        <div class="exp-skill-get-title">● 鳳凰スキルゲット（知恵 Lv10〜90）</div>
        <div id="thinking-phoenix-skill-get-list" class="exp-skill-get-list"></div>
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
      case "toggle-phoenix-timer": togglePhoenixTimer(); break;
      case "toggle-phoenix-guide": togglePhoenixGuidePanel(); break;
      case "save-reflection": saveReflectionLine(); break;
      case "dismiss-reflection": dismissReflectionPanel(); break;
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
    if (userCfg && userCfg.phoenixUi) {
      cfg.phoenixUi = Object.assign({}, cfg.phoenixUi, userCfg.phoenixUi);
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
    initPhoenixGuideUi();
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
