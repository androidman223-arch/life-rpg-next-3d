/**
 * MOE 公式敵データ — モデル済み18ファミリー（Wiki エリアガイド / 捕獲表準拠）
 * https://wikiwiki.jp/moe-pet/
 *
 * wiki.* は既存 moeMeerimEnemies と同じ表示用マッピング（HP列は hpMax に反映）
 * captureLife = 捕獲系列（命）
 */

import { MOE_MONSTER_LINEUP } from "@/data/moeMonsterLineup";
import { resolveMoeEnemyDetection } from "@/lib/moeEnemyDetection";
import { moeHatiilDesertActiveFieldEntries } from "@/data/maps/moeHatiilDesertPlanned";
import { moeAlbeezForestActiveFieldEntries } from "@/data/maps/moeAlbeezForestPlanned";
import { moeElanPalaceActiveFieldEntries } from "@/data/maps/moeElanPalacePlanned";
import { moeNeokuMountainActiveFieldEntries } from "@/data/maps/moeNeokuMountainPlanned";
import { moeSulfurMineActiveFieldEntries } from "@/data/maps/moeSulfurMinePlanned";

/** @param {{ mp: number, attack: number, defense: number, hit: number, magic?: number }} row */
export function moeWikiFromAreaGuideRow(row) {
  return {
    hp: row.mp,
    mp: row.attack,
    attack: row.defense,
    defense: row.hit,
    hit: row.hit,
    evasion: 0.5,
    magic: row.magic ?? 0.5,
  };
}

/** エリアガイド HP → フィールド HP バー */
export function moeFieldHpMaxFromAreaHp(areaHp, multiplier = 1) {
  return Math.max(1, Math.round(areaHp * 1.42 * multiplier));
}

export function moeFieldPetDamageFromLevel(level) {
  return Math.max(1, Math.round(Number(level) * 1.8));
}

/**
 * @param {{
 *   key: string,
 *   familyId: string,
 *   name: string,
 *   moeName?: string,
 *   level: number,
 *   areaHp: number,
 *   areaRow: { mp: number, attack: number, defense: number, hit: number, magic?: number },
 *   attackInterval: number,
 *   captureLife: string,
 *   skills: string[],
 *   emoji: string,
 *   color: string,
 *   mapSlotId: string,
 *   modelFile: string,
 *   hpMultiplier?: number,
 *   petDamage?: number,
 *   fieldBoss?: boolean,
 *   detection?: import("@/lib/moeEnemyDetection").MoeEnemyDetection,
 * }} spec
 */
function buildMonsterFieldEntry(spec) {
  const hpMult = spec.hpMultiplier ?? (spec.fieldBoss ? 2.5 : 1);
  const entry = {
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
  };
  return {
    ...entry,
    detection: resolveMoeEnemyDetection({
      ...entry,
      detection: spec.detection,
    }),
  };
}

