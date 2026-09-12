import {
  moe3dMapSlotById,
  moe3dTileIndexWorldRect,
} from "@/lib/moe3dWorldLayout";
import { moe3dDesertPreviewTileIndex } from "@/lib/moe3dDesertPreviewTile";
import {
  MOE_3D_LEGACY_TILES_X,
  MOE_3D_LEGACY_TILES_Z,
} from "@/lib/moeField3DModels";
import { moeMonsterFieldBase } from "@/data/moeMonsterFieldRegistry";
import { moeHatiilDesertActiveSpawnSpecs } from "@/data/moeHatiilDesertPlanned";
import { moeAlbeezForestActiveSpawnSpecs } from "@/data/moeAlbeezForestPlanned";
import { moeElanPalaceActiveSpawnSpecs } from "@/data/moeElanPalacePlanned";
import { moeNeokuMountainActiveSpawnSpecs } from "@/data/moeNeokuMountainPlanned";
import { moeSulfurMineActiveSpawnSpecs } from "@/data/moeSulfurMinePlanned";
import { MOE_MACRO1_PHASE3_SPAWN_SPECS } from "@/data/moeMacro1Phase3Spawns";
import {
  macro2L3PlayerClearDist,
  macro2L3RespawnMargin,
  macro2L3TunedSpawnCoords,
} from "@/lib/moe3dMacro2L3Spawns";

/**
 * マップ面内の初期湧き（正規化 tx/tz · 0..1）
 * @type {{ mapSlotId: string, key: string, tx: number, tz: number, modelVariantId?: string, slotInZone?: number }[]}
 */
