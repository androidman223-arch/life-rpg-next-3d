/**
 * MOE — localStorage キー一覧（単一の参照元）
 *
 * 新しい永続化を追加するときはここに登録してから使う。
 * キー名の重複・typo を防ぐ。
 */

import { MOE_ALLY_TARGET_STORAGE_KEY } from "@/lib/moeAllyTargetSettings";
import { MOE_SKILL_PANEL_MODE_STORAGE_KEY } from "@/lib/moeSkillPanelModeSettings";
import { MOE_PET_SKILL_MODE_STORAGE_KEY } from "@/lib/moePetSkillSettings";
import { MOE_PET_AUTO_SKILL_STORAGE_KEY } from "@/lib/moePetAutoSkillSettings";
import { MOE_PET_LOYALTY_GATE_100_STORAGE_KEY } from "@/lib/moePetLoyaltyGateSettings";
import { MOE_ENEMY_RESPAWN_STORAGE_KEY } from "@/lib/moeEnemyRespawn";
import { MOE_PLAYER_LOOK_AHEAD_STORAGE_KEY } from "@/lib/moePlayerLookAhead";
import { MOE_TRAINING_SKILL_MODE_STORAGE_KEY } from "@/lib/moeTrainingSkillSettings";
import { MOE_PLAYER_SKILL_SUCCESS_100_STORAGE_KEY } from "@/lib/moePlayerSkillSuccessSettings";
import { MOE_SKILL_PANEL_VISIBILITY_STORAGE_KEY } from "@/lib/moeSkillPanelVisibilitySettings";
import { MOE_SKILL_PANEL_COLLAPSE_STORAGE_KEY } from "@/lib/moeSkillPanelCollapseSettings";
import { MOE_PLAYER_SKILL_SET_STORAGE_KEY } from "@/lib/moePlayerSkillSetSettings";
import { MOE_PLAYER_SKILL_SLOT_ORDER_STORAGE_KEY } from "@/data/moePlayerSkillSlotOrder";
import { MOE_PLAYER_SKILL_UNLOCK_STORAGE_KEY } from "@/data/moePlayerNinjaSkills";
import { MOE_PLAYER_PRE_SKILL_PROGRESS_STORAGE_KEY } from "@/lib/moePlayerPreSkillProgress";
import { MOE_PLAYER_SKILL2_PROGRESS_STORAGE_KEY } from "@/lib/moePlayerSkill2Progress";
import { MOE_PLAYER_EXPERIENCE_STORAGE_KEY } from "@/lib/moePlayerExperience";
import {
  MOE_DRAGON_TRAINING_STORAGE_KEY,
} from "@/lib/moeDragonTraining";
import { MOE_TOMORROW_MEMO_STORAGE_KEY } from "@/lib/moeTomorrowMemo";
import { MOE_PLAYER_SKILL2_TALISMAN_STORAGE_KEY } from "@/lib/moePlayerSkill2Talisman";
import {
  MOE_ITEM_BOX_SLOTS_KEY,
  MOE_ITEM_BOX_SELECTED_KEY,
} from "@/lib/moeItemBoxStorage";
import { MOE_HOLY_RECORD_STORAGE_KEY } from "@/lib/moeHolyRecordStorage";
import {
  MOE_MINIMAP_POS_STORAGE_2D,
  MOE_MINIMAP_POS_STORAGE_3D,
  MOE_PANEL_DRAG_POS_KEYS,
} from "@/lib/moePanelStack";
import {
  MOE_EXTERNAL_SAVE_LAST_FILE_KEY,
  MOE_EXTERNAL_SAVE_LAST_FOLDER_KEY,
} from "@/lib/moeExternalSave";
import {
  BGM_TRACK_STORAGE_KEY,
  BGM_VOLUME_STORAGE_KEY,
} from "@/lib/moeAmbientBgmTracks";

/** @type {Record<string, { key: string, owner: string, notes?: string }>} */
const MOE_PANEL_DRAG_POS_REGISTRY = Object.fromEntries(
  MOE_PANEL_DRAG_POS_KEYS.map((key) => [
    `panelDragPos:${key}`,
    {
      key,
      owner: "moePanelStack",
      notes: "フローティングパネル位置（panelId と同値）",
    },
  ])
);

