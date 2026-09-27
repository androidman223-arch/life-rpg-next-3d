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
    mpCost: 8,
    regenHpPerTick: 20,
    regenIntervalMs: 3500,
    regenDurationMs: 90000,
    note: "ペットに詠唱 · 3.5秒ごとにHP20回復",
  },
  {
    id: "phoenix_hot_spring",
    level: 50,
    name: "温泉調気",
    type: "cure_status",
    skillSet: 2,
    mpCost: 12,
    defenseBonus: 50,
    defenseBuffDurationMs: 90_000,
    note: "ペットに詠唱 · 守り+50 · 温泉付近で眠る体に戻す",
  },
  {
    id: "phoenix_deep_sleep",
    level: 80,
    name: "深睡眠眠",
    type: "pet_mp_restore",
    skillSet: 2,
    mpCost: 12,
    mpRestoreRatio: 0.45,
    note: "ペットに詠唱5秒 · ペットMP中回復（HPはライト/ヒール/オール）",
  },
  {
    id: "phoenix_ultimate_sleep",
    level: 90,
    name: "睡眠絶崩",
    type: "buff",
    skillSet: 2,
    mpCost: 22,
    combatAttackMult: 1.5,
    note: "戦闘中のみペット攻撃1.5倍（決戦終了でリセット）",
  },
  {
    id: "phoenix_habit_ascension",
    level: 100,
    name: "生活改鳳",
    type: "magic_fire",
    skillSet: 2,
    mpCost: 40,
    combatPhase1Damage: 7,
    combatPhase1Hits: 5,
    combatPhase2Damage: 3,
    combatPhase2Hits: 3,
    combatStepMs: 350,
    note: "炎5×7＋炎3×3＋リボーンワンス（戦闘中 · MP40）",
  },
  {
    id: "phoenix_life_burst",
    level: 120,
    name: "生命爆神",
    type: "heal",
    skillSet: 2,
    mpCost: 42,
    healFlat: 50,
    note: "ペットHP+50",
  },
  {
    id: "phoenix_scorching_sky",
    level: 130,
    name: "攻撃2倍",
    type: "buff",
    skillSet: 2,
    mpCost: 0,
    combatAttackMult: 1.5,
    skillSubInfo: "名前は後で考えます",
    note: "戦闘中のみペット攻撃1.5倍（トグル）",
  },
  {
    id: "phoenix_purify_rebirth",
    level: 140,
    name: "浄化転生",
    type: "magic_fire",
    skillSet: 2,
    mpCost: 55,
    combatFixedDamage: 30,
    combatWaveHits: 5,
    combatStepMs: 400,
    note: "大爆炎 · 30ダメージ×5",
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
