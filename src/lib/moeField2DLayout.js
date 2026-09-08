/** 2D ミーリム：横 1.5 画面幅・奥行きは 3→4→5→5 列のゾーン */
export const MOE_2D_MAP_WIDTH_SCREENS = 1.5;
export const MOE_2D_START_ROW_SCREEN = 0.82;
export const MOE_2D_ZONE_ROW_SCREEN = 0.88;
/** 奥に進むほど列が増える（最後の5列は Lv40/50 の2ゾーン） */
export const MOE_2D_DEPTH_COLS = [3, 4, 5, 5];

const ZONE_ROW_COLORS = [
  "rgba(34, 139, 34, 0.35)",
  "rgba(46, 125, 50, 0.38)",
  "rgba(56, 142, 60, 0.4)",
  "rgba(27, 94, 32, 0.42)",
];

const ZONE_ROW_BORDERS = [
  "#2e7d32",
  "#388e3c",
  "#43a047",
  "#1b5e20",
];

export function computeMoe2dWorldSize(viewW, viewH) {
  const mw = Math.round(viewW * MOE_2D_MAP_WIDTH_SCREENS);
  const zoneRowCount = MOE_2D_DEPTH_COLS.length;
  const mh = Math.round(
    viewH * MOE_2D_START_ROW_SCREEN +
      viewH * MOE_2D_ZONE_ROW_SCREEN * zoneRowCount
  );
  return { mw, mh };
}

/** @returns {{ y: number, h: number, cols: number, kind: string, zoneRow?: number }[]} */
export function buildMoe2dRowLayout(mw, mh) {
  const zoneRowCount = MOE_2D_DEPTH_COLS.length;
  const totalUnits =
    MOE_2D_START_ROW_SCREEN + MOE_2D_ZONE_ROW_SCREEN * zoneRowCount;
  const startH = Math.round(mh * (MOE_2D_START_ROW_SCREEN / totalUnits));
  const zoneH = Math.round(mh * (MOE_2D_ZONE_ROW_SCREEN / totalUnits));

  const rows = [{ y: mh - startH, h: startH, cols: 1, kind: "start" }];
  let y = mh - startH;
  MOE_2D_DEPTH_COLS.forEach((cols, zoneRow) => {
    y -= zoneH;
    rows.push({ y, h: zoneH, cols, kind: "zone", zoneRow });
  });
  return rows;
}

/** ゾーン index (0..4) → { zoneRow, col } */
export function moe2dZoneCell(zoneIndex, slotInZone) {
  if (zoneIndex <= 2) {
    const cols = MOE_2D_DEPTH_COLS[zoneIndex];
    const col =
      slotInZone === 0
        ? Math.max(0, Math.floor(cols / 2) - 1)
        : Math.min(cols - 1, Math.ceil(cols / 2));
    return { zoneRow: zoneIndex, col };
  }
  if (zoneIndex === 3) {
    return { zoneRow: 3, col: slotInZone === 0 ? 0 : 1 };
  }
  return { zoneRow: 3, col: slotInZone === 0 ? 3 : 4 };
}

export function moe2dCellCenter(rowLayout, mw, zoneIndex, slotInZone) {
  const { zoneRow, col } = moe2dZoneCell(zoneIndex, slotInZone);
  const row = rowLayout.find((r) => r.kind === "zone" && r.zoneRow === zoneRow);
  if (!row) {
    const mh = moe2dRowLayoutTotalHeight(rowLayout);
    return { x: mw / 2, y: mh / 2 };
  }
  const cellW = mw / row.cols;
  const jitterX = (slotInZone === 0 ? -1 : 1) * cellW * 0.08;
  const jitterY = (zoneIndex % 2 === 0 ? -1 : 1) * row.h * 0.06;
  return {
    x: cellW * (col + 0.5) + jitterX,
    y: row.y + row.h * 0.5 + jitterY,
  };
}

function mhFromRows(rowLayout) {
  const start = rowLayout.find((r) => r.kind === "start");
  const topZone = rowLayout.filter((r) => r.kind === "zone").sort((a, b) => a.y - b.y)[0];
  if (!start || !topZone) return 0;
  return start.y + start.h;
}

