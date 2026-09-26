/**
 * MOE 縦スキルパネル — 幅・ボタン高さ（storageKey ごと）
 */

export const MOE_VERTICAL_SKILL_DEFAULT_WIDTH = 82;
export const MOE_VERTICAL_SKILL_MIN_WIDTH = 56;
export const MOE_VERTICAL_SKILL_MAX_WIDTH = 148;

export const MOE_VERTICAL_SKILL_DEFAULT_SLOT_HEIGHT = 20;
export const MOE_VERTICAL_SKILL_MIN_SLOT_HEIGHT = 12;
export const MOE_VERTICAL_SKILL_MAX_SLOT_HEIGHT = 48;

/** 縦スキルボタン内ラベル — ボタン高さに合わせて最大化 */
export function moeVerticalSkillLabelFontPx(slotHeight, hasSubLabel = false) {
  const h = Math.max(MOE_VERTICAL_SKILL_MIN_SLOT_HEIGHT, slotHeight);
  if (hasSubLabel) {
    return Math.max(8, Math.min(12, Math.round(h * 0.46)));
  }
  return Math.max(10, Math.min(32, Math.round(h * 0.82)));
}

/** @returns {{ width: number, slotHeight: number }} */
export function moeVerticalSkillDefaultLayout() {
  return {
    width: MOE_VERTICAL_SKILL_DEFAULT_WIDTH,
    slotHeight: MOE_VERTICAL_SKILL_DEFAULT_SLOT_HEIGHT,
  };
}

/** @param {{ width: number, slotHeight: number }} layout */
export function clampMoeVerticalSkillPanelLayout(layout) {
  const width = Math.max(
    MOE_VERTICAL_SKILL_MIN_WIDTH,
    Math.min(MOE_VERTICAL_SKILL_MAX_WIDTH, layout.width)
  );
  const slotHeight = Math.max(
    MOE_VERTICAL_SKILL_MIN_SLOT_HEIGHT,
    Math.min(MOE_VERTICAL_SKILL_MAX_SLOT_HEIGHT, layout.slotHeight)
  );
  return { width, slotHeight };
}

function layoutStorageKey(storageKey) {
  return `${storageKey}-layout`;
}

/** @param {string} storageKey */
export function loadMoeVerticalSkillPanelLayout(storageKey) {
  if (typeof window === "undefined" || !storageKey) return null;
  try {
    const raw = localStorage.getItem(layoutStorageKey(storageKey));
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.width === "number" && typeof p?.slotHeight === "number") {
      return clampMoeVerticalSkillPanelLayout(p);
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * 初回表示用 — 自分の保存がなければ inheritFromKeys の先頭からコピー
 * @param {string} storageKey
 * @param {string[]} [inheritFromKeys]
 */
export function loadMoeVerticalSkillPanelInitialLayout(
  storageKey,
  inheritFromKeys = []
) {
  const own = loadMoeVerticalSkillPanelLayout(storageKey);
  if (own) return own;
  for (const key of inheritFromKeys) {
    const inherited = loadMoeVerticalSkillPanelLayout(key);
    if (inherited) return inherited;
  }
  return moeVerticalSkillDefaultLayout();
}

/** @param {string} storageKey @param {{ width: number, slotHeight: number }} layout */
export function saveMoeVerticalSkillPanelLayout(storageKey, layout) {
  if (typeof window === "undefined" || !storageKey) return;
  try {
    localStorage.setItem(
      layoutStorageKey(storageKey),
      JSON.stringify(clampMoeVerticalSkillPanelLayout(layout))
    );
  } catch {
    /* quota */
  }
}
