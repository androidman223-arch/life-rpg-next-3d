import {
  MOE_PET_DATA,
  calculatePetStats,
  petUsesPreciseWikiStats,
  roundPetStatInternal,
} from "@/data/moePets";
import {
  getMoePetExpIntoLevelFromTotal,
  getMoePetFreshTotalExpForLevel,
  getMoePetLevelFromTotalExp,
  getMoePetTotalExpFromLegacyProgress,
} from "@/data/moePetExpTable";

const STORAGE_KEY = "life-rpg-moe-pet-progress";
const DEBUG_SNAPSHOT_KEY = "life-rpg-moe-pet-debug-snapshot";

/** 新規ペット・リセット時の Lv（MoeFieldMap と揃える） */
export const MOE_SAVED_PET_INITIAL_LEVEL = 10;

/**
 * @typedef {{ totalExp?: number, hp?: number, mp?: number, level?: number, expIntoLevel?: number }} MoePetSlot
 * @typedef {{ totalExp: number, hp: number, mp: number }} MoePetDebugSnapshot
 * @typedef {{ activeId: string, byId: Record<string, MoePetSlot>, debugSnapshots?: Record<string, MoePetDebugSnapshot> }} MoePetSaveFile
 */

/** persist 中は Lv100 儀式データを自動復元しない */
let skipDebugRecover = false;

/** デバッグ Lv100 儀式で上書きされる累計EXP（復元判定用） */
export function getMoePetDebugLv100TotalExp() {
  return getMoePetFreshTotalExpForLevel(100);
}

function readRawMoePetsSaveJson() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** @returns {MoePetSaveFile} */
function normalizeMoePetSaveFile(parsed) {
  const activeId =
    typeof parsed?.activeId === "string" && MOE_PET_DATA[parsed.activeId]
      ? parsed.activeId
      : "sun_spirit";
  const byId =
    parsed?.byId && typeof parsed.byId === "object" && !Array.isArray(parsed.byId)
      ? parsed.byId
      : {};
  const debugSnapshots =
    parsed?.debugSnapshots &&
    typeof parsed.debugSnapshots === "object" &&
    !Array.isArray(parsed.debugSnapshots)
      ? parsed.debugSnapshots
      : {};
  return { activeId, byId, debugSnapshots };
}

function readSessionDebugSnapshots() {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(DEBUG_SNAPSHOT_KEY);
    if (!raw) return {};
    const all = JSON.parse(raw);
    return all && typeof all === "object" && !Array.isArray(all) ? all : {};
  } catch {
    return {};
  }
}

function writeSessionDebugSnapshots(all) {
  if (typeof window === "undefined") return;
  try {
    if (!all || Object.keys(all).length === 0) {
      sessionStorage.removeItem(DEBUG_SNAPSHOT_KEY);
      return;
    }
    sessionStorage.setItem(DEBUG_SNAPSHOT_KEY, JSON.stringify(all));
  } catch {
    /* private mode */
  }
}

function normalizeDebugSnapshot(snap) {
  if (!snap || typeof snap.totalExp !== "number") return null;
  return {
    totalExp: Math.max(0, Math.floor(snap.totalExp)),
    hp: Number(snap.hp),
    mp: Number(snap.mp),
  };
}

/** 儀式バグで Lv100 のまま残ったペットの救済 EXP（スナップショット無し） */
const MOE_PET_DEBUG_LV100_RECOVERY_EXP = {
  abinyan: 280,
  sun_spirit: 280,
};

function isStuckDebugLv100TotalExp(totalExp) {
  const T = Math.max(0, Math.floor(Number(totalExp) || 0));
  const ritualExp = getMoePetDebugLv100TotalExp();
  return T >= ritualExp || getMoePetLevelFromTotalExp(T) >= 100;
}

/** スナップショット無しで Lv100 のまま固まったスロットを救済 */
function recoverStuckDebugLv100WithoutSnapshot(file) {
  const byId = { ...file.byId };
  let changed = false;

  for (const [petId, recoveryExp] of Object.entries(
    MOE_PET_DEBUG_LV100_RECOVERY_EXP
  )) {
    const slot = byId[petId];
    if (!slot) continue;
    const totalExp = slot.totalExp;
    if (totalExp == null) continue;
    if (file.debugSnapshots?.[petId]) continue;
    if (loadMoePetDebugSnapshot(petId)) continue;
    if (!isStuckDebugLv100TotalExp(totalExp)) continue;
    if (Math.floor(Number(totalExp)) === recoveryExp) continue;

    byId[petId] = {
      ...slot,
      totalExp: recoveryExp,
    };
    changed = true;
  }

  if (!changed) return file;
  return { ...file, byId };
}

