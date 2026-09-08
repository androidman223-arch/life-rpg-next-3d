/** 共通 — アタック（交差する剣） */
export default function MoeAttackIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        d="M5.5 18.2 L14.8 8.9 M9.2 18.8 L18.5 9.5"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14.8 8.9 L16.8 6.9 L18.2 8.3 L16.2 10.3 Z M9.2 18.8 L7.2 20.8 L5.8 19.4 L7.8 17.4 Z"
        fill="#94a3b8"
        stroke="#475569"
        strokeWidth="0.45"
      />
      <path
        d="M5.5 18.2 L7.8 17.4 M18.5 9.5 L16.2 10.3"
        fill="none"
        stroke="#64748b"
        strokeWidth="0.7"
      />
    </svg>
  );
}
