/**
 * 経験値おすそわけ — NPCヨーゼフ（Wiki参考・本家はヌブールの村）
 * 出典: https://moewiki.usamimi.info/index.php?%A5%DA%A5%C3%A5%C8
 */

import {
  getMoePetCumulativeExpForLevel,
  getMoePetFractionalLevelFromTotalExp,
  getMoePetFreshTotalExpForLevel,
  getMoePetLevelFromTotalExp,
  getMoePetTotalExpFromLegacyProgress,
  countMoePetTenthLevelUps,
} from "./moePetExpTable";
import { MOE_PET_DATA } from "./moePets";
import { MOE_SAVED_PET_INITIAL_LEVEL } from "@/lib/moePetSave";

/** @typedef {{ speaker: string, text: string }} MoeJosephDialogueLine */

export const MOE_JOSEPH_NPC = {
  id: "joseph_exp",
  name: "ヨーゼフ（経験値の匠）",
  emoji: "🔮",
  shopLabel: "エクスペリエンスクリスタル",
  villageNote: "本家：ヌブールの村",
};

/** ペット小屋：クリスタル作成ボタン */
export const MOE_JOSEPH_EXP_CRYSTAL_BUTTON = {
  label: "時の秘薬（クリスタルを作る）",
  emoji: "🔮",
};

/** 会話（カタログ前）— 経験値おすそわけ専用 */
export const MOE_JOSEPH_EXP_CRYSTAL_LINES = [
  {
    speaker: "master",
    text: "……おや、客か。ワシはヨーゼフ。高レベルペットの経験値を、別の子に回す技を預かっておる。",
  },
  {
    speaker: "master",
    text: "本家はヌブールの村じゃが……ここでも、作法だけは教えてやろう。Lv100.0以上のペットが要る。",
  },
  {
    speaker: "master",
    text: "アイテム化には、『時の秘薬』と Lv100.0以上のペットが入った『アニマル ケイジ』を、『時の釜』に入れる。",
  },
  {
    speaker: "master",
    text: "成功率を上げたいなら『時のタブレット』も一緒に釜へ。モラの秘術で、ペットの経験値を結晶化するんじゃ。",
  },
  {
    speaker: "master",
    text: "ワシに渡せば『エクスペリエンスクリスタル』がもらえる。結果は失敗／成功／大成功／ミラクル、の四段階じゃ。",
  },
  {
    speaker: "master",
    text: "……渡したペットとアニマル ケイジは、戻ってこん。覚悟ができた者だけ来い。",
  },
  {
    speaker: "master",
    text: "得たクリスタルは、別のペットに合成して経験値をおすそわけできる。Lv100を育てた者の、次の一手じゃな。",
  },
  {
    speaker: "master",
    text: "……ここではお試しができる。ペットのLvを選び、一覧からクリスタルを作ってみるがよい。",
  },
];

/** 結晶化儀式：本家風メッセージ */
export const MOE_JOSEPH_RITUAL_WAIT_MESSAGE = {
  speaker: "master",
  text: "よし、ちょっと待っておれ。",
};

export const MOE_JOSEPH_RITUAL_PROCESS_MESSAGE = {
  speaker: "master",
  text: "モラの秘術により、ペットが得た経験値を結晶化中・・・",
};

/** お試し：アイテム化するペットのLv（Wiki累積EXP表ベース） */
export const MOE_JOSEPH_TRIAL_PET_LEVELS = [100, 110, 120, 130, 140, 150];

/** アイテム化結果（本家Wiki：材料ペット累積EXPの分数 · 出率 1/10,5/10,3/10,1/10） */
export const MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS = [
  {
    id: "tier_fail",
    label: "失敗",
    emoji: "💨",
    expRatio: 1 / 16,
    expFraction: "1/16",
    weight: 1,
    josephLine: "くっ…。ほとんどの経験を結晶化することができなかった…。",
  },
  {
    id: "tier_ok",
    label: "成功",
    emoji: "✨",
    expRatio: 1 / 8,
    expFraction: "1/8",
    weight: 5,
    josephLine: "ふむ。なんとか経験を結晶化することができた。",
  },
  {
    id: "tier_great",
    label: "大成功",
    emoji: "🌟",
    expRatio: 1 / 4,
    expFraction: "1/4",
    weight: 3,
    josephLine: "うまくいったようじゃ。十分な経験を結晶化することができたぞい。",
  },
  {
    id: "tier_miracle",
    label: "ミラクル",
    emoji: "💎",
    expRatio: 1 / 3,
    expFraction: "1/3",
    weight: 1,
    josephLine: "完璧じゃ。かなりの経験を結晶化することができたぞい。",
  },
];

