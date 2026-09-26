/**
 * 飛竜の谷 — 公式敵（マクロ１ + マクロ２ マップ）
 * https://wikiwiki.jp/moe-pet/エリアガイド/飛竜の谷
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_DRAGON_VALLEY_FIELD_ENABLED = true;

/** @param {object} spec */
function buildDragonValleyEntry(spec) {
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
    mapSlotId: "dragon_valley",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_DRAGON_VALLEY_FIELD_ENABLED,
  };
}

export const MOE_DRAGON_VALLEY_PLANNED_REGISTRY = [
  buildDragonValleyEntry({
    key: "wild_orvan",
    familyId: "wild_orvan",
    name: "ワイルド オルヴァン",
    level: 71.1,
    areaHp: 714.8,
    areaRow: { mp: 0.5, attack: 71.6, defense: 85.8, hit: 71.6, magic: 0.5 },
    attackInterval: 56.0,
    captureLife: "—",
    skills: ["噛み付き", "バイト"],
    emoji: "🐲",
    color: "bg-purple-700 border-purple-950",
    modelFile: "WildOrvanA.glb",
    petDamage: 128,
  }),
  buildDragonValleyEntry({
    key: "ancient_treant",
    familyId: "ancient_treant",
    name: "エンシェント トレント",
    level: 65.5,
    areaHp: 407.6,
    areaRow: { mp: 30.0, attack: 67.5, defense: 80.6, hit: 67.5, magic: 2.0 },
    attackInterval: 90.0,
    captureLife: "—",
    skills: ["ルート キャプチャー", "アースクエイク"],
    emoji: "🌳",
    color: "bg-green-900 border-green-950",
    modelFile: "AncientTreantA.glb",
    petDamage: 118,
  }),
  buildDragonValleyEntry({
    key: "sky_dragon",
    familyId: "sky_dragon",
    name: "スカイドラゴン",
    level: 71.9,
    areaHp: 578.0,
    areaRow: { mp: 202.7, attack: 72.4, defense: 86.8, hit: 72.4, magic: 58.1 },
    attackInterval: 58.0,
    captureLife: "—",
    skills: ["噛み付き", "ガスティ ウインド"],
    emoji: "🪽",
    color: "bg-sky-600 border-sky-900",
    modelFile: "SkyDragonA.glb",
    petDamage: 130,
  }),
];

export const MOE_DRAGON_VALLEY_SPAWN_SPECS = [
  {
    mapSlotId: "dragon_valley",
    key: "wild_orvan",
    tx: 0.32,
    tz: 0.62,
    modelVariantId: "wild_orvan_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "dragon_valley",
    key: "wild_orvan",
    tx: 0.48,
    tz: 0.55,
    modelVariantId: "wild_orvan_b",
    slotInZone: 1,
  },
  {
    mapSlotId: "dragon_valley",
    key: "ancient_treant",
    tx: 0.68,
    tz: 0.42,
    modelVariantId: "ancient_treant_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "dragon_valley",
    key: "sky_dragon",
    tx: 0.55,
    tz: 0.28,
    modelVariantId: "sky_dragon_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "dragon_valley",
    key: "sky_dragon",
    tx: 0.72,
    tz: 0.22,
    modelVariantId: "sky_dragon_b",
    slotInZone: 1,
  },
];

export function moeDragonValleyActiveFieldEntries() {
  if (!MOE_DRAGON_VALLEY_FIELD_ENABLED) return [];
  return MOE_DRAGON_VALLEY_PLANNED_REGISTRY.map(
    ({ planned, fieldEnabled, ...e }) => e
  );
}

export function moeDragonValleyActiveSpawnSpecs() {
  if (!MOE_DRAGON_VALLEY_FIELD_ENABLED) return [];
  return MOE_DRAGON_VALLEY_SPAWN_SPECS;
}
