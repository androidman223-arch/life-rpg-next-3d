/** プレイヤー技② — フェニックス系（ペットに詠唱） */

export const MOE_PHOENIX_PLAYER_CHANT_SEC = 3;

/** @param {object | null | undefined} skill */
export function isMoePhoenixPlayerChantSkill(skill) {
  if (!skill) return false;
  if (skill.type === "passive" || skill.type === "buff_permanent") return false;
  if (skill.type === "magic_fire" || skill.type === "buff") return false;
  if (skill.id === "phoenix_life_burst") return false;
  return (
    skill.type === "field_regen" ||
    skill.type === "cure_status" ||
    skill.type === "heal" ||
    skill.type === "heal_regen"
  );
}

const PLAYER_SKILL_LINES = {
  phoenix_trait: "転生の証 · フェニックス系スキルが使える",
  phoenix_ansleep_walk: "ペットに詠唱 · 3秒ごとにHP20回復",
  phoenix_hot_spring: "ペットに詠唱 · 毒・麻痺を解毒",
  phoenix_deep_sleep: "ペットに詠唱 · ペットHP中回復",
  phoenix_ultimate_sleep: "ペットに詠唱 · ペットHP大回復",
  phoenix_habit_ascension: "戦闘中のみ攻撃2倍（解除で1倍）",
  phoenix_life_burst: "ペットHP+100",
  phoenix_scorching_sky: "特大炎魔法 · 固定100ダメージ",
  phoenix_purify_rebirth: "大爆炎 · 30ダメージ×5",
};

/** @param {object | null | undefined} skill @param {boolean} [locked] */
export function formatMoePhoenixPlayerSkillDescription(skill, locked = false) {
  if (!skill) return "";
  const name = skill.name ?? "スキル";
  const body =
    PLAYER_SKILL_LINES[skill.id] ??
    skill.note?.trim() ??
    skill.description?.trim() ??
    "";
  const lines = [name];
  if (body) lines.push(body);
  const lv = skill.level ?? 1;
  if (lv > 1) lines.push(`習得 Lv.${lv}`);
  if (locked) lines.unshift(`${name}（Lv.${lv}で習得）`);
  return lines.join("\n");
}

/** @param {object} pet */
export function petHasMoeAilment(pet) {
  const a = pet?.ailments;
  return Boolean(a?.poison || a?.paralysis);
}

/** @param {object} pet */
export function clearMoePetPoisonParalysis(pet) {
  const a = pet?.ailments;
  if (!a?.poison && !a?.paralysis) return pet;
  return {
    ...pet,
    ailments: {
      ...a,
      poison: false,
      paralysis: false,
    },
  };
}
