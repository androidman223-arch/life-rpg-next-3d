"use client";

import Link from "next/link";

export default function Moe3dPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-indigo-950 to-black p-6 text-white">
      <p className="text-xl font-bold text-violet-200">MOEのフィールド（3D版）</p>
      <p className="mt-3 text-sm text-zinc-400 text-center max-w-sm">
        3Dフィールドは準備中です。いまは2D版（ミーリム海岸）をお楽しみください。
      </p>
      <Link
        href="/moe"
        className="mt-6 py-3 px-6 rounded-2xl font-bold text-base bg-gradient-to-r from-sky-600 to-blue-600 border border-sky-400/50 shadow-lg"
      >
        2D版（ミーリム海岸）へ
      </Link>
      <Link
        href="/"
        className="mt-3 py-2 px-5 rounded-xl text-sm font-semibold text-zinc-300 border border-zinc-600 hover:bg-zinc-800"
      >
        メニューへ戻る
      </Link>
    </main>
  );
}
