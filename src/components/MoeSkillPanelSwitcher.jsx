"use client";

import { cycleMoeSkillPanelMode } from "@/lib/moeSkillPanelModeSettings";

/** @typedef {'player1' | 'macro' | 'player2' | 'player3' | 'pet' | 'phoenix' | 'dragon'} MoeSkillPanelMode */

export { cycleMoeSkillPanelMode };

const LABELS = {
  player1: "プレイヤー技①",
  macro: "マクロ",
  player2: "セット1",
  player3: "セット2",
  pet: "ペット",
  phoenix: "鳳凰",
  dragon: "龍神",
};

function switcherTone(mode) {
  if (mode === "macro") {
    return {
      active:
        "border-amber-300/70 bg-amber-800/80 text-amber-50 ring-1 ring-amber-200/35",
      idle: "border-amber-700/45 bg-amber-950/50 text-amber-100/90 hover:bg-amber-900/45",
      center: "border-amber-600/35 bg-amber-950/40 text-amber-100/90",
    };
  }
  if (mode === "player2") {
    return {
      active:
        "border-fuchsia-300/70 bg-fuchsia-800/80 text-fuchsia-50 ring-1 ring-fuchsia-200/35",
      idle: "border-fuchsia-700/45 bg-fuchsia-950/50 text-fuchsia-100/90 hover:bg-fuchsia-900/45",
      center: "border-fuchsia-600/35 bg-fuchsia-950/40 text-fuchsia-100/90",
    };
  }
  if (mode === "player3") {
    return {
      active:
        "border-violet-300/70 bg-violet-800/80 text-violet-50 ring-1 ring-violet-200/35",
      idle: "border-violet-700/45 bg-violet-950/50 text-violet-100/90 hover:bg-violet-900/45",
      center: "border-violet-600/35 bg-violet-950/40 text-violet-100/90",
    };
  }
  if (mode === "player1") {
    return {
      active:
        "border-emerald-300/70 bg-emerald-800/80 text-emerald-50 ring-1 ring-emerald-200/35",
      idle: "border-emerald-700/45 bg-emerald-950/50 text-emerald-100/90 hover:bg-emerald-900/45",
      center: "border-emerald-600/35 bg-emerald-950/40 text-emerald-100/90",
    };
  }
  if (mode === "phoenix") {
    return {
      active:
        "border-orange-300/70 bg-orange-700/85 text-orange-50 ring-1 ring-orange-200/35",
      idle: "border-orange-700/45 bg-orange-950/50 text-orange-100/90 hover:bg-orange-900/45",
      center: "border-orange-600/35 bg-orange-950/40 text-orange-100/90",
    };
  }
  if (mode === "dragon") {
    return {
      active:
        "border-sky-300/70 bg-sky-800/80 text-sky-50 ring-1 ring-sky-200/35",
      idle: "border-sky-700/45 bg-sky-950/50 text-sky-100/90 hover:bg-sky-900/45",
      center: "border-sky-600/35 bg-sky-950/40 text-sky-100/90",
    };
  }
  return {
    active:
      "border-amber-300/70 bg-amber-800/80 text-amber-50 ring-1 ring-amber-200/35",
    idle: "border-amber-700/45 bg-amber-950/50 text-amber-100/90 hover:bg-amber-900/45",
    center: "border-amber-600/35 bg-amber-950/40 text-amber-100/90",
  };
}

/**
 * 技① / 技② / 技③ / ペット / 鳳凰 / 龍神 — ←→ でループ
 * @param {{
 *   mode: MoeSkillPanelMode,
 *   onSelectMode: (mode: MoeSkillPanelMode) => void,
 *   petLabel?: string,
 *   modeLabels?: Partial<Record<MoeSkillPanelMode, string>>,
 *   stack?: boolean,
 * }} props
 */
export default function MoeSkillPanelSwitcher({
  mode,
  onSelectMode,
  petLabel = LABELS.pet,
  modeLabels,
  stack = false,
}) {
  const labels = modeLabels ? { ...LABELS, ...modeLabels } : LABELS;
  const label = mode === "pet" ? petLabel : labels[mode] ?? LABELS.pet;
  const tone = switcherTone(mode);

  const goPrev = () => onSelectMode(cycleMoeSkillPanelMode(mode, "prev"));
  const goNext = () => onSelectMode(cycleMoeSkillPanelMode(mode, "next"));

  if (stack) {
    return (
      <div className="flex w-full min-w-0 flex-col">
        <div
          className={`flex h-4 w-full items-center justify-center overflow-hidden whitespace-nowrap px-0.5 text-[10px] font-bold leading-none ${tone.center}`}
        >
          {label}
        </div>
        <div className="flex h-5 w-full">
          <button
            type="button"
            title="前のスキル"
            onClick={goPrev}
            onPointerDown={(event) => event.stopPropagation()}
            className={`h-5 w-1/2 border-0 border-r border-white/25 text-[11px] font-bold leading-none ${tone.idle}`}
          >
            ←
          </button>
          <button
            type="button"
            title="次のスキル"
            onClick={goNext}
            onPointerDown={(event) => event.stopPropagation()}
            className={`h-5 w-1/2 border-0 text-[11px] font-bold leading-none ${tone.active}`}
          >
            →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-stretch gap-0">
      <button
        type="button"
        title="← で前のスキルセット"
        onClick={goPrev}
        className={`w-[2.75rem] shrink-0 rounded-none border-0 border-r px-0 py-px text-[7px] font-bold leading-none transition active:scale-95 ${tone.idle}`}
      >
        ←
      </button>
      <div
        className={`flex min-h-[0.95rem] min-w-0 flex-1 items-center justify-center rounded-none border-0 border-r px-0.5 py-px text-[7px] font-bold leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] ${tone.center}`}
      >
        {label}
      </div>
      <button
        type="button"
        title="→ で次のスキルセット"
        onClick={goNext}
        className={`w-[2.75rem] shrink-0 rounded-none border-0 px-0 py-px text-[7px] font-bold leading-none transition active:scale-95 ${tone.active}`}
      >
        →
      </button>
    </div>
  );
}
