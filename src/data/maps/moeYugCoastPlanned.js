/**
 * AGE · ユグ海岸 — 家AGE番地の入口（プレイヤー宅エリア · 敵湧きなし）
 * 海ヘビは registry に残すが field では出さない（`MOE_YUG_COAST_FIELD_ENABLED`）
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_YUG_COAST_FIELD_ENABLED = false;

/** @param {object} spec */
function buildYugEntry(spec) {
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
    mapSlotId: "yug_coast",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_YUG_COAST_FIELD_ENABLED,
  };
}

export const MOE_YUG_COAST_PLANNED_REGISTRY = [
  buildYugEntry({
    key: "yug_sea_snake",
    familyId: "sea_snake",
    name: "海ヘビ",
    level: 40.7,
    areaHp: 300.3,
    areaRow: { mp: 0.5, attack: 45.4, defense: 51.9, hit: 45.4, magic: 23.0 },
    attackInterval: 300.3,
    captureLife: "AF",
    skills: ["同族リンク"],
    emoji: "🐍",
    color: "bg-cyan-700 border-cyan-900",
    modelFile: "SeaSnakeA.glb",
    petDamage: 39,
  }),
];

/** L3 pad 座標（macro2AgeL3 placeholders 準拠） */
export const MOE_YUG_COAST_SPAWN_SPECS = [
  {
    mapSlotId: "yug_coast",
    key: "yug_sea_snake",
    tx: 0.62,
    tz: 0.58,
    modelVariantId: "sea_snake_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "yug_coast",
    key: "yug_sea_snake",
    tx: 0.72,
    tz: 0.42,
    modelVariantId: "sea_snake_a",
    slotInZone: 1,
  },
  {
    mapSlotId: "yug_coast",
    key: "yug_sea_snake",
    tx: 0.55,
    tz: 0.34,
    modelVariantId: "sea_snake_a",
    slotInZone: 2,
  },
];

export function moeYugCoastActiveFieldEntries() {
  if (!MOE_YUG_COAST_FIELD_ENABLED) return [];
  return MOE_YUG_COAST_PLANNED_REGISTRY.map(({ planned, fieldEnabled, ...e }) => e);
}

export function moeYugCoastActiveSpawnSpecs() {
  if (!MOE_YUG_COAST_FIELD_ENABLED) return [];
  return MOE_YUG_COAST_SPAWN_SPECS;
}
