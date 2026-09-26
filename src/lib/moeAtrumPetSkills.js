/**
 * エレメンタル アトルーム — フィールド／戦闘スキル効果
 * 下級回復＝ライトヒーリング級 · 温故知新＝魔力上昇buff · 禁断魔法＝風属性攻撃 など
 */

import { resolveMoeDuelSkillSequence } from "@/data/moePetCombatSkills";
import { petUsesPreciseWikiStats, roundPetStatInternal } from "@/data/moePets";
import {
  clearMoePetPoisonParalysis,
  petHasMoeAilment,
} from "@/lib/moePhoenixPlayerSkill";

/** ライトヒーリング級（プレイヤー回復UIと同量） */
export const ATRUM_HEAL_LOW = 30;
/** ヒーリング級 */
export const ATRUM_HEAL_HIGH = 45;
/** 範囲回復（自己中心） */
export const ATRUM_HEAL_AREA = 40;

export const ATRUM_MAGIC_BUFF_MULT = 1.3;
export const ATRUM_MAGIC_BUFF_SEC = 45;

/** マナ増幅法 — Wiki 消費MP34 */
export const ATRUM_MANA_AMP_MP_COST = 34;
/**
 * コンデンスマインド（回復60）相当の自然MP回復
 * 検証値おおよそ 120MP/60秒 → 2MP/秒
 */
export const ATRUM_CONDENSE_MIND_MP_PER_SEC = 2;

/**
 * マナ増幅法の効果時間（秒）— Lv80で Wiki 1分10秒～1分20秒
 * @param {number} petCombatLevel
 */
export function atrumManaAmpDurationSec(petCombatLevel) {
  const L = Math.max(1, Math.floor(Number(petCombatLevel) || 80));
  if (L < 80) return 70;
  return Math.min(95, 75 + (L - 80) * 0.25);
}

/** @param {object} pet @param {object} skill */
export function hasAtrumMpForSkill(pet, skill) {
  const mpCost = skill.mpCost ?? 0;
  return mpCost <= 0 || (pet.mp ?? 0) >= mpCost;
}

/** @param {object} pet @param {object} skill */
function spendAtrumMp(pet, skill) {
  const mpCost = skill.mpCost ?? 0;
  if (mpCost <= 0) return pet;
  const mp = Math.max(0, (pet.mp ?? 0) - mpCost);
  return petUsesPreciseWikiStats(pet.id)
    ? { ...pet, mp: roundPetStatInternal(mp) }
    : { ...pet, mp };
}

/** @param {object} pet @param {object} skill */
function canUseAtrumHealThreshold(pet, skill) {
  const threshold = skill.hpUseThreshold;
  if (threshold == null) return true;
  const hpMax = pet.hpMax ?? 1;
  if (hpMax <= 0) return true;
  return (pet.hp ?? 0) / hpMax < threshold;
}

/** MP5割以下（公式使用条件） */
function canUseAtrumManaAmp(pet) {
  const mpMax = pet.mpMax ?? 1;
  if (mpMax <= 0) return true;
  return (pet.mp ?? 0) / mpMax <= 0.5;
}

/** @param {object} pet @param {object} skill */
function healAmountForAtrumSkill(pet, skill) {
  if (skill.healFlat != null) return Math.max(1, Math.floor(skill.healFlat));
  if (skill.healRatio != null) {
    return Math.max(1, Math.floor((pet.hpMax ?? 1) * skill.healRatio));
  }
  if (skill.id === "atrum_high_heal_page") return ATRUM_HEAL_HIGH;
  if (skill.id === "atrum_area_heal_page") return ATRUM_HEAL_AREA;
  return ATRUM_HEAL_LOW;
}

/** @param {object} pet @param {number} amount */
function applyAtrumHeal(pet, amount) {
  const hpRaw = Math.min(pet.hpMax ?? amount, (pet.hp ?? 0) + amount);
  const hp = petUsesPreciseWikiStats(pet.id)
    ? roundPetStatInternal(hpRaw)
    : hpRaw;
  return { pet: { ...pet, hp }, healed: Math.max(0, hp - (pet.hp ?? 0)) };
}

