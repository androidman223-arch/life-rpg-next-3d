"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import dynamic from "next/dynamic";
import { addGameExp } from "@/lib/gameStatus";

const FieldMap = dynamic(() => import("@/components/FieldMap"), {
  ssr: false,
  loading: () => (
    <main className="min-h-dvh flex items-center justify-center bg-zinc-900 text-white">
      <p className="text-violet-200">フィールドを準備中…</p>
    </main>
  ),
});

export default function FieldPage() {
  const router = useRouter();
  const goMain = useCallback(() => router.push("/"), [router]);
  const handleSlimeDefeat = useCallback(() => {
    addGameExp(1);
  }, []);

  return <FieldMap onBack={goMain} onSlimeDefeat={handleSlimeDefeat} />;
}
