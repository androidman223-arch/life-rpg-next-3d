"use client";

import { useState } from "react";
import {
  MOE_PET_SKILL_MODE_ALL,
  MOE_PET_SKILL_MODE_LEARNED,
} from "@/lib/moePetSkillSettings";
import {
  MOE_TRAINING_SKILL_MODE_ALL,
  MOE_TRAINING_SKILL_MODE_LEARNED,
} from "@/lib/moeTrainingSkillSettings";

const LABEL_W = "w-[4.5rem]";

const toggleBtn = (active, accent) =>
  `min-w-0 flex-1 rounded-sm border px-1 py-0.5 text-[8px] font-bold leading-tight transition active:scale-[0.98] ${
    active
      ? `${accent} ring-1`
      : "border-zinc-700/35 bg-zinc-950/35 text-zinc-100/80 hover:bg-zinc-900/30"
  }`;

/**
 * @param {{ label: string, labelClass?: string, labelWidth?: string, children: React.ReactNode }} props
 */
function SettingRow({
  label,
  labelClass = "text-violet-200/95",
  labelWidth = LABEL_W,
  children,
}) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className={`${labelWidth} shrink-0 text-[8px] font-bold leading-none ${labelClass}`}>
        {label}
      </span>
      <div className="flex min-w-0 flex-1 gap-px">{children}</div>
    </div>
  );
}

/**
 * 設定パネル内 — ペット戦闘・修行・成功率・愛着
 * 愛着度１００％: スキル命令可＝手動OK·攻撃のみ / オートAIのみ＝MOE本家·Lv降順
 */
export default function MoePetSettingsSection({
  petLoyaltyGate100,
  onPetLoyaltyGate100Change,
  petSkillMode,
  onPetSkillModeChange,
  trainingSkillMode,
  onTrainingSkillModeChange,
  skillSuccess100,
  onSkillSuccess100Change,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded border border-violet-500/35 bg-violet-950/30 px-2 py-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left text-[11px] font-bold text-violet-100 transition hover:text-violet-50 active:scale-[0.99]"
        aria-expanded={open}
        aria-controls="moe-pet-settings-body"
      >
        <span>ペット設定</span>
        <span className="text-[9px] font-normal text-violet-200/55">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open ? (
        <div
          id="moe-pet-settings-body"
          className="mt-1.5 flex flex-col gap-1 border-t border-violet-500/20 pt-1.5"
        >
          <SettingRow
            label="愛着度１００％"
            labelClass="text-pink-200/95"
            labelWidth="w-[5.25rem]"
          >
            <button
              type="button"
              onClick={() => onPetLoyaltyGate100Change(false)}
              className={toggleBtn(
                !petLoyaltyGate100,
                "border-pink-300/70 bg-pink-800/75 text-pink-50 ring-pink-200/30"
              )}
            >
              スキル命令可
            </button>
            <button
              type="button"
              onClick={() => onPetLoyaltyGate100Change(true)}
              className={toggleBtn(
                petLoyaltyGate100,
                "border-pink-300/70 bg-pink-800/75 text-pink-50 ring-pink-200/30"
              )}
            >
              オートAIのみ
            </button>
          </SettingRow>
          <p className="px-0.5 text-[8px] leading-snug text-violet-200/55">
            愛着UP:ペットよりLv7以上の敵を倒す（50%·2回目100%）
          </p>
          <p className="px-0.5 text-[8px] leading-snug text-violet-200/55">
            ★ オートAIのみ＝手動不可·スキルLVの高い順に発動
          </p>

          <div className="border-t border-violet-500/15 pt-1">
            <SettingRow label="ペットスキル">
              <button
                type="button"
                onClick={() => onPetSkillModeChange(MOE_PET_SKILL_MODE_ALL)}
                className={toggleBtn(
                  petSkillMode === MOE_PET_SKILL_MODE_ALL,
                  "border-violet-300/70 bg-violet-800/75 text-violet-50 ring-violet-200/30"
                )}
              >
                仮習得済
              </button>
              <button
                type="button"
                onClick={() =>
                  onPetSkillModeChange(MOE_PET_SKILL_MODE_LEARNED)
                }
                className={toggleBtn(
                  petSkillMode === MOE_PET_SKILL_MODE_LEARNED,
                  "border-violet-300/70 bg-violet-800/75 text-violet-50 ring-violet-200/30"
                )}
              >
                習得のみ
              </button>
            </SettingRow>

            <SettingRow label="鳳凰龍神" labelClass="text-orange-200/95">
              <button
                type="button"
                onClick={() =>
                  onTrainingSkillModeChange(MOE_TRAINING_SKILL_MODE_ALL)
                }
                className={toggleBtn(
                  trainingSkillMode === MOE_TRAINING_SKILL_MODE_ALL,
                  "border-orange-300/70 bg-orange-800/75 text-orange-50 ring-orange-200/30"
                )}
              >
                仮習得済
              </button>
              <button
                type="button"
                onClick={() =>
                  onTrainingSkillModeChange(MOE_TRAINING_SKILL_MODE_LEARNED)
                }
                className={toggleBtn(
                  trainingSkillMode === MOE_TRAINING_SKILL_MODE_LEARNED,
                  "border-orange-300/70 bg-orange-800/75 text-orange-50 ring-orange-200/30"
                )}
              >
                習得のみ
              </button>
            </SettingRow>
          </div>

          <div className="border-t border-violet-500/15 pt-1">
            <SettingRow label="成功率" labelClass="text-sky-200/95">
              <button
                type="button"
                onClick={() => onSkillSuccess100Change(true)}
                className={toggleBtn(
                  skillSuccess100,
                  "border-sky-300/70 bg-sky-800/75 text-sky-50 ring-sky-200/30"
                )}
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => onSkillSuccess100Change(false)}
                className={toggleBtn(
                  !skillSuccess100,
                  "border-sky-300/70 bg-sky-800/75 text-sky-50 ring-sky-200/30"
                )}
              >
                MOE風
              </button>
            </SettingRow>
          </div>
        </div>
      ) : null}
    </div>
  );
}
