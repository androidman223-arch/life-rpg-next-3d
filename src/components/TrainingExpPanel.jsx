"use client";

import { useEffect, useRef } from "react";
import { getLifeRpgTrainingExpConfig } from "@/lib/lifeRpgTrainingExpBridge";

const SCRIPT_SRC = "/training-exp-system/training-exp-system.js?v=6";
const CSS_HREF = "/training-exp-system/training-exp-system.css?v=6";

let scriptLoadPromise = null;

function loadTrainingExpScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.TrainingExpSystem) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      if (window.TrainingExpSystem) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
  return scriptLoadPromise;
}

function ensureTrainingExpCss() {
  if (typeof document === "undefined") return;
  if (document.querySelector(`link[href="${CSS_HREF}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = CSS_HREF;
  document.head.appendChild(link);
}

/**
 * @param {{ open: boolean, onTrainerExpGranted?: () => void }} props
 */
export default function TrainingExpPanel({ open, onTrainerExpGranted }) {
  const rootRef = useRef(null);
  const hooksRef = useRef({ onTrainerExpGranted });
  hooksRef.current.onTrainerExpGranted = onTrainerExpGranted;

  useEffect(() => {
    if (!open) return undefined;

    let rafId = 0;
    let cancelled = false;

    ensureTrainingExpCss();

    (async () => {
      try {
        await loadTrainingExpScript();
        if (cancelled || !rootRef.current || !window.TrainingExpSystem) return;

        window.TrainingExpSystem.mount(
          rootRef.current,
          getLifeRpgTrainingExpConfig({
            onTrainerExpGranted: () => hooksRef.current.onTrainerExpGranted?.(),
          })
        );
        window.TrainingExpSystem.toggleFold(true);

        const tick = () => {
          if (cancelled) return;
          window.TrainingExpSystem?.tickUi?.();
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      } catch (err) {
        console.warn("TrainingExpSystem の読み込みに失敗:", err);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.TrainingExpSystem?.unmount?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      className="mt-4 w-full text-left training-exp-panel-host"
      aria-label="修行パネル"
    />
  );
}
