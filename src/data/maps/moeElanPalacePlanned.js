/**
 * エルアン宮殿 — 公式敵（マクロ１ · Wiki エリアガイド準拠）
 * https://wikiwiki.jp/moe-pet/エリアガイド/エルアン宮殿
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_ELAN_PALACE_FIELD_ENABLED = true;

/**
 * @param {object} spec
 */
function buildElanPalaceEntry(spec) {
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
    mapSlotId: "elan_palace",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_ELAN_PALACE_FIELD_ENABLED,
  };
}

export const MOE_ELAN_PALACE_PLANNED_REGISTRY = [
  buildElanPalaceEntry({
    key: "elan_knight_white",
    familyId: "elan_knight_white",
    name: "エルアン ナイト（白）",
    moeName: "白骨 · エルアン ナイト",
    level: 92.1,
    areaHp: 612.0,
    areaRow: { mp: 0.5, attack: 112.8, defense: 90.1, hit: 93.6, magic: 0.5 },
    attackInterval: 56.0,
    captureLife: "—",
    skills: [
      "チャージドスラッシュ",
      "ダイイングスタブ",
      "ヴァルキリーブレイド",
      "シールドガード",
    ],
    emoji: "🦴",
    color: "bg-stone-200 border-stone-400",
    modelFile: "ElanKnightWhiteA.glb",
    petDamage: 166,
  }),
  buildElanPalaceEntry({
    key: "elan_knight_black",
    familyId: "elan_knight_black",
    name: "エルアン ナイト（黒）",
    moeName: "黒骨 · エルアン ナイト",
    level: 110.2,
    areaHp: 880.0,
    areaRow: { mp: 0.5, attack: 135.2, defense: 108.4, hit: 112.6, magic: 0.5 },
    attackInterval: 56.0,
    captureLife: "—",
    skills: [
      "チャージドスラッシュ",
      "ダイイングスタブ",
      "ヴァルキリーブレイド",
      "シールドガード",
    ],
    emoji: "💀",
    color: "bg-stone-800 border-stone-950",
    modelFile: "ElanKnightBlackA.glb",
    petDamage: 198,
  }),
];

/** エルアン宮殿タイル内湧き */
export const MOE_ELAN_PALACE_SPAWN_SPECS = [
  {
    mapSlotId: "elan_palace",
    key: "elan_knight_white",
    tx: 0.32,
    tz: 0.58,
    modelVariantId: "elan_knight_white_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "elan_palace",
    key: "elan_knight_black",
    tx: 0.68,
    tz: 0.42,
    modelVariantId: "elan_knight_black_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "elan_palace",
    key: "elan_knight_white",
    tx: 0.28,
    tz: 0.38,
    modelVariantId: "elan_knight_white_b",
    slotInZone: 1,
  },
  {
    mapSlotId: "elan_palace",
    key: "elan_knight_black",
    tx: 0.72,
    tz: 0.62,
    modelVariantId: "elan_knight_black_b",
    slotInZone: 1,
  },
];

export function moeElanPalaceActiveFieldEntries() {
  if (!MOE_ELAN_PALACE_FIELD_ENABLED) return [];
  return MOE_ELAN_PALACE_PLANNED_REGISTRY.map(
    ({ planned, fieldEnabled, ...e }) => e
  );
}

export function moeElanPalaceActiveSpawnSpecs() {
  if (!MOE_ELAN_PALACE_FIELD_ENABLED) return [];
  return MOE_ELAN_PALACE_SPAWN_SPECS;
}
