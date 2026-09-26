"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clampMoeVerticalSkillPanelLayout,
  loadMoeVerticalSkillPanelInitialLayout,
  saveMoeVerticalSkillPanelLayout,
} from "@/lib/moeVerticalSkillPanelLayout";

/**
 * 縦スキルパネル — 右下ドラッグで幅・ボタン高さ変更
 * @param {string} storageKey
 * @param {string[]} [layoutInheritFrom] 未保存時にコピーする他パネルの storageKey
 */
export function useMoeVerticalSkillPanelLayout(
  storageKey,
  layoutInheritFrom = []
) {
  const [layout, setLayout] = useState(null);
  const canSaveRef = useRef(false);
  const inheritKey = layoutInheritFrom.join("\0");

  useEffect(() => {
    canSaveRef.current = false;
    setLayout(
      loadMoeVerticalSkillPanelInitialLayout(storageKey, layoutInheritFrom)
    );
    canSaveRef.current = true;
  }, [storageKey, inheritKey]);

  useEffect(() => {
    if (!canSaveRef.current || !layout) return;
    saveMoeVerticalSkillPanelLayout(storageKey, layout);
  }, [layout, storageKey]);

  const setClampedLayout = useCallback((next) => {
    setLayout((prev) => clampMoeVerticalSkillPanelLayout({ ...prev, ...next }));
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
        startWidth: layout.width,
        startSlotHeight: layout.slotHeight,
      };
      const onMove = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        setClampedLayout({
          width: drag.startWidth + ev.clientX - drag.startX,
          slotHeight: drag.startSlotHeight + ev.clientY - drag.startY,
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
