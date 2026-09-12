/**
 * マクロ１ 第3フェーズ — 公式 Wiki エリアガイドメモ（湧き配置前に必読）
 * https://wikiwiki.jp/moe-pet/エリアガイド/
 *
 * 他マップの敵を流用しない。GLB 未実装なら先にモデル化してから湧き。
 */

/** @type {Record<string, { areaJa: string, wikiPath: string, officialEnemies: string[], notes?: string[] }>} */
export const MOE_MACRO1_PHASE3_AREA_WIKI = {
  bisk: {
    areaJa: "城下町ビスク",
    wikiPath: "エリアガイド/城下町ビスク",
    officialEnemies: ["（Wiki調査）"],
    notes: ["拠点 — 周辺フィールドの公式湧きを確認"],
  },
  mainland_connector: {
    areaJa: "接続道",
    wikiPath: "—",
    officialEnemies: ["（Wiki調査）"],
  },
  legacy_buffer: {
    areaJa: "試作区バッファ",
    wikiPath: "—",
    officialEnemies: ["（接続 · 要調査）"],
  },
  elvin_mountains: {
    areaJa: "エルビン山脈",
    wikiPath: "エリアガイド/エルビン山脈",
    officialEnemies: ["（Wiki調査）"],
  },
  darin_mountain: {
    areaJa: "ダーイン山",
    wikiPath: "エリアガイド/ダーイン山",
    officialEnemies: ["（Wiki調査）"],
  },
  albeez_forest: {
    areaJa: "アルビーズの森",
    wikiPath: "エリアガイド/アルビーズの森",
    officialEnemies: ["リバーサイド クローラー", "オルヴァン パピー"],
    notes: [
      "✅ 川沿いクローラー·パピー — GLB実装 · マクロ１配置済",
      "https://wikiwiki.jp/moe-pet/エリアガイド/アルビーズの森",
    ],
  },
  ark_ruins: {
    areaJa: "箱舟遺跡",
    wikiPath: "エリアガイド/箱舟遺跡",
    officialEnemies: ["（Wiki調査）"],
  },
  eisis_cave: {
    areaJa: "エイシス・ケイブ",
    wikiPath: "エリアガイド/エイシス・ケイブ",
    officialEnemies: ["スパイダー系（公式）"],
    notes: [
      "❌ ドードルバグはいない（ユーザー指摘 2026-09-11）",
      "✅ 洞窟の公式敵はスパイダー — GLB要調査・新規family化",
    ],
  },
  legacy_prototype: {
    areaJa: "試作マップ",
    wikiPath: "—",
    officialEnemies: ["（展示用 · 要調査）"],
  },
  neoku_mountain: {
    areaJa: "ネオク山",
    wikiPath: "エリアガイド/ネオク高原",
    officialEnemies: ["ネオク オルヴァン", "ノッカー"],
    notes: [
      "✅ ネオクオルヴァン·ノッカー — GLB実装 · マクロ１配置済",
      "❌ 他マップの狼などを流用しない",
      "https://wikiwiki.jp/moe-pet/エリアガイド/ネオク高原",
    ],
  },
  neoku_plateau: {
    areaJa: "ネオク高原",
    wikiPath: "エリアガイド/ネオク高原",
    officialEnemies: ["（Wiki調査）"],
  },
  elan_palace: {
    areaJa: "エルアン宮殿",
    wikiPath: "エリアガイド/エルアン宮殿",
    officialEnemies: ["白骨", "黒骨"],
    notes: [
      "❌ レスクール アマゾネスはいない（ユーザー指摘 2026-09-11）",
      "✅ 白骨·黒骨 — スルトGLB流用 · マクロ１配置済",
      "https://wikiwiki.jp/moe-pet/エリアガイド/エルアン宮殿",
    ],
  },
  mutum_catacomb: {
    areaJa: "ムトゥーム地下墓地",
    wikiPath: "エリアガイド/ムトゥーム地下墓地",
    officialEnemies: ["（Wiki調査）"],
  },
  nubool_village: {
    areaJa: "ヌブールの村",
    wikiPath: "エリアガイド/ヌブールの村",
    officialEnemies: ["（Wiki調査）"],
  },
  sulfur_mine: {
    areaJa: "スルト鉱山",
    wikiPath: "エリアガイド/スルト鉱山",
    officialEnemies: [
      "エルアン ナイト（白）",
      "エルアン ナイト（黒）",
      "サラマンダー",
    ],
    notes: [
      "✅ 白骨·黒骨·サラマンダー — GLB実装 · マクロ１配置済",
      "https://wikiwiki.jp/moe-pet/エリアガイド/スルト鉱山",
    ],
  },
};

/** 第3フェーズ対象 mapSlotId（war_age 除外） */
export const MOE_MACRO1_PHASE3_MAP_SLOT_IDS = Object.keys(
  MOE_MACRO1_PHASE3_AREA_WIKI
);
