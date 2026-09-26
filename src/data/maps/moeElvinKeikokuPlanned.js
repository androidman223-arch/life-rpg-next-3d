/**
 * 新エルビン渓谷 — 公式敵（GLB ワープマップ）
 * https://wikiwiki.jp/moe-pet/エリアガイド/エルビン渓谷
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_ELVIN_KEIKOKU_FIELD_ENABLED = true;

/** @param {object} spec */
function buildElvinKeikokuEntry(spec) {
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
    mapSlotId: "elvin_keikoku",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    superBoss: spec.superBoss ?? false,
    planned: true,
    fieldEnabled: MOE_ELVIN_KEIKOKU_FIELD_ENABLED,
  };
}

export const MOE_ELVIN_KEIKOKU_PLANNED_REGISTRY = [
  buildElvinKeikokuEntry({
    key: "tyrant_gryphon",
    familyId: "tyrant_gryphon",
    name: "タイラント グリフォン",
    level: 128.7,
    areaHp: 4934.3,
    areaRow: {
      mp: 0.5,
      attack: 155.1,
      defense: 124.0,
      hit: 129.2,
      magic: 0.5,
    },
    attackInterval: 68.0,
    captureLife: "—",
    skills: ["フラップウイングス", "ストームウイング"],
    emoji: "🦅",
    color: "bg-amber-800 border-amber-950",
    modelFile: "PygmyGryphonA.glb",
    fieldBoss: true,
    superBoss: true,
    petDamage: 232,
  }),
];

/**
 * 山頂 — tx/tz は fallback。実座標は MOE_ELVIN_KEIKOKU_TYRANT_SPAWN_WORLD（x-1488 y-324 z21）
 * repop 想定20分は未実装
 */
export const MOE_ELVIN_KEIKOKU_SPAWN_SPECS = [
  {
    mapSlotId: "elvin_keikoku",
    key: "tyrant_gryphon",
    tx: 0.695,
    tz: 0.308,
    modelVariantId: "tyrant_gryphon_a",
    slotInZone: 0,
  },
];

export function moeElvinKeikokuActiveFieldEntries() {
  if (!MOE_ELVIN_KEIKOKU_FIELD_ENABLED) return [];
  return MOE_ELVIN_KEIKOKU_PLANNED_REGISTRY.map(
    ({ planned, fieldEnabled, ...e }) => e
  );
}

export function moeElvinKeikokuActiveSpawnSpecs() {
  if (!MOE_ELVIN_KEIKOKU_FIELD_ENABLED) return [];
  return MOE_ELVIN_KEIKOKU_SPAWN_SPECS;
}
