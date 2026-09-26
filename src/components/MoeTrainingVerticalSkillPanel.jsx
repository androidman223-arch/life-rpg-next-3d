"use client";

import { useEffect, useMemo, useState } from "react";
import MoeVerticalSkillPanel from "@/components/MoeVerticalSkillPanel";
import { loadPlayerExperienceTrack } from "@/lib/moePlayerExperience";
import {
  buildDragonTrainingVerticalSlots,
  buildPhoenixTrainingVerticalSlots,
} from "@/lib/moeTrainingSkillVerticalUi";

/** @typedef {'phoenix' | 'dragon'} MoeTrainingSkillPanelKind */

/** 既存縦スキル（技①②③）のサイズを初回だけ引き継ぐ */
const LAYOUT_INHERIT_FROM = [
  "life-rpg-moe-merged-skill-panel-a",
  "life-rpg-moe-merged-skill-panel-b",
];

const PANEL_META = {
  phoenix: {
    title: "鳳凰スキル",
    variant: "amber",
    track: "phoenix",
  },
  dragon: {
    title: "龍神スキル",
    variant: "emerald",
    track: "dragon",
  },
};

/**
 * 修行スキルゲット表 — 縦スキル（Lv10〜90 · 9枠）
 * @param {{
 *   kind: MoeTrainingSkillPanelKind,
 *   storageKey: string,
 *   defaultPos?: () => { x: number, y: number },
 *   onActivateSkill?: (track: 'phoenix' | 'dragon', level: number) => void,
 *   skillMode?: import("@/lib/moeTrainingSkillSettings").MoeTrainingSkillMode,
 * }} props
 */
export default function MoeTrainingVerticalSkillPanel({
  kind,
  storageKey,
  defaultPos,
  onActivateSkill,
  skillMode = "all",
}) {
  const meta = PANEL_META[kind] ?? PANEL_META.phoenix;
  const [practiceLevel, setPracticeLevel] = useState(() =>
    loadPlayerExperienceTrack(meta.track).level ?? 0
  );

  useEffect(() => {
    const refresh = () => {
      setPracticeLevel(loadPlayerExperienceTrack(meta.track).level ?? 0);
    };
    refresh();
    const id = window.setInterval(refresh, 2000);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("storage", refresh);
    };
  }, [meta.track]);

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

  const levelLabel = Math.floor(practiceLevel);

  return (
    <MoeVerticalSkillPanel
      storageKey={storageKey}
      defaultPos={defaultPos}
      layoutInheritFrom={LAYOUT_INHERIT_FROM}
      title={meta.title}
      variant={meta.variant}
      headerExtra={
        <p
          className={`cursor-grab touch-none border-b border-white/10 bg-black/85 py-px text-center text-[7px] font-bold leading-none active:cursor-grabbing ${
            kind === "dragon" ? "text-emerald-200/95" : "text-amber-200/95"
          }`}
          title="ドラッグで移動 · 右下で幅・高さ変更"
        >
          {meta.title}
          <span className="block text-[6px] font-normal opacity-75">
            {kind === "dragon" ? "実践" : "知恵"} Lv.{levelLabel}
          </span>
        </p>
      }
      slots={slots}
    />
  );
}
