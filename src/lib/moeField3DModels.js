import * as THREE from "three";
import { MOE_MONSTER_LINEUP } from "@/data/moeMonsterLineup";
import { moeMacro1DisplayHeight } from "@/data/moeMacro1Constants";
import { moeMacro2EnemyDisplayHeight } from "@/lib/moe3dMacro2L6EnemyScale";
import {
  MOE_MONSTER_FIELD_REGISTRY,
  MOE_MONSTER_MODEL_FILE_BY_VARIANT,
  moeMonsterFieldAllEntries,
} from "@/data/moeMonsterFieldRegistry";
import {
  moe3dBiskHubAnchor,
  moe3dBiskNpcHubAnchor,
} from "@/lib/moe3dBiskHubLayout";
import { MOE_MEERIM_SPECIAL_BOSS_SPAWNS } from "@/data/moeMeerimEnemies";
import { moe3dMapSlotNormSpawnPosition } from "@/lib/moe3dMonsterMapSpawns";

const MOE_MONSTER_GLB_BASE = "/assets/models/monster";

/** @param {string} file */
export function moeMonsterGlbUrl(file) {
  return `${MOE_MONSTER_GLB_BASE}/${file}`;
}

/** 3D MOE — モンスターはすべて glb（runtime procedural 禁止）。
 *  配置: public/assets/models/monster/（制作元 src/app/monster）
 *  形状変更: scripts/generate*.mjs → npm run generate:monsters */
export const PET_MODEL_URL = "/assets/models/pet/Snake_green.glb";
/** 太陽の大精霊 — 低ポリ chibi glb */
export const MOE_SUN_SPIRIT_MODEL_URL = "/assets/models/pet/SunSpirit.glb";
export const MOE_MYSTERY_DRAGON_MODEL_URL = "/assets/models/pet/MysteryDragon.glb";
export const MOE_BOLD_EAGLE_MODEL_URL = "/assets/models/pet/BoldEagle.glb";
export const MOE_ELEMENTAL_ATRUM_MODEL_URL = "/assets/models/pet/ElementalAtrum.glb";
export const MOE_CALGOCHE_MODEL_URL = "/assets/models/pet/Calgoche.glb";
export const MOE_CARNIVAL_ELEPHANT_MODEL_URL = "/assets/models/pet/CarnivalElephant.glb";
export const MOE_ABINYAN_MODEL_URL = "/assets/models/pet/Abinyan.glb";
export {
  MOE_PLAYER_SUMMON_DRAGON_MODEL_URL,
  MOE_PLAYER_SUMMON_PHOENIX_MODEL_URL,
} from "@/data/moePlayerSummonModels";

/** ペット id → glb（未指定は Snake_green） */
export const MOE_PET_MODEL_BY_ID = {
  sun_spirit: MOE_SUN_SPIRIT_MODEL_URL,
  mystery_dragon: MOE_MYSTERY_DRAGON_MODEL_URL,
  bold_eagle: MOE_BOLD_EAGLE_MODEL_URL,
  elemental_atrum: MOE_ELEMENTAL_ATRUM_MODEL_URL,
  calgoche: MOE_CALGOCHE_MODEL_URL,
  carnival_elephant: MOE_CARNIVAL_ELEPHANT_MODEL_URL,
  abinyan: MOE_ABINYAN_MODEL_URL,
};

export function petModelUrlForId(petId) {
  return MOE_PET_MODEL_BY_ID[petId] ?? PET_MODEL_URL;
}

/** ペット id → tint（null = 素材色そのまま） */
export const MOE_PET_TINT_BY_ID = {
  sun_spirit: null,
  mystery_dragon: null,
  bold_eagle: null,
  elemental_atrum: null,
  calgoche: null,
  carnival_elephant: null,
  abinyan: null,
};

export function petTintForId(petId) {
  if (Object.prototype.hasOwnProperty.call(MOE_PET_TINT_BY_ID, petId)) {
    return MOE_PET_TINT_BY_ID[petId];
  }
  return MOE_PET_TINT_DEFAULT;
}

/** ペット id → 表示高さ（fitModelToGround 目標） */
export const MOE_PET_HEIGHT_BY_ID = {
  /** 基準 0.58 × 3 倍表示 */
  sun_spirit: 1.74,
  mystery_dragon: 1.68,
  bold_eagle: 1.35,
  elemental_atrum: 1.45,
  calgoche: 2.44,
  carnival_elephant: 2.1,
  abinyan: 1.05,
};

export function petModelHeightForId(petId) {
  return MOE_PET_HEIGHT_BY_ID[petId] ?? MOE_PET_MODEL_HEIGHT;
}

/** 飛行ペット等 — 地形からの追加浮き（ワールド Y） */
export const MOE_PET_FLOAT_LIFT_BY_ID = {
  sun_spirit: 1.14,
  mystery_dragon: 0.72,
  bold_eagle: 0.95,
};

export function petFloatLiftForId(petId) {
  return MOE_PET_FLOAT_LIFT_BY_ID[petId] ?? 0;
}

export const MONSTER_MODEL_URL = "/assets/models/monster/Snake_green.glb";
/** 牛モンスター glb（エルビン・アウズン） */
export const MOE_BISON_MODEL_URL = "/assets/models/monster/Bison01.glb";
/** 作り込み低ポリ牛 glb（マウンテン／荒くれバイソン） */
export const MOE_MOUNTAIN_BISON_MODEL_URL =
  "/assets/models/monster/MountainBison.glb";
export const MOE_ROUGH_BISON_MODEL_URL =
  "/assets/models/monster/RoughBison.glb";
/** MOE 風オーク歩兵（低ポリ） */
export const MOE_ORC_INFANTRY_MODEL_URL =
  "/assets/models/monster/OrcInfantry.glb";
/** MOE 風はぐれイクシオン（魚人・低ポリ） */
export const MOE_STRAY_IXION_MODEL_URL =
  "/assets/models/monster/StrayIxion.glb";
/** ヒルトップ ライオン（低ポリ glb） */
export const MOE_HILLTOP_LION_MODEL_URL =
  "/assets/models/monster/HilltopLion.glb";
/** ギュスターヴ ジャイアント（簡易）— 低ポリ緑ワニ glb */
export const MOE_GUSTAV_GIANT_MODEL_URL =
  "/assets/models/monster/GustavGiant.glb";
/** トータス / ジャイアント トータス（低ポリ glb） */
export const MOE_IPS_TURTLE_MODEL_URL =
  "/assets/models/monster/IpsTurtleA.glb";
export const MOE_IPS_GIANT_TORTOISE_MODEL_URL =
  "/assets/models/monster/IpsGiantTortoiseA.glb";
/** エルビン／エイシス蜘蛛 glb */
export const MOE_ELVIN_SPIDER_MODEL_URL = moeMonsterGlbUrl("ElvinSpiderA.glb");
export const MOE_ELVIN_SPIDER_B_MODEL_URL = moeMonsterGlbUrl("ElvinSpiderB.glb");
/** エルアン宮殿 · 白骨·黒骨 */
export const MOE_ELAN_KNIGHT_WHITE_A_MODEL_URL = moeMonsterGlbUrl(
  "ElanKnightWhiteA.glb"
);
export const MOE_ELAN_KNIGHT_WHITE_B_MODEL_URL = moeMonsterGlbUrl(
  "ElanKnightWhiteB.glb"
);
export const MOE_ELAN_KNIGHT_BLACK_A_MODEL_URL = moeMonsterGlbUrl(
  "ElanKnightBlackA.glb"
);
export const MOE_ELAN_KNIGHT_BLACK_B_MODEL_URL = moeMonsterGlbUrl(
  "ElanKnightBlackB.glb"
);

/** @param {string | null | undefined} key */
export function isSpiderEnemyKey(key) {
  return key === "elvin_spider" || key === "great_tarantula";
}

/** @param {string | null | undefined} key */
export function isElanKnightEnemyKey(key) {
  return key === "elan_knight_white" || key === "elan_knight_black";
}

/** 敵 key → glb（未指定は Snake） */
export const MOE_ENEMY_MODEL_BY_KEY = {
  elvin_bison: MOE_BISON_MODEL_URL,
  auzun_bura: MOE_BISON_MODEL_URL,
  mountain_bison: MOE_MOUNTAIN_BISON_MODEL_URL,
  rough_bison: MOE_ROUGH_BISON_MODEL_URL,
  orc_infantry: MOE_ORC_INFANTRY_MODEL_URL,
  stray_ixion: MOE_STRAY_IXION_MODEL_URL,
  eisis_ixion: MOE_STRAY_IXION_MODEL_URL,
  bisk_ixion_water: MOE_STRAY_IXION_MODEL_URL,
  hilltop_lion: MOE_HILLTOP_LION_MODEL_URL,
  gustav_junior: MOE_GUSTAV_GIANT_MODEL_URL,
  turtle: MOE_IPS_TURTLE_MODEL_URL,
  giant_tortoise: MOE_IPS_GIANT_TORTOISE_MODEL_URL,
  ...Object.fromEntries(
    moeMonsterFieldAllEntries().map((e) => [
      e.key,
      moeMonsterGlbUrl(e.modelFile),
    ])
  ),
};

/** variantId → glb（2色バリエーション） */
export const MOE_ENEMY_MODEL_BY_VARIANT = Object.fromEntries(
  Object.entries(MOE_MONSTER_MODEL_FILE_BY_VARIANT).map(([id, file]) => [
    id,
    moeMonsterGlbUrl(file),
  ])
);

/** 3D Canvas が preload するモンスター glb（重複なし） */
export const MOE_ALL_MONSTER_MODEL_URLS = [
  ...new Set([
    MONSTER_MODEL_URL,
    ...Object.values(MOE_ENEMY_MODEL_BY_KEY),
    ...MOE_MONSTER_LINEUP.map((v) => moeMonsterGlbUrl(v.file)),
  ]),
];

/** 敵 key ごとの色（同じ glb を clone して material.color を差し替え） */
export const MOE_ENEMY_TINT_BY_KEY = {
  brown_serpent: 0xc2780a,
  hilltop_lion: 0xd4a017,
  orc_infantry: 0xe8b4a8,
  earth_worm: 0xdc2626,
  sea_snake: 0x0891b2,
  stray_ixion: 0x4338ca,
  eisis_ixion: 0x22d3ee,
  bisk_ixion_water: 0x38bdf8,
  elvin_bison: 0x6b4423,
  auzun_bura: 0x3d2817,
  mountain_bison: 0x8b7355,
  rough_bison: 0x4a3020,
};

export const MOE_PET_TINT_DEFAULT = 0x4ade80;

/** 3D プレイヤー — MOE コグニート♂ */
export const MOE_PLAYER_COGNITE_MALE_MODEL_URL =
  "/assets/models/player/CogniteMale.glb";
export const MOE_PLAYER_MODEL_URL = MOE_PLAYER_COGNITE_MALE_MODEL_URL;
/** fitModelToGround 目標（背高・細身） */
export const MOE_PLAYER_MODEL_HEIGHT = 1.52;

