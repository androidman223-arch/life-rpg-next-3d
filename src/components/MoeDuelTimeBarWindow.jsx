"use client";

import { useEffect, useRef, useState } from "react";
import { useMoeDuelTimeBarLayout } from "@/hooks/useMoeDuelTimeBarLayout";
import { MOE_DUEL_TIME_BAR_DEFAULT_WIDTH } from "@/lib/moeDuelTimeBarLayout";
import MoeFloatingPanelRoot from "@/components/MoeFloatingPanelRoot";
import {
  MOE_PANEL_ID_DUEL_TIME_BAR,
  moeFloatingDragTitle,
} from "@/lib/moePanelStack";

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
 * MOE風・交戦タイムバー（ドラッグ移動 · 右下で幅変更）
 * @param {{ duelRef: { current: object | null }, phase: string, petEmoji: string, enemyEmoji: string, petChargeSec?: number, enemyChargeSec?: number }} props
 */
export default function MoeDuelTimeBarWindow({
  duelRef,
  phase,
  petEmoji,
  enemyEmoji,
  petChargeSec = 3,
  enemyChargeSec = 5,
}) {
  const [livePhase, setLivePhase] = useState(phase);
  const charging = livePhase === "simultaneous_charge";
  const petPct = useSmoothDuelBar(duelRef, "petBar", charging);
  const enemyPct = useSmoothDuelBar(duelRef, "enemyBar", charging);
  const { layout, panelRef, onDragPointerDown, onResizePointerDown } =
    useMoeDuelTimeBarLayout();
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

  if (!layout) return null;

  const scale = layout.width / MOE_DUEL_TIME_BAR_DEFAULT_WIDTH;
  const barH = Math.max(8, Math.round(10 * scale));
  const labelSize = Math.max(8, Math.round(9 * scale));

  return (
    <MoeFloatingPanelRoot
      ref={panelRef}
      panelId={MOE_PANEL_ID_DUEL_TIME_BAR}
      className="pointer-events-auto fixed max-w-[calc(100vw-0.5rem)] rounded-xl border border-white/25 bg-black/82 text-white shadow-lg backdrop-blur-md"
      style={{
        left: layout.x,
        top: layout.y,
        width: layout.width,
      }}
    >
      <div
        className="h-1.5 cursor-grab touch-none select-none rounded-t-xl bg-white/8 active:cursor-grabbing"
        onPointerDown={onDragPointerDown}
        title={moeFloatingDragTitle("ドラッグで移動")}
        aria-label="ドラッグで移動"
      />
      <div className="px-2 pb-1.5 pt-0.5">
        {livePhase === "approach" && (
          <p className="text-center text-[9px] text-white/75">移動中…</p>
        )}
        {livePhase === "simultaneous_charge" && (
          <div className="space-y-1">
            <div>
              <div
                className="mb-0.5 flex justify-between text-amber-100/95"
                style={{ fontSize: labelSize }}
              >
                <span>{petEmoji} ペット（アタック）</span>
                <span className="font-mono opacity-80">{petChargeSec}s</span>
              </div>
              <div
                className="overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10"
                style={{ height: barH }}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-[width] duration-75"
                  style={{ width: `${petPct}%` }}
                />
              </div>
            </div>
            <div>
              <div
                className="mb-0.5 flex justify-between text-rose-100/95"
                style={{ fontSize: labelSize }}
              >
                <span>{enemyEmoji} 敵の攻撃</span>
                <span className="font-mono opacity-80">{enemyChargeSec}s</span>
              </div>
              <div
                className="overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10"
                style={{ height: barH }}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500 transition-[width] duration-75"
                  style={{ width: `${enemyPct}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="タイムバーサイズ変更"
        className="absolute bottom-0 right-0 z-10 flex h-5 w-5 cursor-nwse-resize touch-none items-end justify-end rounded-br-xl pb-0.5 pr-0.5"
        onPointerDown={onResizePointerDown}
        title="右下をドラッグで拡大・縮小"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className="pointer-events-none text-white/45"
          aria-hidden
        >
          <path
            d="M9 1v8H1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M9 5v4H5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </MoeFloatingPanelRoot>
  );
}
