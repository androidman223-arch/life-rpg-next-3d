"use client";

import { useCallback, useState } from "react";
import {
  moeSkillMacroWaitChoices,
  MOE_SKILL_MACRO_COUNT,
} from "@/lib/moeSkillMacro";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import MoeFloatingPanelRoot from "@/components/MoeFloatingPanelRoot";
import {
  MOE_PANEL_ID_SKILL_MACRO,
  moeFloatingDragTitle,
} from "@/lib/moePanelStack";

function defaultMacroPanelPos() {
  if (typeof window === "undefined") return { x: 16, y: 56 };
  return {
    x: Math.max(8, window.innerWidth - 280),
    y: 56,
  };
}

const WAIT_CHOICES = moeSkillMacroWaitChoices();

function skillLabel(catalog, ref) {
  if (!ref) return null;
  const found = (catalog?.[ref.source] || []).find(
    (slot) => slot?.slotKey === ref.slotKey
  );
  if (!found) return "—";
  return found.label || found.slotKey;
}

/**
 * マクロ 1〜10。1と3は技、2は待ち時間。設定はここ。発動は縦スキルの技②。
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   macroIndex: number,
 *   onSelectMacro: (index: number) => void,
 *   macros: { skillA: object|null, waitSec: number|null, skillB: object|null }[],
 *   catalog: Record<string, object[]>,
 *   onPickWait: (sec: number) => void,
 *   onRun: () => void,
 * }} props
 */
export default function MoeSkillMacroPanel({
  open,
  onClose,
  macroIndex,
  onSelectMacro,
  macros,
  catalog,
  onPickWait,
  onRun,
}) {
  const [waitListOpen, setWaitListOpen] = useState(false);
  const { pos, sizeRef, onDragPointerDown } = useMoeDraggablePos(
    MOE_PANEL_ID_SKILL_MACRO,
    defaultMacroPanelPos
  );
  const onHeaderPointerDown = useCallback(
    (event) => {
      onDragPointerDown(event);
    },
    [onDragPointerDown]
  );
  const current = macros[macroIndex] ?? macros[0];
  const skillA = skillLabel(catalog, current?.skillA);
  const skillB = skillLabel(catalog, current?.skillB);

  if (!open || pos == null) return null;

  const onWaitPointerDown = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    let moved = false;

    const onMove = (ev) => {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 6) moved = true;
    };
    const onUp = (ev) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const node = document.elementFromPoint(ev.clientX, ev.clientY);
      const slot = node?.closest?.("[data-moe-skill-panel='macro']");
      const index = Number(slot?.getAttribute("data-moe-skill-slot"));
      if (moved && index === 1) setWaitListOpen(true);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <MoeFloatingPanelRoot
      panelId={MOE_PANEL_ID_SKILL_MACRO}
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed flex items-start gap-2"
      style={{ left: pos.x, top: pos.y }}
    >
      <section className="w-[15.5rem] rounded-lg border border-amber-300/50 bg-zinc-950/95 p-2 text-amber-50 shadow-lg backdrop-blur-sm">
        <header
          className="mb-2 flex cursor-grab touch-none select-none items-center justify-between gap-2 active:cursor-grabbing"
          onPointerDown={onHeaderPointerDown}
          title={moeFloatingDragTitle("ドラッグで移動")}
        >
          <h2 className="text-[12px] font-bold">マクロ設定</h2>
          <button
            type="button"
            onClick={onClose}
            onPointerDown={(event) => event.stopPropagation()}
            className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-zinc-200"
          >
            閉じる
          </button>
        </header>
        <div className="mb-2 grid grid-cols-5 gap-1" role="tablist" aria-label="マクロセット">
          {Array.from({ length: MOE_SKILL_MACRO_COUNT }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={macroIndex === i}
              onClick={() => {
                onSelectMacro(i);
                setWaitListOpen(false);
              }}
              className={`h-7 rounded border text-[11px] font-bold ${
                macroIndex === i
                  ? "border-amber-200 bg-amber-500 text-zinc-950"
                  : "border-amber-700/50 bg-zinc-900 text-amber-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <MacroSlot
            index={0}
            kind="skill"
            label={skillA || "技"}
            filled={Boolean(skillA)}
          />
          <MacroSlot
            index={1}
            kind="wait"
            label={current?.waitSec != null ? `${current.waitSec}秒` : "待ち"}
            filled={current?.waitSec != null}
          />
          <MacroSlot
            index={2}
            kind="skill"
            label={skillB || "技"}
            filled={Boolean(skillB)}
          />
        </div>
        <p className="mt-1 text-center text-[9px] text-amber-100/70">
          1と3へ技を長押しドロップ · 2へ待ち時間
        </p>
        <button
          type="button"
          onClick={onRun}
          className="mt-2 w-full rounded border border-amber-200/80 bg-amber-500 py-1.5 text-[12px] font-bold text-zinc-950 active:scale-[0.98]"
        >
          マクロ{macroIndex + 1} を実行
        </button>
        <button
          type="button"
          onPointerDown={onWaitPointerDown}
          className="mt-1 w-full cursor-grab rounded border border-sky-300/60 bg-sky-900/80 py-1.5 text-[11px] font-bold text-sky-50 active:cursor-grabbing"
        >
          待ち時間
        </button>
      </section>
      {waitListOpen ? (
        <section className="flex max-h-[min(70vh,28rem)] w-16 flex-col rounded-lg border border-sky-300/50 bg-zinc-950/95 shadow-lg">
          <p className="shrink-0 border-b border-white/10 py-1 text-center text-[10px] font-bold text-sky-100">
            何秒
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {WAIT_CHOICES.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  onPickWait(sec);
                  setWaitListOpen(false);
                }}
                className={`block w-full border-b border-white/5 py-1.5 text-[12px] font-bold ${
                  current?.waitSec === sec
                    ? "bg-sky-600 text-white"
                    : "text-sky-100 hover:bg-sky-900/70"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </MoeFloatingPanelRoot>
  );
}

function MacroSlot({ index, kind, label, filled }) {
  return (
    <div
      data-moe-skill-panel="macro"
      data-moe-skill-slot={index}
      className={`flex h-16 min-w-0 flex-1 flex-col items-center justify-center rounded border px-0.5 text-center ${
        kind === "wait"
          ? "border-sky-400/50 bg-sky-950/70"
          : "border-amber-400/40 bg-zinc-900"
      }`}
    >
      <span className="text-[8px] text-white/50">{index + 1}</span>
      <span
        className={`max-w-full truncate text-[10px] font-bold leading-tight ${
          filled ? "text-white" : "text-white/35"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