/** glb 内の表示高さ（ワールド単位） */
export const MOE_PET_MODEL_HEIGHT = 0.475;
export const MOE_MONSTER_MODEL_HEIGHT = 0.525;
/** アースワーム（蛇 glb の約 2 倍） */
export const MOE_EARTH_WORM_MODEL_HEIGHT = MOE_MONSTER_MODEL_HEIGHT * 2;
/** ブラウンサーペント（蛇 glb の 1.2 倍） */
export const MOE_BROWN_SERPENT_MODEL_HEIGHT = MOE_MONSTER_MODEL_HEIGHT * 1.2;
export const MOE_BISON_MODEL_HEIGHT = 2.05;
export const MOE_MOUNTAIN_BISON_MODEL_HEIGHT = 2.5;
export const MOE_ROUGH_BISON_MODEL_HEIGHT = 3.0;
/** 人型 MOE オーク（スネークより背が高い） */
export const MOE_ORC_INFANTRY_MODEL_HEIGHT = 2.76;
/** 魚人イクシオン（二足・コンパクト） */
export const MOE_STRAY_IXION_MODEL_HEIGHT = 1.32;
/** はぐれイクシオン 3D 表示倍率 */
export const MOE_STRAY_IXION_DISPLAY_SCALE = 3;
/** 3D 表示倍率（fit=1 のあと root.scale に掛ける） */
export const MOE_ORC_INFANTRY_DISPLAY_SCALE = 3;
/** オーク mesh 配置リビジョン（変更時に既存 entry を再生成） */
export const MOE_ORC_MODEL_LAYOUT_REV = 3;
/** アースワーム stripe マテリアルリビジョン（変更時に既存 entry を再生成） */
export const MOE_EARTH_WORM_MATERIAL_REV = 15;
/** ヒルトップ ライオン 3D 表示高さ（fit=1 後 × DISPLAY_SCALE） */
export const MOE_HILLTOP_LION_MODEL_HEIGHT = 0.72;
/** ヒルトップ ライオン 3D 表示倍率 */
export const MOE_HILLTOP_LION_DISPLAY_SCALE = 3;
/** ライオン mesh リビジョン */
export const MOE_HILLTOP_LION_MODEL_LAYOUT_REV = 5;
/** イクシオン mesh リビジョン（変更時に既存 entry を再生成） */
export const MOE_IXION_MODEL_LAYOUT_REV = 6;
/** 体長方向の黒帯の本数（密集させない） */
export const MOE_EARTH_WORM_STRIPE_COUNT = 10;
/** 1 区間あたりの黒帯の割合（太めの縁） */
export const MOE_EARTH_WORM_STRIPE_BLACK_FRAC = 0.3;

/** 3D フィールドの半幅（Three.js x / z とも ±この値。マップ読込後に実測で上書き） */
export const MOE_3D_HALF_W = 180;
export const MOE_3D_HALF_D = 180;
export {
  MOE_3D_LEGACY_TILES_X,
  MOE_3D_LEGACY_TILES_Z,
  MOE_3D_TILE_SPACING,
  moe3dLayoutTileD,
  moe3dLayoutTileW,
} from "@/lib/moe3dLayoutConstants";
/** 試作マップのスポーン／アルター基準 half（本編拡張前の 100） */
export const MOE_3D_LEGACY_REF_HALF = 100;
/** 距離帯（ゾーン）ごとに同種2匹。外側ほど Lv が上がる */
export const MOE_3D_ENEMIES_PER_ZONE = 2;
/** @type {{ level: number, key: string }[]} 中心に近い順（Wiki Lv・小数） */
export const MOE_3D_ENEMY_ZONES = [
  { level: 4.5, key: "brown_serpent" },
  { level: 15.1, key: "hilltop_lion" },
  { level: 23.5, key: "orc_infantry" },
  { level: 41.1, key: "earth_worm" },
  { level: 50.3, key: "stray_ixion" },
];
/** 同ゾーン2匹目の Lv 差（±） */
export const MOE_3D_ZONE_PAIR_LEVEL_OFFSET = 0.3;

/** ビスク中央広場付近・専用ボスエリア（アルター東側を避け西寄り） */
export function moe3dBossAreaLayout(
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D,
  tileW,
  tileD,
  startOverride
) {
  const hub = startOverride ?? moe3dBiskHubAnchor();
  const west = tileW
    ? Math.max(12, tileW * 0.22)
    : Math.max(18, halfW * 0.12);
  const slotSep = tileW
    ? Math.max(10, tileW * 0.18)
    : Math.max(14, halfW * 0.1);
  const north = tileD
    ? Math.max(8, tileD * 0.16)
    : Math.max(10, halfD * 0.05);
  const midBossPos = { x: hub.x - west, y: hub.y - north };
  const superBossPos = { x: hub.x - west - slotSep, y: hub.y - north };
  return {
    center: {
      x: hub.x - west - slotSep * 0.5,
      y: hub.y - north,
    },
    midBossPos,
    superBossPos,
    radiusX: slotSep * 0.65 + 8,
    radiusZ: tileD ? Math.max(8, tileD * 0.16) : Math.max(12, halfD * 0.06),
  };
}

/** 丘の上・中ボス（エルビン バイソン）— ボスエリア内 */
export function moe3dMidBossSpawnPosition(
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D,
  tileW,
  tileD,
  startOverride
) {
  return moe3dBossAreaLayout(
    halfW,
    halfD,
    tileW,
    tileD,
    startOverride
  ).midBossPos;
}

/** 超ボス（アウズンブラ）— エルビン山脈の広い平地 */
export function moe3dSuperBossSpawnPosition(
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D,
  tileW,
  tileD,
  startOverride
) {
  const spec = MOE_MEERIM_SPECIAL_BOSS_SPAWNS.superBoss;
  const onMountains = moe3dMapSlotNormSpawnPosition(
    spec.mapSlotId,
    spec.tx,
    spec.tz,
    tileW,
    tileD
  );
  if (onMountains) return onMountains;
  return moe3dBossAreaLayout(
    halfW,
    halfD,
    tileW,
    tileD,
    startOverride
  ).superBossPos;
}

/** マウンテンバイソン — エルビン渓谷の広い平地 */
export function moe3dMountainBisonSpawnPosition(
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D,
  tileW,
  tileD,
  startOverride
) {
  const spec = MOE_MEERIM_SPECIAL_BOSS_SPAWNS.mountainBison;
  const onValley = moe3dMapSlotNormSpawnPosition(
    spec.mapSlotId,
    spec.tx,
    spec.tz,
    tileW,
    tileD
  );
  if (onValley) return onValley;
  const { midBossPos } = moe3dBossAreaLayout(
    halfW,
    halfD,
    tileW,
    tileD,
    startOverride
  );
  return {
    x: midBossPos.x - (tileW ? Math.max(8, tileW * 0.12) : Math.max(16, halfW * 0.1)),
    y: midBossPos.y + (tileD ? Math.max(10, tileD * 0.22) : Math.max(20, halfD * 0.14)),
  };
}

/** 荒くれバイソン — エルビン渓谷の広い平地（マウンテンバイソン付近） */
export function moe3dRoughBisonSpawnPosition(
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D,
  tileW,
  tileD,
  startOverride
) {
  const spec = MOE_MEERIM_SPECIAL_BOSS_SPAWNS.roughBison;
  const onValley = moe3dMapSlotNormSpawnPosition(
    spec.mapSlotId,
    spec.tx,
    spec.tz,
    tileW,
    tileD
  );
  if (onValley) return onValley;
  const { superBossPos } = moe3dBossAreaLayout(
    halfW,
    halfD,
    tileW,
    tileD,
    startOverride
  );
  return {
    x: superBossPos.x + (tileW ? Math.max(8, tileW * 0.12) : Math.max(16, halfW * 0.1)),
    y: superBossPos.y + (tileD ? Math.max(10, tileD * 0.22) : Math.max(20, halfD * 0.14)),
  };
}

/** ボスエリア内か（通常敵リスポーン除外用） */
export function moe3dIsInBossArea(x, y, halfW, halfD, padding = 8) {
  const area = moe3dBossAreaLayout(halfW, halfD);
  const dx = Math.abs(x - area.center.x);
  const dy = Math.abs(y - area.center.y);
  return dx <= area.radiusX + padding && dy <= area.radiusZ + padding;
}

/**
 * 中ボス敵インスタンスを生成
 * @param {import("@/data/moeMeerimEnemies").MOE_MEERIM_ENEMIES[number]} base
 */
export function buildMeerimMidBossEnemy(base, id, pos, hpMultiplier = 2) {
  const scaled = moe3dEnemyStatsForZoneLevel(base, base.level);
  const hpMax = Math.max(1, Math.round(scaled.hpMax * hpMultiplier));
  const statScale = base.level > 0 ? scaled.level / base.level : 1;
  const petDamageStrong = base.petDamageStrong
    ? Math.max(1, Math.round(base.petDamageStrong * statScale))
    : undefined;
  return {
    ...base,
    id,
    midBoss: true,
    superBoss: false,
    zoneIndex: -1,
    slotInZone: 0,
    zoneLevel: base.level,
    x: pos.x,
    y: pos.y,
    level: scaled.level,
    hp: hpMax,
    hpMax,
    petDamage: scaled.petDamage,
    petDamageStrong,
    wiki: scaled.wiki,
    sy: 2,
  };
}

/** 超ボス敵インスタンスを生成 */
export function buildMeerimSuperBossEnemy(base, id, pos, hpMultiplier = 3) {
  const scaled = moe3dEnemyStatsForZoneLevel(base, base.level);
  const hpMax = Math.max(1, Math.round(scaled.hpMax * hpMultiplier));
  return {
    ...base,
    id,
    midBoss: false,
    superBoss: true,
    zoneIndex: -2,
    slotInZone: 0,
    zoneLevel: base.level,
    x: pos.x,
    y: pos.y,
    level: scaled.level,
    hp: hpMax,
    hpMax,
    petDamage: scaled.petDamage,
    wiki: scaled.wiki,
    sy: 3,
  };
}

/** 3D 表示スケール（中ボス・超ボス・フィールドバイソン） */
export const MOE_MID_BOSS_DISPLAY_SCALE = 3;
export const MOE_SUPER_BOSS_DISPLAY_SCALE = 10.2;
/** バイソン中・超ボス mesh リビジョン（スケール焼き込み変更時に entry 再生成） */
export const MOE_BISON_BOSS_LAYOUT_REV = 2;

export function moe3dEnemyDisplayScale(en) {
  /** 1 = fitModelToGround 済みスケールをそのまま使う（毎フレーム上書きしない） */
  /** 中・超ボスは create 時に scale 焼き込み済み */
  if (en?.superBoss || en?.midBoss) return 1;
  /** フィールドバイソンは MODEL_HEIGHT がそのまま root.scale（fitModelToGround は毎フレーム上書きされる） */
  if (en?.key === "mountain_bison") return MOE_MOUNTAIN_BISON_MODEL_HEIGHT;
  if (en?.key === "rough_bison") return MOE_ROUGH_BISON_MODEL_HEIGHT;
  if (en?.key === "orc_infantry") return 1;
  if (
    en?.key === "stray_ixion" ||
    en?.key === "eisis_ixion" ||
    en?.key === "bisk_ixion_water"
  )
    return 1;
  if (en?.key === "hilltop_lion") return 1;
  if (en?.key === "gustav_junior") return 1;
  if (isSpiderEnemyKey(en?.key)) return 1;
  if (isElanKnightEnemyKey(en?.key)) return 1;
  if (en?.key === "brown_serpent") return 1;
  if (en?.displayScale != null) return en.displayScale;
  return 1;
}

