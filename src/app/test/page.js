"use client";

import React, { useState, useEffect, useCallback } from "react";
import FieldMap from "@/components/FieldMap";

const EXP_GAIN = 280;

export default function Home() {
  const [screen, setScreen] = useState("main");

  const [status, setStatus] = useState({
    level: 15,
    job: "勇者",
    exp: 3280,
    nextExp: 4000,
  });

  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(() => setCelebration(null), 3200);
    return () => clearTimeout(t);
  }, [celebration]);

  const expPercent = Math.min(
    100,
    Math.floor((status.exp / status.nextExp) * 100)
  );

  const goField = useCallback(() => setScreen("field"), []);
  const goMain = useCallback(() => setScreen("main"), []);

  const handleSlimeDefeat = useCallback(() => {
    setStatus((prev) => ({ ...prev, exp: prev.exp + 1 }));
  }, []);

  const handleAction = () => {
    setStatus((prev) => {
      const newLevel = prev.level + 1;
      const newExp = prev.exp + EXP_GAIN;
      queueMicrotask(() =>
        setCelebration(
          `🎉 レベルアップ！ Lv.${newLevel} になった！経験値もグングン増えているよ！おめでとう！`
        )
      );
      return {
        ...prev,
        level: newLevel,
        exp: newExp,
        nextExp: prev.nextExp + EXP_GAIN + 60,
      };
    });
  };

  if (screen === "field") {
    return (
      <FieldMap onBack={goMain} onSlimeDefeat={handleSlimeDefeat} />
    );
  }

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
          <div className="p-4 rounded-xl bg-gradient-to-r from-pink-700/60 to-pink-900/40 border border-pink-800 shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-pink-200">経験値</span>
              <span className="font-mono text-sm text-pink-100">
                {status.exp} / {status.nextExp}
              </span>
            </div>
            <div className="w-full bg-pink-950 rounded-full h-4 relative overflow-hidden border border-pink-800">
              <div
                className="bg-gradient-to-r from-pink-400 via-pink-600 to-pink-800 h-4 rounded-full transition-all duration-700"
                style={{ width: `${expPercent}%` }}
              />
              <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-xs text-white font-semibold drop-shadow">
                {expPercent}%
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAction}
          className="mt-8 w-full py-4 px-6 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border border-violet-400/50 shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          行動する（レベル +1 · 経験値 +{EXP_GAIN}）
        </button>

        <button
          type="button"
          onClick={goField}
          className="mt-4 w-full py-3 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          フィールドへ移動
        </button>

        <div className="mt-10 border-t border-gray-700 pt-6 flex flex-col items-center">
          <span className="text-gray-400 text-xs tracking-widest">Ver. 1.0</span>
        </div>
      </div>
    </main>
  );
}
