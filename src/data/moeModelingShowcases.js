/**
 * 設定 → モデリング展示（3D · 日付ごとに追加）
 *
 * @typedef {'dragon-lineup' | 'monster-lineup'} MoeModelingShowcaseActionId
 * @typedef {{ id: string, title: string, actionId: MoeModelingShowcaseActionId, theme: 'amber' | 'rose' }} MoeModelingShowcaseItem
 * @typedef {{ dateLabel: string, items: MoeModelingShowcaseItem[] }} MoeModelingShowcaseGroup
 */

/** @type {MoeModelingShowcaseGroup[]} */
export const MOE_MODELING_SHOWCASE_GROUPS = [
  {
    dateLabel: "9月27日",
    items: [
      {
        id: "dragon-10",
        title: "ドラゴン10体展示",
        actionId: "dragon-lineup",
        theme: "amber",
      },
      {
        id: "monster-32",
        title: "敵32体展示",
        actionId: "monster-lineup",
        theme: "rose",
      },
    ],
  },
];

/** @param {MoeModelingShowcaseActionId} actionId */
export function isMoeModelingShowcaseActionId(actionId) {
  return actionId === "dragon-lineup" || actionId === "monster-lineup";
}