/** ギュスターヴ（簡易）低ポリワニ glb — mesh リビジョン */
export const MOE_GUSTAV_JUNIOR_LAYOUT_REV = 5;
export const MOE_GUSTAV_JUNIOR_MODEL_HEIGHT = 1.35;
/** ギュスターヴ 3D 表示倍率 */
export const MOE_GUSTAV_JUNIOR_DISPLAY_SCALE = 3;
/** glb の向き補正（体長が +X 方向のため） */
export const MOE_GUSTAV_MODEL_YAW_OFFSET = -Math.PI / 2;
/** glb 胴体の長さ（ローカル +X、BoxGeometry 2.4） */
export const MOE_GUSTAV_GLB_BODY_LENGTH = 2.4;
/** fit(高さ1) 前の glb 全高目安 */
const MOE_GUSTAV_GLB_HEIGHT_EST = 0.72;

/** ワールド座標で体1つ分の長さ（fit × display 後の目安） */
export function moe3dGustavBodyLengthWorld() {
  const fitScale = 1 / MOE_GUSTAV_GLB_HEIGHT_EST;
  return (
    MOE_GUSTAV_GLB_BODY_LENGTH * fitScale * MOE_GUSTAV_JUNIOR_DISPLAY_SCALE
  );
}

/** スタートから北へ何体分離すか */
export const MOE_GUSTAV_SPAWN_BODY_LENGTHS_NORTH = 7;

/** ギュスターヴ spawn — ビスク中央から北へ体7つ分（南＝広場側を向く） */
export function moe3dGustavJuniorSpawnPosition(
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D,
  startOverride
) {
  const hub = startOverride ?? moe3dBiskHubAnchor();
  const northOffset =
    moe3dGustavBodyLengthWorld() * MOE_GUSTAV_SPAWN_BODY_LENGTHS_NORTH;
  return {
    x: hub.x - 3,
    y: hub.y - northOffset,
  };
}

/** フィールド待機時：ビスク中央広場を向く yaw */
export function moe3dGustavFacePlayerStartYaw(
  fromX,
  fromY,
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D
) {
  const hub = moe3dBiskHubAnchor();
  return (
    moe3dYawFaceTarget(fromX, fromY, hub.x, hub.y) +
    MOE_GUSTAV_MODEL_YAW_OFFSET
  );
}

/** 固定スポーンのフィールドバイソン（低ポリ glb） */
export function buildMeerimFieldBisonEnemy(base, id, pos) {
  const scaled = moe3dEnemyStatsForZoneLevel(base, base.level);
  return {
    ...base,
    id,
    midBoss: false,
    superBoss: false,
    fieldBison: true,
    zoneIndex: -3,
    slotInZone: 0,
    zoneLevel: base.level,
    x: pos.x,
    y: pos.y,
    level: scaled.level,
    hp: scaled.hpMax,
    hpMax: scaled.hpMax,
    petDamage: scaled.petDamage,
    wiki: scaled.wiki,
    sy: 1,
  };
}

/** ギュスターヴ ジャイアント（簡易）— フィールドボス（中ボスとは別） */
export function buildMeerimGustavJuniorEnemy(base, id, pos) {
  const scaled = moe3dEnemyStatsForZoneLevel(base, base.level);
  const statScale = base.level > 0 ? scaled.level / base.level : 1;
  const petDamageStrong = base.petDamageStrong
    ? Math.max(1, Math.round(base.petDamageStrong * statScale))
    : undefined;
  return {
    ...base,
    id,
    midBoss: false,
    superBoss: false,
    fieldGustav: true,
    zoneIndex: -4,
    slotInZone: 0,
    zoneLevel: base.level,
    x: pos.x,
    y: pos.y,
    level: scaled.level,
    hp: scaled.hpMax,
    hpMax: scaled.hpMax,
    petDamage: scaled.petDamage,
    petDamageStrong,
    wiki: scaled.wiki,
    sy: 2,
  };
}

export function isBisonEnemyKey(key) {
  return (
    key === "elvin_bison" ||
    key === "auzun_bura" ||
    key === "mountain_bison" ||
    key === "rough_bison"
  );
}

export function bisonModelHeightForKey(key) {
  if (key === "mountain_bison") return MOE_MOUNTAIN_BISON_MODEL_HEIGHT;
  if (key === "rough_bison") return MOE_ROUGH_BISON_MODEL_HEIGHT;
  if (key === "elvin_bison" || key === "auzun_bura") {
    return MOE_BISON_MODEL_HEIGHT;
  }
  if (key === "gustav_junior") {
    return MOE_GUSTAV_JUNIOR_MODEL_HEIGHT * MOE_GUSTAV_JUNIOR_DISPLAY_SCALE;
  }
  return MOE_MONSTER_MODEL_HEIGHT;
}

/** 3D 表示用の glb 高さ（fitModelToGround 目標） */
export function enemyModelHeightForKey(key) {
  if (key === "mountain_bison") return MOE_MOUNTAIN_BISON_MODEL_HEIGHT;
  if (key === "rough_bison") return MOE_ROUGH_BISON_MODEL_HEIGHT;
  if (key === "auzun_bura") {
    return MOE_BISON_MODEL_HEIGHT;
  }
  const macro2Height = moeMacro2EnemyDisplayHeight(key);
  if (macro2Height != null) return macro2Height;
  if (key === "gustav_junior") {
    return MOE_GUSTAV_JUNIOR_MODEL_HEIGHT * MOE_GUSTAV_JUNIOR_DISPLAY_SCALE;
  }
  if (key === "orc_infantry") return MOE_ORC_INFANTRY_MODEL_HEIGHT;
  if (key === "earth_worm") return MOE_EARTH_WORM_MODEL_HEIGHT;
  if (key === "brown_serpent") return MOE_BROWN_SERPENT_MODEL_HEIGHT;
  if (key === "hilltop_lion") {
    return MOE_HILLTOP_LION_MODEL_HEIGHT * MOE_HILLTOP_LION_DISPLAY_SCALE;
  }
  if (
    key === "stray_ixion" ||
    key === "eisis_ixion" ||
    key === "bisk_ixion_water"
  )
    return MOE_STRAY_IXION_MODEL_HEIGHT;
  return moeMacro1DisplayHeight(key, MOE_MONSTER_MODEL_HEIGHT);
}

/** バイソン（フィールド）は displayScale でサイズ決定 → fit は 1 */
export function enemyFitHeightForKey(key) {
  if (key === "mountain_bison" || key === "rough_bison") {
    return 1;
  }
  return enemyModelHeightForKey(key);
}

/** オーク：fit=1 → ×3 → 足元合わせ（生成時1回だけ。毎フレーム scale しない） */
export function moe3dApplyOrcDisplayScale(root) {
  fitModelToGround(root, 1);
  const base = root.scale.x;
  root.scale.setScalar(base * MOE_ORC_INFANTRY_DISPLAY_SCALE);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const groundLift = -box.min.y;
  root.position.y = 0;
  return { scale: root.scale.x, groundLift };
}

/** イクシオン：fit=1 → ×3 → 足元合わせ */
export function moe3dApplyIxionDisplayScale(root) {
  fitModelToGround(root, 1);
  const base = root.scale.x;
  root.scale.setScalar(base * MOE_STRAY_IXION_DISPLAY_SCALE);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const groundLift = -box.min.y;
  root.position.y = 0;
  return { scale: root.scale.x, groundLift };
}

/** ヒルトップ ライオン：fit=1 → ×3 → 足元合わせ */
export function moe3dApplyLionDisplayScale(root) {
  fitModelToGround(root, 1);
  const base = root.scale.x;
  root.scale.setScalar(base * MOE_HILLTOP_LION_DISPLAY_SCALE);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const groundLift = -box.min.y;
  root.position.y = 0;
  return { scale: root.scale.x, groundLift };
}

/** ギュスターヴ：fit=1 → ×3 → 足元合わせ */
export function moe3dApplyGustavDisplayScale(root) {
  fitModelToGround(root, 1);
  const base = root.scale.x;
  root.scale.setScalar(base * MOE_GUSTAV_JUNIOR_DISPLAY_SCALE);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const groundLift = -box.min.y;
  root.position.y = 0;
  return { scale: root.scale.x, groundLift };
}

/** エルビン／アウズン：fit=1 → scale=displayScale（従来の setScalar 相当）→ 足元合わせ */
export function moe3dApplyBisonBossDisplayScale(root, displayScale) {
  fitModelToGround(root, 1);
  root.scale.setScalar(displayScale);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const groundLift = -box.min.y;
  root.position.y = 0;
  return { scale: root.scale.x, groundLift };
}

export function isBisonModelUrl(url) {
  return (
    url === MOE_BISON_MODEL_URL ||
    url === MOE_MOUNTAIN_BISON_MODEL_URL ||
    url === MOE_ROUGH_BISON_MODEL_URL
  );
}

export function isOrcModelUrl(url) {
  return url === MOE_ORC_INFANTRY_MODEL_URL;
}

export function isIxionModelUrl(url) {
  return url === MOE_STRAY_IXION_MODEL_URL;
}

export function isLionModelUrl(url) {
  return url === MOE_HILLTOP_LION_MODEL_URL;
}

export function isGustavModelUrl(url) {
  return url === MOE_GUSTAV_GIANT_MODEL_URL;
}

export function isSpiderModelUrl(url) {
  return (
    url === MOE_ELVIN_SPIDER_MODEL_URL || url === MOE_ELVIN_SPIDER_B_MODEL_URL
  );
}

export function isElanKnightModelUrl(url) {
  return (
    url === MOE_ELAN_KNIGHT_WHITE_A_MODEL_URL ||
    url === MOE_ELAN_KNIGHT_WHITE_B_MODEL_URL ||
    url === MOE_ELAN_KNIGHT_BLACK_A_MODEL_URL ||
    url === MOE_ELAN_KNIGHT_BLACK_B_MODEL_URL
  );
}

/** glb 内蔵カラーを使う敵（外部 tint しない） */
const MOE_BAKED_COLOR_ENEMY_KEYS = new Set([
  "mountain_bison",
  "rough_bison",
  "orc_infantry",
  "stray_ixion",
  "hilltop_lion",
  "gustav_junior",
  "turtle",
  "giant_tortoise",
  ...moeMonsterFieldAllEntries().map((e) => e.key),
]);

