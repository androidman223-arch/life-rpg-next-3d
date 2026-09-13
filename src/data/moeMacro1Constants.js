/**
 * マクロ１ — フィールド敵の表示スケール（全公式敵 GLB）
 */
import { MOE_MONSTER_FIELD_REGISTRY } from "@/data/moeMonsterFieldRegistry";
import { moeHatiilDesertActiveFieldEntries } from "@/data/maps/moeHatiilDesertPlanned";
import { moeAlbeezForestActiveFieldEntries } from "@/data/maps/moeAlbeezForestPlanned";
import { moeElanPalaceActiveFieldEntries } from "@/data/maps/moeElanPalacePlanned";
import { moeNeokuMountainActiveFieldEntries } from "@/data/maps/moeNeokuMountainPlanned";
import { moeSulfurMineActiveFieldEntries } from "@/data/maps/moeSulfurMinePlanned";

/** マクロ１で配置した全フィールド敵の表示倍率 */
export const MOE_MACRO1_DISPLAY_SCALE = 3;

/** @type {Set<string>} */
export const MOE_MACRO1_FIELD_ENEMY_KEYS = new Set([
  ...MOE_MONSTER_FIELD_REGISTRY.map((e) => e.key),
  ...moeHatiilDesertActiveFieldEntries().map((e) => e.key),
  ...moeSulfurMineActiveFieldEntries().map((e) => e.key),
  ...moeElanPalaceActiveFieldEntries().map((e) => e.key),
  ...moeAlbeezForestActiveFieldEntries().map((e) => e.key),
  ...moeNeokuMountainActiveFieldEntries().map((e) => e.key),
]);

/** @param {string} key @param {number} height */
export function moeMacro1DisplayHeight(key, height) {
  if (!MOE_MACRO1_FIELD_ENEMY_KEYS.has(key)) return height;
  return height * MOE_MACRO1_DISPLAY_SCALE;
}
