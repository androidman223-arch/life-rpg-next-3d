"use client";

import { useCallback } from "react";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import { useMoeSkillSlotSwap } from "@/hooks/useMoeSkillSlotSwap";
import { useMoeVerticalSkillPanelLayout } from "@/hooks/useMoeVerticalSkillPanelLayout";
import { moeVerticalSkillLabelFontPx } from "@/lib/moeVerticalSkillPanelLayout";
import MoeCompactSkillTip from "@/components/MoeCompactSkillTip";

/** MOE風 — 枠からはみ出した文字は途中で切る（…なし） */
const MOE_SKILL_LABEL_CLIP =
  "block w-full max-w-full overflow-hidden whitespace-nowrap px-px leading-none";

const MOE_VERTICAL_SLOT_DIVIDER = "border-b border-white/[0.12]";

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
 *   layoutInheritFrom?: string[],
 *   slots: {
 *     label: string,
 *     disabled?: boolean,
 *     title?: string,
 *     active?: boolean,
 *     cooldownSec?: number|null,
 *     unusable?: boolean,
 *     trainingSkill?: boolean,
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
  layoutInheritFrom,
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
  const { layout: panelLayout, onResizePointerDown } =
    useMoeVerticalSkillPanelLayout(storageKey, layoutInheritFrom);

  const canReorder = reorderable && typeof onSwapSlots === "function";
  const { bindSlot } = useMoeSkillSlotSwap(onSwapSlots ?? (() => {}));

  const theme = VARIANTS[variant] ?? VARIANTS.amber;

  if (!pos || !panelLayout) return null;

  const { width, slotHeight } = panelLayout;
  const rowStyle = { minHeight: slotHeight, height: slotHeight };

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
        className={`relative flex max-h-[min(72vh,480px)] flex-col gap-0 overflow-y-auto overscroll-contain rounded-lg border bg-black/70 p-0 text-white backdrop-blur-md [scrollbar-width:thin] [scrollbar-gutter:stable] ${theme.border}`}
        style={{ width }}
      >
        {headerExtra ? (
          <div
            className="sticky top-0 z-10 shrink-0 cursor-grab touch-none border-b border-white/10 bg-black/85 active:cursor-grabbing"
            onPointerDown={onDragPointerDown}
            title="ドラッグで移動 · 右下で幅・高さ変更"
          >
            {headerExtra}
          </div>
        ) : (
          <p
            className={`sticky top-0 z-10 shrink-0 cursor-grab touch-none border-b border-white/10 bg-black/85 py-px text-center text-[7px] font-bold leading-none active:cursor-grabbing ${theme.header}`}
            onPointerDown={onDragPointerDown}
            title="ドラッグで移動 · 右下で幅・高さ変更"
          >
            {title}
          </p>
        )}
        {topAction && (
          <button
            type="button"
            onClick={topAction.onClick}
            title={topAction.title ?? topAction.label}
            style={rowStyle}
            className={`shrink-0 overflow-hidden rounded-none border-0 py-0 font-bold leading-none shadow-none transition active:scale-95 ${MOE_VERTICAL_SLOT_DIVIDER} ${
              topAction.active ? theme.topOn : theme.topOff
            }`}
          >
            <span
              className={`${MOE_SKILL_LABEL_CLIP} flex h-full w-full items-center justify-center`}
              style={{ fontSize: moeVerticalSkillLabelFontPx(slotHeight) }}
            >
              {topAction.label}
            </span>
          </button>
        )}
        {slots.map((slot, i) => {
          if (slot.previewOnly) {
            return (
              <div
                key={`slot-${i}-${slot.label}`}
                title={slot.title ?? slot.label}
                style={rowStyle}
                className={`shrink-0 overflow-hidden rounded-none border-0 border-dashed border-fuchsia-400/30 bg-fuchsia-950/25 py-0 text-center font-bold leading-none text-fuchsia-100/75 ${MOE_VERTICAL_SLOT_DIVIDER}`}
              >
                <span
                  className={`${MOE_SKILL_LABEL_CLIP} flex h-full w-full items-center justify-center`}
                  style={{ fontSize: moeVerticalSkillLabelFontPx(slotHeight) }}
                >
                  {slot.label}
                </span>
              </div>
            );
          }

          const onCooldown =
            slot.cooldownSec !== null && slot.cooldownSec !== undefined;
          const alwaysClickable =
            slot.slotKey === "jiriki_seiran" ||
            Boolean(slot.unusable) ||
            Boolean(slot.trainingSkill);
          const btnClass = onCooldown
            ? theme.skillCooldown
            : slot.active
              ? theme.skillActive
              : slot.unusable
                ? "border-zinc-600/70 bg-gradient-to-b from-zinc-800/90 to-zinc-950 text-zinc-300 opacity-80"
                : theme.skillBtn;
          const slotReorder =
            canReorder && slot.reorderable !== false;
          const pointerProps = bindSlot(i, { reorderable: slotReorder });
          const tipText = slot.title ?? slot.label;
          const blocked =
            !alwaysClickable && (slot.disabled || onCooldown);
          const mainFontPx = moeVerticalSkillLabelFontPx(slotHeight);

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
                style={{
                  ...pointerProps.style,
                  ...rowStyle,
                }}
                className={`relative w-full touch-none overflow-hidden rounded-none border-0 py-0 font-bold leading-none shadow-none transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${MOE_VERTICAL_SLOT_DIVIDER} ${btnClass} ${pointerProps.className ?? ""}`}
                onPointerDown={pointerProps.onPointerDown}
                onPointerCancel={pointerProps.onPointerCancel}
                onClickCapture={pointerProps.onClickCapture}
              >
                {onCooldown ? (
                  <span
                    className="relative flex h-full w-full items-center justify-center"
                  >
                    <span
                      className="pointer-events-none absolute inset-x-0 top-px flex justify-center overflow-hidden font-bold leading-none opacity-25"
                      style={{ fontSize: Math.max(7, Math.round(mainFontPx * 0.55)) }}
                    >
                      <span className={MOE_SKILL_LABEL_CLIP}>{slot.label}</span>
                    </span>
                    <span
                      className="relative tabular-nums leading-none"
                      style={{ fontSize: Math.max(11, Math.round(slotHeight * 0.62)) }}
                    >
                      {slot.cooldownSec}
                    </span>
                  </span>
                ) : (
                  <span
                    className={`${MOE_SKILL_LABEL_CLIP} flex h-full w-full items-center justify-center`}
                    style={{ fontSize: mainFontPx }}
                  >
                    {slot.label}
                  </span>
                )}
              </button>
            </MoeCompactSkillTip>
          );
        })}
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="縦スキルパネルサイズ変更"
          className="sticky bottom-0 z-20 flex h-4 w-4 shrink-0 cursor-nwse-resize touch-none self-end"
          onPointerDown={onResizePointerDown}
          title="右下をドラッグで幅・ボタン高さを変更"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className="pointer-events-none ml-auto mt-auto text-white/40"
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
      </div>
    </div>
  );
}
