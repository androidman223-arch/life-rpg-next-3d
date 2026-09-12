"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildMoeEnemyStatSearchView } from "@/lib/moeEnemyStatSearch";

const WINDOW_W = 168;

/**
 * @param {{
 *   enemy?: object|null,
 *   open?: boolean,
 *   onClose?: () => void,
 * }} props
 */
export default function MoeEnemyStatSearchPanel({
  enemy,
  open = false,
  onClose,
}) {
  const [pos, setPos] = useState({ x: 8, y: 120 });
  const sizeRef = useRef({ w: WINDOW_W, h: 120 });
  const view = buildMoeEnemyStatSearchView(enemy);

  useEffect(() => {
    setPos({
      x: Math.max(8, window.innerWidth - WINDOW_W - 12),
      y: 120,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const clampPos = useCallback((x, y) => {
    const { w, h } = sizeRef.current;
    return {
      x: Math.max(4, Math.min(window.innerWidth - w - 4, x)),
      y: Math.max(4, Math.min(window.innerHeight - h - 4, y)),
    };
  }, []);

  const onHeaderPointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const drag = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        ox: pos.x,
        oy: pos.y,
      };
      const onMove = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        setPos(
          clampPos(
            drag.ox + ev.clientX - drag.startX,
            drag.oy + ev.clientY - drag.startY
          )
        );
      };
      const onUp = (ev) => {
        if (ev.pointerId !== drag.pointerId) return;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [clampPos, pos]
  );

  if (!open || !view) return null;

  const hpPct = Math.max(
    0,
    Math.min(100, (view.hp / Math.max(1, view.hpMax)) * 100)
  );
  const prefix = view.superBoss ? "◆ " : view.midBoss ? "★ " : "";

  return (
    <div
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed z-[58] pointer-events-auto select-none"
      style={{ left: pos.x, top: pos.y, width: WINDOW_W }}
      role="dialog"
      aria-label="敵ステサーチ"
    >
      <div className="overflow-hidden rounded-[4px] border border-violet-300/80 bg-black shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
        <div
          className="flex cursor-grab touch-none items-center justify-between gap-1 bg-gradient-to-b from-violet-600 to-violet-900 px-1.5 py-0.5 active:cursor-grabbing"
          onPointerDown={onHeaderPointerDown}
        >
          <p className="min-w-0 truncate text-[9px] font-bold text-white">
            🔍 敵ステサーチ
          </p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded px-1 text-[8px] font-bold text-violet-100 hover:bg-violet-800/80"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
        <div className="border-b border-white/15 px-1.5 py-1">
          <p className="truncate text-center text-[9px] font-bold text-violet-50">
            {prefix}
            {view.emoji} {view.name}
          </p>
          <p className="text-center text-[7px] text-violet-200/90">
            Lv.{view.level}
            {view.captureLife ? ` · 命${view.captureLife}` : ""}
          </p>
        </div>
        <div className="px-1.5 py-1">
          <div className="mb-1">
            <p className="text-[7px] font-bold text-red-200">HP</p>
            <div className="relative h-2 overflow-hidden rounded bg-zinc-950">
              <div
                className="h-full bg-red-500 transition-[width] duration-150"
                style={{ width: `${hpPct}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[6px] font-bold text-white drop-shadow">
                {view.hp} / {view.hpMax}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            <StatRow label="MP" value={view.mp} />
            <StatRow label="攻撃" value={view.attack} />
            <StatRow label="防御" value={view.defense} />
            <StatRow label="命中" value={view.hit} />
            <StatRow label="魔力" value={view.magic} />
            <StatRow label="回避" value={view.evasion} />
            <StatRow label="反撃" value={view.fieldDamage} />
            <StatRow
              label="間隔"
              value={
                view.attackIntervalSec != null
                  ? `${view.attackIntervalSec}秒`
                  : "—"
              }
            />
          </div>
          <p className="mt-1 text-[7px] font-bold text-violet-200">スキル</p>
          <ul className="mt-0.5 max-h-16 space-y-0.5 overflow-y-auto text-[6px] leading-snug text-zinc-200">
            {view.skills.map((skill) => (
              <li key={skill} className="rounded bg-violet-950/50 px-1 py-0.5">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex min-w-0 items-baseline justify-between gap-1 text-[7px] leading-tight">
      <span className="shrink-0 text-violet-300/85">{label}</span>
      <span className="font-bold tabular-nums text-white">{value}</span>
    </div>
  );
}
