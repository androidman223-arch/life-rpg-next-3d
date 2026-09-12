"use client";

/**
 * 展示モデル — クリックで削除リストへ · 一括非表示
 * @param {{
 *   kind: 'monster' | 'dragon',
 *   lineup: { id: string, nameJa: string, variantLabel?: string, note?: string, familyId?: string }[],
 *   families?: { id: string, nameJa: string }[],
 *   hiddenIds: string[],
 *   deleteListIds: string[],
 *   onToggleDeleteList: (id: string) => void,
 *   onRemoveFromDeleteList: (id: string) => void,
 *   onApplyDelete: () => void,
 *   onClearDeleteList: () => void,
 *   onRestoreHidden: (id: string) => void,
 *   onRestoreAllHidden: () => void,
 *   theme?: 'rose' | 'amber',
 * }} props
 */
export default function MoeShowcaseDeletePicker({
  kind,
  lineup,
  families = [],
  hiddenIds,
  deleteListIds,
  onToggleDeleteList,
  onRemoveFromDeleteList,
  onApplyDelete,
  onClearDeleteList,
  onRestoreHidden,
  onRestoreAllHidden,
  theme = "rose",
}) {
  const hiddenSet = new Set(hiddenIds);
  const deleteSet = new Set(deleteListIds);
  const accent =
    theme === "amber"
      ? {
          border: "border-amber-500/35",
          bg: "bg-amber-950/35",
          title: "text-amber-100",
          chipOn: "border-rose-400/70 bg-rose-950/60 text-rose-100",
          chipIdle: "border-slate-600/55 bg-slate-900/70 text-slate-200 hover:border-rose-400/45",
          chipHidden: "border-zinc-700/50 bg-zinc-950/80 text-zinc-500",
          listBg: "bg-rose-950/40 border-rose-500/30",
          btn: "border-rose-400/55 bg-rose-900/50 text-rose-50 hover:bg-rose-800/55",
        }
      : {
          border: "border-rose-500/35",
          bg: "bg-rose-950/35",
          title: "text-rose-100",
          chipOn: "border-rose-400/70 bg-rose-950/60 text-rose-100",
          chipIdle: "border-slate-600/55 bg-slate-900/70 text-slate-200 hover:border-rose-400/45",
          chipHidden: "border-zinc-700/50 bg-zinc-950/80 text-zinc-500",
          listBg: "bg-rose-950/40 border-rose-500/30",
          btn: "border-rose-400/55 bg-rose-900/50 text-rose-50 hover:bg-rose-800/55",
        };

  const labelFor = (v) => {
    const sub = v.variantLabel ?? v.note ?? "";
    return sub ? `${v.nameJa} · ${sub}` : v.nameJa;
  };

  const renderChip = (v) => {
    const hidden = hiddenSet.has(v.id);
    const inList = deleteSet.has(v.id);
    return (
      <button
        key={v.id}
        type="button"
        title={
          hidden
            ? "非表示中 — クリックで元に戻す"
            : inList
              ? "削除リストから外す"
              : "削除リストに追加"
        }
        onClick={() => {
          if (hidden) onRestoreHidden(v.id);
          else onToggleDeleteList(v.id);
        }}
        className={`rounded border px-1.5 py-1 text-left text-[9px] leading-snug transition active:scale-[0.98] ${
          hidden ? accent.chipHidden : inList ? accent.chipOn : accent.chipIdle
        }`}
      >
        <span className="font-bold">{v.nameJa}</span>
        {(v.variantLabel ?? v.note) ? (
          <span className="block text-[8px] opacity-80">
            {v.variantLabel ?? v.note}
          </span>
        ) : null}
        {hidden ? (
          <span className="mt-0.5 block text-[7px] text-zinc-500">非表示中</span>
        ) : inList ? (
          <span className="mt-0.5 block text-[7px] text-rose-300/90">
            削除リスト
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div
      className={`mt-2 rounded-lg border px-2 py-2 ${accent.border} ${accent.bg}`}
    >
      <p className={`text-[10px] font-bold ${accent.title}`}>
        削除したいモデルを選ぶ（クリックで削除リストへ）
      </p>

      {kind === "monster" && families.length > 0 ? (
        <div className="mt-2 max-h-40 space-y-2 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
          {families.map((fam) => {
            const pair = lineup.filter((m) => m.familyId === fam.id);
            if (pair.length === 0) return null;
            return (
              <section key={fam.id}>
                <p className="text-[8px] font-bold text-slate-400">{fam.nameJa}</p>
                <div className="mt-0.5 grid grid-cols-2 gap-1 sm:grid-cols-3">
                  {pair.map(renderChip)}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mt-2 grid max-h-40 grid-cols-2 gap-1 overflow-y-auto overscroll-contain sm:grid-cols-3 md:grid-cols-5 [scrollbar-width:thin]">
          {lineup.map(renderChip)}
        </div>
      )}

      <div className={`mt-2 rounded border px-2 py-1.5 ${accent.listBg}`}>
        <p className="text-[9px] font-bold text-rose-100/95">
          削除リスト（{deleteListIds.length}件）
        </p>
        {deleteListIds.length === 0 ? (
          <p className="mt-1 text-[8px] text-slate-400">
            上のモデルをクリックして追加
          </p>
        ) : (
          <ul className="mt-1 flex flex-wrap gap-1">
            {deleteListIds.map((id) => {
              const v = lineup.find((x) => x.id === id);
              if (!v) return null;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onRemoveFromDeleteList(id)}
                    className="rounded border border-rose-400/50 bg-rose-950/70 px-1.5 py-0.5 text-[8px] font-bold text-rose-100 hover:bg-rose-900/70"
                    title="リストから外す"
                  >
                    {labelFor(v)} ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            disabled={deleteListIds.length === 0}
            onClick={onApplyDelete}
            className={`rounded border px-2 py-1 text-[9px] font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${accent.btn}`}
          >
            削除リストを保存＋非表示
          </button>
          <button
            type="button"
            disabled={deleteListIds.length === 0}
            onClick={onClearDeleteList}
            className="rounded border border-slate-500/45 bg-slate-900/60 px-2 py-1 text-[9px] font-bold text-slate-200 transition hover:bg-slate-800/70 disabled:opacity-40"
          >
            リストクリア
          </button>
          <button
            type="button"
            disabled={hiddenIds.length === 0}
            onClick={onRestoreAllHidden}
            className="rounded border border-emerald-500/40 bg-emerald-950/45 px-2 py-1 text-[9px] font-bold text-emerald-100 transition hover:bg-emerald-900/40 disabled:opacity-40"
          >
            非表示をすべて戻す
          </button>
        </div>
        {hiddenIds.length > 0 ? (
          <p className="mt-1 text-[8px] text-slate-400">
            非表示中: {hiddenIds.length}体（フィールド・一覧から消えます）
          </p>
        ) : null}
        <p className="mt-1.5 text-[8px] leading-snug text-sky-200/75">
          保存先:{" "}
          <code className="rounded bg-black/40 px-0.5">data/moeShowcaseDeleteQueue.json</code>
          <br />
          Cursor確認:{" "}
          <code className="rounded bg-black/40 px-0.5">npm run apply:showcase-delete:dry-run</code>
          {" → "}
          <code className="rounded bg-black/40 px-0.5">npm run apply:showcase-delete</code>
        </p>
      </div>
    </div>
  );
}
