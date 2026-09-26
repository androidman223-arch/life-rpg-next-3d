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
    wikiPath: "下僕/城下町ビスク 中央エリア",
    officialEnemies: ["イクシオン ウォーター"],
    notes: [
      "✅ 中央アルター付近の水辺 — イクシオン ウォーター",
      "https://wikiwiki.jp/moe-pet/%E4%B8%8B%E5%83%95",
    ],
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
    officialEnemies: [
      "エルビン ウルフ",
      "エルビン バイソン 牡",
      "ピグミー グリフォン",
      "ソイル バジリスク",
      "アウズンブラ",
    ],
    notes: [
      "✅ 頂上サスール（ピグミーグリフォン）·ソイル·ウルフ·バイソン — マクロ１配置済",
      "✅ 超ボス アウズンブラ — エルビン山脈平地",
    ],
  },
  dragon_valley: {
    areaJa: "飛竜の谷",
    wikiPath: "エリアガイド/飛竜の谷",
    officialEnemies: [
      "ワイルド オルヴァン",
      "エンシェント トレント",
      "スカイドラゴン",
    ],
    notes: [
      "✅ ネオク高原奥 — ワイルドオルヴァン·トレント·スカイドラゴン — マクロ１+L2配置済",
      "https://wikiwiki.jp/moe-pet/エリアガイド/飛竜の谷",
    ],
  },
  darin_mountain: {
    areaJa: "ダーイン山",
    wikiPath: "エリアガイド/ダーイン山",
    officialEnemies: ["ダーイン ラット", "オーク ガード", "オーク エリート"],
    notes: ["✅ 鉱山入口ラット·オーク — マクロ１配置済"],
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
    wikiPath: "エリアガイド/エイシスケイブ",
    officialEnemies: [
      "エイシス ラット",
      "エイシス イクシオン",
      "グレイト タランチュラ",
    ],
    notes: [
      "❌ ドードルバグはいない（ユーザー指摘 2026-09-11）",
      "✅ ラット·イクシオン·タランチュラ — マクロ１配置済",
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
    officialEnemies: ["ヤング オルヴァン", "ネオク オルヴァン", "ガード ノッカー"],
    notes: ["✅ ヤングオルヴァン·ネオクオルヴァン·ガードノッカー — マクロ１配置済"],
  },
  elan_palace: {
    areaJa: "エルアン宮殿",
    wikiPath: "エリアガイド/エルアン宮殿",
    officialEnemies: [
      "白骨",
      "黒骨",
      "ジャイアント デストロイヤー",
      "フロスト ウルフ",
      "ガーゴイル ロード",
      "リザードマン ソルジャー",
      "リザードマン メイジ",
      "リザードマン キャプテン",
      "ミノタウロス",
      "デュラハン",
    ],
    notes: [
      "❌ レスクール アマゾネスはいない（ユーザー指摘 2026-09-11）",
      "✅ 螺旋迷路 — 南西スタート · 区画ごとに湧き配置",
      "✅ 白骨·黒骨·デストロイヤー·フロストウルフ·ガゴロード·リザードマン·ボス — 仮GLB",
      "https://wikiwiki.jp/moe-pet/エリアガイド/エルアン宮殿",
    ],
  },
  mutum_catacomb: {
    areaJa: "ムトゥーム地下墓地",
    wikiPath: "エリアガイド/ムトゥーム地下墓地",
    officialEnemies: ["ゾンビ ラット", "レイス(戦士)", "ロッソ ファイター"],
    notes: [
      "✅ B2Fゾンビ·レイス · B3Fロッソ — 仮GLB",
      "https://wikiwiki.jp/moe-pet/エリアガイド/ムトゥーム地下墓地",
    ],
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
      "✅ 火竜神殿迷路（エルアン宮殿同型·赤壁）— 白骨·黒骨·サラマンダー",
      "https://wikiwiki.jp/moe-pet/エリアガイド/スルト鉱山",
    ],
  },
};

/** 第3フェーズ対象 mapSlotId（war_age 除外） */
export const MOE_MACRO1_PHASE3_MAP_SLOT_IDS = Object.keys(
  MOE_MACRO1_PHASE3_AREA_WIKI
);
