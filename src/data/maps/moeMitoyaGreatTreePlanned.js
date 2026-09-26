/**
 * AGE · ミトヤの大樹 — 家AGE番地の奥（大樹の庭 · 敵湧きなし）
 * トレント stub は registry に残すが field では出さない
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_MITOYA_FIELD_ENABLED = false;

/** @param {object} spec */
function buildMitoyaEntry(spec) {
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
    mapSlotId: "mitoya_great_tree",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_MITOYA_FIELD_ENABLED,
  };
}

export const MOE_MITOYA_PLANNED_REGISTRY = [
  buildMitoyaEntry({
    key: "mitoya_treant_guard",
    familyId: "ancient_treant",
    name: "エンシェント トレント（stub）",
    level: 72.0,
    areaHp: 520.0,
    areaRow: { mp: 0.5, attack: 72.5, defense: 88.0, hit: 72.5, magic: 8.0 },
    attackInterval: 140.0,
    captureLife: "—",
    skills: ["根の鞭"],
    emoji: "🌳",
    color: "bg-green-900 border-green-950",
    modelFile: "AncientTreantA.glb",
    petDamage: 130,
  }),
];

export const MOE_MITOYA_SPAWN_SPECS = [
  {
    mapSlotId: "mitoya_great_tree",
    key: "mitoya_treant_guard",
    tx: 0.58,
    tz: 0.62,
    modelVariantId: "ancient_treant_a",
    slotInZone: 0,
  },
];

export function moeMitoyaActiveFieldEntries() {
  if (!MOE_MITOYA_FIELD_ENABLED) return [];
  return MOE_MITOYA_PLANNED_REGISTRY.map(({ planned, fieldEnabled, ...e }) => e);
}

export function moeMitoyaActiveSpawnSpecs() {
  if (!MOE_MITOYA_FIELD_ENABLED) return [];
  return MOE_MITOYA_SPAWN_SPECS;
}