export function moe2dPickRespawnInZone2d(
  zoneIndex,
  slotInZone,
  rowLayout,
  mw,
  others,
  excludeId
) {
  const { zoneRow, col } = moe2dZoneCell(zoneIndex, slotInZone);
  const row = rowLayout.find((r) => r.kind === "zone" && r.zoneRow === zoneRow);
  if (!row) return moe2dCellCenter(rowLayout, mw, zoneIndex, slotInZone);

  const cellW = mw / row.cols;
  const cx = cellW * (col + 0.5);
  const cy = row.y + row.h * 0.5;

  for (let n = 0; n < 24; n++) {
    const x = cx + (Math.random() - 0.5) * cellW * 0.55;
    const y = cy + (Math.random() - 0.5) * row.h * 0.45;
    if (moe2dIsInBossArea(x, y, rowLayout, mw)) continue;
    let ok = true;
    for (const o of others) {
      if (o.id === excludeId || o.hp <= 0) continue;
      if (Math.hypot(x - o.x, y - o.y) < 48) {
        ok = false;
        break;
      }
    }
    if (ok) return { x, y };
  }
  return { x: cx, y: cy };
}

/** ゾーン行の境界 y（川） */
export function moe2dRiverBoundaries(rowLayout) {
  const bounds = [];
  const start = rowLayout.find((r) => r.kind === "start");
  if (start) bounds.push(start.y);
  for (const row of rowLayout) {
    if (row.kind === "zone") bounds.push(row.y);
  }
  return bounds;
}

export function inRiverMoe2d(px, py, mapW, rowLayout) {
  const boundaries = moe2dRiverBoundaries(rowLayout);
  for (const boundaryY of boundaries) {
    const rivTop = boundaryY - 14;
    const rivBot = boundaryY + 14;
    if (py >= rivTop && py <= rivBot) {
      const cx = mapW / 2;
      if (px >= cx - 60 && px <= cx + 60) return false;
      return true;
    }
  }
  return false;
}

export function moe2dZoneRowStyle(zoneRow) {
  return {
    fill: ZONE_ROW_COLORS[zoneRow] ?? ZONE_ROW_COLORS[0],
    stroke: ZONE_ROW_BORDERS[zoneRow] ?? ZONE_ROW_BORDERS[0],
  };
}

const ZONE_ROW_MINI_FILLS = ["#86efac", "#4ade80", "#22c55e", "#16a34a"];

export const MOE_2D_BISK_EXIT_W = 150;
export const MOE_2D_BISK_EXIT_H = 120;

/** 左下「ビスクへ」タイル内のみメニューへ戻る */
export function moe2dIsBiskExitZone(px, py, rowLayout) {
  const start = rowLayout.find((r) => r.kind === "start");
  if (!start) return false;
  return (
    px <= MOE_2D_BISK_EXIT_W &&
    py >= start.y + start.h - MOE_2D_BISK_EXIT_H &&
    py <= start.y + start.h + 4
  );
}

/** 2D UI（ボスアイコン） */
export const MOE_2D_MID_BOSS_UI_SIZE = 129;
export const MOE_2D_MID_BOSS_UI_PAD = 65;
export const MOE_2D_SUPER_BOSS_UI_SIZE = 384;
export const MOE_2D_SUPER_BOSS_UI_PAD = 192;

/** 2D・初期位置そばの専用ボスエリア（中ボス・超ボスは横並び・非重複） */
export function moe2dBossAreaLayout(rowLayout, mw) {
  const start = moe2dPlayerStartPosition(rowLayout, mw);
  const startRow = rowLayout.find((r) => r.kind === "start");
  const rowH = startRow?.h ?? 80;
  const east = Math.max(48, mw * 0.1);
  const gap = 24;
  const midW = MOE_2D_MID_BOSS_UI_SIZE;
  const superW = MOE_2D_SUPER_BOSS_UI_SIZE;
  const y = start.y - rowH * 0.32;

  const midBossPos = { x: start.x + east + midW / 2, y };
  const superBossPos = {
    x: midBossPos.x + midW / 2 + gap + superW / 2,
    y,
  };

  const midArea = {
    x: midBossPos.x - midW / 2 - 10,
    y: y - midW / 2 - 8,
    width: midW + 20,
    height: midW + 16,
  };
  const superArea = {
    x: superBossPos.x - superW / 2 - 10,
    y: y - superW / 2 - 8,
    width: superW + 20,
    height: superW + 16,
  };

  return {
    center: { x: (midBossPos.x + superBossPos.x) / 2, y },
    midBossPos,
    superBossPos,
    midArea,
    superArea,
    width: superArea.x + superArea.width - midArea.x,
    height: Math.max(midArea.height, superArea.height),
  };
}

