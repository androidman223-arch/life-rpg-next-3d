const STORAGE_KEY = "life-rpg-game-status";
/** メイン画面の「セーブ」で書き込むバックアップ（ロードで復元） */
const BACKUP_STORAGE_KEY = "life-rpg-game-status-backup";

/** 新規・リセット時の訓練士ステータス（ローカルに未保存のときもこれ） */
export const DEFAULT_GAME_STATUS = {
  level: 1,
  job: "勇者",
  exp: 0,
  nextExp: 1000,
};

export function loadGameStatus() {
  if (typeof window === "undefined") return { ...DEFAULT_GAME_STATUS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_GAME_STATUS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_GAME_STATUS, ...parsed };
  } catch {
    return { ...DEFAULT_GAME_STATUS };
  }
}

export function saveGameStatus(status) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  } catch {
    /* ignore quota / private mode */
  }
}

/** 経験値だけ加算（通常フィールドのスライム討伐など） */
export function addGameExp(amount) {
  const current = loadGameStatus();
  const next = { ...current, exp: current.exp + amount };
  saveGameStatus(next);
  return next;
}

export function hasGameStatusBackup() {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(BACKUP_STORAGE_KEY));
  } catch {
    return false;
  }
}

/** 現在の保存データをバックアップにコピー */
export function backupGameStatusToSlot() {
  if (typeof window === "undefined") return false;
  try {
    const current = loadGameStatus();
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(current));
    return true;
  } catch {
    return false;
  }
}

export function loadGameStatusBackup() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_GAME_STATUS, ...parsed };
  } catch {
    return null;
  }
}

/** バックアップの内容を本番スロットに上書き */
export function restoreGameStatusFromBackup() {
  const b = loadGameStatusBackup();
  if (!b) return null;
  saveGameStatus(b);
  return b;
}

/** レベル・ジョブ・経験値を初期値に戻して保存 */
export function resetGameStatusToDefault() {
  const next = { ...DEFAULT_GAME_STATUS };
  saveGameStatus(next);
  return next;
}
