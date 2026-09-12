"use client";

import {
  MOE_PHOENIX_DRAGON_SKILLS,
  isMoePetSkillUsableAtLevel,
} from "@/data/moePhoenixDragon";
import { MOE_PLAYER_SKILL_SLOT_COUNT } from "@/data/moePlayerNinjaSkills";
import { renderPetSkillIcon } from "@/lib/moePetSkillIcons";
import { formatMoePhoenixPlayerSkillDescription } from "@/lib/moePhoenixPlayerSkill";

/** プレイヤー技② — フェニックス系スキル一覧 */
export function buildPlayerPhoenixSkillList() {
  return MOE_PHOENIX_DRAGON_SKILLS.filter((s) => {
    if (s.type === "buff_permanent") return true;
    if (s.type === "passive") return s.id === "phoenix_trait";
    return s.level > 1 || s.id === "phoenix_trait";
  })
    .sort((a, b) => a.level - b.level)
    .slice(0, MOE_PLAYER_SKILL_SLOT_COUNT);
}

function shortPhoenixLabel(name) {
  if (!name) return "—";
  if (name.length <= 5) return name;
  return `${name.slice(0, 4)}…`;
}

/**
 * @param {number} petCombatLevel
 * @param {import("@/lib/moePetSkillSettings").MoePetSkillMode} petSkillMode
 * @param {(index: number, skill: object) => void} onActivate
 * @param {{
 *   skillChanting?: boolean,
 *   skillChantKind?: string|null,
 *   skillChantSkillId?: string|null,
 *   skillChantRemainSec?: number|null,
 *   phoenixHabitAtk2x?: boolean,
 * }} [ctx]
 */
export function buildPlayerPhoenixSkillSlotEntries(
  petCombatLevel,
  petSkillMode,
  onActivate,
  ctx = {}
) {
  const skills = buildPlayerPhoenixSkillList();
  const chanting = Boolean(ctx.skillChanting && ctx.skillChantKind === "phoenix");
  const rows = skills.map((skill, i) => {
    const locked = !isMoePetSkillUsableAtLevel(skill, petCombatLevel, petSkillMode);
    const isThisChanting = chanting && ctx.skillChantSkillId === skill.id;
    const remainSec =
      isThisChanting && ctx.skillChantRemainSec != null
        ? ctx.skillChantRemainSec
        : null;
    const habitActive =
      skill.id === "phoenix_habit_ascension" && Boolean(ctx.phoenixHabitAtk2x);
    return {
      slotKey: skill.id,
      label: shortPhoenixLabel(skill.name),
      icon: renderPetSkillIcon(skill.name, { size: 22 }),
      active: habitActive,
      disabled: locked || (chanting && !isThisChanting),
      cooldownSec: remainSec,
      title: isThisChanting
        ? `${skill.name}詠唱中…（残り${remainSec ?? 0}秒）`
        : formatMoePhoenixPlayerSkillDescription(skill, locked),
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
