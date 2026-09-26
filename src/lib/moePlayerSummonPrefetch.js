/**
 * プレイヤー召喚 GLB の先読み（HTTP キャッシュ）
 * MoeFieldPrefetchBoot から起動。
 */

import { MOE_PLAYER_SUMMON_MODELS } from "../data/moePlayerSummonModels.js";

let started = false;

/** ブラウザキャッシュへ GLB を先読み（失敗は無視） */
export function prefetchMoePlayerSummonModels() {
  if (typeof window === "undefined" || started) return;
  started = true;
  for (const entry of Object.values(MOE_PLAYER_SUMMON_MODELS)) {
    if (!entry?.url) continue;
    fetch(entry.url, { cache: "force-cache" }).catch(() => {});
  }
}

/**
 * 3D VFX ref 用の次リクエスト（seq で再発火）
 * @param {{ skillId: string, seq: number } | null | undefined} prev
 * @param {string} skillId
 */
export function nextMoePlayerSummonFxRequest(prev, skillId) {
  return {
    skillId,
    seq: (prev?.seq ?? 0) + 1,
  };
}
