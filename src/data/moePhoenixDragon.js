/**
 * ミステリー ドラゴン — 転生（フェニックスドラゴン / ドラゴンⅡ）
 * スキル枠1＝従来技 · 枠2＝健康のフェニックス系（転生後）
 */

import {
  MOE_PET_SKILL_MODE_ALL,
  MOE_PET_SKILL_MODE_LEARNED,
} from "@/lib/moePetSkillSettings";

export const MOE_MYSTERY_DRAGON_REBORN_ID = "mystery_dragon";

export const MOE_ITEM_PHOENIX_FEATHER = {
  id: "phoenix_feather",
  label: "フェニックスの羽根",
  emoji: "🪶",
  iconKind: "phoenix_feather",
};

export const MOE_MYSTERY_DRAGON_REBORN_NAME = "ミステリー ドラゴンⅡ";
export const MOE_MYSTERY_DRAGON_FORM1_NAME = "ミステリー ドラゴンⅠ";
export const MOE_MYSTERY_DRAGON_REBORN_SUBTITLE = "フェニックスドラゴン";

/** ペット戦闘スキル枠 — アイコンバー（10）に合わせる */
export const MOE_PET_COMBAT_SKILL_SLOT_MAX = 10;
export const MOE_PET_COMBAT_SKILL_SLOT_LEARNED_MAX = 7;

/** 転生後スキル枠2 — 健康のフェニックス */
export const MOE_PHOENIX_DRAGON_SKILLS = [
  {
    id: "phoenix_trait",
    level: 1,
    name: "健康のフェニックス",
    type: "passive",
    skillSet: 2,
    note: "転生の証 · フェニックス系スキルが使える",
  },
  {
    id: "phoenix_ansleep_walk",
    level: 20,
    name: "安眠導歩",
    type: "field_regen",
    skillSet: 2,
    regenHpPerTick: 10,
    regenIntervalMs: 5000,
    note: "歩行・移動中にリジェネ（5秒ごとHP10）",
  },
  {
    id: "phoenix_hot_spring",
    level: 50,
    name: "温泉調気",
    type: "cure_status",
    skillSet: 2,
    mpCost: 12,
    note: "毒・麻痺を完全解除",
  },
  {
    id: "phoenix_deep_sleep",
    level: 80,
    name: "深睡眠眠",
    type: "heal",
    skillSet: 2,
    mpCost: 18,
    healRatio: 0.45,
    note: "【ベホイミ】深い眠りでHP中回復",
  },
  {
    id: "phoenix_ultimate_sleep",
    level: 90,
    name: "睡眠絶天崩無鏡",
    type: "heal_regen",
    skillSet: 2,
    mpCost: 36,
    healRatio: 1,
    regenHpPerTick: 20,
    regenIntervalMs: 5000,
    regenDurationMs: 25000,
    combatMagicRatio: 0.95,
    note: "全HP回復＋リジェネ（5秒ごと20·25秒）",
  },
  {
    id: "phoenix_habit_ascension",
    level: 100,
    name: "習慣改命鳳凰昇華",
    type: "buff_permanent",
    skillSet: 2,
    maxHpBonus: 100,
    note: "最大HP+100 · 毒・麻痺・呪い永続無効",
  },
  {
    id: "phoenix_life_burst",
    level: 120,
    name: "生命爆烈覚醒神化",
    type: "magic_fire",
    skillSet: 2,
    mpCost: 42,
    combatMagicRatio: 1.35,
    attackBuffMult: 1.5,
    note: "特大炎魔法 · 攻撃1.5倍 · 致死ダメージ1回HP1で踏みとどまる",
  },
  {
    id: "phoenix_purify_rebirth",
    level: 140,
    name: "浄化転生",
    type: "magic_fire",
    skillSet: 2,
    mpCost: 55,
    combatMagicRatio: 1.65,
    attackBuffMult: 2,
    note: "大炎爆 · 攻撃2倍 · 戦闘開始30秒無敵 · 死亡時HP半分で転生",
  },
];

/**
 * @param {boolean} rebornPhoenix
 * @param {1|2} [activeSkillSet]
 */
export function getMysteryDragonDisplayName(rebornPhoenix, activeSkillSet = 2) {
  if (!rebornPhoenix) return null;
  if (activeSkillSet === 1) return MOE_MYSTERY_DRAGON_FORM1_NAME;
  return `${MOE_MYSTERY_DRAGON_REBORN_NAME}（${MOE_MYSTERY_DRAGON_REBORN_SUBTITLE}）`;
}

