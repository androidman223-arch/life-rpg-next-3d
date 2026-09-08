/**
 * MOE ペット経験値バフ・チケット参考（実装用メモ）
 * 出典: https://wikiwiki.jp/moe-pet/EXP表 （2025-08 頃の記載）
 *
 * 獲得EXP = round( 基礎EXP × 乗算バフ群 )
 * 基礎EXP = MOE_PET_EXP_GAIN_BY_DIFF（敵Lv差 −7〜+5、ペット・敵とも一の位切り捨て）
 *
 * ── 消費チケット（ペット／PC） ──
 * ラブペット（無印）: ペットに使用、+(1+0.2)=1.2倍相当（式では +0.2 加算項）
 * ラブペットDX: ペットに使用、+1.0 加算（無印と重複可 → 合計 +1.2 → 2.2倍、2016/3/15〜）
 * ラブペットALL: PCに使用・連れ歩き全ペット、×1.5 乗算
 * リミットスペル: アニマルホイッスル等、+0.05（10分・ペットバフ枠専有）
 * イースターチョコ等: ×1.1（イベント）
 *
 * 加算ブロック例: (1 + ラブペ無印0.2 + ラブペDX1 + リミット0.05 + …)
 *
 * ── 常時／マスタリー ──
 * BRE（ブリーダーマスタリー）: ×1.2（連れ歩き全ペット）
 *
 * ── 装備（グループ制・同グループ重複不可） ──
 * 多くのペットEXP装備: ×1.1（1か所につき乗算）
 * 1.2倍装備例: キューピッドウイング、トレーニングロンググローブ、メダロッター、
 *              アニマル・ファーエプロン、ネコミミフリルキャップ 等
 * 1.05倍例: ペットフードポーチ、チアリングファン、三つの願い 等
 * ラブウィップ（テイマーズロッド）: 使用時 ×1.2（短時間）
 *
 * ── 上限（仕様変遷あり・要再確認） ──
 * 240520頃: 内部成長率上限10倍 → 1回取得114でも100 cap
 * 240528〜: 上限引き上げ、理論最高例 ≈18.71倍（250805 Wiki）
 *
 * ── 本プロジェクト未実装 ──
 * applyMoePetExpGain 前段で multiplier を掛ける想定。
 * 「苦しみ経験」= 装備・チケットを積んでも Next がなかなか0にならない育成体験（俗称）。
 */

/** 加算式の定数（Wiki 式の +項） */
export const MOE_PET_EXP_ADDITIVE = {
  lovePet: 0.2,
  lovePetDx: 1.0,
  limitSpell: 0.05,
};

/** 乗算式の定数 */
export const MOE_PET_EXP_MULTIPLIERS = {
  lovePetAll: 1.5,
  breederMastery: 1.2,
  easterChoco: 1.1,
  equipDefault: 1.1,
  equipStrong: 1.2,
  equipWeak: 1.05,
  loveWhip: 1.2,
};

/**
 * Wiki 掲載の簡易合成例（デバッグ・UI 説明用）
 * @param {{ lovePet?: boolean, lovePetDx?: boolean, lovePetAll?: boolean, equip110Count?: number, bre?: boolean }} opts
 */
export function estimateMoePetExpMultiplier(opts = {}) {
  let add = 1;
  if (opts.lovePet) add += MOE_PET_EXP_ADDITIVE.lovePet;
  if (opts.lovePetDx) add += MOE_PET_EXP_ADDITIVE.lovePetDx;

  let mul = add;
  if (opts.bre) mul *= MOE_PET_EXP_MULTIPLIERS.breederMastery;
  if (opts.lovePetAll) mul *= MOE_PET_EXP_MULTIPLIERS.lovePetAll;
  const n = Math.max(0, Math.floor(opts.equip110Count ?? 0));
  mul *= MOE_PET_EXP_MULTIPLIERS.equipDefault ** n;
  return mul;
}

/** ラブペット系チケット（名称メモ） */
export const MOE_LOVE_PET_ITEMS = [
  {
    id: "love_pet",
    name: "ラブペット",
    nameEn: "Love Pet",
    target: "pet",
    effect: "+0.2（式上は成長率 +20% 相当）",
    duration: "約10分（ゾーン移動・ログアウトで解除）",
    stack: "DX と重複可（2016/3/15〜）",
  },
  {
    id: "love_pet_dx",
    name: "ラブペットDX",
    nameEn: "Love Pet DX",
    target: "pet",
    effect: "+1.0（公式: 成長率2倍）",
    duration: "約10分",
    stack: "無印と重複可 → 無印+DX で約2.2倍",
  },
  {
    id: "love_pet_all",
    name: "ラブペットALL",
    nameEn: "Love Pet ALL",
    target: "trainer",
    effect: "×1.5（連れ歩き全ペット）",
    duration: "約10分",
    stack: "他ラブペと併用（乗算）",
  },
];
