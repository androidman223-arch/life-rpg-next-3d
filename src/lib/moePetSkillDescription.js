/**
 * ペットスキル — 青い説明ウィンドウ用テキスト
 */

/** @param {object | null | undefined} skill */
function fallbackSkillNote(skill) {
  switch (skill.type) {
    case "physical":
      return skill.ratio
        ? `物理攻撃（約${skill.ratio}倍）`
        : "物理攻撃";
    case "physical_area":
    case "physical_magic_area":
    case "physical_magic_combo":
      return "物理＋魔法の複合攻撃";
    case "physical_dot":
      return "物理攻撃＋継続ダメージ";
    case "magic_fire":
    case "magic_fire_dot":
      return "火属性魔法";
    case "magic_wind":
      return "風属性魔法";
    case "magic_dot_area":
      return "広範囲継続魔法";
    case "heal":
      return "HP回復";
    case "heal_area":
      return "範囲HP回復";
    case "heal_regen":
      return "HP回復＋リジェネ";
    case "buff_magic":
      return "魔力上昇バフ";
    case "buff_mp_regen":
      return "MP自然回復上昇";
    case "special_purge":
      return "状態異常解除";
    case "magic_wind_area":
      return "風属性攻撃";
    case "cure_status":
      return "状態異常回復";
    case "field_regen":
      return "移動中にHPが徐々に回復";
    case "buff":
    case "buff_permanent":
      return "バフ・強化効果";
    case "passive":
      return "常時発動の特性";
    default:
      return "スキル効果";
  }
}

/**
 * フィールドの青いウィンドウ用
 * @param {object | null | undefined} skill
 */
export function formatMoePetSkillDescription(skill) {
  if (!skill) return "";
  const name = skill.name ?? "スキル";
  const lines = [name];
  const body =
    skill.note?.trim() || skill.description?.trim() || fallbackSkillNote(skill);
  if (body) lines.push(body);

  const meta = [];
  const lv = skill.level ?? 1;
  if (lv > 1) meta.push(`習得 Lv.${lv}`);
  if (skill.mpCost != null) meta.push(`消費 MP ${skill.mpCost}`);
  if (skill.delaySec != null) meta.push(`ディレイ ${skill.delaySec}秒`);
  if (meta.length) lines.push(meta.join(" · "));
  if (skill.skillSubInfo?.trim()) {
    lines.push(skill.skillSubInfo.trim());
  }

  return lines.join("\n");
}

/**
 * スキルバー・ホバーツールチップ用（名前＋短い説明）
 * @param {object | null | undefined} skill
 * @param {{ locked?: boolean, loyaltyLocked?: boolean }} [opts]
 */
export function formatMoeSkillHoverTip(skill, opts = {}) {
  if (!skill) return "";
  const name = skill.name ?? "スキル";
  if (opts.loyaltyLocked) {
    return `${name}\n（オートAIのみ·手動不可）`;
  }
  if (opts.locked) {
    return `${name}\n（Lv.${skill.level ?? 1}で習得）`;
  }
  return formatMoePetSkillDescription(skill);
}
