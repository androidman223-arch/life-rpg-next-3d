/**
 * ユグ海岸 — 家AGE番地の道（ミトヤ方面＝+tx · タイル正規化座標）
 */

/** 道沿いの番地モデル（1〜4号邸）— 当面オフ */
export const MOE_YUG_COAST_SHOW_FIELD_HOMES = false;
/** 自宅（AGE拠点の家）— アルター北西 */
export const MOE_YUG_COAST_SHOW_HUB_HOUSE = true;

/** ユグ海岸アルター（道の起点） */
export const MOE_YUG_ALTAR_TX = 0.5;
export const MOE_YUG_ALTAR_TZ = 0.5;

/** アスファルト色（L1 道メッシュ） */
export const MOE_YUG_COAST_PATH_ASPHALT = 0x52525b;
export const MOE_YUG_COAST_PATH_CURB = 0x3f3f46;

/** @type {{ centerTz: number, txMin: number, txMax: number, widthTz: number }} */
export const MOE_YUG_COAST_HOME_PATH = {
  /** アルターからミトヤ方面へ一本道（+tx） */
  centerTz: MOE_YUG_ALTAR_TZ + 0.02,
  txMin: MOE_YUG_ALTAR_TX - 0.04,
  txMax: 0.88,
  widthTz: 0.09,
};

/** タイル中心原点のローカル X（L1 道メッシュ用） */
export function moe3dYugCoastPathLocalX(tileW, tx) {
  return (tx - 0.5) * tileW;
}

/** タイル中心原点のローカル Z */
export function moe3dYugCoastPathLocalZ(tileD, tz) {
  return (tz - 0.5) * tileD;
}

/**
 * 道に沿った宅地（sideTz は道中心からの横ずれ · バラバラ感は tx 間隔で出す）
 * @type {ReadonlyArray<{ tx: number, sideTz: number, label: string, sub: string, roofColor: number, wallColor?: number, bodyScale?: number }>}
 */
export const MOE_YUG_COAST_HOME_LOTS = [
  {
    tx: 0.54,
    sideTz: 0.058,
    label: "家AGE · 1号邸",
    sub: "番地入口",
    roofColor: 0xc2410c,
  },
  {
    tx: 0.64,
    sideTz: -0.052,
    label: "家AGE · 2号邸",
    sub: "小川沿い",
    roofColor: 0xb45309,
    bodyScale: 1.05,
  },
  {
    tx: 0.74,
    sideTz: 0.048,
    label: "家AGE · 3号邸",
    sub: "ミトヤ方面",
    roofColor: 0x9a3412,
  },
  {
    tx: 0.82,
    sideTz: -0.055,
    label: "家AGE · 4号邸",
    sub: "道の終点",
    roofColor: 0xd97706,
    wallColor: 0xe7e5e4,
    bodyScale: 0.95,
  },
];

/** @param {{ tx: number, sideTz: number }} lot */
export function moe3dYugCoastHomeLotTz(lot) {
  return MOE_YUG_COAST_HOME_PATH.centerTz + lot.sideTz;
}

/** 道の正面を向く回転（y rad） */
export function moe3dYugCoastHomeLotRotationY(lot) {
  return lot.sideTz >= 0 ? 0 : Math.PI;
}
