/**
 * 城下町ビスク — 公式敵（マクロ１ 第3フェーズ · Wiki 下僕表準拠）
 * https://wikiwiki.jp/moe-pet/%E4%B8%8B%E5%83%95
 *
 * 中央アルター付近の水辺にイクシオン ウォーター（アクティブ）
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_BISK_FIELD_ENABLED = true;

/** @param {object} spec */
function buildBiskEntry(spec) {
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
    mapSlotId: "bisk",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_BISK_FIELD_ENABLED,
  };
}

export const MOE_BISK_PLANNED_REGISTRY = [
  buildBiskEntry({
    key: "bisk_ixion_water",
    familyId: "bisk_ixion_water",
    name: "イクシオン ウォーター",
    level: 53.2,
    areaHp: 442.0,
    areaRow: { mp: 0.5, attack: 53.5, defense: 64.0, hit: 53.5, magic: 22.0 },
    attackInterval: 96.0,
    captureLife: "MF BS",
    skills: ["ウォーターガン", "パンチ"],
    emoji: "🦎",
    color: "bg-sky-600 border-sky-900",
    modelFile: "StrayIxion.glb",
    petDamage: 96,
  }),
];

/** アルター南の水辺（転送スポーン tz≈0.54 から離す · `moe3dClearSpawnFromAltarPlayer` でも押し出し） */
export const MOE_BISK_SPAWN_SPECS = [
  {
    mapSlotId: "bisk",
    key: "bisk_ixion_water",
    tx: 0.34,
    tz: 0.66,
    modelVariantId: "bisk_ixion_water_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "bisk",
    key: "bisk_ixion_water",
    tx: 0.66,
    tz: 0.62,
    modelVariantId: "bisk_ixion_water_b",
    slotInZone: 1,
  },
];

export function moeBiskActiveFieldEntries() {
  if (!MOE_BISK_FIELD_ENABLED) return [];
  return MOE_BISK_PLANNED_REGISTRY.map(({ planned, fieldEnabled, ...e }) => e);
}

export function moeBiskActiveSpawnSpecs() {
  if (!MOE_BISK_FIELD_ENABLED) return [];
  return MOE_BISK_SPAWN_SPECS;
}
