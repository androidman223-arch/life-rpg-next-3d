/**
 * ハティル砂漠 — 追加予定モンスター（MOE Wiki エリアガイド準拠）
 * https://wikiwiki.jp/moe-pet/エリアガイド/ハティル砂漠
 *
 * GLB 全5種完成 · フィールド湧き有効
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

/** ハティル砂漠タイルへの湧き・レジストリ統合 */
export const MOE_HATIIL_FIELD_ENABLED = true;

/**
 * @param {object} spec
 */
function buildHatiilEntry(spec) {
  const hpMult = spec.hpMultiplier ?? (spec.fieldBoss ? 2.5 : 1);
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
    mapSlotId: "hatiil_desert",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    superBoss: spec.superBoss ?? false,
    planned: true,
    fieldEnabled: MOE_HATIIL_FIELD_ENABLED,
  };
}

export const MOE_HATIIL_DESERT_PLANNED_REGISTRY = [
  buildHatiilEntry({
    key: "deathworm",
    familyId: "deathworm",
    name: "デスワーム",
    level: 115.4,
    areaHp: 5345.7,
    areaRow: { mp: 0.5, attack: 162.3, defense: 83.4, hit: 115.9, magic: 0.5 },
    attackInterval: 145.0,
    captureLife: "—",
    skills: ["デドリークロウ", "消化液", "アースクエイク", "ロングアタック"],
    emoji: "🪱",
    color: "bg-red-900 border-red-950",
    modelFile: "DeathwormA.glb",
    petDamage: 88,
  }),
  buildHatiilEntry({
    key: "doodlebug_small",
    familyId: "doodlebug_small",
    name: "ドードルバグ（小）",
    moeName: "ドードルバグ · 地上日中",
    level: 80.2,
    areaHp: 595.2,
    areaRow: { mp: 30.0, attack: 82.2, defense: 78.6, hit: 82.2, magic: 2.0 },
    attackInterval: 95.0,
    captureLife: "—",
    skills: ["範囲攻撃（円を描く）", "地上徘徊"],
    emoji: "🐛",
    color: "bg-lime-700 border-lime-900",
    modelFile: "DoodlebugSmallA.glb",
    petDamage: 58,
  }),
  buildHatiilEntry({
    key: "doodlebug_medium",
    familyId: "doodlebug_medium",
    name: "ドードルバグ（中）",
    moeName: "ドードルバグ · 地中",
    level: 100.0,
    areaHp: 726.2,
    areaRow: { mp: 30.0, attack: 102.0, defense: 146.4, hit: 102.0, magic: 2.0 },
    attackInterval: 88.0,
    captureLife: "—",
    skills: ["通常攻撃", "追加魔法ダメ"],
    emoji: "🐛",
    color: "bg-lime-800 border-lime-950",
    modelFile: "DoodlebugMediumA.glb",
    petDamage: 68,
  }),
  buildHatiilEntry({
    key: "storm_punisher",
    familyId: "storm_punisher",
    name: "ストーム パニッシャー",
    level: 180.0,
    areaHp: 25000.0,
    areaRow: { mp: 1000.0, attack: 200.0, defense: 200.0, hit: 130.0, magic: 120.0 },
    attackInterval: 165.0,
    captureLife: "—",
    skills: ["飛行/着地", "範囲ブレス", "広域視界"],
    emoji: "🐉",
    color: "bg-violet-900 border-violet-950",
    modelFile: "StormPunisherA.glb",
    fieldBoss: true,
    hpMultiplier: 1,
    petDamage: 120,
  }),
  buildHatiilEntry({
    key: "chimera",
    familyId: "chimera",
    name: "キマイラ",
    level: 180.0,
    areaHp: 48000.0,
    areaRow: { mp: 1200.0, attack: 280.0, defense: 180.0, hit: 140.0, magic: 120.0 },
    attackInterval: 155.0,
    captureLife: "—",
    skills: ["生命の檻ボス", "飼い主狙い魔法", "再挑戦可"],
    emoji: "🦁",
    color: "bg-fuchsia-900 border-fuchsia-950",
    modelFile: "ChimeraA.glb",
    fieldBoss: true,
    superBoss: true,
    petDamage: 115,
  }),
  buildHatiilEntry({
    key: "desert_scorpion_large",
    familyId: "desert_scorpion_large",
    name: "デザート スコーピオン",
    moeName: "デザート スコーピオン（大）",
    level: 89.7,
    areaHp: 1235.6,
    areaRow: { mp: 0.5, attack: 112.8, defense: 129.8, hit: 90.2, magic: 0.5 },
    attackInterval: 108.0,
    captureLife: "AF",
    skills: ["通常攻撃", "毒尾", "麻痺攻撃"],
    emoji: "🦂",
    color: "bg-red-800 border-red-950",
    modelFile: "DesertScorpionLargeA.glb",
    petDamage: 62,
  }),
];

