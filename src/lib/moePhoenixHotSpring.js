/**
 * 温泉調気 — 守り+50 · 温泉付近で眠る体（焚き火休息）
 */

export const MOE_PHOENIX_HOT_SPRING_DEFENSE_BONUS = 50;
export const MOE_PHOENIX_HOT_SPRING_BUFF_DURATION_MS = 90_000;

/**
 * @param {object | null | undefined} skill
 * @param {number} [nowMs]
 */
export function beginMoePhoenixHotSpringDefenseBuff(skill, nowMs = Date.now()) {
  const bonus = skill?.defenseBonus ?? MOE_PHOENIX_HOT_SPRING_DEFENSE_BONUS;
  const durationMs =
    skill?.defenseBuffDurationMs ?? MOE_PHOENIX_HOT_SPRING_BUFF_DURATION_MS;
  return { until: nowMs + durationMs, bonus };
}

/**
 * @param {{ until?: number, bonus?: number } | null | undefined} buff
 * @param {number} [nowMs]
 */
export function moePhoenixHotSpringDefenseBonus(buff, nowMs = Date.now()) {
  if (!buff?.until || nowMs >= buff.until) return 0;
  return buff.bonus ?? MOE_PHOENIX_HOT_SPRING_DEFENSE_BONUS;
}

/**
 * @param {number} baseDefense
 * @param {number} extraDefense
 * @param {(v: number) => string} formatStat
 */
export function formatMoePetDefenseWithBonus(
  baseDefense,
  extraDefense,
  formatStat
) {
  const base = Number(baseDefense) || 0;
  const extra = Math.max(0, Number(extraDefense) || 0);
  if (extra <= 0) return formatStat(base);
  return `${formatStat(base)} (+${extra})`;
}

/**
 * 敵の flat ダメージをペット防御で軽減（攻撃側と同系の式）
 * @param {number} rawDamage
 * @param {number} petDefense
 * @param {number} [extraDefense]
 */
export function moeMitigatePetIncomingDamage(
  rawDamage,
  petDefense,
  extraDefense = 0
) {
  const raw = Math.max(0, Number(rawDamage) || 0);
  const def = Math.max(0, (Number(petDefense) || 0) + (Number(extraDefense) || 0));
  if (def <= 0) return Math.max(1, Math.floor(raw));
  const mitigated = raw * (100 / (100 + def));
  return Math.max(1, Math.floor(mitigated));
}
