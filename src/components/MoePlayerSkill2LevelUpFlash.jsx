"use client";

/** 技② Lvアップフラッシュの表示時間（MoeFieldMap の clearTimeout と同期） */
export const MOE_SKILL2_LEVEL_UP_FLASH_MS = 3200;
/** 拡大アニメーション時間（CSS var と同期） */
export const MOE_SKILL2_LEVEL_UP_ANIM_MS = 2600;

/**
 * 技② Lvアップ — 画面中央からこちらへ拡大
 */
export default function MoePlayerSkill2LevelUpFlash({ level }) {
  if (level == null) return null;
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[72] flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="moe-skill2-level-up-zoom text-center"
        style={{
          ["--moe-skill2-level-up-dur"]: `${MOE_SKILL2_LEVEL_UP_ANIM_MS}ms`,
        }}
      >
        <p
          className="text-[clamp(1.35rem,5vw,2rem)] font-black tracking-[0.12em] text-yellow-100 drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)]"
        >
          Lvがあがった
        </p>
        <p
          className="mt-1 text-[clamp(0.95rem,3.2vw,1.25rem)] font-bold tabular-nums text-amber-200/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
        >
          技② Lv.{Number(level).toFixed(1)}
        </p>
      </div>
    </div>
  );
}
