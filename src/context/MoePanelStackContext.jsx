"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  bringMoePanelToFront,
  moePanelResolvedZIndex,
  MOE_PANEL_DEFAULT_ORDERS,
  MOE_PANEL_STACK_BASE_Z,
} from "@/lib/moePanelStack";

const MoePanelStackContext = createContext(null);

const DEFAULT_STACK = { ...MOE_PANEL_DEFAULT_ORDERS };

export function MoePanelStackProvider({ children }) {
  const [stack, setStack] = useState(DEFAULT_STACK);

  const bringToFront = useCallback((panelId) => {
    if (!panelId) return;
    setStack((prev) => bringMoePanelToFront(prev, panelId));
  }, []);

  const getZIndex = useCallback(
    (panelId) => {
      if (!panelId) return MOE_PANEL_STACK_BASE_Z;
      return moePanelResolvedZIndex(stack, panelId);
    },
    [stack]
  );

  const value = useMemo(
    () => ({ bringToFront, getZIndex }),
    [bringToFront, getZIndex]
  );

  return (
    <MoePanelStackContext.Provider value={value}>
      {children}
    </MoePanelStackContext.Provider>
  );
}

export function useMoePanelStackOptional() {
  return useContext(MoePanelStackContext);
}

/**
 * @param {string} panelId
 * @param {{ minZIndex?: number }} [opts]
 */
export function useMoePanelStack(panelId, opts = {}) {
  const { minZIndex = 0 } = opts;
  const ctx = useMoePanelStackOptional();
  const stackZ = ctx?.getZIndex(panelId) ?? MOE_PANEL_STACK_BASE_Z;
  const zIndex =
    minZIndex > 0 ? Math.max(stackZ, minZIndex) : stackZ;
  const onStackPointerDown = useCallback(() => {
    ctx?.bringToFront(panelId);
  }, [ctx, panelId]);
  return { zIndex, onStackPointerDown };
}
