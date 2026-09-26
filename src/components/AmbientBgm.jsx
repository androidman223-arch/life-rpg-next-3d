"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  isMoeFieldPath,
  MOE_BGM_FADE_MS,
  MOE_BGM_REST_STOP_MS,
  MOE_FIELD_BGM_EVENT,
  MOE_FIELD_COMBAT_BGM,
  MOE_FIELD_BGM_COMBAT_EVENT,
  MOE_FIELD_BGM_REST_EVENT,
  MOE_FIELD_BGM_ZONE_EVENT,
  moeFieldBgmTrackForMapSlot,
} from "@/lib/moeFieldBgm";
import {
  BGM_TRACK_STORAGE_KEY,
  BGM_VOLUME_STORAGE_KEY,
  DEFAULT_BGM_VOLUME,
  MOE_AMBIENT_BGM_SELECT_OPTIONS,
  MOE_AMBIENT_DEFAULT_LOCAL_TRACK_ID,
  isMoeAmbientLocalTrackId,
  isMoeAmbientValidTrackId,
  moeAmbientBgmPathForTrackId,
} from "@/lib/moeAmbientBgmTracks";

const STORAGE_KEY = BGM_TRACK_STORAGE_KEY;
const VOLUME_STORAGE_KEY = BGM_VOLUME_STORAGE_KEY;

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

const LOCAL_ID = MOE_AMBIENT_DEFAULT_LOCAL_TRACK_ID;
const SELECT_OPTIONS = MOE_AMBIENT_BGM_SELECT_OPTIONS;
const pathForTrackId = moeAmbientBgmPathForTrackId;
const isLocalTrackId = isMoeAmbientLocalTrackId;
const isValidTrackId = isMoeAmbientValidTrackId;

function cancelFade(fadeRef) {
  if (fadeRef.current != null) {
    window.clearInterval(fadeRef.current);
    fadeRef.current = null;
  }
}

