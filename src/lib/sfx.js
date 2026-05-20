/**
 * ミーリム用効果音（Web Audio 合成・ファイル不要）
 *
 * 差し替え: public/sfx/<名前>.mp3 を置くと HTMLAudio で再生を試み、
 * 失敗時だけ合成音にフォールバックします。
 * petAttack, enemyDefeated, levelUp, enemyHit, petDefeated, heal, duelEngage, combatReady
 */

const FILE_PREFIX = "/sfx/";
const FILE_KINDS = new Set([
  "petAttack",
  "enemyDefeated",
  "levelUp",
  "enemyHit",
  "petDefeated",
  "heal",
  "duelEngage",
  "combatReady",
]);

/** 404 などで毎回試行しない */
const fileUnavailable = new Set();

let ctx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  return ctx;
}

function reducedMotion() {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function connectMaster(gainNode, peak = 0.32) {
  const c = getCtx();
  if (!c) return null;
  const master = c.createGain();
  master.gain.value = peak;
  gainNode.connect(master);
  master.connect(c.destination);
  return c;
}

function tryPlayFile(kind, onFail) {
  if (typeof window === "undefined") {
    onFail();
    return;
  }
  if (fileUnavailable.has(kind)) {
    onFail();
    return;
  }
  const path = `${FILE_PREFIX}${kind}.mp3`;
  const a = new Audio(path);
  a.volume = 0.42;
  void a.play().catch(() => {
    fileUnavailable.add(kind);
    onFail();
  });
}

/**
 * @param {"petAttack"|"enemyDefeated"|"levelUp"|"enemyHit"|"petDefeated"|"heal"|"duelEngage"|"combatReady"} kind
 */
export function playSfx(kind) {
  if (typeof window === "undefined" || reducedMotion()) return;
  if (!FILE_KINDS.has(kind)) return;

  tryPlayFile(kind, () => playSfxSynth(kind));
}

function playSfxSynth(kind) {
  const c = getCtx();
  if (!c) return;
  void c.resume().catch(() => {});

  const t0 = c.currentTime;

  switch (kind) {
    case "petAttack": {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(220, t0);
      o.frequency.exponentialRampToValueAtTime(90, t0 + 0.07);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);
      o.connect(g);
      connectMaster(g, 0.38);
      o.start(t0);
      o.stop(t0 + 0.1);
      break;
    }
    case "enemyDefeated": {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        const s = t0 + i * 0.07;
        g.gain.setValueAtTime(0.001, s);
        g.gain.exponentialRampToValueAtTime(0.22, s + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, s + 0.16);
        o.connect(g);
        connectMaster(g, 0.28);
        o.start(s);
        o.stop(s + 0.18);
      });
      break;
    }
    case "levelUp": {
      const notes = [392, 493.88, 587.33, 783.99];
      notes.forEach((freq, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "triangle";
        o.frequency.value = freq;
        const s = t0 + i * 0.055;
        g.gain.setValueAtTime(0.001, s);
        g.gain.exponentialRampToValueAtTime(0.2, s + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, s + 0.12);
        o.connect(g);
        connectMaster(g, 0.3);
        o.start(s);
        o.stop(s + 0.14);
      });
      break;
    }
    case "enemyHit": {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(140, t0);
      o.frequency.exponentialRampToValueAtTime(70, t0 + 0.12);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.exponentialRampToValueAtTime(0.28, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
      o.connect(g);
      connectMaster(g, 0.26);
      o.start(t0);
      o.stop(t0 + 0.2);
      break;
    }
    case "petDefeated": {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(180, t0);
      o.frequency.exponentialRampToValueAtTime(55, t0 + 0.35);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.exponentialRampToValueAtTime(0.32, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);
      o.connect(g);
      connectMaster(g, 0.3);
      o.start(t0);
      o.stop(t0 + 0.48);
      break;
    }
    case "heal": {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(440, t0);
      o.frequency.exponentialRampToValueAtTime(880, t0 + 0.14);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
      o.connect(g);
      connectMaster(g, 0.24);
      o.start(t0);
      o.stop(t0 + 0.25);
      break;
    }
    case "duelEngage": {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(660, t0);
      o.frequency.exponentialRampToValueAtTime(440, t0 + 0.05);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
      o.connect(g);
      connectMaster(g, 0.22);
      o.start(t0);
      o.stop(t0 + 0.07);
      break;
    }
    case "combatReady": {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = 990;
      g.gain.setValueAtTime(0.001, t0);
      g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.004);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.035);
      o.connect(g);
      connectMaster(g, 0.2);
      o.start(t0);
      o.stop(t0 + 0.04);
      break;
    }
    default:
      break;
  }
}
