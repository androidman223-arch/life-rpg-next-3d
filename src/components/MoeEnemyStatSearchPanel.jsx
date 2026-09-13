"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildMoeEnemyLiveDetectionSnapshot,
  buildMoeEnemyStatSearchView,
  formatMoeEnemyStealthNote,
  moeEnemyLiveHearingReach,
} from "@/lib/moeEnemyStatSearch";

const WINDOW_W = 168;

/**
 * @param {{
 *   enemy?: object|null,
 *   open?: boolean,
 *   onClose?: () => void,
 *   playerPosRef?: import("react").RefObject<{ x: number, y: number }>,
 *   enemyFacingYawRef?: import("react").RefObject<number>,
 *   enemyChaseRuntimeRef?: import("react").RefObject<Record<number, object>>,
 *   enemyFieldSyncRef?: import("react").RefObject<Record<number, { x: number, y: number, idleFacingYaw?: number }>>,
 *   enemyDetectionOptsRef?: import("react").RefObject<object>,
 * }} props
 */
export default function MoeEnemyStatSearchPanel({
  enemy,
  open = false,
  onClose,
  playerPosRef,
  enemyFacingYawRef,
  enemyChaseRuntimeRef,
  enemyFieldSyncRef,
  enemyDetectionOptsRef,
}) {
  const [pos, setPos] = useState({ x: 8, y: 120 });
  const [liveDetection, setLiveDetection] = useState(null);
  const [liveChaseAggro, setLiveChaseAggro] = useState(false);
  const [liveStealthNote, setLiveStealthNote] = useState(null);
  const [liveHearingReach, setLiveHearingReach] = useState(null);
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

  useEffect(() => {
    if (!open || !enemy) {
      setLiveDetection(null);
      setLiveChaseAggro(false);
      setLiveStealthNote(null);
      setLiveHearingReach(null);
      return;
    }
    let frame = 0;
    let lastKey = "";
    const tick = () => {
      const playerPos = playerPosRef?.current;
      const sync = enemyFieldSyncRef?.current?.[enemy.id];
      const chaseRt = enemyChaseRuntimeRef?.current?.[enemy.id];
      const chasing = Boolean(chaseRt?.aggro);
      const facingYaw = chasing
        ? chaseRt.facingYaw
        : (sync?.idleFacingYaw ?? enemyFacingYawRef?.current ?? 0);
      const enemyForDetect = chasing
        ? { ...enemy, x: chaseRt.x, y: chaseRt.y }
        : sync
          ? { ...enemy, x: sync.x, y: sync.y }
          : enemy;
      const detectOpts = enemyDetectionOptsRef?.current ?? {};
      const stealthNote = formatMoeEnemyStealthNote(detectOpts);
      const hearingReach = moeEnemyLiveHearingReach(
        view?.detection,
        detectOpts
      );
      if (playerPos) {
        const snap = buildMoeEnemyLiveDetectionSnapshot(
          enemyForDetect,
          playerPos,
          facingYaw,
          detectOpts
        );
        const key = snap
          ? `${chasing}:${stealthNote?.tone ?? ""}:${hearingReach ?? ""}:${snap.detected}:${snap.viaLabels.join(",")}`
          : `${chasing}:${stealthNote?.tone ?? ""}:${hearingReach ?? ""}:`;
        if (key !== lastKey) {
          lastKey = key;
          setLiveDetection(snap);
          setLiveChaseAggro(chasing);
          setLiveStealthNote(stealthNote);
          setLiveHearingReach(hearingReach);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [
    open,
    enemy,
    playerPosRef,
    enemyFacingYawRef,
    enemyChaseRuntimeRef,
    enemyDetectionOptsRef,
  ]);

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
          {view.detectionUi ? (
            <div className="mt-1 rounded border border-cyan-500/35 bg-cyan-950/40 px-1 py-0.5">
              <p className="text-[7px] font-bold text-cyan-200">索敵（{view.detectionUi.targetLabel}）</p>
              <div className="mt-0.5 space-y-0.5 text-[6px] leading-snug text-cyan-50/95">
                {view.detectionUi.usesVision ? (
                  <p>
                    <span className="text-cyan-300/85">視野 </span>
                    {view.detectionUi.visionLabel}
                  </p>
                ) : null}
                {view.detectionUi.usesHearing ? (
                  <p>
                    <span className="text-cyan-300/85">足音 </span>
                    {liveHearingReach != null &&
                    liveHearingReach !== view.detection.hearingRange
                      ? `現在約${liveHearingReach}m（通常${view.detection.hearingRange}m）`
                      : view.detectionUi.hearingLabel}
                  </p>
                ) : (
                  <p className="text-cyan-200/65">
                    <span className="text-cyan-300/85">足音 </span>
                    なし（横から近づけます）
                  </p>
                )}
                <p>
                  <span className="text-cyan-300/85">性格 </span>
                  <span
                    className={
                      view.fieldActive ? "text-amber-200" : "text-lime-200"
                    }
                  >
                    {view.fieldActiveLabel}
                  </span>
                  <span className="text-cyan-200/70">
                    {" "}
                    — {view.fieldActiveHint}
                  </span>
                </p>
                <p>
                  <span className="text-cyan-300/85">タイプ </span>
                  {view.detectionUi.searchTypeLabel}
                  <span className="text-cyan-200/70">
                    （{view.detectionUi.searchHint}）
                  </span>
                </p>
                {view.chaseMaxRange != null ? (
                  <p className="text-cyan-200/80">
                    <span className="text-cyan-300/85">逃げ幅 </span>
                    湧きから約{view.chaseMaxRange}m（索敵射程×2）
                  </p>
                ) : null}
                {liveStealthNote ? (
                  <p
                    className={
                      liveStealthNote.tone === "stealth"
                        ? "font-bold text-violet-200"
                        : "font-bold text-sky-200"
                    }
                  >
                    <span className="text-cyan-300/85">ステルス </span>
                    {liveStealthNote.label}
                    <span className="font-normal text-cyan-100/80">
                      {" "}
                      — {liveStealthNote.detail}
                    </span>
                  </p>
                ) : null}
                {liveChaseAggro ? (
                  <p className="font-bold text-orange-300">
                    <span className="text-cyan-300/85">行動 </span>
                    追跡中
                    <span className="font-normal text-orange-100/85">
                      {" "}
                      — プレイヤーへ接近
                    </span>
                  </p>
                ) : null}
                {liveDetection ? (
                  <p
                    className={
                      liveDetection.tone === "alert"
                        ? "font-bold text-red-300"
                        : liveDetection.tone === "passive"
                          ? "font-bold text-lime-300"
                          : "font-bold text-emerald-300"
                    }
                  >
                    <span className="text-cyan-300/85">状態 </span>
                    {liveDetection.statusLabel}
                    <span className="font-normal text-cyan-100/80">
                      {" "}
                      — {liveDetection.detail}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
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
