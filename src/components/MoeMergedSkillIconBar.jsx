"use client";

import { useCallback } from "react";
import { useMoeSkillPanelMode } from "@/hooks/useMoeSkillPanelMode";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import { useMoeSkillSlotSwap } from "@/hooks/useMoeSkillSlotSwap";
import { MOE_PLAYER_SKILL_SLOT_COUNT } from "@/data/moePlayerNinjaSkills";
import { renderPetSkillIcon } from "@/lib/moePetSkillIcons";
import { formatMoeSkillHoverTip } from "@/lib/moePetSkillDescription";
import MoeCompactSkillTip from "@/components/MoeCompactSkillTip";
import MoeSkillPanelSwitcher from "@/components/MoeSkillPanelSwitcher";
import { MOE_SKILL_ICON_SLOT_COUNT } from "@/components/MoeSkillIconBar";

const SLOT_PX = 32;
const CAP_W = 5;
const ICON_SIZE = 22;

function iconForPetSkill(skill) {
  if (!skill) return null;
  return renderPetSkillIcon(skill.name, { size: ICON_SIZE });
}

/**
 * 横スキル — プレイヤー技① / 技② / ペット合体（←→ループ）· 同一バーを2つ置ける
 */
export default function MoeMergedSkillIconBar({
  storageKey,
  defaultPos,
  showPlayer = true,
  petLabel = "ペット",
  panelMode,
  onPanelModeChange,
  petSlots,
  onPetActivate,
  isPetSkillUsable,
  player1Slots,
  player2Slots,
  player3Slots,
  onSwapPlayer1Slots,
}) {
  const [storedMode, setStoredMode] = useMoeSkillPanelMode(storageKey);
  const mode = panelMode ?? storedMode;
  const setMode = onPanelModeChange ?? setStoredMode;
  const effectiveMode = showPlayer ? mode : "pet";

  const isPlayer1 = effectiveMode === "player1";
  const isPlayer2 = effectiveMode === "player2";
  const isPlayer3 = effectiveMode === "player3";
  const isPet = effectiveMode === "pet";
  const isPlayer = isPlayer1 || isPlayer2 || isPlayer3;

  const getDefaultPos = useCallback(
    () =>
      defaultPos?.() ?? {
        x: Math.max(8, (window.innerWidth - 360) / 2),
        y: Math.max(8, window.innerHeight - (isPlayer ? 148 : 88)),
      },
    [defaultPos, isPlayer]
  );

  const { pos, sizeRef, onDragPointerDown } = useMoeDraggablePos(
    storageKey,
    getDefaultPos
  );

  const canReorder = isPlayer1 && typeof onSwapPlayer1Slots === "function";
  const { bindSlot } = useMoeSkillSlotSwap(onSwapPlayer1Slots ?? (() => {}));

  const headerGradient = isPlayer2
    ? "from-fuchsia-700 to-fuchsia-950"
    : isPlayer3
      ? "from-violet-700 to-violet-950"
      : isPlayer1
        ? "from-emerald-700 to-emerald-950"
        : "from-amber-600 to-amber-900";

  const petRow = petSlots.slice(0, MOE_SKILL_ICON_SLOT_COUNT);
  while (petRow.length < MOE_SKILL_ICON_SLOT_COUNT) petRow.push(null);

  const activePlayerSlots = isPlayer3
    ? player3Slots
    : isPlayer2
      ? player2Slots
      : player1Slots;
  const playerRow = activePlayerSlots.slice(0, MOE_PLAYER_SKILL_SLOT_COUNT);
  while (playerRow.length < MOE_PLAYER_SKILL_SLOT_COUNT) {
    playerRow.push({
      icon: "·",
      disabled: true,
      title: `${playerRow.length + 1}（空き）`,
      reorderable: true,
    });
  }

  const playerBtnIdle = isPlayer2
    ? "border-fuchsia-400/65 bg-gradient-to-b from-fuchsia-700 via-fuchsia-900 to-zinc-950 text-fuchsia-50 hover:border-fuchsia-200/75 hover:brightness-110"
    : isPlayer3
      ? "border-violet-400/65 bg-gradient-to-b from-violet-700 via-violet-900 to-zinc-950 text-violet-50 hover:border-violet-200/75 hover:brightness-110"
      : "border-emerald-400/65 bg-gradient-to-b from-emerald-700 via-emerald-900 to-zinc-950 text-emerald-50 hover:border-emerald-200/75 hover:brightness-110";

  const playerNumTone = isPlayer2
    ? "text-fuchsia-200/75"
    : isPlayer3
      ? "text-violet-200/75"
      : "text-emerald-200/75";

  if (!pos) return null;

  return (
    <div
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed z-[46] select-none"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="overflow-hidden rounded-[5px] border border-slate-300/85 bg-black shadow-[0_2px_10px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)]">
        <div
          className={`cursor-grab touch-none bg-gradient-to-b px-1 py-px active:cursor-grabbing ${headerGradient}`}
          onPointerDown={onDragPointerDown}
          title="ドラッグで移動"
        >
          {showPlayer ? (
            <MoeSkillPanelSwitcher
              mode={effectiveMode}
              onSelectMode={setMode}
              petLabel={petLabel}
            />
          ) : (
            <p className="text-center text-[8px] font-bold leading-tight text-amber-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
              {petLabel}
            </p>
          )}
        </div>
        <div className="h-px shrink-0 bg-white/55" aria-hidden />
        <div
          className="flex items-stretch bg-zinc-950 p-1"
          role="toolbar"
          aria-label={
            isPlayer1
              ? "プレイヤー技① 1〜10"
              : isPlayer2
                ? "プレイヤー技② 1〜10"
                : isPlayer3
                  ? "プレイヤー技③ 1〜10"
                  : "ペットスキル 1〜10"
          }
        >
          <div
            className="shrink-0 self-stretch bg-gradient-to-b from-slate-200/95 to-slate-400/90"
            style={{ width: CAP_W }}
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 items-center gap-0.5 px-0.5">
            {isPlayer
              ? playerRow.map((slot, i) => {
                  const onCooldown =
                    slot.cooldownSec !== null && slot.cooldownSec !== undefined;
                  const alwaysClickable = slot.slotKey === "jiriki_seiran";
                  const disabled =
                    (slot.disabled || onCooldown) && !alwaysClickable;
                  const slotReorder =
                    canReorder && slot.reorderable !== false;
                  const pointerProps = bindSlot(i, { reorderable: slotReorder });
                  const tip = slot.title ?? `${i + 1}（未設定）`;

                  return (
                    <MoeCompactSkillTip key={`merged-player-${i}`} text={tip}>
                      <button
                        type="button"
                        {...(pointerProps.slotAttr ?? {})}
                        disabled={!slotReorder && disabled}
                        aria-label={tip}
                        onClick={() => {
                          if (!alwaysClickable && disabled) return;
                          slot.onClick?.();
                        }}
                        style={{
                          width: SLOT_PX,
                          height: SLOT_PX,
                          ...pointerProps.style,
                        }}
                        className={`relative shrink-0 touch-none overflow-hidden rounded-[3px] border transition active:scale-95 ${
                          slot.unusable && !onCooldown
                            ? "cursor-pointer border-zinc-600/70 bg-gradient-to-b from-zinc-800/90 to-zinc-950 opacity-80"
                            : slot.disabled && !onCooldown
                            ? "cursor-default border-zinc-700/60 bg-gradient-to-b from-zinc-800/90 to-zinc-950 opacity-75"
                            : onCooldown
                              ? "cursor-not-allowed border-zinc-700/80 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-zinc-500 opacity-55"
                              : slot.active
                                ? "border-cyan-200/80 bg-gradient-to-b from-cyan-500/90 via-sky-700/95 to-zinc-950 text-cyan-50 ring-1 ring-cyan-200/40"
                                : playerBtnIdle
                        } ${pointerProps.className ?? ""}`}
                        onPointerDown={pointerProps.onPointerDown}
                        onPointerCancel={pointerProps.onPointerCancel}
                        onClickCapture={pointerProps.onClickCapture}
                      >
                        <span
                          className={`pointer-events-none absolute left-0.5 top-0 text-[6px] font-bold tabular-nums leading-none ${playerNumTone}`}
                        >
                          {i + 1}
                        </span>
                        <span
                          className={`pointer-events-none flex h-full w-full items-center justify-center text-[17px] leading-none ${
                            onCooldown ? "opacity-35" : ""
                          }`}
                        >
                          {slot.icon}
                        </span>
                        {onCooldown && (
                          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 text-[15px] font-bold tabular-nums leading-none text-amber-200/95">
                            {slot.cooldownSec}
                          </span>
                        )}
                        {!onCooldown && slot.subLabel ? (
                          <span
                            className={`pointer-events-none absolute inset-x-0 bottom-0 bg-black/35 text-center text-[5px] font-bold tabular-nums leading-none ${
                              slot.unusable ? "text-zinc-400" : "text-fuchsia-100/90"
                            }`}
                          >
                            {slot.subLabel}
                          </span>
                        ) : null}
                      </button>
                    </MoeCompactSkillTip>
                  );
                })
              : petRow.map((skill, i) => {
                  const icon = iconForPetSkill(skill);
                  const label = skill?.name ?? `スキル ${i + 1}`;
                  const filled = Boolean(skill);
                  const locked =
                    filled &&
                    typeof isPetSkillUsable === "function" &&
                    !isPetSkillUsable(skill);
                  const usable = filled && !locked;
                  const tip = filled
                    ? formatMoeSkillHoverTip(skill, { locked })
                    : `${i + 1}（未設定）`;

                  return (
                    <MoeCompactSkillTip key={`merged-pet-${i}`} text={tip}>
                      <button
                        type="button"
                        disabled={!usable}
                        aria-label={tip}
                        onClick={() => usable && onPetActivate(i, skill)}
                        style={{ width: SLOT_PX, height: SLOT_PX }}
                        className={`relative shrink-0 overflow-hidden rounded-[3px] border transition active:scale-95 ${
                          usable
                            ? "border-amber-400/70 bg-gradient-to-b from-amber-700 via-amber-900 to-zinc-950 text-amber-50 hover:border-amber-200/80 hover:brightness-110"
                            : filled
                              ? "cursor-not-allowed border-zinc-600/70 bg-gradient-to-b from-zinc-800/90 to-zinc-950 opacity-55"
                              : "cursor-default border-zinc-700/60 bg-gradient-to-b from-zinc-800/90 to-zinc-950 opacity-75"
                        }`}
                      >
                        <span
                          className={`pointer-events-none absolute left-0.5 top-0 text-[6px] font-bold tabular-nums leading-none ${
                            filled ? "text-amber-200/75" : "text-zinc-600"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="pointer-events-none flex h-full w-full items-center justify-center text-[17px] leading-none">
                          {filled ? icon : "·"}
                        </span>
                        {usable && skill?.skillSubInfo ? (
                          <span
                            className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/35 text-center text-[5px] font-bold leading-none text-amber-100/90"
                          >
                            {skill.skillSubInfo}
                          </span>
                        ) : null}
                      </button>
                    </MoeCompactSkillTip>
                  );
                })}
          </div>
          <div
            className="shrink-0 self-stretch bg-gradient-to-b from-slate-200/95 to-slate-400/90"
            style={{ width: CAP_W }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
