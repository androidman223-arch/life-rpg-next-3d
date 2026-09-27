/** 地龍板 — スケボ＋前進矢印 */
export default function MoeSkateboardIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect
        x="3.5"
        y="13.2"
        width="17"
        height="2.8"
        rx="1.1"
        fill="#7c2d12"
        stroke="#ea580c"
        strokeWidth="0.55"
      />
      <rect
        x="7.5"
        y="12.6"
        width="9"
        height="1.4"
        rx="0.5"
        fill="#292524"
      />
      <circle cx="6.8" cy="16.4" r="1.45" fill="#f5f5f4" stroke="#d97706" strokeWidth="0.4" />
      <circle cx="17.2" cy="16.4" r="1.45" fill="#f5f5f4" stroke="#d97706" strokeWidth="0.4" />
      <path
        d="M12 4.5 L12 10 M8.8 7.5 L12 4.5 L15.2 7.5"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
