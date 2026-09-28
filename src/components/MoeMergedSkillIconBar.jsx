"use client";

import { useCallback, useRef } from "react";
import { useMoeSkillPanelMode } from "@/hooks/useMoeSkillPanelMode";
import { useMoeDraggablePos } from "@/hooks/useMoeDraggablePos";
import { useMoeSkillSlotSwap } from "@/hooks/useMoeSkillSlotSwap";
import { MOE_PLAYER_SKILL_SLOT_COUNT } from "@/data/moePlayerNinjaSkills";
import { renderPetSkillIcon } from "@/lib/moePetSkillIcons";
import { formatMoeSkillHoverTip } from "@/lib/moePetSkillDescription";
import MoeCompactSkillTip from "@/components/MoeCompactSkillTip";
import MoeSkillPanelSwitcher from "@/components/MoeSkillPanelSwitcher";
import MoeKakureminoIcon from "@/components/icons/MoeKakureminoIcon";
import MoeKintounIcon from "@/components/icons/MoeKintounIcon";
import MoeShinobiashiIcon from "@/components/icons/MoeShinobiashiIcon";
import MoeSkateboardIcon from "@/components/icons/MoeSkateboardIcon";
import MoeTeleportIcon from "@/components/icons/MoeTeleportIcon";
import { MOE_SKILL_ICON_SLOT_COUNT } from "@/components/MoeSkillIconBar";
import MoeSkillPanelCloseButton from "@/components/MoeSkillPanelCloseButton";
import MoeFloatingPanelRoot from "@/components/MoeFloatingPanelRoot";
import { moeFloatingDragTitle } from "@/lib/moePanelStack";

const SLOT_PX = 32;
const CAP_W = 5;
const ICON_SIZE = 22;

const TRAINING_SVG_ICONS = {
  phoenix_lv40: MoeTeleportIcon,
  dragon_lv20: MoeShinobiashiIcon,
  dragon_lv40: MoeSkateboardIcon,
  dragon_lv50: MoeKakureminoIcon,
  dragon_lv80: MoeKintounIcon,
};

function trainingSlotIcon(slot) {
  const Icon = TRAINING_SVG_ICONS[slot.slotKey];
  if (Icon) return <Icon size={18} />;
  return slot.icon ?? "✦";
}

function iconForPetSkill(skill) {
  if (!skill) return null;
  return renderPetSkillIcon(skill.name, { size: ICON_SIZE });
}

/**
 * 横スキル — 技①②③ / ペット / 鳳凰 / 龍神（←→ループ）
 */
