"use client";

import { useEffect, useMemo, useState } from "react";
import { MOE_UI_GOLD } from "@/components/MoeItemBox";
import MoeExperiencePowderIcon from "@/components/MoeExperiencePowderIcon";
import MoeExperienceCubeIcon from "@/components/MoeExperienceCubeIcon";
import {
  getMoeFieldLootItem,
  MOE_TREASURE_LOOT_SLOTS,
} from "@/data/moeFieldTreasures";

const SLOT_PX = 32;
const CAP_W = 5;
const POWDER_MS = 2400;

const GOLD = MOE_UI_GOLD;

function LootSlotIcon({ item }) {
  if (!item) return "·";
  if (item.iconKind === "pink_sand_mound") {
    return <MoeExperiencePowderIcon size={28} />;
  }
  if (item.iconKind === "experience_cube") {
    return <MoeExperienceCubeIcon size={28} />;
  }
  if (item.iconKind === "ninja_tabi") {
    return (
      <span className="text-[22px] leading-none" aria-hidden>
        {item.emoji ?? "🧦"}
      </span>
    );
  }
  return item.emoji ?? "·";
}

function PinkSandBurst({ openedAt }) {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: 42 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 16,
      top: 36 + (Math.cos(i * 2.3) * 0.5 + 0.5) * 10,
      size: 1.5 + (i % 3) * 0.5,
      delay: (i % 7) * 0.04,
      driftX: (Math.random() - 0.5) * 32,
      driftY: -14 - Math.random() * 24,
      duration: 1 + (i % 5) * 0.12,
    }));
  }, [openedAt]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle, #fbcfe8 0%, #f472b6 55%, transparent 100%)",
            boxShadow: "0 0 2px rgba(244,114,182,0.8)",
            animation: `moeTreasureDust${p.id} ${p.duration}s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        ${particles
          .map(
            (p) => `@keyframes moeTreasureDust${p.id} {
          0% { opacity: 0.9; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(${p.driftX}px, ${p.driftY}px) scale(0.15); }
        }`
          )
          .join("\n")}
      `}</style>
    </div>
  );
}

