"use client";

import { useCallback } from "react";
import MoeFloatingPanelRoot from "@/components/MoeFloatingPanelRoot";
import MoeNameWindowChargeRow from "@/components/MoeNameWindowChargeRow";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import {
  MOE_PANEL_ID_TARGET_WINDOW,
  moeFloatingDragTitle,
} from "@/lib/moePanelStack";

const WINDOW_W = 148;
const SIDE_CAP_W = 7;
const MOE_HP_RED = "#ef4444";
const MOE_ENEMY_CHARGE = "#f97316";

function hpPct(current, max) {
  const m = Number(max);
  if (!m || m <= 0) return 0;
  return Math.max(0, Math.min(100, (Number(current) / m) * 100));
}

function TargetHpBar({ pct, now, max, label }) {
  return (
    <div
      className="flex h-2.5"
      role="progressbar"
      aria-valuenow={now}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div
        className="shrink-0 bg-gradient-to-b from-slate-200/95 to-slate-400/90"
        style={{ width: SIDE_CAP_W }}
        aria-hidden
      />
      <div className="relative min-w-0 flex-1 overflow-hidden bg-zinc-950">
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: `${pct}%`, backgroundColor: MOE_HP_RED }}
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[8px] font-bold leading-none text-white drop-shadow-[0_0_2px_rgba(0,0,0,1),0_1px_2px_rgba(0,0,0,0.9)]">
          HP {now}/{max}
        </span>
      </div>
      <div
        className="shrink-0 bg-gradient-to-b from-slate-200/95 to-slate-400/90"
        style={{ width: SIDE_CAP_W }}
        aria-hidden
      />
    </div>
  );
}

/**
 * ターゲット窓 — 敵は名前とLv、プレイヤーとペットはHPバー
 * @param {{
 *   enemy?: { emoji?: string, name?: string, levelLabel?: string, prefix?: string, hp?: number, hpMax?: number } | null,
 *   player?: { name?: string, hp?: number, hpMax?: number } | null,
 *   pet?: { emoji?: string, name?: string, hp?: number, hpMax?: number } | null,
 *   duelUi?: { phase?: string, duelRef?: object, barKey?: string } | null,
 * }} props
 */
export default function MoeTargetWindow({
  enemy = null,
  player = null,
  pet = null,
  duelUi = null,
}) {
  const getDefaultPos = useCallback(
    () => ({
      x: Math.max(8, (window.innerWidth - WINDOW_W) / 2),
      y: 8,
    }),
    []
  );
  const { pos, sizeRef, onDragPointerDown } = useMoeDraggablePos(
    MOE_PANEL_ID_TARGET_WINDOW,
    getDefaultPos
  );

  if (!pos || !player || !pet) return null;

  const view = {
    x: Math.max(4, Math.min(window.innerWidth - WINDOW_W - 4, pos.x)),
    y: Math.max(4, Math.min(window.innerHeight - 96, pos.y)),
  };
  const enemyNow = enemy ? Math.ceil(Number(enemy.hp) || 0) : 0;
  const enemyMax = enemy ? Math.ceil(Number(enemy.hpMax) || 0) : 0;
  const playerNow = Math.ceil(Number(player.hp) || 0);
  const playerMax = Math.ceil(Number(player.hpMax) || 0);
  const petNow = Math.ceil(Number(pet.hp) || 0);
  const petMax = Math.ceil(Number(pet.hpMax) || 0);

  return (
    <MoeFloatingPanelRoot
      panelId={MOE_PANEL_ID_TARGET_WINDOW}
      ref={(el) => {
        if (el) sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
      }}
      className="pointer-events-auto fixed select-none"
      style={{ left: view.x, top: view.y, width: WINDOW_W }}
    >
      <div className="flex flex-col gap-1">
        {enemy ? (
          <div className="overflow-hidden rounded-[4px] border border-slate-300/90 bg-black shadow-[0_1px_5px_rgba(0,0,0,0.65)]">
            <div
              className="cursor-grab touch-none bg-gradient-to-b from-blue-600 to-blue-800 px-1.5 py-0.5 active:cursor-grabbing"
              onPointerDown={onDragPointerDown}
              title={moeFloatingDragTitle("ドラッグで移動")}
            >
              <p className="truncate text-center text-[10px] font-bold leading-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]">
                {enemy.prefix ?? ""}
                {enemy.emoji} {enemy.name} Lv.{enemy.levelLabel}
              </p>
            </div>
            <div className="h-px bg-white/60" aria-hidden />
            <TargetHpBar
              pct={hpPct(enemy.hp, enemy.hpMax)}
              now={enemyNow}
              max={enemyMax}
              label={`${enemy.name} HP`}
            />
            {duelUi ? (
              <MoeNameWindowChargeRow
                phase={duelUi.phase}
                duelRef={duelUi.duelRef}
                barKey={duelUi.barKey}
                fillColor={MOE_ENEMY_CHARGE}
                ariaLabel={`${enemy.name} 攻撃チャージ`}
              />
            ) : null}
          </div>
        ) : null}
        <div className="overflow-hidden rounded-[4px] border border-emerald-200/80 bg-black shadow-[0_1px_5px_rgba(0,0,0,0.65)]">
          <div
            className="cursor-grab touch-none bg-gradient-to-b from-emerald-600 to-emerald-800 px-1.5 py-0.5 active:cursor-grabbing"
            onPointerDown={onDragPointerDown}
            title={moeFloatingDragTitle("ドラッグで移動")}
          >
            <p className="truncate text-center text-[10px] font-bold leading-tight text-white">
              🧑 {player.name}
            </p>
          </div>
          <div className="h-px bg-white/60" aria-hidden />
          <TargetHpBar
            pct={hpPct(player.hp, player.hpMax)}
            now={playerNow}
            max={playerMax}
            label={`${player.name} HP`}
          />
        </div>
        <div className="overflow-hidden rounded-[4px] border border-sky-200/80 bg-black shadow-[0_1px_5px_rgba(0,0,0,0.65)]">
          <div
            className="cursor-grab touch-none bg-gradient-to-b from-blue-600 to-blue-800 px-1.5 py-0.5 active:cursor-grabbing"
            onPointerDown={onDragPointerDown}
            title={moeFloatingDragTitle("ドラッグで移動")}
          >
            <p className="truncate text-center text-[10px] font-bold leading-tight text-white">
              {pet.emoji} {pet.name}
            </p>
          </div>
          <div className="h-px bg-white/60" aria-hidden />
          <TargetHpBar
            pct={hpPct(pet.hp, pet.hpMax)}
            now={petNow}
            max={petMax}
            label={`${pet.name} HP`}
          />
        </div>
      </div>
    </MoeFloatingPanelRoot>
  );
}
