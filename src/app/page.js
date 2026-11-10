"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEFAULT_GAME_STATUS, loadGameStatus } from "@/lib/gameStatus";
import TrainingExpPanel from "@/components/TrainingExpPanel";
import DragonTrainingPanel from "@/components/DragonTrainingPanel";
import MoeMacroSessionTimer from "@/components/MoeMacroSessionTimer";
import { requestMoeFieldBgm } from "@/lib/moeFieldBgm";
import { prefetchMoeFieldMap } from "@/lib/moeFieldPrefetch";
import {
  formatDragonExpDisplay,
  getDragonPracticeExpDisplay,
} from "@/lib/moeDragonTraining";
import {
  loadPlayerExperience,
  restorePhoenixWisdomExpFromTrainingState,
} from "@/lib/moePlayerExperience";
import {
  displayTrainingExp,
  importPhoenixPointsFromKyukei,
  loadBreakPopupPoints,
} from "@/lib/moePhoenixPointsImport";
import {
  applyMoeFullBackupKeys,
  buildMoeFullBackupFilename,
  buildMoeFullBackupPayload,
  parseMoeFullBackupPayload,
} from "@/lib/moe/moeFullBackup";

async function writeFullBackupFile(jsonText, filename) {
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        startIn: "documents",
        types: [
          {
            description: "人生レベルアップRPG 全部セーブ",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(jsonText);
      await writable.close();
      return { ok: true, fileName: handle.name };
    } catch (err) {
      if (err?.name === "AbortError") return { ok: false, aborted: true };
    }
  }
  const blob = new Blob([jsonText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return { ok: true, fileName: `${filename}（ダウンロード）` };
}

const MENU_BTN =
  "w-full rounded-2xl border py-3 px-4 text-center text-base font-bold text-white shadow transition hover:brightness-110 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:pointer-events-none disabled:opacity-50";

function PointCell({ children, strong }) {
  return (
    <span
      className={`text-right font-mono text-sm font-bold tabular-nums ${
        strong ? "text-white" : "text-white/85"
      }`}
    >
      {children}
    </span>
  );
}

function MenuTrainingPoints({
  gamePhoenix,
  gameDragon,
  externalPhoenix,
  externalDragon,
  totalPhoenix,
  totalDragon,
  importing,
  importDisabled,
  onImport,
  importMessage,
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-zinc-950/40 px-3 py-3">
      <p className="mb-2 text-center text-base font-bold text-white">修行ポイント</p>
      <div className="grid grid-cols-[6.2rem_1fr_1fr] items-center gap-x-2 gap-y-1.5">
        <span />
        <span className="moe-menu-phoenix-name text-center text-sm font-bold leading-none">
          🪶 鳳凰
        </span>
        <span className="moe-menu-dragon-name text-center text-sm font-bold leading-none">
          🐉 龍神
        </span>
        <span className="whitespace-nowrap text-sm font-bold text-teal-100/85">
          ゲームの修行
        </span>
        <PointCell>{gamePhoenix}</PointCell>
        <PointCell>{gameDragon}</PointCell>
        <span className="text-sm font-bold text-sky-100/85">外部</span>
        <PointCell>{externalPhoenix}</PointCell>
        <PointCell>{externalDragon}</PointCell>
        <span className="text-sm font-bold text-amber-100">合計</span>
        <PointCell strong>{totalPhoenix}</PointCell>
        <PointCell strong>{totalDragon}</PointCell>
      </div>
      <button
        type="button"
        onClick={onImport}
        disabled={importDisabled || importing}
        className="mt-3 w-full rounded-xl border border-teal-300/50 bg-teal-900/50 px-3 py-2 text-sm font-bold text-teal-50 transition hover:bg-teal-800/60 disabled:opacity-50"
      >
        {importing ? "読みこみ中…" : "外部ポイントを取りこむ"}
      </button>
      {importMessage ? (
        <p
          role="status"
          className="mt-2 rounded-lg border border-teal-300/40 bg-teal-950/70 px-2 py-1.5 text-sm font-semibold leading-snug text-teal-100"
        >
          {importMessage}
        </p>
      ) : null}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  // サーバーとクライアントの初回描画を同じにし、hydration mismatch を防ぐ（localStorage はマウント後のみ読む）
  const [status, setStatus] = useState(() => ({ ...DEFAULT_GAME_STATUS }));
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
    const phoenixWisdomExpKept = restorePhoenixWisdomExpFromTrainingState();
    const saved = loadPlayerExperience();
    setDragonTrack(saved.dragon);
    setPhoenixWisdomExp(phoenixWisdomExpKept);
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

  const fullBackupInputRef = useRef(null);

  const handleFullBackupExport = async () => {
    const payload = buildMoeFullBackupPayload(window.localStorage);
    const result = await writeFullBackupFile(
      JSON.stringify(payload, null, 1),
      buildMoeFullBackupFilename()
    );
    if (result.aborted) return;
    setCelebration(
      result.ok
        ? `全部保存したよ（${payload.keyCount}こ） ${result.fileName}`
        : "全部保存に失敗しました"
    );
  };

  const handleFullBackupImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    let parsed;
    try {
      parsed = parseMoeFullBackupPayload(JSON.parse(await file.text()));
    } catch {
      parsed = { ok: false, message: "JSON ファイルが読めませんでした" };
    }
    if (!parsed.ok) {
      window.alert(parsed.message);
      return;
    }
    const count = Object.keys(parsed.keys).length;
    if (
      !window.confirm(
        `全部保存のファイルを読みこみますか？\n${file.name}（${count}こ）\nいまのペット・アイテム・訓練士Lv・修行・設定が、このファイルの内容で上書きされます。`
      )
    ) {
      return;
    }
    const { failed } = applyMoeFullBackupKeys(window.localStorage, parsed.keys);
    if (failed.length) {
      window.alert(`書きこめなかったデータがあります: ${failed.join(", ")}`);
    }
    window.location.reload();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-black p-4">
      <MoeMacroSessionTimer
        onFinished={() => setCelebration("⏱ マクロ４ 0:00 — お疲れさま！")}
      />
      <div className="w-full max-w-md p-8 rounded-3xl shadow-lg bg-gradient-to-br from-gray-800 to-zinc-900 border border-gray-700 flex flex-col items-center">
        <h1 className="mb-6 text-center text-2xl font-extrabold tracking-wide text-white drop-shadow-lg">
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
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between rounded-2xl border border-indigo-800 bg-gradient-to-r from-indigo-700/60 to-indigo-900/40 px-4 py-3 shadow">
              <span className="text-base font-bold text-indigo-200">レベル</span>
              <span className="font-mono text-base font-bold text-white">
                {status.level}
              </span>
            </div>
            <p className="text-center text-sm font-bold leading-snug text-yellow-200">
              あとで考える。Lvアップの仕組みは、まだありません。
            </p>
            <div className="flex items-center justify-between rounded-2xl border border-emerald-800 bg-gradient-to-r from-emerald-700/60 to-emerald-900/40 px-4 py-3 shadow">
              <span className="text-base font-bold text-emerald-200">ジョブ</span>
              <span className="text-base font-bold tracking-wider text-white">
                {status.job}
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setTrainingOpen((v) => !v)}
          disabled={!storageReady}
          aria-expanded={trainingOpen}
          className={`${MENU_BTN} mt-3 border-teal-300/50 bg-gradient-to-r from-teal-700 via-cyan-800 to-amber-800 focus:ring-teal-400`}
        >
          {trainingOpen ? "修行を閉じる" : "修行"}
        </button>

        {trainingOpen && storageReady ? (
          <div className="mt-3 flex w-full flex-col gap-3">
            <MenuTrainingPoints
              gamePhoenix={formatDragonExpDisplay(phoenixWisdomExp)}
              gameDragon={formatDragonExpDisplay(
                getDragonPracticeExpDisplay(dragonTrack)
              )}
              externalPhoenix={formatDragonExpDisplay(breakPoints.phoenix)}
              externalDragon={formatDragonExpDisplay(breakPoints.dragon)}
              totalPhoenix={formatDragonExpDisplay(shownTrainingExp.phoenix)}
              totalDragon={formatDragonExpDisplay(shownTrainingExp.dragon)}
              importing={breakImporting}
              importDisabled={!storageReady}
              onImport={handleImportBreakPoints}
              importMessage={breakImportMessage}
            />
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
                className={`rounded-lg py-2.5 text-base font-bold transition ${
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
                className={`rounded-lg py-2.5 text-base font-bold transition ${
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
          className={`${MENU_BTN} mt-3 border-emerald-400/50 bg-gradient-to-r from-emerald-600 to-teal-600 focus:ring-emerald-400`}
        >
          フィールドへ移動
        </Link>

        <button
          type="button"
          onMouseEnter={() => prefetchMoeFieldMap().catch(() => {})}
          onFocus={() => prefetchMoeFieldMap().catch(() => {})}
          onClick={() => enterMoeField("moe")}
          className={`${MENU_BTN} mt-3 border-sky-400/50 bg-gradient-to-r from-sky-600 to-blue-600 focus:ring-sky-400`}
        >
          MOEのフィールド（2D）
        </button>

        <button
          type="button"
          onMouseEnter={() => prefetchMoeFieldMap().catch(() => {})}
          onFocus={() => prefetchMoeFieldMap().catch(() => {})}
          onClick={() => enterMoeField("3d")}
          className={`${MENU_BTN} mt-3 border-violet-400/50 bg-gradient-to-r from-violet-600 to-indigo-600 focus:ring-violet-400`}
        >
          MOEのフィールド（3D）
        </button>
        <p className="mt-2 text-center text-xs leading-snug text-red-400">
          毎日おすすめ★︎。ペット経験値・フェニックスP・設定も、全部保存
        </p>

        <div className="mt-3 w-full">
          <button
            type="button"
            onClick={handleFullBackupExport}
            disabled={!storageReady}
            className={`${MENU_BTN} border-violet-400/50 bg-gradient-to-r from-violet-700 to-indigo-800 focus:ring-violet-400`}
          >
            全部保存
          </button>
          <button
            type="button"
            onClick={() => fullBackupInputRef.current?.click()}
            disabled={!storageReady}
            className="mt-2 w-full text-center text-sm font-bold text-zinc-300 underline-offset-2 hover:text-white hover:underline disabled:opacity-50"
          >
            保存ファイルを読みこむ
          </button>
          <input
            ref={fullBackupInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFullBackupImport}
          />
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 flex flex-col items-center">
          <span className="text-gray-400 text-xs tracking-widest">Ver. 1.0</span>
        </div>
      </div>
    </main>
  );
}
