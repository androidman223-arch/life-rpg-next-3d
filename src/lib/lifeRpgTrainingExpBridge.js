/**
 * life-rpg-next-3d — TrainingExpSystem bridge
 * 公開時: public/training-exp-system/ と本ファイル・TrainingExpPanel を削除
 */
import { addGameExp } from "@/lib/gameStatus";

const GAME_ID = "life_rpg_next_3d";

const MILESTONES = [
  {
    exp: 10,
    type: "item",
    itemId: "trainer_exp_50",
    name: "修行の成果",
    rewardLabel: "訓練士EXP +50",
    trainerExpBonus: 50,
  },
  {
    exp: 100,
    type: "item",
    itemId: "trainer_exp_200",
    name: "修行の大成果",
    rewardLabel: "訓練士EXP +200",
    trainerExpBonus: 200,
  },
];

const DEFAULT_MEMOS = {
  self: "",
  blame: "",
  task: "",
  habit: "",
};

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
    const bonus = milestone.trainerExpBonus;
    if (bonus && bonus > 0) {
      addGameExp(bonus);
      notify();
      return {
        role: "訓練士",
        message: `訓練士EXP +${bonus}！（${milestone.rewardLabel || milestone.name}）`,
      };
    }
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
    defaultMemos: DEFAULT_MEMOS,
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
