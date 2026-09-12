/** @typedef {'monster' | 'dragon'} MoeShowcaseKind */

/**
 * @typedef {{
 *   id: string,
 *   kind: MoeShowcaseKind,
 *   nameJa: string,
 *   file: string,
 *   variantLabel?: string,
 *   note?: string,
 *   queuedAt: string,
 * }} MoeShowcaseDeleteQueueEntry
 */

/**
 * @param {MoeShowcaseKind} kind
 * @param {Omit<MoeShowcaseDeleteQueueEntry, 'kind' | 'queuedAt'>[]} entries
 */
export async function appendShowcaseDeleteQueue(kind, entries) {
  if (!entries.length) return { added: 0, total: 0 };
  const res = await fetch("/api/moe/showcase-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, entries }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "削除キューの保存に失敗しました");
  }
  return res.json();
}

/** @returns {Promise<{ updatedAt: string | null, entries: MoeShowcaseDeleteQueueEntry[] }>} */
export async function fetchShowcaseDeleteQueue() {
  const res = await fetch("/api/moe/showcase-delete", { cache: "no-store" });
  if (!res.ok) throw new Error("削除キューの読み込みに失敗しました");
  return res.json();
}
