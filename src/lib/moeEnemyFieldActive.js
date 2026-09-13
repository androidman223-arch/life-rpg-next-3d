/**
 * MOE 敵フィールド — アクティブ / ノンアクティブ（先制攻撃・追跡の可否）
 * ヘイトとは別系統。索敵表示はどちらも有効。
 */

/**
 * ノンアクティブ = 索敵範囲には反応するが追跡・先制しない（MOE 本家の牛・鹿・亀など）
 * @type {ReadonlySet<string>}
 */
export const MOE_ENEMY_FIELD_NON_ACTIVE_KEYS = new Set([
  "rescue_buck", // レクスール バック
  "garm_deer", // ガルム鹿
  "elvin_bison", // エルビン バイソン
  "sandworm",
  "turtle",
  "giant_tortoise",
  "ips_bass", // 魚系 — 先制しない想定
  "doodlebug_small",
  "doodlebug_medium",
]);

/** @returns {string[]} */
export function listMoeEnemyFieldNonActiveKeys() {
  return [...MOE_ENEMY_FIELD_NON_ACTIVE_KEYS].sort();
}

/**
 * @param {object|null|undefined} enemy
 * @returns {boolean} true = アクティブ（索敵後に追跡・先制）
 */
export function resolveMoeEnemyFieldActive(enemy) {
  if (!enemy) return true;
  if (typeof enemy.fieldActive === "boolean") return enemy.fieldActive;
  const key = enemy.key ?? enemy.familyId;
  if (key && MOE_ENEMY_FIELD_NON_ACTIVE_KEYS.has(String(key))) return false;
  const familyId = enemy.familyId;
  if (familyId && MOE_ENEMY_FIELD_NON_ACTIVE_KEYS.has(String(familyId))) {
    return false;
  }
  const skills = enemy.skills;
  if (
    Array.isArray(skills) &&
    skills.some((s) => String(s).includes("ノンアクティブ"))
  ) {
    return false;
  }
  return true;
}

/** @param {boolean} active */
export function formatMoeEnemyFieldActiveLabel(active) {
  return active ? "アクティブ" : "ノンアクティブ";
}

/** @param {boolean} active */
export function formatMoeEnemyFieldActiveHint(active) {
  return active
    ? "索敵後に追跡・先制攻撃する"
    : "索敵範囲には反応するが追ってこない";
}