export default function AmbientBgm() {
  const pathname = usePathname();
  const audioRef = useRef(null);
  const volumeRef = useRef(DEFAULT_BGM_VOLUME);
  const fadeRef = useRef(null);
  const trackIdRef = useRef(LOCAL_ID);
  const fieldAutoRef = useRef(false);
  const fieldZoneSlotRef = useRef("bisk");
  const fieldCombatRef = useRef(false);
  const fieldRestRef = useRef(false);
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

  const resolveFieldAutoTrackId = useCallback(() => {
    if (fieldCombatRef.current) return MOE_FIELD_COMBAT_BGM;
    return moeFieldBgmTrackForMapSlot(fieldZoneSlotRef.current);
  }, []);

  const fadeVolume = useCallback((audio, fromVol, toVol, durationMs, onDone) => {
    cancelFade(fadeRef);
    if (!audio) {
      onDone?.();
      return;
    }
    const steps = Math.max(8, Math.round(durationMs / 50));
    const stepMs = durationMs / steps;
    let step = 0;
    fadeRef.current = window.setInterval(() => {
      step += 1;
      const t = Math.min(1, step / steps);
      applyBgmVolume(audio, fromVol + (toVol - fromVol) * t);
      if (t >= 1) {
        cancelFade(fadeRef);
        onDone?.();
      }
    }, stepMs);
  }, []);

  const swapTrack = useCallback(
    (
      nextId,
      { fadeMs = 0, fadeOutMs = null, shouldPlay = true } = {}
    ) => {
      if (!isValidTrackId(nextId) || nextId === trackIdRef.current) return;
      const audio = audioRef.current;
      const targetVol = volumeRef.current;
      const nextSrc = pathForTrackId(nextId);
      const outMs = fadeOutMs ?? fadeMs;
      const inMs = fadeOutMs != null ? 0 : fadeMs;

      const applySwap = () => {
        trackIdRef.current = nextId;
        setTrackId(nextId);
        setLoadError(false);
        autoFallbackRef.current = false;
        if (!audio) return;
        audio.src = nextSrc;
        audio.loop = true;
        if (!shouldPlay) {
          audio.pause();
          return;
        }
        const startPlay = () => {
          void audio
            .play()
            .then(() => {
              setNeedsGesture(false);
              setPlaying(true);
              if (inMs <= 0) {
                applyBgmVolume(audio, targetVol);
              } else {
                applyBgmVolume(audio, 0);
                fadeVolume(audio, 0, targetVol, inMs);
              }
            })
            .catch(() => {
              setPlaying(false);
              setNeedsGesture(true);
            });
        };
        if (inMs <= 0) {
          applyBgmVolume(audio, targetVol);
          startPlay();
          return;
        }
        applyBgmVolume(audio, 0);
        startPlay();
      };

      if (!audio || !playing || outMs <= 0) {
        applySwap();
        return;
      }

      fadeVolume(audio, audio.volume, 0, outMs, applySwap);
    },
    [fadeVolume, playing]
  );

  const applyFieldAutoTrack = useCallback(
    (shouldPlay = true, { fadeMs = 0, fadeOutMs = null } = {}) => {
      if (!fieldAutoRef.current || fieldRestRef.current) return;
      swapTrack(resolveFieldAutoTrackId(), { shouldPlay, fadeMs, fadeOutMs });
    },
    [resolveFieldAutoTrackId, swapTrack]
  );

  useEffect(() => {
    trackIdRef.current = trackId;
  }, [trackId]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && isValidTrackId(saved)) {
        setTrackId(saved);
        trackIdRef.current = saved;
      } else if (isMoeFieldPath(pathname)) {
        setTrackId("field");
        trackIdRef.current = "field";
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
    if (node && !node.src) {
      node.src = pathForTrackId(trackIdRef.current);
      node.loop = true;
    }
    applyBgmVolume(node, volumeRef.current);
  }, []);

  const handleAudioError = useCallback(() => {
    if (isLocalTrackId(trackId) && !autoFallbackRef.current) {
      autoFallbackRef.current = true;
      swapTrack("field");
      persistTrackSelection("field");
      return;
    }
    setLoadError(true);
  }, [trackId, persistTrackSelection, swapTrack]);

  const onChangeTrack = useCallback(
    (id) => {
      if (!isValidTrackId(id)) return;
      persistTrackSelection(id);
      if (!isMoeFieldPath(pathname)) {
        trackIdRef.current = id;
        setTrackId(id);
        return;
      }
      fieldAutoRef.current = false;
      swapTrack(id);
    },
    [pathname, persistTrackSelection, swapTrack]
  );

  const toggle = useCallback(() => {
    if (loadError) return;
    setPlaying((p) => !p);
  }, [loadError]);

  const pauseBgmImmediate = useCallback(() => {
    cancelFade(fadeRef);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      applyBgmVolume(audio, 0);
    }
    setPlaying(false);
  }, []);

  const startBgm = useCallback(() => {
    if (loadError || fieldRestRef.current) return;
    setNeedsGesture(false);
    setPlaying(true);
    const a = audioRef.current;
    if (!a) return;
    if (!a.src) {
      a.src = pathForTrackId(trackIdRef.current);
      a.loop = true;
    }
    applyBgmVolume(a, volumeRef.current);
    void a.play().catch(() => {
      setPlaying(false);
      setNeedsGesture(true);
    });
  }, [loadError]);

  /** メニュー画面は無音（フィールド退出時に BGM を止める） */
  const silenceMenuBgm = useCallback(() => {
    fieldAutoRef.current = false;
    fieldCombatRef.current = false;
    fieldRestRef.current = false;
    const audio = audioRef.current;
    if (audio && playing && audio.volume > 0.001) {
      fadeVolume(audio, audio.volume, 0, MOE_BGM_FADE_MS, () => {
        audio.pause();
        setPlaying(false);
      });
      return;
    }
    if (audio) audio.pause();
    setPlaying(false);
  }, [fadeVolume, playing]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || loadError) return;
    if (playing) {
      if (fieldRestRef.current) {
        a.pause();
        return;
      }
      if (!a.src) {
        a.src = pathForTrackId(trackIdRef.current);
        a.loop = true;
      }
      applyBgmVolume(a, volumeRef.current);
      void a
        .play()
        .then(() => setNeedsGesture(false))
        .catch(() => {
          setPlaying(false);
          setNeedsGesture(true);
        });
    } else {
      a.pause();
    }
  }, [playing, loadError]);

  /** メニュー＝保存曲／デフォルト、MOEフィールド＝面ごとの自動BGM */
  useEffect(() => {
    if (!audioMounted || loadError) return;
    if (isMoeFieldPath(pathname)) {
      fieldAutoRef.current = true;
      if (!fieldRestRef.current) {
        fieldZoneSlotRef.current = "bisk";
        fieldCombatRef.current = false;
        applyFieldAutoTrack();
        startBgm();
      }
    } else {
      silenceMenuBgm();
      setNeedsGesture(false);
    }
  }, [
    pathname,
    audioMounted,
    loadError,
    startBgm,
    silenceMenuBgm,
    applyFieldAutoTrack,
  ]);

  /** 「MOEのフィールドへ行く」クリック直後 — 自動再生アンロック（曲切替は pathname） */
  useEffect(() => {
    const onMoeFieldStart = () => {
      if (!fieldRestRef.current) startBgm();
    };
    window.addEventListener(MOE_FIELD_BGM_EVENT, onMoeFieldStart);
    return () =>
      window.removeEventListener(MOE_FIELD_BGM_EVENT, onMoeFieldStart);
  }, [startBgm]);

  /** マップ面・戦闘 BGM */
  useEffect(() => {
    const onZone = (e) => {
      const mapSlotId = e.detail?.mapSlotId ?? null;
      if (!mapSlotId || mapSlotId === fieldZoneSlotRef.current) return;
      fieldZoneSlotRef.current = mapSlotId;
      if (!fieldAutoRef.current || fieldCombatRef.current || fieldRestRef.current)
        return;
      applyFieldAutoTrack(true, { fadeMs: 0 });
    };
    const onCombat = (e) => {
      const active = Boolean(e.detail?.active);
      if (active === fieldCombatRef.current) return;
      fieldCombatRef.current = active;
      if (!fieldAutoRef.current || fieldRestRef.current) return;
      applyFieldAutoTrack(true, {
        fadeMs: 0,
        fadeOutMs: active ? 0 : MOE_BGM_FADE_MS,
      });
    };
    const onRest = (e) => {
      const active = Boolean(e.detail?.active);
      if (active === fieldRestRef.current) return;
      fieldRestRef.current = active;
      if (active) {
        if (MOE_BGM_REST_STOP_MS <= 0) {
          pauseBgmImmediate();
        } else {
          const audio = audioRef.current;
          cancelFade(fadeRef);
          if (audio && playing) {
            fadeVolume(audio, audio.volume, 0, MOE_BGM_REST_STOP_MS, () => {
              audio.pause();
              setPlaying(false);
            });
          } else {
            pauseBgmImmediate();
          }
        }
        return;
      }
      if (!fieldAutoRef.current) {
        const audio = audioRef.current;
        if (audio) {
          applyBgmVolume(audio, volumeRef.current);
          setPlaying(true);
        }
        return;
      }
      setPlaying(true);
      applyFieldAutoTrack(true, { fadeMs: MOE_BGM_FADE_MS });
    };
    window.addEventListener(MOE_FIELD_BGM_ZONE_EVENT, onZone);
    window.addEventListener(MOE_FIELD_BGM_COMBAT_EVENT, onCombat);
    window.addEventListener(MOE_FIELD_BGM_REST_EVENT, onRest);
    return () => {
      window.removeEventListener(MOE_FIELD_BGM_ZONE_EVENT, onZone);
      window.removeEventListener(MOE_FIELD_BGM_COMBAT_EVENT, onCombat);
      window.removeEventListener(MOE_FIELD_BGM_REST_EVENT, onRest);
    };
  }, [applyFieldAutoTrack, fadeVolume, pauseBgmImmediate, playing]);

  useEffect(() => () => cancelFade(fadeRef), []);

  const statusLine = isMoeFieldPath(pathname)
    ? isLocalTrackId(trackId)
      ? `マイ曲：${pathForTrackId(trackId)}（無い場合はフィールド曲へ自動切替）`
      : `フリー曲：${pathForTrackId(trackId)}`
    : "メニューは無音 · フィールドで BGM が鳴ります";

  return (
    <>
      {audioMounted ? (
        <audio
          ref={bindAudioRef}
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
