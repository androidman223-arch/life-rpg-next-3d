/** テレポート — 魔法陣＋矢印 */
export default function MoeTeleportIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="7.2"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1.1"
        opacity="0.85"
      />
      <circle
        cx="12"
        cy="12"
        r="4.6"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="0.7"
        opacity="0.7"
      />
      <polygon
        points="12,5.8 9.2,11.2 12,9.8 14.8,11.2"
        fill="#fde68a"
        stroke="#b45309"
        strokeWidth="0.35"
      />
      <polygon
        points="12,18.2 9.2,12.8 12,14.2 14.8,12.8"
        fill="#a5f3fc"
        stroke="#0369a1"
        strokeWidth="0.35"
      />
      <circle cx="12" cy="12" r="1.1" fill="#e0f2fe" />
    </svg>
  );
}
