"use client";

import MoeVerticalSkillPanel from "@/components/MoeVerticalSkillPanel";
import MoeSkillPanelSwitcher from "@/components/MoeSkillPanelSwitcher";
import { useMoeSkillPanelMode } from "@/hooks/useMoeSkillPanelMode";

/**
 * 縦スキル — プレイヤー技① / 技② / ペット合体（←→ループ）· 同一パネルを2つ置ける
 * @param {{
 *   storageKey: string,
 *   defaultPos?: () => { x: number, y: number },
 *   showPlayer?: boolean,
 *   petLabel?: string,
 *   panelMode?: 'player1' | 'player2' | 'player3' | 'pet',
 *   onPanelModeChange?: (mode: 'player1' | 'player2' | 'player3' | 'pet') => void,
 *   pet: {
 *     topAction?: object|null,
 *     slots: object[],
 *   },
 *   player1: {
 *     slots: object[],
 *     reorderable?: boolean,
 *     onSwapSlots?: (from: number, to: number) => void,
 *   },
 *   player2: {
 *     slots: object[],
 *   },
 *   player3: {
 *     slots: object[],
 *   },
 *   onClose?: () => void,
 *   collapsed?: boolean,
 * }} props
 */
export default function MoeMergedVerticalSkillPanel({
  storageKey,
  defaultPos,
  showPlayer = true,
  petLabel = "ペット",
  panelMode,
  onPanelModeChange,
  pet,
  player1,
  player2,
  player3,
  onClose,
  collapsed = false,
}) {
  const [storedMode, setStoredMode] = useMoeSkillPanelMode(storageKey);
  const mode = panelMode ?? storedMode;
  const setMode = onPanelModeChange ?? setStoredMode;
  const effectiveMode = showPlayer ? mode : "pet";

  const isPlayer1 = effectiveMode === "player1";
  const isPlayer2 = effectiveMode === "player2";
  const isPlayer3 = effectiveMode === "player3";
  const isPet = effectiveMode === "pet";

  const title = isPlayer1
    ? "プレイヤー技①"
    : isPlayer2
      ? "プレイヤー技②"
      : isPlayer3
        ? "プレイヤー技③"
        : petLabel;
  const variant = isPet ? "amber" : "emerald";

  const headerExtra = showPlayer ? (
    <MoeSkillPanelSwitcher
      mode={effectiveMode}
      onSelectMode={setMode}
      petLabel={petLabel}
    />
  ) : undefined;

  return (
    <MoeVerticalSkillPanel
      storageKey={storageKey}
      defaultPos={defaultPos}
      title={title}
      variant={variant}
      topAction={isPet ? pet.topAction : null}
      headerExtra={headerExtra}
      reorderable={isPlayer1 ? player1.reorderable : false}
      onSwapSlots={isPlayer1 ? player1.onSwapSlots : undefined}
      slots={
        isPlayer1
          ? player1.slots
          : isPlayer2
            ? player2.slots
            : isPlayer3
              ? player3.slots
              : pet.slots
      }
      onClose={onClose}
      collapsed={collapsed}
    />
  );
}
