/** MOEフィールドへ行くボタン押下 → BGM 開始（ユーザー操作直後） */
export const MOE_FIELD_BGM_EVENT = "life-rpg-moe-field-bgm-start";

export function isMoeFieldPath(pathname) {
  return pathname === "/moe" || pathname === "/moe/3d";
}

export function requestMoeFieldBgm() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MOE_FIELD_BGM_EVENT));
}
