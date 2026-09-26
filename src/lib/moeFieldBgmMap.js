/**
 * MOE フィールド BGM — マップ／戦闘と曲 ID の対応（純粋データ）
 */

export const MOE_BGM_FADE_MS = 2000;
/** 焚き火休息 — BGM はすぐ止める（パチパチを先に） */
export const MOE_BGM_REST_STOP_MS = 0;

/** ambient-bgm-*.mp3 / フリー曲の trackId（AmbientBgm と一致） */
export const MOE_BGM_TRACK = {
  AMBIENT_3: "local3",
  AMBIENT_4: "local4",
  AMBIENT_5: "local5",
  AMBIENT_7: "local7",
  AMBIENT_8_ELUAN: "eruan",
  ROYALTY_CASTLE: "castle",
  ROYALTY_FIELD: "field",
};

/** マップ面ごとのフィールド BGM */
export const MOE_FIELD_ZONE_BGM = {
  bisk: MOE_BGM_TRACK.AMBIENT_7,
  elan_palace: MOE_BGM_TRACK.AMBIENT_8_ELUAN,
  elvin_valley: MOE_BGM_TRACK.AMBIENT_3,
  elvin_mountains: MOE_BGM_TRACK.ROYALTY_CASTLE,
  slorim_plain: MOE_BGM_TRACK.AMBIENT_5,
  /** AGEユグ海岸 — 珊瑚砂浜（local5 · 海岸・平原系） */
  yug_coast: MOE_BGM_TRACK.AMBIENT_5,
  /** AGEソレス渓谷 — 渓谷の湯（穏やかなフィールド） */
  soles_valley: MOE_BGM_TRACK.AMBIENT_3,
  /** 育成表の家 — 焚き火の休み場（散策 · キャンプ向け） */
  training_guide_house: MOE_BGM_TRACK.ROYALTY_FIELD,
};

export const MOE_FIELD_COMBAT_BGM = MOE_BGM_TRACK.AMBIENT_4;

/** @param {string | null | undefined} mapSlotId */
export function moeFieldBgmTrackForMapSlot(mapSlotId) {
  if (!mapSlotId) return MOE_BGM_TRACK.ROYALTY_FIELD;
  return MOE_FIELD_ZONE_BGM[mapSlotId] ?? MOE_BGM_TRACK.ROYALTY_FIELD;
}
