"use client";

import {
  getMoePlayerPreSkillBySlotKey,
  MOE_PLAYER_PRE_SKILL_DEV_NOTE,
} from "@/data/moePlayerPreSkills";
import {
  canUsePlayerPreSkill,
  formatPlayerPreSkillLevelExp,
} from "@/lib/moePlayerPreSkillProgress";
import { formatPlayerPreSkillCombatLine } from "@/lib/moePlayerPreSkillActivate";

const PRE_SKILL_ICONS = {
  jiriki_kaihou: "🐦‍🔥",
  jiriki_seiryu: "🐉",
};

/**
 * @param {import("@/data/moePlayerPreSkills.js").MoePlayerPreSkill} skill
 * @param {boolean} locked
 * @param {{ level: number, exp: number, devCheck?: boolean }} meta
 */
export function formatMoePlayerPreSkillDescription(skill, locked, meta) {
  const lines = [skill.name];
  if (locked) {
    lines.push(`必要スキル値 Lv.${skill.requiredSkillLevel}`);
  } else if (meta.devCheck) {
    lines.push(MOE_PLAYER_PRE_SKILL_DEV_NOTE);
  } else {
    lines.push(formatPlayerPreSkillLevelExp(meta.level, meta.exp));
  }
  const combatLine = formatPlayerPreSkillCombatLine(skill);
  if (combatLine) lines.push(combatLine);
  if (skill.description) lines.push(skill.description);
  if (skill.mpCost > 0) lines.push(`MP${skill.mpCost}`);
  return lines.join("\n");
}

/**
 * @param {string} key
 * @param {number} slotIndex
 * @param {{
 *   playerPreSkillProgress: import("@/lib/moePlayerPreSkillProgress.js").MoePlayerPreSkillProgressMap,
 *   playerMp?: number,
 *   inDuel?: boolean,
 *   onActivatePreSkill: (skill: import("@/data/moePlayerPreSkills.js").MoePlayerPreSkill) => void,
 * }} ctx
 */
export function buildPlayerPreSkillUtilitySlotEntry(key, slotIndex, ctx) {
  const slotNum = slotIndex + 1;
  const skill = getMoePlayerPreSkillBySlotKey(key);
  if (!skill) {
    return {
      slotKey: key,
      label: key,
      icon: "✦",
      disabled: true,
      title: `調査${slotNum}`,
      reorderable: false,
    };
  }

  const progress = ctx.playerPreSkillProgress?.[skill.id];
  const access = canUsePlayerPreSkill(skill, progress);
  const locked = !access.ok;
  const playerMp = ctx.playerMp ?? 0;
  const mpShort = !locked && skill.mpCost > 0 && playerMp < skill.mpCost;
  const needsDuel = skill.category === "attack";
  const duelBlocked = needsDuel && !ctx.inDuel;

  return {
    slotKey: key,
    label: skill.name ?? "—",
    icon: PRE_SKILL_ICONS[key] ?? "✦",
    disabled: locked || duelBlocked,
    unusable: mpShort,
    title: duelBlocked
      ? `${skill.name} — 戦闘中のみ`
      : mpShort
        ? `${formatMoePlayerPreSkillDescription(skill, locked, {
            level: progress?.level ?? 0,
            exp: progress?.exp ?? 0,
            devCheck: access.devCheck,
          })}\nMPが足りません（${playerMp}/${skill.mpCost}）`
        : formatMoePlayerPreSkillDescription(skill, locked, {
            level: progress?.level ?? 0,
            exp: progress?.exp ?? 0,
            devCheck: access.devCheck,
          }),
    onClick: () => ctx.onActivatePreSkill(skill),
    reorderable: false,
  };
}
