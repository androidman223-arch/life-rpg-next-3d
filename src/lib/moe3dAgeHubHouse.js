/**
 * AGE拠点の家 — ユグ海岸アルターの北西
 */

import { moeAltarDefById } from "@/data/moeAltarWarps";
import { moe3dAltarWorldPos } from "@/lib/moe3dAltarWarp";

/** AGE列タイルの歩行面（addBase y=0.12 + h/2） */
export const MOE_AGE_TILE_FLOOR_Y = 0.28;

export const MOE_AGE_HUB_HOUSE = {
  houseEmoji: "🏠",
  mapIcon: "🏠",
  houseLabel: "AGE拠点の家",
  /** 家に入る＝ペット敵 LV 育成表（旧・育成表の家 / アルター入口を統合） */
  buttonLabel: "ペット敵LV育成表を見る",
  restAreaLabel: "冒険者の休み場",
  campfireNearLabel: "🔥 焚き火で休む",
  kanbanSub: "家AGE番地 · 育成表 · 焚き火",
};

/** アルター北西 · 転送スポーンを塞がない */
/** アルター転送UIと被らない — 北西へ少し離す */
const AGE_HOUSE_OFF_X = -14;
const AGE_HOUSE_OFF_Z = -11;

/** 扉は家ローカル +Z（`MoeField3DCanvas` の ageDoor） */
export const AGE_HOUSE_DOOR_LOCAL_Z = 1.52;
/** 扉の正面 · 少し離す（ワールドは +Z ＝ field y） */
const AGE_CAMPFIRE_DOOR_GAP = 1.4;

/**
 * @param {number} tileW
 * @param {number} tileD
 * @returns {{ x: number, y: number } | null}
 */
export function moe3dAgeHubHousePosition(tileW, tileD) {
  if (!tileW || !tileD) return null;
  const altar = moeAltarDefById("altar_yug_coast");
  const altarPos = altar ? moe3dAltarWorldPos(altar, tileW, tileD) : null;
  if (!altarPos) return null;
  return {
    x: altarPos.x + AGE_HOUSE_OFF_X,
    y: altarPos.y + AGE_HOUSE_OFF_Z,
  };
}

/**
 * @param {number} px
 * @param {number} py
 * @param {number} tileW
 * @param {number} tileD
 * @param {number} [radius]
 */
export function moe3dIsNearAgeHubHouse(px, py, tileW, tileD, radius = 9) {
  const spot = moe3dAgeHubHousePosition(tileW, tileD);
  if (!spot) return false;
  return Math.hypot(px - spot.x, py - spot.y) <= radius;
}

/** 焚き火 — 扉の正面（キャンプ休息 · 3Dも近接判定も同じ座標） */
export function moe3dAgeHubCampfireWorldPos(tileW, tileD) {
  const house = moe3dAgeHubHousePosition(tileW, tileD);
  if (!house) return null;
  return {
    x: house.x,
    y: house.y + AGE_HOUSE_DOOR_LOCAL_Z + AGE_CAMPFIRE_DOOR_GAP,
  };
}

/** @param {number} [radius] */
export function moe3dIsNearAgeHubCampfire(px, py, tileW, tileD, radius = 3.8) {
  const spot = moe3dAgeHubCampfireWorldPos(tileW, tileD);
  if (!spot) return false;
  return Math.hypot(px - spot.x, py - spot.y) <= radius;
}
