"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { loadGameStatus } from "@/lib/gameStatus";
import {
  getDefaultPetForId,
  loadInitialMoePetFromStorage,
  loadMoePetsSave,
  loadMoePetDebugSnapshot,
  saveMoePetDebugSnapshot,
  clearMoePetDebugSnapshot,
  petFromDebugSnapshot,
  MOE_SAVED_PET_INITIAL_LEVEL,
  persistCurrentMoePet,
  petFromSaveSlot,
  writeMoePetsSave,
} from "@/lib/moePetSave";
import { playSfx } from "@/lib/sfx";
import { MOE_MEERIM_ENEMIES, MOE_MEERIM_MID_BOSS_KEY, MOE_MEERIM_SUPER_BOSS_KEY, MOE_MID_BOSS_HP_MULTIPLIER, MOE_SUPER_BOSS_HP_MULTIPLIER, enemyWikiStatsTitle, formatEnemyLevelUi } from "@/data/moeMeerimEnemies";
import {
  applyMoePetExpGain,
  getMoePetExpBaseOnHitSuccess,
  getMoePetExpRemainingToNextLevel,
  getMoePetExpToNextLevel,
  getMoePetFreshTotalExpForLevel,
  getMoePetTotalExpFromLegacyProgress,
  MOE_PET_ATTACK_EXP_SUCCESS_RATE,
  MOE_PET_MAX_LEVEL,
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
import MoeTargetWindow from "@/components/MoeTargetWindow";
import MoeCrystalMarker from "@/components/MoeCrystalMarker";
import MoeNpcDialogue from "@/components/MoeNpcDialogue";
import MoePetHpWindow from "@/components/MoePetHpWindow";
import {
  buildPetMasterDialogue,
  MOE_PET_MASTER_NPC,
} from "@/data/moeFieldNpcs";
import {
  MOE_3D_ENEMIES_PER_ZONE,
  MOE_3D_ENEMY_ZONES,
  MOE_3D_ZONE_PAIR_LEVEL_OFFSET,
  MOE_3D_HALF_D,
  MOE_3D_HALF_W,
  MOE_SNAKE_ATTACK_MS,
  MOE_STRIKE_RECOVERY_MS,
  moe3dClampPosition,
  moe3dDuelSlotFromPet,
  moe3dEnemyStatsForZoneLevel,
  moe3dMinimapZoneRects,
  moe3dPickRespawnInZone,
  moe3dMidBossSpawnPosition,
  moe3dSuperBossSpawnPosition,
  moe3dBossAreaLayout,
  buildMeerimMidBossEnemy,
  buildMeerimSuperBossEnemy,
  moe3dPlayerStartPosition,
  moe3dIsNearPetHouse,
  moe3dWorldToMinimap,
  moe3dZoneEnemyPosition,
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
  moe2dBossAreaLayout,
  moe2dPlayerStartPosition,
  moe2dPetHouseLayout,
  moe2dIsNearPetHouse,
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
const JUMP_VELOCITY_3D = 15;
const GRAVITY_3D = 24;
const HEAL_AMOUNT = 20; // プレイヤーの回復量
/** 座れ：自然回復（秒あたり） */
const PET_SIT_REGEN_HP = 3;
const PET_SIT_REGEN_MP = 2;
const PET_AUTO_ATTACK_COOLDOWN_MS = 1400;
const PET_FOLLOW_DIST_3D = 4;
const PET_FOLLOW_DIST_3D_AUTO = 6;
const PET_FOLLOW_DIST_3D_TIGHT = 1.2;
const PET_FOLLOW_DIST_2D = 50;
const PET_FOLLOW_DIST_2D_TIGHT = 16;
const PET_APPROACH_THRESHOLD_3D = 0.35;
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

const SKILL_SLOT_LABELS = [
  "スキル１",
  "スキル２",
  "スキル３",
  "スキル４",
  "スキル５",
  "スキル６",
  "スキル７",
];

/** 太陽の大精霊：トースト文言（サンバのみ表示専用・他は戦闘スキルと併用） */
const SUN_SPIRIT_SKILL_TOASTS = [
  "太陽のサンバ　発動！",
  "１６ビートコンボ",
  "灼熱の円舞曲",
  "紅蓮の炎帝",
];

function skillToastMessage(petId, slotIndex, skill) {
  if (petId === "sun_spirit" && slotIndex < SUN_SPIRIT_SKILL_TOASTS.length) {
    return SUN_SPIRIT_SKILL_TOASTS[slotIndex];
  }
  return skill ? `${skill.name}！` : "";
}

const MOE_PET_IDS = Object.keys(MOE_PET_DATA);

/** フィールド同時チャージバー：通常アタック間隔（必殺技の Wiki ディレイは使わない） */
const MOE_PET_FIELD_ATTACK_CHARGE_SEC = 3;

/** スキルボタン発動メッセージの表示時間（コンボヒットで消えない専用 UI） */
const MOE_SKILL_TOAST_MS = 1000;

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
  const [map3dReady, setMap3dReady] = useState(false);
  const cameraYawRef = useRef(0);
  const lastMinimap3dSyncRef = useRef(0);
  const [minimap3d, setMinimap3d] = useState({ x: 0, y: 0, yaw: 0 });
  const playerFacingRef = useRef(0);
  const [view, setView] = useState({ w: 1200, h: 800 });
  const mapW = view.w * 2;
  const mapH = view.h * 6;

  const [world, setWorld] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [player, setPlayer] = useState({ x: 100, y: 100 });
  const [toast, setToast] = useState(null);
  const [skillToast, setSkillToast] = useState(null);
  /** 3D：左クリックで選択した敵（攻撃はコマンドボタン） */
  const [targetEnemyId, setTargetEnemyId] = useState(null);
  const [petFocused, setPetFocused] = useState(false);
  const [showPetStatusOverlay, setShowPetStatusOverlay] = useState(false);
  const [petMasterDialogue, setPetMasterDialogue] = useState(null);
  const [nearPetHouse, setNearPetHouse] = useState(false);
  const nearPetHouseRef = useRef(false);
  const petDebugSnapshotRef = useRef(null);
  const [hasPetDebugSnapshot, setHasPetDebugSnapshot] = useState(false);
  const [showFieldGuide, setShowFieldGuide] = useState(false);
  /** 3D：follow | wait | sit | auto */
  const [petCommandMode, setPetCommandMode] = useState("follow");
  const [petFollowTight, setPetFollowTight] = useState(false);
  /** ワールド座標上のダメージ（赤）・ペットEXP（黄・+N） */
  const [battlePopups, setBattlePopups] = useState([]);
  const battlePopupIdRef = useRef(0);
  /** ペットLvアップだけ大きく長めに表示（通常トーストに埋もれないようにする） */
  const [petLevelUpFlash, setPetLevelUpFlash] = useState(null);
  const [trainerStatus, setTrainerStatus] = useState(() => loadGameStatus());

  // Pet State（SSR/初回HTMLはデフォルト → クライアントマウント後に localStorage 復元）
  const [pet, setPet] = useState(() => getDefaultPetForId("sun_spirit"));
  const [moePetHydrated, setMoePetHydrated] = useState(false);

  useEffect(() => {
    setPet(loadInitialMoePetFromStorage());
    setMoePetHydrated(true);
  }, []);

  useEffect(() => {
    if (!moePetHydrated) return;
    const snap = loadMoePetDebugSnapshot(pet.id);
    if (snap) {
      petDebugSnapshotRef.current = snap;
      setHasPetDebugSnapshot(true);
    }
  }, [moePetHydrated, pet.id]);

  useEffect(() => {
    if (!moePetHydrated) return;
    const t = window.setTimeout(() => {
      persistCurrentMoePet(pet);
    }, 280);
    return () => window.clearTimeout(t);
  }, [
    moePetHydrated,
    pet.id,
    pet.totalExp,
    pet.hp,
    pet.mp,
    pet.level,
    pet.expIntoLevel,
  ]);

  const keysRef = useRef(createEmptyInputKeys());
  const enemyIdRef = useRef(0);
  const playerPosRef = useRef({ x: 100, y: 100 });
  /** 3D: ジャンプの高さオフセットと上向き速度 */
  const playerJumpRef = useRef({ offset: 0, vy: 0 });
  /** 3D: Shift 押下中かつ移動入力あり */
  const playerSprintRef = useRef(false);
  /** 3D: ペットに RUN アニメを出す（走行追従中） */
  const petRunAnimRef = useRef(false);
  const petPosRef = useRef({ x: 100, y: 100 });
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
  const targetEnemyIdRef = useRef(null);
  const startDuelWithEnemyRef = useRef(() => {});
  /** 3D: ペット攻撃アニメを再生する期限（performance.now） */
  const petStrikeUntilRef = useRef(0);
  const petAttackMsRef = useRef(MOE_SNAKE_ATTACK_MS);
  /** 3D: 敵攻撃アニメを再生する期限 */
  const enemyStrikeUntilRef = useRef(0);
  const enemyAttackMsRef = useRef(MOE_SNAKE_ATTACK_MS);
  const petRef = useRef(pet);
  const duelRef = useRef(null);
  /** 接近完了→simultaneous_charge への遷移を1回だけ（毎フレーム queueMicrotask すると撃破後に戦闘が復活する） */
  const approachChargeScheduledRef = useRef(false);
  /** 交戦中スキル連撃の未実行タイマーを打ち切る（太陽・カルゴーシュ等） */
  const moeSkillComboGenRef = useRef(0);

  /** 接近 → 両バー同時チャージ → 満タンごとにその側が即攻撃（速い側は複数回可） */
  const [duel, setDuel] = useState(null);

  useEffect(() => {
    petRef.current = pet;
  }, [pet]);

  useEffect(() => {
    duelRef.current = duel;
  }, [duel]);

  const worldRef = useRef(null);
  /** ペットEXPポップの基準位置（右上パネル「ペットEXP」周り） */
  const petExpUiAnchorRef = useRef(null);
  const enemiesRef = useRef(enemies);
  useEffect(() => {
    worldRef.current = world;
  }, [world]);
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);
  useEffect(() => {
    targetEnemyIdRef.current = targetEnemyId;
  }, [targetEnemyId]);
  useEffect(() => {
    petCommandRef.current = petCommandMode;
  }, [petCommandMode]);

  const freezeDuelChargeBars = useCallback((enemyId, ms) => {
    const until = performance.now() + ms;
    setDuel((cur) => {
      if (!cur || cur.enemyId !== enemyId || cur.phase !== "simultaneous_charge") {
        return cur;
      }
      const prev = cur.chargeFrozenUntil;
      const nextUntil =
        typeof prev === "number" && prev > until ? prev : until;
      const next = { ...cur, chargeFrozenUntil: nextUntil };
      duelRef.current = next;
      return next;
    });
  }, []);

  const pushWorldDamagePopup = useCallback(
    (worldX, worldY, value, fromEnemy, skipPetDamageDedupe = false) => {
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
    }
    const id = ++battlePopupIdRef.current;
    const jitterX = (Math.random() - 0.5) * 18;
    const jitterY = (Math.random() - 0.5) * 10;
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

  /** ペット攻撃・敵攻撃のいずれかの直後に共通（MOE系・約55%・Wiki表ベース） */
  const rollPetExpOnHit = React.useCallback((petBefore, enemyLevel) => {
    const expBase = getMoePetExpBaseOnHitSuccess(petBefore.level, enemyLevel);
    const petExpRoll = Math.random() < MOE_PET_ATTACK_EXP_SUCCESS_RATE;
    let petAfter = { ...petBefore };
    let petExpGained = null;
    if (petExpRoll && expBase > 0 && petBefore.level < MOE_PET_MAX_LEVEL) {
      const r = applyMoePetExpGain(petAfter, expBase, calculatePetStats);
      petAfter = r.pet;
      if (r.gained > 0) {
        petExpGained = r.gained;
        if (r.messages.length) {
          queueMicrotask(() => {
            setPetLevelUpFlash(r.messages.join("　"));
            playSfx("levelUp");
          });
        }
      }
    }
    return { petAfter, petExpGained };
  }, []);

  /**
   * ペットの1ヒット分（通常アタック・連撃スキル共通）
   * @param opts.grantExp コンボ中は最終ヒットだけ true 推奨
   * @param opts.skipPetDamageDedupe 同一ダメージ連打をデデュープしない（8連表示用）
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
      } = opts;
      const w = worldRef.current;
      let defeated = false;
      let abortDuel = false;
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
          const toastBits = [];
          if (defeated) {
            toastBits.push(`${target.name}を倒した！`);
          }

          queueMicrotask(() => {
            setPet(petAfter);
            pushWorldDamagePopup(ex, ey, damage, false, skipPetDamageDedupe);
            if (petExpGained != null) {
              pushPetExpPopup(petExpGained, true);
            }
            if (toastBits.length) {
              setToast(toastBits.filter(Boolean).join("　"));
            } else if (clearToastWhenNoDefeatMsg) {
              setToast(null);
            }
            if (defeated) {
              onEnemyDefeat?.(target.level);
              setTrainerStatus(loadGameStatus());
            }
          });

          if (defeated) {
            approachChargeScheduledRef.current = false;
            duelRef.current = null;
          }

          return prevEn.map((en) => {
            if (en.id !== enemyId) return en;
            if (defeated && w) {
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
      if (abortDuel) {
        approachChargeScheduledRef.current = false;
        duelRef.current = null;
        setDuel(null);
        return true;
      }
      if (playSound) {
        playSfx("petAttack");
        petStrikeUntilRef.current =
          performance.now() + petAttackMsRef.current;
        freezeDuelChargeBars(enemyId, MOE_STRIKE_RECOVERY_MS);
      }
      if (defeated) {
        window.setTimeout(() => playSfx("enemyDefeated"), 90);
      }
      if (defeated) {
        setDuel(null);
        return true;
      }
      return false;
    },
    [onEnemyDefeat, pushPetExpPopup, pushWorldDamagePopup, rollPetExpOnHit, freezeDuelChargeBars]
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
    const freezeMs = sequence.freezeChargeBarsMs;
    if (typeof freezeMs === "number" && freezeMs > 0) {
      const until = performance.now() + freezeMs;
      setDuel((cur) => {
        if (
          !cur ||
          cur.enemyId !== enemyId ||
          cur.phase !== "simultaneous_charge"
        ) {
          return cur;
        }
        const next = { ...cur, chargeFrozenUntil: until };
        duelRef.current = next;
        return next;
      });
    }
    const gen = ++moeSkillComboGenRef.current;
    const multi = sequence.hits.length > 1;
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
          skipPetDamageDedupe: o.skipPetDamageDedupe ?? multi,
          clearToastWhenNoDefeatMsg:
            o.clearToastWhenNoDefeatMsg ?? isLast,
          attackScale: o.attackScale ?? null,
          magicScale: o.magicScale ?? null,
        });
        if (ended) {
          moeSkillComboGenRef.current += 1;
        }
      }, hit.atMs);
    });
  }, []);

  const applyEnemyStrike = React.useCallback((enemyId) => {
    const d = duelRef.current;
    if (!d || d.enemyId !== enemyId || d.phase !== "simultaneous_charge") {
      return false;
    }
    const target = enemiesRef.current.find((e) => e.id === enemyId);
    if (!target || target.hp <= 0) {
      approachChargeScheduledRef.current = false;
      duelRef.current = null;
      setDuel(null);
      return true;
    }
    const dmg = target.petDamage ?? 1;
    const tname = target.name;
    const p = petRef.current;
    let nh = Math.max(0, p.hp - dmg);
    if (petUsesPreciseWikiStats(p.id)) nh = roundPetStatInternal(nh);
    const ends = nh <= 0;

    if (ends) playSfx("petDefeated");
    else playSfx("enemyHit");

    if (!ends) {
      enemyStrikeUntilRef.current =
        performance.now() + enemyAttackMsRef.current;
      freezeDuelChargeBars(enemyId, MOE_STRIKE_RECOVERY_MS);
    }

    const petDamaged = { ...p, hp: nh };
    let petAfter = petDamaged;
    let petExpGained = null;
    if (!ends) {
      const r = rollPetExpOnHit(petDamaged, target.level);
      petAfter = r.petAfter;
      petExpGained = r.petExpGained;
    }

    if (ends) {
      approachChargeScheduledRef.current = false;
      duelRef.current = null;
      setDuel(null);
    }
    const px = p.x;
    const py = p.y;
    queueMicrotask(() => {
      setPet(ends ? petDamaged : petAfter);
      pushWorldDamagePopup(px, py, dmg, true);
      if (!ends && petExpGained != null) {
        pushPetExpPopup(petExpGained, false);
      }
      const toastBits = ends ? [`${tname}の攻撃！ ペットが倒れた…`] : [];
      setToast(toastBits.length ? toastBits.filter(Boolean).join("　") : null);
    });
    return ends;
  }, [pushPetExpPopup, pushWorldDamagePopup, rollPetExpOnHit, freezeDuelChargeBars]);

  /** rAF デュエルループの useEffect 依存に含めない（参照の変化でループが二重化し同一フレームで2ヒットするのを防ぐ） */
  const applyPetStrikeRef = useRef(applyPetStrike);
  const applyEnemyStrikeRef = useRef(applyEnemyStrike);
  applyPetStrikeRef.current = applyPetStrike;
  applyEnemyStrikeRef.current = applyEnemyStrike;

  /** デュエル tick の世代。クリーンアップ・StrictMode 二重マウントで古い rAF が戦闘処理を重ねないようにする */
  const duelCombatSessionRef = useRef(0);
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
      setWorld({ mw, mh, mode3d: true, halfW, halfD });
      setEnemies(newEnemies);
      approachChargeScheduledRef.current = false;
      duelRef.current = null;
      setDuel(null);
      const start = moe3dPlayerStartPosition(halfW, halfD);
      playerPosRef.current = start;
      setPlayer(start);
      setMinimap3d({ x: start.x, y: start.y, yaw: cameraYawRef.current });
      setPet((prev) => ({ ...prev, x: start.x + 2, y: start.y - 1.5 }));
      petPosRef.current = { x: start.x + 2, y: start.y - 1.5 };
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
    const ms = hasPetLevelUp ? 5200 : 2200;
    const t = setTimeout(() => setToast(null), ms);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!skillToast) return;
    const t = setTimeout(() => setSkillToast(null), MOE_SKILL_TOAST_MS);
    return () => clearTimeout(t);
  }, [skillToast]);

  useEffect(() => {
    if (!petLevelUpFlash) return;
    const t = setTimeout(() => setPetLevelUpFlash(null), 5500);
    return () => clearTimeout(t);
  }, [petLevelUpFlash]);

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
    if (!petMasterDialogue && !showPetStatusOverlay && !showFieldGuide) return;
    keysRef.current = createEmptyInputKeys();
    playerSprintRef.current = false;
    petRunAnimRef.current = false;
  }, [petMasterDialogue, showPetStatusOverlay, showFieldGuide]);

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
            const slot = moe3dDuelSlotFromPet(
              en,
              petPosRef.current.x,
              petPosRef.current.y
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

    const tickPet3d = (speed, dt, now) => {
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
        setTargetEnemyId,
        startDuelWithEnemyRef,
      });
      if (result.reachedApproach && duelRef.current?.phase === "approach") {
        scheduleApproachToCharge(duelRef.current.enemyId);
      }
      petPosRef.current = { x: result.x, y: result.y };
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;

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
          const speedMult = sprinting ? SPRINT_MULTIPLIER_3D : 1;
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
        const speedMult = sprinting ? SPRINT_MULTIPLIER_3D : 1;
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

        let nx = playerPosRef.current.x + dx;
        let ny = playerPosRef.current.y + dy;
        const hw = world.halfW ?? world.mw / 2;
        const hd = world.halfD ?? world.mh / 2;
        const margin = 1.5;
        nx = Math.max(-hw + margin, Math.min(hw - margin, nx));
        ny = Math.max(-hd + margin, Math.min(hd - margin, ny));
        playerPosRef.current = { x: nx, y: ny };
        if (now - lastMinimap3dSyncRef.current >= 75) {
          lastMinimap3dSyncRef.current = now;
          setMinimap3d({ x: nx, y: ny, yaw: cameraYawRef.current });
        }
        const nearHouse = moe3dIsNearPetHouse(nx, ny, hw, hd);
        if (nearHouse !== nearPetHouseRef.current) {
          nearPetHouseRef.current = nearHouse;
          setNearPetHouse(nearHouse);
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
          const petResult = advancePetFieldPosition({
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
            setTargetEnemyId,
            startDuelWithEnemyRef,
          });
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
  const combatSkillSlots = (dataForSkillSlots.skills || [])
    .filter((s) => s.level > 1)
    .slice(0, 7);

  const startDuelWithEnemy = useCallback(
    (id) => {
      const cur = duelRef.current;
      if (cur) {
        if (cur.enemyId === id) return;
        return;
      }
      const target = enemiesRef.current.find((en) => en.id === id);
      if (!target || target.hp <= 0) return;
      const slot = is3d
        ? moe3dDuelSlotFromPet(
            target,
            petPosRef.current.x,
            petPosRef.current.y
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
        petChargeSec: getPetChargeSeconds(pet.id, pet.level),
        enemyChargeSec: getEnemyChargeSeconds(target),
      };
      approachChargeScheduledRef.current = false;
      duelRef.current = next;
      setDuel(next);
      playSfx("duelEngage");
    },
    [is3d, pet.id, pet.level]
  );
  startDuelWithEnemyRef.current = startDuelWithEnemy;

  const cancelActiveDuel = useCallback(() => {
    if (!duelRef.current) return false;
    approachChargeScheduledRef.current = false;
    duelCombatSessionRef.current += 1;
    moeSkillComboGenRef.current += 1;
    petStrikeUntilRef.current = 0;
    enemyStrikeUntilRef.current = 0;
    duelRef.current = null;
    setDuel(null);
    return true;
  }, []);

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
      setPetFocused(false);
      setTargetEnemyId(id);
      setToast(null);
    },
    []
  );

  const handlePetSelect = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setPetFocused((prev) => {
      const next = !prev;
      if (next) {
        setTargetEnemyId(null);
        const data = MOE_PET_DATA[pet.id] || MOE_PET_DATA.sun_spirit;
        setToast(`ペット: ${data.name} Lv.${pet.level}`);
      }
      return next;
    });
  }, [pet.id, pet.level]);

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
          approachChargeScheduledRef.current = false;
          duelRef.current = null;
          setDuel(null);
        } else {
          const dt = Math.min(0.08, (now - last) / 1000);
          last = now;
          const chargeFrozenUntil = d.chargeFrozenUntil;
          const barsPaused =
            typeof chargeFrozenUntil === "number" && now < chargeFrozenUntil;
          let petBar = d.petBar;
          let enemyBar = d.enemyBar;
          if (!barsPaused) {
            petBar = d.petBar + dt / d.petChargeSec;
            enemyBar = d.enemyBar + dt / d.enemyChargeSec;
          }
          const enemyId = d.enemyId;
          let duelEnded = false;

          while (petBar >= 1) {
            petBar -= 1;
            const ended = applyPetStrikeRef.current(enemyId);
            if (ended) {
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
              approachChargeScheduledRef.current = false;
              duelRef.current = null;
              setDuel(null);
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
            setDuel((cur) => {
              if (!cur || cur.enemyId !== enemyId || cur.phase !== "simultaneous_charge") {
                return cur;
              }
              const nextFrozen =
                cur.chargeFrozenUntil != null && now < cur.chargeFrozenUntil
                  ? cur.chargeFrozenUntil
                  : undefined;
              const next = {
                ...cur,
                petBar,
                enemyBar,
                chargeFrozenUntil: nextFrozen,
              };
              duelRef.current = next;
              return next;
            });
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
  }, [duel?.phase, duel?.enemyId, duel?.petChargeSec, duel?.enemyChargeSec]);

  const handleHeal = () => {
    playSfx("heal");
    setPet((prev) => {
      const raw = Math.min(prev.hpMax, prev.hp + HEAL_AMOUNT);
      const hp = petUsesPreciseWikiStats(prev.id)
        ? roundPetStatInternal(raw)
        : raw;
      return { ...prev, hp };
    });
    setToast("ペットを回復した！✨");
  };

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
    restorePetDebugSnapshot({ silent: true });
    const prevSave = loadMoePetsSave();
    const totalExpNow =
      pet.totalExp != null
        ? pet.totalExp
        : getMoePetTotalExpFromLegacyProgress(
            pet.level,
            pet.expIntoLevel ?? 0
          );
    const byId = {
      ...prevSave.byId,
      [pet.id]: { totalExp: totalExpNow, hp: pet.hp, mp: pet.mp },
    };
    writeMoePetsSave({ activeId: newId, byId });
    const next = petFromSaveSlot(newId, byId[newId]);
    setPet((prev) => ({ ...next, x: prev.x, y: prev.y }));
    setToast(`${MOE_PET_DATA[newId].name}に交代！`);
  };

  const cyclePet = (delta) => {
    const n = MOE_PET_IDS.length;
    if (n < 2) return;
    let idx = MOE_PET_IDS.indexOf(pet.id);
    if (idx < 0) idx = 0;
    const nextIdx = (idx + delta + n) % n;
    applyPetId(MOE_PET_IDS[nextIdx]);
  };

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

  const applyPetDebugLevel100 = useCallback(() => {
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
      const totalExp = getMoePetFreshTotalExpForLevel(100);
      const level = 100;
      const stats = calculatePetStats(prev.id, level);
      const hpMax = stats?.hpMax ?? prev.hpMax;
      const mpMax = stats?.mpMax ?? prev.mpMax;
      const precise = petUsesPreciseWikiStats(prev.id);
      return {
        ...prev,
        level,
        totalExp,
        expIntoLevel: 0,
        hpMax,
        mpMax,
        hp: precise ? roundPetStatInternal(hpMax) : hpMax,
        mp: precise ? roundPetStatInternal(mpMax) : mpMax,
      };
    });
    setToast("🐛 デバッグ: Lv.100 に設定（閉じると元に戻ります）");
  }, []);

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
    () => calculatePetStats(pet.id, pet.level),
    [pet.id, pet.level]
  );
  const wikiGrowthCaption = React.useMemo(
    () => getPetWikiGrowthCaptionLine(pet.id),
    [pet.id]
  );
  const currentPetData = MOE_PET_DATA[pet.id] || MOE_PET_DATA.sun_spirit;
  const petMasterLines = React.useMemo(
    () => buildPetMasterDialogue(currentPetData, pet.level),
    [currentPetData, pet.level]
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

  const trainerExpPct = Math.min(
    100,
    Math.floor(
      ((trainerStatus.exp || 0) / Math.max(1, trainerStatus.nextExp || 1)) * 100
    )
  );

  const petNextNeed = getMoePetExpToNextLevel(pet.level);
  const petNextRemaining = getMoePetExpRemainingToNextLevel(
    pet.level,
    pet.expIntoLevel
  );
  const petTotalExp =
    pet.totalExp != null
      ? pet.totalExp
      : getMoePetTotalExpFromLegacyProgress(pet.level, pet.expIntoLevel);
  const petExpPct =
    petNextNeed == null
      ? 100
      : Math.min(100, Math.floor(((pet.expIntoLevel ?? 0) / petNextNeed) * 100));

  const petMasterView = petMasterDialogue?.view ?? "menu";

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-sky-900"
      onContextMenu={is3d ? (e) => e.preventDefault() : undefined}
    >
      {targetEnemy && <MoeTargetWindow target={targetEnemy} />}
      <MoePetHpWindow
        emoji={currentPetData.emoji}
        name={currentPetData.name}
        hp={pet.hp}
        hpMax={pet.hpMax}
      />
      {duel && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-[55] w-[min(92vw,22rem)] max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-xl border border-white/25 bg-black/82 px-3 py-2.5 text-white shadow-lg backdrop-blur-md sm:bottom-10">
          <p className="text-center text-[10px] font-bold text-cyan-200">
            交戦中
            {duelEnemy ? ` ${duelEnemy.emoji} ${duelEnemy.name}` : ""}
          </p>
          {duelEnemy && (
            <div className="mt-1.5">
              <div className="mb-0.5 flex justify-between text-[9px] text-red-100/95">
                <span>敵HP</span>
                <span className="font-mono tabular-nums">
                  {Math.ceil(duelEnemy.hp)}/{duelEnemy.hpMax}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${petResourceBarPct(duelEnemy.hp, duelEnemy.hpMax)}%`,
                    backgroundColor: enemyHpBarColor(
                      petResourceBarPct(duelEnemy.hp, duelEnemy.hpMax)
                    ),
                  }}
                />
              </div>
            </div>
          )}
          {duel.phase === "approach" && (
            <p className="mt-1 text-center text-[10px] text-white/85">
              ペットが敵の正面へ移動中…
            </p>
          )}
          {duel.phase === "simultaneous_charge" && (
            <div className="mt-2 space-y-2">
              <div>
                <div className="mb-0.5 flex justify-between text-[9px] text-amber-100/95">
                  <span>ペット（アタック）</span>
                  <span className="font-mono opacity-80">{duel.petChargeSec}s</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
                    style={{ width: `${Math.min(100, duel.petBar * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-0.5 flex justify-between text-[9px] text-rose-100/95">
                  <span>敵の攻撃</span>
                  <span className="font-mono opacity-80">{duel.enemyChargeSec}s</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500"
                    style={{ width: `${Math.min(100, duel.enemyBar * 100)}%` }}
                  />
                </div>
              </div>
              {typeof performance !== "undefined" &&
                duel.chargeFrozenUntil != null &&
                performance.now() < duel.chargeFrozenUntil && (
                  <p className="text-center text-[9px] font-bold text-amber-200/95">
                    スタン — チャージバー停止中（あと約
                    {Math.max(
                      0,
                      Math.ceil(
                        (duel.chargeFrozenUntil - performance.now()) / 1000
                      )
                    )}
                    秒）
                  </p>
                )}
              <p className="text-center text-[8px] leading-snug text-white/50">
                両バーは同時に溜まり、満タンになった側からすぐ攻撃（速い側は敵の1周の間に複数回可）。ペットEXPは各攻撃直後約
                {Math.round(MOE_PET_ATTACK_EXP_SUCCESS_RATE * 100)}%（Wiki表）
              </p>
            </div>
          )}
        </div>
      )}
      {petLevelUpFlash && (
        <div
          role="status"
          className="pointer-events-none absolute left-1/2 top-24 z-[60] max-w-[min(96vw,28rem)] -translate-x-1/2 rounded-2xl border-4 border-amber-200 bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 px-6 py-4 text-center text-lg font-black leading-snug text-amber-950 shadow-[0_0_40px_rgba(251,191,36,0.85)]"
        >
          🎉 {petLevelUpFlash}
        </div>
      )}
      {skillToast && (
        <div
          className={`pointer-events-none absolute left-1/2 z-[51] max-w-[min(92vw,24rem)] -translate-x-1/2 rounded-xl border-2 border-amber-300/90 bg-gradient-to-br from-amber-600 to-orange-700 px-5 py-2.5 text-center text-sm font-bold text-amber-50 shadow-xl whitespace-pre-wrap break-words ${
            petLevelUpFlash ? "top-[11rem]" : "top-20"
          }`}
        >
          {skillToast}
        </div>
      )}
      {toast && (
        <div
          className={`absolute left-1/2 z-50 max-w-[min(92vw,24rem)] -translate-x-1/2 rounded-xl border-2 border-blue-300 bg-blue-600 px-6 py-3 text-center text-base font-bold text-white shadow-xl whitespace-pre-wrap break-words ${
            petLevelUpFlash ? "top-[11rem]" : skillToast ? "top-32" : "top-20"
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
              +{pop.value}
            </span>
          </div>
        ))}

      {/* Pet Status UI + スキル（右列）— z は BGM(42) より上で下部が隠れないように */}
      <div className="absolute right-2 top-2 z-[46] flex flex-row gap-1.5 items-start">
        <div
          className="max-h-[calc(100dvh-4.5rem)] w-[10.75rem] overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg border border-white/20 bg-black/75 p-2 text-white backdrop-blur-md [scrollbar-width:thin]"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xl leading-none">{currentPetData.emoji}</span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold leading-tight">{currentPetData.name}</p>
              <p className="text-[9px] text-gray-400">Lv.{pet.level}</p>
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
            <button
              type="button"
              onClick={handleHeal}
              className="mt-1.5 w-full rounded bg-pink-600 py-1 text-[9px] font-bold transition hover:bg-pink-500 active:scale-95"
            >
              ヒーリング (回復)
            </button>
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
                    <div ref={petExpUiAnchorRef} className="relative">
                      <div className="flex w-full items-center justify-between gap-1 text-amber-100">
                        <span className="shrink-0 text-[9px]">ペットEXP</span>
                        <span className="min-w-0 shrink text-right font-mono text-[8px] tabular-nums leading-none text-amber-200/90 whitespace-nowrap">
                          Next{" "}
                          {pet.level >= MOE_PET_MAX_LEVEL ? "MAX" : petNextRemaining ?? "—"} / Total{" "}
                          {petTotalExp}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full border border-amber-800/40 bg-amber-950/80">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
                          style={{ width: `${petExpPct}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-[7px] leading-snug text-amber-200/55">
                        Wiki 累積表ベースでLv判定
                      </p>
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
                {MOE_PET_IDS.map((id) => (
                  <option key={id} value={id}>
                    {MOE_PET_DATA[id].emoji} {MOE_PET_DATA[id].name}
                  </option>
                ))}
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

        <div className="flex max-h-[min(72vh,480px)] w-[4.65rem] flex-col gap-0.5 overflow-y-auto overscroll-contain rounded-lg border border-amber-500/35 bg-black/70 p-1 pr-0.5 text-white backdrop-blur-md [scrollbar-width:thin]">
          <p className="sticky top-0 z-10 bg-black/85 pb-0.5 text-center text-[8px] font-bold text-amber-200/95">
            スキル
          </p>
          {SKILL_SLOT_LABELS.map((label, i) => {
            const skill = combatSkillSlots[i];
            const msg = skillToastMessage(pet.id, i, skill);
            const duelSkillSeq =
              duel?.phase === "simultaneous_charge" && duel.enemyId != null
                ? resolveMoeDuelSkillSequence(pet.id, skill)
                : null;
            return (
              <button
                key={label}
                type="button"
                disabled={!skill}
                title={skill?.name ?? ""}
                onClick={() => {
                  if (!skill || !msg) return;
                  setSkillToast(msg);
                  if (duelSkillSeq) {
                    scheduleMoeDuelSkillHits(duel.enemyId, duelSkillSeq);
                  }
                }}
                className="shrink-0 rounded-md border border-amber-600/50 bg-gradient-to-b from-amber-700/90 to-orange-900/90 py-1 text-[8px] font-bold leading-tight text-amber-50 shadow-sm transition hover:from-amber-600/95 hover:to-orange-800/95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:from-amber-700/90 disabled:hover:to-orange-900/90"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute left-3 top-3 z-40 max-w-[min(90vw,22rem)]">
        {!showFieldGuide ? (
          <button
            type="button"
            onClick={() => setShowFieldGuide(true)}
            className="rounded-lg border border-cyan-500/40 bg-black/60 px-3 py-1.5 text-[11px] font-bold text-cyan-200 shadow-md backdrop-blur-sm transition hover:bg-black/75 active:scale-[0.98]"
            aria-expanded={false}
            aria-controls="moe-field-guide-panel"
          >
            操作ガイド
          </button>
        ) : (
          <div
            id="moe-field-guide-panel"
            className="rounded-lg border border-white/20 bg-black/55 px-3 py-2 text-xs text-white/90 backdrop-blur-sm"
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
                <p>WASD＝移動 · Shift＝走る · 南（手前）スタート→北へ行くほど強敵</p>
                <p>敵クリック＝ターゲット（上部ウィンドウ・ドラッグ可） · 右上で命令 · 左下ミニマップ · Space＝ジャンプ</p>
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
            <p className="text-pink-200/90">右上で回復・ペット変更・スキル</p>
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
        menuPrompt={`${currentPetData.emoji} ${currentPetData.name}（Lv.${pet.level}）をどうする？`}
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

      {is3d && nearPetHouse && !petMasterDialogue && (
        <button
          type="button"
          onClick={handlePetMasterTalk}
          className="absolute bottom-28 left-1/2 z-[54] -translate-x-1/2 rounded-xl border-2 border-amber-500/50 bg-zinc-950/92 px-4 py-2.5 text-sm font-bold text-amber-50 shadow-lg backdrop-blur-sm transition hover:bg-zinc-900 active:scale-95"
        >
          {MOE_PET_MASTER_NPC.emoji} ペットマスターと話す
        </button>
      )}

      {is3d ? (
        <>
        <MoeField3DCanvas
          enemies={enemies}
          battlePopups={battlePopups.filter((p) => p.space === "world")}
          onEnemyClick={(id) => handleEnemySelect(id)}
          onPetClick={() => handlePetSelect()}
          targetEnemyId={targetEnemyId}
          petFocused={petFocused}
          petLabel={{
            name: currentPetData.name,
            level: pet.level,
            hp: pet.hp,
            hpMax: pet.hpMax,
          }}
          onMapReady={(bounds) => {
            setMap3dReady(true);
            if (!bounds?.halfW || !bounds?.halfD) return;
            setWorld((w) =>
              w?.mode3d
                ? {
                    ...w,
                    halfW: bounds.halfW,
                    halfD: bounds.halfD,
                    mw: bounds.halfW * 2,
                    mh: bounds.halfD * 2,
                    midBossPos: bounds.midBossPos ?? w.midBossPos,
                    superBossPos: bounds.superBossPos ?? w.superBossPos,
                  }
                : w
            );
            setEnemies((prev) => {
              const zoneCount = MOE_3D_ENEMY_ZONES.length;
              return prev.map((en) => {
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
          petCommandRef={petCommandRef}
          petHoldYawRef={petHoldYawRef}
          duelRef={duelRef}
          petStrikeUntilRef={petStrikeUntilRef}
          petAttackMsRef={petAttackMsRef}
          enemyStrikeUntilRef={enemyStrikeUntilRef}
          enemyAttackMsRef={enemyAttackMsRef}
        />

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
                  return (
                    <circle
                      key={`mini3-en-${en.id}`}
                      cx={p.x}
                      cy={p.y}
                      r={Math.max(4, mini3W * 0.018)}
                      fill="#ef4444"
                      opacity={0.9}
                    />
                  );
                })}
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
              黄＝視界 · 紫＝自分 · 赤＝敵 · 南↓北↑
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
                        top: en.y - pad - 18,
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
                      <p className="ml-3 mt-0.5 text-[7px] font-bold tabular-nums text-red-100/90 drop-shadow">
                        {Math.ceil(en.hp)}/{en.hpMax}
                      </p>
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
          className={`absolute z-[24] flex flex-col items-center ${
            petCommandMode === "wait" || petCommandMode === "sit"
              ? ""
              : "transition-all duration-100"
          } ${
            petFocused ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-sky-900 rounded-lg" : ""
          }`}
          style={{ left: pet.x - 30, top: pet.y - 30, width: 60, padding: 8 }}
          title={`${currentPetData.name} Lv.${pet.level}`}
        >
          {(petFocused ||
            petCommandMode === "wait" ||
            petCommandMode === "sit") && (
            <div
              className="pointer-events-none absolute left-1/2 bottom-full mb-1 w-[4.5rem] -translate-x-1/2"
            >
              {petFocused && (
                <>
                  <div className="mb-1 flex justify-center">
                    <MoeCrystalMarker size={8} />
                  </div>
                  <p className="truncate text-center text-[8px] font-bold text-emerald-100 drop-shadow">
                    {currentPetData.name}
                  </p>
                  <p className="text-center text-[7px] font-bold text-emerald-200/90">
                    Lv.{pet.level}
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
              <p className="mt-0.5 text-center text-[7px] font-bold tabular-nums text-white/85">
                {precisePet
                  ? `${formatPetStatUi(pet.hp)}/${formatPetStatUi(pet.hpMax)}`
                  : `${Math.floor(pet.hp)}/${pet.hpMax}`}
              </p>
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
          .map((pop) => (
            <div
              key={pop.id}
              className="pointer-events-none absolute z-[25]"
              style={{
                left: pop.x,
                top: pop.y,
                transform: "translate(-50%, 0)",
              }}
            >
              <span
                className={`moe-battle-popup-rise block text-center text-[18px] font-black tabular-nums tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
                  pop.fromEnemy ? "text-blue-400" : "text-red-500"
                }`}
              >
                {pop.value}
              </span>
            </div>
          ))}

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
