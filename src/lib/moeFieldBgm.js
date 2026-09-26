/**
 * MOE フィールド — BGM イベント（AmbientBgm が再生）
 */

export {
  MOE_BGM_FADE_MS,
  MOE_BGM_REST_STOP_MS,
  MOE_BGM_TRACK,
  MOE_FIELD_COMBAT_BGM,
  MOE_FIELD_ZONE_BGM,
  moeFieldBgmTrackForMapSlot,
} from "./moeFieldBgmMap.js";

/** MOEフィールドへ行くボタン押下 → ユーザー操作直後の再生アンロック */
export const MOE_FIELD_BGM_EVENT = "life-rpg-moe-field-bgm-start";

export const MOE_FIELD_BGM_ZONE_EVENT = "life-rpg-moe-field-bgm-zone";
export const MOE_FIELD_BGM_COMBAT_EVENT = "life-rpg-moe-field-bgm-combat";
export const MOE_FIELD_BGM_REST_EVENT = "life-rpg-moe-field-bgm-rest";

export function isMoeFieldPath(pathname) {
  return pathname === "/moe" || pathname === "/moe/3d";
}

export function requestMoeFieldBgm() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MOE_FIELD_BGM_EVENT));
}

/** @param {string} mapSlotId */
export function requestMoeFieldZoneBgm(mapSlotId) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(MOE_FIELD_BGM_ZONE_EVENT, {
      detail: { mapSlotId },
    })
  );
}

/** @param {boolean} active */
export function requestMoeFieldCombatBgm(active) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(MOE_FIELD_BGM_COMBAT_EVENT, {
      detail: { active: Boolean(active) },
    })
  );
}

/** 焚き火休息 — BGM をフェードアウト／復帰 */
export function requestMoeFieldBgmRest(active) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(MOE_FIELD_BGM_REST_EVENT, {
      detail: { active: Boolean(active) },
    })
  );
}
