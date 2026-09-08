"use client";

import { useCallback } from "react";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import { useMoeSkillSlotSwap } from "@/hooks/useMoeSkillSlotSwap";

const VARIANTS = {
  amber: {
    border: "border-amber-500/35",
    header: "text-amber-200/95",
    skillBtn:
      "border-amber-600/50 bg-gradient-to-b from-amber-700/90 to-orange-900/90 text-amber-50 hover:from-amber-600/95 hover:to-orange-800/95 disabled:hover:from-amber-700/90 disabled:hover:to-orange-900/90",
    skillActive:
      "border-cyan-200/80 bg-gradient-to-b from-cyan-500/90 via-sky-700/95 to-indigo-950 text-cyan-50 ring-1 ring-cyan-200/40",
    skillCooldown:
      "cursor-not-allowed border-zinc-600/50 bg-gradient-to-b from-zinc-800/90 to-zinc-950 text-amber-200/90 opacity-90",
    topOn:
      "border-yellow-300/70 bg-gradient-to-b from-yellow-500/95 to-amber-700/95 text-amber-950 ring-1 ring-yellow-200/50",
    topOff:
      "border-zinc-500/50 bg-gradient-to-b from-zinc-700/90 to-zinc-900/90 text-zinc-100 hover:from-zinc-600/95 hover:to-zinc-800/95",
  },
  emerald: {
    border: "border-emerald-500/35",
    header: "text-emerald-200/95",
    skillBtn:
      "border-emerald-600/50 bg-gradient-to-b from-emerald-700/90 to-emerald-950/90 text-emerald-50 hover:from-emerald-600/95 hover:to-emerald-900/95 disabled:hover:from-emerald-700/90 disabled:hover:to-emerald-950/90",
    skillActive:
      "border-cyan-200/80 bg-gradient-to-b from-cyan-500/90 via-sky-700/95 to-indigo-950 text-cyan-50 ring-1 ring-cyan-200/40",
    skillCooldown:
      "cursor-not-allowed border-zinc-600/50 bg-gradient-to-b from-zinc-800/90 to-zinc-950 text-amber-200/90 opacity-90",
    topOn:
      "border-emerald-300/70 bg-gradient-to-b from-emerald-500/95 to-emerald-800/95 text-emerald-950 ring-1 ring-emerald-200/50",
    topOff:
      "border-zinc-500/50 bg-gradient-to-b from-zinc-700/90 to-zinc-900/90 text-zinc-100 hover:from-zinc-600/95 hover:to-zinc-800/95",
  },
};

/**
 * 交戦中スキル縦パネル（⚡×2 ＋ スキル1〜N）
 * @param {{
 *   storageKey: string,
 *   defaultPos?: () => { x: number, y: number },
 *   title: string,
 *   variant?: 'amber' | 'emerald',
 *   topAction?: { label: string, active?: boolean, title?: string, onClick: () => void } | null,
 *   reorderable?: boolean,
 *   onSwapSlots?: (from: number, to: number) => void,
 *   slots: {
 *     label: string,
 *     disabled?: boolean,
 *     title?: string,
 *     active?: boolean,
 *     cooldownSec?: number|null,
 *     onClick?: () => void,
 *     reorderable?: boolean,
 *   }[],
 * }} props
 */
export default function MoeVerticalSkillPanel({
  storageKey,
  defaultPos,
  title,
  variant = "amber",
  topAction = null,
  reorderable = false,
  onSwapSlots,
  slots,
}) {
  const getDefaultPos = useCallback(
    () =>
      defaultPos?.() ?? {
        x: Math.max(8, window.innerWidth - 78),
        y: 8,
      },
    [defaultPos]
  );

  const { pos, sizeRef, onDragPointerDown } = useMoeDraggablePos(
    storageKey,
    getDefaultPos
  );

  const { bindSlot } = useMoeSkillSlotSwap(onSwapSlots ?? (() => {}));

  const theme = VARIANTS[variant] ?? VARIANTS.amber;

  if (!pos) return null;

  const canReorder = reorderable && typeof onSwapSlots === "function";

  return (
    <div
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed z-[46]"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        className={`flex max-h-[min(72vh,480px)] w-[4.65rem] flex-col gap-0.5 overflow-y-auto overscroll-contain rounded-lg border bg-black/70 p-1 pr-0.5 text-white backdrop-blur-md [scrollbar-width:thin] ${theme.border}`}
      >
        <p
          className={`sticky top-0 z-10 cursor-grab touch-none bg-black/85 pb-0.5 text-center text-[8px] font-bold active:cursor-grabbing ${theme.header}`}
          onPointerDown={onDragPointerDown}
          title="ドラッグで移動"
        >
          {title}
        </p>
        {topAction && (
          <button
            type="button"
            onClick={topAction.onClick}
            title={topAction.title ?? topAction.label}
            className={`shrink-0 rounded-md border py-1 text-[8px] font-bold leading-tight shadow-sm transition active:scale-95 ${
              topAction.active ? theme.topOn : theme.topOff
            }`}
          >
            {topAction.label}
          </button>
        )}
        {slots.map((slot, i) => {
          const onCooldown =
            slot.cooldownSec !== null && slot.cooldownSec !== undefined;
          const btnClass = onCooldown
            ? theme.skillCooldown
            : slot.active
              ? theme.skillActive
              : theme.skillBtn;
          const slotReorder =
            canReorder && slot.reorderable !== false;
          const pointerProps = bindSlot(i, { reorderable: slotReorder });

          return (
            <button
              key={`slot-${i}-${slot.label}`}
              type="button"
              {...(pointerProps.slotAttr ?? {})}
              disabled={!slotReorder && (slot.disabled || onCooldown)}
              title={
                slotReorder
                  ? `${slot.title ?? slot.label} · 長押し→光ったらドラッグで入れ替え`
                  : (slot.title ?? slot.label)
              }
              onClick={() => {
                if (slot.disabled || onCooldown) return;
                slot.onClick?.();
              }}
              className={`relative shrink-0 touch-none rounded-md border py-1 text-[8px] font-bold leading-tight shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${btnClass} ${pointerProps.className ?? ""}`}
              style={pointerProps.style}
              onPointerDown={pointerProps.onPointerDown}
              onPointerCancel={pointerProps.onPointerCancel}
              onClickCapture={pointerProps.onClickCapture}
            >
              {onCooldown ? (
                <span className="relative flex min-h-[1.1rem] items-center justify-center">
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[6px] font-bold leading-none opacity-25">
                    {slot.label}
                  </span>
                  <span className="relative text-[11px] tabular-nums leading-none">
                    {slot.cooldownSec}
                  </span>
                </span>
              ) : (
                slot.label
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
