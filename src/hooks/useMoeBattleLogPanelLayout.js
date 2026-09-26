"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMoePanelDockOptional } from "@/context/MoePanelDockContext";
import {
  clampMoeBattleLogLayout,
  loadMoeBattleLogLayout,
  moeBattleLogDefaultLayout,
  saveMoeBattleLogLayout,
} from "@/lib/moeBattleLogLayout";

/**
 * バトルログ — ドラッグ移動 + 幅・高さリサイズ（localStorage 保存）
 * @param {{ dockPanelId?: string | null }} [opts]
 */
export function useMoeBattleLogPanelLayout(opts = {}) {
  const dockPanelId = opts.dockPanelId ?? null;
  const dock = useMoePanelDockOptional();
  const [layout, setLayout] = useState(null);
  const canSaveRef = useRef(false);
  const lastDragPosRef = useRef(null);

  useEffect(() => {
    canSaveRef.current = false;
    setLayout(loadMoeBattleLogLayout() ?? moeBattleLogDefaultLayout());
    canSaveRef.current = true;
  }, []);

  useEffect(() => {
    if (!canSaveRef.current || !layout) return;
    saveMoeBattleLogLayout(layout);
  }, [layout]);

  const setClampedLayout = useCallback((next) => {
    setLayout((prev) => clampMoeBattleLogLayout({ ...prev, ...next }));
  }, []);

  useEffect(() => {
    if (!dock || !dockPanelId) return undefined;
    return dock.registerPanel(dockPanelId, {
      setPosition: (pos) => {
        setClampedLayout({ x: pos.x, y: pos.y });
      },
    });
  }, [dock, dockPanelId, setClampedLayout]);

  const onDragPointerDown = useCallback(
    (e) => {
      if (e.button !== 0 || !layout) return;
      e.preventDefault();
      e.stopPropagation();
      if (dockPanelId) {
        dock?.releaseDockIfChild(dockPanelId);
        dock?.clearSnapPreview();
      }
      const drag = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        ox: layout.x,
        oy: layout.y,
      };
      lastDragPosRef.current = { x: layout.x, y: layout.y };
      const onMove = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        const raw = {
          x: drag.ox + ev.clientX - drag.startX,
          y: drag.oy + ev.clientY - drag.startY,
        };
        const next =
          dock && dockPanelId
            ? dock.previewSnapChildPosition(dockPanelId, raw)
            : raw;
        lastDragPosRef.current = next;
        setClampedLayout(next);
      };
      const onUp = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        if (!dockPanelId || !dock) return;
        const finalPos =
          lastDragPosRef.current ?? { x: layout.x, y: layout.y };
        dock.clearSnapPreview();
        const snapped = dock.trySnapChildOnDragEnd(dockPanelId, finalPos);
        setClampedLayout(snapped);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [dock, dockPanelId, layout, setClampedLayout]
  );

  const onResizeWidthPointerDown = useCallback(
    (e) => {
      if (e.button !== 0 || !layout) return;
      e.preventDefault();
      e.stopPropagation();
      const drag = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startWidth: layout.width,
      };
      const onMove = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        setClampedLayout({
          width: drag.startWidth + ev.clientX - drag.startX,
        });
      };
      const onUp = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [layout, setClampedLayout]
  );

  const onResizeHeightPointerDown = useCallback(
    (e) => {
      if (e.button !== 0 || !layout) return;
      e.preventDefault();
      e.stopPropagation();
      const drag = {
        pointerId: e.pointerId,
        startY: e.clientY,
        startHeight: layout.height,
      };
      const onMove = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        setClampedLayout({
          height: drag.startHeight + ev.clientY - drag.startY,
        });
      };
      const onUp = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [layout, setClampedLayout]
  );

  return {
    layout,
    onDragPointerDown,
    onResizeWidthPointerDown,
    onResizeHeightPointerDown,
  };
}
