/**
 * MOE 敵索敵 — 視覚（前方扇形）・聴覚（足音）
 * 検知対象: プレイヤー（操作キャラ）
 */

/** @typedef {'sensitive'|'normal'|'dull'} MoeEnemyHearingLevel */
/** @typedef {'visual'|'hearing'|'both'} MoeEnemySearchType */

/**
 * @typedef {object} MoeEnemyDetection
 * @property {number} visionDeg 前方視野（度）
 * @property {number} visionRange 視覚射程（3D ワールド単位 ≒ マス）
 * @property {MoeEnemyHearingLevel} hearing
 * @property {number} hearingRange 足音感知（全方向・3D 単位）
 * @property {MoeEnemySearchType} searchType
 */

export const MOE_ENEMY_DETECTION_DEFAULTS = {
  visionDeg: 100,
  visionRange: 12,
  hearing: "normal",
  /** 既定は視覚のみ — 足音索敵は明示した敵だけ */
  searchType: "visual",
};

/** @type {Record<MoeEnemyHearingLevel, { labelJa: string, hearingRange: number }>} */
export const MOE_ENEMY_HEARING_PROFILES = {
  sensitive: { labelJa: "敏感", hearingRange: 10 },
  normal: { labelJa: "普通", hearingRange: 6 },
  dull: { labelJa: "鈍感", hearingRange: 3.5 },
};

/** @type {Record<MoeEnemySearchType, { labelJa: string, hintJa: string }>} */
export const MOE_ENEMY_SEARCH_TYPE_PROFILES = {
  visual: {
    labelJa: "視覚型",
    hintJa: "前方の扇のみ·扇外で追跡終了",
  },
  hearing: {
    labelJa: "聴覚型",
    hintJa: "足音の円·圏外2秒で追跡終了",
  },
  both: {
    labelJa: "視覚+聴覚",
    hintJa: "前方の扇 or 足音の円",
  },
};

/** @type {Record<string, Partial<MoeEnemyDetection>>} */
const MOE_ENEMY_DETECTION_BY_FAMILY = {
  rescue_hound: {
    hearing: "sensitive",
    visionDeg: 115,
    visionRange: 14,
    searchType: "both",
  },
  rescue_lion: {
    hearing: "normal",
    visionDeg: 110,
    visionRange: 13,
    searchType: "both",
  },
  rescue_buck: {
    hearing: "normal",
    visionDeg: 100,
    visionRange: 12,
    searchType: "both",
  },
  brown_serpent: {
    hearing: "sensitive",
    visionDeg: 85,
    visionRange: 10,
    searchType: "visual",
  },
  earth_worm: {
    hearing: "sensitive",
    visionDeg: 70,
    visionRange: 8,
    searchType: "hearing",
  },
  orc_infantry: {
    hearing: "dull",
    visionDeg: 95,
    visionRange: 11,
    searchType: "visual",
  },
};

/**
 * @param {string} [key]
 * @param {string} [familyId]
 * @returns {Partial<MoeEnemyDetection>}
 */
function inferDetectionFromKey(key, familyId) {
  const id = `${key ?? ""} ${familyId ?? ""}`.toLowerCase();
  if (/earth_worm|worm/.test(id) && !/crawler/.test(id)) {
    return {
      hearing: "sensitive",
      visionDeg: 70,
      visionRange: 8,
      searchType: "hearing",
    };
  }
  if (/serpent|snake|spider|nocker|crawler/.test(id)) {
    return {
      visionDeg: 90,
      visionRange: 10,
      searchType: "visual",
    };
  }
  if (/wolf|ウルフ/.test(id)) {
    return {
      hearing: "sensitive",
      visionDeg: 100,
      visionRange: 12,
      searchType: "both",
    };
  }
  if (/hound|dog|pappy|orvan/.test(id)) {
    return {
      hearing: "sensitive",
      visionDeg: 112,
      visionRange: 13,
      searchType: "both",
    };
  }
  if (/bat|slime/.test(id)) {
    return {
      hearing: "normal",
      visionDeg: 75,
      visionRange: 9,
      searchType: "hearing",
    };
  }
  if (/destroyer|giant_destroyer/.test(id)) {
    return {
      hearing: "normal",
      visionDeg: 150,
      visionRange: 28,
      searchType: "visual",
    };
  }
  if (/gargoyle/.test(id)) {
    return {
      hearing: "dull",
      visionDeg: 120,
      visionRange: 14,
      searchType: "visual",
    };
  }
  if (/lizardman/.test(id)) {
    return {
      hearing: "normal",
      visionDeg: 105,
      visionRange: 12,
      searchType: "both",
    };
  }
  if (/golem|knight|gustav|bison|boss|minotaur|dullahan/.test(id)) {
    return {
      hearing: "dull",
      visionDeg: 130,
      visionRange: 15,
      searchType: "visual",
    };
  }
  return {};
}