/** @param {typeof MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS[number]} tier */
export function formatJosephTierExpFraction(tier) {
  return tier.expFraction ?? `${Math.round(tier.expRatio * 1000) / 10}%`;
}

/** 時のタブレット：本家想定 — 失敗が出なくなる */
export function getJosephTierRollWeight(tier, useTimeTablet = false) {
  if (useTimeTablet && tier.id === "tier_fail") return 0;
  return tier.weight;
}

/**
 * 4段階すべての出率（本家想定・お試し参考）
 * @param {boolean} [useTimeTablet]
 */
export function getJosephFullTierPercents(useTimeTablet = false) {
  const weighted = MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS.map((tier) => ({
    tier,
    w: getJosephTierRollWeight(tier, useTimeTablet),
  }));
  const total = weighted.reduce((s, row) => s + row.w, 0);
  return weighted.map(({ tier, w }) => ({
    id: tier.id,
    label: tier.label,
    pct: total > 0 ? Math.round((w / total) * 1000) / 10 : 0,
  }));
}

/** @param {ReturnType<typeof getJosephFullTierPercents>} rows */
function formatJosephTierPercentLines(rows) {
  const fmt = (n) => Math.round(n);
  return rows.map((r) => `${r.label} ${fmt(r.pct)}%`);
}

/** UI用：4段階の出率一覧（タブレットなし） */
export function formatJosephFullTierProbabilityNote() {
  const base = getJosephFullTierPercents(false);
  return [
    "本家想定の出率（お試し抽選は成功/大成功のみ）",
    "封じ込め量＝材料ペット累積EXP × 分数",
    ...formatJosephTierPercentLines(base),
  ].join("\n");
}

/** UI用：時のタブレットで変わる出率（4段階・1行ずつ） */
export function formatJosephTimeTabletProbabilityNote() {
  const base = getJosephFullTierPercents(false);
  const boosted = getJosephFullTierPercents(true);
  const fmt = (n) => Math.round(n);
  const deltaLines = base.map((b) => {
    const a = boosted.find((r) => r.id === b.id);
    if (!a || fmt(b.pct) === fmt(a.pct)) return `${b.label} ${fmt(b.pct)}%`;
    return `${b.label} ${fmt(b.pct)}% → ${fmt(a.pct)}%`;
  });
  return [
    "タブレットを入れたとき（本家想定）",
    ...deltaLines,
  ].join("\n");
}

/** @param {boolean} [useTimeTablet] — お試し抽選（成功/大成功のみ）用 */
export function getJosephTrialTierPercents(useTimeTablet = false) {
  const rows = getJosephFullTierPercents(useTimeTablet).filter(
    (r) => r.id === "tier_ok" || r.id === "tier_great"
  );
  const total = rows.reduce((s, r) => s + r.pct, 0);
  const norm = (pct) => Math.round((pct / total) * 1000) / 10;
  return {
    ok: norm(rows.find((r) => r.id === "tier_ok")?.pct ?? 0),
    great: norm(rows.find((r) => r.id === "tier_great")?.pct ?? 0),
  };
}

/** カタログ：時のタブレット（確率アップ・お試し） */
export const MOE_JOSEPH_TIME_TABLET_OPTION = {
  id: "time_tablet",
  label: "時のタブレットを釜に入れる",
  detail: "チェックで下記の確率に変わる（お試し）",
  probabilityNote: formatJosephTimeTabletProbabilityNote(),
};

