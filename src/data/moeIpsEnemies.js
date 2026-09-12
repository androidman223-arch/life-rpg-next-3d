/**
 * イプス峡谷 — トータス / ジャイアント トータス
 * ※ イプスバス（川のブラックバス）とは別種
 * ベース定義は moeMonsterFieldRegistry へ統合
 */

import { moeMonsterFieldBase } from "@/data/moeMonsterFieldRegistry";

export const MOE_TURTLE_KEY = "turtle";
export const MOE_GIANT_TORTOISE_KEY = "giant_tortoise";

export const MOE_IPS_ENEMIES = [
  moeMonsterFieldBase(MOE_TURTLE_KEY),
  moeMonsterFieldBase(MOE_GIANT_TORTOISE_KEY),
].filter(Boolean);
