/**
 * マクロ１ — 公式湧きチェック（Wiki エリアガイド vs フィールド実装）
 */

/** @type {Record<string, Record<string, string>>} */
export const MOE_MACRO1_FIELD_KEY_TO_WIKI_NAME = {
  sulfur_mine: {
    elan_knight_white: "エルアン ナイト（白）",
    elan_knight_black: "エルアン ナイト（黒）",
    salamander: "サラマンダー",
  },
  elan_palace: {
    elan_knight_white: "白骨",
    elan_knight_black: "黒骨",
    giant_destroyer: "ジャイアント デストロイヤー",
    frost_wolf: "フロスト ウルフ",
    gargoyle_lord: "ガーゴイル ロード",
    gargoyle_lord_strong: "ガーゴイル ロード",
    lizardman_soldier: "リザードマン ソルジャー",
    lizardman_mage: "リザードマン メイジ",
    lizardman_captain: "リザードマン キャプテン",
    minotaur_boss: "ミノタウロス",
    dullahan: "デュラハン",
  },
  albeez_forest: {
    riverside_crawler: "リバーサイド クローラー",
    orvan_pappy: "オルヴァン パピー",
  },
  neoku_mountain: {
    neoku_orvan: "ネオク オルヴァン",
    nocker: "ノッカー",
  },
  neoku_plateau: {
    young_orvan: "ヤング オルヴァン",
    neoku_orvan_plateau: "ネオク オルヴァン",
    guard_nocker: "ガード ノッカー",
  },
  darin_mountain: {
    dain_rat: "ダーイン ラット",
    dain_orc_guard: "オーク ガード",
    dain_orc_elite: "オーク エリート",
  },
  eisis_cave: {
    eisis_rat: "エイシス ラット",
    eisis_ixion: "エイシス イクシオン",
    great_tarantula: "グレイト タランチュラ",
  },
  elvin_mountains: {
    elvin_mount_wolf: "エルビン ウルフ",
    elvin_mount_bison: "エルビン バイソン 牡",
    pygmy_gryphon: "ピグミー グリフォン",
    soil_basilisk: "ソイル バジリスク",
    auzun_bura: "アウズンブラ",
  },
  dragon_valley: {
    wild_orvan: "ワイルド オルヴァン",
    ancient_treant: "エンシェント トレント",
    sky_dragon: "スカイドラゴン",
  },
  mutum_catacomb: {
    mutum_zombie_rat: "ゾンビ ラット",
    mutum_wraith_warrior: "レイス(戦士)",
    mutum_rosso_fighter: "ロッソ ファイター",
  },
  bisk: {
    bisk_ixion_water: "イクシオン ウォーター",
  },
  yug_coast: {
    yug_sea_snake: "海ヘビ",
  },
  soles_valley: {
    soles_rescue_hound: "レスクール ハウンド",
  },
};

/**
 * @param {string} mapSlotId
 * @param {{ mapSlotId: string, key: string, modelVariantId?: string }[]} spawnSpecs
 * @param {{ officialEnemies?: string[] }} wikiEntry
 * @param {Set<string>} [knownVariantIds]
 * @returns {string[]}
 */
export function moeMacro1OfficialSpawnIssues(
  mapSlotId,
  spawnSpecs,
  wikiEntry,
  knownVariantIds = new Set()
) {
  const issues = [];
  const keyToWiki = MOE_MACRO1_FIELD_KEY_TO_WIKI_NAME[mapSlotId] ?? {};
  const official = new Set(
    (wikiEntry?.officialEnemies ?? []).filter((name) => !name.startsWith("（"))
  );
  const mapSpawns = spawnSpecs.filter((s) => s.mapSlotId === mapSlotId);
  const spawnedKeys = new Set(mapSpawns.map((s) => s.key));

  for (const key of spawnedKeys) {
    const wikiName = keyToWiki[key];
    if (!wikiName) {
      issues.push(`${mapSlotId}: field key "${key}" has no wiki mapping`);
      continue;
    }
    if (official.size && !official.has(wikiName)) {
      issues.push(
        `${mapSlotId}: "${key}" (${wikiName}) is not in official wiki enemies`
      );
    }
  }

  for (const wikiName of official) {
    const fieldKey = Object.entries(keyToWiki).find(([, name]) => name === wikiName)?.[0];
    if (!fieldKey) {
      issues.push(`${mapSlotId}: official "${wikiName}" has no field key mapping`);
      continue;
    }
    if (!spawnedKeys.has(fieldKey)) {
      issues.push(`${mapSlotId}: official "${wikiName}" has no field spawn`);
    }
  }

  for (const spec of mapSpawns) {
    if (spec.modelVariantId && knownVariantIds.size > 0) {
      if (!knownVariantIds.has(spec.modelVariantId)) {
        issues.push(
          `${mapSlotId}: unknown modelVariantId "${spec.modelVariantId}" for ${spec.key}`
        );
      }
    }
  }

  return issues;
}

/**
 * @param {{ key: string, mapSlotId: string, modelFile?: string, skills?: string[] }[]} registry
 * @param {string} mapSlotId
 * @returns {string[]}
 */
export function moeMacro1RegistryIssues(registry, mapSlotId) {
  const issues = [];
  const entries = registry.filter((e) => e.mapSlotId === mapSlotId);
  if (!entries.length) {
    issues.push(`${mapSlotId}: no field registry entries`);
    return issues;
  }
  const expectedKeys = new Set(
    Object.keys(MOE_MACRO1_FIELD_KEY_TO_WIKI_NAME[mapSlotId] ?? {})
  );
  for (const key of expectedKeys) {
    if (!entries.some((e) => e.key === key)) {
      issues.push(`${mapSlotId}: missing registry entry for ${key}`);
    }
  }
  for (const entry of entries) {
    if (!entry.modelFile) {
      issues.push(`${mapSlotId}: ${entry.key} missing modelFile`);
    }
    if (!entry.skills?.length) {
      issues.push(`${mapSlotId}: ${entry.key} missing skills`);
    }
  }
  return issues;
}
