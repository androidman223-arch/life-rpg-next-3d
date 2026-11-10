/**
 * 龍神スキルゲット一覧（修行② · 実践EXP Lv10〜150）
 */

/** @typedef {{ level: number, name: string, hint: string, icon: string, sub: string, originalName?: string, status?: 'done'|'planned'|'stub'|'empty' }} MoeDragonSkillGetEntry */

export { MOE_DRAGON_SKILL_GET_LEVELS } from "../lib/moeDragonTraining.js";

/** @type {MoeDragonSkillGetEntry[]} */
export const MOE_DRAGON_SKILL_GET_CATALOG = [
  {
    level: 10,
    name: "龍神の呼吸",
    icon: "🐉",
    sub: "歩行",
    hint: "実践する構え · 運動エクササイズ — 歩いて動いて体を慣らす · リジェネ5秒ごと回復",
    status: "planned",
  },
  {
    level: 20,
    name: "忍び足",
    icon: "👣",
    sub: "消音",
    hint: "足音を消す · 音に反応する敵に有効",
    status: "done",
  },
  {
    level: 30,
    name: "龍気充填",
    icon: "💨",
    sub: "スタミナ",
    hint: "龍神の呼吸の次 — 走行スタミナ回復アップ",
    status: "planned",
  },
  {
    level: 40,
    name: "板乗り",
    icon: "🛹",
    sub: "滑走",
    hint:
      "地上を滑走 · 筋斗雲の地上版（旧神速）· トレーナーLv30または龍神Lv40で解禁",
    status: "done",
  },
  {
    level: 50,
    name: "隠れミノ",
    icon: "🌿",
    sub: "隠れ",
    hint: "ネイチャーミミック · ヘイト1段階オフ＋足音消し",
    status: "done",
  },
  {
    level: 60,
    name: "龍光眼",
    icon: "👁️",
    sub: "索敵",
    hint:
      "ターゲット敵のHP・MP・攻撃・スキルを調べる · 索敵（視野・聴覚・タイプ）— 敵を選んでから使う",
    status: "done",
  },
  {
    level: 70,
    name: "龍の爪ナックル",
    icon: "✊",
    sub: "攻撃",
    hint: "竜の爪を握り込む一撃 · 攻撃1.5倍（戦闘中）",
    status: "planned",
  },
  {
    level: 80,
    name: "筋斗雲",
    icon: "☁️",
    sub: "飛行",
    hint:
      "Zを上げて空を飛ぶ · 山の上を飛びながら移動（神速より速い · Shiftでさらにダッシュ加速）",
    status: "done",
  },
  {
    level: 90,
    name: "自力整龍",
    icon: "🐲",
    sub: "大技",
    hint: "大技をここで正式習得",
    status: "planned",
  },
  {
    level: 100,
    name: "カウンタークロウ",
    icon: "✊",
    sub: "反射",
    hint: "5秒 · 被ダメ半減＋半減分反射（ルーレット寄り）— 再使用10秒",
    status: "done",
  },
  {
    level: 130,
    name: "ドラゴンロード",
    icon: "🐲",
    sub: "狩り",
    hint: "30秒間 — ペットの与ダメ2倍（物理・魔法）",
    status: "done",
  },
  {
    level: 150,
    name: "空き",
    icon: "·",
    sub: "",
    hint: "まだ決めていない",
    status: "empty",
  },
];
