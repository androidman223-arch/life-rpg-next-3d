/**
 * ミーリム海岸モンスター（MOEペット育成 Wiki エリアガイドの表に基づく）
 * https://wikiwiki.jp/moe-pet/%E3%82%A8%E3%83%AA%E3%82%A2%E3%82%AC%E3%82%A4%E3%83%89/%E3%83%9F%E3%83%BC%E3%83%AA%E3%83%A0%E6%B5%B7%E5%B2%B8
 *
 * wiki: ゲーム内ステータス（相対値）— 耐火・耐水などは現状省略
 * hpMax: 本作のHPバー用にスケールした値
 * petDamage: 敵反撃時にペットが受けるダメージ目安
 */

export const MOE_MEERIM_ENEMIES = [
  {
    key: "brown_serpent",
    name: "ブラウン サーペント",
    level: 4.5,
    attackInterval: 33.5,
    wiki: {
      hp: 0.4,
      mp: 5.0,
      attack: 5.9,
      defense: 5.0,
      hit: 5.0,
      evasion: 0.5,
      magic: 2.8,
    },
    hpMax: 50,
    petDamage: 9,
    emoji: "🐍",
    color: "bg-amber-700 border-amber-900",
  },
  {
    key: "hilltop_lion",
    name: "ヒルトップ ライオン",
    level: 15.1,
    attackInterval: 84.3,
    wiki: {
      hp: 0.5,
      mp: 15.6,
      attack: 18.6,
      defense: 15.6,
      hit: 15.6,
      evasion: 0.5,
      magic: 8.0,
    },
    hpMax: 120,
    petDamage: 20,
    emoji: "🦁",
    color: "bg-amber-600 border-amber-800",
  },
  {
    key: "orc_infantry",
    name: "オーク歩兵",
    level: 23.5,
    attackInterval: 114.6,
    wiki: {
      hp: 0.5,
      mp: 24.0,
      attack: 28.7,
      defense: 24.0,
      hit: 18.0,
      evasion: 0.5,
      magic: 12.2,
    },
    hpMax: 170,
    petDamage: 28,
    emoji: "🪓",
    color: "bg-green-800 border-green-950",
  },
  {
    key: "earth_worm",
    name: "アース ワーム",
    level: 41.1,
    attackInterval: 177.9,
    wiki: {
      hp: 0.5,
      mp: 41.6,
      attack: 49.8,
      defense: 41.6,
      hit: 41.6,
      evasion: 0.5,
      magic: 21.0,
    },
    hpMax: 240,
    petDamage: 40,
    emoji: "🪱",
    color: "bg-red-700 border-red-950",
  },
  {
    key: "sea_snake",
    name: "海ヘビ",
    level: 40.7,
    attackInterval: 300.3,
    wiki: {
      hp: 0.5,
      mp: 45.4,
      attack: 51.9,
      defense: 45.4,
      hit: 45.4,
      evasion: 0.5,
      magic: 23.0,
    },
    hpMax: 235,
    petDamage: 39,
    emoji: "🐍",
    color: "bg-cyan-700 border-cyan-900",
  },
  {
    key: "stray_ixion",
    name: "はぐれイクシオン",
    level: 50.3,
    attackInterval: 422.4,
    wiki: {
      hp: 0.5,
      mp: 50.8,
      attack: 60.9,
      defense: 50.8,
      hit: 38.1,
      evasion: 0.5,
      magic: 20.5,
    },
    hpMax: 300,
    petDamage: 48,
    emoji: "🦎",
    color: "bg-stone-500 border-stone-700",
  },
  /** ミーリム海岸・丘の上の中ボス（エルビン渓谷のはぐれバイソン系） */
  {
    key: "elvin_bison",
    name: "エルビン バイソン",
    level: 28.5,
    attackInterval: 96.0,
    wiki: {
      hp: 0.5,
      mp: 28.0,
      attack: 34.0,
      defense: 28.0,
      hit: 28.0,
      evasion: 0.5,
      magic: 14.0,
    },
    hpMax: 200,
    petDamage: 32,
    emoji: "🐂",
    color: "bg-amber-900 border-amber-950",
    midBoss: true,
  },
  /**
   * フィールドボス — ゲオの大空洞「ギュスターヴ ジャイアント」簡易版（Lv80）
   * 中ボス（エルビン）とは別スポーン · 低ポリ緑ワニ glb（GustavGiant.glb）
   */
  {
    key: "gustav_junior",
    name: "ギュスターヴ ジャイアント（簡易）",
    mapLabel: "ギュスターヴ",
    level: 80.0,
    attackInterval: 192.0,
    wiki: {
      hp: 0.5,
      mp: 80.0,
      attack: 95.0,
      defense: 84.5,
      hit: 72.0,
      evasion: 45.0,
      magic: 50.0,
    },
    hpMax: 540,
    petDamage: 52,
    petDamageStrong: 78,
    emoji: "🐊",
    color: "bg-emerald-900 border-emerald-950",
  },
  /** 低ポリ・小サイズ — エルビン バイソンの近く */
  {
    key: "mountain_bison",
    name: "マウンテンバイソン",
    level: 18.4,
    attackInterval: 72.0,
    wiki: {
      hp: 0.45,
      mp: 18.0,
      attack: 21.5,
      defense: 18.0,
      hit: 18.0,
      evasion: 0.5,
      magic: 9.0,
    },
    hpMax: 95,
    petDamage: 18,
    emoji: "🐂",
    color: "bg-stone-600 border-stone-800",
  },
  /** 低ポリ・大サイズ — アウズンブラの近く */
  {
    key: "rough_bison",
    name: "荒くれバイソン",
    level: 34.6,
    attackInterval: 128.0,
    wiki: {
      hp: 0.5,
      mp: 34.0,
      attack: 40.5,
      defense: 34.0,
      hit: 34.0,
      evasion: 0.5,
      magic: 17.0,
    },
    hpMax: 255,
    petDamage: 35,
    emoji: "🦬",
    color: "bg-amber-950 border-stone-900",
  },
  /** エルビン山脈の超ボス系 — 2つ目の丘（バグテスト用） */
  {
    key: "auzun_bura",
    name: "アウズンブラ",
    level: 120,
    attackInterval: 220.0,
    wiki: {
      hp: 0.5,
      mp: 118.0,
      attack: 142.0,
      defense: 118.0,
      hit: 118.0,
      evasion: 0.5,
      magic: 72.0,
    },
    hpMax: 820,
    petDamage: 88,
    emoji: "🦬",
    color: "bg-stone-900 border-violet-950",
    superBoss: true,
  },
];