export function enemyUsesBakedModelColors(key) {
  return MOE_BAKED_COLOR_ENEMY_KEYS.has(key);
}
/** Shift 走行中の RUN アニメ速度 */
export const MOE_SNAKE_RUN_SPRINT_TIME_SCALE = 1.5;
/** プレイヤー足踏み — SnakeRun.02 の clip 長 0.5s */
export const MOE_PLAYER_RUN_BOB_CYCLE_SEC = 1;
export const MOE_PLAYER_WALK_BOB_CYCLE_SEC = 1.5;
export const MOE_SNAKE_RUN_CLIP_DURATION_SEC = 0.5;
export const MOE_SNAKE_WALK_CLIP_DURATION_SEC = 0.5;
/** Level 0.1 up バナー表示時間（ms） */
export const MOE_TENTH_BANNER_MS_2D = 1000;
export const MOE_TENTH_BANNER_MS_3D = 2000;
export const MOE_TENTH_BANNER_DURATION_SEC_3D = MOE_TENTH_BANNER_MS_3D / 1000;
/** ダメージポップ：味方→敵（ゴールド） / 敵→味方（オレンジ赤・回復の水色と区別） */
export const MOE_POPUP_COLOR_ALLY_DAMAGE = "#fbbf24";
export const MOE_POPUP_COLOR_ENEMY_DAMAGE = "#b91c1c";
/** 連撃スキルのダメージ数字を縦積みする行間（px） */
export const MOE_COMBO_DAMAGE_STACK_PX = 22;
/** 連撃ポップ表示時間（ms） */
export const MOE_COMBO_POPUP_MS = 2500;
/** ダメージポップ：3D 頭上への追加Y（ワールド） */
export const MOE_DAMAGE_POPUP_3D_Y_EXTRA = 0.38;
/** ダメージポップ：3D ペット被ダメ時の追加Y */
export const MOE_DAMAGE_POPUP_3D_PET_Y_EXTRA = 0.28;
/** ダメージポップ：2D 画面上方向オフセット（px） */
export const MOE_DAMAGE_POPUP_2D_TOP_OFFSET_PX = 24;

/** 本家風コンボ：左右に散って上昇 → 同方向へ少し流れながらゆっくり落下 */
export function rollMoeComboPopupMotion() {
  const driftSign = Math.random() < 0.5 ? -1 : 1;
  const comboDriftX = driftSign * (16 + Math.random() * 30);
  const comboHopX = (Math.random() - 0.5) * 18;
  const comboPeakX = comboDriftX * 0.96 + comboHopX;
  const sign = Math.sign(comboPeakX) || driftSign;
  const fallDelta = sign * (12 + Math.random() * 16);
  const lerpFallX = (t) => comboPeakX + fallDelta * t;
  return {
    comboDriftX,
    comboHopX,
    comboPeakX,
    comboPeakY: -(28 + Math.random() * 20),
    comboFallX54: lerpFallX(0.35),
    comboFallX68: lerpFallX(0.58),
    comboFallX82: lerpFallX(0.82),
    comboFallX100: comboPeakX + fallDelta,
  };
}

function moeComboMotionPx(n) {
  return `${Math.round(n * 10) / 10}px`;
}

/** @param {ReturnType<typeof rollMoeComboPopupMotion>} pop */
export function moeComboPopupCssVars(pop) {
  const drift = pop.comboDriftX ?? 0;
  const hop = pop.comboHopX ?? 0;
  const peakX = pop.comboPeakX ?? drift * 0.96 + hop;
  const endX = pop.comboFallX100 ?? peakX;
  return {
    "--combo-drift-x": moeComboMotionPx(drift),
    "--combo-hop-x": moeComboMotionPx(hop),
    "--combo-peak-x": moeComboMotionPx(peakX),
    "--combo-peak-y": moeComboMotionPx(pop.comboPeakY ?? -36),
    "--combo-fall-x54": moeComboMotionPx(pop.comboFallX54 ?? endX),
    "--combo-fall-x68": moeComboMotionPx(pop.comboFallX68 ?? endX),
    "--combo-fall-x82": moeComboMotionPx(pop.comboFallX82 ?? endX),
    "--combo-fall-x100": moeComboMotionPx(endX),
  };
}
/** リスポーン時：プレイヤー・他敵との最低距離 */
export const MOE_3D_MIN_RESPAWN_FROM_PLAYER = 55;
export const MOE_3D_MIN_RESPAWN_FROM_ENEMY = 45;
/** 戦闘時：先頭同士（モデル正面↔正面）の固定間隔 */
export const MOE_3D_DUEL_FRONT_TO_FRONT_GAP = 4.2;
export function isSnakeModelEnemyKey(key) {
  return monsterModelUrlForKey(key) === MONSTER_MODEL_URL;
}

export function moe3dDuelFrontGapForEnemy(_enemyKey) {
  return MOE_3D_DUEL_FRONT_TO_FRONT_GAP;
}

export function moe3dDuelSlotMinCenter(_enemyKey) {
  return 0;
}

/** 敵頭上 UI：モデル天端からのオフセット（ワールド Y） */
export const MOE_3D_ENEMY_UI_GLOBAL_LIFT = 0.17;
export const MOE_3D_ENEMY_UI_HP_ABOVE_TOP = 0.06;
export const MOE_3D_ENEMY_UI_NAME_ABOVE_TOP = 0.2;
/** ターゲット時：名前＋Lv をさらに上へ（クリスタル・HP と被らない） */
export const MOE_3D_ENEMY_UI_NAME_TARGET_EXTRA = 0.22;
export const MOE_3D_ENEMY_UI_MARKER_ABOVE_TOP = 0.52;
/** ターゲット時：クリスタルを名前より上に */
export const MOE_3D_ENEMY_UI_MARKER_TARGET_EXTRA = 0.45;
/** ターゲット敵 HP バー：頭上アンカーから右（ワールド +X） */
export const MOE_3D_ENEMY_UI_HP_WORLD_OFFSET_X = 0.78;
/** HP バー canvas 内の右寄せ（px） */
export const MOE_3D_ENEMY_UI_HP_CANVAS_SHIFT_X = 28;

/** バイソン中・超ボス：角・背の高さ分（bbox だけでは低めになりがち） */
function moe3dEnemyUiTopExtra(enemyKey) {
  if (enemyKey === "gustav_junior") {
    return MOE_GUSTAV_JUNIOR_MODEL_HEIGHT * MOE_GUSTAV_JUNIOR_DISPLAY_SCALE * 0.38;
  }
  if (enemyKey === "elvin_bison") return MOE_MID_BOSS_DISPLAY_SCALE * 0.42;
  if (enemyKey === "auzun_bura") return MOE_SUPER_BOSS_DISPLAY_SCALE * 0.38;
  return 0;
}

/** モデル天端のワールド Y（pick 当たりは除外） */
export function moe3dMeasureModelTopY(root) {
  if (!root) return 0;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  let hasMesh = false;
  root.traverse((obj) => {
    if (obj.userData?.pickProxy || !obj.isMesh || !obj.geometry) return;
    box.expandByObject(obj);
    hasMesh = true;
  });
  if (!hasMesh) {
    box.setFromObject(root);
  }
  if (box.isEmpty()) return 0;
  return box.max.y;
}

/** 敵頭上スプライト用 Y（モデル top 基準。メッシュ未生成時は groundY + 高さ定数） */
export function moe3dEnemyUiWorldYs(entry, enemyKey, groundY) {
  const fallbackTop =
    groundY + (enemyModelHeightForKey(enemyKey) ?? MOE_MONSTER_MODEL_HEIGHT);
  const measuredTop = entry?.root ? moe3dMeasureModelTopY(entry.root) : 0;
  const extra = moe3dEnemyUiTopExtra(enemyKey);
  const topY =
    (measuredTop > groundY + 0.05 ? measuredTop : fallbackTop) + extra;
  return {
    topY,
    hpY: topY + MOE_3D_ENEMY_UI_HP_ABOVE_TOP + MOE_3D_ENEMY_UI_GLOBAL_LIFT,
    nameY: topY + MOE_3D_ENEMY_UI_NAME_ABOVE_TOP + MOE_3D_ENEMY_UI_GLOBAL_LIFT,
    markerY:
      topY + MOE_3D_ENEMY_UI_MARKER_ABOVE_TOP + MOE_3D_ENEMY_UI_GLOBAL_LIFT,
  };
}

/** モデル中心から正面（+Z 方向）までの距離（bbox 実測。pick 当たりは除外） */
export function moe3dMeasureModelFrontExtent(root) {
  if (!root) return 0;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  let hasMesh = false;
  root.traverse((obj) => {
    if (obj.userData?.pickProxy || !obj.isMesh || !obj.geometry) return;
    box.expandByObject(obj);
    hasMesh = true;
  });
  if (!hasMesh) {
    box.setFromObject(root);
  }
  const size = box.getSize(new THREE.Vector3());
  return Math.max(size.x, size.z, 0.01) * 0.5;
}

/** モデル中心から正面（敵方向）までのおおよその距離 */
export function moe3dModelFrontExtent(kind, enemyKey = null, petId = null) {
  if (kind === "pet") {
    const h = petModelHeightForId(petId ?? "sun_spirit");
    return h * 0.48;
  }
  const h = enemyFitHeightForKey(enemyKey);
  if (enemyKey === "orc_infantry") return MOE_ORC_INFANTRY_DISPLAY_SCALE * 0.32;
  if (
    enemyKey === "stray_ixion" ||
    enemyKey === "eisis_ixion" ||
    enemyKey === "bisk_ixion_water"
  ) {
    return MOE_STRAY_IXION_DISPLAY_SCALE * 0.36;
  }
  if (enemyKey === "mountain_bison" || enemyKey === "rough_bison") return h * 0.34;
  if (enemyKey === "gustav_junior") {
    return MOE_GUSTAV_JUNIOR_MODEL_HEIGHT * MOE_GUSTAV_JUNIOR_DISPLAY_SCALE * 0.32;
  }
  if (enemyKey === "elvin_bison" || enemyKey === "auzun_bura") {
    return h * 0.32;
  }
  if (isSnakeModelEnemyKey(enemyKey)) return h * 0.5;
  return h * 0.36;
}

/** glb の向き補正（ラジアン）。逆向きなら Math.PI など */
export const MOE_PET_MODEL_YAW_OFFSET = 0;
export const MOE_MONSTER_MODEL_YAW_OFFSET = 0;

/** 敵 key ごとの yaw 補正（glb の正面軸が +Z でない場合） */
export function moe3dEnemyModelYawOffset(enemyKey) {
  if (enemyKey === "gustav_junior") return MOE_GUSTAV_MODEL_YAW_OFFSET;
  return MOE_MONSTER_MODEL_YAW_OFFSET;
}

/** ペット側の決戦位置（敵・ペットの正面同士の距離を一定に保つ） */
export function moe3dDuelSlotFromPet(
  enemy,
  petX,
  petY,
  opts = {}
) {
  const dx = petX - enemy.x;
  const dy = petY - enemy.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const enemyFront =
    opts.enemyFront ?? moe3dModelFrontExtent("enemy", enemy?.key);
  const petFront = opts.petFront ?? moe3dModelFrontExtent("pet");
  const centerDist =
    enemyFront + MOE_3D_DUEL_FRONT_TO_FRONT_GAP + petFront;
  return {
    x: enemy.x + ux * centerDist,
    y: enemy.y + uy * centerDist,
  };
}

/** お互いを向く yaw（Three.js Y 回転） */
export function moe3dYawFaceTarget(fromX, fromZ, toX, toZ) {
  return Math.atan2(toX - fromX, toZ - fromZ);
}

/** プレイヤー初期位置（南＝マップ下端付近 · ミニマップ下側） */
export function moe3dPlayerStartPosition(halfW, halfD) {
  const limD = Math.max(4, halfD - 6);
  return {
    x: 0,
    y: limD * 0.93,
  };
}

