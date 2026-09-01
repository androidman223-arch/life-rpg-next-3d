import * as THREE from "three";

/** 3D MOE — glb 配置（public/assets/models/。制作元は src/app/pet, src/app/monster） */
export const PET_MODEL_URL = "/assets/models/pet/Snake_green.glb";
export const MONSTER_MODEL_URL = "/assets/models/monster/Snake_green.glb";

/** 敵 key ごとの色（同じ glb を clone して material.color を差し替え） */
export const MOE_ENEMY_TINT_BY_KEY = {
  brown_serpent: 0xc2780a,
  hilltop_lion: 0xd4a017,
  orc_infantry: 0x2d6a3a,
  earth_worm: 0x8b4513,
  sea_snake: 0x0891b2,
  stray_ixion: 0x4338ca,
};

export const MOE_PET_TINT_DEFAULT = 0x4ade80;

/** glb 内の表示高さ（ワールド単位） */
export const MOE_PET_MODEL_HEIGHT = 0.475;
export const MOE_MONSTER_MODEL_HEIGHT = 0.525;

/** 3D フィールドの半幅（Three.js x / z とも ±この値） */
export const MOE_3D_HALF_W = 100;
export const MOE_3D_HALF_D = 100;
/** 距離帯（ゾーン）ごとに同種2匹。外側ほど Lv が上がる */
export const MOE_3D_ENEMIES_PER_ZONE = 2;
/** @type {{ level: number, key: string }[]} 中心に近い順（Wiki Lv・小数） */
export const MOE_3D_ENEMY_ZONES = [
  { level: 4.5, key: "brown_serpent" },
  { level: 15.1, key: "hilltop_lion" },
  { level: 23.5, key: "orc_infantry" },
  { level: 41.1, key: "earth_worm" },
  { level: 50.3, key: "stray_ixion" },
];
/** 同ゾーン2匹目の Lv 差（±） */
export const MOE_3D_ZONE_PAIR_LEVEL_OFFSET = 0.3;
/** Shift 走行中の RUN アニメ速度 */
export const MOE_SNAKE_RUN_SPRINT_TIME_SCALE = 1.5;
/** リスポーン時：プレイヤー・他敵との最低距離 */
export const MOE_3D_MIN_RESPAWN_FROM_PLAYER = 55;
export const MOE_3D_MIN_RESPAWN_FROM_ENEMY = 45;
/** 戦闘時：ペットと敵の間隔（ワールド単位） */
export const MOE_3D_DUEL_SLOT_DIST = 6.5;
/** glb の向き補正（ラジアン）。逆向きなら Math.PI など */
export const MOE_PET_MODEL_YAW_OFFSET = 0;
export const MOE_MONSTER_MODEL_YAW_OFFSET = 0;

/** ペット側の決戦位置（敵から dist だけ離れたところ） */
export function moe3dDuelSlotFromPet(
  enemy,
  petX,
  petY,
  dist = MOE_3D_DUEL_SLOT_DIST
) {
  const dx = petX - enemy.x;
  const dy = petY - enemy.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: enemy.x + (dx / len) * dist,
    y: enemy.y + (dy / len) * dist,
  };
}

/** お互いを向く yaw（Three.js Y 回転） */
export function moe3dYawFaceTarget(fromX, fromZ, toX, toZ) {
  return Math.atan2(toX - fromX, toZ - fromZ);
}

/** プレイヤー初期位置（南＝マップ下端付近） */
export function moe3dPlayerStartPosition(halfW, halfD) {
  const limD = Math.max(4, halfD - 6);
  return {
    x: 0,
    y: limD * 0.88,
  };
}

function moe3dZoneBandY(zoneIndex, zoneCount, halfD) {
  const limD = halfD * 0.78;
  /** ゾーン0＝南側（弱）→ 最終ゾーン＝北側（強） */
  const southY = limD * 0.42;
  const northY = -limD * 0.72;
  const t = zoneCount <= 1 ? 0 : zoneIndex / (zoneCount - 1);
  return southY + (northY - southY) * t;
}

/**
 * ゾーン内の2匹配置（南→北に弱→強、横に2匹）
 * @param {number} zoneIndex 0=最弱（南）..n-1=最強（北）
 */
export function moe3dZoneEnemyPosition(
  zoneIndex,
  slotInZone,
  zoneCount,
  halfW = MOE_3D_HALF_W,
  halfD = MOE_3D_HALF_D
) {
  const bandY = moe3dZoneBandY(zoneIndex, zoneCount, halfD);
  const spreadX = halfW * (0.18 + zoneIndex * 0.05);
  const x = slotInZone === 0 ? -spreadX * 0.55 : spreadX * 0.55;
  return { x, y: bandY };
}

