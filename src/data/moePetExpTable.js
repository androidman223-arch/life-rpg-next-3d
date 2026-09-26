/**
 * ペット経験値表 Lv1〜150（-1Lvからの必要EXP・累積EXP）
 * 累積EXPは https://wikiwiki.jp/moe-pet/EXP表 の表を優先（訂正値・取り消し線の右側を採用）
 * expFromPrev は隣接累積の差分で算出
 */

import { petUsesPreciseWikiStats, roundPetStatInternal } from "./moePets.js";
import {
  moeEnsureTrainingGuideHpBonus,
  moeResolvePetTrainingBonus,
} from "../lib/moeTrainingGuideHouseBuff.js";

/** 各Lv到達時点の累積EXP（インデックス0 = Lv1） */
const WIKI_CUMULATIVE_EXP = [
  9, 21, 39, 76, 132, 212, 321, 465, 649, 879, 1159, 1492, 1885, 2342, 2870, 3473, 4155, 4922, 5778, 6733, 7788, 8943, 10209, 11589, 13090, 14715, 16469, 18358, 20387, 22561,
  24887, 27365, 29734, 32519, 35475, 38605, 41914, 45407, 49089, 52969, 57049, 61329, 65819, 70522, 75446, 80593, 85969, 91579, 97429, 103524, 109869, 117138, 124021, 131168, 138586, 146279, 154251, 162508, 171054, 179899,
  189044, 198489, 208245, 218315, 228706, 239421, 250465, 261844, 273563, 285628, 298043, 310811, 323939, 337431, 351294, 365532, 380149, 395151, 410542, 426332, 442522, 459112, 476113, 493528, 511364, 529624, 548313, 567437, 587001, 607011,
  627471, 648384, 669757, 691594, 713902, 736685, 759947, 783694, 807930, 832665, 857900, 883635, 909881, 936641, 963922, 991727, 1020061, 1048930, 1078339, 1108294, 1138799, 1169857, 1201475, 1233657, 1266410, 1299738, 1333645, 1368137, 1403218, 1438898,
  1475178, 1512058, 1549549, 1587654, 1626380, 1665730, 1705709, 1746323, 1787577, 1829477, 1872027, 1915230, 1959093, 2003620, 2048818, 2094691, 2141243, 2188480, 2236406, 2285031, 2334356, 2384381, 2435117, 2486567, 2538738, 2591633, 2645257, 2699616, 2754715, 2810560,
];

function buildExpTable() {
  const rows = [];
  for (let i = 0; i < WIKI_CUMULATIVE_EXP.length; i++) {
    const level = i + 1;
    const cumulativeExp = WIKI_CUMULATIVE_EXP[i];
    const expFromPrev = i === 0 ? null : cumulativeExp - WIKI_CUMULATIVE_EXP[i - 1];
    rows.push({ level, expFromPrev, cumulativeExp });
  }
  return rows;
}

export const MOE_PET_EXP_TABLE = buildExpTable();

export const MOE_PET_MAX_LEVEL = MOE_PET_EXP_TABLE.length;

/**
 * 攻撃1回・取得判定成功時の基礎EXP（装備・ラブペ等の倍率は未実装）
 * 列は「floor(ペットLv) − floor(敵Lv)」が -7〜+5
 * https://wikiwiki.jp/moe-pet/EXP表 「経験値の入手について」
 */
export const MOE_PET_EXP_GAIN_BY_DIFF = [10, 9, 8, 7, 6, 4, 3, 2, 1, 1, 1, 1, 1];

/** ペット攻撃時の経験値取得率（Wiki: 50〜60％前後 → 中央 0.55） */
export const MOE_PET_ATTACK_EXP_SUCCESS_RATE = 0.55;

export function getMoePetExpRow(level) {
  return MOE_PET_EXP_TABLE.find((r) => r.level === level);
}

/** Wiki 累積EXP：Lv.L の行の値（到達時点の累計） */
export function getMoePetCumulativeExpForLevel(level) {
  const row = getMoePetExpRow(level);
  return row?.cumulativeExp ?? 0;
}

/**
 * 累計EXP から現在レベル（Wiki 累積表：T >= cum(L) なら最低 Lv.L）
 */
export function getMoePetLevelFromTotalExp(totalExp) {
  const T = Math.max(0, Math.floor(Number(totalExp) || 0));
  let level = 1;
  for (let L = MOE_PET_MAX_LEVEL; L >= 1; L--) {
    const cum = MOE_PET_EXP_TABLE[L - 1].cumulativeExp;
    if (T >= cum) {
      level = L;
      break;
    }
  }
  return level;
}