export const MOE_MONSTER_FIELD_SPAWN_SPECS = [
  // レクスール・ヒルズ — レスクール系 + ギガース
  { mapSlotId: "lexur_hills", key: "rescue_hound", tx: 0.28, tz: 0.62, modelVariantId: "rescue_hound_a", slotInZone: 0 },
  { mapSlotId: "lexur_hills", key: "rescue_hound", tx: 0.38, tz: 0.55, modelVariantId: "rescue_hound_b", slotInZone: 1 },
  { mapSlotId: "lexur_hills", key: "rescue_lion", tx: 0.52, tz: 0.48, modelVariantId: "rescue_lion_a", slotInZone: 0 },
  { mapSlotId: "lexur_hills", key: "rescue_lion", tx: 0.62, tz: 0.42, modelVariantId: "rescue_lion_b", slotInZone: 1 },
  { mapSlotId: "lexur_hills", key: "rescue_bear", tx: 0.44, tz: 0.72, modelVariantId: "rescue_bear_a", slotInZone: 0 },
  { mapSlotId: "lexur_hills", key: "rescue_amazoness", tx: 0.72, tz: 0.58, modelVariantId: "rescue_amazoness_a", slotInZone: 0 },
  { mapSlotId: "lexur_hills", key: "gigas_boss", tx: 0.55, tz: 0.28, modelVariantId: "gigas_boss_a", slotInZone: 0 },
  { mapSlotId: "lexur_hills", key: "rescue_buck", tx: 0.32, tz: 0.52, modelVariantId: "rescue_buck_a", slotInZone: 0 },
  // マクロ１ · 2サイクル
  { mapSlotId: "lexur_hills", key: "rescue_buck", tx: 0.68, tz: 0.45, modelVariantId: "rescue_buck_b", slotInZone: 1 },
  // マクロ１ · 3サイクル
  { mapSlotId: "lexur_hills", key: "rescue_bear", tx: 0.18, tz: 0.38, modelVariantId: "rescue_bear_a", slotInZone: 1 },
  // マクロ１ · 4サイクル
  { mapSlotId: "lexur_hills", key: "rescue_amazoness", tx: 0.45, tz: 0.25, modelVariantId: "rescue_amazoness_a", slotInZone: 1 },
  // マクロ１ · 5サイクル
  { mapSlotId: "lexur_hills", key: "rescue_hound", tx: 0.15, tz: 0.72, modelVariantId: "rescue_hound_a", slotInZone: 2 },

  // ミーリム海岸
  { mapSlotId: "meerim_coast", key: "meerim_rat", tx: 0.32, tz: 0.55, modelVariantId: "meerim_rat_b", slotInZone: 0 },
  { mapSlotId: "meerim_coast", key: "meerim_snake", tx: 0.55, tz: 0.48, modelVariantId: "meerim_snake_b", slotInZone: 0 },
  { mapSlotId: "meerim_coast", key: "sea_snake_field", tx: 0.68, tz: 0.62, modelVariantId: "sea_snake_a", slotInZone: 0 },
  { mapSlotId: "meerim_coast", key: "meerim_eats", tx: 0.42, tz: 0.62, modelVariantId: "meerim_eats_a", slotInZone: 0 },
  { mapSlotId: "meerim_coast", key: "meerim_snake", tx: 0.25, tz: 0.35, modelVariantId: "meerim_snake_b", slotInZone: 1 },
  { mapSlotId: "meerim_coast", key: "meerim_eats", tx: 0.58, tz: 0.28, modelVariantId: "meerim_eats_a", slotInZone: 1 },
  { mapSlotId: "meerim_coast", key: "meerim_rat", tx: 0.48, tz: 0.22, modelVariantId: "meerim_rat_b", slotInZone: 1 },
  { mapSlotId: "meerim_coast", key: "sea_snake_field", tx: 0.38, tz: 0.78, modelVariantId: "sea_snake_a", slotInZone: 1 },

  // エルビン渓谷
  { mapSlotId: "elvin_valley", key: "elvin_spider", tx: 0.35, tz: 0.58, modelVariantId: "elvin_spider_a", slotInZone: 0 },
  { mapSlotId: "elvin_valley", key: "elvin_wolf", tx: 0.58, tz: 0.45, modelVariantId: "elvin_wolf_a", slotInZone: 0 },
  { mapSlotId: "elvin_valley", key: "elvin_bison", tx: 0.48, tz: 0.62, modelVariantId: "elvin_bison_a", slotInZone: 0 },
  { mapSlotId: "elvin_valley", key: "elvin_bison", tx: 0.22, tz: 0.42, modelVariantId: "elvin_bison_b", slotInZone: 1 },
  { mapSlotId: "elvin_valley", key: "elvin_spider", tx: 0.62, tz: 0.68, modelVariantId: "elvin_spider_a", slotInZone: 1 },
  { mapSlotId: "elvin_valley", key: "elvin_wolf", tx: 0.72, tz: 0.55, modelVariantId: "elvin_wolf_a", slotInZone: 1 },
  { mapSlotId: "elvin_valley", key: "elvin_bison", tx: 0.68, tz: 0.28, modelVariantId: "elvin_bison_a", slotInZone: 2 },

  // ガルム回廊 / イルヴァーナ渓谷
  { mapSlotId: "garm_corridor", key: "orc_gang", tx: 0.42, tz: 0.52, modelVariantId: "orc_gang_a", slotInZone: 0 },
  { mapSlotId: "garm_corridor", key: "garm_deer", tx: 0.58, tz: 0.38, modelVariantId: "garm_deer_a", slotInZone: 0 },
  { mapSlotId: "garm_corridor", key: "garm_deer", tx: 0.35, tz: 0.65, modelVariantId: "garm_deer_b", slotInZone: 1 },
  { mapSlotId: "garm_corridor", key: "orc_gang", tx: 0.65, tz: 0.55, modelVariantId: "orc_gang_a", slotInZone: 1 },
  { mapSlotId: "garm_corridor", key: "orc_gang", tx: 0.22, tz: 0.42, modelVariantId: "orc_gang_a", slotInZone: 2 },
  { mapSlotId: "garm_corridor", key: "garm_deer", tx: 0.72, tz: 0.62, modelVariantId: "garm_deer_a", slotInZone: 2 },
  { mapSlotId: "ilvana_valley", key: "orc_magician", tx: 0.62, tz: 0.42, modelVariantId: "orc_magician_a", slotInZone: 0 },
  { mapSlotId: "ilvana_valley", key: "ilvana_wolf", tx: 0.28, tz: 0.58, modelVariantId: "ilvana_wolf_a", slotInZone: 0 },
  { mapSlotId: "ilvana_valley", key: "ilvana_wolf", tx: 0.55, tz: 0.68, modelVariantId: "ilvana_wolf_b", slotInZone: 1 },
  { mapSlotId: "ilvana_valley", key: "orc_magician", tx: 0.35, tz: 0.72, modelVariantId: "orc_magician_a", slotInZone: 1 },
  { mapSlotId: "ilvana_valley", key: "orc_magician", tx: 0.72, tz: 0.28, modelVariantId: "orc_magician_a", slotInZone: 2 },
  { mapSlotId: "ilvana_valley", key: "ilvana_wolf", tx: 0.42, tz: 0.22, modelVariantId: "ilvana_wolf_a", slotInZone: 2 },

  // 砂漠プレビュー（東 · ハティル見本）
  { mapSlotId: "desert_preview", key: "sandworm", tx: 0.55, tz: 0.62, modelVariantId: "sandworm_a", slotInZone: 0 },
  { mapSlotId: "desert_preview", key: "sand_scorpion", tx: 0.3, tz: 0.38, modelVariantId: "sand_scorpion_a", slotInZone: 0 },
  { mapSlotId: "desert_preview", key: "desert_scorpion_med", tx: 0.62, tz: 0.42, modelVariantId: "desert_scorpion_med_a", slotInZone: 0 },
  { mapSlotId: "desert_preview", key: "desert_scorpion_med", tx: 0.38, tz: 0.68, modelVariantId: "desert_scorpion_med_b", slotInZone: 1 },
  { mapSlotId: "desert_preview", key: "sandworm", tx: 0.42, tz: 0.52, modelVariantId: "sandworm_a", slotInZone: 1 },
  { mapSlotId: "desert_preview", key: "sand_scorpion", tx: 0.52, tz: 0.72, modelVariantId: "sand_scorpion_a", slotInZone: 1 },
  { mapSlotId: "desert_preview", key: "desert_scorpion_med", tx: 0.22, tz: 0.52, modelVariantId: "desert_scorpion_med_a", slotInZone: 2 },

  // スローリム平原（ワープ pad）
  { mapSlotId: "slorim_plain", key: "gigas_mammoth", tx: 0.38, tz: 0.52, modelVariantId: "gigas_mammoth_a", slotInZone: 0 },
  { mapSlotId: "slorim_plain", key: "gigas_mammoth", tx: 0.58, tz: 0.48, modelVariantId: "gigas_mammoth_b", slotInZone: 1 },
  { mapSlotId: "slorim_plain", key: "slorim_lion", tx: 0.48, tz: 0.38, modelVariantId: "slorim_lion_a", slotInZone: 0 },
  { mapSlotId: "slorim_plain", key: "slorim_lion", tx: 0.65, tz: 0.62, modelVariantId: "slorim_lion_b", slotInZone: 1 },
  { mapSlotId: "slorim_plain", key: "gigas_mammoth", tx: 0.22, tz: 0.65, modelVariantId: "gigas_mammoth_a", slotInZone: 2 },
  { mapSlotId: "slorim_plain", key: "slorim_lion", tx: 0.28, tz: 0.72, modelVariantId: "slorim_lion_a", slotInZone: 2 },
  { mapSlotId: "slorim_plain", key: "slorim_lion", tx: 0.52, tz: 0.72, modelVariantId: "slorim_lion_b", slotInZone: 3 },

  // イプス峡谷
  { mapSlotId: "ips_canyon", key: "turtle", tx: 0.38, tz: 0.58, modelVariantId: "turtle_a", slotInZone: 0 },
  { mapSlotId: "ips_canyon", key: "turtle", tx: 0.52, tz: 0.52, modelVariantId: "turtle_b", slotInZone: 1 },
  { mapSlotId: "ips_canyon", key: "giant_tortoise", tx: 0.62, tz: 0.42, modelVariantId: "giant_tortoise_a", slotInZone: 0 },
  { mapSlotId: "ips_canyon", key: "ips_bass", tx: 0.45, tz: 0.35, modelVariantId: "ips_bass_a", slotInZone: 0 },
  { mapSlotId: "ips_canyon", key: "ips_bass", tx: 0.58, tz: 0.65, modelVariantId: "ips_bass_b", slotInZone: 1 },
  { mapSlotId: "ips_canyon", key: "giant_tortoise", tx: 0.28, tz: 0.32, modelVariantId: "giant_tortoise_b", slotInZone: 1 },
  { mapSlotId: "ips_canyon", key: "giant_tortoise", tx: 0.72, tz: 0.58, modelVariantId: "giant_tortoise_a", slotInZone: 2 },
  { mapSlotId: "ips_canyon", key: "turtle", tx: 0.68, tz: 0.72, modelVariantId: "turtle_a", slotInZone: 2 },

  // ハティル砂漠（MOE_HATIIL_FIELD_ENABLED=true + GLB 完成後）
  ...moeHatiilDesertActiveSpawnSpecs(),

  // スルト鉱山 — 白骨·黒骨·サラマンダー
  ...moeSulfurMineActiveSpawnSpecs(),

  // エルアン宮殿 — 白骨·黒骨
  ...moeElanPalaceActiveSpawnSpecs(),

  // アルビーズの森 — クローラー·パピー
  ...moeAlbeezForestActiveSpawnSpecs(),

  // ネオク山 — ネオクオルヴァン·ノッカー
  ...moeNeokuMountainActiveSpawnSpecs(),

  // マクロ１ · 第3フェーズ · 1サイクル目（war_age 除外14面）
  ...MOE_MACRO1_PHASE3_SPAWN_SPECS,
];

