/**
 * 全モンスター glb を一括生成（public + src/app/monster へ出力）
 * 実行: node scripts/generateAllMonsterGlbs.mjs
 * npm: npm run generate:monsters
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const generators = [
  "generateBisonSimpleGlb.mjs",
  "generateOrcInfantryGlb.mjs",
  "generateStrayIxionGlb.mjs",
  "generateHilltopLionGlb.mjs",
  "generateGustavGiantGlb.mjs",
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

console.log("\nAll monster GLBs generated.");
