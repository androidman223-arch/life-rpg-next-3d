/**
 * MOE 参考 — 敵32体 glb 一括生成（16タイプ × 2）
 * npm run generate:monster-lineup
 */
import { exportModelGlb } from "../petGlbShared.mjs";
import { MOE_MONSTER_VARIANTS } from "./monsterVariantCatalog.mjs";
import { MONSTER_TYPE_BUILDERS } from "./monsterTypeBuilders.mjs";

for (const variant of MOE_MONSTER_VARIANTS) {
  const build = MONSTER_TYPE_BUILDERS[variant.builder];
  if (!build) throw new Error(`No builder: ${variant.builder}`);

  console.log(`\n=== ${variant.nameJa} [${variant.variantLabel}] (${variant.file}) ===`);
  if (variant.shapeNote) console.log(`形状: ${variant.shapeNote}`);

  await exportModelGlb(
    () => build(variant.palette, variant.variantIndex),
    variant.file,
    "monster",
    variant.anim ?? {}
  );
}

console.log(`\nDone: ${MOE_MONSTER_VARIANTS.length} monster variants.`);
