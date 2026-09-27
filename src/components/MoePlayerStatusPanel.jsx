"use client";

import { buildMoePlayerStatusView } from "@/lib/moePlayerStatusUi";
import { buildPlayerPhoenixSkillList } from "@/lib/moePlayerPhoenixSkillUi";

function VitalRow({ label, current, max, pct, barClass }) {
  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between gap-1 text-[9px] leading-tight">
        <span className="font-bold text-sky-100">{label}</span>
        <span className="font-mono tabular-nums text-white/90">
          {current}/{max}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full border border-white/25 bg-white/10">
        <div
          className={`h-full transition-[width] duration-150 ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ExpBar({ label, current, max, pct, tone = "fuchsia" }) {
  const barTone =
    tone === "pink"
      ? "bg-gradient-to-r from-pink-400 via-fuchsia-500 to-pink-500"
      : "bg-gradient-to-r from-fuchsia-400 via-violet-500 to-fuchsia-400";
  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between gap-1 text-[9px] leading-tight">
        <span className="font-bold text-fuchsia-100">{label}</span>
        <span className="font-mono tabular-nums text-white/85">
          {Math.floor(current)}/{max}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full border border-fuchsia-500/30 bg-fuchsia-950/70">
        <div
          className={`h-full transition-[width] duration-150 ${barTone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * サイドパネル内 — ペット「ステータス」と同じ幅・下方向展開
 * @param {{
 *   open?: boolean,
 *   trainerStatus: object,
 *   playerVitals: object,
 *   playerSkill2Progress: object,
 *   playerHealProficiency?: object,
 *   playerStealthProficiency?: object,
 *   playerPreSkillProgress: object,
 *   playerBuffStrip?: Array<object|null>,
 * }} props
 */
export default function MoePlayerStatusPanel({
  open = false,
  trainerStatus,
  playerVitals,
  playerSkill2Progress,
  playerHealProficiency,
  playerStealthProficiency,
  playerPreSkillProgress,
  playerBuffStrip = [],
}) {
  if (!open) return null;

  const view = buildMoePlayerStatusView({
    trainerStatus,
    playerVitals,
    playerSkill2Progress,
    playerHealProficiency,
    playerStealthProficiency,
    playerPreSkillProgress,
    playerBuffStrip,
    skill2Catalog: buildPlayerPhoenixSkillList(),
  });

  return (
    <div
      className="mt-0.5 w-full overflow-x-hidden overflow-y-auto overscroll-contain border-y border-sky-400/40 bg-zinc-950/97 [scrollbar-width:thin] max-h-[min(11rem,32vh)]"
      role="region"
      aria-label="プレイヤーステータス"
    >
      <div className="box-border w-full max-w-full px-1 py-1 text-white">
        <div className="space-y-1 text-[10px]">
          <p className="text-[9px] font-bold tabular-nums text-sky-100">
            {view.job} · 訓練士 Lv.{view.trainerLevel}
          </p>

          <div className="space-y-0.5 border-b border-white/10 pb-1">
            <p className="text-[8px] font-bold text-pink-100/90">訓練士 EXP</p>
            <ExpBar
              label="EXP"
              current={view.trainerExp}
              max={view.trainerNextExp}
              pct={view.trainerExpPct}
              tone="pink"
            />
            <p className="text-[7px] leading-snug text-white/45">
              敵撃破で加算
            </p>
          </div>

          <div className="space-y-0.5 border-b border-white/10 pb-1">
            <p className="text-[8px] font-bold text-sky-100/90">バイタル</p>
            <VitalRow
              label="HP"
              current={view.vitals.hp}
              max={view.vitals.hpMax}
              pct={view.vitals.hpPct}
              barClass="bg-gradient-to-r from-rose-500 to-red-400"
            />
            <VitalRow
              label="MP"
              current={view.vitals.mp}
              max={view.vitals.mpMax}
              pct={view.vitals.mpPct}
              barClass="bg-gradient-to-r from-blue-500 to-cyan-400"
            />
            <VitalRow
              label="スタミナ"
              current={Math.floor(view.vitals.stamina)}
              max={view.vitals.staminaMax}
              pct={view.vitals.staminaPct}
              barClass="bg-gradient-to-r from-lime-500 to-emerald-400"
            />
          </div>

          <div className="space-y-0.5 border-b border-white/10 pb-1">
            <p className="text-[8px] font-bold text-fuchsia-100/90">技② Lv.{view.skill2.level.toFixed(1)}</p>
            <ExpBar
              label="技② EXP"
              current={view.skill2.exp}
              max={view.skill2.expMax}
              pct={view.skill2.expPct}
            />
            <p className="text-[7px] leading-snug text-white/55">
              {view.skill2.expGainHint}
              {view.skill2.talismanActive ? " · 🎴" : ""}
            </p>
          </div>

          <div className="space-y-0.5 border-b border-white/10 pb-1">
            <p className="text-[8px] font-bold text-pink-100/90">
              回復熟練 Lv.{view.healProficiency.level.toFixed(1)}
            </p>
            <ExpBar
              label="回復 EXP"
              current={view.healProficiency.exp}
              max={view.healProficiency.expMax}
              pct={view.healProficiency.expPct}
              tone="pink"
            />
          </div>

          <div className="space-y-0.5 border-b border-white/10 pb-1">
            <p className="text-[8px] font-bold text-emerald-100/90">
              隠密熟練 Lv.{view.stealthProficiency.level.toFixed(1)}
            </p>
            <ExpBar
              label="隠密 EXP"
              current={view.stealthProficiency.exp}
              max={view.stealthProficiency.expMax}
              pct={view.stealthProficiency.expPct}
            />
          </div>

          <div className="space-y-0.5 border-b border-white/10 pb-1 text-[9px] leading-tight">
            <p className="text-[8px] font-bold text-violet-100/90">技② 習得</p>
            {view.phoenixSkills.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-1"
              >
                <span
                  className={`min-w-0 truncate ${
                    row.unlocked ? "text-violet-50" : "text-white/40"
                  }`}
                >
                  {row.name}
                </span>
                <span className="shrink-0 font-mono tabular-nums text-[8px]">
                  {row.unlocked
                    ? row.devCheck
                      ? "★"
                      : "習得"
                    : `Lv.${row.requiredLevel}`}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-0.5 border-b border-white/10 pb-1">
            <p className="text-[8px] font-bold text-amber-100/90">技③</p>
            {view.preSkills.map((row) => (
              <div key={row.id} className="text-[9px] leading-tight">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-amber-50">{row.name}</span>
                  <span className="font-mono tabular-nums text-[8px]">
                    Lv.{row.level.toFixed(1)}
                  </span>
                </div>
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-amber-400/85"
                    style={{ width: `${row.expPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {view.activeBuffs.length > 0 && (
            <div className="space-y-0.5 border-b border-white/10 pb-1 text-[9px] leading-tight">
              <p className="text-[8px] font-bold text-cyan-100/90">バフ</p>
              {view.activeBuffs.map((buff) => (
                <p key={buff.id} className="text-cyan-50/95">
                  {buff.icon} {buff.label}
                  {buff.remainSec != null ? ` ${buff.remainSec}s` : ""}
                </p>
              ))}
            </div>
          )}

          <div className="text-[7px] leading-snug text-white/42">
            {view.tips.map((tip) => (
              <p key={tip} className="mt-0.5">· {tip}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
