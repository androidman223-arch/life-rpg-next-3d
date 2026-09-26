/**
 * AGE · ソレス渓谷 — 公式敵（渓谷湯周辺 · レクスール系）
 * 近隣レクスール・ヒルズ Wiki 準拠: レスクール ハウンド
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_SOLES_VALLEY_FIELD_ENABLED = true;

/** @param {object} spec */
function buildSolesEntry(spec) {
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
    mapSlotId: "soles_valley",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_SOLES_VALLEY_FIELD_ENABLED,
  };
}

export const MOE_SOLES_VALLEY_PLANNED_REGISTRY = [
  buildSolesEntry({
    key: "soles_rescue_hound",
    familyId: "rescue_hound",
    name: "レスクール ハウンド",
    level: 13.0,
    areaHp: 76.0,
    areaRow: { mp: 0.5, attack: 13.5, defense: 16.0, hit: 13.5, magic: 0.5 },
    attackInterval: 48.0,
    captureLife: "AF",
    skills: ["噛み付き"],
    emoji: "🐕",
    color: "bg-amber-600 border-amber-800",
    modelFile: "RescueHoundA.glb",
    petDamage: 23,
  }),
];

export const MOE_SOLES_VALLEY_SPAWN_SPECS = [
  {
    mapSlotId: "soles_valley",
    key: "soles_rescue_hound",
    tx: 0.28,
    tz: 0.58,
    modelVariantId: "rescue_hound_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "soles_valley",
    key: "soles_rescue_hound",
    tx: 0.42,
    tz: 0.66,
    modelVariantId: "rescue_hound_b",
    slotInZone: 1,
  },
  {
    mapSlotId: "soles_valley",
    key: "soles_rescue_hound",
    tx: 0.34,
    tz: 0.74,
    modelVariantId: "rescue_hound_a",
    slotInZone: 2,
  },
];

export function moeSolesValleyActiveFieldEntries() {
  if (!MOE_SOLES_VALLEY_FIELD_ENABLED) return [];
  return MOE_SOLES_VALLEY_PLANNED_REGISTRY.map(({ planned, fieldEnabled, ...e }) => e);
}

export function moeSolesValleyActiveSpawnSpecs() {
  if (!MOE_SOLES_VALLEY_FIELD_ENABLED) return [];
  return MOE_SOLES_VALLEY_SPAWN_SPECS;
}
