"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import MoeFieldMap from "@/components/MoeFieldMap";
import { addGameExp } from "@/lib/gameStatus";

export default function MoePage() {
  const router = useRouter();
  const goMain = useCallback(() => router.push("/"), [router]);
  const handleEnemyDefeat = useCallback((level) => {
    addGameExp(Math.ceil(Number(level) * 5) || 1);
  }, []);

  return <MoeFieldMap onBack={goMain} onEnemyDefeat={handleEnemyDefeat} />;
}