function TreasureLootPanel({ loot, onPickLoot, onClose }) {
  const slots = useMemo(() => {
    const row = Array.from({ length: MOE_TREASURE_LOOT_SLOTS }, () => null);
    if (loot) row[0] = loot;
    return row;
  }, [loot]);

  return (
    <div
      className="overflow-hidden rounded-[5px] bg-black shadow-[0_2px_12px_rgba(0,0,0,0.72),0_0_14px_rgba(244,114,182,0.12)]"
      style={{ border: `1px solid ${GOLD.frameEdge}` }}
    >
      <div
        className="flex items-center justify-between gap-1 px-1 py-0.5"
        style={{
          borderBottom: `1px solid ${GOLD.frameHi}`,
          background: `linear-gradient(to bottom, ${GOLD.caption}, ${GOLD.captionDark})`,
        }}
      >
        <p
          className="min-w-0 flex-1 text-center text-[8px] font-bold leading-tight"
          style={{ color: GOLD.textOnGold }}
        >
          Treasure
        </p>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="shrink-0 rounded px-1 py-px text-[7px] font-bold leading-none transition hover:brightness-110 active:scale-95"
          style={{
            color: GOLD.textOnGold,
            border: `1px solid ${GOLD.frameHi}`,
            background: `linear-gradient(to bottom, ${GOLD.capTop}, ${GOLD.capBot})`,
          }}
          aria-label="宝箱を閉じる"
          title="閉じる"
        >
          ×
        </button>
      </div>
      <div
        className="h-px shrink-0"
        style={{ backgroundColor: GOLD.frameBright }}
        aria-hidden
      />
      <div className="flex items-stretch bg-zinc-950 p-1">
        <div
          className="shrink-0 self-stretch"
          style={{
            width: CAP_W,
            borderRight: `1px solid ${GOLD.frameHi}`,
            background: `linear-gradient(to bottom, ${GOLD.capTop}, ${GOLD.capMid}, ${GOLD.capBot})`,
          }}
          aria-hidden
        />
        <div
          className="flex min-w-0 flex-1 gap-0.5 px-0.5"
          role="group"
          aria-label="宝箱の中身"
        >
          {slots.map((item, i) => {
            const filled = Boolean(item);
            return (
              <button
                key={i}
                type="button"
                disabled={!filled}
                title={filled ? item.label : `空き ${i + 1}`}
                onClick={() => filled && onPickLoot?.(item)}
                style={{
                  width: SLOT_PX,
                  height: SLOT_PX,
                  border: `1px solid ${filled ? "#f472b6" : `${GOLD.frameEdge}88`}`,
                  boxShadow: filled
                    ? "inset 0 1px 0 rgba(255,236,180,0.15), 0 0 6px rgba(244,114,182,0.35)"
                    : "inset 0 1px 0 rgba(255,236,180,0.08)",
                }}
                className={`relative shrink-0 overflow-hidden rounded-[3px] transition active:scale-95 ${
                  filled
                    ? "bg-gradient-to-b from-[#3d1828] via-zinc-950 to-black hover:brightness-110"
                    : "cursor-default bg-gradient-to-b from-zinc-800/90 to-zinc-950 opacity-85"
                }`}
              >
                <span
                  className="pointer-events-none absolute left-0.5 top-0 text-[6px] font-bold tabular-nums leading-none"
                  style={{
                    color: filled ? "#f9a8d4" : `${GOLD.frame}99`,
                  }}
                >
                  {i + 1}
                </span>
                <span className="pointer-events-none flex h-full w-full items-center justify-center leading-none">
                  <LootSlotIcon item={item} />
                </span>
              </button>
            );
          })}
        </div>
        <div
          className="shrink-0 self-stretch"
          style={{
            width: CAP_W,
            borderLeft: `1px solid ${GOLD.frameHi}`,
            background: `linear-gradient(to bottom, ${GOLD.capTop}, ${GOLD.capMid}, ${GOLD.capBot})`,
          }}
          aria-hidden
        />
      </div>
      <div
        className="h-px shrink-0"
        style={{ backgroundColor: GOLD.frameBright }}
        aria-hidden
      />
      <div
        className="px-1 py-1"
        style={{
          borderTop: `1px solid ${GOLD.frameEdge}`,
          background: `linear-gradient(to bottom, ${GOLD.captionDark}, #1a1208)`,
        }}
      >
        <button
          type="button"
          onClick={() => onClose?.()}
          className="w-full rounded-[3px] py-1 text-[9px] font-bold leading-tight transition hover:brightness-110 active:scale-[0.98]"
          style={{
            color: GOLD.textOnGold,
            border: `1px solid ${GOLD.frameHi}`,
            background: `linear-gradient(to bottom, ${GOLD.caption}, ${GOLD.captionDark})`,
            boxShadow: "inset 0 1px 0 rgba(255,236,180,0.25)",
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

/**
 * 開封中（state === open）のみ UI 表示。
 * 閉じると宝箱は残り、クリックで再び開ける。
 */
export default function MoeField3DTreasureOverlay({
  treasures,
  overlayProjectRef,
  onTreasureLootClick,
  onTreasureClose,
}) {
  const [, setFrame] = useState(0);
  const openTreasures = useMemo(
    () => (treasures ?? []).filter((tr) => tr.state === "open"),
    [treasures]
  );

  useEffect(() => {
    if (!openTreasures.length) return;
    let id = 0;
    const loop = () => {
      setFrame((f) => f + 1);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [openTreasures.length]);

  const proj = overlayProjectRef?.current;
  if (!proj?.ready || !proj.project || !openTreasures.length) return null;

  const now = performance.now();

  return (
    <>
      {openTreasures.map((tr) => {
        const pt = proj.project(tr.x, tr.y, 0.45);
        if (!pt.visible) return null;
        const loot = getMoeFieldLootItem(tr.lootItemId);
        const showPowder =
          tr.openedAt != null && now - tr.openedAt < POWDER_MS;

        return (
          <div
            key={`treasure-${tr.id}`}
            className="absolute z-[44] -translate-x-1/2"
            style={{ left: pt.x, top: pt.y - 80 }}
          >
            <div className="relative">
              {showPowder && <PinkSandBurst openedAt={tr.openedAt} />}
              <TreasureLootPanel
                loot={loot}
                onPickLoot={() => onTreasureLootClick?.(tr.id, loot)}
                onClose={() => onTreasureClose?.(tr.id)}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
