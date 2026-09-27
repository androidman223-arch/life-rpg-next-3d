"use client";

import { useCallback } from "react";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import MoeFloatingPanelRoot from "@/components/MoeFloatingPanelRoot";
import {
  MOE_PANEL_ID_FIELD_SETTINGS,
  moeFloatingDragTitle,
} from "@/lib/moePanelStack";

const PANEL_W = 280;

function defaultPos() {
  return { x: 12, y: 12 };
}

/**
 * フィールド設定 — ドラッグ移動 · クリックで手前
 * @param {{ open: boolean, onClose: () => void, children: React.ReactNode }} props
 */
export default function MoeFieldSettingsPanel({ open, onClose, children }) {
  const { pos, panelRef, onDragPointerDown } = useMoeDraggablePos(
    MOE_PANEL_ID_FIELD_SETTINGS,
    defaultPos
  );

  const onHeaderPointerDown = useCallback(
    (e) => {
      onDragPointerDown(e);
    },
    [onDragPointerDown]
  );

  if (!open || pos == null) return null;

  return (
    <MoeFloatingPanelRoot
      ref={panelRef}
      panelId={MOE_PANEL_ID_FIELD_SETTINGS}
      className="pointer-events-auto fixed max-w-[min(92vw,20rem)] rounded-lg border border-white/20 bg-black/75 text-xs text-white/90 shadow-xl backdrop-blur-md"
      style={{ left: pos.x, top: pos.y, width: PANEL_W }}
    >
      <div
        className="flex cursor-grab touch-none select-none items-center justify-between gap-2 border-b border-white/10 px-2 py-1.5 active:cursor-grabbing"
        onPointerDown={onHeaderPointerDown}
        title={moeFloatingDragTitle("ドラッグで移動")}
      >
        <p className="text-[11px] font-bold text-zinc-200">設定</p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded border border-white/20 px-1.5 py-0.5 text-[9px] text-white/70 hover:bg-white/10"
          aria-label="設定を閉じる"
        >
          閉じる
        </button>
      </div>
      <div className="flex max-h-[min(70vh,28rem)] flex-col gap-1.5 overflow-y-auto px-2 py-2">
        {children}
      </div>
    </MoeFloatingPanelRoot>
  );
}
