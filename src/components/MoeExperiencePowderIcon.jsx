/** エクスペリエンスパウダー（砂金の小さな山 · ピンク） */
export default function MoeExperiencePowderIcon({ size = 28, className = "" }) {
  const gradId = `moePowderMound-${size}`;
  const w = size;
  const h = Math.round(size * 0.72);
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 22 16"
      className={className}
      aria-hidden
    >
      <ellipse cx="11" cy="14" rx="9.5" ry="1.6" fill="rgba(236,72,153,0.25)" />
      <path
        d="M3 13 C5 9 8 6.5 11 5.5 C14 6.5 17 9 19 13 Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M6 12.5 C7.5 10 9.5 8.5 11 8 C12.5 8.5 14.5 10 16 12.5"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.6"
      />
      <circle cx="8" cy="10.5" r="0.55" fill="#fce7f3" opacity="0.9" />
      <circle cx="13.5" cy="9.8" r="0.45" fill="#fdf2f8" opacity="0.85" />
      <circle cx="11" cy="7.8" r="0.4" fill="#fff" opacity="0.7" />
      <defs>
        <linearGradient id={gradId} x1="11" y1="5" x2="11" y2="13">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="45%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
      </defs>
    </svg>
  );
}
