"use client";

import { useCallback, useEffect } from "react";
import { MOE_PET_MASTER_NPC } from "@/data/moeFieldNpcs";

const ADVANCE_KEYS = new Set(["Enter", " ", "z", "Z", "x", "X"]);

/**
 * NPC 会話ウィンドウ（メニュー / 次へ / 閉じる）
 * lines / message はクリック・Enter で次ページへ
 * @param {{
 *   open: boolean,
 *   mode?: 'menu' | 'lines' | 'message',
 *   lines?: { speaker: string, text: string }[],
 *   lineIndex?: number,
 *   message?: { speaker?: string, text: string },
 *   menuPrompt?: string,
 *   menuActions?: { id: string, label: string, disabled?: boolean }[],
 *   catalogTitle?: string,
 *   catalogNote?: string,
 *   catalogItems?: { id: string, name: string, multiplier: string, detail: string, badge?: string }[],
 *   catalogSkills?: { id: string, name: string, multiplier: string, detail: string, badge?: string }[],
 *   catalogActions?: { id: string, label: string, detail?: string, badge?: string, disabled?: boolean }[],
 *   catalogLevelOptions?: number[],
 *   catalogSelectedLevel?: number,
 *   onCatalogLevelChange?: (level: number) => void,
 *   catalogCheckboxes?: { id: string, label: string, detail?: string, subDetail?: string, checked?: boolean }[],
 *   onCatalogCheckboxChange?: (id: string, checked: boolean) => void,
 *   onCatalogAction?: (id: string) => void,
 *   onMenuSelect?: (id: string) => void,
 *   onNext?: () => void,
 *   onComplete?: () => void,
 *   completeLabel?: string,
 *   closeLabel?: string,
 *   onClose: () => void,
 *   petData: { name: string, emoji: string },
 *   npc?: { name: string, emoji: string },
 *   alignTop?: boolean,
 * }} props
 */
