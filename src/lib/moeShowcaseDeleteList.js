/** 展示モデル — 非表示（削除）リスト · localStorage */

export const MOE_HIDDEN_MONSTER_SHOWCASE_KEY =
  "life-rpg-moe-hidden-monster-showcase";
export const MOE_HIDDEN_DRAGON_SHOWCASE_KEY =
  "life-rpg-moe-hidden-dragon-showcase";

/** @typedef {'monster' | 'dragon'} MoeShowcaseKind */

/** @param {MoeShowcaseKind} kind */
function storageKeyForKind(kind) {
  return kind === "dragon"
    ? MOE_HIDDEN_DRAGON_SHOWCASE_KEY
    : MOE_HIDDEN_MONSTER_SHOWCASE_KEY;
}

/** @param {MoeShowcaseKind} kind @returns {string[]} */
export function loadHiddenShowcaseIds(kind) {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKeyForKind(kind));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === "string" && id.length > 0)
      : [];
  } catch {
    return [];
  }
}

/** @param {MoeShowcaseKind} kind @param {string[]} ids */
export function saveHiddenShowcaseIds(kind, ids) {
  if (typeof localStorage === "undefined") return;
  const unique = [...new Set(ids.filter(Boolean))];
  localStorage.setItem(storageKeyForKind(kind), JSON.stringify(unique));
}

/** @param {{ id: string }[]} lineup @param {string[]} hiddenIds */
export function filterShowcaseLineupByIds(lineup, hiddenIds) {
  const hidden = new Set(hiddenIds);
  if (hidden.size === 0) return lineup;
  return lineup.filter((v) => !hidden.has(v.id));
}

/** @param {{ id: string }[]} lineup @param {MoeShowcaseKind} kind */
export function filterShowcaseLineup(lineup, kind) {
  return filterShowcaseLineupByIds(lineup, loadHiddenShowcaseIds(kind));
}

/** @param {MoeShowcaseKind} kind @param {string[]} addIds */
export function addHiddenShowcaseIds(kind, addIds) {
  const next = new Set([...loadHiddenShowcaseIds(kind), ...addIds.filter(Boolean)]);
  saveHiddenShowcaseIds(kind, [...next]);
  return [...next];
}

/** @param {MoeShowcaseKind} kind @param {string} id */
export function removeHiddenShowcaseId(kind, id) {
  const next = loadHiddenShowcaseIds(kind).filter((x) => x !== id);
  saveHiddenShowcaseIds(kind, next);
  return next;
}

/** @param {MoeShowcaseKind} kind */
export function clearHiddenShowcaseIds(kind) {
  saveHiddenShowcaseIds(kind, []);
  return [];
}
