/**
 * MOE — localStorage キー一覧（単一の参照元）
 *
 * 新しい永続化を追加するときはここに登録してから使う。
 * キー名の重複・typo を防ぐ。
 */

import { MOE_ALLY_TARGET_STORAGE_KEY } from "@/lib/moeAllyTargetSettings";
import { MOE_SKILL_PANEL_MODE_STORAGE_KEY } from "@/lib/moeSkillPanelModeSettings";
import { MOE_PET_SKILL_MODE_STORAGE_KEY } from "@/lib/moePetSkillSettings";
import { MOE_PLAYER_SKILL_SET_STORAGE_KEY } from "@/lib/moePlayerSkillSetSettings";
import { MOE_PLAYER_SKILL_SLOT_ORDER_STORAGE_KEY } from "@/data/moePlayerSkillSlotOrder";
import { MOE_PLAYER_SKILL_UNLOCK_STORAGE_KEY } from "@/data/moePlayerNinjaSkills";
import {
  MOE_ITEM_BOX_SLOTS_KEY,
  MOE_ITEM_BOX_SELECTED_KEY,
} from "@/lib/moeItemBoxStorage";
import { MOE_HOLY_RECORD_STORAGE_KEY } from "@/lib/moeHolyRecordStorage";

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
  petSkillMode: {
    key: MOE_PET_SKILL_MODE_STORAGE_KEY,
    owner: "moePetSkillSettings",
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
  playerHpWindowPos: {
    key: "life-rpg-moe-player-hp-window-pos",
    owner: "MoePlayerHpWindow",
  },
  petHpWindowPos: {
    key: "life-rpg-moe-pet-hp-window-pos",
    owner: "MoePetHpWindow",
  },
  itemBoxPos: {
    key: "life-rpg-moe-item-box-pos",
    owner: "MoeItemBox",
  },
  itemBoxGold: {
    key: "life-rpg-moe-item-box-gold",
    owner: "MoeItemBox",
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
