"use client";

import { useEffect, useRef, useState } from "react";

function useSmoothDuelBar(duelRef, barKey, active) {
  const [pct, setPct] = useState(0);
  const smoothRef = useRef(0);

  useEffect(() => {
    if (!active || !duelRef) {
      smoothRef.current = 0;
      setPct(0);
      return undefined;
    }

    let raf = 0;
    const tick = () => {
      const d = duelRef.current;
      const target =
        d?.phase === "simultaneous_charge" && typeof d?.[barKey] === "number"
          ? d[barKey]
          : 0;

      let s = smoothRef.current;
      if (target < s - 0.03) {
        s = target;
      } else {
        s += (target - s) * 0.22;
      }
      smoothRef.current = s;
      setPct(Math.max(0, Math.min(100, s * 100)));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, duelRef, barKey]);

  return pct;
}

/**
 * MOE風・大きいタイムバーウィンドウ（画面下・22rem）
 * @param {{ duelRef: { current: object | null }, phase: string, petEmoji: string, enemyEmoji: string, enemyName?: string, petChargeSec?: number, enemyChargeSec?: number, battleSpeed2x?: boolean }} props
 */
export default function MoeDuelTimeBarWindow({
  duelRef,
  phase,
  petEmoji,
  enemyEmoji,
  enemyName = "",
  petChargeSec = 3,
  enemyChargeSec = 5,
  battleSpeed2x = false,
}) {
  const [livePhase, setLivePhase] = useState(phase);
  const charging = livePhase === "simultaneous_charge";
  const petPct = useSmoothDuelBar(duelRef, "petBar", charging);
  const enemyPct = useSmoothDuelBar(duelRef, "enemyBar", charging);

  useEffect(() => {
    if (!duelRef) return undefined;
    let raf = 0;
    const tick = () => {
      setLivePhase(duelRef.current?.phase ?? phase);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duelRef, phase]);

  if (livePhase !== "approach" && livePhase !== "simultaneous_charge") {
    return null;
  }

  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-[55] w-[min(92vw,22rem)] max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-xl border border-white/25 bg-black/82 px-3 py-2.5 text-white shadow-lg backdrop-blur-md sm:bottom-10">
      <p className="text-center text-[10px] font-bold text-cyan-200">
        交戦中
        {enemyName ? ` ${enemyEmoji} ${enemyName}` : ""}
        {battleSpeed2x ? (
          <span className="ml-1 text-yellow-300">⚡×2</span>
        ) : null}
      </p>
      {livePhase === "approach" && (
        <p className="mt-1 text-center text-[10px] text-white/85">
          ペットが敵の正面へ移動中…
        </p>
      )}
      {livePhase === "simultaneous_charge" && (
        <div className="mt-2 space-y-2">
          <div>
            <div className="mb-0.5 flex justify-between text-[9px] text-amber-100/95">
              <span>
                {petEmoji} ペット（アタック）
              </span>
              <span className="font-mono opacity-80">{petChargeSec}s</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-[width] duration-75"
                style={{ width: `${petPct}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-0.5 flex justify-between text-[9px] text-rose-100/95">
              <span>
                {enemyEmoji} 敵の攻撃
              </span>
              <span className="font-mono opacity-80">{enemyChargeSec}s</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500 transition-[width] duration-75"
                style={{ width: `${enemyPct}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
