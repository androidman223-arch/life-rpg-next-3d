/** 神速 — 走る人（大）＋左に風3本 */
export default function MoeShinsokuIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      {/* 風 — 左3本（走って残る） */}
      <path
        d="M1.2 9.2 L7.8 9.6 M0.8 12.2 L7.4 12.2 M1.4 15.2 L7.6 14.8"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* 走る人 */}
      <circle
        cx="15.8"
        cy="6.2"
        r="2.05"
        fill="#fde68a"
        stroke="#92400e"
        strokeWidth="0.5"
      />
      <path
        d="M11.2 18.2c.6-1.8 2.2-3.4 4.2-4.1l1.4-2.6c.35-.65 1.05-1.05 1.8-1.05h1.1l1 1.8-1.3 2.1 2.2.55 1.5 2.6H11.2z"
        fill="#fde68a"
        stroke="#92400e"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      {/* 前腕（走り） */}
      <path
        d="M13.8 10.2 L15.2 12.4 L16.8 11.6"
        fill="none"
        stroke="#d97706"
        strokeWidth="0.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 後脚（蹴り出し） */}
      <path
        d="M11.6 17.8 L9.2 19.6"
        fill="none"
        stroke="#92400e"
        strokeWidth="1.05"
        strokeLinecap="round"
      />
    </svg>
  );
}
