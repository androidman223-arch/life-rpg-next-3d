/**
 * アルビーズの森 — 公式敵（マクロ１ · Wiki エリアガイド準拠）
 * https://wikiwiki.jp/moe-pet/エリアガイド/アルビーズの森
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_ALBEEZ_FOREST_FIELD_ENABLED = true;

/**
 * @param {object} spec
 */
function buildAlbeezEntry(spec) {
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
    mapSlotId: "albeez_forest",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_ALBEEZ_FOREST_FIELD_ENABLED,
  };
}

export const MOE_ALBEEZ_FOREST_PLANNED_REGISTRY = [
  buildAlbeezEntry({
    key: "riverside_crawler",
    familyId: "riverside_crawler",
    name: "リバーサイド クローラー",
    level: 50.0,
    areaHp: 210.0,
    areaRow: { mp: 0.5, attack: 50.5, defense: 60.5, hit: 50.5, magic: 0.5 },
    attackInterval: 56.0,
    captureLife: "—",
    skills: ["ハンガーバイト"],
    emoji: "🪱",
    color: "bg-amber-800 border-amber-950",
    modelFile: "RiversideCrawlerA.glb",
    petDamage: 90,
  }),
  buildAlbeezEntry({
    key: "orvan_pappy",
    familyId: "orvan_pappy",
    name: "オルヴァン パピー",
    moeName: "パピー · オルヴァン",
    level: 65.0,
    areaHp: 1056.0,
    areaRow: { mp: 0.5, attack: 65.5, defense: 78.5, hit: 65.5, magic: 0.5 },
    attackInterval: 56.0,
    captureLife: "—",
    skills: ["バイト", "フレイムブレス"],
    emoji: "🐉",
    color: "bg-sky-600 border-sky-900",
    modelFile: "OrvanPappyA.glb",
    petDamage: 117,
  }),
];

/** 南の川沿い湧き（tx/tz · 0..1） */
export const MOE_ALBEEZ_FOREST_SPAWN_SPECS = [
  {
    mapSlotId: "albeez_forest",
    key: "riverside_crawler",
    tx: 0.32,
    tz: 0.72,
    modelVariantId: "riverside_crawler_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "albeez_forest",
    key: "orvan_pappy",
    tx: 0.68,
    tz: 0.55,
    modelVariantId: "orvan_pappy_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "albeez_forest",
    key: "riverside_crawler",
    tx: 0.48,
    tz: 0.78,
    modelVariantId: "riverside_crawler_b",
    slotInZone: 1,
  },
  {
    mapSlotId: "albeez_forest",
    key: "orvan_pappy",
    tx: 0.72,
    tz: 0.42,
    modelVariantId: "orvan_pappy_b",
    slotInZone: 1,
  },
];

export function moeAlbeezForestActiveFieldEntries() {
  if (!MOE_ALBEEZ_FOREST_FIELD_ENABLED) return [];
  return MOE_ALBEEZ_FOREST_PLANNED_REGISTRY.map(
    ({ planned, fieldEnabled, ...e }) => e
  );
}

export function moeAlbeezForestActiveSpawnSpecs() {
  if (!MOE_ALBEEZ_FOREST_FIELD_ENABLED) return [];
  return MOE_ALBEEZ_FOREST_SPAWN_SPECS;
}
