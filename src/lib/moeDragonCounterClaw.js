/**
 * カウンタークロウ（龍神 Lv100）— MOE ブラッドルーレット寄り
 * 防御後の物理被ダメを約半分にし、軽減した分を攻撃者へ反射（リアクティブ）
 */

export const MOE_DRAGON_COUNTER_CLAW_DURATION_MS = 5000;
/** 発動から次に使えるまで（効果5秒＋効果後待ち5秒） */
export const MOE_DRAGON_COUNTER_CLAW_COOLDOWN_MS = 10000;

/** 公式の「45～60％軽減」の中央値（防御後ダメに対する割合） */
export const MOE_DRAGON_COUNTER_CLAW_OFFICIAL_CUT_RATE = 0.5;

/**
 * mitigated 100% を taken / reflect に配分（将来のカウンター複数種用）
 * @typedef {{ takenPct: number, reflectPct: number }} MoeCounterDamagePreset
 */

/** @type {MoeCounterDamagePreset} */
export const MOE_COUNTER_PRESET_BLOOD_ROULETTE = {
  takenPct: 50,
  reflectPct: 50,
};

/** 案: 被ダメ100%・反射0%（タゲ固定のみ等） */
export const MOE_COUNTER_PRESET_TAKEN_ONLY = { takenPct: 100, reflectPct: 0 };

/** 案: 被ダメ80%・反射20%（弱めカウンター） */
export const MOE_COUNTER_PRESET_LIGHT = { takenPct: 80, reflectPct: 20 };

/**
 * @param {number} mitigatedIncoming 防御等後の被ダメ（MOEルーレットはここを基準）
 * @param {MoeCounterDamagePreset} preset
 */
export function moeCounterDamageSplitFromMitigated(
  mitigatedIncoming,
  preset
) {
  const base = Math.max(0, Math.floor(mitigatedIncoming));
  const taken = Math.max(0, Math.floor((base * preset.takenPct) / 100));
  const reflect = Math.max(0, Math.floor((base * preset.reflectPct) / 100));
  return { taken, reflect };
}

/**
 * @param {number} mitigatedIncoming
 * @param {number} _rawIncoming 未使用（呼び出し側の互換用）
 */
export function moeDragonCounterClawDamageSplit(
  mitigatedIncoming,
  _rawIncoming
) {
  return moeCounterDamageSplitFromMitigated(
    mitigatedIncoming,
    MOE_COUNTER_PRESET_BLOOD_ROULETTE
  );
}

/**
 * @param {number} [nowMs]
 * @returns {{ effectUntilMs: number, cooldownUntilMs: number }}
 */
export function activateMoeDragonCounterClaw(nowMs = Date.now()) {
  return {
    effectUntilMs: nowMs + MOE_DRAGON_COUNTER_CLAW_DURATION_MS,
    cooldownUntilMs: nowMs + MOE_DRAGON_COUNTER_CLAW_COOLDOWN_MS,
  };
}

/** @deprecated use activateMoeDragonCounterClaw */
export function beginMoeDragonCounterClaw(nowMs = Date.now()) {
  return activateMoeDragonCounterClaw(nowMs).effectUntilMs;
}

/** @param {number} untilMs @param {number} [nowMs] */
export function isMoeDragonCounterClawActive(untilMs, nowMs = Date.now()) {
  return untilMs > nowMs;
}

/**
 * @param {number} cooldownUntilMs
 * @param {number} [nowMs]
 * @param {number} [effectUntilMs]
 */
export function moeDragonCounterClawCooldownRemainSec(
  cooldownUntilMs,
  nowMs = Date.now(),
  effectUntilMs = 0
) {
  if (isMoeDragonCounterClawActive(effectUntilMs, nowMs)) return 0;
  if (cooldownUntilMs <= nowMs) return 0;
  return Math.ceil((cooldownUntilMs - nowMs) / 1000);
}

/**
 * @param {number} enemyHp
 * @param {number} reflectDamage
 */
export function moeEnemyHpAfterCounterReflect(enemyHp, reflectDamage) {
  const damage = Math.max(0, Math.floor(reflectDamage));
  if (damage <= 0) {
    return { hp: enemyHp, damage: 0, defeated: false };
  }
  const hp = Math.max(0, enemyHp - damage);
  return { hp, damage, defeated: hp <= 0 };
}
