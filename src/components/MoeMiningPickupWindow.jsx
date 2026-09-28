"use client";

import { MOE_UI_GOLD } from "@/components/MoeItemBox";
import { MOE_MINING_ORE_RATE_NOTE } from "@/lib/moeMining";

const SLOT_PX = 32;
const GAP_PX = 2;
const CAP_W = 5;

/**
 * 縦1 × 横6。石をクリックして GET でアイテムボックスへ。
 * @param {{
 *   slots: (object | null)[],
 *   selectedIndex: number | null,
 *   note?: string | null,
 *   onSelect: (index: number | null) => void,
 *   onGet: () => void,
 *   onLeave: () => void,
 * }} props
 */
export default function MoeMiningPickupWindow({
  slots,
  selectedIndex,
  note,
  onSelect,
  onGet,
  onLeave,
}) {
  if (!slots.some(Boolean)) return null;
  const selected = selectedIndex != null ? slots[selectedIndex] ?? null : null;

  return (
    <div
      className="absolute bottom-24 left-1/2 z-[52] -translate-x-1/2 rounded-[5px] shadow-lg"
      style={{
        border: `1px solid ${MOE_UI_GOLD.frame}`,
        background: "#1a160c",
      }}
    >
      <div
        className="relative flex h-4 items-center justify-center text-[9px] font-bold"
        style={{
          color: MOE_UI_GOLD.textOnGold,
          background: `linear-gradient(to bottom, ${MOE_UI_GOLD.capTop}, ${MOE_UI_GOLD.capMid})`,
          borderBottom: `1px solid ${MOE_UI_GOLD.frame}`,
        }}
      >
        採掘
        <button
          type="button"
          onClick={onLeave}
          title="閉じる。宝箱は1分残る"
          aria-label="閉じる。宝箱は1分残る"
          className="absolute right-0.5 top-0 flex h-4 w-4 items-center justify-center text-[10px] leading-none hover:brightness-125"
          style={{ color: MOE_UI_GOLD.captionDark }}
        >
          ×
        </button>
      </div>
      <div className="flex items-stretch px-0.5 py-0.5">
        <div
          className="shrink-0 self-stretch"
          style={{
            width: CAP_W,
            background: `linear-gradient(to bottom, ${MOE_UI_GOLD.capTop}, ${MOE_UI_GOLD.capBot})`,
          }}
          aria-hidden
        />
        <div
          className="grid px-0.5"
          style={{
            gridTemplateColumns: `repeat(6, ${SLOT_PX}px)`,
            gap: GAP_PX,
          }}
          role="grid"
          aria-label="採掘で出た石"
        >
          {slots.map((item, i) => {
            const filled = Boolean(item);
            const selectedSlot = selectedIndex === i;
            return (
              <button
                key={i}
                type="button"
                role="gridcell"
                title={filled ? item.label : `空き ${i + 1}`}
                onClick={() => onSelect(selectedSlot ? null : filled ? i : null)}
                style={{
                  width: SLOT_PX,
                  height: SLOT_PX,
                  border: `1px solid ${
                    selectedSlot ? MOE_UI_GOLD.frameBright : MOE_UI_GOLD.frameEdge
                  }`,
                }}
                className={`relative overflow-hidden rounded-[3px] text-[16px] leading-none ${
                  filled
                    ? "bg-gradient-to-b from-[#4a4020] via-zinc-950 to-black hover:brightness-110 active:scale-95"
                    : "cursor-default bg-gradient-to-b from-zinc-800/90 to-zinc-950"
                }`}
              >
                <span
                  className="pointer-events-none absolute left-0.5 top-0 text-[6px] font-bold leading-none"
                  style={{ color: MOE_UI_GOLD.frameHi }}
                >
                  {i + 1}
                </span>
                <span className="flex h-full w-full items-center justify-center">
                  {filled ? item.emoji ?? "📦" : "·"}
                </span>
              </button>
            );
          })}
        </div>
        <div
          className="shrink-0 self-stretch"
          style={{
            width: CAP_W,
            background: `linear-gradient(to bottom, ${MOE_UI_GOLD.capTop}, ${MOE_UI_GOLD.capBot})`,
          }}
          aria-hidden
        />
      </div>
      <div
        className="flex items-center gap-1 px-1 py-1"
        style={{ borderTop: `1px solid ${MOE_UI_GOLD.frame}` }}
      >
        <button
          type="button"
          onClick={onGet}
          className="shrink-0 rounded-[3px] px-2 py-1 text-[9px] font-bold hover:brightness-110 active:scale-95"
          style={{
            border: `1px solid ${MOE_UI_GOLD.frameHi}`,
            background: `linear-gradient(to bottom, #3a6b2a, ${MOE_UI_GOLD.btnUp})`,
            color: MOE_UI_GOLD.textOnGold,
          }}
        >
          GET
        </button>
        <p className="min-w-0 flex-1 truncate text-[10px] font-bold text-stone-100">
          {selected
            ? `${selected.label}${
                selected.sellGold ? `（売値 ${selected.sellGold}g）` : ""
              }`
            : "石をクリック"}
        </p>
      </div>
      <p className="whitespace-pre-line px-1 pb-1 text-center text-[9px] leading-snug text-stone-200">
        {note || MOE_MINING_ORE_RATE_NOTE}
        {"\n"}閉じると宝箱は1分残る。その間、右クリックでまた開けます
      </p>
    </div>
  );
}
