/**
 * MOEペット育成 Wiki「能力値 = (係数 × Lv) + 修正値」の参照データ。
 * ミーリム実装の MOE_PET_DATA と揃えておき、本家ページ更新時の差分確認用。
 * 耐火〜耐無は現行ミーリム戦闘未使用（将来用に係数・修正を保持）。
 *
 * 出典: https://wikiwiki.jp/moe-pet/ 各ペットページ（取り込み: 2026-04-07）
 */

/** @typedef {{ hp: number, mp: number, attack: number, defense: number, hit: number, evasion: number, magic: number }} WikiCoreGrowth */
/** @typedef {{ hp: number, mp: number, attack: number, defense: number, hit: number, evasion: number, magic: number }} WikiCoreModifier */
/** @typedef {{ fire: number, water: number, earth: number, wind: number, neutral: number }} WikiResistGrowth */
/** @typedef {{ fire: number, water: number, earth: number, wind: number, neutral: number }} WikiResistModifier */

/**
 * @typedef {{
 *   wikiUrl: string,
 *   wikiPageTitle?: string,
 *   growth: WikiCoreGrowth,
 *   modifier: WikiCoreModifier,
 *   resistGrowth?: WikiResistGrowth,
 *   resistModifier?: WikiResistModifier,
 *   notes?: string,
 *   alternateForms?: Record<string, { growth: WikiCoreGrowth, modifier: WikiCoreModifier, resistGrowth?: WikiResistGrowth, resistModifier?: WikiResistModifier }>
 * }} WikiPetFormulaEntry
 */

