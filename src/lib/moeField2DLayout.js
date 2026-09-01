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

export function moe2dPlayerStartPosition(rowLayout, mw) {
  const start = rowLayout.find((r) => r.kind === "start");
  if (!start) return { x: mw / 2, y: 0 };
  return {
    x: Math.round(mw * 0.26),
    y: start.y + start.h * 0.82,
  };
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
