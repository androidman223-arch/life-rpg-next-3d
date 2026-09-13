"use client";

import {
  MOE_BUFF_ICON_GAP_PX,
  MOE_BUFF_ICON_PX,
  MOE_PET_BUFF_COLUMNS,
  MOE_PLAYER_BUFF_COLUMNS,
} from "@/lib/moeBuffUi";

const TONE_CLASS = {
  buff: "border-amber-200/70 bg-gradient-to-b from-amber-400/95 to-amber-700/95 shadow-[0_0_3px_rgba(251,191,36,0.7),inset_0_0.5px_0_rgba(255,255,255,0.45)]",
  toggle:
    "border-lime-200/65 bg-gradient-to-b from-lime-400/90 to-lime-700/90 shadow-[0_0_3px_rgba(132,204,22,0.65),inset_0_0.5px_0_rgba(255,255,255,0.4)]",
  stealth:
    "border-violet-200/70 bg-gradient-to-b from-violet-400/90 to-violet-800/95 shadow-[0_0_3px_rgba(167,139,250,0.7),inset_0_0.5px_0_rgba(255,255,255,0.4)]",
  debuff:
    "border-rose-300/70 bg-gradient-to-b from-rose-500/90 to-rose-800/95 shadow-[0_0_3px_rgba(244,63,94,0.6),inset_0_0.5px_0_rgba(255,255,255,0.35)]",
};

const EMPTY_CLASS =
  "border border-zinc-700/45 bg-zinc-950/85 shadow-[inset_0_0_2px_rgba(0,0,0,0.85)]";

/**
 * @param {{
 *   slots?: (import("@/lib/moeBuffUi").MoeBuffIconView|null)[],
 *   columns?: number,
 *   rows?: number,
 *   insetPx?: number,
 *   iconPx?: number,
 * }} props
 */
export default function MoeBuffIconStrip({
  slots = [],
  columns = MOE_PLAYER_BUFF_COLUMNS,
  rows = 2,
  insetPx = 7,
  iconPx = MOE_BUFF_ICON_PX,
}) {
  const maxSlots = columns * rows;
  const padded = slots.slice(0, maxSlots);
  while (padded.length < maxSlots) padded.push(null);
  const cellStyle = { width: iconPx, height: iconPx };

  return (
    <div
      className="bg-black"
      style={{ paddingLeft: insetPx, paddingRight: insetPx }}
      aria-label="バフ"
    >
      <div
        className="grid justify-start"
        style={{
          gridTemplateColumns: `repeat(${columns}, ${iconPx}px)`,
          gap: MOE_BUFF_ICON_GAP_PX,
        }}
      >
        {padded.map((slot, i) => {
          if (!slot) {
            return (
              <div
                key={`buff-empty-${i}`}
                className={`rounded-[1px] ${EMPTY_CLASS}`}
                style={cellStyle}
                aria-hidden
              />
            );
          }
          const tone = slot.tone ?? "buff";
          return (
            <div
              key={slot.id}
              className={`relative flex items-center justify-center rounded-[1px] border ${TONE_CLASS[tone] ?? TONE_CLASS.buff}`}
              style={cellStyle}
              title={slot.label}
            >
              <span
                className="pointer-events-none text-[8px] leading-none drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.9)]"
                aria-hidden
              >
                {slot.icon}
              </span>
              {slot.remainSec != null && slot.remainSec > 0 ? (
                <span
                  className="pointer-events-none absolute bottom-0 right-0 text-[5px] font-bold tabular-nums leading-none text-white drop-shadow-[0_0_1px_rgba(0,0,0,1)]"
                >
                  {slot.remainSec}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
