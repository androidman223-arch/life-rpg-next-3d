"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  backupGameStatusToSlot,
  DEFAULT_GAME_STATUS,
  loadGameStatus,
  loadGameStatusBackup,
  resetGameStatusToDefault,
  restoreGameStatusFromBackup,
  saveGameStatus,
} from "@/lib/gameStatus";

const EXP_GAIN = 280;

export default function Home() {
  // サーバーとクライアントの初回描画を同じにし、hydration mismatch を防ぐ（localStorage はマウント後のみ読む）
  const [status, setStatus] = useState(() => ({ ...DEFAULT_GAME_STATUS }));

  const [celebration, setCelebration] = useState(null);

  /** マウント後に localStorage を反映するまで操作・表示をロック（フラッシュ／誤操作防止） */
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    setStatus(loadGameStatus());
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(() => setCelebration(null), 3200);
    return () => clearTimeout(t);
  }, [celebration]);

  useEffect(() => {
    const sync = () => setStatus(loadGameStatus());
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  const expPercent = Math.min(
    100,
    Math.floor((status.exp / status.nextExp) * 100)
  );

  const handleAction = () => {
    setStatus((prev) => {
      const newLevel = prev.level + 1;
      const newExp = prev.exp + EXP_GAIN;
      const next = {
        ...prev,
        level: newLevel,
        exp: newExp,
        nextExp: prev.nextExp + EXP_GAIN + 60,
      };
      saveGameStatus(next);
      queueMicrotask(() =>
        setCelebration(
          `🎉 レベルアップ！ Lv.${newLevel} になった！経験値もグングン増えているよ！おめでとう！`
        )
      );
      return next;
    });
  };

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
            <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-800/70 via-pink-900/50 to-rose-950/60 border-2 border-pink-500/40 shadow-lg shadow-pink-900/30">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl leading-none" aria-hidden>
                  ✨
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-pink-300/90">
                    経験値（保存済み・全フィールド共通）
                  </p>
                  <p className="mt-1 font-mono text-3xl md:text-4xl font-black text-white tabular-nums tracking-tight drop-shadow-md">
                    {status.exp}
                    <span className="text-pink-200/70 text-xl md:text-2xl font-bold">
                      {" "}
                      / {status.nextExp}
                    </span>
                  </p>
                  <p className="mt-2 text-sm font-semibold text-pink-100">
                    次の目安まであと{" "}
                    <span className="font-mono text-amber-200">
                      {Math.max(0, status.nextExp - status.exp)}
                    </span>{" "}
                    EXP
                  </p>
                </div>
              </div>
              <div className="w-full bg-pink-950/90 rounded-full h-5 relative overflow-hidden border border-pink-700/50">
                <div
                  className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-pink-600 h-5 rounded-full transition-all duration-700"
                  style={{ width: `${expPercent}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {expPercent}% まで溜まったよ
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleAction}
          disabled={!storageReady}
          className="mt-8 w-full py-4 px-6 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border border-violet-400/50 shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
        >
          行動する（レベル +1 · 経験値 +{EXP_GAIN}）
        </button>

        <p className="mt-6 w-full text-center text-xs text-zinc-400 leading-relaxed">
          通常フィールドは討伐ごと <span className="text-pink-300 font-bold">+1 EXP</span>
          ／ MOEは敵によって{" "}
          <span className="text-pink-300 font-bold">+（Lv×5 目安）</span>
          。どちらも上の数値に加わります💗
        </p>

        <Link
          href="/field"
          className="mt-3 w-full py-3 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-900 text-center block"
        >
          フィールドへ移動
        </Link>

        <Link
          href="/moe"
          className="mt-4 w-full py-3 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 border border-sky-400/50 shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-zinc-900 text-center block"
        >
          MOEのフィールドへ行く (ミーリム海岸)
        </Link>

        <Link
          href="/moe/3d"
          className="mt-3 w-full py-3 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-400/50 shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-zinc-900 text-center block"
        >
          MOEのフィールドへいく（3D版）
        </Link>

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