/** @param {string} mapSlotId */
export function moe3dMapSlotWorldRect(mapSlotId, tileW, tileD) {
  if (mapSlotId === "desert_preview") {
    const idx = moe3dDesertPreviewTileIndex(
      MOE_3D_LEGACY_TILES_X,
      MOE_3D_LEGACY_TILES_Z
    );
    return moe3dTileIndexWorldRect(idx.ix, idx.iz, tileW, tileD);
  }
  const slot = moe3dMapSlotById(mapSlotId);
  if (!slot || !tileW || !tileD) return null;
  return moe3dTileIndexWorldRect(slot.ix, slot.iz, tileW, tileD);
}

/**
 * 全フィールド敵のワールド座標
 * @param {number} tileW
 * @param {number} tileD
 */
export function moe3dMonsterFieldSpawnPoints(tileW, tileD) {
  /** @type {{ key: string, mapSlotId: string, modelVariantId?: string, slotInZone: number, x: number, y: number }[]} */
  const out = [];
  for (const spec of MOE_MONSTER_FIELD_SPAWN_SPECS) {
    const rect = moe3dMapSlotWorldRect(spec.mapSlotId, tileW, tileD);
    if (!rect) continue;
    const w = rect.maxX - rect.minX;
    const d = rect.maxZ - rect.minZ;
    const tuned = macro2L3TunedSpawnCoords(spec.tx, spec.tz, spec.mapSlotId);
    out.push({
      key: spec.key,
      mapSlotId: spec.mapSlotId,
      modelVariantId: spec.modelVariantId,
      slotInZone: spec.slotInZone ?? 0,
      x: rect.minX + w * tuned.tx,
      y: rect.minZ + d * tuned.tz,
    });
  }
  return out;
}