/** リロード時：儀式前スナップショットがあれば必ず復元 */
function recoverPendingDebugSnapshots(file) {
  const debugSnapshots = { ...(file.debugSnapshots ?? {}) };
  const byId = { ...file.byId };
  let changed = false;

  for (const petId of Object.keys(debugSnapshots)) {
    const snap = normalizeDebugSnapshot(debugSnapshots[petId]);
    if (!snap) {
      delete debugSnapshots[petId];
      changed = true;
      continue;
    }
    byId[petId] = {
      ...byId[petId],
      totalExp: snap.totalExp,
      hp: snap.hp,
      mp: snap.mp,
    };
    delete debugSnapshots[petId];
    changed = true;
    const sessionAll = readSessionDebugSnapshots();
    delete sessionAll[petId];
    writeSessionDebugSnapshots(sessionAll);
  }

  if (!changed) return file;
  return { ...file, byId, debugSnapshots };
}

/**
 * @param {string} petId
 * @returns {MoePetDebugSnapshot | null}
 */
export function loadMoePetDebugSnapshot(petId) {
  const sessionSnap = normalizeDebugSnapshot(
    readSessionDebugSnapshots()[petId]
  );
  if (sessionSnap) return sessionSnap;

  const file = normalizeMoePetSaveFile(readRawMoePetsSaveJson() ?? {});
  return normalizeDebugSnapshot(file.debugSnapshots?.[petId]);
}

/** @param {string} petId @param {MoePetDebugSnapshot} snapshot */
export function saveMoePetDebugSnapshot(petId, snapshot) {
  if (typeof window === "undefined") return;
  const snap = normalizeDebugSnapshot(snapshot);
  if (!snap) return;

  try {
    const sessionAll = readSessionDebugSnapshots();
    sessionAll[petId] = snap;
    writeSessionDebugSnapshots(sessionAll);
  } catch {
    /* private mode */
  }

  skipDebugRecover = true;
  try {
    const file = normalizeMoePetSaveFile(readRawMoePetsSaveJson() ?? {});
    writeMoePetsSave({
      ...file,
      debugSnapshots: {
        ...file.debugSnapshots,
        [petId]: snap,
      },
    });
  } finally {
    skipDebugRecover = false;
  }
}

export function clearMoePetDebugSnapshot(petId) {
  if (typeof window === "undefined") return;

  try {
    const sessionAll = readSessionDebugSnapshots();
    delete sessionAll[petId];
    writeSessionDebugSnapshots(sessionAll);
  } catch {
    /* ignore */
  }

  skipDebugRecover = true;
  try {
    const file = normalizeMoePetSaveFile(readRawMoePetsSaveJson() ?? {});
    if (!file.debugSnapshots?.[petId]) return;
    const debugSnapshots = { ...file.debugSnapshots };
    delete debugSnapshots[petId];
    writeMoePetsSave({ ...file, debugSnapshots });
  } finally {
    skipDebugRecover = false;
  }
}

/**
 * 儀式前の totalExp / hp / mp から UI 用ペット状態を再構築
 * @param {string} petId
 * @param {MoePetDebugSnapshot} snapshot
 * @param {{ x?: number, y?: number }} [pos]
 */
export function petFromDebugSnapshot(petId, snapshot, pos = {}) {
  const id = MOE_PET_DATA[petId] ? petId : "sun_spirit";
  const totalExp = Math.max(0, Math.floor(snapshot.totalExp));
  const level = getMoePetLevelFromTotalExp(totalExp);
  const expIntoLevel = getMoePetExpIntoLevelFromTotal(totalExp, level);
  const stats = calculatePetStats(id, level);
  const hpMax = stats?.hpMax ?? 100;
  const mpMax = stats?.mpMax ?? 50;
  const precise = petUsesPreciseWikiStats(id);
  let hp = snapshot.hp;
  let mp = snapshot.mp;
  if (precise) {
    hp = roundPetStatInternal(
      Math.min(hpMax, Math.max(0.01, Number.isFinite(hp) ? hp : hpMax))
    );
    mp = roundPetStatInternal(
      Math.min(mpMax, Math.max(0, Number.isFinite(mp) ? mp : mpMax))
    );
  } else {
    hp = Math.min(hpMax, Math.max(1, Math.floor(hp) || hpMax));
    mp = Math.min(mpMax, Math.max(0, Math.floor(mp) ?? mpMax));
  }
  return {
    id,
    level,
    totalExp,
    expIntoLevel,
    hp,
    mp,
    hpMax,
    mpMax,
    x: pos.x ?? 120,
    y: pos.y ?? 120,
  };
}

/** スロットの累計EXPだけ差し替え（HP/MPは petFromSaveSlot で全快扱い） */
export function patchMoePetSlotTotalExp(petId, totalExp) {
  skipDebugRecover = true;
  try {
    const prev = normalizeMoePetSaveFile(readRawMoePetsSaveJson() ?? {});
    const byId = {
      ...prev.byId,
      [petId]: {
        ...prev.byId[petId],
        totalExp: Math.max(0, Math.floor(totalExp)),
      },
    };
    writeMoePetsSave({ ...prev, byId });
    return byId;
  } finally {
    skipDebugRecover = false;
  }
}

