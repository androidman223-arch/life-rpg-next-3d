"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadMoePanelCollapsed,
  saveMoePanelCollapsed,
} from "@/lib/moePanelCollapse";

/**
 * @param {import("@/lib/moePanelCollapse").MoePanelCollapseId} panelId
 */
export function useMoePanelCollapsed(panelId) {
  const [collapsed, setCollapsed] = useState(false);
  const canSaveRef = useRef(false);

  useEffect(() => {
    canSaveRef.current = false;
    setCollapsed(loadMoePanelCollapsed(panelId));
    canSaveRef.current = true;
  }, [panelId]);

  useEffect(() => {
    if (!canSaveRef.current) return;
    saveMoePanelCollapsed(panelId, collapsed);
  }, [collapsed, panelId]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => !v);
  }, []);

  return { collapsed, setCollapsed, toggleCollapsed };
}
