import {
  MOE_3D_LEGACY_TILES_X,
  MOE_3D_LEGACY_TILES_Z,
  MOE_3D_TILE_SPACING,
  moe3dLayoutTileD,
  moe3dLayoutTileW,
} from "@/lib/moeField3DModels";
import { MACRO2_L1_SLOT_IDS } from "@/lib/moe3dMacro2Constants";

/**
 * MOE 本編ワールド — タイル予約レイアウト
 *
 * 座標: player.x = Three.js X · player.y = Three.js Z
 *       +x=東 · +z=南 · 原点 (0,0) = 城下町ビスク中央
 *
 * 既存 2×4 プロトタイプ（ix=0..1, iz=0..3）はそのまま東側に残す。
 * 本編マップは西側（ix 負）＋南支線（iz=0）に 1 面ずつ予約。
 *
 * 接続順（ユーザー指定）:
 *   城下町ビスク → ミーリム海岸 → エルビン渓谷 → エルビン山脈 → ダーイン山
 *   エルビン山脈北 · スルト鉱山（ix=-6, iz=2）
 *   城下町ビスク → レクスール・ヒルズ → ガルム回廊 → イルヴァーナ渓谷 → アルビーズの森
 */

/** @typedef {{ id: string, nameJa: string, shortLabel: string, ix: number, iz: number, order: number, branch: string, buildPhase: number, note?: string }} Moe3dMapSlot */

/** 既存 2×4 試作（モンスター展示 · 旧ミーリム海岸） */
export const MOE_3D_LEGACY_TILE_ORIGIN = { ix: 0, iz: 0 };

/** 本編列 iz（西へ伸びるメイン街道） */
export const MOE_3D_MAINLINE_IZ = 1;

/** 南支線 iz（ビスク → レクスール方面） */
export const MOE_3D_SOUTH_BRANCH_IZ = 0;

/** 北支線 iz（箱舟・イプス等 · 将来） */
export const MOE_3D_NORTH_BRANCH_IZ = 2;

/** アルター転送専用 iz（ワープ pad · 別次元扱い） */
export const MOE_3D_WARP_ROW_IZ = 3;

/**
 * 全 MOE フィールド登録（調査用 · buildPhase=0 は今回タイル未配置）
 * buildPhase 1 = 最初に GLB を作る本編列、2 = ビスク東支線、3 = その他
 */
