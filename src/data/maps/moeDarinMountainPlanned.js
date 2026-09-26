/**
 * ダーイン山 — 公式敵（マクロ１ · Wiki エリアガイド準拠）
 * https://wikiwiki.jp/moe-pet/エリアガイド/ダーイン山
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_DARIN_MOUNTAIN_FIELD_ENABLED = true;

/** @param {object} spec */
function buildDarinEntry(spec) {
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
    mapSlotId: "darin_mountain",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_DARIN_MOUNTAIN_FIELD_ENABLED,
  };
}

export const MOE_DARIN_MOUNTAIN_PLANNED_REGISTRY = [
  buildDarinEntry({
    key: "dain_rat",
    familyId: "meerim_rat",
    name: "ダーイン ラット",
    level: 10.0,
    areaHp: 66.0,
    areaRow: { mp: 0.5, attack: 10.5, defense: 12.5, hit: 10.5, magic: 0.5 },
    attackInterval: 40.0,
    captureLife: "AF",
    skills: ["噛み付き"],
    emoji: "🐀",
    color: "bg-stone-500 border-stone-700",
    modelFile: "MeerimRatB.glb",
    petDamage: 18,
  }),
  buildDarinEntry({
    key: "dain_orc_guard",
    familyId: "orc_gang",
    name: "オーク ガード",
    level: 33.0,
    areaHp: 148.9,
    areaRow: { mp: 0.5, attack: 33.5, defense: 40.1, hit: 33.5, magic: 0.5 },
    attackInterval: 90.0,
    captureLife: "MFHB",
    skills: ["バーサーク", "チャージド ブラント"],
    emoji: "🪓",
    color: "bg-green-900 border-green-950",
    modelFile: "OrcGangA.glb",
    petDamage: 62,
  }),
  buildDarinEntry({
    key: "dain_orc_elite",
    familyId: "orc_gang",
    name: "オーク エリート",
    level: 46.2,
    areaHp: 265.0,
    areaRow: { mp: 0.5, attack: 53.7, defense: 55.9, hit: 46.7, magic: 0.5 },
    attackInterval: 95.0,
    captureLife: "MFHB",
    skills: ["バーサーク", "スニーク アタック"],
    emoji: "🪓",
    color: "bg-emerald-950 border-emerald-950",
    modelFile: "OrcGangB.glb",
    petDamage: 86,
  }),
];

export const MOE_DARIN_MOUNTAIN_SPAWN_SPECS = [
  {
    mapSlotId: "darin_mountain",
    key: "dain_rat",
    tx: 0.28,
    tz: 0.72,
    modelVariantId: "meerim_rat_b",
    slotInZone: 0,
  },
  {
    mapSlotId: "darin_mountain",
    key: "dain_orc_guard",
    tx: 0.52,
    tz: 0.55,
    modelVariantId: "orc_gang_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "darin_mountain",
    key: "dain_orc_elite",
    tx: 0.68,
    tz: 0.42,
    modelVariantId: "orc_gang_b",
    slotInZone: 0,
  },
  {
    mapSlotId: "darin_mountain",
    key: "dain_rat",
    tx: 0.42,
    tz: 0.38,
    modelVariantId: "meerim_rat_b",
    slotInZone: 1,
  },
  {
    mapSlotId: "darin_mountain",
    key: "dain_orc_guard",
    tx: 0.35,
    tz: 0.58,
    modelVariantId: "orc_gang_a",
    slotInZone: 1,
  },
];

export function moeDarinMountainActiveFieldEntries() {
  if (!MOE_DARIN_MOUNTAIN_FIELD_ENABLED) return [];
  return MOE_DARIN_MOUNTAIN_PLANNED_REGISTRY.map(
    ({ planned, fieldEnabled, ...e }) => e
  );
}

export function moeDarinMountainActiveSpawnSpecs() {
  if (!MOE_DARIN_MOUNTAIN_FIELD_ENABLED) return [];
  return MOE_DARIN_MOUNTAIN_SPAWN_SPECS;
}
