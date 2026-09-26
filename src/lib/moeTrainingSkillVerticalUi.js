/**
 * 修行スキルゲット表 → 縦スキルパネル用スロット（鳳凰・龍神）
 */

import { MOE_DRAGON_SKILL_GET_CATALOG } from "../data/moeDragonSkillGetCatalog.js";
import { MOE_PHOENIX_SKILL_GET_CATALOG } from "../data/moePhoenixSkillGetCatalog.js";
import {
  isTrainingSkillUsableAtLevel,
  MOE_TRAINING_SKILL_MODE_ALL,
} from "./moeTrainingSkillSettings.js";
import { hasTrainingSkillBridgeAction } from "./moeTrainingSkillBridgeMap.js";

/** @param {{ level: number }} entry @param {number} practiceLevel */
export function isTrainingSkillUnlocked(entry, practiceLevel) {
  return practiceLevel + 1e-6 >= entry.level;
}

/**
 * @param {{ level: number, name: string, hint: string, originalName?: string, status?: string }} entry
 * @param {number} practiceLevel
 * @param {'phoenix' | 'dragon'} track
 */
export function formatTrainingSkillVerticalTitle(
  entry,
  practiceLevel,
  track,
  skillMode = MOE_TRAINING_SKILL_MODE_ALL
) {
  const unlocked = isTrainingSkillUsableAtLevel(skillMode, practiceLevel, entry);
  const trackLabel = track === "phoenix" ? "知恵" : "実践";
  const lines = [`Lv.${entry.level} ${entry.name}`];
  if (entry.originalName) lines.push(`実名: ${entry.originalName}`);
  lines.push(entry.hint);
  if (!unlocked) {
    lines.push(
      `解放: ${trackLabel} Lv.${entry.level}（現在 Lv.${Math.floor(practiceLevel)}）`
    );
  } else if (hasTrainingSkillBridgeAction(track, entry.level)) {
    lines.push("クリックで発動");
  } else if (entry.status === "done") {
    lines.push("実装済 — フィールドで使用可");
  } else {
    lines.push("Lv到達 — 実装予定");
  }
  return lines.join("\n");
}

/**
 * @param {typeof MOE_PHOENIX_SKILL_GET_CATALOG} catalog
 * @param {number} practiceLevel
 * @param {'phoenix' | 'dragon'} track
 * @param {(track: 'phoenix' | 'dragon', level: number) => void} [onActivate]
 * @param {import("./moeTrainingSkillSettings.js").MoeTrainingSkillMode} [skillMode]
 */
function buildTrainingVerticalSlots(
  catalog,
  practiceLevel,
  track,
  onActivate,
  skillMode = MOE_TRAINING_SKILL_MODE_ALL
) {
  return catalog.map((entry) => {
    const unlocked = isTrainingSkillUsableAtLevel(
      skillMode,
      practiceLevel,
      entry
    );
    const activatable =
      unlocked && hasTrainingSkillBridgeAction(track, entry.level);
    return {
      slotKey: `${track}_lv${entry.level}`,
      label: entry.name,
      disabled: false,
      unusable: !unlocked,
      trainingSkill: true,
      active: activatable,
      title: formatTrainingSkillVerticalTitle(
        entry,
        practiceLevel,
        track,
        skillMode
      ),
      onClick: onActivate ? () => onActivate(track, entry.level) : undefined,
      reorderable: false,
    };
  });
}

/**
 * @param {number} phoenixLevel
 * @param {(track: 'phoenix' | 'dragon', level: number) => void} [onActivate]
 * @param {import("./moeTrainingSkillSettings.js").MoeTrainingSkillMode} [skillMode]
 */
export function buildPhoenixTrainingVerticalSlots(
  phoenixLevel,
  onActivate,
  skillMode = MOE_TRAINING_SKILL_MODE_ALL
) {
  return buildTrainingVerticalSlots(
    MOE_PHOENIX_SKILL_GET_CATALOG,
    phoenixLevel,
    "phoenix",
    onActivate,
    skillMode
  );
}

/**
 * @param {number} dragonLevel
 * @param {(track: 'phoenix' | 'dragon', level: number) => void} [onActivate]
 * @param {import("./moeTrainingSkillSettings.js").MoeTrainingSkillMode} [skillMode]
 */
export function buildDragonTrainingVerticalSlots(
  dragonLevel,
  onActivate,
  skillMode = MOE_TRAINING_SKILL_MODE_ALL
) {
  return buildTrainingVerticalSlots(
    MOE_DRAGON_SKILL_GET_CATALOG,
    dragonLevel,
    "dragon",
    onActivate,
    skillMode
  );
}
