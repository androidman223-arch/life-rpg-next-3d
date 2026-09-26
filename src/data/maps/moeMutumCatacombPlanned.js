/**
 * ムトゥーム地下墓地 — 公式敵（マクロ１ · Wiki エリアガイド準拠）
 * https://wikiwiki.jp/moe-pet/エリアガイド/ムトゥーム地下墓地
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_MUTUM_CATACOMB_FIELD_ENABLED = true;

/** @param {object} spec */
function buildMutumEntry(spec) {
  const hpMult = spec.hpMultiplier ?? 1;
  return {
    key: spec.key,
    familyId: spec.familyId,
    name: spec.name,
    moeName: spec.moeName ?? spec.name,
    level: spec.level,
    attackInterval: spec.attackInterval,
    captureLife: spec.captureLife,
    skills: spec.skills,
    wiki: moeWikiFromAreaGuideRow(spec.areaRow),
    hpMax: moeFieldHpMaxFromAreaHp(spec.areaHp, hpMult),
    petDamage: spec.petDamage ?? moeFieldPetDamageFromLevel(spec.level),
    emoji: spec.emoji,
    color: spec.color,
    mapSlotId: "mutum_catacomb",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_MUTUM_CATACOMB_FIELD_ENABLED,
  };
}

export const MOE_MUTUM_CATACOMB_PLANNED_REGISTRY = [
  buildMutumEntry({
    key: "mutum_zombie_rat",
    familyId: "mutum_zombie_rat",
    name: "ゾンビ ラット",
    level: 11.9,
    areaHp: 88.0,
    areaRow: { mp: 0.5, attack: 12.5, defense: 14.5, hit: 12.5, magic: 0.5 },
    attackInterval: 44.0,
    captureLife: "AF",
    skills: ["噛み付き"],
    emoji: "🐀",
    color: "bg-stone-600 border-stone-800",
    modelFile: "MeerimRatB.glb",
    petDamage: 22,
  }),
  buildMutumEntry({
    key: "mutum_wraith_warrior",
    familyId: "mutum_wraith_warrior",
    name: "レイス（戦士）",
    moeName: "レイス · 剣士",
    level: 19.5,
    areaHp: 118.0,
    areaRow: { mp: 0.5, attack: 20.5, defense: 18.5, hit: 20.5, magic: 0.5 },
    attackInterval: 36.0,
    captureLife: "AF",
    skills: ["通常攻撃", "ノンアクティブ"],
    emoji: "👻",
    color: "bg-violet-800 border-violet-950",
    modelFile: "ElanKnightWhiteA.glb",
    petDamage: 36,
  }),
  buildMutumEntry({
    key: "mutum_rosso_fighter",
    familyId: "mutum_rosso_fighter",
    name: "ロッソ ファイター",
    level: 25.4,
    areaHp: 172.0,
    areaRow: { mp: 0.5, attack: 26.5, defense: 28.5, hit: 26.5, magic: 0.5 },
    attackInterval: 82.0,
    captureLife: "MFHB",
    skills: ["スニーク アタック", "バーサーク"],
    emoji: "🗡️",
    color: "bg-red-900 border-red-950",
    modelFile: "OrcGangA.glb",
    petDamage: 48,
  }),
];

/** B2F 入口〜B3F 盗賊区（tx/tz · 0..1） */
export const MOE_MUTUM_CATACOMB_SPAWN_SPECS = [
  {
    mapSlotId: "mutum_catacomb",
    key: "mutum_zombie_rat",
    tx: 0.32,
    tz: 0.72,
    modelVariantId: "mutum_zombie_rat_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "mutum_catacomb",
    key: "mutum_wraith_warrior",
    tx: 0.55,
    tz: 0.55,
    modelVariantId: "mutum_wraith_warrior_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "mutum_catacomb",
    key: "mutum_rosso_fighter",
    tx: 0.68,
    tz: 0.42,
    modelVariantId: "mutum_rosso_fighter_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "mutum_catacomb",
    key: "mutum_zombie_rat",
    tx: 0.42,
    tz: 0.38,
    modelVariantId: "mutum_zombie_rat_b",
    slotInZone: 1,
  },
  {
    mapSlotId: "mutum_catacomb",
    key: "mutum_wraith_warrior",
    tx: 0.28,
    tz: 0.58,
    modelVariantId: "mutum_wraith_warrior_b",
    slotInZone: 1,
  },
];

export function moeMutumCatacombActiveFieldEntries() {
  if (!MOE_MUTUM_CATACOMB_FIELD_ENABLED) return [];
  return MOE_MUTUM_CATACOMB_PLANNED_REGISTRY.map(
    ({ planned, fieldEnabled, ...e }) => e
  );
}

export function moeMutumCatacombActiveSpawnSpecs() {
  if (!MOE_MUTUM_CATACOMB_FIELD_ENABLED) return [];
  return MOE_MUTUM_CATACOMB_SPAWN_SPECS;
}
