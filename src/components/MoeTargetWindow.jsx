"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MoeNameWindowChargeRow from "@/components/MoeNameWindowChargeRow";

const WINDOW_W = 130;
const SIDE_CAP_W = 7;
const MOE_HP_RED = "#ef4444";
const MOE_ENEMY_CHARGE = "#f97316";

function hpPct(current, max) {
  const m = Number(max);
  if (!m || m <= 0) return 0;
  return Math.max(0, Math.min(100, (Number(current) / m) * 100));
}

/**
 * @param {{
 *   target?: object|null,
 *   duelUi?: object|null,
 *   allyTarget?: { emoji?: string, name?: string, hp?: number, hpMax?: number, mp?: number, mpMax?: number }|null,
 *   allyTargetMode?: 'player' | 'pet',
 *   onSelectAllyTarget?: (id: 'player' | 'pet') => void,
 * }} props
 */
export default function MoeTargetWindow({
  target,
  duelUi = null,
  allyTarget = null,
  allyTargetMode = "pet",
  onSelectAllyTarget,
}) {
  const [pos, setPos] = useState({ x: 8, y: 56 });

  useEffect(() => {
    setPos({
      x: Math.max(8, (window.innerWidth - WINDOW_W) / 2),
      y: 56,
    });
  }, []);
  const sizeRef = useRef({ w: WINDOW_W, h: 32 });

  const clampPos = useCallback((x, y) => {
    const { w, h } = sizeRef.current;
    return {
      x: Math.max(4, Math.min(window.innerWidth - w - 4, x)),
      y: Math.max(4, Math.min(window.innerHeight - h - 4, y)),
    };
  }, []);

  const onHeaderPointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const drag = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        ox: pos.x,
        oy: pos.y,
      };
      const onMove = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        setPos(
          clampPos(
            drag.ox + ev.clientX - drag.startX,
            drag.oy + ev.clientY - drag.startY
          )
        );
      };
      const onUp = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [clampPos, pos]
  );

  const pct = target ? hpPct(target.hp, target.hpMax) : 0;
  const hpNow = target ? Math.ceil(target.hp) : 0;
  const hpMax = target?.hpMax ?? 0;
  const prefix = target?.superBoss ? "◆ " : target?.midBoss ? "★ " : "";
  const allyMpPct = allyTarget ? hpPct(allyTarget.mp, allyTarget.mpMax) : 0;
  const allyMpNow = allyTarget ? Math.ceil(allyTarget.mp ?? 0) : 0;
  const allyMpMax = allyTarget?.mpMax ?? 0;
  const showAlly = Boolean(onSelectAllyTarget);
  const visible = Boolean(target || showAlly);

  const allyBtnClass = (id) =>
    allyTargetMode === id
      ? "border-cyan-200/80 bg-cyan-700/90 text-cyan-50 ring-1 ring-cyan-200/40"
      : "border-cyan-800/50 bg-cyan-950/70 text-cyan-100/85 hover:bg-cyan-900/50";

  return (
    <div
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed z-[57] pointer-events-auto select-none"
      style={{
        left: pos.x,
        top: pos.y,
        width: WINDOW_W,
        visibility: visible ? "visible" : "hidden",
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-hidden={!visible}
    >
      {target ? (
        <div className="overflow-hidden rounded-[4px] border border-slate-300/90 bg-black shadow-[0_1px_5px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14)]">
          <div
            className="cursor-grab touch-none bg-gradient-to-b from-blue-600 to-blue-800 px-1.5 py-0.5 active:cursor-grabbing"
            onPointerDown={onHeaderPointerDown}
            title="ドラッグで移動"
          >
            <p className="truncate text-center text-[9px] font-bold leading-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]">
              {prefix}
              {target.emoji} {target.name}
            </p>
          </div>
          <div className="h-px shrink-0 bg-white/60" aria-hidden />
          <div
            className="flex h-2.5"
            role="progressbar"
            aria-valuenow={hpNow}
            aria-valuemin={0}
            aria-valuemax={hpMax}
            aria-label={`${target.name} HP`}
          >
            <div
              className="shrink-0 bg-gradient-to-b from-slate-200/95 to-slate-400/90"
              style={{ width: SIDE_CAP_W }}
              aria-hidden
            />
            <div className="relative min-w-0 flex-1 overflow-hidden rounded-b-[1.5px] bg-zinc-950">
              <div
                className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none"
                aria-hidden
              >
                <span className="text-[7px] font-bold tabular-nums leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  {hpNow} / {hpMax}
                </span>
              </div>
              <div
                className="relative z-0 block h-full rounded-bl-[1.5px] transition-[width] duration-150"
                style={{ width: `${pct}%`, backgroundColor: MOE_HP_RED }}
              />
            </div>
            <div
              className="shrink-0 bg-gradient-to-b from-slate-200/95 to-slate-400/90"
              style={{ width: SIDE_CAP_W }}
              aria-hidden
            />
          </div>
          {duelUi ? (
            <MoeNameWindowChargeRow
              phase={duelUi.phase}
              duelRef={duelUi.duelRef}
              barKey={duelUi.barKey}
              fillColor={MOE_ENEMY_CHARGE}
              ariaLabel={`${target.name} 攻撃チャージ`}
            />
          ) : null}
        </div>
      ) : null}
      {showAlly ? (
        <div
          className={`overflow-hidden rounded-[4px] border border-cyan-300/75 bg-black shadow-[0_1px_5px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14)] ${
            target ? "mt-1" : ""
          }`}
        >
          <div className="bg-gradient-to-b from-cyan-700 to-cyan-950 px-1 py-0.5">
            <p className="text-center text-[7px] font-bold leading-tight text-cyan-50">
              支援ターゲット
            </p>
            <div className="mt-0.5 flex gap-0.5">
              <button
                type="button"
                onClick={() => onSelectAllyTarget?.("player")}
                className={`min-w-0 flex-1 rounded border px-0.5 py-0.5 text-[7px] font-bold leading-none transition active:scale-95 ${allyBtnClass("player")}`}
              >
                🧑 プレイヤー
              </button>
              <button
                type="button"
                onClick={() => onSelectAllyTarget?.("pet")}
                className={`min-w-0 flex-1 rounded border px-0.5 py-0.5 text-[7px] font-bold leading-none transition active:scale-95 ${allyBtnClass("pet")}`}
              >
                🐾 ペット
              </button>
            </div>
          </div>
          {allyTarget ? (
            <>
              <div className="h-px shrink-0 bg-white/60" aria-hidden />
              <p className="truncate bg-cyan-950/50 px-1 py-0.5 text-center text-[8px] font-bold text-cyan-100">
                {allyTarget.emoji} {allyTarget.name}
              </p>
              <div
                className="flex h-2.5"
                role="progressbar"
                aria-valuenow={allyMpNow}
                aria-valuemin={0}
                aria-valuemax={allyMpMax}
                aria-label={`${allyTarget.name} MP`}
              >
                <div
                  className="shrink-0 bg-gradient-to-b from-slate-200/95 to-slate-400/90"
                  style={{ width: SIDE_CAP_W }}
                  aria-hidden
                />
                <div className="relative min-w-0 flex-1 overflow-hidden bg-zinc-950">
                  <div
                    className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none"
                    aria-hidden
                  >
                    <span className="text-[7px] font-bold tabular-nums leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                      MP {allyMpNow}/{allyMpMax}
                    </span>
                  </div>
                  <div
                    className="relative z-0 block h-full transition-[width] duration-150"
                    style={{ width: `${allyMpPct}%`, backgroundColor: "#ec4899" }}
                  />
                </div>
                <div
                  className="shrink-0 bg-gradient-to-b from-slate-200/95 to-slate-400/90"
                  style={{ width: SIDE_CAP_W }}
                  aria-hidden
                />
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