/** @type {ReturnType<typeof buildMonsterFieldEntry>[]} */
export const MOE_MONSTER_FIELD_REGISTRY = [
  // ── レクスール・ヒルズ（レスクール系 + ギガース） ──
  buildMonsterFieldEntry({
    key: "rescue_hound",
    familyId: "rescue_hound",
    name: "レスクール バウンド",
    moeName: "レクスール ハウンド",
    level: 5.0,
    areaHp: 35,
    areaRow: { mp: 0.5, attack: 5.5, defense: 6.5, hit: 5.5, magic: 0.5 },
    attackInterval: 42.0,
    captureLife: "AF",
    skills: ["Lv25:タウント", "Lv45:噛み付き", "Lv50:ペロペロ"],
    emoji: "🐕",
    color: "bg-amber-600 border-amber-800",
    mapSlotId: "lexur_hills",
    modelFile: "RescueHoundA.glb",
  }),
  buildMonsterFieldEntry({
    key: "rescue_lion",
    familyId: "rescue_lion",
    name: "レスクール ライオン",
    moeName: "レクスール ライオン",
    level: 20.0,
    areaHp: 101,
    areaRow: { mp: 0.5, attack: 20.5, defense: 24.5, hit: 20.5, magic: 0.5 },
    attackInterval: 72.0,
    captureLife: "AF",
    skills: ["Lv30:噛み付き", "特1:クロウ"],
    emoji: "🦁",
    color: "bg-orange-600 border-orange-800",
    mapSlotId: "lexur_hills",
    modelFile: "RescueLionA.glb",
  }),
  buildMonsterFieldEntry({
    key: "rescue_buck",
    familyId: "rescue_buck",
    name: "レスクール バック",
    moeName: "レクスール バック",
    level: 13.0,
    areaHp: 76,
    areaRow: { mp: 0.5, attack: 13.5, defense: 16.5, hit: 13.5, magic: 0.5 },
    attackInterval: 55.0,
    captureLife: "AF",
    skills: ["Lv25:ツイスターラン", "Lv80:ホーン チャージ"],
    emoji: "🦌",
    color: "bg-emerald-700 border-emerald-900",
    mapSlotId: "lexur_hills",
    modelFile: "RescueBuckA.glb",
    petDamage: 14,
  }),
  buildMonsterFieldEntry({
    key: "rescue_bear",
    familyId: "rescue_bear",
    name: "レスクール ベア",
    moeName: "レクスール ベアー",
    level: 18.0,
    areaHp: 94,
    areaRow: { mp: 0.5, attack: 18.5, defense: 22.5, hit: 18.5, magic: 0.5 },
    attackInterval: 68.0,
    captureLife: "AF",
    skills: ["Lv25:クロウ", "Lv60:ベアダウン"],
    emoji: "🐻",
    color: "bg-stone-700 border-stone-900",
    mapSlotId: "lexur_hills",
    modelFile: "RescueBearA.glb",
  }),
  buildMonsterFieldEntry({
    key: "rescue_amazoness",
    familyId: "rescue_amazoness",
    name: "レスクール アマゾネス",
    moeName: "レクスール アマゾネス",
    level: 40.0,
    areaHp: 169,
    areaRow: { mp: 0.5, attack: 40.5, defense: 48.5, hit: 40.5, magic: 0.5 },
    attackInterval: 35.0,
    captureLife: "MF",
    skills: ["Lv40:チャージド スラッシュ", "Lv50:チャーム ダンス"],
    emoji: "🛡️",
    color: "bg-rose-700 border-rose-900",
    mapSlotId: "lexur_hills",
    modelFile: "RescueAmazonessA.glb",
  }),
  buildMonsterFieldEntry({
    key: "gigas_boss",
    familyId: "gigas_boss",
    name: "ギガース",
    moeName: "ギガース",
    level: 113.2,
    areaHp: 620,
    areaRow: { mp: 0.5, attack: 120.0, defense: 145.0, hit: 110.0, magic: 0.5 },
    attackInterval: 185.0,
    captureLife: "—",
    skills: ["Lv30:ストロング タウント", "Lv60:ジャイアント クランプ"],
    emoji: "🗿",
    color: "bg-stone-800 border-violet-950",
    mapSlotId: "lexur_hills",
    modelFile: "GigasBossA.glb",
    fieldBoss: true,
    petDamage: 95,
  }),

  // ── ミーリム海岸 ──
  buildMonsterFieldEntry({
    key: "meerim_rat",
    familyId: "meerim_rat",
    name: "ミーリム ラット",
    level: 2.3,
    areaHp: 23.5,
    areaRow: { mp: 0.3, attack: 2.8, defense: 3.2, hit: 3.1, magic: 0.5 },
    attackInterval: 28.0,
    captureLife: "AF",
    skills: ["Lv25:噛み付き", "Lv120:ブレイジング スター"],
    emoji: "🐀",
    color: "bg-stone-500 border-stone-700",
    mapSlotId: "meerim_coast",
    modelFile: "MeerimRatB.glb",
  }),
  buildMonsterFieldEntry({
    key: "meerim_eats",
    familyId: "meerim_eats",
    name: "ミーリム イーツ",
    level: 3.0,
    areaHp: 27,
    areaRow: { mp: 0.3, attack: 3.5, defense: 4.0, hit: 3.5, magic: 2.0 },
    attackInterval: 32.0,
    captureLife: "AF",
    skills: ["Lv20:ウーンドリック", "Lv50:ショータイム"],
    emoji: "🌸",
    color: "bg-pink-500 border-pink-700",
    mapSlotId: "meerim_coast",
    modelFile: "MeerimEatsA.glb",
    petDamage: 6,
  }),
  buildMonsterFieldEntry({
    key: "meerim_snake",
    familyId: "meerim_snake",
    name: "ミーリム スネーク",
    moeName: "ブラウン サーペント",
    level: 4.5,
    areaHp: 33.5,
    areaRow: { mp: 0.4, attack: 5.0, defense: 5.9, hit: 5.0, magic: 2.8 },
    attackInterval: 33.5,
    captureLife: "AF",
    skills: ["通常攻撃"],
    emoji: "🐍",
    color: "bg-amber-700 border-amber-900",
    mapSlotId: "meerim_coast",
    modelFile: "MeerimSnakeB.glb",
  }),
  buildMonsterFieldEntry({
    key: "sea_snake_field",
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
    mapSlotId: "meerim_coast",
    modelFile: "SeaSnakeA.glb",
    petDamage: 39,
  }),

  // ── エルビン渓谷 ──
  buildMonsterFieldEntry({
    key: "elvin_spider",
    familyId: "elvin_spider",
    name: "エルビン スパイダー",
    moeName: "ベノム スパイダー",
    level: 34.9,
    areaHp: 195,
    areaRow: { mp: 0.5, attack: 34.0, defense: 40.0, hit: 34.0, magic: 8.0 },
    attackInterval: 88.0,
    captureLife: "AF",
    skills: ["ベノムファング", "ポイズンバイト"],
    emoji: "🕷️",
    color: "bg-violet-800 border-violet-950",
    mapSlotId: "elvin_valley",
    modelFile: "ElvinSpiderA.glb",
    petDamage: 32,
  }),
  buildMonsterFieldEntry({
    key: "elvin_wolf",
    familyId: "elvin_wolf",
    name: "エルビン ウルフ",
    moeName: "ハンター ウルフ",
    level: 20.8,
    areaHp: 105,
    areaRow: { mp: 0.5, attack: 21.0, defense: 25.5, hit: 21.0, magic: 0.5 },
    attackInterval: 58.0,
    captureLife: "AF",
    skills: ["噛み付き", "準高速攻撃"],
    emoji: "🐺",
    color: "bg-slate-600 border-slate-800",
    mapSlotId: "elvin_valley",
    modelFile: "ElvinWolfA.glb",
    petDamage: 20,
  }),
  buildMonsterFieldEntry({
    key: "elvin_bison",
    familyId: "elvin_bison",
    name: "エルビン バイソン 牡",
    level: 40.0,
    areaHp: 213,
    areaRow: { mp: 0.5, attack: 40.5, defense: 48.0, hit: 40.0, magic: 0.5 },
    attackInterval: 82.0,
    captureLife: "AF",
    skills: ["Lv50:パワー チャージ", "Lv80:ホーン チャージ"],
    emoji: "🐂",
    color: "bg-amber-800 border-amber-950",
    mapSlotId: "elvin_valley",
    modelFile: "ElvinBisonA.glb",
    petDamage: 38,
  }),

  // ── ガルム回廊 / イルヴァーナ渓谷 ──
  buildMonsterFieldEntry({
    key: "orc_gang",
    familyId: "orc_gang",
    name: "オーク ギャング",
    level: 36.0,
    areaHp: 140,
    areaRow: { mp: 0.5, attack: 36.0, defense: 42.0, hit: 38.0, magic: 0.5 },
    attackInterval: 90.0,
    captureLife: "MFHB",
    skills: ["初期:バーサーク", "Lv60:チャージド ブラント", "Lv80:スニーク アタック"],
    emoji: "🪓",
    color: "bg-green-900 border-green-950",
    mapSlotId: "garm_corridor",
    modelFile: "OrcGangA.glb",
    petDamage: 34,
  }),
  buildMonsterFieldEntry({
    key: "garm_deer",
    familyId: "garm_deer",
    name: "ガルム鹿",
    level: 13.0,
    areaHp: 78,
    areaRow: { mp: 0.5, attack: 13.5, defense: 16.5, hit: 13.5, magic: 0.5 },
    attackInterval: 52.0,
    captureLife: "AF",
    skills: ["Lv25:ツイスターラン", "Lv60:タックル", "Lv80:ホーン チャージ"],
    emoji: "🦌",
    color: "bg-stone-600 border-stone-800",
    mapSlotId: "garm_corridor",
    modelFile: "GarmDeerA.glb",
    petDamage: 14,
  }),
  buildMonsterFieldEntry({
    key: "orc_magician",
    familyId: "orc_magician",
    name: "オーク マジシャン",
    moeName: "イルヴァーナ オーク",
    level: 32.4,
    areaHp: 126,
    areaRow: { mp: 73.0, attack: 32.0, defense: 38.0, hit: 32.0, magic: 36.0 },
    attackInterval: 95.0,
    captureLife: "MF",
    skills: ["クイックニング", "ライトヒーリング", "Lv40:スピリットガード", "Lv80:ヒーリング"],
    emoji: "🧙",
    color: "bg-emerald-900 border-emerald-950",
    mapSlotId: "ilvana_valley",
    modelFile: "OrcMagicianA.glb",
    petDamage: 30,
  }),
  buildMonsterFieldEntry({
    key: "ilvana_wolf",
    familyId: "ilvana_wolf",
    name: "イルヴァーナ ウルフ",
    level: 32.0,
    areaHp: 147,
    areaRow: { mp: 0.5, attack: 32.0, defense: 38.0, hit: 32.0, magic: 0.5 },
    attackInterval: 78.0,
    captureLife: "AF",
    skills: ["初期:タウント", "Lv45:噛み付き", "Lv50:ペロペロ"],
    emoji: "🐺",
    color: "bg-slate-700 border-slate-900",
    mapSlotId: "ilvana_valley",
    modelFile: "IlvanaWolfA.glb",
    petDamage: 30,
  }),

  // ── 砂漠プレビュー（ハティル砂漠見本） ──
  buildMonsterFieldEntry({
    key: "sandworm",
    familyId: "sandworm",
    name: "サンドワーム",
    moeName: "サンドワーム",
    level: 15.0,
    areaHp: 82,
    areaRow: { mp: 0.5, attack: 15.0, defense: 18.0, hit: 15.0, magic: 0.5 },
    attackInterval: 120.0,
    captureLife: "AF",
    skills: ["視覚リンク", "ノンアクティブ"],
    emoji: "🪱",
    color: "bg-yellow-700 border-yellow-900",
    mapSlotId: "desert_preview",
    modelFile: "SandwormA.glb",
    petDamage: 14,
  }),
  buildMonsterFieldEntry({
    key: "sand_scorpion",
    familyId: "sand_scorpion",
    name: "サンドスコーピオン",
    moeName: "デザート スコーピオン",
    level: 25.2,
    areaHp: 181.0,
    areaRow: { mp: 0.5, attack: 32.1, defense: 36.9, hit: 25.7, magic: 0.5 },
    attackInterval: 105.0,
    captureLife: "AF",
    skills: ["通常攻撃", "毒尾"],
    emoji: "🦂",
    color: "bg-amber-800 border-amber-950",
    mapSlotId: "desert_preview",
    modelFile: "SandScorpionA.glb",
    petDamage: 24,
  }),
  buildMonsterFieldEntry({
    key: "desert_scorpion_med",
    familyId: "desert_scorpion_med",
    name: "デザート スコーピオン",
    moeName: "デザート スコーピオン（中）",
    level: 74.4,
    areaHp: 745.0,
    areaRow: { mp: 0.5, attack: 93.7, defense: 107.8, hit: 74.9, magic: 0.5 },
    attackInterval: 105.0,
    captureLife: "AF",
    skills: ["通常攻撃", "毒尾"],
    emoji: "🦂",
    color: "bg-orange-800 border-orange-950",
    mapSlotId: "desert_preview",
    modelFile: "DesertScorpionMedA.glb",
    petDamage: 52,
  }),

  // ── スローリム平原（ワープ pad · ギガース マンモス） ──
  buildMonsterFieldEntry({
    key: "gigas_mammoth",
    familyId: "gigas_mammoth",
    name: "ギガース マンモス",
    moeName: "ギガント マンモス",
    level: 126.0,
    areaHp: 2400,
    areaRow: { mp: 0.5, attack: 130.0, defense: 155.0, hit: 120.0, magic: 2.0 },
    attackInterval: 165.0,
    captureLife: "AF",
    skills: ["Lv50:パワー チャージ", "踏みつけ"],
    emoji: "🦣",
    color: "bg-stone-700 border-stone-900",
    mapSlotId: "slorim_plain",
    modelFile: "GigasMammothA.glb",
    fieldBoss: true,
    petDamage: 72,
  }),
  buildMonsterFieldEntry({
    key: "slorim_lion",
    familyId: "slorim_lion",
    name: "スローリム ライオン",
    level: 48.0,
    areaHp: 243.3,
    areaRow: { mp: 0.5, attack: 48.5, defense: 56.0, hit: 48.0, magic: 0.5 },
    attackInterval: 72.0,
    captureLife: "AF",
    skills: ["Lv50:噛み付き"],
    emoji: "🦁",
    color: "bg-yellow-700 border-yellow-900",
    mapSlotId: "slorim_plain",
    modelFile: "SlorimLionA.glb",
    petDamage: 44,
  }),

  // ── イプス峡谷 ──
  buildMonsterFieldEntry({
    key: "turtle",
    familyId: "turtle",
    name: "トータス",
    level: 55.0,
    areaHp: 420,
    areaRow: { mp: 30.0, attack: 45.0, defense: 120.0, hit: 55.0, magic: 2.0 },
    attackInterval: 142.0,
    captureLife: "AF",
    skills: ["ノンアクティブ", "範囲攻撃"],
    emoji: "🐢",
    color: "bg-lime-800 border-lime-950",
    mapSlotId: "ips_canyon",
    modelFile: "IpsTurtleA.glb",
    petDamage: 26,
  }),
  buildMonsterFieldEntry({
    key: "giant_tortoise",
    familyId: "giant_tortoise",
    name: "ジャイアント トータス",
    level: 80.0,
    areaHp: 810.0,
    areaRow: { mp: 30.0, attack: 65.6, defense: 176.4, hit: 82.0, magic: 2.0 },
    attackInterval: 198.0,
    captureLife: "AF",
    skills: ["踏みつけ", "範囲攻撃"],
    emoji: "🐢",
    color: "bg-emerald-900 border-emerald-950",
    mapSlotId: "ips_canyon",
    modelFile: "IpsGiantTortoiseA.glb",
    petDamage: 38,
  }),
  buildMonsterFieldEntry({
    key: "ips_bass",
    familyId: "ips_bass",
    name: "ジャイアント イプス バス",
    moeName: "ジャイアント イプス バス（大）",
    level: 40.0,
    areaHp: 225.1,
    areaRow: { mp: 30.0, attack: 4.2, defense: 50.0, hit: 42.0, magic: 2.0 },
    attackInterval: 118.0,
    captureLife: "AF",
    skills: ["タウント", "タックル"],
    emoji: "🐟",
    color: "bg-cyan-800 border-cyan-950",
    mapSlotId: "ips_canyon",
    modelFile: "IpsBassA.glb",
    petDamage: 22,
  }),
];

