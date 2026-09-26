/**
 * ペット敵 LV 育成表 — 純粋ロジック（smoke / UI 共通）
 */

export const MOE_PET_TRAINING_GUIDE_HOUSE = {
  houseEmoji: "🏠",
  mapIcon: "🏠",
  houseLabel: "AGE拠点の家",
  buttonLabel: "ペット敵LV育成表を見る",
  panelTitle: "ペット敵 LV 育成表",
  panelSubtitle: "マップごとのフィールド敵 · 公式 Lv（追加時自動更新）",
  restAreaLabel: "ユグ海岸 · AGE拠点の家",
  restAreaNote: "焚き火で休息 · 育成表はここで確認",
  bgmNote: "BGM：散策（休息向け · bgm-royalty-free-field.mp3）",
};

/** @param {number} level */
export function moePetTrainingLevelLabel(level) {
  const n = Number(level);
  if (!Number.isFinite(n)) return "Lv?";
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? `Lv${rounded}` : `Lv${rounded.toFixed(1)}`;
}

/**
 * @typedef {{ mapSlotId: string, areaJa: string, enemies: { key: string, name: string, level: number, levelLabel: string, emoji: string }[], empty?: boolean }} MoePetTrainingMapSection
 */

/**
 * @param {{
 *   key: string,
 *   name?: string,
 *   moeName?: string,
 *   level: number,
 *   mapSlotId: string,
 *   emoji?: string,
 * }[]} entries
 * @param {{ id: string, nameJa: string }[]} mapSlots
 * @param {{ includeEmptyAgeSections?: boolean, ageMapSlotIds?: Set<string> | string[] }} [opts]
 * @returns {MoePetTrainingMapSection[]}
 */
export function moePetTrainingGuideSectionsFromEntries(entries, mapSlots, opts = {}) {
  const mapOrder = mapSlots.map((s) => s.id);
  const mapNames = Object.fromEntries(mapSlots.map((s) => [s.id, s.nameJa]));
  const ageIds = opts.ageMapSlotIds
    ? new Set(opts.ageMapSlotIds)
    : null;
  /** @type {Map<string, object[]>} */
  const byMap = new Map();

  for (const entry of entries) {
    if (!entry.mapSlotId || entry.level == null) continue;
    const row = {
      key: entry.key,
      name: entry.moeName ?? entry.name,
      level: entry.level,
      levelLabel: moePetTrainingLevelLabel(entry.level),
      emoji: entry.emoji ?? "⚔",
    };
    const list = byMap.get(entry.mapSlotId) ?? [];
    list.push(row);
    byMap.set(entry.mapSlotId, list);
  }

  /** @type {MoePetTrainingMapSection[]} */
  const sections = [];
  const pushSection = (mapSlotId, forceEmpty = false) => {
    const enemies = byMap.get(mapSlotId) ?? [];
    if (!forceEmpty && !enemies.length) return;
    sections.push({
      mapSlotId,
      areaJa: mapNames[mapSlotId] ?? mapSlotId,
      enemies: [...enemies].sort((a, b) => a.level - b.level),
      empty: forceEmpty && !enemies.length,
    });
  };

  for (const mapSlotId of mapOrder) {
    if (opts.includeEmptyAgeSections && ageIds?.has(mapSlotId)) {
      pushSection(mapSlotId, true);
    } else {
      pushSection(mapSlotId);
    }
  }
  for (const mapSlotId of byMap.keys()) {
    if (!mapOrder.includes(mapSlotId)) pushSection(mapSlotId);
  }

  return sections;
}
