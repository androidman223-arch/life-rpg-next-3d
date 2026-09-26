/** 試作イベント集約エリア（展示・ボス・通常敵など） */
export const MOE_3D_BISK_EVENT_HUB_X = -100;
export const MOE_3D_BISK_EVENT_HUB_Y = -30;

/** 小屋・フィールドNPC（イベントハブより西へ X -10） */
export const MOE_3D_BISK_NPC_HUB_X_OFFSET = -10;

/**
 * ビスク中央アルター南西 — 転送UI・会話と被らない距離。
 * アルターはワールド原点 (0,0) 付近（moe3dBiskWorldCenter）なので固定オフセット。
 * ※ moeAltarWarps を import しない（worldLayout 循環参照防止 · docs/moe-lessons.md）
 */
const CASH_SHOP_OFF_X = -17;
const CASH_SHOP_OFF_Z = 13;

/**
 * 試作マップイベント（展示・ボス・通常敵ゾーン等）の配置基準点。
 * @returns {{ x: number, y: number }}
 */
export function moe3dBiskHubAnchor() {
  return { x: MOE_3D_BISK_EVENT_HUB_X, y: MOE_3D_BISK_EVENT_HUB_Y };
}

/** ペット小屋・ローダ等フィールドNPCの配置基準点（ハブ X -10） */
export function moe3dBiskNpcHubAnchor() {
  return {
    x: MOE_3D_BISK_EVENT_HUB_X + MOE_3D_BISK_NPC_HUB_X_OFFSET,
    y: MOE_3D_BISK_EVENT_HUB_Y,
  };
}

/**
 * @param {number} [_tileW]
 * @param {number} [_tileD]
 * @returns {{ x: number, y: number }}
 */
export function moe3dCashShopNpcPosition(_tileW, _tileD) {
  return { x: CASH_SHOP_OFF_X, y: CASH_SHOP_OFF_Z };
}

/** @param {number} px @param {number} py @param {number} [_tileW] @param {number} [_tileD] @param {number} [radius] */
export function moe3dIsNearCashShopNpc(px, py, _tileW, _tileD, radius = 9) {
  const spot = moe3dCashShopNpcPosition();
  return Math.hypot(px - spot.x, py - spot.y) <= radius;
}
