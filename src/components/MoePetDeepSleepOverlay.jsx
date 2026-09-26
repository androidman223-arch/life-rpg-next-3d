"use client";

import { useEffect, useState } from "react";

/**
 * 深睡眠眠詠唱中 — ペット頭上に zzz + 残り秒（3D/2D 共通）
 */
export default function MoePetDeepSleepOverlay({
  active,
  remainSec,
  overlayProjectRef,
  petX,
  petY,
  is3d,
}) {
  const [, setFrame] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    let id = 0;
    const loop = () => {
      setFrame((f) => f + 1);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);

  if (!active || remainSec == null) return null;

  let left;
  let top;
  if (is3d) {
    const proj = overlayProjectRef?.current;
    const anchor = proj?.getPetAnchor?.();
    if (!proj?.ready || !anchor) return null;
    const pt = proj.projectAt(anchor.x, anchor.groundY + 2.65, anchor.z);
    if (!pt?.visible) return null;
    left = pt.x;
    top = pt.y;
  } else if (petX != null && petY != null) {
    left = petX;
    top = petY - 52;
  } else {
    return null;
  }

  const bob = Math.sin(performance.now() * 0.005) * 5;

  return (
    <div
      className="pointer-events-none absolute z-[14]"
      style={{
        left,
        top: top + bob,
        transform: "translate(-50%, 0)",
      }}
    >
      <span
        className="moe-pet-sleep-zzz block text-center text-[22px] font-black lowercase tracking-widest text-indigo-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
        aria-hidden
      >
        zzz
      </span>
      <span
        className="mt-0.5 block text-center text-[13px] font-bold tabular-nums text-violet-200/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
        aria-label={`深睡眠眠 残り${remainSec}秒`}
      >
        {remainSec}
      </span>
    </div>
  );
}