export const MOE_MEERIM_MID_BOSS_KEY = "elvin_bison";
export const MOE_MEERIM_GUSTAV_JUNIOR_KEY = "gustav_junior";
export const MOE_MEERIM_ELVIN_BISON_KEY = "elvin_bison";
export const MOE_MEERIM_SUPER_BOSS_KEY = "auzun_bura";
export const MOE_MEERIM_MOUNTAIN_BISON_KEY = "mountain_bison";
export const MOE_MEERIM_ROUGH_BISON_KEY = "rough_bison";
/** 中ボス HP 倍率（通常よりタフ） */
export const MOE_MID_BOSS_HP_MULTIPLIER = 2;
/** 超ボス HP 倍率 */
export const MOE_SUPER_BOSS_HP_MULTIPLIER = 3;

/** 敵 Lv 表示（Wiki 準拠・小数第1位） */
export function formatEnemyLevelUi(level) {
  const n = Math.round(Number(level) * 10) / 10;
  return n.toFixed(1);
}

export function enemyWikiStatsTitle(en) {
  if (!en?.wiki) return en?.name ?? "";
  const w = en.wiki;
  const lv = formatEnemyLevelUi(en.level);
  return [
    `${en.name}（Wiki表 Lv${lv}）`,
    `HP ${w.hp}  MP ${w.mp}  攻撃 ${w.attack}  防御 ${w.defense}`,
    `命中 ${w.hit}  回避 ${w.evasion}  魔力 ${w.magic}`,
    `攻撃間隔 ${en.attackInterval}`,
  ].join("\n");
}
