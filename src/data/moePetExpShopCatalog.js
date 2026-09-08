/**
 * ペット経験値増加 — 用品店カタログ（表示専用・購入効果未実装）
 * 出典: https://wikiwiki.jp/moe-pet/EXP表
 */

/** @typedef {{ id: string, name: string, multiplier: string, detail: string, badge?: string }} MoePetExpShopRow */

/** @type {MoePetExpShopRow[]} 上から順に陳列 */
export const MOE_PET_EXP_SHOP_CATALOG = [
  {
    id: "breeder_mastery",
    name: "ブリーダーズマスタリー",
    multiplier: "×1.2",
    detail: "連れ歩き全ペットの取得EXP（スキル・常時）",
    badge: "ON",
  },
  {
    id: "love_pet",
    name: "ラブペット",
    multiplier: "約×1.2",
    detail: "ペットに使用 · 約10分 · 成長率+20%相当",
  },
  {
    id: "love_pet_dx",
    name: "ラブペットDX",
    multiplier: "×2",
    detail: "ペットに使用 · 約10分 · 無印と重複可",
  },
  {
    id: "love_pet_all",
    name: "ラブペットALL",
    multiplier: "×1.5",
    detail: "PCに使用 · 連れ歩きペット（最大3体）全体",
  },
  {
    id: "equip_110",
    name: "ペット経験値装備（1.1倍）",
    multiplier: "×1.1",
    detail: "装備1か所ごとに乗算 · 愛玩の指輪 等",
  },
  {
    id: "equip_120",
    name: "ペット経験値装備（1.2倍）",
    multiplier: "×1.2",
    detail: "装備1か所ごとに乗算 · キューピッドウイング 等",
  },
];

/** リスト下段：スキル系（参考・未実装） */
export const MOE_PET_EXP_SHOP_SKILLS = [
  {
    id: "skill_110",
    name: "経験値1.1倍スキル",
    multiplier: "×1.1",
    detail: "スキル発動 · 一定時間 · 取得EXP上昇",
  },
  {
    id: "skill_120",
    name: "経験値1.2倍スキル",
    multiplier: "×1.2",
    detail: "スキル発動 · ラブウィップ等 · 短時間",
  },
  {
    id: "skill_130",
    name: "経験値1.3倍スキル",
    multiplier: "×1.3",
    detail: "スキル発動 · 上級テクニック想定",
  },
];

export const MOE_PET_EXP_VENDOR_NPC = {
  id: "exp_vendor",
  name: "育成用品店・リン",
  emoji: "🛒",
  shopLabel: "ペット育成用品",
};

/** 育成用品店・リンの「内緒話」（カタログ前の会話） */
export const MOE_PET_EXP_VENDOR_SECRET_LINES = [
  {
    speaker: "master",
    text: "……ほれ、客。君だけに教えてやる。超おトクな、ペット経験値の増やし方じゃ！",
  },
  {
    speaker: "master",
    text: "これはな、超超お宝の情報であるぞ。他言無用……ただし、ウチのカタログは見ていくれよな。",
  },
  {
    speaker: "master",
    text: "まずは強い敵を殴る！　Lv差が開いてるほど、基礎EXPはデカい。弱い敵ばかりじゃ、いつまで経っても伸びん。",
  },
  {
    speaker: "master",
    text: "それから……ラブペットじゃ！　リアルマネーで買うもよし、超ボスの褒美にするもよし、ガチャを引くもよし！",
  },
  {
    speaker: "master",
    text: "他のプレイヤーと高値売買するもよし、取引所で泣きながら買い占めるもよし……どれも、育成者の血が滾る道じゃ！",
  },
  {
    speaker: "master",
    text: "装備にブリーダー、経験値1.1倍、1.2倍……全部乗せれば、理論上は化け物みたいに伸びる。超優れモノじゃ！！",
  },
  {
    speaker: "master",
    text: "……さて、ウチの品揃えも見ていくれ。今はカタログ参考じゃが、いずれ本気で売るからな！",
  },
];
