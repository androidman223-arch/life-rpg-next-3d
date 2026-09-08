import {
  MOE_PET_DATA,
  calculatePetStats,
  petUsesPreciseWikiStats,
  roundPetStatInternal,
} from "@/data/moePets";
import {
  getMoePetExpIntoLevelFromTotal,
  getMoePetFreshTotalExpForLevel,
  getMoePetFractionalLevelFromTotalExp,
  getMoePetLevelFromTotalExp,
  getMoePetTotalExpFromLegacyProgress,
} from "@/data/moePetExpTable";
import { getMysteryDragonMaxHpBonus } from "@/data/moePhoenixDragon";

const STORAGE_KEY = "life-rpg-moe-pet-progress";
const DEBUG_SNAPSHOT_KEY = "life-rpg-moe-pet-debug-snapshot";
const JOSEPH_CRYSTALLIZED_KEY = "life-rpg-moe-joseph-crystallized";

/** 新規ペット・リセット時の Lv（MoeFieldMap と揃える） */
export const MOE_SAVED_PET_INITIAL_LEVEL = 10;

/**
 * @typedef {{ totalExp?: number, hp?: number, mp?: number, level?: number, expIntoLevel?: number, rebornPhoenix?: boolean, activeSkillSet?: 1|2 }} MoePetSlot
 * @typedef {{ totalExp: number, hp: number, mp: number }} MoePetDebugSnapshot
 * @typedef {{ activeId: string, byId: Record<string, MoePetSlot>, debugSnapshots?: Record<string, MoePetDebugSnapshot> }} MoePetSaveFile
 */

/** persist 中は Lv100 儀式データを自動復元しない */
let skipDebugRecover = false;
/** ページロードごとに1回だけ localStorage 救済を走らせる */
let moePetSaveRecoveryApplied = false;

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

/** @param {object} pet */
function serializeMoePetSlotFields(pet) {
  const totalExp =
    pet.totalExp != null
      ? Math.max(0, Math.floor(Number(pet.totalExp)))
      : getMoePetTotalExpFromLegacyProgress(
          pet.level ?? MOE_SAVED_PET_INITIAL_LEVEL,
          pet.expIntoLevel ?? 0
        );
  /** @type {MoePetSlot} */
  const slot = {
    totalExp,
    hp: pet.hp,
    mp: pet.mp,
  };
  if (pet.rebornPhoenix) slot.rebornPhoenix = true;
  if (pet.activeSkillSet === 2) slot.activeSkillSet = 2;
  return slot;
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
    if (file.debugSnapshots?.[petId]) continue;
    if (readSessionDebugSnapshots()[petId]) continue;
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
  const levelDisplay = getMoePetFractionalLevelFromTotalExp(totalExp).displayLabel;
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
    levelDisplay,
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
  if (moePetSaveRecoveryApplied) return base;

  moePetSaveRecoveryApplied = true;
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
    levelDisplay: `${MOE_SAVED_PET_INITIAL_LEVEL}.0`,
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
  const levelDisplay = getMoePetFractionalLevelFromTotalExp(totalExp).displayLabel;
  const expIntoLevel = getMoePetExpIntoLevelFromTotal(totalExp, level);
  const stats = calculatePetStats(id, level);
  const rebornPhoenix = !!slot.rebornPhoenix;
  const activeSkillSet = slot.activeSkillSet === 2 ? 2 : 1;
  const phoenixHpBonus = getMysteryDragonMaxHpBonus(level, rebornPhoenix);
  let hpMax = (stats?.hpMax ?? 100) + phoenixHpBonus;
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
    levelDisplay,
    totalExp,
    expIntoLevel,
    hp,
    mp,
    hpMax,
    mpMax,
    rebornPhoenix,
    activeSkillSet,
    phoenixHpBonus,
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
    const byId = {
      ...prev.byId,
      [pet.id]: serializeMoePetSlotFields(pet),
    };
    writeMoePetsSave({ ...prev, activeId: pet.id, byId });
  } finally {
    skipDebugRecover = false;
  }
}

