"use client";

import MoeVerticalSkillPanel from "@/components/MoeVerticalSkillPanel";
import MoeSkillPanelSwitcher from "@/components/MoeSkillPanelSwitcher";
import { useMoeSkillPanelMode } from "@/hooks/useMoeSkillPanelMode";

/**
 * 縦スキル — 技①②③ / ペット / 鳳凰 / 龍神（←→ループ）
 * @param {{
 *   storageKey: string,
 *   defaultPos?: () => { x: number, y: number },
 *   defaultMode?: 'player1' | 'macro' | 'player2' | 'player3' | 'pet' | 'phoenix' | 'dragon',
 *   showPlayer?: boolean,
 *   petLabel?: string, 縦ヘッダーは常に「ペット」（名前は出さない）
 *   panelMode?: 'player1' | 'macro' | 'player2' | 'player3' | 'pet' | 'phoenix' | 'dragon',
 *   onPanelModeChange?: (mode: 'player1' | 'macro' | 'player2' | 'player3' | 'pet' | 'phoenix' | 'dragon') => void,
 *   pet: {
 *     topAction?: object|null,
 *     slots: object[],
 *   },
 *   player1: {
 *     slots: object[],
 *     reorderable?: boolean,
 *     onSwapSlots?: (from: number, to: number) => void,
 *   },
 *   player2: { slots: object[], onSwapSlots?: (from: number, to: number) => void },
 *   player3: { slots: object[], onSwapSlots?: (from: number, to: number) => void },
 *   macroSlots?: object[],
 *   onOpenMacroSettings?: () => void,
 *   onCopySkill?: (source: string, from: number, toPanel: string, toIndex: number) => void,
 *   phoenixSlots?: object[],
 *   dragonSlots?: object[],
 *   onClose?: () => void,
 *   collapsed?: boolean,
 * }} props
 */
export default function MoeMergedVerticalSkillPanel({
  storageKey,
  defaultPos,
  defaultMode,
  showPlayer = true,
  panelMode,
  onPanelModeChange,
  pet,
  player1,
  player2,
  player3,
  macroSlots = [],
  onOpenMacroSettings,
  onCopySkill,
  phoenixSlots = [],
  dragonSlots = [],
  onClose,
  collapsed = false,
}) {
  const [storedMode, setStoredMode] = useMoeSkillPanelMode(
    storageKey,
    defaultMode
  );
  const mode = panelMode ?? storedMode;
  const setMode = onPanelModeChange ?? setStoredMode;
  const effectiveMode = showPlayer ? mode : "pet";

  const isPlayer1 = effectiveMode === "player1";
  const isMacro = effectiveMode === "macro";
  const isPlayer2 = effectiveMode === "player2";
  const isPlayer3 = effectiveMode === "player3";
  const isPhoenix = effectiveMode === "phoenix";
  const isDragon = effectiveMode === "dragon";
  const isPet = effectiveMode === "pet";

  const title = isPlayer1
    ? "技1"
    : isMacro
      ? "マクロ"
      : isPlayer2
        ? "セット1"
        : isPlayer3
        ? "セット2"
        : isPhoenix
          ? "鳳凰"
          : isDragon
            ? "龍神"
            : "ペット";
  const variant = isPhoenix
    ? "phoenix"
    : isDragon
      ? "dragon"
      : isPet
        ? "amber"
        : "emerald";

  const headerExtra = showPlayer ? (
    <MoeSkillPanelSwitcher
      stack
      mode={effectiveMode}
      onSelectMode={setMode}
      petLabel="ペット"
      modeLabels={{
        player1: "技1",
        macro: "マクロ",
        player2: "セット1",
        player3: "セット2",
        phoenix: "鳳凰",
        dragon: "龍神",
      }}
    />
  ) : undefined;

  return (
    <MoeVerticalSkillPanel
      storageKey={storageKey}
      defaultPos={defaultPos}
      title={title}
      variant={variant}
      topAction={
        isMacro
          ? {
              label: "設定",
              title: "マクロの中身を編集",
              onClick: onOpenMacroSettings,
            }
          : isPet
            ? pet.topAction
            : null
      }
      headerExtra={headerExtra}
      reorderable={isPlayer2 || isPlayer3}
      onSwapSlots={
        isPlayer2
          ? player2.onSwapSlots
          : isPlayer3
            ? player3.onSwapSlots
            : undefined
      }
      dragPanelId={
        isPlayer2 ? "set1" : isPlayer3 ? "set2" : isMacro ? "macro-run" : effectiveMode
      }
      dragMode={isPlayer2 || isPlayer3 ? "reorder" : "copy"}
      onCopySlot={
        isPlayer2 || isPlayer3
          ? undefined
          : (from, toPanel, toIndex) => {
              const list = isPlayer1
                ? player1.slots
                : isMacro
                  ? macroSlots
                  : isPhoenix
                    ? phoenixSlots
                    : isDragon
                      ? dragonSlots
                      : pet.slots;
              const slotKey = list[from]?.slotKey;
              if (!slotKey) return;
              onCopySkill?.(effectiveMode, slotKey, toPanel, toIndex);
            }
      }
      slots={
        isPlayer1
          ? player1.slots
          : isMacro
            ? macroSlots
            : isPlayer2
            ? player2.slots
            : isPlayer3
              ? player3.slots
              : isPhoenix
                ? phoenixSlots
                : isDragon
                  ? dragonSlots
                  : pet.slots
      }
      onClose={onClose}
      collapsed={collapsed}
    />
  );
}
