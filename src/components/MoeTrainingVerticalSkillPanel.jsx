"use client";

import { useEffect, useMemo, useState } from "react";
import MoeVerticalSkillPanel from "@/components/MoeVerticalSkillPanel";
import { loadPlayerExperienceTrack } from "@/lib/moePlayerExperience";
import {
  buildDragonTrainingVerticalSlots,
  buildPhoenixTrainingVerticalSlots,
} from "@/lib/moeTrainingSkillVerticalUi";
import {
  MOE_PANEL_ID_MERGED_SKILL_PANEL_A,
  MOE_PANEL_ID_MERGED_SKILL_PANEL_B,
} from "@/lib/moePanelStack";

/** @typedef {'phoenix' | 'dragon'} MoeTrainingSkillPanelKind */

/** 既存縦スキル（技①②③）のサイズを初回だけ引き継ぐ */
const LAYOUT_INHERIT_FROM = [
  MOE_PANEL_ID_MERGED_SKILL_PANEL_A,
  MOE_PANEL_ID_MERGED_SKILL_PANEL_B,
];

const PANEL_META = {
  phoenix: {
    title: "鳳凰スキル",
    variant: "phoenix",
    track: "phoenix",
  },
  dragon: {
    title: "龍神スキル",
    variant: "dragon",
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
 *   onClose?: () => void,
 *   collapsed?: boolean,
 * }} props
 */
export default function MoeTrainingVerticalSkillPanel({
  kind,
  storageKey,
  defaultPos,
  onActivateSkill,
  skillMode = "all",
  onClose,
  collapsed = false,
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
          className={`cursor-grab touch-none border-b border-white/10 py-px text-center text-[7px] font-bold leading-none active:cursor-grabbing ${
            kind === "dragon" ? "text-emerald-950" : "text-orange-950"
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
      onClose={onClose}
      collapsed={collapsed}
    />
  );
}
