"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clampMoeItemBoxLayout,
  loadMoeItemBoxLayout,
  moeItemBoxColsFromResize,
  moeItemBoxDefaultLayout,
  saveMoeItemBoxLayout,
} from "@/lib/moeItemBoxLayout";

/**
 * アイテムボックス — 右下ドラッグで列数変更（行は自動 · スロット32px固定）
 */
export function useMoeItemBoxLayout() {
  const [layout, setLayout] = useState(null);
  const canSaveRef = useRef(false);

  useEffect(() => {
    canSaveRef.current = false;
    setLayout(loadMoeItemBoxLayout() ?? moeItemBoxDefaultLayout());
    canSaveRef.current = true;
  }, []);

  useEffect(() => {
    if (!canSaveRef.current || !layout) return;
    saveMoeItemBoxLayout(layout);
  }, [layout]);

  const setClampedLayout = useCallback((next) => {
    setLayout((prev) => clampMoeItemBoxLayout({ ...prev, ...next }));
  }, []);

  const onResizePointerDown = useCallback(
    (e) => {
      if (e.button !== 0 || !layout) return;
      e.preventDefault();
      e.stopPropagation();
      const drag = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startCols: layout.cols,
      };
      const onMove = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        setClampedLayout({
          cols: moeItemBoxColsFromResize(
            drag.startCols,
            ev.clientX - drag.startX,
            ev.clientY - drag.startY
          ),
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

  return { layout, onResizePointerDown };
}
