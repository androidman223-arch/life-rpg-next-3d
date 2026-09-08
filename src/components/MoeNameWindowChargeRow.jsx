"use client";

import { useEffect, useRef, useState } from "react";

const SIDE_CAP_W = 7;

/**
 * MOE風ネームウィンドウ3行目：交戦チャージ（または接近中表示）
 * @param {{ phase?: string, duelRef?: { current: object | null }, barKey?: 'petBar' | 'enemyBar', fillColor: string, ariaLabel: string }} props
 */
export default function MoeNameWindowChargeRow({
  phase,
  duelRef,
  barKey = "petBar",
  fillColor,
  ariaLabel,
}) {
  const [displayPct, setDisplayPct] = useState(0);
  const smoothRef = useRef(0);

  useEffect(() => {
    if (phase !== "simultaneous_charge" || !duelRef) {
      smoothRef.current = 0;
      setDisplayPct(0);
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
      setDisplayPct(Math.max(0, Math.min(100, s * 100)));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, duelRef, barKey]);

  if (phase !== "approach" && phase !== "simultaneous_charge") return null;

  if (phase === "approach") {
    return (
      <>
        <div className="h-px shrink-0 bg-white/40" aria-hidden />
        <p className="bg-zinc-950 py-0.5 text-center text-[7px] font-bold leading-none text-cyan-200/95">
          接近中
        </p>
      </>
    );
  }

  return (
    <>
      <div className="h-px shrink-0 bg-white/40" aria-hidden />
      <div
        className="flex h-2 rounded-none"
        role="progressbar"
        aria-valuenow={Math.round(displayPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div
          className="shrink-0 bg-gradient-to-b from-slate-200/95 to-slate-400/90"
          style={{ width: SIDE_CAP_W }}
          aria-hidden
        />
        <div className="min-w-0 flex-1 overflow-hidden rounded-b-[1.5px] bg-zinc-950">
          <div
            className="block h-full rounded-bl-[1.5px] transition-[width] duration-75"
            style={{ width: `${displayPct}%`, backgroundColor: fillColor }}
          />
        </div>
        <div
          className="shrink-0 bg-gradient-to-b from-slate-200/95 to-slate-400/90"
          style={{ width: SIDE_CAP_W }}
          aria-hidden
        />
      </div>
    </>
  );
}
