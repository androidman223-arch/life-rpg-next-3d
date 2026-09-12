/**
 * 敵ステサーチ — ターゲット敵のステータス表示用
 */

/**
 * @param {object|null|undefined} enemy
 * @returns {object|null}
 */
export function buildMoeEnemyStatSearchView(enemy) {
  if (!enemy) return null;
  const wiki = enemy.wiki ?? {};
  const skills =
    Array.isArray(enemy.skills) && enemy.skills.length > 0
      ? enemy.skills
      : ["（スキルデータなし）"];

  return {
    id: enemy.id,
    name: enemy.name ?? "？？？",
    emoji: enemy.emoji ?? "❓",
    level: enemy.level ?? "?",
    hp: Math.max(0, Math.ceil(Number(enemy.hp) || 0)),
    hpMax: Math.max(1, Math.ceil(Number(enemy.hpMax) || 1)),
    mp: formatStat(wiki.mp),
    attack: formatStat(wiki.attack),
    defense: formatStat(wiki.defense),
    hit: formatStat(wiki.hit),
    magic: formatStat(wiki.magic),
    evasion: formatStat(wiki.evasion),
    fieldDamage: Math.max(0, Math.round(Number(enemy.petDamage) || 0)),
    attackIntervalSec:
      enemy.attackInterval != null
        ? Math.round(Number(enemy.attackInterval) * 10) / 10
        : null,
    skills,
    captureLife: enemy.captureLife ?? null,
    midBoss: Boolean(enemy.midBoss),
    superBoss: Boolean(enemy.superBoss),
  };
}

/** @param {unknown} v */
function formatStat(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return Math.round(n * 10) / 10;
}
