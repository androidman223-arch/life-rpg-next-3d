"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * @param {string} storageKey
 * @returns {{ x: number, y: number, w?: number } | null}
 */
function loadSavedPanel(storageKey) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.x === "number" && typeof p?.y === "number") {
      return {
        x: p.x,
        y: p.y,
        w: typeof p.w === "number" ? p.w : undefined,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * ドラッグ移動 + 右下ハンドルで幅変更（localStorage 保存）
 * @param {string} storageKey
 * @param {() => { x: number, y: number }} getDefaultPos
 * @param {{ defaultWidth?: number, minWidth?: number, maxWidth?: number }} [opts]
 */
export function useMoeDraggableResizablePanel(
  storageKey,
  getDefaultPos,
  opts = {}
) {
  const defaultWidth = opts.defaultWidth ?? 320;
  const minWidth = opts.minWidth ?? 200;
  const maxWidth = opts.maxWidth ?? 720;

  const [pos, setPos] = useState(null);
  const [width, setWidth] = useState(defaultWidth);
  const canSaveRef = useRef(false);
  const sizeRef = useRef({ w: defaultWidth, h: 32 });
  const panelRef = useRef(null);

  useEffect(() => {
    canSaveRef.current = false;
    const saved = loadSavedPanel(storageKey);
    if (saved) {
      setPos({ x: saved.x, y: saved.y });
      setWidth(saved.w ?? defaultWidth);
    } else {
      setPos(getDefaultPos());
      setWidth(defaultWidth);
    }
    canSaveRef.current = true;
  }, [storageKey, getDefaultPos, defaultWidth]);

  useEffect(() => {
    if (!canSaveRef.current || pos == null) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ x: pos.x, y: pos.y, w: width })
      );
    } catch {
      /* quota */
    }
  }, [pos, width, storageKey]);

  const clampWidth = useCallback(
    (w) => {
      const maxW = Math.min(maxWidth, window.innerWidth - 16);
      return Math.max(minWidth, Math.min(maxW, w));
    },
    [maxWidth, minWidth]
  );

  const clampPos = useCallback((x, y, w = width) => {
    const { h } = sizeRef.current;
    return {
      x: Math.max(4, Math.min(window.innerWidth - w - 4, x)),
      y: Math.max(4, Math.min(window.innerHeight - h - 4, y)),
    };
  }, [width]);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const sync = () => {
      sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
      setPos((p) => (p ? clampPos(p.x, p.y, el.offsetWidth) : p));
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [clampPos, width]);

  const onDragPointerDown = useCallback(
    (e) => {
      if (e.button !== 0 || pos == null) return;
      e.preventDefault();
      e.stopPropagation();
      const drag = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        ox: pos.x,
        oy: pos.y,
      };
      const onMove = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        setPos(
          clampPos(
            drag.ox + ev.clientX - drag.startX,
            drag.oy + ev.clientY - drag.startY
          )
        );
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
    [clampPos, pos]
  );

  const onResizePointerDown = useCallback(
    (e) => {
      if (e.button !== 0 || pos == null) return;
      e.preventDefault();
      e.stopPropagation();
      const drag = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startW: width,
      };
      const onMove = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        const nextW = clampWidth(drag.startW + (ev.clientX - drag.startX));
        setWidth(nextW);
        setPos((p) => (p ? clampPos(p.x, p.y, nextW) : p));
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
    [clampPos, clampWidth, width, pos]
  );

  return {
    pos,
    width,
    panelRef,
    sizeRef,
    onDragPointerDown,
    onResizePointerDown,
  };
}
