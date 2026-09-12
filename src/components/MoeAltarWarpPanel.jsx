"use client";

import {
  MOE_ALTAR_WARP_GROUPS,
  moeAltarDestinationsFor,
} from "@/data/moeAltarWarps";

/**
 * @param {{
 *   open: boolean,
 *   altar: import("@/data/moeAltarWarps").MoeAltarDef | null,
 *   onClose: () => void,
 *   onSelect: (destId: string) => void,
 * }} props
 */
export default function MoeAltarWarpPanel({ open, altar, onClose, onSelect }) {
  if (!open || !altar) return null;

  const destinations = moeAltarDestinationsFor(altar.id);

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-label="アルター転送"
      onClick={onClose}
    >
      <div
        className="max-h-[70vh] w-full max-w-md -translate-y-48 overflow-hidden rounded-2xl border border-sky-400/35 bg-zinc-950/95 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/10 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-300/80">
            アルター
          </div>
          <div className="text-base font-bold text-sky-50">{altar.nameJa}</div>
          <div className="mt-0.5 text-xs text-zinc-400">
            転送先を選んでください（時空間移動）
          </div>
        </div>
        <div className="max-h-[52vh] overflow-y-auto px-3 py-3">
          {MOE_ALTAR_WARP_GROUPS.map((group) => {
            const items = destinations.filter((d) => d.group === group.id);
            if (items.length === 0) return null;
            return (
              <div key={group.id} className="mb-3 last:mb-0">
                <div className="mb-1.5 px-1 text-[10px] font-bold text-zinc-500">
                  {group.label}
                </div>
                <ul className="flex flex-col gap-1.5">
                  {items.map((dest) => (
                    <li key={dest.id}>
                      <button
                        type="button"
                        disabled={!dest.available}
                        onClick={() => dest.available && onSelect(dest.id)}
                        className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99] ${
                          dest.available
                            ? "border-sky-500/40 bg-zinc-900/90 hover:bg-zinc-800/95"
                            : "cursor-not-allowed border-zinc-700/50 bg-zinc-900/40 opacity-55"
                        }`}
                      >
                        <span className="text-lg leading-none" aria-hidden>
                          {dest.emoji ?? "📍"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-zinc-100">
                            {dest.nameJa}
                            {!dest.available && (
                              <span className="ml-1.5 text-[10px] font-normal text-zinc-500">
                                未開放
                              </span>
                            )}
                          </span>
                          {dest.subtitle && (
                            <span className="mt-0.5 block text-[11px] text-zinc-400">
                              {dest.subtitle}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="border-t border-white/10 px-4 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-zinc-600/60 bg-zinc-800/80 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-700/90"
          >
            やめる
          </button>
        </div>
      </div>
    </div>
  );
}
