/**
 * スキルボタンの説明（MoeCompactSkillTip）を どこに出すか — 純粋関数
 * 画面の外に はみ出さないようにする。
 */

/** 説明の いちばん広い幅（13rem）の半分くらい */
export const MOE_COMPACT_TIP_HALF_W = 104;
const GAP = 4;
const EDGE = 4;

/**
 * @param {{ left: number, top: number, right: number, bottom: number, vw: number, vh: number }} r
 *   ボタンの位置（getBoundingClientRect）と 画面の大きさ
 * @param {"top" | "side"} [placement]
 * @returns {{ left: number, top: number, transform: string }}
 */
export function moeCompactTipPosition(r, placement = "top") {
  const cx = (r.left + r.right) / 2;
  const cy = (r.top + r.bottom) / 2;
  if (placement === "side") {
    const top = Math.max(30, Math.min(r.vh - 30, cy));
    if (r.right + GAP + MOE_COMPACT_TIP_HALF_W * 2 <= r.vw - EDGE) {
      return { left: r.right + GAP, top, transform: "translate(0, -50%)" };
    }
    return { left: r.left - GAP, top, transform: "translate(-100%, -50%)" };
  }
  const minX = MOE_COMPACT_TIP_HALF_W + EDGE;
  const maxX = Math.max(minX, r.vw - MOE_COMPACT_TIP_HALF_W - EDGE);
  const left = Math.max(minX, Math.min(maxX, cx));
  // 上に入らないときは 下に出す
  if (r.top < 48) {
    return { left, top: r.bottom + GAP, transform: "translate(-50%, 0)" };
  }
  return { left, top: r.top - GAP, transform: "translate(-50%, -100%)" };
}
