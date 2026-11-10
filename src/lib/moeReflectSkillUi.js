/** 百花繚乱 / ソードダンス / リベンジガード — 反射中の UI */

export const MOE_REFLECT_BUFF_TONE = "reflect";

/** 技①スロット — 反射バフ中 */
export const MOE_REFLECT_SKILL_ACTIVE_BTN_CLASS =
  "border-yellow-200/90 bg-gradient-to-b from-yellow-300/95 via-amber-400/95 to-yellow-800/95 text-yellow-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_10px_rgba(250,204,21,0.75)] ring-1 ring-yellow-200/55 animate-pulse";

/**
 * @param {{ active?: boolean, activeTone?: string }} slot
 * @param {string} defaultActiveClass
 */
export function moePlayerSkillSlotActiveClass(slot, defaultActiveClass) {
  if (!slot?.active) return null;
  if (slot.activeTone === MOE_REFLECT_BUFF_TONE) {
    return MOE_REFLECT_SKILL_ACTIVE_BTN_CLASS;
  }
  return defaultActiveClass;
}

/**
 * 反射スキルは効果中も cooldownSec に残秒を載せる — UI はクールダウンと分離
 * @param {{ active?: boolean, cooldownSec?: number|null }} slot
 */
export function moePlayerSkillSlotTimingUi(slot) {
  const sec = slot?.cooldownSec;
  const hasSec = sec !== null && sec !== undefined;
  return {
    onCooldown: hasSec && !slot?.active,
    effectRemainSec: slot?.active && hasSec ? sec : null,
  };
}
