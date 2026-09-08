/** イーグル クロウ — 鷲の爪3本（マスいっぱい） */
export function MoeEagleClawIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        d="M12 2.5c-1.8 3.5-4.5 6.5-8.5 8.5-.9.5-1.4 1.6-1 2.7.4 1.1 1.5 1.7 2.6 1.3 3.2-1.2 5.8-3.2 7.9-5.8"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M7.5 13.5 L5.5 20.5 M10.5 14.2 L9.5 21 M13.5 13.5 L14.5 20.5"
        fill="none"
        stroke="#fde68a"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M5.5 20.5 L3.5 21.8 M9.5 21 L8.2 22 M14.5 20.5 L16.2 21.8"
        fill="none"
        stroke="#92400e"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** ホワール ウィンド — 羽根のはばたき（マスいっぱい） */
export function MoeWhirlWindIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      {/* 左羽 — 上げ */}
      <path
        d="M12 12 C8 7.5 3.5 6 2 10 C4.5 12 8.5 12.8 11.5 12.2 Z"
        fill="#e0f2fe"
        stroke="#38bdf8"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* 右羽 — 下げ */}
      <path
        d="M12 12 C16 16.5 20.5 18 22 14 C19.5 12 15.5 11.2 12.5 11.8 Z"
        fill="#bae6fd"
        stroke="#0ea5e9"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* 羽轴・羽根の筋 */}
      <path
        d="M12 4.5 L12 19.5 M7 9.5 L11.2 12 M17 14.5 L12.8 12"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
      {/* 風 */}
      <path
        d="M2 12.5 L5.5 12 M18.5 12 L22 12.5"
        fill="none"
        stroke="#67e8f9"
        strokeWidth="0.95"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

/** スウープ ダイブ — 急降下する鳥（マスいっぱい） */
export function MoeSweepDiveIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        d="M2.5 4 L12 12.5 L21.5 4 L12 17 Z"
        fill="#fbbf24"
        stroke="#92400e"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 17 L12 22"
        fill="none"
        stroke="#fde68a"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeDasharray="1.6 1.2"
      />
      <path
        d="M6.5 20.5 L12 22.5 L17.5 20.5"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  );
}
