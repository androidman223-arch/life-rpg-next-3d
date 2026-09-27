/**
 * MOE フローティングパネル — クリックで手前（z-index スタック）
 *
 * panelId は storageKey（localStorage）と揃えるとよい（縦/横スキル等）。
 * 例外: battle-log / duel-time-bar は stack id のみ（layout は別キー）。
 * ミニマップは stack id（minimap-3d/2d）と pos storage（MOE_MINIMAP_POS_*）が別。
 * ドッキング用 id は moePanelDock.js と同値（battle-log / minimap-3d）。
 */

/** バトルログ・全体マップなどのベース */
export const MOE_PANEL_STACK_BASE_Z = 45;

/** HP窓・モーダル手前まで（モーダルは 60+） */
export const MOE_PANEL_STACK_MAX_Z = 59;

/** 支援ターゲット選択中 HP 窓の最低 z-index */
export const MOE_PANEL_ALLY_SELECTED_MIN_Z = 58;

/** ドラッグヘッダーの共通プレフィックス */
export const MOE_FLOATING_DRAG_TITLE_PREFIX = "クリックで手前 · ";

/** @see moePanelDock.js MOE_DOCK_PANEL_BATTLE_LOG */
export const MOE_PANEL_ID_BATTLE_LOG = "battle-log";

/** @see moePanelDock.js MOE_DOCK_PANEL_MINIMAP_3D */
export const MOE_PANEL_ID_MINIMAP_3D = "minimap-3d";

export const MOE_PANEL_ID_MINIMAP_2D = "minimap-2d";
export const MOE_PANEL_ID_DUEL_TIME_BAR = "duel-time-bar";
export const MOE_PANEL_ID_ITEM_BOX = "life-rpg-moe-item-box-pos";
export const MOE_PANEL_ID_PET_SIDE = "life-rpg-moe-pet-side-panel-pos";
export const MOE_PANEL_ID_PET_HP = "life-rpg-moe-pet-hp-window-pos";
export const MOE_PANEL_ID_PLAYER_HP = "life-rpg-moe-player-hp-window-pos";
export const MOE_PANEL_ID_ENEMY_STAT_SEARCH =
  "life-rpg-moe-enemy-stat-search-pos";
export const MOE_PANEL_ID_MERGED_ICON_BAR_A =
  "life-rpg-moe-merged-icon-bar-a";
export const MOE_PANEL_ID_MERGED_ICON_BAR_B =
  "life-rpg-moe-merged-icon-bar-b";
export const MOE_PANEL_ID_PHOENIX_TRAINING_ICON_BAR =
  "life-rpg-moe-phoenix-training-icon-bar";
export const MOE_PANEL_ID_DRAGON_TRAINING_ICON_BAR =
  "life-rpg-moe-dragon-training-icon-bar";
export const MOE_PANEL_ID_MERGED_SKILL_PANEL_A =
  "life-rpg-moe-merged-skill-panel-a";
export const MOE_PANEL_ID_MERGED_SKILL_PANEL_B =
  "life-rpg-moe-merged-skill-panel-b";
export const MOE_PANEL_ID_PHOENIX_TRAINING_SKILL_PANEL =
  "life-rpg-moe-phoenix-training-skill-panel";
export const MOE_PANEL_ID_DRAGON_TRAINING_SKILL_PANEL =
  "life-rpg-moe-dragon-training-skill-panel";
export const MOE_PANEL_ID_TARGET_WINDOW = "life-rpg-moe-target-window-pos";
/** 単体スキルバー（フィールド外でも storageKey = panelId） */
export const MOE_PANEL_ID_PET_SKILL_ICON_BAR =
  "life-rpg-moe-skill-icon-bar-pos";
export const MOE_PANEL_ID_PLAYER_SKILL_ICON_BAR =
  "life-rpg-moe-player-skill-icon-bar-pos";
export const MOE_PANEL_ID_FIELD_SETTINGS = "life-rpg-moe-field-settings-pos";

/** ミニマップ位置 storage（stack id は MINIMAP_3D / 2D — 2D/3D で別キー） */
export const MOE_MINIMAP_POS_STORAGE_3D = "life-rpg-moe-minimap-pos-3d";
export const MOE_MINIMAP_POS_STORAGE_2D = "life-rpg-moe-minimap-pos-2d";

/**
 * stack id と位置 storage が別キーのペア
 * @type {Readonly<Record<string, string>>}
 */
export const MOE_PANEL_STACK_POS_STORAGE = Object.freeze({
  [MOE_PANEL_ID_MINIMAP_3D]: MOE_MINIMAP_POS_STORAGE_3D,
  [MOE_PANEL_ID_MINIMAP_2D]: MOE_MINIMAP_POS_STORAGE_2D,
});

/**
 * ドラッグ位置 localStorage キー（= panelId と同値）
 * @type {readonly string[]}
 */
export const MOE_PANEL_DRAG_POS_KEYS = Object.freeze([
  MOE_PANEL_ID_ITEM_BOX,
  MOE_PANEL_ID_PET_SIDE,
  MOE_PANEL_ID_PET_HP,
  MOE_PANEL_ID_PLAYER_HP,
  MOE_PANEL_ID_ENEMY_STAT_SEARCH,
  MOE_PANEL_ID_MERGED_ICON_BAR_A,
  MOE_PANEL_ID_MERGED_ICON_BAR_B,
  MOE_PANEL_ID_PHOENIX_TRAINING_ICON_BAR,
  MOE_PANEL_ID_DRAGON_TRAINING_ICON_BAR,
  MOE_PANEL_ID_MERGED_SKILL_PANEL_A,
  MOE_PANEL_ID_MERGED_SKILL_PANEL_B,
  MOE_PANEL_ID_PHOENIX_TRAINING_SKILL_PANEL,
  MOE_PANEL_ID_DRAGON_TRAINING_SKILL_PANEL,
  MOE_PANEL_ID_TARGET_WINDOW,
  MOE_PANEL_ID_PET_SKILL_ICON_BAR,
  MOE_PANEL_ID_PLAYER_SKILL_ICON_BAR,
  MOE_PANEL_ID_FIELD_SETTINGS,
]);