/** カタログ先頭：結晶化開始 */
export const MOE_JOSEPH_CATALOG_ACTIONS = [
  {
    id: "start_crystal",
    label: "エクスペリエンスクリスタルを作る",
    detail: "Lv100以上のペットを選んで釜へ · 成功／大成功のみ（お試し）",
    badge: "お試し",
  },
  {
    id: "restore_trial",
    label: "お試しを解除（元のLvに戻す）",
    detail: "クリスタル化した表示も解除 · リロードでも自動で戻ります",
  },
];

/**
 * お試し用：ペットLv時点の累積EXP（Lv100.0 = ちょうどそのLv到達）
 * @param {number} level
 */
export function getJosephTrialPetTotalExp(level) {
  return getMoePetCumulativeExpForLevel(level);
}

/**
 * @param {typeof MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS[number]} tier
 * @param {number} petLevel
 */
export function calcJosephCrystalExpAmount(tier, petLevel) {
  const total = getJosephTrialPetTotalExp(petLevel);
  return Math.floor(total * tier.expRatio);
}

/**
 * お試し用：成功／大成功のみ（経験値は付与しない・表示確認用）
 * @param {{ useTimeTablet?: boolean }} [opts]
 */
export function rollJosephExpCrystalTrialTier(opts = {}) {
  const { useTimeTablet = false } = opts;
  const trialTiers = MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS.filter(
    (t) => t.id === "tier_ok" || t.id === "tier_great"
  );
  const weighted = trialTiers.map((tier) => ({
    tier,
    w: getJosephTierRollWeight(tier, useTimeTablet),
  }));
  const total = weighted.reduce((s, row) => s + row.w, 0);
  let r = Math.random() * total;
  for (const row of weighted) {
    r -= row.w;
    if (r <= 0) return row.tier;
  }
  return weighted[weighted.length - 1].tier;
}

/** @param {typeof MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS[number]} tier */
export function getJosephCrystalResultHeadline(tier) {
  if (tier.id === "tier_fail") return "失敗……";
  if (tier.id === "tier_ok") return "成功！";
  if (tier.id === "tier_great") return "大成功！！";
  return "ミラクル！！！";
}

/** 釜に渡せる最低Lv（本家：Lv100.0以上） */
export const MOE_JOSEPH_SACRIFICE_MIN_LEVEL = 100;

export function formatJosephSacrificePickPrompt() {
  return "どのペットを渡すのじゃ？\n\nLv100.0以上の子をアニマル ケイジに入れるんじゃ。結果を見てから「決定する」まで、一覧からは消えない（お試し）。";
}

/** @param {string} petId @param {Record<string, { totalExp?: number }>} [byId] */
export function getJosephPetSlotTotalExp(petId, byId) {
  const slot = byId?.[petId];
  if (slot?.totalExp != null) {
    return Math.max(0, Math.floor(Number(slot.totalExp) || 0));
  }
  return getMoePetFreshTotalExpForLevel(MOE_SAVED_PET_INITIAL_LEVEL);
}

/**
 * @param {Record<string, { totalExp?: number }>} [byId]
 * @param {string[]} [crystallizedIds]
 */
export function buildJosephSacrificePetMenuActions(byId, crystallizedIds = []) {
  const hidden = new Set(crystallizedIds);
  return Object.keys(MOE_PET_DATA)
    .filter((id) => !hidden.has(id))
    .map((id) => {
      const data = MOE_PET_DATA[id];
      const totalExp = getJosephPetSlotTotalExp(id, byId);
      const frac = getMoePetFractionalLevelFromTotalExp(totalExp);
      const eligible =
        getMoePetLevelFromTotalExp(totalExp) >= MOE_JOSEPH_SACRIFICE_MIN_LEVEL;
      let label = `${data.emoji} ${data.name} · Lv.${frac.displayLabel}`;
      if (!eligible) label += "（Lv100未満）";
      return { id, label, disabled: !eligible };
    });
}

/**
 * @param {typeof MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS[number]} tier
 * @param {ReturnType<typeof createJosephExpCrystal>} crystal
 * @param {{ useTimeTablet?: boolean, sacrificePetName?: string }} [opts]
 */
