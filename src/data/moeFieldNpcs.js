/** フィールド NPC・会話（MOE ミーリム海岸） */

/** @typedef {{ speaker: 'master' | 'pet' | 'narrator', text: string }} MoeDialogueLine */

export { MOE_PET_EXP_VENDOR_NPC } from "./moePetExpShopCatalog";
export { MOE_JOSEPH_NPC } from "./moeJosephExpCrystal";
export {
  MOE_SOUL_MEMORY_RHODA_NPC,
  MOE_SOUL_MEMORY_RHODA_BUTTON,
  MOE_SOUL_MEMORY_RHODA_FIELD,
  MOE_SOUL_MEMORY_RHODA_LINES,
  MOE_SOUL_MEMORY_RHODA_GIVE_ACTIONS,
} from "./moeSoulMemoryRhoda";

export const MOE_PET_MASTER_NPC = {
  id: "pet_master",
  name: "ペットマスター・ハーヴ",
  emoji: "👴",
  houseLabel: "ペット小屋",
  houseEmoji: "🏠",
};

/**
 * ペットマスター会話（創造儀式 Lv100/120 は予告のみ）
 * @param {{ name: string, emoji: string }} petData
 * @param {number} petLevel
 * @returns {MoeDialogueLine[]}
 */
export function buildPetMasterDialogue(petData, petLevel) {
  const lv = Math.round(Number(petLevel) * 10) / 10;
  return [
    {
      speaker: "master",
      text: "ようこそ、ペット小屋へ。ワシがペットマスターのハーヴじゃ。",
    },
    {
      speaker: "master",
      text: "育てたペットの調子を見て、これから先の育成を助けるのが役目じゃな。",
    },
    {
      speaker: "pet",
      text: `……${petData.emoji} ${petData.name}、ここにいます。現在 Lv.${lv} です。`,
    },
    {
      speaker: "master",
      text: `ふむ、${petData.name}……まだ伸びしろが十分あるのう。`,
    },
    {
      speaker: "master",
      text: "ボス戦に備えるなら、ここで Lv.100 の創造儀式（テスト）も試せるぞ。",
    },
    {
      speaker: "master",
      text: "儀式のあと元に戻すこともできる。本番の Lv.120 はまた準備中じゃ。",
    },
    {
      speaker: "master",
      text: "メニューから選んでくれ。フィールドも忘れるでないぞ。",
    },
  ];
}
