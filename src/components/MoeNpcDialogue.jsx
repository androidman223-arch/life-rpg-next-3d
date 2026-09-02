"use client";

import { MOE_PET_MASTER_NPC } from "@/data/moeFieldNpcs";

/**
 * NPC 会話ウィンドウ（メニュー / 次へ / 閉じる）
 * @param {{
 *   open: boolean,
 *   mode?: 'menu' | 'lines' | 'message',
 *   lines?: { speaker: string, text: string }[],
 *   lineIndex?: number,
 *   message?: { speaker?: string, text: string },
 *   menuPrompt?: string,
 *   menuActions?: { id: string, label: string, disabled?: boolean }[],
 *   onMenuSelect?: (id: string) => void,
 *   onNext?: () => void,
 *   onClose: () => void,
 *   petData: { name: string, emoji: string },
 *   npc?: { name: string, emoji: string },
 * }} props
 */
export default function MoeNpcDialogue({
  open,
  mode = "lines",
  lines = [],
  lineIndex = 0,
  message,
  menuPrompt = "何用じゃ？",
  menuActions = [],
  onMenuSelect,
  onNext,
  onClose,
  petData,
  npc = MOE_PET_MASTER_NPC,
}) {
  if (!open) return null;

  const resolveSpeaker = (speaker) => {
    if (speaker === "master") {
      return { label: npc.name, emoji: npc.emoji };
    }
    if (speaker === "pet") {
      return { label: petData.name, emoji: petData.emoji };
    }
    return { label: "……", emoji: "💬" };
  };

  if (mode === "menu") {
    const { label, emoji } = resolveSpeaker("master");
    return (
      <DialogShell npc={npc} onClose={onClose}>
        <SpeakerHeader emoji={emoji} label={label} />
        <p className="min-h-[2.5rem] text-sm leading-relaxed text-zinc-100">
          {menuPrompt}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {menuActions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={action.disabled}
              onClick={() => onMenuSelect?.(action.id)}
              className="rounded-lg border border-amber-600/35 bg-amber-950/50 px-3 py-2 text-left text-xs font-bold text-amber-50 transition hover:bg-amber-900/55 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {action.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700 active:scale-95"
          >
            やめる
          </button>
        </div>
      </DialogShell>
    );
  }

  if (mode === "message" && message?.text) {
    const { label, emoji } = resolveSpeaker(message.speaker ?? "master");
    return (
      <DialogShell npc={npc} onClose={onClose}>
        <SpeakerHeader emoji={emoji} label={label} />
        <p className="min-h-[3.5rem] text-sm leading-relaxed text-zinc-100">
          {message.text}
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-amber-50 transition hover:bg-amber-500 active:scale-95"
          >
            終わる
          </button>
        </div>
      </DialogShell>
    );
  }

  if (!lines.length) return null;

  const line = lines[Math.min(lineIndex, lines.length - 1)];
  const isLast = lineIndex >= lines.length - 1;
  const { label, emoji } = resolveSpeaker(line.speaker);

  return (
    <DialogShell npc={npc} onClose={onClose}>
      <SpeakerHeader emoji={emoji} label={label} />
      <p className="min-h-[3.5rem] text-sm leading-relaxed text-zinc-100">
        {line.text}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[10px] tabular-nums text-zinc-500">
          {lineIndex + 1} / {lines.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700 active:scale-95"
          >
            閉じる
          </button>
          {!isLast ? (
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-amber-50 transition hover:bg-amber-500 active:scale-95"
            >
              次へ
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-amber-50 transition hover:bg-amber-500 active:scale-95"
            >
              終わる
            </button>
          )}
        </div>
      </div>
    </DialogShell>
  );
}

function DialogShell({ npc, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[57] flex items-end justify-center bg-black/50 p-4 pb-8 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-[min(92vw,22rem)] rounded-xl border-2 border-amber-500/45 bg-gradient-to-b from-zinc-900/98 to-zinc-950/98 p-4 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`${npc.name}との会話`}
      >
        {children}
      </div>
    </div>
  );
}

function SpeakerHeader({ emoji, label }) {
  return (
    <div className="mb-2 flex items-center gap-2 border-b border-amber-500/25 pb-2">
      <span className="text-2xl">{emoji}</span>
      <p className="text-xs font-bold text-amber-100">{label}</p>
    </div>
  );
}
