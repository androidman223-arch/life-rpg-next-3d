"use client";

import { useCallback, useState } from "react";
import {
  loadMoeSkillPanelModeForPanel,
  saveMoeSkillPanelModeForPanel,
} from "@/lib/moeSkillPanelModeSettings";

/**
 * スキルパネル単体の ←→ モード（player1 / player2 / pet）
 * @param {string} panelStorageKey
 */
export function useMoeSkillPanelMode(panelStorageKey) {
  const [mode, setMode] = useState(() =>
    loadMoeSkillPanelModeForPanel(panelStorageKey)
  );

  const setPanelMode = useCallback(
    (next) => {
      setMode(next);
      saveMoeSkillPanelModeForPanel(panelStorageKey, next);
    },
    [panelStorageKey]
  );

  return [mode, setPanelMode];
}