export default function MoeNpcDialogue({
  open,
  mode = "lines",
  lines = [],
  lineIndex = 0,
  message,
  menuPrompt = "何用じゃ？",
  menuActions = [],
  catalogTitle = "取扱商品",
  catalogNote = "",
  catalogItems = [],
  catalogSkills = [],
  catalogActions = [],
  catalogLevelOptions = [],
  catalogSelectedLevel,
  onCatalogLevelChange,
  catalogCheckboxes = [],
  onCatalogCheckboxChange,
  onCatalogAction,
  onMenuSelect,
  onNext,
  onComplete,
  completeLabel = "終わる",
  closeLabel = "閉じる",
  onClose,
  petData,
  npc = MOE_PET_MASTER_NPC,
  alignTop = false,
}) {
  const isPagedMode = mode === "lines" || mode === "message";
  const isLastLine =
    mode === "lines" && lineIndex >= Math.max(0, lines.length - 1);

  const handleAdvance = useCallback(() => {
    if (mode === "lines") {
      if (!lines.length) {
        onClose();
        return;
      }
      if (isLastLine) {
        (onComplete ?? onClose)?.();
      } else {
        onNext?.();
      }
      return;
    }
    if (mode === "message") {
      if (onComplete) onComplete();
      else onClose();
    }
  }, [mode, lines.length, isLastLine, onComplete, onClose, onNext]);

  useEffect(() => {
    if (!open || !isPagedMode) return;
    const onKey = (e) => {
      if (e.repeat) return;
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (ADVANCE_KEYS.has(e.key)) {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isPagedMode, handleAdvance, onClose]);

  if (!open) return null;

  const resolveSpeaker = (speaker) => {
    if (speaker === "master") {
      return { label: npc.name, emoji: npc.emoji };
    }
    if (speaker === "pet") {
      return { label: petData.name, emoji: petData.emoji };
    }
    return { label: "……", emoji: "💬" };
  };

  const advanceHint =
    mode === "lines"
      ? isLastLine
        ? "クリック / Enter で終了"
        : "クリック / Enter で次へ"
      : onComplete
        ? "クリック / Enter で次へ"
        : "クリック / Enter で閉じる";

  if (mode === "catalog") {
    const { label, emoji } = resolveSpeaker("master");
    const allRows = [...catalogItems, ...catalogSkills];
    return (
      <DialogShell npc={npc} onClose={onClose} alignTop={alignTop}>
        <SpeakerHeader emoji={emoji} label={label} />
        <p className="text-xs font-bold text-amber-200/95">{catalogTitle}</p>
        {catalogNote ? (
          <p className="mt-1 whitespace-pre-line text-[10px] leading-snug text-zinc-400">
            {catalogNote}
          </p>
        ) : null}
        {catalogLevelOptions.length ? (
          <div className="mt-2">
            <p className="text-[9px] font-bold text-violet-200/90">お試し：アイテム化するペットLv</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {catalogLevelOptions.map((level) => {
                const selected = catalogSelectedLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onCatalogLevelChange?.(level)}
                    className={`rounded-md border px-2 py-1 text-[10px] font-bold tabular-nums transition active:scale-95 ${
                      selected
                        ? "border-violet-400 bg-violet-700/80 text-violet-50"
                        : "border-violet-700/50 bg-violet-950/40 text-violet-200/80 hover:bg-violet-900/50"
                    }`}
                  >
                    Lv{level}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        {catalogCheckboxes.length ? (
          <ul className="mt-2 space-y-1">
            {catalogCheckboxes.map((row) => (
              <li key={row.id}>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-violet-700/40 bg-violet-950/35 px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={!!row.checked}
                    onChange={(e) => onCatalogCheckboxChange?.(row.id, e.target.checked)}
                    className="mt-0.5 accent-violet-500"
                  />
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold text-violet-100">
                      {row.label}
                    </span>
                    {row.detail ? (
                      <span className="mt-0.5 block text-[9px] leading-snug text-violet-200/70">
                        {row.detail}
                      </span>
                    ) : null}
                    {row.subDetail ? (
                      <span className="mt-0.5 block whitespace-pre-line text-[8px] leading-snug text-violet-200/50">
                        {row.subDetail}
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : null}
        {catalogActions.length ? (
          <ul className="mt-2 space-y-1.5">
            {catalogActions.map((action) => (
              <li key={action.id}>
                <button
                  type="button"
                  disabled={action.disabled}
                  onClick={() => onCatalogAction?.(action.id)}
                  className={`w-full rounded-lg border-2 px-2.5 py-2 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${
                    action.badge
                      ? "border-violet-500/55 bg-violet-950/55 hover:bg-violet-900/55"
                      : "border-zinc-600/55 bg-zinc-900/55 hover:bg-zinc-800/55"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-[11px] font-bold leading-snug ${action.badge ? "text-violet-50" : "text-zinc-100"}`}>
                      {action.label}
                    </p>
                    {action.badge ? (
                      <span className="shrink-0 rounded bg-emerald-700/85 px-1.5 py-0.5 text-[8px] font-bold text-emerald-50">
                        {action.badge}
                      </span>
                    ) : null}
                  </div>
                  {action.detail ? (
                    <p className="mt-0.5 text-[9px] leading-snug text-violet-200/75">
                      {action.detail}
                    </p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <ul className="mt-2 max-h-[min(48vh,16rem)] space-y-1.5 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:thin]">
          {allRows.map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-cyan-700/35 bg-cyan-950/35 px-2 py-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold leading-snug text-cyan-50">
                  {row.name}
                </p>
                <span className="shrink-0 font-mono text-[10px] font-bold tabular-nums text-amber-200">
                  {row.multiplier}
                </span>
              </div>
              <p className="mt-0.5 whitespace-pre-line text-[9px] leading-snug text-zinc-400">
                {row.detail}
              </p>
              {row.badge ? (
                <span className="mt-1 inline-block rounded bg-emerald-700/80 px-1.5 py-0.5 text-[8px] font-bold text-emerald-50">
                  {row.badge}
                </span>
              ) : (
                <span className="mt-1 inline-block rounded border border-zinc-600/60 px-1.5 py-0.5 text-[8px] text-zinc-500">
                  準備中
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-amber-50 transition hover:bg-amber-500 active:scale-95"
          >
            閉じる
          </button>
        </div>
      </DialogShell>
    );
  }

  if (mode === "menu") {
    const { label, emoji } = resolveSpeaker("master");
    return (
      <DialogShell npc={npc} onClose={onClose} alignTop={alignTop}>
        <SpeakerHeader emoji={emoji} label={label} />
        <p className="min-h-[2.5rem] whitespace-pre-line text-sm leading-relaxed text-zinc-100">
          {menuPrompt}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {menuActions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={action.disabled}
              onClick={() => onMenuSelect?.(action.id)}
              className="rounded-lg border border-amber-600/35 bg-amber-950/50 px-3 py-2 text-left text-xs font-bold text-amber-50 transition hover:bg-amber-900/55 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {action.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700 active:scale-95"
          >
            やめる
          </button>
        </div>
      </DialogShell>
    );
  }

  if (mode === "message" && message?.text) {
    const { label, emoji } = resolveSpeaker(message.speaker ?? "master");
    return (
      <DialogShell
        npc={npc}
        onClose={onClose}
        onBackdropAction={handleAdvance}
        onPanelAdvance={handleAdvance}
        alignTop={alignTop}
      >
        <SpeakerHeader emoji={emoji} label={label} />
        <p className="min-h-[3.5rem] whitespace-pre-line text-sm leading-relaxed text-zinc-100">
          {message.text}
        </p>
        <p className="mt-2 text-center text-[10px] text-zinc-500">{advanceHint}</p>
        <div
          className="mt-3 flex justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {onComplete ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700 active:scale-95"
              >
                {closeLabel}
              </button>
              <button
                type="button"
                onClick={handleAdvance}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-amber-50 transition hover:bg-amber-500 active:scale-95"
              >
                {completeLabel}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleAdvance}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-amber-50 transition hover:bg-amber-500 active:scale-95"
            >
              {closeLabel}
            </button>
          )}
        </div>
      </DialogShell>
    );
  }

  if (!lines.length) return null;

  const line = lines[Math.min(lineIndex, lines.length - 1)];
  const isLast = lineIndex >= lines.length - 1;
  const { label, emoji } = resolveSpeaker(line.speaker);

  return (
    <DialogShell
      npc={npc}
      onClose={onClose}
      onBackdropAction={handleAdvance}
      onPanelAdvance={handleAdvance}
      alignTop={alignTop}
    >
      <SpeakerHeader emoji={emoji} label={label} />
      <p className="min-h-[3.5rem] text-sm leading-relaxed text-zinc-100">
        {line.text}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[10px] tabular-nums text-zinc-500">
          {lineIndex + 1} / {lines.length}
        </p>
        <p className="text-[10px] text-zinc-500">{advanceHint}</p>
      </div>
      <div className="mt-2 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700 active:scale-95"
        >
          閉じる
        </button>
        {!isLast ? (
          <button
            type="button"
            onClick={handleAdvance}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-amber-50 transition hover:bg-amber-500 active:scale-95"
          >
            次へ
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAdvance}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-amber-50 transition hover:bg-amber-500 active:scale-95"
          >
            {completeLabel}
          </button>
        )}
      </div>
    </DialogShell>
  );
}

function DialogShell({
  npc,
  onClose,
  onBackdropAction,
  onPanelAdvance,
  alignTop = false,
  children,
}) {
  return (
    <div
      className={`fixed inset-0 z-[57] flex justify-center bg-black/50 p-4 backdrop-blur-[2px] ${
        alignTop ? "items-start pt-24" : "items-end pb-8 sm:items-center"
      }`}
      onClick={onBackdropAction ?? onClose}
      role="presentation"
    >
      <div
        className={`w-[min(92vw,22rem)] rounded-xl border-2 border-amber-500/45 bg-gradient-to-b from-zinc-900/98 to-zinc-950/98 p-4 text-white shadow-2xl${
          onPanelAdvance ? " cursor-pointer" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onPanelAdvance?.();
        }}
        role="dialog"
        aria-label={`${npc.name}との会話`}
      >
        {children}
      </div>
    </div>
  );
}

function SpeakerHeader({ emoji, label }) {
  return (
    <div className="mb-2 flex items-center gap-2 border-b border-amber-500/25 pb-2">
      <span className="text-2xl">{emoji}</span>
      <p className="text-xs font-bold text-amber-100">{label}</p>
    </div>
  );
}
