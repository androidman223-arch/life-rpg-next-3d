"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MoeNameWindowChargeRow from "@/components/MoeNameWindowChargeRow";

const WINDOW_W = 130;
const SIDE_CAP_W = 7;
const STORAGE_KEY = "life-rpg-moe-pet-hp-window-pos";
const MOE_HP_RED = "#ef4444";
const MOE_PET_CHARGE = "#eab308";

function hpPct(current, max) {
  const m = Number(max);
  if (!m || m <= 0) return 0;
  return Math.max(0, Math.min(100, (Number(current) / m) * 100));
}

function loadSavedPos() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.x === "number" && typeof p?.y === "number") {
      return { x: p.x, y: p.y };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * MOE風ペットHP窓（上：青・名前 / 中央：区切り線 / 下：赤HPバー）
 * @param {{ emoji: string, name: string, levelLabel?: string, hp: number, hpMax: number, duelUi?: { phase: string, bar?: number, chargeFrozenUntil?: number } | null, allySelected?: boolean, onSelectAllyTarget?: () => void }} props
 */
export default function MoePetHpWindow({
  emoji,
  name,
  levelLabel = null,
  hp,
  hpMax,
  duelUi = null,
  allySelected = false,
  onSelectAllyTarget,
}) {
  const [pos, setPos] = useState(null);
  const canSaveRef = useRef(false);
  const sizeRef = useRef({ w: WINDOW_W, h: 32 });

  useEffect(() => {
    canSaveRef.current = false;
    const saved = loadSavedPos();
    setPos(
      saved ?? {
        x: Math.max(8, WINDOW_W + 20),
        y: Math.max(56, window.innerHeight * 0.12),
      }
    );
    canSaveRef.current = true;
  }, []);

  useEffect(() => {
    if (!canSaveRef.current || pos == null) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch {
      /* quota */
    }
  }, [pos]);

  const clampPos = useCallback((x, y) => {
    const { w, h } = sizeRef.current;
    return {
      x: Math.max(4, Math.min(window.innerWidth - w - 4, x)),
      y: Math.max(4, Math.min(window.innerHeight - h - 4, y)),
    };
  }, []);

  const onDragPointerDown = useCallback(
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
        moved: false,
      };
      const onMove = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        if (
          Math.abs(ev.clientX - drag.startX) > 4 ||
          Math.abs(ev.clientY - drag.startY) > 4
        ) {
          drag.moved = true;
        }
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
        if (!drag.moved) onSelectAllyTarget?.();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [clampPos, onSelectAllyTarget, pos]
  );

  const pct = hpPct(hp, hpMax);

  if (!pos) return null;

  return (
    <div
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className={`fixed pointer-events-auto select-none ${allySelected ? "z-[58]" : "z-[54]"}`}
      style={{ left: pos.x, top: pos.y, width: WINDOW_W }}
    >
      <div
        className={`overflow-hidden rounded-[4px] border bg-black shadow-[0_1px_5px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14)] ${
          allySelected
            ? "border-cyan-300/90 ring-1 ring-cyan-300/55"
            : "border-slate-300/90"
        } ${onSelectAllyTarget ? "cursor-pointer hover:brightness-110" : ""}`}
      >
        <div
          className="cursor-grab touch-none bg-gradient-to-b from-blue-600 to-blue-800 px-1.5 py-0.5 active:cursor-grabbing"
          onPointerDown={onDragPointerDown}
          title="クリックでターゲット · ドラッグで移動"
        >
          <p className="truncate text-center text-[9px] font-bold leading-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]">
            {emoji} {name}
          </p>
          {levelLabel ? (
            <p
              key={`pet-hp-lv-${levelLabel}`}
              className="text-center text-[8px] tabular-nums leading-none text-blue-100/90"
            >
              Lv.{levelLabel}
            </p>
          ) : null}
        </div>
        <div className="h-px shrink-0 bg-white/60" aria-hidden />
        <div
          role="button"
          tabIndex={0}
          title="クリックで支援ターゲットにする"
          onClick={() => onSelectAllyTarget?.()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectAllyTarget?.();
            }
          }}
        >
        <div className="flex h-2.5 w-full rounded-none" aria-label={`${name} HP`}>
          <div
            className="shrink-0 bg-gradient-to-b from-slate-200/95 to-slate-400/90"
            style={{ width: SIDE_CAP_W }}
            aria-hidden
          />
          <div className="min-w-0 flex-1 overflow-hidden rounded-b-[1.5px] bg-zinc-950">
            <div
              className="block h-full rounded-bl-[1.5px] transition-[width] duration-150"
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
            fillColor={MOE_PET_CHARGE}
            ariaLabel={`${name} アタックチャージ`}
          />
        ) : null}
        </div>
      </div>
    </div>
  );
}
