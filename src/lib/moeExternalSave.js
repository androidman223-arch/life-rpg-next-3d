/**
 * MOE 外部セーブ — File System Access API / IndexedDB / ダウンロード
 * ペット JSON の組み立ては moePetSave.js
 */

const MOE_FS_IDB = "life-rpg-moe-fs";
const MOE_FS_STORE = "handles";
const MOE_FS_DIR_KEY = "externalSaveDir";
export const MOE_EXTERNAL_SAVE_LAST_FILE_KEY =
  "life-rpg-moe-external-save-last-file";
export const MOE_EXTERNAL_SAVE_LAST_FOLDER_KEY =
  "life-rpg-moe-external-save-last-folder";
const MOE_SAVE_PICKER_ID = "life-rpg-moe-external-save-dir";

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

/** @returns {boolean} */
export function canUseNativeSaveFilePicker() {
  return typeof window !== "undefined" && "showSaveFilePicker" in window;
}

/** @returns {boolean} */
export function canUseMoeExternalSaveDirectoryPicker() {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

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
    if (fileName) localStorage.setItem(MOE_EXTERNAL_SAVE_LAST_FILE_KEY, fileName);
    if (folderName) {
      localStorage.setItem(MOE_EXTERNAL_SAVE_LAST_FOLDER_KEY, folderName);
    }
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
      fileName: localStorage.getItem(MOE_EXTERNAL_SAVE_LAST_FILE_KEY),
      folderName: localStorage.getItem(MOE_EXTERNAL_SAVE_LAST_FOLDER_KEY),
    };
  } catch {
    return { fileName: null, folderName: null };
  }
}

/** @returns {Promise<string | null>} */
export async function resolveMoeExternalSaveFolderLabel() {
  const dir = await loadMoeExternalSaveDirectoryHandle();
  return dir?.name ?? getMoeExternalSaveLocationHint().folderName;
}

/** @returns {Promise<{ ok: boolean, aborted?: boolean, folderName?: string, error?: string }>} */
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

/** @returns {Promise<{ ok: boolean, aborted?: boolean, fileName?: string, folderName?: string, method?: 'directory' | 'picker' | 'download', error?: string }>} */
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
