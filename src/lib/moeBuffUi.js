/**
 * MOE バフアイコン strip — プレイヤー·ペットとも 1行×6
 */

export const MOE_PLAYER_BUFF_SLOT_COUNT = 6;
export const MOE_PLAYER_BUFF_COLUMNS = 6;
export const MOE_PET_BUFF_SLOT_COUNT = 6;
export const MOE_PET_BUFF_COLUMNS = 6;
/** ミニ正方形アイコン（バー高さ10pxよりやや大） */
export const MOE_BUFF_ICON_PX = 13;
export const MOE_BUFF_ICON_GAP_PX = 1;

/**
 * @typedef {'buff' | 'toggle' | 'stealth' | 'debuff'} MoeBuffIconTone
 * @typedef {{
 *   id: string,
 *   icon: string,
 *   label: string,
 *   remainSec?: number|null,
 *   tone?: MoeBuffIconTone,
 * }} MoeBuffIconView
 */

/**
 * @param {number} untilMs
 * @param {number} [nowMs]
 */
export function moeBuffRemainSec(untilMs, nowMs = Date.now()) {
  if (!untilMs || untilMs <= nowMs) return null;
  return Math.ceil((untilMs - nowMs) / 1000);
}

/**
 * @param {MoeBuffIconView[]} items
 * @param {number} slotCount
 * @returns {(MoeBuffIconView|null)[]}
 */
export function padMoeBuffSlots(items, slotCount) {
  const out = items.slice(0, slotCount);
  while (out.length < slotCount) out.push(null);
  return out;
}

/**
 * @param {{
 *   bananaMilkActive?: boolean,
 *   shinobiashiOn?: boolean,
 *   kakureminoUntilMs?: number,
 *   dashBoost3x?: boolean,
 *   kintounOn?: boolean,
 *   playerCondenseMindRef?: { current: { until: number } | null },
 *   playerJirikiSeiranRef?: { current: { until: number, boostUntil?: number } | null },
 * }} ctx
 * @param {number} [nowMs]
 */
export function buildMoePlayerBuffStrip(ctx, nowMs = Date.now()) {
  const items = [];

  if (ctx.bananaMilkActive) {
    items.push({
      id: "banana_milk",
      icon: "🍌",
      label: "バナナミルク — スタミナ回復アップ",
      tone: "toggle",
    });
  }

  const condense = ctx.playerCondenseMindRef?.current;
  if (condense && nowMs < condense.until) {
    items.push({
      id: "condense_mind",
      icon: "💠",
      label: "コンデンスマインド — MP自然回復アップ",
      remainSec: moeBuffRemainSec(condense.until, nowMs),
      tone: "buff",
    });
  }

  const seiran = ctx.playerJirikiSeiranRef?.current;
  if (seiran && nowMs < seiran.until) {
    const inBoost = seiran.boostUntil != null && nowMs < seiran.boostUntil;
    items.push({
      id: "jiriki_seiran",
      icon: "🧘",
      label: inBoost
        ? "自力整然 — MP回復2倍"
        : "自力整然 — コンデンス",
      remainSec: moeBuffRemainSec(seiran.until, nowMs),
      tone: "buff",
    });
  }

  if (ctx.shinobiashiOn) {
    items.push({
      id: "shinobiashi",
      icon: "👣",
      label: "忍び足 — 足音を感知されない",
      tone: "stealth",
    });
  }

  const kakureRemain = moeBuffRemainSec(ctx.kakureminoUntilMs ?? 0, nowMs);
  if (kakureRemain != null) {
    items.push({
      id: "kakuremino",
      icon: "🥷",
      label: "隠れ蓑 — 完全ステルス",
      remainSec: kakureRemain,
      tone: "stealth",
    });
  }

  if (ctx.dashBoost3x) {
    items.push({
      id: "shinsoku",
      icon: "💨",
      label: "神速 — ダッシュ速度アップ",
      tone: "toggle",
    });
  }

  if (ctx.kintounOn) {
    items.push({
      id: "kintoun",
      icon: "☁️",
      label: "筋斗雲 — 飛行 · 移動2倍",
      tone: "toggle",
    });
  }

  return padMoeBuffSlots(items, MOE_PLAYER_BUFF_SLOT_COUNT);
}

