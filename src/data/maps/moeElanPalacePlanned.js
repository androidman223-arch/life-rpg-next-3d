/**
 * エルアン宮殿 — 公式敵（マクロ１ · Wiki エリアガイド準拠）
 * https://wikiwiki.jp/moe-pet/エリアガイド/エルアン宮殿
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";
import {
  elanPalaceMazeSpawnNorm,
  elanPalaceMazeSpawnPlan,
  MOE_ELAN_PALACE_MAZE_REF_TILE_D,
  MOE_ELAN_PALACE_MAZE_REF_TILE_W,
} from "@/lib/moe3dElanPalaceMazeLayout";

export const MOE_ELAN_PALACE_FIELD_ENABLED = true;

const REF_TW = MOE_ELAN_PALACE_MAZE_REF_TILE_W;
const REF_TD = MOE_ELAN_PALACE_MAZE_REF_TILE_D;

/**
 * @param {object} spec
 */
function buildElanPalaceEntry(spec) {
  const hpMult = spec.hpMultiplier ?? 1;
  return {
    key: spec.key,
    familyId: spec.familyId ?? spec.key,
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
  buildElanPalaceEntry({
    key: "giant_destroyer",
    name: "ジャイアント デストロイヤー",
    moeName: "ジャイアント デストロイヤー",
    level: 132.1,
    areaHp: 5163.6,
    areaRow: { mp: 0.5, attack: 135.6, defense: 162.6, hit: 108.5, magic: 1.0 },
    attackInterval: 88.0,
    captureLife: "—",
    skills: ["地震", "広域リンク", "超距離索敵"],
    emoji: "👹",
    color: "bg-red-900 border-red-950",
    modelFile: "GigasBossA.glb",
    petDamage: 238,
  }),
  buildElanPalaceEntry({
    key: "frost_wolf",
    name: "フロスト ウルフ",
    level: 105.0,
    areaHp: 813.0,
    areaRow: { mp: 0.5, attack: 137.1, defense: 101.2, hit: 105.5, magic: 0.5 },
    attackInterval: 72.0,
    captureLife: "AF",
    skills: ["フリーズブレス", "冷気（周囲DoT）"],
    emoji: "🐺",
    color: "bg-cyan-200 border-cyan-500",
    modelFile: "IlvanaWolfA.glb",
    petDamage: 189,
  }),
  buildElanPalaceEntry({
    key: "gargoyle_lord",
    name: "ガーゴイル ロード",
    moeName: "ガーゴイル ロード Lv120",
    level: 120.0,
    areaHp: 1848.0,
    areaRow: { mp: 30.0, attack: 144.6, defense: 149.2, hit: 120.5, magic: 120.0 },
    attackInterval: 56.0,
    captureLife: "—",
    skills: ["アタック", "クロスクロウ", "エナジーボール"],
    emoji: "🗿",
    color: "bg-slate-300 border-slate-500",
    modelFile: "StormPunisherA.glb",
    petDamage: 216,
  }),
  buildElanPalaceEntry({
    key: "gargoyle_lord_strong",
    name: "ガーゴイル ロード",
    moeName: "ガーゴイル ロード Lv130",
    level: 130.7,
    areaHp: 3003.6,
    areaRow: { mp: 30.0, attack: 177.1, defense: 188.8, hit: 131.2, magic: 135.0 },
    attackInterval: 56.0,
    captureLife: "—",
    skills: ["アタック", "クロスクロウ", "エナジーボール", "エナジーキャノン"],
    emoji: "🗿",
    color: "bg-slate-500 border-slate-700",
    modelFile: "StormPunisherB.glb",
    petDamage: 235,
  }),
  buildElanPalaceEntry({
    key: "lizardman_soldier",
    name: "リザードマン ソルジャー",
    level: 87.3,
    areaHp: 447.8,
    areaRow: { mp: 0.5, attack: 114.2, defense: 126.4, hit: 114.2, magic: 0.5 },
    attackInterval: 56.0,
    captureLife: "DF",
    skills: ["シールドガード", "チャージドスラッシュ", "ダイイングスタブ"],
    emoji: "🦎",
    color: "bg-lime-700 border-lime-900",
    modelFile: "OrcGangA.glb",
    petDamage: 157,
  }),
  buildElanPalaceEntry({
    key: "lizardman_mage",
    name: "リザードマン メイジ",
    level: 86.4,
    areaHp: 389.9,
    areaRow: { mp: 259.7, attack: 83.4, defense: 110.0, hit: 86.9, magic: 104.3 },
    attackInterval: 64.0,
    captureLife: "DF",
    skills: ["ファイアボール", "同属リンク回復ヘイト"],
    emoji: "🦎",
    color: "bg-emerald-700 border-emerald-900",
    modelFile: "OrcMagicianA.glb",
    petDamage: 155,
  }),
  buildElanPalaceEntry({
    key: "lizardman_captain",
    name: "リザードマン キャプテン",
    level: 101.0,
    areaHp: 983.9,
    areaRow: { mp: 0.5, attack: 131.9, defense: 158.2, hit: 131.9, magic: 0.5 },
    attackInterval: 60.0,
    captureLife: "DF",
    skills: ["チャージドスラッシュ", "同属リンク回復ヘイト"],
    emoji: "🦎",
    color: "bg-green-800 border-green-950",
    modelFile: "OrcGangB.glb",
    petDamage: 182,
  }),
  buildElanPalaceEntry({
    key: "minotaur_boss",
    name: "ミノタウロス",
    moeName: "ミノタウロス · 転生の間",
    level: 100.0,
    areaHp: 20000.0,
    areaRow: { mp: 0.5, attack: 210.0, defense: 180.0, hit: 125.0, magic: 120.0 },
    attackInterval: 96.0,
    captureLife: "—",
    skills: ["サイズミックビート", "グリード変身"],
    emoji: "🐂",
    color: "bg-amber-800 border-amber-950",
    modelFile: "GigasMammothA.glb",
    fieldBoss: true,
    petDamage: 180,
  }),
  buildElanPalaceEntry({
    key: "dullahan",
    name: "デュラハン",
    moeName: "デュラハン · 儀式の間",
    level: 200.0,
    areaHp: 180000.0,
    areaRow: { mp: 30.0, attack: 300.7, defense: 240.5, hit: 200.5, magic: 140.0 },
    attackInterval: 120.0,
    captureLife: "—",
    skills: ["死の宣告", "サンダーストーム", "飼い主襲撃"],
    emoji: "👻",
    color: "bg-violet-900 border-violet-950",
    modelFile: "ElanKnightBlackA.glb",
    fieldBoss: true,
    petDamage: 360,
  }),
];

/** エルアン宮殿タイル内湧き — 迷路区画に沿って配置 */
export const MOE_ELAN_PALACE_SPAWN_SPECS = elanPalaceMazeSpawnPlan(
  REF_TW,
  REF_TD
).map((entry) => {
  const { tx, tz } = elanPalaceMazeSpawnNorm(entry, REF_TW, REF_TD);
  const variant = entry.variant ?? "a";
  const modelVariantId = `${entry.key}_${variant}`;
  return {
    mapSlotId: "elan_palace",
    key: entry.key,
    tx,
    tz,
    modelVariantId,
    slotInZone: entry.slotInZone ?? 0,
  };
});

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
