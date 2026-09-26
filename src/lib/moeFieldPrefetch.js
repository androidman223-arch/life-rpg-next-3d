/** MOE フィールド（MoeFieldMap）の JS チャンクを先読み — 初回 import で即スタート */

/** @type {Promise<import("@/components/MoeFieldMap").default> | null} */
let prefetchPromise = null;

/** @type {import("@/components/MoeFieldMap").default | null} */
let cachedMoeFieldMapComponent = null;

/** @type {"idle" | "loading" | "ready" | "error"} */
let prefetchState = "idle";

/** @type {Set<(state: typeof prefetchState) => void>} */
const listeners = new Set();

function notifyPrefetchListeners() {
  for (const fn of listeners) fn(prefetchState);
}

export function getMoeFieldPrefetchState() {
  return prefetchState;
}

/** @returns {import("@/components/MoeFieldMap").default | null} */
export function getCachedMoeFieldMapComponent() {
  return cachedMoeFieldMapComponent;
}

/** @param {(state: typeof prefetchState) => void} listener */
export function subscribeMoeFieldPrefetch(listener) {
  listeners.add(listener);
  listener(prefetchState);
  return () => listeners.delete(listener);
}

/** @returns {Promise<import("@/components/MoeFieldMap").default>} */
export function prefetchMoeFieldMap() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("prefetch requires window"));
  }
  if (prefetchPromise) return prefetchPromise;
  prefetchState = "loading";
  notifyPrefetchListeners();
  prefetchPromise = import("@/components/MoeFieldMap")
    .then((mod) => {
      cachedMoeFieldMapComponent = mod.default;
      prefetchState = "ready";
      notifyPrefetchListeners();
      return mod.default;
    })
    .catch((err) => {
      prefetchState = "error";
      prefetchPromise = null;
      cachedMoeFieldMapComponent = null;
      notifyPrefetchListeners();
      console.error("[MOE] MoeFieldMap prefetch failed:", err);
      throw err;
    });
  return prefetchPromise;
}

/** 未開始なら即スタート */
export function startMoeFieldPrefetch() {
  if (prefetchState === "ready" && prefetchPromise) return prefetchPromise;
  return prefetchMoeFieldMap();
}

