"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMoePanelDockOptional } from "@/context/MoePanelDockContext";

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
  const dockPanelId = opts.dockPanelId ?? null;
  const dock = useMoePanelDockOptional();

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
      setPos((p) => {
        if (!p) return p;
        const next = clampPos(p.x, p.y, el.offsetWidth);
        if (dockPanelId && dock) {
          queueMicrotask(() =>
            dock.notifyParentMoved(dockPanelId, next, el.offsetWidth)
          );
        }
        return next;
      });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [clampPos, dock, dockPanelId, width]);

  useEffect(() => {
    if (!dock || !dockPanelId) return undefined;
    return dock.registerPanel(dockPanelId, {
      setPosition: (nextPos) => {
        setPos((p) => (p ? clampPos(nextPos.x, nextPos.y) : p));
      },
      getWidth: () => sizeRef.current.w,
    });
  }, [clampPos, dock, dockPanelId]);

  const notifyDockFollowers = useCallback(
    (nextPos, nextWidth = sizeRef.current.w) => {
      if (!dockPanelId || !dock) return;
      dock.notifyParentMoved(dockPanelId, nextPos, nextWidth);
    },
    [dock, dockPanelId]
  );

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
        const nextPos = clampPos(
          drag.ox + ev.clientX - drag.startX,
          drag.oy + ev.clientY - drag.startY
        );
        setPos(nextPos);
        notifyDockFollowers(nextPos);
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
    [clampPos, notifyDockFollowers, pos]
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
        setPos((p) => {
          if (!p) return p;
          const nextPos = clampPos(p.x, p.y, nextW);
          notifyDockFollowers(nextPos, nextW);
          return nextPos;
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
    [clampPos, clampWidth, notifyDockFollowers, width, pos]
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