/**
 * @param {object} enemy
 * @returns {MoeEnemyDetection}
 */
export function resolveMoeEnemyDetection(enemy) {
  const familyId = enemy?.familyId ?? enemy?.key ?? "";
  const familyDefaults = MOE_ENEMY_DETECTION_BY_FAMILY[familyId] ?? {};
  const inferred = inferDetectionFromKey(enemy?.key, enemy?.familyId);
  const explicit = enemy?.detection ?? {};

  let visionDeg =
    explicit.visionDeg ?? familyDefaults.visionDeg ?? inferred.visionDeg ??
    MOE_ENEMY_DETECTION_DEFAULTS.visionDeg;
  let visionRange =
    explicit.visionRange ??
    familyDefaults.visionRange ??
    inferred.visionRange ??
    MOE_ENEMY_DETECTION_DEFAULTS.visionRange;
  const hearing =
    explicit.hearing ??
    familyDefaults.hearing ??
    inferred.hearing ??
    MOE_ENEMY_DETECTION_DEFAULTS.hearing;
  let searchType =
    explicit.searchType ??
    familyDefaults.searchType ??
    inferred.searchType ??
    MOE_ENEMY_DETECTION_DEFAULTS.searchType;

  if (enemy?.superBoss) {
    visionDeg = Math.max(visionDeg, 150);
    visionRange = Math.max(visionRange, 18);
    searchType = "both";
  } else if (enemy?.midBoss || enemy?.fieldBoss) {
    visionDeg = Math.max(visionDeg, 125);
    visionRange = Math.max(visionRange, 14);
  }

  const hearingProfile =
    MOE_ENEMY_HEARING_PROFILES[hearing] ??
    MOE_ENEMY_HEARING_PROFILES.normal;
  const hearingRange =
    explicit.hearingRange ??
    familyDefaults.hearingRange ??
    inferred.hearingRange ??
    hearingProfile.hearingRange;

  return {
    visionDeg: Math.round(visionDeg),
    visionRange: Math.round(visionRange * 10) / 10,
    hearing,
    hearingRange: Math.round(hearingRange * 10) / 10,
    searchType,
  };
}

/**
 * @param {MoeEnemyDetection} detection
 */
/** @param {MoeEnemyDetection} detection */
export function moeEnemyUsesVisionSearch(detection) {
  return (
    detection.searchType === "visual" || detection.searchType === "both"
  );
}

/** @param {MoeEnemyDetection} detection */
export function moeEnemyUsesHearingSearch(detection) {
  return (
    detection.searchType === "hearing" || detection.searchType === "both"
  );
}

/** 索敵の有効射程（視覚=扇の半径 / 聴覚=足音円の半径） */
export function moeEnemySearchReach(detection) {
  if (detection.searchType === "visual") {
    return detection.visionRange;
  }
  if (detection.searchType === "hearing") {
    return detection.hearingRange;
  }
  return Math.max(detection.visionRange, detection.hearingRange);
}

/** 湧きからの最大追跡 — 索敵射程×2 だけ */
export function moeEnemyChaseMaxRangeFromSpawn(detection) {
  return moeEnemySearchReach(detection) * 2;
}

/** 足音型など：索敵圏外が続いたときの余裕（索敵射程と同じ） */
export function chaseDetectionForgetRange(detection) {
  return moeEnemySearchReach(detection);
}

export function formatMoeEnemyDetectionForSearch(detection) {
  const hearingProfile = MOE_ENEMY_HEARING_PROFILES[detection.hearing];
  const searchProfile = MOE_ENEMY_SEARCH_TYPE_PROFILES[detection.searchType];
  const usesVision = moeEnemyUsesVisionSearch(detection);
  const usesHearing = moeEnemyUsesHearingSearch(detection);
  return {
    visionLabel: usesVision
      ? `前方${detection.visionDeg}°·${detection.visionRange}m（扇）`
      : "なし",
    hearingLabel: usesHearing
      ? `${hearingProfile.labelJa}（足音≈${detection.hearingRange}m·全方向円）`
      : "なし",
    searchTypeLabel: searchProfile.labelJa,
    searchHint: searchProfile.hintJa,
    targetLabel: "プレイヤー",
    usesVision,
    usesHearing,
  };
}