/**
 * ハティル砂漠タイル内の湧き予定（正規化 tx/tz）
 * @type {{ mapSlotId: string, key: string, tx: number, tz: number, modelVariantId?: string, slotInZone?: number }[]}
 */
export const MOE_HATIIL_DESERT_SPAWN_SPECS = [
  // 上層 — デスワーム群れ
  { mapSlotId: "hatiil_desert", key: "deathworm", tx: 0.35, tz: 0.62, modelVariantId: "deathworm_a", slotInZone: 0 },
  { mapSlotId: "hatiil_desert", key: "deathworm", tx: 0.48, tz: 0.58, modelVariantId: "deathworm_b", slotInZone: 1 },
  // 中層 — ドードルバグ
  { mapSlotId: "hatiil_desert", key: "doodlebug_small", tx: 0.28, tz: 0.42, modelVariantId: "doodlebug_small_a", slotInZone: 0 },
  { mapSlotId: "hatiil_desert", key: "doodlebug_medium", tx: 0.55, tz: 0.38, modelVariantId: "doodlebug_medium_a", slotInZone: 0 },
  // 中央 — 大ボス（アルター付近 · 斜めに離して同時戦闘しやすく）
  { mapSlotId: "hatiil_desert", key: "storm_punisher", tx: 0.62, tz: 0.44, modelVariantId: "storm_punisher_a", slotInZone: 0 },
  { mapSlotId: "hatiil_desert", key: "chimera", tx: 0.38, tz: 0.56, modelVariantId: "chimera_a", slotInZone: 0 },
  { mapSlotId: "hatiil_desert", key: "desert_scorpion_large", tx: 0.72, tz: 0.52, modelVariantId: "desert_scorpion_large_a", slotInZone: 0 },
  // マクロ１ · 2サイクル
  { mapSlotId: "hatiil_desert", key: "desert_scorpion_large", tx: 0.25, tz: 0.38, modelVariantId: "desert_scorpion_large_b", slotInZone: 1 },
  // マクロ１ · 3サイクル
  { mapSlotId: "hatiil_desert", key: "doodlebug_small", tx: 0.62, tz: 0.72, modelVariantId: "doodlebug_small_b", slotInZone: 1 },
  // マクロ１ · 4サイクル
  { mapSlotId: "hatiil_desert", key: "doodlebug_medium", tx: 0.18, tz: 0.48, modelVariantId: "doodlebug_medium_b", slotInZone: 1 },
  // マクロ１ · 5サイクル
  { mapSlotId: "hatiil_desert", key: "storm_punisher", tx: 0.48, tz: 0.22, modelVariantId: "storm_punisher_b", slotInZone: 1 },
];

/** 展示・モンスター一覧用（GLB 未 · 将来追加） */
export const MOE_HATIIL_PLANNED_FAMILIES = [
  { id: "deathworm", nameJa: "デスワーム", shapeNote: "巨大环节虫 · 砂漠徘徊" },
  { id: "doodlebug_small", nameJa: "ドードルバグ（小）", shapeNote: "地上型 · 円形範囲" },
  { id: "doodlebug_medium", nameJa: "ドードルバグ（中）", shapeNote: "地中型 · 砂下" },
  { id: "storm_punisher", nameJa: "ストーム パニッシャー", shapeNote: "下層ドラゴン · 大ボス" },
  { id: "chimera", nameJa: "キマイラ", shapeNote: "生命の檻 · 超ボス" },
  { id: "desert_scorpion_large", nameJa: "デザート スコーピオン（大）", shapeNote: "ハティル · 大サイズ蝎" },
];

/** 有効化時にレジストリへマージするエントリ */
export function moeHatiilDesertActiveFieldEntries() {
  if (!MOE_HATIIL_FIELD_ENABLED) return [];
  return MOE_HATIIL_DESERT_PLANNED_REGISTRY.map(
    ({ planned, fieldEnabled, ...e }) => e
  );
}

/** 有効化時に湧き spec へマージ */
export function moeHatiilDesertActiveSpawnSpecs() {
  if (!MOE_HATIIL_FIELD_ENABLED) return [];
  return MOE_HATIIL_DESERT_SPAWN_SPECS;
}
