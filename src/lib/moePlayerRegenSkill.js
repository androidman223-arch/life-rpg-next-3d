/**
 * リジェネレイション — MOE 公式
 * https://wikiwiki.jp/moe-pet/%E3%82%B9%E3%82%AD%E3%83%AB
 * https://wikiwiki.jp/moe-pet/%E3%83%9A%E3%83%83%E3%83%88/%E7%89%B9%E6%AE%8A/%E3%82%B7%E3%83%AB%E3%83%90%E3%83%BC%20%E3%82%B4%E3%83%BC%E3%83%AC%E3%83%A0
 */

/** MOE 60fps（moePlayerHealSkills と同期） */
const MOE_REGEN_FRAME_RATE = 60;

/** 詠唱241f ≒4秒 */
export const MOE_PLAYER_REGEN_CHANT_FRAMES = 241;

/** ディレイ334f ≒5.5秒（再発動待ち） */
export const MOE_PLAYER_REGEN_DELAY_FRAMES = 334;

export const MOE_PLAYER_REGEN_CHANT_SEC = Math.round(
  MOE_PLAYER_REGEN_CHANT_FRAMES / MOE_REGEN_FRAME_RATE
);

export const MOE_PLAYER_REGEN_COOLDOWN_SEC = Math.round(
  MOE_PLAYER_REGEN_DELAY_FRAMES / MOE_REGEN_FRAME_RATE
);

/** Wiki: 時間をおいて15回回復 */
export const MOE_PLAYER_REGEN_TICK_COUNT = 15;

/**
 * tick 間隔（秒）— Wiki 未記載。実測・シルバーゴーレム運用では約3秒間隔が一般的
 * （安眠導歩など別スキルとは別系統）
 */
export const MOE_PLAYER_REGEN_TICK_INTERVAL_SEC = 3;

/**
 * 効果時間（秒）— 即1回目＋以降3秒間隔で15回 → 約42秒（0分42秒）
 * Wiki は秒数未記載 · 15回×3秒間隔の実測目安
 */
export const MOE_PLAYER_REGEN_EFFECT_DURATION_SEC =
  (MOE_PLAYER_REGEN_TICK_COUNT - 1) * MOE_PLAYER_REGEN_TICK_INTERVAL_SEC;

/**
 * 1 tick の HP — シルバーゴーレム Lv80.1 成長表 14〜15 / 技説明 16〜17
 * 回復魔法70 · 低〜中魔力のベース目安
 */
export const MOE_PLAYER_REGEN_HP_PER_TICK = 15;

/** 公式リジェネは HP のみ（MP 回復は別スキル） */
export const MOE_PLAYER_REGEN_MP_PER_TICK = 0;

/** トグル ON 時の UI 説明 */
export function moePlayerRegenToggleTitle() {
  const min = Math.floor(MOE_PLAYER_REGEN_EFFECT_DURATION_SEC / 60);
  const sec = MOE_PLAYER_REGEN_EFFECT_DURATION_SEC % 60;
  const durationLabel =
    min > 0 ? `${min}分${sec}秒` : `${MOE_PLAYER_REGEN_EFFECT_DURATION_SEC}秒`;
  return `${MOE_PLAYER_REGEN_TICK_INTERVAL_SEC}秒ごと HP+${MOE_PLAYER_REGEN_HP_PER_TICK}×${MOE_PLAYER_REGEN_TICK_COUNT}回（約${durationLabel}）`;
}

/**
 * @param {number} cooldownUntilMs
 * @param {number} nowMs
 */
export function moePlayerRegenCooldownRemainSec(cooldownUntilMs, nowMs) {
  if (!cooldownUntilMs || nowMs >= cooldownUntilMs) return 0;
  return Math.ceil((cooldownUntilMs - nowMs) / 1000);
}
