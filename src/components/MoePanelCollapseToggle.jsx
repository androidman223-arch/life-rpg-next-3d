"use client";

/**
 * パネル左上 — ◆ でヘッダーだけ残して折りたたみ
 * @param {{ collapsed: boolean, onToggle: () => void, className?: string }} props
 */
export default function MoePanelCollapseToggle({
  collapsed,
  onToggle,
  className = "",
}) {
  return (
    <button
      type="button"
      aria-expanded={!collapsed}
      title={collapsed ? "展開" : "折りたたむ（名前バーのみ）"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute left-0.5 top-1/2 z-20 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-sm text-[9px] leading-none transition hover:bg-white/15 active:scale-95 ${collapsed ? "text-amber-200/95" : "text-white/75"} ${className}`}
    >
      ◆
    </button>
  );
}
