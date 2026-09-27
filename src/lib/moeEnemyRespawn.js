/**
 * フィールド敵の撃破→再出現までの待ち。
 * Lv帯ごとに 10秒〜10分。10秒刻みと分刻み。
 * 再配置そのものは moeEnemyRespawnPlace.js。
 */

export const MOE_ENEMY_RESPAWN_STORAGE_KEY =
  "life-rpg-moe-enemy-respawn-minutes";

export const MOE_ENEMY_RESPAWN_DEFAULT_SECONDS = 60;

/** 10秒刻み（10〜50秒）と分刻み（1〜10分） */
export const MOE_ENEMY_RESPAWN_CHOICES = [
  { sec: 10, label: "10秒" },
  { sec: 20, label: "20秒" },
  { sec: 30, label: "30秒" },
  { sec: 40, label: "40秒" },
  { sec: 50, label: "50秒" },
  { sec: 60, label: "1分" },
  { sec: 120, label: "2分" },
  { sec: 180, label: "3分" },
  { sec: 240, label: "4分" },
  { sec: 300, label: "5分" },
  { sec: 360, label: "6分" },
  { sec: 420, label: "7分" },
  { sec: 480, label: "8分" },
  { sec: 540, label: "9分" },
  { sec: 600, label: "10分" },
];

/** @type {{ id: "lv20"|"lv50"|"lv100"|"lv150", label: string }[]} */
export const MOE_ENEMY_RESPAWN_BANDS = [
  { id: "lv20", label: "Lv〜20" },
  { id: "lv50", label: "Lv〜50" },
  { id: "lv100", label: "Lv〜100" },
  { id: "lv150", label: "Lv〜150 大ボス" },
];

/** @param {unknown} value 秒。候補に一番近い値へ寄せる */
export function clampMoeEnemyRespawnSeconds(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return MOE_ENEMY_RESPAWN_DEFAULT_SECONDS;
  let best = MOE_ENEMY_RESPAWN_CHOICES[0].sec;
  let bestDist = Infinity;
  for (const choice of MOE_ENEMY_RESPAWN_CHOICES) {
    const dist = Math.abs(choice.sec - n);
    if (dist < bestDist) {
      best = choice.sec;
      bestDist = dist;
    }
  }
  return best;
}

/** @returns {{ lv20: number, lv50: number, lv100: number, lv150: number }} 値は秒 */
export function defaultMoeEnemyRespawnSeconds() {
  const sec = MOE_ENEMY_RESPAWN_DEFAULT_SECONDS;
  return { lv20: sec, lv50: sec, lv100: sec, lv150: sec };
}

/**
 * Lvの小数は切り捨て。大ボス（superBoss）はレベルに関係なく 150 帯。
 * @param {object|null|undefined} enemy
 * @returns {"lv20"|"lv50"|"lv100"|"lv150"}
 */
export function moeEnemyRespawnBandId(enemy) {
  if (enemy?.superBoss) return "lv150";
  const lv = Math.floor(Number(enemy?.level) || 0);
  if (lv > 100) return "lv150";
  if (lv > 50) return "lv100";
  if (lv > 20) return "lv50";
  return "lv20";
}

/**
 * 保存値は秒。v が無い古いデータは分（1〜10）として読む。
 * @param {unknown} raw
 */
export function normalizeMoeEnemyRespawnSeconds(raw) {
  const base = defaultMoeEnemyRespawnSeconds();
  if (raw == null || raw === "") return base;
  if (typeof raw === "number" || (typeof raw === "string" && !raw.trim().startsWith("{"))) {
    const sec = clampMoeEnemyRespawnSeconds(Number(raw) * 60);
    return { lv20: sec, lv50: sec, lv100: sec, lv150: sec };
  }
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return base;
    }
  }
  if (!parsed || typeof parsed !== "object") return base;
  const asSeconds = parsed.v === 2;
  for (const band of MOE_ENEMY_RESPAWN_BANDS) {
    if (parsed[band.id] == null) continue;
    const n = Number(parsed[band.id]);
    base[band.id] = clampMoeEnemyRespawnSeconds(asSeconds ? n : n * 60);
  }
  return base;
}

/**
 * @param {object|null|undefined} enemy
 * @param {number|{ v?: number, lv20?: number, lv50?: number, lv100?: number, lv150?: number }} settings
 * @returns {number} 秒
 */
export function moeEnemyRespawnSecondsFor(enemy, settings) {
  if (typeof settings === "number") return clampMoeEnemyRespawnSeconds(settings);
  const sec = settings?.[moeEnemyRespawnBandId(enemy)];
  if (sec == null) return MOE_ENEMY_RESPAWN_DEFAULT_SECONDS;
  return clampMoeEnemyRespawnSeconds(sec);
}

/** @param {number} [seconds] */
export function moeEnemyRespawnMs(seconds = MOE_ENEMY_RESPAWN_DEFAULT_SECONDS) {
  return clampMoeEnemyRespawnSeconds(seconds) * 1000;
}

/** @returns {{ lv20: number, lv50: number, lv100: number, lv150: number }} */
export function loadMoeEnemyRespawnSeconds() {
  if (typeof localStorage === "undefined") return defaultMoeEnemyRespawnSeconds();
  return normalizeMoeEnemyRespawnSeconds(
    localStorage.getItem(MOE_ENEMY_RESPAWN_STORAGE_KEY)
  );
}

/** @param {{ lv20?: number, lv50?: number, lv100?: number, lv150?: number }|number} settings 秒 */
export function saveMoeEnemyRespawnSeconds(settings) {
  if (typeof localStorage === "undefined") return;
  const table = defaultMoeEnemyRespawnSeconds();
  const source =
    typeof settings === "number"
      ? { lv20: settings, lv50: settings, lv100: settings, lv150: settings }
      : settings;
  for (const band of MOE_ENEMY_RESPAWN_BANDS) {
    if (source?.[band.id] != null) {
      table[band.id] = clampMoeEnemyRespawnSeconds(source[band.id]);
    }
  }
  localStorage.setItem(
    MOE_ENEMY_RESPAWN_STORAGE_KEY,
    JSON.stringify({ v: 2, ...table })
  );
}

/**
 * @param {object} enemy
 * @param {number} now
 * @param {number|{ lv20?: number, lv50?: number, lv100?: number, lv150?: number }} [settings] 秒
 */
export function moeMarkEnemyDefeated(
  enemy,
  now,
  settings = MOE_ENEMY_RESPAWN_DEFAULT_SECONDS
) {
  return {
    ...enemy,
    hp: 0,
    respawnAt: now + moeEnemyRespawnMs(moeEnemyRespawnSecondsFor(enemy, settings)),
  };
}

/**
 * @param {object|null|undefined} enemy
 * @param {number} now
 */
export function moeEnemyRespawnReady(enemy, now) {
  return Boolean(
    enemy &&
      enemy.hp <= 0 &&
      typeof enemy.respawnAt === "number" &&
      now >= enemy.respawnAt
  );
}
