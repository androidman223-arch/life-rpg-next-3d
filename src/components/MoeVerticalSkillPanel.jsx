"use client";

import { useCallback } from "react";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import { useMoeSkillSlotSwap } from "@/hooks/useMoeSkillSlotSwap";
import MoeCompactSkillTip from "@/components/MoeCompactSkillTip";

/** MOE風 — 枠からはみ出した文字は途中で切る（…なし） */
const MOE_SKILL_LABEL_CLIP =
  "block max-w-full overflow-hidden whitespace-nowrap px-0.5 leading-tight";

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
 *   headerExtra?: React.ReactNode,
 *   reorderable?: boolean,
 *   onSwapSlots?: (from: number, to: number) => void,
 *   slots: {
 *     label: string,
 *     disabled?: boolean,
 *     title?: string,
 *     active?: boolean,
 *     cooldownSec?: number|null,
 *     onClick?: () => void,
 *     previewOnly?: boolean,
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
  headerExtra = null,
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

  const canReorder = reorderable && typeof onSwapSlots === "function";
  const { bindSlot } = useMoeSkillSlotSwap(onSwapSlots ?? (() => {}));

  const theme = VARIANTS[variant] ?? VARIANTS.amber;

  if (!pos) return null;

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
        className={`flex max-h-[min(72vh,480px)] w-[5.35rem] flex-col gap-0.5 overflow-y-auto overscroll-contain rounded-lg border bg-black/70 p-1 pr-0.5 text-white backdrop-blur-md [scrollbar-width:thin] ${theme.border}`}
      >
        <p
          className={`sticky top-0 z-10 cursor-grab touch-none bg-black/85 pb-0.5 text-center text-[8px] font-bold active:cursor-grabbing ${theme.header}`}
          onPointerDown={onDragPointerDown}
          title="ドラッグで移動"
        >
          {title}
        </p>
        {headerExtra}
        {topAction && (
          <button
            type="button"
            onClick={topAction.onClick}
            title={topAction.title ?? topAction.label}
            className={`shrink-0 overflow-hidden rounded-md border py-1 text-[8px] font-bold leading-tight shadow-sm transition active:scale-95 ${
              topAction.active ? theme.topOn : theme.topOff
            }`}
          >
            <span className={MOE_SKILL_LABEL_CLIP}>{topAction.label}</span>
          </button>
        )}
        {slots.map((slot, i) => {
          if (slot.previewOnly) {
            return (
              <div
                key={`slot-${i}-${slot.label}`}
                title={slot.title ?? slot.label}
                className="shrink-0 overflow-hidden rounded-md border border-dashed border-fuchsia-400/30 bg-fuchsia-950/25 py-1 text-center text-[8px] font-bold leading-tight text-fuchsia-100/75"
              >
                <span className={MOE_SKILL_LABEL_CLIP}>{slot.label}</span>
              </div>
            );
          }

          const onCooldown =
            slot.cooldownSec !== null && slot.cooldownSec !== undefined;
          const alwaysClickable = slot.slotKey === "condense_mind";
          const btnClass = onCooldown
            ? theme.skillCooldown
            : slot.active
              ? theme.skillActive
              : theme.skillBtn;
          const slotReorder =
            canReorder && slot.reorderable !== false;
          const pointerProps = bindSlot(i, { reorderable: slotReorder });
          const tipText = slot.title ?? slot.label;
          const blocked =
            !alwaysClickable && (slot.disabled || onCooldown);

          return (
            <MoeCompactSkillTip
              key={`slot-${i}-${slot.label}`}
              text={tipText}
              className="shrink-0 w-full"
            >
              <button
                type="button"
                {...(pointerProps.slotAttr ?? {})}
                disabled={!slotReorder && blocked}
                aria-label={tipText}
                onClick={() => {
                  if (blocked) return;
                  slot.onClick?.();
                }}
                style={pointerProps.style}
                className={`relative w-full touch-none overflow-hidden rounded-md border py-1 text-[8px] font-bold leading-tight shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${btnClass} ${pointerProps.className ?? ""}`}
                onPointerDown={pointerProps.onPointerDown}
                onPointerCancel={pointerProps.onPointerCancel}
                onClickCapture={pointerProps.onClickCapture}
              >
                {onCooldown ? (
                  <span className="relative flex min-h-[1.1rem] items-center justify-center">
                    <span className="pointer-events-none absolute inset-x-0 top-0.5 flex justify-center overflow-hidden text-[6px] font-bold leading-none opacity-25">
                      <span className={MOE_SKILL_LABEL_CLIP}>{slot.label}</span>
                    </span>
                    <span className="relative text-[11px] tabular-nums leading-none">
                      {slot.cooldownSec}
                    </span>
                  </span>
                ) : (
                  <span className={MOE_SKILL_LABEL_CLIP}>{slot.label}</span>
                )}
              </button>
            </MoeCompactSkillTip>
          );
        })}
      </div>
    </div>
  );
}
