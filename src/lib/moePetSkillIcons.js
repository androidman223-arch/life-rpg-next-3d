import MoeAttackIcon from "@/components/icons/pet/MoeAttackIcon";
import {
  MoeEagleClawIcon,
  MoeWhirlWindIcon,
  MoeSweepDiveIcon,
} from "@/components/icons/pet/MoeBoldEagleIcons";
import {
  MoeMiniVortexTailIcon,
  MoeMiniFlareBurstIcon,
  MoeMiniDraconicWaveIcon,
  MoeMiniGigaBlazeBreathIcon,
  MoeMiniUltimateFlareIcon,
} from "@/components/icons/pet/MoeMysteryDragonIcons";
import {
  MoeLowHealPageIcon,
  MoeOnkochishinIcon,
  MoeForbiddenMagicPageIcon,
  MoeManaAmpPageIcon,
  MoePurifyPageIcon,
  MoeHighHealPageIcon,
  MoeAreaHealPageIcon,
} from "@/components/icons/pet/MoeElementalAtrumIcons";
import {
  MoeBeastFangIcon,
  MoeBeastRoarIcon,
  MoeBerserkerSoulIcon,
  MoeBeastWhipIcon,
  MoeBeastHammerIcon,
} from "@/components/icons/pet/MoeCalgocheIcons";
import {
  MoePseudoMountIcon,
  MoeTramplingIcon,
  MoeSprinkleShowerIcon,
  MoeBlindSandIcon,
  MoeTimeCapsuleBoxIcon,
  MoeNoseWhipIcon,
} from "@/components/icons/pet/MoeCarnivalElephantIcons";
import {
  MoeCatsStraightIcon,
  MoeCatsEyeIcon,
  MoeCatsRocketIcon,
  MoeAbyssBallIcon,
} from "@/components/icons/pet/MoeAbinyanIcons";

/** スキル名 → SVG アイコンコンポーネント */
export const MOE_PET_SKILL_ICON_COMPONENTS = {
  アタック: MoeAttackIcon,
  // ボールド イーグル
  "イーグル クロウ": MoeEagleClawIcon,
  "ホワール ウィンド": MoeWhirlWindIcon,
  "スウープ ダイブ": MoeSweepDiveIcon,
  // ミステリー ドラゴン
  "ミニ ヴォーテックス テイル": MoeMiniVortexTailIcon,
  "ミニ フレア バースト": MoeMiniFlareBurstIcon,
  "ミニ ドラゴニック ウェーブ": MoeMiniDraconicWaveIcon,
  "ミニ ギガブレイズ ブレス": MoeMiniGigaBlazeBreathIcon,
  "ミニ アルティメイト フレア": MoeMiniUltimateFlareIcon,
  // エレメンタル アトルーム
  "下級回復魔法のページ": MoeLowHealPageIcon,
  温故知新: MoeOnkochishinIcon,
  "禁断魔法のページ（アトルーム）": MoeForbiddenMagicPageIcon,
  "マナ増幅法のページ": MoeManaAmpPageIcon,
  "浄化魔法のページ": MoePurifyPageIcon,
  "上級回復魔法のページ": MoeHighHealPageIcon,
  "範囲回復魔法のページ": MoeAreaHealPageIcon,
  // カルゴーシュ
  "狂獣の牙": MoeBeastFangIcon,
  "狂獣の咆哮": MoeBeastRoarIcon,
  "狂戦士の魂": MoeBerserkerSoulIcon,
  "狂獣の鞭打": MoeBeastWhipIcon,
  "狂獣の鉄槌": MoeBeastHammerIcon,
  // カーニバル象
  疑似騎乗: MoePseudoMountIcon,
  トランピング: MoeTramplingIcon,
  "スプリンクル シャワー": MoeSprinkleShowerIcon,
  "ブラインド サンド": MoeBlindSandIcon,
  タイムカプセルボックス: MoeTimeCapsuleBoxIcon,
  "ノーズ ウィップ": MoeNoseWhipIcon,
  // ぬいぐるみ あびにゃん
  "キャッツ ストレート": MoeCatsStraightIcon,
  "キャッツ アイ": MoeCatsEyeIcon,
  "キャッツ ロケット": MoeCatsRocketIcon,
  "アビス ボール": MoeAbyssBallIcon,
};

/** 太陽の大精霊など、SVG 未登録分の絵文字フォールバック */
export const MOE_PET_SKILL_ICON_EMOJI = {
  "太陽のサンバ": "💃",
  "16ビート コンボ": "🥁",
  "灼熱の円舞曲": "🌀",
  "紅蓮の炎帝": "🔥",
  // フェニックス ドラゴン（転生後）
  健康のフェニックス: "🔥",
  安眠導歩: "😴",
  温泉調気: "♨",
  深睡眠眠: "💤",
  睡眠絶天崩無鏡: "🌌",
  習慣改命鳳凰昇華: "🪽",
  生命爆烈覚醒神化: "💥",
  浄化転生: "✨",
};

/**
 * @param {string|null|undefined} skillName
 * @param {{ size?: number }} [opts]
 * @returns {import('react').ReactNode}
 */
export function renderPetSkillIcon(skillName, opts = {}) {
  const size = opts.size ?? 22;
  if (!skillName) return null;

  const Icon = MOE_PET_SKILL_ICON_COMPONENTS[skillName];
  if (Icon) return <Icon size={size} />;

  const emoji = MOE_PET_SKILL_ICON_EMOJI[skillName];
  if (emoji) return emoji;

  return "✦";
}
