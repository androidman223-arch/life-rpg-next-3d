"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "life-rpg-bgm-track";

/** ローカル専用（.gitignore 推奨） */
const LOCAL_BGM = "/ambient-bgm.mp3";
const LOCAL_ID = "local";

/** リポジトリ同梱（Kevin MacLeod / Incompetech・CC BY 4.0）— public/bgm-royalty-free-LICENSE.txt */
const ROYALTY_TRACKS = [
  {
    id: "carefree",
    label: "フリー：bgm-royalty-free.mp3（のんびり・街・日常）",
    path: "/bgm-royalty-free.mp3",
  },
  {
    id: "castle",
    label: "フリー：bgm-royalty-free-castle.mp3（城・宮殿・物語）",
    path: "/bgm-royalty-free-castle.mp3",
  },
  {
    id: "field",
    label: "フリー：bgm-royalty-free-field.mp3（フィールド・散策）",
    path: "/bgm-royalty-free-field.mp3",
  },
  {
    id: "battle",
    label: "フリー：bgm-royalty-free-battle.mp3（アクション・戦闘）",
    path: "/bgm-royalty-free-battle.mp3",
  },
];

const SELECT_OPTIONS = [
  { id: LOCAL_ID, label: "マイ BGM：ambient-bgm.mp3（この PC のみ）" },
  ...ROYALTY_TRACKS,
];

function royaltyPathForId(id) {
  return ROYALTY_TRACKS.find((t) => t.id === id)?.path ?? ROYALTY_TRACKS[0].path;
}

function isValidTrackId(id) {
  return id === LOCAL_ID || ROYALTY_TRACKS.some((t) => t.id === id);
}

export default function AmbientBgm({ primarySrc = LOCAL_BGM }) {
  const audioRef = useRef(null);
  /** サーバーとクライアントの初回を揃える（localStorage はマウント後に読む） */
  const [trackId, setTrackId] = useState(LOCAL_ID);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [volume, setVolume] = useState(0.22);
  const [panelOpen, setPanelOpen] = useState(false);
  const autoFallbackRef = useRef(false);

  /** ブラウザのみ <audio> を出す（SSR との src 不一致を Hydration しない） */
  const [audioMounted, setAudioMounted] = useState(false);

  const activeSrc = useMemo(
    () => (trackId === LOCAL_ID ? primarySrc : royaltyPathForId(trackId)),
    [trackId, primarySrc]
  );

  useEffect(() => {
    try {
      const s = window.localStorage.getItem(STORAGE_KEY);
      if (s && isValidTrackId(s)) setTrackId(s);
    } catch {
      /* ignore */
    }
    setAudioMounted(true);
  }, []);

  const persistTrackSelection = useCallback((id) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setLoadError(false);
    autoFallbackRef.current = false;
  }, [activeSrc]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
  }, [volume]);

  const handleAudioError = useCallback(() => {
    if (trackId === LOCAL_ID && !autoFallbackRef.current) {
      autoFallbackRef.current = true;
      setTrackId("carefree");
      persistTrackSelection("carefree");
      return;
    }
    setLoadError(true);
  }, [trackId, persistTrackSelection]);

  const onChangeTrack = useCallback((id) => {
    if (!isValidTrackId(id)) return;
    setLoadError(false);
    autoFallbackRef.current = false;
    setTrackId(id);
    persistTrackSelection(id);
  }, [persistTrackSelection]);

  const toggle = useCallback(() => {
    if (loadError) return;
    setPlaying((p) => !p);
  }, [loadError]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || loadError) return;
    if (playing) {
      void a.play().catch(() => setPlaying(false));
    } else {
      a.pause();
    }
  }, [playing, loadError, activeSrc]);

  const statusLine =
    trackId === LOCAL_ID
      ? "マイ BGM を選択中（無い・壊れている場合は自動でフリー曲へ）"
      : `フリー曲：${ROYALTY_TRACKS.find((t) => t.id === trackId)?.path ?? ""}`;

  return (
    <>
      {audioMounted ? (
        <audio
          key={activeSrc}
          ref={audioRef}
          src={activeSrc}
          loop
          preload="metadata"
          onError={handleAudioError}
        />
      ) : null}
      <div
        className="fixed bottom-3 right-3 z-[42] flex max-w-[min(90vw,15rem)] flex-col gap-1 rounded-lg border border-white/15 bg-black/60 px-2 py-1.5 text-white shadow-md backdrop-blur-md"
        role="region"
        aria-label="BGM"
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggle}
            disabled={loadError}
            title="タップで再生・停止"
            className="shrink-0 rounded bg-emerald-900/85 px-2 py-0.5 text-[9px] font-semibold text-emerald-100 ring-1 ring-emerald-600/45 transition hover:bg-emerald-800/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {playing ? "停止" : "BGM 再生"}
          </button>
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            className="shrink-0 rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold text-white/85 transition hover:bg-white/10"
            title={panelOpen ? "詳細を閉じる" : "音量・曲選択"}
          >
            {panelOpen ? "▲" : "▼"}
          </button>
        </div>
        {panelOpen && (
          <div className="flex flex-col gap-1 border-t border-white/10 pt-1.5">
            <label className="flex items-center gap-1.5 text-[8px] text-white/75">
              <span className="w-7 shrink-0 text-white/55">音量</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-1 min-w-0 flex-1 accent-emerald-500"
              />
            </label>
            {loadError && (
              <p className="text-[8px] leading-snug text-amber-200/90">
                読み込めませんでした。別の曲を選んでください。
              </p>
            )}
            <label className="flex flex-col gap-0.5 text-[8px] text-white/80">
              <span className="text-white/50">曲</span>
              <select
                value={trackId}
                onChange={(e) => onChangeTrack(e.target.value)}
                className="max-w-full rounded border border-white/20 bg-zinc-900/95 py-0.5 pl-1 pr-5 text-[8px] text-white outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {SELECT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            {!loadError && (
              <p className="text-[7px] leading-snug text-white/38 line-clamp-2">
                {statusLine}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
