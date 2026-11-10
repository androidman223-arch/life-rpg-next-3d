"use client";

import { useCallback, useEffect, useState } from "react";
import {
  moeSkillMacroPauseChoices,
  moeSkillMacroPauseLabel,
  MOE_SKILL_MACRO_COUNT,
  MOE_SKILL_MACRO_TITLE_MAX,
} from "@/lib/moeSkillMacro";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import MoeFloatingPanelRoot from "@/components/MoeFloatingPanelRoot";
import MoeMacroCommandGuide from "@/components/MoeMacroCommandGuide";
import {
  MOE_PANEL_ID_SKILL_MACRO,
  moeFloatingDragTitle,
} from "@/lib/moePanelStack";

function defaultMacroPanelPos() {
  if (typeof window === "undefined") return { x: 16, y: 56 };
  return {
    x: Math.max(8, window.innerWidth - 320),
    y: 56,
  };
}

const PAUSE_CHOICES = moeSkillMacroPauseChoices();

function findSkillSlot(catalog, ref) {
  if (!ref) return null;
  return (
    (catalog?.[ref.source] || []).find((slot) => slot?.slotKey === ref.slotKey) ??
    null
  );
}

/**
 * マクロ 1〜10（MoE 公式によせた形）。
 * タイトル ＋ 6行。1行は 技（長押しドロップ）か 待ち（/pause・1 = 0.1秒）。
 * 発動は 縦スキルの技②（マクロ）か、ここの「実行」。
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   macroIndex: number,
 *   onSelectMacro: (index: number) => void,
 *   macros: { title: string, lines: ({ kind: 'skill', ref: object } | { kind: 'pause', ticks: number } | null)[] }[],
 *   catalog: Record<string, object[]>,
 *   onPickPause: (lineIndex: number, ticks: number) => void,
 *   onClearLine: (lineIndex: number) => void,
 *   onRename: (title: string) => void,
 *   onRun: () => void,
 * }} props
 */
