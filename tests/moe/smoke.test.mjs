/**
 * MOE スモークテスト — 純粋ロジックの回帰防止
 * 実行: npm run smoke
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  canUsePlayerCondenseMind,
  PLAYER_CONDENSE_MIND_MP_COST,
} from "../../src/lib/moe/moeCondenseMindRules.js";
import {
  activateJirikiSeiran,
  canUseJirikiSeiran,
  JIRIKI_SEIRAN_BOOST_MP_PER_SEC,
  JIRIKI_SEIRAN_MP_COST,
  JIRIKI_SEIRAN_NORMAL_MP_PER_SEC,
  JIRIKI_SEIRAN_TOTAL_SEC,
  syncJirikiSeiranPhase,
} from "../../src/lib/moePlayerJirikiSeiran.js";
import { resolvePhoenixHabitAscensionSequence } from "../../src/lib/moePhoenixHabitAscension.js";
import {
  applyPlayerPreSkillExp,
  awardPlayerPreSkillExpOnUse,
  canUsePlayerPreSkill,
  defaultPlayerPreSkillProgressMap,
  MOE_PLAYER_SKILL_EXP_PER_TENTH,
  moePlayerSkillExpGainAmount,
  rollPlayerPreSkillExpOnUse,
} from "../../src/lib/moePlayerPreSkillProgress.js";
import { nextMoePlayerSummonFxRequest } from "../../src/lib/moePlayerSummonPrefetch.js";
import { MOE_PLAYER_PRE_SKILLS } from "../../src/data/moePlayerPreSkills.js";
import { MOE_PLAYER_SKILL2_ONLY_SKILLS } from "../../src/data/moePlayerSkill2Skills.js";
import {
  applyPlayerSkill2Exp,
  canUsePlayerSkill2,
  moePlayerSkill2ExpGainAmount,
} from "../../src/lib/moePlayerSkill2Progress.js";
import { resolvePlayerSkill2ExpProcRate } from "../../src/lib/moePlayerSkill2Talisman.js";
import {
  MOE_BGM_TRACK,
  MOE_FIELD_COMBAT_BGM,
  moeFieldBgmTrackForMapSlot,
} from "../../src/lib/moeFieldBgmMap.js";
import {
  describeMoeExternalSavePlace,
  formatMoeExternalSavePlaceStatus,
} from "../../src/lib/moeExternalSaveLabels.js";
import {
  MOE_PLAYER_SUMMON_MODELS,
  moePlayerSummonModelForSkill,
} from "../../src/data/moePlayerSummonModels.js";
import {
  resolveJirikiKaihouSequence,
  resolveJirikiSeiryuSequence,
  validatePlayerSummonPreSkillCombat,
} from "../../src/lib/moePlayerSummonSkills.js";
import {
  buildPlayerPreSkillActivation,
  formatPlayerPreSkillCombatLine,
} from "../../src/lib/moePlayerPreSkillActivate.js";
import {
  defaultPlayerUtilitySlotOrder,
  MOE_PLAYER_UTILITY_SLOT_KEYS,
} from "../../src/data/moePlayerUtilitySkills.js";
import {
  isMoeAmbientValidTrackId,
  moeAmbientBgmPathForTrackId,
} from "../../src/lib/moeAmbientBgmTracks.js";
import { buildMoeExternalSaveFilename } from "../../src/lib/moeExternalSave.js";
import {
  loadMoeAllyTarget,
  saveMoeAllyTarget,
  MOE_ALLY_TARGET_STORAGE_KEY,
} from "../../src/lib/moeAllyTargetSettings.js";
import {
  loadMoeSkillPanelMode,
  saveMoeSkillPanelMode,
  loadMoeSkillPanelModeForPanel,
  saveMoeSkillPanelModeForPanel,
  cycleMoeSkillPanelMode,
} from "../../src/lib/moeSkillPanelModeSettings.js";
import { collectMoeFieldInvariantIssues } from "../../src/lib/moe/moeFieldInvariants.js";
import {
  moe3dPickWalkableTerrainY,
  MOE_PLAYER_TERRAIN_MAX_CLIMB,
} from "../../src/lib/moe3dMacro3Walk.js";
import {
  moe3dClampMoveAgainstBoxColliders,
  moe3dCircleHitsBox,
} from "../../src/lib/moe3dBoxColliderMath.js";
import {
  buildElanPalaceMazeSpec,
  elanPalaceMazeActiveSpawnCoords,
  elanPalaceMazeAltarNorm,
  elanPalaceMazeBlocksPoint,
  elanPalaceMazeSpawnPlan,
  MOE_ELAN_PALACE_MAZE_CORRIDOR_PLAYER_COUNT,
  MOE_ELAN_PALACE_MAZE_GAP_CORNER,
} from "../../src/lib/moe3dElanPalaceMazeLayout.js";
import {
  buildSulfurMineMazeSpec,
  sulfurMineMazeActiveSpawnCoords,
  sulfurMineMazeAltarNorm,
  sulfurMineMazeBlocksPoint,
  sulfurMineMazeSpawnPlan,
} from "../../src/lib/moe3dSulfurMineMazeLayout.js";
import { moeMacro3MountainSpecsForSlot } from "../../src/lib/moe3dMacro3MountainRegistry.js";
import {
  moe3dCircleHitsColumn,
  moe3dClampMoveAgainstColumnColliders,
} from "../../src/lib/moe3dColumnColliderMath.js";
import {
  MOE_GREEN_COLLIDER_OUTSET,
  MOE_SIMPLE_MOUNTAIN_DOME_NAME,
  MOE_SIMPLE_MOUNTAIN_STEM_NAME,
} from "../../src/lib/moe3dMacro3Constants.js";
import { moeMacro3MountainColorForSlot } from "../../src/lib/moe3dMacro3MountainPalette.js";
import {
  MOE_DARIN_MOUNTAIN_MOUNTAINS,
  MOE_DESERT_PREVIEW_MOUNTAINS,
  MOE_ELVIN_MOUNTAINS_MOUNTAINS,
  MOE_HATIIL_DESERT_MOUNTAINS,
  MOE_NEOUKU_MOUNTAIN_MOUNTAINS,
  MOE_NEOUKU_PLATEAU_MOUNTAINS,
  MOE_SULFUR_MINE_MOUNTAINS,
  moeClimbableMountainTierSlopeDeg,
  moeGreenColliderSpecFromMountain,
  moeGreenColliderSpecs,
  moeSimpleMountainTotalHeight,
} from "../../src/lib/moe3dMacro3SimpleMountain.js";
import {
  MOE_OFFICIAL_SIZE_TIER_BY_KEY,
  moeOfficialRatioVsPlayer,
} from "../../src/data/moeMacro2OfficialSizeTiers.js";
import { MOE_CLIMB_TIER_COUNT } from "../../src/lib/moe3dMacro3Constants.js";
import { MOE_TERRAIN_MAX_WALK_SLOPE_DEG } from "../../src/lib/moe3dMacro3Walk.js";
import { MOE_MACRO1_PHASE3_AREA_WIKI } from "../../src/data/moeMacro1Phase3AreaWiki.js";
import { MOE_MONSTER_LINEUP } from "../../src/data/moeMonsterLineup.js";
import {
  moeMacro1OfficialSpawnIssues,
  moeMacro1RegistryIssues,
} from "../../src/lib/moe/moeMacro1OfficialCheck.js";
import {
  moePetTrainingGuideSectionsFromEntries,
  moePetTrainingLevelLabel,
} from "../../src/lib/moePetTrainingGuideCore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
import {
  applyMoeSprintStaminaDrain,
  MOE_BANANA_MILK_STAMINA_REGEN_MULT,
  MOE_PLAYER_SPRINT_STAMINA_DRAIN_PER_SEC,
  MOE_PLAYER_STAMINA_REGEN_PER_SEC,
  tickMoePlayerNaturalRegen,
  tickMoePlayerVitalsField,
} from "../../src/lib/moePlayerVitals.js";

describe("condense mind rules (player)", () => {
  it("has no MP-percent gate", () => {
    assert.equal(
      canUsePlayerCondenseMind({ mp: 200, mpMax: 200 }).ok,
      true
    );
    assert.equal(
      canUsePlayerCondenseMind({ mp: 180, mpMax: 200 }).ok,
      true
    );
  });

  it("requires caster MP >= cost", () => {
    assert.equal(
      canUsePlayerCondenseMind({ mp: PLAYER_CONDENSE_MIND_MP_COST - 1 }).ok,
      false
    );
    assert.equal(
      canUsePlayerCondenseMind({ mp: PLAYER_CONDENSE_MIND_MP_COST }).ok,
      true
    );
  });
});

describe("ally target settings", () => {
  const storage = new Map();

  it("defaults to pet and persists player", () => {
    globalThis.window = {
      localStorage: {
        getItem: (k) => storage.get(k) ?? null,
        setItem: (k, v) => storage.set(k, v),
      },
    };
    assert.equal(loadMoeAllyTarget(), "pet");
    saveMoeAllyTarget("player");
    assert.equal(storage.get(MOE_ALLY_TARGET_STORAGE_KEY), "player");
    assert.equal(loadMoeAllyTarget(), "player");
    delete globalThis.window;
  });
});

describe("skill panel mode", () => {
  const storage = new Map();

  it("cycles player1 → player2 → player3 → pet → player1", () => {
    assert.equal(cycleMoeSkillPanelMode("player1", "next"), "player2");
    assert.equal(cycleMoeSkillPanelMode("player2", "next"), "player3");
    assert.equal(cycleMoeSkillPanelMode("player3", "next"), "pet");
    assert.equal(cycleMoeSkillPanelMode("pet", "next"), "player1");
    globalThis.window = {
      localStorage: {
        getItem: (k) => storage.get(k) ?? null,
        setItem: (k, v) => storage.set(k, v),
      },
    };
    saveMoeSkillPanelMode("player2");
    assert.equal(loadMoeSkillPanelMode(), "player2");
    saveMoeSkillPanelModeForPanel("panel-a", "player1");
    saveMoeSkillPanelModeForPanel("panel-b", "pet");
    assert.equal(loadMoeSkillPanelModeForPanel("panel-a"), "player1");
    assert.equal(loadMoeSkillPanelModeForPanel("panel-b"), "pet");
    delete globalThis.window;
  });
});

describe("player vitals", () => {
  it("starts at 100 hp/mp max for trainer level 1", async () => {
    const { moePlayerVitalsMaxForLevel, fullHealMoePlayerVitals } = await import(
      "../../src/lib/moePlayerVitals.js"
    );
    const maxes = moePlayerVitalsMaxForLevel(1);
    assert.equal(maxes.hpMax, 100);
    assert.equal(maxes.mpMax, 100);
    const healed = fullHealMoePlayerVitals(1);
    assert.equal(healed.hp, 100);
    assert.equal(healed.mp, 100);
  });

  it("recovers hp stamina mp every tick when below max", () => {
    const base = {
      hp: 10,
      hpMax: 100,
      stamina: 30,
      staminaMax: 100,
      mp: 40,
      mpMax: 100,
    };
    const next = tickMoePlayerNaturalRegen(base);
    assert.equal(next?.hp, 11);
    assert.equal(next?.stamina, 32);
    assert.equal(next?.mp, 41);
  });

  it("sprint drain is triple natural regen", () => {
    assert.equal(
      MOE_PLAYER_SPRINT_STAMINA_DRAIN_PER_SEC,
      MOE_PLAYER_STAMINA_REGEN_PER_SEC * 3
    );
  });

  it("sprint drain decreases stamina every frame", () => {
    let stamina = 100;
    for (let i = 0; i < 10; i++) {
      stamina = applyMoeSprintStaminaDrain(stamina, 0.1, {
        sprinting: true,
        moving: true,
      });
    }
    assert.ok(stamina < 100 && stamina <= 94.01);
  });

  it("banana milk multiplies stamina regen", () => {
    const next = tickMoePlayerNaturalRegen(
      { hp: 100, hpMax: 100, stamina: 30, staminaMax: 100, mp: 40, mpMax: 100 },
      { staminaRegenMult: MOE_BANANA_MILK_STAMINA_REGEN_MULT }
    );
    assert.equal(
      next?.stamina,
      30 + MOE_PLAYER_STAMINA_REGEN_PER_SEC * MOE_BANANA_MILK_STAMINA_REGEN_MULT
    );
  });

  it("field tick applies sprint drain and regen acc", () => {
    const base = {
      hp: 100,
      hpMax: 100,
      stamina: 100,
      staminaMax: 100,
      mp: 40,
      mpMax: 100,
    };
    const sprinting = tickMoePlayerVitalsField(base, 0.5, {
      regenAcc: 0,
      sprinting: true,
      moving: true,
    });
    assert.ok(sprinting.changed);
    assert.ok(sprinting.vitals.stamina < 100);
    assert.equal(sprinting.regenAcc, 0.5);

    const regenTick = tickMoePlayerVitalsField(
      { ...base, stamina: 90 },
      1,
      { regenAcc: 0, sprinting: false, moving: false }
    );
    assert.equal(regenTick.vitals.stamina, 92);
    assert.equal(regenTick.vitals.mp, 41);
  });
});

describe("terrain ground snap", () => {
  it("ignores mountain peaks above climb limit", () => {
    const hits = [{ point: { y: 12 } }, { point: { y: 0.4 } }];
    const y = moe3dPickWalkableTerrainY(hits, 0.35, MOE_PLAYER_TERRAIN_MAX_CLIMB);
    assert.equal(y, 0.4);
  });

  it("allows small steps within climb limit", () => {
    const hits = [{ point: { y: 1.2 } }, { point: { y: 0.5 } }];
    const y = moe3dPickWalkableTerrainY(hits, 0.5, MOE_PLAYER_TERRAIN_MAX_CLIMB);
    assert.equal(y, 1.2);
  });
});

describe("box colliders", () => {
  it("detects circle vs axis-aligned box overlap", () => {
    const box = { minX: 0, maxX: 2, minZ: 0, maxZ: 2 };
    assert.equal(moe3dCircleHitsBox(1, 1, 0.4, box), true);
    assert.equal(moe3dCircleHitsBox(5, 5, 0.4, box), false);
  });

  it("slides along box walls", () => {
    const boxes = [{ minX: 4, maxX: 8, minZ: 0, maxZ: 4 }];
    const next = moe3dClampMoveAgainstBoxColliders(2, 2, 6, 2, boxes, 0.5);
    assert.ok(next.x < 4);
    assert.equal(next.z, 2);
    const slideX = moe3dClampMoveAgainstBoxColliders(2, 2, 6, 3, boxes, 0.5);
    assert.ok(slideX.x < 4);
    assert.equal(slideX.z, 3);
  });

  it("blocks fast movement through a thin box", () => {
    const boxes = [{ minX: 4.5, maxX: 5.5, minZ: -2, maxZ: 2 }];
    const next = moe3dClampMoveAgainstBoxColliders(2, 0, 8, 0, boxes, 0.5);
    assert.ok(next.x < 5);
  });
});

describe("elan palace maze", () => {
  const tileW = 180;
  const tileD = 90;

  it("plans spiral spawn zones for all maze rings", () => {
    const plan = elanPalaceMazeSpawnPlan(tileW, tileD);
    assert.equal(plan.length, 17);
    assert.equal(plan[0]?.key, "elan_knight_white");
    assert.equal(plan[4]?.key, "giant_destroyer");
    assert.equal(plan.at(-1)?.key, "dullahan");
  });

  it("builds a multi-ring spiral with wide corridors", () => {
    const spec = buildElanPalaceMazeSpec(tileW, tileD);
    assert.ok(spec.ringCount >= 4);
    assert.ok(spec.walls.length >= 20);
    assert.equal(
      MOE_ELAN_PALACE_MAZE_CORRIDOR_PLAYER_COUNT,
      15
    );
    assert.ok(spec.corridor > 0.02);
  });

  it("keeps sw altar corner, courtyard, and spawn pads walkable", () => {
    const spec = buildElanPalaceMazeSpec(tileW, tileD);
    const altar = elanPalaceMazeAltarNorm(tileW, tileD);
    assert.equal(MOE_ELAN_PALACE_MAZE_GAP_CORNER, 3);
    assert.equal(
      elanPalaceMazeBlocksPoint(altar.altarTx, altar.altarTz, spec.walls, 0.02),
      false
    );
    assert.equal(
      elanPalaceMazeBlocksPoint(0.5, 0.5, spec.walls),
      false
    );
    for (const spawn of elanPalaceMazeActiveSpawnCoords(tileW, tileD)) {
      assert.equal(
        elanPalaceMazeBlocksPoint(spawn.tx, spawn.tz, spec.walls, 0.012),
        false,
        `spawn blocked @ ${spawn.tx},${spawn.tz}`
      );
    }
  });

  it("blocks cutting through a maze wall segment", () => {
    const spec = buildElanPalaceMazeSpec(tileW, tileD);
    const wall = spec.walls[0];
    const midTx = (wall.minTx + wall.maxTx) * 0.5;
    const midTz = (wall.minTz + wall.maxTz) * 0.5;
    assert.equal(elanPalaceMazeBlocksPoint(midTx, midTz, spec.walls), true);
  });

  it("blocks shortcut across inner hole plugs but keeps courtyard open", () => {
    const spec = buildElanPalaceMazeSpec(tileW, tileD);
    assert.equal(
      elanPalaceMazeBlocksPoint(0.5, 0.75, spec.walls, 0.02),
      true
    );
    assert.equal(elanPalaceMazeBlocksPoint(0.5, 0.5, spec.walls), false);
  });

  it("field collider helper slides on elan palace walls", () => {
    const spec = buildElanPalaceMazeSpec(tileW, tileD);
    const wall = spec.walls.find(
      (w) => w.maxTx - w.minTx > w.maxTz - w.minTz
    );
    assert.ok(wall);
    const frameMinX = -200;
    const frameMinZ = -100;
    const box = {
      minX: frameMinX + tileW * 1.7 * wall.minTx,
      maxX: frameMinX + tileW * 1.7 * wall.maxTx,
      minZ: frameMinZ + tileD * 1.7 * wall.minTz,
      maxZ: frameMinZ + tileD * 1.7 * wall.maxTz,
    };
    const beforeZ = (box.minZ + box.maxZ) * 0.5;
    const next = moe3dClampMoveAgainstBoxColliders(
      box.minX - 2,
      beforeZ,
      box.maxX + 2,
      beforeZ,
      [box],
      0.55
    );
    assert.ok(next.x < box.minX);
  });
});

describe("sulfur mine maze", () => {
  const tileW = 180;
  const tileD = 90;

  it("plans fire temple spawn zones for bone knights and salamander", () => {
    const plan = sulfurMineMazeSpawnPlan(tileW, tileD);
    assert.equal(plan.length, 6);
    assert.equal(plan[0]?.key, "elan_knight_white");
    assert.equal(plan[2]?.key, "elan_knight_black");
    assert.equal(plan[4]?.key, "salamander");
    assert.equal(plan[4]?.center, true);
  });

  it("reuses elan palace spiral geometry with wide corridors", () => {
    const spec = buildSulfurMineMazeSpec(tileW, tileD);
    const elan = buildElanPalaceMazeSpec(tileW, tileD);
    assert.equal(spec.ringCount, elan.ringCount);
    assert.equal(spec.walls.length, elan.walls.length);
    assert.equal(spec.corridor, elan.corridor);
  });

  it("keeps sw altar corner, courtyard, and spawn pads walkable", () => {
    const spec = buildSulfurMineMazeSpec(tileW, tileD);
    const altar = sulfurMineMazeAltarNorm(tileW, tileD);
    assert.equal(
      sulfurMineMazeBlocksPoint(altar.altarTx, altar.altarTz, spec.walls, 0.02),
      false
    );
    assert.equal(sulfurMineMazeBlocksPoint(0.5, 0.5, spec.walls), false);
    for (const spawn of sulfurMineMazeActiveSpawnCoords(tileW, tileD)) {
      assert.equal(
        sulfurMineMazeBlocksPoint(spawn.tx, spawn.tz, spec.walls, 0.012),
        false,
        `spawn blocked @ ${spawn.tx},${spawn.tz}`
      );
    }
  });

});

describe("macro3 simple mountain", () => {
  it("names stem and dome blocks", () => {
    assert.equal(MOE_SIMPLE_MOUNTAIN_STEM_NAME, "macro3-simple-mountain-stem");
    assert.equal(MOE_SIMPLE_MOUNTAIN_DOME_NAME, "macro3-simple-mountain-dome");
  });

  it("computes green collider from mountain spec", () => {
    const spec = { x: 0.18, z: 0.12, sx: 0.42, sz: 0.28, sy: 2.4, heightMult: 2 };
    const col = moeGreenColliderSpecFromMountain(spec, MOE_GREEN_COLLIDER_OUTSET);
    assert.ok(Math.abs(moeSimpleMountainTotalHeight(spec) - 14.4) < 0.01);
    assert.ok(col.rx > 0.2);
  });

  it("has sulfur mine mountains with omakase colors", () => {
    assert.equal(MOE_SULFUR_MINE_MOUNTAINS.length, 7);
    assert.equal(MOE_SULFUR_MINE_MOUNTAINS[0].id, "sulfur-main");
    assert.equal(moeMacro3MountainColorForSlot("sulfur_mine", 0), 0xdc2626);
    assert.equal(moeMacro3MountainColorForSlot("sulfur_mine", 2), 0x7c2d12);
    const boneWhite = MOE_SULFUR_MINE_MOUNTAINS.find((s) => s.id === "climb-bone-white");
    const boneBlack = MOE_SULFUR_MINE_MOUNTAINS.find((s) => s.id === "climb-bone-black");
    assert.equal(boneWhite?.climbTint, 0xe7e5e4);
    assert.equal(boneBlack?.climbTint, 0x44403c);
  });

  it("no longer mounts sulfur mine on macro3 mountain colliders", () => {
    assert.equal(moeMacro3MountainSpecsForSlot("sulfur_mine").length, 0);
  });

  it("builds climbable 3-tier peaks without green colliders", () => {
    const climbSpecs = [
      ...MOE_DESERT_PREVIEW_MOUNTAINS,
      ...MOE_HATIIL_DESERT_MOUNTAINS,
      ...MOE_NEOUKU_MOUNTAIN_MOUNTAINS,
      ...MOE_NEOUKU_PLATEAU_MOUNTAINS,
      ...MOE_DARIN_MOUNTAIN_MOUNTAINS,
      ...MOE_ELVIN_MOUNTAINS_MOUNTAINS,
    ].filter((s) => s.climbable);
    assert.equal(climbSpecs.length, 6);
    for (const spec of climbSpecs) {
      assert.equal(spec.climbTiers ?? MOE_CLIMB_TIER_COUNT, 3);
      assert.equal(spec.gentle, true);
      assert.equal(moeGreenColliderSpecFromMountain(spec), null);
      assert.ok(
        moeClimbableMountainTierSlopeDeg(spec) < MOE_TERRAIN_MAX_WALK_SLOPE_DEG
      );
    }
    const steep = { x: 0, z: 0, sx: 0.34, sz: 0.24, sy: 1, climbable: true };
    const gentle = { ...steep, gentle: true };
    assert.ok(
      moeClimbableMountainTierSlopeDeg(gentle) <
        moeClimbableMountainTierSlopeDeg(steep)
    );
    const desertCols = moeGreenColliderSpecs(MOE_DESERT_PREVIEW_MOUNTAINS);
    assert.equal(desertCols.length, 3);
  });

  it("picks biome colors for forest and volcano", () => {
    assert.notEqual(
      moeMacro3MountainColorForSlot("albeez_forest", 0),
      moeMacro3MountainColorForSlot("albeez_forest", 1)
    );
    assert.notEqual(
      moeMacro3MountainColorForSlot("neoku_mountain", 0),
      moeMacro3MountainColorForSlot("albeez_forest", 0)
    );
  });
});

describe("column colliders", () => {
  it("detects circle vs elliptic column", () => {
    const col = { cx: 0, cz: 0, rx: 2, rz: 1 };
    assert.equal(moe3dCircleHitsColumn(2.4, 0, 0.5, col), true);
    assert.equal(moe3dCircleHitsColumn(0, 1.4, 0.5, col), true);
    assert.equal(moe3dCircleHitsColumn(4, 0, 0.5, col), false);
  });

  it("blocks movement through column without gaps", () => {
    const cols = [{ cx: 5, cz: 0, rx: 1.2, rz: 1.2 }];
    const next = moe3dClampMoveAgainstColumnColliders(2, 0, 8, 0, cols, 0.5);
    assert.ok(next.x < 5.5);
  });
});

describe("macro2 L6 sulfur mine enemy scale", () => {
  it("registers official size tiers for sulfur field enemies", () => {
    assert.equal(MOE_OFFICIAL_SIZE_TIER_BY_KEY.elan_knight_white, "mPlus");
    assert.equal(MOE_OFFICIAL_SIZE_TIER_BY_KEY.elan_knight_black, "mPlus");
    assert.equal(MOE_OFFICIAL_SIZE_TIER_BY_KEY.salamander, "l");
    assert.ok(moeOfficialRatioVsPlayer("elan_knight_white") > 1.04);
    assert.ok(moeOfficialRatioVsPlayer("elan_knight_black") > 1.1);
    assert.ok(moeOfficialRatioVsPlayer("salamander") > 1.2);
    assert.ok(moeOfficialRatioVsPlayer("salamander") < 1.4);
  });
});

describe("macro1 albeez forest official check", () => {
  const forestSpawns = [
    { mapSlotId: "albeez_forest", key: "riverside_crawler", modelVariantId: "riverside_crawler_a" },
    { mapSlotId: "albeez_forest", key: "orvan_pappy", modelVariantId: "orvan_pappy_a" },
    { mapSlotId: "albeez_forest", key: "riverside_crawler", modelVariantId: "riverside_crawler_b" },
    { mapSlotId: "albeez_forest", key: "orvan_pappy", modelVariantId: "orvan_pappy_b" },
  ];
  const forestRegistry = [
    {
      key: "riverside_crawler",
      mapSlotId: "albeez_forest",
      modelFile: "RiversideCrawlerA.glb",
      skills: ["ハンガーバイト"],
    },
    {
      key: "orvan_pappy",
      mapSlotId: "albeez_forest",
      modelFile: "OrvanPappyA.glb",
      skills: ["バイト"],
    },
  ];

  it("passes wiki spawn and registry official checks", () => {
    const wiki = MOE_MACRO1_PHASE3_AREA_WIKI.albeez_forest;
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    const spawnIssues = moeMacro1OfficialSpawnIssues(
      "albeez_forest",
      forestSpawns,
      wiki,
      variantIds
    );
    const registryIssues = moeMacro1RegistryIssues(forestRegistry, "albeez_forest");
    assert.deepEqual(spawnIssues, []);
    assert.deepEqual(registryIssues, []);
  });
});

describe("macro1 neoku mountain official check", () => {
  const neokuSpawns = [
    { mapSlotId: "neoku_mountain", key: "neoku_orvan", modelVariantId: "neoku_orvan_a" },
    { mapSlotId: "neoku_mountain", key: "nocker", modelVariantId: "nocker_a" },
    { mapSlotId: "neoku_mountain", key: "neoku_orvan", modelVariantId: "neoku_orvan_b" },
    { mapSlotId: "neoku_mountain", key: "nocker", modelVariantId: "nocker_b" },
  ];
  const neokuRegistry = [
    {
      key: "neoku_orvan",
      mapSlotId: "neoku_mountain",
      modelFile: "NeokuOrvanA.glb",
      skills: ["タックル"],
    },
    {
      key: "nocker",
      mapSlotId: "neoku_mountain",
      modelFile: "NockerA.glb",
      skills: ["スニークアタック"],
    },
  ];

  it("passes wiki spawn and registry official checks", () => {
    const wiki = MOE_MACRO1_PHASE3_AREA_WIKI.neoku_mountain;
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    const spawnIssues = moeMacro1OfficialSpawnIssues(
      "neoku_mountain",
      neokuSpawns,
      wiki,
      variantIds
    );
    const registryIssues = moeMacro1RegistryIssues(neokuRegistry, "neoku_mountain");
    assert.deepEqual(spawnIssues, []);
    assert.deepEqual(registryIssues, []);
  });
});

describe("macro1 elan palace official check", () => {
  const elanSpawns = elanPalaceMazeSpawnPlan().map((entry) => ({
    mapSlotId: "elan_palace",
    key: entry.key,
    modelVariantId: `${entry.key}_${entry.variant ?? "a"}`,
  }));
  const elanRegistry = [
    "elan_knight_white",
    "elan_knight_black",
    "giant_destroyer",
    "frost_wolf",
    "gargoyle_lord",
    "gargoyle_lord_strong",
    "lizardman_soldier",
    "lizardman_mage",
    "lizardman_captain",
    "minotaur_boss",
    "dullahan",
  ].map((key) => ({
    key,
    mapSlotId: "elan_palace",
    modelFile: "Placeholder.glb",
    skills: ["placeholder"],
  }));

  it("passes wiki spawn and registry official checks", () => {
    const wiki = MOE_MACRO1_PHASE3_AREA_WIKI.elan_palace;
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    const spawnIssues = moeMacro1OfficialSpawnIssues(
      "elan_palace",
      elanSpawns,
      wiki,
      variantIds
    );
    const registryIssues = moeMacro1RegistryIssues(elanRegistry, "elan_palace");
    assert.deepEqual(spawnIssues, []);
    assert.deepEqual(registryIssues, []);
    assert.equal(elanSpawns.length, 17);
  });
});

describe("macro1 sulfur mine official check", () => {
  const sulfurSpawns = sulfurMineMazeSpawnPlan().map((entry) => ({
    mapSlotId: "sulfur_mine",
    key: entry.key,
    modelVariantId: `${entry.key}_${entry.variant ?? "a"}`,
  }));
  const sulfurRegistry = [
    {
      key: "elan_knight_white",
      mapSlotId: "sulfur_mine",
      modelFile: "ElanKnightWhiteA.glb",
      skills: ["チャージドスラッシュ"],
    },
    {
      key: "elan_knight_black",
      mapSlotId: "sulfur_mine",
      modelFile: "ElanKnightBlackA.glb",
      skills: ["チャージドスラッシュ"],
    },
    {
      key: "salamander",
      mapSlotId: "sulfur_mine",
      modelFile: "SalamanderA.glb",
      skills: ["テイルウィップ"],
    },
  ];

  it("passes wiki spawn and registry official checks", () => {
    const wiki = MOE_MACRO1_PHASE3_AREA_WIKI.sulfur_mine;
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    const spawnIssues = moeMacro1OfficialSpawnIssues(
      "sulfur_mine",
      sulfurSpawns,
      wiki,
      variantIds
    );
    const registryIssues = moeMacro1RegistryIssues(sulfurRegistry, "sulfur_mine");
    assert.deepEqual(spawnIssues, []);
    assert.deepEqual(registryIssues, []);
    assert.equal(sulfurSpawns.length, 6);
  });

  it("lists sulfur variants in monster lineup", () => {
    const sulfurVariants = MOE_MONSTER_LINEUP.filter((v) =>
      v.note.includes("スルト")
    );
    assert.equal(sulfurVariants.length, 6);
  });

  it("has generated GLB files for sulfur mine variants", () => {
    const glbDir = path.join(repoRoot, "public/assets/models/monster");
    const expected = [
      "ElanKnightWhiteA.glb",
      "ElanKnightWhiteB.glb",
      "ElanKnightBlackA.glb",
      "ElanKnightBlackB.glb",
      "SalamanderA.glb",
      "SalamanderB.glb",
    ];
    for (const file of expected) {
      const full = path.join(glbDir, file);
      assert.ok(fs.existsSync(full), `missing ${file}`);
      assert.ok(fs.statSync(full).size > 1000, `${file} too small`);
    }
  });
});

describe("macro1 neoku plateau official check", () => {
  const plateauSpawns = [
    { mapSlotId: "neoku_plateau", key: "young_orvan", modelVariantId: "neoku_orvan_a" },
    { mapSlotId: "neoku_plateau", key: "neoku_orvan_plateau", modelVariantId: "neoku_orvan_b" },
    { mapSlotId: "neoku_plateau", key: "guard_nocker", modelVariantId: "nocker_a" },
  ];
  const plateauRegistry = [
    { key: "young_orvan", mapSlotId: "neoku_plateau", modelFile: "NeokuOrvanA.glb", skills: ["タックル"] },
    { key: "neoku_orvan_plateau", mapSlotId: "neoku_plateau", modelFile: "NeokuOrvanB.glb", skills: ["バイト"] },
    { key: "guard_nocker", mapSlotId: "neoku_plateau", modelFile: "NockerA.glb", skills: ["スニークアタック"] },
  ];

  it("passes wiki spawn and registry official checks", () => {
    const wiki = MOE_MACRO1_PHASE3_AREA_WIKI.neoku_plateau;
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    assert.deepEqual(
      moeMacro1OfficialSpawnIssues("neoku_plateau", plateauSpawns, wiki, variantIds),
      []
    );
    assert.deepEqual(moeMacro1RegistryIssues(plateauRegistry, "neoku_plateau"), []);
  });
});

describe("macro1 darin mountain official check", () => {
  const darinSpawns = [
    { mapSlotId: "darin_mountain", key: "dain_rat", modelVariantId: "meerim_rat_b" },
    { mapSlotId: "darin_mountain", key: "dain_orc_guard", modelVariantId: "orc_gang_a" },
    { mapSlotId: "darin_mountain", key: "dain_orc_elite", modelVariantId: "orc_gang_b" },
  ];
  const darinRegistry = [
    { key: "dain_rat", mapSlotId: "darin_mountain", modelFile: "MeerimRatB.glb", skills: ["噛み付き"] },
    { key: "dain_orc_guard", mapSlotId: "darin_mountain", modelFile: "OrcGangA.glb", skills: ["バーサーク"] },
    { key: "dain_orc_elite", mapSlotId: "darin_mountain", modelFile: "OrcGangB.glb", skills: ["スニーク アタック"] },
  ];

  it("passes wiki spawn and registry official checks", () => {
    const wiki = MOE_MACRO1_PHASE3_AREA_WIKI.darin_mountain;
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    assert.deepEqual(
      moeMacro1OfficialSpawnIssues("darin_mountain", darinSpawns, wiki, variantIds),
      []
    );
    assert.deepEqual(moeMacro1RegistryIssues(darinRegistry, "darin_mountain"), []);
  });
});

describe("macro1 eisis cave official check", () => {
  const eisisSpawns = [
    { mapSlotId: "eisis_cave", key: "eisis_rat", modelVariantId: "meerim_rat_b" },
    { mapSlotId: "eisis_cave", key: "eisis_ixion", modelVariantId: "eisis_ixion_a" },
    { mapSlotId: "eisis_cave", key: "great_tarantula", modelVariantId: "great_tarantula_a" },
  ];
  const eisisRegistry = [
    { key: "eisis_rat", mapSlotId: "eisis_cave", modelFile: "MeerimRatB.glb", skills: ["噛み付き"] },
    { key: "eisis_ixion", mapSlotId: "eisis_cave", modelFile: "StrayIxion.glb", skills: ["ウォーターガン"] },
    { key: "great_tarantula", mapSlotId: "eisis_cave", modelFile: "ElvinSpiderA.glb", skills: ["通常攻撃"] },
  ];

  it("passes wiki spawn and registry official checks", () => {
    const wiki = MOE_MACRO1_PHASE3_AREA_WIKI.eisis_cave;
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    assert.deepEqual(
      moeMacro1OfficialSpawnIssues("eisis_cave", eisisSpawns, wiki, variantIds),
      []
    );
    assert.deepEqual(moeMacro1RegistryIssues(eisisRegistry, "eisis_cave"), []);
  });
});

describe("macro1 elvin mountains official check", () => {
  const mountainSpawns = [
    { mapSlotId: "elvin_mountains", key: "elvin_mount_wolf", modelVariantId: "elvin_wolf_a" },
    { mapSlotId: "elvin_mountains", key: "elvin_mount_bison", modelVariantId: "elvin_bison_a" },
    { mapSlotId: "elvin_mountains", key: "pygmy_gryphon", modelVariantId: "pygmy_gryphon_a" },
    { mapSlotId: "elvin_mountains", key: "soil_basilisk", modelVariantId: "soil_basilisk_a" },
  ];
  const mountainRegistry = [
    { key: "elvin_mount_wolf", mapSlotId: "elvin_mountains", modelFile: "ElvinWolfA.glb", skills: ["噛み付き"] },
    { key: "elvin_mount_bison", mapSlotId: "elvin_mountains", modelFile: "ElvinBisonA.glb", skills: ["ホーン チャージ"] },
    { key: "pygmy_gryphon", mapSlotId: "elvin_mountains", modelFile: "PygmyGryphonA.glb", skills: ["噛み付き"] },
    { key: "soil_basilisk", mapSlotId: "elvin_mountains", modelFile: "SoilBasiliskA.glb", skills: ["ポイズン テイル"] },
  ];

  it("passes wiki spawn and registry official checks", () => {
    const wiki = MOE_MACRO1_PHASE3_AREA_WIKI.elvin_mountains;
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    assert.deepEqual(
      moeMacro1OfficialSpawnIssues("elvin_mountains", mountainSpawns, wiki, variantIds),
      []
    );
    assert.deepEqual(moeMacro1RegistryIssues(mountainRegistry, "elvin_mountains"), []);
  });
});

describe("macro1 dragon valley official check", () => {
  const valleySpawns = [
    { mapSlotId: "dragon_valley", key: "wild_orvan", modelVariantId: "wild_orvan_a" },
    { mapSlotId: "dragon_valley", key: "ancient_treant", modelVariantId: "ancient_treant_a" },
    { mapSlotId: "dragon_valley", key: "sky_dragon", modelVariantId: "sky_dragon_a" },
  ];
  const valleyRegistry = [
    { key: "wild_orvan", mapSlotId: "dragon_valley", modelFile: "WildOrvanA.glb", skills: ["バイト"] },
    { key: "ancient_treant", mapSlotId: "dragon_valley", modelFile: "AncientTreantA.glb", skills: ["アースクエイク"] },
    { key: "sky_dragon", mapSlotId: "dragon_valley", modelFile: "SkyDragonA.glb", skills: ["ガスティ ウインド"] },
  ];

  it("passes wiki spawn and registry official checks", () => {
    const wiki = MOE_MACRO1_PHASE3_AREA_WIKI.dragon_valley;
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    assert.deepEqual(
      moeMacro1OfficialSpawnIssues("dragon_valley", valleySpawns, wiki, variantIds),
      []
    );
    assert.deepEqual(moeMacro1RegistryIssues(valleyRegistry, "dragon_valley"), []);
  });
});

describe("training guide house life burst chant", () => {
  it("matches chant phrase and applies session hp bonus once", async () => {
    const {
      applyMoeTrainingGuideHpBonus,
      moeApplyFlatPetHpBonus,
      moeEnsureTrainingGuideHpBonus,
      moeTrainingGuideChantMatches,
      MOE_TRAINING_GUIDE_HP_BONUS,
    } = await import("../../src/lib/moeTrainingGuideHouseBuff.js");

    assert.equal(moeTrainingGuideChantMatches("生命爆神を実装します"), true);
    assert.equal(moeTrainingGuideChantMatches(" 生命爆神を実装します "), true);
    assert.equal(moeTrainingGuideChantMatches("生命爆神"), true);
    assert.equal(moeTrainingGuideChantMatches("生命ばくしん"), false);

    const base = { id: "sun_spirit", hp: 80, hpMax: 120 };
    const first = applyMoeTrainingGuideHpBonus(base);
    assert.equal(first.applied, true);
    assert.equal(first.pet.hpMax, 120 + MOE_TRAINING_GUIDE_HP_BONUS);
    assert.equal(first.pet.hp, 80 + MOE_TRAINING_GUIDE_HP_BONUS);
    const second = applyMoeTrainingGuideHpBonus(first.pet);
    assert.equal(second.applied, false);
    assert.equal(second.reason, "already");

    const stripped = {
      ...first.pet,
      id: "sun_spirit",
      trainingGuideHpBonus: 0,
      hpMax: 120,
      hp: 120,
    };
    const restored = moeEnsureTrainingGuideHpBonus(stripped);
    assert.equal(restored.hpMax, 120 + MOE_TRAINING_GUIDE_HP_BONUS);
    assert.equal(restored.hp, 120 + MOE_TRAINING_GUIDE_HP_BONUS);

    const full = { id: "sun_spirit", hp: 200, hpMax: 200 };
    const healed = moeApplyFlatPetHpBonus(full, 100);
    assert.equal(healed.hpMax, 300);
    assert.equal(healed.hp, 300);
  });

  it("re-sync keeps combat damage on boosted pet", async () => {
    const {
      applyMoeTrainingGuideHpBonus,
      moeEnsureTrainingGuideHpBonus,
      MOE_TRAINING_GUIDE_HP_BONUS,
    } = await import("../../src/lib/moeTrainingGuideHouseBuff.js");

    const base = { id: "sun_spirit", hp: 80, hpMax: 120 };
    const boosted = applyMoeTrainingGuideHpBonus(base).pet;
    const damaged = { ...boosted, hp: boosted.hp - 30 };
    const synced = moeEnsureTrainingGuideHpBonus(damaged);
    assert.equal(synced.hpMax, 120 + MOE_TRAINING_GUIDE_HP_BONUS);
    assert.equal(synced.hp, boosted.hp - 30);
  });
});

describe("pet training guide by map", () => {
  const mapSlots = [
    { id: "dragon_valley", nameJa: "飛竜の谷" },
    { id: "elvin_mountains", nameJa: "エルビン山脈" },
  ];

  it("groups enemies per map sorted by level", () => {
    const sections = moePetTrainingGuideSectionsFromEntries(
      [
        {
          key: "wild_orvan",
          name: "ワイルド オルヴァン",
          level: 71.1,
          mapSlotId: "dragon_valley",
          emoji: "🐲",
        },
        {
          key: "ancient_treant",
          name: "エンシェント トレント",
          level: 65.5,
          mapSlotId: "dragon_valley",
          emoji: "🌳",
        },
        {
          key: "sky_dragon",
          name: "スカイドラゴン",
          level: 71.9,
          mapSlotId: "dragon_valley",
          emoji: "🪽",
        },
        {
          key: "pygmy_gryphon",
          name: "ピグミー グリフォン",
          level: 34.1,
          mapSlotId: "elvin_mountains",
          emoji: "🦅",
        },
      ],
      mapSlots
    );
    const valley = sections.find((s) => s.mapSlotId === "dragon_valley");
    assert.ok(valley);
    assert.equal(valley.areaJa, "飛竜の谷");
    assert.deepEqual(
      valley.enemies.map((e) => e.name),
      ["エンシェント トレント", "ワイルド オルヴァン", "スカイドラゴン"]
    );
    assert.equal(moePetTrainingLevelLabel(71.1), "Lv71.1");
    const mountains = sections.find((s) => s.mapSlotId === "elvin_mountains");
    assert.ok(mountains?.enemies.some((e) => e.key === "pygmy_gryphon"));
  });
});

describe("macro1 mutum catacomb official check", () => {
  const mutumSpawns = [
    { mapSlotId: "mutum_catacomb", key: "mutum_zombie_rat", modelVariantId: "mutum_zombie_rat_a" },
    { mapSlotId: "mutum_catacomb", key: "mutum_wraith_warrior", modelVariantId: "mutum_wraith_warrior_a" },
    { mapSlotId: "mutum_catacomb", key: "mutum_rosso_fighter", modelVariantId: "mutum_rosso_fighter_a" },
    { mapSlotId: "mutum_catacomb", key: "mutum_zombie_rat", modelVariantId: "mutum_zombie_rat_b" },
    { mapSlotId: "mutum_catacomb", key: "mutum_wraith_warrior", modelVariantId: "mutum_wraith_warrior_b" },
  ];
  const mutumRegistry = [
    { key: "mutum_zombie_rat", mapSlotId: "mutum_catacomb", modelFile: "MeerimRatB.glb", skills: ["噛み付き"] },
    { key: "mutum_wraith_warrior", mapSlotId: "mutum_catacomb", modelFile: "ElanKnightWhiteA.glb", skills: ["通常攻撃", "ノンアクティブ"] },
    { key: "mutum_rosso_fighter", mapSlotId: "mutum_catacomb", modelFile: "OrcGangA.glb", skills: ["スニーク アタック"] },
  ];

  it("passes wiki spawn and registry official checks", () => {
    const wiki = MOE_MACRO1_PHASE3_AREA_WIKI.mutum_catacomb;
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    assert.deepEqual(
      moeMacro1OfficialSpawnIssues("mutum_catacomb", mutumSpawns, wiki, variantIds),
      []
    );
    assert.deepEqual(moeMacro1RegistryIssues(mutumRegistry, "mutum_catacomb"), []);
  });
});

describe("enemy detection", () => {
  it("resolves hearing-sensitive serpent defaults", async () => {
    const { resolveMoeEnemyDetection } = await import(
      "../../src/lib/moeEnemyDetection.js"
    );
    const det = resolveMoeEnemyDetection({
      key: "brown_serpent",
      familyId: "brown_serpent",
    });
    assert.equal(det.hearing, "sensitive");
    assert.equal(det.searchType, "visual");
    assert.ok(det.visionDeg >= 80);
  });

  it("defaults to visual-only without footstep search", async () => {
    const { resolveMoeEnemyDetection, checkMoeEnemyPlayerDetection } =
      await import("../../src/lib/moeEnemyDetection.js");
    const det = resolveMoeEnemyDetection({
      key: "riverside_crawler",
      familyId: "riverside_crawler",
    });
    assert.equal(det.searchType, "visual");
    const sideMoving = checkMoeEnemyPlayerDetection(
      { key: "riverside_crawler", familyId: "riverside_crawler" },
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      0,
      { playerMoving: true }
    );
    assert.equal(sideMoving.detected, false);
  });

  it("hearing search uses a circle not vision cone", async () => {
    const { resolveMoeEnemyDetection, checkMoeEnemyPlayerDetection } =
      await import("../../src/lib/moeEnemyDetection.js");
    const det = resolveMoeEnemyDetection({
      key: "earth_worm",
      familyId: "earth_worm",
    });
    assert.equal(det.searchType, "hearing");
    const sideMoving = checkMoeEnemyPlayerDetection(
      { key: "earth_worm", familyId: "earth_worm" },
      { x: 4, y: 0 },
      { x: 0, y: 0 },
      0,
      { playerMoving: true }
    );
    assert.ok(sideMoving.via.includes("hearing"));
    assert.equal(sideMoving.via.includes("visual"), false);
  });

  it("widens boss vision", async () => {
    const { resolveMoeEnemyDetection } = await import(
      "../../src/lib/moeEnemyDetection.js"
    );
    const det = resolveMoeEnemyDetection({
      key: "field_orc",
      familyId: "orc",
      midBoss: true,
    });
    assert.ok(det.visionDeg >= 125);
    assert.ok(det.visionRange >= 14);
  });

  it("detects player in vision cone and hearing range", async () => {
    const {
      checkMoeEnemyPlayerDetection,
      isPlayerInEnemyVisionCone,
      sampleMoeEnemyVisionArcPoints,
    } = await import("../../src/lib/moeEnemyDetection.js");
    const facingYaw = 0;
    assert.ok(
      isPlayerInEnemyVisionCone({
        px: 0,
        pz: 5,
        cx: 0,
        cz: 0,
        facingYaw,
        visionDeg: 90,
        visionRange: 10,
      })
    );
    assert.ok(!isPlayerInEnemyVisionCone({
      px: 5,
      pz: 0,
      cx: 0,
      cz: 0,
      facingYaw,
      visionDeg: 90,
      visionRange: 10,
    }));
    const arc = sampleMoeEnemyVisionArcPoints({
      cx: 0,
      cz: 0,
      facingYaw,
      visionDeg: 90,
      visionRange: 8,
    });
    assert.ok(arc.length >= 6);
    const hit = checkMoeEnemyPlayerDetection(
      { key: "brown_serpent", familyId: "brown_serpent" },
      { x: 0, y: 4 },
      { x: 0, y: 0 },
      facingYaw,
      { playerMoving: false }
    );
    assert.ok(hit.detected);
    assert.ok(hit.via.includes("visual"));
    const sideStill = checkMoeEnemyPlayerDetection(
      { key: "brown_serpent", familyId: "brown_serpent" },
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      facingYaw,
      { playerMoving: false }
    );
    assert.equal(sideStill.detected, false);
    const sideMoving = checkMoeEnemyPlayerDetection(
      { key: "brown_serpent", familyId: "brown_serpent" },
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      facingYaw,
      { playerMoving: true }
    );
    assert.equal(sideMoving.detected, false);
    const houndSide = checkMoeEnemyPlayerDetection(
      { key: "rescue_hound", familyId: "rescue_hound" },
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      facingYaw,
      { playerMoving: true }
    );
    assert.ok(houndSide.via.includes("hearing"));
  });
});

describe("player stealth", () => {
  it("kakuremino blocks all detection", async () => {
    const { buildMoeEnemyDetectionOpts, isMoeKakureminoActive } = await import(
      "../../src/lib/moePlayerStealth.js"
    );
    const now = 1000;
    const until = now + 5000;
    assert.ok(isMoeKakureminoActive(until, now + 1000));
    const opts = buildMoeEnemyDetectionOpts({
      playerMoving: true,
      shinobiashiOn: false,
      kakureminoUntilMs: until,
      nowMs: now + 1000,
    });
    assert.equal(opts.stealthFull, true);
    assert.equal(opts.soundMult, 0);
  });

  it("shinobiashi silences footstep hearing", async () => {
    const { buildMoeEnemyDetectionOpts } = await import(
      "../../src/lib/moePlayerStealth.js"
    );
    const { checkMoeEnemyPlayerDetection } = await import(
      "../../src/lib/moeEnemyDetection.js"
    );
    const opts = buildMoeEnemyDetectionOpts({
      playerMoving: true,
      shinobiashiOn: true,
      kakureminoUntilMs: 0,
    });
    assert.equal(opts.stealthFull, false);
    assert.equal(opts.soundMult, 0);
    const enemy = { key: "rescue_hound", familyId: "rescue_hound" };
    const loud = checkMoeEnemyPlayerDetection(
      enemy,
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      0,
      { playerMoving: true, soundMult: 1 }
    );
    const quiet = checkMoeEnemyPlayerDetection(
      enemy,
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      0,
      opts
    );
    assert.ok(loud.via.includes("hearing"));
    assert.equal(quiet.detected, false);
  });

  it("formats player stealth badge for hp window", async () => {
    const { formatMoePlayerStealthBadge } = await import(
      "../../src/lib/moePlayerStealth.js"
    );
    assert.equal(
      formatMoePlayerStealthBadge({ shinobiashiOn: true })?.label,
      "👣 忍び足"
    );
    assert.match(
      formatMoePlayerStealthBadge({
        stealthFull: true,
        kakureminoRemainSec: 3,
      })?.label ?? "",
      /隠れ蓑 3s/
    );
    assert.equal(
      formatMoePlayerStealthBadge({
        shinobiashiOn: true,
        stealthFull: true,
      })?.tone,
      "full"
    );
  });

  it("drops field aggro on kakuremino", async () => {
    const { dropMoeEnemyFieldAggro } = await import(
      "../../src/lib/moePlayerStealth.js"
    );
    const enemies = [{ id: 1, x: 4, y: 2 }];
    const runtime = {
      1: {
        aggro: true,
        spawnX: 0,
        spawnY: 0,
        x: 4,
        y: 2,
        facingYaw: 1,
        lostSightAcc: 0,
      },
    };
    assert.ok(dropMoeEnemyFieldAggro(runtime, enemies));
    assert.equal(runtime[1].aggro, false);
    assert.equal(enemies[0].x, 0);
    assert.equal(enemies[0].y, 0);
    assert.equal(runtime[1].facingYaw, 0);
    const idleYaw = Math.PI;
    const runtime2 = {
      2: {
        aggro: true,
        spawnX: 0,
        spawnY: 0,
        x: 3,
        y: 1,
        facingYaw: 0.5,
        lostSightAcc: 0,
      },
    };
    dropMoeEnemyFieldAggro(runtime2, [{ id: 2, x: 3, y: 1 }], () => idleYaw);
    assert.equal(runtime2[2].facingYaw, idleYaw);
  });
});

describe("enemy field chase", () => {
  it("moves at one third of player walk speed", async () => {
    const {
      moeEnemyChaseSpeedPerSec,
      MOE_PLAYER_FIELD_SPEED_3D,
      MOE_ENEMY_CHASE_SPEED_RATIO,
    } = await import("../../src/lib/moeEnemyFieldChase.js");
    assert.equal(
      moeEnemyChaseSpeedPerSec(),
      MOE_PLAYER_FIELD_SPEED_3D * MOE_ENEMY_CHASE_SPEED_RATIO
    );
  });

  it("stops chase when player exceeds索敵×2 from spawn", async () => {
    const { tickMoeEnemyFieldChaseBatch } = await import(
      "../../src/lib/moeEnemyFieldChase.js"
    );
    const {
      resolveMoeEnemyDetection,
      moeEnemyChaseMaxRangeFromSpawn,
    } = await import("../../src/lib/moeEnemyDetection.js");
    const det = resolveMoeEnemyDetection({
      key: "riverside_crawler",
      familyId: "riverside_crawler",
    });
    const leash = moeEnemyChaseMaxRangeFromSpawn(det);
    assert.equal(leash, det.visionRange * 2);
    const enemies = [
      {
        id: 3,
        key: "riverside_crawler",
        familyId: "riverside_crawler",
        hp: 50,
        x: 0,
        y: 0,
      },
    ];
    const runtimeById = {
      3: {
        aggro: true,
        spawnX: 0,
        spawnY: 0,
        x: 2,
        y: 0,
        facingYaw: 0,
        lostSightAcc: 0,
      },
    };
    const far = tickMoeEnemyFieldChaseBatch({
      enemies,
      runtimeById,
      playerPos: { x: leash + 5, y: 0 },
      playerMoving: false,
      dt: 0.1,
      duel: null,
    });
    assert.equal(far.leashBrokenEnemyId, 3);
    assert.equal(runtimeById[3].aggro, false);
    assert.equal(enemies[0].x, 0);
  });

  it("visual-only chase stops immediately outside the fan", async () => {
    const { tickMoeEnemyFieldChaseBatch } = await import(
      "../../src/lib/moeEnemyFieldChase.js"
    );
    const enemies = [
      {
        id: 9,
        key: "brown_serpent",
        familyId: "brown_serpent",
        hp: 50,
        x: 0,
        y: 0,
      },
    ];
    const runtimeById = {
      9: {
        aggro: true,
        spawnX: 0,
        spawnY: 0,
        x: 1,
        y: 0,
        facingYaw: 0,
        lostSightAcc: 0,
      },
    };
    const side = tickMoeEnemyFieldChaseBatch({
      enemies,
      runtimeById,
      playerPos: { x: 6, y: 0 },
      playerMoving: false,
      dt: 0.05,
      duel: null,
    });
    assert.equal(runtimeById[9].aggro, false);
    assert.equal(side.anyChasing, false);
  });

  it("aggros and steps toward the player", async () => {
    const { tickMoeEnemyFieldChaseBatch } = await import(
      "../../src/lib/moeEnemyFieldChase.js"
    );
    const enemies = [
      {
        id: 9,
        key: "brown_serpent",
        familyId: "brown_serpent",
        hp: 50,
        x: 0,
        y: 0,
      },
    ];
    const runtimeById = {};
    const first = tickMoeEnemyFieldChaseBatch({
      enemies,
      runtimeById,
      playerPos: { x: 0, y: 8 },
      playerMoving: false,
      dt: 0.1,
      duel: null,
    });
    assert.equal(first.newAggroEnemyId, 9);
    const second = tickMoeEnemyFieldChaseBatch({
      enemies,
      runtimeById,
      playerPos: { x: 0, y: 8 },
      playerMoving: false,
      dt: 0.5,
      duel: null,
    });
    assert.ok(runtimeById[9].y > 0);
    assert.ok(second.engageEnemyId == null);
  });

  it("keeps visual aggro after detecting with idle facing", async () => {
    const { tickMoeEnemyFieldChaseBatch } = await import(
      "../../src/lib/moeEnemyFieldChase.js"
    );
    const towardPlayerYaw = Math.PI;
    const enemies = [
      {
        id: 12,
        key: "elan_knight_white",
        familyId: "elan_knight_white",
        hp: 50,
        x: 0,
        y: 10,
        mapSlotId: "elan_palace",
      },
    ];
    const runtimeById = {};
    const resolveIdleFacingYaw = () => towardPlayerYaw;
    const first = tickMoeEnemyFieldChaseBatch({
      enemies,
      runtimeById,
      playerPos: { x: 0, y: 5 },
      playerMoving: false,
      dt: 0.1,
      duel: null,
      resolveIdleFacingYaw,
    });
    assert.equal(first.newAggroEnemyId, 12);
    assert.equal(runtimeById[12].facingYaw, towardPlayerYaw);
    const second = tickMoeEnemyFieldChaseBatch({
      enemies,
      runtimeById,
      playerPos: { x: 0, y: 5 },
      playerMoving: false,
      dt: 0.5,
      duel: null,
      resolveIdleFacingYaw,
    });
    assert.equal(runtimeById[12].aggro, true);
    assert.ok(runtimeById[12].y < 10);
    assert.equal(second.anyChasing, true);
  });

  it("elan knight aggros when idle facing points toward the player", async () => {
    const { tickMoeEnemyFieldChaseBatch } = await import(
      "../../src/lib/moeEnemyFieldChase.js"
    );
    const enemies = [
      {
        id: 11,
        key: "elan_knight_white",
        familyId: "elan_knight_white",
        hp: 50,
        x: 0,
        y: 10,
        mapSlotId: "elan_palace",
      },
    ];
    const playerPos = { x: 0, y: 5 };
    const towardPlayerYaw = Math.PI;
    const withoutFacing = tickMoeEnemyFieldChaseBatch({
      enemies,
      runtimeById: {},
      playerPos,
      playerMoving: true,
      dt: 0.1,
      duel: null,
    });
    assert.equal(withoutFacing.newAggroEnemyId, null);
    const runtimeById = {};
    const withFacing = tickMoeEnemyFieldChaseBatch({
      enemies,
      runtimeById,
      playerPos,
      playerMoving: true,
      dt: 0.1,
      duel: null,
      resolveIdleFacingYaw: () => towardPlayerYaw,
    });
    assert.equal(withFacing.newAggroEnemyId, 11);
  });

  it("aggros using field sync position when spawn data differs", async () => {
    const { tickMoeEnemyFieldChaseBatch } = await import(
      "../../src/lib/moeEnemyFieldChase.js"
    );
    const enemies = [
      {
        id: 20,
        key: "elan_knight_white",
        familyId: "elan_knight_white",
        hp: 50,
        x: 100,
        y: 100,
        mapSlotId: "elan_palace",
      },
    ];
    const runtimeById = {};
    const result = tickMoeEnemyFieldChaseBatch({
      enemies,
      runtimeById,
      playerPos: { x: 0, y: 5 },
      playerMoving: false,
      dt: 0.1,
      duel: null,
      resolveFieldSync: () => ({
        x: 0,
        y: 10,
        idleFacingYaw: Math.PI,
      }),
    });
    assert.equal(result.newAggroEnemyId, 20);
    assert.equal(runtimeById[20].spawnX, 0);
    assert.equal(runtimeById[20].spawnY, 10);
  });

  it("non-active enemies detect but do not aggro", async () => {
    const { tickMoeEnemyFieldChaseBatch } = await import(
      "../../src/lib/moeEnemyFieldChase.js"
    );
    const enemies = [
      {
        id: 30,
        key: "elvin_bison",
        familyId: "elvin_bison",
        hp: 50,
        x: 0,
        y: 0,
        mapSlotId: "elvin_valley",
      },
    ];
    const runtimeById = {};
    const result = tickMoeEnemyFieldChaseBatch({
      enemies,
      runtimeById,
      playerPos: { x: 0, y: 8 },
      playerMoving: false,
      dt: 0.1,
      duel: null,
      resolveIdleFacingYaw: () => Math.PI,
    });
    assert.equal(result.newAggroEnemyId, null);
    assert.equal(runtimeById[30]?.aggro, false);
  });
});

describe("enemy field active", () => {
  it("resolves non-active keys and skill tags", async () => {
    const {
      resolveMoeEnemyFieldActive,
      MOE_ENEMY_FIELD_NON_ACTIVE_KEYS,
    } = await import("../../src/lib/moeEnemyFieldActive.js");
    assert.equal(
      resolveMoeEnemyFieldActive({ key: "elvin_bison" }),
      false
    );
    assert.equal(resolveMoeEnemyFieldActive({ key: "ips_bass" }), false);
    assert.equal(
      resolveMoeEnemyFieldActive({
        key: "sandworm",
        skills: ["視覚リンク", "ノンアクティブ"],
      }),
      false
    );
    assert.equal(
      resolveMoeEnemyFieldActive({ key: "rescue_hound" }),
      true
    );
    assert.ok(MOE_ENEMY_FIELD_NON_ACTIVE_KEYS.has("turtle"));
    const { listMoeEnemyFieldNonActiveKeys } = await import(
      "../../src/lib/moeEnemyFieldActive.js"
    );
    assert.ok(listMoeEnemyFieldNonActiveKeys().includes("elvin_bison"));
  });
});

describe("enemy stat search", () => {
  it("builds a view from field enemy data", async () => {
    const { buildMoeEnemyStatSearchView } = await import(
      "../../src/lib/moeEnemyStatSearch.js"
    );
    const view = buildMoeEnemyStatSearchView({
      id: 1,
      name: "テスト敵",
      emoji: "🐺",
      level: 12.5,
      hp: 40,
      hpMax: 100,
      petDamage: 22,
      attackInterval: 33.5,
      skills: ["Lv25:噛み付き", "Lv50:タックル"],
      wiki: {
        mp: 15,
        attack: 18,
        defense: 12,
        hit: 10,
        magic: 6,
        evasion: 0.5,
      },
    });
    assert.equal(view.name, "テスト敵");
    assert.equal(view.hp, 40);
    assert.equal(view.fieldDamage, 22);
    assert.deepEqual(view.skills, ["Lv25:噛み付き", "Lv50:タックル"]);
    assert.equal(view.detectionUi.targetLabel, "プレイヤー");
    assert.match(view.detectionUi.visionLabel, /前方\d+°/);
  });

  it("reports live detection when player is in range", async () => {
    const { buildMoeEnemyLiveDetectionSnapshot } = await import(
      "../../src/lib/moeEnemyStatSearch.js"
    );
    const inRange = buildMoeEnemyLiveDetectionSnapshot(
      {
        id: 1,
        key: "brown_serpent",
        familyId: "brown_serpent",
        x: 0,
        y: 0,
      },
      { x: 0, y: 4 },
      0,
      { playerMoving: false }
    );
    assert.equal(inRange?.statusLabel, "発見中");
    assert.ok(inRange?.detected);
    const outRange = buildMoeEnemyLiveDetectionSnapshot(
      {
        id: 1,
        key: "brown_serpent",
        familyId: "brown_serpent",
        x: 0,
        y: 0,
      },
      { x: 30, y: 30 },
      0,
      { playerMoving: false }
    );
    assert.equal(outRange?.statusLabel, "範囲外");
    assert.equal(outRange?.detected, false);
  });

  it("shows disposition and passive live detection", async () => {
    const {
      buildMoeEnemyStatSearchView,
      buildMoeEnemyLiveDetectionSnapshot,
    } = await import("../../src/lib/moeEnemyStatSearch.js");
    const view = buildMoeEnemyStatSearchView({
      id: 2,
      key: "turtle",
      familyId: "turtle",
      name: "トータス",
      emoji: "🐢",
      level: 55,
      hp: 100,
      hpMax: 100,
      skills: ["ノンアクティブ", "範囲攻撃"],
    });
    assert.equal(view.fieldActive, false);
    assert.equal(view.fieldActiveLabel, "ノンアクティブ");
    const passive = buildMoeEnemyLiveDetectionSnapshot(
      {
        id: 2,
        key: "turtle",
        familyId: "turtle",
        x: 0,
        y: 0,
      },
      { x: 0, y: 4 },
      0,
      { playerMoving: false }
    );
    assert.equal(passive?.statusLabel, "検知済み");
    assert.equal(passive?.tone, "passive");
    assert.match(passive?.detail ?? "", /追跡しない/);
  });

  it("formats stealth notes and live hearing reach", async () => {
    const {
      formatMoeEnemyStealthNote,
      moeEnemyLiveHearingReach,
    } = await import("../../src/lib/moeEnemyStatSearch.js");
    const { resolveMoeEnemyDetection } = await import(
      "../../src/lib/moeEnemyDetection.js"
    );
    const houndDet = resolveMoeEnemyDetection({
      key: "rescue_hound",
      familyId: "rescue_hound",
    });
    assert.equal(formatMoeEnemyStealthNote({ stealthFull: true })?.label, "隠れ蓑");
    assert.match(
      formatMoeEnemyStealthNote({ soundMult: 0 })?.detail ?? "",
      /感知されない/
    );
    assert.equal(
      moeEnemyLiveHearingReach(houndDet, { soundMult: 0.5 }),
      houndDet.hearingRange * 0.5
    );
    assert.equal(
      moeEnemyLiveHearingReach(houndDet, { soundMult: 0 }),
      houndDet.hearingRange
    );
    assert.equal(
      moeEnemyLiveHearingReach(
        resolveMoeEnemyDetection({
          key: "brown_serpent",
          familyId: "brown_serpent",
        }),
        { soundMult: 1 }
      ),
      null
    );
  });
});

describe("buff ui", () => {
  it("pads player and pet buff strips to 6 slots", async () => {
    const {
      buildMoePlayerBuffStrip,
      buildMoePetBuffStrip,
      MOE_PLAYER_BUFF_SLOT_COUNT,
      MOE_PET_BUFF_SLOT_COUNT,
    } = await import("../../src/lib/moeBuffUi.js");
    const now = 1_000_000;
    const player = buildMoePlayerBuffStrip(
      {
        bananaMilkActive: true,
        shinobiashiOn: true,
        kakureminoUntilMs: now + 3500,
        dashBoost3x: true,
        playerCondenseMindRef: {
          current: { until: now + 8000 },
        },
      },
      now
    );
    assert.equal(player.length, MOE_PLAYER_BUFF_SLOT_COUNT);
    assert.equal(player.filter(Boolean).length, 5);
    assert.equal(player[0]?.id, "banana_milk");
    const pet = buildMoePetBuffStrip(
      {
        atrumMpRegenRef: { current: { until: now + 5000 } },
        atrumMagicBuffUntilRef: { current: now + 12_000 },
      },
      now
    );
    assert.equal(pet.length, MOE_PET_BUFF_SLOT_COUNT);
    assert.equal(pet.filter(Boolean).length, 2);
  });

  it("shows pet regen toggle icon when active", async () => {
    const { buildMoePetBuffStrip } = await import("../../src/lib/moeBuffUi.js");
    const off = buildMoePetBuffStrip({ petRegenActive: false });
    assert.equal(off.find((s) => s?.id === "pet_regen"), undefined);
    const on = buildMoePetBuffStrip({
      petRegenActive: true,
      petRegenHp: 20,
      petRegenMp: 2,
      petRegenIntervalSec: 2,
    });
    assert.equal(on[0]?.id, "pet_regen");
    assert.equal(on[0]?.icon, "🍃");
  });
});

describe("phoenix player skill MP", () => {
  it("spends player MP, not pet MP", async () => {
    const {
      canSpendPlayerMpForPhoenixSkill,
      spendPlayerMpForPhoenixSkill,
    } = await import("../../src/lib/moePhoenixPlayerSkill.js");
    const skill = { id: "phoenix_ansleep_walk", mpCost: 8 };
    const caster = { mp: 10, mpMax: 50 };
    assert.equal(canSpendPlayerMpForPhoenixSkill(caster, skill), true);
    const next = spendPlayerMpForPhoenixSkill(caster, skill);
    assert.equal(next.mp, 2);
    assert.equal(spendPlayerMpForPhoenixSkill({ mp: 5, mpMax: 50 }, skill), null);
  });
});

describe("field invariants", () => {
  it("detects allyTarget state/ref mismatch", () => {
    const issues = collectMoeFieldInvariantIssues({
      allyTarget: "player",
      allyTargetRef: { current: "pet" },
    });
    assert.ok(issues.some((m) => m.includes("mismatch")));
  });

  it("detects condense flag without buff ref", () => {
    const issues = collectMoeFieldInvariantIssues({
      allyTarget: "player",
      allyTargetRef: { current: "player" },
      condenseMindActive: true,
      playerCondenseMindRef: { current: null },
    });
    assert.ok(issues.length > 0);
  });
});

describe("player pre-skill progress", () => {
  it("allows dev-check skills before required level", () => {
    const skill = MOE_PLAYER_PRE_SKILLS.find((s) => s.id === "jiriki_kaihou");
    assert.equal(canUsePlayerPreSkill(skill, { level: 0, exp: 0 }).ok, true);
    assert.equal(
      canUsePlayerPreSkill(skill, { level: 0, exp: 0 }).devCheck,
      true
    );
  });

  it("levels up every 100 internal exp from MOE gain", () => {
    const applied = applyPlayerPreSkillExp({ level: 9.9, exp: 90 }, 1.0);
    assert.equal(applied.level, 10);
    assert.ok(applied.exp < MOE_PLAYER_SKILL_EXP_PER_TENTH);
    assert.equal(applied.levelUps.length, 1);
  });

  it("gains more exp when skill is near required level", () => {
    let nearSum = 0;
    let easySum = 0;
    for (let i = 0; i < 24; i++) {
      nearSum += moePlayerSkillExpGainAmount(9.8, 10);
      easySum += moePlayerSkillExpGainAmount(50, 10);
    }
    assert.ok(nearSum > easySum);
  });

  it("awards exp on use with toast lines", () => {
    const skill = MOE_PLAYER_PRE_SKILLS[1];
    const map = defaultPlayerPreSkillProgressMap();
    const originalRandom = Math.random;
    Math.random = () => 0;
    const award = awardPlayerPreSkillExpOnUse(map, skill);
    Math.random = originalRandom;
    assert.equal(award.gained, true);
    assert.ok(award.toastLines.some((line) => line.includes("EXP +")));
    assert.equal(award.progressMap[skill.id].exp, 1);
  });
});

describe("player skill2 progress", () => {
  it("registers jiriki seiran at Lv10 for skill bar", () => {
    const skill = MOE_PLAYER_SKILL2_ONLY_SKILLS[0];
    assert.equal(skill?.id, "jiriki_seiran");
    assert.equal(skill?.level, 10);
  });

  it("allows dev-check before required skill2 level", () => {
    const skill = { id: "phoenix_ansleep_walk", level: 20, name: "安眠導歩" };
    assert.equal(canUsePlayerSkill2(skill, { level: 0, exp: 0 }).ok, true);
  });

  it("caps exp gain by skill2 level tier", () => {
    for (let i = 0; i < 20; i++) {
      const amount = moePlayerSkill2ExpGainAmount(5);
      assert.ok(amount >= 0.1 && amount <= 1);
    }
    for (let i = 0; i < 20; i++) {
      const amount = moePlayerSkill2ExpGainAmount(25);
      assert.ok(amount >= 0.1 && amount <= 0.3);
    }
    assert.equal(moePlayerSkill2ExpGainAmount(45), 0.1);
  });

  it("levels up every 100 internal exp", () => {
    const applied = applyPlayerSkill2Exp({ level: 9.9, exp: 90 }, 1.0);
    assert.equal(applied.level, 10);
    assert.equal(applied.levelUps.length, 1);
  });

  it("raises proc rate slightly with skill2 talisman", () => {
    assert.equal(resolvePlayerSkill2ExpProcRate(false), 0.55);
    assert.equal(resolvePlayerSkill2ExpProcRate(true), 0.67);
  });
});

describe("jiriki seiran", () => {
  it("requires MP13", () => {
    assert.equal(canUseJirikiSeiran({ mp: 12 }).ok, false);
    assert.equal(canUseJirikiSeiran({ mp: 13 }).ok, true);
    assert.equal(JIRIKI_SEIRAN_MP_COST, 13);
  });

  it("activates two-phase buff", () => {
    const now = 1_700_000_000_000;
    const result = activateJirikiSeiran({ mp: 50, mpMax: 100 }, now);
    assert.equal(result.ok, true);
    assert.equal(result.casterVitals.mp, 37);
    assert.equal(result.buff.mpPerSec, JIRIKI_SEIRAN_BOOST_MP_PER_SEC);
    assert.equal(
      result.buff.until - now,
      JIRIKI_SEIRAN_TOTAL_SEC * 1000
    );
  });

  it("builds opener plus six fire hits", () => {
    const seq = resolvePhoenixHabitAscensionSequence({
      combatOpenFixedDamage: 35,
      combatFixedDamage: 25,
      combatWaveHits: 6,
      combatStepMs: 350,
    });
    assert.equal(seq.hits.length, 7);
    assert.equal(seq.hits[0].opts.fixedDamage, 35);
    assert.equal(seq.hits[6].opts.fixedDamage, 25);
    assert.equal(seq.hits[6].opts.grantExp, true);
  });

  it("drops to normal condense rate after boost", () => {
    const buff = {
      until: 100_000,
      boostUntil: 10_000,
      mpPerSec: JIRIKI_SEIRAN_BOOST_MP_PER_SEC,
      boostMpPerSec: JIRIKI_SEIRAN_BOOST_MP_PER_SEC,
      normalMpPerSec: JIRIKI_SEIRAN_NORMAL_MP_PER_SEC,
    };
    syncJirikiSeiranPhase(buff, 9_999);
    assert.equal(buff.mpPerSec, JIRIKI_SEIRAN_BOOST_MP_PER_SEC);
    syncJirikiSeiranPhase(buff, 10_000);
    assert.equal(buff.mpPerSec, JIRIKI_SEIRAN_NORMAL_MP_PER_SEC);
  });
});

describe("ambient bgm tracks", () => {
  it("resolves track paths for field and local ids", () => {
    assert.ok(isMoeAmbientValidTrackId("local"));
    assert.ok(isMoeAmbientValidTrackId("field"));
    assert.ok(moeAmbientBgmPathForTrackId("local7").includes("ambient-bgm-7"));
  });
});

describe("external save io", () => {
  it("builds moe-save json filenames", () => {
    const name = buildMoeExternalSaveFilename(
      new Date("2026-09-15T12:00:00.000Z")
    );
    assert.match(name, /^moe-save-2026-09-15-/);
    assert.ok(name.endsWith(".json"));
  });
});

describe("player summon models", () => {
  it("registers phoenix and seiryu glb paths", () => {
    const phoenix = moePlayerSummonModelForSkill("jiriki_kaihou");
    const dragon = moePlayerSummonModelForSkill("jiriki_seiryu");
    assert.ok(phoenix?.url.includes("PlayerSummonPhoenix.glb"));
    assert.ok(dragon?.url.includes("PlayerSummonDragon.glb"));
    assert.equal(Object.keys(MOE_PLAYER_SUMMON_MODELS).length, 2);
  });
});

describe("player summon pre-skills", () => {
  it("builds kaihou opener + 6 fire hits", () => {
    const seq = resolveJirikiKaihouSequence(MOE_PLAYER_PRE_SKILLS[0]);
    assert.equal(seq.hits.length, 7);
    assert.equal(seq.hits[0].opts.fixedDamage, 45);
    assert.equal(seq.hits[6].opts.fixedDamage, 32);
    assert.equal(seq.hits[6].opts.grantExp, true);
  });

  it("builds seiryu single heavy hit", () => {
    const seq = resolveJirikiSeiryuSequence(MOE_PLAYER_PRE_SKILLS[1]);
    assert.equal(seq.hits.length, 1);
    assert.equal(seq.hits[0].opts.fixedDamage, 333);
  });

  it("requires duel for summon attacks", () => {
    assert.equal(validatePlayerSummonPreSkillCombat(false).ok, false);
    assert.equal(validatePlayerSummonPreSkillCombat(true).ok, true);
  });

  it("lists pre-skills on utility bar defaults", () => {
    assert.ok(MOE_PLAYER_UTILITY_SLOT_KEYS.includes("jiriki_kaihou"));
    assert.ok(MOE_PLAYER_UTILITY_SLOT_KEYS.includes("jiriki_seiryu"));
    const order = defaultPlayerUtilitySlotOrder();
    assert.equal(order[1], "jiriki_kaihou");
    assert.equal(order[2], "jiriki_seiryu");
  });

  it("marks pre-skills done with dev-check usable", () => {
    for (const skill of MOE_PLAYER_PRE_SKILLS) {
      assert.equal(skill.status, "done");
      assert.equal(canUsePlayerPreSkill(skill, { level: 0, exp: 0 }).ok, true);
    }
  });

  it("formats combat damage lines for tooltips", () => {
    assert.match(
      formatPlayerPreSkillCombatLine(MOE_PLAYER_PRE_SKILLS[0]),
      /開火45/
    );
    assert.equal(
      formatPlayerPreSkillCombatLine(MOE_PLAYER_PRE_SKILLS[1]),
      "単発333"
    );
  });

  it("bumps summon fx seq for retrigger", () => {
    assert.deepEqual(nextMoePlayerSummonFxRequest(null, "jiriki_kaihou"), {
      skillId: "jiriki_kaihou",
      seq: 1,
    });
    assert.deepEqual(
      nextMoePlayerSummonFxRequest({ skillId: "jiriki_kaihou", seq: 3 }, "jiriki_seiryu"),
      { skillId: "jiriki_seiryu", seq: 4 }
    );
  });

  it("builds activation result in duel with enough mp", () => {
    const skill = MOE_PLAYER_PRE_SKILLS[1];
    const result = buildPlayerPreSkillActivation(skill, {
      progress: { level: 0, exp: 0 },
      casterVitals: { mp: 100, mpMax: 100 },
      inDuel: true,
      enemyId: 7,
    });
    assert.equal(result.ok, true);
    assert.equal(result.nextVitals?.mp, 50);
    assert.equal(result.sequence?.hits[0].opts.fixedDamage, 333);
  });
});

describe("external save labels", () => {
  it("maps common folder names to place labels", () => {
    assert.equal(describeMoeExternalSavePlace("Desktop"), "デスクトップ");
    assert.equal(describeMoeExternalSavePlace("Downloads"), "ダウンロードフォルダ");
    assert.equal(describeMoeExternalSavePlace("ダウンロード"), "ダウンロードフォルダ");
    assert.equal(describeMoeExternalSavePlace("Library"), "ライブラリ");
    assert.equal(describeMoeExternalSavePlace("life3d"), "life3d");
    assert.equal(
      formatMoeExternalSavePlaceStatus("Desktop"),
      "現在の保存先は、デスクトップです。"
    );
  });
});

describe("field bgm mapping", () => {
  it("maps training guide house rest camp to royalty field bgm", () => {
    assert.equal(
      moeFieldBgmTrackForMapSlot("training_guide_house"),
      MOE_BGM_TRACK.ROYALTY_FIELD
    );
  });

  it("maps altar destinations to requested tracks", () => {
    assert.equal(moeFieldBgmTrackForMapSlot("bisk"), MOE_BGM_TRACK.AMBIENT_7);
    assert.equal(
      moeFieldBgmTrackForMapSlot("elan_palace"),
      MOE_BGM_TRACK.AMBIENT_8_ELUAN
    );
    assert.equal(
      moeFieldBgmTrackForMapSlot("elvin_valley"),
      MOE_BGM_TRACK.AMBIENT_3
    );
    assert.equal(
      moeFieldBgmTrackForMapSlot("elvin_mountains"),
      MOE_BGM_TRACK.ROYALTY_CASTLE
    );
    assert.equal(
      moeFieldBgmTrackForMapSlot("slorim_plain"),
      MOE_BGM_TRACK.AMBIENT_5
    );
    assert.equal(MOE_FIELD_COMBAT_BGM, MOE_BGM_TRACK.AMBIENT_4);
  });
});

describe("macro session timer", () => {
  it("formats countdown and parses minute presets", async () => {
    const {
      formatMacroTimerClock,
      parseMacroTimerMinutes,
      MOE_MACRO_TIMER_PRESET_MINUTES,
    } = await import("../../src/lib/moeMacroSessionTimer.js");

    assert.equal(formatMacroTimerClock(599), "9:59");
    assert.equal(formatMacroTimerClock(60), "1:00");
    assert.equal(formatMacroTimerClock(0), "0:00");
    assert.equal(parseMacroTimerMinutes("10分"), 10);
    assert.equal(parseMacroTimerMinutes("30m"), 30);
    assert.deepEqual(MOE_MACRO_TIMER_PRESET_MINUTES, [10, 20, 30, 45, 60]);
  });
});

describe("AGE continent maps", () => {
  it("registers six AGE warp slots on dedicated row", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const { MOE_AGE_MAP_SLOT_IDS } = await import(
      "../../src/lib/moe3dMacro2AgeConstants.js"
    );
    const layoutSrc = readFileSync(
      join(root, "src/lib/moe3dWorldLayout.js"),
      "utf8"
    );

    assert.equal(MOE_AGE_MAP_SLOT_IDS.size, 6);
    assert.match(layoutSrc, /MOE_3D_AGE_ROW_IZ = 4/);
    assert.match(layoutSrc, /!MOE_AGE_MAP_SLOT_IDS\.has\(s\.id\)/);
    for (const id of MOE_AGE_MAP_SLOT_IDS) {
      assert.match(layoutSrc, new RegExp(`id: "${id}"[\\s\\S]*?branch: "age"`));
      assert.match(layoutSrc, new RegExp(`id: "${id}"[\\s\\S]*?warpOnly: true`));
    }
  });

  it("lists AGE destinations in altar warp group", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const altarSrc = readFileSync(join(root, "src/data/moeAltarWarps.js"), "utf8");

    assert.match(altarSrc, /id: "age", label: "AGE大陸（アルター転送）"/);
    assert.match(altarSrc, /if \(slot\.branch === "age"\) return "age"/);
    assert.match(altarSrc, /altar_yug_coast/);
    assert.match(altarSrc, /yug_coast: "🌊"/);
    assert.match(altarSrc, /mitoya_great_tree: "🌳"/);
  });

  it("places AGE hub house northwest of yug coast altar", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const houseSrc = readFileSync(
      join(root, "src/lib/moe3dAgeHubHouse.js"),
      "utf8"
    );

    assert.match(houseSrc, /altar_yug_coast/);
    assert.match(houseSrc, /AGE_HOUSE_OFF_X = -8/);
    assert.match(houseSrc, /AGE_HOUSE_OFF_Z = -7/);
  });

  it("registers soles valley AGE bath L2 L3 placeholders", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const l2Src = readFileSync(
      join(root, "src/lib/moe3dMacro2AgeL2Props.js"),
      "utf8"
    );
    const l3Src = readFileSync(
      join(root, "src/lib/moe3dMacro2AgeL3Spawns.js"),
      "utf8"
    );
    const tilesSrc = readFileSync(
      join(root, "src/lib/moe3dMacro2AgeTiles.js"),
      "utf8"
    );

    assert.match(l2Src, /propsSolesValley/);
    assert.match(l2Src, /AGE湯/);
    assert.match(l3Src, /soles_valley/);
    assert.match(l3Src, /MACRO2_AGE_L3_PLACEHOLDERS/);
    assert.match(tilesSrc, /appendMoe3dMacro2AgeL2Props/);
    assert.match(tilesSrc, /appendMoe3dMacro2AgeL3SpawnPads/);
    assert.match(tilesSrc, /AGE湯 · 渓谷の湯/);
    assert.match(tilesSrc, /localSize\.w \* 0\.5/);
  });

  it("soles valley altar layout and AGE play clamp helpers", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const altarSrc = readFileSync(
      join(root, "src/data/moeAltarWarps.js"),
      "utf8"
    );
    const slotSrc = readFileSync(
      join(root, "src/lib/moe3dMapSlotAtWorldPos.js"),
      "utf8"
    );
    assert.match(altarSrc, /soles_valley:[\s\S]*spawnOffTz: 0\.14/);
    assert.match(slotSrc, /moe3dClampFieldPlayPosition/);
    assert.match(slotSrc, /MOE_AGE_MAP_SLOT_IDS/);
  });

  it("macro-4 skill documents 20s circle cooldown", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const skill = readFileSync(
      join(root, ".cursor/skills/macro-4/SKILL.md"),
      "utf8"
    );
    assert.match(skill, /20秒/);
    assert.match(skill, /サークル間クールダウン/);
  });
});
