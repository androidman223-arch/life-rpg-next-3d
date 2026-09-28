"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import {
  loadMoeSkillPanelModeForPanel,
  saveMoeSkillPanelModeForPanel,
} from "@/lib/moeSkillPanelModeSettings";

/**
 * スキルパネル単体の ←→ ページ
 * @param {string} panelStorageKey
 * @param {import("@/lib/moeSkillPanelModeSettings").MoeSkillPanelMode} [fallbackMode]
 */
export function useMoeSkillPanelMode(panelStorageKey, fallbackMode) {
  const initial = fallbackMode ?? "pet";
  const [mode, setMode] = useState(initial);

  useLayoutEffect(() => {
    setMode(loadMoeSkillPanelModeForPanel(panelStorageKey, fallbackMode));
  }, [panelStorageKey, fallbackMode]);

  const setPanelMode = useCallback(
    (next) => {
      setMode(next);
      saveMoeSkillPanelModeForPanel(panelStorageKey, next);
    },
    [panelStorageKey]
  );

  return [mode, setPanelMode];
}
