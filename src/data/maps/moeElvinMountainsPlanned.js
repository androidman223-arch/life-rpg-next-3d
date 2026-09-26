/**
 * エルビン山脈 — 公式敵（マクロ１ · 山岳帯）
 * https://wikiwiki.jp/moe-pet/エリアガイド/エルビン山脈
 */

import {
  moeFieldHpMaxFromAreaHp,
  moeFieldPetDamageFromLevel,
  moeWikiFromAreaGuideRow,
} from "@/data/moeMonsterFieldRegistry";

export const MOE_ELVIN_MOUNTAINS_FIELD_ENABLED = true;

/** @param {object} spec */
function buildElvinMountainsEntry(spec) {
  const hpMult = spec.hpMultiplier ?? 1;
  return {
    key: spec.key,
    familyId: spec.familyId,
    name: spec.name,
    moeName: spec.moeName ?? spec.name,
    level: spec.level,
    attackInterval: spec.attackInterval,
    captureLife: spec.captureLife,
    skills: spec.skills,
    wiki: moeWikiFromAreaGuideRow(spec.areaRow),
    hpMax: moeFieldHpMaxFromAreaHp(spec.areaHp, hpMult),
    petDamage: spec.petDamage ?? moeFieldPetDamageFromLevel(spec.level),
    emoji: spec.emoji,
    color: spec.color,
    mapSlotId: "elvin_mountains",
    modelFile: spec.modelFile,
    fieldBoss: spec.fieldBoss ?? false,
    planned: true,
    fieldEnabled: MOE_ELVIN_MOUNTAINS_FIELD_ENABLED,
  };
}

export const MOE_ELVIN_MOUNTAINS_PLANNED_REGISTRY = [
  buildElvinMountainsEntry({
    key: "elvin_mount_wolf",
    familyId: "elvin_wolf",
    name: "エルビン ウルフ",
    level: 28.0,
    areaHp: 130.0,
    areaRow: { mp: 0.5, attack: 28.5, defense: 34.0, hit: 28.5, magic: 0.5 },
    attackInterval: 62.0,
    captureLife: "AF",
    skills: ["噛み付き"],
    emoji: "🐺",
    color: "bg-slate-600 border-slate-800",
    modelFile: "ElvinWolfA.glb",
    petDamage: 50,
  }),
  buildElvinMountainsEntry({
    key: "elvin_mount_bison",
    familyId: "elvin_bison",
    name: "エルビン バイソン 牡",
    level: 42.0,
    areaHp: 220.0,
    areaRow: { mp: 0.5, attack: 42.5, defense: 50.5, hit: 42.5, magic: 0.5 },
    attackInterval: 82.0,
    captureLife: "AF",
    skills: ["パワー チャージ", "ホーン チャージ"],
    emoji: "🐂",
    color: "bg-amber-800 border-amber-950",
    modelFile: "ElvinBisonA.glb",
    petDamage: 76,
  }),
  buildElvinMountainsEntry({
    key: "pygmy_gryphon",
    familyId: "pygmy_gryphon",
    name: "ピグミー グリフォン",
    moeName: "サスール グリフォン",
    level: 34.1,
    areaHp: 152.7,
    areaRow: { mp: 0.5, attack: 34.6, defense: 41.3, hit: 34.6, magic: 0.5 },
    attackInterval: 58.0,
    captureLife: "—",
    skills: ["噛み付き", "スクラッチ"],
    emoji: "🦅",
    color: "bg-yellow-700 border-yellow-950",
    modelFile: "PygmyGryphonA.glb",
    petDamage: 62,
  }),
  buildElvinMountainsEntry({
    key: "soil_basilisk",
    familyId: "soil_basilisk",
    name: "ソイル バジリスク",
    level: 76.5,
    areaHp: 520.0,
    areaRow: { mp: 0.5, attack: 77.0, defense: 92.0, hit: 77.0, magic: 0.5 },
    attackInterval: 72.0,
    captureLife: "—",
    skills: ["噛み付き", "ポイズン テイル"],
    emoji: "🦎",
    color: "bg-stone-700 border-stone-950",
    modelFile: "SoilBasiliskA.glb",
    petDamage: 138,
  }),
  buildElvinMountainsEntry({
    key: "auzun_bura",
    familyId: "auzun_bura",
    name: "アウズンブラ",
    level: 120.0,
    areaHp: 193.0,
    areaRow: { mp: 0.5, attack: 118.0, defense: 142.0, hit: 118.0, magic: 72.0 },
    attackInterval: 220.0,
    captureLife: "—",
    skills: ["パワー チャージ", "ホーン チャージ"],
    emoji: "🦬",
    color: "bg-stone-900 border-violet-950",
    modelFile: "Bison01.glb",
    petDamage: 88,
    fieldBoss: true,
    hpMultiplier: 3,
  }),
];

export const MOE_ELVIN_MOUNTAINS_SPAWN_SPECS = [
  {
    mapSlotId: "elvin_mountains",
    key: "elvin_mount_wolf",
    tx: 0.35,
    tz: 0.58,
    modelVariantId: "elvin_wolf_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "elvin_mountains",
    key: "elvin_mount_bison",
    tx: 0.58,
    tz: 0.45,
    modelVariantId: "elvin_bison_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "elvin_mountains",
    key: "elvin_mount_wolf",
    tx: 0.68,
    tz: 0.62,
    modelVariantId: "elvin_wolf_a",
    slotInZone: 1,
  },
  {
    mapSlotId: "elvin_mountains",
    key: "elvin_mount_bison",
    tx: 0.42,
    tz: 0.32,
    modelVariantId: "elvin_bison_b",
    slotInZone: 1,
  },
  {
    mapSlotId: "elvin_mountains",
    key: "pygmy_gryphon",
    tx: 0.52,
    tz: 0.18,
    modelVariantId: "pygmy_gryphon_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "elvin_mountains",
    key: "pygmy_gryphon",
    tx: 0.62,
    tz: 0.22,
    modelVariantId: "pygmy_gryphon_b",
    slotInZone: 1,
  },
  {
    mapSlotId: "elvin_mountains",
    key: "soil_basilisk",
    tx: 0.38,
    tz: 0.48,
    modelVariantId: "soil_basilisk_a",
    slotInZone: 0,
  },
  {
    mapSlotId: "elvin_mountains",
    key: "soil_basilisk",
    tx: 0.72,
    tz: 0.38,
    modelVariantId: "soil_basilisk_b",
    slotInZone: 1,
  },
  {
    mapSlotId: "elvin_mountains",
    key: "auzun_bura",
    tx: 0.52,
    tz: 0.44,
    slotInZone: 0,
  },
];

export function moeElvinMountainsActiveFieldEntries() {
  if (!MOE_ELVIN_MOUNTAINS_FIELD_ENABLED) return [];
  return MOE_ELVIN_MOUNTAINS_PLANNED_REGISTRY.map(
    ({ planned, fieldEnabled, ...e }) => e
  );
}

export function moeElvinMountainsActiveSpawnSpecs() {
  if (!MOE_ELVIN_MOUNTAINS_FIELD_ENABLED) return [];
  return MOE_ELVIN_MOUNTAINS_SPAWN_SPECS;
}