/** 初期位置横・スタート列（中ボス） */
export function moe2dMidBossSpawnPosition(rowLayout, mw) {
  return moe2dBossAreaLayout(rowLayout, mw).midBossPos;
}

/** 超ボス（アウズンブラ）— ボスエリア内 */
export function moe2dSuperBossSpawnPosition(rowLayout, mw) {
  return moe2dBossAreaLayout(rowLayout, mw).superBossPos;
}

/** マウンテンバイソン — エルビン バイソンの少し南西 */
export function moe2dMountainBisonSpawnPosition(rowLayout, mw) {
  const { midBossPos } = moe2dBossAreaLayout(rowLayout, mw);
  return {
    x: midBossPos.x - 52,
    y: midBossPos.y + 68,
  };
}

/** 荒くれバイソン — アウズンブラの少し南東 */
export function moe2dRoughBisonSpawnPosition(rowLayout, mw) {
  const { superBossPos } = moe2dBossAreaLayout(rowLayout, mw);
  return {
    x: superBossPos.x + 52,
    y: superBossPos.y + 68,
  };
}

/** 2Dボスエリア内か */
export function moe2dIsInBossArea(x, y, rowLayout, mw, padding = 12) {
  const area = moe2dBossAreaLayout(rowLayout, mw);
  const inRect = (r) =>
    x >= r.x - padding &&
    x <= r.x + r.width + padding &&
    y >= r.y - padding &&
    y <= r.y + r.height + padding;
  return inRect(area.midArea) || inRect(area.superArea);
}

export function moe2dPlayerStartPosition(rowLayout, mw) {
  const start = rowLayout.find((r) => r.kind === "start");
  if (!start) return { x: mw / 2, y: 0 };
  return {
    x: Math.round(mw * 0.38),
    y: start.y + start.h * 0.58,
  };
}

/** スタート列・西側のペット小屋（ビスク左下・東ボスエリアと離す） */
export function moe2dPetHouseLayout(rowLayout, mw) {
  const start = rowLayout.find((r) => r.kind === "start");
  const rowH = start?.h ?? 80;
  const width = 108;
  const height = 92;
  const x = Math.max(88, mw * 0.1);
  const y = start ? start.y + rowH * 0.38 : 0;
  return {
    x,
    y,
    width,
    height,
    npcX: x + width * 0.52,
    npcY: y + height * 0.62,
    interactRadius: 56,
  };
}

export function moe2dIsNearPetHouse(px, py, rowLayout, mw) {
  const house = moe2dPetHouseLayout(rowLayout, mw);
  const cx = house.npcX;
  const cy = house.npcY;
  return Math.hypot(px - cx, py - cy) <= house.interactRadius;
}

/** スタート列・南側 — 魂の記憶者ローダ（ペット小屋と離す） */
export function moe2dRhodaLayout(rowLayout, mw) {
  const start = rowLayout.find((r) => r.kind === "start");
  const rowH = start?.h ?? 80;
  const width = 80;
  const height = 72;
  const x = Math.min(mw - width - 48, mw * 0.44);
  const y = start ? start.y + rowH * 0.78 : rowH * 0.78;
  return {
    x,
    y,
    width,
    height,
    npcX: x + width * 0.5,
    npcY: y + height * 0.58,
    interactRadius: 54,
  };
}

export function moe2dIsNearRhoda(px, py, rowLayout, mw) {
  const spot = moe2dRhodaLayout(rowLayout, mw);
  return Math.hypot(px - spot.npcX, py - spot.npcY) <= spot.interactRadius;
}

export function moe2dRowLayoutTotalHeight(rowLayout) {
  const start = rowLayout.find((r) => r.kind === "start");
  const topZone = rowLayout
    .filter((r) => r.kind === "zone")
    .sort((a, b) => a.y - b.y)[0];
  if (!start || !topZone) return 0;
  return start.y + start.h;
}

export function moe2dZoneRowMiniFill(zoneRow) {
  return ZONE_ROW_MINI_FILLS[zoneRow] ?? ZONE_ROW_MINI_FILLS[0];
}
