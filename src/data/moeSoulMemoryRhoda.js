/**
 * 魂の記憶者 — ディバインマスター・ローダ（Lv調整 · 経験値アイテム配布）
 */

export const MOE_SOUL_MEMORY_RHODA_NPC = {
  id: "soul_memory_rhoda",
  name: "魂の記憶者・ローダ",
  title: "ディバインマスター",
  emoji: "🔮",
  shopLabel: "魂の記憶調整",
};

export const MOE_SOUL_MEMORY_RHODA_BUTTON = {
  label: "ローダに話しかける",
  emoji: "🔮",
};

/** フィールド上のローダ待機場所（ペット小屋とは別 · スタート南） */
export const MOE_SOUL_MEMORY_RHODA_FIELD = {
  spotLabel: "魂の記憶の祠",
  spotEmoji: "🔮",
  directionHint: "スポーンから南（ミニマップの下）",
};

/** ローダ初回会話 */
export const MOE_SOUL_MEMORY_RHODA_LINES = [
  {
    speaker: "master",
    text: "……ようこそ。ワシは魂の記憶者、ディバインマスター・ローダじゃ。",
  },
  {
    speaker: "master",
    text: "ペットの育ち方を忘れてしまった者に、経験の粉と塊を授けるのが役目よ。",
  },
  {
    speaker: "master",
    text: "上げる粉・キューブも、下げる粉・キューブも同じ数字じゃ。使い方を間違えないようにね。",
  },
  {
    speaker: "master",
    text: "アイテムボックスに空きがあれば、好きなだけ受け取ってくれ。",
  },
];

/** 配布メニュー（catalogActions） */
export const MOE_SOUL_MEMORY_RHODA_GIVE_ACTIONS = [
  {
    id: "give_experience_powder",
    label: "エクスペリエンスパウダー",
    detail: "使用で +1,000 EXP",
    badge: "もらう",
  },
  {
    id: "give_experience_cube",
    label: "エクスペリエンスキューブ",
    detail: "使用で +20,000 EXP（粉20個分）",
    badge: "もらう",
  },
  {
    id: "give_level_down_powder",
    label: "レベルダウンパウダー",
    detail: "使用で -1,000 EXP",
    badge: "もらう",
  },
  {
    id: "give_level_down_cube",
    label: "レベルダウンキューブ",
    detail: "使用で -20,000 EXP（粉20個分）",
    badge: "もらう",
  },
  {
    id: "give_phoenix_feather",
    label: "フェニックスの羽根",
    detail: "ミステリー ドラゴンの転生（ドラゴンⅡ）",
    badge: "もらう",
  },
];
