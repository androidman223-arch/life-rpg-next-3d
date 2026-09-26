"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { startMoeFieldPrefetch } from "@/lib/moeFieldPrefetch";
import { prefetchMoePlayerSummonModels } from "@/lib/moePlayerSummonPrefetch";

/** MOE フィールド JS チャンクの先読み + ルート遷移の prefetch */
export default function MoeFieldPrefetchBoot() {
  const router = useRouter();

  useEffect(() => {
    startMoeFieldPrefetch();
    prefetchMoePlayerSummonModels();
    router.prefetch("/moe/3d");
    router.prefetch("/moe");
  }, [router]);

  return null;
}