/**
 * @param {{
 *   petRegenActive?: boolean,
 *   petRegenHp?: number,
 *   petRegenMp?: number,
 *   petRegenIntervalSec?: number,
 *   petRegenTicksLeft?: number,
 *   petRegenRemainSec?: number | null,
 *   phoenixAnsleepRegenRef?: { current: { until: number, hpPerTick?: number, intervalSec?: number } | null },
 *   phoenixUltimateRegenRef?: { current: { until: number, hpPerTick?: number, intervalSec?: number } | null },
 *   phoenixHotSpringDefenseRef?: { current: { until: number, bonus?: number } | null },
 *   atrumMpRegenRef?: { current: { until: number } | null },
 *   atrumMagicBuffUntilRef?: { current: number },
 *   rebirthOnceRef?: { current: { charges?: number, pendingUntilMs?: number } | null },
 * }} ctx
 * @param {number} [nowMs]
 */
export function buildMoePetBuffStrip(ctx, nowMs = Date.now()) {
  const items = [];

  if (ctx.petRegenActive) {
    const hp = ctx.petRegenHp ?? 15;
    const mp = ctx.petRegenMp ?? 0;
    const sec = ctx.petRegenIntervalSec ?? 3;
    const mpPart = mp > 0 ? ` MP+${mp}` : "";
    const ticks =
      ctx.petRegenTicksLeft != null ? `残${ctx.petRegenTicksLeft}回` : "";
    const remain =
      ctx.petRegenRemainSec != null && ctx.petRegenRemainSec > 0
        ? ` · 約${ctx.petRegenRemainSec}秒`
        : "";
    items.push({
      id: "pet_regen",
      icon: "🍃",
      label: `リジェネ — ${sec}秒ごと HP+${hp}${mpPart}${ticks ? `（${ticks}${remain}）` : ""}`,
      tone: "toggle",
      remainSec: ctx.petRegenRemainSec ?? null,
    });
  }

  const phoenixRegenSources = [
    {
      ref: ctx.phoenixAnsleepRegenRef,
      id: "phoenix_ansleep_regen",
      label: "安眠導歩 — リジェネ",
    },
    {
      ref: ctx.phoenixUltimateRegenRef,
      id: "phoenix_ultimate_regen",
      label: "睡眠絶崩 — リジェネ",
    },
  ];
  for (const { ref, id, label } of phoenixRegenSources) {
    const src = ref?.current;
    if (src && nowMs < src.until) {
      const tickSec = src.intervalSec ?? 3;
      const hpTick = src.hpPerTick ?? 20;
      items.push({
        id,
        icon: "🍃",
        label: `${label} — ${tickSec}秒ごと HP+${hpTick}`,
        remainSec: moeBuffRemainSec(src.until, nowMs),
        tone: "buff",
      });
    }
  }

  const hotSpring = ctx.phoenixHotSpringDefenseRef?.current;
  if (hotSpring && nowMs < hotSpring.until) {
    items.push({
      id: "phoenix_hot_spring_def",
      icon: "♨",
      label: `温泉調気 — 守り+${hotSpring.bonus ?? 50}`,
      remainSec: moeBuffRemainSec(hotSpring.until, nowMs),
      tone: "buff",
    });
  }

  const manaAmp = ctx.atrumMpRegenRef?.current;
  if (manaAmp && nowMs < manaAmp.until) {
    items.push({
      id: "mana_amp",
      icon: "💠",
      label: "マナ増幅法 — MP自然回復アップ",
      remainSec: moeBuffRemainSec(manaAmp.until, nowMs),
      tone: "buff",
    });
  }

  const magicUntil = ctx.atrumMagicBuffUntilRef?.current ?? 0;
  const magicRemain = moeBuffRemainSec(magicUntil, nowMs);
  if (magicRemain != null) {
    items.push({
      id: "onkochishin",
      icon: "✨",
      label: "温故知新 — 魔力上昇",
      remainSec: magicRemain,
      tone: "buff",
    });
  }

  const rebirth = ctx.rebirthOnceRef?.current;
  if (rebirth?.charges) {
    items.push({
      id: "rebirth_once",
      icon: "🪽",
      label: "リボーンワンス — 倒れてから3秒で1回復活",
      tone: "buff",
    });
  } else if (rebirth?.pendingUntilMs && nowMs < rebirth.pendingUntilMs) {
    items.push({
      id: "rebirth_once_pending",
      icon: "🪽",
      label: "リボーンワンス — 復活待ち",
      remainSec: Math.ceil((rebirth.pendingUntilMs - nowMs) / 1000),
      tone: "buff",
    });
  }

  return padMoeBuffSlots(items, MOE_PET_BUFF_SLOT_COUNT);
}
