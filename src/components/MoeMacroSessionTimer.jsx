"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  formatMacroTimerClock,
  getMacroTimerSnapshot,
  MOE_MACRO_TIMER_PRESET_MINUTES,
  startMacroTimer,
  stopMacroTimer,
} from "@/lib/moeMacroSessionTimer";

const IDLE_MACRO_TIMER_SNAP = {
  running: false,
  finished: false,
  remainingSec: 0,
  totalSec: 0,
};

/**
 * マクロ用カウントダウン（1秒ごと更新 · 0:00 で終了表示）
 */
export default function MoeMacroSessionTimer({ onFinished }) {
  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState(IDLE_MACRO_TIMER_SNAP);
  const [finishedFlash, setFinishedFlash] = useState(false);

  useEffect(() => {
    const tick = () => {
      const next = getMacroTimerSnapshot();
      setSnap((prev) => {
        if (prev.running && next.finished) {
          setFinishedFlash(true);
          onFinished?.(next);
        }
        return next;
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [onFinished]);

  const handleStart = useCallback((minutes) => {
    startMacroTimer(minutes);
    setFinishedFlash(false);
    setSnap(getMacroTimerSnapshot());
    setOpen(true);
  }, []);

  const handleStop = useCallback(() => {
    stopMacroTimer();
    setFinishedFlash(false);
    setSnap(getMacroTimerSnapshot());
  }, []);

  const running = snap.running;
  const showBar = running || snap.finished || finishedFlash || open;

  if (!showBar && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pointer-events-auto fixed left-1/2 top-2 z-[58] -translate-x-1/2 rounded-full border border-amber-400/45 bg-zinc-950/88 px-3 py-1 text-[10px] font-bold text-amber-100 shadow-lg backdrop-blur-sm transition hover:bg-zinc-900 active:scale-95"
        aria-label="マクロ４タイマーを開く"
      >
        ⏱ マクロ４
      </button>
    );
  }

  const clock = formatMacroTimerClock(
    snap.finished || finishedFlash ? 0 : snap.remainingSec
  );
  const urgent = snap.remainingSec > 0 && snap.remainingSec <= 60;

  return (
    <div
      className="pointer-events-auto fixed left-1/2 top-2 z-[58] flex w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 flex-col items-stretch gap-1.5 rounded-xl border border-amber-400/40 bg-zinc-950/92 px-3 py-2 shadow-xl backdrop-blur-md"
      role="timer"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold text-amber-200/90">
          {snap.label ?? "マクロ４"}
        </p>
        <button
          type="button"
          onClick={() => {
            if (running) handleStop();
            setOpen(false);
            setFinishedFlash(false);
          }}
          className="rounded px-1.5 py-0.5 text-[9px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          {running ? "停止" : "閉じる"}
        </button>
      </div>

      <p
        className={`text-center font-mono text-4xl font-black tabular-nums tracking-wider ${
          snap.finished || finishedFlash
            ? "text-rose-400 animate-pulse"
            : urgent
              ? "text-amber-300"
              : "text-amber-50"
        }`}
      >
        {clock}
      </p>

      {snap.finished || finishedFlash ? (
        <p className="text-center text-[11px] font-bold text-rose-200">
          0 — タイマー終了！
        </p>
      ) : running ? (
        <p className="text-center text-[9px] text-zinc-400">
          1秒ごとにカウントダウン · 0:00 で終了
        </p>
      ) : (
        <div className="grid grid-cols-6 gap-1">
          {MOE_MACRO_TIMER_PRESET_MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleStart(m)}
              className="rounded-md border border-amber-500/40 bg-amber-950/60 py-1.5 text-[10px] font-bold text-amber-50 transition hover:bg-amber-900/70 active:scale-95"
            >
              {m}分
            </button>
          ))}
        </div>
      )}

      {running && (
        <button
          type="button"
          onClick={handleStop}
          className="rounded-lg border border-zinc-600 bg-zinc-900 py-1 text-[10px] font-bold text-zinc-300 hover:bg-zinc-800"
        >
          タイマー停止
        </button>
      )}
    </div>
  );
}
