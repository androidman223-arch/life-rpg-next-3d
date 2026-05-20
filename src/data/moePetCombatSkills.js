/**
 * ミーリム交戦中のスキルボタン → ヒット列（ダメージ式は MoeFieldMap）
 * null はトーストのみ。倍率は可能な限り moePets のスキル行と揃える。
 */

import { getSunSpirit16BeatComboParams } from "./moePets";

/**
 * @typedef {object} MoeDuelHitOpts
 * @property {boolean} [grantExp]
 * @property {number|null} [attackScale]
 * @property {number|null} [magicScale]
 * @property {boolean} [playSound]
 * @property {boolean} [skipPetDamageDedupe]
 * @property {boolean} [clearToastWhenNoDefeatMsg]
 */

/**
 * @typedef {object} MoeDuelSkillHit
 * @property {number} atMs
 * @property {MoeDuelHitOpts} opts
 */

/**
 * @typedef {object} MoeDuelSkillSequence
 * @property {MoeDuelSkillHit[]} hits
 * @property {number} [freezeChargeBarsMs] ペット・敵チャージバー停止（ms）
 */

function physHit(ratio, grantExp = true) {
  return {
    hits: [{ atMs: 0, opts: { attackScale: ratio, grantExp } }],
  };
}

function magHit(ratio, grantExp = true) {
  return {
    hits: [{ atMs: 0, opts: { magicScale: ratio, grantExp } }],
  };
}

function physThenMagicDots(physRatio, dotHits, dotMagicRatio, stepMs) {
  /** @type {MoeDuelSkillHit[]} */
  const hits = [
    { atMs: 0, opts: { attackScale: physRatio, grantExp: false } },
  ];
  for (let i = 0; i < dotHits; i++) {
    hits.push({
      atMs: stepMs * (i + 1),
      opts: {
        magicScale: dotMagicRatio,
        grantExp: i === dotHits - 1,
      },
    });
  }
  return { hits };
}

function magicMultiHits(n, ratioPerHit, stepMs) {
  /** @type {MoeDuelSkillHit[]} */
  const hits = [];
  for (let i = 0; i < n; i++) {
    hits.push({
      atMs: i * stepMs,
      opts: { magicScale: ratioPerHit, grantExp: i === n - 1 },
    });
  }
  return { hits };
}

/**
 * @param {string} petId
 * @param {object | null | undefined} skill
 * @returns {MoeDuelSkillSequence | null}
 */
export function resolveMoeDuelSkillSequence(petId, skill) {
  if (!skill) return null;

  if (petId === "sun_spirit") {
    if (skill.type === "buff" || skill.name === "太陽のサンバ") {
      return null;
    }
    if (skill.name === "16ビート コンボ") {
      const p = getSunSpirit16BeatComboParams();
      /** @type {MoeDuelSkillHit[]} */
      const hits = [
        {
          atMs: 0,
          opts: { attackScale: p.physicalRatio, grantExp: false },
        },
      ];
      for (let i = 0; i < p.magicHits; i++) {
        hits.push({
          atMs: p.stepMs * (i + 1),
          opts: {
            magicScale: p.magicRatio,
            grantExp: i === p.magicHits - 1,
          },
        });
      }
      return { hits };
    }
    if (skill.name === "灼熱の円舞曲") {
      const step = skill.combatStepMs ?? 130;
      const nMag = skill.magicHits ?? 2;
      /** @type {MoeDuelSkillHit[]} */
      const hits = [
        {
          atMs: 0,
          opts: { attackScale: skill.physicalRatio, grantExp: false },
        },
      ];
      for (let j = 0; j < nMag; j++) {
        hits.push({
          atMs: step * (j + 1),
          opts: {
            magicScale: skill.magicRatio,
            grantExp: j === nMag - 1,
          },
        });
      }
      return { hits };
    }
    if (skill.name === "紅蓮の炎帝") {
      const ratio = skill.combatMagicRatio ?? 1;
      return magHit(ratio, true);
    }
  }

  if (petId === "calgoche") {
    if (skill.name === "狂獣の牙") {
      const step = Math.round((skill.dotIntervalSec ?? 0.1) * 1000);
      const dotR = skill.dotRatio ?? 0.35;
      return physThenMagicDots(skill.ratio, 2, dotR, step);
    }
    if (skill.name === "狂獣の咆哮") {
      return magHit(skill.ratio ?? 0.5, true);
    }
    if (skill.name === "狂獣の鞭打") {
      return physHit(skill.ratio, true);
    }
    if (skill.name === "狂獣の鉄槌") {
      return physHit(skill.ratio, true);
    }
    if (skill.name === "狂戦士の魂") {
      return {
        hits: [
          {
            atMs: 0,
            opts: {
              attackScale: skill.combatBerserkAttackScale ?? 2,
              grantExp: true,
            },
          },
        ],
        freezeChargeBarsMs: skill.combatBerserkFreezeMs ?? 2000,
      };
    }
  }

  if (petId === "bold_eagle") {
    if (skill.name === "イーグル クロウ") {
      const step = skill.combatDotStepMs ?? 120;
      const dotMag = skill.dotMagicRatio ?? 0.35;
      const dots = skill.dotHits ?? 2;
      return physThenMagicDots(skill.ratio, dots, dotMag, step);
    }
    if (skill.name === "ホワール ウィンド") {
      return magHit(skill.combatMagicRatio ?? 0.88, true);
    }
    if (skill.name === "スウープ ダイブ") {
      return physHit(skill.ratio, true);
    }
  }

  if (petId === "mystery_dragon") {
    if (skill.name === "ミニ ヴォーテックス テイル") {
      return physHit(skill.ratio, true);
    }
    if (skill.name === "ミニ フレア バースト") {
      return magHit(skill.combatMagicRatio ?? 0.85, true);
    }
    if (skill.name === "ミニ ドラゴニック ウェーブ") {
      const n = skill.combatWaveHits ?? 4;
      const step = skill.combatStepMs ?? 500;
      const r = skill.combatMagicRatio ?? 0.42;
      return magicMultiHits(n, r, step);
    }
    if (skill.name === "ミニ ギガブレイズ ブレス") {
      const n = skill.combatWaveHits ?? 4;
      const step = skill.combatStepMs ?? 250;
      const r = skill.combatMagicRatio ?? 0.38;
      return magicMultiHits(n, r, step);
    }
    if (skill.name === "ミニ アルティメット フレア") {
      return magHit(skill.combatMagicRatio ?? 1.1, true);
    }
  }

  if (petId === "elemental_atrum") {
    if (skill.name === "禁断魔法のページ（アトルーム）") {
      return magHit(skill.combatMagicRatio ?? 0.78, true);
    }
    return null;
  }

  if (petId === "carnival_elephant") {
    if (skill.name === "トランピング") {
      return physHit(skill.ratio, true);
    }
    if (skill.name === "ブラインド サンド") {
      return physHit(skill.ratio, true);
    }
    if (skill.name === "ノーズ ウィップ") {
      return physHit(skill.ratio, true);
    }
    return null;
  }

  if (petId === "abinyan") {
    if (skill.name === "キャッツ ストレート") {
      return physHit(skill.ratio, true);
    }
    if (skill.name === "キャッツ アイ") {
      return magHit(skill.combatMagicRatio ?? 0.55, true);
    }
    if (skill.name === "キャッツ ロケット") {
      return physHit(skill.ratio, true);
    }
    if (skill.name === "アビス ボール") {
      return magHit(skill.combatMagicRatio ?? 1.0, true);
    }
  }

  return null;
}
