"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  backupGameStatusToSlot,
  DEFAULT_GAME_STATUS,
  loadGameStatus,
  loadGameStatusBackup,
  resetGameStatusToDefault,
  restoreGameStatusFromBackup,
} from "@/lib/gameStatus";
import TrainingExpPanel from "@/components/TrainingExpPanel";
import DragonTrainingPanel from "@/components/DragonTrainingPanel";
import MoeMacroSessionTimer from "@/components/MoeMacroSessionTimer";
import { requestMoeFieldBgm } from "@/lib/moeFieldBgm";
import {
  prefetchMoeFieldMap,
  subscribeMoeFieldPrefetch,
} from "@/lib/moeFieldPrefetch";
import {
  formatDragonExpDisplay,
  getDragonPracticeExpDisplay,
} from "@/lib/moeDragonTraining";
import { loadPlayerExperience } from "@/lib/moePlayerExperience";
import {
  displayTrainingExp,
  importPhoenixPointsFromKyukei,
  loadBreakPopupPoints,
} from "@/lib/moePhoenixPointsImport";

function MenuTrainingExpCard({
  emoji,
  name,
  nameClass,
  gameText,
  externalText,
  totalText,
  frameClass,
}) {
  return (
    <div className={`rounded-xl border px-3 py-2 shadow ${frameClass}`}>
      <div className="flex items-center gap-2.5">
        <span className="text-xl leading-none" aria-hidden>
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-xl font-black leading-none tracking-[0.14em] ${nameClass}`}
          >
            {name}
          </p>
          <p className="mt-1 flex items-baseline justify-between gap-2 text-[11px] leading-none">
            <span className="whitespace-nowrap">
              <span className="font-bold text-white/70">P </span>
              <span className="font-mono font-black tabular-nums text-white">
                {gameText}
              </span>
            </span>
            <span className="whitespace-nowrap">
              <span className="font-bold text-white/70">外部P </span>
              <span className="font-mono font-black tabular-nums text-white">
                {externalText}
              </span>
            </span>
            <span className="whitespace-nowrap">
              <span className="font-bold text-white/70">合計 </span>
              <span className="font-mono text-sm font-black tabular-nums text-white">
                {totalText}
              </span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  // サーバーとクライアントの初回描画を同じにし、hydration mismatch を防ぐ（localStorage はマウント後のみ読む）
  const [status, setStatus] = useState(() => ({ ...DEFAULT_GAME_STATUS }));
  /** idle | loading | ready | error */
  const [moePrefetchState, setMoePrefetchState] = useState("idle");

  const [celebration, setCelebration] = useState(null);

  /** マウント後に localStorage を反映するまで操作・表示をロック（フラッシュ／誤操作防止） */
  const [storageReady, setStorageReady] = useState(false);

  const [trainingOpen, setTrainingOpen] = useState(false);
  /** @type {'phoenix' | 'dragon'} */
  const [trainingTab, setTrainingTab] = useState("phoenix");
  const [phoenixWisdomExp, setPhoenixWisdomExp] = useState(0);
  const [dragonTrack, setDragonTrack] = useState({ level: 0, exp: 0 });
  const [breakPoints, setBreakPoints] = useState({
    phoenix: 0,
    dragon: 0,
    updated: null,
  });
  const [breakImportMessage, setBreakImportMessage] = useState("");
  const [breakImportTick, setBreakImportTick] = useState(0);
  const [breakImporting, setBreakImporting] = useState(false);

  const refreshTrainingExp = useCallback(() => {
    const saved = loadPlayerExperience();
    setDragonTrack(saved.dragon);
    setPhoenixWisdomExp(saved.phoenixWisdomExp ?? 0);
    setBreakPoints(loadBreakPopupPoints());
  }, []);

  const shownTrainingExp = displayTrainingExp(
    phoenixWisdomExp,
    getDragonPracticeExpDisplay(dragonTrack),
    breakPoints
  );

  const handleImportBreakPoints = useCallback(async () => {
    setBreakImporting(true);
    const result = await importPhoenixPointsFromKyukei();
    setBreakImportMessage(result.message);
    setBreakImportTick((n) => n + 1);
    if (result.ok && result.points) setBreakPoints(result.points);
    setBreakImporting(false);
  }, []);

  useEffect(() => {
    setStatus(loadGameStatus());
    refreshTrainingExp();
    setStorageReady(true);
  }, [refreshTrainingExp]);

  useEffect(() => subscribeMoeFieldPrefetch(setMoePrefetchState), []);

  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(() => setCelebration(null), 3200);
    return () => clearTimeout(t);
  }, [celebration]);

  useEffect(() => {
    if (!breakImportMessage) return undefined;
    const t = setTimeout(() => setBreakImportMessage(""), 10000);
    return () => clearTimeout(t);
  }, [breakImportMessage, breakImportTick]);

  useEffect(() => {
    const sync = () => {
      setStatus(loadGameStatus());
      refreshTrainingExp();
    };
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, [refreshTrainingExp]);

  useEffect(() => {
    if (!trainingOpen) return undefined;
    const id = setInterval(refreshTrainingExp, 1000);
    return () => clearInterval(id);
  }, [trainingOpen, refreshTrainingExp]);

  const enterMoeField = useCallback(
    (mode) => {
      requestMoeFieldBgm();
      prefetchMoeFieldMap().catch(() => {});
      router.push(mode === "3d" ? "/moe/3d" : "/moe");
    },
    [router]
  );

  const handleBackupSave = () => {
    if (
      !window.confirm(
        "セーブしますか？\n現在のレベル・ジョブ・経験値をバックアップに保存します。"
      )
    ) {
      return;
    }
    if (backupGameStatusToSlot()) {
      setCelebration("💾 バックアップにセーブしたよ！");
    } else {
      window.alert("セーブに失敗しました（ストレージを確認してください）。");
    }
  };

  const handleBackupLoad = () => {
    if (
      !window.confirm(
        "ロードしますか？\nバックアップの内容で上書きします。いま画面の未バックアップの変更は失われます。"
      )
    ) {
      return;
    }
    if (!loadGameStatusBackup()) {
      window.alert("バックアップがありません。先にセーブしてください。");
      return;
    }
    const next = restoreGameStatusFromBackup();
    if (next) {
      setStatus(next);
      setCelebration("📂 バックアップからロードしたよ！");
    } else {
      window.alert("ロードに失敗しました。バックアップを確認してください。");
    }
  };

  const handleResetAll = () => {
    if (
      !window.confirm(
        "すべての項目を本当にリセットしますか？\nLv.1・EXP 0・次の目安 1000 EXP・ジョブ「勇者」に戻します。"
      )
    ) {
      return;
    }
    const next = resetGameStatusToDefault();
    setStatus(next);
    setCelebration("🔄 初期値にリセットしたよ！");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-black p-4">
      <MoeMacroSessionTimer
        onFinished={() => setCelebration("⏱ マクロ４ 0:00 — お疲れさま！")}
      />
      <div className="w-full max-w-md p-8 rounded-3xl shadow-lg bg-gradient-to-br from-gray-800 to-zinc-900 border border-gray-700 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide mb-8 drop-shadow-lg">
          人生レベルアップRPG
        </h1>

        {celebration && (
          <div
            role="status"
            className="w-full mb-6 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600/90 to-orange-700/90 border border-amber-400/80 text-center text-white font-bold text-sm md:text-base shadow-lg"
          >
            {celebration}
          </div>
        )}

        {!storageReady ? (
          <div
            className="w-full space-y-4"
            aria-busy="true"
            aria-live="polite"
          >
            <p className="text-center text-sm font-medium text-zinc-400">
              保存データを読み込み中…
            </p>
            <div className="space-y-4 animate-pulse" aria-hidden>
              <div className="h-14 rounded-xl bg-zinc-700/40 border border-zinc-600/40" />
              <div className="h-14 rounded-xl bg-zinc-700/40 border border-zinc-600/40" />
              <div className="min-h-[200px] rounded-2xl bg-zinc-700/40 border border-zinc-600/40" />
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-700/60 to-indigo-900/40 border border-indigo-800 shadow">
              <span className="font-bold text-lg text-indigo-300">レベル</span>
              <span className="font-mono text-2xl text-white drop-shadow">
                {status.level}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-700/60 to-emerald-900/40 border border-emerald-800 shadow">
              <span className="font-bold text-lg text-emerald-300">ジョブ</span>
              <span className="font-semibold text-xl text-white tracking-wider">
                {status.job}
              </span>
            </div>
            <div className="space-y-1.5">
              <MenuTrainingExpCard
                emoji="🪶"
                name="鳳凰"
                nameClass="moe-menu-phoenix-name"
                gameText={formatDragonExpDisplay(phoenixWisdomExp)}
                externalText={formatDragonExpDisplay(breakPoints.phoenix)}
                totalText={formatDragonExpDisplay(shownTrainingExp.phoenix)}
                frameClass="border-teal-300/70 bg-gradient-to-br from-teal-900/70 to-cyan-950/70 shadow-[0_0_18px_rgba(45,212,191,0.28)]"
              />
              <MenuTrainingExpCard
                emoji="🐉"
                name="龍神"
                nameClass="moe-menu-dragon-name"
                gameText={formatDragonExpDisplay(
                  getDragonPracticeExpDisplay(dragonTrack)
                )}
                externalText={formatDragonExpDisplay(breakPoints.dragon)}
                totalText={formatDragonExpDisplay(shownTrainingExp.dragon)}
                frameClass="border-amber-300/70 bg-gradient-to-br from-amber-950/80 to-orange-950/70 shadow-[0_0_18px_rgba(245,158,11,0.28)]"
              />
              <button
                type="button"
                onClick={handleImportBreakPoints}
                disabled={!storageReady || breakImporting}
                className="w-full rounded-xl border border-teal-300/50 bg-teal-900/40 px-3 py-2 text-sm font-bold text-teal-50 shadow transition hover:bg-teal-800/50 disabled:opacity-50"
              >
                {breakImporting ? "読みこみ中…" : "フェニックスP外部取りこみ"}
              </button>
              {breakImportMessage ? (
                <p
                  role="status"
                  className="rounded-lg border border-teal-300/40 bg-teal-950/70 px-2 py-1.5 text-[12px] font-semibold leading-snug text-teal-100"
                >
                  {breakImportMessage}
                </p>
              ) : null}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setTrainingOpen((v) => !v)}
          disabled={!storageReady}
          aria-expanded={trainingOpen}
          className="mt-4 w-full py-3 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-teal-700 via-cyan-800 to-amber-800 hover:from-teal-600 hover:via-cyan-700 hover:to-amber-700 border border-teal-300/50 shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
        >
          {trainingOpen ? "修行を閉じる" : "修行（鳳凰 · 龍神）"}
        </button>

        {trainingOpen && storageReady ? (
          <div className="mt-3 w-full">
            <div
              className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-900/80 p-1"
              role="tablist"
              aria-label="修行"
            >
              <button
                type="button"
                role="tab"
                aria-selected={trainingTab === "phoenix"}
                onClick={() => setTrainingTab("phoenix")}
                className={`rounded-lg py-2 text-sm font-bold transition ${
                  trainingTab === "phoenix"
                    ? "bg-teal-700 text-white shadow"
                    : "text-teal-100/70 hover:text-white"
                }`}
              >
                🪶 鳳凰
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={trainingTab === "dragon"}
                onClick={() => setTrainingTab("dragon")}
                className={`rounded-lg py-2 text-sm font-bold transition ${
                  trainingTab === "dragon"
                    ? "bg-amber-700 text-white shadow"
                    : "text-amber-100/70 hover:text-white"
                }`}
              >
                🐉 龍神
              </button>
            </div>
            <div className={trainingTab === "phoenix" ? "" : "hidden"}>
              <TrainingExpPanel
                open
                onTrainerExpGranted={() => {
                  setStatus(loadGameStatus());
                  setCelebration("✨ 修行ボーナスで訓練士EXPが増えたよ！");
                }}
              />
            </div>
            <div className={trainingTab === "dragon" ? "" : "hidden"}>
              <DragonTrainingPanel
                open
                onDragonExpGranted={(lines) => {
                  refreshTrainingExp();
                  setCelebration(lines.join("\n"));
                }}
              />
            </div>
          </div>
        ) : null}

        <Link
          href="/field"
          className="mt-3 w-full py-3 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-900 text-center block"
        >
          フィールドへ移動
        </Link>

        <button
          type="button"
          onMouseEnter={() => prefetchMoeFieldMap().catch(() => {})}
          onFocus={() => prefetchMoeFieldMap().catch(() => {})}
          onClick={() => enterMoeField("moe")}
          className="mt-4 w-full py-3 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 border border-sky-400/50 shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-zinc-900 text-center"
        >
          MOEのフィールドへ行く (ミーリム海岸)
        </button>

        <button
          type="button"
          onMouseEnter={() => prefetchMoeFieldMap().catch(() => {})}
          onFocus={() => prefetchMoeFieldMap().catch(() => {})}
          onClick={() => enterMoeField("3d")}
          className="mt-3 w-full py-3 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-400/50 shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-zinc-900 text-center"
        >
          MOEのフィールドへいく（3D版）
        </button>
        <p className="mt-1 text-center text-[10px] leading-snug text-violet-200/75">
          {moePrefetchState === "loading"
            ? "3Dフィールドをバックグラウンドで読み込み中…（ボタンを押さなくても進みます）"
            : moePrefetchState === "ready"
              ? "3D版は先読み済み — ボタンでほぼすぐ入れます"
              : moePrefetchState === "error"
                ? "先読みに失敗 — ボタン押下で再試行します"
                : "3Dフィールドの先読みを開始しています…"}
        </p>

        <div className="mt-8 w-full space-y-2">
          <p className="text-center text-[11px] font-semibold text-zinc-500">
            経験値・レベル（保存データ）
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleBackupSave}
              disabled={!storageReady}
              className="rounded-xl py-2.5 px-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-700 to-teal-800 border border-cyan-500/40 shadow transition hover:opacity-95 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none"
            >
              セーブ
            </button>
            <button
              type="button"
              onClick={handleBackupLoad}
              disabled={!storageReady}
              className="rounded-xl py-2.5 px-2 text-xs font-bold text-white bg-gradient-to-r from-amber-700 to-orange-800 border border-amber-500/40 shadow transition hover:opacity-95 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none"
            >
              ロード
            </button>
            <button
              type="button"
              onClick={handleResetAll}
              disabled={!storageReady}
              className="rounded-xl py-2.5 px-2 text-xs font-bold text-white bg-gradient-to-r from-rose-800 to-red-900 border border-rose-500/40 shadow transition hover:opacity-95 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none"
            >
              リセット
            </button>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 flex flex-col items-center">
          <span className="text-gray-400 text-xs tracking-widest">Ver. 1.0</span>
        </div>
      </div>
    </main>
  );
}
