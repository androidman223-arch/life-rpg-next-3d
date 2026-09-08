/** キャッツ ストレート — 猫パンチ */
export function MoeCatsStraightIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M4 14.5 L10 10 L16 8 L21 6.5"
        fill="none"
        stroke="#fde68a"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M16 8 L20 4.5 L22 8.5 L18.5 10.5 Z"
        fill="#fef3c7"
        stroke="#92400e"
        strokeWidth="0.55"
        strokeLinejoin="round"
      />
      <path
        d="M18 6.5 L19.5 5 M20 8 L21.5 7.5 M17.5 8.5 L18.5 10"
        fill="none"
        stroke="#78350f"
        strokeWidth="0.65"
        strokeLinecap="round"
      />
      <path
        d="M2 16 L5 14.5 M3 18.5 L6.5 17"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

/** キャッツ アイ — 猫の魔眼 */
export function MoeCatsEyeIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 4 L20 20 H4 Z"
        fill="#1e1b4b"
        stroke="#6366f1"
        strokeWidth="0.65"
        strokeLinejoin="round"
      />
      <ellipse cx="12" cy="13.5" rx="4.5" ry="3.2" fill="#fde047" stroke="#ca8a04" strokeWidth="0.5" />
      <ellipse cx="12" cy="13.5" rx="1.8" ry="2.8" fill="#09090b" />
      <circle cx="13.2" cy="12.5" r="0.7" fill="#fef08a" />
      <path
        d="M12 4 L12 8 M6 18 L9 14 M18 18 L15 14"
        fill="none"
        stroke="#a5b4fc"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/** キャッツ ロケット — 猫ロケット */
export function MoeCatsRocketIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 3.5 L15.5 14 L12 20.5 L8.5 14 Z"
        fill="#e2e8f0"
        stroke="#64748b"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <path d="M8.5 14 L4 17 L8 16.5 M15.5 14 L20 17 L16 16.5" fill="#94a3b8" stroke="#475569" strokeWidth="0.45" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" fill="#fde68a" stroke="#92400e" strokeWidth="0.45" />
      <path
        d="M10 20.5 L12 22.5 L14 20.5 M9 21 L7.5 22.5 M15 21 L16.5 22.5"
        fill="none"
        stroke="#f97316"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      <path d="M10.5 7.5 H13.5" stroke="#78350f" strokeWidth="0.55" strokeLinecap="round" />
    </svg>
  );
}

/** アビス ボール — 闇の球 */
export function MoeAbyssBallIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" fill="#0f172a" stroke="#312e81" strokeWidth="0.65" />
      <circle cx="12" cy="12" r="5.5" fill="#1e1b4b" stroke="#6366f1" strokeWidth="0.5" opacity="0.9" />
      <circle cx="12" cy="12" r="2.5" fill="#4c1d95" stroke="#a78bfa" strokeWidth="0.45" />
      <path
        d="M12 2.5 L12 5 M12 19 L12 21.5 M2.5 12 L5 12 M19 12 L21.5 12"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
