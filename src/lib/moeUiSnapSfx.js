import { resumeSharedAudioContext } from "@/lib/sfx";

/** パネル合体スナップ時の短い「カチ」音 */
export async function playMoeUiSnapClick() {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const c = await resumeSharedAudioContext();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  const t = c.currentTime;
  osc.type = "square";
  osc.frequency.setValueAtTime(920, t);
  osc.frequency.exponentialRampToValueAtTime(520, t + 0.045);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.09, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.075);
}
