/**
 * マクロ２ L5 — 公式Wikiメモ（各面の出典・再現点）
 * https://wikiwiki.jp/moe-pet/
 */

/** @type {Record<string, { areaJa: string, wikiUrl: string, reproduced: string[] }>} */
export const MACRO2_L5_WIKI = {
  lexur_hills: {
    areaJa: "レクスール・ヒルズ",
    wikiUrl: "https://wikiwiki.jp/moe-pet/%E3%82%A8%E3%83%AA%E3%82%A2%E3%82%AC%E3%82%A4%E3%83%89/%E3%83%AC%E3%82%AF%E3%82%B9%E3%83%BC%E3%83%AB%E3%83%BB%E3%83%92%E3%83%AB%E3%82%BA",
    reproduced: ["紫丘陵の起伏", "レスクール系湧き", "救助ベスト看板"],
  },
  meerim_coast: {
    areaJa: "ミーリム海岸",
    wikiUrl: "https://wikiwiki.jp/moe-pet/%E3%82%A8%E3%83%AA%E3%82%A2%E3%82%AC%E3%82%A4%E3%83%89/%E3%83%9F%E3%83%BC%E3%83%AA%E3%83%A0%E6%B5%B7%E5%B2%B8",
    reproduced: ["砂浜と浅瀬", "海岸花（イーツ）", "飛沫粒子"],
  },
  elvin_valley: {
    areaJa: "エルビン渓谷",
    wikiUrl: "https://wikiwiki.jp/moe-pet/%E3%82%A8%E3%83%AA%E3%82%A2%E3%82%AC%E3%82%A4%E3%83%89/%E3%82%A8%E3%83%AB%E3%83%93%E3%83%B3%E6%B8%9A%E8%B0%B7",
    reproduced: ["草原と木", "牧場柵・干し草", "バイソン系エリア"],
  },
  garm_corridor: {
    areaJa: "ガルム回廊",
    wikiUrl: "https://wikiwiki.jp/moe-pet/%E3%82%A8%E3%83%AA%E3%82%A2%E3%82%AC%E3%82%A4%E3%83%89/%E3%82%AC%E3%83%AB%E3%83%A0%E5%9B%9E%E5%BB%83",
    reproduced: ["石柱回廊", "壊れた橋", "コボルト鉱プロップ"],
  },
  ilvana_valley: {
    areaJa: "イルヴァーナ渓谷",
    wikiUrl: "https://wikiwiki.jp/moe-pet/%E3%82%A8%E3%83%AA%E3%82%A2%E3%82%AC%E3%82%A4%E3%83%89/%E3%82%A4%E3%83%AB%E3%83%B4%E3%82%A1%E3%83%BC%E3%83%8A%E6%B8%9A%E8%B0%B7",
    reproduced: ["渓谷の川と崖", "狼爪痕石", "焚き火"],
  },
  desert_preview: {
    areaJa: "砂漠プレビュー（ハティル見本）",
    wikiUrl: "https://wikiwiki.jp/moe-pet/%E3%82%A8%E3%83%AA%E3%82%A2%E3%82%AC%E3%82%A4%E3%83%89/%E3%83%8F%E3%83%86%E3%82%A3%E3%83%AB%E7%A0%82%E6%BC%A0",
    reproduced: ["小砂丘・サボテン", "ハティル本番より控えめ", "蟻地獄縁"],
  },
  slorim_plain: {
    areaJa: "スローリム平原",
    wikiUrl: "https://wikiwiki.jp/moe-pet/%E3%82%A8%E3%83%AA%E3%82%A2%E3%82%AC%E3%82%A4%E3%83%89/%E3%82%B9%E3%83%AD%E3%83%BC%E3%83%AA%E3%83%A0%E5%B9%B3%E5%8E%9F",
    reproduced: ["黄金平原", "マンモス骨", "ワープ pad"],
  },
  ips_canyon: {
    areaJa: "イプス峡谷",
    wikiUrl: "https://wikiwiki.jp/moe-pet/%E3%82%A8%E3%83%AA%E3%82%A2%E3%82%AC%E3%82%A4%E3%83%89/%E3%82%A4%E3%83%97%E3%82%B9%E5%B3%A1%E8%B0%B7",
    reproduced: ["両岸の崖と河床", "亀甲碑", "綿花プロップ"],
  },
  hatiil_desert: {
    areaJa: "ハティル砂漠",
    wikiUrl: "https://wikiwiki.jp/moe-pet/%E3%82%A8%E3%83%AA%E3%82%A2%E3%82%AC%E3%82%A4%E3%83%89/%E3%83%8F%E3%83%86%E3%82%A3%E3%83%AB%E7%A0%82%E6%BC%A0",
    reproduced: ["大砂丘", "蟻地獄 pit", "砂嵐演出", "デスワーム骨"],
  },
};

/** @param {string} slotId */
export function macro2L5WikiForSlot(slotId) {
  return MACRO2_L5_WIKI[slotId] ?? null;
}
