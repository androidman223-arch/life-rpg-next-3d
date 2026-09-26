"use client";

import {
  MOE_PET_TRAINING_GUIDE_HOUSE,
  moePetTrainingGuideByMap,
} from "@/lib/moePetTrainingGuide";

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   inHouse?: boolean,
 * }} props
 */
export default function MoePetTrainingGuidePanel({
  open,
  onClose,
  inHouse = false,
}) {
  if (!open) return null;

  const sections = moePetTrainingGuideByMap();

  return (
    <div
      className="absolute inset-0 z-[65] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-label={MOE_PET_TRAINING_GUIDE_HOUSE.panelTitle}
      onClick={onClose}
    >
      <div
        className="max-h-[78vh] w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-400/35 bg-zinc-950/96 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/10 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/85">
            {MOE_PET_TRAINING_GUIDE_HOUSE.houseEmoji}{" "}
            {inHouse
              ? MOE_PET_TRAINING_GUIDE_HOUSE.restAreaLabel
              : "育成メモ"}
          </div>
          <div className="text-base font-bold text-emerald-50">
            {MOE_PET_TRAINING_GUIDE_HOUSE.panelTitle}
          </div>
          <div className="mt-0.5 text-xs text-zinc-400">
            {MOE_PET_TRAINING_GUIDE_HOUSE.panelSubtitle}
          </div>
          {inHouse && (
            <div className="mt-2 text-[10px] text-zinc-400">
              🔥 {MOE_PET_TRAINING_GUIDE_HOUSE.restAreaNote} ·{" "}
              {MOE_PET_TRAINING_GUIDE_HOUSE.bgmNote}
            </div>
          )}
        </div>

        <div className="max-h-[58vh] overflow-y-auto px-3 py-3">
          {sections.map((section) => (
            <section key={section.mapSlotId} className="mb-4 last:mb-0">
              <h3 className="mb-1.5 px-1 text-sm font-bold text-sky-100">
                {section.areaJa}
              </h3>
              <div className="overflow-hidden rounded-xl border border-zinc-700/60">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-zinc-900/90 text-[10px] uppercase tracking-wide text-zinc-500">
                      <th className="px-3 py-2 font-semibold">敵</th>
                      <th className="px-3 py-2 text-right font-semibold">Lv</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.enemies.map((enemy) => (
                      <tr
                        key={enemy.key}
                        className="border-t border-zinc-800/80 even:bg-zinc-900/35"
                      >
                        <td className="px-3 py-2 text-zinc-100">
                          <span className="mr-1.5" aria-hidden>
                            {enemy.emoji}
                          </span>
                          {enemy.name}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-amber-200/95">
                          {enemy.levelLabel.replace(/^Lv/, "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        <div className="border-t border-white/10 px-4 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-zinc-600/60 bg-zinc-800/80 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-700/90"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
