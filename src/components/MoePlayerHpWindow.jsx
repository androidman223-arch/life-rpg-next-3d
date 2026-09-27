"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MoeBuffIconStrip from "@/components/MoeBuffIconStrip";
import {
  displayMoePlayerStamina,
  moeVitalBarPct,
} from "@/lib/moePlayerVitals";
import { MOE_PLAYER_BUFF_COLUMNS } from "@/lib/moeBuffUi";
import MoeFloatingPanelRoot from "@/components/MoeFloatingPanelRoot";
import {
  MOE_PANEL_ALLY_SELECTED_MIN_Z,
  MOE_PANEL_ID_PET_HP,
  MOE_PANEL_ID_PLAYER_HP,
  moeFloatingDragTitle,
} from "@/lib/moePanelStack";

const WINDOW_W = 130;
const SIDE_CAP_W = 7;
const BAR_H_PX = 10;
const STORAGE_KEY = MOE_PANEL_ID_PLAYER_HP;
const PET_STORAGE_KEY = MOE_PANEL_ID_PET_HP;

const MOE_HP_RED = "#ef4444";
const MOE_STAMINA_YELLOW = "#eab308";
const MOE_MP_PINK = "#ec4899";

function loadSavedPos() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.x !== "number" || typeof p?.y !== "number") return null;
    const petRaw = localStorage.getItem(PET_STORAGE_KEY);
    if (petRaw) {
      const pet = JSON.parse(petRaw);
      if (
        typeof pet?.x === "number" &&
        typeof pet?.y === "number" &&
        Math.abs(p.x - pet.x) < WINDOW_W * 0.85 &&
        Math.abs(p.y - pet.y) < 44
      ) {
        return { x: Math.max(8, 12), y: pet.y + 48 };
      }
    }
    return { x: p.x, y: p.y };
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * @param {{ pct: number, color: string, label: string, displayText: string }} props
 */
function MoeCompactResourceBar({ pct, color, label, displayText, smooth = true }) {
  return (
    <div
      className="relative flex"
      style={{ height: BAR_H_PX }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="shrink-0 bg-gradient-to-b from-slate-200/95 to-slate-400/90"
        style={{ width: SIDE_CAP_W }}
        aria-hidden
      />
      <div className="relative min-w-0 flex-1 overflow-hidden bg-zinc-950">
        <div
          className={
            smooth
              ? "absolute inset-y-0 left-0 transition-[width] duration-150"
              : "absolute inset-y-0 left-0"
          }
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-[8px] font-bold leading-none text-white drop-shadow-[0_0_2px_rgba(0,0,0,1),0_1px_2px_rgba(0,0,0,0.9)]"
        >
          {displayText}
        </span>
      </div>
      <div
        className="shrink-0 bg-gradient-to-b from-slate-200/95 to-slate-400/90"
        style={{ width: SIDE_CAP_W }}
        aria-hidden
      />
    </div>
  );
}

/**
 * MOE風プレイヤー窓 — 名前 + HP（赤）/ スタミナ（黄）/ MP（ピンク）の3行バー
 */
export default function MoePlayerHpWindow({
  name,
  hp,
  hpMax,
  stamina,
  staminaMax,
  mp,
  mpMax,
  buffSlots = [],
  allySelected = false,
  onSelectAllyTarget,
}) {
  const [pos, setPos] = useState(null);
  const canSaveRef = useRef(false);
  const sizeRef = useRef({ w: WINDOW_W, h: 48 });
  useEffect(() => {
    canSaveRef.current = false;
    const saved = loadSavedPos();
    setPos(
      saved ?? {
        x: Math.max(8, 12),
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

  if (!pos) return null;

  const hpPct = moeVitalBarPct(hp, hpMax);
  const staminaDisplay = displayMoePlayerStamina(stamina);
  const staminaPct = moeVitalBarPct(stamina, staminaMax);
  const mpPct = moeVitalBarPct(mp, mpMax);

  return (
    <MoeFloatingPanelRoot
      panelId={STORAGE_KEY}
      minZIndex={allySelected ? MOE_PANEL_ALLY_SELECTED_MIN_Z : 0}
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed pointer-events-auto select-none"
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
          className="cursor-grab touch-none bg-gradient-to-b from-emerald-600 to-emerald-800 px-1.5 py-0.5 active:cursor-grabbing"
          onPointerDown={onDragPointerDown}
          title={moeFloatingDragTitle("ターゲット · ドラッグで移動")}
        >
          <p className="truncate text-center text-[9px] font-bold leading-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]">
            🧑 {name}
          </p>
        </div>
        <div className="h-px shrink-0 bg-white/60" aria-hidden />
        <div
          className="flex w-full flex-col gap-px bg-black py-px"
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
          <MoeCompactResourceBar
            pct={hpPct}
            color={MOE_HP_RED}
            label={`${name} HP`}
            displayText={`HP ${hp}/${hpMax}`}
          />
          <MoeCompactResourceBar
            pct={staminaPct}
            color={MOE_STAMINA_YELLOW}
            label={`${name} スタミナ`}
            displayText={`スタミナ ${staminaDisplay}/${staminaMax}`}
            smooth={false}
          />
          <MoeCompactResourceBar
            pct={mpPct}
            color={MOE_MP_PINK}
            label={`${name} MP`}
            displayText={`MP ${mp}/${mpMax}`}
          />
        </div>
        <div className="h-[3px] shrink-0 bg-black" aria-hidden />
        <MoeBuffIconStrip
          slots={buffSlots}
          columns={MOE_PLAYER_BUFF_COLUMNS}
          rows={1}
        />
      </div>
    </MoeFloatingPanelRoot>
  );
}
