/**
 * プレイヤー回復魔法 — MOE 公式ディレイ（60fps）
 * https://wikiwiki.jp/moe-pet/%E3%82%B9%E3%82%AD%E3%83%AB
 */

export const MOE_PLAYER_HEAL_FRAME_RATE = 60;

/** ライトヒーリング — ディレイ246f ≒4秒 */
export const MOE_PLAYER_HEAL_LIGHT_DELAY_FRAMES = 246;

/** ヒーリング — ディレイ290f ≒4.8秒 */
export const MOE_PLAYER_HEAL_HEALING_DELAY_FRAMES = 290;

/** ヒーリングオール — ディレイ378f ≒6.3秒 */
export const MOE_PLAYER_HEAL_ALL_DELAY_FRAMES = 378;

/**
 * @param {number} delayFrames
 */
export function moePlayerHealDelaySecFromFrames(delayFrames) {
  return Math.round(delayFrames / MOE_PLAYER_HEAL_FRAME_RATE);
}

export const MOE_PLAYER_HEAL_LIGHT_COOLDOWN_SEC = moePlayerHealDelaySecFromFrames(
  MOE_PLAYER_HEAL_LIGHT_DELAY_FRAMES
);

export const MOE_PLAYER_HEAL_HEALING_COOLDOWN_SEC =
  moePlayerHealDelaySecFromFrames(MOE_PLAYER_HEAL_HEALING_DELAY_FRAMES);

export const MOE_PLAYER_HEAL_ALL_COOLDOWN_SEC = moePlayerHealDelaySecFromFrames(
  MOE_PLAYER_HEAL_ALL_DELAY_FRAMES
);

/** @typedef {'light' | 'healing' | 'healAll'} MoePlayerHealCooldownKey */

export const MOE_PLAYER_HEAL_COOLDOWN_SEC = {
  light: MOE_PLAYER_HEAL_LIGHT_COOLDOWN_SEC,
  healing: MOE_PLAYER_HEAL_HEALING_COOLDOWN_SEC,
  healAll: MOE_PLAYER_HEAL_ALL_COOLDOWN_SEC,
};

/**
 * @param {MoePlayerHealCooldownKey} key
 */
export function moePlayerHealCooldownLabel(key) {
  const sec = MOE_PLAYER_HEAL_COOLDOWN_SEC[key];
  if (key === "light") return `ライトヒーリング · 待機中（${sec}秒）`;
  if (key === "healing") return `ヒーリング · 待機中（${sec}秒）`;
  return `ヒーリングオール · 待機中（${sec}秒）`;
}

/** 回復スキル熟練度 — MOE 習得 Lv 目安（成功率の基準） */
export const MOE_PLAYER_HEAL_REQUIRED_LEVELS = {
  light: 10,
  healing: 40,
  healAll: 50,
  regen: 60,
};

/** ライトヒーリング級（アトルーム下級回復と同量） */
export const MOE_PLAYER_HEAL_LIGHT_AMOUNT = 30;

/** Wiki: ヒーリングはライトの約1.5倍 */
export const MOE_PLAYER_HEAL_HEALING_AMOUNT = 45;

/** ヒーリングオール — ヒーリングの約2倍（暫定） */
export const MOE_PLAYER_HEAL_ALL_AMOUNT = 90;

/**
 * @param {"light" | "healing" | "healAll"} key
 */
export function moePlayerHealSkillTitle(key) {
  if (key === "light") {
    return `ライトヒーリング（待機${MOE_PLAYER_HEAL_LIGHT_COOLDOWN_SEC}秒）`;
  }
  if (key === "healing") {
    return `ヒーリング（待機${MOE_PLAYER_HEAL_HEALING_COOLDOWN_SEC}秒）`;
  }
  return `ヒーリングオール（待機${MOE_PLAYER_HEAL_ALL_COOLDOWN_SEC}秒）`;
}