/**
 * @param {object} skill
 * @param {{
 *   petRef: { current: object },
 *   setPet: Function,
 *   flushPersistActivePet: (pet: object) => void,
 *   pushWorldHealPopup: (x: number, y: number, amt: number) => void,
 *   playSfx: (name: string) => void,
 *   duelRef: { current: object | null },
 *   scheduleMoeDuelSkillHits: (enemyId: number, seq: object) => void,
 *   atrumMagicBuffUntilRef: { current: number },
 *   atrumMpRegenRef: { current: { until: number, mpBuffer: number, mpPerSec: number } | null },
 *   petPosRef: { current: { x: number, y: number } },
 *   petCombatLevel?: number,
 * }} ctx
 * @returns {{ handled: boolean, toast?: string, skillToast?: string }}
 */
export function activateAtrumPetSkill(skill, ctx) {
  if (!skill) return { handled: false };

  const pet = ctx.petRef.current;

  if (skill.id === "atrum_mana_amp") {
    if (!canUseAtrumManaAmp(pet)) {
      return {
        handled: true,
        toast: "MPが5割を超えているときは使いません",
      };
    }
    if (!hasAtrumMpForSkill(pet, skill)) {
      return {
        handled: true,
        toast: `MPが足りません（消費${ATRUM_MANA_AMP_MP_COST}）`,
      };
    }
    const next = spendAtrumMp(pet, skill);
    ctx.petRef.current = next;
    ctx.setPet(next);
    ctx.flushPersistActivePet(next);
    const durationSec = atrumManaAmpDurationSec(
      ctx.petCombatLevel ?? pet.level ?? 80
    );
    ctx.atrumMpRegenRef.current = {
      until: Date.now() + durationSec * 1000,
      mpBuffer: 0,
      mpPerSec: ATRUM_CONDENSE_MIND_MP_PER_SEC,
    };
    ctx.playSfx("heal");
    return {
      handled: true,
      skillToast: "マナ増幅法のページ！",
      toast: `マナ増幅法 — ${durationSec}秒間 MP自然回復アップ（コンデンスマインド相当 · 約${ATRUM_CONDENSE_MIND_MP_PER_SEC}MP/秒）`,
    };
  }

  if (!hasAtrumMpForSkill(pet, skill)) {
    return { handled: true, toast: "MPが足りません" };
  }

  const persist = (next) => {
    ctx.petRef.current = next;
    ctx.setPet(next);
    ctx.flushPersistActivePet(next);
  };

  const pos = ctx.petPosRef.current;

  if (skill.id === "atrum_low_heal_page" || skill.id === "atrum_high_heal_page") {
    if (!canUseAtrumHealThreshold(pet, skill)) {
      return {
        handled: true,
        toast: "HPが7割以上のときは回復魔法を使いません",
      };
    }
    const amount = healAmountForAtrumSkill(pet, skill);
    const spent = spendAtrumMp(pet, skill);
    const { pet: healed, healed: gain } = applyAtrumHeal(spent, amount);
    persist(healed);
    if (gain > 0) ctx.pushWorldHealPopup(pos.x, pos.y, gain);
    ctx.playSfx("heal");
    return {
      handled: true,
      skillToast: `${skill.name}！`,
      toast: `${skill.name} — HP+${gain}`,
    };
  }

  if (skill.id === "atrum_area_heal_page") {
    const amount = healAmountForAtrumSkill(pet, skill);
    const spent = spendAtrumMp(pet, skill);
    const { pet: healed, healed: gain } = applyAtrumHeal(spent, amount);
    persist(healed);
    if (gain > 0) ctx.pushWorldHealPopup(pos.x, pos.y, gain);
    ctx.playSfx("heal");
    return {
      handled: true,
      skillToast: `${skill.name}！`,
      toast: `${skill.name} — 自己中心の範囲回復 HP+${gain}`,
    };
  }

  if (skill.id === "atrum_onkochishin") {
    const next = spendAtrumMp(pet, skill);
    persist(next);
    ctx.atrumMagicBuffUntilRef.current =
      Date.now() + ATRUM_MAGIC_BUFF_SEC * 1000;
    ctx.playSfx("heal");
    return {
      handled: true,
      skillToast: "温故知新！",
      toast: `温故知新 — 魔力上昇（${ATRUM_MAGIC_BUFF_SEC}秒 · ×${ATRUM_MAGIC_BUFF_MULT}）`,
    };
  }

  if (skill.id === "atrum_purge") {
    const hadAilment = petHasMoeAilment(pet);
    const next = spendAtrumMp(clearMoePetPoisonParalysis(pet), skill);
    persist(next);
    ctx.playSfx("heal");
    return {
      handled: true,
      skillToast: "浄化魔法のページ！",
      toast: hadAilment
        ? "浄化魔法 — 毒・麻痺を解除しました"
        : "浄化魔法 — DeBuffはありませんでした",
    };
  }

  if (skill.id === "atrum_forbidden_magic") {
    const d = ctx.duelRef.current;
    if (!d?.enemyId) {
      return { handled: true, toast: "禁断魔法は戦闘中に使えます" };
    }
    const seq = resolveMoeDuelSkillSequence("elemental_atrum", skill);
    if (seq) {
      ctx.scheduleMoeDuelSkillHits(d.enemyId, seq, skill.name ?? "禁断魔法");
      return {
        handled: true,
        skillToast: "禁断魔法のページ！",
        toast: "禁断魔法 — 風属性の攻撃！",
      };
    }
    return { handled: true, toast: "禁断魔法を発動できませんでした" };
  }

  if (skill.name === "アタック" && skill.type === "physical") {
    const d = ctx.duelRef.current;
    if (!d?.enemyId) {
      return { handled: true, toast: "アタックは戦闘中に使えます" };
    }
    const seq = resolveMoeDuelSkillSequence("elemental_atrum", skill);
    if (seq) {
      ctx.scheduleMoeDuelSkillHits(d.enemyId, seq, skill.name ?? "アタック");
      return { handled: true, skillToast: "アタック！" };
    }
  }

  return { handled: false };
}

