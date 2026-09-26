/**
 * ネオク高原 — 公式敵（マクロ１ · Wiki エリアガイド準拠）
 * https://wikiwiki.jp/moe-pet/エリアガイド/ネオク高原
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_NEOKU_PLATEAU_FIELD_ENABLED = true;

/** @param {object} spec */
function buildPlateauEntry(spec) {
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
    mapSlotId: "neoku_plateau",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_NEOKU_PLATEAU_FIELD_ENABLED,
  };
}

export const MOE_NEOKU_PLATEAU_PLANNED_REGISTRY = [
  buildPlateauEntry({
    key: "young_orvan",
    familyId: "neoku_orvan",
    name: "ヤング オルヴァン",
    level: 59.9,
    areaHp: 380.8,
    areaRow: { mp: 0.5, attack: 60.4, defense: 72.4, hit: 60.4, magic: 0.5 },
    attackInterval: 56.0,
    captureLife: "—",
    skills: ["タックル", "バイト"],
    emoji: "🐲",
    color: "bg-sky-500 border-sky-800",
    modelFile: "NeokuOrvanA.glb",
    petDamage: 108,
  }),
  buildPlateauEntry({
    key: "neoku_orvan_plateau",
    familyId: "neoku_orvan",
    name: "ネオク オルヴァン",
    level: 68.9,
    areaHp: 361.5,
    areaRow: { mp: 0.5, attack: 69.4, defense: 83.2, hit: 69.4, magic: 0.5 },
    attackInterval: 56.0,
    captureLife: "—",
    skills: ["タックル", "バイト"],
    emoji: "🐲",
    color: "bg-blue-600 border-blue-900",
    modelFile: "NeokuOrvanB.glb",
    petDamage: 124,
  }),
  buildPlateauEntry({
    key: "guard_nocker",
    familyId: "nocker",
    name: "ガード ノッカー",
    level: 65.0,
    areaHp: 343.2,
    areaRow: { mp: 0.5, attack: 65.5, defense: 78.5, hit: 65.5, magic: 0.5 },
    attackInterval: 56.0,
    captureLife: "—",
    skills: ["スニークアタック"],
    emoji: "👺",
    color: "bg-lime-800 border-lime-950",
    modelFile: "NockerA.glb",
    petDamage: 117,
  }),
];

export const MOE_NEOKU_PLATEAU_SPAWN_SPECS = [
  {
    mapSlotId: "neoku_plateau",
    key: "young_orvan",
    tx: 0.34,
    tz: 0.58,
    modelVariantId: "neoku_orvan_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "neoku_plateau",
    key: "neoku_orvan_plateau",
    tx: 0.62,
    tz: 0.46,
    modelVariantId: "neoku_orvan_b",
    slotInZone: 0,
  },
  {
    mapSlotId: "neoku_plateau",
    key: "guard_nocker",
    tx: 0.48,
    tz: 0.68,
    modelVariantId: "nocker_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "neoku_plateau",
    key: "young_orvan",
    tx: 0.72,
    tz: 0.38,
    modelVariantId: "neoku_orvan_b",
    slotInZone: 1,
  },
  {
    mapSlotId: "neoku_plateau",
    key: "guard_nocker",
    tx: 0.28,
    tz: 0.42,
    modelVariantId: "nocker_b",
    slotInZone: 1,
  },
];

export function moeNeokuPlateauActiveFieldEntries() {
  if (!MOE_NEOKU_PLATEAU_FIELD_ENABLED) return [];
  return MOE_NEOKU_PLATEAU_PLANNED_REGISTRY.map(
    ({ planned, fieldEnabled, ...e }) => e
  );
}

export function moeNeokuPlateauActiveSpawnSpecs() {
  if (!MOE_NEOKU_PLATEAU_FIELD_ENABLED) return [];
  return MOE_NEOKU_PLATEAU_SPAWN_SPECS;
}