export const MOE_3D_WORLD_MAP_REGISTRY = [
  {
    id: "bisk",
    nameJa: "城下町ビスク",
    shortLabel: "ビスク",
    ix: -3,
    iz: MOE_3D_MAINLINE_IZ,
    order: 1,
    branch: "hub",
    buildPhase: 1,
    note: "拠点 · 西=ミーリム列 · 南=レクスール列",
  },
  {
    id: "mainland_connector",
    nameJa: "接続道",
    shortLabel: "接続",
    ix: -2,
    iz: MOE_3D_MAINLINE_IZ,
    order: 0,
    branch: "connector",
    buildPhase: 1,
    note: "本編 ↔ 試作バッファ",
  },
  {
    id: "legacy_buffer",
    nameJa: "試作区バッファ",
    shortLabel: "緩衝",
    ix: -1,
    iz: MOE_3D_MAINLINE_IZ,
    order: 0,
    branch: "connector",
    buildPhase: 1,
    note: "試作マップとの距離 · 1 面",
  },
  {
    id: "meerim_coast",
    nameJa: "ミーリム海岸",
    shortLabel: "ミーリム",
    ix: -4,
    iz: MOE_3D_MAINLINE_IZ,
    order: 2,
    branch: "west",
    buildPhase: 1,
  },
  {
    id: "elvin_valley",
    nameJa: "エルビン渓谷",
    shortLabel: "渓谷",
    ix: -5,
    iz: MOE_3D_MAINLINE_IZ,
    order: 3,
    branch: "west",
    buildPhase: 1,
  },
  {
    id: "elvin_mountains",
    nameJa: "エルビン山脈",
    shortLabel: "山脈",
    ix: -6,
    iz: MOE_3D_MAINLINE_IZ,
    order: 4,
    branch: "west",
    buildPhase: 1,
    note: "サスール方面",
  },
  {
    id: "sulfur_mine",
    nameJa: "スルト鉱山",
    shortLabel: "スルト",
    ix: -6,
    iz: MOE_3D_NORTH_BRANCH_IZ,
    order: 5,
    branch: "north",
    buildPhase: 1,
    note: "サスール方面 · 硫黄採掘 · マクロ３簡易山",
  },
  {
    id: "darin_mountain",
    nameJa: "ダーイン山",
    shortLabel: "ダーイン",
    ix: -7,
    iz: MOE_3D_MAINLINE_IZ,
    order: 5,
    branch: "west",
    buildPhase: 1,
  },
  {
    id: "lexur_hills",
    nameJa: "レクスール・ヒルズ",
    shortLabel: "レクスール",
    ix: -3,
    iz: MOE_3D_SOUTH_BRANCH_IZ,
    order: 1,
    branch: "south",
    buildPhase: 2,
  },
  {
    id: "garm_corridor",
    nameJa: "ガルム回廊",
    shortLabel: "ガルム",
    ix: -4,
    iz: MOE_3D_SOUTH_BRANCH_IZ,
    order: 2,
    branch: "south",
    buildPhase: 2,
  },
  {
    id: "ilvana_valley",
    nameJa: "イルヴァーナ渓谷",
    shortLabel: "イルヴァーナ",
    ix: -5,
    iz: MOE_3D_SOUTH_BRANCH_IZ,
    order: 3,
    branch: "south",
    buildPhase: 2,
  },
  {
    id: "albeez_forest",
    nameJa: "アルビーズの森",
    shortLabel: "アルビーズ",
    ix: -6,
    iz: MOE_3D_SOUTH_BRANCH_IZ,
    order: 4,
    branch: "south",
    buildPhase: 2,
  },
  {
    id: "ips_canyon",
    nameJa: "イプス峡谷",
    shortLabel: "イプス",
    ix: -3,
    iz: MOE_3D_NORTH_BRANCH_IZ,
    order: 1,
    branch: "north",
    buildPhase: 1,
    note: "ビスク北 · イルミナ城",
  },
  {
    id: "ark_ruins",
    nameJa: "箱舟遺跡",
    shortLabel: "箱舟",
    ix: -5,
    iz: MOE_3D_NORTH_BRANCH_IZ,
    order: 2,
    branch: "north",
    buildPhase: 3,
    note: "渓谷南 · ダーイン手前",
  },
  {
    id: "eisis_cave",
    nameJa: "エイシス・ケイブ",
    shortLabel: "エイシス",
    ix: -4,
    iz: MOE_3D_NORTH_BRANCH_IZ,
    order: 3,
    branch: "north",
    buildPhase: 3,
  },
  {
    id: "hatiil_desert",
    nameJa: "ハティル砂漠",
    shortLabel: "砂漠本編",
    ix: -7,
    iz: MOE_3D_NORTH_BRANCH_IZ,
    order: 4,
    branch: "north",
    buildPhase: 2,
    note: "MOE本編 · デスワーム〜キマイラ",
  },
  {
    id: "legacy_prototype",
    nameJa: "試作マップ（既存）",
    shortLabel: "試作",
    ix: 0,
    iz: 0,
    order: 0,
    branch: "legacy",
    buildPhase: 0,
    note: "2×4 既存 GLB · モンスター展示",
  },
  {
    id: "desert_preview",
    nameJa: "砂漠プレビュー",
    shortLabel: "砂漠見本",
    ix: 2,
    iz: 1,
    order: 0,
    branch: "legacy",
    buildPhase: 0,
  },
  {
    id: "neoku_mountain",
    nameJa: "ネオク山",
    shortLabel: "ネオク",
    ix: -9,
    iz: MOE_3D_WARP_ROW_IZ,
    order: 1,
    branch: "warp",
    buildPhase: 3,
    warpOnly: true,
    note: "アルター転送 · エルガディン",
  },
  {
    id: "neoku_plateau",
    nameJa: "ネオク高原",
    shortLabel: "高原",
    ix: -8,
    iz: MOE_3D_WARP_ROW_IZ,
    order: 2,
    branch: "warp",
    buildPhase: 3,
    warpOnly: true,
  },
  {
    id: "elan_palace",
    nameJa: "エルアン宮殿",
    shortLabel: "エルアン",
    ix: -7,
    iz: MOE_3D_WARP_ROW_IZ,
    order: 3,
    branch: "warp",
    buildPhase: 3,
    warpOnly: true,
  },
  {
    id: "war_age",
    nameJa: "War Age",
    shortLabel: "War",
    ix: -6,
    iz: MOE_3D_WARP_ROW_IZ,
    order: 4,
    branch: "warp",
    buildPhase: 3,
    warpOnly: true,
    note: "クエスト・オブ・エイジス",
  },
  {
    id: "slorim_plain",
    nameJa: "スローリム平原",
    shortLabel: "スローリム",
    ix: -5,
    iz: MOE_3D_WARP_ROW_IZ,
    order: 5,
    branch: "warp",
    buildPhase: 3,
    warpOnly: true,
  },
  {
    id: "mutum_catacomb",
    nameJa: "ムトゥーム地下墓地",
    shortLabel: "地下墓地",
    ix: -7,
    iz: 3,
    order: 6,
    branch: "future",
    buildPhase: 0,
  },
  {
    id: "nubool_village",
    nameJa: "ヌブールの村",
    shortLabel: "ヌブール",
    ix: -6,
    iz: 3,
    order: 7,
    branch: "future",
    buildPhase: 0,
  },
];

