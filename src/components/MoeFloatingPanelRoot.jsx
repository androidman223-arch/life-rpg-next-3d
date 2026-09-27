"use client";

import { forwardRef } from "react";
import { useMoePanelStack } from "@/context/MoePanelStackContext";

/**
 * ドラッグ可能フローティング UI の外枠 — クリックで z-index スタックの最前面へ
 * capture フェーズで前面化（子のドラッグが stopPropagation しても届く）
 * @param {{
 *   panelId: string,
 *   minZIndex?: number,
 *   className?: string,
 *   style?: React.CSSProperties,
 *   children?: React.ReactNode,
 * } & React.HTMLAttributes<HTMLDivElement>} props
 */
const MoeFloatingPanelRoot = forwardRef(function MoeFloatingPanelRoot(
  {
    panelId,
    minZIndex = 0,
    className,
    style,
    children,
    onPointerDown,
    onPointerDownCapture,
    ...rest
  },
  ref
) {
  const { zIndex, onStackPointerDown } = useMoePanelStack(panelId, {
    minZIndex,
  });

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, zIndex }}
      onPointerDownCapture={(e) => {
        onStackPointerDown();
        onPointerDownCapture?.(e);
      }}
      onPointerDown={onPointerDown}
      {...rest}
    >
      {children}
    </div>
  );
});

export default MoeFloatingPanelRoot;
