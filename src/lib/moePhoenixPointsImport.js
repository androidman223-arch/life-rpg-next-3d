/**
 * 休憩ポップアップ points_kei.json の鳳凰P・龍神P（合計）を別枠へ入れかえる。
 * ゲーム内で稼いだ経験値には足さない。表示は「ゲームの分 + この合計」。
 * 同じファイルを何回読んでも、別枠は同じ数字になる。
 */

export const MOE_BREAK_POPUP_POINTS_KEY = "life-rpg-moe-break-popup-points-v1";

function round1(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function formatPoint(value) {
  return round1(value).toFixed(1).replace(".", ",");
}

/** @returns {{ phoenix: number, dragon: number, updated: string | null }} */
export function emptyBreakPopupPoints() {
  return { phoenix: 0, dragon: 0, updated: null };
}

/** @param {unknown} raw */
export function normalizeBreakPopupPoints(raw) {
  if (!raw || typeof raw !== "object") return emptyBreakPopupPoints();
  const row = /** @type {Record<string, unknown>} */ (raw);
  return {
    phoenix: round1(Math.max(0, Number(row.phoenix) || 0)),
    dragon: round1(Math.max(0, Number(row.dragon) || 0)),
    updated: typeof row.updated === "string" ? row.updated : null,
  };
}

/**
 * ファイルの合計で別枠を入れかえる。前回の別枠には足さない。
 * @param {unknown} fileTotals
 */
export function replaceBreakPopupPoints(fileTotals) {
  return normalizeBreakPopupPoints(fileTotals);
}

/**
 * @param {number} gamePhoenix
 * @param {number} gameDragon
 * @param {{ phoenix?: number, dragon?: number }} breakPoints
 */
export function displayTrainingExp(gamePhoenix, gameDragon, breakPoints) {
  const external = normalizeBreakPopupPoints(breakPoints);
  return {
    phoenix: round1(Math.max(0, Number(gamePhoenix) || 0) + external.phoenix),
    dragon: round1(Math.max(0, Number(gameDragon) || 0) + external.dragon),
  };
}

export function loadBreakPopupPoints() {
  if (typeof window === "undefined") return emptyBreakPopupPoints();
  try {
    const raw = window.localStorage.getItem(MOE_BREAK_POPUP_POINTS_KEY);
    return normalizeBreakPopupPoints(raw ? JSON.parse(raw) : null);
  } catch {
    return emptyBreakPopupPoints();
  }
}

/** @param {{ phoenix: number, dragon: number, updated: string | null }} points */
export function saveBreakPopupPoints(points) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MOE_BREAK_POPUP_POINTS_KEY,
      JSON.stringify(normalizeBreakPopupPoints(points))
    );
  } catch {
    /* quota */
  }
}

/**
 * @returns {Promise<{ ok: boolean, message: string, points: { phoenix: number, dragon: number, updated: string | null } | null }>}
 */
export async function importPhoenixPointsFromKyukei() {
  let data;
  try {
    const res = await fetch("/api/phoenix-points", { cache: "no-store" });
    data = await res.json();
    if (!res.ok || !data?.ok) {
      return {
        ok: false,
        points: null,
        message:
          typeof data?.message === "string"
            ? data.message
            : "points_kei.json を読めませんでした",
      };
    }
  } catch {
    return {
      ok: false,
      points: null,
      message: "points_kei.json を読めませんでした",
    };
  }

  const points = replaceBreakPopupPoints(data);
  saveBreakPopupPoints(points);
  return {
    ok: true,
    points,
    message: `入れかえました。外部鳳凰P ${formatPoint(points.phoenix)} ／ 外部龍神P ${formatPoint(points.dragon)}`,
  };
}