/** 指定ペットスロットだけ保存（activeId は変えない） */
export function persistMoePetSlot(petId, pet) {
  if (!MOE_PET_DATA[petId]) return;
  skipDebugRecover = true;
  try {
    const prev = normalizeMoePetSaveFile(readRawMoePetsSaveJson() ?? {});
    const byId = {
      ...prev.byId,
      [petId]: serializeMoePetSlotFields(pet),
    };
    writeMoePetsSave({ ...prev, byId });
  } finally {
    skipDebugRecover = false;
  }
}

function readJosephCrystallizedPetIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(JOSEPH_CRYSTALLIZED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "string" && MOE_PET_DATA[id]);
  } catch {
    return [];
  }
}

function writeJosephCrystallizedPetIds(ids) {
  if (typeof window === "undefined") return;
  try {
    const unique = [...new Set(ids.filter((id) => MOE_PET_DATA[id]))];
    if (unique.length === 0) {
      sessionStorage.removeItem(JOSEPH_CRYSTALLIZED_KEY);
      return;
    }
    sessionStorage.setItem(JOSEPH_CRYSTALLIZED_KEY, JSON.stringify(unique));
  } catch {
    /* private mode */
  }
}

/** ヨーゼフお試し：釜に渡してクリスタル化したペット（表示のみ · セッション） */
export function loadJosephCrystallizedPetIds() {
  return readJosephCrystallizedPetIds();
}

/** @param {string} petId */
export function addJosephCrystallizedPetId(petId) {
  if (!MOE_PET_DATA[petId]) return;
  const next = [...readJosephCrystallizedPetIds()];
  if (!next.includes(petId)) next.push(petId);
  writeJosephCrystallizedPetIds(next);
}

export function clearJosephCrystallizedPetIds() {
  writeJosephCrystallizedPetIds([]);
}

/** 表示中ペットを即座に byId へ書き込み */
export function flushPersistActivePet(pet) {
  if (!pet?.id) return;
  persistCurrentMoePet(pet);
}

/**
 * 外部バックアップ用 JSON
 * @param {import("@/lib/moeItemBoxStorage").MoeItemBoxItem[]} [itemBoxSlots]
 */
export function buildMoeExternalSavePayload(itemBoxSlots = null) {
  const pets = loadMoePetsSave();
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    pets,
  };
  if (itemBoxSlots) {
    payload.itemBox = itemBoxSlots;
  }
  return payload;
}

/** @param {object} payload */
export function importMoeExternalSavePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("invalid payload");
  }
  if (payload.pets) {
    writeMoePetsSave(normalizeMoePetSaveFile(payload.pets));
  }
  return {
    pets: payload.pets ? normalizeMoePetSaveFile(payload.pets) : null,
    itemBox: Array.isArray(payload.itemBox) ? payload.itemBox : null,
  };
}

export function buildMoeExternalSaveFilename(date = new Date()) {
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 3);
  const rand = Math.random().toString(36).slice(2, 6);
  return `moe-save-${y}-${mo}-${d}-${h}${mi}${s}-${ms}-${rand}.json`;
}

/** @param {FileSystemDirectoryHandle} dir @param {string} fileName */
async function moeDirectoryHasFile(dir, fileName) {
  try {
    await dir.getFileHandle(fileName, { create: false });
    return true;
  } catch (err) {
    if (err?.name === "NotFoundError") return false;
    throw err;
  }
}

/** 既存ファイルは上書きせず、空いている名前を返す */
async function resolveUniqueJsonFilenameInDirectory(dir, preferredName) {
  const safe = preferredName.endsWith(".json")
    ? preferredName
    : `${preferredName}.json`;
  const stem = safe.replace(/\.json$/i, "");
  let candidate = safe;
  for (let i = 0; i < 999; i += 1) {
    if (!(await moeDirectoryHasFile(dir, candidate))) return candidate;
    candidate = `${stem}-${i + 2}.json`;
  }
  return `${stem}-${Date.now()}.json`;
}