/** 3D フィールド入場時 — プレイヤーそばのペット初期位置 */
export function moe3dPetStartNearPlayer(playerPos, offset = { dx: 1.6, dy: -1.2 }) {
  return {
    x: playerPos.x + offset.dx,
    y: playerPos.y + offset.dy,
  };
}

/** ペット小屋 — ビスク中央広場の南西 */
export function moe3dPetHousePosition(halfW = MOE_3D_HALF_W, halfD = MOE_3D_HALF_D) {
  const hub = moe3dBiskNpcHubAnchor();
  return {
    x: hub.x - 12,
    y: hub.y + 10,
  };
}

export function moe3dIsNearPetHouse(px, py, halfW, halfD, radius = 11) {
  const house = moe3dPetHousePosition(halfW, halfD);
  return Math.hypot(px - house.x, py - house.y) <= radius;
}

/** 魂の記憶者ローダ — ビスク中央広場の南（経験値粉） */
export function moe3dRhodaPosition(halfW = MOE_3D_HALF_W, halfD = MOE_3D_HALF_D) {
  const hub = moe3dBiskNpcHubAnchor();
  return {
    x: hub.x - 6,
    y: hub.y + 14,
  };
}

export function moe3dIsNearRhoda(px, py, halfW, halfD, radius = 12, spot = null) {
  const center = spot ?? moe3dRhodaPosition(halfW, halfD);
  return Math.hypot(px - center.x, py - center.y) <= radius;
}

/** ドラゴン展示 — ビスク中央広場の南 · 西寄り横並び */
export function moe3dDragonShowcaseLayout(
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D,
  count = 10
) {
  const hub = moe3dBiskHubAnchor();
  const spacing = 4.2;
  const total = (count - 1) * spacing;
  const baseY = hub.y + 16;
  const baseX = hub.x - total * 0.62;
  return Array.from({ length: count }, (_, i) => ({
    x: baseX + i * spacing,
    y: baseY,
  }));
}

export function moe3dDragonShowcaseCenter(
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D
) {
  const spots = moe3dDragonShowcaseLayout(halfW, halfD);
  let sx = 0;
  let sy = 0;
  for (const p of spots) {
    sx += p.x;
    sy += p.y;
  }
  return { x: sx / spots.length, y: sy / spots.length };
}

export function moe3dIsNearDragonShowcase(
  px,
  py,
  halfW,
  halfD,
  radius = 22,
  spot = null
) {
  const center = spot ?? moe3dDragonShowcaseCenter(halfW, halfD);
  return Math.hypot(px - center.x, py - center.y) <= radius;
}

/** 敵32体展示 — スポーン東のグリッド（8列） */
export const MOE_3D_MONSTER_SHOWCASE_COLS = 8;
export const MOE_3D_MONSTER_SHOWCASE_COUNT = 32;

export function moe3dMonsterShowcaseLayout(
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D,
  count = MOE_3D_MONSTER_SHOWCASE_COUNT
) {
  const hub = moe3dBiskHubAnchor();
  const cols = MOE_3D_MONSTER_SHOWCASE_COLS;
  const spX = 3.35;
  const spZ = 4.75;
  const baseX = hub.x - 28;
  const baseY = hub.y + 6;
  const offsetX = ((cols - 1) * spX) / 2;
  return Array.from({ length: count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: baseX + col * spX - offsetX,
      y: baseY - row * spZ,
    };
  });
}

export function moe3dMonsterShowcaseCenter(
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D
) {
  const spots = moe3dMonsterShowcaseLayout(halfW, halfD);
  let sx = 0;
  let sy = 0;
  for (const p of spots) {
    sx += p.x;
    sy += p.y;
  }
  return { x: sx / spots.length, y: sy / spots.length };
}

export function moe3dIsNearMonsterShowcase(
  px,
  py,
  halfW,
  halfD,
  radius = 38,
  spot = null
) {
  const center = spot ?? moe3dMonsterShowcaseCenter(halfW, halfD);
  return Math.hypot(px - center.x, py - center.y) <= radius;
}

/** 敵展示 glb の fit 目標高（ワールド） */
export function moe3dMonsterShowcaseTargetHeight(familyId) {
  if (familyId === "gigas_boss" || familyId === "giant_boss") return 3.55;
  if (familyId === "gigas_mammoth" || familyId === "giant_mammoth") return 3.35;
  if (familyId === "orc_gang" || familyId === "orc_magician") return 2.65;
  if (familyId === "rescue_amazoness") return 2.45;
  if (familyId === "giant_tortoise") return 2.85;
  if (familyId === "turtle") return 1.35;
  return 1.42;
}

function moe3dZoneBandY(zoneIndex, zoneCount, halfD) {
  const hub = moe3dBiskHubAnchor();
  /** ゾーン0＝南（弱）→ 最終ゾーン＝北（強） · ビスク中央広場周辺 */
  const southRing = Math.min(halfD * 0.14, 26);
  const northRing = -Math.min(halfD * 0.12, 22);
  const t = zoneCount <= 1 ? 0 : zoneIndex / (zoneCount - 1);
  return hub.y + southRing + (northRing - southRing) * t;
}

const MOE_3D_MINI_ZONE_FILLS = [
  "#228b22",
  "#2e7d32",
  "#388e3c",
  "#43a047",
  "#1b5e20",
];

/** 3D ワールド座標 (x,z) → ミニマップ SVG 座標 */
export function moe3dWorldToMinimap(x, z, halfW, halfD, mw, mh) {
  return {
    x: ((x + halfW) / (halfW * 2)) * mw,
    y: ((z + halfD) / (halfD * 2)) * mh,
  };
}

/** 3D ミニマップ用ゾーン帯（南＝砂浜 → 北＝強敵） */
export function moe3dMinimapZoneRects(halfW, halfD, mw, mh) {
  const zoneCount = MOE_3D_ENEMY_ZONES.length;
  const toMapY = (worldZ) => ((worldZ + halfD) / (halfD * 2)) * mh;
  const rects = [];

  const centers = [...Array(zoneCount)].map((_, i) =>
    moe3dZoneBandY(i, zoneCount, halfD)
  );
  const beachNorth = centers[0] + halfD * 0.1;
  rects.push({
    key: "start",
    x: 0,
    y: toMapY(-halfD),
    width: mw,
    height: Math.max(1, toMapY(beachNorth) - toMapY(-halfD)),
    fill: "#d2b48c",
  });

  for (let i = 0; i < zoneCount; i++) {
    const northZ =
      i === 0 ? beachNorth : (centers[i - 1] + centers[i]) / 2;
    const southZ =
      i === zoneCount - 1
        ? -halfD * 0.85
        : (centers[i] + centers[i + 1]) / 2;
    const yTop = toMapY(northZ);
    const yBottom = toMapY(southZ);
    rects.push({
      key: `zone-${i}`,
      x: 0,
      y: Math.min(yTop, yBottom),
      width: mw,
      height: Math.max(1, Math.abs(yBottom - yTop)),
      fill: MOE_3D_MINI_ZONE_FILLS[i] ?? MOE_3D_MINI_ZONE_FILLS[4],
      opacity: 0.82,
    });
  }

  /** 東側 — 砂漠1面プレビュー（見本） */
  rects.push({
    key: "desert-preview",
    x: mw * 0.68,
    y: mh * 0.28,
    width: mw * 0.3,
    height: mh * 0.38,
    fill: "#d4a574",
    opacity: 0.92,
  });

  return rects;
}

/**
 * ゾーン内の2匹配置（南→北に弱→強、横に2匹）
 * @param {number} zoneIndex 0=最弱（南）..n-1=最強（北）
 */
export function moe3dZoneEnemyPosition(
  zoneIndex,
  slotInZone,
  zoneCount,
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D
) {
  const hub = moe3dBiskHubAnchor();
  const bandY = moe3dZoneBandY(zoneIndex, zoneCount, halfD);
  const spreadX = 8 + zoneIndex * 3.5;
  const x =
    slotInZone === 0 ? hub.x - spreadX : hub.x - spreadX * 0.55;
  return { x, y: bandY };
}

/** ゾーン目標 Lv に合わせてステータスをスケール */
export function moe3dEnemyStatsForZoneLevel(base, zoneLevel) {
  const level = Math.round(Number(zoneLevel) * 10) / 10;
  const scale = level / Math.max(base.level, 0.1);
  const hpMax = Math.max(1, Math.round(base.hpMax * scale));
  const petDamage = Math.max(1, Math.round(base.petDamage * scale));
  const wiki = base.wiki
    ? {
        ...base.wiki,
        attack: Math.round(base.wiki.attack * scale * 10) / 10,
        defense: Math.round(base.wiki.defense * scale * 10) / 10,
        hit: Math.round(base.wiki.hit * scale * 10) / 10,
        magic: Math.round(base.wiki.magic * scale * 10) / 10,
      }
    : base.wiki;
  return { level, hpMax, petDamage, wiki, zoneLevel };
}

/** 撃破後：同じゾーン帯内でリスポーン */
export function moe3dPickRespawnInZone(
  zoneIndex,
  zoneCount,
  halfW,
  halfD,
  playerPos,
  others,
  excludeId
) {
  const hub = moe3dBiskHubAnchor();
  const bandY = moe3dZoneBandY(zoneIndex, zoneCount, halfD);
  const bandHalfH = halfD * 0.04;
  const spreadX = 8 + zoneIndex * 3.5;

  for (let attempt = 0; attempt < 40; attempt++) {
    const x =
      hub.x -
      spreadX * 0.55 +
      (Math.random() - 0.5) * spreadX * 0.95;
    const y = bandY + (Math.random() - 0.5) * bandHalfH * 2;
    if (moe3dIsInBossArea(x, y, halfW, halfD)) continue;
    if (
      Math.hypot(x - playerPos.x, y - playerPos.y) <
      MOE_3D_MIN_RESPAWN_FROM_PLAYER
    ) {
      continue;
    }
    let ok = true;
    for (const o of others) {
      if (o.id === excludeId || o.hp <= 0) continue;
      if (Math.hypot(x - o.x, y - o.y) < MOE_3D_MIN_RESPAWN_FROM_ENEMY) {
        ok = false;
        break;
      }
    }
    if (ok) return { x, y };
  }
  return moe3dZoneEnemyPosition(zoneIndex, 0, zoneCount, halfW, halfD);
}

/** x/z を地形プレイ範囲内に収める */
export function moe3dClampPosition(x, z, halfW, halfD, margin = 4) {
  const limW = Math.max(4, halfW - margin);
  const limD = Math.max(4, halfD - margin);
  return {
    x: Math.max(-limW, Math.min(limW, x)),
    y: Math.max(-limD, Math.min(limD, z)),
  };
}

/**
 * 地形 bbox（minX/maxX/minZ/maxZ）または halfW/halfD で x/z をクランプ。
 * @param {{ minX?: number, maxX?: number, minZ?: number, maxZ?: number, halfW?: number, halfD?: number }} bounds
 */
