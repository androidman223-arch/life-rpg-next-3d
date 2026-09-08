/** エクスペリエンスキューブ（粉20個分 · 本家 tretaro 換算） */
export default function MoeExperienceCubeIcon({ size = 28, className = "" }) {
  const gradId = `moeExpCube-${size}`;
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        d="M12 3 L20 7.5 V16.5 L12 21 L4 16.5 V7.5 Z"
        fill={`url(#${gradId})`}
        stroke="#fbbf24"
        strokeWidth="0.6"
      />
      <path
        d="M12 3 V21 M4 7.5 L20 16.5 M20 7.5 L4 16.5"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.45"
      />
      <path
        d="M12 3 L20 7.5 L12 12 L4 7.5 Z"
        fill="rgba(255,251,235,0.45)"
      />
      <defs>
        <linearGradient id={gradId} x1="6" y1="4" x2="18" y2="20">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="45%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
      </defs>
    </svg>
  );
}