export default function MoeSkillMacroPanel({
  open,
  onClose,
  macroIndex,
  onSelectMacro,
  macros,
  catalog,
  onPickPause,
  onClearLine,
  onRename,
  onRun,
}) {
  /** 待ちを えらんでいる行（null = とじている） */
  const [pauseLine, setPauseLine] = useState(null);
  /** 「コマンド説明」を ひらいているか */
  const [guideOpen, setGuideOpen] = useState(false);
  const { pos, sizeRef, onDragPointerDown, ensureInView } = useMoeDraggablePos(
    MOE_PANEL_ID_SKILL_MACRO,
    defaultMacroPanelPos
  );
  // ひらいたら パネル全体を 画面に入れる（前の位置が はしっこでも 見える）
  useEffect(() => {
    if (open) ensureInView();
  }, [open, ensureInView]);
  const onHeaderPointerDown = useCallback(
    (event) => {
      onDragPointerDown(event);
    },
    [onDragPointerDown]
  );
  const current = macros[macroIndex] ?? macros[0];

  if (!open || pos == null) return null;

  const currentPause =
    pauseLine != null && current?.lines?.[pauseLine]?.kind === "pause"
      ? current.lines[pauseLine].ticks
      : null;

  return (
    <>
    <MoeFloatingPanelRoot
      panelId={MOE_PANEL_ID_SKILL_MACRO}
      bringToFrontOnMount
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed flex items-start gap-2"
      style={{ left: pos.x, top: pos.y }}
    >
      <section className="w-[17rem] rounded-lg border border-amber-300/50 bg-zinc-950/95 p-2 text-amber-50 shadow-lg backdrop-blur-sm">
        <header
          className="mb-2 flex cursor-grab touch-none select-none items-center justify-between gap-2 active:cursor-grabbing"
          onPointerDown={onHeaderPointerDown}
          title={moeFloatingDragTitle("ドラッグで移動")}
        >
          <h2 className="text-[12px] font-bold">マクロ登録</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setGuideOpen((v) => !v);
                setPauseLine(null);
              }}
              onPointerDown={(event) => event.stopPropagation()}
              aria-pressed={guideOpen}
              title="MoE 公式のコマンドの説明"
              className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                guideOpen
                  ? "border-emerald-200 bg-emerald-600 text-white"
                  : "border-emerald-400/60 text-emerald-100"
              }`}
            >
              📖 コマンド説明
            </button>
            <button
              type="button"
              onClick={onClose}
              onPointerDown={(event) => event.stopPropagation()}
              className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-zinc-200"
            >
              閉じる
            </button>
          </div>
        </header>
        <div className="mb-2 grid grid-cols-5 gap-1" role="tablist" aria-label="マクロ">
          {Array.from({ length: MOE_SKILL_MACRO_COUNT }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={macroIndex === i}
              title={macros[i]?.title || `マクロ${i + 1}`}
              onClick={() => {
                onSelectMacro(i);
                setPauseLine(null);
              }}
              className={`h-7 rounded border text-[11px] font-bold ${
                macroIndex === i
                  ? "border-amber-200 bg-amber-500 text-zinc-950"
                  : "border-amber-700/50 bg-zinc-900 text-amber-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <label className="mb-1.5 flex items-center gap-1.5 text-[10px] text-amber-100/80">
          タイトル
          <input
            type="text"
            value={current?.title ?? ""}
            maxLength={MOE_SKILL_MACRO_TITLE_MAX}
            placeholder={`マクロ${macroIndex + 1}`}
            onChange={(event) => onRename(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            className="min-w-0 flex-1 rounded border border-amber-400/40 bg-zinc-900 px-1.5 py-1 text-[11px] font-bold text-white placeholder:text-white/30"
          />
        </label>
        <ol className="flex flex-col gap-1">
          {(current?.lines ?? []).map((line, i) => (
            <MacroLine
              key={i}
              index={i}
              line={line}
              catalog={catalog}
              picking={pauseLine === i}
              onPause={() => {
                setPauseLine(pauseLine === i ? null : i);
                setGuideOpen(false);
              }}
              onClear={() => {
                onClearLine(i);
                if (pauseLine === i) setPauseLine(null);
              }}
            />
          ))}
        </ol>
        <p className="mt-1 text-center text-[9px] leading-snug text-amber-100/70">
          行へ技を長押しドロップ · ⏸ で待ち（/pause）
          <br />
          上から順に実行 · 待ちの間は ほかのマクロを うけつけない
        </p>
        <button
          type="button"
          onClick={onRun}
          className="mt-2 w-full rounded border border-amber-200/80 bg-amber-500 py-1.5 text-[12px] font-bold text-zinc-950 active:scale-[0.98]"
        >
          {current?.title || `マクロ${macroIndex + 1}`} を実行
        </button>
      </section>
      {pauseLine != null ? (
        <section className="flex max-h-[min(70vh,28rem)] w-20 flex-col rounded-lg border border-sky-300/50 bg-zinc-950/95 shadow-lg">
          <p className="shrink-0 border-b border-white/10 py-1 text-center text-[10px] font-bold text-sky-100">
            {pauseLine + 1}行目の待ち
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {PAUSE_CHOICES.map((ticks) => (
              <button
                key={ticks}
                type="button"
                title={`/pause ${ticks}`}
                onClick={() => {
                  onPickPause(pauseLine, ticks);
                  setPauseLine(null);
                }}
                className={`block w-full border-b border-white/5 py-1.5 text-[12px] font-bold ${
                  currentPause === ticks
                    ? "bg-sky-600 text-white"
                    : "text-sky-100 hover:bg-sky-900/70"
                }`}
              >
                {moeSkillMacroPauseLabel(ticks)}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </MoeFloatingPanelRoot>
    {guideOpen ? (
      <MoeMacroCommandGuide
        onClose={() => setGuideOpen(false)}
        anchor={{ x: pos.x, y: pos.y, w: 272 }}
      />
    ) : null}
    </>
  );
}

function MacroLine({ index, line, catalog, picking, onPause, onClear }) {
  let text = "空き（技をドロップ）";
  let icon = null;
  let kind = "empty";
  if (line?.kind === "skill") {
    const slot = findSkillSlot(catalog, line.ref);
    text = slot ? slot.label || slot.slotKey : "—（技がありません）";
    icon = slot?.icon ?? null;
    kind = "skill";
  } else if (line?.kind === "pause") {
    text = `待ち ${moeSkillMacroPauseLabel(line.ticks)}`;
    icon = "⏸";
    kind = "pause";
  }
  return (
    <li
      data-moe-skill-panel="macro"
      data-moe-skill-slot={index}
      className={`flex h-8 items-center gap-1 rounded border px-1 ${
        kind === "pause"
          ? "border-sky-400/50 bg-sky-950/70"
          : kind === "skill"
            ? "border-amber-400/50 bg-zinc-900"
            : "border-white/10 bg-zinc-900/60"
      }`}
    >
      <span className="w-3 shrink-0 text-center text-[9px] text-white/50">
        {index + 1}
      </span>
      <span className="w-4 shrink-0 text-center text-[12px] leading-none">
        {icon}
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-[11px] font-bold ${
          kind === "empty" ? "text-white/30" : "text-white"
        }`}
      >
        {text}
      </span>
      <button
        type="button"
        onClick={onPause}
        title="待ち（/pause）にする"
        className={`shrink-0 rounded border px-1 py-0.5 text-[10px] ${
          picking
            ? "border-sky-200 bg-sky-600 text-white"
            : "border-sky-400/50 text-sky-100"
        }`}
      >
        ⏸
      </button>
      <button
        type="button"
        onClick={onClear}
        title="この行を空にする"
        disabled={!line}
        className="shrink-0 rounded border border-white/20 px-1 py-0.5 text-[10px] text-zinc-200 disabled:opacity-30"
      >
        ×
      </button>
    </li>
  );
}
