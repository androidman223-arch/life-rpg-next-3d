/** 育成表の家 — 焚き火キャンプ休息 */

export const MOE_CAMPFIRE_REST = {
  confirmPrompt: "焚き火を囲んで休みますか？",
  yesLabel: "はい",
  noLabel: "いいえ",
  restingHint: "やすめ…",
  wakeLabel: "目を覚ます",
  wakeToast: "焚き火のそばで一息ついた。",
};

/** @param {number} current @param {number} target @param {number} dt @param {number} [speed] */
export function moeCampfireRestBlendStep(current, target, dt, speed = 2.4) {
  const t = 1 - Math.exp(-speed * dt);
  return current + (target - current) * t;
}

/** @param {number} blend 0..1 */
export function moeCampfireRestSceneColors(blend) {
  const b = Math.max(0, Math.min(1, blend));
  const dayBg = 0x87b8e8;
  const nightBg = 0x080c18;
  const dayFog = 0x87b8e8;
  const nightFog = 0x050810;
  const lerp = (a, c, t) => Math.round(a + (c - a) * t);
  const r = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  const mix = (a, c) => {
    const [ar, ag, ab] = r(a);
    const [cr, cg, cb] = r(c);
    return (lerp(ar, cr, b) << 16) | (lerp(ag, cg, b) << 8) | lerp(ab, cb, b);
  };
  return {
    background: mix(dayBg, nightBg),
    fog: mix(dayFog, nightFog),
    fogNear: 55 - b * 18,
    fogFar: 190 - b * 70,
    hemiSky: 0xddeeff,
    hemiGround: 0x446633,
    hemiIntensity: 0.85 * (1 - b * 0.82),
    sunIntensity: 1.1 * (1 - b * 0.92),
    fireLightIntensity: b * 2.8,
  };
}
