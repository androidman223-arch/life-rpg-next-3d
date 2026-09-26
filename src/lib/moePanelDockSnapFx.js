import { getSharedAudioContext } from "@/lib/sfx";

/** パネル合体時の「ガチッ」 — Web Audio 短いクリック */
export function playMoePanelDockSnapFx() {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const c = getSharedAudioContext();
  if (!c) return;
  void c.resume().catch(() => {});

  const t0 = c.currentTime;
  const master = c.createGain();
  master.gain.value = 0.34;
  master.connect(c.destination);

  const click = c.createOscillator();
  const clickGain = c.createGain();
  click.type = "square";
  click.frequency.setValueAtTime(920, t0);
  click.frequency.exponentialRampToValueAtTime(280, t0 + 0.035);
  clickGain.gain.setValueAtTime(0.001, t0);
  clickGain.gain.exponentialRampToValueAtTime(0.55, t0 + 0.004);
  clickGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
  click.connect(clickGain);
  clickGain.connect(master);
  click.start(t0);
  click.stop(t0 + 0.055);

  const thud = c.createOscillator();
  const thudGain = c.createGain();
  thud.type = "sine";
  thud.frequency.setValueAtTime(180, t0 + 0.008);
  thud.frequency.exponentialRampToValueAtTime(90, t0 + 0.07);
  thudGain.gain.setValueAtTime(0.001, t0 + 0.008);
  thudGain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.014);
  thudGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);
  thud.connect(thudGain);
  thudGain.connect(master);
  thud.start(t0 + 0.008);
  thud.stop(t0 + 0.1);
}
