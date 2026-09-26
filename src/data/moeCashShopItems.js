import { MOE_ITEM_SKILL2_TALISMAN } from "@/lib/moePlayerSkill2Talisman";

/** @typedef {{ id: string, label: string, emoji?: string, iconKind?: string }} MoeCashShopItemDef */

export const MOE_ITEM_LOVE_PET = {
  id: "love_pet",
  label: "ラブペット",
  emoji: "💗",
  iconKind: "love_pet",
};

export const MOE_ITEM_LOVE_PET_DX = {
  id: "love_pet_dx",
  label: "ラブペットDX",
  emoji: "💝",
  iconKind: "love_pet_dx",
};

export const MOE_ITEM_LOVE_PET_ALL = {
  id: "love_pet_all",
  label: "ラブペットALL",
  emoji: "💖",
  iconKind: "love_pet_all",
};

/** @param {MoeCashShopItemDef} item */
export function moeCashShopItemToBoxItem(item) {
  if (!item?.id) return null;
  return {
    id: item.id,
    label: item.label ?? item.id,
    ...(item.emoji != null ? { emoji: item.emoji } : {}),
    ...(item.iconKind != null ? { iconKind: item.iconKind } : {}),
  };
}

/** @type {Record<string, MoeCashShopItemDef>} */
export const MOE_CASH_SHOP_ITEM_BY_ACTION = {
  buy_skill2_talisman: MOE_ITEM_SKILL2_TALISMAN,
  buy_love_pet: MOE_ITEM_LOVE_PET,
  buy_love_pet_dx: MOE_ITEM_LOVE_PET_DX,
  buy_love_pet_all: MOE_ITEM_LOVE_PET_ALL,
};
