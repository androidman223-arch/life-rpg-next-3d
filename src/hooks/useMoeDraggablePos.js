"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function loadSavedPos(storageKey) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.x === "number" && typeof p?.y === "number") {
      return { x: p.x, y: p.y };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * MOE フィールド用：固定パネルをドラッグ移動（localStorage 保存）
 * @param {string} storageKey
 * @param {() => { x: number, y: number }} getDefaultPos
 */
export function useMoeDraggablePos(storageKey, getDefaultPos) {
  /** 未ロード時は null（左上に一瞬出さない・保存位置を上書きしない） */
  const [pos, setPos] = useState(null);
  const canSaveRef = useRef(false);
  const sizeRef = useRef({ w: 130, h: 32 });
  const getDefaultPosRef = useRef(getDefaultPos);
  getDefaultPosRef.current = getDefaultPos;

  useEffect(() => {
    canSaveRef.current = false;
    setPos(loadSavedPos(storageKey) ?? getDefaultPosRef.current());
    canSaveRef.current = true;
  }, [storageKey]);

  useEffect(() => {
    if (!canSaveRef.current || pos == null) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(pos));
    } catch {
      /* quota */
    }
  }, [pos, storageKey]);

  const clampPos = useCallback((x, y) => {
    const { w, h } = sizeRef.current;
    return {
      x: Math.max(4, Math.min(window.innerWidth - w - 4, x)),
      y: Math.max(4, Math.min(window.innerHeight - h - 4, y)),
    };
  }, []);

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

  return { pos, sizeRef, onDragPointerDown };
}
