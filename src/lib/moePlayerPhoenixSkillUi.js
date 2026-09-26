"use client";

import { MOE_PLAYER_SKILL2_ONLY_SKILLS } from "@/data/moePlayerSkill2Skills";
import { MOE_PHOENIX_DRAGON_SKILLS } from "@/data/moePhoenixDragon";
import { MOE_PLAYER_SKILL_SLOT_COUNT } from "@/data/moePlayerNinjaSkills";
import { renderPetSkillIcon } from "@/lib/moePetSkillIcons";
import {
  formatMoePhoenixPlayerSkillDescription,
  phoenixPlayerSkillMpCost,
} from "@/lib/moePhoenixPlayerSkill";
import { canUsePlayerSkill2 } from "@/lib/moePlayerSkill2Progress";

/** プレイヤー技② — 自力整然 Lv10 ＋ フェニックス系 */
export function buildPlayerPhoenixSkillList() {
  const phoenix = MOE_PHOENIX_DRAGON_SKILLS.filter((s) => {
    if (s.playerSkill2Only) return false;
    if (s.type === "passive") return false;
    return s.level > 1;
  });
  return [...MOE_PLAYER_SKILL2_ONLY_SKILLS, ...phoenix]
    .sort((a, b) => a.level - b.level)
    .slice(0, MOE_PLAYER_SKILL_SLOT_COUNT);
}

function renderPlayerSkill2Icon(skill) {
  if (skill?.id === "jiriki_seiran") return "🧘";
  return renderPetSkillIcon(skill?.name, { size: 22 });
}

/**
 * @param {import("@/lib/moePlayerSkill2Progress").MoePlayerSkill2Progress} playerSkill2Progress
 * @param {(index: number, skill: object) => void} onActivate
 * @param {{
 *   skillChanting?: boolean,
 *   skillChantKind?: string|null,
 *   skillChantSkillId?: string|null,
 *   skillChantRemainSec?: number|null,
 *   phoenixHabitAtk2x?: boolean,
 *   jirikiSeiranActive?: boolean,
 *   playerMp?: number,
 * }} [ctx]
 */
export function buildPlayerPhoenixSkillSlotEntries(
  playerSkill2Progress,
  onActivate,
  ctx = {}
) {
  const skills = buildPlayerPhoenixSkillList();
  const chanting = Boolean(ctx.skillChanting && ctx.skillChantKind === "phoenix");
  const playerMp = ctx.playerMp ?? 0;
  const skill2Meta = {
    level: playerSkill2Progress?.level ?? 0,
    exp: playerSkill2Progress?.exp ?? 0,
    devCheck: canUsePlayerSkill2(skills[0], playerSkill2Progress).devCheck,
  };
  const rows = skills.map((skill, i) => {
    const access = canUsePlayerSkill2(skill, playerSkill2Progress);
    const locked = !access.ok;
    const isThisChanting = chanting && ctx.skillChantSkillId === skill.id;
    const remainSec =
      isThisChanting && ctx.skillChantRemainSec != null
        ? ctx.skillChantRemainSec
        : null;
    const habitActive =
      (skill.id === "phoenix_scorching_sky" ||
        skill.id === "phoenix_ultimate_sleep") &&
      Boolean(ctx.phoenixHabitAtk2x);
    const seiranActive =
      skill.id === "jiriki_seiran" && Boolean(ctx.jirikiSeiranActive);
    const mpCost = phoenixPlayerSkillMpCost(skill);
    const mpShort =
      !locked &&
      mpCost > 0 &&
      playerMp < mpCost &&
      !habitActive &&
      !seiranActive;
    return {
      slotKey: skill.id,
      label: skill.name ?? "—",
      icon: renderPlayerSkill2Icon(skill),
      active: habitActive || seiranActive,
      disabled: locked || (chanting && !isThisChanting),
      unusable: mpShort,
      cooldownSec: remainSec,
      title: isThisChanting
        ? skill.id === "phoenix_deep_sleep"
          ? `💤 ${skill.name}…（残り${remainSec ?? 0}秒）`
          : `${skill.name}詠唱中…（残り${remainSec ?? 0}秒）`
        : mpShort
          ? `${formatMoePhoenixPlayerSkillDescription(skill, locked, skill2Meta)}\nMPが足りません（${playerMp}/${mpCost}）`
          : formatMoePhoenixPlayerSkillDescription(skill, locked, skill2Meta),
      onClick: () => onActivate(i, skill),
      reorderable: false,
    };
  });
  while (rows.length < MOE_PLAYER_SKILL_SLOT_COUNT) {
    rows.push({
      slotKey: null,
      label: "—",
      icon: "·",
      disabled: true,
      title: `スキル${rows.length + 1}（空き）`,
      reorderable: false,
    });
  }
  return rows;
}
