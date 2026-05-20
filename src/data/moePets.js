// Master of Epic Pet Database（スキル名・習得Lvは MOEペット育成 Wiki 各ページに準拠）
// Wiki 係数・修正の参照表: ./moePetWikiCoefficients.js
export const MOE_PET_DATA = {
  // https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%83%9C%E3%83%BC%E3%83%AB%E3%83%89%20%E3%82%A4%E3%83%BC%E3%82%B0%E3%83%AB
  // 能力値 = (係数 * Lv) + 修正値
  bold_eagle: {
    name: "ボールド イーグル",
    emoji: "🦅",
    usePreciseWikiStats: true,
    description: "もえガチャ特賞のアニマルケイジ。飛行・高速・準高速攻撃。",
    baseStats: {
      hp: 28.5,
      mp: 0.5,
      attack: 0.55,
      defense: 0.425,
      hit: 0.5,
      evasion: 0.6,
      magic: 0.5,
    },
    growth: {
      hp: 3.42,
      mp: 0,
      attack: 1.1,
      defense: 1.02,
      hit: 1.0,
      evasion: 1.2,
      magic: 0,
    },
    skills: [
      { level: 1, name: "アタック", type: "physical", ratio: 1.0 },
      {
        level: 40,
        name: "イーグル クロウ",
        type: "physical_dot",
        ratio: 0.8,
        dotHits: 2,
        dotMagicRatio: 0.35,
        combatDotStepMs: 120,
        delaySec: 23,
        note: "近接物理＋命中時DoT魔法2回（回避でDoT無し・ガードでもDoTあり）",
      },
      {
        level: 70,
        name: "ホワール ウィンド",
        type: "magic_wind",
        combatMagicRatio: 0.88,
        delaySec: 35,
        note: "ガード不可・風属性単体必中・威力はLv依存のみ",
      },
      {
        level: 100,
        name: "スウープ ダイブ",
        type: "physical",
        ratio: 1.5,
        delaySec: 45,
        note: "近接物理約1.5倍・命中時麻痺風デバフ約1秒",
      },
    ],
  },
  // https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E5%A4%AA%E9%99%BD%E3%81%AE%E5%A4%A7%E7%B2%BE%E9%9C%8A
  // 能力値 = (係数 * Lv) + 修正値
  sun_spirit: {
    name: "太陽の大精霊",
    emoji: "☀️",
    usePreciseWikiStats: true,
    description: "太陽石で太陽の精霊から進化。飛行・高速MP回復。",
    baseStats: {
      hp: 39,
      mp: 24,
      attack: 2.2,
      defense: 1.6,
      hit: 2.0,
      evasion: 2.0,
      magic: 2.0,
    },
    growth: {
      hp: 3.9,
      mp: 2.4,
      attack: 1.1,
      defense: 0.96,
      hit: 1.0,
      evasion: 1.0,
      magic: 1.0,
    },
    skills: [
      { level: 1, name: "アタック", type: "physical", ratio: 1.0 },
      {
        level: 30,
        name: "太陽のサンバ",
        type: "buff",
        delaySec: 45,
        note: "自身の攻撃力・クリ率上昇・ヴィガー上書け・buff枠に注意",
      },
      {
        level: 60,
        name: "16ビート コンボ",
        type: "physical_magic_combo",
        /** ミーリム戦闘：物理ヒット1回の攻撃力係数 */
        physicalRatio: 0.5,
        /** ミーリム戦闘：魔法ヒット各回の魔力係数 */
        magicRatio: 0.15,
        magicHits: 7,
        /** 連撃の間隔（ms）。戦闘は MoeFieldMap が参照 */
        combatStepMs: 100,
        delaySec: 20,
        note: "物理約0.5倍1回＋魔法約0.15倍7回（ミーリムは減衰式ダメージ式で再現）",
      },
      {
        level: 90,
        name: "灼熱の円舞曲",
        type: "physical_magic_area",
        physicalRatio: 0.95,
        magicRatio: 0.5,
        magicHits: 2,
        combatStepMs: 130,
        delaySec: 45,
        note: "物理範囲1回＋魔法範囲2回・ミーリムは物理1＋魔法2の連撃で再現",
      },
      {
        level: 110,
        name: "紅蓮の炎帝",
        type: "magic_fire",
        mpCost: 50,
        /** ミーリム：単発魔法ヒットの魔力係数 */
        combatMagicRatio: 1.05,
        delaySec: 60,
        note: "消費MP50・炎玉落下・威力は魔力依存（ミーリムは減衰式×combatMagicRatio）",
      },
    ],
  },
  // https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%83%9F%E3%82%B9%E3%83%86%E3%83%AA%E3%83%BC%20%E3%83%89%E3%83%A9%E3%82%B4%E3%83%B3
  // 能力値 = (係数 * Lv) + 修正値
  mystery_dragon: {
    name: "ミステリー ドラゴン",
    emoji: "🐉",
    usePreciseWikiStats: true,
    description: "ミステリー ラーヴァから進化。地上／飛行モードで技が分岐。",
    baseStats: {
      hp: 39,
      mp: 0.4,
      attack: 0.55,
      defense: 0.6,
      hit: 0.5,
      evasion: 0.35,
      magic: 0.5,
    },
    growth: {
      hp: 4.68,
      mp: 2.4,
      attack: 1.1,
      defense: 1.44,
      hit: 1.0,
      evasion: 0.7,
      magic: 1.0,
    },
    skills: [
      { level: 1, name: "アタック", type: "physical", ratio: 1.0, mode: "ground" },
      {
        level: 40,
        name: "ミニ ヴォーテックス テイル",
        type: "physical_area",
        ratio: 1.1,
        delaySec: 20,
        mode: "ground",
        note: "範囲物理・ノックバック",
      },
      {
        level: 40,
        name: "ミニ フレア バースト",
        type: "magic_fire",
        mpCost: 10,
        combatMagicRatio: 0.85,
        delaySec: 8,
        mode: "flight",
        note: "飛行時は通常攻撃の代わり・詠唱あり",
      },
      {
        level: 80,
        name: "ミニ ドラゴニック ウェーブ",
        type: "magic_dot_area",
        mpCost: 30,
        combatWaveHits: 4,
        combatStepMs: 500,
        combatMagicRatio: 0.42,
        delaySec: 35,
        mode: "ground",
        note: "広範囲DoT魔法4回・間隔約0.5秒",
      },
      {
        level: 80,
        name: "ミニ ギガブレイズ ブレス",
        type: "magic_fire_dot",
        mpCost: 20,
        combatWaveHits: 4,
        combatStepMs: 250,
        combatMagicRatio: 0.38,
        delaySec: 25,
        mode: "flight",
        note: "火属性DoT4回・間隔約0.25秒",
      },
      {
        level: 100,
        name: "ミニ アルティメット フレア",
        type: "magic_fire",
        mpCost: 40,
        combatMagicRatio: 1.1,
        mode: "ground",
        note: "詠唱あり・消費MP40の火魔法",
      },
    ],
  },
  // https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%82%A8%E3%83%AC%E3%83%A1%E3%83%B3%E3%82%BF%E3%83%AB%20%E3%82%A2%E3%83%88%E3%83%AB%E3%83%BC%E3%83%A0
  // 能力値 = (係数 * Lv) + 修正値
  elemental_atrum: {
    name: "エレメンタル アトルーム",
    emoji: "👧",
    usePreciseWikiStats: true,
    description: "プルルーム亜種。回復・バフ中心（禁断は断片トレード発動）。",
    baseStats: {
      hp: 45,
      mp: 30,
      attack: 1.5,
      defense: 1.5,
      hit: 2.0,
      evasion: 3.7,
      magic: 1.6,
    },
    growth: {
      hp: 2.7,
      mp: 3.0,
      attack: 0.72,
      defense: 0.76,
      hit: 1.0,
      evasion: 1.11,
      magic: 0.8,
    },
    skills: [
      { level: 1, name: "アタック", type: "physical", ratio: 1.0 },
      {
        level: 30,
        name: "下級回復魔法のページ",
        type: "heal",
        mpCost: 18,
        loyaltyMin: 20,
        note: "HP7割未満で使用・ライトヒーリング級",
      },
      {
        level: 60,
        name: "温故知新",
        type: "buff_magic",
        mpCost: 15,
        loyaltyMin: 50,
        note: "ホーリーブレス類似・魔力上昇buff",
      },
      {
        level: 70,
        name: "禁断魔法のページ（アトルーム）",
        type: "magic_wind_area",
        combatMagicRatio: 0.78,
        note: "断片○ページトレードで発動・風属性範囲攻撃",
      },
      {
        level: 80,
        name: "マナ増幅法のページ",
        type: "buff_mp_regen",
        mpCost: 34,
        loyaltyMin: 50,
        note: "MP5割以下・コンデンスマインド類似のMP自然回復上昇",
      },
      {
        level: 85,
        name: "浄化魔法のページ",
        type: "special_purge",
        mpCost: 18,
        loyaltyMin: 100,
        note: "特殊1・範囲内味方のDeBuff1つ解除",
      },
      {
        level: 90,
        name: "上級回復魔法のページ",
        type: "heal",
        mpCost: 46,
        loyaltyMin: 100,
        note: "HP7割未満・ヒーリングオール級",
      },
      {
        level: 100,
        name: "範囲回復魔法のページ",
        type: "heal_area",
        mpCost: 48,
        loyaltyMin: 166,
        note: "特殊2・自己中心範囲回復",
      },
    ],
  },
  // https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%82%AB%E3%83%AB%E3%82%B4%E3%83%BC%E3%82%B7%E3%83%A5
  // 能力値 = (係数 * Lv) + 修正値（MP0・準高速攻撃）
  calgoche: {
    name: "カルゴーシュ",
    emoji: "🐕",
    /** ミーリム: 内部ステ小数第2・UI第1・Lv+1 で係数分ずつ加算 */
    usePreciseWikiStats: true,
    description: "特殊ペット。Wiki: 犬／狼に見えるが実はウサギ系。草食物◎、薬×。",
    baseStats: {
      hp: 49.5,
      mp: 0,
      attack: 2.3,
      defense: 1.8,
      hit: 2.0,
      evasion: 2.0,
      magic: 2.0,
    },
    growth: {
      hp: 4.95,
      mp: 0,
      attack: 1.15,
      defense: 1.08,
      hit: 1.0,
      evasion: 1.0,
      magic: 0,
    },
    skills: [
      { level: 1, name: "アタック", type: "physical", ratio: 1.0 },
      {
        level: 30,
        name: "狂獣の牙",
        type: "physical_dot",
        ratio: 0.95,
        dotRatio: 0.35,
        dotHits: 2,
        dotIntervalSec: 0.1,
        delaySec: 20,
        note: "物理約0.95倍＋DoT（Lv・攻撃依存、魔法ダメ約0.35×2回・約0.1秒間隔）",
      },
      {
        level: 60,
        name: "狂獣の咆哮",
        type: "magic_area_debuff",
        ratio: 0.5,
        delaySec: 35,
        loyaltyMin: 50,
        note: "防御不可の対象中心範囲魔法（攻・魔での威力上昇なし）・テク不可・鈍足・回避ダウン",
      },
      {
        level: 80,
        name: "狂戦士の魂",
        type: "special_berserk",
        loyaltyMin: 50,
        /** ミーリム：単発物理の攻撃力係数（スタン中はチャージバー停止） */
        combatBerserkAttackScale: 2,
        /** ミーリム：ペット・敵チャージが進まない時間（ms） */
        combatBerserkFreezeMs: 2000,
        note: "詠唱中断あり・テク欄非表示。戦闘中パフォウィップで発動。30秒・攻撃7回・攻1.2倍必クリ・防御半減・アタック以外不可",
      },
      {
        level: 100,
        name: "狂獣の鞭打",
        type: "physical_area",
        ratio: 1.25,
        delaySec: 45,
        loyaltyMin: 75,
        note: "物理約1.25倍範囲・バフ1つ解除",
      },
      {
        level: 120,
        name: "狂獣の鉄槌",
        type: "physical",
        ratio: 2.0,
        delaySec: 65,
        note: "物理約2.0倍・追加でスタン風（再使用間隔にばらつき）",
      },
    ],
  },
  // https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%82%AB%E3%83%BC%E3%83%8B%E3%83%90%E3%83%AB%E8%B1%A1
  // 能力値 = 係数*Lv + 修正値（Wiki表）／耐火〜耐無は戦闘未使用のため省略
  carnival_elephant: {
    name: "カーニバル象",
    emoji: "🐘",
    usePreciseWikiStats: true,
    description:
      "もえガチャのアニマルケイジ。地上・中速・疑似騎乗。調教スキル非依存。草食物◎・飲み物・薬×。",
    baseStats: {
      hp: 45,
      mp: 0.5,
      attack: 0.6,
      defense: 0.6,
      hit: 0.5,
      evasion: 0.4,
      magic: 0.5,
    },
    growth: {
      hp: 5.4,
      mp: 0,
      attack: 1.25,
      defense: 1.44,
      hit: 1.0,
      evasion: 0.8,
      magic: 0,
    },
    skills: [
      { level: 1, name: "アタック", type: "physical", ratio: 1.0 },
      {
        level: 1,
        name: "疑似騎乗",
        type: "cosmetic_mount",
        note: "ペット上に座って表示。移動はペット操作のみ（Wiki・効果は未実装・表示用データ）",
      },
      {
        level: 40,
        name: "トランピング",
        type: "physical",
        ratio: 1.1,
        delaySec: 20,
        note: "近接物理約1.1倍＋行動不能デバフ（ACで時間軽減）",
      },
      {
        level: 60,
        name: "スプリンクル シャワー",
        type: "special",
        delaySec: 22,
        note: "範囲デバフ解除・象／飼い主／ペット中心・ディレイ20〜25秒相当",
      },
      {
        level: 80,
        name: "ブラインド サンド",
        type: "physical",
        ratio: 0.9,
        delaySec: 33,
        note: "小範囲物理約0.9倍＋命中低下（攻撃で効果量・ACで軽減）",
      },
      {
        level: 90,
        name: "タイムカプセルボックス",
        type: "special",
        loyaltyMin: 70,
        note: "リンゴ／バナナ・忠誠70以上・エリア制限（Wiki・未実装）",
      },
      {
        level: 100,
        name: "ノーズ ウィップ",
        type: "physical",
        ratio: 1.7,
        delaySec: 55,
        note: "近接物理約1.7倍＋追加ダメ・強ノックバック正面（落下ダメ表記）",
      },
    ],
  },
  // https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%81%AC%E3%81%84%E3%81%90%E3%82%8B%E3%81%BF%20%E3%81%82%E3%81%B3%E3%81%AB%E3%82%83%E3%82%93
  // 能力値 = (係数 * Lv) + 修正値（ミーリムは Wiki「通常」形態。巨大化は moePetWikiCoefficients の alternateForms）
  abinyan: {
    name: "ぬいぐるみ あびにゃん",
    emoji: "🐱",
    usePreciseWikiStats: true,
    description:
      "大きな黒猫のぬいぐるみから入手。巨大化・飛行モードあり。（ステは通常形態＝Wiki 通常表）",
    baseStats: {
      hp: 39,
      mp: 24,
      attack: 1.8,
      defense: 1.6,
      hit: 2.0,
      evasion: 2.2,
      magic: 1.6,
    },
    growth: {
      hp: 3.9,
      mp: 2.4,
      attack: 0.9,
      defense: 0.96,
      hit: 1.0,
      evasion: 1.1,
      magic: 0.8,
    },
    skills: [
      { level: 1, name: "アタック", type: "physical", ratio: 1.0 },
      {
        level: 30,
        name: "キャッツ ストレート",
        type: "physical",
        ratio: 1.3,
        delaySec: 25,
        note: "倍率1.3倍・ガードブレイク近接",
      },
      {
        level: 60,
        name: "キャッツ アイ",
        type: "magic_debuff",
        mpCost: 20,
        combatMagicRatio: 0.55,
        delaySec: 50,
        note: "移動不可・回避半減の範囲デバフ・効果10秒・詠唱妨害されない",
      },
      {
        level: 80,
        name: "キャッツ ロケット",
        type: "physical_area_narrow",
        ratio: 1.4,
        delaySec: 45,
        note: "極狭範囲近接物理・倍率約1.4倍",
      },
      {
        level: 100,
        name: "アビス ボール",
        type: "magic",
        mpCost: 35,
        combatMagicRatio: 1.0,
        delaySec: 65,
        note: "無属性弾道魔法・命中低下DeBuff15秒・詠唱妨害されない",
      },
    ],
  },
};

