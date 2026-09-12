import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const QUEUE_PATH = join(process.cwd(), "data/moeShowcaseDeleteQueue.json");

async function readQueue() {
  try {
    const raw = await readFile(QUEUE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      updatedAt: parsed.updatedAt ?? null,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    return { updatedAt: null, entries: [] };
  }
}

async function writeQueue(queue) {
  await writeFile(QUEUE_PATH, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
}

/** @param {import('next/server').NextRequest} request */
export async function POST(request) {
  try {
    const body = await request.json();
    const kind = body?.kind === "dragon" ? "dragon" : "monster";
    const incoming = Array.isArray(body?.entries) ? body.entries : [];
    if (incoming.length === 0) {
      return Response.json({ error: "entries が空です" }, { status: 400 });
    }

    const queue = await readQueue();
    const byId = new Map(queue.entries.map((e) => [e.id, e]));
    const now = new Date().toISOString();

    for (const item of incoming) {
      if (!item?.id || typeof item.id !== "string") continue;
      byId.set(item.id, {
        id: item.id,
        kind,
        nameJa: String(item.nameJa ?? item.id),
        file: String(item.file ?? ""),
        variantLabel: item.variantLabel ? String(item.variantLabel) : undefined,
        note: item.note ? String(item.note) : undefined,
        queuedAt: now,
      });
    }

    const next = {
      updatedAt: now,
      entries: [...byId.values()],
    };
    await writeQueue(next);

    return Response.json({
      ok: true,
      added: incoming.length,
      total: next.entries.length,
      path: "data/moeShowcaseDeleteQueue.json",
      queue: next,
    });
  } catch (err) {
    console.error("showcase-delete POST:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "保存失敗" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const queue = await readQueue();
    return Response.json({
      ...queue,
      path: "data/moeShowcaseDeleteQueue.json",
      applyCommand: "npm run apply:showcase-delete",
    });
  } catch (err) {
    console.error("showcase-delete GET:", err);
    return Response.json({ error: "読み込み失敗" }, { status: 500 });
  }
}
