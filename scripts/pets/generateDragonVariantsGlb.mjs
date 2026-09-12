/**
 * MOE 参考 — ドラゴン10体 glb 一括生成（タイプ別シルエット）
 * npm run generate:dragons
 */
import { buildMysteryDragonRoot } from "./mysteryDragonBuilder.mjs";
import { DRAGON_TYPE_BUILDERS } from "./dragonTypeBuilders.mjs";
import { exportPetGlb } from "../petGlbShared.mjs";
import { MOE_DRAGON_VARIANTS } from "./dragonVariantCatalog.mjs";

/** @param {typeof MOE_DRAGON_VARIANTS[number]} variant */
function buildDragonRoot(variant) {
  const palette = { ...variant.palette, id: variant.id };
  if (variant.id === "mystery") return buildMysteryDragonRoot(palette);
  const build = DRAGON_TYPE_BUILDERS[variant.id];
  if (!build) throw new Error(`No builder for dragon id: ${variant.id}`);
  return build(palette);
}

for (const variant of MOE_DRAGON_VARIANTS) {
  console.log(`\n=== ${variant.nameJa} (${variant.file}) ===`);
  if (variant.shapeNote) console.log(`形状: ${variant.shapeNote}`);
  else if (variant.note) console.log(variant.note);
  await exportPetGlb(() => buildDragonRoot(variant), variant.file, {
    wingFlap: variant.wingFlap !== false,
  });
}

console.log(`\nDone: ${MOE_DRAGON_VARIANTS.length} dragon variants.`);
