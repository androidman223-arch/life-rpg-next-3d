"use client";

import { useCallback, useEffect, useState } from "react";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import {
  loadMoeItemBoxSelectedIndex,
  loadMoeItemBoxSlots,
  MOE_ITEM_BOX_COLS,
  MOE_ITEM_BOX_ROWS,
  MOE_ITEM_SLOT_COUNT,
  MOE_ITEM_BOX_SELECTED_EVENT,
  MOE_ITEM_BOX_SLOTS_EVENT,
  notifyMoeItemBoxSelectedChanged,
  saveMoeItemBoxSelectedIndex,
  saveMoeItemBoxSlots,
} from "@/lib/moeItemBoxStorage";
import MoeHolyRecordIcon from "@/components/icons/MoeHolyRecordIcon";
import MoeExperiencePowderIcon from "@/components/MoeExperiencePowderIcon";
import MoeExperienceCubeIcon from "@/components/MoeExperienceCubeIcon";

export { MOE_ITEM_BOX_COLS, MOE_ITEM_BOX_ROWS, MOE_ITEM_SLOT_COUNT };

const STORAGE_KEY = "life-rpg-moe-item-box-pos";
const GOLD_STORAGE_KEY = "life-rpg-moe-item-box-gold";
const SLOT_PX = 32;
const CAP_W = 5;
const SLOT_GAP_PX = 2;

/** MOE 本家 skin1.ini / skin1.bmp 準拠（黄みの強いゴールド） */
export const MOE_UI_GOLD = {
  frame: "#d3c880",
  frameHi: "#e2c06f",
  frameBright: "#ffaf21",
  frameEdge: "#dabc76",
  capTop: "#f5e8b0",
  capMid: "#e1cd6f",
  capBot: "#b8944a",
  cream: "#e7e4c3",
  caption: "#5b1e2c",
  captionDark: "#3a1218",
  btnUp: "#274b19",
  btnDown: "#1a3310",
  money: "#e2c06f",
  slotSel: "#fde047",
  textOnGold: "#fffef5",
};

function defaultPos() {
  const gridW =
    CAP_W * 2 +
    MOE_ITEM_BOX_COLS * SLOT_PX +
    (MOE_ITEM_BOX_COLS - 1) * SLOT_GAP_PX +
    16;
  const gridH =
    MOE_ITEM_BOX_ROWS * SLOT_PX + (MOE_ITEM_BOX_ROWS - 1) * SLOT_GAP_PX + 8;
  const footerH = 34;
  const headerH = 22;
  const totalH = headerH + 1 + gridH + 1 + footerH;
  return {
    x: Math.max(8, window.innerWidth - gridW - 12),
    y: Math.max(8, window.innerHeight - totalH - 96),
  };
}

function loadGold() {
  if (typeof window === "undefined") return 100;
  try {
    const raw = localStorage.getItem(GOLD_STORAGE_KEY);
    if (raw == null) return 100;
    const n = Math.floor(Number(raw));
    return Number.isFinite(n) ? Math.max(0, n) : 100;
  } catch {
    return 100;
  }
}

function saveGold(g) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GOLD_STORAGE_KEY, String(Math.max(0, Math.floor(g))));
  } catch {
    /* quota */
  }
}

function emptySlots() {
  return Array.from({ length: MOE_ITEM_SLOT_COUNT }, () => null);
}

function ItemSlotIcon({ item }) {
  if (!item) return "·";
  if (item.iconKind === "pink_sand_mound" || item.iconKind === "level_down_powder") {
    return (
      <span
        className={
          item.iconKind === "level_down_powder"
            ? "inline-flex hue-rotate-[280deg] saturate-125"
            : undefined
        }
      >
        <MoeExperiencePowderIcon size={22} />
      </span>
    );
  }
  if (item.iconKind === "experience_cube" || item.iconKind === "level_down_cube") {
    return (
      <span
        className={
          item.iconKind === "level_down_cube"
            ? "inline-flex hue-rotate-[280deg] saturate-125"
            : undefined
        }
      >
        <MoeExperienceCubeIcon size={22} />
      </span>
    );
  }
  if (item.iconKind === "ninja_tabi") {
    return (
      <span className="text-[16px] leading-none" aria-hidden>
        {item.emoji ?? "🧦"}
      </span>
    );
  }
  if (item.iconKind === "phoenix_feather") {
    return (
      <span className="text-[16px] leading-none" aria-hidden>
        {item.emoji ?? "🪶"}
      </span>
    );
  }
  if (item.iconKind === "holy_record") {
    return <MoeHolyRecordIcon size={22} />;
  }
  return item.emoji ?? "📦";
}

