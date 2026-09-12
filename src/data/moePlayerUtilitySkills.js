/**
 * プレイヤー技③ — 調査・支援系（敵ステサーチなど）
 */

export const MOE_PLAYER_UTILITY_SLOT_COUNT = 10;

/** @typedef {'enemy_stat_search'} MoePlayerUtilitySkillKey */

export const MOE_PLAYER_UTILITY_SLOT_KEYS = ["enemy_stat_search"];

/** @type {Record<MoePlayerUtilitySkillKey, string>} */
export const MOE_PLAYER_UTILITY_SLOT_LABELS = {
  enemy_stat_search: "敵ステサーチ",
};

/** @type {Record<MoePlayerUtilitySkillKey, string>} */
export const MOE_PLAYER_UTILITY_SLOT_ICONS = {
  enemy_stat_search: "🔍",
};

/** @returns {(MoePlayerUtilitySkillKey|null)[]} */
export function defaultPlayerUtilitySlotOrder() {
  return [
    "enemy_stat_search",
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];
}

/** @param {unknown} raw @returns {(MoePlayerUtilitySkillKey|null)[]} */
export function normalizePlayerUtilitySlotOrder(raw) {
  const def = defaultPlayerUtilitySlotOrder();
  if (!Array.isArray(raw) || raw.length !== MOE_PLAYER_UTILITY_SLOT_COUNT) {
    return def;
  }
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const key = item == null || item === "" ? null : String(item);
    if (key !== null) {
      if (!MOE_PLAYER_UTILITY_SLOT_KEYS.includes(key) || seen.has(key)) {
        return def;
      }
      seen.add(key);
    }
    out.push(key);
  }
  return mergeMissingUtilitySkillKeys(out);
}

/** 新スキルを空き枠へ自動追加 */
export function mergeMissingUtilitySkillKeys(order) {
  const next = [...order];
  for (const key of MOE_PLAYER_UTILITY_SLOT_KEYS) {
    if (!next.includes(key)) {
      const emptyIdx = next.findIndex((k) => k == null);
      if (emptyIdx >= 0) next[emptyIdx] = key;
    }
  }
  return next;
}
