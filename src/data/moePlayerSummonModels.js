/**
 * プレイヤー召喚スキル — 3D モデル参照
 * GLB: npm run generate:summons
 */

export const MOE_PLAYER_SUMMON_PHOENIX_MODEL_URL =
  "/assets/models/summon/PlayerSummonPhoenix.glb";

export const MOE_PLAYER_SUMMON_DRAGON_MODEL_URL =
  "/assets/models/summon/PlayerSummonDragon.glb";

/** @type {Record<string, { url: string, nameJa: string, skillId: string }>} */
export const MOE_PLAYER_SUMMON_MODELS = {
  jiriki_kaihou: {
    url: MOE_PLAYER_SUMMON_PHOENIX_MODEL_URL,
    nameJa: "鳳凰",
    skillId: "jiriki_kaihou",
  },
  jiriki_seiryu: {
    url: MOE_PLAYER_SUMMON_DRAGON_MODEL_URL,
    nameJa: "整龍",
    skillId: "jiriki_seiryu",
  },
};

/** @param {string} skillId */
export function moePlayerSummonModelForSkill(skillId) {
  return MOE_PLAYER_SUMMON_MODELS[skillId] ?? null;
}