/** 位置 storage 監査用（drag pos + ミニマップ pos） */
export const MOE_ALL_FLOATING_PANEL_POS_KEYS = Object.freeze([
  ...MOE_PANEL_DRAG_POS_KEYS,
  MOE_MINIMAP_POS_STORAGE_3D,
  MOE_MINIMAP_POS_STORAGE_2D,
]);

/** スタック外の固定オーバーレイ z-index（MoeFieldMap のトースト等） */
export const MOE_FIXED_OVERLAY_Z = Object.freeze({
  combatFloat: 48,
  banner: 51,
  toast: 54,
  modalBackdrop: 58,
});

/**
 * 初期の重なり順（小＝奥 · クリックで前面化）
 * @type {Record<string, number>}
 */
export const MOE_PANEL_DEFAULT_ORDERS = {
  [MOE_PANEL_ID_BATTLE_LOG]: 0,
  [MOE_PANEL_ID_MINIMAP_3D]: 1,
  [MOE_PANEL_ID_MINIMAP_2D]: 1,
  [MOE_PANEL_ID_MERGED_ICON_BAR_A]: 2,
  [MOE_PANEL_ID_MERGED_ICON_BAR_B]: 3,
  [MOE_PANEL_ID_PHOENIX_TRAINING_ICON_BAR]: 4,
  [MOE_PANEL_ID_DRAGON_TRAINING_ICON_BAR]: 5,
  [MOE_PANEL_ID_MERGED_SKILL_PANEL_A]: 6,
  [MOE_PANEL_ID_MERGED_SKILL_PANEL_B]: 7,
  [MOE_PANEL_ID_PHOENIX_TRAINING_SKILL_PANEL]: 8,
  [MOE_PANEL_ID_DRAGON_TRAINING_SKILL_PANEL]: 9,
  [MOE_PANEL_ID_ITEM_BOX]: 10,
  [MOE_PANEL_ID_PET_SIDE]: 11,
  [MOE_PANEL_ID_DUEL_TIME_BAR]: 12,
  [MOE_PANEL_ID_PET_HP]: 13,
  [MOE_PANEL_ID_PLAYER_HP]: 14,
  [MOE_PANEL_ID_ENEMY_STAT_SEARCH]: 15,
  [MOE_PANEL_ID_TARGET_WINDOW]: 16,
  [MOE_PANEL_ID_PET_SKILL_ICON_BAR]: 17,
  [MOE_PANEL_ID_PLAYER_SKILL_ICON_BAR]: 18,
  [MOE_PANEL_ID_FIELD_SETTINGS]: 19,
};

/** @type {readonly string[]} */
export const MOE_PANEL_STACK_ID_LIST = Object.freeze(
  Object.keys(MOE_PANEL_DEFAULT_ORDERS)
);

/**
 * @param {string} suffix ドラッグ説明（「ドラッグで移動」など）
 */
export function moeFloatingDragTitle(suffix) {
  if (!suffix) return MOE_FLOATING_DRAG_TITLE_PREFIX.trim();
  if (suffix.startsWith("クリックで手前")) return suffix;
  return `${MOE_FLOATING_DRAG_TITLE_PREFIX}${suffix}`;
}

/**
 * @param {Record<string, number>} stack
 */
export function moePanelStackSize(stack) {
  const ids = new Set([
    ...Object.keys(MOE_PANEL_DEFAULT_ORDERS),
    ...Object.keys(stack),
  ]);
  return Math.max(1, ids.size);
}

/**
 * @param {number} order
 * @param {number} [stackSize]
 */
export function moePanelStackZIndex(order, stackSize = 1) {
  const span = MOE_PANEL_STACK_MAX_Z - MOE_PANEL_STACK_BASE_Z;
  const safeOrder = Math.max(0, order);
  if (stackSize <= 1) {
    return MOE_PANEL_STACK_BASE_Z + Math.min(safeOrder, span);
  }
  const scaled = Math.round((safeOrder / (stackSize - 1)) * span);
  return MOE_PANEL_STACK_BASE_Z + scaled;
}

/**
 * @param {Record<string, number>} stack
 * @param {string} panelId
 */
export function bringMoePanelToFront(stack, panelId) {
  if (!panelId) return stack;
  const ids = new Set([
    ...Object.keys(MOE_PANEL_DEFAULT_ORDERS),
    ...Object.keys(stack),
    panelId,
  ]);
  const sorted = [...ids]
    .filter((id) => id !== panelId)
    .sort(
      (a, b) => moePanelStackOrder(stack, a) - moePanelStackOrder(stack, b)
    );
  const reordered = [...sorted, panelId];
  const next = {};
  reordered.forEach((id, i) => {
    next[id] = i;
  });
  return next;
}

/**
 * @param {Record<string, number>} stack
 * @param {string} panelId
 */
export function moePanelStackOrder(stack, panelId) {
  return stack[panelId] ?? MOE_PANEL_DEFAULT_ORDERS[panelId] ?? 0;
}

/**
 * @param {Record<string, number>} stack
 * @param {string} panelId
 */
export function moePanelResolvedZIndex(stack, panelId) {
  const size = moePanelStackSize(stack);
  const order = moePanelStackOrder(stack, panelId);
  return moePanelStackZIndex(order, size);
}
