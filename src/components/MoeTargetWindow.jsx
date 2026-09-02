"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WINDOW_W = 130;
const SIDE_CAP_W = 7;
const MOE_HP_RED = "#ef4444";

function hpPct(current, max) {
  const m = Number(max);
  if (!m || m <= 0) return 0;
  return Math.max(0, Math.min(100, (Number(current) / m) * 100));
}

function enemyLevelInt(level) {
  return Math.max(0, Math.round(Number(level) || 0));
}

export default function MoeTargetWindow({ target }) {
  const [pos, setPos] = useState(null);
  const sizeRef = useRef({ w: WINDOW_W, h: 32 });

  useEffect(() => {
    if (!target) return;
    setPos(
      (p) =>
        p ?? {
          x: Math.max(8, (window.innerWidth - WINDOW_W) / 2),
          y: 56,
        }
    );
  }, [target]);

  const clampPos = useCallback((x, y) => {
    const { w, h } = sizeRef.current;
    return {
      x: Math.max(4, Math.min(window.innerWidth - w - 4, x)),
      y: Math.max(4, Math.min(window.innerHeight - h - 4, y)),
    };
  }, []);

  const onHeaderPointerDown = useCallback(
    (e) => {
      if (e.button !== 0 || pos == null) return;
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

  if (!target || pos == null) return null;

  const pct = hpPct(target.hp, target.hpMax);
  const hpNow = Math.ceil(target.hp);
  const hpMax = target.hpMax;
  const lv = enemyLevelInt(target.level);
  const prefix = target.superBoss ? "◆ " : target.midBoss ? "★ " : "";

  return (
    <div
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed z-[48] select-none"
      style={{ left: pos.x, top: pos.y, width: WINDOW_W }}
    >
      <div className="overflow-hidden rounded-[4px] border border-slate-300/90 bg-black shadow-[0_1px_5px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14)]">
        <div
          className="cursor-grab touch-none bg-gradient-to-b from-blue-600 to-blue-800 px-1.5 py-0.5 active:cursor-grabbing"
          onPointerDown={onHeaderPointerDown}
          title="ドラッグで移動"
        >
          <p className="truncate text-center text-[9px] font-bold leading-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]">
            {prefix}
            {target.emoji} {target.name}{" "}
            <span className="tabular-nums text-blue-100/90">Lv.{lv}</span>
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
      </div>
    </div>
  );
}