/**
 * マップ面内リスポーン
 * @param {string} mapSlotId
 * @param {number} tileW
 * @param {number} tileD
 * @param {{ x: number, y: number }} playerPos
 * @param {{ id: number, x: number, y: number, hp: number }[]} others
 * @param {number} excludeId
 */
export function moe3dPickRespawnInMapSlot(
  mapSlotId,
  tileW,
  tileD,
  playerPos,
  others,
  excludeId
) {
  const rect = moe3dMapSlotWorldRect(mapSlotId, tileW, tileD);
  if (!rect) return { x: 0, y: 0 };
  const marginNorm = macro2L3RespawnMargin(mapSlotId);
  const marginX = (rect.maxX - rect.minX) * marginNorm;
  const marginZ = (rect.maxZ - rect.minZ) * marginNorm;
  const playerClear = macro2L3PlayerClearDist(mapSlotId);
  for (let attempt = 0; attempt < 36; attempt++) {
    const x =
      rect.minX +
      marginX +
      Math.random() * (rect.maxX - rect.minX - marginX * 2);
    const y =
      rect.minZ +
      marginZ +
      Math.random() * (rect.maxZ - rect.minZ - marginZ * 2);
    if (Math.hypot(x - playerPos.x, y - playerPos.y) < playerClear) continue;
    let ok = true;
    for (const o of others) {
      if (o.id === excludeId || o.hp <= 0) continue;
      if (Math.hypot(x - o.x, y - o.y) < 14) {
        ok = false;
        break;
      }
    }
    if (ok) return { x, y };
  }
  const fallback = moe3dMonsterFieldSpawnPoints(tileW, tileD).find(
    (p) => p.mapSlotId === mapSlotId
  );
  if (fallback) return { x: fallback.x, y: fallback.y };
  return {
    x: (rect.minX + rect.maxX) / 2,
    y: (rect.minZ + rect.maxZ) / 2,
  };
}

