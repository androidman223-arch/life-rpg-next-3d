/**
 * MOE アルター / ワープ先定義
 * 転送先は必ず「そのマップのアルターそば（アルター側）」に出現する。
 *
 * 開発中 — どのアルターからも全フィールドへ転送可。
 * 通常は歩いて行けない／アルター転送専用の場所は nameJa に（本来通行不可）を付ける。
 */

import { MOE_3D_WORLD_MAP_REGISTRY } from "@/lib/moe3dWorldLayout";

/**
 * @typedef {{
 *   id: string,
 *   nameJa: string,
 *   altarTx: number,
 *   altarTz: number,
 *   spawnOffTx?: number,
 *   spawnOffTz?: number,
 *   anchor?: "player_start",
 *   altarOffX?: number,
 *   altarOffZ?: number,
 *   spawnOffX?: number,
 *   spawnOffZ?: number,
 *   kind: "hub" | "portal" | "warp",
 *   interactRadius?: number,
 * }} MoeMapAltarLayout
 */

/** 位置を個別指定するマップ（未指定はタイル中央 0.5,0.5 にフォールバック） */
/** @type {Record<string, MoeMapAltarLayout>} */
export const MOE_MAP_ALTAR_LAYOUTS = {
  bisk: {
    id: "bisk_central",
    nameJa: "城下町ビスク · 中央アルター",
    altarTx: 0.5,
    altarTz: 0.46,
    spawnOffTx: 0,
    spawnOffTz: 0.08,
    kind: "hub",
    interactRadius: 7.5,
  },
  mainland_connector: {
    id: "legacy_portal",
    nameJa: "試作区 · アルター",
    altarTx: 0.78,
    altarTz: 0.5,
    spawnOffTx: -0.08,
    spawnOffTz: 0,
    kind: "portal",
    interactRadius: 6.5,
  },
  legacy_prototype: {
    id: "legacy_west",
    nameJa: "試作マップ · アルター",
    altarTx: 0.5,
    altarTz: 0.22,
    spawnOffTx: 0,
    spawnOffTz: 0.14,
    kind: "portal",
    interactRadius: 6.5,
  },
  ips_canyon: {
    id: "altar_ips_canyon",
    nameJa: "イプス峡谷 · アルター",
    altarTx: 0.5,
    altarTz: 0.52,
    spawnOffTx: 0,
    spawnOffTz: 0.1,
    kind: "portal",
    interactRadius: 6.5,
  },
  hatiil_desert: {
    id: "altar_hatiil_desert",
    nameJa: "ハティル砂漠 · アルター",
    altarTx: 0.5,
    altarTz: 0.5,
    spawnOffTx: 0,
    spawnOffTz: 0.08,
    kind: "portal",
    interactRadius: 7,
  },
  sulfur_mine: {
    id: "altar_sulfur_mine",
    nameJa: "スルト鉱山 · アルター",
    altarTx: 0.052,
    altarTz: 0.948,
    spawnOffTx: 0.013,
    spawnOffTz: -0.006,
    kind: "warp",
    interactRadius: 7,
  },
  sulfur_kazan_temple: {
    id: "altar_sulfur_kazan_temple",
    nameJa: "【新】スルト鉱山 · 火山神殿",
    altarTx: 0.5,
    altarTz: 0.14,
    spawnOffTx: 0,
    spawnOffTz: 0.38,
    kind: "warp",
    interactRadius: 7,
  },
  elvin_keikoku: {
    id: "altar_elvin_keikoku",
    nameJa: "【新】エルビン渓谷",
    altarTx: 0.5,
    altarTz: 0.14,
    spawnOffTx: 0,
    spawnOffTz: 0.38,
    kind: "warp",
    interactRadius: 7,
  },
  elan_palace: {
    id: "altar_elan_palace",
    nameJa: "エルアン宮殿 · アルター",
    altarTx: 0.052,
    altarTz: 0.948,
    spawnOffTx: 0.013,
    spawnOffTz: -0.006,
    kind: "warp",
    interactRadius: 7,
  },
  yug_coast: {
    id: "altar_yug_coast",
    nameJa: "ユグ海岸 · アルター",
    altarTx: 0.5,
    altarTz: 0.5,
    spawnOffTx: 0,
    spawnOffTz: 0.08,
    kind: "warp",
    interactRadius: 7,
  },
  soles_valley: {
    id: "altar_soles_valley",
    nameJa: "ソレス渓谷 · アルター",
    altarTx: 0.5,
    altarTz: 0.46,
    spawnOffTx: 0,
    spawnOffTz: 0.14,
    kind: "warp",
    interactRadius: 7,
  },
  mitoya_great_tree: {
    id: "altar_mitoya_great_tree",
    nameJa: "ミトヤの大樹 · アルター",
    altarTx: 0.58,
    altarTz: 0.5,
    spawnOffTx: 0,
    spawnOffTz: 0.1,
    kind: "warp",
    interactRadius: 7,
  },
  geo_abyss_ne: {
    id: "altar_geo_abyss_ne",
    nameJa: "ゲオの深淵（北東） · アルター",
    altarTx: 0.5,
    altarTz: 0.66,
    spawnOffTx: 0,
    spawnOffTz: 0.08,
    kind: "warp",
    interactRadius: 7,
  },
  geo_abyss_s: {
    id: "altar_geo_abyss_s",
    nameJa: "ゲオの深淵（南） · アルター",
    altarTx: 0.5,
    altarTz: 0.66,
    spawnOffTx: 0,
    spawnOffTz: 0.08,
    kind: "warp",
    interactRadius: 7,
  },
  geo_abyss_w: {
    id: "altar_geo_abyss_w",
    nameJa: "ゲオの深淵（西） · アルター",
    altarTx: 0.5,
    altarTz: 0.66,
    spawnOffTx: 0,
    spawnOffTz: 0.08,
    kind: "warp",
    interactRadius: 7,
  },
};

