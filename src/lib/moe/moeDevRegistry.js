/**
 * MOE — 開発時デバッグレジストリ
 *
 * ブラウザコンソール: window.__MOE_DEV__
 *   __MOE_DEV__.snapshot()  — 直近のフィールド状態
 *   __MOE_DEV__.guide()       — サブシステム一覧
 *   __MOE_DEV__.storage()     — localStorage 監査
 *   __MOE_DEV__.fieldNonActive() — ノンアクティブ敵 key 一覧
 */

import { listMoeEnemyFieldNonActiveKeys } from "@/lib/moeEnemyFieldActive";
import { auditMoeLocalStorage } from "@/lib/moe/moeStorageRegistry";
import { printMoeSubsystemGuide, MOE_SUBSYSTEMS } from "@/lib/moe/moeSubsystemGuide";
import { collectMoeFieldInvariantIssues } from "@/lib/moe/moeFieldInvariants";
import { isMoeDevMode } from "@/lib/moe/moeDevAssert";
import {
  loadPlayerSkill2TalismanActive,
  resolvePlayerSkill2ExpProcRate,
  savePlayerSkill2TalismanActive,
} from "@/lib/moePlayerSkill2Talisman";

let latestSnapshot = null;
let installed = false;

/**
 * @param {object} snap
 */
export function updateMoeDevSnapshot(snap) {
  if (!isMoeDevMode()) return;
  latestSnapshot = { ...snap, _at: Date.now() };
}

export function getMoeDevSnapshot() {
  return latestSnapshot;
}

export function installMoeDevRegistry() {
  if (!isMoeDevMode() || typeof window === "undefined" || installed) return;
  installed = true;

  window.__MOE_DEV__ = {
    subsystems: MOE_SUBSYSTEMS,
    snapshot: () => latestSnapshot,
    invariants: () =>
      latestSnapshot
        ? collectMoeFieldInvariantIssues(latestSnapshot)
        : ["no snapshot yet"],
    guide: printMoeSubsystemGuide,
    storage: auditMoeLocalStorage,
    fieldNonActive: listMoeEnemyFieldNonActiveKeys,
    skill2Talisman: (on) => {
      savePlayerSkill2TalismanActive(Boolean(on));
      const active = loadPlayerSkill2TalismanActive();
      const rate = resolvePlayerSkill2ExpProcRate(active);
      console.info(
        `[MOE] スキルアップの御札: ${active ? "ON" : "OFF"} · 技②EXP率 ${Math.round(rate * 100)}%`
      );
      return { active, procRate: rate };
    },
  };

  console.info(
    "[MOE] Dev registry installed. Try: __MOE_DEV__.guide() / __MOE_DEV__.fieldNonActive() / __MOE_DEV__.snapshot()"
  );
}
