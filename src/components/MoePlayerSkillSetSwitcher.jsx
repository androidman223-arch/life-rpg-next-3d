"use client";

/**
 * プレイヤー技① / プレイヤー技② 切替（← →）
 * どちらの矢印も常に押せて、1↔2 を止まらず切り替え
 * @param {{ activeSet: 1|2, onSelectSet: (set: 1|2) => void, variant?: 'emerald' | 'amber' }} props
 */
export default function MoePlayerSkillSetSwitcher({
  activeSet,
  onSelectSet,
  variant = "emerald",
}) {
  const active1 = activeSet !== 2;
  const active2 = activeSet === 2;
  const setLabel = activeSet === 2 ? "プレイヤー技２" : "プレイヤー技１";
  const activeBtn =
    variant === "emerald"
      ? "border-emerald-300/70 bg-emerald-800/80 text-emerald-50 ring-1 ring-emerald-200/35"
      : "border-fuchsia-300/75 bg-fuchsia-900/90 text-fuchsia-50 ring-1 ring-fuchsia-200/40";
  const idleBtn =
    variant === "emerald"
      ? "border-emerald-700/45 bg-emerald-950/50 text-emerald-100/90 hover:bg-emerald-900/45"
      : "border-indigo-700/50 bg-indigo-950/80 text-indigo-100 hover:bg-indigo-900/85";

  /** プレイヤー技①側 — 既に①なら②へ回る */
  const goLeft = () => onSelectSet(activeSet === 1 ? 2 : 1);
  /** プレイヤー技②側 — 既に②なら①へ回る */
  const goRight = () => onSelectSet(activeSet === 2 ? 1 : 2);

  return (
    <div className="flex items-stretch gap-0.5">
      <button
        type="button"
        title="プレイヤー技１ — 回復・忍者（← で切替）"
        onClick={goLeft}
        className={`w-[5.25rem] shrink-0 rounded border px-0 py-0.5 text-[8px] font-bold leading-none transition active:scale-95 ${
          active1 ? activeBtn : idleBtn
        }`}
      >
        ←
      </button>
      <div
        className={`flex min-w-0 flex-1 items-center justify-center rounded border px-0.5 py-0.5 text-[8px] font-bold leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] ${
          active2
            ? "border-fuchsia-500/40 bg-fuchsia-950/50 text-fuchsia-100"
            : "border-emerald-600/35 bg-emerald-950/40 text-emerald-100/90"
        }`}
      >
        {setLabel}
      </div>
      <button
        type="button"
        title="プレイヤー技２ — フェニックス（→ で切替）"
        onClick={goRight}
        className={`w-[5.25rem] shrink-0 rounded border px-0 py-0.5 text-[8px] font-bold leading-none transition active:scale-95 ${
          active2 ? activeBtn : idleBtn
        }`}
      >
        →
      </button>
    </div>
  );
}
