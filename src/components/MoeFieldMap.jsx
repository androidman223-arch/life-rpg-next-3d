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
import { MOE_MEERIM_ENEMIES, enemyWikiStatsTitle } from "@/data/moeMeerimEnemies";
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

const PLAYER_R = 18;
const MOVE_SPEED = 4.5;
const HEAL_AMOUNT = 20; // プレイヤーの回復量
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

function inRiver(px, py, mapW, mapH) {
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

export default function MoeFieldMap({ onBack, onEnemyDefeat }) {
  const [view, setView] = useState({ w: 1200, h: 800 });
  const mapW = view.w * 2;
  const mapH = view.h * 6;

  const [world, setWorld] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [player, setPlayer] = useState({ x: 100, y: 100 });
  const [toast, setToast] = useState(null);
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
    [onEnemyDefeat, pushPetExpPopup, pushWorldDamagePopup, rollPetExpOnHit]
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
  }, [pushPetExpPopup, pushWorldDamagePopup, rollPetExpOnHit]);

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
    if (!view.w || !view.h) return;
    const mw = view.w * 2;
    const mh = view.h * 6;
    const screenH = mh / 6;
    
    const newEnemies = [];
    MOE_MEERIM_ENEMIES.forEach((data, sy) => {
      const yStart = mh - (sy + 1) * screenH;
      for (let i = 0; i < 4; i++) {
        newEnemies.push({
          id: enemyIdRef.current++,
          x: 100 + Math.random() * (mw - 200),
          y: yStart + 50 + Math.random() * (screenH - 100),
          hp: data.hpMax,
          hpMax: data.hpMax, // ここを追加
          sy: sy,
          ...data
        });
      }
    });

    setWorld({ mw, mh });
    setEnemies(newEnemies);
    approachChargeScheduledRef.current = false;
    duelRef.current = null;
    setDuel(null);
    const startY = mh - 120;
    const start = { x: 100, y: startY };
    playerPosRef.current = start;
    setPlayer(start);
    setPet((prev) => ({ ...prev, x: 120, y: startY }));
  }, [view.w, view.h]);

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
    };
    const up = (e) => { keysRef.current[e.key] = false; };
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
    const loop = () => {
      const k = keysRef.current;
      let dx = 0, dy = 0;
      if (k["ArrowUp"] || k["w"] || k["W"]) dy -= 1;
      if (k["ArrowDown"] || k["s"] || k["S"]) dy += 1;
      if (k["ArrowLeft"] || k["a"] || k["A"]) dx -= 1;
      if (k["ArrowRight"] || k["d"] || k["D"]) dx += 1;
      
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1;
        dx = (dx / len) * MOVE_SPEED;
        dy = (dy / len) * MOVE_SPEED;
      }

      setPlayer((prev) => {
        let nx = prev.x + dx;
        let ny = prev.y + dy;
        nx = Math.max(PLAYER_R, Math.min(world.mw - PLAYER_R, nx));
        ny = Math.max(PLAYER_R, Math.min(world.mh - PLAYER_R, ny));

        if (inRiver(nx, ny, world.mw, world.mh)) {
          nx = prev.x;
          ny = prev.y;
        }

        if (nx < 80 && ny > world.mh - 80) {
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
            if (!approachChargeScheduledRef.current) {
              approachChargeScheduledRef.current = true;
              const enemyIdSnapshot = d.enemyId;
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
                  if (
                    !cur ||
                    cur.phase !== "approach" ||
                    cur.enemyId !== enemyIdSnapshot
                  ) {
                    return cur;
                  }
                  const next = {
                    ...cur,
                    phase: "simultaneous_charge",
                    petBar: 0,
                    enemyBar: 0,
                  };
                  duelRef.current = next;
                  playSfx("combatReady");
                  return next;
                });
              });
            }
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

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [world, onBack]);

  const dataForSkillSlots = MOE_PET_DATA[pet.id] || MOE_PET_DATA.sun_spirit;
  const combatSkillSlots = (dataForSkillSlots.skills || [])
    .filter((s) => s.level > 1)
    .slice(0, 7);

  const handleEnemyClick = (e, id) => {
    e.stopPropagation();
    const cur = duelRef.current;
    if (cur) {
      if (cur.enemyId === id) return;
      return;
    }
    const target = enemies.find((en) => en.id === id);
    if (!target || target.hp <= 0) return;
    const slot = slotInFrontOfEnemy(target, player.x, player.y);
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
  };

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

  if (!world) return <div className="bg-zinc-900 text-white flex h-dvh items-center justify-center">ミーリム海岸へ移動中...</div>;

  const camX = view.w / 2 - player.x;
  const camY = view.h / 2 - player.y;
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
    <div className="relative h-dvh w-full overflow-hidden bg-sky-900">
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
            {precisePet && petWikiStats && (
              <>
                <div className="flex justify-between text-[9px] text-emerald-100/90 pt-0.5">
                  <span>攻撃</span>
                  <span className="font-mono tabular-nums">
                    {formatPetStatUi(petWikiStats.attack)}
                  </span>
                </div>
                <div className="flex justify-between text-[9px] text-emerald-100/90">
                  <span>防御</span>
                  <span className="font-mono tabular-nums">
                    {formatPetStatUi(petWikiStats.defense)}
                  </span>
                </div>
                <div className="flex justify-between text-[9px] text-emerald-100/90">
                  <span>命中</span>
                  <span className="font-mono tabular-nums">
                    {formatPetStatUi(petWikiStats.hit)}
                  </span>
                </div>
                <div className="flex justify-between text-[9px] text-emerald-100/90">
                  <span>回避</span>
                  <span className="font-mono tabular-nums">
                    {formatPetStatUi(petWikiStats.evasion)}
                  </span>
                </div>
                <div className="flex justify-between text-[9px] text-emerald-100/90">
                  <span>魔力</span>
                  <span className="font-mono tabular-nums">
                    {formatPetStatUi(petWikiStats.magic)}
                  </span>
                </div>
                {wikiGrowthCaption && (
                  <p className="text-[7px] leading-snug text-cyan-200/85 pt-0.5">
                    {wikiGrowthCaption}
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
        <p className="font-bold text-cyan-300">ミーリム海岸 (Master of Epic)</p>
        <p>WASDで移動 / 敵クリックで接近→両バー同時チャージ→満タンごとにアタック／反撃（速い側は連打可）</p>
        <p className="font-bold text-pink-300">
          討伐で訓練士EXP +（敵Lv×5 目安）／ペットは攻撃・敵攻撃の直後それぞれ約
          {Math.round(MOE_PET_ATTACK_EXP_SUCCESS_RATE * 100)}%でEXP（Wiki表）
        </p>
        <p className="text-pink-200/90">右上で回復・ペット変更・スキル</p>
      </div>

      <div className="absolute will-change-transform" style={{ width: world.mw, height: world.mh, transform: `translate(${camX}px, ${camY}px)` }}>
        {/* Ground with sections */}
        <div className="absolute inset-0" style={{ 
          background: `
            linear-gradient(180deg, 
              #8b4513 0%, #a0522d 16%, 
              #228b22 16%, #32cd32 48%, 
              #d2b48c 48%, #f5deb3 80%, 
              #d2b48c 80%, #f5deb3 100%)
          `
        }} />
        
        {/* Sea (Right side) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-blue-500/40 border-l-8 border-white/30" />

        {/* Rivers and Bridges */}
        {[...Array(5)].map((_, i) => (
          <React.Fragment key={i}>
            <div className="absolute left-0 right-0 bg-blue-600/60 border-y-2 border-blue-400/30"
              style={{ top: (world.mh / 6) * (i + 1) - (world.mh / 6) * 0.08, height: (world.mh / 6) * 0.16 }} />
            <div className="absolute bg-[#8b5a2b] border-2 border-[#5d3a1a] shadow-md"
              style={{ left: world.mw / 2 - 60, top: (world.mh / 6) * (i + 1) - (world.mh / 6) * 0.09, width: 120, height: (world.mh / 6) * 0.18 }} />
          </React.Fragment>
        ))}

        {/* Exit Area */}
        <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-zinc-800 border-t-4 border-r-4 border-zinc-600 flex items-center justify-center text-white font-bold">
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
            <span className="text-[9px] font-bold text-white leading-tight">Lv.{en.level}</span>
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
    </div>
  );
}
