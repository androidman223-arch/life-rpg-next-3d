/**
 * 待ち時間後のフィールド敵再配置。全快にして respawnAt を消す。
 */

import {
  MOE_MEERIM_ENEMIES,
  MOE_MEERIM_MOUNTAIN_BISON_KEY,
  MOE_MID_BOSS_HP_MULTIPLIER,
  MOE_SUPER_BOSS_HP_MULTIPLIER,
} from "@/data/moeMeerimEnemies";
import { moeMonsterFieldBase } from "@/data/moeMonsterFieldRegistry";
import { moe3dEstimatedTileSize } from "@/lib/moe3dAltarWarp";
import {
  moe3dIsMapSlotFieldEnemy,
  moe3dMonsterFieldSpawnWorld,
  moe3dPickRespawnInMapSlot,
} from "@/lib/moe3dMonsterMapSpawns";
import {
  moe2dMidBossSpawnPosition,
  moe2dMountainBisonSpawnPosition,
  moe2dPickRespawnInZone2d,
  moe2dRoughBisonSpawnPosition,
  moe2dSuperBossSpawnPosition,
} from "@/lib/moeField2DLayout";
import {
  MOE_3D_ENEMY_ZONES,
  moe3dEnemyStatsForZoneLevel,
  moe3dMidBossSpawnPosition,
  moe3dMountainBisonSpawnPosition,
  moe3dPickRespawnInZone,
  moe3dRoughBisonSpawnPosition,
  moe3dSuperBossSpawnPosition,
} from "@/lib/moeField3DModels";

/**
 * @param {object} en
 * @param {object|null|undefined} w
 * @param {object[]} roster
 * @param {{ x: number, y: number }} playerPos
 */
export function placeMoeFieldEnemyRespawn(en, w, roster, playerPos) {
  const next = placeRespawnedEnemy(en, w, roster, playerPos);
  if (!next) return { ...en, hp: 0 };
  return { ...next, respawnAt: null };
}

/**
 * @param {object} en
 * @param {object|null|undefined} w
 * @param {object[]} roster
 * @param {{ x: number, y: number }} playerPos
 */
