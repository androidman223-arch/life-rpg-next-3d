/**
 * コンデンスマインド — 純粋ルール（依存なし・スモークテスト対象）
 *
 * プレイヤー技: MP消費のみ。MP残量%による使用制限はない。
 * ペットのマナ増幅法は別（moeAtrumPetSkills）— MP5割以下。
 */

/** Wiki 公式34の半分（プレイヤー技の調整値） */
export const PLAYER_CONDENSE_MIND_MP_COST = 17;

/** @param {{ mp?: number }} casterVitals */
export function canUsePlayerCondenseMind(casterVitals) {
  const casterMp = casterVitals.mp ?? 0;
  if (casterMp < PLAYER_CONDENSE_MIND_MP_COST) {
    return { ok: false, reason: "not_enough_mp" };
  }
  return { ok: true };
}