/** @type {Record<string, { key: string, owner: string, notes?: string }>} */
export const MOE_STORAGE_REGISTRY = {
  allyTarget: {
    key: MOE_ALLY_TARGET_STORAGE_KEY,
    owner: "moeAllyTargetSettings",
    notes: "'player' | 'pet' — 支援スキル（コンデンスマインド等）の味方ターゲット",
  },
  skillPanelMode: {
    key: MOE_SKILL_PANEL_MODE_STORAGE_KEY,
    owner: "moeSkillPanelModeSettings",
    notes: "旧グローバル。各パネルは `${storageKey}-mode`（useMoeSkillPanelMode）",
  },
  verticalSkillPanelLayout: {
    key: "*-layout",
    owner: "moeVerticalSkillPanelLayout",
    notes: "縦スキル `${storageKey}-layout` — width · slotHeight",
  },
  trainingSkillMode: {
    key: MOE_TRAINING_SKILL_MODE_STORAGE_KEY,
    owner: "moeTrainingSkillSettings",
    notes: "鳳凰・龍神 修行スキル — learned | all",
  },
  playerSkillSuccess100: {
    key: MOE_PLAYER_SKILL_SUCCESS_100_STORAGE_KEY,
    owner: "moePlayerSkillSuccessSettings",
    notes: "プレイヤースキル成功率100%（設定）",
  },
  skillPanelVisibility: {
    key: MOE_SKILL_PANEL_VISIBILITY_STORAGE_KEY,
    owner: "moeSkillPanelVisibilitySettings",
    notes: "縦横スキルUI 8種の表示オン/オフ",
  },
  skillPanelCollapse: {
    key: MOE_SKILL_PANEL_COLLAPSE_STORAGE_KEY,
    owner: "moeSkillPanelCollapseSettings",
    notes: "縦横スキルUI 8種の◆たたみ状態",
  },
  petSkillMode: {
    key: MOE_PET_SKILL_MODE_STORAGE_KEY,
    owner: "moePetSkillSettings",
  },
  petAutoSkill: {
    key: MOE_PET_AUTO_SKILL_STORAGE_KEY,
    owner: "moePetAutoSkillSettings",
    notes: "戦闘オートAI（高Lvスキル優先）",
  },
  petLoyaltyGate100: {
    key: MOE_PET_LOYALTY_GATE_100_STORAGE_KEY,
    owner: "moePetLoyaltyGateSettings",
    notes: "手動スキル — 愛着100で命令（MOE本家）",
  },
  enemyRespawnMinutes: {
    key: MOE_ENEMY_RESPAWN_STORAGE_KEY,
    owner: "moeEnemyRespawn",
    notes: "帯別リポップ秒 lv20/50/100/150（v2）。旧分データも読む",
  },
  playerLookAhead: {
    key: MOE_PLAYER_LOOK_AHEAD_STORAGE_KEY,
    owner: "moePlayerLookAhead",
    notes: "3Dプレイヤーの画面上下。大きいほど画面中央より下",
  },
  playerSkillSet: {
    key: MOE_PLAYER_SKILL_SET_STORAGE_KEY,
    owner: "moePlayerSkillSetSettings",
    notes: "1 | 2",
  },
  playerSkillSlotOrder: {
    key: MOE_PLAYER_SKILL_SLOT_ORDER_STORAGE_KEY,
    owner: "moePlayerSkillSlotOrder",
  },
  playerSkillUnlocks: {
    key: MOE_PLAYER_SKILL_UNLOCK_STORAGE_KEY,
    owner: "moePlayerNinjaSkills",
  },
  playerPreSkillProgress: {
    key: MOE_PLAYER_PRE_SKILL_PROGRESS_STORAGE_KEY,
    owner: "moePlayerPreSkillProgress",
    notes: "プレスキル値 Lv · EXP（100で+0.1）",
  },
  playerExperience: {
    key: MOE_PLAYER_EXPERIENCE_STORAGE_KEY,
    owner: "moePlayerExperience",
    notes: "プレイヤー熟練度まとめ（phoenix/dragon/heal/stealth/preSkills）",
  },
  tomorrowMemo: {
    key: MOE_TOMORROW_MEMO_STORAGE_KEY,
    owner: "moeTomorrowMemo",
    notes: "アルター · 明日やることメモ（自由追加 · 日末チェック）",
  },
  dragonTraining: {
    key: MOE_DRAGON_TRAINING_STORAGE_KEY,
    owner: "moeDragonTraining",
    notes: "修行② 龍の武練 · タイマー · 行動ログ4種 · 龍EXP",
  },
  playerSkill2Progress: {
    key: MOE_PLAYER_SKILL2_PROGRESS_STORAGE_KEY,
    owner: "moePlayerSkill2Progress",
    notes: "旧キー · 移行元。現行は playerExperience.phoenix",
  },
  playerSkill2Talisman: {
    key: MOE_PLAYER_SKILL2_TALISMAN_STORAGE_KEY,
    owner: "moePlayerSkill2Talisman",
    notes: "スキルアップの御札 ON（1）",
  },
  playerVitals: {
    key: "life-rpg-moe-player-vitals",
    owner: "moePlayerVitals",
  },
  petProgress: {
    key: "life-rpg-moe-pet-progress",
    owner: "moePetSave",
  },
  itemBoxSlots: {
    key: MOE_ITEM_BOX_SLOTS_KEY,
    owner: "moeItemBoxStorage",
  },
  itemBoxSelected: {
    key: MOE_ITEM_BOX_SELECTED_KEY,
    owner: "moeItemBoxStorage",
  },
  holyRecords: {
    key: MOE_HOLY_RECORD_STORAGE_KEY,
    owner: "moeHolyRecordStorage",
  },
  ...MOE_PANEL_DRAG_POS_REGISTRY,
  minimapPos3d: {
    key: MOE_MINIMAP_POS_STORAGE_3D,
    owner: "MoeDraggableMinimapPanel",
    notes: "全体マップ位置（stack id minimap-3d と別キー）",
  },
  minimapPos2d: {
    key: MOE_MINIMAP_POS_STORAGE_2D,
    owner: "MoeDraggableMinimapPanel",
    notes: "2Dミニマップ位置（stack id minimap-2d と別キー）",
  },
  itemBoxLayout: {
    key: "life-rpg-moe-item-box-layout",
    owner: "MoeItemBox",
    notes: "アイテムボックスの列数（行は自動 · スロット32px固定）",
  },
  battleLogLayout: {
    key: "life-rpg-moe-battle-log-layout",
    owner: "MoeBattleLogPanel",
    notes: "バトルログの位置・幅・高さ",
  },
  panelCollapse: {
    key: "life-rpg-moe-panel-collapse",
    owner: "moePanelCollapse",
    notes: "マップ・ログ・ペットパネルの折りたたみ",
  },
  panelDock: {
    key: "life-rpg-moe-panel-dock",
    owner: "moePanelDock",
    notes: "バトルログ → 全体マップ右の横ドッキング",
  },
  duelTimeBarLayout: {
    key: "life-rpg-moe-duel-time-bar-layout",
    owner: "MoeDuelTimeBarWindow",
    notes: "交戦タイムバーの位置・幅",
  },
  itemBoxGold: {
    key: "life-rpg-moe-item-box-gold",
    owner: "MoeItemBox",
  },
  externalSaveLastFile: {
    key: MOE_EXTERNAL_SAVE_LAST_FILE_KEY,
    owner: "moeExternalSave",
    notes: "直近の外部セーブ JSON ファイル名（表示用ヒント）",
  },
  externalSaveLastFolder: {
    key: MOE_EXTERNAL_SAVE_LAST_FOLDER_KEY,
    owner: "moeExternalSave",
    notes: "直近の保存フォルダ名（フルパスは取得不可）",
  },
  bgmTrack: {
    key: BGM_TRACK_STORAGE_KEY,
    owner: "AmbientBgm",
    notes: "グローバル BGM 曲 ID（MOE 外）",
  },
  bgmVolume: {
    key: BGM_VOLUME_STORAGE_KEY,
    owner: "AmbientBgm",
    notes: "グローバル BGM 音量 0〜1（MOE 外）",
  },
};

/** 開発時: localStorage の MOE 系キーを一覧表示 */
export function auditMoeLocalStorage() {
  if (typeof window === "undefined") return [];
  const known = new Set(
    Object.values(MOE_STORAGE_REGISTRY).map((entry) => entry.key)
  );
  const report = [];
  for (const [id, entry] of Object.entries(MOE_STORAGE_REGISTRY)) {
    let value = null;
    let parseError = null;
    try {
      value = window.localStorage.getItem(entry.key);
    } catch {
      parseError = "read failed";
    }
    report.push({ id, ...entry, value, parseError });
  }
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key?.startsWith("life-rpg-moe") && !known.has(key)) {
      report.push({
        id: "(unregistered)",
        key,
        owner: "?",
        notes: "registry に未登録",
        value: window.localStorage.getItem(key),
      });
    }
  }
  return report;
}
