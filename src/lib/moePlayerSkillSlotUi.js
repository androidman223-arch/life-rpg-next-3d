"use client";

import MoeHolyRecordIcon from "@/components/icons/MoeHolyRecordIcon";
import MoeTeleportIcon from "@/components/icons/MoeTeleportIcon";
import MoeShinsokuIcon from "@/components/icons/MoeShinsokuIcon";
import MoeShinobiashiIcon from "@/components/icons/MoeShinobiashiIcon";
import MoeKakureminoIcon from "@/components/icons/MoeKakureminoIcon";
import {
  MOE_PLAYER_SLOT_ICONS,
  MOE_PLAYER_SLOT_LABELS,
} from "@/data/moePlayerSkillSlotOrder";
import {
  MOE_PLAYER_UTILITY_SLOT_ICONS,
  MOE_PLAYER_UTILITY_SLOT_LABELS,
} from "@/data/moePlayerUtilitySkills";
import { formatMoePetSkillDescription } from "@/lib/moePetSkillDescription";
import {
  MOE_BANANA_MILK_STAMINA_REGEN_MULT,
  MOE_PLAYER_SPRINT_STAMINA_DRAIN_PER_SEC,
  moePlayerBananaMilkStaminaRegenPerSec,
} from "@/lib/moePlayerVitals";

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

  if (key === "banana_milk") {
    const regenPerSec = moePlayerBananaMilkStaminaRegenPerSec();
    const drainPerSec = MOE_PLAYER_SPRINT_STAMINA_DRAIN_PER_SEC;
    const sprintHint =
      regenPerSec > drainPerSec
        ? `走行中も+${regenPerSec}/秒（消費${drainPerSec}/秒を上回る）`
        : regenPerSec === drainPerSec
          ? `走行中も+${regenPerSec}/秒（走行消費と相殺）`
          : `走行中も+${regenPerSec}/秒（消費${drainPerSec}/秒）`;
    return {
      slotKey: key,
      label,
      icon: renderPlayerSlotIcon(key, null),
      active: ctx.bananaMilkActive,
      title: ctx.bananaMilkActive
        ? `バナナミルク効果中 — ${sprintHint}`
        : `バナナミルクを飲む — 走行中もスタミナ回復${MOE_BANANA_MILK_STAMINA_REGEN_MULT}倍（トグル）`,
      onClick: ctx.onBananaMilkToggle,
      reorderable: true,
    };
  }

  if (key === "condense_mind") {
    const casterMp = ctx.playerMp ?? 0;
    const mpCost = ctx.condenseMindMpCost ?? 34;
    const targetLabel =
      ctx.allyTarget === "player"
        ? "プレイヤー"
        : ctx.allyTarget === "pet"
          ? "ペット"
          : "対象";
    const canUse = casterMp >= mpCost;
    const active = Boolean(ctx.condenseMindActiveOnTarget);
    return {
      slotKey: key,
      label,
      icon: renderPlayerSlotIcon(key, null),
      active,
      disabled: false,
      unusable: !canUse && !active,
      title: active
        ? `コンデンスマインド — ${targetLabel}にMP自然回復アップ中（約${ctx.condenseMindMpPerSec ?? 2}MP/秒）`
        : !ctx.allyTarget
          ? "プレイヤーまたはペットのステータスをクリックしてターゲット"
          : casterMp < mpCost
            ? `MPが足りません（消費${mpCost}）`
            : `コンデンスマインド → ${targetLabel} · 消費${mpCost}`,
      onClick: ctx.onCondenseMind,
      reorderable: true,
    };
  }

  if (key === "holy_record") {
    const chanting = Boolean(ctx.skillChanting && ctx.skillChantKind === "holy_record");
    const remainSec =
      chanting && ctx.skillChantRemainSec != null ? ctx.skillChantRemainSec : null;
    return {
      slotKey: key,
      label,
      icon: <MoeHolyRecordIcon size={22} />,
      disabled: Boolean(ctx.skillChanting),
      cooldownSec: remainSec,
      title: chanting
        ? `ホーリーレコード詠唱中…（残り${remainSec ?? 0}秒）`
        : "詠唱して現在地を記録",
      onClick: ctx.onHolyRecord,
      reorderable: true,
    };
  }

  if (key === "teleport") {
    const chanting = Boolean(ctx.skillChanting && ctx.skillChantKind === "teleport");
    const remainSec =
      chanting && ctx.skillChantRemainSec != null ? ctx.skillChantRemainSec : null;
    return {
      slotKey: key,
      label,
      icon: <MoeTeleportIcon size={22} />,
      disabled: Boolean(ctx.skillChanting),
      cooldownSec: remainSec,
      title: chanting
        ? `テレポート詠唱中…（残り${remainSec ?? 0}秒）`
        : "詠唱してホームへテレポ",
      onClick: ctx.onTeleport,
      reorderable: true,
    };
  }

  const skill = ctx.ninjaById[key] ?? null;
  const filled = Boolean(skill);
  let active = false;
  let cooldownSec = null;
  if (skill?.id === "ninja_shinobiashi") active = ctx.shinobiashiOn;
  if (skill?.id === "ninja_shinsoku") active = ctx.dashBoost3x;
  if (skill?.id === "ninja_kakuremino") active = Boolean(ctx.kakureminoActive);
  if (
    skill?.id === "ninja_kakuremino" &&
    !ctx.kakureminoActive &&
    (ctx.kakureminoCooldownSec ?? 0) > 0
  ) {
    cooldownSec = ctx.kakureminoCooldownSec;
  }

  const toggleNinja =
    skill?.id === "ninja_shinobiashi" || skill?.id === "ninja_shinsoku";
  const kakureminoBusy =
    skill?.id === "ninja_kakuremino" &&
    (Boolean(ctx.kakureminoActive) || (ctx.kakureminoCooldownSec ?? 0) > 0);

  return {
    slotKey: key,
    label,
    icon: renderPlayerSlotIcon(key, skill),
    disabled: !filled || (!toggleNinja && active) || kakureminoBusy,
    active: filled && active,
    cooldownSec: filled ? cooldownSec : null,
    title: skill
      ? formatMoePetSkillDescription(skill)
      : `${label}（未習得）`,
    onClick: () => filled && skill && ctx.onNinja(skill),
    reorderable: true,
  };
}

/**
 * @param {string|null} key
 * @param {number} slotIndex
 * @param {object} ctx
 */
export function buildPlayerUtilitySkillSlotEntry(key, slotIndex, ctx) {
  const slotNum = slotIndex + 1;
  if (!key) {
    return {
      slotKey: null,
      label: "—",
      icon: "·",
      disabled: true,
      title: `調査${slotNum}（空き）`,
      reorderable: false,
    };
  }

  const label = MOE_PLAYER_UTILITY_SLOT_LABELS[key] ?? key;
  const icon = MOE_PLAYER_UTILITY_SLOT_ICONS[key] ?? "✦";

  if (key === "enemy_stat_search") {
    const hasTarget = Boolean(ctx.targetEnemy);
    return {
      slotKey: key,
      label,
      icon,
      active: Boolean(ctx.enemyStatSearchOpen),
      disabled: !hasTarget,
      title: hasTarget
        ? "ターゲット敵のHP・MP・攻撃・スキルを調べる"
        : "敵をクリックしてターゲットを選んでから使う",
      onClick: ctx.onEnemyStatSearch,
      reorderable: false,
    };
  }

  return {
    slotKey: key,
    label,
    icon,
    disabled: true,
    title: label,
    reorderable: false,
  };
}
