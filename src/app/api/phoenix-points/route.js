/**
 * フェニックスP 取りこみ — 休憩ポップアップの points_kei.json を読むだけ（書きかえない）
 * GET /api/phoenix-points
 * phoenix と dragon は合計。phoenixMemo / phoenixChat は内訳。
 */
import { readFile } from "fs/promises";

const POINTS_FILE =
  process.env.KYUKEI_POINTS_FILE ||
  "C:\\Users\\Owner\\Desktop\\kyukei_popup\\points_kei.json";

function round1(value) {
  return Math.round(value * 10) / 10;
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = await readFile(POINTS_FILE, "utf8");
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, ""));
    const phoenix = Number(parsed?.phoenix);
    const dragon = Number(parsed?.dragon);
    if (!Number.isFinite(phoenix) || !Number.isFinite(dragon)) {
      return Response.json(
        {
          ok: false,
          message: "points_kei.json の phoenix と dragon が読めません",
        },
        { status: 422 }
      );
    }
    const memo = Number(parsed?.phoenixMemo);
    const chat = Number(parsed?.phoenixChat);
    return Response.json({
      ok: true,
      phoenix: round1(phoenix),
      dragon: round1(dragon),
      phoenixMemo: Number.isFinite(memo) ? round1(memo) : null,
      phoenixChat: Number.isFinite(chat) ? round1(chat) : null,
      updated: typeof parsed?.updated === "string" ? parsed.updated : null,
    });
  } catch {
    return Response.json(
      { ok: false, message: "points_kei.json を読めませんでした" },
      { status: 404 }
    );
  }
}