/** @deprecated 互換 — 西本線のみ */
export const MOE_3D_MAINLAND_MAP_CHAIN = MOE_3D_WORLD_MAP_REGISTRY.filter(
  (s) => s.branch === "west" || s.id === "bisk"
).sort((a, b) => a.order - b.order);

/** @deprecated */
export const MOE_3D_MAINLAND_CHAIN_START_IX = -6;
/** @deprecated */
export const MOE_3D_MAINLAND_CHAIN_IZ = MOE_3D_MAINLINE_IZ;
/** @deprecated */
export const MOE_3D_MAINLAND_CONNECTOR_SLOT = MOE_3D_WORLD_MAP_REGISTRY.find(
  (s) => s.id === "mainland_connector"
);

/** 3D に置く予約タイル（buildPhase 1–3 · 専用タイルは除外） */
export function moe3dReservedMapSlots() {
  return MOE_3D_WORLD_MAP_REGISTRY.filter(
    (s) =>
      s.buildPhase >= 1 &&
      s.id !== "bisk" &&
      s.id !== "legacy_buffer" &&
      s.id !== "ips_canyon" &&
      !MACRO2_L1_SLOT_IDS.has(s.id)
  );
}

/** @param {string} id */
export function moe3dMapSlotById(id) {
  return MOE_3D_WORLD_MAP_REGISTRY.find((s) => s.id === id) ?? null;
}

/** タイル内正規化座標 → ワールド xz（player.x / player.y） */
export function moe3dSlotSpawnWorld(mapSlotId, tileW, tileD, tx = 0.5, tz = 0.5) {
  const slot = moe3dMapSlotById(mapSlotId);
  if (!slot || !tileW || !tileD) return null;
  const off = moe3dTerrainGroupOffset(tileW, tileD);
  const origin = moe3dTileLocalOrigin(slot.ix, slot.iz, tileW, tileD);
  const size = moe3dTileLocalSize(slot.ix, slot.iz, tileW, tileD);
  return {
    x: off.x + origin.x + size.w * tx,
    y: off.z + origin.z + size.d * tz,
  };
}

/** タイル root にマップ面スケールを適用（原点＝南西角） */
export function moe3dApplyMapTileScale(tileRoot) {
  if (!tileRoot) return;
  tileRoot.scale.set(MOE_3D_TILE_SPACING, 1, MOE_3D_TILE_SPACING);
}

/** terrainGroup 内のタイル南西角（試作・本編とも layout 間隔） */
export function moe3dTileLocalOrigin(ix, iz, tileW, tileD) {
  const lw = moe3dLayoutTileW(tileW);
  const ld = moe3dLayoutTileD(tileD);
  return { x: ix * lw, z: iz * ld };
}

/** terrainGroup 内のタイル寸法 */
export function moe3dTileLocalSize(_ix, _iz, tileW, tileD) {
  return { w: moe3dLayoutTileW(tileW), d: moe3dLayoutTileD(tileD) };
}

/** @deprecated */
export function moe3dMainlandChainSlots() {
  return MOE_3D_MAINLAND_MAP_CHAIN.map((entry) => ({
    ...entry,
    ix:
      entry.id === "bisk"
        ? -2
        : entry.id === "meerim_coast"
          ? -3
          : entry.id === "elvin_valley"
            ? -4
            : entry.id === "elvin_mountains"
              ? -5
              : -6,
    iz: MOE_3D_MAINLINE_IZ,
  }));
}

/** ワールド原点 (0,0) = このマップ面の中心 */
export const MOE_3D_WORLD_ORIGIN_SLOT_ID = "bisk";

/** 方位磁石の設置距離（ビスク中央から） */
export const MOE_3D_COMPASS_MARKER_DIST = 44;

