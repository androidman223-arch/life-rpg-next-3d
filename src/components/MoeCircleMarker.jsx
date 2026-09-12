"use client";

/** MOE風ターゲット○（敵頭上 · 未選択時） */
export default function MoeCircleMarker({ size = 10, className = "" }) {
  const stroke = Math.max(1.2, size * 0.14);
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`drop-shadow-[0_0_6px_rgba(250,204,21,0.85)] ${className}`}
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#fef08a"
        strokeWidth={stroke}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.55}
        fill="rgba(250,204,21,0.18)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={stroke * 0.45}
      />
    </svg>
  );
}