export function loadMoePetsSave() {
  if (typeof window === "undefined") {
    return { activeId: "sun_spirit", byId: {}, debugSnapshots: {} };
  }

  const base = normalizeMoePetSaveFile(readRawMoePetsSaveJson() ?? {});
  if (skipDebugRecover) return base;

  let recovered = recoverPendingDebugSnapshots(base);
  recovered = recoverStuckDebugLv100WithoutSnapshot(recovered);
  if (recovered !== base) {
    writeMoePetsSave(recovered);
  }
  return recovered;
}

export function writeMoePetsSave(file) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(file));
  } catch {
    /* quota / private mode */
  }
}

export function getDefaultPetForId(petId) {
  const id = MOE_PET_DATA[petId] ? petId : "sun_spirit";
  const stats = calculatePetStats(id, MOE_SAVED_PET_INITIAL_LEVEL);
  const totalExp = getMoePetFreshTotalExpForLevel(MOE_SAVED_PET_INITIAL_LEVEL);
  const precise = petUsesPreciseWikiStats(id);
  const hpM = stats?.hpMax ?? 100;
  const mpM = stats?.mpMax ?? 50;
  return {
    id,
    level: MOE_SAVED_PET_INITIAL_LEVEL,
    totalExp,
    expIntoLevel: 0,
    hp: precise ? roundPetStatInternal(hpM) : hpM,
    mp: precise ? roundPetStatInternal(mpM) : mpM,
    hpMax: hpM,
    mpMax: mpM,
    x: 120,
    y: 120,
  };
}

/**
 * スロットから UI 用ペット状態を構築（レベル・バーは totalExp から再計算）
 * @param {string} petId
 * @param {MoePetSlot | null | undefined} slot
 */
export function petFromSaveSlot(petId, slot) {
  const id = MOE_PET_DATA[petId] ? petId : "sun_spirit";
  if (!slot || typeof slot !== "object") {
    return getDefaultPetForId(id);
  }
  let totalExp = slot.totalExp;
  if (totalExp == null && slot.level != null) {
    totalExp = getMoePetTotalExpFromLegacyProgress(
      slot.level,
      slot.expIntoLevel ?? 0
    );
  }
  if (totalExp == null || Number.isNaN(Number(totalExp))) {
    return getDefaultPetForId(id);
  }
  totalExp = Math.max(0, Math.floor(Number(totalExp)));
  const level = getMoePetLevelFromTotalExp(totalExp);
  const expIntoLevel = getMoePetExpIntoLevelFromTotal(totalExp, level);
  const stats = calculatePetStats(id, level);
  const hpMax = stats?.hpMax ?? 100;
  const mpMax = stats?.mpMax ?? 50;
  const precise = petUsesPreciseWikiStats(id);
  let hp = Number(slot.hp);
  let mp = Number(slot.mp);
  if (precise) {
    hp = roundPetStatInternal(
      Math.min(hpMax, Math.max(0.01, Number.isFinite(hp) ? hp : hpMax))
    );
    mp = roundPetStatInternal(
      Math.min(mpMax, Math.max(0, Number.isFinite(mp) ? mp : mpMax))
    );
  } else {
    hp = Math.min(hpMax, Math.max(1, Math.floor(hp) || hpMax));
    mp = Math.min(mpMax, Math.max(0, Math.floor(mp) ?? mpMax));
  }
  return {
    id,
    level,
    totalExp,
    expIntoLevel,
    hp,
    mp,
    hpMax,
    mpMax,
    x: 120,
    y: 120,
  };
}

/** 初回マウント用：最後に選んでいた種族＋保存データ */
export function loadInitialMoePetFromStorage() {
  const { activeId, byId } = loadMoePetsSave();
  return petFromSaveSlot(activeId, byId[activeId]);
}

/**
 * 現在表示中ペットを byId にマージして保存
 * @param {{ id: string, totalExp?: number, hp: number, mp: number, level?: number, expIntoLevel?: number }} pet
 */
export function persistCurrentMoePet(pet) {
  skipDebugRecover = true;
  try {
    const prev = normalizeMoePetSaveFile(readRawMoePetsSaveJson() ?? {});
    const totalExp =
      pet.totalExp != null
        ? Math.max(0, Math.floor(Number(pet.totalExp)))
        : getMoePetTotalExpFromLegacyProgress(
            pet.level ?? MOE_SAVED_PET_INITIAL_LEVEL,
            pet.expIntoLevel ?? 0
          );
    const byId = {
      ...prev.byId,
      [pet.id]: {
        totalExp,
        hp: pet.hp,
        mp: pet.mp,
      },
    };
    writeMoePetsSave({ ...prev, activeId: pet.id, byId });
  } finally {
    skipDebugRecover = false;
  }
}
