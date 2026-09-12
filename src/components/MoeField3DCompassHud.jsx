"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function formatMoe3dCoordAxis(value) {
  const n = Math.round(Number(value) || 0);
  return n < 0 ? `-${Math.abs(n)}` : `${n}`;
}

function formatMoe3dCoordLabel(x, y) {
  return `x${formatMoe3dCoordAxis(x)} y${formatMoe3dCoordAxis(y)}`;
}

/** 内部座標（+z＝南）→ HUD 表示（下＝−y） */
function moe3dHudDisplayY(worldY) {
  return -(Number(worldY) || 0);
}

/**
 * 3Dフィールド左上 HUD — コンパス（北＝赤針）· タップで xy 座標表示
 * @param {{ playerX: number, playerY: number, yaw: number }} props
 */
export default function MoeField3DCompassHud({ playerX, playerY, yaw }) {
  const toastTimerRef = useRef(null);
  const [coordLabel, setCoordLabel] = useState(null);
  const displayY = moe3dHudDisplayY(playerY);

  const showCoordLabel = useCallback(() => {
    setCoordLabel(formatMoe3dCoordLabel(playerX, displayY));
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setCoordLabel(null), 3200);
  }, [playerX, displayY]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    []
  );

  const roseDeg = ((Number(yaw) || 0) * 180) / Math.PI;

  return (
    <div
      className="flex shrink-0 flex-col gap-1 rounded-lg border border-white/25 bg-black/70 p-1.5 shadow-lg backdrop-blur-md"
      aria-label="コンパス"
    >
      <button
        type="button"
        onClick={showCoordLabel}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-slate-900/90 shadow-inner transition hover:border-amber-300/50 hover:bg-slate-800/95 active:scale-95"
        title="クリックで座標表示"
        aria-label="コンパス — クリックで座標"
      >
        <svg
          viewBox="0 0 44 44"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <circle
            cx="22"
            cy="22"
            r="19"
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.2"
          />
          <g transform={`rotate(${roseDeg} 22 22)`}>
            <text
              x="22"
              y="9.5"
              textAnchor="middle"
              fontSize="7"
              fontWeight="bold"
              fill="#93c5fd"
            >
              N
            </text>
            <text
              x="22"
              y="38"
              textAnchor="middle"
              fontSize="6"
              fontWeight="bold"
              fill="#fca5a5"
            >
              S
            </text>
            <text
              x="35"
              y="24"
              textAnchor="middle"
              fontSize="6"
              fontWeight="bold"
              fill="#86efac"
            >
              E
            </text>
            <text
              x="9"
              y="24"
              textAnchor="middle"
              fontSize="6"
              fontWeight="bold"
              fill="#c4b5fd"
            >
              W
            </text>
          </g>
          <polygon
            points="22,8 19.5,22 22,19 24.5,22"
            fill="#ef4444"
            stroke="#7f1d1d"
            strokeWidth="0.6"
          />
          <circle cx="22" cy="22" r="2.2" fill="#fbbf24" />
        </svg>
      </button>

      {coordLabel ? (
        <p
          className="max-w-[4.5rem] text-center text-[10px] font-bold tabular-nums leading-tight tracking-tight text-amber-200"
          role="status"
        >
          {coordLabel}
        </p>
      ) : (
        <p className="max-w-[4.5rem] text-center text-[7px] font-bold leading-tight text-white/40">
          タップ＝座標
        </p>
      )}
    </div>
  );
}