/** 太陽「16ビート コンボ」の戦闘用パラメータ（スキル定義と同期） */
/** Wiki 小数ステペットか（内部第2桁・UIは formatPetStatUi で第1桁） */
export function petUsesPreciseWikiStats(petId) {
  return MOE_PET_DATA[petId]?.usePreciseWikiStats === true;
}

/** 裏ステ・保存用（小数第2位まで） */
export function roundPetStatInternal(v) {
  return Math.round(Number(v) * 100) / 100;
}

/** UI 表示用（小数第1位固定） */
export function formatPetStatUi(v) {
  const n = Math.round(Number(v) * 10) / 10;
  return n.toFixed(1);
}

/**
 * Lv+1 あたりの係数増分（キャプション）
 * @returns {string | null}
 */
export function getPetWikiGrowthCaptionLine(petId) {
  const d = MOE_PET_DATA[petId];
  if (!d?.usePreciseWikiStats || !d.growth) return null;
  const g = d.growth;
  const parts = [];
  if (g.hp) parts.push(`HP+${formatPetStatUi(g.hp)}`);
  if (g.mp) parts.push(`MP+${formatPetStatUi(g.mp)}`);
  if (g.attack) parts.push(`攻+${formatPetStatUi(g.attack)}`);
  if (g.defense) parts.push(`防+${formatPetStatUi(g.defense)}`);
  if (g.hit != null && g.hit !== 0) parts.push(`命中+${formatPetStatUi(g.hit)}`);
  if (g.evasion != null && g.evasion !== 0) {
    parts.push(`回避+${formatPetStatUi(g.evasion)}`);
  }
  if (g.magic != null && g.magic !== 0) parts.push(`魔+${formatPetStatUi(g.magic)}`);
  return parts.length ? `Lv+1: ${parts.join("　")}` : null;
}

