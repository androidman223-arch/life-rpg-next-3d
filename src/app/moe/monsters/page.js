"use client";

import Link from "next/link";
import MoeMonsterLineupCanvas from "@/components/MoeMonsterLineupCanvas";
import { MOE_MONSTER_FAMILIES, MOE_MONSTER_LINEUP } from "@/data/moeMonsterLineup";

export default function MoeMonsterLineupPage() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-black px-3 py-4 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-rose-100">
              敵モンスター展示 — MOE 参考16タイプ × 2
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-300/90">
              レスクール系 · ミーリム · エルビン · オーク · 砂漠 · ギガース など。
              各タイプ2匹（A/B）· 形状は色替えではなく別モデル。
            </p>
          </div>
          <Link
            href="/moe/3d"
            className="shrink-0 rounded-lg border border-slate-500/50 bg-slate-800/80 px-3 py-1.5 text-[11px] font-bold text-slate-100 hover:bg-slate-700"
          >
            ← 3Dフィールド
          </Link>
        </div>

        <MoeMonsterLineupCanvas />

        <div className="mt-4 space-y-3">
          {MOE_MONSTER_FAMILIES.map((fam) => {
            const pair = MOE_MONSTER_LINEUP.filter((m) => m.familyId === fam.id);
            return (
              <section
                key={fam.id}
                className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2"
              >
                <p className="text-[11px] font-bold text-rose-100/95">{fam.nameJa}</p>
                <p className="text-[9px] text-slate-400">{fam.shapeNote}</p>
                <ul className="mt-1.5 flex flex-wrap gap-2">
                  {pair.map((m) => (
                    <li
                      key={m.id}
                      className="rounded border border-slate-600/50 bg-slate-800/70 px-2 py-1 text-[9px]"
                    >
                      <span className="font-bold text-amber-100/90">{m.variantLabel}</span>
                      <span className="text-slate-500"> · {m.file}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <p className="mt-3 text-[10px] text-slate-500">
          モデル再生成:{" "}
          <code className="rounded bg-slate-800 px-1">npm run generate:monster-lineup</code>
        </p>
      </div>
    </main>
  );
}
