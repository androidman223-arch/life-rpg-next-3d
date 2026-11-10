/**
 * life-rpg-next-3d — TrainingExpSystem bridge
 * 公開時: public/training-exp-system/ と本ファイル・TrainingExpPanel を削除
 */
import { MOE_PHOENIX_SKILL_GET_CATALOG } from "@/data/moePhoenixSkillGetCatalog";
import {
  getMoePhoenixTrainingDefaultMemos,
  MOE_PHOENIX_BUTTON_SUB_HINT,
  MOE_PHOENIX_REFLECTION_PLACEHOLDER,
  MOE_PHOENIX_REFLECTION_KINDS,
} from "@/lib/moePhoenixTrainingMemos";
import { loadPhoenixSkillUnlockLevel } from "@/lib/moePlayerExperience";

const GAME_ID = "life_rpg_next_3d";

/** 訓練士EXPのごほうびは止めた。Lvアップはあとで考える。 */
const MILESTONES = [];

/** 鳳凰修行① — 知恵・整える（UIラベルは training-exp-system 側） */
const DEFAULT_MEMOS = getMoePhoenixTrainingDefaultMemos();

function formatDuration(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}分${r}秒` : `${r}秒`;
}

/**
 * @param {{ onTrainerExpGranted?: () => void }} hooks
 */
export function getLifeRpgTrainingExpConfig(hooks = {}) {
  const notify = () => hooks.onTrainerExpGranted?.();

  function tryAssignItemDrop(milestone) {
    return {
      role: null,
      message: milestone.rewardLabel || milestone.name || "報酬",
    };
  }

  return {
    storageKeys: {
      state: `${GAME_ID}_training_exp_v1`,
      memos: `${GAME_ID}_training_memos_v1`,
      todo: `${GAME_ID}_training_todo_v1`,
    },
    milestones: MILESTONES,
    phoenixSkillGetCatalog: MOE_PHOENIX_SKILL_GET_CATALOG,
    getPhoenixPracticeLevel() {
      return loadPhoenixSkillUnlockLevel();
    },
    defaultMemos: DEFAULT_MEMOS,
    phoenixUi: {
      buttonSubHint: MOE_PHOENIX_BUTTON_SUB_HINT,
      reflectionPlaceholder: MOE_PHOENIX_REFLECTION_PLACEHOLDER,
      reflectionKinds: MOE_PHOENIX_REFLECTION_KINDS,
    },
    formatDuration,
    hasCompanion() {
      return false;
    },
    unlockCompanion() {
      return false;
    },
    tryAssignItemDrop,
    onAfterClaim(milestone) {
      if (milestone.type === "item" && milestone.trainerExpBonus) notify();
    },
  };
}
