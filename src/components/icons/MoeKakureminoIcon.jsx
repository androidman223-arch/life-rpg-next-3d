/** 隠れ蓑 — ネイチャーミミック風・透明化 */
export default function MoeKakureminoIcon({ size = 22, className = "" }) {
  const gradId = "moeKakureminoGrad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="12" y1="4" x2="12" y2="20">
          <stop offset="0%" stopColor="#86efac" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#166534" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path
        d="M4 16c2-4 5-7 8-8s6 1 8 5c-2 2-5 3-8 3s-5-1-8 0z"
        fill={`url(#${gradId})`}
        stroke="#15803d"
        strokeWidth="0.5"
      />
      <path
        d="M10 14c1-3 2.5-5 4-6.5"
        fill="none"
        stroke="#bbf7d0"
        strokeWidth="0.7"
        strokeDasharray="1.5 1.2"
        opacity="0.8"
      />
      <circle cx="13" cy="9" r="2" fill="#d1fae5" opacity="0.45" stroke="#6ee7b7" strokeWidth="0.5" />
      <path
        d="M11.5 8.5h3M13 7v3"
        stroke="#ecfdf5"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
