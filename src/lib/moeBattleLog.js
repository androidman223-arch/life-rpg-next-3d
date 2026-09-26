/**
 * MOE バトルログ — dq10_battle 風テキストログ（純粋ロジック）
 */

export const MOE_BATTLE_LOG_MAX_HISTORY = 40;
export const MOE_BATTLE_LOG_MAX_VISIBLE = 22;
export const MOE_BATTLE_LOG_DAMAGE_BATCH_MS = 220;

export const MOE_BATTLE_LOG_COLOR = {
  default: "#00ff00",
  white: "#ffffff",
  pet: "#b8ffb0",
  enemy: "#ff8888",
  boss: "#ff4444",
  heal: "#88ccff",
  system: "#ffff88",
  victory: "#99ff88",
  muted: "#aaaaaa",
  separator: "#484878",
};

/**
 * @typedef {{ msg: string, color: string, className: string }} MoeBattleLogEntry
 */

/** @returns {{ entries: MoeBattleLogEntry[], damageBatch: object | null }} */
export function createMoeBattleLogState() {
  return { entries: [], damageBatch: null };
}

/** @param {number[]} amounts */
export function formatMoeBattleDamageLine(attacker, skill, target, amounts) {
  const dmg = amounts.map(String).join("，");
  return `${attacker}の ${skill} >> ${target}に ${dmg}ダメ`;
}

export function formatMoeBattleEnemyAttackLine(enemyName, targetName, damage) {
  return `${enemyName}の 攻撃 >> ${targetName}に ${damage}ダメ`;
}

/**
 * @param {{ entries: MoeBattleLogEntry[], damageBatch: object | null }} state
 * @param {{ msg: string, color?: string, className?: string, skipDamageFlush?: boolean }} entry
 */
export function pushMoeBattleLogEntry(state, entry) {
  if (!entry.skipDamageFlush) flushMoeBattleDamageBatch(state);
  const next = {
    msg: entry.msg,
    color: entry.color ?? MOE_BATTLE_LOG_COLOR.default,
    className: entry.className ?? "",
  };
  state.entries = [...state.entries, next];
  if (state.entries.length > MOE_BATTLE_LOG_MAX_HISTORY) {
    state.entries = state.entries.slice(-MOE_BATTLE_LOG_MAX_HISTORY);
  }
  return state.entries;
}

/** @param {{ entries: MoeBattleLogEntry[], damageBatch: object | null }} state */
export function flushMoeBattleDamageBatch(state) {
  const batch = state.damageBatch;
  if (!batch) return state.entries;
  state.damageBatch = null;
  if (batch.timerId != null) {
    clearTimeout(batch.timerId);
    batch.timerId = null;
  }
  return pushMoeBattleLogEntry(state, {
    msg: formatMoeBattleDamageLine(
      batch.attacker,
      batch.skill,
      batch.target,
      batch.amounts
    ),
    color: batch.color,
    className: batch.className ?? "",
    skipDamageFlush: true,
  });
}

/**
 * @param {{ entries: MoeBattleLogEntry[], damageBatch: object | null }} state
 * @param {{
 *   key: string,
 *   attacker: string,
 *   skill: string,
 *   target: string,
 *   amount: number,
 *   color?: string,
 *   className?: string,
 * }} payload
 * @param {() => void} [onFlush]
 */
export function queueMoeBattleDamageLog(state, payload, onFlush) {
  const { key, attacker, skill, target, amount, color, className } = payload;
  if (!state.damageBatch || state.damageBatch.key !== key) {
    flushMoeBattleDamageBatch(state);
    state.damageBatch = {
      key,
      attacker,
      skill,
      target,
      amounts: [amount],
      color: color ?? MOE_BATTLE_LOG_COLOR.pet,
      className: className ?? "",
      timerId: null,
    };
  } else {
    state.damageBatch.amounts.push(amount);
  }
  if (state.damageBatch.timerId != null) {
    clearTimeout(state.damageBatch.timerId);
  }
  state.damageBatch.timerId = setTimeout(() => {
    flushMoeBattleDamageBatch(state);
    onFlush?.();
  }, MOE_BATTLE_LOG_DAMAGE_BATCH_MS);
  return state.entries;
}

/**
 * @param {() => void} onChange
 */
export function createMoeBattleLogApi(onChange) {
  const state = createMoeBattleLogState();

  const notify = () => onChange([...state.entries]);

  return {
    getEntries: () => state.entries,
    clear() {
      flushMoeBattleDamageBatch(state);
      state.entries = [];
      state.damageBatch = null;
      notify();
    },
    dispose() {
      if (state.damageBatch?.timerId != null) {
        clearTimeout(state.damageBatch.timerId);
        state.damageBatch.timerId = null;
      }
      state.damageBatch = null;
    },
    pushLine(msg, color = MOE_BATTLE_LOG_COLOR.default, className = "") {
      pushMoeBattleLogEntry(state, { msg, color, className });
      notify();
    },
    queuePetDamage(attacker, skill, target, amount, options = {}) {
      const key = `${attacker}\0${skill}\0${target}`;
      queueMoeBattleDamageLog(
        state,
        {
          key,
          attacker,
          skill,
          target,
          amount,
          color: options.color ?? MOE_BATTLE_LOG_COLOR.pet,
          className: options.className ?? "",
        },
        notify
      );
      notify();
    },
    flushDamage() {
      flushMoeBattleDamageBatch(state);
      notify();
    },
  };
}
