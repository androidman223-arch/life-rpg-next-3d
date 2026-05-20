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
    color: "bg-stone-600 border-stone-800",
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
    color: "bg-indigo-800 border-indigo-950",
  },
];

export function enemyWikiStatsTitle(en) {
  if (!en?.wiki) return en?.name ?? "";
  const w = en.wiki;
  return [
    `${en.name}（Wiki表 Lv${en.level}）`,
    `HP ${w.hp}  MP ${w.mp}  攻撃 ${w.attack}  防御 ${w.defense}`,
    `命中 ${w.hit}  回避 ${w.evasion}  魔力 ${w.magic}`,
    `攻撃間隔 ${en.attackInterval}`,
  ].join("\n");
}
