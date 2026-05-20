/**
 * ペット経験値表 Lv1〜150（-1Lvからの必要EXP・累積EXP）
 * 累積EXPは https://wikiwiki.jp/moe-pet/EXP表 の表を優先（訂正値・取り消し線の右側を採用）
 * expFromPrev は隣接累積の差分で算出
 */

import { petUsesPreciseWikiStats, roundPetStatInternal } from "./moePets";

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

/** @deprecated 互換: Lv1〜30 のみ */
export const MOE_PET_EXP_LV1_TO_30 = MOE_PET_EXP_TABLE.filter((r) => r.level <= 30);

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

/** 指定Lv・EXPバー0 に相当する累計EXP */
export function getMoePetFreshTotalExpForLevel(level) {
  return getMoePetTotalExpFromLegacyProgress(level, 0);
}

/** L → L+1 に上がるのに必要なEXP（Lv150 なら null） */
export function getMoePetExpToNextLevel(level) {
  if (level >= MOE_PET_MAX_LEVEL) return null;
  return getMoePetExpRow(level + 1)?.expFromPrev ?? null;
}

/**
 * floor(ペットLv) − floor(敵Lv) を -7〜+5 にクランプし、テーブル参照
 */
export function getMoePetExpBaseOnHitSuccess(petLevel, enemyLevel) {
  const diff = Math.floor(Number(petLevel)) - Math.floor(Number(enemyLevel));
  const idx = Math.max(0, Math.min(12, diff + 7));
  return MOE_PET_EXP_GAIN_BY_DIFF[idx];
}

/**
 * ペットにEXP加算・レベルアップ処理（累計EXP = Wiki 累積表に準拠）
 * @returns {{ pet: object, gained: number, leveled: boolean, messages: string[] }}
 */
export function applyMoePetExpGain(pet, amount, calculateStats) {
  const messages = [];
  if (amount <= 0) {
    return { pet, gained: 0, leveled: false, messages };
  }

  const totalBefore =
    pet.totalExp != null
      ? Math.max(0, Math.floor(Number(pet.totalExp) || 0))
      : getMoePetTotalExpFromLegacyProgress(pet.level, pet.expIntoLevel);

  const levelBefore = getMoePetLevelFromTotalExp(totalBefore);
  if (levelBefore >= MOE_PET_MAX_LEVEL) {
    return { pet, gained: 0, leveled: false, messages };
  }

  const total = totalBefore + amount;
  const levelAfter = getMoePetLevelFromTotalExp(total);
  const leveled = levelAfter > levelBefore;

  if (leveled) {
    for (let L = levelBefore + 1; L <= levelAfter; L++) {
      messages.push(`ペット Lv.${L} に上がった！`);
    }
  }

  const expIntoLevel = getMoePetExpIntoLevelFromTotal(total, levelAfter);
  const stats = calculateStats(pet.id, levelAfter);
  const prec = petUsesPreciseWikiStats(pet.id);
  let nextHp = leveled
    ? stats?.hpMax ?? pet.hpMax
    : Math.min(pet.hp, stats?.hpMax ?? pet.hpMax);
  let nextMp = leveled
    ? stats?.mpMax ?? pet.mpMax
    : Math.min(pet.mp, stats?.mpMax ?? pet.mpMax);
  if (prec) {
    nextHp = roundPetStatInternal(nextHp);
    nextMp = roundPetStatInternal(nextMp);
  }
  const nextPet = {
    ...pet,
    totalExp: total,
    level: levelAfter,
    expIntoLevel,
    hpMax: stats?.hpMax ?? pet.hpMax,
    mpMax: stats?.mpMax ?? pet.mpMax,
    hp: nextHp,
    mp: nextMp,
  };

  return { pet: nextPet, gained: amount, leveled, messages };
}