/** タイル座標系でのビスク面中心（terrainGroup ローカル · オフセット前） */
export function moe3dBiskTileCenterLocal(tileW, tileD) {
  const slot = moe3dMapSlotById(MOE_3D_WORLD_ORIGIN_SLOT_ID);
  if (!slot || !tileW || !tileD) return { x: 0, z: 0 };
  const origin = moe3dTileLocalOrigin(slot.ix, slot.iz, tileW, tileD);
  const size = moe3dTileLocalSize(slot.ix, slot.iz, tileW, tileD);
  return { x: origin.x + size.w * 0.5, z: origin.z + size.d * 0.5 };
}

/** ワールド原点 — 城下町ビスク中央（player.x / player.y） */
export function moe3dBiskWorldCenter() {
  return { x: 0, y: 0 };
}

/** 試作フィールドの南端スポーン（ボスエリア基準 · ワールド座標） */
export function moe3dPrototypeFieldStart(tileW, tileD) {
  if (!tileW || !tileD) return { x: 0, y: 0 };
  const iz = MOE_3D_LEGACY_TILES_Z - 1;
  const off = moe3dTerrainGroupOffset(tileW, tileD);
  const origin = moe3dTileLocalOrigin(0, iz, tileW, tileD);
  const size = moe3dTileLocalSize(0, iz, tileW, tileD);
  return {
    x: off.x + origin.x + size.w * 0.42,
    y: off.z + origin.z + size.d * 0.72,
  };
}

/** terrainGroup オフセット — ビスク中央がワールド (0,0) */
export function moe3dTerrainGroupOffset(tileW, tileD) {
  const center = moe3dBiskTileCenterLocal(tileW, tileD);
  return {
    x: -center.x,
    y: 0,
    z: -center.z,
  };
}

/** タイル index → ワールド xz 矩形 */
export function moe3dTileIndexWorldRect(ix, iz, tileW, tileD) {
  const off = moe3dTerrainGroupOffset(tileW, tileD);
  const origin = moe3dTileLocalOrigin(ix, iz, tileW, tileD);
  const size = moe3dTileLocalSize(ix, iz, tileW, tileD);
  return {
    minX: off.x + origin.x,
    maxX: off.x + origin.x + size.w,
    minZ: off.z + origin.z,
    maxZ: off.z + origin.z + size.d,
  };
}