/**
 * 累計EXP とレベルから「次Lvまで」のバー用進捗（Lv1 かつ T&lt;9 は特例）
 */
export function getMoePetExpIntoLevelFromTotal(totalExp, level) {
  const T = Math.max(0, Math.floor(Number(totalExp) || 0));
  const cumLv = MOE_PET_EXP_TABLE[level - 1].cumulativeExp;
  if (level === 1 && T < cumLv) return T;
  return Math.max(0, T - cumLv);
}

/**
 * 旧形式（level + expIntoLevel）から累計EXP を推定（未保存の totalExp 用）
 */
export function getMoePetTotalExpFromLegacyProgress(level, expIntoLevel) {
  const L = Math.min(MOE_PET_MAX_LEVEL, Math.max(1, Math.floor(Number(level) || 1)));
  const into = Math.max(0, Math.floor(Number(expIntoLevel) || 0));
  const firstCum = MOE_PET_EXP_TABLE[0].cumulativeExp;
  if (L <= 1 && into < firstCum) return into;
  return MOE_PET_EXP_TABLE[L - 1].cumulativeExp + into;
}

/** UI・戦闘共通：ペット state から累計EXP（totalExp 優先、なければ legacy 推定） */
export function resolvePetTotalExp(pet) {
  const legacy = getMoePetTotalExpFromLegacyProgress(
    pet?.level ?? 1,
    pet?.expIntoLevel ?? 0
  );
  const raw = pet?.totalExp;
  if (raw == null || !Number.isFinite(Number(raw))) {
    return legacy;
  }
  const total = Math.max(0, Math.floor(Number(raw)));
  // totalExp=0 だけ残り level/expIntoLevel が育成済みのときは Lv0 扱いで EXP 暴走しないよう救済
  if (total === 0 && legacy > 0) return legacy;
  return total;
}

/** 指定Lv・EXPバー0 に相当する累計EXP */
export function getMoePetFreshTotalExpForLevel(level) {
  return getMoePetTotalExpFromLegacyProgress(level, 0);
}

/** デバッグ Lv100 儀式の「Lv100.0 固定」だけ救済対象（本番育成 Lv101+ は除外） */
export function moePetIsStuckDebugLv100RitualExp(totalExp) {
  const T = Math.max(0, Math.floor(Number(totalExp) || 0));
  return T === getMoePetFreshTotalExpForLevel(100);
}

/** L → L+1 に上がるのに必要なEXP（Lv150 なら null） */
export function getMoePetExpToNextLevel(level) {
  if (level >= MOE_PET_MAX_LEVEL) return null;
  return getMoePetExpRow(level + 1)?.expFromPrev ?? null;
}

/** 次Lvまでの残りEXP（0 でレベルアップ）— 整数Lv用・互換 */
export function getMoePetExpRemainingToNextLevel(level, expIntoLevel) {
  const need = getMoePetExpToNextLevel(level);
  if (need == null) return null;
  return Math.max(0, need - Math.max(0, Math.floor(Number(expIntoLevel) || 0)));
}

/** 整数Lv帯内の 0.1 刻み1段に必要なEXP（Wiki expFromPrev ÷ 10、最低1） */
export function getMoePetExpPerTenth(level) {
  const need = getMoePetExpToNextLevel(level);
  if (need == null) return null;
  return Math.max(1, Math.floor(need / 10));
}

/** Lv1 未到達（累計 &lt; cum(Lv1)）か */
function isMoePetPreFirstLevelTotalExp(totalExp) {
  const T = Math.max(0, Math.floor(Number(totalExp) || 0));
  return T < MOE_PET_EXP_TABLE[0].cumulativeExp;
}

/** 現在の累計EXP が属する整数Lv帯の開始累計 */
function getMoePetExpBandStart(totalExp) {
  const T = Math.max(0, Math.floor(Number(totalExp) || 0));
  if (isMoePetPreFirstLevelTotalExp(T)) return 0;
  const integerLevel = getMoePetLevelFromTotalExp(T);
  return MOE_PET_EXP_TABLE[integerLevel - 1].cumulativeExp;
}

