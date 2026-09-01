"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import dynamic from "next/dynamic";
import { addGameExp } from "@/lib/gameStatus";

const MoeFieldMap = dynamic(() => import("@/components/MoeFieldMap"), {
  ssr: false,
  loading: () => (
    <main className="min-h-dvh flex items-center justify-center bg-zinc-900 text-white">
      <p className="text-violet-200">3Dフィールドを準備中…</p>
    </main>
  ),
});

export default function Moe3dPage() {
  const router = useRouter();
  const goMain = useCallback(() => router.push("/"), [router]);
  const handleEnemyDefeat = useCallback((level) => {
    addGameExp(Math.ceil(Number(level) * 5) || 1);
  }, []);

  return (
    <MoeFieldMap
      worldMode="3d"
      onBack={goMain}
      onEnemyDefeat={handleEnemyDefeat}
    />
  );
}
