"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import FieldMap from "@/components/FieldMap";
import { addGameExp } from "@/lib/gameStatus";

export default function FieldPage() {
  const router = useRouter();
  const goMain = useCallback(() => router.push("/"), [router]);
  const handleSlimeDefeat = useCallback(() => {
    addGameExp(1);
  }, []);

  return <FieldMap onBack={goMain} onSlimeDefeat={handleSlimeDefeat} />;
}
