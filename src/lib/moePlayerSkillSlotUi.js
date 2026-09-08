"use client";

import MoeShinsokuIcon from "@/components/icons/MoeShinsokuIcon";
import MoeShinobiashiIcon from "@/components/icons/MoeShinobiashiIcon";
import MoeKakureminoIcon from "@/components/icons/MoeKakureminoIcon";
import {
  MOE_PLAYER_SLOT_ICONS,
  MOE_PLAYER_SLOT_LABELS,
} from "@/data/moePlayerSkillSlotOrder";

const NINJA_ICONS = {
  MoeShinobiashiIcon,
  MoeShinsokuIcon,
  MoeKakureminoIcon,
};

/**
 * @param {string|null} key
 * @param {import("@/data/moePlayerNinjaSkills").MoePlayerNinjaSkill|null} ninjaSkill
 */
export function renderPlayerSlotIcon(key, ninjaSkill) {
  if (!key) return "·";
  if (MOE_PLAYER_SLOT_ICONS[key]) {
    return MOE_PLAYER_SLOT_ICONS[key];
  }
  if (ninjaSkill) {
    const Icon = NINJA_ICONS[ninjaSkill.iconComponent];
    if (Icon) return <Icon size={22} />;
    return ninjaSkill.icon ?? "✦";
  }
  return "·";
}

/**
 * @param {string|null} key
 * @param {number} slotIndex
 * @param {object} ctx
 */
export function buildPlayerSkillSlotEntry(key, slotIndex, ctx) {
  const slotNum = slotIndex + 1;
  if (!key) {
    return {
      slotKey: null,
      label: "—",
      icon: "·",
      disabled: true,
      title: `スキル${slotNum}（空き）`,
      reorderable: true,
    };
  }

  const label = MOE_PLAYER_SLOT_LABELS[key] ?? key;

  if (key === "light") {
    return {
      slotKey: key,
      label,
      icon: renderPlayerSlotIcon(key, null),
      title: `ライトヒール +${ctx.healAmountLight} HP`,
      onClick: ctx.onLight,
      reorderable: true,
    };
  }

  if (key === "heal") {
    const cd = ctx.healCdSec.healing ?? 0;
    return {
      slotKey: key,
      label,
      icon: renderPlayerSlotIcon(key, null),
      disabled: cd > 0,
      cooldownSec: cd > 0 ? cd : null,
      title:
        cd > 0
          ? `ヒーリング · 待機中（${cd}秒）`
          : `ヒーリング +${ctx.healAmountHeal} HP`,
      onClick: ctx.onHeal,
      reorderable: true,
    };
  }

  if (key === "heal-all") {
    const cd = ctx.healCdSec.healAll ?? 0;
    return {
      slotKey: key,
      label,
      icon: renderPlayerSlotIcon(key, null),
      disabled: cd > 0,
      cooldownSec: cd > 0 ? cd : null,
      title:
        cd > 0
          ? `ヒーリングオール · 待機中（${cd}秒）`
          : `ヒーリングオール +${ctx.healAmountAll} HP`,
      onClick: ctx.onHealAll,
      reorderable: true,
    };
  }

  if (key === "regen") {
    return {
      slotKey: key,
      label,
      icon: renderPlayerSlotIcon(key, null),
      active: ctx.regenActive,
      title: `2秒ごと HP+${ctx.petRegenHp} MP+${ctx.petRegenMp}（トグル）`,
      onClick: ctx.onRegenToggle,
      reorderable: true,
    };
  }

  const skill = ctx.ninjaById[key] ?? null;
  const filled = Boolean(skill);
  let active = false;
  let cooldownSec = null;
  if (skill?.id === "ninja_shinobiashi") active = ctx.shinobiashiOn;
  if (skill?.id === "ninja_shinsoku") {
    active = ctx.dashBoost3x;
    cooldownSec = ctx.playerSkillCooldownSec.ninja_shinsoku ?? null;
  }

  return {
    slotKey: key,
    label,
    icon: renderPlayerSlotIcon(key, skill),
    disabled: !filled || active,
    active: filled && active,
    cooldownSec: filled ? cooldownSec : null,
    title: skill
      ? `Lv${skill.level} ${skill.name}`
      : `${label}（未習得）`,
    onClick: () => filled && skill && ctx.onNinja(skill),
    reorderable: true,
  };
}
