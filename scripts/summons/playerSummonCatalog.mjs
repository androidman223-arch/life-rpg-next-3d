/**
 * プレイヤー召喚スキル用 GLB（生活改鳳 · 自力整龍）
 * npm run generate:summons
 */

/** @typedef {{ id: string, file: string, nameJa: string, skillId: string, shapeNote: string, palette: Record<string, number>, wingFlap?: boolean }} PlayerSummonSpec */

/** @type {PlayerSummonSpec[]} */
export const MOE_PLAYER_SUMMON_VARIANTS = [
  {
    id: "phoenix",
    file: "PlayerSummonPhoenix.glb",
    nameJa: "鳳凰（生活改鳳）",
    skillId: "jiriki_kaihou",
    shapeNote: "炎の大鳥 · 扇状尾羽 · 冠羽 · 翼は大きく展開",
    wingFlap: true,
    palette: {
      id: "phoenix",
      feather: 0xff6a1a,
      featherMid: 0xff8c33,
      featherDark: 0xcc3d00,
      featherDeep: 0x8a2200,
      belly: 0xffd4a8,
      bellyLight: 0xffe8cc,
      crest: 0xffcc00,
      crestHot: 0xff4400,
      beak: 0xffb347,
      beakDark: 0xcc7722,
      eye: 0xfff4a0,
      eyeRing: 0x662200,
      eyeShine: 0xffffff,
      pupil: 0x220800,
      claw: 0xffe0b0,
      clawDark: 0xcc8844,
      ember: 0xff3300,
      emberCore: 0xffff66,
    },
  },
  {
    id: "seiryu",
    file: "PlayerSummonDragon.glb",
    nameJa: "整龍（自力整龍）",
    skillId: "jiriki_seiryu",
    shapeNote: "東洋龍 · 碧玉体 · 金髭 · 尾宝珠 · 小翼",
    wingFlap: true,
    palette: {
      id: "seiryu",
      scale: 0x1f6b5c,
      scaleMid: 0x2d8f7a,
      scaleDark: 0x124a40,
      scaleDeep: 0x0a2e28,
      belly: 0x6ec4b8,
      bellyLight: 0x9ee8dc,
      plate: 0xd4af37,
      horn: 0xf0d060,
      hornDark: 0xb8922e,
      eye: 0xfff0a0,
      eyeRing: 0x1a4038,
      eyeShine: 0xffffff,
      pupil: 0x0a1810,
      beak: 0x3d7a6a,
      beakLight: 0x5aa894,
      beakTip: 0x2a5548,
      wingBone: 0x1a5048,
      wingMem: 0x3d9a88,
      wingMemLight: 0x6ec4b0,
      claw: 0xf5e6a8,
      clawDark: 0xc9a84a,
      crystal: 0x88e8ff,
      crystalCore: 0xe8ffff,
    },
  },
];
