"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { addGameExp } from "@/lib/gameStatus";
import MoeFieldMapGate from "@/components/MoeFieldMapGate";

/**
 * /moe と /moe/3d の共通ページ（差分は worldMode と loadingLabel だけ）
 * @param {{ worldMode?: "2d" | "3d", loadingLabel?: string }} props
 */
export default function MoeFieldPage({
  worldMode = "2d",
  loadingLabel = "MOEフィールドを準備中…",
}) {
  const router = useRouter();
  const goMain = useCallback(() => router.push("/"), [router]);
  const handleEnemyDefeat = useCallback((level) => {
    addGameExp(Math.ceil(Number(level) * 5) || 1);
  }, []);

  return (
    <MoeFieldMapGate
      worldMode={worldMode}
      onBack={goMain}
      onEnemyDefeat={handleEnemyDefeat}
      loadingLabel={loadingLabel}
    />
  );
}
