/** HUD 表示用 y（下＝−y） */
export function moe3dHudDisplayCoordY(worldY) {
  return -(Number(worldY) || 0);
}

/** @param {number} x @param {number} y */
export function formatMoe3dHudCoordLabel(x, y) {
  const rx = Math.round(Number(x) || 0);
  const dy = Math.round(moe3dHudDisplayCoordY(y));
  const fx = rx < 0 ? `-${Math.abs(rx)}` : `${rx}`;
  const fy = dy < 0 ? `-${Math.abs(dy)}` : `${dy}`;
  return `x${fx} y${fy}`;
}
