/**
 * エイシス・ケイブ — 公式敵（マクロ１ · Wiki エリアガイド準拠）
 * https://wikiwiki.jp/moe-pet/エリアガイド/エイシスケイブ
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_EISIS_CAVE_FIELD_ENABLED = true;

/** @param {object} spec */
function buildEisisEntry(spec) {
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
    mapSlotId: "eisis_cave",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_EISIS_CAVE_FIELD_ENABLED,
  };
}

export const MOE_EISIS_CAVE_PLANNED_REGISTRY = [
  buildEisisEntry({
    key: "eisis_rat",
    familyId: "meerim_rat",
    name: "エイシス ラット",
    level: 12.0,
    areaHp: 76.0,
    areaRow: { mp: 0.5, attack: 12.5, defense: 14.5, hit: 12.5, magic: 0.5 },
    attackInterval: 42.0,
    captureLife: "AF",
    skills: ["噛み付き"],
    emoji: "🐀",
    color: "bg-slate-500 border-slate-700",
    modelFile: "MeerimRatB.glb",
    petDamage: 22,
  }),
  buildEisisEntry({
    key: "eisis_ixion",
    familyId: "eisis_ixion",
    name: "エイシス イクシオン",
    level: 42.0,
    areaHp: 369.0,
    areaRow: { mp: 0.5, attack: 42.5, defense: 50.5, hit: 42.5, magic: 20.5 },
    attackInterval: 120.0,
    captureLife: "MF",
    skills: ["ウォーターガン"],
    emoji: "🦎",
    color: "bg-cyan-700 border-cyan-900",
    modelFile: "StrayIxion.glb",
    petDamage: 76,
  }),
  buildEisisEntry({
    key: "great_tarantula",
    familyId: "great_tarantula",
    name: "グレイト タランチュラ",
    level: 65.0,
    areaHp: 420.0,
    areaRow: { mp: 0.5, attack: 65.5, defense: 70.5, hit: 65.5, magic: 8.0 },
    attackInterval: 88.0,
    captureLife: "AF",
    skills: ["通常攻撃"],
    emoji: "🕷️",
    color: "bg-red-900 border-red-950",
    modelFile: "ElvinSpiderA.glb",
    petDamage: 117,
  }),
];

export const MOE_EISIS_CAVE_SPAWN_SPECS = [
  {
    mapSlotId: "eisis_cave",
    key: "eisis_rat",
    tx: 0.32,
    tz: 0.68,
    modelVariantId: "meerim_rat_b",
    slotInZone: 0,
  },
  {
    mapSlotId: "eisis_cave",
    key: "eisis_ixion",
    tx: 0.55,
    tz: 0.48,
    modelVariantId: "eisis_ixion_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "eisis_cave",
    key: "great_tarantula",
    tx: 0.68,
    tz: 0.62,
    modelVariantId: "great_tarantula_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "eisis_cave",
    key: "eisis_rat",
    tx: 0.45,
    tz: 0.35,
    modelVariantId: "meerim_rat_b",
    slotInZone: 1,
  },
  {
    mapSlotId: "eisis_cave",
    key: "great_tarantula",
    tx: 0.28,
    tz: 0.52,
    modelVariantId: "great_tarantula_b",
    slotInZone: 1,
  },
];

export function moeEisisCaveActiveFieldEntries() {
  if (!MOE_EISIS_CAVE_FIELD_ENABLED) return [];
  return MOE_EISIS_CAVE_PLANNED_REGISTRY.map(
    ({ planned, fieldEnabled, ...e }) => e
  );
}

export function moeEisisCaveActiveSpawnSpecs() {
  if (!MOE_EISIS_CAVE_FIELD_ENABLED) return [];
  return MOE_EISIS_CAVE_SPAWN_SPECS;
}
