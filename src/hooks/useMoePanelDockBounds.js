"use client";

import { useLayoutEffect } from "react";
import { useMoePanelDockOptional } from "@/context/MoePanelDockContext";

/**
 * ドッキング用にパネルの画面座標を共有
 * @param {string | null | undefined} panelId
 * @param {React.RefObject<HTMLElement | null>} panelRef
 * @param {unknown[]} deps 位置・サイズ変化の再計測トリガー
 */
export function useMoePanelDockBounds(panelId, panelRef, deps = []) {
  const dock = useMoePanelDockOptional();

  useLayoutEffect(() => {
    if (!dock || !panelId) return undefined;
    const el = panelRef.current;
    if (!el) return undefined;

    const report = () => {
      const node = panelRef.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      dock.reportBounds(panelId, {
        x: r.left,
        y: r.top,
        width: r.width,
        height: r.height,
      });
      dock.syncDockedChild();
    };

    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    window.addEventListener("resize", report);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", report);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps は呼び出し側の再計測用
  }, [dock, panelId, panelRef, ...deps]);
}