export function formatJosephCrystalResultMessage(tier, crystal, opts = {}) {
  const tabletNote = opts.useTimeTablet ? "\n（時のタブレット使用）" : "";
  const lvLabel = crystal.sourceLevelLabel ?? String(crystal.sourceLevel);
  const sacrificeNote = opts.sacrificePetName
    ? `\n\n${opts.sacrificePetName}を釜に渡した結果じゃ。\n「決定する」まで一覧には残る · 決定後は消える（リロードで戻る）`
    : "";
  const lvLine = opts.sacrificePetName
    ? `Lv.${lvLabel}（累積 ${crystal.sourceTotalExp.toLocaleString()} EXP）`
    : `Lv.${lvLabel}想定（累積 ${crystal.sourceTotalExp.toLocaleString()} EXP）`;
  return `${getJosephCrystalResultHeadline(tier)}${tabletNote}\n\n${tier.josephLine}\n\n※ お試し · 保存データは変わりません\n\n${lvLine}\n${tier.emoji} エクスペリエンスクリスタル\n封じ込めEXP: ${crystal.expAmount.toLocaleString()}（材料の ${formatJosephTierExpFraction(tier)}）${sacrificeNote}`;
}

/**
 * @param {typeof MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS[number]} tier
 * @param {number} petLevel
 */
export function createJosephExpCrystal(tier, petLevel) {
  const sourceTotalExp = getJosephTrialPetTotalExp(petLevel);
  const expAmount = calcJosephCrystalExpAmount(tier, petLevel);
  return {
    id: `exp_crystal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: "エクスペリエンスクリスタル",
    tierId: tier.id,
    tierLabel: tier.label,
    tierEmoji: tier.emoji,
    sourceLevel: petLevel,
    sourceLevelLabel: `${petLevel}.0`,
    sourceTotalExp,
    expAmount,
    acquiredAt: Date.now(),
  };
}

/**
 * @param {typeof MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS[number]} tier
 * @param {{ totalExp?: number, level?: number, expIntoLevel?: number }} pet
 */
export function createJosephExpCrystalFromPet(tier, pet) {
  const sourceTotalExp =
    pet.totalExp != null
      ? Math.max(0, Math.floor(Number(pet.totalExp) || 0))
      : getMoePetTotalExpFromLegacyProgress(
          pet.level ?? 1,
          pet.expIntoLevel ?? 0
        );
  const frac = getMoePetFractionalLevelFromTotalExp(sourceTotalExp);
  const expAmount = Math.floor(sourceTotalExp * tier.expRatio);
  return {
    id: `exp_crystal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: "エクスペリエンスクリスタル",
    tierId: tier.id,
    tierLabel: tier.label,
    tierEmoji: tier.emoji,
    sourceLevel: frac.integerLevel,
    sourceLevelLabel: frac.displayLabel,
    sourceTotalExp,
    expAmount,
    acquiredAt: Date.now(),
  };
}

/**
 * クリスタル合成のレベルアップ予想（お試し）
 * @param {{ totalExp?: number, level?: number, expIntoLevel?: number }} pet
 * @param {ReturnType<typeof createJosephExpCrystal>} crystal
 */
export function getJosephCrystalUsePreview(pet, crystal) {
  const totalBefore =
    pet.totalExp != null
      ? Math.max(0, Math.floor(Number(pet.totalExp) || 0))
      : getMoePetTotalExpFromLegacyProgress(
          pet.level ?? 1,
          pet.expIntoLevel ?? 0
        );
  const totalAfter = totalBefore + crystal.expAmount;
  const before = getMoePetFractionalLevelFromTotalExp(totalBefore);
  const after = getMoePetFractionalLevelFromTotalExp(totalAfter);
  const intBefore = getMoePetLevelFromTotalExp(totalBefore);
  const intAfter = getMoePetLevelFromTotalExp(totalAfter);
  const tenthUps = countMoePetTenthLevelUps(totalBefore, totalAfter);
  return {
    totalBefore,
    totalAfter,
    levelBeforeLabel: before.displayLabel,
    levelAfterLabel: after.displayLabel,
    integerLevelsGained: Math.max(0, intAfter - intBefore),
    tenthLevelUps: tenthUps,
    expAmount: crystal.expAmount,
  };
}

/**
 * @param {string} petName
 * @param {ReturnType<typeof getJosephCrystalUsePreview>} preview
 */
