/**
 * ワーシップネイチャー（調教30）— 死亡したペットだけを生き返らせる。
 * 倒れ中は回復・リジェネでは起きない。
 */

/** @param {{ hp?: number } | null | undefined} pet */
export function moePetIsDead(pet) {
  return (Number(pet?.hp) || 0) <= 0;
}

/**
 * 保存値の HP。未保存は最大。明示の 0 は死亡のまま残す。
 * @param {number} hp
 * @param {number} hpMax
 * @param {boolean} precise
 * @param {(n: number) => number} [roundPrecise]
 */
export function clampLoadedMoePetHp(hp, hpMax, precise, roundPrecise) {
  const max = Math.max(0, Number(hpMax) || 0);
  const round = roundPrecise ?? ((n) => Math.round(Number(n) * 100) / 100);
  if (!Number.isFinite(Number(hp))) {
    return precise ? round(max) : Math.max(0, Math.floor(max));
  }
  const clamped = Math.min(max, Math.max(0, Number(hp)));
  return precise ? round(clamped) : Math.floor(clamped);
}

/**
 * @param {object | null | undefined} pet
 * @returns {{ ok: true, pet: object } | { ok: false, reason: "alive" | "missing" }}
 */
export function applyMoeWorshipNature(pet) {
  if (!pet) return { ok: false, reason: "missing" };
  if (!moePetIsDead(pet)) return { ok: false, reason: "alive" };
  const hpMax = Math.max(1, Number(pet.hpMax) || 1);
  return { ok: true, pet: { ...pet, hp: hpMax } };
}
