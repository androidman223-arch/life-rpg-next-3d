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

  it("keeps sulfur mine altar spawn outside green colliders", () => {
    const spawnX = 0;
    const spawnZ = 0.08;
    const cols = moeGreenColliderSpecs(
      MOE_SULFUR_MINE_MOUNTAINS,
      MOE_GREEN_COLLIDER_OUTSET
    );
    for (const col of cols) {
      const dx = (spawnX - col.cx) / col.rx;
      const dz = (spawnZ - col.cz) / col.rz;
      assert.ok(
        Math.hypot(dx, dz) > 1.05,
        "altar spawn must not sit inside a mountain collider"
      );
    }
  });

  it("builds climbable 3-tier peaks without green colliders", () => {
    const climbSpecs = [
      ...MOE_DESERT_PREVIEW_MOUNTAINS,
      ...MOE_SULFUR_MINE_MOUNTAINS,
      ...MOE_HATIIL_DESERT_MOUNTAINS,
      ...MOE_NEOUKU_MOUNTAIN_MOUNTAINS,
      ...MOE_NEOUKU_PLATEAU_MOUNTAINS,
      ...MOE_DARIN_MOUNTAIN_MOUNTAINS,
      ...MOE_ELVIN_MOUNTAINS_MOUNTAINS,
    ].filter((s) => s.climbable);
    assert.equal(climbSpecs.length, 9);
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
  const elanSpawns = [
    { mapSlotId: "elan_palace", key: "elan_knight_white", modelVariantId: "elan_knight_white_a" },
    { mapSlotId: "elan_palace", key: "elan_knight_black", modelVariantId: "elan_knight_black_a" },
    { mapSlotId: "elan_palace", key: "elan_knight_white", modelVariantId: "elan_knight_white_b" },
    { mapSlotId: "elan_palace", key: "elan_knight_black", modelVariantId: "elan_knight_black_b" },
  ];
  const elanRegistry = [
    {
      key: "elan_knight_white",
      mapSlotId: "elan_palace",
      modelFile: "ElanKnightWhiteA.glb",
      skills: ["チャージドスラッシュ"],
    },
    {
      key: "elan_knight_black",
      mapSlotId: "elan_palace",
      modelFile: "ElanKnightBlackA.glb",
      skills: ["チャージドスラッシュ"],
    },
  ];

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
    assert.equal(elanSpawns.length, 4);
  });
});

describe("macro1 sulfur mine official check", () => {
  const sulfurSpawns = [
    { mapSlotId: "sulfur_mine", key: "elan_knight_white", modelVariantId: "elan_knight_white_a" },
    { mapSlotId: "sulfur_mine", key: "elan_knight_black", modelVariantId: "elan_knight_black_a" },
    { mapSlotId: "sulfur_mine", key: "salamander", modelVariantId: "salamander_a" },
    { mapSlotId: "sulfur_mine", key: "elan_knight_white", modelVariantId: "elan_knight_white_b" },
    { mapSlotId: "sulfur_mine", key: "elan_knight_black", modelVariantId: "elan_knight_black_b" },
    { mapSlotId: "sulfur_mine", key: "salamander", modelVariantId: "salamander_b" },
  ];
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
