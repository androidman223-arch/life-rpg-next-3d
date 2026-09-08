/** プレイヤースキル枠の並び順（縦・横 UI 共通） */

export const MOE_PLAYER_SKILL_SLOT_ORDER_STORAGE_KEY =
  "life-rpg-moe-player-skill-slot-order";

/** @typedef {'light'|'heal'|'heal-all'|'regen'|'ninja_shinobiashi'|'ninja_shinsoku'|'ninja_kakuremino'} MoePlayerSlotSkillKey */

export const MOE_PLAYER_SLOT_SKILL_KEYS = [
  "light",
  "heal",
  "heal-all",
  "regen",
  "ninja_shinobiashi",
  "ninja_shinsoku",
  "ninja_kakuremino",
];

/** @type {Record<MoePlayerSlotSkillKey, string>} */
export const MOE_PLAYER_SLOT_LABELS = {
  light: "ライト",
  heal: "ヒール",
  "heal-all": "オール",
  regen: "リジェネ",
  ninja_shinobiashi: "忍び足",
  ninja_shinsoku: "神速",
  ninja_kakuremino: "隠れ蓑",
};

/** @type {Record<string, string>} */
export const MOE_PLAYER_SLOT_ICONS = {
  light: "✨",
  heal: "💗",
  "heal-all": "💖",
  regen: "🍃",
};

/** @returns {(MoePlayerSlotSkillKey|null)[]} */
export function defaultPlayerSkillSlotOrder() {
  return [
    "light",
    "heal",
    "heal-all",
    "regen",
    "ninja_shinobiashi",
    "ninja_shinsoku",
    "ninja_kakuremino",
    null,
    null,
    null,
  ];
}

/** @param {unknown} raw @returns {(MoePlayerSlotSkillKey|null)[]} */
export function normalizePlayerSkillSlotOrder(raw) {
  const def = defaultPlayerSkillSlotOrder();
  if (!Array.isArray(raw) || raw.length !== 10) return def;
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const key = item == null || item === "" ? null : String(item);
    if (key !== null) {
      if (!MOE_PLAYER_SLOT_SKILL_KEYS.includes(key) || seen.has(key)) {
        return def;
      }
      seen.add(key);
    }
    out.push(key);
  }
  if (out.length !== 10) return def;
  return out;
}

/** @returns {(MoePlayerSlotSkillKey|null)[]} */
export function loadPlayerSkillSlotOrder() {
  if (typeof window === "undefined") return defaultPlayerSkillSlotOrder();
  try {
    const raw = window.localStorage.getItem(
      MOE_PLAYER_SKILL_SLOT_ORDER_STORAGE_KEY
    );
    if (!raw) return defaultPlayerSkillSlotOrder();
    return normalizePlayerSkillSlotOrder(JSON.parse(raw));
  } catch {
    return defaultPlayerSkillSlotOrder();
  }
}

/** @param {(MoePlayerSlotSkillKey|null)[]} order */
export function savePlayerSkillSlotOrder(order) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MOE_PLAYER_SKILL_SLOT_ORDER_STORAGE_KEY,
      JSON.stringify(normalizePlayerSkillSlotOrder(order))
    );
  } catch {
    /* quota */
  }
}

/** @param {(MoePlayerSlotSkillKey|null)[]} order @param {number} a @param {number} b */
export function swapPlayerSkillSlotOrder(order, a, b) {
  if (a === b || a < 0 || b < 0 || a >= 10 || b >= 10) return order;
  const next = [...order];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}
