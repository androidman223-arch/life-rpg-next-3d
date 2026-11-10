"use client";

import { useEffect, useState } from "react";
import { MOE_MACRO_COMMAND_GUIDE } from "@/data/moeMacroCommandGuide";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import MoeFloatingPanelRoot from "@/components/MoeFloatingPanelRoot";
import {
  MOE_PANEL_ID_MACRO_COMMAND_GUIDE,
  moeFloatingDragTitle,
} from "@/lib/moePanelStack";

/** 説明パネルの幅（21rem） */
const GUIDE_W = 336;

/**
 * マクロ設定の「コマンド説明」— MoE 公式のコマンドを やさしく説明する
 * データは src/data/moeMacroCommandGuide.js
 * 自分の パネルとして うごかせる（上の帯を ドラッグ）。位置は おぼえる。
 * はじめは マクロ登録の 右（入らなければ 左）に出す。
 * @param {{ onClose: () => void, anchor?: { x: number, y: number, w: number } | null }} props
 */
export default function MoeMacroCommandGuide({ onClose, anchor = null }) {
  const [sectionId, setSectionId] = useState(MOE_MACRO_COMMAND_GUIDE[0].id);
  const { pos, sizeRef, onDragPointerDown, ensureInView } = useMoeDraggablePos(
    MOE_PANEL_ID_MACRO_COMMAND_GUIDE,
    () => {
      if (typeof window === "undefined" || !anchor) return { x: 16, y: 56 };
      const right = anchor.x + anchor.w + 8;
      const x =
        right + GUIDE_W <= window.innerWidth - 4
          ? right
          : Math.max(4, anchor.x - GUIDE_W - 8);
      return { x, y: anchor.y };
    }
  );
  // ひらいたら 全体を 画面に入れる
  useEffect(() => {
    if (pos != null) ensureInView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos != null]);
  const section =
    MOE_MACRO_COMMAND_GUIDE.find((s) => s.id === sectionId) ??
    MOE_MACRO_COMMAND_GUIDE[0];

  if (pos == null) return null;

  return (
    <MoeFloatingPanelRoot
      panelId={MOE_PANEL_ID_MACRO_COMMAND_GUIDE}
      bringToFrontOnMount
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed"
      style={{ left: pos.x, top: pos.y }}
    >
    <section
      className="flex max-h-[min(78vh,34rem)] w-[21rem] flex-col rounded-lg border border-emerald-300/50 bg-zinc-950/95 text-emerald-50 shadow-lg backdrop-blur-sm"
      aria-label="マクロのコマンド説明"
    >
      <header
        className="flex shrink-0 cursor-grab touch-none select-none items-center justify-between gap-2 border-b border-white/10 px-2 py-1.5 active:cursor-grabbing"
        onPointerDown={onDragPointerDown}
        title={moeFloatingDragTitle("ドラッグで移動")}
      >
        <h3 className="text-[12px] font-bold">📖 コマンド説明（MoE 公式）</h3>
        <button
          type="button"
          onClick={onClose}
          onPointerDown={(event) => event.stopPropagation()}
          className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-zinc-200"
        >
          閉じる
        </button>
      </header>
      <nav
        className="flex shrink-0 flex-wrap gap-1 border-b border-white/10 p-1.5"
        role="tablist"
        aria-label="説明の項目"
      >
        {MOE_MACRO_COMMAND_GUIDE.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === section.id}
            onClick={() => setSectionId(s.id)}
            className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${
              s.id === section.id
                ? "border-emerald-200 bg-emerald-600 text-white"
                : "border-emerald-700/50 bg-zinc-900 text-emerald-100"
            }`}
          >
            {s.icon} {s.title}
          </button>
        ))}
      </nav>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1.5 text-[11px] leading-relaxed">
        <h4 className="mb-1 text-[12px] font-bold text-white">
          {section.icon} {section.title}
        </h4>
        {section.intro ? (
          <p className="mb-1.5 text-emerald-50/90">{section.intro}</p>
        ) : null}
        {section.notes?.length ? (
          <ul className="mb-1.5 flex flex-col gap-1">
            {section.notes.map((note, i) => (
              <li
                key={i}
                className="rounded border border-white/10 bg-zinc-900/70 px-1.5 py-1"
              >
                {note}
              </li>
            ))}
          </ul>
        ) : null}
        {section.commands?.length ? (
          <ul className="flex flex-col gap-1">
            {section.commands.map((c, i) => (
              <li
                key={`${c.cmd}-${i}`}
                className="rounded border border-emerald-700/40 bg-zinc-900 px-1.5 py-1"
              >
                <div className="flex items-baseline gap-1">
                  <code className="font-mono text-[11px] font-bold text-amber-200">
                    {c.cmd}
                  </code>
                  {c.args ? (
                    <span className="font-mono text-[10px] text-sky-200/90">
                      {c.args}
                    </span>
                  ) : null}
                  <span
                    className={`ml-auto shrink-0 rounded px-1 text-[9px] font-bold ${
                      c.game === "yes"
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-700 text-zinc-300"
                    }`}
                    title={
                      c.game === "yes"
                        ? "このゲームの マクロで 使える"
                        : "このゲームには まだ ない（公式の説明）"
                    }
                  >
                    {c.game === "yes" ? "○ 使える" : "✕ まだ"}
                  </span>
                </div>
                <p className="text-emerald-50/90">{c.text}</p>
                {c.example ? (
                  <p className="font-mono text-[10px] text-white/60">
                    例: {c.example}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="shrink-0 border-t border-white/10 px-2 py-1 text-[9px] text-white/50">
        ○ = このゲームの マクロで 使える ／ ✕ = まだ ない（公式の おぼえ書き）
      </p>
    </section>
    </MoeFloatingPanelRoot>
  );
}
