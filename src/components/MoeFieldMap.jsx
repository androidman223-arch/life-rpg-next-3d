"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import { flushSync } from "react-dom";
import { loadGameStatus } from "@/lib/gameStatus";
import {
  getDefaultPetForId,
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
  getMoeExternalSaveFolderLabel,
  getMoeExternalSaveLocationHint,
  importMoeExternalSavePayload,
  pickMoeExternalSaveDirectory,
  pickMoeExternalSaveFile,
  saveMoeExternalSaveJson,
  writeMoePetsSave,
} from "@/lib/moePetSave";
import { playSfx } from "@/lib/sfx";
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
import MoeField3DBattleOverlay from "@/components/MoeField3DBattleOverlay";
import MoeField3DTreasureOverlay from "@/components/MoeField3DTreasureOverlay";
import MoeTargetWindow from "@/components/MoeTargetWindow";
import MoeCrystalMarker from "@/components/MoeCrystalMarker";
import MoeNpcDialogue from "@/components/MoeNpcDialogue";
import MoePetHpWindow from "@/components/MoePetHpWindow";
import MoeDuelTimeBarWindow from "@/components/MoeDuelTimeBarWindow";
import MoeSkillIconBar, {
  MOE_SKILL_ICON_SLOT_COUNT,
} from "@/components/MoeSkillIconBar";
import MoePlayerSkillIconBar from "@/components/MoePlayerSkillIconBar";
import MoeVerticalSkillPanel from "@/components/MoeVerticalSkillPanel";
import {
  buildPlayerNinjaSkillSlots,
  loadPlayerSkillUnlocks,
  savePlayerSkillUnlocks,
  removePlayerSkillUnlock,
  MOE_SHINSOKU_ACTIVE_MS,
  MOE_SHINSOKU_COOLDOWN_MS,
} from "@/data/moePlayerNinjaSkills";
import {
  loadPlayerSkillSlotOrder,
  savePlayerSkillSlotOrder,
  swapPlayerSkillSlotOrder,
} from "@/data/moePlayerSkillSlotOrder";
import { buildPlayerSkillSlotEntry } from "@/lib/moePlayerSkillSlotUi";
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
} from "@/data/moePhoenixDragon";
import {
  loadMoePetSkillMode,
  saveMoePetSkillMode,
  MOE_PET_SKILL_MODE_ALL,
  MOE_PET_SKILL_MODE_LEARNED,
  moePetSkillModeLabel,
} from "@/lib/moePetSkillSettings";
import { formatMoePetSkillDescription } from "@/lib/moePetSkillDescription";
import {
  addMoeItemBoxItem,
  loadMoeItemBoxSlots,
  moeFieldLootToBoxItem,
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
/** ミニマップ SVG の表示高さ（viewBox 比の 1/2） */
function minimapSvgStyle(mapW, mapH) {
  return { width: "100%", aspectRatio: `${mapW * 2} / ${mapH}` };
}
const MOVE_SPEED = 4.5;
/** 3Dマップは座標範囲が狭いので、同じ数値だと約10倍速く感じる */
const MOVE_SPEED_3D = 0.18;
const SPRINT_MULTIPLIER_3D = 2;
/** Shift ダッシュ ON 時の追加倍率（通常ダッシュ × この値） */
const SPRINT_BOOST_MULT_3D = 3;
const JUMP_VELOCITY_3D = 15;
const GRAVITY_3D = 24;
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
const PET_FOLLOW_DIST_3D_TIGHT = 1.2;
const PET_FOLLOW_DIST_2D = 60;
const PET_FOLLOW_DIST_2D_TIGHT = 16;
const PET_APPROACH_THRESHOLD_3D = 0.55;
const PET_APPROACH_THRESHOLD_2D = 10;

const MOE_PET_COMMAND_UI = {
  follow: { label: "もどれ", toast: "もどれ！（プレイヤーのもとへ）", hint: "追従中" },
  wait: { label: "待て", toast: "待て！（その場で待機）", hint: "待機中" },
  sit: { label: "座れ", toast: "座れ！（自然回復）", hint: "座って回復中" },
  auto: { label: "オート", toast: "オート：敵を自動で攻撃", hint: "オート攻撃中" },
  bero: { label: "ベロー", toast: "ベロー！（ぴったりくっつく）", hint: "ぴったり追従中" },
};
const INITIAL_MOE_PET_LEVEL = MOE_SAVED_PET_INITIAL_LEVEL;

/** HP/MP バー幅（max が 0 のとき NaN 防止） */
function petResourceBarPct(current, max) {
  const m = Number(max);
  if (!m || m <= 0) return 0;
  return Math.min(100, (Number(current) / m) * 100);
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
        const start = moe3dPlayerStartPosition(MOE_3D_HALF_W, MOE_3D_HALF_D);
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
  const petDebugSnapshotRef = useRef(null);
  const [hasPetDebugSnapshot, setHasPetDebugSnapshot] = useState(false);
  const [showFieldGuide, setShowFieldGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [petSkillMode, setPetSkillMode] = useState(MOE_PET_SKILL_MODE_ALL);
  const [externalSaveFolderLabel, setExternalSaveFolderLabel] = useState(null);
  /** 3D：follow | wait | sit | auto */
  const [petCommandMode, setPetCommandMode] = useState("follow");
  const [petFollowTight, setPetFollowTight] = useState(false);
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
  /** 経験値パウダー・キューブ使用時の一気Lvアップ（クリックで次ページ） */
  /** @type {[{ pages: string[], index: number, tone?: 'up' | 'down' } | null]} */
  const [expConsumableLevelUpFlow, setExpConsumableLevelUpFlow] = useState(null);
  const [petTenthCelebrationActive, setPetTenthCelebrationActive] = useState(false);
  const [trainerStatus, setTrainerStatus] = useState(() => loadGameStatus());
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
    const loaded = loadInitialMoePetFromStorage();
    if (is3d) {
      snapPet3dNearPlayer(MOE_3D_HALF_W, MOE_3D_HALF_D);
      const petAt = petPosRef.current;
      loaded.x = petAt.x;
      loaded.y = petAt.y;
    }
    setPet(loaded);
    setJosephCrystallizedPetIds(loadJosephCrystallizedPetIds());
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
  const petFollowTightRef = useRef(false);
  const waitAnchorRef = useRef(null);
  /** 3D：待て/座れ中に固定する向き（プレイヤー追従回転を止める） */
  const petHoldYawRef = useRef(null);
  const autoAttackCooldownRef = useRef(0);
  const sitRegenAccRef = useRef(0);
  const [regenActive, setRegenActive] = useState(false);
  const regenActiveRef = useRef(false);
  const regenAccRef = useRef(0);
  /** 3D：リジェネ回復ポップ（React state を介さず毎フレーム描画） */
  const worldHealPopupsRef = useRef([]);
  /** 3D: world → screen 投影（MoeField3DCanvas が毎フレーム更新） */
  const overlayProjectRef = useRef(null);
  /** 3D: 戦闘距離計算用（ペット・敵モデルの正面オフセット実測） */
  const moe3dCombatExtentsRef = useRef({ pet: null, enemies: {} });
  const targetEnemyIdRef = useRef(null);
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
  /** 神速クールダウン表示（秒）。null = 使用可能 */
  const [shinsokuCooldownSec, setShinsokuCooldownSec] = useState(null);
  const shinsokuActiveUntilRef = useRef(0);
  const shinsokuCooldownUntilRef = useRef(0);
  const shinsokuTimersRef = useRef({ active: null, cooldown: null });
  const [shinobiashiOn, setShinobiashiOn] = useState(false);
  const shinobiashiOnRef = useRef(false);
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
    approachChargeScheduledRef.current = false;
    duelCombatSessionRef.current += 1;
    moeSkillComboGenRef.current += 1;
    petStrikeUntilRef.current = 0;
    enemyStrikeUntilRef.current = 0;
    enemyStrikeSeqRef.current = 0;
    enemyStrikeVariantRef.current = { enemyId: null, variant: "weak" };
    duelRef.current = null;
    setDuel(null);
    flushPersistActivePet(petStateRef.current);
  }, []);

  useEffect(() => {
    setPlayerSkillUnlocks(loadPlayerSkillUnlocks());
  }, []);
  useEffect(() => {
    playerSkillUnlocksRef.current = playerSkillUnlocks;
  }, [playerSkillUnlocks]);

  useEffect(() => {
    petRef.current = pet;
  }, [pet]);

  useEffect(() => {
    duelRef.current = duel;
  }, [duel]);

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

  /** ペット攻撃・敵攻撃のいずれかの直後に共通（MOE系・約55%・Wiki表ベース） */
  const rollPetExpOnHit = React.useCallback((petBefore, enemyLevel) => {
    const totalBefore = resolvePetTotalExp(petBefore);
    const combatLevel = getMoePetLevelFromTotalExp(totalBefore);
    const expBase = getMoePetExpBaseOnHitSuccess(combatLevel, enemyLevel);
    const petExpRoll = Math.random() < MOE_PET_ATTACK_EXP_SUCCESS_RATE;
    let petAfter = { ...petBefore };
    let petExpGained = null;
    if (petExpRoll && expBase > 0 && combatLevel < MOE_PET_MAX_LEVEL) {
      const r = applyMoePetExpGain(petAfter, expBase, calculatePetStats);
      petAfter = r.pet;
      if (r.gained > 0) {
        petExpGained = r.gained;
        petRef.current = petAfter;
        petStateRef.current = petAfter;
        if (r.tenthLeveled) {
          queueMicrotask(() => {
            triggerPetTenthLevelUpCelebration(r.messages);
          });
        } else if (r.leveled) {
          queueMicrotask(() => {
            setPetLevelUpFlash(formatPetLevelUpFlashText(r.messages));
            playSfx("levelUp");
          });
        }
      }
    }
    return { petAfter, petExpGained };
  }, [triggerPetTenthLevelUpCelebration]);

  const commitPetExpFromHit = useCallback((petAfter) => {
    const totalExp = Math.max(0, Math.floor(Number(petAfter.totalExp) || 0));
    const level = getMoePetLevelFromTotalExp(totalExp);
    const levelDisplay =
      getMoePetFractionalLevelFromTotalExp(totalExp).displayLabel;
    const expIntoLevel = getMoePetExpIntoLevelFromTotal(totalExp, level);
    const next = {
      ...petAfter,
      totalExp,
      level,
      levelDisplay,
      expIntoLevel,
    };
    petRef.current = next;
    petStateRef.current = next;
    setPet((prev) => ({
      ...prev,
      totalExp,
      level,
      levelDisplay,
      expIntoLevel,
      hp: next.hp,
      mp: next.mp,
      hpMax: next.hpMax,
      mpMax: next.mpMax,
      x: prev.x,
      y: prev.y,
    }));
    clearMoePetDebugSnapshot(petAfter.id);
  }, []);

  /**
   * ペットの1ヒット分（通常アタック・連撃スキル共通）
   * @param opts.grantExp コンボ中は最終ヒットだけ true 推奨
   * @param opts.skipPetDamageDedupe 同一ダメージ連打をデデュープしない（8連表示用）
   * @param opts.stackIndex 連撃スキル時の縦積み位置（0=下）
   * @param opts.clearToastWhenNoDefeatMsg false のとき、撃破以外でトーストを消さない（コンボ途中）
   * @param opts.attackScale 指定時は (攻撃力×係数) でダメージ式（通常アタック相当の減衰）
   * @param opts.magicScale 指定時は (魔力×係数) でダメージ式（attackScale より優先）
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
          let damage;
          if (magicScale != null) {
            damage = computePetDamageAgainstEnemy(
              magBase * magicScale,
              enemyDef
            );
          } else if (attackScale != null) {
            damage = computePetDamageAgainstEnemy(
              atkBase * attackScale,
              enemyDef
            );
          } else {
            damage = computePetDamageAgainstEnemy(atkBase, enemyDef);
          }
          const newHpAfterHit = target.hp - damage;
          defeated = newHpAfterHit <= 0;

          let petAfter = petNow;
          let petExpGained = null;
          if (grantExp) {
            const r = rollPetExpOnHit(petNow, target.level);
            petAfter = r.petAfter;
            petExpGained = r.petExpGained;
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
              if (en.midBoss || en.superBoss) {
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
                const zoneIndex = en.zoneIndex ?? 0;
                const zoneCount = MOE_3D_ENEMY_ZONES.length;
                const hw = w.halfW ?? w.mw / 2;
                const hd = w.halfD ?? w.mh / 2;
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
        flushSync(() => commitPetExpFromHit(hitFollowUp.petAfter));
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
            hitFollowUp.enemyKey
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
    if (!showSettings) return;
    let cancelled = false;
    getMoeExternalSaveFolderLabel().then((label) => {
      if (!cancelled) setExternalSaveFolderLabel(label);
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
          }
          setToast("外部保存データを読み込んだ");
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
    } else if (result.folderName) {
      setToast(`新規ファイル「${result.fileName}」を 📁${result.folderName} に保存した`);
      setExternalSaveFolderLabel(result.folderName);
    } else {
      setToast(`新規ファイル「${result.fileName}」に保存した`);
    }
  }, []);

  const handleChangeExternalSaveFolder = useCallback(async () => {
    const result = await pickMoeExternalSaveDirectory();
    if (result.aborted) return;
    if (!result.ok) {
      setToast("このブラウザでは保存フォルダを記憶できません");
      return;
    }
    setExternalSaveFolderLabel(result.folderName);
    setToast(`保存フォルダを「${result.folderName}」に変更した`);
  }, []);

  const handleExternalSaveImportPick = useCallback(async () => {
    const picked = await pickMoeExternalSaveFile();
    if (picked.aborted) return;
    if (picked.ok && picked.file) {
      applyExternalSaveFile(picked.file);
      return;
    }
    externalSaveImportInputRef.current?.click();
  }, [applyExternalSaveFile]);

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
        if (
          !d ||
          d.phase !== "simultaneous_charge" ||
          d.enemyId !== enemyId
        ) {
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

      if (
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

      const d = duelRef.current;
      const duelSkillSeq =
        d?.phase === "simultaneous_charge" && d.enemyId != null
          ? resolveMoeDuelSkillSequence(pet.id, skill)
          : null;
      if (duelSkillSeq) {
        scheduleMoeDuelSkillHits(d.enemyId, duelSkillSeq);
      }
    },
    [pet.id, petCombatLevel, petSkillMode, scheduleMoeDuelSkillHits, pushWorldHealPopup]
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
      const now = Date.now();
      if (now < shinsokuActiveUntilRef.current) return;
      if (now < shinsokuCooldownUntilRef.current) return;

      setDashBoost3x(true);
      dashBoost3xRef.current = true;
      shinsokuActiveUntilRef.current = now + MOE_SHINSOKU_ACTIVE_MS;
      setShinsokuCooldownSec(null);
      setToast(formatMoePetSkillDescription(skill));

      if (shinsokuTimersRef.current.cooldown) {
        clearTimeout(shinsokuTimersRef.current.cooldown);
        shinsokuTimersRef.current.cooldown = null;
      }
      if (shinsokuTimersRef.current.active) {
        clearTimeout(shinsokuTimersRef.current.active);
      }
      shinsokuTimersRef.current.active = window.setTimeout(() => {
        setDashBoost3x(false);
        dashBoost3xRef.current = false;
        shinsokuActiveUntilRef.current = 0;
        shinsokuCooldownUntilRef.current =
          Date.now() + MOE_SHINSOKU_COOLDOWN_MS;
        setShinsokuCooldownSec(
          Math.ceil(MOE_SHINSOKU_COOLDOWN_MS / 1000)
        );
      }, MOE_SHINSOKU_ACTIVE_MS);
      return;
    }
    if (skill.id === "ninja_kakuremino") {
      setToast(formatMoePetSkillDescription(skill));
      return;
    }
    setToast(formatMoePetSkillDescription(skill));
  }, []);

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
    if (!ends) {
      const r = rollPetExpOnHit(petDamaged, target.level);
      petAfter = r.petAfter;
      petExpGained = r.petExpGained;
    }

    const pt = petPosRef.current;
    const px = pt.x;
    const py = pt.y;
    if (petExpGained != null) {
      flushSync(() => commitPetExpFromHit(petAfter));
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
      const newEnemies = [];
      const zoneCount = MOE_3D_ENEMY_ZONES.length;
      MOE_3D_ENEMY_ZONES.forEach((zone, zoneIndex) => {
        const data = MOE_MEERIM_ENEMIES.find((d) => d.key === zone.key);
        if (!data) return;
        for (let i = 0; i < MOE_3D_ENEMIES_PER_ZONE; i++) {
          const pairOffset =
            i === 0
              ? -MOE_3D_ZONE_PAIR_LEVEL_OFFSET
              : MOE_3D_ZONE_PAIR_LEVEL_OFFSET;
          const zoneLevel =
            Math.round((zone.level + pairOffset) * 10) / 10;
          const { x, y } = moe3dZoneEnemyPosition(
            zoneIndex,
            i,
            zoneCount,
            halfW,
            halfD
          );
          const scaled = moe3dEnemyStatsForZoneLevel(data, zoneLevel);
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
            sy: 0,
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
            moe3dMidBossSpawnPosition(halfW, halfD),
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
            moe3dGustavJuniorSpawnPosition(halfW, halfD)
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
            moe3dSuperBossSpawnPosition(halfW, halfD),
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
            moe3dMountainBisonSpawnPosition(halfW, halfD)
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
            moe3dRoughBisonSpawnPosition(halfW, halfD)
          )
        );
      }
      setWorld({ mw, mh, mode3d: true, halfW, halfD });
      setEnemies(newEnemies);
      approachChargeScheduledRef.current = false;
      duelRef.current = null;
      setDuel(null);
      const start = moe3dPlayerStartPosition(halfW, halfD);
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

      const cdUntil = shinsokuCooldownUntilRef.current;
      if (cdUntil > now) {
        setShinsokuCooldownSec(Math.max(0, Math.ceil((cdUntil - now) / 1000)));
      } else if (cdUntil !== 0) {
        shinsokuCooldownUntilRef.current = 0;
        setShinsokuCooldownSec(0);
        if (!shinsokuTimersRef.current.cooldown) {
          shinsokuTimersRef.current.cooldown = window.setTimeout(() => {
            setShinsokuCooldownSec(null);
            shinsokuTimersRef.current.cooldown = null;
          }, 350);
        }
      }
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
      if (shinsokuTimersRef.current.active) {
        clearTimeout(shinsokuTimersRef.current.active);
      }
      if (shinsokuTimersRef.current.cooldown) {
        clearTimeout(shinsokuTimersRef.current.cooldown);
      }
    },
    []
  );

  useEffect(() => {
    const sync = () => setTrainerStatus(loadGameStatus());
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

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
      !expConsumableLevelUpFlow &&
      !showPetStatusOverlay &&
      !showFieldGuide
    )
      return;
    keysRef.current = createEmptyInputKeys();
    playerSprintRef.current = false;
    petRunAnimRef.current = false;
  }, [petMasterDialogue, expVendorOpen, rhodaOpen, josephOpen, josephSynthOpen, expConsumableLevelUpFlow, showPetStatusOverlay, showFieldGuide]);

  useEffect(() => {
    if (!world) return;
    let raf;
    let lastFrame = performance.now();

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
        followDist: petFollowTightRef.current
          ? PET_FOLLOW_DIST_3D_TIGHT
          : PET_FOLLOW_DIST_3D,
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

    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      ensureDuelStillValid();
      tickRegen(dt);

      const k = keysRef.current;
      let inputX = 0;
      let inputZ = 0;
      if (k.up) inputZ -= 1;
      if (k.down) inputZ += 1;
      if (k.left) inputX -= 1;
      if (k.right) inputX += 1;

      let dx = 0;
      let dy = 0;
      if (inputX !== 0 || inputZ !== 0) {
        if (world.mode3d) {
          const sprinting = !!(k.shift && (inputX !== 0 || inputZ !== 0));
          const speedMult = sprintSpeedMult3d(sprinting);
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
        const sprinting = !!(k.shift && (inputX !== 0 || inputZ !== 0));
        playerSprintRef.current = sprinting;
        const cmd = petCommandRef.current;
        petRunAnimRef.current =
          sprinting &&
          (cmd === "follow" || cmd === "auto") &&
          duelRef.current?.phase !== "simultaneous_charge";
        const speedMult = sprintSpeedMult3d(sprinting);
        const petSpeed = MOVE_SPEED_3D * 60 * dt * speedMult;

        const jump = playerJumpRef.current;
        if (k.space && jump.offset <= 0.02 && jump.vy <= 0) {
          jump.vy = JUMP_VELOCITY_3D;
        }
        jump.offset += jump.vy * dt;
        jump.vy -= GRAVITY_3D * dt;
        if (jump.offset <= 0) {
          jump.offset = 0;
          jump.vy = Math.max(0, jump.vy);
        }

        if (map3dReadyRef.current) {
          let nx = playerPosRef.current.x + dx;
          let ny = playerPosRef.current.y + dy;
          const clamped = moe3dClampToPlayBounds(
            nx,
            ny,
            worldRef.current,
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
              followDist: petFollowTightRef.current
                ? PET_FOLLOW_DIST_2D_TIGHT
                : PET_FOLLOW_DIST_2D,
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
  }, [world, onBack]);

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
  const playerSkillCooldownSec =
    shinsokuCooldownSec !== null
      ? { ninja_shinsoku: shinsokuCooldownSec }
      : {};

  const swapPlayerSkillSlots = useCallback((from, to) => {
    setPlayerSkillSlotOrder((prev) => {
      const next = swapPlayerSkillSlotOrder(prev, from, to);
      savePlayerSkillSlotOrder(next);
      return next;
    });
  }, []);

  const resetShinsokuForGustavRematch = useCallback(() => {
    setPlayerSkillUnlocks((prev) =>
      removePlayerSkillUnlock(prev, "ninja_shinsoku")
    );
    setDashBoost3x(false);
    dashBoost3xRef.current = false;
    shinsokuActiveUntilRef.current = 0;
    shinsokuCooldownUntilRef.current = 0;
    setShinsokuCooldownSec(null);
    if (shinsokuTimersRef.current.active) {
      clearTimeout(shinsokuTimersRef.current.active);
      shinsokuTimersRef.current.active = null;
    }
    if (shinsokuTimersRef.current.cooldown) {
      clearTimeout(shinsokuTimersRef.current.cooldown);
      shinsokuTimersRef.current.cooldown = null;
    }
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
    if (mode !== "follow") {
      petFollowTightRef.current = false;
      setPetFollowTight(false);
    }
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
    petFollowTightRef.current = false;
    setPetFollowTight(false);
    applyPetCommand("follow");
    setToast(
      wasFighting
        ? "もどれ！（戦闘をやめてプレイヤーのもとへ）"
        : MOE_PET_COMMAND_UI.follow.toast
    );
  }, [applyPetCommand, cancelActiveDuel]);

  const handlePetBero = useCallback(() => {
    const wasFighting = cancelActiveDuel();
    applyPetCommand("follow");
    petFollowTightRef.current = true;
    setPetFollowTight(true);
    setToast(
      wasFighting
        ? "ベロー！（戦闘やめてぴったりくっつく）"
        : MOE_PET_COMMAND_UI.bero.toast
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
      queueMicrotask(() => {
        startTransition(() => {
          setPetFocused(false);
          setTargetEnemyId(id);
          setToast(null);
        });
      });
    },
    []
  );

  const handlePetSelect = useCallback((e) => {
    if (e?.button === 2) return;
    e?.preventDefault?.();
    e?.stopPropagation?.();
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
    if (!en || en.hp <= 0) setTargetEnemyId(null);
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

  const playerOrderedSkillSlots = useMemo(() => {
    const ninjaById = {
      ninja_shinobiashi: playerSkillIconSlots[0],
      ninja_shinsoku: playerSkillIconSlots[1],
      ninja_kakuremino: playerSkillIconSlots[2],
    };
    const ctx = {
      healCdSec,
      regenActive,
      shinobiashiOn,
      dashBoost3x,
      playerSkillCooldownSec,
      ninjaById,
      healAmountLight: HEAL_AMOUNT_LIGHT,
      healAmountHeal: HEAL_AMOUNT_HEALING,
      healAmountAll: HEAL_AMOUNT_HEAL_ALL,
      petRegenHp: PET_REGEN_HP,
      petRegenMp: PET_REGEN_MP,
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
    shinobiashiOn,
    dashBoost3x,
    playerSkillCooldownSec,
    handleRegenToggle,
    activatePlayerSkillSlot,
  ]);

  const playerVerticalSkillSlots = useMemo(
    () =>
      playerOrderedSkillSlots.map(
        ({ label, disabled, active, cooldownSec, title, onClick, reorderable }) => ({
          label,
          disabled,
          active,
          cooldownSec,
          title,
          onClick,
          reorderable,
        })
      ),
    [playerOrderedSkillSlots]
  );

  const playerIconBarSlots = playerOrderedSkillSlots;

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
  const mini3W = world.mw ?? mini3HalfW * 2;
  const mini3H = world.mh ?? mini3HalfD * 2;
  const mini3Player = is3d
    ? moe3dWorldToMinimap(
        minimap3d.x,
        minimap3d.y,
        mini3HalfW,
        mini3HalfD,
        mini3W,
        mini3H
      )
    : null;
  const mini3Rhoda = is3d
    ? (() => {
        const spot = world.rhodaPos ?? moe3dRhodaPosition(mini3HalfW, mini3HalfD);
        return moe3dWorldToMinimap(
          spot.x,
          spot.y,
          mini3HalfW,
          mini3HalfD,
          mini3W,
          mini3H
        );
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

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-sky-900"
      onContextMenu={is3d ? (e) => e.preventDefault() : undefined}
    >
      <MoeTargetWindow target={targetEnemy} duelUi={targetDuelUi} />
      <MoePetHpWindow
        emoji={currentPetDisplay.emoji}
        name={currentPetDisplay.name}
        levelLabel={petLevelDisplay}
        hp={pet.hp}
        hpMax={pet.hpMax}
        duelUi={petDuelUi}
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
                    petCommandMode === "follow" && !petFollowTight
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
                  onClick={handlePetBero}
                  className={`rounded border px-0.5 py-1 text-[7px] font-bold leading-tight transition active:scale-95 ${
                    petFollowTight && petCommandMode === "follow"
                      ? "border-pink-400/70 bg-pink-900/90 text-pink-50 ring-1 ring-pink-300/50"
                      : "border-pink-600/50 bg-pink-950/85 text-pink-100 hover:bg-pink-900/90"
                  }`}
                >
                  ベロー
                </button>
                </div>
                </div>
                {pet.id === "mystery_dragon" && pet.rebornPhoenix ? (
                  <div className="mt-1 grid grid-cols-2 gap-0.5 rounded-md border border-fuchsia-500/35 bg-zinc-950/60 p-1">
                    <button
                      type="button"
                      onClick={() => applyMysterySkillSet(1)}
                      className={`rounded border px-0.5 py-1 text-[7px] font-bold leading-tight transition active:scale-95 ${
                        pet.activeSkillSet !== 2
                          ? "border-indigo-300/75 bg-indigo-900/90 text-indigo-50 ring-1 ring-indigo-200/40"
                          : "border-indigo-700/50 bg-indigo-950/80 text-indigo-100 hover:bg-indigo-900/85"
                      }`}
                      title="技① — ミステリー ドラゴン系"
                    >
                      技①
                    </button>
                    <button
                      type="button"
                      onClick={() => applyMysterySkillSet(2)}
                      className={`rounded border px-0.5 py-1 text-[7px] font-bold leading-tight transition active:scale-95 ${
                        pet.activeSkillSet === 2
                          ? "border-fuchsia-300/75 bg-fuchsia-900/90 text-fuchsia-50 ring-1 ring-fuchsia-200/40"
                          : "border-fuchsia-700/50 bg-fuchsia-950/80 text-fuchsia-100 hover:bg-fuchsia-900/85"
                      }`}
                      title="技② — 健康のフェニックス系"
                    >
                      技②
                    </button>
                  </div>
                ) : null}
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
                        自分の攻撃・敵攻撃の直後それぞれ約
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

      {/* スキル 1〜7 — 縦パネル（⚡×2 付き） */}
      <MoeVerticalSkillPanel
        storageKey="life-rpg-moe-skill-panel-pos"
        title="ペット"
        variant="amber"
        topAction={{
          label: battleSpeed2x ? "⚡×2 ON" : "⚡×2",
          active: battleSpeed2x,
          title: "交戦中：チャージ・スタン・攻撃アニメを2倍速",
          onClick: () => setBattleSpeed2x((v) => !v),
        }}
        slots={skillPanelLabels.map((label, i) => {
          const skill = combatSkillSlots[i];
          const locked =
            petSkillMode === MOE_PET_SKILL_MODE_LEARNED &&
            skill &&
            !isMoePetSkillUsableAtLevel(skill, petCombatLevel, petSkillMode);
          return {
            label,
            disabled: !skill || locked,
            title: skill?.name ?? "",
            onClick: () => activateCombatSkillSlot(i, skill),
          };
        })}
      />

      {is3d && (
        <MoeVerticalSkillPanel
          storageKey="life-rpg-moe-player-skill-panel-pos"
          defaultPos={() => ({
            x: Math.max(8, window.innerWidth - 166),
            y: 8,
          })}
          title="プレイヤースキル"
          variant="emerald"
          reorderable
          onSwapSlots={swapPlayerSkillSlots}
          slots={playerVerticalSkillSlots}
        />
      )}

      <MoeSkillIconBar
        slots={skillIconSlots}
        onActivate={activateCombatSkillSlot}
        isSkillUsable={(skill) =>
          isMoePetSkillUsableAtLevel(skill, petCombatLevel, petSkillMode)
        }
      />

      {is3d && (
        <MoePlayerSkillIconBar
          slots={playerIconBarSlots}
          onSwapSlots={swapPlayerSkillSlots}
        />
      )}

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
          "神速のスキルを消しますか？\n\nはい → スキル記録をリセット\n（ギュスターヴの宝＝キューブは再ドロップ可）"
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

      <div className="absolute left-3 top-3 z-40 max-w-[min(90vw,22rem)]">
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
                  初回だけ保存フォルダを選びます。2回目以降も毎回新しいJSONファイルを追加保存（上書きしません）
                </p>
                {externalSaveFolderLabel ? (
                  <p className="mt-1 text-[9px] text-amber-200/85">
                    保存フォルダ: 📁 {externalSaveFolderLabel}
                  </p>
                ) : null}
                {(() => {
                  const hint = getMoeExternalSaveLocationHint();
                  if (!hint.fileName) return null;
                  return (
                    <p className="mt-0.5 text-[9px] text-amber-200/65">
                      直近の保存: {hint.fileName}
                    </p>
                  );
                })()}
                <div className="mt-1.5 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={handleExternalSave}
                    className="rounded border border-amber-500/45 bg-amber-950/45 px-2 py-1.5 text-left text-[11px] font-bold text-amber-200 transition hover:bg-amber-900/35 active:scale-[0.98]"
                  >
                    {externalSaveFolderLabel ? "ペットEXPを新規保存" : "保存先を選んで新規保存…"}
                  </button>
                  {externalSaveFolderLabel ? (
                    <button
                      type="button"
                      onClick={handleChangeExternalSaveFolder}
                      className="rounded border border-amber-600/25 bg-transparent px-2 py-1 text-left text-[10px] font-bold text-amber-200/80 underline-offset-2 hover:text-amber-100 hover:underline active:scale-[0.98]"
                    >
                      保存フォルダを変更…
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleExternalSaveImportPick}
                    className="rounded border border-emerald-600/40 bg-emerald-950/35 px-2 py-1.5 text-left text-[11px] font-bold text-emerald-200 transition hover:bg-emerald-900/30 active:scale-[0.98]"
                  >
                    外部保存を読み込む…
                  </button>
                  <input
                    ref={externalSaveImportInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleExternalSaveImport(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
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
                <p>★中ボス＝<strong className="text-amber-200">エルビン バイソン</strong>（スタート東の丘） · 🐊<strong className="text-emerald-300">ギュスターヴ Lv80</strong>＝スタートから北（ミニマップ上）へ体7つ分</p>
                <p className="text-zinc-400">方角は全体マップに合わせてください（<strong className="text-zinc-200">南＝下 · 北＝上</strong> · Sキーで南へ）</p>
                <p>敵クリック＝ターゲット · 設定→外部保存でペットEXPをバックアップ · Space＝ジャンプ</p>
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

      {is3d ? (
        <>
        <div className="absolute inset-0 z-0">
        <MoeField3DCanvas
          enemies={enemies}
          treasures={fieldTreasures}
          battlePopups={battlePopups.filter(
            (p) => p.space === "world" && p.type === "tenthBanner"
          )}
          overlayProjectRef={overlayProjectRef}
          onEnemyClick={(id) => handleEnemySelect(id)}
          onTreasureClick={handleTreasureClick}
          onPetClick={() => handlePetSelect()}
          onPetDoubleClick={() => handlePetDoubleClick()}
          onRhodaClick={handleRhodaShrineClick}
          targetEnemyId={targetEnemyId}
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
            const start = moe3dPlayerStartPosition(bounds.halfW, bounds.halfD);
            const playerAt = moe3dClampToPlayBounds(
              start.x,
              start.y,
              bounds,
              1.5
            );
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
            setWorld((w) =>
              w?.mode3d
                ? {
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
                  }
                : w
            );
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
                          bounds.halfD
                        )
                      : bounds.roughBisonPos ??
                        moe3dRoughBisonSpawnPosition(
                          bounds.halfW,
                          bounds.halfD
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
                if (en.midBoss || en.superBoss) {
                  const base =
                    MOE_MEERIM_ENEMIES.find((d) => d.key === en.key) ?? en;
                  const pos = en.superBoss
                    ? bounds.superBossPos ??
                      moe3dSuperBossSpawnPosition(bounds.halfW, bounds.halfD)
                    : bounds.midBossPos ??
                      moe3dMidBossSpawnPosition(bounds.halfW, bounds.halfD);
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
          petStrikeUntilRef={petStrikeUntilRef}
          petAttackMsRef={petAttackMsRef}
          enemyStrikeUntilRef={enemyStrikeUntilRef}
          enemyAttackMsRef={enemyAttackMsRef}
          battleSpeedMultRef={battleSpeedMultRef}
          enemyStrikeVariantRef={enemyStrikeVariantRef}
          moe3dCombatExtentsRef={moe3dCombatExtentsRef}
        />
        <MoeField3DBattleOverlay
          battlePopups={battlePopups.filter((p) => p.space === "world")}
          worldHealPopupsRef={worldHealPopupsRef}
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
          <div className="absolute bottom-6 left-3 z-[45] w-[9.75rem] rounded-lg border border-white/25 bg-black/78 p-1.5 text-white shadow-lg backdrop-blur-md">
            <p className="mb-1 text-center text-[8px] font-bold tracking-wide text-cyan-200/95">
              全体マップ
            </p>
            <svg
              className="block w-full rounded border border-white/10"
              style={minimapSvgStyle(mini3W, mini3H)}
              viewBox={`0 0 ${mini3W} ${mini3H}`}
              preserveAspectRatio="xMidYMid meet"
              aria-label="3D全体マップミニマップ"
            >
              {moe3dMinimapZoneRects(
                mini3HalfW,
                mini3HalfD,
                mini3W,
                mini3H
              ).map((rect) => (
                <rect
                  key={rect.key}
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  fill={rect.fill}
                  opacity={rect.opacity ?? 1}
                />
              ))}
              {enemies
                .filter((en) => en.hp > 0)
                .map((en) => {
                  const p = moe3dWorldToMinimap(
                    en.x,
                    en.y,
                    mini3HalfW,
                    mini3HalfD,
                    mini3W,
                    mini3H
                  );
                  const isMid = en.midBoss;
                  const isSuper = en.superBoss;
                  const isGustav = en.fieldGustav;
                  const r = isSuper
                    ? Math.max(8, mini3W * 0.032)
                    : isMid
                      ? Math.max(7, mini3W * 0.028)
                      : isGustav
                        ? Math.max(6, mini3W * 0.024)
                        : Math.max(4, mini3W * 0.018);
                  const fill = isSuper
                    ? "#a78bfa"
                    : isMid
                      ? "#fbbf24"
                      : isGustav
                        ? "#22c55e"
                        : "#ef4444";
                  return (
                    <g key={`mini3-en-${en.id}`}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={r}
                        fill={fill}
                        opacity={0.95}
                        stroke={isMid || isSuper ? "#fff" : "none"}
                        strokeWidth={isMid || isSuper ? 1.5 : 0}
                      />
                      {isMid && (
                        <text
                          x={p.x}
                          y={p.y - r - 2}
                          textAnchor="middle"
                          fill="#fde68a"
                          fontSize={Math.max(7, mini3W * 0.07)}
                          fontWeight="bold"
                        >
                          ★
                        </text>
                      )}
                      {isGustav && (
                        <text
                          x={p.x}
                          y={p.y - r - 2}
                          textAnchor="middle"
                          fill="#bbf7d0"
                          fontSize={Math.max(7, mini3W * 0.07)}
                          fontWeight="bold"
                        >
                          🐊
                        </text>
                      )}
                    </g>
                  );
                })}
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
            <p className="mt-1 text-center text-[7px] text-white/55">
              黄＝視界 · 紫＝自分 · 🔮＝ローダ（南） · 赤＝敵 · 南↓北↑ · S＝南
            </p>
          </div>
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
        <div className="absolute bottom-6 left-3 z-[45] w-[9.75rem] rounded-lg border border-white/25 bg-black/78 p-1.5 text-white shadow-lg backdrop-blur-md">
          <p className="mb-1 text-center text-[8px] font-bold tracking-wide text-cyan-200/95">
            全体マップ
          </p>
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
              .filter((en) => en.hp > 0)
              .map((en) => (
                <circle
                  key={`mini-en-${en.id}`}
                  cx={en.x}
                  cy={en.y}
                  r={10}
                  fill="#ef4444"
                  opacity={0.9}
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
          <p className="mt-1 text-center text-[7px] text-white/55">
            黄枠＝現在の画面 · 紫＝自分 · 赤＝敵
          </p>
        </div>
      )}
      </>
      )}
    </div>
  );
}
