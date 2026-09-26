/**
 * スルト鉱山 — 公式敵（マクロ１ · Wiki エリアガイド準拠）
 * https://wikiwiki.jp/moe-pet/エリアガイド/スルト鉱山
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";
import {
  MOE_ELAN_PALACE_MAZE_REF_TILE_D,
  MOE_ELAN_PALACE_MAZE_REF_TILE_W,
  sulfurMineMazeSpawnNorm,
  sulfurMineMazeSpawnPlan,
} from "@/lib/moe3dSulfurMineMazeLayout";

export const MOE_SULFUR_MINE_FIELD_ENABLED = true;

const REF_TW = MOE_ELAN_PALACE_MAZE_REF_TILE_W;
const REF_TD = MOE_ELAN_PALACE_MAZE_REF_TILE_D;

/**
 * @param {object} spec
 */
function buildSulfurEntry(spec) {
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
    mapSlotId: "sulfur_mine",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_SULFUR_MINE_FIELD_ENABLED,
  };
}

export const MOE_SULFUR_MINE_PLANNED_REGISTRY = [
  buildSulfurEntry({
    key: "elan_knight_white",
    familyId: "elan_knight_white",
    name: "エルアン ナイト（白）",
    moeName: "白骨 · エルアン ナイト",
    level: 90.4,
    areaHp: 593.3,
    areaRow: { mp: 0.5, attack: 110.4, defense: 88.3, hit: 92.0, magic: 0.5 },
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
    petDamage: 162,
  }),
  buildSulfurEntry({
    key: "elan_knight_black",
    familyId: "elan_knight_black",
    name: "エルアン ナイト（黒）",
    moeName: "黒骨 · エルアン ナイト",
    level: 108.4,
    areaHp: 853.8,
    areaRow: { mp: 0.5, attack: 132.9, defense: 106.2, hit: 110.8, magic: 0.5 },
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
    petDamage: 195,
  }),
  buildSulfurEntry({
    key: "salamander",
    familyId: "salamander",
    name: "サラマンダー",
    level: 88.3,
    areaHp: 800.0,
    areaRow: { mp: 0.5, attack: 115.4, defense: 106.4, hit: 88.8, magic: 0.5 },
    attackInterval: 88.0,
    captureLife: "—",
    skills: ["テイルウィップ", "ファイアースピット", "インフェルノスピット"],
    emoji: "🦎",
    color: "bg-red-700 border-red-900",
    modelFile: "SalamanderA.glb",
    petDamage: 159,
  }),
];

/** スルト鉱山 — 火竜神殿迷路区画に沿った湧き */
export const MOE_SULFUR_MINE_SPAWN_SPECS = sulfurMineMazeSpawnPlan(
  REF_TW,
  REF_TD
).map((entry) => {
  const { tx, tz } = sulfurMineMazeSpawnNorm(entry, REF_TW, REF_TD);
  const variant = entry.variant ?? "a";
  const modelVariantId = `${entry.key}_${variant}`;
  return {
    mapSlotId: "sulfur_mine",
    key: entry.key,
    tx,
    tz,
    modelVariantId,
    slotInZone: entry.slotInZone ?? 0,
  };
});

export function moeSulfurMineActiveFieldEntries() {
  if (!MOE_SULFUR_MINE_FIELD_ENABLED) return [];
  return MOE_SULFUR_MINE_PLANNED_REGISTRY.map(
    ({ planned, fieldEnabled, ...e }) => e
  );
}

export function moeSulfurMineActiveSpawnSpecs() {
  if (!MOE_SULFUR_MINE_FIELD_ENABLED) return [];
  return MOE_SULFUR_MINE_SPAWN_SPECS;
}