/** @returns {boolean} */
export function canUseNativeSaveFilePicker() {
  return typeof window !== "undefined" && "showSaveFilePicker" in window;
}

/** @returns {boolean} */
export function canUseNativeOpenFilePicker() {
  return typeof window !== "undefined" && "showOpenFilePicker" in window;
}

const MOE_FS_IDB = "life-rpg-moe-fs";
const MOE_FS_STORE = "handles";
const MOE_FS_DIR_KEY = "externalSaveDir";
const MOE_FS_LAST_FILE_KEY = "life-rpg-moe-external-save-last-file";
const MOE_FS_LAST_FOLDER_KEY = "life-rpg-moe-external-save-last-folder";

function openMoeFsDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(MOE_FS_IDB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(MOE_FS_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** @returns {Promise<FileSystemDirectoryHandle | null>} */
async function loadMoeExternalSaveDirectoryHandle() {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openMoeFsDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(MOE_FS_STORE, "readonly");
      const req = tx.objectStore(MOE_FS_STORE).get(MOE_FS_DIR_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/** @param {FileSystemDirectoryHandle | null} handle */
async function storeMoeExternalSaveDirectoryHandle(handle) {
  if (typeof indexedDB === "undefined") return;
  const db = await openMoeFsDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(MOE_FS_STORE, "readwrite");
    const store = tx.objectStore(MOE_FS_STORE);
    if (handle) store.put(handle, MOE_FS_DIR_KEY);
    else store.delete(MOE_FS_DIR_KEY);
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
}

/** @param {FileSystemDirectoryHandle} dir */
async function ensureMoeDirectoryWritePermission(dir) {
  const current = await dir.queryPermission({ mode: "readwrite" });
  if (current === "granted") return true;
  const next = await dir.requestPermission({ mode: "readwrite" });
  return next === "granted";
}

/** @param {FileSystemDirectoryHandle} dir @param {string} fileName @param {string} jsonText */
async function writeJsonToDirectory(dir, fileName, jsonText) {
  const fileHandle = await dir.getFileHandle(fileName, { create: true });
  await writeJsonToFileHandle(fileHandle, jsonText);
}

/** @param {FileSystemFileHandle} fileHandle */
async function writeJsonToFileHandle(fileHandle, jsonText) {
  const writable = await fileHandle.createWritable();
  await writable.write(jsonText);
  await writable.close();
}

function rememberMoeExternalSaveLocation(fileName, folderName) {
  if (typeof localStorage === "undefined") return;
  try {
    if (fileName) localStorage.setItem(MOE_FS_LAST_FILE_KEY, fileName);
    if (folderName) localStorage.setItem(MOE_FS_LAST_FOLDER_KEY, folderName);
  } catch {
    /* quota */
  }
}

/** @returns {{ fileName: string | null, folderName: string | null }} */
export function getMoeExternalSaveLocationHint() {
  if (typeof localStorage === "undefined") {
    return { fileName: null, folderName: null };
  }
  try {
    return {
      fileName: localStorage.getItem(MOE_FS_LAST_FILE_KEY),
      folderName: localStorage.getItem(MOE_FS_LAST_FOLDER_KEY),
    };
  } catch {
    return { fileName: null, folderName: null };
  }
}

/** @returns {Promise<string | null>} */
export async function getMoeExternalSaveFolderLabel() {
  const dir = await loadMoeExternalSaveDirectoryHandle();
  return dir?.name ?? getMoeExternalSaveLocationHint().folderName;
}

/**
 * 初回または変更時：保存フォルダを選んで記憶
 * @returns {Promise<{ ok: boolean, aborted?: boolean, folderName?: string, error?: string }>}
 */
export async function pickMoeExternalSaveDirectory() {
  if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
    return { ok: false, error: "unsupported" };
  }
  try {
    /** @type {FileSystemDirectoryHandle} */
    const dir = await window.showDirectoryPicker({
      id: MOE_SAVE_PICKER_ID,
      mode: "readwrite",
      startIn: "documents",
    });
    const granted = await ensureMoeDirectoryWritePermission(dir);
    if (!granted) return { ok: false, error: "permission" };
    await storeMoeExternalSaveDirectoryHandle(dir);
    rememberMoeExternalSaveLocation(null, dir.name);
    return { ok: true, folderName: dir.name };
  } catch (err) {
    if (err?.name === "AbortError") return { ok: false, aborted: true };
    return { ok: false, error: String(err?.message ?? err) };
  }
}

/**
 * 保存先を選んで JSON を書き込む（初回のみフォルダ選択 → 以降は同じフォルダへ）
 * @returns {Promise<{ ok: boolean, aborted?: boolean, fileName?: string, folderName?: string, method?: 'directory' | 'picker' | 'download', error?: string }>}
 */
export async function saveMoeExternalSaveJson(jsonText, filename) {
  if (typeof window === "undefined") return { ok: false, error: "no-window" };

  const suggestedName = filename ?? buildMoeExternalSaveFilename();

  let dir = await loadMoeExternalSaveDirectoryHandle();
  if (dir && !(await ensureMoeDirectoryWritePermission(dir))) {
    dir = null;
  }

  if (!dir && typeof window !== "undefined" && "showDirectoryPicker" in window) {
    const picked = await pickMoeExternalSaveDirectory();
    if (picked.aborted) return { ok: false, aborted: true };
    if (picked.ok) {
      dir = await loadMoeExternalSaveDirectoryHandle();
    }
  }

  if (dir) {
    try {
      const fileName = await resolveUniqueJsonFilenameInDirectory(
        dir,
        suggestedName
      );
      await writeJsonToDirectory(dir, fileName, jsonText);
      rememberMoeExternalSaveLocation(fileName, dir.name);
      return {
        ok: true,
        fileName,
        folderName: dir.name,
        method: "directory",
      };
    } catch {
      await storeMoeExternalSaveDirectoryHandle(null);
    }
  }

  if (canUseNativeSaveFilePicker()) {
    try {
      /** @type {FileSystemFileHandle} */
      const fileHandle = await window.showSaveFilePicker({
        suggestedName,
        startIn: "documents",
        types: [
          {
            description: "MOE セーブ JSON",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      await writeJsonToFileHandle(fileHandle, jsonText);
      rememberMoeExternalSaveLocation(fileHandle.name, null);
      return {
        ok: true,
        fileName: fileHandle.name,
        method: "picker",
      };
    } catch (err) {
      if (err?.name === "AbortError") return { ok: false, aborted: true };
    }
  }

  downloadMoeExternalSaveJson(jsonText, suggestedName);
  rememberMoeExternalSaveLocation(suggestedName, "ダウンロード");
  return {
    ok: true,
    fileName: suggestedName,
    folderName: "ダウンロード",
    method: "download",
  };
}

/**
 * @returns {Promise<{ ok: true, file: File } | { ok: false, aborted?: boolean, error?: string }>}
 */
export async function pickMoeExternalSaveFile() {
  if (canUseNativeOpenFilePicker()) {
    try {
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        startIn: "documents",
        types: [
          {
            description: "MOE セーブ JSON",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const file = await handle.getFile();
      return { ok: true, file };
    } catch (err) {
      if (err?.name === "AbortError") return { ok: false, aborted: true };
    }
  }
  return { ok: false, error: "unsupported" };
}

export function downloadMoeExternalSaveJson(jsonText, filename) {
  if (typeof window === "undefined") return;
  const blob = new Blob([jsonText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? buildMoeExternalSaveFilename();
  a.click();
  URL.revokeObjectURL(url);
}
