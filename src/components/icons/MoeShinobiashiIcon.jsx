/** 忍び足 — 足音なし・索敵回避 */
export default function MoeShinobiashiIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <ellipse cx="12" cy="19" rx="7" ry="1.2" fill="rgba(0,0,0,0.25)" />
      <path
        d="M8 17.5 10 12l2.5-.5 1.5 2 3 1.5-1 4.5H8z"
        fill="#64748b"
        stroke="#1e293b"
        strokeWidth="0.5"
      />
      <path
        d="M10.5 11.5 12 8l2.5 1-1 2.5"
        fill="#475569"
        stroke="#1e293b"
        strokeWidth="0.4"
      />
      <path
        d="M5 9 Q8 7 11 9 M4 12 Q7.5 10.5 11 12"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="16.5" cy="8" r="2.8" fill="none" stroke="#22d3ee" strokeWidth="0.9" />
      <line x1="18.8" y1="5.7" x2="20.5" y2="4" stroke="#22d3ee" strokeWidth="0.8" />
    </svg>
  );
}
