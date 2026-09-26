"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  loadMoePanelDock,
  MOE_DOCK_PANEL_BATTLE_LOG,
  MOE_DOCK_PANEL_MINIMAP_3D,
  moeDockedChildPosition,
  saveMoePanelDock,
  trySnapMoePanelDockRight,
} from "@/lib/moePanelDock";
import { playMoeUiSnapClick } from "@/lib/moeUiSnapSfx";

const MoePanelDockContext = createContext(null);

/**
 * @typedef {{
 *   setPosition: (pos: { x: number, y: number }) => void,
 *   getWidth?: () => number,
 * }} MoeDockPanelApi
 */

export function MoePanelDockProvider({ children }) {
  const [dock, setDock] = useState(null);
  const [snapHighlight, setSnapHighlight] = useState(false);
  const panelsRef = useRef(new Map());
  const boundsRef = useRef(new Map());
  const dockLoadedRef = useRef(false);
  const snapSoundPlayedRef = useRef(false);

  useEffect(() => {
    dockLoadedRef.current = false;
    setDock(loadMoePanelDock());
    dockLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!dockLoadedRef.current) return;
    saveMoePanelDock(dock);
  }, [dock]);

  const registerPanel = useCallback((panelId, api) => {
    panelsRef.current.set(panelId, api);
    return () => {
      panelsRef.current.delete(panelId);
    };
  }, []);

  const reportBounds = useCallback((panelId, bounds) => {
    boundsRef.current.set(panelId, bounds);
  }, []);

  const syncDockedChild = useCallback(() => {
    if (!dock) return;
    const parentBounds = boundsRef.current.get(dock.parentId);
    const parentApi = panelsRef.current.get(dock.parentId);
    const childApi = panelsRef.current.get(dock.childId);
    if (!parentBounds || !childApi) return;
    const parentWidth = parentApi?.getWidth?.() ?? parentBounds.width;
    const childPos = moeDockedChildPosition(
      { x: parentBounds.x, y: parentBounds.y },
      parentWidth
    );
    queueMicrotask(() => childApi.setPosition(childPos));
  }, [dock]);

  useEffect(() => {
    syncDockedChild();
  }, [dock, syncDockedChild]);

  const releaseDockIfChild = useCallback(
    (childId) => {
      if (dock?.childId === childId) {
        setDock(null);
      }
    },
    [dock]
  );

  const getPanelBounds = useCallback((panelId) => {
    return boundsRef.current.get(panelId) ?? null;
  }, []);

  const previewSnapChildPosition = useCallback((childId, childPos) => {
    if (childId !== MOE_DOCK_PANEL_BATTLE_LOG) {
      setSnapHighlight(false);
      snapSoundPlayedRef.current = false;
      return childPos;
    }
    const parentBounds = boundsRef.current.get(MOE_DOCK_PANEL_MINIMAP_3D);
    if (!parentBounds) {
      setSnapHighlight(false);
      snapSoundPlayedRef.current = false;
      return childPos;
    }
    const snapped = trySnapMoePanelDockRight(childPos, parentBounds);
    const active = Boolean(snapped);
    setSnapHighlight(active);
    if (active && !snapSoundPlayedRef.current) {
      snapSoundPlayedRef.current = true;
      void playMoeUiSnapClick();
    }
    if (!active) {
      snapSoundPlayedRef.current = false;
    }
    return snapped ?? childPos;
  }, []);

  const clearSnapPreview = useCallback(() => {
    setSnapHighlight(false);
    snapSoundPlayedRef.current = false;
  }, []);

  const trySnapChildOnDragEnd = useCallback((childId, childPos) => {
      if (childId !== MOE_DOCK_PANEL_BATTLE_LOG) {
        return childPos;
      }
      const parentBounds = boundsRef.current.get(MOE_DOCK_PANEL_MINIMAP_3D);
      if (!parentBounds) {
        setDock(null);
        return childPos;
      }
      const snapped = trySnapMoePanelDockRight(childPos, parentBounds);
      if (snapped) {
        setDock({
          childId: MOE_DOCK_PANEL_BATTLE_LOG,
          parentId: MOE_DOCK_PANEL_MINIMAP_3D,
        });
        return snapped;
      }
      setDock(null);
      return childPos;
    }, []);

  const notifyParentMoved = useCallback(
    (parentId, parentPos, parentWidth) => {
      if (!dock || dock.parentId !== parentId) return;
      const childApi = panelsRef.current.get(dock.childId);
      if (!childApi) return;
      const childPos = moeDockedChildPosition(parentPos, parentWidth);
      queueMicrotask(() => childApi.setPosition(childPos));
    },
    [dock]
  );

  const value = useMemo(
    () => ({
      dock,
      snapHighlight,
      registerPanel,
      reportBounds,
      getPanelBounds,
      releaseDockIfChild,
      previewSnapChildPosition,
      clearSnapPreview,
      trySnapChildOnDragEnd,
      notifyParentMoved,
      syncDockedChild,
    }),
    [
      dock,
      snapHighlight,
      registerPanel,
      reportBounds,
      getPanelBounds,
      releaseDockIfChild,
      previewSnapChildPosition,
      clearSnapPreview,
      trySnapChildOnDragEnd,
      notifyParentMoved,
      syncDockedChild,
    ]
  );

  return (
    <MoePanelDockContext.Provider value={value}>
      {children}
    </MoePanelDockContext.Provider>
  );
}

export function useMoePanelDockOptional() {
  return useContext(MoePanelDockContext);
}
