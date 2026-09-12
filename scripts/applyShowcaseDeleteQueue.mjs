/**
 * data/moeShowcaseDeleteQueue.json のモデルを本当に削除
 * - GLB ファイル削除
 * - src/data ラインナップ更新
 * - scripts カタログ更新
 *
 * npm run apply:showcase-delete
 * npm run apply:showcase-delete -- --dry-run
 */
import { readFile, writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { MOE_MONSTER_VARIANTS } from "./monsters/monsterVariantCatalog.mjs";
import { MOE_DRAGON_VARIANTS } from "./pets/dragonVariantCatalog.mjs";
import { MOE_MONSTER_FAMILIES } from "../src/data/moeMonsterLineup.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const QUEUE_PATH = join(ROOT, "data/moeShowcaseDeleteQueue.json");
const DRY_RUN = process.argv.includes("--dry-run");

async function readQueue() {
  const raw = await readFile(QUEUE_PATH, "utf8");
  return JSON.parse(raw);
}

function glbPath(kind, file) {
  if (!file) return null;
  const base =
    kind === "dragon"
      ? join(ROOT, "public/assets/models/pet")
      : join(ROOT, "public/assets/models/monster");
  return join(base, file);
}

function writeMonsterLineupJs(variants, families) {
  const lines = variants.map(
    (v) =>
      `  { id: "${v.id}", familyId: "${v.familyId}", file: "${v.file}", nameJa: "${v.nameJa}", variantLabel: "${v.variantLabel}", note: "${v.note ?? v.shapeNote ?? ""}" },`
  );
  const familyLines = families.map(
    (f) =>
      `  {
    id: "${f.id}",
    nameJa: "${f.nameJa}",
    shapeNote: "${f.shapeNote}",
  },`
  );
  const body = `/** MOE 参考 — 敵16タイプ × 2匹（計32 · glb ファイル名） */
export const MOE_MONSTER_FAMILIES = [
${familyLines.join("\n")}
];

/** @type {{ id: string, familyId: string, file: string, nameJa: string, variantLabel: string, note: string }[]} */
export const MOE_MONSTER_LINEUP = [
${lines.join("\n")}
];
`;
  return body;
}

function writeDragonLineupJs(variants) {
  const blocks = variants.map((v) => {
    const note = v.note ?? v.shapeNote ?? "";
    return `  {
    id: "${v.id}",
    file: "${v.file}",
    nameJa: "${v.nameJa}",
    note: "${note}",
  },`;
  });
  return `/** ドラゴン展示 — MOE 参考10タイプ（タイプ別シルエット · glb ファイル名） */
export const MOE_DRAGON_LINEUP = [
${blocks.join("\n")}
];
`;
}

async function writeCatalog(path, exportName, variants, header) {
  const content = `${header}\nexport const ${exportName} = ${JSON.stringify(variants, null, 2)};\n`;
  await writeFile(path, content, "utf8");
}

async function main() {
  const queue = await readQueue();
  const entries = Array.isArray(queue.entries) ? queue.entries : [];
  if (entries.length === 0) {
    console.log("削除キューは空です:", QUEUE_PATH);
    return;
  }

  const deleteIds = new Set(entries.map((e) => e.id));
  console.log(DRY_RUN ? "\n=== DRY RUN ===" : "\n=== 削除実行 ===");
  console.log(`キュー: ${entries.length}件\n`);

  for (const entry of entries) {
    const path = glbPath(entry.kind, entry.file);
    const label = entry.variantLabel
      ? `${entry.nameJa} · ${entry.variantLabel}`
      : entry.nameJa;
    console.log(`- [${entry.kind}] ${entry.id} — ${label}`);
    console.log(`  file: ${entry.file ?? "(不明)"}`);
    if (!path) {
      console.log("  GLB: スキップ（ファイル名なし）");
      continue;
    }
    if (!existsSync(path)) {
      console.log(`  GLB: 既に無し (${path})`);
      continue;
    }
    if (DRY_RUN) {
      console.log(`  GLB: 削除予定 ${path}`);
    } else {
      await unlink(path);
      console.log(`  GLB: 削除 OK`);
    }
  }

  const remainingMonsters = MOE_MONSTER_VARIANTS.filter((v) => !deleteIds.has(v.id));
  const remainingDragons = MOE_DRAGON_VARIANTS.filter((v) => !deleteIds.has(v.id));

  const monsterLineupRows = remainingMonsters.map((v) => ({
    id: v.id,
    familyId: v.familyId,
    file: v.file,
    nameJa: v.nameJa,
    variantLabel: v.variantLabel,
    note: v.shapeNote ?? v.note ?? "",
  }));
  const familyIds = new Set(remainingMonsters.map((v) => v.familyId));
  const remainingFamilies = MOE_MONSTER_FAMILIES.filter((f) =>
    familyIds.has(f.id)
  );

  const monsterLineupPath = join(ROOT, "src/data/moeMonsterLineup.js");
  const dragonLineupPath = join(ROOT, "src/data/moeDragonVariants.js");
  const monsterCatalogPath = join(ROOT, "scripts/monsters/monsterVariantCatalog.mjs");
  const dragonCatalogPath = join(ROOT, "scripts/pets/dragonVariantCatalog.mjs");

  console.log(`\n残り: 敵 ${remainingMonsters.length} / ドラゴン ${remainingDragons.length}`);

  if (DRY_RUN) {
    console.log("\n--dry-run のためファイルは変更しません。");
    console.log("本番削除: npm run apply:showcase-delete");
    return;
  }

  await writeFile(
    monsterLineupPath,
    writeMonsterLineupJs(monsterLineupRows, remainingFamilies),
    "utf8"
  );
  await writeFile(dragonLineupPath, writeDragonLineupJs(remainingDragons), "utf8");
  await writeCatalog(
    monsterCatalogPath,
    "MOE_MONSTER_VARIANTS",
    remainingMonsters,
    "/** MOE 参考 — 敵バリエーション（apply:showcase-delete で更新） */"
  );
  await writeCatalog(
    dragonCatalogPath,
    "MOE_DRAGON_VARIANTS",
    remainingDragons,
    "/** MOE 参考 — ドラゴンバリエーション（apply:showcase-delete で更新） */"
  );

  const cleared = { updatedAt: new Date().toISOString(), entries: [] };
  await writeFile(QUEUE_PATH, `${JSON.stringify(cleared, null, 2)}\n`, "utf8");

  console.log("\n完了:");
  console.log("- GLB 削除");
  console.log("- src/data/moeMonsterLineup.js");
  console.log("- src/data/moeDragonVariants.js");
  console.log("- scripts/monsters/monsterVariantCatalog.mjs");
  console.log("- scripts/pets/dragonVariantCatalog.mjs");
  console.log("- キューをクリア:", QUEUE_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
