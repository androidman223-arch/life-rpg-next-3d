/**
 * 全ペット glb を一括生成
 * 実行: npm run generate:pets
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const generators = [
  "generateSunSpiritGlb.mjs",
  "pets/generateMysteryDragonGlb.mjs",
  "pets/generateBoldEagleGlb.mjs",
  "pets/generateElementalAtrumGlb.mjs",
  "pets/generateCalgocheGlb.mjs",
  "pets/generateCarnivalElephantGlb.mjs",
  "pets/generateAbinyanGlb.mjs",
];

for (const file of generators) {
  const scriptPath = path.join(__dirname, file);
  console.log(`\n=== ${file} ===`);
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\nAll pet GLBs generated.");