export function moe3dClampToPlayBounds(x, z, bounds, margin = 1.5) {
  if (
    bounds &&
    Number.isFinite(bounds.minX) &&
    Number.isFinite(bounds.maxX) &&
    Number.isFinite(bounds.minZ) &&
    Number.isFinite(bounds.maxZ)
  ) {
    return {
      x: Math.max(bounds.minX + margin, Math.min(bounds.maxX - margin, x)),
      y: Math.max(bounds.minZ + margin, Math.min(bounds.maxZ - margin, z)),
    };
  }
  const halfW = bounds?.halfW ?? MOE_3D_HALF_W;
  const halfD = bounds?.halfD ?? MOE_3D_HALF_D;
  return moe3dClampPosition(x, z, halfW, halfD, margin);
}

/** 撃破後リスポーン：プレイヤーから離れ、他敵と間隔を空ける */
export function moe3dPickRespawnPosition(
  halfW,
  halfD,
  playerPos,
  others,
  excludeId
) {
  const margin = 8;
  const limW = Math.max(4, halfW - margin);
  const limD = Math.max(4, halfD - margin);
  for (let attempt = 0; attempt < 48; attempt++) {
    const x = (Math.random() * 2 - 1) * limW;
    const y = (Math.random() * 2 - 1) * limD;
    if (moe3dIsInBossArea(x, y, halfW, halfD)) continue;
    if (
      Math.hypot(x - playerPos.x, y - playerPos.y) <
      MOE_3D_MIN_RESPAWN_FROM_PLAYER
    ) {
      continue;
    }
    let ok = true;
    for (const o of others) {
      if (o.id === excludeId || o.hp <= 0) continue;
      if (Math.hypot(x - o.x, y - o.y) < MOE_3D_MIN_RESPAWN_FROM_ENEMY) {
        ok = false;
        break;
      }
    }
    if (ok) return { x, y };
  }
  const angle = Math.atan2(-playerPos.y, -playerPos.x);
  const r = Math.min(halfW, halfD) * 0.72;
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
}

/** 待機アニメ（SnakeIdle.01 / SnakeRun.02 / SnakeAttakc.01 など） */
export const MOE_SNAKE_IDLE_CLIP = "SnakeIdle.01";
export const MOE_SNAKE_WALK_CLIP = "SnakeWalk.01";
export const MOE_SNAKE_RUN_CLIP = "SnakeRun.02";
export const MOE_SNAKE_ATTACK_CLIP = "SnakeAttakc.01";
/** オーク歩兵 — 弱/強攻撃クリップ */
export const MOE_ORC_ATTACK_WEAK_CLIP = "SnakeAttakc.01";
export const MOE_ORC_ATTACK_STRONG_CLIP = "SnakeAttakcStrong.01";
export const MOE_ORC_ATTACK_TIME_SCALE = 1;
/** 攻撃クリップ長が取れないときのフォールバック */
export const MOE_SNAKE_ATTACK_MS = 850;
/** Bison01.glb クリップ名 */
export const MOE_BISON_IDLE_CLIP = "Idle01";
export const MOE_BISON_WALK_CLIP = "Walk01";
export const MOE_BISON_ATTACK_WEAK_CLIP = "Attack01";
export const MOE_BISON_ATTACK_STRONG_CLIP = "AttackPow02";
export const MOE_BISON_ATTACK_TIME_SCALE = 1;
/** 攻撃アニメ再生速度（2 = 2倍速） */
export const MOE_SNAKE_ATTACK_TIME_SCALE = 2;
/** 攻撃後〜次のチャージ開始まで（ms）。後から調整しやすいよう定数化 */
export const MOE_STRIKE_RECOVERY_MS = 1500;
/** ギュスターヴ — 弱/強攻撃クリップ */
export const MOE_GUSTAV_ATTACK_WEAK_CLIP = "SnakeAttakc.01";
export const MOE_GUSTAV_ATTACK_STRONG_CLIP = "SnakeAttakcStrong.01";
export const MOE_GUSTAV_ATTACK_TIME_SCALE = 1;
/** 体半分サッと前進→戻る */
export const MOE_GUSTAV_WEAK_ATTACK_MS = 550;
/** 半分下がり→0.3秒→体1つ分突進 */
export const MOE_GUSTAV_STRONG_ATTACK_MS = 1100;
/** オーク強攻撃クリップ長（strikeUntil） */
export const MOE_ORC_STRONG_ATTACK_MS = 2650;
/** オーク弱攻撃クリップ長 */
export const MOE_ORC_WEAK_ATTACK_MS = 620;

/** @param {import("three").AnimationAction | null} from */
/** @param {import("three").AnimationAction} to */
function blendAnimAction(from, to, fade) {
  to.reset();
  to.setEffectiveWeight(1);
  to.play();
  if (from && from !== to) {
    from.crossFadeTo(to, fade, false);
  } else {
    to.fadeIn(fade);
  }
}

/** 敵 key ごとの攻撃モーション時間（strikeUntil 用） */
export function enemyStrikeAnimMsForKey(key, fallbackMs) {
  if (key === "orc_infantry") {
    return Math.max(fallbackMs, 400);
  }
  if (key === "gustav_junior") {
    return Math.max(fallbackMs, 400);
  }
  return fallbackMs;
}

/** @param {import("three").AnimationClip[]} clips */
export function pickSnakeIdleClip(clips) {
  if (!clips?.length) return null;
  const exact = clips.find((c) => c.name === MOE_SNAKE_IDLE_CLIP);
  if (exact) return exact;
  const fuzzy = clips.find((c) => /snakeidle/i.test(c.name));
  if (fuzzy) return fuzzy;
  const idle = clips.find((c) => /idle/i.test(c.name));
  return idle ?? clips[0];
}

/** @param {import("three").AnimationClip[]} clips */
export function pickSnakeWalkClip(clips) {
  if (!clips?.length) return null;
  const exact = clips.find((c) => c.name === MOE_SNAKE_WALK_CLIP);
  if (exact) return exact;
  return clips.find((c) => /snakewalk|\.walk/i.test(c.name)) ?? null;
}

/** @param {import("three").AnimationClip[]} clips */
export function pickSnakeRunClip(clips) {
  if (!clips?.length) return null;
  const exact = clips.find((c) => c.name === MOE_SNAKE_RUN_CLIP);
  if (exact) return exact;
  return clips.find((c) => /snakerun|\.run/i.test(c.name)) ?? null;
}

/** @param {import("three").AnimationClip[]} clips */
export function pickSnakeAttackClip(clips) {
  if (!clips?.length) return null;
  const exact = clips.find((c) => c.name === MOE_SNAKE_ATTACK_CLIP);
  if (exact) return exact;
  return (
    clips.find((c) => /snakeattakc|snakeattack|attakc|attack/i.test(c.name)) ??
    null
  );
}

function pickClipByName(clips, exactName, fuzzy) {
  if (!clips?.length) return null;
  const exact = clips.find((c) => c.name === exactName);
  if (exact) return exact;
  if (fuzzy) return clips.find((c) => fuzzy.test(c.name)) ?? null;
  return null;
}

/** @param {import("three").AnimationMixer} mixer
 *  @param {import("three").AnimationClip[]} clips */
export function createBisonAnimController(mixer, clips, opts = {}) {
  const { attackLoop = false } = opts;
  const idleClip = pickClipByName(clips, MOE_BISON_IDLE_CLIP, /idle/i);
  const walkClip = pickClipByName(clips, MOE_BISON_WALK_CLIP, /walk/i);
  const attackWeakClip = pickClipByName(
    clips,
    MOE_BISON_ATTACK_WEAK_CLIP,
    /attack01|attack(?!pow)/i
  );
  const attackStrongClip = pickClipByName(
    clips,
    MOE_BISON_ATTACK_STRONG_CLIP,
    /attackpow|pow/i
  );

  const makeAction = (clip, loop) => {
    if (!clip) return null;
    const action = mixer.clipAction(clip);
    action.setLoop(
      loop ? THREE.LoopRepeat : THREE.LoopOnce,
      loop ? Infinity : 1
    );
    if (!loop) action.clampWhenFinished = true;
    return action;
  };

  const idle = makeAction(idleClip, true);
  const run = makeAction(walkClip, true);
  const attackWeak = makeAction(attackWeakClip, attackLoop);
  const attackStrong = makeAction(attackStrongClip, attackLoop);
  if (attackWeak) attackWeak.timeScale = MOE_BISON_ATTACK_TIME_SCALE;
  if (attackStrong) attackStrong.timeScale = MOE_BISON_ATTACK_TIME_SCALE;

  let current = null;
  let currentMode = "idle";
  let afterAttackMode = "idle";
  let lastAttackAction = attackWeak;

  const fade = 0.12;

  const crossfadeTo = (action, mode) => {
    if (!action) return;
    if (action === current && mode !== "attack") return;
    if (current === action) {
      currentMode = mode;
      return;
    }
    blendAnimAction(current, action, fade);
    current = action;
    currentMode = mode;
  };

  const resolveMode = (mode) => {
    if (mode === "run" && run) return { action: run, mode: "run" };
    if (idle) return { action: idle, mode: "idle" };
    if (run) return { action: run, mode: "run" };
    return { action: null, mode: "idle" };
  };

  const attackDurationFor = (action, clip) =>
    clip
      ? Math.max(
          (clip.duration * 1000) / MOE_BISON_ATTACK_TIME_SCALE,
          400
        )
      : MOE_SNAKE_ATTACK_MS;

  const setMode = (mode, setOpts = {}) => {
    if (mode === "attack") {
      const strong = setOpts.variant === "strong" && attackStrong;
      const action = strong ? attackStrong : attackWeak;
      if (!action) return;
      lastAttackAction = action;
      if (setOpts.afterAttack) afterAttackMode = setOpts.afterAttack;
      if (setOpts.restart || current !== action) {
        blendAnimAction(current, action, fade);
        current = action;
        currentMode = "attack";
      }
      return;
    }
    const resolved = resolveMode(mode);
    if (resolved.action) crossfadeTo(resolved.action, resolved.mode);
  };

  const finishHandler = (e) => {
    if (e.action !== attackWeak && e.action !== attackStrong) return;
    const next = resolveMode(afterAttackMode);
    if (next.action) crossfadeTo(next.action, next.mode);
  };
  if (!attackLoop) {
    mixer.addEventListener("finished", finishHandler);
  }

  setMode("idle");
  return {
    setMode,
    getMode: () => currentMode,
    setRunTimeScale: (scale) => {
      if (run) run.timeScale = scale;
    },
    get attackDurationMs() {
      const clip =
        lastAttackAction === attackStrong ? attackStrongClip : attackWeakClip;
      return attackDurationFor(lastAttackAction, clip);
    },
  };
}

