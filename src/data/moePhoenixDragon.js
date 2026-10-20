/**
 * ミステリー ドラゴン — 転生（フェニックスドラゴン / ドラゴンⅡ）
 * スキル枠1＝従来技 · 枠2＝鳳凰（Lv90まで · カタカナ名）
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

/** 昔の漢字スキルは出さない。鳳凰の技は Lv10〜90 のゲット一覧 */
export const MOE_PHOENIX_DRAGON_SKILLS = [];

/** ゲット一覧のボタンが呼ぶ中身。技一覧には出さない */
export const MOE_PHOENIX_HIDDEN_SKILLS = [
  {
    id: "phoenix_ansleep_walk",
    level: 10,
    name: "龍神の呼吸",
    type: "field_regen",
    skillSet: 2,
    hiddenFromPhoenix: true,
    mpCost: 8,
    regenHpPerTick: 20,
    regenIntervalMs: 3500,
    regenDurationMs: 90000,
    note: "歩いて動く · 3.5秒ごとにHP20回復",
  },
  {
    id: "phoenix_hot_spring",
    level: 30,
    name: "オンセン",
    type: "cure_status",
    skillSet: 2,
    hiddenFromPhoenix: true,
    mpCost: 12,
    defenseBonus: 50,
    defenseBuffDurationMs: 90_000,
    note: "守り+50 · 温泉付近で眠る体に戻す",
  },
  {
    id: "phoenix_deep_sleep",
    level: 60,
    name: "スリープディープ",
    type: "pet_mp_restore",
    skillSet: 2,
    hiddenFromPhoenix: true,
    mpCost: 12,
    mpRestoreRatio: 0.45,
    note: "ペットMP中回復",
  },
  {
    id: "phoenix_life_burst",
    level: 70,
    name: "バイタリティ",
    type: "heal",
    skillSet: 2,
    hiddenFromPhoenix: true,
    mpCost: 42,
    healFlat: 50,
    note: "HP+50",
  },
  {
    id: "phoenix_habit_ascension",
    level: 90,
    name: "フェニックス",
    type: "magic_fire",
    skillSet: 2,
    hiddenFromPhoenix: true,
    mpCost: 40,
    combatPhase1Damage: 7,
    combatPhase1Hits: 5,
    combatPhase2Damage: 3,
    combatPhase2Hits: 3,
    combatStepMs: 350,
    note: "リボーンワンス＋ダメージ",
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
      if (s.type === "passive") return false;
      if (showAll || rebornPhoenix) {
        return s.level > 1;
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