/** ビスク中央アルターから選べないスロット */
const WARP_DEST_SKIP = new Set(["bisk", "mainland_connector", "legacy_buffer"]);

/** 歩行で通常到達できる扱い — （本来通行不可）を付けない */
const WARP_NORMAL_FOOT_ACCESS = new Set(["legacy_prototype", "ips_canyon"]);

/** アルター転送時のみ表示する旅のメモ（mapSlotId → 文言） */
const WARP_DEST_TRAVEL_MEMO = {
  bisk: "中央広場 — 転送ハブ。南の水辺にイクシオン ウォーター（Lv53）。",
  eisis_cave: "洞窟 — スパイダー·イクシオン。狭い足場と暗所に注意。",
  dragon_valley: "飛竜の谷 — ワイルドオルヴァン·天空竜。高Lv帯。",
  darin_mountain: "ダーイン山 — オーク系。リンクとノンアクティブに注意。",
  albeez_forest: "アルビーズの森 — クローラー·パピー。木陰で索敵が狭い。",
  elvin_mountains: "保存フォルダーへ保存をおすすめします。",
  yug_coast:
    "🏠 家AGE番地の入口 · 敵なし · 北西に拠点の家 · 小川と灯りでまったり。",
  mitoya_great_tree:
    "🌳 巨木の上に本家 · 枝に住宅 · 敵なし · 樹冠の光を見上げて。",
  soles_valley: "渓谷の湯付近 — 歩行は狭い。🔥 アルター付近に焚き火あり。",
  geo_abyss_ne: "深淵は高温帯。装備と回復を確認してから。",
  geo_abyss_s: "溶岩帯 — クリックで波紋。回復アイテムを持参。",
  geo_abyss_w: "深淵西 — 高温・狭い足場。転送後はアルター周辺から。",
  elan_palace: "螺旋迷路 — 高Lv帯。白骨·黒骨など強敵。",
  mutum_catacomb: "地下墓地 — ゾンビ·レイス。明るさと回復を確認。",
  hatiil_desert: "砂漠 — 砂嵐演出あり。水と回復を多めに。",
  neoku_plateau: "高原 — オルヴァン·ノッカー。リンクに注意。",
  sulfur_mine: "火竜神殿 — 白骨·黒骨·サラマンダー。",
  sulfur_kazan_temple:
    "【新マップ】火竜神殿 GLB — 転送で神殿1階中央へ。旧スルト鉱山とは別エリア。",
  elvin_keikoku:
    "【新マップ】渓谷 GLB — 転送で渓谷中央へ。旧エルビン渓谷とは別エリア。",
};

