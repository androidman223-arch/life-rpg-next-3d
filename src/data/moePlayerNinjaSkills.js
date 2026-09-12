/**
 * プレイヤー（トレーナー）忍者スキル
 *
 * 横10枠のプレイヤースキルアイコンバー用。
 * スロット1〜3: 忍び足 / 神速 / 隠れ蓑 — 4〜10は将来用（空き）
 */

/** @typedef {'toggle' | 'press' | 'instant' | 'timed'} MoePlayerSkillActivation */
/** @typedef {'movement' | 'stealth' | 'attack' | 'escape'} MoePlayerSkillCategory */

/**
 * @typedef {object} MoePlayerNinjaSkill
 * @property {string} id
 * @property {number} level
 * @property {string} name
 * @property {string} [nameEn]
 * @property {MoePlayerSkillCategory} category
 * @property {MoePlayerSkillActivation} activation
 * @property {string} [icon]
 * @property {string} iconComponent
 * @property {string} description
 * @property {string} [moeReference]
 * @property {string} [moeReference]
 * @property {'planned' | 'stub' | 'done'} status
 * @property {boolean} [requiresObtain] 宝などで入手が必要
 */

export const MOE_PLAYER_SKILL_SLOT_COUNT = 10;
export const MOE_PLAYER_SKILL_UNLOCK_STORAGE_KEY =
  "life-rpg-moe-player-skill-unlocks";

/** 固定スロット（0=忍び足, 1=神速, 2=隠れ蓑） */
const MOE_PLAYER_SKILL_SLOT_BY_ID = {
  ninja_shinobiashi: 0,
  ninja_shinsoku: 1,
  ninja_kakuremino: 2,
};

/** 第1弾: Lv10 / 30 / 50 の3スキルのみ */
export const MOE_PLAYER_NINJA_SKILLS = [
  {
    id: "ninja_shinobiashi",
    level: 10,
    name: "忍び足",
    nameEn: "Shinobiashi",
    category: "stealth",
    activation: "toggle",
    iconComponent: "MoeShinobiashiIcon",
    description: "敵のサーチに気付かれない。足音・索敵を抑える。",
    moeReference: "自然調和 Lv1 サイレントラン",
    status: "stub",
  },
  {
    id: "ninja_shinsoku",
    level: 30,
    name: "神速",
    nameEn: "Shinsoku",
    category: "movement",
    activation: "toggle",
    iconComponent: "MoeShinsokuIcon",
    description:
      "トグル ON で Shift 走行中の移動速度をさらに3倍（合計6倍速）。いつでも切替可能。",
    moeReference: "ツイスターラン ＋ 神速の勾玉",
    status: "done",
  },
  {
    id: "ninja_kakuremino",
    level: 50,
    name: "隠れ蓑",
    nameEn: "Kakuremino",
    category: "stealth",
    activation: "instant",
    iconComponent: "MoeKakureminoIcon",
    description:
      "ネイチャーミミックのように体を消して約5秒歩ける。ヘイトを0にする。",
    moeReference: "物まね・自然の真似（透明）",
    status: "stub",
  },
];

/** @returns {Set<string>} */
export function loadPlayerSkillUnlocks() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(MOE_PLAYER_SKILL_UNLOCK_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/** @param {Iterable<string>} ids */
export function savePlayerSkillUnlocks(ids) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MOE_PLAYER_SKILL_UNLOCK_STORAGE_KEY,
      JSON.stringify([...ids])
    );
  } catch {
    /* quota */
  }
}

/** @param {Set<string>} ids @param {string} skillId */
export function removePlayerSkillUnlock(ids, skillId) {
  const next = new Set(ids);
  next.delete(skillId);
  savePlayerSkillUnlocks(next);
  return next;
}

/**
 * @param {number} [playerNinjaLevel=50]
 * @param {Set<string>} [unlockedSkillIds]
 * @returns {(MoePlayerNinjaSkill|null)[]}
 */
export function buildPlayerNinjaSkillSlots(
  playerNinjaLevel = 50,
  unlockedSkillIds = new Set()
) {
  const slots = Array(MOE_PLAYER_SKILL_SLOT_COUNT).fill(null);
  for (const skill of MOE_PLAYER_NINJA_SKILLS) {
    if (skill.level > playerNinjaLevel) continue;
    if (skill.requiresObtain && !unlockedSkillIds.has(skill.id)) continue;
    const idx = MOE_PLAYER_SKILL_SLOT_BY_ID[skill.id];
    if (idx == null) continue;
    slots[idx] = skill;
  }
  return slots;
}
