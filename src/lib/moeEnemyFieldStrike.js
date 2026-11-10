/**
 * フィールド敵の通常攻撃 — 物理 / 魔法（反射・百花の魔法回避テスト用）
 */

/** @typedef {'physical' | 'magic'} MoeEnemyFieldStrikeKind */

/** フィールド通常攻撃が魔法扱いの敵 key */
export const MOE_FIELD_MAGIC_STRIKE_ENEMY_KEYS = new Set([
  "orc_magician",
]);

/**
 * @param {string | null | undefined} enemyKey
 * @returns {MoeEnemyFieldStrikeKind}
 */
export function moeEnemyFieldStrikeKind(enemyKey) {
  return MOE_FIELD_MAGIC_STRIKE_ENEMY_KEYS.has(enemyKey)
    ? "magic"
    : "physical";
}

/**
 * @param {{ key?: string, petDamage?: number, petDamageStrong?: number, wiki?: { magic?: number, attack?: number } }} enemy
 * @param {{ useStrong?: boolean }} [opts]
 */
export function moeResolveEnemyFieldStrike(enemy, opts = {}) {
  const kind = moeEnemyFieldStrikeKind(enemy?.key);
  const useStrong = Boolean(opts.useStrong);
  if (kind === "magic") {
    const mag = Number(enemy?.wiki?.magic ?? enemy?.wiki?.attack ?? 0);
    const base = Math.max(1, Math.round(mag * 0.9));
    const strong = Math.max(1, Math.round(base * 1.35));
    return {
      attackKind: kind,
      damageRaw: useStrong ? strong : base,
    };
  }
  const dmgBase = enemy?.petDamage ?? 1;
  const dmgStrong = enemy?.petDamageStrong ?? Math.round(dmgBase * 1.5);
  return {
    attackKind: kind,
    damageRaw: useStrong ? dmgStrong : dmgBase,
  };
}
