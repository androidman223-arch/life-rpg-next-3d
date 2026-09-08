/** 疑似騎乗 — 象の背に乗る */
export function MoePseudoMountIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <ellipse cx="12" cy="17" rx="9.5" ry="4.5" fill="#78716c" stroke="#44403c" strokeWidth="0.55" />
      <path
        d="M5 17 Q5 10 8 8 Q11 6.5 12 6.5 Q13 6.5 16 8 Q19 10 19 17"
        fill="#a8a29e"
        stroke="#57534e"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <path d="M19 10 L21.5 8.5 L20.5 12" fill="#d6d3d1" stroke="#57534e" strokeWidth="0.45" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.2" fill="#fde68a" stroke="#92400e" strokeWidth="0.45" />
      <path d="M11 11.5 L12 13.5 L13 11.5" fill="#fde68a" stroke="#92400e" strokeWidth="0.4" strokeLinejoin="round" />
    </svg>
  );
}

/** トランピング — 足踏み */
export function MoeTramplingIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <ellipse cx="12" cy="8.5" rx="7.5" ry="5.5" fill="#78716c" stroke="#44403c" strokeWidth="0.55" />
      <path
        d="M6.5 14 L9 20.5 L12 19 L14.5 20.5 L17.5 14"
        fill="#a8a29e"
        stroke="#57534e"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <path
        d="M2 21.5 L22 21.5 M4 19 L20 19"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M8 21 L12 18 L16 21"
        fill="none"
        stroke="#fde047"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

/** スプリンクル シャワー — 水しぶき */
export function MoeSprinkleShowerIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M10 3.5 L12 8 L14 3.5"
        fill="none"
        stroke="#67e8f9"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8 L12 13"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M3 16 Q7 13 12 16 T21 16 M2 19.5 Q8 16.5 12 19.5 T22 19.5"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <circle cx="6" cy="12" r="1.2" fill="#7dd3fc" />
      <circle cx="18" cy="12" r="1.2" fill="#7dd3fc" />
      <circle cx="12" cy="21" r="1.2" fill="#bae6fd" />
    </svg>
  );
}

/** ブラインド サンド — 砂煙 */
export function MoeBlindSandIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" fill="#d6d3d1" stroke="#a8a29e" strokeWidth="0.55" opacity="0.75" />
      <circle cx="8" cy="10" r="2.5" fill="#e7e5e4" opacity="0.9" />
      <circle cx="15" cy="9" r="2.2" fill="#f5f5f4" opacity="0.85" />
      <circle cx="13" cy="15" r="2.8" fill="#e7e5e4" opacity="0.9" />
      <circle cx="7" cy="15" r="2" fill="#f5f5f4" opacity="0.8" />
      <path d="M12 5 L12 8 M12 16 L12 19 M5 12 L8 12 M16 12 L19 12" stroke="#78716c" strokeWidth="0.75" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** タイムカプセルボックス — 宝箱＋果物 */
export function MoeTimeCapsuleBoxIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3.5" y="10" width="17" height="10.5" rx="1" fill="#92400e" stroke="#451a03" strokeWidth="0.55" />
      <path d="M3.5 13.5 H20.5" stroke="#451a03" strokeWidth="0.65" />
      <path d="M5 10 Q12 4.5 19 10" fill="#b45309" stroke="#78350f" strokeWidth="0.55" strokeLinejoin="round" />
      <circle cx="9" cy="7.5" r="2.2" fill="#ef4444" stroke="#991b1b" strokeWidth="0.45" />
      <path d="M9 5.8 V9.2" stroke="#450a0a" strokeWidth="0.5" strokeLinecap="round" />
      <path d="M15.5 6.5 Q17 8 15.5 9.5 Q14 8 15.5 6.5" fill="#fde047" stroke="#ca8a04" strokeWidth="0.45" />
    </svg>
  );
}

/** ノーズ ウィップ — 鼻で鞭打ち */
export function MoeNoseWhipIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <ellipse cx="8" cy="14" rx="5.5" ry="7" fill="#a8a29e" stroke="#57534e" strokeWidth="0.55" />
      <path
        d="M12.5 10 C16 8 19 6 21.5 3.5"
        fill="none"
        stroke="#78716c"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M20 4.5 L22.5 3 L22 6.5"
        fill="#d6d3d1"
        stroke="#57534e"
        strokeWidth="0.45"
        strokeLinejoin="round"
      />
      <path
        d="M18 8 L21 7 L19.5 10"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle cx="6" cy="11" r="1" fill="#1c1917" />
    </svg>
  );
}
