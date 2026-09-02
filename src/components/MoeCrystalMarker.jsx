"use client";

import { useId } from "react";

/** MOE風クリスタル▼（2D頭上マーカー用） */
export default function MoeCrystalMarker({ size = 9, className = "" }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `crystal-grad-${uid}`;
  const glowId = `crystal-glow-${uid}`;
  const h = Math.round(size * 1.15);

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 18 22"
      className={`drop-shadow-[0_0_8px_rgba(52,211,153,0.75)] ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="9" y1="1" x2="9" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0fdf4" />
          <stop offset="28%" stopColor="#a7f3d0" />
          <stop offset="62%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M9 1 L16.5 10 L9 21 L1.5 10 Z"
        fill={`url(#${gradId})`}
        filter={`url(#${glowId})`}
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.45"
      />
      <path d="M9 1 L1.5 10 L9 21" fill="rgba(4,120,87,0.28)" />
      <path
        d="M9 3.5 L9 18.5"
        stroke="rgba(255,255,255,0.72)"
        strokeWidth="0.65"
        strokeLinecap="round"
      />
      <path
        d="M9 1 L12.5 7"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="0.45"
        strokeLinecap="round"
      />
    </svg>
  );
}
