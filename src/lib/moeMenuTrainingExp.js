/**
 * メニュー上部 — 鳳凰の知恵EXPと、次のスキル枠までの進み
 * 知恵EXPの保存形は public/training-exp-system と同じ
 */

export const LIFE_RPG_PHOENIX_WISDOM_STORAGE_KEY =
  "life_rpg_next_3d_training_exp_v1";

/**
 * @param {unknown} parsed
 * @returns {number}
 */
export function phoenixWisdomExpFromSaved(parsed) {
  if (!parsed || typeof parsed !== "object") return 0;
  const row = /** @type {Record<string, unknown>} */ (parsed);
  if (row.phoenixTotalSec != null || row.phoenixExp != null) {
    return Math.round(Math.max(0, Number(row.phoenixExp) || 0) * 10) / 10;
  }
  let exp = 0;
  for (const key of ["self", "memo", "meditation", "rest"]) {
    const expField = key === "memo" ? "memoExp" : `${key}Exp`;
    if (row[expField] != null) exp += Number(row[expField]) || 0;
  }
  return Math.round(Math.max(0, exp) * 10) / 10;
}

/**
 * @param {number[]} levels
 * @param {number} level
 * @returns {{ next: number | null, prev: number, pct: number }}
 */
export function menuSkillSlotProgress(levels, level) {
  const lv = Math.max(0, Number(level) || 0);
  let prev = 0;
  for (const target of levels) {
    if (lv + 1e-6 < target) {
      const span = target - prev;
      const pct =
        span <= 0 ? 0 : Math.min(100, Math.max(0, ((lv - prev) / span) * 100));
      return { next: target, prev, pct };
    }
    prev = target;
  }
  return { next: null, prev, pct: 100 };
}

/**
 * @param {{ level: number, status?: string }[]} catalog
 * @param {number} level
 */
export function formatMenuNextSlotLine(catalog, level) {
  const progress = menuSkillSlotProgress(
    catalog.map((entry) => entry.level),
    level
  );
  if (progress.next == null) return "枠は Lv.150 まで";
  const entry = catalog.find((row) => row.level === progress.next);
  const label = entry?.status === "empty" ? "次の空き枠" : "次の枠";
  return `${label} Lv.${progress.next}`;
}
