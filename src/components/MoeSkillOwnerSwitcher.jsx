"use client";

/**
 * ペット / プレイヤー 切替（← →）
 * @param {{ owner: 'pet' | 'player', onSelectOwner: (owner: 'pet' | 'player') => void, variant?: 'amber' | 'emerald' }} props
 */
export default function MoeSkillOwnerSwitcher({
  owner,
  onSelectOwner,
  variant = "amber",
}) {
  const isPet = owner !== "player";
  const label = isPet ? "ペット" : "プレイヤー";
  const activeBtn =
    variant === "emerald"
      ? "border-emerald-300/70 bg-emerald-800/80 text-emerald-50 ring-1 ring-emerald-200/35"
      : "border-amber-300/70 bg-amber-800/80 text-amber-50 ring-1 ring-amber-200/35";
  const idleBtn =
    variant === "emerald"
      ? "border-emerald-700/45 bg-emerald-950/50 text-emerald-100/90 hover:bg-emerald-900/45"
      : "border-amber-700/45 bg-amber-950/50 text-amber-100/90 hover:bg-amber-900/45";

  const goLeft = () => onSelectOwner(isPet ? "player" : "pet");
  const goRight = () => onSelectOwner(isPet ? "player" : "pet");

  return (
    <div className="flex items-stretch gap-0.5">
      <button
        type="button"
        title="ペットスキル（← で切替）"
        onClick={goLeft}
        className={`w-[4.25rem] shrink-0 rounded border px-0 py-0.5 text-[8px] font-bold leading-none transition active:scale-95 ${
          isPet ? activeBtn : idleBtn
        }`}
      >
        ←
      </button>
      <div
        className={`flex min-w-0 flex-1 items-center justify-center rounded border px-0.5 py-0.5 text-[8px] font-bold leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] ${
          isPet
            ? "border-amber-600/35 bg-amber-950/40 text-amber-100/90"
            : "border-emerald-600/35 bg-emerald-950/40 text-emerald-100/90"
        }`}
      >
        {label}
      </div>
      <button
        type="button"
        title="プレイヤースキル（→ で切替）"
        onClick={goRight}
        className={`w-[4.25rem] shrink-0 rounded border px-0 py-0.5 text-[8px] font-bold leading-none transition active:scale-95 ${
          !isPet ? activeBtn : idleBtn
        }`}
      >
        →
      </button>
    </div>
  );
}
