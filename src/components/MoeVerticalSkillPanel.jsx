"use client";

import { useCallback } from "react";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import { useMoeSkillSlotSwap } from "@/hooks/useMoeSkillSlotSwap";
import { useMoeVerticalSkillPanelLayout } from "@/hooks/useMoeVerticalSkillPanelLayout";
import { moeVerticalSkillLabelFontPx } from "@/lib/moeVerticalSkillPanelLayout";
import MoeCompactSkillTip from "@/components/MoeCompactSkillTip";
import MoeSkillPanelCloseButton from "@/components/MoeSkillPanelCloseButton";
import MoeFloatingPanelRoot from "@/components/MoeFloatingPanelRoot";
import { moeFloatingDragTitle } from "@/lib/moePanelStack";

/** MOE風 — 枠からはみ出した文字は途中で切る（…なし） */
const MOE_SKILL_LABEL_CLIP =
  "block w-full max-w-full overflow-hidden whitespace-nowrap px-px leading-none";

const MOE_VERTICAL_SLOT_DIVIDER = "border-b border-white/[0.12]";

const VARIANTS = {
  amber: {
    border: "border-orange-500/55",
    shell: "bg-gradient-to-b from-red-950/92 to-orange-950/88",
    headerBar: "bg-gradient-to-b from-orange-600 to-red-800",
    header: "text-orange-50",
    preview:
      "border-orange-300/35 bg-orange-950/55 text-orange-100/80",
    skillBtn:
      "border-orange-500/55 bg-gradient-to-b from-orange-600/95 to-red-900/95 text-orange-50 hover:from-orange-500/95 hover:to-red-800/95 disabled:hover:from-orange-600/95 disabled:hover:to-red-900/95",
    skillActive:
      "border-orange-200/85 bg-gradient-to-b from-orange-400/95 via-red-600/95 to-red-950 text-orange-50 ring-1 ring-orange-200/50",
    skillCooldown:
      "cursor-not-allowed border-red-900/60 bg-gradient-to-b from-orange-950/90 to-red-950 text-orange-200/85 opacity-90",
    topOn:
      "border-orange-200/75 bg-gradient-to-b from-orange-400/95 to-red-700/95 text-orange-950 ring-1 ring-orange-100/50",
    topOff:
      "border-orange-800/55 bg-gradient-to-b from-orange-900/90 to-red-950/90 text-orange-100 hover:from-orange-800/95 hover:to-red-900/95",
  },
  emerald: {
    border: "border-sky-500/45",
    shell: "bg-gradient-to-b from-sky-950/92 to-blue-950/88",
    headerBar: "bg-gradient-to-b from-sky-700 to-blue-900",
    header: "text-sky-50",
    preview: "border-sky-300/35 bg-sky-950/50 text-sky-100/80",
    skillBtn:
      "border-sky-500/50 bg-gradient-to-b from-sky-700/95 to-blue-950/95 text-sky-50 hover:from-sky-600/95 hover:to-blue-900/95 disabled:hover:from-sky-700/95 disabled:hover:to-blue-950/95",
    skillActive:
      "border-sky-200/80 bg-gradient-to-b from-sky-400/95 via-blue-600/95 to-blue-950 text-sky-50 ring-1 ring-sky-200/45",
    skillCooldown:
      "cursor-not-allowed border-sky-900/60 bg-gradient-to-b from-sky-950/90 to-blue-950 text-sky-200/85 opacity-90",
    topOn:
      "border-sky-200/70 bg-gradient-to-b from-sky-400/95 to-blue-700/95 text-sky-950 ring-1 ring-sky-100/50",
    topOff:
      "border-sky-800/50 bg-gradient-to-b from-sky-900/90 to-blue-950/90 text-sky-100 hover:from-sky-800/95 hover:to-blue-900/95",
  },
  phoenix: {
    border: "border-orange-500/55",
    shell: "bg-gradient-to-b from-red-950/92 to-orange-950/88",
    headerBar:
      "bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500",
    header: "text-orange-950",
    preview:
      "border-yellow-300/40 bg-orange-950/55 text-yellow-100/85",
    skillBtn:
      "border-orange-400/60 bg-gradient-to-b from-yellow-500/95 via-orange-600/95 to-red-900/95 text-orange-50 hover:from-yellow-400/95 hover:via-orange-500/95 hover:to-red-800/95 disabled:hover:from-yellow-500/95 disabled:hover:via-orange-600/95 disabled:hover:to-red-900/95",
    skillActive:
      "border-yellow-200/90 bg-gradient-to-b from-yellow-400/95 via-orange-500/95 to-red-900 text-orange-950 ring-1 ring-yellow-200/60",
    skillCooldown:
      "cursor-not-allowed border-orange-900/60 bg-gradient-to-b from-yellow-950/80 to-red-950 text-yellow-200/85 opacity-90",
    topOn:
      "border-yellow-200/80 bg-gradient-to-b from-yellow-400/95 to-orange-600/95 text-orange-950 ring-1 ring-yellow-100/55",
    topOff:
      "border-orange-800/55 bg-gradient-to-b from-orange-900/90 to-red-950/90 text-orange-100 hover:from-orange-800/95 hover:to-red-900/95",
  },
  dragon: {
    border: "border-sky-500/45",
    shell: "bg-gradient-to-b from-sky-950/92 to-blue-950/88",
    headerBar:
      "bg-gradient-to-r from-lime-300 via-yellow-300 to-emerald-500",
    header: "text-emerald-950",
    preview: "border-sky-300/35 bg-sky-950/50 text-sky-100/80",
    skillBtn:
      "border-sky-500/50 bg-gradient-to-b from-sky-700/95 to-blue-950/95 text-sky-50 hover:from-sky-600/95 hover:to-blue-900/95 disabled:hover:from-sky-700/95 disabled:hover:to-blue-950/95",
    skillActive:
      "border-sky-200/80 bg-gradient-to-b from-sky-400/95 via-blue-600/95 to-blue-950 text-sky-50 ring-1 ring-sky-200/45",
    skillCooldown:
      "cursor-not-allowed border-sky-900/60 bg-gradient-to-b from-sky-950/90 to-blue-950 text-sky-200/85 opacity-90",
    topOn:
      "border-sky-200/70 bg-gradient-to-b from-sky-400/95 to-blue-700/95 text-sky-950 ring-1 ring-sky-100/50",
    topOff:
      "border-sky-800/50 bg-gradient-to-b from-sky-900/90 to-blue-950/90 text-sky-100 hover:from-sky-800/95 hover:to-blue-900/95",
  },
};