/** @type {Record<string, WikiPetFormulaEntry>} */
export const MOE_PET_WIKI_FORMULA_BY_ID = {
  bold_eagle: {
    wikiUrl:
      "https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%83%9C%E3%83%BC%E3%83%AB%E3%83%89%20%E3%82%A4%E3%83%BC%E3%82%B0%E3%83%AB",
    growth: {
      hp: 3.42,
      mp: 0,
      attack: 1.1,
      defense: 1.02,
      hit: 1.0,
      evasion: 1.2,
      magic: 0,
    },
    modifier: {
      hp: 28.5,
      mp: 0.5,
      attack: 0.55,
      defense: 0.425,
      hit: 0.5,
      evasion: 0.6,
      magic: 0.5,
    },
    resistGrowth: {
      fire: 0.5,
      water: 0.5,
      earth: 0.5,
      wind: 0.5,
      neutral: 0.5,
    },
    resistModifier: {
      fire: 0.5,
      water: 0.5,
      earth: 0.5,
      wind: 0.5,
      neutral: 0.5,
    },
  },
  sun_spirit: {
    wikiUrl:
      "https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E5%A4%AA%E9%99%BD%E3%81%AE%E5%A4%A7%E7%B2%BE%E9%9C%8A",
    growth: {
      hp: 3.9,
      mp: 2.4,
      attack: 1.1,
      defense: 0.96,
      hit: 1.0,
      evasion: 1.0,
      magic: 1.0,
    },
    modifier: {
      hp: 39,
      mp: 24,
      attack: 2.2,
      defense: 1.6,
      hit: 2.0,
      evasion: 2.0,
      magic: 2.0,
    },
    resistGrowth: {
      fire: 1.0,
      water: 0.4,
      earth: 0.5,
      wind: 0.4,
      neutral: 0.5,
    },
    resistModifier: {
      fire: 2.0,
      water: 0.8,
      earth: 1.0,
      wind: 0.8,
      neutral: 1.0,
    },
  },
  mystery_dragon: {
    wikiUrl:
      "https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%83%9F%E3%82%B9%E3%83%86%E3%83%AA%E3%83%BC%20%E3%83%89%E3%83%A9%E3%82%B4%E3%83%B3",
    growth: {
      hp: 4.68,
      mp: 2.4,
      attack: 1.1,
      defense: 1.44,
      hit: 1.0,
      evasion: 0.7,
      magic: 1.0,
    },
    modifier: {
      hp: 39,
      mp: 0.4,
      attack: 0.55,
      defense: 0.6,
      hit: 0.5,
      evasion: 0.35,
      magic: 0.5,
    },
    resistGrowth: {
      fire: 0.5,
      water: 0.5,
      earth: 0.5,
      wind: 0.5,
      neutral: 0.5,
    },
    resistModifier: {
      fire: 0.25,
      water: 0.25,
      earth: 0.25,
      wind: 0.25,
      neutral: 0.25,
    },
  },
  elemental_atrum: {
    wikiUrl:
      "https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%82%A8%E3%83%AC%E3%83%A1%E3%83%B3%E3%82%BF%E3%83%AB%20%E3%82%A2%E3%83%88%E3%83%AB%E3%83%BC%E3%83%A0",
    growth: {
      hp: 2.7,
      mp: 3.0,
      attack: 0.72,
      defense: 0.76,
      hit: 1.0,
      evasion: 1.11,
      magic: 0.8,
    },
    modifier: {
      hp: 45,
      mp: 30,
      attack: 1.5,
      defense: 1.5,
      hit: 2.0,
      evasion: 3.7,
      magic: 1.6,
    },
    resistGrowth: {
      fire: 1.0,
      water: 1.0,
      earth: 1.0,
      wind: 1.0,
      neutral: 1.0,
    },
    resistModifier: {
      fire: 2.0,
      water: 2.0,
      earth: 2.0,
      wind: 2.0,
      neutral: 2.0,
    },
  },
  calgoche: {
    wikiUrl:
      "https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%82%AB%E3%83%AB%E3%82%B4%E3%83%BC%E3%82%B7%E3%83%A5",
    growth: {
      hp: 4.95,
      mp: 0,
      attack: 1.15,
      defense: 1.08,
      hit: 1.0,
      evasion: 1.0,
      magic: 0,
    },
    modifier: {
      hp: 49.5,
      mp: 0,
      attack: 2.3,
      defense: 1.8,
      hit: 2.0,
      evasion: 2.0,
      magic: 2.0,
    },
    resistGrowth: {
      fire: 0.25,
      water: 0.5,
      earth: 0.5,
      wind: 0.5,
      neutral: 0.5,
    },
    resistModifier: {
      fire: 0.5,
      water: 2.0,
      earth: 2.0,
      wind: 2.0,
      neutral: 2.0,
    },
  },
  carnival_elephant: {
    wikiUrl:
      "https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%82%AB%E3%83%BC%E3%83%8B%E3%83%90%E3%83%AB%E8%B1%A1",
    growth: {
      hp: 5.4,
      mp: 0,
      attack: 1.25,
      defense: 1.44,
      hit: 1.0,
      evasion: 0.8,
      magic: 0,
    },
    modifier: {
      hp: 45,
      mp: 0.5,
      attack: 0.6,
      defense: 0.6,
      hit: 0.5,
      evasion: 0.4,
      magic: 0.5,
    },
    resistGrowth: {
      fire: 0.5,
      water: 0.5,
      earth: 0.5,
      wind: 0.5,
      neutral: 0.5,
    },
    resistModifier: {
      fire: 0.5,
      water: 0.5,
      earth: 0.5,
      wind: 0.5,
      neutral: 0.5,
    },
  },
  abinyan: {
    wikiUrl:
      "https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%81%AC%E3%81%84%E3%81%90%E3%82%8B%E3%81%BF%20%E3%81%82%E3%81%B3%E3%81%AB%E3%82%83%E3%82%93",
    notes:
      "ミーリムの MOE_PET_DATA は Wiki「通常」形態。巨大化は alternateForms.gigantic。",
    growth: {
      hp: 3.9,
      mp: 2.4,
      attack: 0.9,
      defense: 0.96,
      hit: 1.0,
      evasion: 1.1,
      magic: 0.8,
    },
    modifier: {
      hp: 39,
      mp: 24,
      attack: 1.8,
      defense: 1.6,
      hit: 2.0,
      evasion: 2.2,
      magic: 1.6,
    },
    resistGrowth: {
      fire: 0.55,
      water: 0.55,
      earth: 0.55,
      wind: 0.55,
      neutral: 0.75,
    },
    resistModifier: {
      fire: 1.1,
      water: 1.1,
      earth: 1.1,
      wind: 1.1,
      neutral: 1.5,
    },
    alternateForms: {
      gigantic: {
        growth: {
          hp: 4.8,
          mp: 2.4,
          attack: 1.0,
          defense: 0.96,
          hit: 1.0,
          evasion: 0.8,
          magic: 0.8,
        },
        modifier: {
          hp: 48,
          mp: 24,
          attack: 2.0,
          defense: 1.6,
          hit: 2.0,
          evasion: 1.6,
          magic: 1.6,
        },
        resistGrowth: {
          fire: 0.55,
          water: 0.55,
          earth: 0.55,
          wind: 0.55,
          neutral: 0.75,
        },
        resistModifier: {
          fire: 1.1,
          water: 1.1,
          earth: 1.1,
          wind: 1.1,
          neutral: 1.5,
        },
      },
    },
  },
};
