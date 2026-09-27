"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import MoeCompactSkillTip from "@/components/MoeCompactSkillTip";
import MoeSkillPanelCloseButton from "@/components/MoeSkillPanelCloseButton";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import { loadPlayerExperienceTrack } from "@/lib/moePlayerExperience";
import {
  buildDragonTrainingVerticalSlots,
  buildPhoenixTrainingVerticalSlots,
} from "@/lib/moeTrainingSkillVerticalUi";
import MoeFloatingPanelRoot from "@/components/MoeFloatingPanelRoot";
import { moeFloatingDragTitle } from "@/lib/moePanelStack";

/** @typedef {'phoenix' | 'dragon'} MoeTrainingSkillPanelKind */

const SLOT_W = 38;
const SLOT_H = 28;
const CAP_W = 5;

const PANEL_META = {
  phoenix: {
    title: "鳳凰スキル",
    header: "from-amber-600 to-amber-900",
    btnIdle:
      "border-amber-500/55 bg-gradient-to-b from-amber-700/95 to-orange-950 text-amber-50 hover:brightness-110",
    lvTone: "text-amber-200/75",
  },
  dragon: {
    title: "龍神スキル",
    header: "from-emerald-600 to-emerald-900",
    btnIdle:
      "border-emerald-500/55 bg-gradient-to-b from-emerald-700/95 to-emerald-950 text-emerald-50 hover:brightness-110",
    lvTone: "text-emerald-200/75",
  },
};

function shortTrainingLabel(name) {
  if (!name) return "—";
  if (name.length <= 4) return name;
  return `${name.slice(0, 3)}…`;
}

/**
 * 横スキル — 鳳凰 / 龍神 修行スキルゲット表（9枠）
 * @param {{
 *   kind: MoeTrainingSkillPanelKind,
 *   storageKey: string,
 *   defaultPos?: () => { x: number, y: number },
 *   onActivateSkill?: (track: 'phoenix' | 'dragon', level: number) => void,
 *   skillMode?: import("@/lib/moeTrainingSkillSettings").MoeTrainingSkillMode,
 *   onClose?: () => void,
 *   collapsed?: boolean,
 * }} props
 */
export default function MoeTrainingSkillIconBar({
  kind,
  storageKey,
  defaultPos,
  onActivateSkill,
  skillMode = "all",
  onClose,
  collapsed = false,
}) {
  const meta = PANEL_META[kind] ?? PANEL_META.phoenix;
  const track = kind === "dragon" ? "dragon" : "phoenix";
  const [practiceLevel, setPracticeLevel] = useState(() =>
    loadPlayerExperienceTrack(track).level ?? 0
  );

  const getDefaultPos = useCallback(
    () =>
      defaultPos?.() ?? {
        x: Math.max(8, (window.innerWidth - 380) / 2),
        y: Math.max(8, window.innerHeight - 88),
      },
    [defaultPos]
  );

  const { pos, sizeRef, onDragPointerDown } = useMoeDraggablePos(
    storageKey,
    getDefaultPos
  );

  useEffect(() => {
    const track = kind === "dragon" ? "dragon" : "phoenix";
    const refresh = () => {
      setPracticeLevel(loadPlayerExperienceTrack(track).level ?? 0);
    };
    refresh();
    const id = window.setInterval(refresh, 2000);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("storage", refresh);
    };
  }, [kind]);

  const slots = useMemo(() => {
    if (kind === "dragon") {
      return buildDragonTrainingVerticalSlots(
        practiceLevel,
        onActivateSkill,
        skillMode
      );
    }
    return buildPhoenixTrainingVerticalSlots(
      practiceLevel,
      onActivateSkill,
      skillMode
    );
  }, [kind, practiceLevel, onActivateSkill, skillMode]);

  if (!pos) return null;

  const levelLabel = Math.floor(practiceLevel);

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
      <div className={`overflow-hidden rounded-[5px] border border-slate-300/85 bg-black shadow-[0_2px_10px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] ${collapsed ? "min-w-[7.5rem]" : ""}`}>
        <div
          className={`relative min-h-5 cursor-grab touch-none bg-gradient-to-b py-1 pl-5 pr-1 text-white active:cursor-grabbing ${meta.header}`}
          onPointerDown={onDragPointerDown}
          title={moeFloatingDragTitle("ドラッグで移動")}
        >
          {onClose ? (
            <MoeSkillPanelCloseButton collapsed={collapsed} onClose={onClose} />
          ) : null}
          <p className="w-full text-center text-[8px] font-bold leading-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
            {meta.title}
            <span className="ml-1 text-[7px] font-normal opacity-80">
              {kind === "dragon" ? "実践" : "知恵"} Lv.{levelLabel}
            </span>
          </p>
        </div>
        {!collapsed ? (
        <>
        <div className="h-px shrink-0 bg-white/55" aria-hidden />
        <div className="flex items-stretch bg-zinc-950 p-1" role="toolbar">
          <div
            className="shrink-0 self-stretch bg-gradient-to-b from-slate-200/95 to-slate-400/90"
            style={{ width: CAP_W }}
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 items-center gap-0.5 px-0.5">
            {slots.map((slot, i) => {
              const tip = slot.title ?? slot.label;
              const alwaysClickable = Boolean(slot.trainingSkill);
              const disabled =
                !alwaysClickable && (slot.disabled || slot.unusable);
              return (
                <MoeCompactSkillTip key={slot.slotKey ?? `t-${i}`} text={tip}>
                  <button
                    type="button"
                    disabled={!alwaysClickable && disabled}
                    aria-label={tip}
                    onClick={() => {
                      if (!alwaysClickable && disabled) return;
                      slot.onClick?.();
                    }}
                    style={{ width: SLOT_W, height: SLOT_H }}
                    className={`relative shrink-0 overflow-hidden rounded-[3px] border text-[7px] font-bold leading-none transition active:scale-95 ${
                      slot.unusable
                        ? "cursor-pointer border-zinc-600/70 bg-gradient-to-b from-zinc-800/90 to-zinc-950 text-zinc-300 opacity-80"
                        : slot.active
                          ? "border-cyan-200/80 bg-gradient-to-b from-cyan-500/90 via-sky-700/95 to-zinc-950 text-cyan-50 ring-1 ring-cyan-200/40"
                          : meta.btnIdle
                    }`}
                  >
                    <span
                      className={`pointer-events-none absolute left-0.5 top-0 text-[5px] font-bold tabular-nums leading-none ${meta.lvTone}`}
                    >
                      {(i + 1) * 10}
                    </span>
                    <span className="pointer-events-none flex h-full w-full items-center justify-center px-0.5 pt-1.5">
                      {shortTrainingLabel(slot.label)}
                    </span>
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
        </>
        ) : null}
      </div>
    </MoeFloatingPanelRoot>
  );
}
