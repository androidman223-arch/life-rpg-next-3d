/**
 * ビスク中央アルター付近 — 課金ショップ（お試し · リアルマネー購入は後続）
 */

export const MOE_CASH_SHOP_NPC = {
  id: "cash_shop_lumina",
  name: "プレミアムショップ・ルミナ",
  emoji: "💎",
  shopLabel: "プレミアムショップ",
};

export const MOE_CASH_SHOP_BUTTON = {
  label: "プレミアムショップを見る",
  emoji: "💎",
};

/** カタログ表示（表記のみ · ラブペット系含む） */
export const MOE_CASH_SHOP_CATALOG_ITEMS = [
  {
    id: "skill2_talisman",
    name: "スキルアップの御札",
    multiplier: "55%→67%",
    detail: "プレイヤー技②の成長EXP獲得率 +12%",
    badge: "購入可",
  },
  {
    id: "love_pet",
    name: "ラブペット",
    multiplier: "約×1.2",
    detail: "ペットに使用 · 約10分 · 成長率+20%相当",
    badge: "購入可",
  },
  {
    id: "love_pet_dx",
    name: "ラブペットDX",
    multiplier: "×2",
    detail: "ペットに使用 · 約10分 · 無印と重複可",
    badge: "購入可",
  },
  {
    id: "love_pet_all",
    name: "ラブペットALL",
    multiplier: "×1.5",
    detail: "PCに使用 · 連れ歩きペット全体",
    badge: "購入可",
  },
];

/** @type {{ id: string, itemActionId: string, name: string, emoji: string, priceYen: number, detail: string }[]} */
export const MOE_CASH_SHOP_PRODUCTS = [
  {
    id: "skill2_talisman",
    itemActionId: "buy_skill2_talisman",
    name: "スキルアップの御札",
    emoji: "🎴",
    priceYen: 480,
    detail: "技② EXP獲得率 +12%（御札所持で有効）",
  },
  {
    id: "love_pet",
    itemActionId: "buy_love_pet",
    name: "ラブペット",
    emoji: "💗",
    priceYen: 120,
    detail: "ペット経験値 · 約10分（効果は後続実装）",
  },
  {
    id: "love_pet_dx",
    itemActionId: "buy_love_pet_dx",
    name: "ラブペットDX",
    emoji: "💝",
    priceYen: 360,
    detail: "ペット経験値 · 約10分（効果は後続実装）",
  },
  {
    id: "love_pet_all",
    itemActionId: "buy_love_pet_all",
    name: "ラブペットALL",
    emoji: "💖",
    priceYen: 540,
    detail: "連れ歩き全ペット · 約10分（効果は後続実装）",
  },
];

export const MOE_CASH_SHOP_LINES = [
  {
    speaker: "master",
    text: "いらっしゃい！　プレミアムショップのルミナよ。ビスク中央はにぎやかでしょ？",
  },
  {
    speaker: "master",
    text: "育成を楽にするアイテムを扱ってるの。今はお試し配布だから、ボタンを押すだけで受け取れるわ。",
  },
  {
    speaker: "master",
    text: "本番のリアルマネー決済はこれから作るから、今は値段表示だけ参考にしてね！",
  },
];

/** 購入ボタン（お試し · 押すとアイテムボックスへ） */
export function buildMoeCashShopBuyActions() {
  return MOE_CASH_SHOP_PRODUCTS.map((p) => ({
    id: p.itemActionId,
    label: `${p.emoji} ${p.name}`,
    detail: `¥${p.priceYen.toLocaleString("ja-JP")}（お試し · タップで受取）`,
    badge: "購入",
  }));
}