/** ミニマップ用 — 配置済みタイル index 一覧（重複除外） */
export function moe3dMinimapTileEntries() {
  /** @type {{ ix: number, iz: number, id: string, shortLabel?: string }[]} */
  const out = [];
  const seen = new Set();
  const push = (ix, iz, id, shortLabel) => {
    const key = `${ix},${iz}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ ix, iz, id, shortLabel });
  };

  for (let iz = 0; iz < MOE_3D_LEGACY_TILES_Z; iz++) {
    for (let ix = 0; ix < MOE_3D_LEGACY_TILES_X; ix++) {
      push(ix, iz, `legacy_${ix}_${iz}`, ix === 0 && iz === 0 ? "試作" : undefined);
    }
  }

  for (const slot of MOE_3D_WORLD_MAP_REGISTRY) {
    if (slot.buildPhase >= 1 || slot.buildPhase === 3) {
      push(slot.ix, slot.iz, slot.id, slot.shortLabel);
    }
  }

  push(
    MOE_3D_LEGACY_TILES_X,
    Math.floor(MOE_3D_LEGACY_TILES_Z / 2),
    "desert_preview",
    "砂漠"
  );

  return out;
}

/** 全タイルを含むワールド bounds（ミニマップ viewBox 用） */
export function moe3dFullWorldBounds(tileW, tileD, padding = 6) {
  const tw = tileW > 0 ? tileW : 100;
  const td = tileD > 0 ? tileD : 50;
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const entry of moe3dMinimapTileEntries()) {
    const rect = moe3dTileIndexWorldRect(entry.ix, entry.iz, tw, td);
    minX = Math.min(minX, rect.minX);
    maxX = Math.max(maxX, rect.maxX);
    minZ = Math.min(minZ, rect.minZ);
    maxZ = Math.max(maxZ, rect.maxZ);
  }

  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minZ: minZ - padding,
    maxZ: maxZ + padding,
    width: maxX - minX + padding * 2,
    depth: maxZ - minZ + padding * 2,
  };
}

/** 横長ワールド用 — SVG viewBox サイズ（縦を地理比より拡大） */
export const MOE_3D_MINIMAP_VIEW_W = 480;
/** 地理アスペクト比に掛ける縦拡大（横長マップ用） */
export const MOE_3D_MINIMAP_HEIGHT_BOOST = 3;
/** パネル幅 320px 時に SVG 表示高さ ≈240px になる viewBox 高 */
export const MOE_3D_MINIMAP_MIN_VIEW_H = 360;

/** @param {{ width: number, depth: number }} mapBounds */
export function moe3dMinimapViewSize(mapBounds) {
  const geoH = MOE_3D_MINIMAP_VIEW_W * (mapBounds.depth / mapBounds.width);
  const miniMapH = Math.max(
    MOE_3D_MINIMAP_MIN_VIEW_H,
    Math.round(geoH * MOE_3D_MINIMAP_HEIGHT_BOOST)
  );
  return { miniMapW: MOE_3D_MINIMAP_VIEW_W, miniMapH };
}

/** @param {{ minX: number, maxX: number, minZ: number, maxZ: number, width: number, depth: number }} mapBounds */
export function moe3dWorldToMinimapInBounds(x, z, mapBounds, mw, mh) {
  return {
    x: ((x - mapBounds.minX) / mapBounds.width) * mw,
    y: ((z - mapBounds.minZ) / mapBounds.depth) * mh,
  };
}

const MINIMAP_FILLS = {
  bisk: "#94a3b8",
  mainland_connector: "#bbf7d0",
  legacy_buffer: "#6b8f5e",
  meerim_coast: "#d4b896",
  elvin_valley: "#4ade80",
  elvin_mountains: "#78716c",
  darin_mountain: "#57534e",
  lexur_hills: "#c4b5fd",
  garm_corridor: "#a78bfa",
  ilvana_valley: "#67e8f9",
  albeez_forest: "#15803d",
  ips_canyon: "#fdba74",
  ark_ruins: "#fde68a",
  eisis_cave: "#7dd3fc",
  hatiil_desert: "#d4a574",
  neoku_mountain: "#f97316",
  neoku_plateau: "#fb923c",
  elan_palace: "#fcd34d",
  war_age: "#ef4444",
  slorim_plain: "#a3e635",
  sulfur_mine: "#eab308",
};

const LEGACY_MINI_FILLS = ["#d2b48c", "#228b22", "#2e7d32", "#388e3c"];

/** ミニマップ — 全タイル（本編 + 試作 + 砂漠見本） */
export function moe3dMinimapFullTileRects(mapBounds, mw, mh, tileW, tileD) {
  const tw = tileW > 0 ? tileW : 100;
  const td = tileD > 0 ? tileD : 50;
  const toMap = (wx, wz) =>
    moe3dWorldToMinimapInBounds(wx, wz, mapBounds, mw, mh);

  return moe3dMinimapTileEntries().map((entry) => {
    const rect = moe3dTileIndexWorldRect(entry.ix, entry.iz, tw, td);
    const tl = toMap(rect.minX, rect.minZ);
    const br = toMap(rect.maxX, rect.maxZ);
    const legacyFill = entry.id.startsWith("legacy_")
      ? LEGACY_MINI_FILLS[entry.iz] ?? "#43a047"
      : null;
    return {
      key: `tile-${entry.id}-${entry.ix}-${entry.iz}`,
      label: entry.shortLabel,
      x: Math.min(tl.x, br.x),
      y: Math.min(tl.y, br.y),
      width: Math.max(2, Math.abs(br.x - tl.x)),
      height: Math.max(2, Math.abs(br.y - tl.y)),
      fill:
        legacyFill ??
        MINIMAP_FILLS[entry.id] ??
        (entry.id.startsWith("legacy_") ? "#43a047" : "#cbd5e1"),
      opacity: entry.id === "mainland_connector" ? 0.55 : 0.82,
      stroke: "#1e293b",
      strokeWidth: 0.5,
    };
  });
}

/** @deprecated moe3dMinimapFullTileRects を使用 */
export function moe3dMinimapReservedMapRects(
  halfW,
  halfD,
  mw,
  mh,
  tileW,
  tileD,
  mapBounds = null
) {
  if (mapBounds) {
    return moe3dMinimapFullTileRects(mapBounds, mw, mh, tileW, tileD);
  }
  const tw =
    tileW && tileW > 0 ? tileW : Math.max(40, (halfW * 2) / 12);
  const td =
    tileD && tileD > 0 ? tileD : Math.max(40, (halfD * 2) / 8);
  const bounds = moe3dFullWorldBounds(tw, td, 0);
  return moe3dMinimapFullTileRects(bounds, mw, mh, tw, td);
}
