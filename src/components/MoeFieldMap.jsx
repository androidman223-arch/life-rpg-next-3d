"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import { flushSync } from "react-dom";
import { DEFAULT_GAME_STATUS, loadGameStatus } from "@/lib/gameStatus";
import {
  getDefaultPetForId,
  fullHealMoePetFieldState,
  loadInitialMoePetFromStorage,
  loadMoePetsSave,
  loadJosephCrystallizedPetIds,
  addJosephCrystallizedPetId,
  clearJosephCrystallizedPetIds,
  petFromSaveSlot,
  loadMoePetDebugSnapshot,
  saveMoePetDebugSnapshot,
  clearMoePetDebugSnapshot,
  petFromDebugSnapshot,
  MOE_SAVED_PET_INITIAL_LEVEL,
  persistCurrentMoePet,
  persistMoePetSlot,
  flushPersistActivePet,
  buildMoeExternalSavePayload,
  canUseMoeExternalSaveDirectoryPicker,
  getMoeExternalSaveLocationHint,
  resolveMoeExternalSaveFolderLabel,
  importMoeExternalSavePayload,
  pickMoeExternalSaveDirectory,
  saveMoeExternalSaveJson,
  writeMoePetsSave,
} from "@/lib/moePetSave";
import {
  formatMoeExternalSaveFileHint,
  formatMoeExternalSaveLocationBlock,
  formatMoeExternalSavePlaceStatus,
} from "@/lib/moeExternalSaveLabels";
import {
  moe3dClampFieldPlayPosition,
  moe3dClampToMapSlotRect,
  moe3dMapSlotAtWorldPos,
} from "@/lib/moe3dMapSlotAtWorldPos";
import { MOE_AGE_MAP_SLOT_IDS } from "@/lib/moe3dMacro2AgeConstants";
import { playSfx } from "@/lib/sfx";
import {
  requestMoeFieldCombatBgm,
  requestMoeFieldZoneBgm,
} from "@/lib/moeFieldBgm";
import { MOE_MEERIM_ENEMIES, MOE_MEERIM_MID_BOSS_KEY, MOE_MEERIM_GUSTAV_JUNIOR_KEY, MOE_MEERIM_SUPER_BOSS_KEY, MOE_MEERIM_MOUNTAIN_BISON_KEY, MOE_MEERIM_ROUGH_BISON_KEY, MOE_MID_BOSS_HP_MULTIPLIER, MOE_SUPER_BOSS_HP_MULTIPLIER, enemyWikiStatsTitle, formatEnemyLevelUi } from "@/data/moeMeerimEnemies";
import {
  applyMoePetExpGain,
  applyMoePetExpLoss,
  formatMoePetTenthLevelBanner,
  formatMoePetTenthLevelDownBanner,
  getMoePetExpBaseOnHitSuccess,
  getMoePetExpIntoLevelFromTotal,
  getMoePetExpRemainingToNextTenth,
  getMoePetExpTenthBarPct,
  getMoePetFractionalLevelFromTotalExp,
  getMoePetFreshTotalExpForLevel,
  getMoePetLevelFromTotalExp,
  getMoePetTotalExpFromLegacyProgress,
  resolvePetTotalExp,
  isMoePetTenthLevelUpMessage,
  isMoePetTenthLevelDownMessage,
  MOE_PET_ATTACK_EXP_SUCCESS_RATE,
  MOE_PET_MAX_LEVEL,
  MOE_PET_TENTH_LEVEL_UP_LABEL,
} from "@/data/moePetExpTable";
import {
  MOE_PET_DATA,
  calculatePetStats,
  formatPetResistUi,
  formatPetStatUi,
  getPetWikiGrowthCaptionLine,
  petUsesPreciseWikiStats,
  roundPetStatInternal,
} from "../data/moePets";
import { resolveMoeDuelSkillSequence } from "../data/moePetCombatSkills";
import MoeField3DCanvas from "@/components/MoeField3DCanvas";
import MoeAltarWarpPanel from "@/components/MoeAltarWarpPanel";
import MoePetTrainingGuidePanel from "@/components/MoePetTrainingGuidePanel";
import MoeMacroSessionTimer from "@/components/MoeMacroSessionTimer";
import {
  MOE_ALTARS,
  moeAltarDestinationById,
} from "@/data/moeAltarWarps";
import { moe3dClampFieldMove } from "@/lib/moe3dFieldColliders";
import {
  moe3dDefaultPlayerSpawn,
  moe3dEstimatedTileSize,
  moe3dFindNearbyAltar,
  moe3dWarpDestSpawnWorld,
} from "@/lib/moe3dAltarWarp";
import {
  moe3dIsNearTrainingGuideHouse,
  moe3dTrainingGuideHousePosition,
} from "@/lib/moe3dTrainingGuideHouse";
import {
  moe3dAgeHubHousePosition,
  moe3dIsNearAgeHubHouse,
  MOE_AGE_HUB_HOUSE,
} from "@/lib/moe3dAgeHubHouse";
import { MOE_PET_TRAINING_GUIDE_HOUSE } from "@/lib/moePetTrainingGuide";
import {
  applyMoeTrainingGuideHpBonus,
  moeApplyFlatPetHpBonus,
  moeEnsureTrainingGuideHpBonus,
  MOE_TRAINING_GUIDE_BGM_MAP_SLOT,
  MOE_TRAINING_GUIDE_HP_BONUS,
  moeTrainingGuideChantMatches,
} from "@/lib/moeTrainingGuideHouseBuff";
import {
  countMoeHolyRecordItems,
  createMoeHolyRecordStone,
  isMoeHolyRecordBoxItem,
  MOE_HOLY_RECORD_CHANT_SEC,
  MOE_HOLY_RECORD_MAX_STONES,
  MOE_TELEPORT_CHANT_SEC,
  moeHolyRecordToBoxItem,
} from "@/data/moeHolyRecord";
import { clearHolyRecordWorldStones } from "@/lib/moeHolyRecordStorage";
import { formatMoe3dHudCoordLabel } from "@/lib/moe3dHolyRecordStone";
import {
  moe3dMonsterFieldSpawnPoints,
  moe3dPickRespawnInMapSlot,
  moe3dMonsterFieldMapSlotIds,
  moe3dIsMapSlotFieldEnemy,
  moe3dMonsterFieldSpawnWorld,
  moeEnemyFieldIdleFacingYaw,
} from "@/lib/moe3dMonsterMapSpawns";
import { moeMonsterFieldBase } from "@/data/moeMonsterFieldRegistry";
import {
  buildMoePetBuffStrip,
  buildMoePlayerBuffStrip,
} from "@/lib/moeBuffUi";
import {
  clearMoeEnemyChaseRuntime,
  tickMoeEnemyFieldChaseBatch,
} from "@/lib/moeEnemyFieldChase";
import {
  activateMoeKakuremino,
  buildMoeEnemyDetectionOpts,
  dropMoeEnemyFieldAggro,
  isMoeKakureminoActive,
  MOE_KAKUREMINO_DURATION_SEC,
  moeKakureminoActiveRemainSec,
  moeKakureminoCooldownRemainSec,
} from "@/lib/moePlayerStealth";
import MoeField3DBattleOverlay from "@/components/MoeField3DBattleOverlay";
import MoeField3DTreasureOverlay from "@/components/MoeField3DTreasureOverlay";
import MoeTargetWindow from "@/components/MoeTargetWindow";
import MoeEnemyStatSearchPanel from "@/components/MoeEnemyStatSearchPanel";
import MoeCircleMarker from "@/components/MoeCircleMarker";
import MoeCrystalMarker from "@/components/MoeCrystalMarker";
import MoeNpcDialogue from "@/components/MoeNpcDialogue";
import MoePetHpWindow from "@/components/MoePetHpWindow";
import MoePlayerHpWindow from "@/components/MoePlayerHpWindow";
import MoeDuelTimeBarWindow from "@/components/MoeDuelTimeBarWindow";
import { MOE_SKILL_ICON_SLOT_COUNT } from "@/components/MoeSkillIconBar";
import MoeMergedSkillIconBar from "@/components/MoeMergedSkillIconBar";
import MoeMergedVerticalSkillPanel from "@/components/MoeMergedVerticalSkillPanel";
import MoeDragonLineupCanvas from "@/components/MoeDragonLineupCanvas";
import MoeMonsterLineupCanvas from "@/components/MoeMonsterLineupCanvas";
import MoeShowcaseDeletePicker from "@/components/MoeShowcaseDeletePicker";
import MoeDraggableMinimapPanel from "@/components/MoeDraggableMinimapPanel";
import MoeField3DCompassHud from "@/components/MoeField3DCompassHud";
import { MOE_DRAGON_LINEUP } from "@/data/moeDragonVariants";
import {
  MOE_MONSTER_FAMILIES,
  MOE_MONSTER_LINEUP,
} from "@/data/moeMonsterLineup";
import {
  addHiddenShowcaseIds,
  clearHiddenShowcaseIds,
  filterShowcaseLineupByIds,
  loadHiddenShowcaseIds,
  removeHiddenShowcaseId,
} from "@/lib/moeShowcaseDeleteList";
import { appendShowcaseDeleteQueue } from "@/lib/moeShowcaseDeleteQueueFile";
import {
  buildPlayerNinjaSkillSlots,
  loadPlayerSkillUnlocks,
  savePlayerSkillUnlocks,
} from "@/data/moePlayerNinjaSkills";
import {
  loadPlayerSkillSlotOrder,
  savePlayerSkillSlotOrder,
  swapPlayerSkillSlotOrder,
} from "@/data/moePlayerSkillSlotOrder";
import {
  buildPlayerSkillSlotEntry,
  buildPlayerUtilitySkillSlotEntry,
} from "@/lib/moePlayerSkillSlotUi";
import { defaultPlayerUtilitySlotOrder } from "@/data/moePlayerUtilitySkills";
import { buildPlayerPhoenixSkillSlotEntries } from "@/lib/moePlayerPhoenixSkillUi";
import MoePlayerSkill2LevelUpFlash from "@/components/MoePlayerSkill2LevelUpFlash";
import {
  MOE_PHOENIX_PLAYER_CHANT_SEC,
  MOE_PHOENIX_PLAYER_MP_SHORTAGE_TOAST,
  canSpendPlayerMpForPhoenixSkill,
  clearMoePetPoisonParalysis,
  isMoePhoenixPlayerChantSkill,
  petHasMoeAilment,
  spendPlayerMpForPhoenixSkill,
} from "@/lib/moePhoenixPlayerSkill";
import {
  resolvePhoenixHabitAscensionSequence,
  validatePhoenixHabitAscension,
} from "@/lib/moePhoenixHabitAscension";
import {
  activateAtrumPetSkill,
  getAtrumMagicBuffMult,
  isAtrumManaAmpActive,
  tickAtrumMpRegen,
} from "@/lib/moeAtrumPetSkills";
import {
  defaultMoePlayerVitals,
  fullHealMoePlayerVitals,
  loadMoePlayerVitals,
  MOE_BANANA_MILK_STAMINA_REGEN_MULT,
  moePlayerBananaMilkStaminaRegenPerSec,
  saveMoePlayerVitals,
  tickMoePlayerVitalsField,
} from "@/lib/moePlayerVitals";
import {
  activateCondenseMindOnTarget,
  isPlayerCondenseMindActive,
  PLAYER_CONDENSE_MIND_MP_COST,
  PLAYER_CONDENSE_MIND_MP_PER_SEC,
  tickPlayerCondenseMind,
} from "@/lib/moePlayerCondenseMind";
import {
  activateJirikiSeiran,
  isJirikiSeiranActive,
  tickJirikiSeiran,
} from "@/lib/moePlayerJirikiSeiran";
import { loadPlayerPreSkillProgress } from "@/lib/moePlayerPreSkillProgress";
import { useMoePlayerPreSkillField } from "@/hooks/useMoePlayerPreSkillField";
import {
  awardPlayerSkill2ExpOnUse,
  canUsePlayerSkill2,
  getPlayerSkill2RequiredLevel,
  migratePlayerSkill2ProgressFromPreSkills,
  savePlayerSkill2Progress,
} from "@/lib/moePlayerSkill2Progress";
import {
  loadMoeAllyTarget,
  saveMoeAllyTarget,
} from "@/lib/moeAllyTargetSettings";
import {
  collectMoeFieldInvariantIssues,
  installMoeDevRegistry,
  moeDevAssert,
  reportMoeFieldInvariantIssues,
  updateMoeDevSnapshot,
} from "@/lib/moe";
import MoeItemBox from "@/components/MoeItemBox";
import {
  createMoeFieldTreasureDrop,
  moeTreasureDropPositionNearEnemy,
  shouldMoeEnemyDropTreasure,
  isGustavJuniorTreasure,
  MOE_ITEM_EXPERIENCE_POWDER,
  MOE_ITEM_EXPERIENCE_CUBE,
  MOE_ITEM_LEVEL_DOWN_POWDER,
  MOE_ITEM_LEVEL_DOWN_CUBE,
  getMoeFieldLootItem,
  isMoeExpConsumableItemId,
  isMoePhoenixFeatherItemId,
  MOE_ITEM_PHOENIX_FEATHER,
} from "@/data/moeFieldTreasures";
import {
  buildPetCombatSkillSlots,
  getMysteryDragonDisplayName,
  getMysteryDragonMaxHpBonus,
  canRebirthMysteryDragon,
  isMoePetSkillUsableAtLevel,
  MOE_MYSTERY_DRAGON_REBORN_ID,
} from "@/data/moePhoenixDragon";
import {
  loadMoePetSkillMode,
  saveMoePetSkillMode,
  MOE_PET_SKILL_MODE_ALL,
  MOE_PET_SKILL_MODE_LEARNED,
  moePetSkillModeLabel,
} from "@/lib/moePetSkillSettings";
import {
  formatMoePetSkillDescription,
  formatMoeSkillHoverTip,
} from "@/lib/moePetSkillDescription";
import { MOE_EVENT_GUIDE_SECTIONS } from "@/data/moeEventGuide";
import {
  addMoeItemBoxItem,
  loadMoeItemBoxSelectedIndex,
  loadMoeItemBoxSlots,
  moeFieldLootToBoxItem,
  MOE_ITEM_BOX_SELECTED_EVENT,
  MOE_ITEM_BOX_SLOTS_EVENT,
  notifyMoeItemBoxSlotsChanged,
  removeMoeItemBoxSlot,
  saveMoeItemBoxSlots,
} from "@/lib/moeItemBoxStorage";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import {
  buildPetMasterDialogue,
  MOE_PET_MASTER_NPC,
  MOE_PET_EXP_VENDOR_NPC,
  MOE_SOUL_MEMORY_RHODA_NPC,
  MOE_SOUL_MEMORY_RHODA_BUTTON,
  MOE_SOUL_MEMORY_RHODA_FIELD,
  MOE_SOUL_MEMORY_RHODA_LINES,
  MOE_SOUL_MEMORY_RHODA_GIVE_ACTIONS,
} from "@/data/moeFieldNpcs";
import {
  MOE_PET_EXP_SHOP_CATALOG,
  MOE_PET_EXP_SHOP_SKILLS,
  MOE_PET_EXP_VENDOR_SECRET_LINES,
} from "@/data/moePetExpShopCatalog";
import {
  MOE_CASH_SHOP_NPC,
  MOE_CASH_SHOP_BUTTON,
  MOE_CASH_SHOP_LINES,
  MOE_CASH_SHOP_CATALOG_ITEMS,
  buildMoeCashShopBuyActions,
} from "@/data/moeCashShopCatalog";
import {
  MOE_CASH_SHOP_ITEM_BY_ACTION,
  moeCashShopItemToBoxItem,
} from "@/data/moeCashShopItems";
import { moe3dIsNearCashShopNpc } from "@/lib/moe3dBiskHubLayout";
import {
  MOE_JOSEPH_NPC,
  MOE_JOSEPH_EXP_CRYSTAL_BUTTON,
  MOE_JOSEPH_EXP_CRYSTAL_LINES,
  MOE_JOSEPH_EXP_CRYSTAL_STEPS,
  MOE_JOSEPH_EXP_CRYSTAL_TIERS,
  MOE_JOSEPH_CATALOG_ACTIONS,
  MOE_JOSEPH_TRIAL_PET_LEVELS,
  MOE_JOSEPH_TIME_TABLET_OPTION,
  MOE_JOSEPH_RITUAL_WAIT_MESSAGE,
  MOE_JOSEPH_RITUAL_PROCESS_MESSAGE,
  rollJosephExpCrystalTrialTier,
  createJosephExpCrystal,
  createJosephExpCrystalFromPet,
  formatJosephCrystalResultMessage,
  getJosephCrystalResultHeadline,
  getJosephCrystalUsePreview,
  formatJosephCrystalUseConfirmPrompt,
  formatJosephCrystalUseAppliedMessage,
  formatJosephFullTierProbabilityNote,
  getJosephExpCrystalTierById,
  formatJosephSacrificePickPrompt,
  buildJosephSacrificePetMenuActions,
  getJosephPetSlotTotalExp,
  MOE_JOSEPH_SACRIFICE_MIN_LEVEL,
} from "@/data/moeJosephExpCrystal";
import {
  MOE_JOSEPH_SYNTH_NPC,
  MOE_JOSEPH_SYNTH_BUTTON,
  MOE_JOSEPH_SYNTH_LINES,
  MOE_JOSEPH_SYNTH_CATALOG_ACTIONS,
  formatJosephSynthTierPickPrompt,
  buildJosephSynthTierMenuActions,
} from "@/data/moeJosephSynth";
import {
  MOE_3D_ENEMIES_PER_ZONE,
  MOE_3D_ENEMY_ZONES,
  MOE_3D_ZONE_PAIR_LEVEL_OFFSET,
  MOE_3D_HALF_D,
  MOE_3D_HALF_W,
  MOE_3D_LEGACY_REF_HALF,
  MOE_3D_LEGACY_TILES_X,
  MOE_3D_LEGACY_TILES_Z,
  MOE_SNAKE_ATTACK_MS,
  MOE_TENTH_BANNER_MS_2D,
  MOE_TENTH_BANNER_MS_3D,
  moe3dClampPosition,
  moe3dClampToPlayBounds,
  moe3dDuelSlotFromPet,
  moe3dEnemyStatsForZoneLevel,
  moe3dMinimapZoneRects,
  moe3dPickRespawnInZone,
  moe3dMidBossSpawnPosition,
  moe3dSuperBossSpawnPosition,
  moe3dMountainBisonSpawnPosition,
  moe3dRoughBisonSpawnPosition,
  moe3dBossAreaLayout,
  buildMeerimMidBossEnemy,
  buildMeerimSuperBossEnemy,
  buildMeerimFieldBisonEnemy,
  buildMeerimGustavJuniorEnemy,
  moe3dGustavJuniorSpawnPosition,
  moe3dPlayerStartPosition,
  moe3dPetStartNearPlayer,
  moe3dIsNearPetHouse,
  moe3dIsNearRhoda,
  moe3dRhodaPosition,
  moe3dWorldToMinimap,
  moe3dZoneEnemyPosition,
  enemyStrikeAnimMsForKey,
  MOE_ORC_STRONG_ATTACK_MS,
  MOE_ORC_WEAK_ATTACK_MS,
  MOE_GUSTAV_STRONG_ATTACK_MS,
  MOE_GUSTAV_WEAK_ATTACK_MS,
  MOE_POPUP_COLOR_ALLY_DAMAGE,
  MOE_POPUP_COLOR_ENEMY_DAMAGE,
  MOE_COMBO_DAMAGE_STACK_PX,
  MOE_COMBO_POPUP_MS,
  MOE_DAMAGE_POPUP_2D_TOP_OFFSET_PX,
  rollMoeComboPopupMotion,
  moeComboPopupCssVars,
} from "@/lib/moeField3DModels";
import {
  moe3dBiskWorldCenter,
  moe3dFullWorldBounds,
  moe3dMinimapFullTileRects,
  moe3dMinimapViewSize,
  moe3dWorldToMinimapInBounds,
} from "@/lib/moe3dWorldLayout";
import { moe3dBiskHubAnchor } from "@/lib/moe3dBiskHubLayout";
import {
  buildMoe2dRowLayout,
  computeMoe2dWorldSize,
  inRiverMoe2d,
  moe2dCellCenter,
  moe2dIsBiskExitZone,
  moe2dPickRespawnInZone2d,
  moe2dMidBossSpawnPosition,
  moe2dSuperBossSpawnPosition,
  moe2dMountainBisonSpawnPosition,
  moe2dRoughBisonSpawnPosition,
  moe2dBossAreaLayout,
  moe2dPlayerStartPosition,
  moe2dPetHouseLayout,
  moe2dIsNearPetHouse,
  moe2dRhodaLayout,
  moe2dIsNearRhoda,
  moe2dRiverBoundaries,
  moe2dZoneRowStyle,
  moe2dZoneRowMiniFill,
  MOE_2D_MID_BOSS_UI_SIZE,
  MOE_2D_MID_BOSS_UI_PAD,
  MOE_2D_SUPER_BOSS_UI_SIZE,
  MOE_2D_SUPER_BOSS_UI_PAD,
} from "@/lib/moeField2DLayout";

const PLAYER_R = 18;

/** キー入力（e.code ベース — w/W 取りこぼし防止） */
function createEmptyInputKeys() {
  return { up: false, down: false, left: false, right: false, shift: false, space: false };
}

function applyInputKeyCode(state, code, down, e) {
  switch (code) {
    case "KeyW":
    case "ArrowUp":
      state.up = down;
      return true;
    case "KeyS":
    case "ArrowDown":
      state.down = down;
      return true;
    case "KeyA":
    case "ArrowLeft":
      state.left = down;
      return true;
    case "KeyD":
    case "ArrowRight":
      state.right = down;
      return true;
    case "ShiftLeft":
    case "ShiftRight":
      state.shift = down ? true : e.getModifierState("Shift");
      return true;
    case "Space":
      state.space = down;
      return true;
    default:
      return false;
  }
}

const MOVE_KEY_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);
/** 2D ミニマップ SVG */
function minimapSvgStyle(mapW, mapH) {
  return { width: "100%", aspectRatio: `${mapW * 2} / ${mapH}` };
}

/** 3D 全体マップ — 横長でも縦方向を確保 */
function minimap3dSvgStyle(mapW, mapH) {
  return { width: "100%", aspectRatio: `${mapW} / ${mapH}` };
}

/** 全体マップ — 近くの通常敵だけ表示（ボスは常に表示） */
const MINIMAP_ENEMY_NEAR_DIST = 48;

function minimapEnemyVisible(en, playerX, playerZ) {
  if (en.midBoss || en.superBoss || en.fieldGustav) return true;
  const dx = en.x - playerX;
  const dz = en.y - playerZ;
  return dx * dx + dz * dz <= MINIMAP_ENEMY_NEAR_DIST * MINIMAP_ENEMY_NEAR_DIST;
}

function minimap3dEnemyDotRadius(en, miniW) {
  if (en.superBoss) return Math.max(4, miniW * 0.013);
  if (en.midBoss) return Math.max(3.5, miniW * 0.011);
  if (en.fieldGustav) return Math.max(3, miniW * 0.01);
  return Math.max(2, miniW * 0.0065);
}

function minimap3dEnemyDotOpacity(en) {
  if (en.superBoss) return 0.68;
  if (en.midBoss) return 0.63;
  if (en.fieldGustav) return 0.58;
  return 0.5;
}
const MOVE_SPEED = 4.5;
/** 3Dマップは座標範囲が狭いので、同じ数値だと約10倍速く感じる */
const MOVE_SPEED_3D = 0.2;
const SPRINT_MULTIPLIER_3D = 2;
/** Shift ダッシュ ON 時の追加倍率（通常ダッシュ × この値） */
const SPRINT_BOOST_MULT_3D = 3;
const JUMP_VELOCITY_3D = 17;
const GRAVITY_3D = 30;
/** プレイヤー操作の回復量（Wiki比率寄り: ライト基準 ×1 / ×1.5 / ×3） */
const HEAL_AMOUNT_LIGHT = 30;
const HEAL_AMOUNT_HEALING = 45;
const HEAL_AMOUNT_HEAL_ALL = 90;
const HEAL_COOLDOWN_HEALING_SEC = 10;
const HEAL_COOLDOWN_HEAL_ALL_SEC = 20;
/** リジェネ：2秒ごとの小回復（トグル） */
const PET_REGEN_INTERVAL_SEC = 2;
const PET_REGEN_HP = 20;
const PET_REGEN_MP = 2;

/** リジェネポップ表示用（異常値・内部ID混入を除外） */
function formatRegenHealPopupAmount(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0 || n > PET_REGEN_HP + 0.05) return null;
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
}
/** 座れ：自然回復（秒あたり） */
const PET_SIT_REGEN_HP = 3;
const PET_SIT_REGEN_MP = 2;
const PET_AUTO_ATTACK_COOLDOWN_MS = 1400;
const PET_FOLLOW_DIST_3D = 5.5;
const PET_FOLLOW_DIST_3D_AUTO = 8;
const PET_FOLLOW_DIST_2D = 60;
const PET_APPROACH_THRESHOLD_3D = 0.55;
const PET_APPROACH_THRESHOLD_2D = 10;

const MOE_PET_COMMAND_UI = {
  follow: { label: "もどれ", toast: "もどれ！（プレイヤーのもとへ）", hint: "追従中" },
  wait: { label: "待て", toast: "待て！（その場で待機）", hint: "待機中" },
  sit: { label: "座れ", toast: "座れ！（自然回復）", hint: "座って回復中" },
  auto: { label: "オート", toast: "オート：敵を自動で攻撃", hint: "オート攻撃中" },
};
const INITIAL_MOE_PET_LEVEL = MOE_SAVED_PET_INITIAL_LEVEL;

/** HP/MP バー幅（max が 0 のとき NaN 防止） */
function petResourceBarPct(current, max) {
  const m = Number(max);
  if (!m || m <= 0) return 0;
  const c = Math.max(0, Number(current) || 0);
  return Math.min(100, (c / m) * 100);
}

function enemyHpBarColor(pct) {
  if (pct <= 25) return "#dc2626";
  if (pct <= 50) return "#ef4444";
  return "#f87171";
}

/** ペット命令：待機・座れは anchor 固定、もどれ/オートは追従 */
function advancePetFieldPosition({
  pos,
  cmd,
  duel,
  waitAnchor,
  playerPos,
  speed,
  approachThreshold,
  followDist,
  followDistAuto,
  now,
  autoAttackCooldownRef,
  targetEnemyIdRef,
  enemiesRef,
  setTargetEnemyId,
  startDuelWithEnemyRef,
}) {
  if (cmd === "wait" || cmd === "sit") {
    if (waitAnchor) {
      return { x: waitAnchor.x, y: waitAnchor.y, reachedApproach: false };
    }
    return { ...pos, reachedApproach: false };
  }

  if (duel?.phase === "approach") {
    const ddx = duel.slotX - pos.x;
    const ddy = duel.slotY - pos.y;
    const dist = Math.hypot(ddx, ddy);
    if (dist < approachThreshold) {
      return { x: duel.slotX, y: duel.slotY, reachedApproach: true };
    }
    const sp = speed * 1.35;
    return {
      x: pos.x + (ddx / dist) * sp,
      y: pos.y + (ddy / dist) * sp,
      reachedApproach: false,
    };
  }
  if (duel?.phase === "simultaneous_charge") {
    return { x: duel.slotX, y: duel.slotY, reachedApproach: false };
  }
  if (cmd === "auto" && now >= autoAttackCooldownRef.current) {
    let tid = targetEnemyIdRef.current;
    let en = enemiesRef.current.find((e) => e.id === tid && e.hp > 0);
    if (!en) {
      const alive = enemiesRef.current.filter((e) => e.hp > 0);
      if (alive.length > 0) {
        en = alive[Math.floor(Math.random() * alive.length)];
        tid = en.id;
        targetEnemyIdRef.current = tid;
        setTargetEnemyId(tid);
      }
    }
    if (en) {
      startDuelWithEnemyRef.current(tid);
      autoAttackCooldownRef.current = now + PET_AUTO_ATTACK_COOLDOWN_MS;
    }
  }
  const pdx = playerPos.x - pos.x;
  const pdy = playerPos.y - pos.y;
  const dist = Math.hypot(pdx, pdy);
  const threshold = cmd === "auto" ? followDistAuto : followDist;
  const followMult = cmd === "follow" ? 1.35 : 0.9;
  if (dist > threshold) {
    return {
      x: pos.x + (pdx / dist) * (speed * followMult),
      y: pos.y + (pdy / dist) * (speed * followMult),
      reachedApproach: false,
    };
  }
  return { ...pos, reachedApproach: false };
}

/** MOE: Level 0.1 up — ペットがそばを離れてから喜んで戻る */
const PET_TENTH_CELEBRATION_LEAVE_3D = 5.5;
const PET_TENTH_CELEBRATION_LEAVE_2D = 88;
const PET_TENTH_CELEBRATION_SPEED_MULT = 1.65;
const PET_TENTH_CELEBRATION_JOY_MS = 520;

function clampPetCelebrationPoint(x, y, world) {
  if (!world) return { x, y };
  if (world.mode3d) {
    const hw = world.halfW ?? world.mw / 2;
    const hd = world.halfD ?? world.mh / 2;
    const margin = 2;
    return {
      x: Math.max(-hw + margin, Math.min(hw - margin, x)),
      y: Math.max(-hd + margin, Math.min(hd - margin, y)),
    };
  }
  const margin = PLAYER_R;
  return {
    x: Math.max(margin, Math.min(world.mw - margin, x)),
    y: Math.max(margin, Math.min(world.mh - margin, y)),
  };
}

function createPetTenthCelebrationState(playerPos, petPos, world) {
  let ux = petPos.x - playerPos.x;
  let uy = petPos.y - playerPos.y;
  const len = Math.hypot(ux, uy);
  if (len < 0.05) {
    const angle = Math.random() * Math.PI * 2;
    ux = Math.cos(angle);
    uy = Math.sin(angle);
  } else {
    ux /= len;
    uy /= len;
  }
  const leaveDist = world?.mode3d
    ? PET_TENTH_CELEBRATION_LEAVE_3D
    : PET_TENTH_CELEBRATION_LEAVE_2D;
  const away = clampPetCelebrationPoint(
    playerPos.x + ux * leaveDist,
    playerPos.y + uy * leaveDist,
    world
  );
  return {
    active: true,
    phase: "leave",
    awayX: away.x,
    awayY: away.y,
    pauseUntil: 0,
  };
}

function advancePetTenthCelebration(pos, playerPos, speed, world, now) {
  const reach = world?.mode3d ? 0.28 : 6;
  const followDist = world?.mode3d ? PET_FOLLOW_DIST_3D : PET_FOLLOW_DIST_2D;
  const sp = speed * PET_TENTH_CELEBRATION_SPEED_MULT;

  return (cel) => {
    if (!cel?.active) return { pos, cel, finished: false };

    if (cel.phase === "leave") {
      const ddx = cel.awayX - pos.x;
      const ddy = cel.awayY - pos.y;
      const dist = Math.hypot(ddx, ddy);
      if (dist <= reach) {
        return {
          pos: { x: cel.awayX, y: cel.awayY },
          cel: {
            ...cel,
            phase: "joy",
            pauseUntil: now + PET_TENTH_CELEBRATION_JOY_MS,
          },
          finished: false,
        };
      }
      return {
        pos: {
          x: pos.x + (ddx / dist) * sp,
          y: pos.y + (ddy / dist) * sp,
        },
        cel,
        finished: false,
      };
    }

    if (cel.phase === "joy" && now < cel.pauseUntil) {
      return { pos, cel, finished: false };
    }

    const pdx = playerPos.x - pos.x;
    const pdy = playerPos.y - pos.y;
    const dist = Math.hypot(pdx, pdy);
    if (dist <= followDist * 1.05) {
      return { pos, cel: { ...cel, active: false }, finished: true };
    }
    return {
      pos: {
        x: pos.x + (pdx / dist) * sp,
        y: pos.y + (pdy / dist) * sp,
      },
      cel: { ...cel, phase: "return" },
      finished: false,
    };
  };
}

const SKILL_SLOT_LABELS = [
  "スキル１",
  "スキル２",
  "スキル３",
  "スキル４",
  "スキル５",
  "スキル６",
  "スキル７",
  "スキル８",
  "スキル９",
  "スキル１０",
];

const SKILL_SLOT_LABELS_LEARNED = SKILL_SLOT_LABELS.slice(0, 7);

/** 太陽の大精霊：トースト文言（サンバのみ表示専用・他は戦闘スキルと併用） */
const SUN_SPIRIT_SKILL_TOASTS = [
  "太陽のサンバ　発動！",
  "１６ビートコンボ",
  "灼熱の円舞曲",
  "紅蓮の炎帝",
];

/** 整数レベルアップの画面上フラッシュ（複数行で折り返し表示） */
function formatPetLevelUpFlashText(messages) {
  const lines = messages.filter((m) => !isMoePetTenthLevelUpMessage(m));
  if (lines.length === 0) return "";
  return lines.join("\n");
}

/** 経験値パウダー・キューブ使用時のLv変化ページ */
function buildExpConsumableAdjustPages(messages) {
  const pages = [];
  const tenthUp = messages.filter(isMoePetTenthLevelUpMessage);
  const tenthDown = messages.filter(isMoePetTenthLevelDownMessage);
  const intMsgs = messages.filter(
    (m) => !isMoePetTenthLevelUpMessage(m) && !isMoePetTenthLevelDownMessage(m)
  );
  if (tenthUp.length) {
    pages.push(formatMoePetTenthLevelBanner(tenthUp.length));
  }
  if (tenthDown.length) {
    pages.push(formatMoePetTenthLevelDownBanner(tenthDown.length));
  }
  for (const msg of intMsgs) {
    if (msg) pages.push(msg);
  }
  return pages;
}

function skillToastMessage(petId, slotIndex, skill) {
  if (petId === "sun_spirit" && slotIndex < SUN_SPIRIT_SKILL_TOASTS.length) {
    return SUN_SPIRIT_SKILL_TOASTS[slotIndex];
  }
  return skill ? `${skill.name}！` : "";
}

const MOE_PET_IDS = Object.keys(MOE_PET_DATA);

const MOE_ITEM_USE_NPC = { name: "アイテム", emoji: "✨" };

/** フィールド同時チャージバー：通常アタック間隔（必殺技の Wiki ディレイは使わない） */
const MOE_PET_FIELD_ATTACK_CHARGE_SEC = 3;
/** 戦闘テンポ加速（チャージ・スタン・攻撃アニメ・3D mixer） */
const MOE_BATTLE_SPEED_FAST_MULT = 2;

/** スキルボタン発動メッセージの表示時間（コンボヒットで消えない専用 UI） */
const MOE_SKILL_TOAST_MS = 1000;

/** ギュスターヴ再戦 — 神速リセット確認イベント */
const MOE_GUSTAV_EVENT_NPC = { name: "ギュスターヴ", emoji: "🐊" };

/** ペットの次の攻撃までのチャージ秒数（同時チャージ UI＝アタック想定） */
function getPetChargeSeconds(petId, petLevel) {
  const skills = MOE_PET_DATA[petId]?.skills || [];
  const atk = skills.find(
    (s) => s.name === "アタック" && (s.level ?? 1) <= petLevel
  );
  if (atk?.delaySec != null && atk.delaySec > 0) {
    return Math.min(12, Math.max(2, atk.delaySec));
  }
  return MOE_PET_FIELD_ATTACK_CHARGE_SEC;
}

/** 敵の攻撃チャージ秒数（体感用に Wiki 間隔に依存せず約5秒） */
function getEnemyChargeSeconds(_enemy) {
  return 5;
}

/**
 * ペット→敵ダメージ（真・決定版）
 * ダメージ = (攻撃力 × 0.8) × (100 / (100 + 敵の防御力))、最終値は切り捨て・最低1
 */
function computePetDamageAgainstEnemy(petAttack, enemyDefense) {
  const atk = Math.max(0, Number(petAttack) || 0);
  const def = Math.max(0, Number(enemyDefense) || 0);
  const raw = atk * 0.8 * (100 / (100 + def));
  return Math.max(1, Math.floor(raw));
}

function slotInFrontOfEnemy(enemy, playerX, playerY, dist = 52) {
  const dx = playerX - enemy.x;
  const dy = playerY - enemy.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: enemy.x - (dx / len) * dist,
    y: enemy.y - (dy / len) * dist,
  };
}

function inRiver(px, py, mapW, mapH, rowLayout) {
  if (rowLayout?.length) return inRiverMoe2d(px, py, mapW, rowLayout);
  const screenH = mapH / 6;
  for (let i = 1; i <= 5; i++) {
    const rivCenter = screenH * i;
    const rivTop = rivCenter - screenH * 0.08;
    const rivBot = rivCenter + screenH * 0.08;
    if (py >= rivTop && py <= rivBot) {
      const brW = 120;
      const cx = mapW / 2;
      if (px >= cx - brW / 2 && px <= cx + brW / 2) return false;
      return true;
    }
  }
  return false;
}

/** 2D：川は軸ごとに判定し、橋方向へ滑らかに沿えるようにする */
function resolve2dPlayerMove(px, py, nx, ny, mapW, mapH, rowLayout) {
  if (!inRiver(nx, ny, mapW, mapH, rowLayout)) return { x: nx, y: ny };
  if (!inRiver(nx, py, mapW, mapH, rowLayout)) return { x: nx, y: py };
  if (!inRiver(px, ny, mapW, mapH, rowLayout)) return { x: px, y: ny };
  return { x: px, y: py };
}

function isTypingTarget(el) {
  if (!el || typeof el !== "object") return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
}

/** 3D: カメラの向き（yaw）に合わせて WASD の入力方向を変換 */
function moveInputForCameraYaw(inputX, inputZ, camYaw) {
  const sinY = Math.sin(camYaw);
  const cosY = Math.cos(camYaw);
  /** 画面上の「前」（W）= カメラが見ている方向 */
  const forwardX = sinY;
  const forwardZ = cosY;
  const rightX = cosY;
  const rightZ = -sinY;
  const mx = inputX * rightX + inputZ * forwardX;
  const my = inputX * rightZ + inputZ * forwardZ;
  const len = Math.hypot(mx, my);
  if (len < 1e-6) return { mx: 0, my: 0, facing: null };
  return { mx: mx / len, my: my / len, facing: Math.atan2(mx / len, my / len) };
}

export default function MoeFieldMap({ onBack, onEnemyDefeat, worldMode = "2d" }) {
  const is3d = worldMode === "3d";
  const initial3dSpawn = is3d
    ? (() => {
        const start = moe3dDefaultPlayerSpawn(MOE_3D_HALF_W, MOE_3D_HALF_D);
        return { player: start, pet: moe3dPetStartNearPlayer(start) };
      })()
    : null;
  const [map3dReady, setMap3dReady] = useState(false);
  const map3dReadyRef = useRef(false);
  /** 3D: ペット初期位置が確定するまで追従移動を止める */
  const pet3dSpawnSyncedRef = useRef(is3d);
  /** 3D Canvas: 走行アニメ判定のリセット用 */
  const petSpawnEpochRef = useRef(is3d ? 1 : 0);
  const cameraYawRef = useRef(0);
  const lastMinimap3dSyncRef = useRef(0);
  const fieldBgmMapSlotRef = useRef(null);
  const lastFieldBgmSyncRef = useRef(0);
  const [minimap3d, setMinimap3d] = useState({ x: 0, y: 0, yaw: 0 });
  const playerFacingRef = useRef(0);
  const [view, setView] = useState({ w: 1200, h: 800 });
  const mapW = view.w * 2;
  const mapH = view.h * 6;

  const [world, setWorld] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [player, setPlayer] = useState(
    () => initial3dSpawn?.player ?? { x: 100, y: 100 }
  );
  const [toast, setToast] = useState(null);
  const [skillToast, setSkillToast] = useState(null);
  /** 3D：左クリックで選択した敵（攻撃はコマンドボタン） */
  const [targetEnemyId, setTargetEnemyId] = useState(null);
  const [petFocused, setPetFocused] = useState(false);
  const [showPetStatusOverlay, setShowPetStatusOverlay] = useState(false);
  const [petMasterDialogue, setPetMasterDialogue] = useState(null);
  const [expVendorOpen, setExpVendorOpen] = useState(false);
  const [expVendorView, setExpVendorView] = useState("lines");
  const [expVendorLineIndex, setExpVendorLineIndex] = useState(0);
  const [rhodaOpen, setRhodaOpen] = useState(false);
  const [rhodaView, setRhodaView] = useState("lines");
  const [rhodaLineIndex, setRhodaLineIndex] = useState(0);
  /** @type {[null | { slotIndex: number }, Function]} */
  const [phoenixRebirthFlow, setPhoenixRebirthFlow] = useState(null);
  const [dragonFormFlow, setDragonFormFlow] = useState(false);
  const [josephOpen, setJosephOpen] = useState(false);
  const [josephView, setJosephView] = useState("lines");
  const [josephLineIndex, setJosephLineIndex] = useState(0);
  const [josephResultMessage, setJosephResultMessage] = useState(null);
  const [josephUseTimeTablet, setJosephUseTimeTablet] = useState(false);
  const [josephSacrificePetId, setJosephSacrificePetId] = useState(null);
  const [josephCrystallizedPetIds, setJosephCrystallizedPetIds] = useState([]);
  const [josephSynthOpen, setJosephSynthOpen] = useState(false);
  const [josephSynthView, setJosephSynthView] = useState("lines");
  const [josephSynthLineIndex, setJosephSynthLineIndex] = useState(0);
  const [josephSynthTrialPetLevel, setJosephSynthTrialPetLevel] = useState(100);
  const [josephSynthLastCrystal, setJosephSynthLastCrystal] = useState(null);
  const [josephSynthResultMessage, setJosephSynthResultMessage] = useState(null);
  const [nearPetHouse, setNearPetHouse] = useState(false);
  const nearPetHouseRef = useRef(false);
  const [nearRhoda, setNearRhoda] = useState(false);
  const nearRhodaRef = useRef(false);
  const [cashShopOpen, setCashShopOpen] = useState(false);
  const [cashShopView, setCashShopView] = useState("lines");
  const [cashShopLineIndex, setCashShopLineIndex] = useState(0);
  const [nearCashShop, setNearCashShop] = useState(false);
  const nearCashShopRef = useRef(false);
  const [nearAltar, setNearAltar] = useState(null);
  const nearAltarRef = useRef(null);
  const skillChantRef = useRef(null);
  const cancelSkillChantRef = useRef(() => {});
  const [skillChant, setSkillChant] = useState(null);
  const [skillChantRemainSec, setSkillChantRemainSec] = useState(null);
  const [itemBoxSelectedIndex, setItemBoxSelectedIndex] = useState(null);
  const [altarOpen, setAltarOpen] = useState(false);
  const [activeAltar, setActiveAltar] = useState(null);
  const [trainingGuideOpen, setTrainingGuideOpen] = useState(false);
  const [trainingGuideInHouse, setTrainingGuideInHouse] = useState(false);
  const trainingGuideInHouseRef = useRef(false);
  const [nearTrainingGuideHouse, setNearTrainingGuideHouse] = useState(false);
  const nearTrainingGuideHouseRef = useRef(false);
  const [nearAgeHubHouse, setNearAgeHubHouse] = useState(false);
  const nearAgeHubHouseRef = useRef(false);
  const initialSpawnAppliedRef = useRef(false);
  const petDebugSnapshotRef = useRef(null);
  const [hasPetDebugSnapshot, setHasPetDebugSnapshot] = useState(false);
  const [showFieldGuide, setShowFieldGuide] = useState(false);
  const [showEventGuide, setShowEventGuide] = useState(false);
  const [showDragonLineup, setShowDragonLineup] = useState(false);
  const [showMonsterLineup, setShowMonsterLineup] = useState(false);
  const [hiddenMonsterShowcaseIds, setHiddenMonsterShowcaseIds] = useState(
    () => loadHiddenShowcaseIds("monster")
  );
  const [hiddenDragonShowcaseIds, setHiddenDragonShowcaseIds] = useState(
    () => loadHiddenShowcaseIds("dragon")
  );
  const [monsterDeleteListIds, setMonsterDeleteListIds] = useState([]);
  const [dragonDeleteListIds, setDragonDeleteListIds] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [petSkillMode, setPetSkillMode] = useState(MOE_PET_SKILL_MODE_ALL);
  const [externalSaveFolderLabel, setExternalSaveFolderLabel] = useState(null);
  const [externalSaveFolderActionMsg, setExternalSaveFolderActionMsg] =
    useState(null);
  const [saveDirPickerSupported, setSaveDirPickerSupported] = useState(false);
  /** 3D：follow | wait | sit | auto */
  const [petCommandMode, setPetCommandMode] = useState("follow");
  const [enemyStatSearchOpen, setEnemyStatSearchOpen] = useState(false);
  /** ワールド座標上のダメージ（赤）・ペットEXP（黄・+N） */
  const [battlePopups, setBattlePopups] = useState([]);
  const battlePopupIdRef = useRef(0);
  const externalSaveImportInputRef = useRef(null);
  /** 3D：フィールドに落ちた宝（オーク等） */
  const [fieldTreasures, setFieldTreasures] = useState([]);
  const fieldTreasureIdRef = useRef(1);
  /** @type {[null | { slotIndex: number, view: 'pick_pet' | 'confirm', targetPetId?: string }, Function]} */
  const [powderUseFlow, setPowderUseFlow] = useState(null);
  const [playerSkillUnlocks, setPlayerSkillUnlocks] = useState(
    () => new Set()
  );
  const [playerSkillSlotOrder, setPlayerSkillSlotOrder] = useState(
    () => loadPlayerSkillSlotOrder()
  );
  const playerSkillUnlocksRef = useRef(playerSkillUnlocks);
  const [gustavResetPromptOpen, setGustavResetPromptOpen] = useState(false);
  const pendingGustavDuelIdRef = useRef(null);
  /** ペットLvアップだけ大きく長めに表示（通常トーストに埋もれないようにする） */
  const [petLevelUpFlash, setPetLevelUpFlash] = useState(null);
  const [skill2LevelUpFlash, setSkill2LevelUpFlash] = useState(null);
  const skill2LevelUpTimerRef = useRef(null);
  /** 経験値パウダー・キューブ使用時の一気Lvアップ（クリックで次ページ） */
  /** @type {[{ pages: string[], index: number, tone?: 'up' | 'down' } | null]} */
  const [expConsumableLevelUpFlow, setExpConsumableLevelUpFlow] = useState(null);
  const [petTenthCelebrationActive, setPetTenthCelebrationActive] = useState(false);
  const [trainerStatus, setTrainerStatus] = useState(() => ({
    ...DEFAULT_GAME_STATUS,
  }));
  const [playerPreSkillProgress, setPlayerPreSkillProgress] = useState(() =>
    loadPlayerPreSkillProgress()
  );
  const [playerSkill2Progress, setPlayerSkill2Progress] = useState(() =>
    migratePlayerSkill2ProgressFromPreSkills(loadPlayerPreSkillProgress())
  );
  const playerSkill2ProgressRef = useRef(playerSkill2Progress);
  const playerPreSkillProgressRef = useRef(playerPreSkillProgress);
  const [playerVitals, setPlayerVitals] = useState(() =>
    defaultMoePlayerVitals(1)
  );
  const playerVitalsRef = useRef(playerVitals);
  const fieldVitalsBootstrappedRef = useRef(false);
  /** ヒーリング / ヒーリングオールのクールダウン終了時刻（ms） */
  const healCdUntilRef = useRef({ healing: 0, healAll: 0 });
  const [healCdSec, setHealCdSec] = useState({ healing: 0, healAll: 0 });

  // Pet State（SSR/初回HTMLはデフォルト → クライアントマウント後に localStorage 復元）
  const [pet, setPet] = useState(() => getDefaultPetForId("sun_spirit"));
  const [moePetHydrated, setMoePetHydrated] = useState(false);

  useEffect(() => {
    if (!moePetHydrated) return;
    const snap = loadMoePetDebugSnapshot(pet.id);
    if (snap) {
      petDebugSnapshotRef.current = snap;
      setHasPetDebugSnapshot(true);
    }
  }, [moePetHydrated, pet.id]);

  useEffect(() => {
    setPetSkillMode(loadMoePetSkillMode());
  }, []);

  useEffect(() => {
    if (!moePetHydrated) return;
    const onPageHide = () => {
      flushPersistActivePet(petStateRef.current);
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [moePetHydrated]);

  const petTotalExp = resolvePetTotalExp(pet);
  const petLevelDisplay =
    getMoePetFractionalLevelFromTotalExp(petTotalExp).displayLabel;
  const petCombatLevel = getMoePetLevelFromTotalExp(petTotalExp);

  const keysRef = useRef(createEmptyInputKeys());
  const enemyIdRef = useRef(0);
  const playerPosRef = useRef(initial3dSpawn?.player ?? { x: 100, y: 100 });
  /** 3D: ジャンプの高さオフセットと上向き速度 */
  const playerJumpRef = useRef({ offset: 0, vy: 0 });
  /** 3D: Shift 押下中かつ移動入力あり */
  const playerSprintRef = useRef(false);
  /** 3D: ペットに RUN アニメを出す（走行追従中） */
  const petRunAnimRef = useRef(false);
  const petPosRef = useRef(initial3dSpawn?.pet ?? { x: 100, y: 100 });

  const snapPet3dNearPlayer = useCallback((halfW, halfD, playerPos = null) => {
    const hw = halfW ?? MOE_3D_HALF_W;
    const hd = halfD ?? MOE_3D_HALF_D;
    const start = playerPos ?? moe3dPlayerStartPosition(hw, hd);
    const playerAt = moe3dClampToPlayBounds(start.x, start.y, { halfW: hw, halfD: hd }, 1.5);
    const petAt = moe3dPetStartNearPlayer(playerAt);
    petPosRef.current = petAt;
    pet3dSpawnSyncedRef.current = true;
    petSpawnEpochRef.current += 1;
    return { playerAt, petAt };
  }, []);

  useEffect(() => {
    const loaded = moeEnsureTrainingGuideHpBonus(
      fullHealMoePetFieldState(loadInitialMoePetFromStorage())
    );
    if (is3d) {
      snapPet3dNearPlayer(MOE_3D_HALF_W, MOE_3D_HALF_D);
      const petAt = petPosRef.current;
      loaded.x = petAt.x;
      loaded.y = petAt.y;
    }
    petRef.current = loaded;
    petStateRef.current = loaded;
    setPet(loaded);
    setJosephCrystallizedPetIds(loadJosephCrystallizedPetIds());
    setPlayerPreSkillProgress(loadPlayerPreSkillProgress());
    setMoePetHydrated(true);
  }, [is3d, snapPet3dNearPlayer]);

  const petStateRef = useRef(pet);
  useEffect(() => {
    petStateRef.current = pet;
    if (world && !world.mode3d) {
      petPosRef.current = { x: pet.x, y: pet.y };
    }
  }, [pet, world]);
  const petCommandRef = useRef("follow");
  const waitAnchorRef = useRef(null);
  /** 3D：待て/座れ中に固定する向き（プレイヤー追従回転を止める） */
  const petHoldYawRef = useRef(null);
  const autoAttackCooldownRef = useRef(0);
  const sitRegenAccRef = useRef(0);
  const [regenActive, setRegenActive] = useState(false);
  const regenActiveRef = useRef(false);
  const [bananaMilkActive, setBananaMilkActive] = useState(false);
  const bananaMilkActiveRef = useRef(false);
  const playerCondenseMindRef = useRef(null);
  const playerJirikiSeiranRef = useRef(null);
  const [condenseMindActive, setCondenseMindActive] = useState(false);
  const [jirikiSeiranActive, setJirikiSeiranActive] = useState(false);
  const [allyTarget, setAllyTarget] = useState(() => loadMoeAllyTarget());
  const allyTargetRef = useRef(allyTarget);
  const regenAccRef = useRef(0);
  const playerNaturalRegenAccRef = useRef(0);
  /** プレイヤー詠唱 — 安眠導歩 / 睡眠絶崩のペットリジェネ */
  const phoenixAnsleepRegenRef = useRef(null);
  const phoenixUltimateRegenRef = useRef(null);
  /** アトルーム — 温故知新（魔力buff期限 ms） */
  const atrumMagicBuffUntilRef = useRef(0);
  /** アトルーム — マナ増幅法 MP回復 */
  const atrumMpRegenRef = useRef(null);
  const [phoenixHabitAtk2x, setPhoenixHabitAtk2x] = useState(false);
  const phoenixHabitAtk2xRef = useRef(false);
  /** 3D: プレイヤー召喚スキル VFX（seq で再発火） */
  const playerSummonFxRef = useRef({ current: null });
  /** 3D：リジェネ回復ポップ（React state を介さず毎フレーム描画） */
  const worldHealPopupsRef = useRef([]);
  const worldSkillExpPopupsRef = useRef([]);
  /** 3D: world → screen 投影（MoeField3DCanvas が毎フレーム更新） */
  const overlayProjectRef = useRef(null);
  /** 3D: 戦闘距離計算用（ペット・敵モデルの正面オフセット実測） */
  const moe3dCombatExtentsRef = useRef({ pet: null, enemies: {} });
  const targetEnemyIdRef = useRef(null);
  /** 3D: ターゲット敵の向き（敵ステサーチの索敵判定用） */
  const targetEnemyFacingYawRef = useRef(0);
  /** 3D: 敵追跡ランタイム id → { aggro, x, y, facingYaw, spawnX, spawnY } */
  const enemyChaseRuntimeRef = useRef({});
  /** 3D canvas が毎フレーム書く敵の実座標・待機向き（索敵と追跡の一致用） */
  const enemyFieldSyncRef = useRef({});
  const enemyDetectionOptsRef = useRef({
    playerMoving: false,
    soundMult: 1,
    stealthFull: false,
  });
  const lastChaseUiSyncRef = useRef(0);
  const lastTargetChaseAggroRef = useRef(false);
  const [targetEnemyChaseAggro, setTargetEnemyChaseAggro] = useState(false);
  const scheduleTargetEnemyIdRef = useRef((id) => {
    targetEnemyIdRef.current = id;
    startTransition(() => setTargetEnemyId(id));
  });
  const startDuelWithEnemyRef = useRef(() => {});
  /** 3D: ペット攻撃アニメを再生する期限（performance.now） */
  const petStrikeUntilRef = useRef(0);
  const petAttackMsRef = useRef(MOE_SNAKE_ATTACK_MS);
  /** 3D: 敵攻撃アニメを再生する期限 */
  const enemyStrikeUntilRef = useRef(0);
  const enemyAttackMsRef = useRef(MOE_SNAKE_ATTACK_MS);
  /** 3D: 敵攻撃 weak/strong（applyEnemyStrike → MoeField3DCanvas で共有） */
  const enemyStrikeSeqRef = useRef(0);
  const enemyStrikeVariantRef = useRef({ enemyId: null, variant: "weak" });
  const petRef = useRef(pet);
  const duelRef = useRef(null);
  /** 接近完了→simultaneous_charge への遷移を1回だけ（毎フレーム queueMicrotask すると撃破後に戦闘が復活する） */
  const approachChargeScheduledRef = useRef(false);
  /** 交戦中スキル連撃の未実行タイマーを打ち切る（太陽・カルゴーシュ等） */
  const moeSkillComboGenRef = useRef(0);
  /** デュエル tick の世代。クリーンアップ・StrictMode 二重マウントで古い rAF が戦闘処理を重ねないようにする */
  const duelCombatSessionRef = useRef(0);

  /** 接近 → 両バー同時チャージ → 満タンごとにその側が即攻撃（速い側は複数回可） */
  const [duel, setDuel] = useState(null);
  const [battleSpeed2x, setBattleSpeed2x] = useState(false);
  const battleSpeedMultRef = useRef(1);
  const [dashBoost3x, setDashBoost3x] = useState(false);
  const dashBoost3xRef = useRef(false);
  const [shinobiashiOn, setShinobiashiOn] = useState(false);
  const shinobiashiOnRef = useRef(false);
  const kakureminoUntilRef = useRef(0);
  const kakureminoCooldownUntilRef = useRef(0);
  const [kakureminoActive, setKakureminoActive] = useState(false);
  const [kakureminoRemainSec, setKakureminoRemainSec] = useState(0);
  const [kakureminoCooldownSec, setKakureminoCooldownSec] = useState(0);
  const [buffUiNow, setBuffUiNow] = useState(() => Date.now());
  useEffect(() => {
    battleSpeedMultRef.current = battleSpeed2x ? MOE_BATTLE_SPEED_FAST_MULT : 1;
  }, [battleSpeed2x]);
  useEffect(() => {
    dashBoost3xRef.current = dashBoost3x;
  }, [dashBoost3x]);
  useEffect(() => {
    shinobiashiOnRef.current = shinobiashiOn;
  }, [shinobiashiOn]);
  const sprintSpeedMult3d = useCallback((sprinting) => {
    if (!sprinting) return 1;
    return (
      SPRINT_MULTIPLIER_3D *
      (dashBoost3xRef.current ? SPRINT_BOOST_MULT_3D : 1)
    );
  }, []);
  const scaleBattleMs = useCallback(
    (ms) => ms / battleSpeedMultRef.current,
    []
  );
  const endActiveDuel = useCallback(() => {
    const endedId = duelRef.current?.enemyId;
    if (endedId != null) {
      clearMoeEnemyChaseRuntime(endedId, enemyChaseRuntimeRef.current);
    }
    approachChargeScheduledRef.current = false;
    duelCombatSessionRef.current += 1;
    moeSkillComboGenRef.current += 1;
    petStrikeUntilRef.current = 0;
    enemyStrikeUntilRef.current = 0;
    petRunAnimRef.current = false;
    if (worldRef.current?.mode3d) {
      petSpawnEpochRef.current += 1;
    }
    enemyStrikeSeqRef.current = 0;
    enemyStrikeVariantRef.current = { enemyId: null, variant: "weak" };
    duelRef.current = null;
    setDuel(null);
    phoenixHabitAtk2xRef.current = false;
    setPhoenixHabitAtk2x(false);
    flushPersistActivePet(petStateRef.current);
  }, []);

  useEffect(() => {
    setPlayerSkillUnlocks(loadPlayerSkillUnlocks());
  }, []);
  useEffect(() => {
    playerSkillUnlocksRef.current = playerSkillUnlocks;
  }, [playerSkillUnlocks]);
  useEffect(() => {
    playerSkill2ProgressRef.current = playerSkill2Progress;
  }, [playerSkill2Progress]);
  useEffect(() => {
    playerPreSkillProgressRef.current = playerPreSkillProgress;
  }, [playerPreSkillProgress]);

  useEffect(() => {
    petRef.current = pet;
  }, [pet]);

  useEffect(() => {
    duelRef.current = duel;
  }, [duel]);

  useEffect(() => {
    if (!is3d) return;
    requestMoeFieldCombatBgm(duel != null || targetEnemyChaseAggro);
  }, [is3d, duel, targetEnemyChaseAggro]);

  const worldRef = useRef(null);
  /** ペットEXPポップの基準位置（右上パネル「ペットEXP」周り） */
  const petTenthCelebrationRef = useRef(null);
  const petExpUiAnchorRef = useRef(null);
  const integerLevelFlashTimerRef = useRef(null);
  const enemiesRef = useRef(enemies);
  useEffect(() => {
    worldRef.current = world;
  }, [world]);
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);
  useEffect(() => {
    clearHolyRecordWorldStones();
  }, []);
  useEffect(() => {
    map3dReadyRef.current = map3dReady;
  }, [map3dReady]);

  useEffect(() => {
    targetEnemyIdRef.current = targetEnemyId;
  }, [targetEnemyId]);
  useEffect(() => {
    petCommandRef.current = petCommandMode;
  }, [petCommandMode]);

  useEffect(() => {
    regenActiveRef.current = regenActive;
    if (!regenActive) regenAccRef.current = 0;
  }, [regenActive]);

  useEffect(() => {
    bananaMilkActiveRef.current = bananaMilkActive;
  }, [bananaMilkActive]);

  const pushWorldDamagePopup = useCallback(
    (
      worldX,
      worldY,
      value,
      fromEnemy,
      skipPetDamageDedupe = false,
      stackIndex = null,
      enemyId = null
    ) => {
    if (!fromEnemy && !skipPetDamageDedupe) {
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const qx = Math.round(worldX / 12);
      const qy = Math.round(worldY / 12);
      const L = lastPetDamagePopupRef.current;
      if (
        L.v === value &&
        L.qx === qx &&
        L.qy === qy &&
        now - L.t < 180
      ) {
        return;
      }
      lastPetDamagePopupRef.current = { t: now, v: value, qx, qy };
      } else if (!fromEnemy && skipPetDamageDedupe) {
        lastPetDamagePopupRef.current = { t: 0, v: -1, qx: 0, qy: 0 };
    }
    const id = ++battlePopupIdRef.current;
    const comboStack = stackIndex != null;
    const comboMotion = comboStack ? rollMoeComboPopupMotion() : null;
    const jitterX = comboStack ? 0 : (Math.random() - 0.5) * 18;
    const jitterY = comboStack ? 0 : (Math.random() - 0.5) * 10;
    setBattlePopups((prev) => [
      ...prev,
      {
        id,
        space: "world",
        x: worldX + jitterX,
        y: worldY + jitterY,
        type: "damage",
        value,
        fromEnemy,
        stackIndex: comboStack ? stackIndex : null,
        enemyId: comboStack ? enemyId : null,
        ...(comboMotion ?? {}),
        },
      ]);
      window.setTimeout(() => {
        setBattlePopups((prev) => prev.filter((p) => p.id !== id));
      }, comboStack ? MOE_COMBO_POPUP_MS : 2100);
    },
    []
  );

  /** ワールド座標：水色 +HP（リジェネ等） */
  const pushWorldHealPopup = useCallback((worldX, worldY, hpAmount) => {
    const label = formatRegenHealPopupAmount(hpAmount);
    if (label == null) return;
    const id = ++battlePopupIdRef.current;
    const is3dMode = worldRef.current?.mode3d;
    const jitterX = is3dMode ? 0 : (Math.random() - 0.5) * 12;
    const jitterY = is3dMode ? 0 : (Math.random() - 0.5) * 8;
    const x = worldX + jitterX;
    const y = worldY + jitterY;
    const born =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    if (worldRef.current?.mode3d) {
      const live = worldHealPopupsRef.current.filter(
        (p) => born - p.born < 2200
      );
      worldHealPopupsRef.current = [
        ...live,
        { id, label, born, x, y },
      ];
      return;
    }
    setBattlePopups((prev) => [
      ...prev,
      {
        id,
        space: "world",
        x,
        y,
        type: "heal",
        value: label,
      },
    ]);
    window.setTimeout(() => {
      setBattlePopups((prev) => prev.filter((p) => p.id !== id));
    }, 2100);
  }, []);

  /** ワールド座標：技② EXP / Lvアップ（プレイヤー付近） */
  const triggerSkill2LevelUpFlash = useCallback((level) => {
    if (level == null) return;
    if (skill2LevelUpTimerRef.current) {
      window.clearTimeout(skill2LevelUpTimerRef.current);
    }
    setSkill2LevelUpFlash(level);
    playSfx("levelUp");
    skill2LevelUpTimerRef.current = window.setTimeout(() => {
      setSkill2LevelUpFlash(null);
      skill2LevelUpTimerRef.current = null;
    }, 1400);
  }, []);

  const pushWorldSkillExpPopup = useCallback((award) => {
    if (!award?.gained) return;
    const pos = playerPosRef.current;
    const id = ++battlePopupIdRef.current;
    const born =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const expLabel = `+${award.amount.toFixed(1)}`;
    if (worldRef.current?.mode3d) {
      const live = worldSkillExpPopupsRef.current.filter(
        (p) => born - p.born < 2200
      );
      worldSkillExpPopupsRef.current = [
        ...live,
        {
          id,
          born,
          x: pos.x,
          y: pos.y,
          label: expLabel,
        },
      ];
      return;
    }
    setBattlePopups((prev) => [
      ...prev,
      {
        id,
        space: "world",
        x: pos.x,
        y: pos.y,
        type: "skill_exp",
        value: expLabel,
      },
    ]);
    window.setTimeout(() => {
      setBattlePopups((prev) => prev.filter((p) => p.id !== id));
    }, 2200);
  }, []);

  /** 画面座標：右上ペットEXPラベル・バー付近から +N が浮かぶ。fromPetHit: ペット攻撃ヒット時 true、敵反撃ヒット時 false */
  const pushPetExpPopup = useCallback((value, fromPetHit) => {
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const ref = fromPetHit
      ? lastPetExpPopupFromPetHitRef
      : lastPetExpPopupFromEnemyHitRef;
    const L = ref.current;
    if (L.v === value && now - L.t < 220) {
      return;
    }
    ref.current = { t: now, v: value };
    const id = ++battlePopupIdRef.current;
    let x = typeof window !== "undefined" ? window.innerWidth - 96 : 0;
    let y = 140;
    const el = petExpUiAnchorRef.current;
    if (typeof window !== "undefined" && el) {
      const r = el.getBoundingClientRect();
      x = r.left + r.width * 0.5 + (Math.random() - 0.5) * 14;
      y = r.top + r.height * 0.42 + (Math.random() - 0.5) * 10;
    }
    setBattlePopups((prev) => [
      ...prev,
      { id, space: "screen", x, y, type: "exp", value },
    ]);
    window.setTimeout(() => {
      setBattlePopups((prev) => prev.filter((p) => p.id !== id));
    }, 2100);
  }, []);

  const pushTenthLevelBanner = useCallback((wx, wy, text) => {
    const id = ++battlePopupIdRef.current;
    const spawnedAt =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    setBattlePopups((prev) => [
      ...prev,
      {
        id,
        space: "world",
        x: wx,
        y: wy,
        type: "tenthBanner",
        value: text,
        createdAt: spawnedAt,
      },
    ]);
    window.setTimeout(() => {
      setBattlePopups((prev) => prev.filter((p) => p.id !== id));
    }, worldRef.current?.mode3d ? MOE_TENTH_BANNER_MS_3D : MOE_TENTH_BANNER_MS_2D);
  }, []);

  const pushTenthLevelSparkles = useCallback((wx, wy) => {
    const sparks = ["✨", "♪", "★", "💛", "✨"];
    const base = Date.now();
    setBattlePopups((prev) => [
      ...prev,
      ...sparks.map((value, i) => ({
        id: `tenth-${base}-${i}`,
        space: "world",
        x: wx + (Math.random() - 0.5) * (worldRef.current?.mode3d ? 2.2 : 36),
        y: wy + (Math.random() - 0.5) * (worldRef.current?.mode3d ? 2.2 : 36),
        type: "tenth",
        value,
      })),
    ]);
    window.setTimeout(() => {
      setBattlePopups((prev) =>
        prev.filter((p) => !String(p.id).startsWith(`tenth-${base}-`))
      );
    }, 2400);
  }, []);

  const openExpConsumableLevelUpFlow = useCallback((messages, tone = "up") => {
    const pages = buildExpConsumableAdjustPages(messages);
    if (!pages.length) return;
    setExpConsumableLevelUpFlow({ pages, index: 0, tone });
    playSfx(tone === "down" ? "enemyHit" : "levelUp");
  }, []);

  const advanceExpConsumableLevelUp = useCallback(() => {
    setExpConsumableLevelUpFlow((flow) => {
      if (!flow) return null;
      const nextIndex = flow.index + 1;
      if (nextIndex < flow.pages.length) {
        playSfx(flow.tone === "down" ? "enemyHit" : "levelUp");
        return { ...flow, index: nextIndex };
      }
      return null;
    });
  }, []);

  const triggerPetTenthLevelUpCelebration = useCallback(
    (messages = [MOE_PET_TENTH_LEVEL_UP_LABEL]) => {
      const world = worldRef.current;
      const pp = playerPosRef.current;
      const petp = petPosRef.current;
      petTenthCelebrationRef.current = createPetTenthCelebrationState(
        pp,
        petp,
        world
      );
      setPetTenthCelebrationActive(true);
      if (!world?.mode3d) {
        pushTenthLevelSparkles(petp.x, petp.y);
      }

      const tenthMsgs = messages.filter(isMoePetTenthLevelUpMessage);
      const intMsgs = messages.filter((m) => !isMoePetTenthLevelUpMessage(m));
      if (integerLevelFlashTimerRef.current) {
        window.clearTimeout(integerLevelFlashTimerRef.current);
        integerLevelFlashTimerRef.current = null;
      }
      if (tenthMsgs.length) {
        pushTenthLevelBanner(
          petp.x,
          petp.y,
          formatMoePetTenthLevelBanner(tenthMsgs.length)
        );
        playSfx("levelUp");
      }
      if (intMsgs.length) {
        integerLevelFlashTimerRef.current = window.setTimeout(() => {
          setPetLevelUpFlash(formatPetLevelUpFlashText(messages));
          playSfx("levelUp");
          integerLevelFlashTimerRef.current = null;
        }, tenthMsgs.length ? 1100 : 0);
      }
    },
    [pushTenthLevelBanner, pushTenthLevelSparkles]
  );

  const previewPetTenthLevelUpEffect = useCallback(() => {
    triggerPetTenthLevelUpCelebration([MOE_PET_TENTH_LEVEL_UP_LABEL]);
  }, [triggerPetTenthLevelUpCelebration]);

  /** ペット攻撃・敵攻撃のどちらかの直後（MOE系・約55%・Wiki表ベース） */
  const rollPetExpOnHit = React.useCallback((petBefore, enemyLevel) => {
    const totalBefore = resolvePetTotalExp(petBefore);
    const combatLevel = getMoePetLevelFromTotalExp(totalBefore);
    const expBase = getMoePetExpBaseOnHitSuccess(combatLevel, enemyLevel);
    const petExpRoll = Math.random() < MOE_PET_ATTACK_EXP_SUCCESS_RATE;
    let petAfter = { ...petBefore };
    let petExpGained = null;
    let levelUpMessages = null;
    if (petExpRoll && expBase > 0 && combatLevel < MOE_PET_MAX_LEVEL) {
      const r = applyMoePetExpGain(petAfter, expBase, calculatePetStats);
      petAfter = r.pet;
      if (r.gained > 0) {
        petExpGained = r.gained;
        if (r.tenthLeveled || r.leveled) {
          levelUpMessages = r.messages;
        }
      }
    }
    return { petAfter, petExpGained, levelUpMessages };
  }, []);

  const commitPetExpFromHit = useCallback(
    (petAfter, levelUpMessages = null) => {
      const totalExp = Math.max(0, Math.floor(Number(petAfter.totalExp) || 0));
      const prevTotal = resolvePetTotalExp(petRef.current);
      if (totalExp <= prevTotal) return;
      const level = getMoePetLevelFromTotalExp(totalExp);
      const levelDisplay =
        getMoePetFractionalLevelFromTotalExp(totalExp).displayLabel;
      const expIntoLevel = getMoePetExpIntoLevelFromTotal(totalExp, level);
      const leveledInteger =
        getMoePetLevelFromTotalExp(totalExp) >
        getMoePetLevelFromTotalExp(prevTotal);
      const next = moeEnsureTrainingGuideHpBonus({
        ...petAfter,
        totalExp,
        level,
        levelDisplay,
        expIntoLevel,
      });
      const hp = leveledInteger
        ? next.hp
        : Math.min(next.hpMax, petAfter.hp ?? next.hp);
      const synced = { ...next, hp };
      petRef.current = synced;
      petStateRef.current = synced;
      setPet((prev) => ({
        ...prev,
        totalExp,
        level,
        levelDisplay,
        expIntoLevel,
        hp: synced.hp,
        mp: synced.mp,
        hpMax: synced.hpMax,
        mpMax: synced.mpMax,
        trainingGuideHpBonus: synced.trainingGuideHpBonus,
        x: prev.x,
        y: prev.y,
      }));
      flushPersistActivePet(synced);
      if (levelUpMessages?.length) {
        queueMicrotask(() => {
          triggerPetTenthLevelUpCelebration(levelUpMessages);
        });
      }
    },
    [triggerPetTenthLevelUpCelebration]
  );

  /**
   * ペットの1ヒット分（通常アタック・連撃スキル共通）
   * @param opts.grantExp コンボ中は最終ヒットだけ true 推奨
   * @param opts.skipPetDamageDedupe 同一ダメージ連打をデデュープしない（8連表示用）
   * @param opts.stackIndex 連撃スキル時の縦積み位置（0=下）
   * @param opts.clearToastWhenNoDefeatMsg false のとき、撃破以外でトーストを消さない（コンボ途中）
   * @param opts.attackScale 指定時は (攻撃力×係数) でダメージ式（通常アタック相当の減衰）
   * @param opts.magicScale 指定時は (魔力×係数) でダメージ式（attackScale より優先）
   * @param opts.fixedDamage 指定時は固定ダメージ（防御無視）
   */
  const applyPetComboHit = React.useCallback(
    (
      enemyId,
      opts = {}
    ) => {
      const {
        grantExp = true,
        playSound = true,
        skipPetDamageDedupe = false,
        clearToastWhenNoDefeatMsg = true,
        attackScale = null,
        magicScale = null,
        fixedDamage = null,
        stackIndex = null,
      } = opts;
      const w = worldRef.current;
      let defeated = false;
      let abortDuel = false;
      let treasureDropped = false;
      /** @type {null | {
       *   petExpGained: number | null,
       *   petAfter: object,
       *   ex: number, ey: number, damage: number,
       *   skipPetDamageDedupe: boolean, stackIndex: number | null, enemyId: number,
       *   toastBits: string[], clearToastWhenNoDefeatMsg: boolean,
       *   defeated: boolean, enemyLevel: number, enemyKey: string,
       * }} */
      let hitFollowUp = null;
      flushSync(() => {
        setEnemies((prevEn) => {
          const target = prevEn.find((e) => e.id === enemyId);
          if (!target || target.hp <= 0) {
            abortDuel = true;
            approachChargeScheduledRef.current = false;
            duelRef.current = null;
            return prevEn;
          }
          const petNow = petRef.current;
          const stats = calculatePetStats(petNow.id, petNow.level);
          const enemyDef = target.wiki?.defense ?? 0;
          const atkBase = stats?.attack ?? 1;
          const magBase = stats?.magic ?? 0;
          const atkMult = phoenixHabitAtk2xRef.current ? 2 : 1;
          const magicBuffMult = getAtrumMagicBuffMult(atrumMagicBuffUntilRef);
          let damage;
          if (fixedDamage != null) {
            damage = Math.max(1, Math.floor(fixedDamage));
          } else if (magicScale != null) {
            damage = computePetDamageAgainstEnemy(
              magBase * magicBuffMult * magicScale,
              enemyDef
            );
          } else if (attackScale != null) {
            damage = computePetDamageAgainstEnemy(
              atkBase * atkMult * attackScale,
              enemyDef
            );
          } else {
            damage = computePetDamageAgainstEnemy(atkBase * atkMult, enemyDef);
          }
          const newHpAfterHit = target.hp - damage;
          defeated = newHpAfterHit <= 0;

          let petAfter = petNow;
          let petExpGained = null;
          let levelUpMessages = null;
          if (grantExp) {
            const r = rollPetExpOnHit(petNow, target.level);
            petAfter = r.petAfter;
            petExpGained = r.petExpGained;
            levelUpMessages = r.levelUpMessages;
          }

          const ex = target.x;
          const ey = target.y;
          const pt = petPosRef.current;
          let dropX = ex;
          let dropY = ey;
          if (defeated) {
            const drop = moeTreasureDropPositionNearEnemy({ x: ex, y: ey }, pt);
            dropX = drop.x;
            dropY = drop.y;
          }
          const toastBits = [];
          if (defeated) {
            toastBits.push(`${target.name}を倒した！`);
          }

          hitFollowUp = {
            petExpGained,
            petAfter,
            levelUpMessages,
            ex,
            ey,
            dropX,
            dropY,
            damage,
            skipPetDamageDedupe,
            stackIndex,
            enemyId,
            toastBits,
            clearToastWhenNoDefeatMsg,
            defeated,
            enemyLevel: target.level,
            enemyKey: target.key,
          };

          if (defeated) {
            approachChargeScheduledRef.current = false;
            duelRef.current = null;
          }

          return prevEn.map((en) => {
            if (en.id !== enemyId) return en;
            if (defeated && w) {
              if (en.fieldBison) {
                const base =
                  MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
                const pos = w.mode3d
                  ? en.key === MOE_MEERIM_MOUNTAIN_BISON_KEY
                    ? w.mountainBisonPos ??
                      moe3dMountainBisonSpawnPosition(
                        w.halfW ?? w.mw / 2,
                        w.halfD ?? w.mh / 2
                      )
                    : w.roughBisonPos ??
                      moe3dRoughBisonSpawnPosition(
                        w.halfW ?? w.mw / 2,
                        w.halfD ?? w.mh / 2
                      )
                  : en.key === MOE_MEERIM_MOUNTAIN_BISON_KEY
                    ? moe2dMountainBisonSpawnPosition(w.rowLayout, w.mw)
                    : moe2dRoughBisonSpawnPosition(w.rowLayout, w.mw);
                const scaled = moe3dEnemyStatsForZoneLevel(base, base.level);
                return {
                  ...en,
                  x: pos.x,
                  y: pos.y,
                  level: scaled.level,
                  hpMax: scaled.hpMax,
                  hp: scaled.hpMax,
                  petDamage: scaled.petDamage,
                  wiki: scaled.wiki,
                  zoneLevel: base.level,
                };
              }
              if (w.mode3d) {
                const hw = w.halfW ?? w.mw / 2;
                const hd = w.halfD ?? w.mh / 2;
                if (moe3dIsMapSlotFieldEnemy(en)) {
                  const { tileW, tileD } = moe3dEstimatedTileSize(hw, hd);
                  const base =
                    moeMonsterFieldBase(en.key) ??
                    MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ??
                    en;
                  const area = en.spawnArea ?? en.mapSlotId;
                  const fixed =
                    en.midBoss || en.superBoss
                      ? moe3dMonsterFieldSpawnWorld(
                          area,
                          en.key,
                          en.slotInZone ?? 0,
                          tileW,
                          tileD
                        )
                      : null;
                  const pos =
                    fixed ??
                    moe3dPickRespawnInMapSlot(
                      area,
                      tileW,
                      tileD,
                      playerPosRef.current,
                      prevEn,
                      enemyId
                    );
                  const scaled = moe3dEnemyStatsForZoneLevel(base, base.level);
                  return {
                    ...en,
                    x: pos.x,
                    y: pos.y,
                    level: scaled.level,
                    hpMax: scaled.hpMax,
                    hp: scaled.hpMax,
                    petDamage: scaled.petDamage,
                    wiki: scaled.wiki,
                    zoneLevel: base.level,
                  };
                }
              }
              if (
                (en.midBoss || en.superBoss) &&
                !moe3dIsMapSlotFieldEnemy(en)
              ) {
                const base =
                  MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
                const pos = w.mode3d
                  ? en.superBoss
                    ? w.superBossPos ??
                      moe3dSuperBossSpawnPosition(
                        w.halfW ?? w.mw / 2,
                        w.halfD ?? w.mh / 2
                      )
                    : w.midBossPos ??
                      moe3dMidBossSpawnPosition(
                        w.halfW ?? w.mw / 2,
                        w.halfD ?? w.mh / 2
                      )
                  : en.superBoss
                    ? moe2dSuperBossSpawnPosition(w.rowLayout, w.mw)
                    : moe2dMidBossSpawnPosition(w.rowLayout, w.mw);
                const scaled = moe3dEnemyStatsForZoneLevel(base, base.level);
                const hpMult = en.superBoss
                  ? MOE_SUPER_BOSS_HP_MULTIPLIER
                  : MOE_MID_BOSS_HP_MULTIPLIER;
                const hpMax = Math.max(1, Math.round(scaled.hpMax * hpMult));
                return {
                  ...en,
                  x: pos.x,
                  y: pos.y,
                  level: scaled.level,
                  hpMax,
                  hp: hpMax,
                  petDamage: scaled.petDamage,
                  wiki: scaled.wiki,
                  zoneLevel: base.level,
                };
              }
              if (w.mode3d) {
                const hw = w.halfW ?? w.mw / 2;
                const hd = w.halfD ?? w.mh / 2;
                const zoneIndex = en.zoneIndex ?? 0;
                const zoneCount = MOE_3D_ENEMY_ZONES.length;
                const pos = moe3dPickRespawnInZone(
                  zoneIndex,
                  zoneCount,
                  hw,
                  hd,
                  playerPosRef.current,
                  prevEn,
                  enemyId
                );
                const base =
                  MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
                const zoneLevel =
                  en.zoneLevel ??
                  MOE_3D_ENEMY_ZONES[zoneIndex]?.level ??
                  base.level;
                const scaled = moe3dEnemyStatsForZoneLevel(
                  base,
                  zoneLevel
                );
                return {
                  ...en,
                  x: pos.x,
                  y: pos.y,
                  level: scaled.level,
                  hpMax: scaled.hpMax,
                  hp: scaled.hpMax,
                  petDamage: scaled.petDamage,
                  wiki: scaled.wiki,
                  zoneLevel: scaled.zoneLevel,
                };
              }
              const rowLayout = w.rowLayout;
              if (rowLayout?.length) {
                const pos = moe2dPickRespawnInZone2d(
                  en.zoneIndex ?? 0,
                  en.slotInZone ?? 0,
                  rowLayout,
                  w.mw,
                  prevEn,
                  enemyId
                );
                const base =
                  MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
                const zoneLevel =
                  en.zoneLevel ??
                  MOE_3D_ENEMY_ZONES[en.zoneIndex ?? 0]?.level ??
                  base.level;
                const scaled = moe3dEnemyStatsForZoneLevel(base, zoneLevel);
                return {
                  ...en,
                  x: pos.x,
                  y: pos.y,
                  level: scaled.level,
                  hpMax: scaled.hpMax,
                  hp: scaled.hpMax,
                  petDamage: scaled.petDamage,
                  wiki: scaled.wiki,
                  zoneLevel: scaled.zoneLevel,
                };
              }
              const screenH = w.mh / 6;
              const yStart = w.mh - (en.sy + 1) * screenH;
              return {
                ...en,
                hp: en.hpMax,
                x: 100 + Math.random() * (w.mw - 200),
                y: yStart + 50 + Math.random() * (screenH - 100),
              };
            }
            return { ...en, hp: Math.max(0, newHpAfterHit) };
          });
        });
      });
      if (hitFollowUp?.petExpGained != null) {
        flushSync(() =>
          commitPetExpFromHit(
            hitFollowUp.petAfter,
            hitFollowUp.levelUpMessages
          )
        );
      }
      if (
        hitFollowUp?.defeated &&
        is3d &&
        shouldMoeEnemyDropTreasure(hitFollowUp.enemyKey)
      ) {
        const dropId = fieldTreasureIdRef.current++;
        treasureDropped = true;
        setFieldTreasures((prev) => [
          ...prev,
          createMoeFieldTreasureDrop(
            dropId,
            hitFollowUp.dropX,
            hitFollowUp.dropY,
            hitFollowUp.enemyKey,
            {
              playerHasShinsoku:
                playerSkillUnlocksRef.current.has("ninja_shinsoku"),
            }
          ),
        ]);
      }
      if (hitFollowUp) {
        const h = hitFollowUp;
        queueMicrotask(() => {
          pushWorldDamagePopup(
            h.ex,
            h.ey,
            h.damage,
            false,
            h.skipPetDamageDedupe,
            h.stackIndex,
            h.enemyId
          );
          if (h.petExpGained != null) {
            pushPetExpPopup(h.petExpGained, true);
          }
          if (treasureDropped) {
            h.toastBits.push("💎宝が落ちた！");
          }
          if (h.toastBits.length) {
            setToast(h.toastBits.filter(Boolean).join("　"));
          } else if (h.clearToastWhenNoDefeatMsg) {
            setToast(null);
          }
          if (h.defeated) {
            onEnemyDefeat?.(h.enemyLevel);
            setTrainerStatus(loadGameStatus());
          }
        });
      }
      if (abortDuel) {
        endActiveDuel();
        return true;
      }
      if (playSound && !defeated) {
        playSfx("petAttack");
        petStrikeUntilRef.current =
          performance.now() + scaleBattleMs(petAttackMsRef.current);
      }
      if (defeated) {
        window.setTimeout(() => playSfx("enemyDefeated"), 90);
        endActiveDuel();
        return true;
      }
      return false;
    },
    [is3d, onEnemyDefeat, pushPetExpPopup, pushWorldDamagePopup, rollPetExpOnHit, scaleBattleMs, endActiveDuel, commitPetExpFromHit]
  );

  const handleTreasureClick = useCallback((treasureId) => {
    setFieldTreasures((prev) => {
      const t = prev.find((tr) => tr.id === treasureId);
      if (!t) return prev;
      if (t.state === "closed") {
        return prev.map((tr) =>
          tr.id === treasureId
            ? { ...tr, state: "open", openedAt: performance.now() }
            : tr
        );
      }
      return prev;
    });
  }, []);

  const handleTreasureClose = useCallback((treasureId) => {
    setFieldTreasures((prev) =>
      prev.map((tr) =>
        tr.id === treasureId && tr.state === "open"
          ? { ...tr, state: "closed" }
          : tr
      )
    );
  }, []);

  const handleTreasureLootClick = useCallback((treasureId, loot) => {
    if (!loot) return;
    if (loot.unlocksPlayerSkillId) {
      setPlayerSkillUnlocks((prev) => {
        if (prev.has(loot.unlocksPlayerSkillId)) return prev;
        const next = new Set(prev);
        next.add(loot.unlocksPlayerSkillId);
        savePlayerSkillUnlocks(next);
        return next;
      });
      setFieldTreasures((prev) =>
        prev.map((tr) =>
          tr.id === treasureId ? { ...tr, state: "looted" } : tr
        )
      );
      if (loot.unlocksPlayerSkillId === "ninja_shinsoku") {
        setToast("忍者の足袋 — 神速が使えるようになった！");
      } else {
        setToast(`${loot.label} — スキルを習得した！`);
      }
      return;
    }
    const boxItem = moeFieldLootToBoxItem(loot);
    if (!boxItem || !addMoeItemBoxItem(boxItem)) {
      setToast("アイテムボックスに空きがありません");
      return;
    }
    setFieldTreasures((prev) =>
      prev.map((tr) =>
        tr.id === treasureId ? { ...tr, state: "looted" } : tr
      )
    );
    setToast(`${loot.label}を手に入れた！`);
  }, []);

  const closePowderUseFlow = useCallback(() => {
    setPowderUseFlow(null);
  }, []);

  const handleItemBoxUse = useCallback((slotIndex, item) => {
    if (!item) return;
    if (isMoeExpConsumableItemId(item.id)) {
      setPowderUseFlow({ slotIndex, view: "pick_pet", itemId: item.id });
      return;
    }
    if (isMoePhoenixFeatherItemId(item.id)) {
      if (!canRebirthMysteryDragon(petStateRef.current?.id, petStateRef.current?.rebornPhoenix)) {
        setToast("連れ歩きのミステリー ドラゴン（未転生）にだけ使えます");
        return;
      }
      setPhoenixRebirthFlow({ slotIndex });
      return;
    }
    if (isMoeHolyRecordBoxItem(item)) {
      setToast("ホーリーレコードを選択した状態でテレポートを唱えてください");
      return;
    }
    setToast(`${item.label ?? "アイテム"}はまだ使えません`);
  }, []);

  const applyPhoenixRebirth = useCallback(() => {
    if (phoenixRebirthFlow?.slotIndex == null) return;
    const cur = petStateRef.current;
    if (!canRebirthMysteryDragon(cur?.id, cur?.rebornPhoenix)) {
      setToast("ミステリー ドラゴン（未転生）にだけ使えます");
      setPhoenixRebirthFlow(null);
      return;
    }
    const stats = calculatePetStats(cur.id, cur.level);
    const bonus = getMysteryDragonMaxHpBonus(cur.level, true);
    const hpMax = (stats?.hpMax ?? cur.hpMax) + bonus;
    setPet((prev) => {
      const next = {
        ...prev,
        rebornPhoenix: true,
        activeSkillSet: 2,
        phoenixHpBonus: bonus,
        hpMax,
        hp: Math.min(hpMax, prev.hp + bonus),
      };
      petRef.current = next;
      petStateRef.current = next;
      flushPersistActivePet(next);
      return next;
    });
    removeMoeItemBoxSlot(phoenixRebirthFlow.slotIndex);
    setPhoenixRebirthFlow(null);
    setToast(
      "死ぬな、生き返れ！　ミステリー ドラゴンⅡ（フェニックス）へ転生した！"
    );
  }, [phoenixRebirthFlow]);

  const applyMysterySkillSet = useCallback((setNum) => {
    const cur = petStateRef.current;
    if (cur?.id !== "mystery_dragon" || !cur?.rebornPhoenix) return;
    const nextSet = setNum === 2 ? 2 : 1;
    setPet((prev) => {
      const next = { ...prev, activeSkillSet: nextSet };
      petRef.current = next;
      petStateRef.current = next;
      flushPersistActivePet(next);
      return next;
    });
    setToast(
      nextSet === 2
        ? "ミステリー ドラゴンⅡ（フェニックス）へ変化 — 技②"
        : "ミステリー ドラゴンⅠへ変化 — 技①"
    );
  }, []);

  const powderPetMenuActions = useMemo(() => {
    const save = loadMoePetsSave();
    return MOE_PET_IDS.filter((id) => !josephCrystallizedPetIds.includes(id)).map(
      (id) => {
        const slotPet = petFromSaveSlot(id, save.byId[id]);
        const data = MOE_PET_DATA[id];
        return {
          id,
          label: `${data.emoji} ${data.name}  Lv.${slotPet.levelDisplay}`,
        };
      }
    );
  }, [josephCrystallizedPetIds, powderUseFlow?.view]);

  const powderConfirmPrompt = useMemo(() => {
    if (!powderUseFlow?.targetPetId || !powderUseFlow?.itemId) return "";
    const loot = getMoeFieldLootItem(powderUseFlow.itemId);
    const save = loadMoePetsSave();
    const slotPet = petFromSaveSlot(
      powderUseFlow.targetPetId,
      save.byId[powderUseFlow.targetPetId]
    );
    const data = MOE_PET_DATA[powderUseFlow.targetPetId];
    const name = data?.name ?? "ペット";
    const expAmount = loot?.expAmount ?? 1000;
    const itemLabel = loot?.label ?? "経験値アイテム";
    const expSign = expAmount >= 0 ? "+" : "";
    return `${name}（Lv.${slotPet.levelDisplay}）に\n${itemLabel}を使いますか？\n\n${expSign}${expAmount.toLocaleString()} EXP`;
  }, [powderUseFlow?.targetPetId, powderUseFlow?.itemId]);

  const handlePowderPetPick = useCallback((petId) => {
    if (!MOE_PET_DATA[petId] || josephCrystallizedPetIds.includes(petId)) {
      setToast("そのペットには使えません");
      return;
    }
    setPowderUseFlow((prev) =>
      prev ? { ...prev, view: "confirm", targetPetId: petId } : null
    );
  }, [josephCrystallizedPetIds]);

  const applyExpConsumableItem = useCallback(() => {
    if (!powderUseFlow?.targetPetId || powderUseFlow.slotIndex == null) return;
    const loot = getMoeFieldLootItem(powderUseFlow.itemId);
    const expAmount = loot?.expAmount ?? 0;
    if (expAmount === 0) return;
    const targetId = powderUseFlow.targetPetId;
    const save = loadMoePetsSave();
    const slotPet = petFromSaveSlot(targetId, save.byId[targetId]);
    const isLevelDown = expAmount < 0;
    const r = isLevelDown
      ? applyMoePetExpLoss(
          slotPet,
          -expAmount,
          calculatePetStats,
          MOE_SAVED_PET_INITIAL_LEVEL
        )
      : applyMoePetExpGain(slotPet, expAmount, calculatePetStats);
    const delta = isLevelDown ? r.lost : r.gained;
    if (delta <= 0) {
      setToast(
        isLevelDown
          ? "これ以上レベルが下がりません"
          : "これ以上レベルが上がりません"
      );
      return;
    }
    const nextPet = { ...r.pet, x: pet.x, y: pet.y };
    clearMoePetDebugSnapshot(targetId);
    if (targetId === pet.id) {
      petRef.current = nextPet;
      petStateRef.current = nextPet;
      setPet((prev) => ({
        ...nextPet,
        x: prev.x,
        y: prev.y,
      }));
      flushPersistActivePet(nextPet);
    } else {
      persistMoePetSlot(targetId, nextPet);
    }
    removeMoeItemBoxSlot(powderUseFlow.slotIndex);
    setPowderUseFlow(null);
    pushPetExpPopup(isLevelDown ? -delta : delta, false);
    const petName = MOE_PET_DATA[targetId]?.name ?? "ペット";
    const itemLabel = loot?.label ?? "アイテム";
    const leveled = isLevelDown
      ? r.leveledDown || r.tenthLeveledDown
      : r.leveled || r.tenthLeveled;
    if (leveled) {
      setToast(`${petName}に${itemLabel}を使った！`);
      if (targetId === pet.id) {
        queueMicrotask(() =>
          openExpConsumableLevelUpFlow(r.messages, isLevelDown ? "down" : "up")
        );
      }
    } else {
      const sign = isLevelDown ? "-" : "+";
      setToast(
        `${petName}に${itemLabel}を使った！　${sign}${delta.toLocaleString()} EXP`
      );
    }
  }, [
    pet.id,
    pet.x,
    pet.y,
    powderUseFlow,
    pushPetExpPopup,
    openExpConsumableLevelUpFlow,
  ]);

  const handlePowderConfirmMenu = useCallback(
    (actionId) => {
      if (actionId === "use_powder") {
        applyExpConsumableItem();
        return;
      }
      if (actionId === "back_pick") {
        setPowderUseFlow((prev) =>
          prev ? { ...prev, view: "pick_pet", targetPetId: undefined } : null
        );
      }
    },
    [applyExpConsumableItem]
  );

  useEffect(() => {
    if (!showSettings) {
      setExternalSaveFolderActionMsg(null);
      return;
    }
    let cancelled = false;
    setSaveDirPickerSupported(canUseMoeExternalSaveDirectoryPicker());
    const hint = getMoeExternalSaveLocationHint();
    if (hint.folderName) setExternalSaveFolderLabel(hint.folderName);
    resolveMoeExternalSaveFolderLabel().then((label) => {
      if (!cancelled && label) setExternalSaveFolderLabel(label);
    });
    return () => {
      cancelled = true;
    };
  }, [showSettings]);

  const applyExternalSaveFile = useCallback(
    (file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result ?? ""));
          const { pets, itemBox } = importMoeExternalSavePayload(parsed);
          if (itemBox) {
            saveMoeItemBoxSlots(itemBox);
            notifyMoeItemBoxSlotsChanged();
          }
          if (pets) {
            const activeId = pets.activeId ?? pet.id;
            const next = petFromSaveSlot(activeId, pets.byId[activeId]);
            setPet((prev) => {
              const merged = { ...next, x: prev.x, y: prev.y };
              petRef.current = merged;
              petStateRef.current = merged;
              return merged;
            });
            const petName = MOE_PET_DATA[activeId]?.name ?? "ペット";
            setToast(
              `外部保存を読み込んだ（${petName} Lv.${next.levelDisplay}）`
            );
          } else {
            setToast("外部保存を読み込んだ（ペットデータなし）");
          }
          setShowSettings(false);
        } catch {
          setToast("読み込みに失敗した（JSON形式を確認）");
        }
      };
      reader.readAsText(file);
    },
    [pet.id]
  );

  const handleExternalSave = useCallback(async () => {
    flushPersistActivePet(petStateRef.current);
    const payload = buildMoeExternalSavePayload(loadMoeItemBoxSlots());
    const json = JSON.stringify(payload, null, 2);
    const result = await saveMoeExternalSaveJson(json);
    if (result.aborted) return;
    if (!result.ok) {
      setToast("保存に失敗しました");
      return;
    }
    if (result.method === "download") {
      setToast(`新規ファイル「${result.fileName}」をダウンロードフォルダに保存した`);
      if (result.folderName) setExternalSaveFolderLabel(result.folderName);
    } else if (result.folderName) {
      setToast(`新規ファイル「${result.fileName}」を 📁${result.folderName} に保存した`);
      setExternalSaveFolderLabel(result.folderName);
    } else {
      setToast(`新規ファイル「${result.fileName}」に保存した`);
    }
  }, []);

  const handleChangeExternalSaveFolder = useCallback(async () => {
    const hint = getMoeExternalSaveLocationHint();
    const current =
      (await resolveMoeExternalSaveFolderLabel()) ??
      hint.folderName ??
      null;
    if (current) setExternalSaveFolderLabel(current);
    const statusBlock = formatMoeExternalSaveLocationBlock({
      folderName: current,
      fileName: hint.fileName,
    });
    const showFolderActionMsg = (extraLine) => {
      const msg = extraLine ? `${statusBlock}\n${extraLine}` : statusBlock;
      setExternalSaveFolderActionMsg(msg);
      setToast(msg);
    };
    if (!canUseMoeExternalSaveDirectoryPicker()) {
      showFolderActionMsg("このブラウザでは保存フォルダを変更できません");
      return;
    }
    showFolderActionMsg(null);
    const result = await pickMoeExternalSaveDirectory();
    if (result.aborted) return;
    if (!result.ok) {
      showFolderActionMsg("保存フォルダの選択に失敗しました");
      return;
    }
    setExternalSaveFolderLabel(result.folderName);
    const changedBlock = formatMoeExternalSaveLocationBlock({
      folderName: result.folderName,
      fileName: hint.fileName,
    });
    setExternalSaveFolderActionMsg(`${changedBlock}\n保存フォルダを変更しました`);
    setToast(`${formatMoeExternalSavePlaceStatus(result.folderName)} に変更しました`);
  }, []);

  const handleExternalSaveImportPick = useCallback(() => {
    externalSaveImportInputRef.current?.click();
  }, []);

  const handleExternalSaveImport = useCallback(
    (file) => {
      applyExternalSaveFile(file);
    },
    [applyExternalSaveFile]
  );

  const applyPetComboHitRef = useRef(applyPetComboHit);
  applyPetComboHitRef.current = applyPetComboHit;

  const applyPetStrike = React.useCallback(
    (enemyId) => {
      const d = duelRef.current;
      if (!d || d.enemyId !== enemyId || d.phase !== "simultaneous_charge") {
        return false;
      }
      return applyPetComboHit(enemyId);
    },
    [applyPetComboHit]
  );

  /** resolveMoeDuelSkillSequence のヒット列を時間差で実行 */
  const scheduleMoeDuelSkillHits = useCallback((enemyId, sequence) => {
    if (!sequence?.hits?.length) return;
    const gen = ++moeSkillComboGenRef.current;
    sequence.hits.forEach((hit, idx) => {
      const isLast = idx === sequence.hits.length - 1;
      const o = hit.opts;
      window.setTimeout(() => {
        if (gen !== moeSkillComboGenRef.current) return;
        const d = duelRef.current;
        if (!d || d.enemyId !== enemyId) {
          return;
        }
        const live = enemiesRef.current.find((e) => e.id === enemyId);
        if (!live || live.hp <= 0) {
          moeSkillComboGenRef.current += 1;
          return;
        }
        const ended = applyPetComboHitRef.current(enemyId, {
          grantExp: o.grantExp ?? false,
          playSound: o.playSound !== false,
          skipPetDamageDedupe: o.skipPetDamageDedupe ?? true,
          clearToastWhenNoDefeatMsg:
            o.clearToastWhenNoDefeatMsg ?? isLast,
          attackScale: o.attackScale ?? null,
          magicScale: o.magicScale ?? null,
          fixedDamage: o.fixedDamage ?? null,
          stackIndex: o.stackIndex ?? idx,
        });
        if (ended) {
          moeSkillComboGenRef.current += 1;
        }
      }, scaleBattleMs(hit.atMs));
    });
  }, [scaleBattleMs]);

  const activateCombatSkillSlot = useCallback(
    (slotIndex, skill) => {
      if (!skill) return;
      if (!isMoePetSkillUsableAtLevel(skill, petCombatLevel, petSkillMode)) {
        setToast(`Lv.${skill.level}で習得`);
        return;
      }
      const msg = skillToastMessage(pet.id, slotIndex, skill);
      if (msg) setSkillToast(msg);
      setToast(formatMoePetSkillDescription(skill));

      if (pet.id === "elemental_atrum") {
        const atrumResult = activateAtrumPetSkill(skill, {
          petRef,
          setPet,
          flushPersistActivePet,
          pushWorldHealPopup,
          playSfx,
          duelRef,
          scheduleMoeDuelSkillHits,
          atrumMagicBuffUntilRef,
          atrumMpRegenRef,
          petPosRef,
          petCombatLevel,
        });
        if (atrumResult.handled) {
          if (atrumResult.skillToast) setSkillToast(atrumResult.skillToast);
          if (atrumResult.toast) setToast(atrumResult.toast);
          return;
        }
      }

      if (skill.id === "phoenix_life_burst") {
        const healAmt = skill.healFlat ?? 100;
        const mpCost = skill.mpCost ?? 0;
        setPet((prev) => {
          if (mpCost > 0 && prev.mp < mpCost) return prev;
          const next = moeApplyFlatPetHpBonus(
            {
              ...prev,
              mp: Math.max(0, prev.mp - mpCost),
            },
            healAmt
          );
          petRef.current = next;
          petStateRef.current = next;
          flushPersistActivePet(next);
          const pos = petPosRef.current;
          pushWorldHealPopup(pos.x, pos.y, healAmt);
          return next;
        });
      } else if (
        skill.type === "heal" ||
        skill.type === "heal_regen" ||
        skill.id === "phoenix_deep_sleep"
      ) {
        const ratio =
          skill.healRatio ?? (skill.id === "phoenix_deep_sleep" ? 0.45 : 1);
        setPet((prev) => {
          const healAmt = Math.max(1, Math.floor(prev.hpMax * ratio));
          const nextHp = Math.min(prev.hpMax, prev.hp + healAmt);
          const next = { ...prev, hp: nextHp };
          petRef.current = next;
          petStateRef.current = next;
          flushPersistActivePet(next);
          const pos = petPosRef.current;
          pushWorldHealPopup(pos.x, pos.y, healAmt);
          return next;
        });
      }

      if (skill.id === "phoenix_habit_ascension") {
        const habitCheck = validatePhoenixHabitAscension(Boolean(duelRef.current));
        if (!habitCheck.ok) {
          setToast(habitCheck.toast ?? "使えません");
          return;
        }
        const mpCost = skill.mpCost ?? 0;
        if (mpCost > 0 && (petRef.current.mp ?? 0) < mpCost) {
          setToast("MPが足りません");
          return;
        }
        const habitSeq = resolvePhoenixHabitAscensionSequence(skill);
        if (mpCost > 0) {
          setPet((prev) => {
            const next = { ...prev, mp: Math.max(0, prev.mp - mpCost) };
            petRef.current = next;
            petStateRef.current = next;
            flushPersistActivePet(next);
            return next;
          });
        }
        scheduleMoeDuelSkillHits(duelRef.current.enemyId, habitSeq);
        setSkillToast("生活改鳳！");
        setToast("生活改鳳 — 炎！");
        return;
      }

      if (skill.id === "phoenix_scorching_sky") {
        if (!duelRef.current) {
          setToast("攻撃2倍は戦闘中のみ使えます");
          return;
        }
        const nextOn = !phoenixHabitAtk2xRef.current;
        phoenixHabitAtk2xRef.current = nextOn;
        setPhoenixHabitAtk2x(nextOn);
        setToast(nextOn ? "攻撃2倍【ON】" : "攻撃1倍に戻した");
        return;
      }

      const d = duelRef.current;
      const duelSkillSeq =
        d?.enemyId != null
          ? resolveMoeDuelSkillSequence(pet.id, skill)
          : null;
      if (duelSkillSeq) {
        scheduleMoeDuelSkillHits(d.enemyId, duelSkillSeq);
      }
    },
    [pet.id, petCombatLevel, petSkillMode, scheduleMoeDuelSkillHits, pushWorldHealPopup, flushPersistActivePet]
  );

  const activatePlayerSkillSlot = useCallback((_slotIndex, skill) => {
    if (!skill) return;
    if (skill.id === "ninja_shinobiashi") {
      setShinobiashiOn((v) => {
        const next = !v;
        setToast(
          `${formatMoePetSkillDescription(skill)}\n${next ? "【ON】" : "【OFF】"}`
        );
        return next;
      });
      return;
    }
    if (skill.id === "ninja_shinsoku") {
      setDashBoost3x((v) => {
        const next = !v;
        setToast(
          `${formatMoePetSkillDescription(skill)}\n${next ? "【ON】" : "【OFF】"}`
        );
        return next;
      });
      return;
    }
    if (skill.id === "ninja_kakuremino") {
      const now = performance.now();
      if (isMoeKakureminoActive(kakureminoUntilRef.current, now)) return;
      if (
        moeKakureminoCooldownRemainSec(
          kakureminoCooldownUntilRef.current,
          now,
          kakureminoUntilRef.current
        ) > 0
      ) {
        return;
      }
      const { untilMs, cooldownUntilMs } = activateMoeKakuremino(now);
      kakureminoUntilRef.current = untilMs;
      kakureminoCooldownUntilRef.current = cooldownUntilMs;
      setKakureminoActive(true);
      setKakureminoCooldownSec(
        moeKakureminoCooldownRemainSec(cooldownUntilMs, now, untilMs)
      );
      if (duelRef.current?.phase === "approach") {
        endActiveDuel();
      }
      const aggroDropped = dropMoeEnemyFieldAggro(
        enemyChaseRuntimeRef.current,
        enemiesRef.current,
        (enemy) =>
          moeEnemyFieldIdleFacingYaw(
            enemy,
            worldRef.current?.tileWidth,
            worldRef.current?.tileDepth
          )
      );
      if (aggroDropped) {
        startTransition(() => {
          setEnemies((prev) =>
            prev.map((en) => {
              const rt = enemyChaseRuntimeRef.current[en.id];
              if (!rt) return en;
              return { ...en, x: rt.x, y: rt.y };
            })
          );
        });
      }
      setToast(
        `🫥 ${skill.name} — 約${MOE_KAKUREMINO_DURATION_SEC}秒、敵に気付かれない`
      );
      window.setTimeout(() => {
        kakureminoUntilRef.current = 0;
        setKakureminoActive(false);
      }, MOE_KAKUREMINO_DURATION_SEC * 1000);
      return;
    }
    setToast(formatMoePetSkillDescription(skill));
  }, [endActiveDuel]);

  const spendPhoenixPlayerMp = useCallback((skill) => {
    const next = spendPlayerMpForPhoenixSkill(playerVitalsRef.current, skill);
    if (!next) return false;
    playerVitalsRef.current = next;
    setPlayerVitals(next);
    saveMoePlayerVitals(next);
    return true;
  }, []);

  const applySkill2ExpAfterUse = useCallback(() => {
    const award = awardPlayerSkill2ExpOnUse(playerSkill2ProgressRef.current);
    if (award.gained) {
      setPlayerSkill2Progress(award.progress);
      savePlayerSkill2Progress(award.progress);
      playerSkill2ProgressRef.current = award.progress;
      pushWorldSkillExpPopup(award);
      if (award.leveledUp) {
        triggerSkill2LevelUpFlash(award.nextLevel);
      }
    }
    return award;
  }, [pushWorldSkillExpPopup, triggerSkill2LevelUpFlash]);

  const toastWithSkill2Exp = useCallback(
    (baseToast, skillToastMsg) => {
      const award = applySkill2ExpAfterUse();
      const lines = [baseToast, ...award.toastLines].filter(Boolean);
      setToast(lines.join("\n"));
      if (skillToastMsg) setSkillToast(skillToastMsg);
    },
    [applySkill2ExpAfterUse]
  );

  const applyPhoenixPlayerChantEffect = useCallback(
    (skill) => {
      if (!skill) return;
      if (!spendPhoenixPlayerMp(skill)) {
        setToast(MOE_PHOENIX_PLAYER_MP_SHORTAGE_TOAST);
        return;
      }

      const now = Date.now();

      if (skill.id === "phoenix_ansleep_walk") {
        const intervalMs = skill.regenIntervalMs ?? 3000;
        const durationMs = skill.regenDurationMs ?? 90000;
        phoenixAnsleepRegenRef.current = {
          until: now + durationMs,
          hpPerTick: skill.regenHpPerTick ?? 20,
          intervalSec: intervalMs / 1000,
          acc: 0,
        };
        toastWithSkill2Exp(
          `🪶 ${skill.name} — ペットに3秒ごとHP${skill.regenHpPerTick ?? 20}回復`
        );
        playSfx("heal");
        return;
      }

      if (skill.id === "phoenix_hot_spring") {
        const hadAilment = petHasMoeAilment(petRef.current);
        setPet((prev) => {
          const next = clearMoePetPoisonParalysis(prev);
          petRef.current = next;
          petStateRef.current = next;
          flushPersistActivePet(next);
          return next;
        });
        toastWithSkill2Exp(
          hadAilment
            ? `🪶 ${skill.name} — 毒・麻痺を解毒しました`
            : `🪶 ${skill.name} — ペットの気を整えました`
        );
        playSfx("heal");
        return;
      }

      if (
        skill.type === "heal" ||
        skill.type === "heal_regen" ||
        skill.id === "phoenix_deep_sleep"
      ) {
        const ratio =
          skill.healRatio ?? (skill.id === "phoenix_deep_sleep" ? 0.45 : 0.85);
        setPet((prev) => {
          const healAmt = Math.max(1, Math.floor(prev.hpMax * ratio));
          const nextHp = Math.min(prev.hpMax, prev.hp + healAmt);
          const next = {
            ...prev,
            hp: nextHp,
          };
          petRef.current = next;
          petStateRef.current = next;
          flushPersistActivePet(next);
          const pos = petPosRef.current;
          pushWorldHealPopup(pos.x, pos.y, healAmt);
          return next;
        });
        if (skill.type === "heal_regen" || skill.id === "phoenix_ultimate_sleep") {
          const intervalMs = skill.regenIntervalMs ?? 3000;
          const durationMs = skill.regenDurationMs ?? 30000;
          phoenixUltimateRegenRef.current = {
            until: now + durationMs,
            hpPerTick: skill.regenHpPerTick ?? 20,
            intervalSec: intervalMs / 1000,
            acc: 0,
          };
        }
        toastWithSkill2Exp(`🪶 ${skill.name} — ペットのHPを回復しました`);
        playSfx("heal");
      }
    },
    [pushWorldHealPopup, spendPhoenixPlayerMp, toastWithSkill2Exp]
  );

  const startPhoenixPlayerSkillChant = useCallback(
    (skill) => {
      if (!skill) return;
      if (skillChantRef.current) return;
      if (!canSpendPlayerMpForPhoenixSkill(playerVitalsRef.current, skill)) {
        setToast(MOE_PHOENIX_PLAYER_MP_SHORTAGE_TOAST);
        return;
      }
      const startedAt = Date.now();
      skillChantRef.current = {
        kind: "phoenix",
        skillId: skill.id,
        skill,
        startedAt,
        chantSec: MOE_PHOENIX_PLAYER_CHANT_SEC,
      };
      setSkillChant(skillChantRef.current);
      setSkillChantRemainSec(MOE_PHOENIX_PLAYER_CHANT_SEC);
      setToast(
        `🪶 ${skill.name}をペットへ詠唱中…（${MOE_PHOENIX_PLAYER_CHANT_SEC}秒）`
      );
    },
    []
  );

  const activatePlayerPhoenixSkill = useCallback(
    (slotIndex, skill) => {
      if (!skill) return;
      const access = canUsePlayerSkill2(skill, playerSkill2ProgressRef.current);
      if (!access.ok) {
        setToast(
          `${skill.name} — 技② Lv.${getPlayerSkill2RequiredLevel(skill)}で習得`
        );
        return;
      }

      if (skill.id === "jiriki_seiran") {
        const result = activateJirikiSeiran(playerVitalsRef.current);
        if (!result.ok) {
          setToast(result.toast ?? "使えません");
          return;
        }
        playerVitalsRef.current = result.casterVitals;
        setPlayerVitals(result.casterVitals);
        saveMoePlayerVitals(result.casterVitals);
        playerCondenseMindRef.current = null;
        playerJirikiSeiranRef.current = result.buff;
        setCondenseMindActive(false);
        setJirikiSeiranActive(true);
        toastWithSkill2Exp(result.toast ?? "自力整然！", result.skillToast);
        playSfx("heal");
        return;
      }

      if (isMoePhoenixPlayerChantSkill(skill)) {
        startPhoenixPlayerSkillChant(skill);
        return;
      }

      if (skill.id === "phoenix_life_burst") {
        const healAmt = skill.healFlat ?? 100;
        if (!spendPhoenixPlayerMp(skill)) {
          setToast(MOE_PHOENIX_PLAYER_MP_SHORTAGE_TOAST);
          return;
        }
        setPet((prev) => {
          const next = moeApplyFlatPetHpBonus(prev, healAmt);
          petRef.current = next;
          petStateRef.current = next;
          flushPersistActivePet(next);
          pushWorldHealPopup(petPosRef.current.x, petPosRef.current.y, healAmt);
          return next;
        });
        toastWithSkill2Exp(`🪶 ${skill.name} — ペットHP+${healAmt}`);
        playSfx("heal");
        return;
      }

      if (skill.id === "phoenix_habit_ascension") {
        const habitCheck = validatePhoenixHabitAscension(Boolean(duelRef.current));
        if (!habitCheck.ok) {
          setToast(habitCheck.toast ?? "使えません");
          return;
        }
        if (!spendPhoenixPlayerMp(skill)) {
          setToast(MOE_PHOENIX_PLAYER_MP_SHORTAGE_TOAST);
          return;
        }
        scheduleMoeDuelSkillHits(
          duelRef.current.enemyId,
          resolvePhoenixHabitAscensionSequence(skill)
        );
        toastWithSkill2Exp("生活改鳳 — 炎！", "生活改鳳！");
        return;
      }

      if (skill.id === "phoenix_scorching_sky") {
        if (!duelRef.current) {
          setToast("攻撃2倍は戦闘中のみ使えます");
          return;
        }
        const nextOn = !phoenixHabitAtk2xRef.current;
        phoenixHabitAtk2xRef.current = nextOn;
        setPhoenixHabitAtk2x(nextOn);
        if (nextOn) {
          toastWithSkill2Exp("攻撃2倍【ON】");
        } else {
          setToast("攻撃1倍に戻した");
        }
        return;
      }

      const d = duelRef.current;
      const duelSkillSeq =
        d?.enemyId != null
          ? resolveMoeDuelSkillSequence(pet.id, skill)
          : null;
      if (duelSkillSeq) {
        if (!spendPhoenixPlayerMp(skill)) {
          setToast(MOE_PHOENIX_PLAYER_MP_SHORTAGE_TOAST);
          return;
        }
        scheduleMoeDuelSkillHits(d.enemyId, duelSkillSeq);
        const msg = skillToastMessage(pet.id, slotIndex, skill);
        toastWithSkill2Exp(formatMoePetSkillDescription(skill), msg ?? undefined);
      }
    },
    [
      pet.id,
      scheduleMoeDuelSkillHits,
      pushWorldHealPopup,
      startPhoenixPlayerSkillChant,
      spendPhoenixPlayerMp,
      toastWithSkill2Exp,
    ]
  );

  const { activatePlayerPreSkill } = useMoePlayerPreSkillField({
    playerPreSkillProgressRef,
    setPlayerPreSkillProgress,
    playerVitalsRef,
    setPlayerVitals,
    duelRef,
    playerSummonFxRef,
    scheduleMoeDuelSkillHits,
    setToast,
    setSkillToast,
    playSfx,
  });

  const applyEnemyStrike = React.useCallback((enemyId) => {
    const d = duelRef.current;
    if (!d || d.enemyId !== enemyId || d.phase !== "simultaneous_charge") {
      return false;
    }
    const target = enemiesRef.current.find((e) => e.id === enemyId);
    if (!target || target.hp <= 0) {
      endActiveDuel();
      return true;
    }
    const dmgBase = target.petDamage ?? 1;
    const dmgStrong = target.petDamageStrong ?? Math.round(dmgBase * 1.5);
    const tname = target.name;
    const p = petRef.current;
    const seq = enemyStrikeSeqRef.current;
    const isOrc = target.key === "orc_infantry";
    const isGustav = target.key === "gustav_junior";
    const isBison =
      target.key === "mountain_bison" ||
      target.key === "rough_bison" ||
      target.key === "elvin_bison" ||
      target.key === "auzun_bura";
    const useStrong = (isOrc || isBison || isGustav) && seq % 2 === 1;
    const dmg = useStrong ? dmgStrong : dmgBase;
    let nh = Math.max(0, p.hp - dmg);
    if (petUsesPreciseWikiStats(p.id)) nh = roundPetStatInternal(nh);
    const ends = nh <= 0;

    if (ends) playSfx("petDefeated");
    else playSfx("enemyHit");

    if (!ends) {
      enemyStrikeVariantRef.current = {
        enemyId,
        variant: useStrong ? "strong" : "weak",
      };
      enemyStrikeSeqRef.current = seq + 1;
      let animMs = enemyAttackMsRef.current;
      if (isOrc) {
        animMs = useStrong ? MOE_ORC_STRONG_ATTACK_MS : MOE_ORC_WEAK_ATTACK_MS;
      }
      if (isGustav) {
        animMs = useStrong
          ? MOE_GUSTAV_STRONG_ATTACK_MS
          : MOE_GUSTAV_WEAK_ATTACK_MS;
      }
      enemyStrikeUntilRef.current =
        performance.now() +
        scaleBattleMs(enemyStrikeAnimMsForKey(target.key, animMs));
    }

    const petDamaged = { ...p, hp: nh };
    let petAfter = petDamaged;
    let petExpGained = null;
    let levelUpMessages = null;
    if (!ends) {
      const r = rollPetExpOnHit(petDamaged, target.level);
      petAfter = r.petAfter;
      petExpGained = r.petExpGained;
      levelUpMessages = r.levelUpMessages;
    }

    const pt = petPosRef.current;
    const px = pt.x;
    const py = pt.y;
    if (petExpGained != null) {
      flushSync(() => commitPetExpFromHit(petAfter, levelUpMessages));
    } else {
      flushSync(() =>
        setPet((prev) => {
          const updated = { ...prev, hp: nh };
          petRef.current = updated;
          petStateRef.current = updated;
          return updated;
        })
      );
    }
    if (ends) {
      endActiveDuel();
    }
    queueMicrotask(() => {
      pushWorldDamagePopup(px, py, dmg, true);
      if (!ends && petExpGained != null) {
        pushPetExpPopup(petExpGained, false);
      }
      const toastBits = ends ? [`${tname}の攻撃！ ペットが倒れた…`] : [];
      setToast(toastBits.length ? toastBits.filter(Boolean).join("　") : null);
    });
    return ends;
  }, [pushPetExpPopup, pushWorldDamagePopup, rollPetExpOnHit, scaleBattleMs, endActiveDuel, commitPetExpFromHit]);

  /** rAF デュエルループの useEffect 依存に含めない（参照の変化でループが二重化し同一フレームで2ヒットするのを防ぐ） */
  const applyPetStrikeRef = useRef(applyPetStrike);
  const applyEnemyStrikeRef = useRef(applyEnemyStrike);
  const pushWorldHealPopupRef = useRef(pushWorldHealPopup);
  applyPetStrikeRef.current = applyPetStrike;
  applyEnemyStrikeRef.current = applyEnemyStrike;
  pushWorldHealPopupRef.current = pushWorldHealPopup;

  /** 与ダメージポップが同一フレーム付近で二重に積まれるのを防ぐ（ループ二重化の保険） */
  const lastPetDamagePopupRef = useRef({ t: 0, v: -1, qx: 0, qy: 0 });
  /** ペットEXPポップの短時間デデュープ（経路別：同一ヒットの二重呼びのみ抑止。ペット→敵と敵→ペットの同額は別扱い） */
  const lastPetExpPopupFromPetHitRef = useRef({ t: 0, v: -1 });
  const lastPetExpPopupFromEnemyHitRef = useRef({ t: 0, v: -1 });

  useEffect(() => {
    const measure = () => {
      setView({
        w: Math.max(360, window.innerWidth),
        h: Math.max(480, window.innerHeight),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (is3d) {
      map3dReadyRef.current = false;
      pet3dSpawnSyncedRef.current = false;
      setMap3dReady(false);
      const halfW = MOE_3D_HALF_W;
      const halfD = MOE_3D_HALF_D;
      const mw = halfW * 2;
      const mh = halfD * 2;
      /** 試作 2×4 のタイル寸法見積もり（本編 halfW=180 より legacy 基準 100 を使う） */
      const protoHalf = MOE_3D_LEGACY_REF_HALF;
      const { tileW: legacyTw, tileD: legacyTd } = moe3dEstimatedTileSize(
        protoHalf,
        protoHalf
      );
      const hubAnchor = moe3dBiskHubAnchor();
      const newEnemies = [];
      const midBase = MOE_MEERIM_ENEMIES.find(
        (d) => d.key === MOE_MEERIM_MID_BOSS_KEY
      );
      if (midBase) {
        newEnemies.push(
          buildMeerimMidBossEnemy(
            midBase,
            enemyIdRef.current++,
            moe3dMidBossSpawnPosition(
              protoHalf,
              protoHalf,
              legacyTw,
              legacyTd,
              hubAnchor
            ),
            MOE_MID_BOSS_HP_MULTIPLIER
          )
        );
      }
      const gustavBase = MOE_MEERIM_ENEMIES.find(
        (d) => d.key === MOE_MEERIM_GUSTAV_JUNIOR_KEY
      );
      if (gustavBase) {
        newEnemies.push(
          buildMeerimGustavJuniorEnemy(
            gustavBase,
            enemyIdRef.current++,
            moe3dGustavJuniorSpawnPosition(halfW, halfD, hubAnchor)
          )
        );
      }
      const superBase = MOE_MEERIM_ENEMIES.find(
        (d) => d.key === MOE_MEERIM_SUPER_BOSS_KEY
      );
      if (superBase) {
        newEnemies.push(
          buildMeerimSuperBossEnemy(
            superBase,
            enemyIdRef.current++,
            moe3dSuperBossSpawnPosition(
              protoHalf,
              protoHalf,
              legacyTw,
              legacyTd,
              hubAnchor
            ),
            MOE_SUPER_BOSS_HP_MULTIPLIER
          )
        );
      }
      const mountainBase = MOE_MEERIM_ENEMIES.find(
        (d) => d.key === MOE_MEERIM_MOUNTAIN_BISON_KEY
      );
      if (mountainBase) {
        newEnemies.push(
          buildMeerimFieldBisonEnemy(
            mountainBase,
            enemyIdRef.current++,
            moe3dMountainBisonSpawnPosition(
              protoHalf,
              protoHalf,
              legacyTw,
              legacyTd,
              hubAnchor
            )
          )
        );
      }
      const roughBase = MOE_MEERIM_ENEMIES.find(
        (d) => d.key === MOE_MEERIM_ROUGH_BISON_KEY
      );
      if (roughBase) {
        newEnemies.push(
          buildMeerimFieldBisonEnemy(
            roughBase,
            enemyIdRef.current++,
            moe3dRoughBisonSpawnPosition(
              protoHalf,
              protoHalf,
              legacyTw,
              legacyTd,
              hubAnchor
            )
          )
        );
      }
      const tileW = legacyTw;
      const tileD = legacyTd;
      for (const spot of moe3dMonsterFieldSpawnPoints(tileW, tileD)) {
        const base = moeMonsterFieldBase(spot.key);
        if (!base) continue;
        const scaled = moe3dEnemyStatsForZoneLevel(base, base.level);
        newEnemies.push({
          ...base,
          id: enemyIdRef.current++,
          spawnArea: spot.mapSlotId,
          mapSlotId: spot.mapSlotId,
          modelVariantId: spot.modelVariantId,
          slotInZone: spot.slotInZone,
          x: spot.x,
          y: spot.y,
          level: scaled.level,
          hp: scaled.hpMax,
          hpMax: scaled.hpMax,
          petDamage: scaled.petDamage,
          wiki: scaled.wiki,
          zoneLevel: base.level,
          fieldBoss: base.fieldBoss ?? false,
          midBoss: Boolean(base.fieldBoss && !base.superBoss),
          superBoss: base.superBoss ?? false,
          sy: 0,
        });
      }
      const initTw = mw / MOE_3D_LEGACY_TILES_X;
      const initTd = mh / MOE_3D_LEGACY_TILES_Z;
      const initMiniBounds = moe3dFullWorldBounds(initTw, initTd);
      const { miniMapW: initMiniMapW, miniMapH: initMiniMapH } =
        moe3dMinimapViewSize(initMiniBounds);
      setWorld({
        mw,
        mh,
        mode3d: true,
        halfW,
        halfD,
        tileWidth: initTw,
        tileDepth: initTd,
        miniBounds: initMiniBounds,
        miniMapW: initMiniMapW,
        miniMapH: initMiniMapH,
      });
      setEnemies(newEnemies);
      enemyChaseRuntimeRef.current = {};
      approachChargeScheduledRef.current = false;
      duelRef.current = null;
      setDuel(null);
      const start = moe3dDefaultPlayerSpawn(halfW, halfD, legacyTw, legacyTd);
      playerPosRef.current = start;
      setPlayer(start);
      setMinimap3d({ x: start.x, y: start.y, yaw: cameraYawRef.current });
      const { petAt } = snapPet3dNearPlayer(halfW, halfD, start);
      setPet((prev) => ({ ...prev, x: petAt.x, y: petAt.y }));
      playerJumpRef.current = { offset: 0, vy: 0 };
      return;
    }
    if (!view.w || !view.h) return;
    const { mw, mh } = computeMoe2dWorldSize(view.w, view.h);
    const rowLayout = buildMoe2dRowLayout(mw, mh);
    const zoneCount = MOE_3D_ENEMY_ZONES.length;
    
    const newEnemies = [];
    MOE_3D_ENEMY_ZONES.forEach((zone, zoneIndex) => {
      const data = MOE_MEERIM_ENEMIES.find((d) => d.key === zone.key);
      if (!data) return;
      for (let i = 0; i < MOE_3D_ENEMIES_PER_ZONE; i++) {
        const pairOffset =
          i === 0
            ? -MOE_3D_ZONE_PAIR_LEVEL_OFFSET
            : MOE_3D_ZONE_PAIR_LEVEL_OFFSET;
        const zoneLevel = Math.round((zone.level + pairOffset) * 10) / 10;
        const scaled = moe3dEnemyStatsForZoneLevel(data, zoneLevel);
        const { x, y } = moe2dCellCenter(rowLayout, mw, zoneIndex, i);
        newEnemies.push({
          ...data,
          id: enemyIdRef.current++,
          zoneIndex,
          slotInZone: i,
          zoneLevel,
          x,
          y,
          level: scaled.level,
          hp: scaled.hpMax,
          hpMax: scaled.hpMax,
          petDamage: scaled.petDamage,
          wiki: scaled.wiki,
          sy: zoneIndex,
        });
      }
    });

    const midBase = MOE_MEERIM_ENEMIES.find(
      (d) => d.key === MOE_MEERIM_MID_BOSS_KEY
    );
    if (midBase) {
      newEnemies.push(
        buildMeerimMidBossEnemy(
          midBase,
          enemyIdRef.current++,
          moe2dMidBossSpawnPosition(rowLayout, mw),
          MOE_MID_BOSS_HP_MULTIPLIER
        )
      );
    }
    const gustavBase2d = MOE_MEERIM_ENEMIES.find(
      (d) => d.key === MOE_MEERIM_GUSTAV_JUNIOR_KEY
    );
    if (gustavBase2d) {
      const midPos = moe2dMidBossSpawnPosition(rowLayout, mw);
      newEnemies.push(
        buildMeerimGustavJuniorEnemy(
          gustavBase2d,
          enemyIdRef.current++,
          { x: midPos.x + 48, y: midPos.y + 36 }
        )
      );
    }
    const superBase = MOE_MEERIM_ENEMIES.find(
      (d) => d.key === MOE_MEERIM_SUPER_BOSS_KEY
    );
    if (superBase) {
      newEnemies.push(
        buildMeerimSuperBossEnemy(
          superBase,
          enemyIdRef.current++,
          moe2dSuperBossSpawnPosition(rowLayout, mw),
          MOE_SUPER_BOSS_HP_MULTIPLIER
        )
      );
    }
    const mountainBase = MOE_MEERIM_ENEMIES.find(
      (d) => d.key === MOE_MEERIM_MOUNTAIN_BISON_KEY
    );
    if (mountainBase) {
      newEnemies.push(
        buildMeerimFieldBisonEnemy(
          mountainBase,
          enemyIdRef.current++,
          moe2dMountainBisonSpawnPosition(rowLayout, mw)
        )
      );
    }
    const roughBase = MOE_MEERIM_ENEMIES.find(
      (d) => d.key === MOE_MEERIM_ROUGH_BISON_KEY
    );
    if (roughBase) {
      newEnemies.push(
        buildMeerimFieldBisonEnemy(
          roughBase,
          enemyIdRef.current++,
          moe2dRoughBisonSpawnPosition(rowLayout, mw)
        )
      );
    }

    setWorld({ mw, mh, rowLayout });
    setEnemies(newEnemies);
    approachChargeScheduledRef.current = false;
    duelRef.current = null;
    setDuel(null);
    const start = moe2dPlayerStartPosition(rowLayout, mw);
    playerPosRef.current = start;
    setPlayer(start);
    setPet((prev) => ({ ...prev, x: start.x + 24, y: start.y }));
  }, [view.w, view.h, is3d]);

  useEffect(() => {
    if (!toast) return;
    const hasPetLevelUp = toast.includes("に上がった");
    const isSkillDesc = toast.includes("\n");
    const ms = hasPetLevelUp ? 5200 : isSkillDesc ? 3600 : 2200;
    const t = setTimeout(() => setToast(null), ms);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!skillToast) return;
    const t = setTimeout(() => setSkillToast(null), MOE_SKILL_TOAST_MS);
    return () => clearTimeout(t);
  }, [skillToast]);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setHealCdSec({
        healing: Math.max(
          0,
          Math.ceil((healCdUntilRef.current.healing - now) / 1000)
        ),
        healAll: Math.max(
          0,
          Math.ceil((healCdUntilRef.current.healAll - now) / 1000)
        ),
      });

    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!expConsumableLevelUpFlow) return;
    const onKey = (e) => {
      if (e.repeat) return;
      if (e.key === "Escape") {
        setExpConsumableLevelUpFlow(null);
        return;
      }
      if (["Enter", " ", "z", "Z", "x", "X"].includes(e.key)) {
        e.preventDefault();
        advanceExpConsumableLevelUp();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expConsumableLevelUpFlow, advanceExpConsumableLevelUp]);

  useEffect(() => {
    if (!petLevelUpFlash) return;
    const t = setTimeout(() => setPetLevelUpFlash(null), 5500);
    return () => clearTimeout(t);
  }, [petLevelUpFlash]);

  useEffect(
    () => () => {
      if (integerLevelFlashTimerRef.current) {
        window.clearTimeout(integerLevelFlashTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const sync = () => setTrainerStatus(loadGameStatus());
    sync();
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  const commitPlayerVitals = useCallback((next) => {
    playerVitalsRef.current = next;
    setPlayerVitals(next);
    saveMoePlayerVitals(next);
  }, []);

  useEffect(() => {
    allyTargetRef.current = allyTarget;
  }, [allyTarget]);

  useEffect(() => {
    installMoeDevRegistry();
  }, []);

  useEffect(() => {
    if (!fieldVitalsBootstrappedRef.current) {
      fieldVitalsBootstrappedRef.current = true;
      const level = loadGameStatus().level ?? trainerStatus.level ?? 1;
      commitPlayerVitals(fullHealMoePlayerVitals(level));
      return;
    }
    commitPlayerVitals(loadMoePlayerVitals(trainerStatus.level));
  }, [trainerStatus.level, commitPlayerVitals]);

  useEffect(() => {
    const resetKeys = () => {
      keysRef.current = createEmptyInputKeys();
      playerSprintRef.current = false;
      petRunAnimRef.current = false;
    };

    const down = (e) => {
      if (isTypingTarget(e.target)) return;
      if (!applyInputKeyCode(keysRef.current, e.code, true, e)) return;
      if (MOVE_KEY_CODES.has(e.code)) e.preventDefault();
      if (e.code === "Space" && worldRef.current?.mode3d) e.preventDefault();
    };
    const up = (e) => {
      if (isTypingTarget(e.target)) return;
      applyInputKeyCode(keysRef.current, e.code, false, e);
    };

    const onVisibilityChange = () => {
      if (document.hidden) resetKeys();
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", resetKeys);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", resetKeys);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resetKeys();
    };
  }, []);

  useEffect(() => {
    if (
      !petMasterDialogue &&
      !expVendorOpen &&
      !rhodaOpen &&
      !josephOpen &&
      !josephSynthOpen &&
      !cashShopOpen &&
      !expConsumableLevelUpFlow &&
      !showPetStatusOverlay &&
      !showFieldGuide &&
      !showEventGuide &&
      !showDragonLineup &&
      !showMonsterLineup
    )
      return;
    keysRef.current = createEmptyInputKeys();
    playerSprintRef.current = false;
    petRunAnimRef.current = false;
  }, [petMasterDialogue, expVendorOpen, rhodaOpen, josephOpen, josephSynthOpen, cashShopOpen, expConsumableLevelUpFlow, showPetStatusOverlay, showFieldGuide, showEventGuide, showDragonLineup, showMonsterLineup]);

  useEffect(() => {
    if (!world) return;
    let raf;
    let lastFrame = performance.now();
    let moeDevLastCheck = 0;

    const scheduleApproachToCharge = (enemyIdSnapshot) => {
      if (approachChargeScheduledRef.current) return;
              approachChargeScheduledRef.current = true;
              queueMicrotask(() => {
                if (duelRef.current == null || duelRef.current.phase !== "approach") {
                  approachChargeScheduledRef.current = false;
                  return;
                }
                if (duelRef.current.enemyId !== enemyIdSnapshot) {
                  approachChargeScheduledRef.current = false;
                  return;
                }
                const en = enemiesRef.current.find((e) => e.id === enemyIdSnapshot);
                if (!en || en.hp <= 0) {
                  approachChargeScheduledRef.current = false;
                  duelRef.current = null;
                  setDuel(null);
                  return;
                }
                setDuel((cur) => {
          if (!cur || cur.phase !== "approach" || cur.enemyId !== enemyIdSnapshot) {
                    return cur;
                  }
          let slotX = cur.slotX;
          let slotY = cur.slotY;
          if (worldRef.current?.mode3d) {
            const ext = moe3dCombatExtentsRef.current;
            const slot = moe3dDuelSlotFromPet(
              en,
              petPosRef.current.x,
              petPosRef.current.y,
              {
                petFront: ext.pet ?? undefined,
                enemyFront: ext.enemies?.[en.id] ?? undefined,
              }
            );
            slotX = slot.x;
            slotY = slot.y;
            petPosRef.current = { x: slotX, y: slotY };
                  }
                  const next = {
                    ...cur,
                    phase: "simultaneous_charge",
                    petBar: 0,
                    enemyBar: 0,
            slotX,
            slotY,
                  };
                  duelRef.current = next;
                  playSfx("combatReady");
          approachChargeScheduledRef.current = false;
                  return next;
                });
              });
    };

    const tickSitRegen = (cmd, dt) => {
      if (cmd !== "sit") {
        sitRegenAccRef.current = 0;
        return;
      }
      sitRegenAccRef.current += dt;
      if (sitRegenAccRef.current >= 1) {
        sitRegenAccRef.current = 0;
        setPet((prev) => ({
            ...prev,
          hp: Math.min(prev.hpMax, prev.hp + PET_SIT_REGEN_HP),
          mp: Math.min(prev.mpMax, prev.mp + PET_SIT_REGEN_MP),
        }));
      }
    };

    const tickRegen = (dt) => {
      if (!regenActiveRef.current) {
        regenAccRef.current = 0;
        return;
      }
      regenAccRef.current += dt;
      if (regenAccRef.current < PET_REGEN_INTERVAL_SEC) return;
      regenAccRef.current -= PET_REGEN_INTERVAL_SEC;

      setPet((prev) => {
        if (prev.hp >= prev.hpMax && prev.mp >= prev.mpMax) return prev;

        const hpRaw = Math.min(prev.hpMax, prev.hp + PET_REGEN_HP);
        const mpRaw = Math.min(prev.mpMax, prev.mp + PET_REGEN_MP);
        const hp = petUsesPreciseWikiStats(prev.id)
          ? roundPetStatInternal(hpRaw)
          : hpRaw;
        const mp = petUsesPreciseWikiStats(prev.id)
          ? roundPetStatInternal(mpRaw)
          : mpRaw;
        const hpGain = Math.max(0, hp - prev.hp);
        if (hpGain <= 0 && mp >= prev.mp) return prev;

        if (hpGain > 0) {
          const pt = petPosRef.current;
          pushWorldHealPopupRef.current(pt.x, pt.y, hpGain);
        }
        return { ...prev, hp, mp };
      });
    };

    const tickPhoenixRegenSource = (ref, dt, now) => {
      const src = ref.current;
      if (!src) return 0;
      if (now >= src.until) {
        ref.current = null;
        return 0;
      }
      src.acc += dt;
      if (src.acc < src.intervalSec) return 0;
      src.acc -= src.intervalSec;
      return src.hpPerTick;
    };

    const tickPhoenixPetRegen = (dt) => {
      const now = Date.now();
      const gain =
        tickPhoenixRegenSource(phoenixAnsleepRegenRef, dt, now) +
        tickPhoenixRegenSource(phoenixUltimateRegenRef, dt, now);
      if (gain <= 0) return;

      setPet((prev) => {
        if (prev.hp >= prev.hpMax) return prev;
        const hpRaw = Math.min(prev.hpMax, prev.hp + gain);
        const hp = petUsesPreciseWikiStats(prev.id)
          ? roundPetStatInternal(hpRaw)
          : hpRaw;
        const hpGain = Math.max(0, hp - prev.hp);
        if (hpGain <= 0) return prev;
        const next = { ...prev, hp };
        const pt = petPosRef.current;
        pushWorldHealPopupRef.current(pt.x, pt.y, hpGain);
        petRef.current = next;
        petStateRef.current = next;
        flushPersistActivePet(next);
        return next;
      });
    };

    const ensureDuelStillValid = () => {
      const d = duelRef.current;
      if (!d || (d.phase !== "approach" && d.phase !== "simultaneous_charge")) {
        return;
      }
      const live = enemiesRef.current.find((e) => e.id === d.enemyId);
      if (!live || live.hp <= 0) {
        endActiveDuel();
      }
    };

    const tickPet3d = (speed, dt, now) => {
      if (!map3dReadyRef.current || !pet3dSpawnSyncedRef.current) return;
      const cel = petTenthCelebrationRef.current;
      if (cel?.active) {
        const adv = advancePetTenthCelebration(
          { ...petPosRef.current },
          playerPosRef.current,
          speed,
          worldRef.current,
          now
        );
        const { pos, cel: nextCel, finished } = adv(cel);
        petTenthCelebrationRef.current = nextCel;
        petPosRef.current = { x: pos.x, y: pos.y };
        petRunAnimRef.current =
          nextCel.phase === "leave" || nextCel.phase === "return";
        if (finished) {
          setPetTenthCelebrationActive(false);
        }
        return;
      }
      const cmd = petCommandRef.current;
      tickSitRegen(cmd, dt);
      const result = advancePetFieldPosition({
        pos: { ...petPosRef.current },
        cmd,
        duel: duelRef.current,
        waitAnchor: waitAnchorRef.current,
        playerPos: playerPosRef.current,
        speed,
        approachThreshold: PET_APPROACH_THRESHOLD_3D,
        followDist: PET_FOLLOW_DIST_3D,
        followDistAuto: PET_FOLLOW_DIST_3D_AUTO,
        now,
        autoAttackCooldownRef,
        targetEnemyIdRef,
        enemiesRef,
        setTargetEnemyId: (id) => scheduleTargetEnemyIdRef.current(id),
        startDuelWithEnemyRef,
      });
      if (result.reachedApproach && duelRef.current?.phase === "approach") {
        scheduleApproachToCharge(duelRef.current.enemyId);
      }
      petPosRef.current = { x: result.x, y: result.y };
      const duelNow = duelRef.current;
      if (duelNow?.phase === "simultaneous_charge") {
        petPosRef.current = { x: duelNow.slotX, y: duelNow.slotY };
      }
    };

    const tickPlayerVitalsField = (dt, sprinting, moving) => {
      const result = tickMoePlayerVitalsField(playerVitalsRef.current, dt, {
        regenAcc: playerNaturalRegenAccRef.current,
        sprinting,
        moving,
        staminaRegenMult: bananaMilkActiveRef.current
          ? MOE_BANANA_MILK_STAMINA_REGEN_MULT
          : 1,
      });
      playerNaturalRegenAccRef.current = result.regenAcc;
      if (!result.changed) return;
      commitPlayerVitals(result.vitals);
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      ensureDuelStillValid();
      tickRegen(dt);
      tickPhoenixPetRegen(dt);
      const hadPetMpRegen = Boolean(atrumMpRegenRef.current);
      tickAtrumMpRegen(
        atrumMpRegenRef,
        dt,
        setPet,
        flushPersistActivePet,
        petRef
      );
      if (
        allyTargetRef.current === "pet" &&
        hadPetMpRegen &&
        !atrumMpRegenRef.current
      ) {
        setCondenseMindActive(false);
      }
      tickPlayerCondenseMind(
        playerCondenseMindRef,
        dt,
        playerVitalsRef,
        commitPlayerVitals,
        (active) => {
          if (!active && allyTargetRef.current === "player") {
            setCondenseMindActive(false);
          }
        }
      );
      tickJirikiSeiran(
        playerJirikiSeiranRef,
        dt,
        playerVitalsRef,
        commitPlayerVitals,
        setJirikiSeiranActive
      );

      if (now - moeDevLastCheck >= 1000) {
        moeDevLastCheck = now;
        const devSnap = {
          allyTarget: allyTargetRef.current,
          allyTargetRef,
          condenseMindActive: Boolean(
            playerCondenseMindRef.current || atrumMpRegenRef.current
          ),
          playerCondenseMindRef,
          atrumMpRegenRef,
        };
        updateMoeDevSnapshot(devSnap);
        reportMoeFieldInvariantIssues(
          collectMoeFieldInvariantIssues(devSnap)
        );
      }

      const k = keysRef.current;
      let inputX = 0;
      let inputZ = 0;
      if (k.up) inputZ -= 1;
      if (k.down) inputZ += 1;
      if (k.left) inputX -= 1;
      if (k.right) inputX += 1;

      const moving = inputX !== 0 || inputZ !== 0;
      const sprinting3d = !!(world.mode3d && k.shift && moving);
      tickPlayerVitalsField(dt, sprinting3d, moving);

      let dx = 0;
      let dy = 0;
      if (inputX !== 0 || inputZ !== 0) {
        if (world.mode3d) {
          const speedMult = sprintSpeedMult3d(sprinting3d);
          const speed = MOVE_SPEED_3D * 60 * dt * speedMult;
          const { mx, my, facing } = moveInputForCameraYaw(
            inputX,
            inputZ,
            cameraYawRef.current
          );
          dx = mx * speed;
          dy = my * speed;
          if (facing != null) playerFacingRef.current = facing;
        } else {
          const speed = MOVE_SPEED;
          const len = Math.hypot(inputX, inputZ) || 1;
          dx = (inputX / len) * speed;
          dy = (inputZ / len) * speed;
        }
      }

      if (world.mode3d) {
        playerSprintRef.current = sprinting3d;
        const cmd = petCommandRef.current;
        petRunAnimRef.current =
          sprinting3d &&
          (cmd === "follow" || cmd === "auto") &&
          duelRef.current?.phase !== "simultaneous_charge";
        const speedMult = sprintSpeedMult3d(sprinting3d);
        const petSpeed = MOVE_SPEED_3D * 60 * dt * speedMult;

        const jump = playerJumpRef.current;
        if (k.space && jump.offset <= 0.02 && jump.vy <= 0) {
          if (skillChantRef.current) {
            cancelSkillChantRef.current();
          }
          jump.vy = JUMP_VELOCITY_3D;
        }
        jump.offset += jump.vy * dt;
        jump.vy -= GRAVITY_3D * dt;
        if (jump.offset <= 0) {
          jump.offset = 0;
          jump.vy = Math.max(0, jump.vy);
        }

        const fieldTw = worldRef.current?.tileWidth;
        const fieldTd = worldRef.current?.tileDepth;
        if (map3dReadyRef.current) {
          let nx = playerPosRef.current.x + dx;
          let ny = playerPosRef.current.y + dy;
        const px = playerPosRef.current.x;
        const py = playerPosRef.current.y;
          if (fieldTw && fieldTd) {
            const resolved = moe3dClampFieldMove(
              px,
              py,
              nx,
              ny,
              fieldTw,
              fieldTd
            );
            nx = resolved.x;
            ny = resolved.z;
          }
          const clamped = moe3dClampFieldPlayPosition(
            nx,
            ny,
            worldRef.current,
            fieldTw,
            fieldTd,
            1.5
          );
          nx = clamped.x;
          ny = clamped.y;
          playerPosRef.current = { x: nx, y: ny };
          if (now - lastMinimap3dSyncRef.current >= 75) {
            lastMinimap3dSyncRef.current = now;
            startTransition(() => {
              setMinimap3d({ x: nx, y: ny, yaw: cameraYawRef.current });
            });
          }
          if (fieldTw && fieldTd && now - lastFieldBgmSyncRef.current >= 320) {
            lastFieldBgmSyncRef.current = now;
            const mapSlotId = moe3dMapSlotAtWorldPos(nx, ny, fieldTw, fieldTd);
            if (mapSlotId && mapSlotId !== fieldBgmMapSlotRef.current) {
              fieldBgmMapSlotRef.current = mapSlotId;
              requestMoeFieldZoneBgm(mapSlotId);
            }
          }
          const hw = worldRef.current?.halfW ?? world.halfW ?? world.mw / 2;
          const hd = worldRef.current?.halfD ?? world.halfD ?? world.mh / 2;
          const nearHouse = moe3dIsNearPetHouse(nx, ny, hw, hd);
          if (nearHouse !== nearPetHouseRef.current) {
            nearPetHouseRef.current = nearHouse;
            startTransition(() => setNearPetHouse(nearHouse));
          }
          const nearRhodaSpot = moe3dIsNearRhoda(
            nx,
            ny,
            hw,
            hd,
            12,
            worldRef.current?.rhodaPos
          );
          if (nearRhodaSpot !== nearRhodaRef.current) {
            nearRhodaRef.current = nearRhodaSpot;
            startTransition(() => setNearRhoda(nearRhodaSpot));
          }
          const nearCashShopSpot = moe3dIsNearCashShopNpc(nx, ny);
          if (nearCashShopSpot !== nearCashShopRef.current) {
            nearCashShopRef.current = nearCashShopSpot;
            startTransition(() => setNearCashShop(nearCashShopSpot));
          }
          const nearbyAltar =
            fieldTw && fieldTd
              ? moe3dFindNearbyAltar(nx, ny, fieldTw, fieldTd, {
                  halfW: worldRef.current?.halfW,
                  halfD: worldRef.current?.halfD,
                })
              : null;
          const altarKey = nearbyAltar?.id ?? null;
          if (altarKey !== nearAltarRef.current?.id) {
            nearAltarRef.current = nearbyAltar;
            startTransition(() => setNearAltar(nearbyAltar));
          }
          const nearGuideHouse =
            fieldTw && fieldTd
              ? moe3dIsNearTrainingGuideHouse(nx, ny, fieldTw, fieldTd)
              : false;
          if (nearGuideHouse !== nearTrainingGuideHouseRef.current) {
            nearTrainingGuideHouseRef.current = nearGuideHouse;
            startTransition(() => setNearTrainingGuideHouse(nearGuideHouse));
          }
          const nearAgeHouse =
            fieldTw && fieldTd
              ? moe3dIsNearAgeHubHouse(nx, ny, fieldTw, fieldTd)
              : false;
          if (nearAgeHouse !== nearAgeHubHouseRef.current) {
            nearAgeHubHouseRef.current = nearAgeHouse;
            startTransition(() => setNearAgeHubHouse(nearAgeHouse));
          }
        }
        enemyDetectionOptsRef.current = buildMoeEnemyDetectionOpts({
          playerMoving: moving,
          shinobiashiOn: shinobiashiOnRef.current,
          kakureminoUntilMs: kakureminoUntilRef.current,
        });
        const chaseResult = tickMoeEnemyFieldChaseBatch({
          enemies: enemiesRef.current,
          runtimeById: enemyChaseRuntimeRef.current,
          playerPos: playerPosRef.current,
          playerMoving: moving,
          dt,
          duel: duelRef.current,
          detectionOpts: enemyDetectionOptsRef.current,
          resolveIdleFacingYaw: (enemy) =>
            moeEnemyFieldIdleFacingYaw(enemy, fieldTw, fieldTd),
          resolveFieldSync: (enemy) =>
            enemyFieldSyncRef.current[enemy.id] ?? null,
          resolveMove: (fromX, fromZ, toX, toZ) => {
            const tw = worldRef.current?.tileWidth;
            const td = worldRef.current?.tileDepth;
            let nx = toX;
            let nz = toZ;
            if (tw && td) {
              const resolved = moe3dClampFieldMove(
                fromX,
                fromZ,
                toX,
                toZ,
                tw,
                td,
                1.0
              );
              nx = resolved.x;
              nz = resolved.z;
            }
            const clamped = moe3dClampFieldPlayPosition(
              nx,
              nz,
              worldRef.current,
              tw,
              td,
              1.2
            );
            return { x: clamped.x, z: clamped.y };
          },
        });
        if (chaseResult.newAggroEnemyId != null) {
          const aggroEnemy = enemiesRef.current.find(
            (e) => e.id === chaseResult.newAggroEnemyId
          );
          if (aggroEnemy) {
            scheduleTargetEnemyIdRef.current(chaseResult.newAggroEnemyId);
            startTransition(() => {
              setTargetEnemyId(chaseResult.newAggroEnemyId);
              setToast(`👁 ${aggroEnemy.name}に気付かれた！`);
            });
          }
        }
        if (chaseResult.leashBrokenEnemyId != null) {
          const broke = enemiesRef.current.find(
            (e) => e.id === chaseResult.leashBrokenEnemyId
          );
          if (broke) {
            startTransition(() => {
              setToast(`💨 ${broke.name}は追跡をやめた`);
            });
          }
        }
        if (
          chaseResult.engageEnemyId != null &&
          duelRef.current == null
        ) {
          startDuelWithEnemyRef.current(chaseResult.engageEnemyId);
        }
        if (
          chaseResult.anyChasing &&
          now - lastChaseUiSyncRef.current >= 90
        ) {
          lastChaseUiSyncRef.current = now;
          startTransition(() => {
            setEnemies((prev) =>
              prev.map((en) => {
                const rt = enemyChaseRuntimeRef.current[en.id];
                if (!rt?.aggro) return en;
                if (en.x === rt.x && en.y === rt.y) return en;
                return { ...en, x: rt.x, y: rt.y };
              })
            );
          });
        }
        const chasingTarget =
          targetEnemyIdRef.current != null &&
          Boolean(
            enemyChaseRuntimeRef.current[targetEnemyIdRef.current]?.aggro
          );
        if (chasingTarget !== lastTargetChaseAggroRef.current) {
          lastTargetChaseAggroRef.current = chasingTarget;
          startTransition(() => setTargetEnemyChaseAggro(chasingTarget));
        }

        tickPet3d(petSpeed, dt, now);
      } else {
        playerSprintRef.current = false;
        petRunAnimRef.current = false;
        const cmd = petCommandRef.current;
        tickSitRegen(cmd, dt);

        const px = playerPosRef.current.x;
        const py = playerPosRef.current.y;
        let nx = px + dx;
        let ny = py + dy;
        nx = Math.max(PLAYER_R, Math.min(world.mw - PLAYER_R, nx));
        ny = Math.max(PLAYER_R, Math.min(world.mh - PLAYER_R, ny));

        const resolved = resolve2dPlayerMove(
          px,
          py,
          nx,
          ny,
          world.mw,
          world.mh,
          world.rowLayout
        );
        nx = resolved.x;
        ny = resolved.y;

        if (nx < 80 && ny > world.mh - 80 && !world.rowLayout?.length) {
          queueMicrotask(() => onBack?.());
        } else if (
          world.rowLayout?.length &&
          moe2dIsBiskExitZone(nx, ny, world.rowLayout)
        ) {
          queueMicrotask(() => onBack?.());
        } else {
          playerPosRef.current = { x: nx, y: ny };

          const petBefore = petPosRef.current;
          let petResult;
          const cel = petTenthCelebrationRef.current;
          if (cel?.active) {
            const adv = advancePetTenthCelebration(
              { ...petBefore },
              playerPosRef.current,
              MOVE_SPEED,
              world,
              now
            );
            const stepped = adv(cel);
            petTenthCelebrationRef.current = stepped.cel;
            petResult = { x: stepped.pos.x, y: stepped.pos.y, reachedApproach: false };
            if (stepped.finished) {
              setPetTenthCelebrationActive(false);
            }
          } else {
            petResult = advancePetFieldPosition({
              pos: petBefore,
              cmd,
              duel: duelRef.current,
              waitAnchor: waitAnchorRef.current,
              playerPos: playerPosRef.current,
              speed: MOVE_SPEED,
              approachThreshold: PET_APPROACH_THRESHOLD_2D,
              followDist: PET_FOLLOW_DIST_2D,
              followDistAuto: PET_FOLLOW_DIST_2D * 1.2,
              now,
              autoAttackCooldownRef,
              targetEnemyIdRef,
              enemiesRef,
              setTargetEnemyId: (id) => scheduleTargetEnemyIdRef.current(id),
              startDuelWithEnemyRef,
            });
          }
          if (
            petResult.reachedApproach &&
            duelRef.current?.phase === "approach"
          ) {
            scheduleApproachToCharge(duelRef.current.enemyId);
          }
          petPosRef.current = { x: petResult.x, y: petResult.y };

          if (nx !== px || ny !== py) {
            setPlayer({ x: nx, y: ny });
          }
          if (petResult.x !== petBefore.x || petResult.y !== petBefore.y) {
            setPet((prev) => ({
              ...prev,
              x: petResult.x,
              y: petResult.y,
            }));
          }
        }
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [world, onBack, commitPlayerVitals]);

  const dataForSkillSlots = MOE_PET_DATA[pet.id] || MOE_PET_DATA.sun_spirit;
  const combatSkillSlots = buildPetCombatSkillSlots(
    pet.id,
    dataForSkillSlots.skills || [],
    petCombatLevel,
    {
      rebornPhoenix: pet.rebornPhoenix,
      activeSkillSet: pet.activeSkillSet,
      skillMode: petSkillMode,
    }
  );
  const skillPanelLabels =
    petSkillMode === MOE_PET_SKILL_MODE_ALL
      ? SKILL_SLOT_LABELS
      : SKILL_SLOT_LABELS_LEARNED;
  const skillIconSlots = Array.from({ length: MOE_SKILL_ICON_SLOT_COUNT }, (_, i) =>
    combatSkillSlots[i] ?? null
  );
  const playerSkillIconSlots = buildPlayerNinjaSkillSlots(50, playerSkillUnlocks);
  const playerSkillCooldownSec = {};

  const resetShinsokuForGustavRematch = useCallback(() => {
    setDashBoost3x(false);
    dashBoost3xRef.current = false;
    setFieldTreasures((prev) => prev.filter((tr) => !isGustavJuniorTreasure(tr)));
  }, []);

  const beginDuelWithEnemy = useCallback(
    (id) => {
    const cur = duelRef.current;
    if (cur) {
      if (cur.enemyId === id) return;
      return;
    }
      const target = enemiesRef.current.find((en) => en.id === id);
    if (!target || target.hp <= 0) return;
      const ext = moe3dCombatExtentsRef.current;
      const slot = is3d
        ? moe3dDuelSlotFromPet(
            target,
            petPosRef.current.x,
            petPosRef.current.y,
            {
              petFront: ext.pet ?? undefined,
              enemyFront: ext.enemies?.[target.id] ?? undefined,
            }
          )
        : slotInFrontOfEnemy(
            target,
            playerPosRef.current.x,
            playerPosRef.current.y,
            52
          );
    const next = {
      enemyId: id,
      phase: "approach",
      petBar: 0,
      enemyBar: 0,
      slotX: slot.x,
      slotY: slot.y,
        petChargeSec: getPetChargeSeconds(pet.id, petCombatLevel),
      enemyChargeSec: getEnemyChargeSeconds(target),
    };
    approachChargeScheduledRef.current = false;
    duelRef.current = next;
    setDuel(next);
    playSfx("duelEngage");
    },
    [is3d, pet.id, petCombatLevel]
  );

  const startDuelWithEnemy = useCallback(
    (id) => {
      const target = enemiesRef.current.find((en) => en.id === id);
      if (!target || target.hp <= 0) return;
      if (is3d && target.fieldGustav) {
        pendingGustavDuelIdRef.current = id;
        setGustavResetPromptOpen(true);
        return;
      }
      beginDuelWithEnemy(id);
    },
    [is3d, beginDuelWithEnemy]
  );
  startDuelWithEnemyRef.current = startDuelWithEnemy;

  const closeGustavResetPrompt = useCallback(() => {
    pendingGustavDuelIdRef.current = null;
    setGustavResetPromptOpen(false);
  }, []);

  const handleGustavResetMenu = useCallback(
    (actionId) => {
      const enemyId = pendingGustavDuelIdRef.current;
      pendingGustavDuelIdRef.current = null;
      setGustavResetPromptOpen(false);
      if (enemyId == null) return;
      if (actionId === "yes_reset") {
        resetShinsokuForGustavRematch();
        setToast("神速をリセット — 倒すと忍者の足袋の宝が出る");
      }
      beginDuelWithEnemy(enemyId);
    },
    [beginDuelWithEnemy, resetShinsokuForGustavRematch]
  );

  const cancelActiveDuel = useCallback(() => {
    if (!duelRef.current) return false;
    endActiveDuel();
    return true;
  }, [endActiveDuel]);

  const applyPetCommand = useCallback((mode) => {
    petCommandRef.current = mode;
    setPetCommandMode(mode);
    if (mode === "wait" || mode === "sit") {
      const anchor = worldRef.current?.mode3d
        ? petPosRef.current
        : { x: petStateRef.current.x, y: petStateRef.current.y };
      waitAnchorRef.current = { x: anchor.x, y: anchor.y };
      if (worldRef.current?.mode3d) {
        petHoldYawRef.current = playerFacingRef.current;
      }
    } else {
      waitAnchorRef.current = null;
      petHoldYawRef.current = null;
    }
    if (mode !== "sit") sitRegenAccRef.current = 0;
  }, []);

  const handlePetComeBack = useCallback(() => {
    const wasFighting = cancelActiveDuel();
    applyPetCommand("follow");
    if (wasFighting && worldRef.current?.mode3d) {
      petRunAnimRef.current = true;
    }
    setToast(
      wasFighting
        ? "もどれ！（戦闘をやめてプレイヤーのもとへ）"
        : MOE_PET_COMMAND_UI.follow.toast
    );
  }, [applyPetCommand, cancelActiveDuel]);

  const handlePetWait = useCallback(() => {
    cancelActiveDuel();
    applyPetCommand("wait");
    setToast(MOE_PET_COMMAND_UI.wait.toast);
  }, [applyPetCommand, cancelActiveDuel]);

  const handlePetSit = useCallback(() => {
    cancelActiveDuel();
    applyPetCommand("sit");
    setToast(MOE_PET_COMMAND_UI.sit.toast);
  }, [applyPetCommand, cancelActiveDuel]);

  const handlePetAutoToggle = useCallback(() => {
    if (petCommandRef.current === "auto") {
      applyPetCommand("follow");
      setToast("オートを停止");
    } else {
      applyPetCommand("auto");
      autoAttackCooldownRef.current = performance.now() + 400;
      setToast(MOE_PET_COMMAND_UI.auto.toast);
    }
  }, [applyPetCommand]);

  const handleEnemySelect = useCallback(
    (id, e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      const target = enemiesRef.current.find((en) => en.id === id);
      if (!target || target.hp <= 0) return;
      targetEnemyIdRef.current = id;
      const label = `${target.emoji} ${target.name} Lv.${formatEnemyLevelUi(target.level)}`;
      setPetFocused(false);
      setTargetEnemyId(id);
      setToast(`ターゲット: ${label}`);
    },
    []
  );

  const handlePetSelect = useCallback((e) => {
    if (e?.button === 2) return;
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setAllyTarget("pet");
    saveMoeAllyTarget("pet");
    setPetFocused((prev) => {
      const next = !prev;
      if (next) {
        setTargetEnemyId(null);
        const data = MOE_PET_DATA[pet.id] || MOE_PET_DATA.sun_spirit;
        setToast(`ペット: ${data.name} Lv.${petLevelDisplay}`);
      }
      return next;
    });
  }, [pet.id, petLevelDisplay]);

  const handlePetDoubleClick = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (pet.id !== "mystery_dragon" || !pet.rebornPhoenix) return;
    setDragonFormFlow(true);
  }, [pet.id, pet.rebornPhoenix]);

  const handlePetAttackCommand = useCallback(() => {
    if (targetEnemyId == null) {
      setToast("ターゲットを選んでください（敵をクリック）");
      return;
    }
    const target = enemiesRef.current.find((en) => en.id === targetEnemyId);
    if (!target || target.hp <= 0) {
      setTargetEnemyId(null);
      setToast("ターゲットが無効です");
      return;
    }
    startDuelWithEnemy(targetEnemyId);
  }, [startDuelWithEnemy, targetEnemyId]);

  useEffect(() => {
    if (targetEnemyId == null) return;
    const en = enemiesRef.current.find((e) => e.id === targetEnemyId);
    if (!en || en.hp <= 0) {
      setTargetEnemyId(null);
      setEnemyStatSearchOpen(false);
    }
  }, [enemies, targetEnemyId]);

  useEffect(() => {
    if (!duel || duel.phase !== "simultaneous_charge") return;
    const sessionId = ++duelCombatSessionRef.current;
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      if (sessionId !== duelCombatSessionRef.current) return;
      const d = duelRef.current;
      if (d && d.phase === "simultaneous_charge") {
        const live = enemiesRef.current.find((e) => e.id === d.enemyId);
        if (!live || live.hp <= 0) {
          endActiveDuel();
        } else {
          const dt =
            Math.min(0.08, (now - last) / 1000) * battleSpeedMultRef.current;
          last = now;
          let petBar = d.petBar + dt / d.petChargeSec;
          let enemyBar = d.enemyBar + dt / d.enemyChargeSec;
          const enemyId = d.enemyId;
          let duelEnded = false;

          while (petBar >= 1) {
            petBar -= 1;
            const ended = applyPetStrikeRef.current(enemyId);
            if (ended) {
              endActiveDuel();
              duelEnded = true;
              break;
            }
          }

          while (!duelEnded && enemyBar >= 1) {
            if (sessionId !== duelCombatSessionRef.current) {
              duelEnded = true;
              break;
            }
            const dr = duelRef.current;
            if (!dr || dr.phase !== "simultaneous_charge" || dr.enemyId !== enemyId) {
              duelEnded = true;
              break;
            }
            const live2 = enemiesRef.current.find((e) => e.id === enemyId);
            if (!live2 || live2.hp <= 0) {
              endActiveDuel();
              duelEnded = true;
              break;
            }
            enemyBar -= 1;
            const ended = applyEnemyStrikeRef.current(enemyId);
            if (ended) {
              duelEnded = true;
              break;
            }
          }

          if (!duelEnded && sessionId === duelCombatSessionRef.current) {
            const liveCheck = enemiesRef.current.find((e) => e.id === enemyId);
            if (!liveCheck || liveCheck.hp <= 0) {
              endActiveDuel();
            } else {
              const next = {
                ...d,
                petBar,
                enemyBar,
              };
              duelRef.current = next;
            }
          }
        }
      }
      if (sessionId !== duelCombatSessionRef.current) return;
      const d2 = duelRef.current;
      if (d2 && d2.phase === "simultaneous_charge") {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      duelCombatSessionRef.current += 1;
      cancelAnimationFrame(raf);
    };
  }, [duel?.phase, duel?.enemyId, duel?.petChargeSec, duel?.enemyChargeSec, endActiveDuel]);

  const handleHeal = (amount, label, cooldownKey = null, cooldownSec = 0) => {
    if (cooldownKey) {
      const now = Date.now();
      if (now < healCdUntilRef.current[cooldownKey]) return;
      healCdUntilRef.current[cooldownKey] = now + cooldownSec * 1000;
      setHealCdSec((prev) => ({ ...prev, [cooldownKey]: cooldownSec }));
    }
    playSfx("heal");
    setPet((prev) => {
      const raw = Math.min(prev.hpMax, prev.hp + amount);
      const hp = petUsesPreciseWikiStats(prev.id)
        ? roundPetStatInternal(raw)
        : raw;
      return { ...prev, hp };
    });
    setToast(`${label}！✨ (+${amount})`);
  };

  const handleRegenToggle = useCallback(() => {
    setRegenActive((on) => {
      const next = !on;
      setToast(
        next
          ? `リジェネ ON（${PET_REGEN_INTERVAL_SEC}秒ごと HP+${PET_REGEN_HP} MP+${PET_REGEN_MP}）`
          : "リジェネ OFF"
      );
      if (next) playSfx("heal");
      return next;
    });
  }, []);

  const handleBananaMilkToggle = useCallback(() => {
    setBananaMilkActive((on) => {
      const next = !on;
      setToast(
        next
          ? `🍌バナナミルク！ 走行中もスタミナ+${moePlayerBananaMilkStaminaRegenPerSec()}/秒`
          : "バナナミルク効果 OFF"
      );
      if (next) playSfx("heal");
      return next;
    });
  }, []);

  const selectAllyTarget = useCallback(
    (id) => {
      moeDevAssert(
        id === "player" || id === "pet",
        "selectAllyTarget: invalid id",
        { id }
      );
      setAllyTarget(id);
      saveMoeAllyTarget(id);
      allyTargetRef.current = id;
      const petData = MOE_PET_DATA[pet.id] || MOE_PET_DATA.sun_spirit;
      const label =
        id === "player" ? trainerStatus.job ?? "プレイヤー" : petData.name;
      setToast(`支援ターゲット: ${label}`);
    },
    [trainerStatus.job, pet.id]
  );

  const handlePlayerAllySelect = useCallback(() => {
    setPetFocused(false);
    selectAllyTarget("player");
  }, [selectAllyTarget]);

  const handleCondenseMind = useCallback(() => {
    const caster = playerVitalsRef.current;
    const trainerLevel = trainerStatus.level ?? 1;
    const petData = MOE_PET_DATA[pet.id] || MOE_PET_DATA.sun_spirit;
    const targetName =
      allyTarget === "player"
        ? trainerStatus.job ?? "プレイヤー"
        : petData.name;
    const targetVitals =
      allyTarget === "player"
        ? caster
        : { mp: petRef.current.mp, mpMax: petRef.current.mpMax };

    const result = activateCondenseMindOnTarget(
      caster,
      targetVitals,
      allyTarget,
      trainerLevel,
      targetName
    );
    if (!result.ok) {
      setToast(result.toast ?? "使えません");
      return;
    }
    commitPlayerVitals(result.casterVitals);
    if (result.targetKind === "player") {
      playerJirikiSeiranRef.current = null;
      setJirikiSeiranActive(false);
      playerCondenseMindRef.current = result.buff;
    } else {
      atrumMpRegenRef.current = result.buff;
    }
    setCondenseMindActive(true);
    setToast(result.toast ?? "コンデンスマインド！");
    if (result.skillToast) setSkillToast(result.skillToast);
    playSfx("heal");
  }, [
    allyTarget,
    trainerStatus.level,
    trainerStatus.job,
    pet.id,
    commitPlayerVitals,
  ]);

  const warpPlayer3d = useCallback(
    (x, y, toastMsg) => {
      const bounds = worldRef.current;
      if (!bounds?.halfW) return false;
      const playerAt = moe3dClampToPlayBounds(x, y, bounds, 1.5);
      playerPosRef.current = playerAt;
      setPlayer(playerAt);
      const { petAt } = snapPet3dNearPlayer(bounds.halfW, bounds.halfD, playerAt);
      setPet((prev) => ({ ...prev, x: petAt.x, y: petAt.y }));
      setMinimap3d({
        x: playerAt.x,
        y: playerAt.y,
        yaw: cameraYawRef.current,
      });
      if (toastMsg) setToast(toastMsg);
      return true;
    },
    [snapPet3dNearPlayer]
  );

  /** SOS — ペットをプレイヤー（またはすぐそば）へ即ワープ */
  const handlePetSosRecall = useCallback(() => {
    cancelActiveDuel();
    applyPetCommand("follow");
    waitAnchorRef.current = null;
    petHoldYawRef.current = null;
    petRunAnimRef.current = false;
    playerJumpRef.current = { offset: 0, vy: 0 };

    const playerAt = { ...playerPosRef.current };
    const petAt = moe3dPetStartNearPlayer(playerAt);
    petPosRef.current = petAt;
    if (worldRef.current?.mode3d) {
      petSpawnEpochRef.current += 1;
    }
    setPet((prev) => ({ ...prev, x: petAt.x, y: petAt.y }));
    setToast("🆘 ペットを呼び寄せた！");
  }, [applyPetCommand, cancelActiveDuel]);

  const handleEnemyStatSearch = useCallback(() => {
    const tid = targetEnemyIdRef.current;
    const en = enemiesRef.current.find((e) => e.id === tid && e.hp > 0);
    if (!en) {
      setEnemyStatSearchOpen(false);
      setToast("敵をクリックしてターゲットを選んでください");
      return;
    }
    setEnemyStatSearchOpen((wasOpen) => {
      const next = !wasOpen;
      if (next) setToast(`🔍 ${en.emoji} ${en.name} を調べた`);
      return next;
    });
  }, []);

  const cancelSkillChant = useCallback(() => {
    if (!skillChantRef.current) return;
    skillChantRef.current = null;
    setSkillChant(null);
    setSkillChantRemainSec(null);
  }, []);

  cancelSkillChantRef.current = cancelSkillChant;

  const completeSkillChant = useCallback(() => {
    const chant = skillChantRef.current;
    skillChantRef.current = null;
    setSkillChant(null);
    setSkillChantRemainSec(null);
    if (!chant) return;

    if (chant.kind === "holy_record") {
      const recordCount = countMoeHolyRecordItems();
      if (recordCount >= MOE_HOLY_RECORD_MAX_STONES) {
        setToast(`ホーリーレコードは最大${MOE_HOLY_RECORD_MAX_STONES}個までです`);
        return;
      }
      const record = createMoeHolyRecordStone(chant.x, chant.y, recordCount + 1);
      const boxItem = moeHolyRecordToBoxItem(record);
      if (!addMoeItemBoxItem(boxItem)) {
        setToast("アイテムボックスに空きがありません");
        return;
      }
      setToast(
        `📜 ホーリーレコードをアイテム枠に入れました\n${formatMoe3dHudCoordLabel(record.x, record.y)}（${recordCount + 1}/${MOE_HOLY_RECORD_MAX_STONES}）`
      );
      playSfx("heal");
      return;
    }

    if (chant.kind === "teleport") {
      const ok = warpPlayer3d(
        chant.targetX,
        chant.targetY,
        chant.fromRecord
          ? `🌀 ${chant.targetLabel} へテレポートしました\n${formatMoe3dHudCoordLabel(chant.targetX, chant.targetY)}`
          : `🌀 ビスク中央へテレポートしました\n${formatMoe3dHudCoordLabel(chant.targetX, chant.targetY)}`
      );
      if (ok) playSfx("heal");
      return;
    }

    if (chant.kind === "phoenix" && chant.skill) {
      applyPhoenixPlayerChantEffect(chant.skill);
    }
  }, [warpPlayer3d, applyPhoenixPlayerChantEffect]);

  const startHolyRecordChant = useCallback(() => {
    if (!is3d) return;
    if (skillChantRef.current) return;
    if (duelRef.current) {
      setToast("戦闘中はホーリーレコードを使えません");
      return;
    }
    if (countMoeHolyRecordItems() >= MOE_HOLY_RECORD_MAX_STONES) {
      setToast(`ホーリーレコードは最大${MOE_HOLY_RECORD_MAX_STONES}個までです`);
      return;
    }
    const pos = playerPosRef.current;
    const startedAt = Date.now();
    skillChantRef.current = {
      kind: "holy_record",
      x: pos.x,
      y: pos.y,
      startedAt,
      chantSec: MOE_HOLY_RECORD_CHANT_SEC,
    };
    setSkillChant(skillChantRef.current);
    setSkillChantRemainSec(MOE_HOLY_RECORD_CHANT_SEC);
    setToast(`📜 ホーリーレコードを詠唱中…（${MOE_HOLY_RECORD_CHANT_SEC}秒）`);
  }, [is3d]);

  const resolveTeleportTarget = useCallback(() => {
    const idx = loadMoeItemBoxSelectedIndex();
    const slots = loadMoeItemBoxSlots();
    const item = idx != null ? slots[idx] : null;
    if (isMoeHolyRecordBoxItem(item)) {
      return {
        targetX: item.recordX ?? 0,
        targetY: item.recordY ?? 0,
        targetLabel: item.label ?? "ホーリーRレコード",
        fromRecord: true,
      };
    }
    const bisk = moe3dBiskWorldCenter();
    return {
      targetX: bisk.x,
      targetY: bisk.y,
      targetLabel: "ビスク中央",
      fromRecord: false,
    };
  }, []);

  const startTeleportChant = useCallback(() => {
    if (!is3d) return;
    if (skillChantRef.current) return;
    if (duelRef.current) {
      setToast("戦闘中はテレポートできません");
      return;
    }
    const target = resolveTeleportTarget();
    const startedAt = Date.now();
    skillChantRef.current = {
      kind: "teleport",
      startedAt,
      chantSec: MOE_TELEPORT_CHANT_SEC,
      ...target,
    };
    setSkillChant(skillChantRef.current);
    setSkillChantRemainSec(MOE_TELEPORT_CHANT_SEC);
    setToast(
      target.fromRecord
        ? `🌀 ${target.targetLabel} へテレポート詠唱中…（${MOE_TELEPORT_CHANT_SEC}秒）`
        : `🌀 ビスク中央へテレポート詠唱中…（${MOE_TELEPORT_CHANT_SEC}秒）`
    );
  }, [is3d, resolveTeleportTarget]);

  useEffect(() => {
    const syncSelection = () =>
      setItemBoxSelectedIndex(loadMoeItemBoxSelectedIndex());
    syncSelection();
    window.addEventListener(MOE_ITEM_BOX_SELECTED_EVENT, syncSelection);
    window.addEventListener(MOE_ITEM_BOX_SLOTS_EVENT, syncSelection);
    return () => {
      window.removeEventListener(MOE_ITEM_BOX_SELECTED_EVENT, syncSelection);
      window.removeEventListener(MOE_ITEM_BOX_SLOTS_EVENT, syncSelection);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = performance.now();
      const active = isMoeKakureminoActive(kakureminoUntilRef.current, now);
      if (active !== kakureminoActive) setKakureminoActive(active);
      const remain = moeKakureminoActiveRemainSec(
        kakureminoUntilRef.current,
        now
      );
      if (remain !== kakureminoRemainSec) setKakureminoRemainSec(remain);
      const cd = moeKakureminoCooldownRemainSec(
        kakureminoCooldownUntilRef.current,
        now,
        kakureminoUntilRef.current
      );
      if (cd !== kakureminoCooldownSec) setKakureminoCooldownSec(cd);
      setBuffUiNow(now);
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [kakureminoActive, kakureminoRemainSec, kakureminoCooldownSec]);

  useEffect(() => {
    if (!skillChant) return undefined;
    const tick = () => {
      const chant = skillChantRef.current;
      if (!chant) return;
      const chantSec = chant.chantSec ?? MOE_HOLY_RECORD_CHANT_SEC;
      const elapsed = Date.now() - chant.startedAt;
      const remainMs = chantSec * 1000 - elapsed;
      if (remainMs <= 0) {
        completeSkillChant();
        return;
      }
      setSkillChantRemainSec(Math.max(1, Math.ceil(remainMs / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [skillChant, completeSkillChant]);

  const teleportRecordCtx = useMemo(() => {
    const slots = loadMoeItemBoxSlots();
    const item =
      itemBoxSelectedIndex != null ? slots[itemBoxSelectedIndex] : null;
    if (!isMoeHolyRecordBoxItem(item)) {
      return { selected: false, label: null };
    }
    return { selected: true, label: item.label ?? "ホーリーRレコード" };
  }, [itemBoxSelectedIndex]);

  const playerOrderedSkillSlots = useMemo(() => {
    const ninjaById = {
      ninja_shinobiashi: playerSkillIconSlots[0],
      ninja_shinsoku: playerSkillIconSlots[1],
      ninja_kakuremino: playerSkillIconSlots[2],
    };
    const condenseMindActiveOnTarget =
      allyTarget === "player"
        ? isPlayerCondenseMindActive(playerCondenseMindRef)
        : isAtrumManaAmpActive(atrumMpRegenRef);
    const ctx = {
      healCdSec,
      regenActive,
      bananaMilkActive,
      trainerLevel: trainerStatus.level ?? 1,
      allyTarget,
      allyTargetMp: allyTarget === "player" ? playerVitals.mp : pet.mp,
      allyTargetMpMax: allyTarget === "player" ? playerVitals.mpMax : pet.mpMax,
      condenseMindActiveOnTarget,
      playerMp: playerVitals.mp,
      playerMpMax: playerVitals.mpMax,
      condenseMindMpCost: PLAYER_CONDENSE_MIND_MP_COST,
      condenseMindMpPerSec: PLAYER_CONDENSE_MIND_MP_PER_SEC,
      shinobiashiOn,
      kakureminoActive,
      kakureminoCooldownSec,
      dashBoost3x,
      playerSkillCooldownSec,
      ninjaById,
      healAmountLight: HEAL_AMOUNT_LIGHT,
      healAmountHeal: HEAL_AMOUNT_HEALING,
      healAmountAll: HEAL_AMOUNT_HEAL_ALL,
      petRegenHp: PET_REGEN_HP,
      petRegenMp: PET_REGEN_MP,
      skillChanting: Boolean(skillChant),
      skillChantKind: skillChant?.kind ?? null,
      skillChantRemainSec,
      holyRecordMaxStones: MOE_HOLY_RECORD_MAX_STONES,
      teleportRecordSelected: teleportRecordCtx.selected,
      teleportRecordLabel: teleportRecordCtx.label,
      onHolyRecord: startHolyRecordChant,
      onTeleport: startTeleportChant,
      onLight: () => handleHeal(HEAL_AMOUNT_LIGHT, "ライトヒール"),
      onHeal: () =>
        handleHeal(
          HEAL_AMOUNT_HEALING,
          "ヒーリング",
          "healing",
          HEAL_COOLDOWN_HEALING_SEC
        ),
      onHealAll: () =>
        handleHeal(
          HEAL_AMOUNT_HEAL_ALL,
          "ヒーリングオール",
          "healAll",
          HEAL_COOLDOWN_HEAL_ALL_SEC
        ),
      onRegenToggle: handleRegenToggle,
      onBananaMilkToggle: handleBananaMilkToggle,
      onCondenseMind: handleCondenseMind,
      onNinja: (skill) => activatePlayerSkillSlot(0, skill),
    };
    return playerSkillSlotOrder.map((key, slotIndex) =>
      buildPlayerSkillSlotEntry(key, slotIndex, ctx)
    );
  }, [
    playerSkillSlotOrder,
    playerSkillIconSlots,
    healCdSec,
    regenActive,
    bananaMilkActive,
    allyTarget,
    pet.mp,
    pet.mpMax,
    playerVitals.mp,
    playerVitals.mpMax,
    shinobiashiOn,
    kakureminoActive,
    kakureminoCooldownSec,
    dashBoost3x,
    playerSkillCooldownSec,
    handleRegenToggle,
    handleBananaMilkToggle,
    handleCondenseMind,
    trainerStatus.level,
    activatePlayerSkillSlot,
    skillChant,
    skillChantRemainSec,
    startHolyRecordChant,
    startTeleportChant,
    teleportRecordCtx,
  ]);

  const playerUtilityOrderedSlots = useMemo(() => {
    const ctx = {
      onEnemyStatSearch: handleEnemyStatSearch,
      onActivatePreSkill: activatePlayerPreSkill,
      playerPreSkillProgress,
      playerMp: playerVitals.mp,
      inDuel: Boolean(duel),
      targetEnemy:
        targetEnemyId != null
          ? enemies.find((e) => e.id === targetEnemyId && e.hp > 0) ?? null
          : null,
      enemyStatSearchOpen,
    };
    return defaultPlayerUtilitySlotOrder().map((key, slotIndex) =>
      buildPlayerUtilitySkillSlotEntry(key, slotIndex, ctx)
    );
  }, [
    handleEnemyStatSearch,
    activatePlayerPreSkill,
    playerPreSkillProgress,
    playerVitals.mp,
    duel,
    targetEnemyId,
    enemies,
    enemyStatSearchOpen,
  ]);

  const swapPlayerSkillSlots = useCallback((from, to) => {
    setPlayerSkillSlotOrder((prev) => {
      const next = swapPlayerSkillSlotOrder(prev, from, to);
      savePlayerSkillSlotOrder(next);
      return next;
    });
  }, []);

  const playerPhoenixOrderedSlots = useMemo(
    () =>
      buildPlayerPhoenixSkillSlotEntries(
        playerSkill2Progress,
        activatePlayerPhoenixSkill,
        {
          skillChanting: Boolean(skillChant),
          skillChantKind: skillChant?.kind ?? null,
          skillChantSkillId: skillChant?.skillId ?? null,
          skillChantRemainSec,
          phoenixHabitAtk2x,
          jirikiSeiranActive: isJirikiSeiranActive(playerJirikiSeiranRef),
          playerMp: playerVitals.mp,
        }
      ),
    [
      playerSkill2Progress,
      activatePlayerPhoenixSkill,
      skillChant,
      skillChantRemainSec,
      phoenixHabitAtk2x,
      jirikiSeiranActive,
      playerVitals.mp,
    ]
  );

  const mapPlayerVerticalSkillSlots = useCallback(
    (orderedSlots, includeHabitPreview = false) => {
      const rows = orderedSlots.map(
        ({
          slotKey,
          label,
          subLabel,
          disabled,
          unusable,
          active,
          cooldownSec,
          title,
          onClick,
          reorderable,
        }) => ({
          slotKey,
          label,
          subLabel,
          disabled,
          unusable,
          active,
          cooldownSec,
          title,
          onClick,
          reorderable,
        })
      );
      if (includeHabitPreview) {
        const purifyIdx = rows.findIndex(
          (r) => r.slotKey === "phoenix_purify_rebirth"
        );
        if (purifyIdx >= 0) {
          rows.splice(purifyIdx + 1, 0, {
            label: "習慣改鳳",
            disabled: true,
            previewOnly: true,
            title: "名称プレビュー（みるだけ）",
            reorderable: false,
          });
        }
      }
      return rows;
    },
    []
  );

  const playerVerticalSkillSlotsSet1 = useMemo(
    () => mapPlayerVerticalSkillSlots(playerOrderedSkillSlots),
    [mapPlayerVerticalSkillSlots, playerOrderedSkillSlots]
  );

  const playerVerticalSkillSlotsSet2 = useMemo(
    () => mapPlayerVerticalSkillSlots(playerPhoenixOrderedSlots, true),
    [mapPlayerVerticalSkillSlots, playerPhoenixOrderedSlots]
  );

  const playerVerticalSkillSlotsSet3 = useMemo(
    () => mapPlayerVerticalSkillSlots(playerUtilityOrderedSlots),
    [mapPlayerVerticalSkillSlots, playerUtilityOrderedSlots]
  );

  const petVerticalSkillSlots = useMemo(
    () =>
      skillPanelLabels.map((label, i) => {
        const skill = combatSkillSlots[i];
        const locked =
          petSkillMode === MOE_PET_SKILL_MODE_LEARNED &&
          skill &&
          !isMoePetSkillUsableAtLevel(skill, petCombatLevel, petSkillMode);
        const skillName = skill?.name ?? "";
        return {
          label: skillName || label,
          disabled: !skill || locked,
          title: skill
            ? formatMoeSkillHoverTip(skill, { locked })
            : label,
          onClick: () => activateCombatSkillSlot(i, skill),
        };
      }),
    [
      skillPanelLabels,
      combatSkillSlots,
      petSkillMode,
      petCombatLevel,
      activateCombatSkillSlot,
    ]
  );

  const activePetSkillTitle = dataForSkillSlots.name
    ? `ペット（${dataForSkillSlots.name}）`
    : "ペット";

  const mergedSkillPanelProps = {
    showPlayer: is3d,
    petLabel: activePetSkillTitle,
    pet: {
      topAction: {
        label: battleSpeed2x ? "⚡×2 ON" : "⚡×2",
        active: battleSpeed2x,
        title: "交戦中：チャージ・スタン・攻撃アニメを2倍速",
        onClick: () => setBattleSpeed2x((v) => !v),
      },
      slots: petVerticalSkillSlots,
    },
    player1: {
      slots: playerVerticalSkillSlotsSet1,
      reorderable: true,
      onSwapSlots: swapPlayerSkillSlots,
    },
    player2: {
      slots: playerVerticalSkillSlotsSet2,
    },
    player3: {
      slots: playerVerticalSkillSlotsSet3,
    },
  };

  const mergedIconBarProps = {
    showPlayer: is3d,
    petLabel: activePetSkillTitle,
    petSlots: skillIconSlots,
    onPetActivate: activateCombatSkillSlot,
    isPetSkillUsable: (skill) =>
      isMoePetSkillUsableAtLevel(skill, petCombatLevel, petSkillMode),
    player1Slots: playerOrderedSkillSlots,
    player2Slots: playerPhoenixOrderedSlots,
    player3Slots: playerUtilityOrderedSlots,
    onSwapPlayer1Slots: swapPlayerSkillSlots,
  };

  const visibleMonsterLineup = useMemo(
    () => filterShowcaseLineupByIds(MOE_MONSTER_LINEUP, hiddenMonsterShowcaseIds),
    [hiddenMonsterShowcaseIds]
  );
  const visibleDragonLineup = useMemo(
    () => filterShowcaseLineupByIds(MOE_DRAGON_LINEUP, hiddenDragonShowcaseIds),
    [hiddenDragonShowcaseIds]
  );

  const toggleMonsterDeleteList = useCallback((id) => {
    setMonsterDeleteListIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleDragonDeleteList = useCallback((id) => {
    setDragonDeleteListIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const applyMonsterDeleteList = useCallback(async () => {
    if (monsterDeleteListIds.length === 0) return;
    const count = monsterDeleteListIds.length;
    if (
      !window.confirm(
        `削除リスト ${count}体を\n・ゲーム内で非表示\n・data/moeShowcaseDeleteQueue.json に保存\nしますか？\n\nGLBファイルの完全削除は Cursor で\nnpm run apply:showcase-delete:dry-run\nnpm run apply:showcase-delete`
      )
    ) {
      return;
    }
    try {
      const entries = monsterDeleteListIds.map((id) => {
        const v = MOE_MONSTER_LINEUP.find((x) => x.id === id);
        return {
          id,
          nameJa: v?.nameJa ?? id,
          file: v?.file ?? "",
          variantLabel: v?.variantLabel,
          note: v?.note,
        };
      });
      await appendShowcaseDeleteQueue("monster", entries);
      const next = addHiddenShowcaseIds("monster", monsterDeleteListIds);
      setHiddenMonsterShowcaseIds(next);
      setMonsterDeleteListIds([]);
      setToast(
        `敵 ${count}体を非表示＋削除キュー保存（data/moeShowcaseDeleteQueue.json）`
      );
    } catch (err) {
      setToast(
        err instanceof Error ? err.message : "削除キューの保存に失敗しました"
      );
    }
  }, [monsterDeleteListIds]);

  const applyDragonDeleteList = useCallback(async () => {
    if (dragonDeleteListIds.length === 0) return;
    const count = dragonDeleteListIds.length;
    if (
      !window.confirm(
        `削除リスト ${count}体を\n・ゲーム内で非表示\n・data/moeShowcaseDeleteQueue.json に保存\nしますか？\n\nGLBファイルの完全削除は Cursor で\nnpm run apply:showcase-delete:dry-run\nnpm run apply:showcase-delete`
      )
    ) {
      return;
    }
    try {
      const entries = dragonDeleteListIds.map((id) => {
        const v = MOE_DRAGON_LINEUP.find((x) => x.id === id);
        return {
          id,
          nameJa: v?.nameJa ?? id,
          file: v?.file ?? "",
          note: v?.note,
        };
      });
      await appendShowcaseDeleteQueue("dragon", entries);
      const next = addHiddenShowcaseIds("dragon", dragonDeleteListIds);
      setHiddenDragonShowcaseIds(next);
      setDragonDeleteListIds([]);
      setToast(
        `ドラゴン ${count}体を非表示＋削除キュー保存（data/moeShowcaseDeleteQueue.json）`
      );
    } catch (err) {
      setToast(
        err instanceof Error ? err.message : "削除キューの保存に失敗しました"
      );
    }
  }, [dragonDeleteListIds]);

  const handlePetExpReset = () => {
    if (
      !window.confirm(
        "ペットのレベル・経験値を本当にリセットしますか？\n現在選んでいるペットのまま、Lv." +
          INITIAL_MOE_PET_LEVEL +
          "・EXPバー0・HP/MP全快に戻します。"
      )
    ) {
      return;
    }
    setPet((prev) => {
      const stats = calculatePetStats(prev.id, INITIAL_MOE_PET_LEVEL);
      const totalExp = getMoePetFreshTotalExpForLevel(INITIAL_MOE_PET_LEVEL);
      return {
        ...prev,
        level: INITIAL_MOE_PET_LEVEL,
        totalExp,
        expIntoLevel: 0,
        hp: stats?.hpMax ?? prev.hpMax,
        hpMax: stats?.hpMax ?? prev.hpMax,
        mp: stats?.mpMax ?? prev.mpMax,
        mpMax: stats?.mpMax ?? prev.mpMax,
      };
    });
    setToast("ペットのLvとEXPをリセットした！");
  };

  const applyPetId = (newId) => {
    if (newId === pet.id || !MOE_PET_DATA[newId]) return;
    if (josephCrystallizedPetIds.includes(newId)) {
      setToast("そのペットはクリスタル化されています（リロードで戻ります）");
      return;
    }
    const prevSave = loadMoePetsSave();
    writeMoePetsSave({ activeId: newId, byId: prevSave.byId });
    const next = petFromSaveSlot(newId, prevSave.byId[newId]);
    setPet((prev) => ({ ...next, x: prev.x, y: prev.y }));
    petRef.current = { ...next, x: pet.x, y: pet.y };
    petStateRef.current = petRef.current;
    setToast(`${MOE_PET_DATA[newId].name}に交代！`);
  };

  const cyclePet = (delta) => {
    const ids = MOE_PET_IDS.filter((id) => !josephCrystallizedPetIds.includes(id));
    const n = ids.length;
    if (n < 2) return;
    let idx = ids.indexOf(pet.id);
    if (idx < 0) idx = 0;
    const nextIdx = (idx + delta + n) % n;
    applyPetId(ids[nextIdx]);
  };

  const markJosephPetCrystallized = useCallback((petId) => {
    addJosephCrystallizedPetId(petId);
    setJosephCrystallizedPetIds((prev) => {
      const next = prev.includes(petId) ? prev : [...prev, petId];
      if (petStateRef.current?.id === petId) {
        const switchId = MOE_PET_IDS.find(
          (id) => id !== petId && !next.includes(id)
        );
        if (switchId) {
          queueMicrotask(() => {
            const save = loadMoePetsSave();
            writeMoePetsSave({
              ...save,
              activeId: switchId,
            });
            const switched = petFromSaveSlot(switchId, save.byId[switchId]);
            setPet((prev) => ({ ...switched, x: prev.x, y: prev.y }));
            setToast(`${MOE_PET_DATA[switchId].name}に交代（${MOE_PET_DATA[petId].name}はクリスタル化）`);
          });
        }
      }
      return next;
    });
  }, []);

  const openPetMasterDialogue = useCallback(() => {
    setPetMasterDialogue({ view: "menu" });
  }, []);

  const handlePetMasterTalk = useCallback(() => {
    if (is3d) {
      if (!nearPetHouseRef.current) {
        setToast("ペット小屋の近くで話しかけてください");
        return;
      }
    } else if (world?.rowLayout?.length) {
      const pos = playerPosRef.current;
      if (
        !moe2dIsNearPetHouse(pos.x, pos.y, world.rowLayout, world.mw)
      ) {
        setToast("ペット小屋の近くで話しかけてください");
        return;
      }
    }
    openPetMasterDialogue();
  }, [is3d, openPetMasterDialogue, world?.rowLayout, world?.mw]);

  const handleExpVendorTalk = useCallback(() => {
    if (is3d) {
      if (!nearPetHouseRef.current) {
        setToast("ペット小屋の近くで話しかけてください");
        return;
      }
    } else if (world?.rowLayout?.length) {
      const pos = playerPosRef.current;
      if (
        !moe2dIsNearPetHouse(pos.x, pos.y, world.rowLayout, world.mw)
      ) {
        setToast("ペット小屋の近くで話しかけてください");
        return;
      }
    }
    setExpVendorLineIndex(0);
    setExpVendorView("lines");
    setExpVendorOpen(true);
  }, [is3d, world?.rowLayout, world?.mw]);

  const closeExpVendor = useCallback(() => {
    setExpVendorOpen(false);
    setExpVendorView("lines");
    setExpVendorLineIndex(0);
  }, []);

  const handleRhodaTalk = useCallback(() => {
    if (is3d) {
      if (!nearRhodaRef.current) {
        setToast(`${MOE_SOUL_MEMORY_RHODA_FIELD.spotLabel}の近くで話しかけてください`);
        return;
      }
    } else if (world?.rowLayout?.length) {
      const pos = playerPosRef.current;
      if (
        !moe2dIsNearRhoda(pos.x, pos.y, world.rowLayout, world.mw)
      ) {
        setToast(`${MOE_SOUL_MEMORY_RHODA_FIELD.spotLabel}の近くで話しかけてください`);
        return;
      }
    }
    setRhodaLineIndex(0);
    setRhodaView("lines");
    setRhodaOpen(true);
  }, [is3d, world?.rowLayout, world?.mw]);

  const handleRhodaShrineClick = useCallback(() => {
    setRhodaLineIndex(0);
    setRhodaView("lines");
    setRhodaOpen(true);
  }, []);

  const openAltarPanel = useCallback((altar) => {
    if (!altar) return;
    setActiveAltar(altar);
    setAltarOpen(true);
  }, []);

  const handleAltarOpen = useCallback(() => {
    openAltarPanel(nearAltarRef.current);
  }, [openAltarPanel]);

  const handleAltarClickById = useCallback(
    (altarId) => {
      const altar = MOE_ALTARS.find((a) => a.id === altarId) ?? null;
      openAltarPanel(altar);
    },
    [openAltarPanel]
  );

  const closeAltar = useCallback(() => {
    setAltarOpen(false);
    setActiveAltar(null);
  }, []);

  const openTrainingGuide = useCallback(() => {
    trainingGuideInHouseRef.current = false;
    setTrainingGuideInHouse(false);
    setTrainingGuideOpen(true);
  }, []);

  const openTrainingGuideFromHouse = useCallback(() => {
    trainingGuideInHouseRef.current = true;
    setTrainingGuideInHouse(true);
    setTrainingGuideOpen(true);
    requestMoeFieldZoneBgm(MOE_TRAINING_GUIDE_BGM_MAP_SLOT);
  }, []);

  const enterAgeHubHouse = useCallback(() => {
    setToast(MOE_AGE_HUB_HOUSE.enterToast);
  }, []);

  const closeTrainingGuide = useCallback(() => {
    setTrainingGuideOpen(false);
    if (trainingGuideInHouseRef.current) {
      trainingGuideInHouseRef.current = false;
      setTrainingGuideInHouse(false);
      const mapSlotId = fieldBgmMapSlotRef.current;
      if (mapSlotId) requestMoeFieldZoneBgm(mapSlotId);
    }
  }, []);

  const handleTrainingGuideChant = useCallback(
    (phrase) => {
      if (!moeTrainingGuideChantMatches(phrase)) {
        setToast(MOE_PET_TRAINING_GUIDE_HOUSE.chantMismatch);
        return;
      }
      const cur = petRef.current ?? petStateRef.current;
      const result = applyMoeTrainingGuideHpBonus(cur);
      if (!result.applied) {
        if (result.reason === "no_pet") {
          setToast("ペットが見つかりません");
          return;
        }
        setToast(MOE_PET_TRAINING_GUIDE_HOUSE.chantAlready);
        return;
      }
      setPet((prev) => {
        const next = {
          ...result.pet,
          x: prev.x,
          y: prev.y,
          mp: prev.mp,
          mpMax: prev.mpMax,
        };
        petRef.current = next;
        petStateRef.current = next;
        return next;
      });
      const pos = petPosRef.current;
      pushWorldHealPopup(pos.x, pos.y, MOE_TRAINING_GUIDE_HP_BONUS);
      setToast(MOE_PET_TRAINING_GUIDE_HOUSE.chantSuccess);
      playSfx("heal");
    },
    [pushWorldHealPopup]
  );

  const handleAltarWarp = useCallback(
    (destId) => {
      const dest = moeAltarDestinationById(destId);
      const bounds = worldRef.current;
      const tw = bounds?.tileWidth;
      const td = bounds?.tileDepth;
      if (!dest?.available || !tw || !td || !bounds?.halfW) return;
      const spawn = moe3dWarpDestSpawnWorld(dest, tw, td, {
        halfW: bounds.halfW,
        halfD: bounds.halfD,
      });
      if (!spawn) return;
      let playerAt = moe3dClampToPlayBounds(spawn.x, spawn.y, bounds, 1.5);
      if (MOE_AGE_MAP_SLOT_IDS.has(dest.mapSlotId)) {
        playerAt = moe3dClampToMapSlotRect(
          spawn.x,
          spawn.y,
          dest.mapSlotId,
          tw,
          td,
          2.5
        );
      }
      playerPosRef.current = playerAt;
      setPlayer(playerAt);
      const { petAt } = snapPet3dNearPlayer(bounds.halfW, bounds.halfD, playerAt);
      setPet((prev) => ({ ...prev, x: petAt.x, y: petAt.y }));
      setMinimap3d({
        x: playerAt.x,
        y: playerAt.y,
        yaw: cameraYawRef.current,
      });
      closeAltar();
      fieldBgmMapSlotRef.current = dest.mapSlotId;
      requestMoeFieldZoneBgm(dest.mapSlotId);
      const warpToast = `${dest.emoji ?? "✨"} ${dest.nameJa} へ転送しました`;
      setToast(dest.travelMemo ? `${warpToast}\n📝 ${dest.travelMemo}` : warpToast);
    },
    [closeAltar, snapPet3dNearPlayer]
  );

  const closeRhoda = useCallback(() => {
    setRhodaOpen(false);
    setRhodaView("lines");
    setRhodaLineIndex(0);
  }, []);

  const handleRhodaCatalogAction = useCallback((actionId) => {
    const lootByAction = {
      give_experience_powder: MOE_ITEM_EXPERIENCE_POWDER,
      give_experience_cube: MOE_ITEM_EXPERIENCE_CUBE,
      give_level_down_powder: MOE_ITEM_LEVEL_DOWN_POWDER,
      give_level_down_cube: MOE_ITEM_LEVEL_DOWN_CUBE,
      give_phoenix_feather: MOE_ITEM_PHOENIX_FEATHER,
    };
    const loot = lootByAction[actionId];
    if (!loot) return;
    const boxItem = moeFieldLootToBoxItem(loot);
    if (!boxItem || !addMoeItemBoxItem(boxItem)) {
      setToast("アイテムボックスに空きがありません");
      return;
    }
    setToast(`${loot.label}を受け取った！`);
  }, []);

  const openCashShopDialogue = useCallback(() => {
    setCashShopLineIndex(0);
    setCashShopView("lines");
    setCashShopOpen(true);
  }, []);

  const handleCashShopTalk = useCallback(() => {
    if (is3d && !nearCashShopRef.current) {
      setToast("プレミアムショップの近くで話しかけてください");
      return;
    }
    openCashShopDialogue();
  }, [is3d, openCashShopDialogue]);

  const handleCashShopNpcClick = useCallback(() => {
    openCashShopDialogue();
  }, [openCashShopDialogue]);

  const closeCashShop = useCallback(() => {
    setCashShopOpen(false);
    setCashShopView("lines");
    setCashShopLineIndex(0);
  }, []);

  const handleCashShopCatalogAction = useCallback((actionId) => {
    const itemDef = MOE_CASH_SHOP_ITEM_BY_ACTION[actionId];
    if (!itemDef) return;
    const boxItem = moeCashShopItemToBoxItem(itemDef);
    if (!boxItem || !addMoeItemBoxItem(boxItem)) {
      setToast("アイテムボックスに空きがありません");
      return;
    }
    setToast(`${itemDef.label}を受け取った！（お試し配布）`);
  }, []);

  const handleJosephTalk = useCallback(() => {
    if (is3d) {
      if (!nearPetHouseRef.current) {
        setToast("ペット小屋の近くで話しかけてください");
        return;
      }
    } else if (world?.rowLayout?.length) {
      const pos = playerPosRef.current;
      if (
        !moe2dIsNearPetHouse(pos.x, pos.y, world.rowLayout, world.mw)
      ) {
        setToast("ペット小屋の近くで話しかけてください");
        return;
      }
    }
    setJosephLineIndex(0);
    setJosephView("lines");
    setJosephOpen(true);
  }, [is3d, world?.rowLayout, world?.mw]);

  const closeJoseph = useCallback(() => {
    setJosephOpen(false);
    setJosephView("lines");
    setJosephLineIndex(0);
    setJosephResultMessage(null);
    setJosephSacrificePetId(null);
  }, []);

  const handleJosephSynthTalk = useCallback(() => {
    if (is3d) {
      if (!nearPetHouseRef.current) {
        setToast("ペット小屋の近くで話しかけてください");
        return;
      }
    } else if (world?.rowLayout?.length) {
      const pos = playerPosRef.current;
      if (
        !moe2dIsNearPetHouse(pos.x, pos.y, world.rowLayout, world.mw)
      ) {
        setToast("ペット小屋の近くで話しかけてください");
        return;
      }
    }
    setJosephSynthLineIndex(0);
    setJosephSynthView("lines");
    setJosephSynthOpen(true);
  }, [is3d, world?.rowLayout, world?.mw]);

  const closeJosephSynth = useCallback(() => {
    setJosephSynthOpen(false);
    setJosephSynthView("lines");
    setJosephSynthLineIndex(0);
    setJosephSynthResultMessage(null);
    setJosephSynthLastCrystal(null);
  }, []);

  const cancelJosephRitual = useCallback(() => {
    setJosephView("pick_sacrifice");
    setJosephResultMessage(null);
    setJosephSacrificePetId(null);
  }, []);

  const ensureJosephTrialSnapshot = useCallback(() => {
    setPet((prev) => {
      if (petDebugSnapshotRef.current) return prev;
      const snap = {
        totalExp:
          prev.totalExp != null
            ? prev.totalExp
            : getMoePetTotalExpFromLegacyProgress(
                prev.level,
                prev.expIntoLevel ?? 0
              ),
        hp: prev.hp,
        mp: prev.mp,
      };
      petDebugSnapshotRef.current = snap;
      saveMoePetDebugSnapshot(prev.id, snap);
      setHasPetDebugSnapshot(true);
      return prev;
    });
  }, []);

  const applyPetTrialLevel = useCallback((level) => {
    setPet((prev) => {
      if (!petDebugSnapshotRef.current) {
        const snap = {
          totalExp:
            prev.totalExp != null
              ? prev.totalExp
              : getMoePetTotalExpFromLegacyProgress(
                  prev.level,
                  prev.expIntoLevel ?? 0
                ),
          hp: prev.hp,
          mp: prev.mp,
        };
        petDebugSnapshotRef.current = snap;
        saveMoePetDebugSnapshot(prev.id, snap);
        setHasPetDebugSnapshot(true);
      }
      const totalExp = getMoePetFreshTotalExpForLevel(level);
      const frac = getMoePetFractionalLevelFromTotalExp(totalExp);
      const stats = calculatePetStats(prev.id, level);
      const hpMax = stats?.hpMax ?? prev.hpMax;
      const mpMax = stats?.mpMax ?? prev.mpMax;
      const precise = petUsesPreciseWikiStats(prev.id);
      return {
        ...prev,
        level,
        levelDisplay: frac.displayLabel,
        totalExp,
        expIntoLevel: 0,
        hpMax,
        mpMax,
        hp: precise ? roundPetStatInternal(hpMax) : hpMax,
        mp: precise ? roundPetStatInternal(mpMax) : mpMax,
      };
    });
  }, []);

  const applyPetDebugLevel100 = useCallback(() => {
    applyPetTrialLevel(100);
    setToast("🐛 デバッグ: Lv.100 に設定（閉じると元に戻ります）");
  }, [applyPetTrialLevel]);

  const applyJosephTrialPetLevel = useCallback(
    (level) => {
      applyPetTrialLevel(level);
    },
    [applyPetTrialLevel]
  );

  const restorePetDebugSnapshot = useCallback(
    (options = {}) => {
      const { silent = false, closeDialogue = false } = options;
      const petId = petStateRef.current?.id ?? pet.id;
      const snap =
        petDebugSnapshotRef.current ?? loadMoePetDebugSnapshot(petId);
      if (!snap) {
        if (!silent) setToast("戻すデータがありません");
        return false;
      }
      setPet((prev) => {
        const restored = petFromDebugSnapshot(prev.id, snap, {
          x: prev.x,
          y: prev.y,
        });
        persistCurrentMoePet(restored);
        return restored;
      });
      petDebugSnapshotRef.current = null;
      clearMoePetDebugSnapshot(petId);
      setHasPetDebugSnapshot(false);
      if (closeDialogue) setPetMasterDialogue(null);
      if (!silent) setToast("元のLv・EXPに戻しました");
      return true;
    },
    [pet.id]
  );

  const handleJosephCatalogAction = useCallback(
    (actionId) => {
      if (actionId === "restore_trial") {
        clearJosephCrystallizedPetIds();
        setJosephCrystallizedPetIds([]);
        const restored = restorePetDebugSnapshot();
        setJosephView("catalog");
        setJosephResultMessage(null);
        setJosephSacrificePetId(null);
        if (restored) {
          setToast("結晶化お試しを解除し、元のLvに戻しました");
        } else {
          setToast("クリスタル化表示を解除しました");
        }
        return;
      }
      if (actionId !== "start_crystal") return;
      setJosephView("pick_sacrifice");
    },
    [restorePetDebugSnapshot]
  );

  const josephSacrificeMenuActions = useMemo(() => {
    const save = loadMoePetsSave();
    return buildJosephSacrificePetMenuActions(
      save.byId,
      josephCrystallizedPetIds
    );
  }, [josephCrystallizedPetIds, josephOpen, josephView, pet.id, pet.totalExp]);

  const handleJosephSacrificeSelect = useCallback(
    (petId) => {
      if (josephCrystallizedPetIds.includes(petId)) {
        setToast("すでにクリスタルになっています");
        return;
      }
      const save = loadMoePetsSave();
      const totalExp = getJosephPetSlotTotalExp(petId, save.byId);
      if (getMoePetLevelFromTotalExp(totalExp) < MOE_JOSEPH_SACRIFICE_MIN_LEVEL) {
        setToast("Lv100.0未満のペットは渡せません");
        return;
      }
      setJosephSacrificePetId(petId);
      setJosephView("ritual_wait");
    },
    [josephCrystallizedPetIds]
  );

  const handleJosephRitualWaitNext = useCallback(() => {
    setJosephView("ritual_process");
  }, []);

  const handleJosephRitualProcessNext = useCallback(() => {
    if (!josephSacrificePetId) return;
    const save = loadMoePetsSave();
    const sacrificePet = petFromSaveSlot(
      josephSacrificePetId,
      save.byId[josephSacrificePetId]
    );
    const tier = rollJosephExpCrystalTrialTier({ useTimeTablet: josephUseTimeTablet });
    const crystal = createJosephExpCrystalFromPet(tier, sacrificePet);
    const petName = MOE_PET_DATA[josephSacrificePetId]?.name ?? "ペット";
    setJosephResultMessage({
      speaker: "master",
      text: formatJosephCrystalResultMessage(tier, crystal, {
        useTimeTablet: josephUseTimeTablet,
        sacrificePetName: petName,
      }),
    });
    setJosephView("result");
    setToast(
      `${tier.emoji} ${getJosephCrystalResultHeadline(tier)}（${petName} · Lv${crystal.sourceLevelLabel} · お試し）`
    );
  }, [josephSacrificePetId, josephUseTimeTablet]);

  const handleJosephResultMenuSelect = useCallback(
    (id) => {
      if (id === "confirm_sacrifice") {
        if (josephSacrificePetId) {
          markJosephPetCrystallized(josephSacrificePetId);
        }
        setJosephSacrificePetId(null);
        setJosephResultMessage(null);
        setJosephView("catalog");
        setToast("クリスタル化を決定（一覧から消えます · リロードで戻る）");
        return;
      }
      if (id === "retry_crystal") {
        setJosephSacrificePetId(null);
        setJosephResultMessage(null);
        setJosephView("catalog");
      }
    },
    [josephSacrificePetId, markJosephPetCrystallized]
  );

  const josephSynthCrystalPreview = useMemo(() => {
    if (!josephSynthLastCrystal) return null;
    return getJosephCrystalUsePreview(pet, josephSynthLastCrystal);
  }, [pet, josephSynthLastCrystal]);

  const josephSynthTierMenuActions = useMemo(
    () => buildJosephSynthTierMenuActions(josephSynthTrialPetLevel),
    [josephSynthTrialPetLevel]
  );

  const handleJosephSynthCatalogAction = useCallback(
    (actionId) => {
      if (actionId === "restore_trial") {
        if (restorePetDebugSnapshot()) {
          setJosephSynthView("catalog");
          setJosephSynthResultMessage(null);
          setJosephSynthLastCrystal(null);
          setToast("合成お試しを解除し、元のLvに戻しました");
        } else {
          setToast("戻すデータがありません");
        }
        return;
      }
      if (actionId !== "use_on_pet") return;
      ensureJosephTrialSnapshot();
      setJosephSynthView("pick_tier");
    },
    [ensureJosephTrialSnapshot, restorePetDebugSnapshot]
  );

  const handleJosephSynthTierSelect = useCallback(
    (tierId) => {
      const tier = getJosephExpCrystalTierById(tierId);
      if (!tier) return;
      const crystal = createJosephExpCrystal(tier, josephSynthTrialPetLevel);
      setJosephSynthLastCrystal(crystal);
      setJosephSynthView("use_confirm");
    },
    [josephSynthTrialPetLevel]
  );

  const handleJosephSynthUseCrystal = useCallback(() => {
    if (!josephSynthLastCrystal) return;
    const petNow = petStateRef.current;
    const previewBefore = getJosephCrystalUsePreview(
      petNow,
      josephSynthLastCrystal
    );
    const r = applyMoePetExpGain(
      petNow,
      josephSynthLastCrystal.expAmount,
      calculatePetStats
    );
    if (r.gained <= 0) {
      setToast("これ以上レベルが上がりません");
      return;
    }
    setPet((prev) => {
      const next = { ...r.pet, x: prev.x, y: prev.y };
      persistCurrentMoePet(next);
      return next;
    });
    const previewAfter = getJosephCrystalUsePreview(r.pet, josephSynthLastCrystal);
    const petName = MOE_PET_DATA[petNow.id]?.name ?? "ペット";
    setJosephSynthResultMessage({
      speaker: "master",
      text: formatJosephCrystalUseAppliedMessage(
        petName,
        previewBefore,
        previewAfter
      ),
    });
    setJosephSynthView("use_done");
    if (r.leveled || r.tenthLeveled) {
      setToast(r.messages.filter(Boolean).join("　") || "レベルアップ！");
      if (r.tenthLeveled) {
        queueMicrotask(() => triggerPetTenthLevelUpCelebration(r.messages));
      } else if (r.leveled) {
        queueMicrotask(() => {
          setPetLevelUpFlash(formatPetLevelUpFlashText(r.messages));
          playSfx("levelUp");
        });
      }
    } else {
      setToast(`+${r.gained.toLocaleString()} EXP（お試し）`);
    }
  }, [josephSynthLastCrystal, triggerPetTenthLevelUpCelebration]);

  const handleJosephSynthMenuSelect = useCallback(
    (id) => {
      if (id === "use_crystal") {
        handleJosephSynthUseCrystal();
        return;
      }
      if (id === "skip_use") {
        setJosephSynthView("catalog");
        setJosephSynthLastCrystal(null);
      }
    },
    [handleJosephSynthUseCrystal]
  );

  const closePetMasterDialogue = useCallback(
    (revertDebug = false) => {
      if (
        revertDebug &&
        (petDebugSnapshotRef.current || loadMoePetDebugSnapshot(pet.id))
      ) {
        restorePetDebugSnapshot({ silent: true });
        setToast("Lv.100 儀式を解除し、元のLvに戻しました");
      }
      setPetMasterDialogue(null);
    },
    [pet.id, restorePetDebugSnapshot]
  );

  const handlePetMasterMenuSelect = useCallback(
    (id) => {
      const petData = MOE_PET_DATA[pet.id] || MOE_PET_DATA.sun_spirit;
      if (id === "talk") {
        setPetMasterDialogue({ view: "talk", lineIndex: 0 });
        return;
      }
      if (id === "lv100") {
        applyPetDebugLevel100();
        setPetMasterDialogue({
          view: "message",
          message: {
            speaker: "master",
            text: `${petData.name}の創造儀式が完了した。Lv.100 になったぞ！`,
          },
        });
        return;
      }
      if (id === "restore") {
        if (!restorePetDebugSnapshot()) {
          setPetMasterDialogue({
            view: "message",
            message: {
              speaker: "master",
              text: "戻せる状態ではないのう。先に Lv.100 儀式を試しておくれ。",
            },
          });
          return;
        }
        setPetMasterDialogue({
          view: "message",
          message: {
            speaker: "master",
            text: "元のLvと経験値に戻したぞ。",
          },
        });
      }
    },
    [pet.id, applyPetDebugLevel100, restorePetDebugSnapshot]
  );

  const precisePet = petUsesPreciseWikiStats(pet.id);
  const petWikiStats = React.useMemo(
    () => calculatePetStats(pet.id, petCombatLevel),
    [pet.id, petCombatLevel]
  );
  const wikiGrowthCaption = React.useMemo(
    () => getPetWikiGrowthCaptionLine(pet.id),
    [pet.id]
  );
  const currentPetData = MOE_PET_DATA[pet.id] || MOE_PET_DATA.sun_spirit;
  const currentPetDisplay = useMemo(() => {
    if (pet.id === "mystery_dragon" && pet.rebornPhoenix) {
      const rebornName = getMysteryDragonDisplayName(
        true,
        pet.activeSkillSet === 1 ? 1 : 2
      );
      return rebornName
        ? { ...currentPetData, name: rebornName }
        : currentPetData;
    }
    return currentPetData;
  }, [currentPetData, pet.id, pet.rebornPhoenix, pet.activeSkillSet]);
  const petMasterLines = React.useMemo(
    () => buildPetMasterDialogue(currentPetData, petCombatLevel),
    [currentPetData, petCombatLevel]
  );

  const getPetSidePanelPos = useCallback(
    () => ({
      x: Math.max(8, window.innerWidth - 186),
      y: 8,
    }),
    []
  );
  const {
    pos: petSidePanelPos,
    sizeRef: petSidePanelSizeRef,
    onDragPointerDown: onPetSidePanelDrag,
  } = useMoeDraggablePos(
    "life-rpg-moe-pet-side-panel-pos",
    getPetSidePanelPos
  );

  if (!world) {
    return (
      <div className="bg-zinc-900 text-white flex h-dvh items-center justify-center">
        ミーリム海岸へ移動中...
      </div>
    );
  }

  const camX = is3d ? 0 : view.w / 2 - player.x;
  const camY = is3d ? 0 : view.h / 2 - player.y;
  const mini3HalfW = world.halfW ?? MOE_3D_HALF_W;
  const mini3HalfD = world.halfD ?? MOE_3D_HALF_D;
  const mini3Bounds = world.miniBounds ?? null;
  const mini3W = world.miniMapW ?? world.mw ?? mini3HalfW * 2;
  const mini3H = world.miniMapH ?? world.mh ?? mini3HalfD * 2;
  const mini3Project = (wx, wz) =>
    mini3Bounds
      ? moe3dWorldToMinimapInBounds(wx, wz, mini3Bounds, mini3W, mini3H)
      : moe3dWorldToMinimap(
          wx,
          wz,
          mini3HalfW,
          mini3HalfD,
          mini3W,
          mini3H
        );
  const mini3Player = is3d ? mini3Project(minimap3d.x, minimap3d.y) : null;
  const mini3Rhoda = is3d
    ? (() => {
        const spot = world.rhodaPos ?? moe3dRhodaPosition(mini3HalfW, mini3HalfD);
        return mini3Project(spot.x, spot.y);
      })()
    : null;
  const mini3TrainingGuideHome = is3d
    ? (() => {
        const tw = world.tileWidth;
        const td = world.tileDepth;
        const spot =
          world.trainingGuideHousePos ??
          (tw && td ? moe3dTrainingGuideHousePosition(tw, td) : null);
        if (!spot) return null;
        return mini3Project(spot.x, spot.y);
      })()
    : null;
  const mini3AgeHubHome = is3d
    ? (() => {
        const tw = world.tileWidth;
        const td = world.tileDepth;
        const spot =
          world.ageHubHousePos ??
          (tw && td ? moe3dAgeHubHousePosition(tw, td) : null);
        if (!spot) return null;
        return mini3Project(spot.x, spot.y);
      })()
    : null;
  const mini3ViewLen = Math.min(mini3W, mini3H) * 0.14;
  const mini3Yaw = minimap3d.yaw;
  const mini3ViewTip = mini3Player
    ? {
        x: mini3Player.x + Math.sin(mini3Yaw) * mini3ViewLen,
        y: mini3Player.y + Math.cos(mini3Yaw) * mini3ViewLen,
      }
    : null;
  const mini3ViewLeft = mini3Player
    ? {
        x: mini3Player.x + Math.sin(mini3Yaw - 0.5) * mini3ViewLen * 0.55,
        y: mini3Player.y + Math.cos(mini3Yaw - 0.5) * mini3ViewLen * 0.55,
      }
    : null;
  const mini3ViewRight = mini3Player
    ? {
        x: mini3Player.x + Math.sin(mini3Yaw + 0.5) * mini3ViewLen * 0.55,
        y: mini3Player.y + Math.cos(mini3Yaw + 0.5) * mini3ViewLen * 0.55,
      }
    : null;
  const mini3TileRects =
    mini3Bounds
      ? moe3dMinimapFullTileRects(
          mini3Bounds,
          mini3W,
          mini3H,
          world.tileWidth,
          world.tileDepth
        )
      : moe3dMinimapZoneRects(mini3HalfW, mini3HalfD, mini3W, mini3H);
  const duelEnemy = duel ? enemies.find((e) => e.id === duel.enemyId) : null;
  const targetEnemy =
    targetEnemyId != null
      ? enemies.find((e) => e.id === targetEnemyId && e.hp > 0) ?? null
      : null;
  const petDuelUi = duel
    ? {
        phase: duel.phase,
        duelRef,
        barKey: "petBar",
      }
    : null;
  const targetDuelUi =
    duel && targetEnemy && duel.enemyId === targetEnemy.id
      ? {
          phase: duel.phase,
          duelRef,
          barKey: "enemyBar",
        }
      : null;

  const trainerExpPct = Math.min(
    100,
    Math.floor(
      ((trainerStatus.exp || 0) / Math.max(1, trainerStatus.nextExp || 1)) * 100
    )
  );

  const petNextRemaining = getMoePetExpRemainingToNextTenth(petTotalExp);
  const petExpPct = getMoePetExpTenthBarPct(petTotalExp);

  const petMasterView = petMasterDialogue?.view ?? "menu";

  const allyTargetView = {
    emoji: allyTarget === "player" ? "🧑" : currentPetDisplay.emoji,
    name:
      allyTarget === "player"
        ? trainerStatus.job ?? "勇者"
        : currentPetDisplay.name,
    hp: allyTarget === "player" ? playerVitals.hp : pet.hp,
    hpMax: allyTarget === "player" ? playerVitals.hpMax : pet.hpMax,
    mp: allyTarget === "player" ? playerVitals.mp : pet.mp,
    mpMax: allyTarget === "player" ? playerVitals.mpMax : pet.mpMax,
  };

  const handleMacroTimerFinished = useCallback(() => {
    setToast("⏱ マクロ４ 0:00 — お疲れさま！");
    playSfx("heal");
  }, []);

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-sky-900"
      onContextMenu={is3d ? (e) => e.preventDefault() : undefined}
    >
      <MoeMacroSessionTimer onFinished={handleMacroTimerFinished} />
      <MoeTargetWindow
        target={targetEnemy}
        chaseAggro={targetEnemyChaseAggro}
        duelUi={targetDuelUi}
        allyTarget={allyTargetView}
        allyTargetMode={allyTarget}
        onSelectAllyTarget={selectAllyTarget}
      />
      <MoeEnemyStatSearchPanel
        enemy={targetEnemy}
        open={enemyStatSearchOpen}
        onClose={() => setEnemyStatSearchOpen(false)}
        playerPosRef={playerPosRef}
        enemyFacingYawRef={targetEnemyFacingYawRef}
        enemyChaseRuntimeRef={enemyChaseRuntimeRef}
        enemyFieldSyncRef={enemyFieldSyncRef}
        enemyDetectionOptsRef={enemyDetectionOptsRef}
      />
      <MoePlayerHpWindow
        name={trainerStatus.job ?? "勇者"}
        hp={playerVitals.hp}
        hpMax={playerVitals.hpMax}
        stamina={playerVitals.stamina}
        staminaMax={playerVitals.staminaMax}
        mp={playerVitals.mp}
        mpMax={playerVitals.mpMax}
        buffSlots={buildMoePlayerBuffStrip(
          {
            bananaMilkActive,
            shinobiashiOn,
            kakureminoUntilMs: kakureminoUntilRef.current,
            dashBoost3x,
            playerCondenseMindRef,
            playerJirikiSeiranRef,
          },
          buffUiNow
        )}
        allySelected={allyTarget === "player"}
        onSelectAllyTarget={() => selectAllyTarget("player")}
      />
      <MoePetHpWindow
        emoji={currentPetDisplay.emoji}
        name={currentPetDisplay.name}
        levelLabel={petLevelDisplay}
        hp={pet.hp}
        hpMax={pet.hpMax}
        duelUi={petDuelUi}
        buffSlots={buildMoePetBuffStrip(
          {
            petRegenActive: regenActive,
            petRegenHp: PET_REGEN_HP,
            petRegenMp: PET_REGEN_MP,
            petRegenIntervalSec: PET_REGEN_INTERVAL_SEC,
            phoenixAnsleepRegenRef,
            phoenixUltimateRegenRef,
            atrumMpRegenRef,
            atrumMagicBuffUntilRef,
          },
          buffUiNow
        )}
        allySelected={allyTarget === "pet"}
        onSelectAllyTarget={() => selectAllyTarget("pet")}
      />
      {duel && (
        <MoeDuelTimeBarWindow
          duelRef={duelRef}
          phase={duel.phase}
          petEmoji={currentPetData.emoji}
          enemyEmoji={duelEnemy?.emoji ?? "👹"}
          enemyName={duelEnemy?.name ?? ""}
          petChargeSec={duel.petChargeSec}
          enemyChargeSec={duel.enemyChargeSec}
          battleSpeed2x={battleSpeed2x}
        />
      )}
      {petLevelUpFlash && (
        <div
          role="status"
          className="pointer-events-none absolute left-1/2 top-24 z-[60] max-w-[min(96vw,22rem)] -translate-x-1/2 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 px-4 py-3 text-center text-sm font-bold leading-snug text-amber-950 shadow-[0_0_40px_rgba(251,191,36,0.85)] whitespace-pre-wrap break-words"
        >
          🎉 {petLevelUpFlash}
                </div>
      )}
      <MoePlayerSkill2LevelUpFlash level={skill2LevelUpFlash} />
      {expConsumableLevelUpFlow && (
        <div
          className="fixed inset-0 z-[62] flex cursor-pointer items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          onClick={advanceExpConsumableLevelUp}
          role="presentation"
        >
          <div
            role="status"
            className={`max-w-[min(96vw,22rem)] rounded-2xl border-2 px-5 py-4 text-center shadow-[0_0_40px_rgba(120,80,200,0.55)] ${
              expConsumableLevelUpFlow.tone === "down"
                ? "border-violet-200 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700"
                : "border-amber-200 bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 shadow-[0_0_40px_rgba(251,191,36,0.85)]"
            }`}
          >
            <p
              className={`text-sm font-bold leading-snug whitespace-pre-wrap break-words ${
                expConsumableLevelUpFlow.tone === "down"
                  ? "text-violet-50"
                  : "text-amber-950"
              }`}
            >
              {expConsumableLevelUpFlow.tone === "down" ? "💫" : "🎉"}{" "}
              {expConsumableLevelUpFlow.pages[expConsumableLevelUpFlow.index]}
            </p>
            {expConsumableLevelUpFlow.pages.length > 1 ? (
              <p
                className={`mt-2 text-[10px] font-bold tabular-nums ${
                  expConsumableLevelUpFlow.tone === "down"
                    ? "text-violet-100/80"
                    : "text-amber-900/75"
                }`}
              >
                {expConsumableLevelUpFlow.index + 1} /{" "}
                {expConsumableLevelUpFlow.pages.length}
              </p>
            ) : null}
            <p
              className={`mt-2 text-[10px] font-bold ${
                expConsumableLevelUpFlow.tone === "down"
                  ? "text-violet-100/85"
                  : "text-amber-900/80"
              }`}
            >
              {expConsumableLevelUpFlow.index <
              expConsumableLevelUpFlow.pages.length - 1
                ? "クリック / Enter で次へ"
                : "クリック / Enter で閉じる"}
              </p>
            </div>
        </div>
      )}
      {skillToast && (
        <div
          className={`pointer-events-none absolute left-1/2 z-[51] max-w-[min(92vw,24rem)] -translate-x-1/2 rounded-xl border-2 border-amber-300/90 bg-gradient-to-br from-amber-600 to-orange-700 px-5 py-2.5 text-center text-sm font-bold text-amber-50 shadow-xl whitespace-pre-wrap break-words ${
            petLevelUpFlash || expConsumableLevelUpFlow ? "top-[11rem]" : "top-20"
          }`}
        >
          {skillToast}
        </div>
      )}
      {toast && (
        <div
          className={`absolute left-1/2 z-50 max-w-[min(92vw,24rem)] -translate-x-1/2 rounded-xl border-2 border-blue-300 bg-blue-600 px-6 py-3 text-center text-base font-bold text-white shadow-xl whitespace-pre-wrap break-words ${
            petLevelUpFlash || expConsumableLevelUpFlow
              ? "top-[11rem]"
              : skillToast
                ? "top-32"
                : "top-20"
          }`}
        >
          {toast}
        </div>
      )}

      {battlePopups
        .filter((p) => p.space === "screen")
        .map((pop) => (
          <div
            key={pop.id}
            className="pointer-events-none fixed z-[48]"
            style={{
              left: pop.x,
              top: pop.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="moe-battle-popup-rise block text-center text-[18px] font-black tabular-nums tracking-tight text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              {pop.value >= 0 ? "+" : ""}
              {pop.value}
            </span>
          </div>
        ))}

      {/* Pet Status UI — ドラッグで移動 */}
      {petSidePanelPos && (
      <div
        ref={(el) => {
          if (el) {
            petSidePanelSizeRef.current = {
              w: el.offsetWidth,
              h: el.offsetHeight,
            };
          }
        }}
        className="fixed z-[46]"
        style={{ left: petSidePanelPos.x, top: petSidePanelPos.y }}
      >
        <div
          className="max-h-[calc(100dvh-4.5rem)] w-[10.75rem] overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg border border-white/20 bg-black/75 p-2 text-white backdrop-blur-md [scrollbar-width:thin]"
        >
          <div
            className="mb-1.5 flex cursor-grab items-center gap-1.5 touch-none active:cursor-grabbing"
            onPointerDown={onPetSidePanelDrag}
            title="ドラッグで移動"
          >
            <span className="text-xl leading-none">{currentPetData.emoji}</span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold leading-tight">{currentPetDisplay.name}</p>
              <p
                key={`pet-panel-lv-${pet.totalExp ?? 0}-${petLevelDisplay}`}
                className="text-[9px] tabular-nums text-gray-400"
                title={
                  petCombatLevel >= MOE_PET_MAX_LEVEL
                    ? "最大レベル"
                    : `次の0.1まで ${petNextRemaining ?? "—"} EXP`
                }
              >
                Lv.{petLevelDisplay}
              </p>
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between text-[9px]">
              <span>HP</span>
              <span>
                {precisePet
                  ? `${formatPetStatUi(pet.hp)}/${formatPetStatUi(pet.hpMax)}`
                  : `${Math.floor(pet.hp)}/${pet.hpMax}`}
              </span>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all"
                style={{ width: `${petResourceBarPct(pet.hp, pet.hpMax)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px]">
              <span>MP</span>
              <span>
                {precisePet
                  ? `${formatPetStatUi(pet.mp)}/${formatPetStatUi(pet.mpMax)}`
                  : `${pet.mp}/${pet.mpMax}`}
              </span>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${petResourceBarPct(pet.mp, pet.mpMax)}%` }}
              />
            </div>
            <p className="mt-1.5 text-center text-[7px] font-bold text-cyan-200/90">
              ペット命令
            </p>
            <div className="mt-0.5 rounded-md border border-cyan-500/45 bg-zinc-950/70 p-1">
              <div className="grid grid-cols-3 gap-0.5">
                <button
                  type="button"
                  onClick={handlePetAttackCommand}
                  className="rounded border border-red-500/60 bg-red-900/90 px-0.5 py-1 text-[7px] font-bold leading-tight text-red-50 transition hover:bg-red-800/95 active:scale-95"
                >
                  攻撃
                </button>
                <button
                  type="button"
                  onClick={handlePetComeBack}
                  className={`rounded border px-0.5 py-1 text-[7px] font-bold leading-tight transition active:scale-95 ${
                    petCommandMode === "follow"
                      ? "border-cyan-400/70 bg-cyan-900/90 text-cyan-50"
                      : "border-cyan-600/50 bg-cyan-950/80 text-cyan-100 hover:bg-cyan-900/90"
                  }`}
                >
                  もどれ
                </button>
                <button
                  type="button"
                  onClick={handlePetWait}
                  className={`rounded border px-0.5 py-1 text-[7px] font-bold leading-tight transition active:scale-95 ${
                    petCommandMode === "wait"
                      ? "border-zinc-300/70 bg-zinc-700/90 text-white"
                      : "border-zinc-500/50 bg-zinc-900/85 text-zinc-100 hover:bg-zinc-800/90"
                  }`}
                >
                  待て
                </button>
                <button
                  type="button"
                  onClick={handlePetSit}
                  className={`rounded border px-0.5 py-1 text-[7px] font-bold leading-tight transition active:scale-95 ${
                    petCommandMode === "sit"
                      ? "border-violet-400/70 bg-violet-900/90 text-violet-50"
                      : "border-violet-600/50 bg-violet-950/85 text-violet-100 hover:bg-violet-900/90"
                  }`}
                >
                  座れ
                </button>
                <button
                  type="button"
                  onClick={handlePetAutoToggle}
                  className={`rounded border px-0.5 py-1 text-[7px] font-bold leading-tight transition active:scale-95 ${
                    petCommandMode === "auto"
                      ? "border-orange-400/70 bg-orange-900/90 text-orange-50 ring-1 ring-orange-300/50"
                      : "border-orange-600/50 bg-orange-950/85 text-orange-100 hover:bg-orange-900/90"
                  }`}
                >
                  オート{petCommandMode === "auto" ? "止" : ""}
                </button>
                <button
                  type="button"
                  onClick={handlePetSosRecall}
                  className="rounded border border-amber-500/55 bg-amber-950/85 px-0.5 py-1 text-[7px] font-bold leading-tight text-amber-100 transition hover:bg-amber-900/90 active:scale-95"
                  title="ペットをプレイヤーのすぐそばへワープ（戦闘中は解除）"
                >
                  🆘 SOS
                </button>
                </div>
                </div>
            <div className="mt-1 flex items-stretch justify-center gap-0.5">
              <button
                type="button"
                onClick={() => handleHeal(HEAL_AMOUNT_LIGHT, "ライトヒール")}
                className="flex h-6 min-w-0 flex-1 items-center justify-center rounded bg-pink-700/90 px-0.5 text-[6px] font-bold leading-tight transition hover:bg-pink-600 active:scale-95"
                title={`+${HEAL_AMOUNT_LIGHT} HP`}
              >
                ライト
              </button>
              <button
                type="button"
                disabled={healCdSec.healing > 0}
                onClick={() =>
                  handleHeal(
                    HEAL_AMOUNT_HEALING,
                    "ヒーリング",
                    "healing",
                    HEAL_COOLDOWN_HEALING_SEC
                  )
                }
                className={`flex h-6 min-w-0 flex-1 items-center justify-center rounded px-0.5 text-[6px] font-bold leading-tight transition active:scale-95 ${
                  healCdSec.healing > 0
                    ? "cursor-not-allowed bg-pink-600/28 text-amber-200/80 ring-1 ring-inset ring-pink-300/25"
                    : "bg-pink-600 text-white hover:bg-pink-500"
                }`}
                title={
                  healCdSec.healing > 0
                    ? `待機中（あと${healCdSec.healing}秒）`
                    : `+${HEAL_AMOUNT_HEALING} HP`
                }
              >
                {healCdSec.healing > 0 ? (
                  <span className="relative flex h-full w-full items-center justify-center">
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[6px] font-bold leading-none text-white/25">
                      ヒール
                  </span>
                    <span className="relative text-[11px] tabular-nums leading-none text-amber-200/90">
                      {healCdSec.healing}
                  </span>
                  </span>
                ) : (
                  "ヒール"
                )}
              </button>
              <button
                type="button"
                disabled={healCdSec.healAll > 0}
                onClick={() =>
                  handleHeal(
                    HEAL_AMOUNT_HEAL_ALL,
                    "ヒーリングオール",
                    "healAll",
                    HEAL_COOLDOWN_HEAL_ALL_SEC
                  )
                }
                className={`flex h-6 min-w-0 flex-[0.85] items-center justify-center rounded px-0.5 text-[6px] font-bold leading-tight transition active:scale-95 ${
                  healCdSec.healAll > 0
                    ? "cursor-not-allowed bg-pink-500/28 text-amber-200/80 ring-1 ring-inset ring-pink-300/25"
                    : "bg-pink-500 text-white hover:bg-pink-400"
                }`}
                title={
                  healCdSec.healAll > 0
                    ? `待機中（あと${healCdSec.healAll}秒）`
                    : `ヒーリングオール +${HEAL_AMOUNT_HEAL_ALL} HP`
                }
              >
                {healCdSec.healAll > 0 ? (
                  <span className="relative flex h-full w-full items-center justify-center">
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[6px] font-bold leading-none text-white/25">
                      オール
                </span>
                    <span className="relative text-[11px] tabular-nums leading-none text-amber-200/90">
                      {healCdSec.healAll}
                    </span>
                  </span>
                ) : (
                  "オール"
                )}
              </button>
              <button
                type="button"
                onClick={handleRegenToggle}
                className={`flex h-6 min-w-[2rem] shrink-0 flex-[0.72] items-center justify-center rounded border px-0.5 text-[6px] font-bold leading-none whitespace-nowrap transition active:scale-95 ${
                  regenActive
                    ? "border-teal-300/70 bg-teal-800/95 text-teal-50 ring-1 ring-teal-300/45"
                    : "border-teal-600/45 bg-teal-950/85 text-teal-100 hover:bg-teal-900/90"
                }`}
                title={`2秒ごと HP+${PET_REGEN_HP} MP+${PET_REGEN_MP}（トグル）`}
              >
                リジェネ
              </button>
              </div>
            <button
              type="button"
              onClick={() => setShowPetStatusOverlay((v) => !v)}
              className="mt-1.5 w-full rounded border border-emerald-500/50 bg-emerald-950/90 py-1 text-[9px] font-bold text-emerald-100 transition hover:bg-emerald-900/95 active:scale-95"
            >
              ステータス{showPetStatusOverlay ? " ▲" : ""}
            </button>
            {showPetStatusOverlay && (
              <div className="mt-1 w-full overflow-x-hidden overflow-y-auto overscroll-contain border-y border-emerald-400/40 bg-zinc-950/97 [scrollbar-width:thin] max-h-[min(14rem,38vh)]">
                <div className="box-border w-full max-w-full px-1 py-2 text-white">
                  <div className="space-y-1.5 text-[10px]">
            <div
              ref={petExpUiAnchorRef}
                      className="relative"
                      key={`pet-exp-ui-${petTotalExp}-${petLevelDisplay}`}
                    >
                      <p className="text-[9px] font-bold tabular-nums text-amber-100">
                        Lv.{petLevelDisplay}
                      </p>
                      <p className="mt-0.5 font-mono text-[9px] tabular-nums leading-snug text-white">
                        {petCombatLevel >= MOE_PET_MAX_LEVEL ? (
                          <>
                            次回EXP MAX
                            <br />
                            合計EXP {petTotalExp.toLocaleString()}
                          </>
                        ) : (
                          <>
                            次回EXP {petNextRemaining ?? "—"}
                            <br />
                            合計EXP {petTotalExp.toLocaleString()}
                          </>
                        )}
                      </p>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full border border-white/35 bg-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-white to-white/75 transition-[width] duration-150"
                  style={{ width: `${petExpPct}%` }}
                />
              </div>
                      <p className="mt-0.5 text-[7px] leading-snug text-white/70">
                        MOE同様 0.1刻み（Wiki累積表÷10）
            </p>
            <button
              type="button"
                        onClick={previewPetTenthLevelUpEffect}
                        className="mt-1 w-full rounded border border-cyan-500/45 bg-cyan-950/70 py-0.5 text-[8px] font-bold text-cyan-100 transition hover:bg-cyan-900/80 active:scale-[0.98]"
            >
                        0.1 up 演出プレビュー
            </button>
                      <p className="text-[8px] text-amber-200/70 leading-snug">
                        自分の攻撃と敵攻撃の直後それぞれ約
                        {Math.round(MOE_PET_ATTACK_EXP_SUCCESS_RATE * 100)}％で取得。敵が強いほど多い
            </p>
          </div>
                    {precisePet && petWikiStats && (
                      <div className="space-y-0.5 border-t border-white/15 pt-1.5 text-[9px] leading-tight">
                        {[
                          ["攻撃", formatPetStatUi(petWikiStats.attack), "耐火", formatPetResistUi(petWikiStats.resistFire)],
                          ["防御", formatPetStatUi(petWikiStats.defense), "耐水", formatPetResistUi(petWikiStats.resistWater)],
                          ["命中", formatPetStatUi(petWikiStats.hit), "耐地", formatPetResistUi(petWikiStats.resistEarth)],
                          ["回避", formatPetStatUi(petWikiStats.evasion), "耐風", formatPetResistUi(petWikiStats.resistWind)],
                          ["魔力", formatPetStatUi(petWikiStats.magic), "耐無", formatPetResistUi(petWikiStats.resistNeutral)],
                        ].map(([leftLabel, leftVal, rightLabel, rightVal]) => (
                          <div
                            key={leftLabel}
                            className="flex w-full items-center justify-between gap-1"
                          >
                            <span className="min-w-0 shrink text-emerald-100">
                              {leftLabel}:{" "}
                              <span className="font-mono tabular-nums">{leftVal}</span>
                            </span>
                            <span className="min-w-0 shrink text-right text-emerald-100/90">
                              {rightLabel}{" "}
                              <span className="font-mono tabular-nums">{rightVal}</span>
              </span>
            </div>
                        ))}
                        {wikiGrowthCaption && (
                          <p className="pt-0.5 text-[7px] leading-none tracking-tight text-cyan-200/85 whitespace-nowrap">
                            {wikiGrowthCaption}
                          </p>
                        )}
          </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          <div className="mt-1.5 border-t border-white/15 pt-1.5 pb-0.5">
            <p className="mb-0.5 text-center text-[8px] font-bold text-cyan-200/90">ペット変更</p>
              <div className="flex gap-0.5">
              <button
                type="button"
                onClick={() => cyclePet(-1)}
                  className="flex-1 rounded bg-cyan-900/90 py-0.5 text-[7px] font-bold leading-tight text-cyan-100 ring-1 ring-cyan-600/50 transition hover:bg-cyan-800/90 active:scale-95"
              >
                ◀ 前
              </button>
              <button
                type="button"
                onClick={() => cyclePet(1)}
                  className="flex-1 rounded bg-cyan-900/90 py-0.5 text-[7px] font-bold leading-tight text-cyan-100 ring-1 ring-cyan-600/50 transition hover:bg-cyan-800/90 active:scale-95"
              >
                次 ▶
              </button>
            </div>
            <select
              value={pet.id}
              onChange={(e) => applyPetId(e.target.value)}
                className="mt-1 w-full rounded border border-white/25 bg-zinc-900/95 py-0.5 pl-1 pr-5 text-[9px] text-white outline-none focus:ring-1 focus:ring-cyan-500"
            >
                {MOE_PET_IDS.filter((id) => !josephCrystallizedPetIds.includes(id)).map(
                  (id) => (
                <option key={id} value={id}>
                  {MOE_PET_DATA[id].emoji} {MOE_PET_DATA[id].name}
                </option>
                  )
                )}
            </select>
          </div>
            <div className="mt-1.5 space-y-1 border-t border-white/15 pt-1.5">
              <button
                type="button"
                onClick={handlePetExpReset}
                className="w-full rounded border border-rose-600/60 bg-rose-950/80 py-1 text-[8px] font-bold text-rose-100 transition hover:bg-rose-900/90 active:scale-[0.98]"
              >
                ペットEXP・Lv リセット
              </button>
              <p className="text-[8px] leading-snug text-white/42">
                ペットの Lv・EXP等はこのブラウザ保存
              </p>
              <div className="space-y-1">
                <div className="flex w-full items-center justify-between gap-2 text-pink-100/95">
                  <span className="shrink-0 text-[10px]">訓練士EXP</span>
                  <span className="min-w-0 shrink text-right font-mono text-[9px] tabular-nums">
                    {trainerStatus.exp}/{trainerStatus.nextExp}
                  </span>
        </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full border border-pink-800/50 bg-pink-950/80">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 via-fuchsia-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${trainerExpPct}%` }}
                  />
                </div>
                <p className="text-[8px] leading-snug text-white/42">
                  敵撃破で加算・localStorage 保存
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 縦スキル ×2 — 技①/技②/ペット合体（←→ループ） */}
      <MoeMergedVerticalSkillPanel
        storageKey="life-rpg-moe-merged-skill-panel-a"
        defaultPos={() => ({
          x: Math.max(8, window.innerWidth - 90),
          y: 8,
        })}
        {...mergedSkillPanelProps}
      />
      <MoeMergedVerticalSkillPanel
        storageKey="life-rpg-moe-merged-skill-panel-b"
        defaultPos={() => ({
          x: Math.max(8, window.innerWidth - 180),
          y: 8,
        })}
        {...mergedSkillPanelProps}
      />

      {/* 横スキル ×2 — 技①/技②/ペット合体（←→ループ） */}
      <MoeMergedSkillIconBar
        storageKey="life-rpg-moe-merged-icon-bar-a"
        defaultPos={() => ({
          x: Math.max(8, (window.innerWidth - 360) / 2),
          y: Math.max(8, window.innerHeight - 148),
        })}
        {...mergedIconBarProps}
      />
      <MoeMergedSkillIconBar
        storageKey="life-rpg-moe-merged-icon-bar-b"
        defaultPos={() => ({
          x: Math.max(8, (window.innerWidth - 360) / 2),
          y: Math.max(8, window.innerHeight - 220),
        })}
        {...mergedIconBarProps}
      />

      <MoeItemBox onToast={setToast} onUse={handleItemBoxUse} />

      <MoeNpcDialogue
        open={dragonFormFlow}
        mode="menu"
        menuPrompt={
          "ミステリー ドラゴンの姿を変えますか？\n（ペットをダブルクリック · 技①/技②も切り替わります）"
        }
        menuActions={[
          { id: "form_1", label: "ミステリー ドラゴンⅠへ変化" },
          {
            id: "form_2",
            label: "ミステリー ドラゴンⅡ（フェニックス）へ変化",
          },
          { id: "cancel_form", label: "やめる" },
        ]}
        onMenuSelect={(id) => {
          if (id === "form_1") applyMysterySkillSet(1);
          else if (id === "form_2") applyMysterySkillSet(2);
          setDragonFormFlow(false);
        }}
        onClose={() => setDragonFormFlow(false)}
        petData={currentPetDisplay}
        npc={MOE_ITEM_USE_NPC}
      />

      <MoeNpcDialogue
        open={!!phoenixRebirthFlow}
        mode="menu"
        menuPrompt={
          "フェニックスの羽根を使い\nミステリー ドラゴンを転生させますか？\n\nミステリー ドラゴンⅡ（フェニックスドラゴン）へ変化\n技①（従来）と技②（フェニックス）を常時切替できます"
        }
        menuActions={[
          { id: "yes_rebirth", label: "転生する" },
          { id: "no_rebirth", label: "やめる" },
        ]}
        onMenuSelect={(id) => {
          if (id === "yes_rebirth") applyPhoenixRebirth();
          else setPhoenixRebirthFlow(null);
        }}
        onClose={() => setPhoenixRebirthFlow(null)}
        petData={currentPetDisplay}
        npc={MOE_ITEM_USE_NPC}
      />

      <MoeNpcDialogue
        open={powderUseFlow?.view === "pick_pet"}
        mode="menu"
        menuPrompt="どのペットに使いますか？"
        menuActions={powderPetMenuActions}
        onMenuSelect={handlePowderPetPick}
        onClose={closePowderUseFlow}
        petData={currentPetData}
        npc={MOE_ITEM_USE_NPC}
      />

      <MoeNpcDialogue
        open={powderUseFlow?.view === "confirm"}
        mode="menu"
        menuPrompt={powderConfirmPrompt}
        menuActions={[
          { id: "use_powder", label: "使う" },
          { id: "back_pick", label: "やめる" },
        ]}
        onMenuSelect={handlePowderConfirmMenu}
        onClose={closePowderUseFlow}
        petData={currentPetData}
        npc={MOE_ITEM_USE_NPC}
      />

      <MoeNpcDialogue
        open={gustavResetPromptOpen}
        mode="menu"
        menuPrompt={
          "神速のスキルを消しますか？\n\nはい → スキル記録をリセット\n（次の撃破で忍者の足袋 · 以降はキューブ）"
        }
        menuActions={[
          { id: "yes_reset", label: "はい" },
          { id: "no_fight", label: "いいえ" },
        ]}
        onMenuSelect={handleGustavResetMenu}
        onClose={closeGustavResetPrompt}
        petData={currentPetData}
        npc={MOE_GUSTAV_EVENT_NPC}
      />

      <div className="absolute left-3 top-3 z-40 flex max-w-[min(90vw,22rem)] items-start gap-2">
        {is3d ? (
          <MoeField3DCompassHud
            playerX={minimap3d.x}
            playerY={minimap3d.y}
            yaw={minimap3d.yaw}
          />
        ) : null}
        <div className="min-w-0 flex-1">
        {!showSettings ? (
              <button
                type="button"
            onClick={() => setShowSettings(true)}
            className="rounded-lg border border-zinc-400/50 bg-black/60 px-3 py-1.5 text-[11px] font-bold text-zinc-100 shadow-md backdrop-blur-sm transition hover:bg-black/75 active:scale-[0.98]"
            aria-expanded={false}
            aria-controls="moe-field-settings-panel"
          >
            設定
          </button>
        ) : (
          <div
            id="moe-field-settings-panel"
            className="rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-xs text-white/90 backdrop-blur-sm"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="font-bold text-zinc-200">設定</p>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="shrink-0 rounded border border-white/20 px-1.5 py-0.5 text-[9px] text-white/70 hover:bg-white/10"
                aria-label="設定を閉じる"
              >
                閉じる
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  setShowFieldGuide(true);
                }}
                className="rounded border border-cyan-500/40 bg-cyan-950/50 px-2 py-1.5 text-left text-[11px] font-bold text-cyan-200 transition hover:bg-cyan-900/40 active:scale-[0.98]"
              >
                操作ガイド
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  setShowEventGuide(true);
                }}
                className="rounded border border-sky-500/40 bg-sky-950/50 px-2 py-1.5 text-left text-[11px] font-bold text-sky-200 transition hover:bg-sky-900/40 active:scale-[0.98]"
              >
                イベント情報
              </button>
              {is3d ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettings(false);
                      setShowDragonLineup(true);
                    }}
                    className="rounded border border-amber-500/40 bg-amber-950/45 px-2 py-1.5 text-left text-[11px] font-bold text-amber-200 transition hover:bg-amber-900/35 active:scale-[0.98]"
                  >
                    ドラゴン10体展示
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettings(false);
                      setShowMonsterLineup(true);
                    }}
                    className="rounded border border-rose-500/40 bg-rose-950/45 px-2 py-1.5 text-left text-[11px] font-bold text-rose-200 transition hover:bg-rose-900/35 active:scale-[0.98]"
                  >
                    敵32体展示
                  </button>
                </>
              ) : null}
              <div className="rounded border border-violet-500/30 bg-violet-950/30 px-2 py-1.5">
                <p className="text-[10px] font-bold text-violet-100/95">
                  ペットスキル
                </p>
                <p className="mt-0.5 text-[9px] leading-snug text-violet-100/70">
                  現在: {moePetSkillModeLabel(petSkillMode)}
                </p>
                <div className="mt-1.5 grid grid-cols-1 gap-1">
              <button
                type="button"
                onClick={() => {
                      setPetSkillMode(MOE_PET_SKILL_MODE_ALL);
                      saveMoePetSkillMode(MOE_PET_SKILL_MODE_ALL);
                      setToast("ペットスキル: 全部使える");
                    }}
                    className={`rounded border px-2 py-1.5 text-left text-[11px] font-bold transition active:scale-[0.98] ${
                      petSkillMode === MOE_PET_SKILL_MODE_ALL
                        ? "border-violet-300/70 bg-violet-800/70 text-violet-50 ring-1 ring-violet-200/35"
                        : "border-violet-600/35 bg-violet-950/40 text-violet-100 hover:bg-violet-900/35"
                    }`}
                  >
                    全部使える（未習得も表示）
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPetSkillMode(MOE_PET_SKILL_MODE_LEARNED);
                      saveMoePetSkillMode(MOE_PET_SKILL_MODE_LEARNED);
                      setToast("ペットスキル: 習得済みのみ");
                    }}
                    className={`rounded border px-2 py-1.5 text-left text-[11px] font-bold transition active:scale-[0.98] ${
                      petSkillMode === MOE_PET_SKILL_MODE_LEARNED
                        ? "border-violet-300/70 bg-violet-800/70 text-violet-50 ring-1 ring-violet-200/35"
                        : "border-violet-600/35 bg-violet-950/40 text-violet-100 hover:bg-violet-900/35"
                    }`}
                  >
                    習得済みのみ（MOE風）
                  </button>
                </div>
              </div>
              <div className="rounded border border-amber-500/25 bg-amber-950/25 px-2 py-1.5">
                <p className="text-[10px] font-bold text-amber-100/95">
                  ペットEXP · 外部保存
                </p>
                <p className="mt-1 text-[9px] leading-snug text-amber-100/70">
                  保存は JSON を追加（上書きしません）。読み込みは
                  <strong className="text-emerald-200/95"> moe-save-*.json を1つ選ぶだけ</strong>
                  （フォルダ記憶は不要）
                </p>
                <p className="mt-0.5 text-[8px] leading-snug text-amber-200/55">
                  大切なのはデスクトップ・ダウンロード等のどの場所かです（life3d
                  フォルダ直下の JSON でも可）
                </p>
                <div className="mt-1.5 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={handleExternalSave}
                    className="rounded border border-amber-500/45 bg-amber-950/45 px-2 py-1.5 text-left text-[11px] font-bold text-amber-200 transition hover:bg-amber-900/35 active:scale-[0.98]"
                  >
                    {externalSaveFolderLabel || getMoeExternalSaveLocationHint().folderName
                      ? "ペットEXPを新規保存"
                      : "保存先を選んで新規保存…"}
                  </button>
                  <div className="rounded border border-amber-600/20 bg-amber-950/20 px-2 py-1.5">
                    {(() => {
                      const hint = getMoeExternalSaveLocationHint();
                      const folderName =
                        externalSaveFolderLabel ?? hint.folderName ?? null;
                      const fileHint = formatMoeExternalSaveFileHint(hint.fileName);
                      return (
                        <div className="space-y-0.5 text-[9px] leading-snug text-amber-100/95">
                          <p className="font-semibold text-amber-50/95">
                            {formatMoeExternalSavePlaceStatus(folderName)}
                          </p>
                          {fileHint ? (
                            <p className="text-amber-200/75">{fileHint}</p>
                          ) : null}
                        </div>
                      );
                    })()}
                    {saveDirPickerSupported ? (
                      <button
                        type="button"
                        onClick={handleChangeExternalSaveFolder}
                        className="mt-1 text-left text-[10px] font-bold text-amber-200/85 underline-offset-2 hover:text-amber-50 hover:underline active:scale-[0.98]"
                      >
                        保存フォルダを変更…
                      </button>
                    ) : (
                      <p className="mt-0.5 text-[8px] text-amber-200/55">
                        このブラウザではフォルダの記憶・変更はできません
                      </p>
                    )}
                    {externalSaveFolderActionMsg ? (
                      <p
                        className="mt-1.5 whitespace-pre-wrap rounded border border-amber-500/25 bg-amber-950/35 px-1.5 py-1 text-[9px] leading-snug text-amber-50/95"
                        role="status"
                      >
                        {externalSaveFolderActionMsg}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={handleExternalSaveImportPick}
                    className="rounded border border-emerald-600/40 bg-emerald-950/35 px-2 py-1.5 text-left text-[11px] font-bold text-emerald-200 transition hover:bg-emerald-900/30 active:scale-[0.98]"
                  >
                    外部保存を読み込む…（JSONファイルを選ぶ）
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

        {showMonsterLineup && is3d && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm"
            role="dialog"
            aria-label="敵32体展示"
          >
            <div className="flex max-h-[min(92vh,680px)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-rose-500/35 bg-slate-950/95 shadow-2xl">
              <div className="flex shrink-0 items-start justify-between gap-2 border-b border-rose-500/20 px-3 py-2">
                <div>
                  <p className="text-sm font-bold text-rose-100">敵32体展示</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    フィールド東にも実物が並んでいます（Dキーで東へ歩く）
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMonsterLineup(false)}
                  className="shrink-0 rounded border border-white/20 px-2 py-1 text-[10px] text-white/80 hover:bg-white/10"
                >
                  閉じる
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                <MoeMonsterLineupCanvas
                  variants={visibleMonsterLineup}
                  interactive
                />
                <MoeShowcaseDeletePicker
                  kind="monster"
                  lineup={MOE_MONSTER_LINEUP}
                  families={MOE_MONSTER_FAMILIES}
                  hiddenIds={hiddenMonsterShowcaseIds}
                  deleteListIds={monsterDeleteListIds}
                  onToggleDeleteList={toggleMonsterDeleteList}
                  onRemoveFromDeleteList={(id) =>
                    setMonsterDeleteListIds((prev) =>
                      prev.filter((x) => x !== id)
                    )
                  }
                  onApplyDelete={applyMonsterDeleteList}
                  onClearDeleteList={() => setMonsterDeleteListIds([])}
                  onRestoreHidden={(id) => {
                    setHiddenMonsterShowcaseIds(
                      removeHiddenShowcaseId("monster", id)
                    );
                    setToast("1体を再表示しました");
                  }}
                  onRestoreAllHidden={() => {
                    setHiddenMonsterShowcaseIds(
                      clearHiddenShowcaseIds("monster")
                    );
                    setToast("非表示の敵をすべて戻しました");
                  }}
                  theme="rose"
                />
              </div>
            </div>
          </div>
        )}

        {showDragonLineup && is3d && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm"
            role="dialog"
            aria-label="ドラゴン10体展示"
          >
            <div className="flex max-h-[min(92vh,640px)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-amber-500/35 bg-slate-950/95 shadow-2xl">
              <div className="flex shrink-0 items-start justify-between gap-2 border-b border-amber-500/20 px-3 py-2">
                <div>
                  <p className="text-sm font-bold text-amber-100">
                    ドラゴン10体展示
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    フィールド南にも実物が並んでいます（Sキーで南へ歩く）
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDragonLineup(false)}
                  className="shrink-0 rounded border border-white/20 px-2 py-1 text-[10px] text-white/80 hover:bg-white/10"
                >
                  閉じる
              </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                <MoeDragonLineupCanvas
                  variants={visibleDragonLineup}
                  interactive
                />
                <MoeShowcaseDeletePicker
                  kind="dragon"
                  lineup={MOE_DRAGON_LINEUP}
                  hiddenIds={hiddenDragonShowcaseIds}
                  deleteListIds={dragonDeleteListIds}
                  onToggleDeleteList={toggleDragonDeleteList}
                  onRemoveFromDeleteList={(id) =>
                    setDragonDeleteListIds((prev) =>
                      prev.filter((x) => x !== id)
                    )
                  }
                  onApplyDelete={applyDragonDeleteList}
                  onClearDeleteList={() => setDragonDeleteListIds([])}
                  onRestoreHidden={(id) => {
                    setHiddenDragonShowcaseIds(
                      removeHiddenShowcaseId("dragon", id)
                    );
                    setToast("1体を再表示しました");
                  }}
                  onRestoreAllHidden={() => {
                    setHiddenDragonShowcaseIds(
                      clearHiddenShowcaseIds("dragon")
                    );
                    setToast("非表示のドラゴンをすべて戻しました");
                  }}
                  theme="amber"
                />
        </div>
      </div>
          </div>
        )}

        {showEventGuide && (
          <div
            id="moe-event-guide-panel"
            className="mt-2 max-h-[min(70vh,28rem)] overflow-y-auto overscroll-contain rounded-lg border border-white/20 bg-black/55 px-3 py-2 text-xs text-white/90 backdrop-blur-sm [scrollbar-width:thin]"
          >
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <p className="font-bold text-sky-300">イベント情報</p>
              <button
                type="button"
                onClick={() => setShowEventGuide(false)}
                className="shrink-0 rounded border border-white/20 px-1.5 py-0.5 text-[9px] text-white/70 hover:bg-white/10"
                aria-label="イベント情報を閉じる"
              >
                閉じる
              </button>
            </div>
            <p className="mb-2 text-[9px] leading-snug text-sky-100/65">
              アイテム・スキル・NPC の入手メモ（忘れ防止用）
            </p>
            <div className="flex flex-col gap-2">
              {MOE_EVENT_GUIDE_SECTIONS.map((section) => (
                <section
                  key={section.id}
                  className="rounded border border-white/10 bg-black/35 px-2 py-1.5"
                >
                  <p className="text-[10px] font-bold text-sky-200/95">
                    {section.emoji ? `${section.emoji} ` : ""}
                    {section.title}
                  </p>
                  <ul className="mt-1 flex flex-col gap-1.5">
                    {section.entries.map((entry) => (
                      <li
                        key={`${section.id}-${entry.label}`}
                        className="border-t border-white/5 pt-1 first:border-t-0 first:pt-0"
                      >
                        <p className="text-[10px] font-bold text-amber-100/95">
                          {entry.label}
                        </p>
                        <p className="text-[9px] leading-snug text-white/80">
                          ➛ {entry.detail}
                        </p>
                        {entry.note ? (
                          <p className="mt-0.5 text-[8px] leading-snug text-zinc-400">
                            {entry.note}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        )}

        {showFieldGuide && (
          <div
            id="moe-field-guide-panel"
            className="mt-2 rounded-lg border border-white/20 bg-black/55 px-3 py-2 text-xs text-white/90 backdrop-blur-sm"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <p className="font-bold text-cyan-300">
                ミーリム海岸 (Master of Epic){is3d ? " · 3D" : ""}
              </p>
              <button
                type="button"
                onClick={() => setShowFieldGuide(false)}
                className="shrink-0 rounded border border-white/20 px-1.5 py-0.5 text-[9px] text-white/70 hover:bg-white/10"
                aria-label="操作ガイドを閉じる"
              >
                閉じる
              </button>
            </div>
            {is3d ? (
              <>
                <p>WASD＝移動 · Shift＝走る · 🐉転生＝羽根をミステリードラゴンに使用 · 🔮ローダ＝{MOE_SOUL_MEMORY_RHODA_FIELD.directionHint}</p>
                <p>🐉<strong className="text-amber-200">ドラゴン10体</strong> · 👾<strong className="text-rose-200">敵32体</strong>＝設定メニューから一覧（マップ上には配置なし）</p>
                <p>★中ボス＝<strong className="text-amber-200">エルビン バイソン</strong>（スタート東の丘） · 🐊<strong className="text-emerald-300">ギュスターヴ Lv80</strong>＝スタートから北（ミニマップ上）へ体7つ分</p>
                <p className="text-zinc-400">方角は全体マップに合わせてください（<strong className="text-zinc-200">南＝下 · 北＝上</strong> · Sキーで南へ）</p>
                <p>敵クリック＝ターゲット · 設定→外部保存でペットEXPをバックアップ · Space＝ジャンプ（詠唱中は中断）</p>
                {!map3dReady && (
                  <p className="text-amber-200/90">3Dマップ読み込み中…</p>
                )}
              </>
            ) : (
              <p>WASDで移動 / 奥の列（3→4→5）ほど強い敵 / 左下ミニマップ / 敵クリックでターゲット</p>
            )}
        <p className="font-bold text-pink-300">
          討伐で訓練士EXP +（敵Lv×5 目安）／ペットは攻撃・敵攻撃の直後それぞれ約
          {Math.round(MOE_PET_ATTACK_EXP_SUCCESS_RATE * 100)}%でEXP（Wiki表）
        </p>
            <p className="text-pink-200/90">ペット／スキル／スキルアイコンバー／プレイヤースキルはそれぞれドラッグで移動できます</p>
            {is3d && onBack && (
              <button
                type="button"
                onClick={() => onBack()}
                className="mt-2 rounded-lg border border-zinc-500 bg-zinc-800/90 px-3 py-1 text-[10px] font-semibold hover:bg-zinc-700"
              >
                メニューへ戻る
              </button>
            )}
          </div>
        )}
      </div>

      <MoeNpcDialogue
        open={!!petMasterDialogue}
        mode={
          petMasterView === "menu"
            ? "menu"
            : petMasterView === "message"
              ? "message"
              : "lines"
        }
        lines={petMasterLines}
        lineIndex={petMasterDialogue?.lineIndex ?? 0}
        message={petMasterDialogue?.message}
        menuPrompt={`${currentPetData.emoji} ${currentPetDisplay.name}（Lv.${petLevelDisplay}）をどうする？`}
        menuActions={[
          { id: "talk", label: "💬 話を聞く" },
          { id: "lv100", label: "✨ Lv.100 創造儀式（テスト）" },
          {
            id: "restore",
            label: "↩ 元のLv・EXPに戻す",
            disabled: !hasPetDebugSnapshot,
          },
        ]}
        onMenuSelect={handlePetMasterMenuSelect}
        onNext={() =>
          setPetMasterDialogue((d) =>
            d?.view === "talk"
              ? { ...d, lineIndex: (d.lineIndex ?? 0) + 1 }
              : d
          )
        }
        onClose={() => closePetMasterDialogue(petMasterView === "menu")}
        petData={currentPetData}
        npc={MOE_PET_MASTER_NPC}
      />

      <MoeNpcDialogue
        open={expVendorOpen && expVendorView === "lines"}
        mode="lines"
        lines={MOE_PET_EXP_VENDOR_SECRET_LINES}
        lineIndex={expVendorLineIndex}
        onNext={() =>
          setExpVendorLineIndex((i) =>
            Math.min(i + 1, MOE_PET_EXP_VENDOR_SECRET_LINES.length - 1)
          )
        }
        onComplete={() => setExpVendorView("catalog")}
        completeLabel="カタログを見る"
        onClose={closeExpVendor}
        petData={currentPetData}
        npc={MOE_PET_EXP_VENDOR_NPC}
      />

      <MoeNpcDialogue
        open={expVendorOpen && expVendorView === "catalog"}
        mode="catalog"
        catalogTitle={`${MOE_PET_EXP_VENDOR_NPC.shopLabel}（カタログ）`}
        catalogNote="効果の実装・購入はこれから。Wiki EXP表ベースの参考リストです。"
        catalogItems={MOE_PET_EXP_SHOP_CATALOG}
        catalogSkills={MOE_PET_EXP_SHOP_SKILLS}
        onClose={closeExpVendor}
        petData={currentPetData}
        npc={MOE_PET_EXP_VENDOR_NPC}
      />

      <MoeNpcDialogue
        open={cashShopOpen && cashShopView === "lines"}
        mode="lines"
        lines={MOE_CASH_SHOP_LINES}
        lineIndex={cashShopLineIndex}
        onNext={() =>
          setCashShopLineIndex((i) =>
            Math.min(i + 1, MOE_CASH_SHOP_LINES.length - 1)
          )
        }
        onComplete={() => setCashShopView("catalog")}
        completeLabel="ショップを見る"
        onClose={closeCashShop}
        petData={currentPetData}
        npc={MOE_CASH_SHOP_NPC}
      />

      <MoeNpcDialogue
        open={cashShopOpen && cashShopView === "catalog"}
        mode="catalog"
        catalogTitle={`${MOE_CASH_SHOP_NPC.shopLabel}（お試し）`}
        catalogNote="リアルマネー決済は後続実装。今は「購入」でアイテムボックスへ配布されます。"
        catalogItems={MOE_CASH_SHOP_CATALOG_ITEMS}
        catalogActions={buildMoeCashShopBuyActions()}
        onCatalogAction={handleCashShopCatalogAction}
        onClose={closeCashShop}
        petData={currentPetData}
        npc={MOE_CASH_SHOP_NPC}
      />

      <MoeNpcDialogue
        open={rhodaOpen && rhodaView === "lines"}
        mode="lines"
        lines={MOE_SOUL_MEMORY_RHODA_LINES}
        lineIndex={rhodaLineIndex}
        onNext={() =>
          setRhodaLineIndex((i) =>
            Math.min(i + 1, MOE_SOUL_MEMORY_RHODA_LINES.length - 1)
          )
        }
        onComplete={() => setRhodaView("catalog")}
        completeLabel="アイテムをもらう"
        onClose={closeRhoda}
        petData={currentPetData}
        npc={MOE_SOUL_MEMORY_RHODA_NPC}
      />

      <MoeNpcDialogue
        open={rhodaOpen && rhodaView === "catalog"}
        mode="catalog"
        catalogTitle={`${MOE_SOUL_MEMORY_RHODA_NPC.shopLabel}`}
        catalogNote={`${MOE_SOUL_MEMORY_RHODA_NPC.title} · 魂の記憶者ローダ\n経験値の上下を調整する粉とキューブを配布します（無料 · ボックスに空きが必要）`}
        catalogActions={MOE_SOUL_MEMORY_RHODA_GIVE_ACTIONS}
        onCatalogAction={handleRhodaCatalogAction}
        onClose={closeRhoda}
        petData={currentPetData}
        npc={MOE_SOUL_MEMORY_RHODA_NPC}
      />

      <MoeNpcDialogue
        open={josephOpen && josephView === "lines"}
        mode="lines"
        lines={MOE_JOSEPH_EXP_CRYSTAL_LINES}
        lineIndex={josephLineIndex}
        onNext={() =>
          setJosephLineIndex((i) =>
            Math.min(i + 1, MOE_JOSEPH_EXP_CRYSTAL_LINES.length - 1)
          )
        }
        onComplete={() => setJosephView("catalog")}
        completeLabel="答える"
        onClose={closeJoseph}
        petData={currentPetData}
        npc={MOE_JOSEPH_NPC}
      />

      <MoeNpcDialogue
        open={josephOpen && josephView === "catalog"}
        mode="catalog"
        catalogTitle={`${MOE_JOSEPH_NPC.shopLabel}（${MOE_JOSEPH_NPC.villageNote}）`}
        catalogNote={`時の釜 · Lv100以上のペットを選んで結晶化 · 決定するまで一覧に残る${hasPetDebugSnapshot || josephCrystallizedPetIds.length ? " · お試し中" : ""}\n${formatJosephFullTierProbabilityNote()}`}
        catalogCheckboxes={[
          {
            id: MOE_JOSEPH_TIME_TABLET_OPTION.id,
            label: MOE_JOSEPH_TIME_TABLET_OPTION.label,
            detail: MOE_JOSEPH_TIME_TABLET_OPTION.detail,
            subDetail: MOE_JOSEPH_TIME_TABLET_OPTION.probabilityNote,
            checked: josephUseTimeTablet,
          },
        ]}
        onCatalogCheckboxChange={(id, checked) => {
          if (id === MOE_JOSEPH_TIME_TABLET_OPTION.id) setJosephUseTimeTablet(checked);
        }}
        catalogActions={[
          MOE_JOSEPH_CATALOG_ACTIONS[0],
          {
            ...MOE_JOSEPH_CATALOG_ACTIONS[1],
            disabled: !hasPetDebugSnapshot && josephCrystallizedPetIds.length === 0,
          },
        ]}
        onCatalogAction={handleJosephCatalogAction}
        catalogItems={MOE_JOSEPH_EXP_CRYSTAL_STEPS}
        catalogSkills={MOE_JOSEPH_EXP_CRYSTAL_TIERS}
        onClose={closeJoseph}
        petData={currentPetData}
        npc={MOE_JOSEPH_NPC}
      />

      <MoeNpcDialogue
        open={josephOpen && josephView === "pick_sacrifice"}
        mode="menu"
        menuPrompt={formatJosephSacrificePickPrompt()}
        menuActions={josephSacrificeMenuActions}
        onMenuSelect={handleJosephSacrificeSelect}
        onClose={() => setJosephView("catalog")}
        petData={currentPetData}
        npc={MOE_JOSEPH_NPC}
      />

      <MoeNpcDialogue
        open={josephOpen && josephView === "ritual_wait"}
        mode="message"
        message={MOE_JOSEPH_RITUAL_WAIT_MESSAGE}
        onComplete={handleJosephRitualWaitNext}
        completeLabel="次へ"
        closeLabel="やめる"
        onClose={cancelJosephRitual}
        petData={currentPetData}
        npc={MOE_JOSEPH_NPC}
      />

      <MoeNpcDialogue
        open={josephOpen && josephView === "ritual_process"}
        mode="message"
        message={MOE_JOSEPH_RITUAL_PROCESS_MESSAGE}
        onComplete={handleJosephRitualProcessNext}
        completeLabel="次へ"
        closeLabel="やめる"
        onClose={cancelJosephRitual}
        petData={currentPetData}
        npc={MOE_JOSEPH_NPC}
      />

      <MoeNpcDialogue
        open={josephOpen && josephView === "result" && !!josephResultMessage}
        mode="menu"
        menuPrompt={
          josephResultMessage
            ? `${josephResultMessage.text}\n\n……どうする？`
            : ""
        }
        menuActions={[
          { id: "confirm_sacrifice", label: "決定する（ペットをクリスタル化）" },
          { id: "retry_crystal", label: "もう一度作る（お試し続行）" },
        ]}
        onMenuSelect={handleJosephResultMenuSelect}
        onClose={() => {
          setJosephView("catalog");
          setJosephResultMessage(null);
          setJosephSacrificePetId(null);
        }}
        petData={currentPetData}
        npc={MOE_JOSEPH_NPC}
      />

      <MoeNpcDialogue
        open={josephSynthOpen && josephSynthView === "lines"}
        mode="lines"
        lines={MOE_JOSEPH_SYNTH_LINES}
        lineIndex={josephSynthLineIndex}
        onNext={() =>
          setJosephSynthLineIndex((i) =>
            Math.min(i + 1, MOE_JOSEPH_SYNTH_LINES.length - 1)
          )
        }
        onComplete={() => setJosephSynthView("catalog")}
        completeLabel="答える"
        onClose={closeJosephSynth}
        petData={currentPetData}
        npc={MOE_JOSEPH_SYNTH_NPC}
      />

      <MoeNpcDialogue
        open={josephSynthOpen && josephSynthView === "catalog"}
        mode="catalog"
        catalogTitle={`${MOE_JOSEPH_SYNTH_NPC.shopLabel} · ${currentPetDisplay.name}`}
        catalogNote={`連れ歩き Lv.${petLevelDisplay} · 累積 ${petTotalExp.toLocaleString()} EXP${hasPetDebugSnapshot ? " · お試し中" : ""}\nクリスタル量は Lv100〜150想定 · 段階（失敗/成功/大成功/ミラクル）を選んで合成`}
        catalogLevelOptions={MOE_JOSEPH_TRIAL_PET_LEVELS}
        catalogSelectedLevel={josephSynthTrialPetLevel}
        onCatalogLevelChange={setJosephSynthTrialPetLevel}
        catalogActions={[
          MOE_JOSEPH_SYNTH_CATALOG_ACTIONS[0],
          {
            ...MOE_JOSEPH_SYNTH_CATALOG_ACTIONS[1],
            disabled: !hasPetDebugSnapshot,
          },
        ]}
        onCatalogAction={handleJosephSynthCatalogAction}
        onClose={closeJosephSynth}
        petData={currentPetData}
        npc={MOE_JOSEPH_SYNTH_NPC}
      />

      <MoeNpcDialogue
        open={josephSynthOpen && josephSynthView === "pick_tier"}
        mode="menu"
        menuPrompt={formatJosephSynthTierPickPrompt(josephSynthTrialPetLevel)}
        menuActions={josephSynthTierMenuActions}
        onMenuSelect={handleJosephSynthTierSelect}
        onClose={() => setJosephSynthView("catalog")}
        petData={currentPetData}
        npc={MOE_JOSEPH_SYNTH_NPC}
      />

      <MoeNpcDialogue
        open={
          josephSynthOpen &&
          josephSynthView === "use_confirm" &&
          !!josephSynthCrystalPreview
        }
        mode="menu"
        menuPrompt={
          josephSynthCrystalPreview && josephSynthLastCrystal
            ? `${josephSynthLastCrystal.tierEmoji} ${josephSynthLastCrystal.tierLabel}のクリスタル\n\n${formatJosephCrystalUseConfirmPrompt(
                currentPetDisplay.name,
                josephSynthCrystalPreview
              )}`
            : ""
        }
        menuActions={[
          { id: "use_crystal", label: "使う（レベルアップを見る）" },
          { id: "skip_use", label: "使わない" },
        ]}
        onMenuSelect={handleJosephSynthMenuSelect}
        onClose={() => {
          setJosephSynthView("catalog");
          setJosephSynthLastCrystal(null);
        }}
        petData={currentPetData}
        npc={MOE_JOSEPH_SYNTH_NPC}
      />

      <MoeNpcDialogue
        open={
          josephSynthOpen &&
          josephSynthView === "use_done" &&
          !!josephSynthResultMessage
        }
        mode="message"
        message={josephSynthResultMessage}
        onComplete={() => {
          setJosephSynthView("catalog");
          setJosephSynthResultMessage(null);
          setJosephSynthLastCrystal(null);
        }}
        completeLabel="もう一度試す"
        closeLabel="終わる"
        onClose={closeJosephSynth}
        petData={currentPetData}
        npc={MOE_JOSEPH_SYNTH_NPC}
      />

      {is3d && nearPetHouse && !petMasterDialogue && !expVendorOpen && !josephOpen && !josephSynthOpen && (
        <div className="absolute bottom-28 left-1/2 z-[54] flex -translate-x-1/2 flex-col items-stretch gap-2">
          <button
            type="button"
            onClick={handlePetMasterTalk}
            className="rounded-xl border-2 border-amber-500/50 bg-zinc-950/92 px-4 py-2 text-sm font-bold text-amber-50 shadow-lg backdrop-blur-sm transition hover:bg-zinc-900 active:scale-95"
          >
            {MOE_PET_MASTER_NPC.emoji} ペットマスターと話す
          </button>
          <button
            type="button"
            onClick={handleExpVendorTalk}
            className="rounded-xl border-2 border-cyan-500/45 bg-zinc-950/92 px-4 py-2 text-sm font-bold text-cyan-50 shadow-lg backdrop-blur-sm transition hover:bg-zinc-900 active:scale-95"
          >
            {MOE_PET_EXP_VENDOR_NPC.emoji} 育成用品店を見る
          </button>
          <button
            type="button"
            onClick={handleJosephTalk}
            className="rounded-xl border-2 border-violet-500/45 bg-zinc-950/92 px-4 py-2 text-xs font-bold leading-snug text-violet-100 shadow-lg backdrop-blur-sm transition hover:bg-zinc-900 active:scale-95"
          >
            {MOE_JOSEPH_EXP_CRYSTAL_BUTTON.emoji}{" "}
            {MOE_JOSEPH_EXP_CRYSTAL_BUTTON.label}
          </button>
          <button
            type="button"
            onClick={handleJosephSynthTalk}
            className="rounded-xl border-2 border-fuchsia-500/45 bg-zinc-950/92 px-4 py-2 text-sm font-bold text-fuchsia-100 shadow-lg backdrop-blur-sm transition hover:bg-zinc-900 active:scale-95"
          >
            {MOE_JOSEPH_SYNTH_BUTTON.emoji} {MOE_JOSEPH_SYNTH_BUTTON.label}
          </button>
        </div>
      )}

      {is3d && nearRhoda && !rhodaOpen && (
        <div className="absolute bottom-28 left-1/2 z-[54] flex -translate-x-1/2 flex-col items-stretch gap-2">
          <button
            type="button"
            onClick={handleRhodaTalk}
            className="rounded-xl border-2 border-indigo-400/50 bg-zinc-950/92 px-4 py-2 text-xs font-bold leading-snug text-indigo-100 shadow-lg backdrop-blur-sm transition hover:bg-zinc-900 active:scale-95"
          >
            {MOE_SOUL_MEMORY_RHODA_BUTTON.emoji}{" "}
            {MOE_SOUL_MEMORY_RHODA_BUTTON.label}
          </button>
        </div>
      )}

      {is3d && nearCashShop && !cashShopOpen && !altarOpen && (
        <div className="pointer-events-none fixed inset-0 z-[54] flex items-center justify-center p-4 -translate-y-56">
          <button
            type="button"
            onClick={handleCashShopTalk}
            className="pointer-events-auto rounded-xl border-2 border-fuchsia-400/55 bg-zinc-950/92 px-5 py-2.5 text-sm font-bold leading-snug text-fuchsia-100 shadow-lg backdrop-blur-sm transition hover:bg-zinc-900 active:scale-95"
          >
            {MOE_CASH_SHOP_BUTTON.emoji} {MOE_CASH_SHOP_BUTTON.label}
          </button>
        </div>
      )}

      {is3d && nearAltar && !altarOpen && !trainingGuideOpen && (
        <div className="pointer-events-none fixed inset-0 z-[54] flex items-center justify-center p-4 -translate-y-48">
          <button
            type="button"
            onClick={handleAltarOpen}
            className="pointer-events-auto rounded-xl border-2 border-sky-400/55 bg-zinc-950/92 px-5 py-2.5 text-sm font-bold leading-snug text-sky-100 shadow-lg backdrop-blur-sm transition hover:bg-zinc-900 active:scale-95"
          >
            🌀 アルターで転送する
          </button>
        </div>
      )}

      {is3d &&
        nearTrainingGuideHouse &&
        !trainingGuideOpen &&
        !altarOpen &&
        !petMasterDialogue &&
        !expVendorOpen &&
        !josephOpen &&
        !josephSynthOpen && (
          <div className="absolute bottom-28 left-1/2 z-[54] flex -translate-x-1/2 flex-col items-stretch gap-2">
            <button
              type="button"
              onClick={openTrainingGuideFromHouse}
              className="rounded-xl border-2 border-emerald-500/50 bg-zinc-950/92 px-4 py-2 text-sm font-bold text-emerald-50 shadow-lg backdrop-blur-sm transition hover:bg-zinc-900 active:scale-95"
            >
              {MOE_PET_TRAINING_GUIDE_HOUSE.houseEmoji}{" "}
              {MOE_PET_TRAINING_GUIDE_HOUSE.buttonLabel}
            </button>
          </div>
        )}

      {is3d &&
        nearAgeHubHouse &&
        !altarOpen &&
        !trainingGuideOpen &&
        !petMasterDialogue &&
        !expVendorOpen &&
        !josephOpen &&
        !josephSynthOpen && (
          <div className="absolute bottom-28 left-1/2 z-[54] flex -translate-x-1/2 flex-col items-stretch gap-2">
            <button
              type="button"
              onClick={enterAgeHubHouse}
              className="rounded-xl border-2 border-teal-500/50 bg-zinc-950/92 px-4 py-2 text-sm font-bold text-teal-50 shadow-lg backdrop-blur-sm transition hover:bg-zinc-900 active:scale-95"
            >
              {MOE_AGE_HUB_HOUSE.houseEmoji} {MOE_AGE_HUB_HOUSE.buttonLabel}
            </button>
          </div>
        )}

      <MoeAltarWarpPanel
        open={is3d && altarOpen}
        altar={activeAltar}
        onClose={closeAltar}
        onSelect={handleAltarWarp}
        onOpenTrainingGuide={openTrainingGuide}
      />

      <MoePetTrainingGuidePanel
        open={is3d && trainingGuideOpen}
        onClose={closeTrainingGuide}
        inHouse={trainingGuideInHouse}
        onChant={handleTrainingGuideChant}
      />

      {is3d ? (
        <>
        <div className="absolute inset-0 z-0">
        <MoeField3DCanvas
          enemies={enemies}
          treasures={fieldTreasures}
          battlePopups={battlePopups.filter(
            (p) => p.space === "world" && p.type === "tenthBanner"
          )}
          hiddenShowcaseIds={{
            monsters: hiddenMonsterShowcaseIds,
            dragons: hiddenDragonShowcaseIds,
          }}
          overlayProjectRef={overlayProjectRef}
          onEnemyClick={(id) => handleEnemySelect(id)}
          onTreasureClick={handleTreasureClick}
          onPetClick={() => handlePetSelect()}
          onPlayerClick={handlePlayerAllySelect}
          onPetDoubleClick={() => handlePetDoubleClick()}
          onRhodaClick={handleRhodaShrineClick}
          onCashShopClick={handleCashShopNpcClick}
          onAltarClick={handleAltarClickById}
          targetEnemyId={targetEnemyId}
          enemyStatSearchOpen={enemyStatSearchOpen}
          targetEnemyFacingYawRef={targetEnemyFacingYawRef}
          enemyChaseRuntimeRef={enemyChaseRuntimeRef}
          enemyFieldSyncRef={enemyFieldSyncRef}
          enemyDetectionOptsRef={enemyDetectionOptsRef}
          playerKakureminoUntilRef={kakureminoUntilRef}
          petFocused={petFocused}
          petLabel={{
            emoji: currentPetDisplay.emoji,
            name: currentPetDisplay.name,
            level: petCombatLevel,
            hp: pet.hp,
            hpMax: pet.hpMax,
          }}
          petId={pet.id}
          petDragonVisualForm={
            pet.id === "mystery_dragon" && pet.rebornPhoenix
              ? pet.activeSkillSet === 2
                ? 2
                : 1
              : 0
          }
          onMapReady={(bounds) => {
            if (!bounds?.halfW || !bounds?.halfD) {
              const { playerAt, petAt } = snapPet3dNearPlayer(
                MOE_3D_HALF_W,
                MOE_3D_HALF_D
              );
              playerPosRef.current = playerAt;
              setPlayer(playerAt);
              setPet((prev) => ({ ...prev, x: petAt.x, y: petAt.y }));
              map3dReadyRef.current = true;
              setMap3dReady(true);
              return;
            }
            let playerAt;
            if (
              !initialSpawnAppliedRef.current &&
              bounds.tileWidth &&
              bounds.tileDepth
            ) {
              initialSpawnAppliedRef.current = true;
              const spawnAt = moe3dDefaultPlayerSpawn(
                bounds.halfW,
                bounds.halfD,
                bounds.tileWidth,
                bounds.tileDepth
              );
              playerAt = moe3dClampToPlayBounds(
                spawnAt.x,
                spawnAt.y,
                bounds,
                1.5
              );
            } else {
              const start = moe3dPlayerStartPosition(
                bounds.halfW,
                bounds.halfD
              );
              playerAt = moe3dClampToPlayBounds(
                start.x,
                start.y,
                bounds,
                1.5
              );
            }
            playerPosRef.current = playerAt;
            setPlayer(playerAt);
            setMinimap3d({
              x: playerAt.x,
              y: playerAt.y,
              yaw: cameraYawRef.current,
            });
            const { petAt } = snapPet3dNearPlayer(
              bounds.halfW,
              bounds.halfD,
              playerAt
            );
            setPet((prev) => ({ ...prev, x: petAt.x, y: petAt.y }));
            map3dReadyRef.current = true;
            setMap3dReady(true);
            setWorld((w) => {
              if (!w?.mode3d) return w;
              const tw = bounds.tileWidth ?? w.tileWidth ?? 100;
              const td = bounds.tileDepth ?? w.tileDepth ?? 50;
              const miniBounds = moe3dFullWorldBounds(tw, td);
              const { miniMapW, miniMapH } = moe3dMinimapViewSize(miniBounds);
              return {
                ...w,
                halfW: bounds.halfW,
                halfD: bounds.halfD,
                minX: bounds.minX,
                maxX: bounds.maxX,
                minZ: bounds.minZ,
                maxZ: bounds.maxZ,
                mw: bounds.halfW * 2,
                mh: bounds.halfD * 2,
                midBossPos: bounds.midBossPos ?? w.midBossPos,
                superBossPos: bounds.superBossPos ?? w.superBossPos,
                mountainBisonPos:
                  bounds.mountainBisonPos ?? w.mountainBisonPos,
                roughBisonPos: bounds.roughBisonPos ?? w.roughBisonPos,
                gustavJuniorPos:
                  bounds.gustavJuniorPos ?? w.gustavJuniorPos,
                rhodaPos: bounds.rhodaPos ?? w.rhodaPos,
                trainingGuideHousePos:
                  bounds.trainingGuideHousePos ?? w.trainingGuideHousePos,
                ageHubHousePos: bounds.ageHubHousePos ?? w.ageHubHousePos,
                dragonShowcasePos:
                  bounds.dragonShowcasePos ?? w.dragonShowcasePos,
                monsterShowcasePos:
                  bounds.monsterShowcasePos ?? w.monsterShowcasePos,
                tileWidth: tw,
                tileDepth: td,
                miniBounds,
                miniMapW,
                miniMapH,
              };
            });
            setEnemies((prev) => {
              const zoneCount = MOE_3D_ENEMY_ZONES.length;
              return prev.map((en) => {
                if (en.fieldGustav) {
                  const base =
                    MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
                  const pos =
                    bounds.gustavJuniorPos ??
                    moe3dGustavJuniorSpawnPosition(
                      bounds.halfW,
                      bounds.halfD
                    );
                  const scaled = moe3dEnemyStatsForZoneLevel(
                    base,
                    base.level
                  );
                  const statScale =
                    base.level > 0 ? scaled.level / base.level : 1;
                  return {
                    ...en,
                    x: pos.x,
                    y: pos.y,
                    level: scaled.level,
                    hpMax: scaled.hpMax,
                    petDamage: scaled.petDamage,
                    petDamageStrong: base.petDamageStrong
                      ? Math.max(
                          1,
                          Math.round(base.petDamageStrong * statScale)
                        )
                      : en.petDamageStrong,
                    wiki: scaled.wiki,
                    zoneLevel: base.level,
                    hp: en.hp <= 0 ? en.hp : Math.min(en.hp, scaled.hpMax),
                  };
                }
                if (en.fieldBison) {
                  const base =
                    MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
                  const pos =
                    en.key === MOE_MEERIM_MOUNTAIN_BISON_KEY
                      ? bounds.mountainBisonPos ??
                        moe3dMountainBisonSpawnPosition(
                          bounds.halfW,
                          bounds.halfD,
                          bounds.tileWidth,
                          bounds.tileDepth
                        )
                      : bounds.roughBisonPos ??
                        moe3dRoughBisonSpawnPosition(
                          bounds.halfW,
                          bounds.halfD,
                          bounds.tileWidth,
                          bounds.tileDepth
                        );
                  const scaled = moe3dEnemyStatsForZoneLevel(
                    base,
                    base.level
                  );
                  return {
                    ...en,
                    x: pos.x,
                    y: pos.y,
                    level: scaled.level,
                    hpMax: scaled.hpMax,
                    petDamage: scaled.petDamage,
                    wiki: scaled.wiki,
                    zoneLevel: base.level,
                    hp: en.hp <= 0 ? en.hp : Math.min(en.hp, scaled.hpMax),
                  };
                }
                if (moe3dIsMapSlotFieldEnemy(en)) {
                  const base = moeMonsterFieldBase(en.key) ?? en;
                  const tw = bounds.tileWidth ?? w.tileWidth;
                  const td = bounds.tileDepth ?? w.tileDepth;
                  const area = en.spawnArea ?? en.mapSlotId;
                  const pos =
                    moe3dMonsterFieldSpawnWorld(
                      area,
                      en.key,
                      en.slotInZone ?? 0,
                      tw,
                      td
                    ) ?? { x: en.x, y: en.y };
                  const scaled = moe3dEnemyStatsForZoneLevel(
                    base,
                    base.level
                  );
                  return {
                    ...en,
                    x: pos.x,
                    y: pos.y,
                    level: scaled.level,
                    hpMax: scaled.hpMax,
                    petDamage: scaled.petDamage,
                    wiki: scaled.wiki,
                    zoneLevel: base.level,
                    hp: en.hp <= 0 ? en.hp : Math.min(en.hp, scaled.hpMax),
                  };
                }
                if (
                  (en.midBoss || en.superBoss) &&
                  !moe3dIsMapSlotFieldEnemy(en)
                ) {
                  const base =
                    MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
                  const pos = en.superBoss
                    ? bounds.superBossPos ??
                      moe3dSuperBossSpawnPosition(
                        bounds.halfW,
                        bounds.halfD,
                        bounds.tileWidth,
                        bounds.tileDepth
                      )
                    : bounds.midBossPos ??
                      moe3dMidBossSpawnPosition(
                        bounds.halfW,
                        bounds.halfD,
                        bounds.tileWidth,
                        bounds.tileDepth
                      );
                  const scaled = moe3dEnemyStatsForZoneLevel(
                    base,
                    base.level
                  );
                  const hpMult = en.superBoss
                    ? MOE_SUPER_BOSS_HP_MULTIPLIER
                    : MOE_MID_BOSS_HP_MULTIPLIER;
                  const hpMax = Math.max(
                    1,
                    Math.round(scaled.hpMax * hpMult)
                  );
                  return {
                    ...en,
                    x: pos.x,
                    y: pos.y,
                    level: scaled.level,
                    hpMax,
                    petDamage: scaled.petDamage,
                    wiki: scaled.wiki,
                    zoneLevel: base.level,
                    hp: en.hp <= 0 ? en.hp : Math.min(en.hp, hpMax),
                  };
                }
                const zoneIndex = en.zoneIndex ?? 0;
                const slotInZone = en.slotInZone ?? 0;
                const pos = moe3dZoneEnemyPosition(
                  zoneIndex,
                  slotInZone,
                  zoneCount,
                  bounds.halfW,
                  bounds.halfD
                );
                const clamped = moe3dClampPosition(
                  pos.x,
                  pos.y,
                  bounds.halfW,
                  bounds.halfD
                );
                const base =
                  MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
                const zoneLevel =
                  en.zoneLevel ??
                  MOE_3D_ENEMY_ZONES[zoneIndex]?.level ??
                  base.level;
                const scaled = moe3dEnemyStatsForZoneLevel(
                  base,
                  zoneLevel
                );
                return {
                  ...en,
                  x: clamped.x,
                  y: clamped.y,
                  level: scaled.level,
                  hpMax: scaled.hpMax,
                  petDamage: scaled.petDamage,
                  wiki: scaled.wiki,
                  zoneLevel: scaled.zoneLevel,
                  hp:
                    en.hp <= 0 ? en.hp : Math.min(en.hp, scaled.hpMax),
                };
              });
            });
          }}
          cameraYawRef={cameraYawRef}
          playerFacingRef={playerFacingRef}
          playerPosRef={playerPosRef}
          playerJumpRef={playerJumpRef}
          playerSprintRef={playerSprintRef}
          petRunAnimRef={petRunAnimRef}
          petPosRef={petPosRef}
          petSpawnEpochRef={petSpawnEpochRef}
          petCommandRef={petCommandRef}
          petHoldYawRef={petHoldYawRef}
          duelRef={duelRef}
          duelCombatSessionRef={duelCombatSessionRef}
          petStrikeUntilRef={petStrikeUntilRef}
          petAttackMsRef={petAttackMsRef}
          enemyStrikeUntilRef={enemyStrikeUntilRef}
          enemyAttackMsRef={enemyAttackMsRef}
          battleSpeedMultRef={battleSpeedMultRef}
          enemyStrikeVariantRef={enemyStrikeVariantRef}
          moe3dCombatExtentsRef={moe3dCombatExtentsRef}
          playerSummonFxRef={playerSummonFxRef}
        />
        <MoeField3DBattleOverlay
          battlePopups={battlePopups.filter((p) => p.space === "world")}
          worldHealPopupsRef={worldHealPopupsRef}
          worldSkillExpPopupsRef={worldSkillExpPopupsRef}
          overlayProjectRef={overlayProjectRef}
          enemies={enemies}
        />
        <MoeField3DTreasureOverlay
          treasures={fieldTreasures}
          overlayProjectRef={overlayProjectRef}
          onTreasureLootClick={handleTreasureLootClick}
          onTreasureClose={handleTreasureClose}
        />
        </div>

        {world.mode3d && mini3Player && (
          <MoeDraggableMinimapPanel
            storageKey="life-rpg-moe-minimap-pos-3d"
            hint="黄＝視界 · 紫＝自分 · 🔮＝ローダ · 🏠＝育成表の家 · 赤＝敵 · 南↓北↑"
          >
            <svg
              className="block w-full rounded border border-white/10"
              style={minimap3dSvgStyle(mini3W, mini3H)}
              viewBox={`0 0 ${mini3W} ${mini3H}`}
              preserveAspectRatio="xMidYMid meet"
              aria-label="3D全体マップミニマップ"
            >
              {mini3TileRects.map((rect) => (
                <rect
                  key={rect.key}
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  fill={rect.fill}
                  opacity={rect.opacity ?? 1}
                  stroke={rect.stroke}
                  strokeWidth={rect.strokeWidth ?? 0}
                />
              ))}
              {enemies
                .filter(
                  (en) =>
                    en.hp > 0 &&
                    minimapEnemyVisible(en, minimap3d.x, minimap3d.y)
                )
                .map((en) => {
                  const chaseRt = enemyChaseRuntimeRef.current[en.id];
                  const chasing = Boolean(chaseRt?.aggro);
                  const sync = enemyFieldSyncRef.current[en.id];
                  const worldX = chasing
                    ? chaseRt.x
                    : (sync?.x ?? en.x);
                  const worldZ = chasing
                    ? chaseRt.y
                    : (sync?.y ?? en.y);
                  const p = mini3Project(worldX, worldZ);
                  const isMid = en.midBoss;
                  const isSuper = en.superBoss;
                  const isGustav = en.fieldGustav;
                  const r = minimap3dEnemyDotRadius(en, mini3W);
                  const fill = chasing
                    ? "#fb923c"
                    : isSuper
                      ? "#a78bfa"
                      : isMid
                        ? "#fbbf24"
                        : isGustav
                          ? "#22c55e"
                          : "#ef4444";
                  return (
                    <g key={`mini3-en-${en.id}`}>
                      {chasing ? (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={r + 2.2}
                          fill="none"
                          stroke="#fdba74"
                          strokeWidth={1.1}
                          opacity={0.88}
                        />
                      ) : null}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={r}
                        fill={fill}
                        opacity={
                          chasing ? 0.84 : minimap3dEnemyDotOpacity(en)
                        }
                        stroke={isMid || isSuper ? "#fff" : chasing ? "#fff" : "none"}
                        strokeWidth={isMid || isSuper || chasing ? 1 : 0}
                        strokeOpacity={isMid || isSuper || chasing ? 0.75 : 0}
                      />
                      {isMid && (
                        <text
                          x={p.x}
                          y={p.y - r - 1}
                          textAnchor="middle"
                          fill="#fde68a"
                          fontSize={Math.max(6, mini3W * 0.045)}
                          fontWeight="bold"
                          opacity={0.7}
                        >
                          ★
                        </text>
                      )}
                      {isGustav && (
                        <text
                          x={p.x}
                          y={p.y - r - 1}
                          textAnchor="middle"
                          fontSize={Math.max(5, mini3W * 0.04)}
                          opacity={0.75}
                        >
                          🐊
                        </text>
                      )}
                    </g>
                  );
                })}
              {mini3TileRects.map((rect) =>
                rect.label && rect.width > 18 && rect.height > 10 ? (
                  <text
                    key={`${rect.key}-label`}
                    x={rect.x + rect.width / 2}
                    y={rect.y + rect.height / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#0f172a"
                    fontSize={Math.max(7, Math.min(11, rect.height * 0.42))}
                    fontWeight="bold"
                    opacity={0.92}
                  >
                    {rect.label}
                  </text>
                ) : null
              )}
              {mini3Rhoda && (
                <g aria-label={MOE_SOUL_MEMORY_RHODA_FIELD.spotLabel}>
                  <circle
                    cx={mini3Rhoda.x}
                    cy={mini3Rhoda.y}
                    r={Math.max(4, mini3W * 0.016)}
                    fill="#6366f1"
                    opacity={0.9}
                    stroke="#c4b5fd"
                    strokeWidth={1}
                  />
                  <text
                    x={mini3Rhoda.x}
                    y={mini3Rhoda.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.max(6, mini3W * 0.055)}
                  >
                    🔮
                  </text>
                </g>
              )}
              {mini3TrainingGuideHome && (
                <g aria-label={MOE_PET_TRAINING_GUIDE_HOUSE.houseLabel}>
                  <circle
                    cx={mini3TrainingGuideHome.x}
                    cy={mini3TrainingGuideHome.y}
                    r={Math.max(4, mini3W * 0.016)}
                    fill="#047857"
                    opacity={0.92}
                    stroke="#a7f3d0"
                    strokeWidth={1}
                  />
                  <text
                    x={mini3TrainingGuideHome.x}
                    y={mini3TrainingGuideHome.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.max(6, mini3W * 0.055)}
                  >
                    {MOE_PET_TRAINING_GUIDE_HOUSE.mapIcon}
                  </text>
                </g>
              )}
              {mini3AgeHubHome && (
                <g aria-label={MOE_AGE_HUB_HOUSE.houseLabel}>
                  <circle
                    cx={mini3AgeHubHome.x}
                    cy={mini3AgeHubHome.y}
                    r={Math.max(4, mini3W * 0.016)}
                    fill="#0d9488"
                    opacity={0.92}
                    stroke="#99f6e4"
                    strokeWidth={1}
                  />
                  <text
                    x={mini3AgeHubHome.x}
                    y={mini3AgeHubHome.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.max(6, mini3W * 0.055)}
                  >
                    {MOE_AGE_HUB_HOUSE.mapIcon}
                  </text>
                </g>
              )}
              {mini3ViewTip && mini3ViewLeft && mini3ViewRight && (
                <polygon
                  points={`${mini3ViewTip.x},${mini3ViewTip.y} ${mini3ViewLeft.x},${mini3ViewLeft.y} ${mini3ViewRight.x},${mini3ViewRight.y}`}
                  fill="#fbbf24"
                  opacity={0.75}
                />
              )}
              <circle
                cx={mini3Player.x}
                cy={mini3Player.y}
                r={Math.max(5, mini3W * 0.022)}
                fill="#6366f1"
                stroke="#ffffff"
                strokeWidth={Math.max(2, mini3W * 0.008)}
              />
              <rect
                x={0}
                y={0}
                width={mini3W}
                height={mini3H}
                fill="none"
                stroke="#ffffff"
                strokeWidth={Math.max(2, mini3W * 0.006)}
                opacity={0.35}
              />
            </svg>
          </MoeDraggableMinimapPanel>
        )}
        </>
      ) : (
      <>
      <div className="absolute will-change-transform" style={{ width: world.mw, height: world.mh, transform: `translate(${camX}px, ${camY}px)` }}>
        <div className="absolute inset-0 bg-[#87b8e8]/30" />

        {world.rowLayout?.map((row) => {
          if (row.kind === "start") {
            return (
              <div
                key="start-row"
                className="absolute left-0 right-0 border-t-2 border-amber-800/40"
                style={{
                  top: row.y,
                  height: row.h,
                  background:
                    "linear-gradient(180deg, #f5deb3 0%, #d2b48c 55%, #c4a574 100%)",
                }}
              />
            );
          }
          const style = moe2dZoneRowStyle(row.zoneRow);
          const cells = [];
          for (let c = 0; c < row.cols; c++) {
            cells.push(
              <div
                key={`${row.zoneRow}-${c}`}
                className="absolute border border-emerald-900/25"
                style={{
                  left: (world.mw / row.cols) * c,
                  top: row.y,
                  width: world.mw / row.cols,
                  height: row.h,
                  background: style.fill,
                  boxShadow: `inset 0 0 0 1px ${style.stroke}`,
                }}
              />
            );
          }
          const zoneLabels =
            row.zoneRow === 3
              ? [
                  { x: world.mw * 0.2, label: `Lv.${formatEnemyLevelUi(MOE_3D_ENEMY_ZONES[3].level)}` },
                  { x: world.mw * 0.8, label: `Lv.${formatEnemyLevelUi(MOE_3D_ENEMY_ZONES[4].level)}` },
                ]
              : [
                  {
                    x: world.mw / 2,
                    label: `Lv.${formatEnemyLevelUi(MOE_3D_ENEMY_ZONES[row.zoneRow]?.level ?? 0)}`,
                  },
                ];
          return (
            <React.Fragment key={`zone-row-${row.zoneRow}`}>
              {cells}
              {zoneLabels.map((zl) => (
                <div
                  key={zl.label}
                  className="pointer-events-none absolute -translate-x-1/2 rounded bg-black/45 px-2 py-0.5 text-[10px] font-bold text-emerald-100"
                  style={{ left: zl.x, top: row.y + 8 }}
                >
                  {zl.label} · {row.cols}マス
                </div>
              ))}
            </React.Fragment>
          );
        })}

        <div className="absolute right-0 top-0 bottom-0 w-[18%] bg-blue-500/35 border-l-4 border-white/25" />

        {moe2dRiverBoundaries(world.rowLayout ?? []).map((boundaryY, i) => (
          <React.Fragment key={`river-${i}`}>
            <div
              className="absolute left-0 right-0 bg-blue-600/55 border-y-2 border-blue-400/30"
              style={{ top: boundaryY - 12, height: 24 }}
            />
            <div
              className="absolute bg-[#8b5a2b] border-2 border-[#5d3a1a] shadow-md"
              style={{
                left: world.mw / 2 - 60,
                top: boundaryY - 14,
                width: 120,
                height: 28,
              }}
            />
          </React.Fragment>
        ))}

        <div className="absolute bottom-0 left-0 flex h-[120px] w-[150px] items-center justify-center border-t-4 border-r-4 border-zinc-600 bg-zinc-800 text-sm font-bold text-white">
          ビスクへ
        </div>

        {world.rowLayout?.length > 0 &&
          (() => {
            const house = moe2dPetHouseLayout(world.rowLayout, world.mw);
            const nearHouse = moe2dIsNearPetHouse(
              player.x,
              player.y,
              world.rowLayout,
              world.mw
            );
            return (
              <>
                <div
                  className="pointer-events-none absolute z-[6] rounded-xl border-2 border-amber-700/45 bg-gradient-to-b from-amber-200/55 to-amber-900/35 shadow-md"
                  style={{
                    left: house.x,
                    top: house.y,
                    width: house.width,
                    height: house.height,
                  }}
                />
                <div
                  className="pointer-events-none absolute z-[7] -translate-x-1/2 rounded bg-black/50 px-2 py-0.5 text-[9px] font-bold text-amber-100"
                  style={{
                    left: house.x + house.width / 2,
                    top: house.y - 12,
                  }}
                >
                  {MOE_PET_MASTER_NPC.houseEmoji} {MOE_PET_MASTER_NPC.houseLabel}
                </div>
                <button
                  type="button"
                  onClick={handlePetMasterTalk}
                  className={`absolute z-[8] flex flex-col items-center rounded-lg transition active:scale-95 ${
                    nearHouse
                      ? "ring-2 ring-amber-400/80 ring-offset-1 ring-offset-sky-900"
                      : ""
                  }`}
                  style={{
                    left: house.npcX - 22,
                    top: house.npcY - 28,
                    width: 44,
                  }}
                  title={MOE_PET_MASTER_NPC.name}
                >
                  <span className="text-3xl drop-shadow-lg">
                    {MOE_PET_MASTER_NPC.emoji}
                  </span>
                  {nearHouse && (
                    <span className="mt-0.5 rounded bg-amber-900/85 px-1.5 py-0.5 text-[8px] font-bold text-amber-100">
                      話す
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleExpVendorTalk}
                  className={`absolute z-[8] flex flex-col items-center rounded-lg transition active:scale-95 ${
                    nearHouse
                      ? "ring-2 ring-cyan-400/70 ring-offset-1 ring-offset-sky-900"
                      : ""
                  }`}
                  style={{
                    left: house.npcX + 34,
                    top: house.npcY - 26,
                    width: 44,
                  }}
                  title={MOE_PET_EXP_VENDOR_NPC.name}
                >
                  <span className="text-2xl drop-shadow-lg">
                    {MOE_PET_EXP_VENDOR_NPC.emoji}
                  </span>
                  {nearHouse && (
                    <span className="mt-0.5 rounded bg-cyan-950/90 px-1 py-0.5 text-[7px] font-bold text-cyan-100">
                      店
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleJosephTalk}
                  className={`absolute z-[8] flex flex-col items-center rounded-lg transition active:scale-95 ${
                    nearHouse
                      ? "ring-2 ring-violet-400/70 ring-offset-1 ring-offset-sky-900"
                      : ""
                  }`}
                  style={{
                    left: house.npcX - 34,
                    top: house.npcY - 26,
                    width: 44,
                  }}
                  title={MOE_JOSEPH_EXP_CRYSTAL_BUTTON.label}
                >
                  <span className="text-2xl drop-shadow-lg">
                    {MOE_JOSEPH_EXP_CRYSTAL_BUTTON.emoji}
                  </span>
                  {nearHouse && (
                    <span className="mt-0.5 rounded bg-violet-950/90 px-1 py-0.5 text-[7px] font-bold text-violet-100">
                      結晶
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleJosephSynthTalk}
                  className={`absolute z-[8] flex flex-col items-center rounded-lg transition active:scale-95 ${
                    nearHouse
                      ? "ring-2 ring-fuchsia-400/70 ring-offset-1 ring-offset-sky-900"
                      : ""
                  }`}
                  style={{
                    left: house.npcX - 34,
                    top: house.npcY + 18,
                    width: 44,
                  }}
                  title={MOE_JOSEPH_SYNTH_NPC.shopLabel}
                >
                  <span className="text-2xl drop-shadow-lg">
                    {MOE_JOSEPH_SYNTH_BUTTON.emoji}
                  </span>
                  {nearHouse && (
                    <span className="mt-0.5 rounded bg-fuchsia-950/90 px-1 py-0.5 text-[7px] font-bold text-fuchsia-100">
                      合成
                    </span>
                  )}
                </button>
              </>
            );
          })()}

        {world.rowLayout?.length > 0 &&
          (() => {
            const rhodaSpot = moe2dRhodaLayout(world.rowLayout, world.mw);
            const nearRhodaSpot = moe2dIsNearRhoda(
              player.x,
              player.y,
              world.rowLayout,
              world.mw
            );
            return (
              <>
                <div
                  className="pointer-events-none absolute z-[6] rounded-xl border-2 border-indigo-500/45 bg-gradient-to-b from-indigo-300/40 to-indigo-950/35 shadow-md"
                  style={{
                    left: rhodaSpot.x,
                    top: rhodaSpot.y,
                    width: rhodaSpot.width,
                    height: rhodaSpot.height,
                  }}
                />
                <div
                  className="pointer-events-none absolute z-[7] -translate-x-1/2 rounded bg-black/50 px-2 py-0.5 text-[9px] font-bold text-indigo-100"
                  style={{
                    left: rhodaSpot.x + rhodaSpot.width / 2,
                    top: rhodaSpot.y - 12,
                  }}
                >
                  {MOE_SOUL_MEMORY_RHODA_FIELD.spotEmoji}{" "}
                  {MOE_SOUL_MEMORY_RHODA_FIELD.spotLabel}
                </div>
                <button
                  type="button"
                  onClick={handleRhodaTalk}
                  className={`absolute z-[8] flex flex-col items-center rounded-lg transition active:scale-95 ${
                    nearRhodaSpot
                      ? "ring-2 ring-indigo-400/75 ring-offset-1 ring-offset-sky-900"
                      : ""
                  }`}
                  style={{
                    left: rhodaSpot.npcX - 22,
                    top: rhodaSpot.npcY - 28,
                    width: 44,
                  }}
                  title={MOE_SOUL_MEMORY_RHODA_NPC.name}
                >
                  <span className="text-3xl drop-shadow-lg">
                    {MOE_SOUL_MEMORY_RHODA_NPC.emoji}
                  </span>
                  {nearRhodaSpot && (
                    <span className="mt-0.5 rounded bg-indigo-950/90 px-1.5 py-0.5 text-[8px] font-bold text-indigo-100">
                      ローダ
                    </span>
                  )}
                </button>
              </>
            );
          })()}

        {(() => {
          const bossArea = moe2dBossAreaLayout(world.rowLayout, world.mw);
          return (
            <>
              <div
                className="pointer-events-none absolute z-[5] rounded-xl border-2 border-amber-600/50 bg-gradient-to-b from-amber-600/28 to-stone-900/35 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.25)]"
                style={{
                  left: bossArea.midArea.x,
                  top: bossArea.midArea.y,
                  width: bossArea.midArea.width,
                  height: bossArea.midArea.height,
                }}
              />
              <div
                className="pointer-events-none absolute z-[5] -translate-x-1/2 rounded bg-black/55 px-2 py-0.5 text-[9px] font-bold text-amber-100"
                style={{
                  left: bossArea.midBossPos.x,
                  top: bossArea.midArea.y - 14,
                }}
              >
                ★ 中ボス
              </div>
              <div
                className="pointer-events-none absolute z-[5] rounded-xl border-2 border-violet-600/50 bg-gradient-to-b from-violet-600/25 to-stone-900/40 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.25)]"
                style={{
                  left: bossArea.superArea.x,
                  top: bossArea.superArea.y,
                  width: bossArea.superArea.width,
                  height: bossArea.superArea.height,
                }}
              />
              <div
                className="pointer-events-none absolute z-[5] -translate-x-1/2 rounded bg-black/55 px-2 py-0.5 text-[9px] font-bold text-violet-100"
                style={{
                  left: bossArea.superBossPos.x,
                  top: bossArea.superArea.y - 14,
                }}
              >
                ◆ 超ボス
              </div>
            </>
          );
        })()}

        {/* Enemies */}
        {enemies
          .filter((en) => en.hp > 0)
          .map((en) => {
            const hpPct = petResourceBarPct(en.hp, en.hpMax);
            const isTarget = targetEnemyId === en.id;
            const pad = en.superBoss
              ? MOE_2D_SUPER_BOSS_UI_PAD
              : en.midBoss
                ? MOE_2D_MID_BOSS_UI_PAD
                : 35;
            const hitPad = pad + (en.superBoss || en.midBoss ? 4 : 10);
            const size = en.superBoss
              ? MOE_2D_SUPER_BOSS_UI_SIZE
              : en.midBoss
                ? MOE_2D_MID_BOSS_UI_SIZE
                : 70;
            const nameTop = en.superBoss ? pad + 28 : en.midBoss ? pad + 22 : 58;
            const prefix = en.superBoss ? "◆ " : en.midBoss ? "★ " : "";
            const bossZ =
              en.superBoss ? "z-[17]" : en.midBoss ? "z-[16]" : "z-[10]";
            const bossRing = en.superBoss
              ? "ring-2 ring-violet-400/75"
              : en.midBoss
                ? "ring-2 ring-amber-500/70"
                : "";
            return (
              <React.Fragment key={en.id}>
                <div
                  className="pointer-events-none absolute z-[12]"
                  style={{
                    left: en.x - 42,
                    top: en.y - nameTop,
                    width: 84,
                  }}
                >
                  <p className="truncate text-center text-[8px] font-bold text-white drop-shadow">
                    {prefix}
                    {en.name}
                  </p>
                </div>
                {!isTarget && (
                  <div
                    className="pointer-events-none absolute z-[13] -translate-x-1/2"
                    style={{
                      left: en.x,
                      top: en.y - nameTop - 12,
                    }}
                  >
                    <MoeCircleMarker size={10} className="mx-auto" />
                  </div>
                )}
                {isTarget && (
                  <>
                    <div
                      className="pointer-events-none absolute z-[13] -translate-x-1/2"
                      style={{
                        left: en.x,
                        top: en.y - nameTop - 14,
                      }}
                    >
                      <MoeCrystalMarker size={8} className="mx-auto" />
                    </div>
                    <div
                      className="pointer-events-none absolute z-[12]"
                      style={{
                        left: en.x - 42,
                        top: en.y - 46,
                        width: 84,
                      }}
                    >
                      <div className="ml-3 h-1.5 overflow-hidden rounded-full bg-black/55 ring-1 ring-yellow-400/70">
                        <div
                          className="h-full transition-all duration-150"
                          style={{
                            width: `${hpPct}%`,
                            backgroundColor: enemyHpBarColor(hpPct),
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
          <button
            type="button"
            title={enemyWikiStatsTitle(en)}
                  onPointerDown={(e) => handleEnemySelect(en.id, e)}
                  className={`absolute flex flex-col items-center justify-center rounded-xl border-2 p-1 shadow-lg transition hover:scale-110 active:scale-95 ${en.color} ${
                    isTarget ? "ring-2 ring-yellow-400 ring-offset-1 ring-offset-sky-900" : ""
                  } ${bossZ} ${bossRing}`}
                  style={{
                    left: en.x - hitPad,
                    top: en.y - hitPad,
                    width: size + (hitPad - pad) * 2,
                    minHeight: size + (hitPad - pad) * 2,
                  }}
                >
                  <span
                    className={
                      en.superBoss
                        ? "text-6xl"
                        : en.midBoss
                          ? "text-4xl"
                          : "text-2xl"
                    }
                  >
                    {en.emoji}
                  </span>
                  <span className="text-[9px] font-bold text-white leading-tight">
                    Lv.{formatEnemyLevelUi(en.level)}
                  </span>
          </button>
              </React.Fragment>
            );
          })}

        {/* Pet */}
        <button
          type="button"
          onPointerDown={handlePetSelect}
          onDoubleClick={handlePetDoubleClick}
          className={`absolute z-[24] flex flex-col items-center ${
            petCommandMode === "wait" || petCommandMode === "sit"
              ? ""
              : "transition-all duration-100"
          } ${
            petFocused ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-sky-900 rounded-lg" : ""
          } ${petTenthCelebrationActive ? "moe-pet-celebrate-bounce" : ""}`}
          style={{ left: pet.x - 30, top: pet.y - 30, width: 60, padding: 8 }}
          title={`${currentPetDisplay.name} Lv.${petLevelDisplay}`}
        >
          {(petFocused ||
            petCommandMode === "wait" ||
            petCommandMode === "sit") && (
            <div
              className="pointer-events-none absolute bottom-full left-1/2 mb-1 w-[4.5rem] -translate-x-[calc(50%-0.55em)]"
            >
              {petFocused && (
                <>
                  <div className="mb-1 flex justify-center">
                    <MoeCrystalMarker size={8} />
                  </div>
                  <p className="truncate text-center text-[8px] font-bold text-emerald-100 drop-shadow">
                    {currentPetDisplay.name}
                  </p>
                </>
              )}
              {(petCommandMode === "wait" || petCommandMode === "sit") && (
                <p
                  className={`text-center text-[7px] font-bold drop-shadow ${
                    petCommandMode === "sit"
                      ? "text-violet-200"
                      : "text-zinc-200"
                  }`}
                >
                  {MOE_PET_COMMAND_UI[petCommandMode].hint}
                </p>
              )}
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-black/55 ring-1 ring-emerald-400/60">
                <div
                  className="h-full bg-emerald-400 transition-all duration-150"
                  style={{
                    width: `${petResourceBarPct(pet.hp, pet.hpMax)}%`,
                  }}
                />
              </div>
            </div>
          )}
          <span className="text-3xl drop-shadow-lg">{currentPetData.emoji}</span>
          {!petFocused &&
            petCommandMode !== "wait" &&
            petCommandMode !== "sit" && (
          <div className="w-full bg-black/50 h-1 mt-0.5 rounded-full overflow-hidden">
            <div
              className="bg-green-400 h-full"
              style={{ width: `${petResourceBarPct(pet.hp, pet.hpMax)}%` }}
            />
          </div>
          )}
        </button>

        {battlePopups
          .filter((p) => p.space === "world")
          .map((pop) =>
            pop.type === "tenthBanner" ? (
            <div
              key={pop.id}
                role="status"
                className="pointer-events-none absolute z-[26] moe-tenth-banner-rise"
              style={{
                left: pop.x,
                top: pop.y,
                }}
              >
                <span className="block text-center text-[15px] font-black uppercase tracking-[0.12em] text-yellow-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                  {pop.value}
                </span>
              </div>
            ) : pop.type === "heal" ? (
            <div
              key={pop.id}
              className="pointer-events-none absolute z-[25]"
              style={{
                left: pop.x,
                top: pop.y - 36,
                transform: "translate(-50%, 0)",
              }}
            >
              <span className="moe-heal-popup-rise block text-center text-[17px] font-black tabular-nums tracking-tight text-cyan-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                +{pop.value}
              </span>
            </div>
            ) : pop.type === "skill_exp" ? (
            <div
              key={pop.id}
              className="pointer-events-none absolute z-[25]"
              style={{
                left: pop.x,
                top: pop.y - 44,
                transform: "translate(-50%, 0)",
              }}
            >
              <span className="moe-battle-popup-rise block text-center text-[16px] font-black tabular-nums tracking-tight text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                EXP{pop.value}
              </span>
            </div>
            ) : (
            <div
              key={pop.id}
              className="pointer-events-none absolute z-[25]"
              style={{
                left: pop.x,
                top:
                  pop.y -
                  MOE_DAMAGE_POPUP_2D_TOP_OFFSET_PX +
                  (pop.stackIndex != null ? 10 : 0),
                transform: `translate(-50%, ${
                  pop.stackIndex != null
                    ? -pop.stackIndex * MOE_COMBO_DAMAGE_STACK_PX
                    : 0
                }px)`,
              }}
            >
              <span
                className={`${
                  pop.stackIndex != null
                    ? "moe-battle-popup-combo-firework"
                    : "moe-battle-popup-rise"
                } block text-center text-[18px] font-black tabular-nums tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
                    pop.type === "tenth"
                      ? "text-amber-200"
                      : pop.fromEnemy
                        ? "text-red-700"
                        : "text-amber-300"
                }`}
                style={
                  pop.stackIndex != null ? moeComboPopupCssVars(pop) : undefined
                }
              >
                {pop.value}
              </span>
            </div>
            )
          )}

        {/* Player */}
        <div
          className="pointer-events-none absolute z-[25] flex items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-2xl shadow-xl"
          style={{
            left: player.x - PLAYER_R,
            top: player.y - PLAYER_R,
            width: PLAYER_R * 2,
            height: PLAYER_R * 2,
          }}
        >
          🧙
        </div>
      </div>

      {world.rowLayout && (
        <MoeDraggableMinimapPanel
          storageKey="life-rpg-moe-minimap-pos-2d"
          hint="黄枠＝現在の画面 · 紫＝自分 · 赤＝敵"
        >
          <svg
            className="block w-full rounded border border-white/10"
            style={minimapSvgStyle(world.mw, world.mh)}
            viewBox={`0 0 ${world.mw} ${world.mh}`}
            preserveAspectRatio="xMidYMid meet"
            aria-label="全体マップミニマップ"
          >
            {world.rowLayout.map((row) => {
              if (row.kind === "start") {
                return (
                  <rect
                    key="mini-start"
                    x={0}
                    y={row.y}
                    width={world.mw}
                    height={row.h}
                    fill="#d2b48c"
                  />
                );
              }
              const style = moe2dZoneRowStyle(row.zoneRow);
              const cellW = world.mw / row.cols;
              return [...Array(row.cols)].map((_, c) => (
                <rect
                  key={`mini-${row.zoneRow}-${c}`}
                  x={cellW * c}
                  y={row.y}
                  width={cellW}
                  height={row.h}
                  fill={moe2dZoneRowMiniFill(row.zoneRow)}
                  stroke={style.stroke}
                  strokeWidth={2}
                />
              ));
            })}
            <rect
              x={world.mw * 0.82}
              y={0}
              width={world.mw * 0.18}
              height={world.mh}
              fill="#3b82f6"
              opacity={0.35}
            />
            {moe2dRiverBoundaries(world.rowLayout).map((y, i) => (
              <line
                key={`mini-river-${i}`}
                x1={0}
                y1={y}
                x2={world.mw}
                y2={y}
                stroke="#2563eb"
                strokeWidth={8}
                opacity={0.55}
              />
            ))}
            {enemies
              .filter(
                (en) =>
                  en.hp > 0 &&
                  minimapEnemyVisible(en, player.x, player.y)
              )
              .map((en) => (
                <circle
                  key={`mini-en-${en.id}`}
                  cx={en.x}
                  cy={en.y}
                  r={en.midBoss || en.superBoss ? 6 : 4}
                  fill={
                    en.superBoss
                      ? "#a78bfa"
                      : en.midBoss
                        ? "#fbbf24"
                        : "#ef4444"
                  }
                  opacity={en.midBoss || en.superBoss ? 0.65 : 0.5}
                />
              ))}
            <circle
              cx={player.x}
              cy={player.y}
              r={14}
              fill="#6366f1"
              stroke="#ffffff"
              strokeWidth={4}
            />
            <rect
              x={Math.max(0, player.x - view.w / 2)}
              y={Math.max(0, player.y - view.h / 2)}
              width={view.w}
              height={view.h}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={14}
              opacity={0.9}
            />
          </svg>
        </MoeDraggableMinimapPanel>
      )}
      </>
      )}
      <input
        ref={externalSaveImportInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleExternalSaveImport(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
