/**
 * ペット敵 LV 育成表 — マップごとの公式フィールド敵（registry 自動反映）
 */

import { moeMonsterFieldAllEntries } from "@/data/moeMonsterFieldRegistry";
import { MOE_AGE_MAP_SLOT_IDS } from "@/lib/moe3dMacro2AgeConstants";
import { MOE_3D_WORLD_MAP_REGISTRY } from "@/lib/moe3dWorldLayout";
import {
  MOE_PET_TRAINING_GUIDE_HOUSE,
  moePetTrainingGuideSectionsFromEntries,
  moePetTrainingLevelLabel,
} from "@/lib/moePetTrainingGuideCore";

export { MOE_PET_TRAINING_GUIDE_HOUSE, moePetTrainingLevelLabel };

/** @returns {import("@/lib/moePetTrainingGuideCore").MoePetTrainingMapSection[]} */
export function moePetTrainingGuideByMap() {
  return moePetTrainingGuideSectionsFromEntries(
    moeMonsterFieldAllEntries(),
    MOE_3D_WORLD_MAP_REGISTRY
  );
}

/** AGE拠点の家 — 敵未登録のAGE面も見出しだけ出す */
export function moePetTrainingGuideForAgeHub() {
  return moePetTrainingGuideSectionsFromEntries(
    moeMonsterFieldAllEntries(),
    MOE_3D_WORLD_MAP_REGISTRY,
    { includeEmptyAgeSections: true, ageMapSlotIds: MOE_AGE_MAP_SLOT_IDS }
  );
}
