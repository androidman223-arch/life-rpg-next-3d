/**
 * AGE · ゲオ深淵（北東/南/西）— プレースホルダ敵 stub
 * macro-features #17 · 本番 Wiki 湧き前の仮配置（サラマンダー系）
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_GEO_ABYSS_FIELD_ENABLED = true;

/** @param {object} spec */
function buildGeoStubEntry(spec) {
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
    mapSlotId: spec.mapSlotId,
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_GEO_ABYSS_FIELD_ENABLED,
  };
}

const GEO_STUB_BASE = {
  key: "geo_abyss_salamander",
  familyId: "salamander",
  name: "サラマンダー（stub）",
  level: 88.3,
  areaHp: 800.0,
  areaRow: { mp: 0.5, attack: 88.5, defense: 95.0, hit: 88.5, magic: 12.0 },
  attackInterval: 120.0,
  captureLife: "—",
  skills: ["ファイアボール"],
  emoji: "🦎",
  color: "bg-orange-600 border-orange-900",
  modelFile: "SalamanderA.glb",
  petDamage: 159,
};

export const MOE_GEO_ABYSS_PLANNED_REGISTRY = [
  buildGeoStubEntry({ ...GEO_STUB_BASE, mapSlotId: "geo_abyss_ne" }),
];

/** @type {{ mapSlotId: string, key: string, tx: number, tz: number, modelVariantId: string, slotInZone: number }[]} */
export const MOE_GEO_ABYSS_SPAWN_SPECS = [
  {
    mapSlotId: "geo_abyss_ne",
    key: "geo_abyss_salamander",
    tx: 0.62,
    tz: 0.55,
    modelVariantId: "salamander_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "geo_abyss_s",
    key: "geo_abyss_salamander",
    tx: 0.58,
    tz: 0.48,
    modelVariantId: "salamander_b",
    slotInZone: 0,
  },
  {
    mapSlotId: "geo_abyss_w",
    key: "geo_abyss_salamander",
    tx: 0.65,
    tz: 0.52,
    modelVariantId: "salamander_a",
    slotInZone: 0,
  },
];

export function moeGeoAbyssActiveFieldEntries() {
  if (!MOE_GEO_ABYSS_FIELD_ENABLED) return [];
  return MOE_GEO_ABYSS_PLANNED_REGISTRY.map(({ planned, fieldEnabled, ...e }) => e);
}

export function moeGeoAbyssActiveSpawnSpecs() {
  if (!MOE_GEO_ABYSS_FIELD_ENABLED) return [];
  return MOE_GEO_ABYSS_SPAWN_SPECS;
}
