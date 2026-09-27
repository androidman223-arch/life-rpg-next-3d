/** プレイヤースキル枠の並び順（縦・横 UI 共通） */

export const MOE_PLAYER_SKILL_SLOT_ORDER_STORAGE_KEY =
  "life-rpg-moe-player-skill-slot-order";

/** @typedef {'light'|'heal'|'heal-all'|'regen'|'banana_milk'|'holy_record'|'teleport'|'ninja_shinobiashi'|'ninja_kakuremino'|'dragon_skateboard'|'dragon_kintoun'} MoePlayerSlotSkillKey */

export const MOE_PLAYER_SLOT_SKILL_KEYS = [
  "light",
  "heal",
  "heal-all",
  "regen",
  "banana_milk",
  "holy_record",
  "teleport",
  "ninja_shinobiashi",
  "dragon_skateboard",
  "ninja_kakuremino",
  "dragon_kintoun",
];

/** @type {Record<MoePlayerSlotSkillKey, string>} */
export const MOE_PLAYER_SLOT_LABELS = {
  light: "ライト",
  heal: "ヒール",
  "heal-all": "オール",
  regen: "リジェネ",
  banana_milk: "🍌バナナミルク",
  holy_record: "ホーリーRレコード",
  teleport: "テレポ",
  ninja_shinobiashi: "忍び足",
  ninja_kakuremino: "隠れ蓑",
  dragon_skateboard: "板乗り",
  dragon_kintoun: "筋斗雲",
};

/** @type {Record<string, string>} */
export const MOE_PLAYER_SLOT_ICONS = {
  light: "✨",
  heal: "💗",
  "heal-all": "💖",
  regen: "🍃",
  banana_milk: "🍌",
  holy_record: "📜",
  teleport: "🌀",
};

/** 旧神速スロット → 板乗り */
export function migratePlayerSkillSlotKey(key) {
  if (key == null || key === "") return null;
  const k = String(key);
  if (k === "ninja_shinsoku") return "dragon_skateboard";
  if (
    k === "enemy_stat_search" ||
    k === "condense_mind" ||
    k === "jiriki_seiran"
  ) {
    return null;
  }
  return MOE_PLAYER_SLOT_SKILL_KEYS.includes(k) ? k : null;
}

/** @returns {(MoePlayerSlotSkillKey|null)[]} */
export function defaultPlayerSkillSlotOrder() {
  return [
    "light",
    "heal",
    "heal-all",
    "regen",
    "banana_milk",
    "holy_record",
    "teleport",
    "ninja_shinobiashi",
    "dragon_skateboard",
    "ninja_kakuremino",
  ];
}

/** 新スキルを空き枠へ自動追加（localStorage 旧データ対応） */
export function mergeMissingSkillKeys(order) {
  const next = order.map((key) => migratePlayerSkillSlotKey(key));
  for (const key of MOE_PLAYER_SLOT_SKILL_KEYS) {
    if (!next.includes(key)) {
      const emptyIdx = next.findIndex((k) => k == null);
      if (emptyIdx >= 0) next[emptyIdx] = key;
    }
  }
  return next;
}

/** @param {unknown} raw @returns {(MoePlayerSlotSkillKey|null)[]} */
export function normalizePlayerSkillSlotOrder(raw) {
  const def = defaultPlayerSkillSlotOrder();
  if (!Array.isArray(raw) || raw.length !== 10) {
    return mergeMissingSkillKeys(def);
  }
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const key = migratePlayerSkillSlotKey(item);
    if (key !== null) {
      if (seen.has(key)) return mergeMissingSkillKeys(def);
      seen.add(key);
    }
    out.push(key);
  }
  if (out.length !== 10) return mergeMissingSkillKeys(def);
  return mergeMissingSkillKeys(out);
}

/** @returns {(MoePlayerSlotSkillKey|null)[]} */
export function loadPlayerSkillSlotOrder() {
  if (typeof window === "undefined") return defaultPlayerSkillSlotOrder();
  try {
    const raw = window.localStorage.getItem(
      MOE_PLAYER_SKILL_SLOT_ORDER_STORAGE_KEY
    );
    if (!raw) return defaultPlayerSkillSlotOrder();
    const parsed = JSON.parse(raw);
    const normalized = normalizePlayerSkillSlotOrder(parsed);
    const merged = mergeMissingSkillKeys(normalized).slice(0, 10);
    const migratedFromRaw =
      Array.isArray(parsed) && parsed.some((k) => k === "ninja_shinsoku");
    if (migratedFromRaw || merged.some((k, i) => k !== normalized[i])) {
      savePlayerSkillSlotOrder(merged);
    }
    return merged;
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
      JSON.stringify(normalizePlayerSkillSlotOrder(order).slice(0, 10))
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
