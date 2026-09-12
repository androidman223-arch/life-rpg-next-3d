/**
 * MOE フィールド — 開発時インバリアントチェック
 *
 * ゲームループから定期的に呼び、状態の矛盾を早期発見する。
 */

import { moeDevWarn } from "./moeDevAssert.js";

/**
 * @param {{
 *   allyTarget?: 'player' | 'pet',
 *   allyTargetRef?: { current?: 'player' | 'pet' },
 *   condenseMindActive?: boolean,
 *   allyTargetMode?: 'player' | 'pet',
 *   playerCondenseMindRef?: { current?: { until: number } | null },
 *   atrumMpRegenRef?: { current?: { until: number } | null },
 * }} snap
 * @returns {string[]} issue messages (empty = OK)
 */
export function collectMoeFieldInvariantIssues(snap) {
  const issues = [];

  if (
    snap.allyTarget != null &&
    snap.allyTargetRef?.current != null &&
    snap.allyTarget !== snap.allyTargetRef.current
  ) {
    issues.push(
      `allyTarget state/ref mismatch: state=${snap.allyTarget} ref=${snap.allyTargetRef.current}`
    );
  }

  const ally = snap.allyTarget ?? snap.allyTargetRef?.current;
  const now = Date.now();

  if (snap.condenseMindActive) {
    if (ally === "player") {
      const buff = snap.playerCondenseMindRef?.current;
      if (!buff || buff.until <= now) {
        issues.push(
          "condenseMindActive=true but playerCondenseMindRef is missing or expired"
        );
      }
    } else if (ally === "pet") {
      const buff = snap.atrumMpRegenRef?.current;
      if (!buff || buff.until <= now) {
        issues.push(
          "condenseMindActive=true but atrumMpRegenRef is missing or expired"
        );
      }
    }
  }

  if (ally !== "player" && ally !== "pet" && ally != null) {
    issues.push(`invalid allyTarget: ${String(ally)}`);
  }

  return issues;
}

/**
 * @param {ReturnType<typeof collectMoeFieldInvariantIssues>} issues
 */
export function reportMoeFieldInvariantIssues(issues) {
  if (!issues.length) return;
  for (const msg of issues) {
    moeDevWarn(`invariant: ${msg}`);
  }
}