function placeRespawnedEnemy(en, w, roster, playerPos) {
  if (!w) return null;
  if (en.fieldBison) {
    const base = MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
    const pos = w.mode3d
      ? en.key === MOE_MEERIM_MOUNTAIN_BISON_KEY
        ? w.mountainBisonPos ??
          moe3dMountainBisonSpawnPosition(
            w.halfW ?? w.mw / 2,
            w.halfD ?? w.mh / 2
          )
        : w.roughBisonPos ??
          moe3dRoughBisonSpawnPosition(
            w.halfW ?? w.mw / 2,
            w.halfD ?? w.mh / 2
          )
      : en.key === MOE_MEERIM_MOUNTAIN_BISON_KEY
        ? moe2dMountainBisonSpawnPosition(w.rowLayout, w.mw)
        : moe2dRoughBisonSpawnPosition(w.rowLayout, w.mw);
    const scaled = moe3dEnemyStatsForZoneLevel(base, base.level);
    return {
      ...en,
      x: pos.x,
      y: pos.y,
      level: scaled.level,
      hpMax: scaled.hpMax,
      hp: scaled.hpMax,
      petDamage: scaled.petDamage,
      wiki: scaled.wiki,
      zoneLevel: base.level,
    };
  }
  if (w.mode3d) {
    const hw = w.halfW ?? w.mw / 2;
    const hd = w.halfD ?? w.mh / 2;
    if (moe3dIsMapSlotFieldEnemy(en)) {
      const { tileW, tileD } = moe3dEstimatedTileSize(hw, hd);
      const base =
        moeMonsterFieldBase(en.key) ??
        MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ??
        en;
      const area = en.spawnArea ?? en.mapSlotId;
      const fixed =
        en.midBoss || en.superBoss
          ? moe3dMonsterFieldSpawnWorld(
              area,
              en.key,
              en.slotInZone ?? 0,
              tileW,
              tileD
            )
          : null;
      const pos =
        fixed ??
        moe3dPickRespawnInMapSlot(
          area,
          tileW,
          tileD,
          playerPos,
          roster,
          en.id
        );
      const scaled = moe3dEnemyStatsForZoneLevel(base, base.level);
      return {
        ...en,
        x: pos.x,
        y: pos.y,
        level: scaled.level,
        hpMax: scaled.hpMax,
        hp: scaled.hpMax,
        petDamage: scaled.petDamage,
        wiki: scaled.wiki,
        zoneLevel: base.level,
      };
    }
  }
  if ((en.midBoss || en.superBoss) && !moe3dIsMapSlotFieldEnemy(en)) {
    const base = MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
    const pos = w.mode3d
      ? en.superBoss
        ? w.superBossPos ??
          moe3dSuperBossSpawnPosition(
            w.halfW ?? w.mw / 2,
            w.halfD ?? w.mh / 2
          )
        : w.midBossPos ??
          moe3dMidBossSpawnPosition(w.halfW ?? w.mw / 2, w.halfD ?? w.mh / 2)
      : en.superBoss
        ? moe2dSuperBossSpawnPosition(w.rowLayout, w.mw)
        : moe2dMidBossSpawnPosition(w.rowLayout, w.mw);
    const scaled = moe3dEnemyStatsForZoneLevel(base, base.level);
    const hpMult = en.superBoss
      ? MOE_SUPER_BOSS_HP_MULTIPLIER
      : MOE_MID_BOSS_HP_MULTIPLIER;
    const hpMax = Math.max(1, Math.round(scaled.hpMax * hpMult));
    return {
      ...en,
      x: pos.x,
      y: pos.y,
      level: scaled.level,
      hpMax,
      hp: hpMax,
      petDamage: scaled.petDamage,
      wiki: scaled.wiki,
      zoneLevel: base.level,
    };
  }
  if (w.mode3d) {
    const hw = w.halfW ?? w.mw / 2;
    const hd = w.halfD ?? w.mh / 2;
    const zoneIndex = en.zoneIndex ?? 0;
    const zoneCount = MOE_3D_ENEMY_ZONES.length;
    const pos = moe3dPickRespawnInZone(
      zoneIndex,
      zoneCount,
      hw,
      hd,
      playerPos,
      roster,
      en.id
    );
    const base = MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
    const zoneLevel =
      en.zoneLevel ?? MOE_3D_ENEMY_ZONES[zoneIndex]?.level ?? base.level;
    const scaled = moe3dEnemyStatsForZoneLevel(base, zoneLevel);
    return {
      ...en,
      x: pos.x,
      y: pos.y,
      level: scaled.level,
      hpMax: scaled.hpMax,
      hp: scaled.hpMax,
      petDamage: scaled.petDamage,
      wiki: scaled.wiki,
      zoneLevel: scaled.zoneLevel,
    };
  }
  const rowLayout = w.rowLayout;
  if (rowLayout?.length) {
    const pos = moe2dPickRespawnInZone2d(
      en.zoneIndex ?? 0,
      en.slotInZone ?? 0,
      rowLayout,
      w.mw,
      roster,
      en.id
    );
    const base = MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
    const zoneLevel =
      en.zoneLevel ??
      MOE_3D_ENEMY_ZONES[en.zoneIndex ?? 0]?.level ??
      base.level;
    const scaled = moe3dEnemyStatsForZoneLevel(base, zoneLevel);
    return {
      ...en,
      x: pos.x,
      y: pos.y,
      level: scaled.level,
      hpMax: scaled.hpMax,
      hp: scaled.hpMax,
      petDamage: scaled.petDamage,
      wiki: scaled.wiki,
      zoneLevel: scaled.zoneLevel,
    };
  }
  const screenH = w.mh / 6;
  const yStart = w.mh - (en.sy + 1) * screenH;
  return {
    ...en,
    hp: en.hpMax,
    x: 100 + Math.random() * (w.mw - 200),
    y: yStart + 50 + Math.random() * (screenH - 100),
  };
}
