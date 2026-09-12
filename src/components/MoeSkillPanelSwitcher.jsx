"use client";

import { cycleMoeSkillPanelMode } from "@/lib/moeSkillPanelModeSettings";

/** @typedef {'player1' | 'player2' | 'player3' | 'pet'} MoeSkillPanelMode */

export { cycleMoeSkillPanelMode };

const LABELS = {
  player1: "プレイヤー技①",
  player2: "プレイヤー技②",
  player3: "プレイヤー技③",
  pet: "ペット",
};

/**
 * プレイヤー技① / 技② / 技③ / ペット — ←→ でループ切替
 * @param {{ mode: MoeSkillPanelMode, onSelectMode: (mode: MoeSkillPanelMode) => void, petLabel?: string }} props
 */
export default function MoeSkillPanelSwitcher({
  mode,
  onSelectMode,
  petLabel = LABELS.pet,
}) {
  const label =
    mode === "pet" ? petLabel : LABELS[mode] ?? LABELS.pet;

  const activeBtn =
    mode === "player2"
      ? "border-fuchsia-300/70 bg-fuchsia-800/80 text-fuchsia-50 ring-1 ring-fuchsia-200/35"
      : mode === "player3"
        ? "border-violet-300/70 bg-violet-800/80 text-violet-50 ring-1 ring-violet-200/35"
        : mode === "player1"
          ? "border-emerald-300/70 bg-emerald-800/80 text-emerald-50 ring-1 ring-emerald-200/35"
          : "border-amber-300/70 bg-amber-800/80 text-amber-50 ring-1 ring-amber-200/35";

  const idleBtn =
    mode === "player2"
      ? "border-fuchsia-700/45 bg-fuchsia-950/50 text-fuchsia-100/90 hover:bg-fuchsia-900/45"
      : mode === "player3"
        ? "border-violet-700/45 bg-violet-950/50 text-violet-100/90 hover:bg-violet-900/45"
        : mode === "player1"
          ? "border-emerald-700/45 bg-emerald-950/50 text-emerald-100/90 hover:bg-emerald-900/45"
          : "border-amber-700/45 bg-amber-950/50 text-amber-100/90 hover:bg-amber-900/45";

  const centerTone =
    mode === "player2"
      ? "border-fuchsia-600/35 bg-fuchsia-950/40 text-fuchsia-100/90"
      : mode === "player3"
        ? "border-violet-600/35 bg-violet-950/40 text-violet-100/90"
        : mode === "player1"
          ? "border-emerald-600/35 bg-emerald-950/40 text-emerald-100/90"
          : "border-amber-600/35 bg-amber-950/40 text-amber-100/90";

  const goPrev = () => onSelectMode(cycleMoeSkillPanelMode(mode, "prev"));
  const goNext = () => onSelectMode(cycleMoeSkillPanelMode(mode, "next"));

  return (
    <div className="flex items-stretch gap-0.5">
      <button
        type="button"
        title="← で前のスキルセット"
        onClick={goPrev}
        className={`w-[4.25rem] shrink-0 rounded border px-0 py-0.5 text-[8px] font-bold leading-none transition active:scale-95 ${idleBtn}`}
      >
        ←
      </button>
      <div
        className={`flex min-w-0 flex-1 items-center justify-center rounded border px-0.5 py-0.5 text-[8px] font-bold leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] ${centerTone}`}
      >
        {label}
      </div>
      <button
        type="button"
        title="→ で次のスキルセット"
        onClick={goNext}
        className={`w-[4.25rem] shrink-0 rounded border px-0 py-0.5 text-[8px] font-bold leading-none transition active:scale-95 ${activeBtn}`}
      >
        →
      </button>
    </div>
  );
}
