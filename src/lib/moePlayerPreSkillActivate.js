/**
 * プレイヤー召喚プレスキル — 使用判定・結果ビルド（純粋ロジック）
 */

import {
  MOE_PHOENIX_PLAYER_MP_SHORTAGE_TOAST,
  spendPlayerMpForPhoenixSkill,
} from "./moePhoenixPlayerSkill.js";
import { canUsePlayerPreSkill } from "./moePlayerPreSkillProgress.js";
import {
  resolvePlayerSummonPreSkillSequence,
  validatePlayerSummonPreSkillCombat,
} from "./moePlayerSummonSkills.js";

/**
 * @param {import("../data/moePlayerPreSkills.js").MoePlayerPreSkill | null | undefined} skill
 */
export function formatPlayerPreSkillCombatLine(skill) {
  if (!skill || skill.category !== "attack") return null;
  if (skill.id === "jiriki_kaihou") {
    const p1 = skill.combatPhase1Damage ?? 5;
    const n1 = skill.combatPhase1Hits ?? 5;
    const p2 = skill.combatPhase2Damage ?? 3;
    const n2 = skill.combatPhase2Hits ?? 5;
    return `炎${n1}×${p1}＋炎${n2}×${p2}＋リボーンワンス`;
  }
  if (skill.id === "jiriki_seiryu") {
    return `単発${skill.combatFixedDamage ?? 333}`;
  }
  return null;
}

/**
 * @param {import("../data/moePlayerPreSkills.js").MoePlayerPreSkill} skill
 */
export function playerPreSkillToastMessages(skill) {
  if (skill.id === "jiriki_kaihou") {
    return { baseToast: "生活改鳳 — 鳳凰と炎！", skillToast: "生活改鳳！" };
  }
  if (skill.id === "jiriki_seiryu") {
    return { baseToast: "自力整龍 — 龍の一撃！", skillToast: `${skill.name}！` };
  }
  return { baseToast: skill.name, skillToast: `${skill.name}！` };
}

/**
 * @param {import("../data/moePlayerPreSkills.js").MoePlayerPreSkill} skill
 * @param {{
 *   progress: import("./moePlayerPreSkillProgress.js").MoePlayerPreSkillProgress | undefined,
 *   casterVitals: { mp?: number, mpMax?: number },
 *   inDuel: boolean,
 *   enemyId: number | null | undefined,
 * }} ctx
 */
export function buildPlayerPreSkillActivation(skill, ctx) {
  if (!skill) return { ok: false, reason: "missing" };

  const access = canUsePlayerPreSkill(skill, ctx.progress);
  if (!access.ok) {
    return {
      ok: false,
      reason: "skill_level",
      toast: `${skill.name} — スキル値 Lv.${skill.requiredSkillLevel}で習得`,
    };
  }

  const combatCheck = validatePlayerSummonPreSkillCombat(ctx.inDuel);
  if (!combatCheck.ok) {
    return {
      ok: false,
      reason: "not_in_duel",
      toast: combatCheck.toast ?? "使えません",
    };
  }

  const nextVitals = spendPlayerMpForPhoenixSkill(ctx.casterVitals, skill);
  if (!nextVitals) {
    return {
      ok: false,
      reason: "mp",
      toast: MOE_PHOENIX_PLAYER_MP_SHORTAGE_TOAST,
    };
  }

  const sequence =
    ctx.enemyId != null ? resolvePlayerSummonPreSkillSequence(skill) : null;
  const toasts = playerPreSkillToastMessages(skill);

  return {
    ok: true,
    skillId: skill.id,
    nextVitals,
    enemyId: ctx.enemyId ?? null,
    sequence,
    baseToast: toasts.baseToast,
    skillToast: toasts.skillToast,
    grantRebirthOnce: skill.id === "jiriki_kaihou",
  };
}
