/**
 * うごかせるパネルの 位置を 画面の中に もどす — 純粋関数
 *
 * 保存した位置が 画面の外（前の大きな画面・別のモニター）だと、
 * ひらいても 見えなくなる（2026-11-10 マクロ登録が 出ない と言われて 直した）。
 * パネルの左上の 少なくとも MIN_VISIBLE_W × MIN_VISIBLE_H は 画面の中に のこす。
 */

export const MOE_PANEL_MIN_VISIBLE_W = 160;
export const MOE_PANEL_MIN_VISIBLE_H = 40;
const EDGE = 4;

/**
 * @param {{ x: number, y: number }} pos
 * @param {{ w: number, h: number }} size パネルの大きさ（わからなければ 小さめ）
 * @param {number} vw 画面の幅
 * @param {number} vh 画面の高さ
 * @param {{ whole?: boolean }} [opts] whole: パネル全体を 画面に入れる（入るなら）
 * @returns {{ x: number, y: number }}
 */
export function moeClampPanelPosIntoView(pos, size, vw, vh, opts = {}) {
  const sw = Math.max(size?.w ?? 0, 1);
  const sh = Math.max(size?.h ?? 0, 1);
  const w = opts.whole ? sw : Math.min(sw, MOE_PANEL_MIN_VISIBLE_W);
  const h = opts.whole ? sh : Math.min(sh, MOE_PANEL_MIN_VISIBLE_H);
  const maxX = Math.max(EDGE, vw - w - EDGE);
  const maxY = Math.max(EDGE, vh - h - EDGE);
  const x = Number.isFinite(pos?.x) ? pos.x : EDGE;
  const y = Number.isFinite(pos?.y) ? pos.y : EDGE;
  return {
    x: Math.max(EDGE, Math.min(maxX, x)),
    y: Math.max(EDGE, Math.min(maxY, y)),
  };
}
