"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  isMoeFieldPath,
  MOE_FIELD_BGM_EVENT,
} from "@/lib/bgmControl";

const STORAGE_KEY = "life-rpg-bgm-track";
const VOLUME_STORAGE_KEY = "life-rpg-bgm-volume-v5";
/** 初期音量（未保存時のデフォルト） */
const DEFAULT_BGM_VOLUME = 0.22;

function readInitialBgmVolume() {
  if (typeof window === "undefined") return DEFAULT_BGM_VOLUME;
  try {
    const saved = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    if (saved != null && saved !== "") {
      const v = Number(saved);
      if (Number.isFinite(v) && v >= 0 && v <= 1) return v;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_BGM_VOLUME;
}

function applyBgmVolume(audio, vol) {
  if (!audio) return;
  audio.volume = Math.max(0, Math.min(1, vol));
}

const BGM_DIR = "/assets/bgm";

/** ローカル専用（.gitignore — public/assets/bgm/ambient-bgm*.mp3） */
const LOCAL_TRACKS = [
  {
    id: "local",
    label: "マイ BGM：ambient-bgm.mp3",
    path: `${BGM_DIR}/ambient-bgm.mp3`,
  },
  ...Array.from({ length: 6 }, (_, i) => {
    const n = i + 2;
    return {
      id: `local${n}`,
      label: `マイ BGM ${n}：ambient-bgm-${n}.mp3`,
      path: `${BGM_DIR}/ambient-bgm-${n}.mp3`,
    };
  }),
];

const LOCAL_ID = LOCAL_TRACKS[0].id;

/** リポジトリ同梱（Kevin MacLeod / Incompetech・CC BY 4.0）— public/assets/bgm/bgm-royalty-free-LICENSE.txt */
const ROYALTY_TRACKS = [
  {
    id: "carefree",
    label: "フリー：bgm-royalty-free.mp3（のんびり・街・日常）",
    path: `${BGM_DIR}/bgm-royalty-free.mp3`,
  },
  {
    id: "castle",
    label: "フリー：bgm-royalty-free-castle.mp3（城・宮殿・物語）",
    path: `${BGM_DIR}/bgm-royalty-free-castle.mp3`,
  },
  {
    id: "field",
    label: "フリー：bgm-royalty-free-field.mp3（フィールド・散策）",
    path: `${BGM_DIR}/bgm-royalty-free-field.mp3`,
  },
  {
    id: "battle",
    label: "フリー：bgm-royalty-free-battle.mp3（アクション・戦闘）",
    path: `${BGM_DIR}/bgm-royalty-free-battle.mp3`,
  },
];

const SELECT_OPTIONS = [...LOCAL_TRACKS, ...ROYALTY_TRACKS];

function pathForTrackId(id) {
  const local = LOCAL_TRACKS.find((t) => t.id === id);
  if (local) return local.path;
  return ROYALTY_TRACKS.find((t) => t.id === id)?.path ?? ROYALTY_TRACKS[0].path;
}

function isLocalTrackId(id) {
  return LOCAL_TRACKS.some((t) => t.id === id);
}

function isValidTrackId(id) {
  return isLocalTrackId(id) || ROYALTY_TRACKS.some((t) => t.id === id);
}

export default function AmbientBgm() {
  const pathname = usePathname();
  const audioRef = useRef(null);
  const volumeRef = useRef(DEFAULT_BGM_VOLUME);
  /** サーバーとクライアントの初回を揃える（localStorage はマウント後に読む） */
  const [trackId, setTrackId] = useState(LOCAL_ID);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_BGM_VOLUME);
  const [panelOpen, setPanelOpen] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const autoFallbackRef = useRef(false);

  /** ブラウザのみ <audio> を出す（SSR との src 不一致を Hydration しない） */
  const [audioMounted, setAudioMounted] = useState(false);

  const activeSrc = useMemo(() => pathForTrackId(trackId), [trackId]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && isValidTrackId(saved)) {
        setTrackId(saved);
      } else if (isMoeFieldPath(pathname)) {
        setTrackId("field");
      }
      const initialVol = readInitialBgmVolume();
      volumeRef.current = initialVol;
      setVolume(initialVol);
      applyBgmVolume(audioRef.current, initialVol);
    } catch {
      /* ignore */
    }
    setAudioMounted(true);
  }, [pathname]);

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
    volumeRef.current = volume;
    applyBgmVolume(audioRef.current, volume);
    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
    } catch {
      /* ignore */
    }
  }, [volume]);

  const bindAudioRef = useCallback((node) => {
    audioRef.current = node;
    applyBgmVolume(node, volumeRef.current);
  }, []);

  const handleAudioError = useCallback(() => {
    if (isLocalTrackId(trackId) && !autoFallbackRef.current) {
      autoFallbackRef.current = true;
      setTrackId("field");
      persistTrackSelection("field");
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

  const startBgm = useCallback(() => {
    if (loadError) return;
    setNeedsGesture(false);
    setPlaying(true);
    const a = audioRef.current;
    if (!a) return;
    applyBgmVolume(a, volumeRef.current);
    void a.play().catch(() => {
      setPlaying(false);
      setNeedsGesture(true);
    });
  }, [loadError]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || loadError) return;
    applyBgmVolume(a, volumeRef.current);
    if (playing) {
      void a.play()
        .then(() => setNeedsGesture(false))
        .catch(() => {
          setPlaying(false);
          setNeedsGesture(true);
        });
    } else {
      a.pause();
    }
  }, [playing, loadError, activeSrc]);

  /** MOEフィールド入室時のみ自動再生（メニューでは鳴らさない） */
  useEffect(() => {
    if (!audioMounted || loadError) return;
    if (isMoeFieldPath(pathname)) {
      startBgm();
    } else {
      setPlaying(false);
      setNeedsGesture(false);
    }
  }, [pathname, audioMounted, loadError, startBgm]);

  /** 「MOEのフィールドへ行く」クリック直後（ユーザー操作） */
  useEffect(() => {
    const onMoeFieldStart = () => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (!saved || !isValidTrackId(saved)) {
          setTrackId("field");
        }
      } catch {
        /* ignore */
      }
      startBgm();
    };
    window.addEventListener(MOE_FIELD_BGM_EVENT, onMoeFieldStart);
    return () =>
      window.removeEventListener(MOE_FIELD_BGM_EVENT, onMoeFieldStart);
  }, [startBgm]);

  const statusLine = isLocalTrackId(trackId)
    ? `マイ曲：${pathForTrackId(trackId)}（無い場合はフィールド曲へ自動切替）`
    : `フリー曲：${pathForTrackId(trackId)}`;

  return (
    <>
      {audioMounted ? (
        <audio
          key={activeSrc}
          ref={bindAudioRef}
          src={activeSrc}
          loop
          preload="metadata"
          onError={handleAudioError}
          onLoadedMetadata={(e) =>
            applyBgmVolume(e.currentTarget, volumeRef.current)
          }
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
            {playing ? "停止" : needsGesture ? "BGM（クリックで開始）" : "BGM 再生"}
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