export function getSunSpirit16BeatComboParams() {
  const sk = MOE_PET_DATA.sun_spirit?.skills?.find(
    (s) => s.name === "16ビート コンボ"
  );
  return {
    stepMs: sk?.combatStepMs ?? 100,
    physicalRatio: sk?.physicalRatio ?? 0.5,
    magicRatio: sk?.magicRatio ?? 0.15,
    magicHits: sk?.magicHits ?? 7,
  };
}

export function calculatePetStats(petId, level) {
  const data = MOE_PET_DATA[petId];
  if (!data) return null;

  const L = Math.max(0, Number(level) || 0);
  const prec = data.usePreciseWikiStats === true;

  const atk = data.baseStats.attack + data.growth.attack * L;
  const def = data.baseStats.defense + data.growth.defense * L;
  const hit =
    data.baseStats.hit != null
      ? data.baseStats.hit + (data.growth.hit ?? 0) * L
      : atk;
  const evasion =
    data.baseStats.evasion != null
      ? data.baseStats.evasion + (data.growth.evasion ?? 0) * L
      : def * 0.4 + L * 0.15;
  const mag = data.baseStats.magic + data.growth.magic * L;

  const hpRaw = data.baseStats.hp + data.growth.hp * L;
  const mpRaw = data.baseStats.mp + data.growth.mp * L;

  if (prec) {
    return {
      hpMax: roundPetStatInternal(hpRaw),
      mpMax: roundPetStatInternal(Math.max(0, mpRaw)),
      attack: roundPetStatInternal(atk),
      defense: roundPetStatInternal(def),
      hit: roundPetStatInternal(hit),
      evasion: roundPetStatInternal(evasion),
      magic: roundPetStatInternal(mag),
    };
  }

  return {
    hpMax: Math.floor(hpRaw),
    mpMax: Math.max(0, Math.floor(mpRaw)),
    attack: atk,
    defense: def,
    hit,
    evasion,
    magic: mag,
  };
}
