const STORAGE_KEY = "life-rpg-moe-player-vitals";

/** @typedef {{ hp: number, hpMax: number, stamina: number, staminaMax: number, mp: number, mpMax: number }} MoePlayerVitals */

/** @param {MoePlayerVitals | null | undefined} a @param {MoePlayerVitals | null | undefined} b */
export function moePlayerVitalsEqual(a, b) {
  if (!a || !b) return false;
  return (
    a.hp === b.hp &&
    a.hpMax === b.hpMax &&
    a.stamina === b.stamina &&
    a.staminaMax === b.staminaMax &&
    a.mp === b.mp &&
    a.mpMax === b.mpMax
  );
}

/** @param {number} level */
export function moePlayerVitalsMaxForLevel(level) {
  const L = Math.max(1, Math.floor(Number(level) || 1));
  return {
    hpMax: 100 + (L - 1) * 12,
    staminaMax: 100,
    mpMax: 100 + (L - 1) * 6,
  };
}

/** @param {number} level @returns {MoePlayerVitals} */
export function defaultMoePlayerVitals(level = 1) {
  const maxes = moePlayerVitalsMaxForLevel(level);
  return {
    hp: maxes.hpMax,
    hpMax: maxes.hpMax,
    stamina: maxes.staminaMax,
    staminaMax: maxes.staminaMax,
    mp: maxes.mpMax,
    mpMax: maxes.mpMax,
  };
}

/** フィールド再入場（リロード）時：MAXまで全回復 */
export function fullHealMoePlayerVitals(level = 1) {
  const vitals = defaultMoePlayerVitals(level);
  saveMoePlayerVitals(vitals);
  return vitals;
}

/** @param {number} level @returns {MoePlayerVitals} */
export function loadMoePlayerVitals(level = 1) {
  const maxes = moePlayerVitalsMaxForLevel(level);
  if (typeof window === "undefined") {
    return defaultMoePlayerVitals(level);
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMoePlayerVitals(level);
    const p = JSON.parse(raw);
    const clamp = (v, max) =>
      Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));
    return {
      hp: clamp(p.hp, maxes.hpMax),
      hpMax: maxes.hpMax,
      stamina: clamp(p.stamina, maxes.staminaMax),
      staminaMax: maxes.staminaMax,
      mp: clamp(p.mp, maxes.mpMax),
      mpMax: maxes.mpMax,
    };
  } catch {
    return defaultMoePlayerVitals(level);
  }
}

/** @param {MoePlayerVitals} vitals */
export function saveMoePlayerVitals(vitals) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        hp: vitals.hp,
        stamina: Math.floor(vitals.stamina),
        mp: vitals.mp,
      })
    );
  } catch {
    /* quota */
  }
}

/** @param {number} current @param {number} max */
export function moeVitalBarPct(current, max) {
  const m = Number(max);
  if (!m || m <= 0) return 0;
  return Math.max(0, Math.min(100, (Number(current) / m) * 100));
}

/** 勇者の自然回復（フィールド常時 · 1秒ごと） */
export const MOE_PLAYER_NATURAL_REGEN_INTERVAL_SEC = 1;

/** スタミナ自然回復（/秒 · 走行中も回復する） */
export const MOE_PLAYER_STAMINA_REGEN_PER_SEC = 2;

/** バナナミルクのスタミナ回復倍率 */
export const MOE_BANANA_MILK_STAMINA_REGEN_MULT = 3;

/** Shift走行のスタミナ消費（/秒 · 自然回復の3倍） */
export const MOE_PLAYER_SPRINT_STAMINA_DRAIN_PER_SEC =
  MOE_PLAYER_STAMINA_REGEN_PER_SEC * 3;

/** バナナミルク ON 時のスタミナ回復（/秒） */
export function moePlayerBananaMilkStaminaRegenPerSec() {
  return MOE_PLAYER_STAMINA_REGEN_PER_SEC * MOE_BANANA_MILK_STAMINA_REGEN_MULT;
}

/** @param {number} stamina */
export function displayMoePlayerStamina(stamina) {
  return Math.max(0, Math.floor(Number(stamina) || 0));
}

/**
 * @param {number} stamina
 * @param {number} dt
 * @param {{ sprinting?: boolean, moving?: boolean, drainPerSec?: number }} [opts]
 */
export function applyMoeSprintStaminaDrain(stamina, dt, opts = {}) {
  const {
    sprinting = false,
    moving = false,
    drainPerSec = MOE_PLAYER_SPRINT_STAMINA_DRAIN_PER_SEC,
  } = opts;
  if (!sprinting || !moving || drainPerSec <= 0 || dt <= 0) return stamina;
  return Math.max(0, stamina - drainPerSec * dt);
}

/**
 * @param {MoePlayerVitals} prev
 * @param {{ staminaRegenMult?: number }} [opts]
 * @returns {MoePlayerVitals | null}
 */
export function tickMoePlayerNaturalRegen(prev, opts = {}) {
  const { staminaRegenMult = 1 } = opts;
  let hp = prev.hp;
  let stamina = prev.stamina;
  let mp = prev.mp;
  let changed = false;

  if (hp < prev.hpMax) {
    hp = Math.min(prev.hpMax, hp + 1);
    changed = true;
  }
  if (stamina < prev.staminaMax) {
    const gain = Math.max(
      1,
      Math.floor(MOE_PLAYER_STAMINA_REGEN_PER_SEC * staminaRegenMult)
    );
    stamina = Math.min(prev.staminaMax, stamina + gain);
    changed = true;
  }
  if (mp < prev.mpMax) {
    mp = Math.min(prev.mpMax, mp + 1);
    changed = true;
  }

  if (!changed) return null;
  return { ...prev, hp, stamina, mp };
}

/**
 * フィールド1フレーム分の勇者バイタル（走行消費 + 自然回復）
 * @param {MoePlayerVitals} prev
 * @param {number} dt
 * @param {{
 *   regenAcc: number,
 *   sprinting?: boolean,
 *   moving?: boolean,
 *   staminaRegenMult?: number,
 * }} opts
 */
export function tickMoePlayerVitalsField(prev, dt, opts) {
  let vitals = prev;
  let changed = false;
  let regenAcc = opts.regenAcc + dt;

  const nextStamina = applyMoeSprintStaminaDrain(vitals.stamina, dt, {
    sprinting: opts.sprinting,
    moving: opts.moving,
  });
  if (nextStamina !== vitals.stamina) {
    vitals = { ...vitals, stamina: nextStamina };
    changed = true;
  }

  while (regenAcc >= MOE_PLAYER_NATURAL_REGEN_INTERVAL_SEC) {
    regenAcc -= MOE_PLAYER_NATURAL_REGEN_INTERVAL_SEC;
    const regen = tickMoePlayerNaturalRegen(vitals, {
      staminaRegenMult: opts.staminaRegenMult ?? 1,
    });
    if (regen) {
      vitals = regen;
      changed = true;
    }
  }

  return { vitals, regenAcc, changed };
}
