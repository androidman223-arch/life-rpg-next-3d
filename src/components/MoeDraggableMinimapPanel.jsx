"use client";

import { useCallback } from "react";
import { useMoeDraggableResizablePanel } from "@/hooks/useMoeDraggableResizablePanel";
import { useMoePanelCollapsed } from "@/hooks/useMoePanelCollapsed";
import { useMoePanelDockBounds } from "@/hooks/useMoePanelDockBounds";
import MoePanelCollapseToggle from "@/components/MoePanelCollapseToggle";
import { useMoePanelDockOptional } from "@/context/MoePanelDockContext";
import { MOE_DOCK_PANEL_MINIMAP_3D } from "@/lib/moePanelDock";

const DEFAULT_PANEL_W = 320;

function defaultMinimapPos() {
  return {
    x: 12,
    y: Math.max(8, window.innerHeight - 320),
  };
}

/**
 * 全体マップ — ドラッグで移動 · 右下で拡大縮小
 * @param {{ storageKey: string, children: React.ReactNode, hint?: string, dockPanelId?: string | null }} props
 */
export default function MoeDraggableMinimapPanel({
  storageKey,
  children,
  hint,
  dockPanelId = null,
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
    dockPanelId,
  });
  const { collapsed, toggleCollapsed } = useMoePanelCollapsed("minimap");
  const dock = useMoePanelDockOptional();
  const snapHighlight = dock?.snapHighlight ?? false;
  useMoePanelDockBounds(dockPanelId, panelRef, [
    pos?.x,
    pos?.y,
    width,
    collapsed,
  ]);

  if (!pos) return null;

  return (
    <div
      ref={panelRef}
      className={`fixed z-[45] rounded-lg border bg-black/78 text-white shadow-lg backdrop-blur-md transition-[box-shadow,border-color] duration-100 ${collapsed ? "" : "p-1.5"} ${
        snapHighlight
          ? "border-cyan-300/85 shadow-[0_0_0_2px_rgba(34,211,238,0.4),0_0_16px_rgba(34,211,238,0.3)]"
          : "border-white/25"
      }`}
      style={{
        left: pos.x,
        top: pos.y,
        width: collapsed ? "auto" : width,
      }}
    >
      <p
        className={`relative cursor-grab touch-none select-none py-1 pr-2 pl-5 text-center text-[8px] font-bold tracking-wide text-cyan-200/95 active:cursor-grabbing ${collapsed ? "" : "mb-1"}`}
        onPointerDown={onDragPointerDown}
        title="ドラッグで移動 · バトルログを右端に近づけて合体"
      >
        <MoePanelCollapseToggle
          collapsed={collapsed}
          onToggle={toggleCollapsed}
        />
        全体マップ
      </p>
      {!collapsed ? (
        <>
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
        </>
      ) : null}
    </div>
  );
}