/** @param {{ current: { until: number, mpBuffer: number, mpPerSec: number } | null }} ref */
export function isAtrumManaAmpActive(ref) {
  const src = ref.current;
  return Boolean(src && Date.now() < src.until);
}

/** コンデンスマインド相当 — バフ中のMP自然回復（秒間） */
export function tickAtrumMpRegen(
  ref,
  dt,
  setPet,
  flushPersistActivePet,
  petRef
) {
  const src = ref.current;
  if (!src) return;
  const now = Date.now();
  if (now >= src.until) {
    ref.current = null;
    return;
  }

  src.mpBuffer = (src.mpBuffer ?? 0) + dt * (src.mpPerSec ?? ATRUM_CONDENSE_MIND_MP_PER_SEC);
  const gain = Math.floor(src.mpBuffer);
  if (gain <= 0) return;
  src.mpBuffer -= gain;

  setPet((prev) => {
    if ((prev.mp ?? 0) >= (prev.mpMax ?? 0)) return prev;
    const mpRaw = Math.min(prev.mpMax ?? 0, (prev.mp ?? 0) + gain);
    const mp = petUsesPreciseWikiStats(prev.id)
      ? roundPetStatInternal(mpRaw)
      : mpRaw;
    if (mp <= (prev.mp ?? 0)) return prev;
    const next = { ...prev, mp };
    petRef.current = next;
    flushPersistActivePet(next);
    return next;
  });
}

/** @param {{ current: number }} ref */
export function getAtrumMagicBuffMult(ref) {
  return ref.current > Date.now() ? ATRUM_MAGIC_BUFF_MULT : 1;
}