/** @type {Record<string, string>} */
const WARP_DEST_EMOJI = {
  legacy_prototype: "🧪",
  desert_preview: "🏜",
  meerim_coast: "🏖",
  elvin_valley: "🌿",
  elvin_mountains: "⛰",
  darin_mountain: "⛏",
  lexur_hills: "🛡",
  garm_corridor: "⚔",
  ilvana_valley: "🌲",
  albeez_forest: "🌳",
  ips_canyon: "🐢",
  ark_ruins: "🛶",
  eisis_cave: "🕳",
  hatiil_desert: "🏜",
  sulfur_mine: "🌋",
  sulfur_kazan_temple: "🌋",
  elvin_keikoku: "🌿",
  neoku_mountain: "🐉",
  neoku_plateau: "🌄",
  dragon_valley: "🪽",
  elan_palace: "🏛",
  war_age: "⚔",
  slorim_plain: "🌾",
  mutum_catacomb: "💀",
  nubool_village: "🏘",
  yug_coast: "🌊",
  soles_valley: "🏔",
  geo_abyss_ne: "🔥",
  geo_abyss_s: "🌋",
  geo_abyss_w: "🕳",
  mitoya_great_tree: "🌳",
};

/**
 * @param {import("@/lib/moe3dWorldLayout").Moe3dMapSlot} slot
 */
function warpDestGroupForSlot(slot) {
  if (slot.branch === "legacy") return "local";
  if (slot.branch === "age") return "age";
  if (slot.warpOnly || slot.branch === "warp") return "dimension";
  return "mainline";
}

/**
 * @param {string} mapSlotId
 * @returns {MoeMapAltarLayout | null}
 */
export function moeMapAltarLayout(mapSlotId) {
  const explicit = MOE_MAP_ALTAR_LAYOUTS[mapSlotId];
  if (explicit) return explicit;

  const slot = MOE_3D_WORLD_MAP_REGISTRY.find((s) => s.id === mapSlotId);
  if (!slot) return null;

  return {
    id: `altar_${mapSlotId}`,
    nameJa: `${slot.nameJa} · アルター`,
    altarTx: 0.5,
    altarTz: 0.5,
    spawnOffTx: 0,
    spawnOffTz: 0.08,
    kind: slot.warpOnly ? "warp" : "portal",
    interactRadius: 6.5,
  };
}

/** @typedef {{ id: string, nameJa: string, mapSlotId: string, tx: number, tz: number, kind: string, interactRadius?: number }} MoeAltarDef */

/** 3D に置くアルター（明示 layout + タイル配置済みスロット） */
function buildMoeAltarDefs() {
  /** @type {MoeAltarDef[]} */
  const out = [];
  const seen = new Set();

  const push = (mapSlotId, layout) => {
    if (!layout || seen.has(layout.id)) return;
    seen.add(layout.id);
    out.push({
      id: layout.id,
      nameJa: layout.nameJa,
      mapSlotId,
      tx: layout.altarTx ?? 0.5,
      tz: layout.altarTz ?? 0.5,
      kind: layout.kind,
      interactRadius: layout.interactRadius,
    });
  };

  for (const [mapSlotId, layout] of Object.entries(MOE_MAP_ALTAR_LAYOUTS)) {
    push(mapSlotId, layout);
  }

  for (const slot of MOE_3D_WORLD_MAP_REGISTRY) {
    if (WARP_DEST_SKIP.has(slot.id)) continue;
    if (slot.buildPhase === 0 && slot.id !== "legacy_prototype" && slot.id !== "desert_preview") {
      continue;
    }
    const layout = moeMapAltarLayout(slot.id);
    push(slot.id, layout);
  }

  return out;
}

/** @type {MoeAltarDef[]} */
export const MOE_ALTARS = buildMoeAltarDefs();

