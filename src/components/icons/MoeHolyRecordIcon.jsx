/** ホーリーレコード — 光る石碑＋ルーン */
export default function MoeHolyRecordIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect
        x="8.2"
        y="14.8"
        width="7.6"
        height="1.6"
        rx="0.4"
        fill="#d6d3d1"
      />
      <rect
        x="9.6"
        y="6.4"
        width="4.8"
        height="8.8"
        rx="0.6"
        fill="#e7e5e4"
        stroke="#a8a29e"
        strokeWidth="0.45"
      />
      <ellipse
        cx="12"
        cy="11.2"
        rx="3.4"
        ry="1.1"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="0.9"
      />
      <polygon
        points="12,4.2 10.4,7.8 12,7.1 13.6,7.8"
        fill="#fbbf24"
        stroke="#b45309"
        strokeWidth="0.35"
      />
      <circle cx="12" cy="4.8" r="0.55" fill="#fde68a" />
    </svg>
  );
}