/** key → ベース定義 */
export const MOE_MONSTER_FIELD_BY_KEY = new Map(
  MOE_MONSTER_FIELD_REGISTRY.map((e) => [e.key, e])
);

/** 本編 + ハティル（有効時）の全フィールド敵 */
export function moeMonsterFieldAllEntries() {
  return [
    ...MOE_MONSTER_FIELD_REGISTRY,
    ...moeHatiilDesertActiveFieldEntries(),
    ...moeSulfurMineActiveFieldEntries(),
    ...moeElanPalaceActiveFieldEntries(),
    ...moeAlbeezForestActiveFieldEntries(),
    ...moeNeokuMountainActiveFieldEntries(),
  ];
}

/** mapSlotId → そのマップに配置する敵 key 一覧 */
export const MOE_MONSTER_FIELD_MAP_SLOTS = [
  ...new Set(moeMonsterFieldAllEntries().map((e) => e.mapSlotId)),
];

/** variantId → glb ファイル名 */
export const MOE_MONSTER_MODEL_FILE_BY_VARIANT = Object.fromEntries(
  MOE_MONSTER_LINEUP.map((v) => [v.id, v.file])
);

/** familyId → デフォルト glb */
export const MOE_MONSTER_MODEL_FILE_BY_FAMILY = Object.fromEntries(
  moeMonsterFieldAllEntries().map((e) => [e.familyId, e.modelFile])
);

/** @param {string} key */
export function moeMonsterFieldBase(key) {
  return (
    MOE_MONSTER_FIELD_BY_KEY.get(key) ??
    moeHatiilDesertActiveFieldEntries().find((e) => e.key === key) ??
    moeSulfurMineActiveFieldEntries().find((e) => e.key === key) ??
    moeElanPalaceActiveFieldEntries().find((e) => e.key === key) ??
    moeAlbeezForestActiveFieldEntries().find((e) => e.key === key) ??
    moeNeokuMountainActiveFieldEntries().find((e) => e.key === key) ??
    null
  );
}

/** @param {string} mapSlotId */
export function moeMonsterFieldEntriesForMap(mapSlotId) {
  return moeMonsterFieldAllEntries().filter((e) => e.mapSlotId === mapSlotId);
}