export default function MoeMergedSkillIconBar({
  storageKey,
  defaultPos,
  defaultMode,
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
  macroSlots = [],
  onOpenMacroSettings,
  phoenixSlots = [],
  dragonSlots = [],
  onSwapSet1,
  onSwapSet2,
  onCopySkill,
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
  const isPlayer = isPlayer1 || isPlayer2 || isPlayer3 || isMacro;
  const isTraining = isPhoenix || isDragon;

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

  const isSet = isPlayer2 || isPlayer3;
  const dragPanelId = isPlayer2
    ? "set1"
    : isPlayer3
      ? "set2"
      : isMacro
        ? "macro-run"
        : effectiveMode;
  const copyRowsRef = useRef([]);
  const { bindSlot } = useMoeSkillSlotSwap(
    isPlayer2 ? onSwapSet1 ?? (() => {}) : isPlayer3 ? onSwapSet2 ?? (() => {}) : () => {},
    {
      panelId: dragPanelId,
      mode: isSet ? "reorder" : "copy",
      onCopy: (from, toPanel, toIndex) => {
        const slot = copyRowsRef.current[from];
        const slotKey =
          slot?.slotKey || (slot?.skill?.id ? `pet:${slot.skill.id}` : null);
        if (!slotKey) return;
        onCopySkill?.(effectiveMode, slotKey, toPanel, toIndex);
      },
    }
  );

  const headerGradient = isMacro
    ? "from-amber-700 to-amber-950"
    : isPlayer2
    ? "from-fuchsia-700 to-fuchsia-950"
    : isPlayer3
      ? "from-violet-700 to-violet-950"
      : isPhoenix
        ? "from-amber-600 to-amber-900"
        : isDragon
          ? "from-emerald-600 to-emerald-900"
          : isPlayer1
            ? "from-emerald-700 to-emerald-950"
            : "from-amber-600 to-amber-900";

  const petRow = petSlots.slice(0, MOE_SKILL_ICON_SLOT_COUNT);
  while (petRow.length < MOE_SKILL_ICON_SLOT_COUNT) petRow.push(null);

  const activePlayerSlots = isMacro
    ? macroSlots
    : isPlayer3
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

  const playerBtnIdle = isMacro
    ? "border-amber-400/65 bg-gradient-to-b from-amber-700 via-amber-900 to-zinc-950 text-amber-50 hover:border-amber-200/75 hover:brightness-110"
    : isPlayer2
    ? "border-fuchsia-400/65 bg-gradient-to-b from-fuchsia-700 via-fuchsia-900 to-zinc-950 text-fuchsia-50 hover:border-fuchsia-200/75 hover:brightness-110"
    : isPlayer3
      ? "border-violet-400/65 bg-gradient-to-b from-violet-700 via-violet-900 to-zinc-950 text-violet-50 hover:border-violet-200/75 hover:brightness-110"
      : "border-emerald-400/65 bg-gradient-to-b from-emerald-700 via-emerald-900 to-zinc-950 text-emerald-50 hover:border-emerald-200/75 hover:brightness-110";

  const playerNumTone = isMacro
    ? "text-amber-200/75"
    : isPlayer2
    ? "text-fuchsia-200/75"
    : isPlayer3
      ? "text-violet-200/75"
      : "text-emerald-200/75";

  copyRowsRef.current = isTraining
    ? isDragon
      ? dragonSlots
      : phoenixSlots
    : isPlayer
      ? playerRow
      : petRow;

  if (!pos) return null;

  return (
    <MoeFloatingPanelRoot
      panelId={storageKey}
      ref={(el) => {
        if (el) {
          sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }}
      className="fixed select-none"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className={`overflow-hidden rounded-[5px] border border-slate-300/85 bg-black shadow-[0_2px_10px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] ${collapsed ? "min-w-[7.5rem]" : ""}`}>
        <div
          className={`relative min-h-5 cursor-grab touch-none bg-gradient-to-b py-1 pl-5 pr-1 text-white active:cursor-grabbing ${headerGradient}`}
          onPointerDown={onDragPointerDown}
          title={moeFloatingDragTitle("ドラッグで移動")}
        >
          {onClose ? (
            <MoeSkillPanelCloseButton collapsed={collapsed} onClose={onClose} />
          ) : null}
          {showPlayer ? (
            <MoeSkillPanelSwitcher
              mode={effectiveMode}
              onSelectMode={setMode}
              petLabel={petLabel}
            />
          ) : (
            <p className="w-full text-center text-[8px] font-bold leading-tight text-amber-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
              {petLabel}
            </p>
          )}
        </div>
        {!collapsed ? (
        <>
        <div className="h-px shrink-0 bg-white/55" aria-hidden />
        {isMacro && onOpenMacroSettings ? (
          <button
            type="button"
            onClick={onOpenMacroSettings}
            title="マクロの中身を編集"
            className="w-full border-b border-amber-300/40 bg-amber-800 py-1 text-[11px] font-bold text-amber-50"
          >
            設定
          </button>
        ) : null}
        <div
          className="flex items-stretch bg-zinc-950 p-1"
          role="toolbar"
          aria-label={
            isPlayer1
              ? "プレイヤー技① 1〜10"
              : isMacro
                ? "マクロ 1〜10"
                : isPlayer2
                ? "セット1"
                : isPlayer3
                  ? "セット2"
                  : isPhoenix
                    ? "鳳凰スキル"
                    : isDragon
                      ? "龍神スキル"
                      : "ペットスキル 1〜10"
          }
        >
          <div
            className="shrink-0 self-stretch bg-gradient-to-b from-slate-200/95 to-slate-400/90"
            style={{ width: CAP_W }}
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 items-center gap-0.5 px-0.5">
            {isTraining
              ? (isDragon ? dragonSlots : phoenixSlots).map((slot, i) => {
                  const tip = slot.title ?? slot.label;
                  const alwaysClickable = Boolean(slot.trainingSkill);
                  const disabled =
                    !alwaysClickable && (slot.disabled || slot.unusable);
                  const idle = isDragon
                    ? "border-emerald-500/55 bg-gradient-to-b from-emerald-700/95 to-emerald-950 text-emerald-50 hover:brightness-110"
                    : "border-amber-500/55 bg-gradient-to-b from-amber-700/95 to-orange-950 text-amber-50 hover:brightness-110";
                  const lvTone = isDragon
                    ? "text-emerald-200/75"
                    : "text-amber-200/75";
                  const pointerProps = bindSlot(i, {
                    reorderable: false,
                    copyable: Boolean(slot.slotKey),
                  });
                  return (
                    <MoeCompactSkillTip key={slot.slotKey ?? `train-${i}`} text={tip}>
                      <button
                        type="button"
                        {...(pointerProps.slotAttr ?? {})}
                        disabled={!alwaysClickable && disabled}
                        aria-label={tip}
                        onClick={() => {
                          if (!alwaysClickable && disabled) return;
                          slot.onClick?.();
                        }}
                        style={{ width: SLOT_PX, height: SLOT_PX }}
                        className={`relative shrink-0 overflow-hidden rounded-[3px] border transition active:scale-95 ${
                          slot.unusable
                            ? "cursor-pointer border-zinc-600/70 bg-gradient-to-b from-zinc-800/90 to-zinc-950 text-zinc-300 opacity-80"
                            : slot.active
                              ? "border-cyan-200/80 bg-gradient-to-b from-cyan-500/90 via-sky-700/95 to-zinc-950 text-cyan-50 ring-1 ring-cyan-200/40"
                              : idle
                        } ${pointerProps.className ?? ""}`}
                        onPointerDown={pointerProps.onPointerDown}
                        onPointerCancel={pointerProps.onPointerCancel}
                        onClickCapture={pointerProps.onClickCapture}
                      >
                        <span
                          className={`pointer-events-none absolute left-0.5 top-0 text-[6px] font-bold tabular-nums leading-none ${lvTone}`}
                        >
                          {(i + 1) * 10}
                        </span>
                        <span className="pointer-events-none flex h-full w-full items-center justify-center text-[17px] leading-none">
                          {trainingSlotIcon(slot)}
                        </span>
                        {slot.subLabel ? (
                          <span
                            className={`pointer-events-none absolute inset-x-0 bottom-0 bg-black/35 text-center text-[5px] font-bold leading-none ${
                              slot.unusable ? "text-zinc-400" : lvTone
                            }`}
                          >
                            {slot.subLabel}
                          </span>
                        ) : null}
                      </button>
                    </MoeCompactSkillTip>
                  );
                })
              : isPlayer
              ? playerRow.map((slot, i) => {
                  const onCooldown =
                    slot.cooldownSec !== null && slot.cooldownSec !== undefined;
                  const alwaysClickable = slot.slotKey === "jiriki_seiran";
                  const disabled =
                    (slot.disabled || onCooldown) && !alwaysClickable;
                  const slotReorder = isSet && slot.reorderable !== false;
                  const slotCopyable =
                    !isSet && Boolean(slot.slotKey) && !slot.previewOnly;
                  const pointerProps = bindSlot(i, {
                    reorderable: slotReorder,
                    copyable: slotCopyable,
                  });
                  const tip = slot.title ?? `${i + 1}（未設定）`;

                  return (
                    <MoeCompactSkillTip key={`merged-player-${i}`} text={tip}>
                      <button
                        type="button"
                        {...(pointerProps.slotAttr ?? {})}
                        disabled={!slotReorder && !slotCopyable && disabled}
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
                          {slot.trainingSkill ? trainingSlotIcon(slot) : slot.icon}
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
              : petRow.map((slot, i) => {
                  const skill = slot?.skill ?? slot;
                  const cooldownSec =
                    slot?.cooldownSec != null && slot.cooldownSec > 0
                      ? slot.cooldownSec
                      : null;
                  const onCooldown = cooldownSec != null;
                  const icon = iconForPetSkill(skill);
                  const label = skill?.name ?? `スキル ${i + 1}`;
                  const filled = Boolean(skill);
                  const locked =
                    filled &&
                    typeof isPetSkillUsable === "function" &&
                    !isPetSkillUsable(skill);
                  const usable = filled && !locked && !onCooldown;
                  const tip = filled
                    ? onCooldown
                      ? `${label}\n（待ち ${cooldownSec}秒）`
                      : formatMoeSkillHoverTip(skill, { locked })
                    : `${i + 1}（未設定）`;

                  const copyKey = slot?.slotKey || (skill?.id ? `pet:${skill.id}` : null);
                  const pointerProps = bindSlot(i, {
                    reorderable: false,
                    copyable: Boolean(copyKey),
                  });
                  return (
                    <MoeCompactSkillTip key={`merged-pet-${i}`} text={tip}>
                      <button
                        type="button"
                        {...(pointerProps.slotAttr ?? {})}
                        aria-label={tip}
                        onClick={() => usable && onPetActivate(i, skill)}
                        style={{ width: SLOT_PX, height: SLOT_PX }}
                        className={`relative shrink-0 touch-none overflow-hidden rounded-[3px] border transition active:scale-95 ${
                          onCooldown
                            ? "cursor-not-allowed border-zinc-700/80 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-zinc-500 opacity-55"
                            : usable
                              ? "border-amber-400/70 bg-gradient-to-b from-amber-700 via-amber-900 to-zinc-950 text-amber-50 hover:border-amber-200/80 hover:brightness-110"
                              : filled
                                ? "cursor-pointer border-zinc-600/70 bg-gradient-to-b from-zinc-800/90 to-zinc-950 opacity-55"
                                : "cursor-default border-zinc-700/60 bg-gradient-to-b from-zinc-800/90 to-zinc-950 opacity-75"
                        } ${pointerProps.className ?? ""}`}
                        onPointerDown={pointerProps.onPointerDown}
                        onPointerCancel={pointerProps.onPointerCancel}
                        onClickCapture={pointerProps.onClickCapture}
                      >
                        <span
                          className={`pointer-events-none absolute left-0.5 top-0 text-[6px] font-bold tabular-nums leading-none ${
                            filled ? "text-amber-200/75" : "text-zinc-600"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span
                          className={`pointer-events-none flex h-full w-full items-center justify-center text-[17px] leading-none ${
                            onCooldown ? "opacity-35" : ""
                          }`}
                        >
                          {filled ? icon : "·"}
                        </span>
                        {onCooldown ? (
                          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 text-[15px] font-bold tabular-nums leading-none text-amber-200/95">
                            {cooldownSec}
                          </span>
                        ) : null}
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
        </>
        ) : null}
      </div>
    </MoeFloatingPanelRoot>
  );
}
