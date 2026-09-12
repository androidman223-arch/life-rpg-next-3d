"use client";

import Link from "next/link";
import MoeDragonLineupCanvas from "@/components/MoeDragonLineupCanvas";
import { MOE_DRAGON_LINEUP } from "@/data/moeDragonVariants";

export default function MoeDragonLineupPage() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-black px-3 py-4 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-amber-100">
              ドラゴン展示 — MOE 参考10タイプ
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-300/90">
              ミステリー ドラゴン · 千年竜 · 砂漠竜 · 結晶竜 などを低ポリで横並び。
              目は正面（くちばし上）配置。お気に入りを選んでください。
            </p>
          </div>
          <Link
            href="/moe/3d"
            className="shrink-0 rounded-lg border border-slate-500/50 bg-slate-800/80 px-3 py-1.5 text-[11px] font-bold text-slate-100 hover:bg-slate-700"
          >
            ← 3Dフィールド
          </Link>
        </div>

        <MoeDragonLineupCanvas />

        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {MOE_DRAGON_LINEUP.map((d) => (
            <li
              key={d.id}
              className="rounded-lg border border-slate-700/60 bg-slate-900/70 px-2 py-1.5"
            >
              <p className="text-[11px] font-bold text-amber-100/95">
                {d.nameJa}
              </p>
              <p className="text-[9px] text-slate-400">{d.note}</p>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-[10px] text-slate-500">
          モデル再生成:{" "}
          <code className="rounded bg-slate-800 px-1">npm run generate:dragons</code>
        </p>
      </div>
    </main>
  );
}
