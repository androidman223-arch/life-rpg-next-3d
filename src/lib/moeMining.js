/**
 * 採掘 — エルビン山脈のアルター近くに岩が1つ。
 * ボタン1回でつるはし5振り。1撃で HP を 1 か 2 削る。
 * 破壊時の鉱石: 銅59% 鉄30% 銀10% 金1%。
 * 宝石は追加でたまに出る。売値は 10000g。
 */

export const MOE_MINING_ROCK_HP = 20;
export const MOE_MINING_SWINGS = 5;
export const MOE_MINING_SWING_MS = 450;
export const MOE_MINING_REACH = 6.5;
export const MOE_MINING_RESPAWN_MS = 15000;
export const MOE_MINING_ROCK_SLOT_ID = "elvin_mountains";
export const MOE_MINING_GEM_SELL_GOLD = 10000;

/** 破壊後に出す短い記録 */
export const MOE_MINING_ORE_RATE_NOTE =
  "確率は銅59%、鉄30%、銀10%、金1%";

/**
 * アルターの東、少し手前。転送スポーン（南）は塞がない。
 * @param {{ x: number, y: number } | null | undefined} altarPos
 */
export function moeMiningRockNearAltar(altarPos) {
  if (!altarPos || !Number.isFinite(altarPos.x) || !Number.isFinite(altarPos.y)) {
    return null;
  }
  return { x: altarPos.x + 9, y: altarPos.y - 2 };
}

export function moeMiningInReach(px, py, rockX, rockY, reach = MOE_MINING_REACH) {
  if (![px, py, rockX, rockY].every((n) => Number.isFinite(n))) return false;
  return Math.hypot(px - rockX, py - rockY) <= reach;
}

/** @type {{ id: string, label: string, emoji: string, weight: number, sellGold: number }[]} */
export const MOE_MINING_GEMS = [
  { id: "ruby", label: "ルビー", emoji: "🔴", weight: 6, sellGold: MOE_MINING_GEM_SELL_GOLD },
  { id: "sapphire", label: "サファイア", emoji: "🔵", weight: 4, sellGold: MOE_MINING_GEM_SELL_GOLD },
  { id: "diamond", label: "ダイア", emoji: "💎", weight: 3, sellGold: MOE_MINING_GEM_SELL_GOLD },
  { id: "gold_gem", label: "金の宝石", emoji: "✨", weight: 2, sellGold: MOE_MINING_GEM_SELL_GOLD },
];

/**
 * 鉱石とは別枠。85% はなし。出たら1個追加。
 * @param {() => number} [rng]
 */
export function rollMoeMiningGem(rng = Math.random) {
  const roll = rng() * 100;
  let acc = 0;
  for (const gem of MOE_MINING_GEMS) {
    acc += gem.weight;
    if (roll < acc) return gem;
  }
  return null;
}

/**
 * @param {{ emoji?: string, label: string }} ore
 * @param {{ emoji?: string, label: string, sellGold?: number } | null} gem
 */
export function formatMoeMiningBreakNote(ore, gem) {
  const lines = [`${ore.emoji ?? ""} ${ore.label}`.trim(), MOE_MINING_ORE_RATE_NOTE];
  if (gem) {
    lines.push(
      `${gem.emoji ?? ""} ${gem.label}が追加（売値 ${gem.sellGold ?? MOE_MINING_GEM_SELL_GOLD}g）`.trim()
    );
  }
  return lines.join("\n");
}

/** @type {{ id: string, label: string, emoji: string, weight: number }[]} */
export const MOE_MINING_ORES = [
  { id: "copper_ore", label: "銅鉱石", emoji: "🟤", weight: 59 },
  { id: "iron_ore", label: "鉄鉱石", emoji: "⚙️", weight: 30 },
  { id: "silver_ore", label: "銀鉱石", emoji: "⚪", weight: 10 },
  { id: "gold_ore", label: "金鉱石", emoji: "🟡", weight: 1 },
];

/**
 * @param {() => number} [rng]
 * @returns {1 | 2}
 */
export function rollMoeMiningSwingDamage(rng = Math.random) {
  return rng() < 0.5 ? 1 : 2;
}

/**
 * @param {number} hp
 * @param {() => number} [rng]
 */
export function applyMoeMiningSwing(hp, rng = Math.random) {
  const damage = rollMoeMiningSwingDamage(rng);
  const next = Math.max(0, Math.floor(Number(hp) || 0) - damage);
  return { damage, hp: next, broken: next <= 0 };
}

/**
 * 0〜100 の一様乱数。59 / 30 / 10 / 1。
 * @param {() => number} [rng]
 */
export function rollMoeMiningOre(rng = Math.random) {
  const roll = rng() * 100;
  let acc = 0;
  for (const ore of MOE_MINING_ORES) {
    acc += ore.weight;
    if (roll < acc) return ore;
  }
  return MOE_MINING_ORES[0];
}

/** 取らなかった石が窓から消えるまで */
export const MOE_MINING_PICKUP_VANISH_MS = 60000;

/** 破壊した石を見せるミニ窓。縦1 × 横6 */
export const MOE_MINING_PICKUP_SLOTS = 6;

export function emptyMoeMiningPickup() {
  return Array.from({ length: MOE_MINING_PICKUP_SLOTS }, () => null);
}

/**
 * 岩が砕けた場所の宝箱。中身は右クリックで開くまで窓に出さない。
 * @param {number} id
 * @param {number} x
 * @param {number} y
 * @param {object[]} items
 * @param {number} [now]
 */
export function createMoeMiningChest(id, x, y, items, now = Date.now()) {
  const slots = emptyMoeMiningPickup();
  items.forEach((item, i) => {
    if (item && i < slots.length) slots[i] = item;
  });
  return {
    id,
    x,
    y,
    state: "closed",
    kind: "mining",
    items: slots,
    bornAt: now,
    vanishAt: now + MOE_MINING_PICKUP_VANISH_MS,
  };
}

/**
 * 空きが足りなければ何も置かない。
 * @param {(object | null)[]} slots
 * @param {object[]} items
 */
export function offerMoeMiningPickup(slots, items) {
  const next = emptyMoeMiningPickup();
  for (let i = 0; i < MOE_MINING_PICKUP_SLOTS; i += 1) {
    next[i] = slots?.[i] ?? null;
  }
  const holes = [];
  for (let i = 0; i < next.length; i += 1) {
    if (next[i] == null) holes.push(i);
  }
  if (holes.length < items.length) {
    return { ok: false, slots: next, firstIndex: null };
  }
  items.forEach((item, n) => {
    next[holes[n]] = item;
  });
  return { ok: true, slots: next, firstIndex: holes[0] ?? null };
}

/**
 * @param {(object | null)[]} slots
 * @param {number | null} index
 */
export function takeMoeMiningPickup(slots, index) {
  const next = emptyMoeMiningPickup();
  for (let i = 0; i < MOE_MINING_PICKUP_SLOTS; i += 1) {
    next[i] = slots?.[i] ?? null;
  }
  if (index == null || index < 0 || index >= next.length || !next[index]) {
    return { ok: false, slots: next, item: null };
  }
  const item = next[index];
  next[index] = null;
  return { ok: true, slots: next, item };
}