/** @typedef {{ id: string, altarIds: string[], group: string, mapSlotId: string, nameJa: string, subtitle?: string, travelMemo?: string, available: boolean, normallyRestricted?: boolean, emoji?: string }} MoeAltarDestination */

/** アルター転送一覧の最上段（新規マップ専用） */
const WARP_DEST_NEW_MAP_SLOT_IDS = new Set([
  "sulfur_kazan_temple",
  "elvin_keikoku",
]);

/** @type {{ id: string, label: string }[]} */
export const MOE_ALTAR_WARP_GROUPS = [
  { id: "newmap", label: "新マップ" },
  { id: "local", label: "近隣 · 接続" },
  { id: "mainline", label: "西本線（フィールド）" },
  { id: "age", label: "AGE大陸（アルター転送）" },
  { id: "dimension", label: "アルター転送" },
];

function buildMoeAltarDestinations() {
  /** @type {MoeAltarDestination[]} */
  const out = [];

  out.push({
    id: "to_sulfur_kazan_temple",
    altarIds: ["*"],
    group: "newmap",
    mapSlotId: "sulfur_kazan_temple",
    nameJa: "新スルト鉱山（火山神殿）",
    subtitle: "火竜神殿 GLB · 転送で1階中央",
    travelMemo: WARP_DEST_TRAVEL_MEMO.sulfur_kazan_temple,
    emoji: WARP_DEST_EMOJI.sulfur_kazan_temple ?? "🌋",
    available: true,
    normallyRestricted: true,
  });

  out.push({
    id: "to_elvin_keikoku",
    altarIds: ["*"],
    group: "newmap",
    mapSlotId: "elvin_keikoku",
    nameJa: "新エルビン渓谷",
    subtitle: "渓谷 GLB · 転送で渓谷中央",
    travelMemo: WARP_DEST_TRAVEL_MEMO.elvin_keikoku,
    emoji: WARP_DEST_EMOJI.elvin_keikoku ?? "🌿",
    available: true,
    normallyRestricted: true,
  });

  for (const slot of MOE_3D_WORLD_MAP_REGISTRY) {
    if (WARP_DEST_SKIP.has(slot.id)) continue;
    if (WARP_DEST_NEW_MAP_SLOT_IDS.has(slot.id)) continue;
    if (slot.buildPhase === 0 && slot.id !== "legacy_prototype" && slot.id !== "desert_preview") {
      continue;
    }

    const normallyRestricted = !WARP_NORMAL_FOOT_ACCESS.has(slot.id);
    const baseName = slot.nameJa;
    out.push({
      id: `to_${slot.id}`,
      altarIds: ["*"],
      group: warpDestGroupForSlot(slot),
      mapSlotId: slot.id,
      nameJa: normallyRestricted ? `${baseName}（本来通行不可）` : baseName,
      subtitle: slot.note,
      travelMemo: WARP_DEST_TRAVEL_MEMO[slot.id],
      emoji: WARP_DEST_EMOJI[slot.id] ?? "📍",
      available: true,
      normallyRestricted,
    });
  }

  out.unshift({
    id: "to_bisk",
    altarIds: ["*"],
    group: "local",
    mapSlotId: "bisk",
    nameJa: "城下町ビスク",
    subtitle: "中央広場 · 拠点",
    travelMemo: WARP_DEST_TRAVEL_MEMO.bisk,
    emoji: "🏰",
    available: true,
  });

  return out;
}

/** @type {MoeAltarDestination[]} */
export const MOE_ALTAR_DESTINATIONS = buildMoeAltarDestinations();

/** @param {string} altarId */
export function moeAltarDestinationsFor(altarId) {
  const altar = moeAltarDefById(altarId);
  const here = altar?.mapSlotId;
  return MOE_ALTAR_DESTINATIONS.filter(
    (d) => d.available && (!here || d.mapSlotId !== here)
  );
}

/** @param {string} altarId */
export function moeAltarDefById(altarId) {
  return MOE_ALTARS.find((a) => a.id === altarId) ?? null;
}

/** @param {string} destId */
export function moeAltarDestinationById(destId) {
  return MOE_ALTAR_DESTINATIONS.find((d) => d.id === destId) ?? null;
}