/** @param {number} delta */
function normalizeAngleRad(delta) {
  let d = delta;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * プレイヤーが敵の前方扇形視野内か（3D xz · facingYaw は Three.js Y 回転）
 * @param {{ px: number, pz: number, cx: number, cz: number, facingYaw: number, visionDeg: number, visionRange: number }} p
 */
export function isPlayerInEnemyVisionCone(p) {
  const dx = p.px - p.cx;
  const dz = p.pz - p.cz;
  const distSq = dx * dx + dz * dz;
  if (distSq > p.visionRange * p.visionRange) return false;
  if (distSq < 1e-6) return true;
  const angleToPlayer = Math.atan2(dx, dz);
  const half = (p.visionDeg * Math.PI) / 360;
  return Math.abs(normalizeAngleRad(angleToPlayer - p.facingYaw)) <= half;
}

/**
 * @param {{ px: number, pz: number, cx: number, cz: number, hearingRange: number }} p
 */
export function isPlayerInEnemyHearingRange(p) {
  const dx = p.px - p.cx;
  const dz = p.pz - p.cz;
  return dx * dx + dz * dz <= p.hearingRange * p.hearingRange;
}

/**
 * 索敵判定（隠れ蓑・忍び足は opts で将来拡張）
 * @param {object} enemy
 * @param {{ x: number, y: number }} playerPos
 * @param {{ x: number, y: number }} enemyPos
 * @param {number} facingYaw
 * @param {{ stealthFull?: boolean, soundMult?: number, playerMoving?: boolean, stealthVisualAvoidPct?: number }} [opts]
 */
export function checkMoeEnemyPlayerDetection(
  enemy,
  playerPos,
  enemyPos,
  facingYaw,
  opts = {}
) {
  if (opts.stealthFull) {
    return { detected: false, via: [], detection: resolveMoeEnemyDetection(enemy) };
  }
  const detection = resolveMoeEnemyDetection(enemy);
  const soundMult = opts.soundMult ?? 1;
  const hearingRange = detection.hearingRange * soundMult;
  const playerMoving = opts.playerMoving ?? false;
  const via = [];
  const cone = {
    px: playerPos.x,
    pz: playerPos.y,
    cx: enemyPos.x,
    cz: enemyPos.y,
    facingYaw,
    visionDeg: detection.visionDeg,
    visionRange: detection.visionRange,
  };
  if (moeEnemyUsesVisionSearch(detection) && isPlayerInEnemyVisionCone(cone)) {
    const avoidPct = opts.stealthVisualAvoidPct ?? 0;
    if (avoidPct > 0 && Math.random() < avoidPct) {
      /* 忍び足熟練 — 視覚索敵を回避 */
    } else {
      via.push("visual");
    }
  }
  if (
    playerMoving &&
    moeEnemyUsesHearingSearch(detection) &&
    isPlayerInEnemyHearingRange({
      px: playerPos.x,
      pz: playerPos.y,
      cx: enemyPos.x,
      cz: enemyPos.y,
      hearingRange,
    })
  ) {
    via.push("hearing");
  }
  return { detected: via.length > 0, via, detection };
}

/**
 * 視野扇形のワイヤーフレーム用点列（中心→左端→弧→右端→中心）
 * @param {{ cx: number, cz: number, facingYaw: number, visionDeg: number, visionRange: number, y?: number, segments?: number }}
 */
export function sampleMoeEnemyVisionArcPoints({
  cx,
  cz,
  facingYaw,
  visionDeg,
  visionRange,
  y = 0,
  segments = 24,
}) {
  const half = (visionDeg * Math.PI) / 360;
  const start = facingYaw - half;
  const end = facingYaw + half;
  const at = (angle) => ({
    x: cx + Math.sin(angle) * visionRange,
    y,
    z: cz + Math.cos(angle) * visionRange,
  });
  const points = [{ x: cx, y, z: cz }, at(start)];
  const steps = Math.max(4, segments);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    points.push(at(start + (end - start) * t));
  }
  points.push({ x: cx, y, z: cz });
  return points;
}

/**
 * 聴覚範囲の円（LineLoop 用）
 * @param {{ cx: number, cz: number, hearingRange: number, y?: number, segments?: number }}
 */
export function sampleMoeEnemyHearingCirclePoints({
  cx,
  cz,
  hearingRange,
  y = 0,
  segments = 48,
}) {
  const points = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push({
      x: cx + Math.sin(a) * hearingRange,
      y,
      z: cz + Math.cos(a) * hearingRange,
    });
  }
  return points;
}
