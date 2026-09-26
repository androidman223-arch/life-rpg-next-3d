/**
 * ミトヤの大樹 — タイル正規化座標（0=西/北 · 1=東/南）
 * アルターは東寄り · 巨木はその西（転送スポーンが樹幹に埋まらない）
 */

export const MOE_MITOYA_TREE_TX = 0.38;
export const MOE_MITOYA_TREE_TZ = 0.44;

/** タイル中心原点のローカル X */
export function moe3dMitoyaTileLocalX(tileW, tx) {
  return (tx - 0.5) * tileW;
}

/** タイル中心原点のローカル Z */
export function moe3dMitoyaTileLocalZ(tileD, tz) {
  return (tz - 0.5) * tileD;
}
