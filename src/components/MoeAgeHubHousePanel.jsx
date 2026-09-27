"use client";

import { moePetTrainingGuideForAgeHub } from "@/lib/moePetTrainingGuide";
import { MOE_AGE_HUB_HOUSE } from "@/lib/moe3dAgeHubHouse";
import { MOE_CAMPFIRE_REST } from "@/lib/moeCampfireRestCore";
import { MOE_AGE_HUB_HOUSE_PET_REGEN } from "@/lib/moeAgeHubHouseRegen";

/**
 * @param {{
 *   open: boolean,
 *   view: "menu" | "training" | "restConfirm",
 *   onViewChange: (view: "menu" | "training" | "restConfirm") => void,
 *   onStartRest: () => void,
 * }} props
 */
export default function MoeAgeHubHousePanel({
  open,
  view,
  onViewChange,
  onStartRest,
}) {
  if (!open) return null;

  const sections = view === "training" ? moePetTrainingGuideForAgeHub() : [];

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-label={MOE_AGE_HUB_HOUSE.houseLabel}
    >
      <div
        className="flex max-h-[82vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-teal-400/35 bg-zinc-950/96 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-white/10 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-teal-300/85">
            {MOE_AGE_HUB_HOUSE.houseEmoji} {MOE_AGE_HUB_HOUSE.restAreaLabel}
          </div>
          <div className="text-base font-bold text-teal-50">
            {view === "training"
              ? "ペット敵 LV 育成表"
              : MOE_AGE_HUB_HOUSE.houseLabel}
          </div>
          {view === "menu" && (
            <div className="mt-0.5 space-y-0.5 text-xs text-zinc-400">
              <div>{MOE_AGE_HUB_HOUSE.kanbanSub}</div>
              <div className="text-teal-300/80">
                🐾 室内：{MOE_AGE_HUB_HOUSE_PET_REGEN.intervalSec}秒ごと HP+
                {MOE_AGE_HUB_HOUSE_PET_REGEN.hp} MP+
                {MOE_AGE_HUB_HOUSE_PET_REGEN.mp}
              </div>
            </div>
          )}
          {view === "training" && (
            <div className="mt-0.5 text-xs text-zinc-400">
              マップごとのフィールド敵 · 公式 Lv（AGE面は未登録でも見出し表示）
            </div>
          )}
          {view === "restConfirm" && (
            <div className="mt-2 text-sm text-amber-100/90">
              {MOE_CAMPFIRE_REST.confirmPrompt}
            </div>
          )}
        </div>

        {view === "menu" && (
          <div className="flex flex-col gap-2 px-4 py-4">
            <button
              type="button"
              onClick={() => onViewChange("training")}
              className="rounded-xl border-2 border-teal-500/50 bg-teal-950/40 px-4 py-3 text-left text-sm font-bold text-teal-50 transition hover:bg-teal-900/50 active:scale-[0.99]"
            >
              {MOE_AGE_HUB_HOUSE.houseEmoji} {MOE_AGE_HUB_HOUSE.buttonLabel}
            </button>
            <button
              type="button"
              onClick={() => onViewChange("restConfirm")}
              className="rounded-xl border-2 border-orange-400/55 bg-orange-950/35 px-4 py-3 text-left text-sm font-bold text-orange-50 transition hover:bg-orange-900/45 active:scale-[0.99]"
            >
              {MOE_AGE_HUB_HOUSE.campfireNearLabel}
            </button>
          </div>
        )}

        {view === "restConfirm" && (
          <div className="flex flex-col gap-2 px-4 py-4">
            <button
              type="button"
              onClick={() => {
                onStartRest();
                onViewChange("menu");
              }}
              className="rounded-xl border-2 border-amber-400/50 bg-amber-950/45 px-4 py-3 text-sm font-bold text-amber-50 transition hover:bg-amber-900/55 active:scale-[0.99]"
            >
              {MOE_CAMPFIRE_REST.yesLabel}
            </button>
            <button
              type="button"
              onClick={() => onViewChange("menu")}
              className="rounded-xl border border-zinc-600/60 bg-zinc-800/80 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-700/90"
            >
              {MOE_CAMPFIRE_REST.noLabel}
            </button>
          </div>
        )}

        {view === "training" && (
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <div className="mb-2 text-[10px] text-zinc-400">
              🔥 焚き火で休息 · BGM：散策（休息向け）
            </div>
            {sections.map((section) => (
              <section key={section.mapSlotId} className="mb-4 last:mb-0">
                <h3 className="mb-1.5 px-1 text-sm font-bold text-sky-100">
                  {section.areaJa}
                  {section.empty ? (
                    <span className="ml-1.5 text-[10px] font-normal text-zinc-500">
                      準備中
                    </span>
                  ) : null}
                </h3>
                <div className="overflow-hidden rounded-xl border border-zinc-700/60">
                  {section.empty ? (
                    <p className="px-3 py-3 text-xs text-zinc-500">
                      敵データはマクロ１追加時に自動で載ります
                    </p>
                  ) : (
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-900/90 text-[10px] uppercase tracking-wide text-zinc-500">
                          <th className="px-3 py-2 font-semibold">敵</th>
                          <th className="px-3 py-2 text-right font-semibold">
                            Lv
                          </th>
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
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="shrink-0 border-t border-white/10 px-4 py-2.5">
          {view === "training" || view === "restConfirm" ? (
            <button
              type="button"
              onClick={() => onViewChange("menu")}
              className="w-full rounded-lg border border-zinc-600/60 bg-zinc-800/80 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-700/90"
            >
              メニューに戻る
            </button>
          ) : (
            <p className="text-center text-[10px] text-zinc-500">
              拠点から離れると閉じます
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
