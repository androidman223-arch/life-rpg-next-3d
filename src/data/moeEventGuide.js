/**
 * 設定 → イベント情報（アイテム・スキル・NPC の入手メモ）
 */

/** @typedef {{ label: string, detail: string, note?: string }} MoeEventGuideEntry */

/** @typedef {{ id: string, title: string, emoji?: string, entries: MoeEventGuideEntry[] }} MoeEventGuideSection */

/** @type {MoeEventGuideSection[]} */
export const MOE_EVENT_GUIDE_SECTIONS = [
  {
    id: "treasure",
    title: "宝箱ドロップ（敵を倒す）",
    emoji: "📦",
    entries: [
      {
        label: "エクスペリエンスパウダー",
        detail: "オーク歩兵 Lv23.5 を倒す",
        note: "USEで +1,000 EXP",
      },
      {
        label: "忍者の足袋",
        detail: "ギュスターヴ Lv80 を倒す（神速 未習得のとき）",
        note: "プレイヤースキル「神速」を解放",
      },
      {
        label: "エクスペリエンスキューブ",
        detail: "ギュスターヴ Lv80 を倒す（神速 習得済みのとき）",
        note: "USEで +20,000 EXP（粉20個分）",
      },
    ],
  },
  {
    id: "player_skill",
    title: "プレイヤースキル",
    emoji: "🧑‍🎓",
    entries: [
      {
        label: "忍び足",
        detail: "最初から使える（プレイヤー技①）",
        note: "トグル · 敵の索敵を抑える",
      },
      {
        label: "神速",
        detail: "ギュスターヴの宝「忍者の足袋」で解放",
        note: "5秒間 走行6倍速 · 再戦時はリセットイベントあり",
      },
      {
        label: "隠れ蓑",
        detail: "最初から使える（プレイヤー技① · Lv50相当）",
        note: "透明化（準備中）",
      },
      {
        label: "フェニックス系（技②）",
        detail: "ミステリー ドラゴンⅡ転生後 · プレイヤー技② →",
        note: "回復・HP+50 等 — トレーナーがペットを支援",
      },
    ],
  },
  {
    id: "npc",
    title: "NPC · 配布",
    emoji: "🔮",
    entries: [
      {
        label: "魂の記憶者・ローダ",
        detail: "スポーンから南（ミニマップ下 · 魂の記憶の祠）",
        note: "EXP粉/キューブ · レベルダウン粉/キューブ · フェニックスの羽根",
      },
      {
        label: "ペットマスター・ハーヴ",
        detail: "ペット小屋（近づくと話しかけ可）",
        note: "ペット状態 · Lv100創造儀式（テスト）",
      },
      {
        label: "ヨーゼフ（経験値の匠）",
        detail: "ペット小屋 — 時の秘薬（クリスタル作成）",
        note: "Lv100+ ペットのEXPをクリスタル化（お試し合成あり）",
      },
    ],
  },
  {
    id: "event",
    title: "イベント · 転生",
    emoji: "✨",
    entries: [
      {
        label: "フェニックス転生",
        detail: "フェニックスの羽根 → ミステリー ドラゴンに USE",
        note: "ドラゴンⅡ（フェニックス）へ · 技①/技②切替",
      },
      {
        label: "ギュスターヴ再戦",
        detail: "ギュスターヴに再挑戦すると確認ダイアログ",
        note: "「はい」→ 神速をリセット · 再び忍者の足袋 or キューブ",
      },
      {
        label: "ミステリー ドラゴン 姿変更",
        detail: "ペットをダブルクリック · または技①/技②",
        note: "ドラゴンⅠ ↔ ドラゴンⅡ（フェニックス）",
      },
    ],
  },
  {
    id: "monster_lineup",
    title: "敵モンスター（制作中）",
    emoji: "👾",
    entries: [
      {
        label: "32体一覧",
        detail: "3Dフィールド東へ歩く · 設定→敵32体展示",
        note: "スポーンから東（Dキー）· 看板の前で一覧も開ける",
      },
      {
        label: "タイプ別シルエット",
        detail: "レスクール / ミーリム / エルビン / オーク / 砂漠 / ギガース",
        note: "16タイプ × A/B · 色＋形の差",
      },
    ],
  },
  {
    id: "dragon_lineup",
    title: "ドラゴン展示",
    emoji: "🐉",
    entries: [
      {
        label: "10タイプ横並び",
        detail: "3Dフィールド南へ歩く · 設定→ドラゴン10体展示",
        note: "スポーンから南（Sキー）· 看板の前で一覧も開ける",
      },
      {
        label: "タイプ別シルエット（MOE参考）",
        detail: "ガーゴイル / 炎冠 / 東洋蛇 / 砂漠トカゲ / 結晶 / 暗影 / 海蛇 / 森 / 氷 / 紅玉",
        note: "色替えではなく形状がそれぞれ違う",
      },
    ],
  },
  {
    id: "field",
    title: "フィールド目印",
    emoji: "🗺️",
    entries: [
      {
        label: "エルビン バイソン（中ボス）",
        detail: "スタート東の丘 · Lv28.5",
      },
      {
        label: "ギュスターヴ ジャイアント",
        detail: "スタートから北へ · Lv80 · 体7つ分",
      },
      {
        label: "オーク歩兵",
        detail: "フィールド各所 · Lv23.5 · 粉の宝",
      },
    ],
  },
];