/** オーク歩兵 — 弱攻撃パンチ / 強攻撃振り上げ→待機→振り下ろし */
export function createOrcAnimController(mixer, clips, opts = {}) {
  const { attackLoop = false } = opts;
  const idleClip = pickSnakeIdleClip(clips);
  const runClip = pickSnakeRunClip(clips);
  const attackWeakClip = pickClipByName(
    clips,
    MOE_ORC_ATTACK_WEAK_CLIP,
    /snakeattakc(?!strong)|attakc(?!strong)/i
  );
  const attackStrongClip = pickClipByName(
    clips,
    MOE_ORC_ATTACK_STRONG_CLIP,
    /snakeattakcstrong|attakcstrong|strong/i
  );

  const makeAction = (clip, loop) => {
    if (!clip) return null;
    const action = mixer.clipAction(clip);
    action.setLoop(
      loop ? THREE.LoopRepeat : THREE.LoopOnce,
      loop ? Infinity : 1
    );
    if (!loop) action.clampWhenFinished = true;
    return action;
  };

  const idle = makeAction(idleClip, true);
  const run = makeAction(runClip, true);
  const attackWeak = makeAction(attackWeakClip, attackLoop);
  const attackStrong = makeAction(attackStrongClip, attackLoop);
  if (attackWeak) attackWeak.timeScale = MOE_ORC_ATTACK_TIME_SCALE;
  if (attackStrong) attackStrong.timeScale = MOE_ORC_ATTACK_TIME_SCALE;

  let current = null;
  let currentMode = "idle";
  let afterAttackMode = "idle";
  let lastAttackAction = attackWeak;

  const fade = 0.22;

  const crossfadeTo = (action, mode) => {
    if (!action) return;
    if (action === current && mode !== "attack") return;
    if (current === action) {
      currentMode = mode;
      return;
    }
    blendAnimAction(current, action, fade);
    current = action;
    currentMode = mode;
  };

  const resolveMode = (mode) => {
    if (mode === "run" && run) return { action: run, mode: "run" };
    if (idle) return { action: idle, mode: "idle" };
    if (run) return { action: run, mode: "run" };
    return { action: null, mode: "idle" };
  };

  const attackDurationFor = (action, clip) =>
    clip
      ? Math.max(
          (clip.duration * 1000) / MOE_ORC_ATTACK_TIME_SCALE,
          400
        )
      : MOE_SNAKE_ATTACK_MS;

  const setMode = (mode, setOpts = {}) => {
    if (mode === "attack") {
      const strong = setOpts.variant === "strong" && attackStrong;
      const action = strong ? attackStrong : attackWeak;
      if (!action) return;
      lastAttackAction = action;
      if (setOpts.afterAttack) afterAttackMode = setOpts.afterAttack;
      if (current === action && !setOpts.restart) {
        currentMode = "attack";
        return;
      }
      if (setOpts.restart || current !== action) {
        blendAnimAction(current, action, fade);
        current = action;
        currentMode = "attack";
      }
      return;
    }
    const resolved = resolveMode(mode);
    if (resolved.action) crossfadeTo(resolved.action, resolved.mode);
  };

  const finishHandler = (e) => {
    if (e.action !== attackWeak && e.action !== attackStrong) return;
    const next = resolveMode(afterAttackMode);
    if (next.action) crossfadeTo(next.action, next.mode);
  };
  if (!attackLoop) {
    mixer.addEventListener("finished", finishHandler);
  }

  setMode("idle");
  return {
    setMode,
    getMode: () => currentMode,
    setRunTimeScale: (scale) => {
      if (run) run.timeScale = scale;
    },
    get attackDurationMs() {
      const clip =
        lastAttackAction === attackStrong ? attackStrongClip : attackWeakClip;
      return attackDurationFor(lastAttackAction, clip);
    },
  };
}

/** ギュスターヴ — 弱: 体半分サッと前進 / 強: 半分下がり→0.3秒→体1つ分突進 */
export function createGustavAnimController(mixer, clips, opts = {}) {
  const { attackLoop = false } = opts;
  const idleClip = pickSnakeIdleClip(clips);
  const runClip = pickSnakeRunClip(clips);
  const attackWeakClip = pickClipByName(
    clips,
    MOE_GUSTAV_ATTACK_WEAK_CLIP,
    /snakeattakc(?!strong)|attakc(?!strong)/i
  );
  const attackStrongClip = pickClipByName(
    clips,
    MOE_GUSTAV_ATTACK_STRONG_CLIP,
    /snakeattakcstrong|attakcstrong|strong/i
  );

  const makeAction = (clip, loop) => {
    if (!clip) return null;
    const action = mixer.clipAction(clip);
    action.setLoop(
      loop ? THREE.LoopRepeat : THREE.LoopOnce,
      loop ? Infinity : 1
    );
    if (!loop) action.clampWhenFinished = true;
    return action;
  };

  const idle = makeAction(idleClip, true);
  const run = makeAction(runClip, true);
  const attackWeak = makeAction(attackWeakClip, attackLoop);
  const attackStrong = makeAction(attackStrongClip, attackLoop);
  if (attackWeak) attackWeak.timeScale = MOE_GUSTAV_ATTACK_TIME_SCALE;
  if (attackStrong) attackStrong.timeScale = MOE_GUSTAV_ATTACK_TIME_SCALE;

  let current = null;
  let currentMode = "idle";
  let afterAttackMode = "idle";
  let lastAttackAction = attackWeak;

  const fade = 0.1;

  const crossfadeTo = (action, mode) => {
    if (!action) return;
    if (action === current && mode !== "attack") return;
    if (current === action) {
      currentMode = mode;
      return;
    }
    blendAnimAction(current, action, fade);
    current = action;
    currentMode = mode;
  };

  const resolveMode = (mode) => {
    if (mode === "run" && run) return { action: run, mode: "run" };
    if (idle) return { action: idle, mode: "idle" };
    if (run) return { action: run, mode: "run" };
    return { action: null, mode: "idle" };
  };

  const attackDurationFor = (action, clip) =>
    clip
      ? Math.max(
          (clip.duration * 1000) / MOE_GUSTAV_ATTACK_TIME_SCALE,
          400
        )
      : MOE_GUSTAV_WEAK_ATTACK_MS;

  const setMode = (mode, setOpts = {}) => {
    if (mode === "attack") {
      const strong = setOpts.variant === "strong" && attackStrong;
      const action = strong ? attackStrong : attackWeak;
      if (!action) return;
      lastAttackAction = action;
      if (setOpts.afterAttack) afterAttackMode = setOpts.afterAttack;
      if (current === action && !setOpts.restart) {
        currentMode = "attack";
        return;
      }
      if (setOpts.restart || current !== action) {
        blendAnimAction(current, action, fade);
        current = action;
        currentMode = "attack";
      }
      return;
    }
    const resolved = resolveMode(mode);
    if (resolved.action) crossfadeTo(resolved.action, resolved.mode);
  };

  const finishHandler = (e) => {
    if (e.action !== attackWeak && e.action !== attackStrong) return;
    const next = resolveMode(afterAttackMode);
    if (next.action) crossfadeTo(next.action, next.mode);
  };
  if (!attackLoop) {
    mixer.addEventListener("finished", finishHandler);
  }

  setMode("idle");
  return {
    setMode,
    getMode: () => currentMode,
    setRunTimeScale: (scale) => {
      if (run) run.timeScale = scale;
    },
    get attackDurationMs() {
      const clip =
        lastAttackAction === attackStrong ? attackStrongClip : attackWeakClip;
      return attackDurationFor(lastAttackAction, clip);
    },
  };
}

/**
 * @param {string} key
 * @param {string | null | undefined} [modelVariantId]
 */
export function monsterModelUrlForKey(key, modelVariantId) {
  if (modelVariantId && MOE_ENEMY_MODEL_BY_VARIANT[modelVariantId]) {
    return MOE_ENEMY_MODEL_BY_VARIANT[modelVariantId];
  }
  return MOE_ENEMY_MODEL_BY_KEY[key] ?? MONSTER_MODEL_URL;
}

/**
 * @param {import("three").AnimationMixer} mixer
 * @param {import("three").AnimationClip[]} clips
 * @param {{ attackLoop?: boolean }} [opts]
 */
export function createSnakeAnimController(mixer, clips, opts = {}) {
  const { attackLoop = false } = opts;
  const idleClip = pickSnakeIdleClip(clips);
  const walkClip = pickSnakeWalkClip(clips);
  const runClip = pickSnakeRunClip(clips);
  const attackClip = pickSnakeAttackClip(clips);

  const makeAction = (clip, loop) => {
    if (!clip) return null;
    const action = mixer.clipAction(clip);
    action.setLoop(
      loop ? THREE.LoopRepeat : THREE.LoopOnce,
      loop ? Infinity : 1
    );
    if (!loop) action.clampWhenFinished = true;
    return action;
  };

  const idle = makeAction(idleClip, true);
  const walk = makeAction(walkClip, true);
  const run = makeAction(runClip, true);
  const attack = makeAction(attackClip, attackLoop);
  let walkTimeScale = 1;
  let runTimeScale = 1;
  if (walk) walk.timeScale = walkTimeScale;
  if (run) run.timeScale = runTimeScale;
  if (attack) {
    attack.timeScale = MOE_SNAKE_ATTACK_TIME_SCALE;
  }

  let current = null;
  let currentMode = "idle";
  let afterAttackMode = "idle";

  const fade = 0.12;

  const crossfadeTo = (action, mode) => {
    if (!action) return;
    if (action === current && mode !== "attack") return;
    if (current === action) {
      currentMode = mode;
      return;
    }
    blendAnimAction(current, action, fade);
    current = action;
    currentMode = mode;
  };

  const resolveMode = (mode) => {
    if (mode === "attack" && attack) return { action: attack, mode: "attack" };
    if (mode === "walk" && walk) return { action: walk, mode: "walk" };
    if (mode === "run" && run) return { action: run, mode: "run" };
    if (mode === "walk" && run) return { action: run, mode: "run" };
    if (idle) return { action: idle, mode: "idle" };
    if (run) return { action: run, mode: "run" };
    return { action: null, mode: "idle" };
  };

  const setMode = (mode, setOpts = {}) => {
    if (mode === "attack" && attack) {
      if (setOpts.afterAttack) afterAttackMode = setOpts.afterAttack;
      if (current === attack && !setOpts.restart) {
        currentMode = "attack";
        return;
      }
      if (setOpts.restart || current !== attack) {
        blendAnimAction(current, attack, fade);
        current = attack;
        currentMode = "attack";
      }
      return;
    }
    const resolved = resolveMode(mode);
    if (resolved.action) crossfadeTo(resolved.action, resolved.mode);
  };

  if (attack && !attackLoop) {
    mixer.addEventListener("finished", (e) => {
      if (e.action !== attack) return;
      const next = resolveMode(afterAttackMode);
      if (next.action) crossfadeTo(next.action, next.mode);
    });
  }

  const setWalkTimeScale = (scale) => {
    walkTimeScale = scale;
    if (walk) walk.timeScale = scale;
  };

  const setRunTimeScale = (scale) => {
    runTimeScale = scale;
    if (run) run.timeScale = scale;
  };

  setMode("idle");
  return {
    setMode,
    getMode: () => currentMode,
    setWalkTimeScale,
    setRunTimeScale,
    attackDurationMs: attackClip
      ? Math.max(
          (attackClip.duration * 1000) / MOE_SNAKE_ATTACK_TIME_SCALE,
          400
        )
      : MOE_SNAKE_ATTACK_MS / MOE_SNAKE_ATTACK_TIME_SCALE,
  };
}

/**
 * @param {import("three").Object3D} root
 * @param {number | null} tintHex null = 元のテクスチャ色のまま
 */
export function applyModelTint(root, tintHex) {
  if (tintHex == null) return;
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const cloned = mats.map((m) => {
      const c = m.clone();
      if (c.color) c.color.setHex(tintHex);
      return c;
    });
    obj.material = cloned.length === 1 ? cloned[0] : cloned;
  });
}

