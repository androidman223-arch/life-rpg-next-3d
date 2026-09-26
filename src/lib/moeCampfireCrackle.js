/**
 * 焚き火のパチパチ音
 *
 * 音源: AntumDeluge「Fire Crackling」 — CC0
 * https://opengameart.org/content/fire-crackling
 * public/assets/sfx/campfire-crackle.ogg
 *
 * 読み込み失敗時は Web Audio 合成にフォールバック。
 */

import { getSharedAudioContext, resumeSharedAudioContext } from "@/lib/sfx";

export const MOE_CAMPFIRE_CRACKLE_URL = "/assets/sfx/campfire-crackle.ogg";

let loopAudio = null;
let fileUnavailable = false;
let master = null;
let noiseBuf = null;
let running = false;
let popTimer = null;
let useProcedural = false;

async function ensureProceduralReady() {
  const c = await resumeSharedAudioContext();
  if (!c) return null;
  if (!master) {
    master = c.createGain();
    master.gain.value = 0.42;
    master.connect(c.destination);
    const len = c.sampleRate * 2;
    noiseBuf = c.createBuffer(1, len, c.sampleRate);
    const data = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.96 + white * 0.04;
      data[i] = last;
    }
  }
  return c;
}

function playPop() {
  const c = getSharedAudioContext();
  if (!c || !master || !noiseBuf) return;
  if (c.state === "suspended") void c.resume();

  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 700 + Math.random() * 1800;
  filter.Q.value = 0.65 + Math.random() * 0.9;
  const gain = c.createGain();
  const t0 = c.currentTime;
  const dur = 0.05 + Math.random() * 0.11;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.55 + Math.random() * 0.3, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

function schedulePops() {
  if (!running || !useProcedural) return;
  playPop();
  if (Math.random() < 0.42) {
    window.setTimeout(() => running && useProcedural && playPop(), 35 + Math.random() * 100);
  }
  popTimer = window.setTimeout(schedulePops, 140 + Math.random() * 420);
}

function startProcedural(volume) {
  useProcedural = true;
  void ensureProceduralReady().then((c) => {
    if (!c || !master || !running) return;
    master.gain.value = Math.max(0.12, Math.min(1, volume));
    playPop();
    schedulePops();
  });
}

function getLoopAudio() {
  if (typeof window === "undefined") return null;
  if (!loopAudio) {
    loopAudio = new Audio(MOE_CAMPFIRE_CRACKLE_URL);
    loopAudio.loop = true;
    loopAudio.preload = "auto";
  }
  return loopAudio;
}

async function startFileLoop(volume) {
  if (fileUnavailable || typeof window === "undefined") return false;
  const audio = getLoopAudio();
  if (!audio) return false;
  useProcedural = false;
  audio.volume = Math.max(0.12, Math.min(1, volume));
  try {
    await audio.play();
    return true;
  } catch {
    fileUnavailable = true;
    audio.pause();
    return false;
  }
}

/** @param {number} [volume] 0..1 */
export async function startMoeCampfireCrackle(volume = 0.42) {
  if (running) return;
  running = true;
  await resumeSharedAudioContext();
  const played = await startFileLoop(volume);
  if (!played) startProcedural(volume);
}

export function stopMoeCampfireCrackle() {
  running = false;
  useProcedural = false;
  if (popTimer != null) {
    window.clearTimeout(popTimer);
    popTimer = null;
  }
  if (loopAudio) {
    loopAudio.pause();
    loopAudio.currentTime = 0;
  }
  const c = getSharedAudioContext();
  if (master && c) {
    master.gain.setTargetAtTime(0.0001, c.currentTime, 0.08);
  }
}