/**
 * 交戦中スキル縦パネル（⚡×2 ＋ スキル1〜N）
 * @param {{
 *   storageKey: string,
 *   defaultPos?: () => { x: number, y: number },
 *   title: string,
 *   variant?: 'amber' | 'emerald' | 'phoenix' | 'dragon',
 *   topAction?: { label: string, active?: boolean, title?: string, onClick: () => void } | null,
 *   headerExtra?: React.ReactNode,
 *   reorderable?: boolean,
 *   onSwapSlots?: (from: number, to: number) => void,
 *   dragPanelId?: string,
 *   dragMode?: 'reorder' | 'copy' | 'off',
 *   onCopySlot?: (from: number, toPanel: string, toIndex: number) => void,
 *   layoutInheritFrom?: string[],
 *   onClose?: () => void,
 *   collapsed?: boolean,
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
  dragPanelId = "",
  dragMode = "off",
  onCopySlot,
  layoutInheritFrom,
  onClose,
  collapsed = false,
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

  const canReorder = dragMode === "reorder" && typeof onSwapSlots === "function";
  const { bindSlot } = useMoeSkillSlotSwap(onSwapSlots ?? (() => {}), {
    panelId: dragPanelId,
    mode: dragMode === "copy" ? "copy" : "reorder",
    onCopy: onCopySlot,
  });

  const theme = VARIANTS[variant] ?? VARIANTS.amber;

  if (!pos) return null;
  if (!collapsed && !panelLayout) return null;

  const { width, slotHeight } = panelLayout ?? { width: 0, slotHeight: 0 };
  const rowStyle = { minHeight: slotHeight, height: slotHeight };

  return (
    <MoeFloatingPanelRoot
      panelId={storageKey}
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        className="relative"
        style={{ width: collapsed ? Math.max(width || 0, 88) : width }}
      >
      <div
        className={`flex max-h-[min(72vh,480px)] flex-col gap-0 overflow-y-auto overscroll-contain rounded-lg border p-0 text-white backdrop-blur-md [scrollbar-width:thin] [scrollbar-gutter:stable] ${theme.border} ${theme.shell}`}
      >
        {headerExtra ? (
          <div
            className={`relative sticky top-0 z-10 h-9 shrink-0 cursor-grab touch-none overflow-hidden border-b border-white/15 pl-5 active:cursor-grabbing ${theme.headerBar} ${theme.header}`}
            onPointerDown={onDragPointerDown}
            title={moeFloatingDragTitle("ドラッグで移動 · 右下で幅・高さ変更")}
          >
            {onClose ? (
              <MoeSkillPanelCloseButton
                collapsed={collapsed}
                onClose={onClose}
                className="!top-0.5 !translate-y-0"
              />
            ) : null}
            {headerExtra}
          </div>
        ) : (
          <p
            className={`relative sticky top-0 z-10 min-h-5 shrink-0 cursor-grab touch-none border-b border-white/15 py-1 pl-5 text-center text-[7px] font-bold leading-none active:cursor-grabbing ${theme.headerBar} ${theme.header}`}
            onPointerDown={onDragPointerDown}
            title={moeFloatingDragTitle("ドラッグで移動 · 右下で幅・高さ変更")}
          >
            {onClose ? (
              <MoeSkillPanelCloseButton
                collapsed={collapsed}
                onClose={onClose}
              />
            ) : null}
            {title}
          </p>
        )}
        {!collapsed ? (
        <>
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
                className={`shrink-0 overflow-hidden rounded-none border-0 border-dashed py-0 text-center font-bold leading-none ${MOE_VERTICAL_SLOT_DIVIDER} ${theme.preview}`}
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
          const slotReorder = canReorder && slot.reorderable !== false;
          const slotCopyable =
            dragMode === "copy" && Boolean(slot.slotKey) && !slot.previewOnly;
          const pointerProps = bindSlot(i, {
            reorderable: slotReorder,
            copyable: slotCopyable,
          });
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
                disabled={!slotReorder && !slotCopyable && blocked}
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
        </>
        ) : null}
      </div>
      {!collapsed ? (
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="縦スキルパネルサイズ変更"
          className="absolute bottom-0 right-0 z-30 flex h-5 w-5 cursor-nwse-resize touch-none items-end justify-end rounded-br-lg pb-0.5 pr-0.5"
          onPointerDown={onResizePointerDown}
          title="右下をドラッグで幅・ボタン高さを変更"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className="pointer-events-none text-white/80 drop-shadow-[0_0_1px_rgba(0,0,0,0.9)]"
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
      ) : null}
      </div>
    </MoeFloatingPanelRoot>
  );
}