/** 累計EXP に応じた 0.1 段階の必要EXP */
function getMoePetExpPerTenthForTotal(totalExp) {
  const T = Math.max(0, Math.floor(Number(totalExp) || 0));
  if (T >= MOE_PET_EXP_TABLE[MOE_PET_MAX_LEVEL - 1].cumulativeExp) {
    return null;
  }
  if (isMoePetPreFirstLevelTotalExp(T)) {
    const cum1 = MOE_PET_EXP_TABLE[0].cumulativeExp;
    return Math.max(1, Math.floor(cum1 / 10));
  }
  return getMoePetExpPerTenth(getMoePetLevelFromTotalExp(T));
}

/**
 * 累計EXP から MOE 表示用 0.1 刻みレベル（Lv59.3 等）
 * @returns {{
 *   integerLevel: number,
 *   tenth: number,
 *   displayLabel: string,
 *   expIntoTenth: number,
 *   expPerTenth: number | null,
 * }}
 */
export function getMoePetFractionalLevelFromTotalExp(totalExp) {
  const T = Math.max(0, Math.floor(Number(totalExp) || 0));
  if (T >= MOE_PET_EXP_TABLE[MOE_PET_MAX_LEVEL - 1].cumulativeExp) {
    return {
      integerLevel: MOE_PET_MAX_LEVEL,
      tenth: 0,
      displayLabel: `${MOE_PET_MAX_LEVEL}.0`,
      expIntoTenth: 0,
      expPerTenth: null,
    };
  }

  const expPerTenth = getMoePetExpPerTenthForTotal(T);
  const bandStart = getMoePetExpBandStart(T);
  const intoBand = T - bandStart;
  const tenth = Math.min(9, Math.floor(intoBand / expPerTenth));
  const expIntoTenth = intoBand - tenth * expPerTenth;

  if (isMoePetPreFirstLevelTotalExp(T)) {
    return {
      integerLevel: 0,
      tenth,
      displayLabel: `0.${tenth}`,
      expIntoTenth,
      expPerTenth,
    };
  }

  const integerLevel = getMoePetLevelFromTotalExp(T);
  return {
    integerLevel,
    tenth,
    displayLabel: `${integerLevel}.${tenth}`,
    expIntoTenth,
    expPerTenth,
  };
}

/** UI 用: 次の 0.1 までの残りEXP */
export function getMoePetExpRemainingToNextTenth(totalExp) {
  const frac = getMoePetFractionalLevelFromTotalExp(totalExp);
  if (frac.expPerTenth == null) return null;
  return Math.max(0, frac.expPerTenth - frac.expIntoTenth);
}

/** UI 用: 0.1 段階バー進捗 0〜100 */
export function getMoePetExpTenthBarPct(totalExp) {
  const frac = getMoePetFractionalLevelFromTotalExp(totalExp);
  if (frac.expPerTenth == null || frac.expPerTenth <= 0) return 100;
  return Math.min(
    100,
    Math.floor((frac.expIntoTenth / frac.expPerTenth) * 100)
  );
}

/**
 * floor(ペットLv) − floor(敵Lv) を -7〜+5 にクランプし、テーブル参照
 * 小数Lvは一の位切り捨て（Wiki）
 */
export function getMoePetExpBaseOnHitSuccess(petLevel, enemyLevel) {
  const petInt = Math.floor(Number(petLevel));
  const enemyInt = Math.floor(Number(enemyLevel));
  const diff = petInt - enemyInt;
  const idx = Math.max(0, Math.min(12, diff + 7));
  return MOE_PET_EXP_GAIN_BY_DIFF[idx];
}

/**
 * Next（次0.1まで）が 0 になった回数＝0.1 レベルアップ回数
 * 獲得EXP が残り Next 未満なら 0（演出なし）
 */
export function countMoePetTenthLevelUps(totalBefore, totalAfter) {
  let before = Math.max(0, Math.floor(Number(totalBefore) || 0));
  const after = Math.max(0, Math.floor(Number(totalAfter) || 0));
  if (after <= before) return 0;

  let count = 0;
  while (before < after) {
    const rem = getMoePetExpRemainingToNextTenth(before);
    if (rem == null || rem <= 0) break;
    const gainLeft = after - before;
    if (gainLeft < rem) break;
    count += 1;
    before += rem;
  }
  return count;
}

/** 0.1 刻みレベルアップのポップ表示文言 */
export const MOE_PET_TENTH_LEVEL_UP_LABEL = "LEVEL 0.1UP";

