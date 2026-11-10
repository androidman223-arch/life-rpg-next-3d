"use client";

import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { moeCompactTipPosition } from "@/lib/moeCompactTipPosition";

/**
 * スキルボタンの 説明（ホバー/フォーカスで 小さく出す）
 *
 * 説明は document.body に出す（portal）。
 * 縦スキルUIは うしろをぼかす（backdrop-filter）＋ スクロールの枠なので、
 * 中に出すと fixed が枠の中あつかいになり、切れて見えなかった（2026-11-10 直した）。
 *
 * @param {{
 *   text?: string,
 *   children: React.ReactNode,
 *   className?: string,
 *   placement?: "top" | "side",
 * }} props
 *   placement: "top" = ボタンの上（横のUI）／ "side" = ボタンの横（縦のUI。右に入らなければ左）
 */
export default function MoeCompactSkillTip({
  text,
  children,
  className = "",
  placement = "top",
}) {
  const wrapRef = useRef(null);
  const [anchor, setAnchor] = useState(null);

  const showTip = useCallback(() => {
    if (!text || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setAnchor({
      left: r.left,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
      vw: window.innerWidth,
      vh: window.innerHeight,
    });
  }, [text]);

  const hideTip = useCallback(() => setAnchor(null), []);

  const pos = anchor ? moeCompactTipPosition(anchor, placement) : null;

  return (
    <>
      <div
        ref={wrapRef}
        className={className}
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
        onFocus={showTip}
        onBlur={hideTip}
      >
        {children}
      </div>
      {pos && text && typeof document !== "undefined"
        ? createPortal(
            <div
              role="tooltip"
              style={{
                position: "fixed",
                left: pos.left,
                top: pos.top,
                transform: pos.transform,
                maxWidth: "13rem",
              }}
              className="pointer-events-none z-[200] w-max whitespace-pre-line rounded border border-white/20 bg-zinc-950/96 px-1.5 py-0.5 text-left text-[10.5px] font-normal leading-[1.35] text-white/90 shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
            >
              {text}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
