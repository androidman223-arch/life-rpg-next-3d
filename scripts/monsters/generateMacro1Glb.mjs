/**
 * マクロ１追加モンスター GLB — familyId 指定
 * npm run generate:macro1 -- rescue_buck
 */
import { exportModelGlb } from "../petGlbShared.mjs";
import { MOE_MONSTER_VARIANTS } from "./monsterVariantCatalog.mjs";
import { MONSTER_TYPE_BUILDERS } from "./monsterTypeBuilders.mjs";

const familyFilter = process.argv.slice(2);

const variants = MOE_MONSTER_VARIANTS.filter((v) => {
  if (!v.macro1) return false;
  if (familyFilter.length === 0) return true;
  return familyFilter.includes(v.familyId);
});

if (variants.length === 0) {
  console.error(
    "No macro1 variants matched. Usage: node scripts/monsters/generateMacro1Glb.mjs [familyId ...]"
  );
  process.exit(1);
}

for (const variant of variants) {
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

console.log(`\nDone: ${variants.length} macro1 variant(s).`);
