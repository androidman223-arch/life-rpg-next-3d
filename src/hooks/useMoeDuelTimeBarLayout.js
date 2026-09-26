"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clampMoeDuelTimeBarLayout,
  loadMoeDuelTimeBarLayout,
  moeDuelTimeBarDefaultLayout,
  saveMoeDuelTimeBarLayout,
} from "@/lib/moeDuelTimeBarLayout";

/**
 * 交戦タイムバー — ドラッグ移動 + 右下で幅変更（localStorage 保存）
 */
export function useMoeDuelTimeBarLayout() {
  const [layout, setLayout] = useState(null);
  const canSaveRef = useRef(false);
  const panelRef = useRef(null);

  useEffect(() => {
    canSaveRef.current = false;
    setLayout(loadMoeDuelTimeBarLayout() ?? moeDuelTimeBarDefaultLayout());
    canSaveRef.current = true;
  }, []);

  useEffect(() => {
    if (!canSaveRef.current || !layout) return;
    saveMoeDuelTimeBarLayout(layout);
  }, [layout]);

  const setClampedLayout = useCallback((next) => {
    setLayout((prev) => clampMoeDuelTimeBarLayout({ ...prev, ...next }));
  }, []);

  const onDragPointerDown = useCallback(
    (e) => {
      if (e.button !== 0 || !layout) return;
      e.preventDefault();
      e.stopPropagation();
      const drag = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        ox: layout.x,
        oy: layout.y,
      };
      const onMove = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        setClampedLayout({
          x: drag.ox + ev.clientX - drag.startX,
          y: drag.oy + ev.clientY - drag.startY,
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

  const onResizePointerDown = useCallback(
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

  return {
    layout,
    panelRef,
    onDragPointerDown,
    onResizePointerDown,
  };
}
