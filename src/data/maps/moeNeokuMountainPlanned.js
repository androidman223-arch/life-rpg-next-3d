/**
 * ネオク山 — 公式敵（マクロ１ · Wiki ネオク高原エリア準拠）
 * https://wikiwiki.jp/moe-pet/エリアガイド/ネオク高原
 *
 * 3Dタイルは neoku_mountain（アルター転送 · 登攀丘あり）
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_NEOKU_MOUNTAIN_FIELD_ENABLED = true;

/**
 * @param {object} spec
 */
function buildNeokuEntry(spec) {
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
    mapSlotId: "neoku_mountain",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_NEOKU_MOUNTAIN_FIELD_ENABLED,
  };
}

export const MOE_NEOKU_MOUNTAIN_PLANNED_REGISTRY = [
  buildNeokuEntry({
    key: "neoku_orvan",
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
    modelFile: "NeokuOrvanA.glb",
    petDamage: 124,
  }),
  buildNeokuEntry({
    key: "nocker",
    familyId: "nocker",
    name: "ノッカー",
    level: 55.5,
    areaHp: 318.0,
    areaRow: { mp: 0.5, attack: 55.5, defense: 66.5, hit: 55.5, magic: 0.5 },
    attackInterval: 56.0,
    captureLife: "—",
    skills: ["スニークアタック"],
    emoji: "👺",
    color: "bg-lime-700 border-lime-900",
    modelFile: "NockerA.glb",
    petDamage: 100,
  }),
];

export const MOE_NEOKU_MOUNTAIN_SPAWN_SPECS = [
  {
    mapSlotId: "neoku_mountain",
    key: "neoku_orvan",
    tx: 0.35,
    tz: 0.58,
    modelVariantId: "neoku_orvan_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "neoku_mountain",
    key: "nocker",
    tx: 0.62,
    tz: 0.48,
    modelVariantId: "nocker_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "neoku_mountain",
    key: "neoku_orvan",
    tx: 0.28,
    tz: 0.42,
    modelVariantId: "neoku_orvan_b",
    slotInZone: 1,
  },
  {
    mapSlotId: "neoku_mountain",
    key: "nocker",
    tx: 0.55,
    tz: 0.65,
    modelVariantId: "nocker_b",
    slotInZone: 1,
  },
];

export function moeNeokuMountainActiveFieldEntries() {
  if (!MOE_NEOKU_MOUNTAIN_FIELD_ENABLED) return [];
  return MOE_NEOKU_MOUNTAIN_PLANNED_REGISTRY.map(
    ({ planned, fieldEnabled, ...e }) => e
  );
}

export function moeNeokuMountainActiveSpawnSpecs() {
  if (!MOE_NEOKU_MOUNTAIN_FIELD_ENABLED) return [];
  return MOE_NEOKU_MOUNTAIN_SPAWN_SPECS;
}
