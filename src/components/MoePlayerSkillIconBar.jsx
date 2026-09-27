"use client";

import { useCallback } from "react";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import { useMoeSkillSlotSwap } from "@/hooks/useMoeSkillSlotSwap";
import { MOE_PLAYER_SKILL_SLOT_COUNT } from "@/data/moePlayerNinjaSkills";
import MoeCompactSkillTip from "@/components/MoeCompactSkillTip";
import MoeFloatingPanelRoot from "@/components/MoeFloatingPanelRoot";
import {
  MOE_PANEL_ID_PLAYER_SKILL_ICON_BAR,
  moeFloatingDragTitle,
} from "@/lib/moePanelStack";

const DEFAULT_STORAGE_KEY = MOE_PANEL_ID_PLAYER_SKILL_ICON_BAR;
const SLOT_PX = 32;
const CAP_W = 5;

function defaultBarPos(yFromBottom = 148) {
  const barW =
    CAP_W * 2 +
    MOE_PLAYER_SKILL_SLOT_COUNT * SLOT_PX +
    (MOE_PLAYER_SKILL_SLOT_COUNT - 1) * 2 +
    16;
  return {
    x: Math.max(8, (window.innerWidth - barW) / 2),
    y: Math.max(8, window.innerHeight - yFromBottom),
  };
}

/**
 * プレイヤー（トレーナー）スキル — 10マス横並び
 * @param {{
 *   storageKey?: string,
 *   defaultPos?: () => { x: number, y: number },
 *   title?: string,
 *   headerTone?: 'emerald' | 'fuchsia',
 *   slots: {
 *     icon: React.ReactNode,
 *     disabled?: boolean,
 *     active?: boolean,
 *     cooldownSec?: number|null,
 *     title?: string,
 *     onClick?: () => void,
 *     reorderable?: boolean,
 *   }[],
 *   headerExtra?: React.ReactNode,
 *   onSwapSlots?: (from: number, to: number) => void,
 * }} props
 */
export default function MoePlayerSkillIconBar({
  storageKey = DEFAULT_STORAGE_KEY,
  defaultPos,
  title,
  headerTone = "emerald",
  slots,
  headerExtra,
  onSwapSlots,
}) {
  const getDefaultPos = useCallback(
    () => defaultPos?.() ?? defaultBarPos(),
    [defaultPos]
  );
  const { pos, sizeRef, onDragPointerDown } = useMoeDraggablePos(
    storageKey,
    getDefaultPos
  );
  const canReorder = typeof onSwapSlots === "function";
  const { bindSlot } = useMoeSkillSlotSwap(onSwapSlots ?? (() => {}));

  const row = slots.slice(0, MOE_PLAYER_SKILL_SLOT_COUNT);
  while (row.length < MOE_PLAYER_SKILL_SLOT_COUNT) {
    row.push({
      icon: "·",
      disabled: true,
      title: `${row.length + 1}（空き）`,
      reorderable: true,
    });
  }

  const headerGradient =
    headerTone === "fuchsia"
      ? "from-fuchsia-700 to-fuchsia-950"
      : "from-emerald-700 to-emerald-950";

  if (!pos) return null;

  return (
    <MoeFloatingPanelRoot
      panelId={storageKey}
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed select-none"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="overflow-hidden rounded-[5px] border border-slate-300/85 bg-black shadow-[0_2px_10px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)]">
        <div
          className={`cursor-grab touch-none bg-gradient-to-b px-1 py-px active:cursor-grabbing ${headerGradient}`}
          onPointerDown={onDragPointerDown}
          title={moeFloatingDragTitle("ドラッグで移動")}
        >
          {headerExtra ??
            (title ? (
              <p
                className={`text-center text-[8px] font-bold leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] ${
                  headerTone === "fuchsia" ? "text-fuchsia-50" : "text-emerald-50"
                }`}
              >
                {title}
              </p>
            ) : null)}
        </div>
        <div className="h-px shrink-0 bg-white/55" aria-hidden />
        <div
          className="flex items-stretch bg-zinc-950 p-1"
          role="toolbar"
          aria-label="プレイヤースキル 1〜10"
        >
          <div
            className="shrink-0 self-stretch bg-gradient-to-b from-slate-200/95 to-slate-400/90"
            style={{ width: CAP_W }}
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 items-center gap-0.5 px-0.5">
            {row.map((slot, i) => {
              const onCooldown =
                slot.cooldownSec !== null && slot.cooldownSec !== undefined;
              const alwaysClickable = slot.slotKey === "jiriki_seiran";
              const disabled =
                (slot.disabled || onCooldown) && !alwaysClickable;
              const slotReorder =
                canReorder && slot.reorderable !== false;
              const pointerProps = bindSlot(i, { reorderable: slotReorder });
              const tip = slot.title ?? `${i + 1}（未設定）`;

              return (
                <MoeCompactSkillTip key={`player-slot-${i}`} text={tip}>
                  <button
                    type="button"
                    {...(pointerProps.slotAttr ?? {})}
                    disabled={!slotReorder && disabled}
                    aria-label={tip}
                    onClick={() => {
                      if (!alwaysClickable && disabled) return;
                      slot.onClick?.();
                    }}
                    style={{
                      width: SLOT_PX,
                      height: SLOT_PX,
                      ...pointerProps.style,
                    }}
                    className={`relative shrink-0 touch-none overflow-hidden rounded-[3px] border transition active:scale-95 ${
                      slot.disabled && !onCooldown
                        ? "cursor-default border-zinc-700/60 bg-gradient-to-b from-zinc-800/90 to-zinc-950 opacity-75"
                        : onCooldown
                          ? "cursor-not-allowed border-zinc-700/80 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-zinc-500 opacity-55 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                          : slot.active
                            ? "border-cyan-200/80 bg-gradient-to-b from-cyan-500/90 via-sky-700/95 to-zinc-950 text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_0_8px_rgba(34,211,238,0.35)] ring-1 ring-cyan-200/40"
                            : "border-emerald-400/65 bg-gradient-to-b from-emerald-700 via-emerald-900 to-zinc-950 text-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_3px_rgba(0,0,0,0.45)] hover:border-emerald-200/75 hover:brightness-110"
                    } ${pointerProps.className ?? ""}`}
                    onPointerDown={pointerProps.onPointerDown}
                    onPointerCancel={pointerProps.onPointerCancel}
                    onClickCapture={pointerProps.onClickCapture}
                  >
                    <span className="pointer-events-none absolute left-0.5 top-0 text-[6px] font-bold tabular-nums leading-none text-emerald-200/75">
                      {i + 1}
                    </span>
                    <span
                      className={`pointer-events-none flex h-full w-full items-center justify-center text-[17px] leading-none ${
                        onCooldown ? "opacity-35" : ""
                      }`}
                    >
                      {slot.icon}
                    </span>
                    {onCooldown && (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 text-[15px] font-bold tabular-nums leading-none text-amber-200/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                        {slot.cooldownSec}
                      </span>
                    )}
                  </button>
                </MoeCompactSkillTip>
              );
            })}
          </div>
          <div
            className="shrink-0 self-stretch bg-gradient-to-b from-slate-200/95 to-slate-400/90"
            style={{ width: CAP_W }}
            aria-hidden
          />
        </div>
      </div>
    </MoeFloatingPanelRoot>
  );
}
