/** @typedef {'closed' | 'open' | 'looted'} MoeFieldTreasureState */

import { MOE_ITEM_PHOENIX_FEATHER } from "./moePhoenixDragon";

export { MOE_ITEM_PHOENIX_FEATHER };

/** @typedef {{
 *   id: string,
 *   label: string,
 *   emoji?: string,
 *   iconKind?: "pink_sand_mound" | "experience_cube" | "ninja_tabi",
 *   expAmount?: number,
 *   unlocksPlayerSkillId?: string,
 * }} MoeFieldLootItem */

/** @typedef {{
 *   id: number,
 *   x: number,
 *   y: number,
 *   state: MoeFieldTreasureState,
 *   lootItemId: string,
 *   sourceEnemyKey: string,
 *   openedAt?: number,
 * }} MoeFieldTreasure */

/** エクスペリエンスパウダー（USE で +1000 EXP · 次フェーズ） */
export const MOE_ITEM_EXPERIENCE_POWDER = {
  id: "experience_powder",
  label: "エクスペリエンスパウダー",
  iconKind: "pink_sand_mound",
  expAmount: 1000,
};

/** エクスペリエンスキューブ — 粉20個分（ギュスターヴの宝） */
export const MOE_ITEM_EXPERIENCE_CUBE = {
  id: "experience_cube",
  label: "エクスペリエンスキューブ",
  iconKind: "experience_cube",
  expAmount: 20000,
};

/** 忍者の足袋 — 板乗り解放用（別途） */
export const MOE_ITEM_NINJA_TABI = {
  id: "ninja_tabi",
  label: "忍者の足袋",
  emoji: "🧦",
  iconKind: "ninja_tabi",
  unlocksPlayerSkillId: "dragon_skateboard",
};

/** レベルダウンパウダー（USE で -1000 EXP） */
export const MOE_ITEM_LEVEL_DOWN_POWDER = {
  id: "level_down_powder",
  label: "レベルダウンパウダー",
  iconKind: "level_down_powder",
  expAmount: -1000,
};

/** レベルダウンキューブ — 粉20個分 */
export const MOE_ITEM_LEVEL_DOWN_CUBE = {
  id: "level_down_cube",
  label: "レベルダウンキューブ",
  iconKind: "level_down_cube",
  expAmount: -20000,
};

/** @type {Record<string, MoeFieldLootItem>} */
export const MOE_FIELD_LOOT_ITEMS = {
  [MOE_ITEM_EXPERIENCE_POWDER.id]: MOE_ITEM_EXPERIENCE_POWDER,
  [MOE_ITEM_EXPERIENCE_CUBE.id]: MOE_ITEM_EXPERIENCE_CUBE,
  [MOE_ITEM_LEVEL_DOWN_POWDER.id]: MOE_ITEM_LEVEL_DOWN_POWDER,
  [MOE_ITEM_LEVEL_DOWN_CUBE.id]: MOE_ITEM_LEVEL_DOWN_CUBE,
  [MOE_ITEM_NINJA_TABI.id]: MOE_ITEM_NINJA_TABI,
  [MOE_ITEM_PHOENIX_FEATHER.id]: MOE_ITEM_PHOENIX_FEATHER,
};

export const MOE_TREASURE_LOOT_SLOTS = 5;

/** この敵を倒すと宝を落とす */
export const MOE_TREASURE_DROP_ENEMY_KEYS = new Set([
  "orc_infantry",
  "gustav_junior",
]);

/**
 * @param {string | undefined | null} enemyKey
 */
export function shouldMoeEnemyDropTreasure(enemyKey) {
  return MOE_TREASURE_DROP_ENEMY_KEYS.has(enemyKey ?? "");
}

/**
 * @param {string} sourceEnemyKey
 * @param {{ playerHasBoardRide?: boolean }} [opts]
 */
export function lootItemIdForMoeTreasureDrop(sourceEnemyKey, opts = {}) {
  if (sourceEnemyKey === "gustav_junior") {
    if (!opts.playerHasBoardRide) {
      return MOE_ITEM_NINJA_TABI.id;
    }
    return MOE_ITEM_EXPERIENCE_CUBE.id;
  }
  return MOE_ITEM_EXPERIENCE_POWDER.id;
}

/**
 * @param {number} id
 * @param {number} x
 * @param {number} y
 * @param {string} [sourceEnemyKey]
 * @returns {MoeFieldTreasure}
 */
export function createMoeFieldTreasureDrop(
  id,
  x,
  y,
  sourceEnemyKey = "orc_infantry",
  opts = {}
) {
  return {
    id,
    x,
    y,
    state: "closed",
    lootItemId: lootItemIdForMoeTreasureDrop(sourceEnemyKey, opts),
    sourceEnemyKey,
  };
}

/**
 * 撃破した敵のそばに宝を落とす座標（ペット位置ではなく敵基準）
 * @param {{ x: number, y: number }} enemyPos
 * @param {{ x: number, y: number }} [biasFrom] 敵→この点方向へ少しずらす（視認性）
 */
export function moeTreasureDropPositionNearEnemy(enemyPos, biasFrom) {
  const ex = enemyPos.x;
  const ey = enemyPos.y;
  if (
    biasFrom &&
    Number.isFinite(biasFrom.x) &&
    Number.isFinite(biasFrom.y)
  ) {
    const ux = biasFrom.x - ex;
    const uy = biasFrom.y - ey;
    const len = Math.hypot(ux, uy);
    if (len > 0.08) {
      const dist = 2.4;
      return {
        x: ex + (ux / len) * dist,
        y: ey + (uy / len) * dist,
      };
    }
  }
  return {
    x: ex + (Math.random() - 0.5) * 1.4,
    y: ey + (Math.random() - 0.5) * 1.4,
  };
}

/**
 * @param {number} enemyId
 * @param {number} fallbackX
 * @param {number} fallbackY
 * @param {{ petPosRef: { current: { x: number, y: number } }, duelRef: { current: object | null }, enemiesRef: { current: object[] } }} refs
 */
export function resolveMoeTreasureDropPosition(
  enemyId,
  fallbackX,
  fallbackY,
  refs
) {
  const enemy = refs.enemiesRef.current.find((e) => e.id === enemyId);
  if (enemy) {
    return moeTreasureDropPositionNearEnemy(
      { x: enemy.x, y: enemy.y },
      refs.petPosRef.current
    );
  }
  return { x: fallbackX, y: fallbackY };
}

/** @param {string} lootItemId */
export function getMoeFieldLootItem(lootItemId) {
  return MOE_FIELD_LOOT_ITEMS[lootItemId] ?? null;
}

/** @param {string | undefined | null} itemId */
export function isMoeExpConsumableItemId(itemId) {
  const item = itemId ? MOE_FIELD_LOOT_ITEMS[itemId] : null;
  return item?.expAmount != null && item.expAmount !== 0;
}

/** @param {string | undefined | null} itemId */
export function isMoePhoenixFeatherItemId(itemId) {
  return itemId === MOE_ITEM_PHOENIX_FEATHER.id;
}

/** ギュスターヴ撃破で落ちた宝（リセット用） */
export function isGustavJuniorTreasure(tr) {
  return (
    tr?.sourceEnemyKey === "gustav_junior" ||
    tr?.lootItemId === MOE_ITEM_EXPERIENCE_CUBE.id
  );
}

