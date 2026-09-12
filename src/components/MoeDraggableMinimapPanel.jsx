"use client";

import { useCallback } from "react";
import { useMoeDraggableResizablePanel } from "@/hooks/useMoeDraggableResizablePanel";

const DEFAULT_PANEL_W = 320;

function defaultMinimapPos() {
  return {
    x: 12,
    y: Math.max(8, window.innerHeight - 320),
  };
}

/**
 * 全体マップ — ドラッグで移動 · 右下で拡大縮小
 * @param {{ storageKey: string, children: React.ReactNode, hint?: string }} props
 */
export default function MoeDraggableMinimapPanel({
  storageKey,
  children,
  hint,
}) {
  const getDefaultPos = useCallback(defaultMinimapPos, []);
  const {
    pos,
    width,
    panelRef,
    onDragPointerDown,
    onResizePointerDown,
  } = useMoeDraggableResizablePanel(storageKey, getDefaultPos, {
    defaultWidth: DEFAULT_PANEL_W,
    minWidth: 200,
    maxWidth: 760,
  });

  if (!pos) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-[45] rounded-lg border border-white/25 bg-black/78 p-1.5 text-white shadow-lg backdrop-blur-md"
      style={{ left: pos.x, top: pos.y, width }}
    >
      <p
        className="mb-1 cursor-grab touch-none select-none text-center text-[8px] font-bold tracking-wide text-cyan-200/95 active:cursor-grabbing"
        onPointerDown={onDragPointerDown}
        title="ドラッグで移動"
      >
        全体マップ
      </p>
      {children}
      {hint ? (
        <p className="mt-1 text-center text-[7px] text-white/55">{hint}</p>
      ) : null}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="ミニマップサイズ変更"
        className="absolute bottom-0 right-0 z-10 flex h-5 w-5 cursor-nwse-resize touch-none items-end justify-end rounded-br-lg pb-0.5 pr-0.5"
        onPointerDown={onResizePointerDown}
        title="右下をドラッグで拡大・縮小"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className="pointer-events-none text-white/45"
          aria-hidden
        >
          <path
            d="M9 1v8H1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M9 5v4H5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
