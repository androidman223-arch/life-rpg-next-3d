"use client";

import { useCallback, useRef, useState } from "react";

/**
 * スキルボタン直上 — ホバー/フォーカスでコンパクト説明（fixed · クリップされない）
 * @param {{ text?: string, children: React.ReactNode, className?: string }} props
 */
export default function MoeCompactSkillTip({ text, children, className = "" }) {
  const wrapRef = useRef(null);
  const [tip, setTip] = useState(null);

  const showTip = useCallback(() => {
    if (!text || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setTip({
      x: r.left + r.width / 2,
      y: r.top - 3,
    });
  }, [text]);

  const hideTip = useCallback(() => setTip(null), []);

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
      {tip && text && (
        <div
          role="tooltip"
          style={{
            position: "fixed",
            left: tip.x,
            top: tip.y,
            transform: "translate(-50%, -100%)",
          }}
          className="pointer-events-none z-[80] w-max max-w-[13rem] whitespace-pre-line rounded border border-white/20 bg-zinc-950/96 px-1.5 py-0.5 text-left text-[10.5px] font-normal leading-[1.35] text-white/90 shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
        >
          {text}
        </div>
      )}
    </>
  );
}
