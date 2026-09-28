/**
 * ホワイトエンジェルロッド — 公式の天使の息吹。
 * こちらでは経験値は減らない。約5秒のあと蘇生し、アルターへ帰還する。
 */

export const MOE_WHITE_ANGEL_ROD_CAST_MS = 5000;

export const MOE_WHITE_ANGEL_ROD_NPC = {
  name: "公式",
  emoji: "🪽",
};

/** @type {{ speaker: "master", text: string }[]} */
export const MOE_WHITE_ANGEL_ROD_LINES = [
  {
    speaker: "master",
    text: "ペットを蘇生できる杖。\n専用技「天使の息吹」：回復魔法90・MP120・ピュア ノア キューブ3個を消費し、死んだペットを蘇生する。\nただし、蘇生時に0.05レベル分の経験値を失う。\n\nこちらでは経験値は失わない。アルターへ帰還する。",
  },
  {
    speaker: "master",
    text: "★ちなみに、ペットのジャッカロープから「ジャッカロープ ミルク（レベルを下げずにペットを即時蘇生できる超強力アイテム）」もあります。",
  },
  {
    speaker: "master",
    text: "★ソウルマスターはLvダウンが大きい。0.1レベル分を失って復活する。",
  },
];
