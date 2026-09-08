/** ミニ ヴォーテックス テイル — 尻尾の渦（マスいっぱい） */
export function MoeMiniVortexTailIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        d="M2.5 12c2.8-5.5 8-8 13.5-5.5 3.5 1.8 5.5 5 4.5 8.8-1 3.8-4.5 6.2-8.5 6"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M4.5 12.5 L2 15 L4 17.5"
        fill="none"
        stroke="#c4b5fd"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="6.5" r="2.2" fill="#7c3aed" stroke="#4c1d95" strokeWidth="0.45" />
    </svg>
  );
}

/** ミニ フレア バースト — 炎の爆発（マスいっぱい） */
export function MoeMiniFlareBurstIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        d="M12 2 L14.5 9 L21.5 10 L16.5 15.5 L18 22 L12 18 L6 22 L7.5 15.5 L2.5 10 L9.5 9 Z"
        fill="#fb923c"
        stroke="#c2410c"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.2" fill="#fde047" stroke="#ca8a04" strokeWidth="0.45" />
    </svg>
  );
}

/** ミニ ドラゴニック ウェーブ — 地波（マスいっぱい） */
export function MoeMiniDraconicWaveIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        d="M1.5 15.5 Q6 11.5 11 15.5 T21 15.5"
        fill="none"
        stroke="#86efac"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M1.5 19 Q6 15 11 19 T21 19"
        fill="none"
        stroke="#4ade80"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M5 5.5 L9 10 L12 5.5 L15 10 L19 5.5"
        fill="none"
        stroke="#166534"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ミニ ギガブレイズ ブレス — 火炎放射（マスいっぱい） */
export function MoeMiniGigaBlazeBreathIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <circle cx="4.5" cy="12" r="3.2" fill="#7c3aed" stroke="#4c1d95" strokeWidth="0.5" />
      <path
        d="M7.8 9.5 L13 8 L19 6.5 L22.5 5.5 M7.8 12 L14.5 12 L20.5 11.5 M7.8 14.5 L13 16 L19 17.5 L22.5 18.5"
        fill="none"
        stroke="#f97316"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M19 6.5 L21.5 4.5 M19 17.5 L21.5 19.5"
        fill="none"
        stroke="#fde047"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** ミニ アルティメイト フレア — 中央の炎玉（マスいっぱい） */
export function MoeMiniUltimateFlareIcon({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" fill="#ea580c" stroke="#9a3412" strokeWidth="0.5" opacity="0.85" />
      <circle cx="12" cy="12" r="5.8" fill="#f97316" stroke="#c2410c" strokeWidth="0.45" />
      <circle cx="12" cy="12" r="3.2" fill="#fde047" stroke="#ca8a04" strokeWidth="0.4" />
    </svg>
  );
}
