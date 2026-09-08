/**
 * エクスペリエンスクリスタル合成 — お試し（経験値おすそわけとは別ウィンドウ）
 */

import {
  MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS,
  calcJosephCrystalExpAmount,
  formatJosephTierExpFraction,
} from "./moeJosephExpCrystal";

export const MOE_JOSEPH_SYNTH_NPC = {
  id: "joseph_synth",
  name: "ヨーゼフ（合成の匠）",
  emoji: "💎",
  shopLabel: "クリスタル合成（お試し）",
};

/** ペット小屋：経験値おすそわけの下の別ボタン */
export const MOE_JOSEPH_SYNTH_BUTTON = {
  label: "クリスタルをペットに使う",
  emoji: "💎",
};

export const MOE_JOSEPH_SYNTH_LINES = [
  {
    speaker: "master",
    text: "……クリスタルの合成も、ここでお試しができる。",
  },
  {
    speaker: "master",
    text: "エクスペリエンスクリスタルの経験値を、連れ歩きのペットに渡して、どれくらいLvが上がるか見るんじゃ。",
  },
  {
    speaker: "master",
    text: "……お試しじゃ。Lv100儀式と同じく、元のLvは保存しておく。解除すれば戻れる。",
  },
];

export const MOE_JOSEPH_SYNTH_CATALOG_ACTIONS = [
  {
    id: "use_on_pet",
    label: "エクスペリエンスクリスタルをこのペットに使う",
    detail: "失敗／成功／大成功／ミラクルから選んで · レベルアップを見る",
    badge: "お試し",
  },
  {
    id: "restore_trial",
    label: "お試しを解除（元のLvに戻す）",
    detail: "リロードでも自動で元に戻ります",
  },
];

/** @param {number} petLevel */
export function formatJosephSynthTierPickPrompt(petLevel) {
  return `どのクリスタルをお持ちかな？\n\nLv${petLevel}想定の封じ込め量で試すぞ。`;
}

/** @param {number} petLevel */
export function buildJosephSynthTierMenuActions(petLevel) {
  return MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS.map((tier) => {
    const exp = calcJosephCrystalExpAmount(tier, petLevel);
    return {
      id: tier.id,
      label: `${tier.emoji} ${tier.label}（${formatJosephTierExpFraction(tier)} · +${exp.toLocaleString()} EXP）`,
    };
  });
}
