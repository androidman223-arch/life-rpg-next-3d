"use client";

/**
 * スキルパネル上バーの左内 — ◆たたむ / 広げる
 * 親ヘッダーは relative。マップ・戦闘ログの◆と同じ位置。
 * @param {{ onClose: () => void, collapsed?: boolean, title?: string, className?: string }} props
 */
export default function MoeSkillPanelCloseButton({
  onClose,
  collapsed = false,
  title,
  className = "",
}) {
  const resolvedTitle =
    title ?? (collapsed ? "広げる" : "たたむ（◆は残ります）");

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      title={resolvedTitle}
      aria-label={resolvedTitle}
      aria-expanded={!collapsed}
      className={`absolute left-0.5 top-1/2 z-20 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-sm text-[9px] leading-none text-inherit transition hover:bg-black/10 active:scale-95 ${className}`}
    >
      ◆
    </button>
  );
}
