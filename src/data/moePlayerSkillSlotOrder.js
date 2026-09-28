/** プレイヤースキル枠の並び順（縦・横 UI 共通） */

export const MOE_PLAYER_SKILL_SLOT_ORDER_STORAGE_KEY =
  "life-rpg-moe-player-skill-slot-order";

/** @typedef {'enemy_stat_search'|'worship_nature'|'soul_master'|'mining'|'light'|'heal'|'heal-all'|'regen'|'banana_milk'|'holy_record'|'teleport'|'ninja_shinobiashi'|'ninja_kakuremino'|'dragon_skateboard'|'dragon_kintoun'} MoePlayerSlotSkillKey */

export const MOE_PLAYER_SLOT_SKILL_KEYS = [
  "enemy_stat_search",
  "worship_nature",
  "soul_master",
  "mining",
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
  enemy_stat_search: "敵ステサーチ",
  worship_nature: "ホワイトエンジェルロッド",
  soul_master: "ソウルマスター",
  mining: "採掘",
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
  enemy_stat_search: "🔍",
  worship_nature: "🪄",
  soul_master: "🕯️",
  mining: "⛏️",
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
  if (k === "condense_mind" || k === "jiriki_seiran") {
    return null;
  }
  return MOE_PLAYER_SLOT_SKILL_KEYS.includes(k) ? k : null;
}

/** @returns {(MoePlayerSlotSkillKey|null)[]} */
/** 技①から外す。鳳凰・龍神側には残す */
const RETIRED_PLAYER_SKILL_BAR_KEYS = new Set([
  "light",
  "heal",
  "heal-all",
  "teleport",
  "ninja_shinobiashi",
  "dragon_skateboard",
]);

export function defaultPlayerSkillSlotOrder() {
  return [
    "enemy_stat_search",
    "worship_nature",
    "regen",
    "banana_milk",
    "holy_record",
    "soul_master",
    "mining",
    null,
    null,
    null,
  ];
}

/** @param {(MoePlayerSlotSkillKey|null)[]} order */
export function stripRetiredPlayerSkillSlots(order) {
  return order.map((key) =>
    key != null && RETIRED_PLAYER_SKILL_BAR_KEYS.has(key) ? null : key
  );
}

/** 空きを後ろへ寄せる */
export function packPlayerSkillSlots(order) {
  const filled = order.filter((key) => key != null);
  while (filled.length < 10) filled.push(null);
  return filled.slice(0, 10);
}

/** 未配置なら敵ステサーチの次へ入れる（10枠を超えた分は末尾を外す） */
export function ensureWorshipNatureSlot(order) {
  if (order.includes("worship_nature")) return order.slice(0, 10);
  const next = [...order];
  const at = next[0] === "enemy_stat_search" ? 1 : 0;
  next.splice(at, 0, "worship_nature");
  return next.slice(0, 10);
}

/** 未配置なら技①の先頭へ入れる（10枠を超えた分は末尾を外す） */
export function ensureEnemyStatSearchFirst(order) {
  if (order.includes("enemy_stat_search")) return order.slice(0, 10);
  return ["enemy_stat_search", ...order].slice(0, 10);
}

/** 技①の初期並びに無い技は、空いた枠へ戻さない */
export function mergeMissingSkillKeys(order) {
  const next = order.map((key) => migratePlayerSkillSlotKey(key));
  for (const key of defaultPlayerSkillSlotOrder()) {
    if (!key || next.includes(key)) continue;
    const emptyIdx = next.findIndex((k) => k == null);
    if (emptyIdx >= 0) next[emptyIdx] = key;
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
    const normalized = packPlayerSkillSlots(
      mergeMissingSkillKeys(
        stripRetiredPlayerSkillSlots(
          ensureWorshipNatureSlot(
            ensureEnemyStatSearchFirst(normalizePlayerSkillSlotOrder(parsed))
          )
        )
      )
    );
    const merged = normalized.slice(0, 10);
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
