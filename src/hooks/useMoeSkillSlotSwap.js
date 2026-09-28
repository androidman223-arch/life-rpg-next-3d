"use client";

import { useCallback, useRef, useState } from "react";

const SLOT_ATTR = "data-moe-skill-slot";
const PANEL_ATTR = "data-moe-skill-panel";
const COPY_TARGET_PANELS = new Set(["set1", "set2", "macro"]);
/** 長押しで入れ替えモード開始（ms） */
export const MOE_SKILL_SLOT_LONG_PRESS_MS = 480;
/** 長押し成立前にこの距離以上動くとキャンセル（スクロール誤爆防止） */
const LONG_PRESS_MOVE_CANCEL_PX = 12;

/** @param {Element|null|undefined} el */
function findSkillSlot(el) {
  const node = el?.closest?.(`[${SLOT_ATTR}]`);
  if (!node) return null;
  const n = Number(node.getAttribute(SLOT_ATTR));
  if (!Number.isFinite(n)) return null;
  return { index: n, panelId: node.getAttribute(PANEL_ATTR) || "" };
}

/**
 * スキル枠の長押し→ドラッグ。
 * reorder は同じパネル内の入れ替え。copy はセット1/2へコピー（元は動かさない）。
 * @param {(from: number, to: number) => void} onSwap
 * @param {{ panelId?: string, mode?: 'reorder' | 'copy', onCopy?: (from: number, toPanel: string, toIndex: number) => void }} [options]
 */
export function useMoeSkillSlotSwap(onSwap, options = {}) {
  const panelId = options.panelId || "";
  const mode = options.mode || "reorder";
  const onCopy = options.onCopy;
  const suppressClickRef = useRef(false);
  const dragFromRef = useRef(null);
  const dragOverRef = useRef(null);
  const armedRef = useRef(false);
  const longPressTimerRef = useRef(null);
  const dragCleanupRef = useRef(null);
  const pointerStartRef = useRef({ x: 0, y: 0 });

  const [dragPendingIndex, setDragPendingIndex] = useState(null);
  const [dragArmedIndex, setDragArmedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const resetDrag = useCallback(() => {
    clearLongPressTimer();
    dragCleanupRef.current?.();
    dragCleanupRef.current = null;
    armedRef.current = false;
    dragFromRef.current = null;
    dragOverRef.current = null;
    setDragPendingIndex(null);
    setDragArmedIndex(null);
    setDragOverIndex(null);
  }, [clearLongPressTimer]);

  const bindSlot = useCallback(
    (index, { reorderable = true, copyable = false } = {}) => {
      const interactive =
        (mode === "reorder" && reorderable) || (mode === "copy" && copyable);
      const slotAttr = { [SLOT_ATTR]: index, [PANEL_ATTR]: panelId };
      if (!interactive) {
        return {
          slotAttr,
          onClickCapture: (e) => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              e.preventDefault();
              e.stopPropagation();
            }
          },
        };
      }

      const isArmedSource = dragArmedIndex === index;
      const isDropTarget =
        dragArmedIndex != null &&
        dragOverIndex === index &&
        dragArmedIndex !== index;
      const isPending = dragPendingIndex === index && !isArmedSource;

      let className = "";
      if (isDropTarget) {
        className = "ring-2 ring-cyan-300/90 shadow-[0_0_12px_rgba(34,211,238,0.45)]";
      } else if (isArmedSource) {
        className =
          "ring-2 ring-amber-300/95 shadow-[0_0_14px_rgba(251,191,36,0.65)] brightness-110";
      } else if (isPending) {
        className = "ring-1 ring-white/25";
      }

        return {
          slotAttr,
        onPointerDown: (e) => {
          if (e.button !== 0) return;
          resetDrag();

          dragFromRef.current = index;
          dragOverRef.current = index;
          armedRef.current = false;
          pointerStartRef.current = { x: e.clientX, y: e.clientY };
          setDragPendingIndex(index);
          setDragArmedIndex(null);
          setDragOverIndex(index);

          const armReorder = () => {
            longPressTimerRef.current = null;
            if (dragFromRef.current !== index) return;
            armedRef.current = true;
            setDragPendingIndex(null);
            setDragArmedIndex(index);
          };

          longPressTimerRef.current = window.setTimeout(
            armReorder,
            MOE_SKILL_SLOT_LONG_PRESS_MS
          );

          const onMove = (ev) => {
            if (!armedRef.current) {
              const dx = ev.clientX - pointerStartRef.current.x;
              const dy = ev.clientY - pointerStartRef.current.y;
              if (
                Math.hypot(dx, dy) >= LONG_PRESS_MOVE_CANCEL_PX &&
                longPressTimerRef.current != null
              ) {
                clearLongPressTimer();
                resetDrag();
              }
              return;
            }

            const hit = findSkillSlot(
              document.elementFromPoint(ev.clientX, ev.clientY)
            );
            const accept =
              hit &&
              (mode === "copy"
                ? COPY_TARGET_PANELS.has(hit.panelId)
                : hit.panelId === panelId);
            dragOverRef.current = accept ? hit : null;
            setDragOverIndex(
              accept && mode === "reorder" ? hit.index : null
            );
          };

          const onUp = (ev) => {
            clearLongPressTimer();
            dragCleanupRef.current?.();
            dragCleanupRef.current = null;

            const from = dragFromRef.current;
            const wasArmed = armedRef.current;
            const hit =
              findSkillSlot(document.elementFromPoint(ev.clientX, ev.clientY)) ||
              dragOverRef.current;

            armedRef.current = false;
            dragFromRef.current = null;
            dragOverRef.current = null;
            setDragPendingIndex(null);
            setDragArmedIndex(null);
            setDragOverIndex(null);

            if (wasArmed && from != null && hit) {
              suppressClickRef.current = true;
              if (mode === "copy" && COPY_TARGET_PANELS.has(hit.panelId)) {
                onCopy?.(from, hit.panelId, hit.index);
              } else if (
                mode === "reorder" &&
                hit.panelId === panelId &&
                from !== hit.index
              ) {
                onSwap(from, hit.index);
              }
            }
          };

          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
          window.addEventListener("pointercancel", onUp);

          dragCleanupRef.current = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
          };
        },
        onPointerCancel: resetDrag,
        onClickCapture: (e) => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            e.preventDefault();
            e.stopPropagation();
          }
        },
        className: className || undefined,
        style: isArmedSource
          ? { opacity: 0.88, cursor: "grabbing" }
          : { cursor: "pointer" },
      };
    },
    [
      onSwap,
      onCopy,
      panelId,
      mode,
      dragPendingIndex,
      dragArmedIndex,
      dragOverIndex,
      resetDrag,
      clearLongPressTimer,
    ]
  );

  return {
    bindSlot,
    dragPendingIndex,
    dragArmedIndex,
    dragOverIndex,
    resetDrag,
    slotAttrName: SLOT_ATTR,
  };
}