export function formatJosephCrystalUseConfirmPrompt(petName, preview) {
  if (!preview) {
    return `エクスペリエンスクリスタルを\n${petName}に使いますか？`;
  }
  const intNote =
    preview.integerLevelsGained > 0
      ? `\n（整数レベル +${preview.integerLevelsGained}）`
      : "";
  const tenthNote =
    preview.tenthLevelUps > 0
      ? `\n（0.1 アップ ×${preview.tenthLevelUps} 回）`
      : "";
  return `エクスペリエンスクリスタルを\n${petName}に使いますか？\n\n現在 Lv.${preview.levelBeforeLabel}\n↓ +${preview.expAmount.toLocaleString()} EXP\n予想 Lv.${preview.levelAfterLabel}${intNote}${tenthNote}\n\n※ お試し · 「お試しを解除」で元のLvに戻せます`;
}

/**
 * @param {string} petName
 * @param {ReturnType<typeof getJosephCrystalUsePreview>} previewBefore
 * @param {ReturnType<typeof getJosephCrystalUsePreview>} previewAfter
 */
export function formatJosephCrystalUseAppliedMessage(
  petName,
  previewBefore,
  previewAfter
) {
  if (!previewBefore || !previewAfter) {
    return `${petName}にクリスタルを合成した（お試し）`;
  }
  return `${petName}にクリスタルを合成した！\n\nLv.${previewBefore.levelBeforeLabel}\n　↓\nLv.${previewAfter.levelAfterLabel}\n\n+${previewBefore.expAmount.toLocaleString()} EXP（お試し）\n\n※ 本番データは変わりません。「お試しを解除」かリロードで元に戻ります`;
}

/** @param {string} tierId */
export function getJosephExpCrystalTierById(tierId) {
  return MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS.find((t) => t.id === tierId) ?? null;
}

/** カタログ：手順・注意（本家：時の釜） */
export const MOE_JOSEPH_EXP_CRYSTAL_STEPS = [
  {
    id: "req_cauldron",
    name: "時の釜",
    multiplier: "必須",
    detail: "秘薬・ペット・タブレットを入れて結晶化する",
    badge: "本家",
  },
  {
    id: "req_cage",
    name: "アニマル ケイジ",
    multiplier: "必須",
    detail: "Lv100.0 以上のペットが入っていること",
  },
  {
    id: "req_potion",
    name: "時の秘薬",
    multiplier: "必須",
    detail: "アイテム化の触媒。釜に一緒に入れる",
  },
  {
    id: "req_tablet",
    name: "時のタブレット",
    multiplier: "任意",
    detail: `任意 · チェックで確率変化\n${formatJosephTimeTabletProbabilityNote()}`,
  },
  {
    id: "out_crystal",
    name: "エクスペリエンスクリスタル",
    multiplier: "入手",
    detail: "ペットの経験値を封じた結晶。量は下表の4段階",
  },
  {
    id: "syn_target",
    name: "合成先ペット",
    multiplier: "別体",
    detail: "クリスタルを渡して経験値を合成（おすそわけ）",
  },
];

/** カタログ：アイテム化の結果段階（出率＋封じ込め率） */
function buildJosephExpCrystalTierCatalog() {
  const base = getJosephFullTierPercents(false);
  const boosted = getJosephFullTierPercents(true);
  const fmt = (n) => Math.round(n);
  return MOE_JOSEPH_EXP_CRYSTAL_TIER_DEFS.map((tier) => {
    const b = base.find((r) => r.id === tier.id);
    const a = boosted.find((r) => r.id === tier.id);
    const tabletNote =
      b && a && fmt(b.pct) !== fmt(a.pct)
        ? ` · タブレット時 ${fmt(a.pct)}%`
        : "";
    return {
      id: tier.id,
      name: tier.label,
      multiplier: `${fmt(b?.pct ?? 0)}%`,
      detail: `材料EXPの ${formatJosephTierExpFraction(tier)}${tabletNote}`,
    };
  });
}

export const MOE_JOSEPH_EXP_CRYSTAL_TIERS = buildJosephExpCrystalTierCatalog();
