"use client";

import { useEffect, useRef } from "react";
import { useMoeBattleLogPanelLayout } from "@/hooks/useMoeBattleLogPanelLayout";
import { useMoePanelCollapsed } from "@/hooks/useMoePanelCollapsed";
import { useMoePanelDockBounds } from "@/hooks/useMoePanelDockBounds";
import MoePanelCollapseToggle from "@/components/MoePanelCollapseToggle";
import { useMoePanelDockOptional } from "@/context/MoePanelDockContext";
import MoeFloatingPanelRoot from "@/components/MoeFloatingPanelRoot";
import { MOE_PANEL_ID_BATTLE_LOG } from "@/lib/moePanelStack";
import { moeFloatingDragTitle } from "@/lib/moePanelStack";

/**
 * @param {{
 *   open: boolean,
 *   entries: { msg: string, color: string, className?: string }[],
 * }} props
 */
export default function MoeBattleLogPanel({ open, entries }) {
  const scrollRef = useRef(null);
  const panelRef = useRef(null);
  const {
    layout,
    onDragPointerDown,
    onResizeWidthPointerDown,
    onResizeHeightPointerDown,
  } = useMoeBattleLogPanelLayout({ dockPanelId: MOE_PANEL_ID_BATTLE_LOG });
  const { collapsed, toggleCollapsed } = useMoePanelCollapsed("battle-log");
  const dock = useMoePanelDockOptional();
  const snapHighlight = dock?.snapHighlight ?? false;
  useMoePanelDockBounds(MOE_PANEL_ID_BATTLE_LOG, panelRef, [
    layout?.x,
    layout?.y,
    layout?.width,
    layout?.height,
    collapsed,
    open,
  ]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [entries]);

  if (!open || !layout) return null;

  return (
    <MoeFloatingPanelRoot
      ref={panelRef}
      panelId={MOE_PANEL_ID_BATTLE_LOG}
      className={`pointer-events-auto fixed flex flex-col overflow-hidden rounded border bg-black/90 shadow-lg transition-[box-shadow,border-color] duration-100 ${
        snapHighlight
          ? "border-cyan-300/90 shadow-[0_0_0_2px_rgba(34,211,238,0.45),0_0_18px_rgba(34,211,238,0.35)]"
          : "border-[#444]"
      }`}
      style={{
        left: layout.x,
        top: layout.y,
        width: layout.width,
        height: collapsed ? "auto" : layout.height,
      }}
      role="log"
      aria-label="バトルログ"
      aria-live="polite"
    >
      <div
        className="relative shrink-0 cursor-move touch-none border-b border-[#333] bg-[rgba(0,40,0,0.55)] py-1 pr-2 pl-5 text-center text-[10px] text-[#6a6] select-none hover:text-[#afa]"
        onPointerDown={onDragPointerDown}
        title={moeFloatingDragTitle(
          "ドラッグで移動 · 全体マップの右端に近づけて合体"
        )}
      >
        <MoePanelCollapseToggle
          collapsed={collapsed}
          onToggle={toggleCollapsed}
        />
        ⋮⋮ バトルログ
      </div>
      {!collapsed ? (
        <>
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2 font-mono text-[12px] leading-[1.4] text-[#00ff00] [scrollbar-width:thin]"
            style={{
              fontFamily: '"Meiryo UI", "Yu Gothic UI", Meiryo, monospace',
            }}
          >
            {entries.length === 0 ? (
              <div className="text-[#6a6]">戦闘メッセージがここに表示されます</div>
            ) : (
              entries.map((entry, i) => (
                <div
                  key={`${i}-${entry.msg.slice(0, 24)}`}
                  className={entry.className || undefined}
                  style={{ color: entry.color }}
                >
                  {entry.msg}
                </div>
              ))
            )}
          </div>
          <div
            className="absolute top-0 right-0 bottom-[7px] w-[7px] cursor-ew-resize touch-none bg-gradient-to-l from-[rgba(0,80,0,0.15)] to-[rgba(0,120,0,0.45)] hover:bg-[rgba(0,140,0,0.55)]"
            onPointerDown={onResizeWidthPointerDown}
            title="ドラッグで幅を変更"
            aria-hidden
          />
          <div
            className="h-[7px] shrink-0 cursor-ns-resize touch-none bg-gradient-to-b from-[rgba(0,80,0,0.15)] to-[rgba(0,120,0,0.45)] hover:bg-[rgba(0,140,0,0.55)]"
            onPointerDown={onResizeHeightPointerDown}
            title="ドラッグで高さを変更"
            aria-hidden
          />
        </>
      ) : null}
    </MoeFloatingPanelRoot>
  );
}