/**
 * MOE風アイテムボックス（5×4 · ドラッグ可）
 * @param {{
 *   onUse?: (slotIndex: number, item: object | null) => void,
 *   onTrash?: (slotIndex: number, item: object | null) => void,
 *   onToast?: (message: string) => void,
 * }} props
 */
export default function MoeItemBox({ onUse, onTrash, onToast }) {
  const getDefaultPos = useCallback(defaultPos, []);
  const { pos, sizeRef, onDragPointerDown } = useMoeDraggablePos(
    STORAGE_KEY,
    getDefaultPos
  );

  const [slots, setSlots] = useState(emptySlots);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [gold, setGold] = useState(100);
  const [trashConfirmOpen, setTrashConfirmOpen] = useState(false);

  const syncSlotsFromStorage = useCallback(() => {
    setSlots(loadMoeItemBoxSlots());
  }, []);

  useEffect(() => {
    setGold(loadGold());
    setSelectedIndex(loadMoeItemBoxSelectedIndex());
    syncSlotsFromStorage();
  }, [syncSlotsFromStorage]);

  useEffect(() => {
    const onSlotsChanged = () => syncSlotsFromStorage();
    window.addEventListener(MOE_ITEM_BOX_SLOTS_EVENT, onSlotsChanged);
    return () =>
      window.removeEventListener(MOE_ITEM_BOX_SLOTS_EVENT, onSlotsChanged);
  }, [syncSlotsFromStorage]);

  useEffect(() => {
    const onSelectedChanged = (event) => {
      const index = event?.detail?.index;
      setSelectedIndex(
        typeof index === "number" && index >= 0 ? index : loadMoeItemBoxSelectedIndex()
      );
    };
    window.addEventListener(MOE_ITEM_BOX_SELECTED_EVENT, onSelectedChanged);
    return () =>
      window.removeEventListener(MOE_ITEM_BOX_SELECTED_EVENT, onSelectedChanged);
  }, []);

  const selectSlot = useCallback((index) => {
    setSelectedIndex(index);
    saveMoeItemBoxSelectedIndex(index);
    if (index != null) notifyMoeItemBoxSelectedChanged(index);
  }, []);

  const updateSlots = useCallback((updater) => {
    setSlots((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveMoeItemBoxSlots(next);
      return next;
    });
  }, []);

  const selectedItem =
    selectedIndex != null ? slots[selectedIndex] ?? null : null;

  const handleUse = useCallback(() => {
    if (selectedIndex == null) {
      onToast?.("使うアイテムを選んでください");
      return;
    }
    if (!selectedItem) {
      onToast?.("空のマスです");
      return;
    }
    onUse?.(selectedIndex, selectedItem);
  }, [onToast, onUse, selectedIndex, selectedItem]);

  const handleTrash = useCallback(() => {
    if (selectedIndex == null) {
      onToast?.("捨てるアイテムを選んでください");
      return;
    }
    if (!selectedItem) {
      onToast?.("空のマスです");
      return;
    }
    setTrashConfirmOpen(true);
  }, [onToast, selectedIndex, selectedItem]);

  const cancelTrashConfirm = useCallback(() => {
    setTrashConfirmOpen(false);
  }, []);

  const confirmTrash = useCallback(() => {
    if (selectedIndex == null || !selectedItem) {
      setTrashConfirmOpen(false);
      return;
    }
    const label = selectedItem.label ?? "アイテム";
    updateSlots((prev) => {
      const next = [...prev];
      next[selectedIndex] = null;
      return next;
    });
    onTrash?.(selectedIndex, selectedItem);
    onToast?.(`${label}を捨てた`);
    setTrashConfirmOpen(false);
  }, [onToast, onTrash, selectedIndex, selectedItem, updateSlots]);

  if (!pos) return null;

  return (
    <div
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed z-[46] select-none"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        className="overflow-hidden rounded-[5px] bg-black"
        style={{
          border: `1px solid ${MOE_UI_GOLD.frameEdge}`,
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,236,180,0.4), 0 0 6px rgba(255,175,33,0.12)",
        }}
      >
        <div
          className="cursor-grab touch-none px-2 py-0.5 active:cursor-grabbing"
          style={{
            borderBottom: `1px solid ${MOE_UI_GOLD.frameHi}`,
            background: `linear-gradient(to bottom, ${MOE_UI_GOLD.caption}, ${MOE_UI_GOLD.captionDark})`,
          }}
          onPointerDown={onDragPointerDown}
          title="ドラッグで移動"
        >
          <p
            className="text-center text-[8px] font-bold leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
            style={{ color: MOE_UI_GOLD.textOnGold }}
          >
            Item
          </p>
        </div>
        <div
          className="h-px shrink-0"
          style={{ backgroundColor: MOE_UI_GOLD.frameBright }}
          aria-hidden
        />

        <div
          className="flex items-stretch bg-zinc-950 p-1"
          style={{ borderBottom: `1px solid ${MOE_UI_GOLD.frame}` }}
        >
          <div
            className="shrink-0 self-stretch"
            style={{
              width: CAP_W,
              borderRight: `1px solid ${MOE_UI_GOLD.frameHi}`,
              background: `linear-gradient(to bottom, ${MOE_UI_GOLD.capTop}, ${MOE_UI_GOLD.capMid}, ${MOE_UI_GOLD.capBot})`,
            }}
            aria-hidden
          />
          <div
            className="grid min-w-0 flex-1 px-0.5"
            style={{
              gridTemplateColumns: `repeat(${MOE_ITEM_BOX_COLS}, ${SLOT_PX}px)`,
              gap: SLOT_GAP_PX,
            }}
            role="grid"
            aria-label="アイテム 1〜20"
          >
            {slots.map((item, i) => {
              const filled = Boolean(item);
              const selected = selectedIndex === i;
              return (
                <button
                  key={i}
                  type="button"
                  role="gridcell"
                  title={
                    filled
                      ? item.label ?? `アイテム ${i + 1}`
                      : `空き ${i + 1}`
                  }
                  onClick={() => {
                    setTrashConfirmOpen(false);
                    selectSlot(selectedIndex === i ? null : i);
                  }}
                  style={{
                    width: SLOT_PX,
                    height: SLOT_PX,
                    border: `1px solid ${selected ? MOE_UI_GOLD.frameBright : MOE_UI_GOLD.frameEdge}`,
                    boxShadow: selected
                      ? `0 0 0 1px ${MOE_UI_GOLD.slotSel}, inset 0 1px 0 rgba(255,236,180,0.22)`
                      : "inset 0 1px 0 rgba(255,236,180,0.1)",
                  }}
                  className={`relative shrink-0 overflow-hidden rounded-[3px] transition active:scale-95 ${
                    filled
                      ? "bg-gradient-to-b from-[#4a4020] via-zinc-950 to-black text-[#fff8e7] shadow-[0_1px_3px_rgba(0,0,0,0.45)] hover:brightness-110"
                      : "cursor-default bg-gradient-to-b from-zinc-800/90 to-zinc-950 opacity-90"
                  }`}
                >
                  <span
                    className="pointer-events-none absolute left-0.5 top-0 text-[6px] font-bold tabular-nums leading-none"
                    style={{
                      color: filled ? MOE_UI_GOLD.frameHi : `${MOE_UI_GOLD.frame}99`,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="pointer-events-none flex h-full w-full items-center justify-center leading-none">
                    {filled ? <ItemSlotIcon item={item} /> : "·"}
                  </span>
                </button>
              );
            })}
          </div>
          <div
            className="shrink-0 self-stretch"
            style={{
              width: CAP_W,
              borderLeft: `1px solid ${MOE_UI_GOLD.frameHi}`,
              background: `linear-gradient(to bottom, ${MOE_UI_GOLD.capTop}, ${MOE_UI_GOLD.capMid}, ${MOE_UI_GOLD.capBot})`,
            }}
            aria-hidden
          />
        </div>

        <div
          className="h-px shrink-0"
          style={{ backgroundColor: MOE_UI_GOLD.frameBright }}
          aria-hidden
        />

        <div
          className="flex h-[34px] items-stretch bg-gradient-to-b from-zinc-800 to-zinc-950 px-1 py-1"
          style={{
            borderTop: `1px solid ${MOE_UI_GOLD.frame}`,
            backgroundColor: MOE_UI_GOLD.cream,
            backgroundImage:
              "linear-gradient(to bottom, rgba(231,228,195,0.14), rgba(0,0,0,0.92))",
          }}
        >
          <button
            type="button"
            onClick={handleUse}
            className="min-w-[3.25rem] shrink-0 rounded-[3px] px-2 text-[9px] font-bold shadow-sm transition hover:brightness-110 active:scale-95"
            style={{
              border: `1px solid ${MOE_UI_GOLD.frameHi}`,
              background: `linear-gradient(to bottom, #3a6b2a, ${MOE_UI_GOLD.btnUp})`,
              color: MOE_UI_GOLD.textOnGold,
            }}
          >
            USE
          </button>
          <div
            className="flex min-w-0 flex-1 items-center justify-center px-1"
            style={{
              borderLeft: `1px solid ${MOE_UI_GOLD.frame}`,
              borderRight: `1px solid ${MOE_UI_GOLD.frame}`,
            }}
          >
            <span
              className="font-mono text-[11px] font-bold tabular-nums drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]"
              style={{ color: MOE_UI_GOLD.money }}
            >
              {gold.toLocaleString()}g
            </span>
          </div>
          <button
            type="button"
            onClick={handleTrash}
            title="選択中のアイテムを捨てる"
            className="flex h-full w-9 shrink-0 items-center justify-center rounded-[3px] bg-gradient-to-b from-zinc-700 to-zinc-900 text-[15px] leading-none transition hover:brightness-110 active:scale-95"
            style={{ border: `1px solid ${MOE_UI_GOLD.frameEdge}` }}
            aria-label="ゴミ箱"
          >
            🗑
          </button>
        </div>
      </div>

      {trashConfirmOpen && selectedItem ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="moe-item-trash-confirm-title"
          onClick={cancelTrashConfirm}
        >
          <div
            className="w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-[5px] shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
            style={{
              border: `1px solid ${MOE_UI_GOLD.frameEdge}`,
              background: `linear-gradient(to bottom, ${MOE_UI_GOLD.cream}, #1a1810)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              id="moe-item-trash-confirm-title"
              className="px-2 py-1.5 text-center text-[9px] font-bold leading-snug"
              style={{ color: MOE_UI_GOLD.captionDark }}
            >
              本当にこれを捨てますか？
            </p>
            <div
              className="flex items-center justify-center gap-1.5 border-y px-2 py-1.5"
              style={{
                borderColor: `${MOE_UI_GOLD.frame}88`,
                background: "rgba(0,0,0,0.35)",
              }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-zinc-900/80 text-[15px]">
                <ItemSlotIcon item={selectedItem} />
              </span>
              <span
                className="min-w-0 flex-1 text-[9px] font-bold leading-tight"
                style={{ color: MOE_UI_GOLD.textOnGold }}
              >
                {selectedItem.label ?? "アイテム"}
              </span>
            </div>
            <div className="flex gap-1 p-1.5">
              <button
                type="button"
                onClick={confirmTrash}
                className="min-w-0 flex-1 rounded-[3px] px-2 py-1 text-[9px] font-bold shadow-sm transition hover:brightness-110 active:scale-95"
                style={{
                  border: `1px solid ${MOE_UI_GOLD.frameHi}`,
                  background: `linear-gradient(to bottom, #7a1f1f, #4a1010)`,
                  color: MOE_UI_GOLD.textOnGold,
                }}
              >
                はい
              </button>
              <button
                type="button"
                onClick={cancelTrashConfirm}
                className="min-w-0 flex-1 rounded-[3px] px-2 py-1 text-[9px] font-bold shadow-sm transition hover:brightness-110 active:scale-95"
                style={{
                  border: `1px solid ${MOE_UI_GOLD.frameHi}`,
                  background: `linear-gradient(to bottom, #3a6b2a, ${MOE_UI_GOLD.btnUp})`,
                  color: MOE_UI_GOLD.textOnGold,
                }}
              >
                いいえ
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { loadGold as loadMoeItemBoxGold, saveGold as saveMoeItemBoxGold };
