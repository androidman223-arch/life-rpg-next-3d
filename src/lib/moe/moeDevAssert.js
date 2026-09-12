/**
 * MOE — 開発時のみのアサーション
 * 本番ビルドでは no-op（ログも出さない）
 */

const IS_DEV =
  typeof process !== "undefined" &&
  process.env?.NODE_ENV !== "production";

/**
 * @param {boolean} condition
 * @param {string} message
 * @param {object} [context]
 */
export function moeDevAssert(condition, message, context) {
  if (!IS_DEV || condition) return;
  console.error(`[MOE assert] ${message}`, context ?? "");
}

/**
 * @param {string} message
 * @param {object} [context]
 */
export function moeDevWarn(message, context) {
  if (!IS_DEV) return;
  console.warn(`[MOE] ${message}`, context ?? "");
}

export function isMoeDevMode() {
  return IS_DEV;
}
