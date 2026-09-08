"use client";

import { useEffect, useState } from "react";
import {
  moe3dEnemyDisplayScale,
  MOE_COMBO_DAMAGE_STACK_PX,
  MOE_DAMAGE_POPUP_3D_PET_Y_EXTRA,
  MOE_DAMAGE_POPUP_3D_Y_EXTRA,
  moeComboPopupCssVars,
} from "@/lib/moeField3DModels";

/**
 * 3D フィールド上の battle / heal ポップを Screen Space HTML で描画（px 固定）。
 * overlayProjectRef.current.projectAt(x,y,z) は MoeField3DCanvas が毎フレーム更新。
 */
export default function MoeField3DBattleOverlay({
  battlePopups,
  worldHealPopupsRef,
  overlayProjectRef,
  enemies,
}) {
  const [, setFrame] = useState(0);

  useEffect(() => {
    let id = 0;
    const loop = () => {
      const heals = worldHealPopupsRef?.current ?? [];
      const now = performance.now();
      const liveHeals = heals.filter((p) => now - p.born < 2100);
      const hasDamage = battlePopups.some(
        (p) => p.type !== "tenthBanner" && p.type !== "heal" && p.type !== "tenth"
      );
      if (hasDamage || liveHeals.length > 0) {
        setFrame((f) => f + 1);
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [battlePopups, worldHealPopupsRef]);

  const proj = overlayProjectRef?.current;
  if (!proj?.ready || !proj.projectAt) return null;

  const now = performance.now();
  const healRefList = worldHealPopupsRef?.current ?? [];
  const liveHeals = healRefList.filter((p) => now - p.born < 2100);
  const petAnchor = proj.getPetAnchor?.();
  const petLift = (proj.petBodyLift ?? 0.3) + MOE_DAMAGE_POPUP_3D_PET_Y_EXTRA;

  const nodes = [];

  for (const pop of liveHeals) {
    const label = pop.label ?? pop.value;
    if (label == null || String(label).length > 8) continue;
    if (!petAnchor) continue;
    const pt = proj.projectAt(
      petAnchor.x,
      petAnchor.groundY + petLift,
      petAnchor.z
    );
    if (!pt.visible) continue;
    nodes.push(
      <div
        key={`heal-${pop.id}`}
        className="pointer-events-none absolute z-[12]"
        style={{
          left: pt.x,
          top: pt.y,
          transform: "translate(-50%, 0)",
        }}
      >
        <span className="moe-heal-popup-rise block text-center text-[17px] font-black tabular-nums tracking-tight text-cyan-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
          +{label}
        </span>
      </div>
    );
  }

  for (const pop of battlePopups) {
    if (
      pop.type === "tenthBanner" ||
      pop.type === "heal" ||
      pop.type === "tenth"
    ) {
      continue;
    }
    let pt;
    if (pop.fromEnemy) {
      if (!petAnchor) continue;
      pt = proj.projectAt(
        petAnchor.x,
        petAnchor.groundY + petLift,
        petAnchor.z
      );
    } else {
      const en =
        (pop.enemyId != null
          ? enemies.find((e) => e.id === pop.enemyId)
          : null) ??
        enemies.find(
          (e) => e.hp > 0 && Math.hypot(e.x - pop.x, e.y - pop.y) < 24
        );
      let floatY = 2.2 + MOE_DAMAGE_POPUP_3D_Y_EXTRA;
      if (en) {
        const ui = pop.enemyId != null ? proj.getEnemyUiYs?.(pop.enemyId) : null;
        if (ui) {
          floatY = ui.topY + 0.18 + MOE_DAMAGE_POPUP_3D_Y_EXTRA;
        } else {
          floatY =
            pop.stackIndex != null
              ? Math.max(1.0, moe3dEnemyDisplayScale(en) * 0.42) +
                MOE_DAMAGE_POPUP_3D_Y_EXTRA
              : Math.max(2.0, moe3dEnemyDisplayScale(en) * 0.95) +
                MOE_DAMAGE_POPUP_3D_Y_EXTRA;
        }
      }
      const wx = en?.x ?? pop.x;
      const wz = en?.y ?? pop.y;
      const uiPos =
        pop.enemyId != null ? proj.getEnemyUiYs?.(pop.enemyId) : null;
      if (uiPos) {
        pt = proj.projectAt(uiPos.x, floatY, uiPos.z);
      } else {
        pt = proj.project(wx, wz, floatY);
      }
    }
    if (!pt?.visible) continue;
    const stackOffset =
      pop.stackIndex != null ? -pop.stackIndex * MOE_COMBO_DAMAGE_STACK_PX : 0;
    nodes.push(
      <div
        key={pop.id}
        className="pointer-events-none absolute z-[12]"
        style={{
          left: pt.x,
          top: pt.y + stackOffset,
          transform: "translate(-50%, 0)",
        }}
      >
        <span
          className={`${
            pop.stackIndex != null
              ? "moe-battle-popup-combo-firework"
              : "moe-battle-popup-rise"
          } block text-center text-[18px] font-black tabular-nums tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
            pop.fromEnemy ? "text-red-700" : "text-amber-300"
          }`}
          style={
            pop.stackIndex != null ? moeComboPopupCssVars(pop) : undefined
          }
        >
          {pop.value}
        </span>
      </div>
    );
  }

  if (nodes.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {nodes}
    </div>
  );
}
