/**
 * プレイヤー技② — プレイヤー専用スキル（ペット戦闘枠には出さない）
 */

/** @type {object[]} */
export const MOE_PLAYER_SKILL2_ONLY_SKILLS = [
  {
    id: "jiriki_seiran",
    level: 10,
    name: "自力整然",
    type: "jiriki_seiran",
    playerSkill2Only: true,
    mpCost: 13,
    note: "10秒MP回復2倍→5分コンデンス（MP13）",
  },
];
