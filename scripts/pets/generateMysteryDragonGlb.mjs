import { buildMysteryDragonRoot } from "./mysteryDragonBuilder.mjs";
import { exportPetGlb } from "../petGlbShared.mjs";
import { MOE_DRAGON_VARIANTS } from "./dragonVariantCatalog.mjs";

await exportPetGlb(
  () => buildMysteryDragonRoot(MOE_DRAGON_VARIANTS[0].palette),
  "MysteryDragon.glb",
  { wingFlap: true }
);