/** @param {number} count */
export function formatMoePetTenthLevelBanner(count = 1) {
  if (count <= 1) return MOE_PET_TENTH_LEVEL_UP_LABEL;
  return `${MOE_PET_TENTH_LEVEL_UP_LABEL} ×${count}`;
}

/** @param {string} msg */
export function isMoePetTenthLevelUpMessage(msg) {
  return (
    msg === MOE_PET_TENTH_LEVEL_UP_LABEL ||
    msg.startsWith(`${MOE_PET_TENTH_LEVEL_UP_LABEL} ×`)
  );
}

/**
 * 0.1 刻みレベルアップメッセージ
 * @returns {string[]}
 */
function buildMoePetTenthLevelMessages(totalBefore, totalAfter) {
  const n = countMoePetTenthLevelUps(totalBefore, totalAfter);
  return Array.from({ length: n }, () => MOE_PET_TENTH_LEVEL_UP_LABEL);
}

/**
 * ペットにEXP加算・レベルアップ処理（累計EXP = Wiki 累積表・0.1 刻み表示）
 * @returns {{ pet: object, gained: number, leveled: boolean, tenthLeveled: boolean, messages: string[] }}
 */
export function applyMoePetExpGain(pet, amount, calculateStats) {
  const messages = [];
  if (amount <= 0) {
    return {
      pet,
      gained: 0,
      leveled: false,
      tenthLeveled: false,
      messages,
    };
  }

  const totalBefore = resolvePetTotalExp(pet);

  const levelBefore = getMoePetLevelFromTotalExp(totalBefore);
  if (levelBefore >= MOE_PET_MAX_LEVEL) {
    return {
      pet,
      gained: 0,
      leveled: false,
      tenthLeveled: false,
      messages,
    };
  }

  const total = totalBefore + amount;
  const levelAfter = getMoePetLevelFromTotalExp(total);
  const leveled = levelAfter > levelBefore;
  const tenthMessages = buildMoePetTenthLevelMessages(totalBefore, total);
  const tenthLeveled = tenthMessages.length > 0;

  if (tenthLeveled) {
    messages.push(...tenthMessages);
  }
  if (leveled) {
    for (let L = levelBefore + 1; L <= levelAfter; L++) {
      messages.push(`ペット Lv.${L} に上がった！`);
    }
  }

  const expIntoLevel = getMoePetExpIntoLevelFromTotal(total, levelAfter);
  const stats = calculateStats(pet.id, levelAfter);
  const prec = petUsesPreciseWikiStats(pet.id);
  const trainingBonus = moeResolvePetTrainingBonus(pet);
  const phoenixBonus = pet.phoenixHpBonus ?? 0;
  const wikiHpMax =
    stats?.hpMax ??
    Math.max(1, (pet.hpMax ?? 1) - trainingBonus - phoenixBonus);
  let hpMax = wikiHpMax + phoenixBonus + trainingBonus;
  if (!leveled) {
    hpMax = Math.max(hpMax, pet.hpMax ?? hpMax);
  }
  let nextHp = leveled ? hpMax : Math.min(pet.hp, hpMax);
  let nextMp = leveled
    ? stats?.mpMax ?? pet.mpMax
    : Math.min(pet.mp, stats?.mpMax ?? pet.mpMax);
  if (prec) {
    nextHp = roundPetStatInternal(nextHp);
    nextMp = roundPetStatInternal(nextMp);
  }
  let nextPet = {
    ...pet,
    totalExp: total,
    level: levelAfter,
    levelDisplay: getMoePetFractionalLevelFromTotalExp(total).displayLabel,
    expIntoLevel,
    hpMax,
    mpMax: stats?.mpMax ?? pet.mpMax,
    hp: nextHp,
    mp: nextMp,
    trainingGuideHpBonus: trainingBonus || pet.trainingGuideHpBonus,
  };
  nextPet = moeEnsureTrainingGuideHpBonus(nextPet);
  if (!leveled) {
    nextPet.hp = Math.min(nextPet.hpMax, pet.hp);
    if (prec) nextPet.hp = roundPetStatInternal(nextPet.hp);
  }

  return {
    pet: nextPet,
    gained: amount,
    leveled,
    tenthLeveled,
    messages,
  };
}

/** 0.1 刻みレベルダウンのポップ表示文言 */
export const MOE_PET_TENTH_LEVEL_DOWN_LABEL = "LEVEL 0.1DOWN";

