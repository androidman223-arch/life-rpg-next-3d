"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { loadGameStatus } from "@/lib/gameStatus";
import {
  getDefaultPetForId,
  loadInitialMoePetFromStorage,
  loadMoePetsSave,
  MOE_SAVED_PET_INITIAL_LEVEL,
  persistCurrentMoePet,
  petFromSaveSlot,
  writeMoePetsSave,
} from "@/lib/moePetSave";
import { playSfx } from "@/lib/sfx";
import { MOE_MEERIM_ENEMIES, enemyWikiStatsTitle, formatEnemyLevelUi } from "@/data/moeMeerimEnemies";
import {
  applyMoePetExpGain,
  getMoePetExpBaseOnHitSuccess,
  getMoePetExpToNextLevel,
  getMoePetFreshTotalExpForLevel,
  getMoePetTotalExpFromLegacyProgress,
  MOE_PET_ATTACK_EXP_SUCCESS_RATE,
  MOE_PET_MAX_LEVEL,
} from "@/data/moePetExpTable";
import {
  MOE_PET_DATA,
  calculatePetStats,
  formatPetStatUi,
  getPetWikiGrowthCaptionLine,
  petUsesPreciseWikiStats,
  roundPetStatInternal,
} from "../data/moePets";
import { resolveMoeDuelSkillSequence } from "../data/moePetCombatSkills";
import MoeField3DCanvas from "@/components/MoeField3DCanvas";
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
  moe3dPickRespawnInZone,
  moe3dPlayerStartPosition,
  moe3dZoneEnemyPosition,
} from "@/lib/moeField3DModels";
import {
  buildMoe2dRowLayout,
  computeMoe2dWorldSize,
  inRiverMoe2d,
  moe2dCellCenter,
  moe2dPickRespawnInZone2d,
  moe2dPlayerStartPosition,
  moe2dRiverBoundaries,
  moe2dZoneRowStyle,
  moe2dZoneRowMiniFill,
} from "@/lib/moeField2DLayout";

const PLAYER_R = 18;
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
const INITIAL_MOE_PET_LEVEL = MOE_SAVED_PET_INITIAL_LEVEL;

