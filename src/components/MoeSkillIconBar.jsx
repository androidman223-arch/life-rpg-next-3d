"use client";

import { useCallback } from "react";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import { renderPetSkillIcon } from "@/lib/moePetSkillIcons";

export const MOE_SKILL_ICON_SLOT_COUNT = 10;

const STORAGE_KEY = "life-rpg-moe-skill-icon-bar-pos";
const SLOT_PX = 32;
const CAP_W = 5;
const ICON_SIZE = 22;

function defaultPos() {
  const barW =
    CAP_W * 2 + MOE_SKILL_ICON_SLOT_COUNT * SLOT_PX + (MOE_SKILL_ICON_SLOT_COUNT - 1) * 2 + 16;
  return {
    x: Math.max(8, (window.innerWidth - barW) / 2),
    y: Math.max(8, window.innerHeight - 88),
  };
}

function iconForSkill(skill) {
  if (!skill) return null;
  return renderPetSkillIcon(skill.name, { size: ICON_SIZE });
}

/**
 * MOE風スキルアイコンバー（10 マス横並び · ドラッグ可）
 * @param {{ slots: (object|null)[], onActivate: (index: number, skill: object) => void, isSkillUsable?: (skill: object) => boolean }} props
 */
export default function MoeSkillIconBar({ slots, onActivate, isSkillUsable }) {
  const getDefaultPos = useCallback(defaultPos, []);
  const { pos, sizeRef, onDragPointerDown } = useMoeDraggablePos(
    STORAGE_KEY,
    getDefaultPos
  );

  const row = slots.slice(0, MOE_SKILL_ICON_SLOT_COUNT);
  while (row.length < MOE_SKILL_ICON_SLOT_COUNT) row.push(null);

  return (
    <div
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed z-[46] select-none"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="overflow-hidden rounded-[5px] border border-slate-300/85 bg-black shadow-[0_2px_10px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)]">
        <div
          className="cursor-grab touch-none bg-gradient-to-b from-amber-600 to-amber-900 px-2 py-0.5 active:cursor-grabbing"
          onPointerDown={onDragPointerDown}
          title="ドラッグで移動"
        >
          <p className="text-center text-[8px] font-bold leading-tight text-amber-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
            スキル
          </p>
        </div>
        <div className="h-px shrink-0 bg-white/55" aria-hidden />
        <div className="flex items-stretch bg-zinc-950 p-1" role="toolbar" aria-label="スキル 1〜10">
          <div
            className="shrink-0 self-stretch bg-gradient-to-b from-slate-200/95 to-slate-400/90"
            style={{ width: CAP_W }}
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 items-center gap-0.5 px-0.5">
            {row.map((skill, i) => {
              const icon = iconForSkill(skill);
              const label = skill?.name ?? `スキル ${i + 1}`;
              const filled = Boolean(skill);
              const locked =
                filled && typeof isSkillUsable === "function" && !isSkillUsable(skill);
              const usable = filled && !locked;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!usable}
                  title={
                    filled
                      ? locked
                        ? `${label}（Lv.${skill.level}で習得）`
                        : label
                      : `${i + 1}（未設定）`
                  }
                  onClick={() => usable && onActivate(i, skill)}
                  style={{ width: SLOT_PX, height: SLOT_PX }}
                  className={`relative shrink-0 overflow-hidden rounded-[3px] border transition active:scale-95 ${
                    usable
                      ? "border-amber-400/70 bg-gradient-to-b from-amber-700 via-amber-900 to-zinc-950 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_3px_rgba(0,0,0,0.45)] hover:border-amber-200/80 hover:brightness-110"
                      : filled
                        ? "cursor-not-allowed border-zinc-600/70 bg-gradient-to-b from-zinc-800/90 to-zinc-950 opacity-55"
                        : "cursor-default border-zinc-700/60 bg-gradient-to-b from-zinc-800/90 to-zinc-950 opacity-75"
                  }`}
                >
                  <span
                    className={`pointer-events-none absolute left-0.5 top-0 text-[6px] font-bold tabular-nums leading-none ${
                      filled ? "text-amber-200/75" : "text-zinc-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="pointer-events-none flex h-full w-full items-center justify-center text-[17px] leading-none">
                    {filled ? icon : "·"}
                  </span>
                </button>
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
    </div>
  );
}