/** 登録済みマップスロット ID 一覧 */
export function moe3dMonsterFieldMapSlotIds() {
  return [...new Set(MOE_MONSTER_FIELD_SPAWN_SPECS.map((s) => s.mapSlotId))];
}

/** @param {string} mapSlotId @param {string} key */
export function moe3dMonsterFieldSpawnSpec(mapSlotId, key, slotInZone = 0) {
  return (
    MOE_MONSTER_FIELD_SPAWN_SPECS.find(
      (s) =>
        s.mapSlotId === mapSlotId &&
        s.key === key &&
        (s.slotInZone ?? 0) === slotInZone
    ) ?? null
  );
}

/** マップスロット湧き（ハティル等）— 試作 hills の mid/super 固定座標を使わない */
export function moe3dIsMapSlotFieldEnemy(en) {
  const area = en?.spawnArea ?? en?.mapSlotId;
  return Boolean(area && moe3dMonsterFieldMapSlotIds().includes(area));
}

/** @param {string} mapSlotId @param {string} key @param {number} [slotInZone=0] */
export function moe3dMonsterFieldSpawnWorld(mapSlotId, key, slotInZone, tileW, tileD) {
  const spec = moe3dMonsterFieldSpawnSpec(mapSlotId, key, slotInZone);
  if (!spec) return null;
  const rect = moe3dMapSlotWorldRect(mapSlotId, tileW, tileD);
  if (!rect) return null;
  const w = rect.maxX - rect.minX;
  const d = rect.maxZ - rect.minZ;
  const tuned = macro2L3TunedSpawnCoords(spec.tx, spec.tz, mapSlotId);
  return {
    x: rect.minX + w * tuned.tx,
    y: rect.minZ + d * tuned.tz,
  };
}

/** @param {string} key */
export function moe3dMonsterFieldModelVariantForKey(key, slotInZone = 0) {
  const base = moeMonsterFieldBase(key);
  if (!base) return null;
  const spec = MOE_MONSTER_FIELD_SPAWN_SPECS.find(
    (s) => s.key === key && (s.slotInZone ?? 0) === slotInZone
  );
  return spec?.modelVariantId ?? null;
}
