/** 筋斗雲 — 雲＋上昇矢印 */
export default function MoeKintounIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <ellipse
        cx="12"
        cy="15.5"
        rx="8.5"
        ry="3.2"
        fill="#fde68a"
        stroke="#d97706"
        strokeWidth="0.55"
      />
      <ellipse
        cx="8.2"
        cy="13.8"
        rx="4.2"
        ry="2.4"
        fill="#fff7d6"
        stroke="#f59e0b"
        strokeWidth="0.45"
      />
      <ellipse
        cx="15.8"
        cy="13.6"
        rx="4.5"
        ry="2.5"
        fill="#fff7d6"
        stroke="#f59e0b"
        strokeWidth="0.45"
      />
      <path
        d="M12 4.5 L12 10.5 M9.2 7.2 L12 4.5 L14.8 7.2"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