/** ゾーン目標 Lv に合わせてステータスをスケール */
export function moe3dEnemyStatsForZoneLevel(base, zoneLevel) {
  const level = Math.round(Number(zoneLevel) * 10) / 10;
  const scale = level / Math.max(base.level, 0.1);
  const hpMax = Math.max(1, Math.round(base.hpMax * scale));
  const petDamage = Math.max(1, Math.round(base.petDamage * scale));
  const wiki = base.wiki
    ? {
        ...base.wiki,
        attack: Math.round(base.wiki.attack * scale * 10) / 10,
        defense: Math.round(base.wiki.defense * scale * 10) / 10,
        hit: Math.round(base.wiki.hit * scale * 10) / 10,
        magic: Math.round(base.wiki.magic * scale * 10) / 10,
      }
    : base.wiki;
  return { level, hpMax, petDamage, wiki, zoneLevel };
}

/** 撃破後：同じゾーン帯内でリスポーン */
export function moe3dPickRespawnInZone(
  zoneIndex,
  zoneCount,
  halfW,
  halfD,
  playerPos,
  others,
  excludeId
) {
  const bandY = moe3dZoneBandY(zoneIndex, zoneCount, halfD);
  const bandHalfH = halfD * 0.07;
  const spreadX = halfW * (0.18 + zoneIndex * 0.05);

  for (let attempt = 0; attempt < 40; attempt++) {
    const x = (Math.random() - 0.5) * spreadX * 1.1;
    const y = bandY + (Math.random() - 0.5) * bandHalfH * 2;
    if (
      Math.hypot(x - playerPos.x, y - playerPos.y) <
      MOE_3D_MIN_RESPAWN_FROM_PLAYER
    ) {
      continue;
    }
    let ok = true;
    for (const o of others) {
      if (o.id === excludeId || o.hp <= 0) continue;
      if (Math.hypot(x - o.x, y - o.y) < MOE_3D_MIN_RESPAWN_FROM_ENEMY) {
        ok = false;
        break;
      }
    }
    if (ok) return { x, y };
  }
  return moe3dZoneEnemyPosition(zoneIndex, 0, zoneCount, halfW, halfD);
}

/** x/z を地形プレイ範囲内に収める */
export function moe3dClampPosition(x, z, halfW, halfD, margin = 4) {
  const limW = Math.max(4, halfW - margin);
  const limD = Math.max(4, halfD - margin);
  return {
    x: Math.max(-limW, Math.min(limW, x)),
    y: Math.max(-limD, Math.min(limD, z)),
  };
}

/** 撃破後リスポーン：プレイヤーから離れ、他敵と間隔を空ける */
export function moe3dPickRespawnPosition(
  halfW,
  halfD,
  playerPos,
  others,
  excludeId
) {
  const margin = 8;
  const limW = Math.max(4, halfW - margin);
  const limD = Math.max(4, halfD - margin);
  for (let attempt = 0; attempt < 48; attempt++) {
    const x = (Math.random() * 2 - 1) * limW;
    const y = (Math.random() * 2 - 1) * limD;
    if (
      Math.hypot(x - playerPos.x, y - playerPos.y) <
      MOE_3D_MIN_RESPAWN_FROM_PLAYER
    ) {
      continue;
    }
    let ok = true;
    for (const o of others) {
      if (o.id === excludeId || o.hp <= 0) continue;
      if (Math.hypot(x - o.x, y - o.y) < MOE_3D_MIN_RESPAWN_FROM_ENEMY) {
        ok = false;
        break;
      }
    }
    if (ok) return { x, y };
  }
  const angle = Math.atan2(-playerPos.y, -playerPos.x);
  const r = Math.min(halfW, halfD) * 0.72;
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
}

/** 待機アニメ（SnakeIdle.01 / SnakeRun.02 / SnakeAttakc.01 など） */
export const MOE_SNAKE_IDLE_CLIP = "SnakeIdle.01";
export const MOE_SNAKE_RUN_CLIP = "SnakeRun.02";
export const MOE_SNAKE_ATTACK_CLIP = "SnakeAttakc.01";
/** 攻撃クリップ長が取れないときのフォールバック */
export const MOE_SNAKE_ATTACK_MS = 850;
/** 攻撃アニメ再生速度（2 = 2倍速） */
export const MOE_SNAKE_ATTACK_TIME_SCALE = 2;
/** 攻撃後〜次のチャージ開始まで（ms）。後から調整しやすいよう定数化 */
export const MOE_STRIKE_RECOVERY_MS = 1500;

/** @param {import("three").AnimationClip[]} clips */
export function pickSnakeIdleClip(clips) {
  if (!clips?.length) return null;
  const exact = clips.find((c) => c.name === MOE_SNAKE_IDLE_CLIP);
  if (exact) return exact;
  const fuzzy = clips.find((c) => /snakeidle/i.test(c.name));
  if (fuzzy) return fuzzy;
  const idle = clips.find((c) => /idle/i.test(c.name));
  return idle ?? clips[0];
}