/**
 * @param {object[]} allSkills
 * @param {boolean} rebornPhoenix
 * @param {1|2} activeSkillSet
 */
export function filterMysteryDragonSkills(allSkills, rebornPhoenix, activeSkillSet) {
  const set = activeSkillSet === 2 ? 2 : 1;
  if (!rebornPhoenix) {
    return allSkills.filter((s) => s.skillSet !== 2);
  }
  if (set === 2) {
    return allSkills.filter((s) => s.skillSet === 2);
  }
  return allSkills.filter((s) => s.skillSet === 1 || (s.mode && s.skillSet !== 2));
}

/**
 * @param {number} petLevel
 * @param {boolean} rebornPhoenix
 */
export function getMysteryDragonMaxHpBonus(petLevel, rebornPhoenix) {
  if (!rebornPhoenix || petLevel < 100) return 0;
  return 100;
}

/**
 * @param {number} petLevel
 * @param {boolean} rebornPhoenix
 * @param {1|2} [activeSkillSet]
 */
export function buildMysteryDragonCombatSkillSlots(
  allSkills,
  petLevel,
  rebornPhoenix,
  activeSkillSet = 1,
  skillMode = MOE_PET_SKILL_MODE_ALL
) {
  const filtered = filterMysteryDragonSkills(
    allSkills,
    rebornPhoenix,
    activeSkillSet
  );
  const maxSlots =
    skillMode === MOE_PET_SKILL_MODE_ALL
      ? MOE_PET_COMBAT_SKILL_SLOT_MAX
      : MOE_PET_COMBAT_SKILL_SLOT_LEARNED_MAX;
  const showAll = skillMode === MOE_PET_SKILL_MODE_ALL;
  return filtered
    .filter((s) => {
      if (s.type === "buff_permanent") return false;
      if (s.type === "passive") {
        return rebornPhoenix && activeSkillSet === 2 && s.id === "phoenix_trait";
      }
      if (showAll || rebornPhoenix) {
        return s.level > 1 || s.id === "phoenix_trait";
      }
      return s.level <= petLevel && s.level > 1;
    })
    .sort((a, b) => a.level - b.level)
    .slice(0, maxSlots);
}

/** 通常ペット */
function buildGenericPetCombatSkillSlots(allSkills, petLevel, skillMode) {
  const maxSlots =
    skillMode === MOE_PET_SKILL_MODE_ALL
      ? MOE_PET_COMBAT_SKILL_SLOT_MAX
      : MOE_PET_COMBAT_SKILL_SLOT_LEARNED_MAX;
  if (skillMode === MOE_PET_SKILL_MODE_ALL) {
    return (allSkills || [])
      .filter((s) => {
        if (s.type === "buff_permanent") return false;
        if (s.type === "passive") return true;
        return s.level > 1;
      })
      .sort((a, b) => a.level - b.level)
      .slice(0, maxSlots);
  }
  return (allSkills || [])
    .filter((s) => s.level <= petLevel && s.level > 1)
    .slice(0, maxSlots);
}

/** スキルが現在のLvで使えるか */
export function isMoePetSkillUsableAtLevel(
  skill,
  petLevel,
  skillMode = MOE_PET_SKILL_MODE_ALL
) {
  if (!skill) return false;
  if (skillMode === MOE_PET_SKILL_MODE_ALL) return true;
  return (skill.level ?? 1) <= petLevel;
}

/**
 * @param {string} petId
 * @param {object[]} allSkills
 * @param {number} petLevel
 * @param {{ rebornPhoenix?: boolean, activeSkillSet?: 1|2, skillMode?: import("@/lib/moePetSkillSettings").MoePetSkillMode }} [meta]
 */
export function buildPetCombatSkillSlots(petId, allSkills, petLevel, meta = {}) {
  const skillMode = meta.skillMode ?? MOE_PET_SKILL_MODE_ALL;
  if (petId === MOE_MYSTERY_DRAGON_REBORN_ID) {
    return buildMysteryDragonCombatSkillSlots(
      allSkills,
      petLevel,
      !!meta.rebornPhoenix,
      meta.activeSkillSet === 2 ? 2 : 1,
      skillMode
    );
  }
  return buildGenericPetCombatSkillSlots(allSkills, petLevel, skillMode);
}

export function canRebirthMysteryDragon(petId, rebornPhoenix) {
  return petId === MOE_MYSTERY_DRAGON_REBORN_ID && !rebornPhoenix;
}