/** @param {number} count */
export function formatMoePetTenthLevelDownBanner(count = 1) {
  if (count <= 1) return MOE_PET_TENTH_LEVEL_DOWN_LABEL;
  return `${MOE_PET_TENTH_LEVEL_DOWN_LABEL} ×${count}`;
}

/** @param {string} msg */
export function isMoePetTenthLevelDownMessage(msg) {
  return (
    msg === MOE_PET_TENTH_LEVEL_DOWN_LABEL ||
    msg.startsWith(`${MOE_PET_TENTH_LEVEL_DOWN_LABEL} ×`)
  );
}

/**
 * @param {number} totalBefore
 * @param {number} totalAfter
 */
function buildMoePetTenthLevelDownMessages(totalBefore, totalAfter) {
  const n = countMoePetTenthLevelUps(totalAfter, totalBefore);
  return Array.from({ length: n }, () => MOE_PET_TENTH_LEVEL_DOWN_LABEL);
}

/**
 * ペットからEXP減算・レベルダウン（累計EXP下限 = Lv10.0 相当）
 * @returns {{ pet: object, lost: number, leveledDown: boolean, tenthLeveledDown: boolean, messages: string[] }}
 */
export function applyMoePetExpLoss(pet, amount, calculateStats, minLevel = 10) {
  const messages = [];
  if (amount <= 0) {
    return {
      pet,
      lost: 0,
      leveledDown: false,
      tenthLeveledDown: false,
      messages,
    };
  }

  const totalBefore = resolvePetTotalExp(pet);
  const minTotal = getMoePetFreshTotalExpForLevel(minLevel);
  if (totalBefore <= minTotal) {
    return {
      pet,
      lost: 0,
      leveledDown: false,
      tenthLeveledDown: false,
      messages,
    };
  }

  const total = Math.max(minTotal, totalBefore - amount);
  const lost = totalBefore - total;
  if (lost <= 0) {
    return {
      pet,
      lost: 0,
      leveledDown: false,
      tenthLeveledDown: false,
      messages,
    };
  }

  const levelBefore = getMoePetLevelFromTotalExp(totalBefore);
  const levelAfter = getMoePetLevelFromTotalExp(total);
  const leveledDown = levelAfter < levelBefore;
  const tenthMessages = buildMoePetTenthLevelDownMessages(totalBefore, total);
  const tenthLeveledDown = tenthMessages.length > 0;

  if (tenthLeveledDown) {
    messages.push(...tenthMessages);
  }
  if (leveledDown) {
    for (let L = levelBefore; L > levelAfter; L--) {
      messages.push(`ペット Lv.${L} から下がった……`);
    }
  }

  const expIntoLevel = getMoePetExpIntoLevelFromTotal(total, levelAfter);
  const stats = calculateStats(pet.id, levelAfter);
  const prec = petUsesPreciseWikiStats(pet.id);
  const trainingBonus = moeResolvePetTrainingBonus(pet);
  const phoenixBonus = pet.phoenixHpBonus ?? 0;
  const wikiHpMax =
    stats?.hpMax ??
    Math.max(1, (pet.hpMax ?? 1) - trainingBonus - phoenixBonus);
  const hpMax = wikiHpMax + phoenixBonus + trainingBonus;
  let nextHp =
    leveledDown || tenthLeveledDown
      ? Math.min(pet.hp, hpMax)
      : pet.hp;
  let nextMp =
    leveledDown || tenthLeveledDown
      ? Math.min(pet.mp, stats?.mpMax ?? pet.mpMax)
      : pet.mp;
  if (prec) {
    nextHp = roundPetStatInternal(nextHp);
    nextMp = roundPetStatInternal(nextMp);
  }
  let nextPet = {
    ...pet,
    totalExp: total,
    level: levelAfter,
    levelDisplay: getMoePetFractionalLevelFromTotalExp(total).displayLabel,
    expIntoLevel,
    hpMax,
    mpMax: stats?.mpMax ?? pet.mpMax,
    hp: nextHp,
    mp: nextMp,
    trainingGuideHpBonus: trainingBonus || pet.trainingGuideHpBonus,
  };
  nextPet = moeEnsureTrainingGuideHpBonus(nextPet);
  if (!leveledDown && !tenthLeveledDown) {
    nextPet.hp = Math.min(nextPet.hpMax, pet.hp);
    if (prec) nextPet.hp = roundPetStatInternal(nextPet.hp);
  }

  return {
    pet: nextPet,
    lost,
    leveledDown,
    tenthLeveledDown,
    messages,
  };
}