/** 転生ミステリー ドラゴンⅠ — グレー・紫・黒のミックス */
const MOE_MYSTERY_DRAGON_FORM1_PALETTE = [
  0x2a2438,
  0x4a3d5c,
  0x1a1622,
  0x6b5b8a,
  0x353040,
  0x5c4a72,
];

/** 転生ミステリー ドラゴンⅡ — 赤・オレンジ・黄のフェニックスミックス */
const MOE_MYSTERY_DRAGON_FORM2_PALETTE = [
  0xcc1100,
  0xff4400,
  0xff8800,
  0xffcc22,
  0x991100,
  0xff6622,
];

const MOE_MYSTERY_DRAGON_FORM2_EMISSIVE = [
  0x880000,
  0xcc3300,
  0xff6600,
  0xcc4400,
  0xaa2200,
  0xff5500,
];

/** @typedef {'body' | 'eye' | 'eye_detail' | 'pupil'} MysteryDragonMeshKind */

/** 目・瞳メッシュを体色パレットから分離（名前付き GLB 優先） */
function classifyMysteryDragonMesh(obj) {
  if (!obj.isMesh) return "body";
  const name = obj.name ?? "";
  if (name.includes("MysteryDragonPupil")) return "pupil";
  if (name.includes("MysteryDragonEyeShine")) return "eye_detail";
  if (name.includes("MysteryDragonEyeRing") || name.includes("MysteryDragonEye")) {
    return "eye";
  }

  if (!obj.geometry) return "body";
  const geo = obj.geometry;
  if (!geo.boundingBox) geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const sx = bb.max.x - bb.min.x;
  const sy = bb.max.y - bb.min.y;
  const sz = bb.max.z - bb.min.z;
  const maxDim = Math.max(sx, sy, sz);
  const vol = sx * sy * sz;
  const py = obj.position.y;
  const pz = obj.position.z;

  // 正面の目（頭グループ · 高 z）
  if (py >= 0.12 && py <= 0.28 && pz >= 0.12 && maxDim <= 0.14) {
    if (maxDim <= 0.035) return "pupil";
    if (vol <= 0.0015) return "eye_detail";
    return "eye";
  }

  return "body";
}

/** @type {Record<MysteryDragonMeshKind, { color: number, emissive?: number, emissiveIntensity?: number }>} */
const MOE_MYSTERY_DRAGON_FORM1_EYE = {
  body: { color: 0x4a3d5c },
  eye: { color: 0xe8e0ff, emissive: 0x3d2a66, emissiveIntensity: 0.12 },
  eye_detail: { color: 0x9b59ff, emissive: 0x6b3fa0, emissiveIntensity: 0.35 },
  pupil: { color: 0x0a0018 },
};

/** ドラゴンⅡ — 白目・金瞳・黒瞳で炎色の顔とコントラスト */
const MOE_MYSTERY_DRAGON_FORM2_EYE = {
  body: { color: 0xff4400 },
  eye: { color: 0xfff8e8, emissive: 0x442200, emissiveIntensity: 0.08 },
  eye_detail: { color: 0xffcc00, emissive: 0xff8800, emissiveIntensity: 0.62 },
  pupil: { color: 0x120400, emissive: 0x000000, emissiveIntensity: 0 },
};

function applyMysteryDragonMeshPalette(
  root,
  colorPalette,
  emissivePalette = null,
  eyePalette = null
) {
  let bodyIdx = 0;
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const kind = eyePalette ? classifyMysteryDragonMesh(obj) : "body";
    let colorHex;
    let emissiveHex = null;
    let emissiveIntensity = 0;

    if (kind !== "body" && eyePalette?.[kind]) {
      const eye = eyePalette[kind];
      colorHex = eye.color;
      emissiveHex = eye.emissive ?? null;
      emissiveIntensity = eye.emissiveIntensity ?? 0;
    } else {
      colorHex = colorPalette[bodyIdx % colorPalette.length];
      emissiveHex = emissivePalette
        ? emissivePalette[bodyIdx % emissivePalette.length]
        : null;
      emissiveIntensity = emissiveHex ? 0.38 + (bodyIdx % 3) * 0.08 : 0;
      bodyIdx += 1;
    }

    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const cloned = mats.map((m) => {
      const c = m.clone();
      if (c.color) c.color.setHex(colorHex);
      if (c.emissive) {
        if (emissiveHex != null) {
          c.emissive.setHex(emissiveHex);
          c.emissiveIntensity = emissiveIntensity;
        } else {
          c.emissive.setHex(0x000000);
          c.emissiveIntensity = 0;
        }
      }
      return c;
    });
    obj.material = cloned.length === 1 ? cloned[0] : cloned;
  });
}

/** 転生ミステリー ドラゴンⅠ */
export function applyMysteryDragonForm1Tint(root) {
  applyMysteryDragonMeshPalette(
    root,
    MOE_MYSTERY_DRAGON_FORM1_PALETTE,
    null,
    MOE_MYSTERY_DRAGON_FORM1_EYE
  );
}

/** 転生ミステリー ドラゴンⅡ — 炎のフェニックスカラー */
export function applyPhoenixDragonTint(root) {
  applyMysteryDragonMeshPalette(
    root,
    MOE_MYSTERY_DRAGON_FORM2_PALETTE,
    MOE_MYSTERY_DRAGON_FORM2_EMISSIVE,
    MOE_MYSTERY_DRAGON_FORM2_EYE
  );
}

/**
 * @param {import("three").Object3D} root
 * @param {0|1|2} form 0=通常 · 1=ドラゴンⅠ · 2=ドラゴンⅡ
 */
export function applyMysteryDragonVisualForm(root, form) {
  if (form === 1) applyMysteryDragonForm1Tint(root);
  else if (form === 2) applyPhoenixDragonTint(root);
}

/** アースワーム：赤地 + 体長方向の黒帯（テクスチャ。SkinnedMesh 向けにシェーダ改変なし） */
const MOE_EARTH_WORM_STRIPE_RED = "#dc2626";
const MOE_EARTH_WORM_STRIPE_BLACK = "#0f0f0f";
/** 1 周期のピクセル幅（赤多め 7:3） */
const MOE_EARTH_WORM_STRIPE_TEX_CYCLE = 10;
const MOE_EARTH_WORM_STRIPE_TEX_RED_W = 7;

/** @type {THREE.CanvasTexture | null} */
let moeEarthWormStripeTexSource = null;

function moeEarthWormStripeTextureSource() {
  if (moeEarthWormStripeTexSource) return moeEarthWormStripeTexSource;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 8;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  for (let x = 0; x < canvas.width; x++) {
    const phase = x % MOE_EARTH_WORM_STRIPE_TEX_CYCLE;
    ctx.fillStyle =
      phase < MOE_EARTH_WORM_STRIPE_TEX_RED_W
        ? MOE_EARTH_WORM_STRIPE_RED
        : MOE_EARTH_WORM_STRIPE_BLACK;
    ctx.fillRect(x, 0, 1, canvas.height);
  }
  moeEarthWormStripeTexSource = new THREE.CanvasTexture(canvas);
  moeEarthWormStripeTexSource.wrapS = THREE.RepeatWrapping;
  moeEarthWormStripeTexSource.wrapT = THREE.RepeatWrapping;
  moeEarthWormStripeTexSource.colorSpace = THREE.SRGBColorSpace;
  return moeEarthWormStripeTexSource;
}

/** @param {import("three").Object3D} root */
function moeEarthWormStripeBounds(root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const useX = size.x >= size.z;
  return {
    useX,
    len: Math.max(useX ? size.x : size.z, 0.001),
  };
}

/** @type {THREE.CanvasTexture | null} */
let moeEarthWormEyeTexSource = null;

function moeEarthWormEyeTextureSource() {
  if (moeEarthWormEyeTexSource) return moeEarthWormEyeTexSource;
  if (typeof document === "undefined") return null;
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(size / 2 + 1, size / 2 + 1, size / 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(size / 2 - 4, size / 2 - 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  moeEarthWormEyeTexSource = new THREE.CanvasTexture(canvas);
  moeEarthWormEyeTexSource.colorSpace = THREE.SRGBColorSpace;
  return moeEarthWormEyeTexSource;
}

/** Head ボーン：glb 頭部の目の出っ張りへ丸目を載せる */
function applyEarthWormEyes(root) {
  if (root.userData.moeEarthWormEyes) return;
  let headBone = null;
  root.traverse((obj) => {
    if (obj.isBone && obj.name === "Head") headBone = obj;
  });
  if (!headBone) return;
  const eyeTex = moeEarthWormEyeTextureSource();
  if (!eyeTex) return;
  const eyeGeo = new THREE.SphereGeometry(0.036, 10, 10);
  for (const sx of [-1, 1]) {
    const eyeMat = new THREE.MeshStandardMaterial({
      map: eyeTex,
      roughness: 0.35,
      metalness: 0,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.name = sx < 0 ? "EarthWormEyeL" : "EarthWormEyeR";
    /** ±X 方向にもう少し外へ（頭メッシュから出す） */
    eye.position.set(0.138 * sx, 0.19, 0.02);
    eye.rotation.set(-Math.PI / 2, sx * 0.18, 0);
    eye.scale.set(1.08, 1.08, 0.48);
    eye.renderOrder = 3;
    headBone.add(eye);
  }
  root.userData.moeEarthWormEyes = true;
}

/**
 * @param {import("three").Object3D} root
 */
export function applyEarthWormStripeMaterial(root) {
  const bounds = moeEarthWormStripeBounds(root);
  const source = moeEarthWormStripeTextureSource();
  if (!source) {
    applyModelTint(root, 0xdc2626);
    applyEarthWormEyes(root);
    return;
  }
  const repeat = MOE_EARTH_WORM_STRIPE_COUNT;
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    if (obj.name === "EarthWormEyeL" || obj.name === "EarthWormEyeR") return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const next = mats.map((m) => {
      const c = m.clone();
      const map = source.clone();
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      if (bounds.useX) {
        map.repeat.set(repeat, 1);
      } else {
        map.repeat.set(1, repeat);
        map.rotation = Math.PI * 0.5;
      }
      map.needsUpdate = true;
      c.map = map;
      if (c.color) c.color.setHex(0xffffff);
      c.emissive?.setHex(0x000000);
      c.transparent = false;
      c.opacity = 1;
      c.depthWrite = true;
      c.side = THREE.DoubleSide;
      c.needsUpdate = true;
      return c;
    });
    obj.material = next.length === 1 ? next[0] : next;
    obj.frustumCulled = false;
  });
  applyEarthWormEyes(root);
}

/** @param {import("three").Object3D} _root */
export function updateEarthWormStripeUniforms(_root) {
  /* テクスチャ方式では毎フレーム更新不要 */
}

export function enemyUsesStripeMaterial(key) {
  return key === "earth_worm";
}

/** モデルの足元を y=0 に合わせ、目標高さにスケール。groundLift は配置時に gy へ加算 */
export function fitModelToGround(root, targetHeight = 1.1) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const scale = targetHeight / Math.max(size.y, 0.001);
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  const groundLift = -box2.min.y;
  root.position.y = 0;
  return { scale, groundLift };
}
