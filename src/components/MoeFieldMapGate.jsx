"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  getCachedMoeFieldMapComponent,
  getMoeFieldPrefetchState,
  prefetchMoeFieldMap,
  subscribeMoeFieldPrefetch,
} from "@/lib/moeFieldPrefetch";
import { MoePanelStackProvider } from "@/context/MoePanelStackContext";

/**
 * 初回はサーバーと同じ「準備中」。先読み済みなら描画前に差し替える。
 * @param {{
 *   worldMode?: "2d" | "3d",
 *   onBack?: () => void,
 *   onEnemyDefeat?: (level: number) => void,
 *   loadingLabel?: string,
 * }} props
 */
export default function MoeFieldMapGate({
  worldMode = "2d",
  onBack,
  onEnemyDefeat,
  loadingLabel = "MOEフィールドを準備中…",
}) {
  const [FieldMap, setFieldMap] = useState(null);
  const [prefetchState, setPrefetchState] = useState("idle");

  useLayoutEffect(() => {
    const cached = getCachedMoeFieldMapComponent();
    if (cached) setFieldMap(() => cached);
    setPrefetchState(getMoeFieldPrefetchState());
  }, []);

  const syncFromCache = useCallback(() => {
    const cached = getCachedMoeFieldMapComponent();
    if (cached) setFieldMap(() => cached);
  }, []);

  useEffect(() => {
    return subscribeMoeFieldPrefetch((state) => {
      setPrefetchState(state);
      if (state === "ready") syncFromCache();
    });
  }, [syncFromCache]);

  useEffect(() => {
    if (FieldMap) return;
    prefetchMoeFieldMap()
      .then((component) => setFieldMap(() => component))
      .catch(() => {});
  }, [FieldMap]);

  const retryLoad = useCallback(() => {
    prefetchMoeFieldMap()
      .then((component) => setFieldMap(() => component))
      .catch(() => {});
  }, []);

  if (FieldMap) {
    return (
      <MoePanelStackProvider>
        <FieldMap
          worldMode={worldMode}
          onBack={onBack}
          onEnemyDefeat={onEnemyDefeat}
        />
      </MoePanelStackProvider>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-zinc-900 px-4 text-white">
      <p className="text-violet-200">
        {prefetchState === "error"
          ? "読み込みに失敗しました"
          : loadingLabel}
      </p>
      {prefetchState === "error" ? (
        <button
          type="button"
          onClick={retryLoad}
          className="rounded-lg border border-violet-400/50 bg-violet-900/50 px-4 py-2 text-sm font-bold text-violet-100 hover:bg-violet-800/60"
        >
          もう一度読み込む
        </button>
      ) : null}
    </main>
  );
}
