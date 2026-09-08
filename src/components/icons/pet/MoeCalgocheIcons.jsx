/** 狂獣の牙 — 大きな牙（マスいっぱい） */
export function MoeBeastFangIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M8 3.5 L10.5 14 L12 21.5 L13.5 14 L16 3.5"
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth="0.65"
        strokeLinejoin="round"
      />
      <path
        d="M5 6 L7.5 15 L8.5 20.5 M19 6 L16.5 15 L15.5 20.5"
        fill="#e2e8f0"
        stroke="#475569"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 14 L12 18 L13.5 14"
        fill="#ef4444"
        stroke="#991b1b"
        strokeWidth="0.45"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 狂獣の咆哮 — 咆哮の衝撃波 */
export function MoeBeastRoarIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M3 10.5 Q7 8 11 10.5 T19 10.5 T22.5 10.5"
        fill="none"
        stroke="#f87171"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2 14 Q7 11.5 12 14 T22 14"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M1.5 17.5 Q7.5 15 12 17.5 T22.5 17.5"
        fill="none"
        stroke="#dc2626"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="12" cy="6.5" r="3.2" fill="#7f1d1d" stroke="#450a0a" strokeWidth="0.5" />
      <path d="M10 7.5 H14 M11.5 6 V9" stroke="#fecaca" strokeWidth="0.85" strokeLinecap="round" />
    </svg>
  );
}

/** 狂戦士の魂 — 赤い闘魂 */
export function MoeBerserkerSoulIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 3.5c-4 2.5-6.5 6.5-6.5 11 0 4 2.5 7 6.5 8.5 4-1.5 6.5-4.5 6.5-8.5 0-4.5-2.5-8.5-6.5-11Z"
        fill="#7f1d1d"
        stroke="#ef4444"
        strokeWidth="0.65"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M12 7.5 L13.5 11 L17 11.5 L14.5 14 L15.2 17.5 L12 15.5 L8.8 17.5 L9.5 14 L7 11.5 L10.5 11 Z"
        fill="#fde047"
        stroke="#ca8a04"
        strokeWidth="0.45"
        strokeLinejoin="round"
      />
      <path
        d="M4 5 L6 7 M20 5 L18 7 M4 19 L6 17 M20 19 L18 17"
        fill="none"
        stroke="#f87171"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 狂獣の鞭打 — 鞭の弧 */
export function MoeBeastWhipIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M4 20.5 C6 16 8 12 11 9 C14 6 17.5 4.5 21 3.5"
        fill="none"
        stroke="#92400e"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M19.5 4.5 L21.5 2.5 L22.5 5.5 L20 6.5 Z"
        fill="#78350f"
        stroke="#451a03"
        strokeWidth="0.45"
        strokeLinejoin="round"
      />
      <path
        d="M3 21.5 L7 20.5 L5.5 22.5"
        fill="#57534e"
        stroke="#292524"
        strokeWidth="0.45"
        strokeLinejoin="round"
      />
      <path
        d="M14 12 L18 10 L16 14"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

/** 狂獣の鉄槌 — 叩きつける槌 */
export function MoeBeastHammerIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect
        x="5.5"
        y="3.5"
        width="13"
        height="7.5"
        rx="1.2"
        fill="#57534e"
        stroke="#292524"
        strokeWidth="0.55"
      />
      <path
        d="M11.5 11 L11.5 19.5"
        fill="none"
        stroke="#78350f"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M2 21.5 L22 21.5 M6 19.5 L18 19.5"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M8 21.5 L12 18.5 L16 21.5"
        fill="none"
        stroke="#fde047"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}
