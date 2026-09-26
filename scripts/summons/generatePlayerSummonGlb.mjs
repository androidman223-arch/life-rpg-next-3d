/**
 * プレイヤー召喚 GLB 生成（生活改鳳 · 自力整龍）
 * npm run generate:summons
 */
import { exportModelGlb } from "../petGlbShared.mjs";
import { MOE_PLAYER_SUMMON_VARIANTS } from "./playerSummonCatalog.mjs";
import { buildPlayerSummonPhoenixRoot } from "./playerPhoenixBuilder.mjs";
import { buildPlayerSummonSeiryuRoot } from "./playerSeiryuDragonBuilder.mjs";

/** @param {typeof MOE_PLAYER_SUMMON_VARIANTS[number]} variant */
function buildSummonRoot(variant) {
  const palette = { ...variant.palette, id: variant.id };
  if (variant.id === "phoenix") return buildPlayerSummonPhoenixRoot(palette);
  if (variant.id === "seiryu") return buildPlayerSummonSeiryuRoot(palette);
  throw new Error(`No builder for summon id: ${variant.id}`);
}

for (const variant of MOE_PLAYER_SUMMON_VARIANTS) {
  console.log(`\n=== ${variant.nameJa} (${variant.file}) ===`);
  console.log(`形状: ${variant.shapeNote}`);
  console.log(`スキル: ${variant.skillId}`);
  await exportModelGlb(
    () => buildSummonRoot(variant),
    variant.file,
    "summon",
    { wingFlap: variant.wingFlap !== false, bodyBob: 1.15 }
  );
}

console.log(`\nDone: ${MOE_PLAYER_SUMMON_VARIANTS.length} player summon models.`);