/** @param {import("three").AnimationClip[]} clips */
export function pickSnakeRunClip(clips) {
  if (!clips?.length) return null;
  const exact = clips.find((c) => c.name === MOE_SNAKE_RUN_CLIP);
  if (exact) return exact;
  return clips.find((c) => /snakerun|\.run/i.test(c.name)) ?? null;
}

/** @param {import("three").AnimationClip[]} clips */
export function pickSnakeAttackClip(clips) {
  if (!clips?.length) return null;
  const exact = clips.find((c) => c.name === MOE_SNAKE_ATTACK_CLIP);
  if (exact) return exact;
  return (
    clips.find((c) => /snakeattakc|snakeattack|attakc|attack/i.test(c.name)) ??
    null
  );
}

/**
 * @param {import("three").AnimationMixer} mixer
 * @param {import("three").AnimationClip[]} clips
 * @param {{ attackLoop?: boolean }} [opts]
 */
export function createSnakeAnimController(mixer, clips, opts = {}) {
  const { attackLoop = false } = opts;
  const idleClip = pickSnakeIdleClip(clips);
  const runClip = pickSnakeRunClip(clips);
  const attackClip = pickSnakeAttackClip(clips);

  const makeAction = (clip, loop) => {
    if (!clip) return null;
    const action = mixer.clipAction(clip);
    action.setLoop(
      loop ? THREE.LoopRepeat : THREE.LoopOnce,
      loop ? Infinity : 1
    );
    if (!loop) action.clampWhenFinished = true;
    return action;
  };

  const idle = makeAction(idleClip, true);
  const run = makeAction(runClip, true);
  const attack = makeAction(attackClip, attackLoop);
  let runTimeScale = 1;
  if (run) run.timeScale = runTimeScale;
  if (attack) {
    attack.timeScale = MOE_SNAKE_ATTACK_TIME_SCALE;
  }

  let current = null;
  let currentMode = "idle";
  let afterAttackMode = "idle";

  const fade = 0.12;

  const crossfadeTo = (action, mode) => {
    if (!action) return;
    if (action === current && mode !== "attack") return;
    if (current) current.fadeOut(fade);
    action.reset().fadeIn(fade).play();
    current = action;
    currentMode = mode;
  };

  const resolveMode = (mode) => {
    if (mode === "attack" && attack) return { action: attack, mode: "attack" };
    if (mode === "run" && run) return { action: run, mode: "run" };
    if (idle) return { action: idle, mode: "idle" };
    if (run) return { action: run, mode: "run" };
    return { action: null, mode: "idle" };
  };

  const setMode = (mode, setOpts = {}) => {
    if (mode === "attack" && attack) {
      if (setOpts.afterAttack) afterAttackMode = setOpts.afterAttack;
      if (setOpts.restart || current !== attack) {
        if (current && current !== attack) current.fadeOut(fade);
        attack.reset();
        attack.fadeIn(fade).play();
        current = attack;
        currentMode = "attack";
      }
      return;
    }
    const resolved = resolveMode(mode);
    if (resolved.action) crossfadeTo(resolved.action, resolved.mode);
  };

  if (attack && !attackLoop) {
    mixer.addEventListener("finished", (e) => {
      if (e.action !== attack) return;
      const next = resolveMode(afterAttackMode);
      if (next.action) crossfadeTo(next.action, next.mode);
    });
  }

  const setRunTimeScale = (scale) => {
    runTimeScale = scale;
    if (run) run.timeScale = scale;
  };

  setMode("idle");
  return {
    setMode,
    getMode: () => currentMode,
    setRunTimeScale,
    attackDurationMs: attackClip
      ? Math.max(
          (attackClip.duration * 1000) / MOE_SNAKE_ATTACK_TIME_SCALE,
          400
        )
      : MOE_SNAKE_ATTACK_MS / MOE_SNAKE_ATTACK_TIME_SCALE,
  };
}

/**
 * @param {import("three").Object3D} root
 * @param {number | null} tintHex null = 元のテクスチャ色のまま
 */
export function applyModelTint(root, tintHex) {
  if (tintHex == null) return;
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const cloned = mats.map((m) => {
      const c = m.clone();
      if (c.color) c.color.setHex(tintHex);
      return c;
    });
    obj.material = cloned.length === 1 ? cloned[0] : cloned;
  });
}

/** モデルの足元を y=0 に合わせ、目標高さにスケール */
export function fitModelToGround(root, targetHeight = 1.1) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const scale = targetHeight / Math.max(size.y, 0.001);
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  root.position.y = -box2.min.y;
  return scale;
}