/** HP/MP バー幅（max が 0 のとき NaN 防止） */
function petResourceBarPct(current, max) {
  const m = Number(max);
  if (!m || m <= 0) return 0;
  return Math.min(100, (Number(current) / m) * 100);
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

/** ディレイ参照用（アタック系スキル） */
const SKILL_TYPES_WITH_DELAY = new Set([
  "physical",
  "physical_dot",
  "physical_area",
  "physical_area_narrow",
  "physical_magic_combo",
  "physical_magic_area",
  "magic",
  "magic_fire",
  "magic_wind",
  "magic_wind_area",
  "magic_fire_dot",
  "magic_dot_area",
  "magic_area_debuff",
  "magic_debuff",
]);

/** ペットの次の攻撃までのチャージ秒数（習得済みスキルの delaySec の最小を優先） */
function getPetChargeSeconds(petId, petLevel) {
  const skills = MOE_PET_DATA[petId]?.skills || [];
  const candidates = skills.filter(
    (s) =>
      s.delaySec != null &&
      s.delaySec > 0 &&
      s.level <= petLevel &&
      s.name !== "疑似騎乗" &&
      SKILL_TYPES_WITH_DELAY.has(s.type)
  );
  if (candidates.length > 0) {
    const m = Math.min(...candidates.map((s) => s.delaySec));
    return Math.min(55, Math.max(3, m));
  }
  const atk = skills.find((s) => s.name === "アタック");
  if (atk?.delaySec != null && atk.delaySec > 0) {
    return Math.min(55, Math.max(3, atk.delaySec));
  }
  return 3;
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
  const playerFacingRef = useRef(0);
  const [view, setView] = useState({ w: 1200, h: 800 });
  const mapW = view.w * 2;
  const mapH = view.h * 6;

  const [world, setWorld] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [player, setPlayer] = useState({ x: 100, y: 100 });
  const [toast, setToast] = useState(null);
  /** 3D：左クリックで選択した敵（攻撃はコマンドボタン） */
  const [targetEnemyId, setTargetEnemyId] = useState(null);
  const [showPetStatusOverlay, setShowPetStatusOverlay] = useState(false);
  /** 3D：follow | wait | sit | auto */
  const [petCommandMode, setPetCommandMode] = useState("follow");
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

  const keysRef = useRef({});
  const enemyIdRef = useRef(0);
  const playerPosRef = useRef({ x: 100, y: 100 });
  /** 3D: ジャンプの高さオフセットと上向き速度 */
  const playerJumpRef = useRef({ offset: 0, vy: 0 });
  /** 3D: Shift 押下中かつ移動入力あり */
  const playerSprintRef = useRef(false);
  /** 3D: ペットに RUN アニメを出す（走行追従中） */
  const petRunAnimRef = useRef(false);
  const petPosRef = useRef({ x: 100, y: 100 });
  const petCommandRef = useRef("follow");
  const waitAnchorRef = useRef(null);
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
    (enemyId) => applyPetComboHit(enemyId),
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
      setWorld({ mw, mh, mode3d: true, halfW, halfD });
      setEnemies(newEnemies);
      approachChargeScheduledRef.current = false;
      duelRef.current = null;
      setDuel(null);
      const start = moe3dPlayerStartPosition(halfW, halfD);
      playerPosRef.current = start;
      setPlayer(start);
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
    const down = (e) => {
      const k = e.key;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(k)) {
        e.preventDefault();
        keysRef.current[k] = true;
      }
      if ((e.code === "Space" || k === " ") && worldRef.current?.mode3d) {
        e.preventDefault();
        keysRef.current[" "] = true;
      }
      if (e.key === "Shift" || e.code === "ShiftLeft" || e.code === "ShiftRight") {
        keysRef.current.Shift = true;
      }
    };
    const up = (e) => {
      keysRef.current[e.key] = false;
      if (e.code === "Space") keysRef.current[" "] = false;
      if (e.key === "Shift" || e.code === "ShiftLeft" || e.code === "ShiftRight") {
        keysRef.current.Shift = false;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

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

    const tickPet3d = (speed, approachThreshold, dt, now) => {
      const pos = { ...petPosRef.current };
      const d = duelRef.current;
      const cmd = petCommandRef.current;

      if (cmd === "sit") {
        sitRegenAccRef.current += dt;
        if (sitRegenAccRef.current >= 1) {
          sitRegenAccRef.current = 0;
          setPet((prev) => ({
            ...prev,
            hp: Math.min(prev.hpMax, prev.hp + PET_SIT_REGEN_HP),
            mp: Math.min(prev.mpMax, prev.mp + PET_SIT_REGEN_MP),
          }));
        }
      } else {
        sitRegenAccRef.current = 0;
      }

      if (d?.phase === "approach") {
        const tx = d.slotX;
        const ty = d.slotY;
        const ddx = tx - pos.x;
        const ddy = ty - pos.y;
        const dist = Math.hypot(ddx, ddy);
        if (dist < approachThreshold) {
          pos.x = tx;
          pos.y = ty;
          scheduleApproachToCharge(d.enemyId);
        } else {
          const sp = speed * 1.35;
          pos.x += (ddx / dist) * sp;
          pos.y += (ddy / dist) * sp;
        }
      } else if (d?.phase === "simultaneous_charge") {
        pos.x = d.slotX;
        pos.y = d.slotY;
      } else if (cmd === "wait" || cmd === "sit") {
        const anchor = waitAnchorRef.current;
        if (anchor) {
          pos.x = anchor.x;
          pos.y = anchor.y;
        }
      } else {
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
        const px = playerPosRef.current.x;
        const py = playerPosRef.current.y;
        const pdx = px - pos.x;
        const pdy = py - pos.y;
        const dist = Math.hypot(pdx, pdy);
        const followDist = cmd === "auto" ? 6 : 4;
        if (dist > followDist) {
          pos.x += (pdx / dist) * (speed * 0.9);
          pos.y += (pdy / dist) * (speed * 0.9);
        }
      }
      petPosRef.current = pos;
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;

      const k = keysRef.current;
      let inputX = 0;
      let inputZ = 0;
      if (k["ArrowUp"] || k["w"] || k["W"]) inputZ -= 1;
      if (k["ArrowDown"] || k["s"] || k["S"]) inputZ += 1;
      if (k["ArrowLeft"] || k["a"] || k["A"]) inputX -= 1;
      if (k["ArrowRight"] || k["d"] || k["D"]) inputX += 1;

      let dx = 0;
      let dy = 0;
      if (inputX !== 0 || inputZ !== 0) {
        if (world.mode3d) {
          const sprinting = !!(k.Shift && (inputX !== 0 || inputZ !== 0));
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
        const sprinting = !!(k.Shift && (inputX !== 0 || inputZ !== 0));
        playerSprintRef.current = sprinting;
        const cmd = petCommandRef.current;
        petRunAnimRef.current =
          sprinting &&
          (cmd === "follow" || cmd === "auto") &&
          duelRef.current?.phase !== "simultaneous_charge";
        const speedMult = sprinting ? SPRINT_MULTIPLIER_3D : 1;
        const petSpeed = MOVE_SPEED_3D * 60 * dt * speedMult;

        const jump = playerJumpRef.current;
        if (k[" "] && jump.offset <= 0.02 && jump.vy <= 0) {
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
        tickPet3d(petSpeed, 0.35, dt, now);
      } else {
        playerSprintRef.current = false;
        petRunAnimRef.current = false;
        setPlayer((prev) => {
          let nx = prev.x + dx;
          let ny = prev.y + dy;
          nx = Math.max(PLAYER_R, Math.min(world.mw - PLAYER_R, nx));
          ny = Math.max(PLAYER_R, Math.min(world.mh - PLAYER_R, ny));

          if (inRiver(nx, ny, world.mw, world.mh, world.rowLayout)) {
            nx = prev.x;
            ny = prev.y;
          }

          if (nx < 80 && ny > world.mh - 80 && !world.rowLayout?.length) {
            queueMicrotask(() => onBack?.());
            return prev;
          }
          const startRow = world.rowLayout?.find((r) => r.kind === "start");
          if (
            startRow &&
            nx < world.mw * 0.32 &&
            ny > startRow.y + startRow.h * 0.25
          ) {
            queueMicrotask(() => onBack?.());
            return prev;
          }

          const next = { x: nx, y: ny };
          playerPosRef.current = next;
          return next;
        });

        setPet((prev) => {
          const d = duelRef.current;
          if (d?.phase === "approach") {
            const tx = d.slotX;
            const ty = d.slotY;
            const ddx = tx - prev.x;
            const ddy = ty - prev.y;
            const dist = Math.hypot(ddx, ddy);
            if (dist < 10) {
              scheduleApproachToCharge(d.enemyId);
              return { ...prev, x: tx, y: ty };
            }
            const sp = MOVE_SPEED * 1.35;
            return {
              ...prev,
              x: prev.x + (ddx / dist) * sp,
              y: prev.y + (ddy / dist) * sp,
            };
          }
          if (d?.phase === "simultaneous_charge") {
            return { ...prev, x: d.slotX, y: d.slotY };
          }
          const px = playerPosRef.current.x;
          const py = playerPosRef.current.y;
          const pdx = px - prev.x;
          const pdy = py - prev.y;
          const dist = Math.hypot(pdx, pdy);
          if (dist > 50) {
            return {
              ...prev,
              x: prev.x + (pdx / dist) * (MOVE_SPEED * 0.9),
              y: prev.y + (pdy / dist) * (MOVE_SPEED * 0.9),
            };
          }
          return prev;
        });
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

  const applyPetCommand = useCallback((mode) => {
    petCommandRef.current = mode;
    setPetCommandMode(mode);
    if (mode === "wait" || mode === "sit") {
      waitAnchorRef.current = { ...petPosRef.current };
    } else {
      waitAnchorRef.current = null;
    }
  }, []);

  const handlePetComeBack = useCallback(() => {
    applyPetCommand("follow");
    setToast("もどれ！");
  }, [applyPetCommand]);

  const handlePetWait = useCallback(() => {
    applyPetCommand("wait");
    setToast("待て！");
  }, [applyPetCommand]);

  const handlePetSit = useCallback(() => {
    applyPetCommand("sit");
    setToast("座れ（自然回復）");
  }, [applyPetCommand]);

  const handlePetAutoToggle = useCallback(() => {
    if (petCommandRef.current === "auto") {
      applyPetCommand("follow");
      setToast("オートを停止");
    } else {
      applyPetCommand("auto");
      autoAttackCooldownRef.current = performance.now() + 400;
      setToast("オート：敵を自動で攻撃");
    }
  }, [applyPetCommand]);

  const handleEnemyClick = (e, id) => {
    e.stopPropagation();
    startDuelWithEnemy(id);
  };

  const handleEnemySelect = useCallback(
    (id) => {
      const target = enemiesRef.current.find((en) => en.id === id);
      if (!target || target.hp <= 0) return;
      setTargetEnemyId(id);
      setToast(`ターゲット: ${target.name} Lv.${formatEnemyLevelUi(target.level)}`);
    },
    []
  );

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
    const en = enemies.find((e) => e.id === targetEnemyId);
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

  const precisePet = petUsesPreciseWikiStats(pet.id);
  const petWikiStats = React.useMemo(
    () => calculatePetStats(pet.id, pet.level),
    [pet.id, pet.level]
  );
  const wikiGrowthCaption = React.useMemo(
    () => getPetWikiGrowthCaptionLine(pet.id),
    [pet.id]
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
  const currentPetData = MOE_PET_DATA[pet.id] || MOE_PET_DATA.sun_spirit;
  const duelEnemy = duel ? enemies.find((e) => e.id === duel.enemyId) : null;

  const trainerExpPct = Math.min(
    100,
    Math.floor(
      ((trainerStatus.exp || 0) / Math.max(1, trainerStatus.nextExp || 1)) * 100
    )
  );

  const petNextNeed = getMoePetExpToNextLevel(pet.level);
  const petTotalExp =
    pet.totalExp != null
      ? pet.totalExp
      : getMoePetTotalExpFromLegacyProgress(pet.level, pet.expIntoLevel);
  const petExpPct =
    petNextNeed == null
      ? 100
      : Math.min(100, Math.floor(((pet.expIntoLevel ?? 0) / petNextNeed) * 100));

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-sky-900"
      onContextMenu={is3d ? (e) => e.preventDefault() : undefined}
    >
      {duel && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-[55] w-[min(92vw,22rem)] max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-xl border border-white/25 bg-black/82 px-3 py-2.5 text-white shadow-lg backdrop-blur-md sm:bottom-10">
          <p className="text-center text-[10px] font-bold text-cyan-200">
            交戦中
            {duelEnemy ? ` ${duelEnemy.emoji} ${duelEnemy.name}` : ""}
          </p>
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
      {toast && (
        <div
          className={`absolute left-1/2 z-50 max-w-[min(92vw,24rem)] -translate-x-1/2 rounded-xl border-2 border-blue-300 bg-blue-600 px-6 py-3 text-center text-base font-bold text-white shadow-xl whitespace-pre-wrap break-words ${
            petLevelUpFlash ? "top-[11rem]" : "top-20"
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
        <div className="max-h-[calc(100dvh-4.5rem)] w-[10.75rem] overflow-y-auto overscroll-contain rounded-lg border border-white/20 bg-black/75 p-2 text-white backdrop-blur-md [scrollbar-width:thin]">
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
            {is3d && (
              <>
                <button
                  type="button"
                  onClick={() => setShowPetStatusOverlay((v) => !v)}
                  className="mt-1.5 w-full rounded border border-emerald-500/50 bg-emerald-950/90 py-1 text-[9px] font-bold text-emerald-100 transition hover:bg-emerald-900/95 active:scale-95"
                >
                  ステータス
                </button>
                <div className="mt-1 grid grid-cols-3 gap-0.5">
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
                    className={`col-span-2 rounded border px-0.5 py-1 text-[7px] font-bold leading-tight transition active:scale-95 ${
                      petCommandMode === "auto"
                        ? "border-orange-400/70 bg-orange-900/90 text-orange-50 ring-1 ring-orange-300/50"
                        : "border-orange-600/50 bg-orange-950/85 text-orange-100 hover:bg-orange-900/90"
                    }`}
                  >
                    オート{petCommandMode === "auto" ? "（停止）" : ""}
                  </button>
                </div>
                {targetEnemyId != null && (
                  <p className="mt-0.5 truncate text-center text-[7px] font-medium text-yellow-200/90">
                    ▼ {enemies.find((e) => e.id === targetEnemyId)?.name ?? "—"}{" "}
                    Lv.
                    {formatEnemyLevelUi(
                      enemies.find((e) => e.id === targetEnemyId)?.level ?? 0
                    )}
                  </p>
                )}
              </>
            )}
            <div
              ref={petExpUiAnchorRef}
              className="relative rounded-md"
            >
              <div className="flex justify-between text-[9px] text-amber-100/90">
                <span>ペットEXP</span>
                <span className="font-mono tabular-nums text-[8px]">
                  {pet.level >= MOE_PET_MAX_LEVEL
                    ? "MAX"
                    : `${pet.expIntoLevel ?? 0}/${petNextNeed ?? "—"}`}
                </span>
              </div>
              <div className="mt-0.5 w-full bg-amber-950/80 h-1 rounded-full overflow-hidden border border-amber-800/40">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all"
                  style={{ width: `${petExpPct}%` }}
                />
              </div>
            </div>
            <p className="text-[7px] text-amber-200/80 font-mono tabular-nums leading-snug">
              累計 {petTotalExp} EXP（Wiki 累積表ベースでLv判定）
            </p>
            <p className="text-[7px] text-amber-200/70 leading-snug">
              自分の攻撃・敵攻撃の直後それぞれ約
              {Math.round(MOE_PET_ATTACK_EXP_SUCCESS_RATE * 100)}％で取得。敵が強いほど多い（Wiki EXP表）
            </p>
            <button
              type="button"
              onClick={handlePetExpReset}
              className="mt-1 w-full rounded border border-rose-600/60 bg-rose-950/80 py-1 text-[8px] font-bold text-rose-100 transition hover:bg-rose-900/90 active:scale-[0.98]"
            >
              ペットEXP・Lv リセット
            </button>
            <p className="mt-0.5 text-[7px] leading-snug text-white/42">
              各ペットの Lv・累計EXP・HP/MP はこのブラウザに保存（種族ごと）。スキル開放はデータの Lv から自動。
            </p>
          </div>
          <div className="mt-1.5 border-t border-white/15 pt-1.5 space-y-0.5">
            <div className="flex justify-between text-[9px] text-pink-100/95">
              <span>経験値（保存）</span>
              <span className="font-mono tabular-nums text-[8px]">
                {trainerStatus.exp}/{trainerStatus.nextExp}
              </span>
            </div>
            <div className="w-full bg-pink-950/80 h-2 rounded-full overflow-hidden border border-pink-800/50">
              <div
                className="h-full bg-gradient-to-r from-pink-400 via-fuchsia-500 to-pink-500 transition-all duration-500"
                style={{ width: `${trainerExpPct}%` }}
              />
            </div>
            <p className="text-[8px] text-pink-200/80 text-center font-medium">
              {trainerExpPct}% ・ あと {Math.max(0, trainerStatus.nextExp - trainerStatus.exp)} EXP
            </p>
          </div>
          <button
            type="button"
            onClick={handleHeal}
            className="mt-2 w-full rounded bg-pink-600 py-1 text-[9px] font-bold hover:bg-pink-500 transition active:scale-95"
          >
            ヒーリング (回復)
          </button>

          <div className="mt-1.5 border-t border-white/15 pt-1.5 pb-0.5">
            <p className="mb-0.5 text-center text-[8px] font-bold text-cyan-200/90">ペット変更</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => cyclePet(-1)}
                className="flex-1 rounded bg-cyan-900/90 py-1 text-[9px] font-bold text-cyan-100 ring-1 ring-cyan-600/50 transition hover:bg-cyan-800/90 active:scale-95"
              >
                ◀ 前
              </button>
              <button
                type="button"
                onClick={() => cyclePet(1)}
                className="flex-1 rounded bg-cyan-900/90 py-1 text-[9px] font-bold text-cyan-100 ring-1 ring-cyan-600/50 transition hover:bg-cyan-800/90 active:scale-95"
              >
                次 ▶
              </button>
            </div>
            <label className="mt-1 block text-[7px] text-gray-500">一覧から選ぶ</label>
            <select
              value={pet.id}
              onChange={(e) => applyPetId(e.target.value)}
              className="mt-0.5 w-full rounded border border-white/25 bg-zinc-900/95 py-0.5 pl-1 pr-5 text-[9px] text-white outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {MOE_PET_IDS.map((id) => (
                <option key={id} value={id}>
                  {MOE_PET_DATA[id].emoji} {MOE_PET_DATA[id].name}
                </option>
              ))}
            </select>
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
                  if (duelSkillSeq) {
                    setToast(msg);
                    scheduleMoeDuelSkillHits(duel.enemyId, duelSkillSeq);
                    return;
                  }
                  setToast(msg);
                }}
                className="shrink-0 rounded-md border border-amber-600/50 bg-gradient-to-b from-amber-700/90 to-orange-900/90 py-1 text-[8px] font-bold leading-tight text-amber-50 shadow-sm transition hover:from-amber-600/95 hover:to-orange-800/95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:from-amber-700/90 disabled:hover:to-orange-900/90"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute left-3 top-3 z-40 max-w-[min(90vw,22rem)] rounded-lg border border-white/20 bg-black/55 px-3 py-2 text-xs text-white/90 backdrop-blur-sm">
        <p className="font-bold text-cyan-300">
          ミーリム海岸 (Master of Epic){is3d ? " · 3D" : ""}
        </p>
        {is3d ? (
          <>
            <p>WASD＝移動 · Shift＝走る · 南（手前）スタート→北へ行くほど強敵</p>
            <p>敵クリック＝ターゲット · 右上パネルで命令 · Space＝ジャンプ</p>
            {!map3dReady && (
              <p className="text-amber-200/90">3Dマップ読み込み中…</p>
            )}
          </>
        ) : (
          <p>WASDで移動 / 奥の列（3→4→5）ほど強い敵 / 左下ミニマップ / 敵クリックで戦闘</p>
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

      {is3d && showPetStatusOverlay && (
        <div
          className="fixed inset-0 z-[56] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
          onClick={() => setShowPetStatusOverlay(false)}
          role="presentation"
        >
          <div
            className="max-h-[min(85dvh,28rem)] w-[min(92vw,18rem)] overflow-y-auto rounded-xl border border-white/25 bg-zinc-950/95 p-4 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="ペットステータス"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-3xl">{currentPetData.emoji}</span>
              <div>
                <p className="text-sm font-bold">{currentPetData.name}</p>
                <p className="text-xs text-gray-400">Lv.{pet.level}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">HP</span>
                <span className="font-mono tabular-nums">
                  {precisePet
                    ? `${formatPetStatUi(pet.hp)}/${formatPetStatUi(pet.hpMax)}`
                    : `${Math.floor(pet.hp)}/${pet.hpMax}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">MP</span>
                <span className="font-mono tabular-nums">
                  {precisePet
                    ? `${formatPetStatUi(pet.mp)}/${formatPetStatUi(pet.mpMax)}`
                    : `${pet.mp}/${pet.mpMax}`}
                </span>
              </div>
              {precisePet && petWikiStats && (
                <>
                  <div className="flex justify-between text-emerald-100">
                    <span>攻撃</span>
                    <span className="font-mono tabular-nums">
                      {formatPetStatUi(petWikiStats.attack)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-100">
                    <span>防御</span>
                    <span className="font-mono tabular-nums">
                      {formatPetStatUi(petWikiStats.defense)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-100/90">
                    <span>命中</span>
                    <span className="font-mono tabular-nums">
                      {formatPetStatUi(petWikiStats.hit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-100/90">
                    <span>回避</span>
                    <span className="font-mono tabular-nums">
                      {formatPetStatUi(petWikiStats.evasion)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-100/90">
                    <span>魔力</span>
                    <span className="font-mono tabular-nums">
                      {formatPetStatUi(petWikiStats.magic)}
                    </span>
                  </div>
                  {wikiGrowthCaption && (
                    <p className="text-[10px] leading-snug text-cyan-200/85">
                      {wikiGrowthCaption}
                    </p>
                  )}
                </>
              )}
              <div className="border-t border-white/15 pt-2">
                <div className="flex justify-between text-amber-100">
                  <span>ペットEXP</span>
                  <span className="font-mono text-xs tabular-nums">
                    {pet.level >= MOE_PET_MAX_LEVEL
                      ? "MAX"
                      : `${pet.expIntoLevel ?? 0}/${petNextNeed ?? "—"}`}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full border border-amber-800/40 bg-amber-950/80">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
                    style={{ width: `${petExpPct}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-amber-200/80">累計 {petTotalExp} EXP</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPetStatusOverlay(false)}
              className="mt-4 w-full rounded-lg bg-zinc-700 py-2 text-xs font-bold transition hover:bg-zinc-600 active:scale-[0.98]"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {is3d ? (
        <MoeField3DCanvas
          enemies={enemies}
          battlePopups={battlePopups.filter((p) => p.space === "world")}
          onEnemyClick={handleEnemySelect}
          targetEnemyId={targetEnemyId}
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
                  }
                : w
            );
            setEnemies((prev) => {
              const zoneCount = MOE_3D_ENEMY_ZONES.length;
              return prev.map((en) => {
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
          duelRef={duelRef}
          petStrikeUntilRef={petStrikeUntilRef}
          petAttackMsRef={petAttackMsRef}
          enemyStrikeUntilRef={enemyStrikeUntilRef}
          enemyAttackMsRef={enemyAttackMsRef}
        />
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

        {/* Enemies */}
        {enemies.map((en) => (
          <button
            key={en.id}
            type="button"
            title={enemyWikiStatsTitle(en)}
            onClick={(e) => handleEnemyClick(e, en.id)}
            className={`absolute flex flex-col items-center justify-center rounded-xl border-2 p-1 shadow-lg transition hover:scale-110 active:scale-95 ${en.color}`}
            style={{ left: en.x - 35, top: en.y - 35, width: 70, minHeight: 70 }}
          >
            <span className="text-2xl">{en.emoji}</span>
            <span className="text-[9px] font-bold text-white leading-tight">
              Lv.{formatEnemyLevelUi(en.level)}
            </span>
            <span className="text-[9px] font-bold text-white leading-tight truncate w-full px-1">{en.name}</span>
            <div className="w-full bg-black/40 h-1.5 mt-1 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full" style={{ width: `${(en.hp / en.hpMax) * 100}%` }} />
            </div>
          </button>
        ))}

        {/* Pet */}
        <div className="absolute flex flex-col items-center transition-all duration-100"
          style={{ left: pet.x - 20, top: pet.y - 20, width: 40 }}>
          <span className="text-3xl drop-shadow-lg">{currentPetData.emoji}</span>
          <div className="w-full bg-black/50 h-1 mt-0.5 rounded-full overflow-hidden">
            <div
              className="bg-green-400 h-full"
              style={{ width: `${petResourceBarPct(pet.hp, pet.hpMax)}%` }}
            />
          </div>
        </div>

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
        <div className="pointer-events-none absolute flex items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-2xl shadow-xl"
          style={{ left: player.x - PLAYER_R, top: player.y - PLAYER_R, width: PLAYER_R * 2, height: PLAYER_R * 2 }}>
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
