/** 開いた本 — マスいっぱいに広げた形 */
function openBook(stroke = "#94a3b8") {
  return (
    <>
      {/* 左ページ */}
      <path
        d="M3.5 5.5 L11.8 6.8 L11.8 20.5 L3.5 19.2 Z"
        fill="#334155"
        stroke={stroke}
        strokeWidth="0.55"
        strokeLinejoin="round"
      />
      {/* 右ページ */}
      <path
        d="M20.5 5.5 L12.2 6.8 L12.2 20.5 L20.5 19.2 Z"
        fill="#3f4f66"
        stroke={stroke}
        strokeWidth="0.55"
        strokeLinejoin="round"
      />
      {/* 背 */}
      <path
        d="M11.2 6.5 L12.8 6.5 L12.8 20.2 L11.2 20.2 Z"
        fill="#1e293b"
        stroke="#64748b"
        strokeWidth="0.4"
      />
    </>
  );
}

/** 下級回復魔法のページ */
export function MoeLowHealPageIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      {openBook("#86efac")}
      <path d="M7.5 12.5 V16.5 M5.5 14.5 H9.5" stroke="#4ade80" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

/** 温故知新 */
export function MoeOnkochishinIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      {openBook("#c4b5fd")}
      <path
        d="M7 13 L8.5 11.5 L10 13 L8.5 14.5 Z"
        fill="#fde047"
        stroke="#ca8a04"
        strokeWidth="0.4"
      />
      <path
        d="M14.5 11.5 L16.5 9.5 M15.5 13 L17.5 13"
        stroke="#fbbf24"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 禁断魔法のページ（アトルーム） */
export function MoeForbiddenMagicPageIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      {openBook("#64748b")}
      <path
        d="M6.5 14c2-2.2 4.5-2.8 7-1.5"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="1.05"
        strokeLinecap="round"
      />
      <path
        d="M15 15.5 L16.5 13.8 L18 15.5"
        fill="none"
        stroke="#ef4444"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** マナ増幅法のページ */
export function MoeManaAmpPageIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      {openBook("#67e8f9")}
      <circle cx="8.5" cy="13.5" r="2" fill="#22d3ee" stroke="#0891b2" strokeWidth="0.4" />
      <path
        d="M14.5 11 L16.5 9 M15 13.5 L17.5 13.5"
        stroke="#67e8f9"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 浄化魔法のページ */
export function MoePurifyPageIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      {openBook("#fde68a")}
      <circle cx="12" cy="13.5" r="4.2" fill="none" stroke="#fef08a" strokeWidth="0.85" />
      <path d="M12 10.8 V16.2 M9.8 13.5 H14.2" stroke="#fef08a" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

/** 上級回復魔法のページ */
export function MoeHighHealPageIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      {openBook("#86efac")}
      <path d="M7 11.5 V16.5 M4.8 14 H9.2" stroke="#22c55e" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="16.5" cy="10.5" r="1" fill="#bbf7d0" stroke="#16a34a" strokeWidth="0.35" />
    </svg>
  );
}

/** 範囲回復魔法のページ */
export function MoeAreaHealPageIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      {openBook("#86efac")}
      <circle cx="12" cy="13.5" r="4.5" fill="none" stroke="#4ade80" strokeWidth="0.8" opacity="0.9" />
      <path d="M12 10.5 V16.5 M9.5 13.5 H14.5" stroke="#bbf7d0" strokeWidth="0.95" strokeLinecap="round" />
    </svg>
  );
}
