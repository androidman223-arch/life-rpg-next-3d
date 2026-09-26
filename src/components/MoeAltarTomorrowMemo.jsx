"use client";

import { useCallback, useEffect, useState } from "react";
import {
  appendTomorrowMemoEntry,
  countTomorrowMemoDone,
  countTomorrowMemoTotal,
  loadTomorrowMemoState,
  removeTomorrowMemoEntry,
  saveTomorrowMemoState,
} from "@/lib/moeTomorrowMemo";

/**
 * @param {{ initialOpen?: boolean, compact?: boolean }} [props]
 */
export default function MoeAltarTomorrowMemo({
  initialOpen = false,
  compact = false,
} = {}) {
  const [memo, setMemo] = useState(() => {
    const loaded = loadTomorrowMemoState();
    if (initialOpen) return { ...loaded, panelOpen: true };
    return loaded;
  });

  useEffect(() => {
    saveTomorrowMemoState(memo);
  }, [memo]);

  const togglePanel = useCallback(() => {
    setMemo((prev) => ({ ...prev, panelOpen: !prev.panelOpen }));
  }, []);

  const setEntryText = useCallback((id, text) => {
    setMemo((prev) => ({
      ...prev,
      entries: (prev.entries ?? []).map((e) =>
        e.id === id ? { ...e, text } : e
      ),
    }));
  }, []);

  const toggleEntryDone = useCallback((id) => {
    setMemo((prev) => ({
      ...prev,
      entries: (prev.entries ?? []).map((e) =>
        e.id === id ? { ...e, done: !e.done } : e
      ),
    }));
  }, []);

  const addEntry = useCallback(() => {
    setMemo((prev) => appendTomorrowMemoEntry(prev, ""));
  }, []);

  const deleteEntry = useCallback((id) => {
    setMemo((prev) => removeTomorrowMemoEntry(prev, id));
  }, []);

  const clearDone = useCallback(() => {
    setMemo((prev) => ({
      ...prev,
      entries: (prev.entries ?? []).map((e) => ({ ...e, done: false })),
    }));
  }, []);

  const doneCount = countTomorrowMemoDone(memo);
  const totalCount = countTomorrowMemoTotal(memo);

  return (
    <div className="border-b border-violet-400/25 bg-violet-950/40">
      <button
        type="button"
        onClick={togglePanel}
        aria-expanded={memo.panelOpen}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left transition hover:bg-violet-900/35 active:scale-[0.99]"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-violet-300/85">
            日末メモ
          </span>
          <span
            className={`block font-bold text-violet-50 ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            📋 明日やることメモ
          </span>
        </span>
        <span className="shrink-0 text-right text-[10px] leading-tight text-violet-200/80">
          <span className="block font-mono tabular-nums">
            {doneCount}/{totalCount}
          </span>
          <span className="block">{memo.panelOpen ? "▲" : "▼"}</span>
        </span>
      </button>

      {memo.panelOpen && (
        <div className="space-y-1.5 border-t border-violet-400/20 px-3 py-2.5">
          <p className="text-[10px] leading-snug text-violet-200/70">
            1日の終わりにチェック。＋でメモを追加（固定リストではありません）
          </p>
          <ul className="space-y-1">
            {(memo.entries ?? []).map((entry, i) => (
              <li
                key={entry.id}
                className={`flex items-start gap-2 rounded-lg border px-2 py-1.5 ${
                  entry.done
                    ? "border-emerald-500/35 bg-emerald-950/30"
                    : "border-violet-500/25 bg-zinc-900/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleEntryDone(entry.id)}
                  aria-label={`${i + 1}番を${entry.done ? "未完了に戻す" : "完了にする"}`}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[11px] font-bold transition ${
                    entry.done
                      ? "border-emerald-400/60 bg-emerald-600/50 text-white"
                      : "border-violet-400/40 bg-zinc-950/80 text-violet-200/60 hover:border-violet-300/60"
                  }`}
                >
                  {entry.done ? "✓" : i + 1}
                </button>
                <input
                  type="text"
                  value={entry.text}
                  onChange={(e) => setEntryText(entry.id, e.target.value)}
                  className={`min-w-0 flex-1 bg-transparent text-[11px] leading-snug outline-none ${
                    entry.done
                      ? "text-emerald-100/75 line-through"
                      : "text-violet-50"
                  }`}
                  placeholder="明日やること…"
                />
                <button
                  type="button"
                  onClick={() => deleteEntry(entry.id)}
                  className="shrink-0 px-1 text-[10px] text-zinc-500 hover:text-rose-300"
                  aria-label="メモを削除"
                  title="削除"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={addEntry}
            className="w-full rounded-lg border border-violet-400/35 bg-violet-950/50 py-1.5 text-[10px] font-bold text-violet-100 hover:bg-violet-900/50"
          >
            ＋ メモを追加
          </button>
          {doneCount > 0 && (
            <button
              type="button"
              onClick={clearDone}
              className="w-full rounded-lg border border-zinc-600/50 bg-zinc-900/70 py-1.5 text-[10px] font-semibold text-zinc-300 hover:bg-zinc-800/90"
            >
              チェックをすべて外す
            </button>
          )}
        </div>
      )}
    </div>
  );
}
