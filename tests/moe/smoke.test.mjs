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
  moe3dPickFloorTerrainY,
  moe3dPickLowestFloorTerrainY,
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

  it("cycles player1 → macro → player2 → player3 → pet → phoenix → dragon → player1", () => {
    assert.equal(cycleMoeSkillPanelMode("player1", "next"), "macro");
    assert.equal(cycleMoeSkillPanelMode("macro", "next"), "player2");
    assert.equal(cycleMoeSkillPanelMode("player2", "next"), "player3");
    assert.equal(cycleMoeSkillPanelMode("player3", "next"), "pet");
    assert.equal(cycleMoeSkillPanelMode("pet", "next"), "phoenix");
    assert.equal(cycleMoeSkillPanelMode("phoenix", "next"), "dragon");
    assert.equal(cycleMoeSkillPanelMode("dragon", "next"), "player1");
    assert.equal(cycleMoeSkillPanelMode("player1", "prev"), "dragon");
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

describe("skill set copies", () => {
  it("copies into a set without changing the source list and swaps only inside the set", async () => {
    const {
      emptyMoeSkillSetCopies,
      copyMoeSkillIntoSet,
      swapMoeSkillSetSlots,
    } = await import("../../src/lib/moeSkillSetCopies.js");
    const source = ["light", "heal"];
    let sets = emptyMoeSkillSetCopies();
    sets = copyMoeSkillIntoSet(sets, "set1", 0, {
      source: "player1",
      slotKey: "light",
    });
    sets = copyMoeSkillIntoSet(sets, "set1", 2, {
      source: "phoenix",
      slotKey: "phoenix_lv40",
    });
    assert.deepEqual(source, ["light", "heal"]);
    assert.equal(sets.set1[0].slotKey, "light");
    assert.equal(sets.set1[1], null);
    assert.equal(sets.set1[2].source, "phoenix");
    assert.equal(sets.set2[0], null);
    sets = swapMoeSkillSetSlots(sets, "set1", 0, 2);
    assert.equal(sets.set1[0].slotKey, "phoenix_lv40");
    assert.equal(sets.set1[2].slotKey, "light");
    const rejected = copyMoeSkillIntoSet(sets, "set1", 1, {
      source: "nope",
      slotKey: "x",
    });
    assert.equal(rejected.set1[1], null);
    sets = copyMoeSkillIntoSet(sets, "set2", 4, {
      source: "macro",
      slotKey: "macro:9",
    });
    assert.equal(sets.set2[4].source, "macro");
    assert.equal(sets.set2[4].slotKey, "macro:9");
    const badMacro = copyMoeSkillIntoSet(sets, "set2", 5, {
      source: "macro",
      slotKey: "macro:10",
    });
    assert.equal(badMacro.set2[5], null);
  });
});

describe("skill macro", () => {
  it("stores a skill, a 1-60 second wait, and another skill on sets 1-10", async () => {
    const {
      emptyMoeSkillMacros,
      moeSkillMacroWaitChoices,
      setMoeSkillMacroSkill,
      setMoeSkillMacroWait,
      MOE_SKILL_MACRO_COUNT,
    } = await import("../../src/lib/moeSkillMacro.js");
    assert.equal(emptyMoeSkillMacros().length, MOE_SKILL_MACRO_COUNT);
    assert.equal(moeSkillMacroWaitChoices().length, 60);
    assert.equal(moeSkillMacroWaitChoices()[0], 1);
    assert.equal(moeSkillMacroWaitChoices()[59], 60);
    let macros = emptyMoeSkillMacros();
    macros = setMoeSkillMacroSkill(macros, 0, 0, {
      source: "player1",
      slotKey: "enemy_stat_search",
    });
    macros = setMoeSkillMacroSkill(macros, 0, 1, {
      source: "phoenix",
      slotKey: "phoenix_lv20",
    });
    macros = setMoeSkillMacroWait(macros, 0, 12);
    macros = setMoeSkillMacroSkill(macros, 0, 2, {
      source: "dragon",
      slotKey: "dragon_lv20",
    });
    assert.equal(macros[0].skillA.slotKey, "enemy_stat_search");
    assert.equal(macros[0].waitSec, 12);
    assert.equal(macros[0].skillB.slotKey, "dragon_lv20");
    assert.equal(macros[1].skillA, null);
    assert.equal(MOE_SKILL_MACRO_COUNT, 10);
    macros = setMoeSkillMacroSkill(macros, 9, 0, {
      source: "player1",
      slotKey: "regen",
    });
    assert.equal(macros[9].skillA.slotKey, "regen");
    assert.equal(
      setMoeSkillMacroSkill(macros, 10, 0, {
        source: "player1",
        slotKey: "regen",
      })[9].skillA.slotKey,
      "regen"
    );
    const skipped = setMoeSkillMacroWait(macros, 0, 0);
    assert.equal(skipped[0].waitSec, 12);
    const { planMoeSkillMacroRun } = await import("../../src/lib/moeSkillMacro.js");
    assert.equal(planMoeSkillMacroRun(macros[0]).waitSec, 12);
    assert.equal(planMoeSkillMacroRun(macros[1]), null);
  });
});

describe("vertical skill panel layout", () => {
  it("clamps width and slot height", async () => {
    const {
      clampMoeVerticalSkillPanelLayout,
      moeVerticalSkillDefaultLayout,
      MOE_VERTICAL_SKILL_MIN_WIDTH,
      MOE_VERTICAL_SKILL_MIN_SLOT_HEIGHT,
    } = await import("../../src/lib/moeVerticalSkillPanelLayout.js");

    const def = moeVerticalSkillDefaultLayout();
    assert.ok(def.width >= MOE_VERTICAL_SKILL_MIN_WIDTH);
    assert.ok(def.slotHeight >= MOE_VERTICAL_SKILL_MIN_SLOT_HEIGHT);

    const clamped = clampMoeVerticalSkillPanelLayout({
      width: 20,
      slotHeight: 4,
    });
    assert.equal(clamped.width, MOE_VERTICAL_SKILL_MIN_WIDTH);
    assert.equal(clamped.slotHeight, MOE_VERTICAL_SKILL_MIN_SLOT_HEIGHT);

    const { moeVerticalSkillLabelFontPx } = await import(
      "../../src/lib/moeVerticalSkillPanelLayout.js"
    );
    assert.ok(moeVerticalSkillLabelFontPx(20) > moeVerticalSkillLabelFontPx(20, true));
    assert.ok(moeVerticalSkillLabelFontPx(24) >= 16);

    const { loadMoeVerticalSkillPanelInitialLayout } = await import(
      "../../src/lib/moeVerticalSkillPanelLayout.js"
    );
    const mockStorage = {
      store: {},
      getItem(k) {
        return this.store[k] ?? null;
      },
      setItem(k, v) {
        this.store[k] = v;
      },
    };
    globalThis.window = { localStorage: mockStorage };
    globalThis.localStorage = mockStorage;
    mockStorage.setItem(
      "life-rpg-moe-merged-skill-panel-a-layout",
      JSON.stringify({ width: 64, slotHeight: 14 })
    );
    const inherited = loadMoeVerticalSkillPanelInitialLayout(
      "life-rpg-moe-phoenix-training-skill-panel",
      ["life-rpg-moe-merged-skill-panel-a", "life-rpg-moe-merged-skill-panel-b"]
    );
    assert.equal(inherited.width, 64);
    assert.equal(inherited.slotHeight, 14);
    delete globalThis.window;
    delete globalThis.localStorage;
  });

  it("builds phoenix and dragon training vertical skill slots", async () => {
    const {
      buildPhoenixTrainingVerticalSlots,
      buildDragonTrainingVerticalSlots,
      isTrainingSkillUnlocked,
    } = await import("../../src/lib/moeTrainingSkillVerticalUi.js");

    const { MOE_TRAINING_SKILL_MODE_LEARNED } = await import(
      "../../src/lib/moeTrainingSkillSettings.js"
    );
    const onActivate = () => {};
    const phoenix = buildPhoenixTrainingVerticalSlots(
      35,
      onActivate,
      MOE_TRAINING_SKILL_MODE_LEARNED
    );
    const dragon = buildDragonTrainingVerticalSlots(
      45,
      onActivate,
      MOE_TRAINING_SKILL_MODE_LEARNED
    );

    assert.equal(phoenix.length, 9);
    assert.equal(dragon.length, 9);
    assert.equal(phoenix[0].label, "鳳凰の呼吸");
    assert.equal(phoenix[0].icon, "🧘");
    assert.equal(phoenix[0].subLabel, "整える");
    assert.equal(phoenix[3].label, "フライングフェザー");
    assert.equal(dragon[0].label, "龍神の呼吸");
    assert.equal(dragon[0].icon, "🐉");
    assert.equal(dragon[0].subLabel, "歩行");
    assert.equal(dragon[3].label, "板乗り");
    assert.equal(dragon[3].subLabel, "滑走");

    assert.equal(isTrainingSkillUnlocked({ level: 30 }, 35), true);
    assert.equal(isTrainingSkillUnlocked({ level: 40 }, 35), false);
    assert.equal(phoenix[2].disabled, false);
    assert.equal(phoenix[2].unusable, false);
    assert.equal(phoenix[3].disabled, false);
    assert.equal(phoenix[3].unusable, true);
    assert.equal(phoenix[3].active, false);
    assert.equal(typeof phoenix[3].onClick, "function");

    const phoenix40 = buildPhoenixTrainingVerticalSlots(
      40,
      onActivate,
      MOE_TRAINING_SKILL_MODE_LEARNED
    );
    assert.equal(phoenix40[3].disabled, false);
    assert.equal(phoenix40[3].unusable, false);
    assert.equal(phoenix40[3].active, true);

    assert.equal(dragon[7].label, "筋斗雲");
    assert.equal(
      buildDragonTrainingVerticalSlots(80, onActivate, MOE_TRAINING_SKILL_MODE_LEARNED)[7]
        .active,
      true
    );
    const phoenixAll = buildPhoenixTrainingVerticalSlots(
      35,
      onActivate,
      "all"
    );
    assert.equal(phoenixAll[3].unusable, false);
    assert.equal(phoenixAll[3].active, true);
  });

  it("persists skill panel visibility settings", async () => {
    const {
      loadMoeSkillPanelVisibility,
      setMoeSkillPanelVisible,
      MOE_SKILL_PANEL_LABELS,
    } = await import("../../src/lib/moeSkillPanelVisibilitySettings.js");

    const mockStorage = {
      store: {},
      getItem(k) {
        return this.store[k] ?? null;
      },
      setItem(k, v) {
        this.store[k] = v;
      },
    };
    globalThis.localStorage = mockStorage;

    const def = loadMoeSkillPanelVisibility();
    assert.equal(def.vertical1, true);
    assert.equal(def.horizontal3, true);
    assert.equal(MOE_SKILL_PANEL_LABELS.horizontal4, "横スキルUI 4");
    assert.equal(MOE_SKILL_PANEL_LABELS.verticalPhoenix, "縦スキルUI 3");

    const hidden = setMoeSkillPanelVisible(def, "vertical2", false);
    assert.equal(hidden.vertical2, false);
    assert.equal(loadMoeSkillPanelVisibility().vertical2, false);

    delete globalThis.localStorage;
  });

  it("lists modeling showcase groups by date", async () => {
    const { MOE_MODELING_SHOWCASE_GROUPS } = await import(
      "../../src/data/moeModelingShowcases.js"
    );
    assert.ok(MOE_MODELING_SHOWCASE_GROUPS.length >= 1);
    const sep27 = MOE_MODELING_SHOWCASE_GROUPS.find(
      (g) => g.dateLabel === "9月27日"
    );
    assert.ok(sep27);
    assert.equal(sep27.items.length, 2);
    assert.ok(sep27.items.some((i) => i.actionId === "dragon-lineup"));
  });

  it("persists skill panel collapse settings", async () => {
    const {
      loadMoeSkillPanelCollapse,
      setMoeSkillPanelCollapsed,
    } = await import("../../src/lib/moeSkillPanelCollapseSettings.js");

    const mockStorage = {
      store: {},
      getItem(k) {
        return this.store[k] ?? null;
      },
      setItem(k, v) {
        this.store[k] = v;
      },
    };
    globalThis.localStorage = mockStorage;

    const def = loadMoeSkillPanelCollapse();
    assert.equal(def.vertical1, false);

    const collapsed = setMoeSkillPanelCollapsed(def, "horizontal3", true);
    assert.equal(collapsed.horizontal3, true);
    assert.equal(loadMoeSkillPanelCollapse().horizontal3, true);

    delete globalThis.localStorage;
  });

  it("persists training skill mode setting", async () => {
    const {
      loadMoeTrainingSkillMode,
      saveMoeTrainingSkillMode,
      MOE_TRAINING_SKILL_MODE_LEARNED,
      moeTrainingSkillModeLabel,
    } = await import("../../src/lib/moeTrainingSkillSettings.js");

    const mockStorage = {
      store: {},
      getItem(k) {
        return this.store[k] ?? null;
      },
      setItem(k, v) {
        this.store[k] = v;
      },
    };
    globalThis.window = { localStorage: mockStorage };
    globalThis.localStorage = mockStorage;

    assert.equal(loadMoeTrainingSkillMode(), "all");
    saveMoeTrainingSkillMode(MOE_TRAINING_SKILL_MODE_LEARNED);
    assert.equal(loadMoeTrainingSkillMode(), MOE_TRAINING_SKILL_MODE_LEARNED);
    assert.equal(
      moeTrainingSkillModeLabel(MOE_TRAINING_SKILL_MODE_LEARNED),
      "習得済みのみ"
    );

    delete globalThis.window;
    delete globalThis.localStorage;
  });

  it("maps training skill buttons to field implementation keys", async () => {
    const {
      getTrainingSkillBridgeAction,
      hasTrainingSkillBridgeAction,
    } = await import("../../src/lib/moeTrainingSkillBridgeMap.js");

    assert.equal(getTrainingSkillBridgeAction("phoenix", 40)?.kind, "skill1");
    assert.equal(
      getTrainingSkillBridgeAction("phoenix", 40)?.key,
      "teleport"
    );
    assert.equal(
      getTrainingSkillBridgeAction("phoenix", 10)?.skillId,
      "jiriki_seiran"
    );
    assert.equal(
      getTrainingSkillBridgeAction("dragon", 40)?.skillId,
      "dragon_skateboard"
    );
    assert.equal(
      getTrainingSkillBridgeAction("dragon", 80)?.skillId,
      "dragon_kintoun"
    );
    assert.equal(hasTrainingSkillBridgeAction("dragon", 30), false);
    assert.equal(hasTrainingSkillBridgeAction("phoenix", 90), true);
  });

  it("places meerim bison bosses on elvin maps", async () => {
    const { MOE_MEERIM_SPECIAL_BOSS_SPAWNS } = await import(
      "../../src/data/moeMeerimEnemies.js"
    );
    assert.equal(MOE_MEERIM_SPECIAL_BOSS_SPAWNS.superBoss.mapSlotId, "elvin_mountains");
    assert.equal(MOE_MEERIM_SPECIAL_BOSS_SPAWNS.mountainBison.mapSlotId, "elvin_valley");
    assert.equal(MOE_MEERIM_SPECIAL_BOSS_SPAWNS.roughBison.mapSlotId, "elvin_valley");
    assert.notEqual(
      MOE_MEERIM_SPECIAL_BOSS_SPAWNS.roughBison.tx,
      MOE_MEERIM_SPECIAL_BOSS_SPAWNS.mountainBison.tx
    );
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

  it("picks walkable floor and ignores ceiling hits", () => {
    const hits = [
      { point: { y: 11 }, normal: { y: -1 } },
      { point: { y: 1.2 }, normal: { y: 1 } },
      { point: { y: 0.4 }, normal: { y: 1 } },
    ];
    const y = moe3dPickFloorTerrainY(hits, 4.5);
    assert.equal(y, 1.2);
  });

  it("picks lowest interior floor for warp snap", () => {
    const hits = [
      { point: { y: 11 }, normal: { y: 1 } },
      { point: { y: 1.05 }, normal: { y: 1 } },
      { point: { y: 0.8 }, normal: { y: 1 } },
    ];
    const y = moe3dPickLowestFloorTerrainY(hits, -0.5, 3.5);
    assert.equal(y, 0.8);
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

  it("wires elan palace knight GLB for 3D field", () => {
    const modelsSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moeField3DModels.js"),
      "utf8"
    );
    const canvasSrc = fs.readFileSync(
      path.join(repoRoot, "src/components/MoeField3DCanvas.jsx"),
      "utf8"
    );
    assert.match(modelsSrc, /isElanKnightEnemyKey/);
    assert.match(modelsSrc, /MOE_ELAN_KNIGHT_WHITE_A_MODEL_URL/);
    assert.match(canvasSrc, /isElanKnightEnemyKey/);
  });

  it("uses official MOE heal skill delay timers", async () => {
    const healSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moePlayerHealSkills.js"),
      "utf8"
    );
    const fieldSrc = fs.readFileSync(
      path.join(repoRoot, "src/components/MoeFieldMap.jsx"),
      "utf8"
    );
    const slotUiSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moePlayerSkillSlotUi.js"),
      "utf8"
    );
    const {
      MOE_PLAYER_HEAL_LIGHT_COOLDOWN_SEC,
      MOE_PLAYER_HEAL_HEALING_COOLDOWN_SEC,
      MOE_PLAYER_HEAL_ALL_COOLDOWN_SEC,
      MOE_PLAYER_HEAL_LIGHT_DELAY_FRAMES,
      MOE_PLAYER_HEAL_HEALING_DELAY_FRAMES,
      MOE_PLAYER_HEAL_ALL_DELAY_FRAMES,
    } = await import("../../src/lib/moePlayerHealSkills.js");

    assert.match(healSrc, /MOE_PLAYER_HEAL_LIGHT_DELAY_FRAMES = 246/);
    assert.match(healSrc, /MOE_PLAYER_HEAL_HEALING_DELAY_FRAMES = 290/);
    assert.match(healSrc, /MOE_PLAYER_HEAL_ALL_DELAY_FRAMES = 378/);
    assert.equal(MOE_PLAYER_HEAL_LIGHT_DELAY_FRAMES, 246);
    assert.equal(MOE_PLAYER_HEAL_HEALING_DELAY_FRAMES, 290);
    assert.equal(MOE_PLAYER_HEAL_ALL_DELAY_FRAMES, 378);
    assert.equal(MOE_PLAYER_HEAL_LIGHT_COOLDOWN_SEC, 4);
    assert.equal(MOE_PLAYER_HEAL_HEALING_COOLDOWN_SEC, 5);
    assert.equal(MOE_PLAYER_HEAL_ALL_COOLDOWN_SEC, 6);
    assert.match(fieldSrc, /healCdSec,/);
    assert.match(slotUiSrc, /healCdSec\.light/);
    assert.match(fieldSrc, /pushWorldHealPopup/);
    assert.match(slotUiSrc, /cooldownSec: cd > 0 \? cd : null/);
    assert.match(slotUiSrc, /moePlayerHealCooldownLabel/);
    assert.match(slotUiSrc, /moePlayerHealSkillTitle/);

    const { formatWorldHealPopupAmount } = await import(
      "../../src/lib/moeWorldHealPopup.js"
    );
    assert.equal(formatWorldHealPopupAmount(30), "30");
    assert.equal(formatWorldHealPopupAmount(45), "45");
    assert.equal(formatWorldHealPopupAmount(20, 15), null);

    const {
      MOE_PLAYER_REGEN_TICK_COUNT,
      MOE_PLAYER_REGEN_TICK_INTERVAL_SEC,
      MOE_PLAYER_REGEN_HP_PER_TICK,
      MOE_PLAYER_REGEN_DELAY_FRAMES,
      MOE_PLAYER_REGEN_EFFECT_DURATION_SEC,
      MOE_PLAYER_REGEN_COOLDOWN_SEC,
    } = await import("../../src/lib/moePlayerRegenSkill.js");
    assert.equal(MOE_PLAYER_REGEN_TICK_COUNT, 15);
    assert.equal(MOE_PLAYER_REGEN_TICK_INTERVAL_SEC, 3);
    assert.equal(MOE_PLAYER_REGEN_HP_PER_TICK, 15);
    assert.equal(MOE_PLAYER_REGEN_DELAY_FRAMES, 334);
    assert.equal(MOE_PLAYER_REGEN_EFFECT_DURATION_SEC, 42);
    assert.equal(MOE_PLAYER_REGEN_COOLDOWN_SEC, 6);
  });

  it("spawns tyrant gryphon on elvin keikoku summit", () => {
    const plannedSrc = fs.readFileSync(
      path.join(repoRoot, "src/data/maps/moeElvinKeikokuPlanned.js"),
      "utf8"
    );
    const spawnSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dMonsterMapSpawns.js"),
      "utf8"
    );
    const elvinGlbSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dElvinValleyGlb.js"),
      "utf8"
    );
    const registrySrc = fs.readFileSync(
      path.join(repoRoot, "src/data/moeMonsterFieldRegistry.js"),
      "utf8"
    );
    const lineupSrc = fs.readFileSync(
      path.join(repoRoot, "src/data/moeMonsterLineup.js"),
      "utf8"
    );

    assert.match(plannedSrc, /key: "tyrant_gryphon"/);
    assert.match(plannedSrc, /areaHp: 4934\.3/);
    assert.match(plannedSrc, /superBoss: true/);
    assert.match(plannedSrc, /mapSlotId: "elvin_keikoku"/);
    assert.match(plannedSrc, /tz: 0\.308/);
    assert.match(spawnSrc, /moeElvinKeikokuActiveSpawnSpecs/);
    assert.match(spawnSrc, /moe3dElvinKeikokuTyrantSpawnWorld/);
    assert.match(elvinGlbSrc, /x: -1488/);
    assert.match(elvinGlbSrc, /z: 324/);
    assert.match(elvinGlbSrc, /MOE_ELVIN_KEIKOKU_TYRANT_SPAWN_GROUND_Y = 21/);
    assert.match(
      registrySrc,
      /moeElvinKeikokuActiveFieldEntries\(\)\.find\(\(e\) => e\.key === key\)/
    );
    assert.match(lineupSrc, /tyrant_gryphon_a/);
  });

  it("wires elvin keikoku glb on warp row new map slot", () => {
    const elvinGlb = path.join(
      repoRoot,
      "public/assets/map/3D_MoeElvinkeikoku.glb"
    );
    assert.ok(fs.existsSync(elvinGlb));
    assert.ok(fs.statSync(elvinGlb).size > 100_000);

    const elvinSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dElvinValleyGlb.js"),
      "utf8"
    );
    const canvasSrc = fs.readFileSync(
      path.join(repoRoot, "src/components/MoeField3DCanvas.jsx"),
      "utf8"
    );
    const slotSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dMapSlotAtWorldPos.js"),
      "utf8"
    );
    const colliderSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dFieldColliders.js"),
      "utf8"
    );
    const warpSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dAltarWarp.js"),
      "utf8"
    );
    const altarSrc = fs.readFileSync(
      path.join(repoRoot, "src/data/moeAltarWarps.js"),
      "utf8"
    );
    const worldSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dWorldLayout.js"),
      "utf8"
    );

    assert.match(elvinSrc, /MOE_ELVIN_KEIKOKU_MAP_SLOT_ID = "elvin_keikoku"/);
    assert.match(elvinSrc, /MOE_ELVIN_VALLEY_GLB_URL/);
    assert.match(elvinSrc, /moe3dElvinKeikokuTerrainGroundY/);
    assert.match(elvinSrc, /moe3dElvinKeikokuSpawnWorld/);
    assert.match(elvinSrc, /MOE_ELVIN_KEIKOKU_FLOOR_MIN_Y/);
    assert.match(elvinSrc, /MOE_ELVIN_KEIKOKU_SPAWN_GROUND_Y = 1\.5/);
    assert.match(elvinSrc, /preferLowest: false/);
    assert.match(canvasSrc, /attachMoe3dElvinValleyGlb/);
    assert.match(canvasSrc, /reserved-map-\$\{MOE_ELVIN_KEIKOKU_MAP_SLOT_ID\}/);
    assert.match(canvasSrc, /moe3dElvinKeikokuTerrainGroundY/);
    assert.match(slotSrc, /moe3dIsOnElvinKeikokuField/);
    assert.match(colliderSrc, /moe3dIsOnElvinKeikokuField/);
    assert.match(warpSrc, /moe3dElvinKeikokuSpawnWorld/);
    assert.match(altarSrc, /to_elvin_keikoku/);
    assert.match(altarSrc, /【新】エルビン渓谷/);
    assert.match(worldSrc, /id: "elvin_keikoku"/);
    assert.match(worldSrc, /新エルビン渓谷/);
  });

  it("wires sulfur kazan temple glb and warp spawn layout", () => {
    const kazanGlb = path.join(repoRoot, "public/assets/map/3D_MoeKazan1map.glb");
    assert.ok(fs.existsSync(kazanGlb));
    assert.ok(fs.statSync(kazanGlb).size > 100_000);

    const kazanSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dSulfurKazanTemple.js"),
      "utf8"
    );
    const reservedSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dReservedMapTile.js"),
      "utf8"
    );
    const canvasSrc = fs.readFileSync(
      path.join(repoRoot, "src/components/MoeField3DCanvas.jsx"),
      "utf8"
    );
    const altarSrc = fs.readFileSync(
      path.join(repoRoot, "src/data/moeAltarWarps.js"),
      "utf8"
    );
    const warpSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dAltarWarp.js"),
      "utf8"
    );

    assert.match(kazanSrc, /MOE_SULFUR_KAZAN_MAP_SLOT_ID = "sulfur_kazan_temple"/);
    assert.match(kazanSrc, /MOE_SULFUR_KAZAN_INDOOR_SPAWN_GROUND_Y = 1/);
    assert.doesNotMatch(kazanSrc, /MOE_SULFUR_KAZAN_TEMPLE_MESH_Y_OFFSET/);
    assert.match(kazanSrc, /moe3dSlotSpawnWorld\([\s\S]*MOE_SULFUR_KAZAN_MAP_SLOT_ID/);
    assert.match(kazanSrc, /moe3dSulfurKazanTerrainGroundY/);
    assert.match(kazanSrc, /moe3dSulfurKazanWalkWorldRect/);
    assert.match(kazanSrc, /moe3dClampSulfurKazanWalkPosition/);
    assert.match(kazanSrc, /preferLowest: teleportSnap/);
    assert.match(canvasSrc, /moe3dSulfurKazanTerrainGroundY/);
    assert.match(reservedSrc, /MOE_SULFUR_KAZAN_MAP_SLOT_ID/);
    assert.match(reservedSrc, /appendSulfurMineMazeMeshes/);
    assert.match(reservedSrc, /moe3dInvalidateTerrainRaycastCache/);
    assert.match(canvasSrc, /attachMoe3dSulfurKazanTemple/);
    assert.match(canvasSrc, /moe3dInvalidateTerrainRaycastCache/);
    assert.match(altarSrc, /【新】スルト鉱山 · 火山神殿/);
    assert.match(altarSrc, /スルト鉱山 · アルター/);
    assert.match(warpSrc, /moe3dSulfurKazanIndoorSpawnWorld/);
    assert.match(warpSrc, /MOE_SULFUR_KAZAN_MAP_SLOT_ID/);

    const worldSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dWorldLayout.js"),
      "utf8"
    );
    assert.match(worldSrc, /id: "sulfur_kazan_temple"/);
    assert.match(worldSrc, /新スルト鉱山（火山神殿）/);

    const altarWarpSrc = fs.readFileSync(
      path.join(repoRoot, "src/data/moeAltarWarps.js"),
      "utf8"
    );
    const compassSrc = fs.readFileSync(
      path.join(repoRoot, "src/components/MoeField3DCompassHud.jsx"),
      "utf8"
    );
    assert.match(altarWarpSrc, /id: "newmap", label: "新マップ"/);
    assert.match(altarWarpSrc, /group: "newmap"/);
    assert.match(compassSrc, /formatMoe3dCoordLabel\(x, y, groundZ\)/);
    assert.match(compassSrc, /z\$\{formatMoe3dCoordAxis\(groundZ\)\}/);
  });
});

describe("altar warp spawn placement", () => {
  it("clamps sulfur kazan warp spawn to map slot rect", () => {
    const fieldSrc = fs.readFileSync(
      path.join(repoRoot, "src/components/MoeFieldMap.jsx"),
      "utf8"
    );
    const slotSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dMapSlotAtWorldPos.js"),
      "utf8"
    );
    assert.match(fieldSrc, /MOE_SULFUR_KAZAN_MAP_SLOT_ID[\s\S]*moe3dClampToMapSlotRect/);
    assert.match(slotSrc, /moe3dIsOnSulfurKazanField/);
    assert.match(slotSrc, /全体 terrain bbox/);
  });

  it("clamps AGE warp destinations to map slot rect", () => {
    const fieldSrc = fs.readFileSync(
      path.join(repoRoot, "src/components/MoeFieldMap.jsx"),
      "utf8"
    );
    const slotSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moe3dMapSlotAtWorldPos.js"),
      "utf8"
    );
    assert.match(fieldSrc, /moe3dWarpDestSpawnWorld\(dest, tw, td/);
    assert.match(fieldSrc, /moe3dClampToPlayBounds\(spawn\.x, spawn\.y, bounds/);
    assert.match(fieldSrc, /MOE_AGE_MAP_SLOT_IDS\.has\(dest\.mapSlotId\)/);
    assert.doesNotMatch(fieldSrc, /moe3dWarpDestPlayerPosition/);
    assert.match(slotSrc, /MOE_AGE_MAP_SLOT_IDS\.has\(slotId\)/);
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

  it("has eisis spider GLB assets wired for 3D field", () => {
    const glbDir = path.join(repoRoot, "public/assets/models/monster");
    for (const file of ["ElvinSpiderA.glb", "ElvinSpiderB.glb"]) {
      const full = path.join(glbDir, file);
      assert.ok(fs.existsSync(full), `missing ${file}`);
      assert.ok(fs.statSync(full).size > 1000, `${file} too small`);
    }
    const modelsSrc = fs.readFileSync(
      path.join(repoRoot, "src/lib/moeField3DModels.js"),
      "utf8"
    );
    assert.match(modelsSrc, /isSpiderEnemyKey/);
    assert.match(modelsSrc, /great_tarantula/);
    const variantB = MOE_MONSTER_LINEUP.find((v) => v.id === "great_tarantula_b");
    assert.equal(variantB?.file, "ElvinSpiderB.glb");
  });
});

describe("macro1 bisk official check", () => {
  const biskSpawns = [
    { mapSlotId: "bisk", key: "bisk_ixion_water", modelVariantId: "bisk_ixion_water_a" },
    { mapSlotId: "bisk", key: "bisk_ixion_water", modelVariantId: "bisk_ixion_water_b" },
  ];
  const biskRegistry = [
    {
      key: "bisk_ixion_water",
      mapSlotId: "bisk",
      modelFile: "StrayIxion.glb",
      skills: ["ウォーターガン", "パンチ"],
    },
  ];

  it("passes wiki spawn and registry official checks", () => {
    const wiki = MOE_MACRO1_PHASE3_AREA_WIKI.bisk;
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    assert.deepEqual(
      moeMacro1OfficialSpawnIssues("bisk", biskSpawns, wiki, variantIds),
      []
    );
    assert.deepEqual(moeMacro1RegistryIssues(biskRegistry, "bisk"), []);
  });

  it("keeps bisk ixion spawns clear of altar warp spawn", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const spawnSrc = readFileSync(
      join(root, "src/data/maps/moeBiskPlanned.js"),
      "utf8"
    );
    const mapSpawnsSrc = readFileSync(
      join(root, "src/lib/moe3dMonsterMapSpawns.js"),
      "utf8"
    );
    const warpSrc = readFileSync(join(root, "src/lib/moe3dAltarWarp.js"), "utf8");

    assert.match(mapSpawnsSrc, /moe3dClearSpawnFromAltarPlayer/);
    assert.match(warpSrc, /MOE_ALTAR_SPAWN_CLEAR_NORM = 0\.28/);
    assert.match(warpSrc, /moe3dClearSpawnFromAltarPlayer/);
    assert.match(spawnSrc, /tz: 0\.66/);
    assert.match(spawnSrc, /tz: 0\.62/);

    const minClear = 0.28;
    const spawnTx = 0.5;
    const spawnTz = 0.54;
    const specs = [
      { tx: 0.34, tz: 0.66 },
      { tx: 0.66, tz: 0.62 },
    ];
    for (const spec of specs) {
      const dx = spec.tx - spawnTx;
      const dz = spec.tz - spawnTz;
      const dist = Math.hypot(dx, dz);
      const cleared =
        dist >= minClear
          ? spec
          : dist < 0.001
            ? { tx: spawnTx + minClear * 0.55, tz: spawnTz + minClear * 0.85 }
            : {
                tx: spawnTx + (dx * minClear) / dist,
                tz: spawnTz + (dz * minClear) / dist,
              };
      assert.ok(
        Math.hypot(cleared.tx - spawnTx, cleared.tz - spawnTz) >= minClear - 0.001
      );
    }
  });
});

describe("macro1 yug coast official check", () => {
  const yugSpawns = [
    { mapSlotId: "yug_coast", key: "yug_sea_snake", modelVariantId: "sea_snake_a" },
    { mapSlotId: "yug_coast", key: "yug_sea_snake", modelVariantId: "sea_snake_a" },
  ];
  const yugRegistry = [
    {
      key: "yug_sea_snake",
      mapSlotId: "yug_coast",
      modelFile: "SeaSnakeA.glb",
      skills: ["同族リンク"],
    },
  ];
  const yugWiki = { officialEnemies: ["海ヘビ"] };

  it("passes wiki spawn and registry official checks", () => {
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    assert.deepEqual(
      moeMacro1OfficialSpawnIssues("yug_coast", yugSpawns, yugWiki, variantIds),
      []
    );
    assert.deepEqual(moeMacro1RegistryIssues(yugRegistry, "yug_coast"), []);
  });
});

describe("macro1 soles valley official check", () => {
  const solesSpawns = [
    {
      mapSlotId: "soles_valley",
      key: "soles_rescue_hound",
      modelVariantId: "rescue_hound_a",
    },
  ];
  const solesRegistry = [
    {
      key: "soles_rescue_hound",
      mapSlotId: "soles_valley",
      modelFile: "RescueHoundA.glb",
      skills: ["噛み付き"],
    },
  ];
  const solesWiki = { officialEnemies: ["レスクール ハウンド"] };

  it("passes wiki spawn and registry official checks", () => {
    const variantIds = new Set(MOE_MONSTER_LINEUP.map((v) => v.id));
    assert.deepEqual(
      moeMacro1OfficialSpawnIssues("soles_valley", solesSpawns, solesWiki, variantIds),
      []
    );
    assert.deepEqual(moeMacro1RegistryIssues(solesRegistry, "soles_valley"), []);
  });
});

describe("macro1 elvin mountains official check", () => {
  const mountainSpawns = [
    { mapSlotId: "elvin_mountains", key: "elvin_mount_wolf", modelVariantId: "elvin_wolf_a" },
    { mapSlotId: "elvin_mountains", key: "elvin_mount_bison", modelVariantId: "elvin_bison_a" },
    { mapSlotId: "elvin_mountains", key: "pygmy_gryphon", modelVariantId: "pygmy_gryphon_a" },
    { mapSlotId: "elvin_mountains", key: "soil_basilisk", modelVariantId: "soil_basilisk_a" },
    { mapSlotId: "elvin_mountains", key: "auzun_bura" },
  ];
  const mountainRegistry = [
    { key: "elvin_mount_wolf", mapSlotId: "elvin_mountains", modelFile: "ElvinWolfA.glb", skills: ["噛み付き"] },
    { key: "elvin_mount_bison", mapSlotId: "elvin_mountains", modelFile: "ElvinBisonA.glb", skills: ["ホーン チャージ"] },
    { key: "pygmy_gryphon", mapSlotId: "elvin_mountains", modelFile: "PygmyGryphonA.glb", skills: ["噛み付き"] },
    { key: "soil_basilisk", mapSlotId: "elvin_mountains", modelFile: "SoilBasiliskA.glb", skills: ["ポイズン テイル"] },
    { key: "auzun_bura", mapSlotId: "elvin_mountains", modelFile: "Bison01.glb", skills: ["ホーン チャージ"] },
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

  it("shows empty AGE map headings when includeEmptyAgeSections", () => {
    const ageIds = new Set(["yug_coast", "geo_abyss_ne"]);
    const sections = moePetTrainingGuideSectionsFromEntries(
      [],
      [
        { id: "yug_coast", nameJa: "ユグ海岸" },
        { id: "geo_abyss_ne", nameJa: "ゲオ深淵（北東）" },
        { id: "bisk", nameJa: "城下町ビスク" },
      ],
      { includeEmptyAgeSections: true, ageMapSlotIds: ageIds }
    );
    const yug = sections.find((s) => s.mapSlotId === "yug_coast");
    assert.ok(yug);
    assert.equal(yug.empty, true);
    assert.equal(yug.areaJa, "ユグ海岸");
    assert.ok(sections.find((s) => s.mapSlotId === "geo_abyss_ne"));
    assert.equal(sections.some((s) => s.mapSlotId === "bisk"), false);
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
    assert.equal(player.filter(Boolean).length, 4);
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
      petRegenHp: 15,
      petRegenMp: 0,
      petRegenIntervalSec: 3,
    });
    assert.equal(on[0]?.id, "pet_regen");
    assert.equal(on[0]?.icon, "🍃");
    assert.match(on[0]?.label, /3秒ごと HP\+15/);
    assert.doesNotMatch(on[0]?.label ?? "", /MP\+/);
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

describe("player status ui", () => {
  it("builds trainer vitals and skill2 view", async () => {
    const { buildMoePlayerStatusView, moePlayerSkillExpBarPct } = await import(
      "../../src/lib/moePlayerStatusUi.js"
    );
    const view = buildMoePlayerStatusView({
      trainerStatus: { level: 3, job: "勇者", exp: 120, nextExp: 1000 },
      playerVitals: {
        hp: 80,
        hpMax: 124,
        mp: 50,
        mpMax: 112,
        stamina: 90,
        staminaMax: 100,
      },
      playerSkill2Progress: { level: 12.3, exp: 45 },
      playerPreSkillProgress: { jiriki_kaihou: { level: 0, exp: 0 } },
      playerBuffStrip: [],
      skill2Catalog: [
        { id: "jiriki_seiran", name: "自力整然", level: 10 },
        { id: "phoenix_deep_sleep", name: "深睡眠眠", level: 80 },
      ],
    });
    assert.equal(view.trainerLevel, 3);
    assert.equal(view.skill2.level, 12.3);
    assert.equal(view.skill2.expMax, 100);
    assert.equal(view.phoenixSkills.length, 2);
    assert.ok(view.preSkills.length > 0);
    assert.equal(moePlayerSkillExpBarPct(45), 45);
    assert.ok(view.tips.length >= 3);
  });
});

describe("phoenix deep sleep", () => {
  it("chants 5 seconds and restores pet MP ratio", async () => {
    const {
      MOE_PHOENIX_DEEP_SLEEP_CHANT_SEC,
      applyMoePhoenixDeepSleepMp,
      isMoePhoenixDeepSleepChant,
    } = await import("../../src/lib/moePhoenixDeepSleep.js");
    const { moePhoenixPlayerChantSec } = await import(
      "../../src/lib/moePhoenixPlayerSkill.js"
    );
    const skill = { id: "phoenix_deep_sleep", mpRestoreRatio: 0.45 };
    assert.equal(MOE_PHOENIX_DEEP_SLEEP_CHANT_SEC, 5);
    assert.equal(moePhoenixPlayerChantSec(skill), 5);
    assert.equal(moePhoenixPlayerChantSec({ id: "phoenix_ansleep_walk" }), 3);
    const { pet, gain } = applyMoePhoenixDeepSleepMp({ mp: 10, mpMax: 100 });
    assert.equal(gain, 45);
    assert.equal(pet.mp, 55);
    assert.equal(
      isMoePhoenixDeepSleepChant({
        skillId: "phoenix_deep_sleep",
        kind: "phoenix",
      }),
      true
    );
    assert.equal(
      isMoePhoenixDeepSleepChant({ kind: "pet_deep_sleep" }),
      true
    );
    assert.equal(isMoePhoenixDeepSleepChant(null), false);
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

describe("player skill success rate", () => {
  it("matches MOE-style anchors at required 40", async () => {
    const { resetMoePlayerSkillSuccess100Cache } = await import(
      "../../src/lib/moePlayerSkillSuccessSettings.js"
    );
    resetMoePlayerSkillSuccess100Cache();
    const { moeSkillSuccessRate } = await import(
      "../../src/lib/moePlayerSkillSuccessRate.js"
    );
    assert.equal(moeSkillSuccessRate(46, 40), 0.8);
    assert.equal(moeSkillSuccessRate(48, 40), 0.99);
    assert.equal(moeSkillSuccessRate(40, 40), 0.5);
  });

  it("forces 100% when setting is enabled", async () => {
    const {
      saveMoePlayerSkillSuccess100,
      resetMoePlayerSkillSuccess100Cache,
    } = await import("../../src/lib/moePlayerSkillSuccessSettings.js");
    const { rollMoeSkillSuccess, moeSkillSuccessRate } = await import(
      "../../src/lib/moePlayerSkillSuccessRate.js"
    );

    const mockStorage = {
      store: {},
      getItem(k) {
        return this.store[k] ?? null;
      },
      setItem(k, v) {
        this.store[k] = v;
      },
    };
    globalThis.localStorage = mockStorage;
    resetMoePlayerSkillSuccess100Cache();
    saveMoePlayerSkillSuccess100(true);

    assert.equal(moeSkillSuccessRate(1, 40), 1);
    const roll = rollMoeSkillSuccess(1, 40, () => 0.99);
    assert.equal(roll.ok, true);
    assert.equal(roll.ratePct, 100);

    saveMoePlayerSkillSuccess100(false);
    resetMoePlayerSkillSuccess100Cache();
    delete globalThis.localStorage;
  });
});

describe("phoenix training memos", () => {
  it("ships rest guide, forbidden rules, and reflection kinds", async () => {
    const {
      getMoePhoenixTrainingDefaultMemos,
      MOE_PHOENIX_BUTTON_SUB_HINT,
      MOE_PHOENIX_REFLECTION_KINDS,
      MOE_PHOENIX_REST_SUB_HINT,
    } = await import("../../src/lib/moePhoenixTrainingMemos.js");
    const memos = getMoePhoenixTrainingDefaultMemos();
    assert.ok(memos.forbidden.includes("YouTube"));
    assert.ok(memos.forbidden.includes("夜の学び"));
    assert.ok(memos.rest.includes("がんばりすぎない"));
    assert.ok(MOE_PHOENIX_REST_SUB_HINT.includes("体を壊"));
    assert.ok(MOE_PHOENIX_BUTTON_SUB_HINT.includes("ALL OK"));
    assert.ok(MOE_PHOENIX_REFLECTION_KINDS.includes("phoenix"));
  });
});

describe("altar tomorrow memo", () => {
  it("supports free-form entries and migrates legacy slots", async () => {
    const {
      normalizeTomorrowMemoState,
      countTomorrowMemoDone,
      appendTomorrowMemoEntry,
    } = await import("../../src/lib/moeTomorrowMemo.js");
    const state = normalizeTomorrowMemoState({
      panelOpen: true,
      slots: [
        { text: "a", done: true },
        { text: "b", done: false },
      ],
    });
    assert.ok(state.entries.length >= 2);
    assert.equal(countTomorrowMemoDone(state), 1);
    assert.equal(state.entries[0].text, "a");
    const added = appendTomorrowMemoEntry(state, "new");
    assert.equal(added.entries.length, state.entries.length + 1);
  });
});

describe("dragon skateboard skill", () => {
  it("boosts ground speed and dash on skateboard", async () => {
    const {
      MOE_SKATEBOARD_DASH_EXTRA_MULT,
      MOE_SKATEBOARD_WALK_SPEED_MULT,
      moeSkateboardMoveSpeedMult,
    } = await import("../../src/lib/moeDragonSkateboard.js");
    assert.equal(moeSkateboardMoveSpeedMult(false, false), 1);
    assert.equal(
      moeSkateboardMoveSpeedMult(false, true),
      MOE_SKATEBOARD_WALK_SPEED_MULT
    );
    assert.equal(
      moeSkateboardMoveSpeedMult(true, true),
      MOE_SKATEBOARD_WALK_SPEED_MULT * MOE_SKATEBOARD_DASH_EXTRA_MULT
    );
  });

  it("rushes skateboard in then mounts", async () => {
    const {
      beginSkateboardApproach,
      tickSkateboardApproach,
      MOE_SKATEBOARD_APPROACH_START_DIST,
    } = await import("../../src/lib/moeDragonSkateboard.js");
    const state = beginSkateboardApproach(0);
    assert.ok(
      Math.hypot(state.ox, state.oz) >= MOE_SKATEBOARD_APPROACH_START_DIST - 1
    );
    let jumped = false;
    let done = false;
    for (let i = 0; i < 260 && !done; i += 1) {
      const step = tickSkateboardApproach(state, 0.016);
      if (step.triggerJump) jumped = true;
      if (step.done) done = true;
    }
    assert.ok(jumped);
    assert.ok(done);
    assert.equal(state.ox, 0);
    assert.equal(state.oz, 0);
  });

  it("places pet ride slot behind player on skateboard", async () => {
    const {
      skateboardPetRideSlot,
      MOE_SKATEBOARD_PET_BEHIND_DIST,
    } = await import("../../src/lib/moeDragonSkateboard.js");
    const slot = skateboardPetRideSlot(10, 20, 0);
    assert.ok(Math.abs(slot.x - 10) < 0.01);
    assert.ok(Math.abs(slot.y - (20 - MOE_SKATEBOARD_PET_BEHIND_DIST)) < 0.01);
  });
});

describe("dragon kintoun skill", () => {
  it("doubles walk speed and quadruples dash without shinsoku", async () => {
    const {
      MOE_KINTOUN_DASH_EXTRA_MULT,
      MOE_KINTOUN_WALK_SPEED_MULT,
      moeKintounMoveSpeedMult,
      MOE_KINTOUN_FLY_HEIGHT,
      tickKintounFlyOffset,
    } = await import("../../src/lib/moeDragonKintoun.js");
    assert.equal(moeKintounMoveSpeedMult(false, false), 1);
    assert.equal(moeKintounMoveSpeedMult(false, true), MOE_KINTOUN_WALK_SPEED_MULT);
    assert.equal(
      moeKintounMoveSpeedMult(true, true),
      MOE_KINTOUN_WALK_SPEED_MULT * MOE_KINTOUN_DASH_EXTRA_MULT
    );
    assert.ok(MOE_KINTOUN_FLY_HEIGHT >= 24);
    assert.ok(tickKintounFlyOffset(0, true, 1) > 0);
    assert.equal(tickKintounFlyOffset(MOE_KINTOUN_FLY_HEIGHT, false, 1), 0);
  });

  it("grants stealth while kintoun is high enough", async () => {
    const { isMoeKintounStealthActive, MOE_KINTOUN_STEALTH_MIN_ALTITUDE } =
      await import("../../src/lib/moeDragonKintoun.js");
    const { buildMoeEnemyDetectionOpts } = await import(
      "../../src/lib/moePlayerStealth.js"
    );
    assert.equal(isMoeKintounStealthActive(true, 0), false);
    assert.equal(
      isMoeKintounStealthActive(true, MOE_KINTOUN_STEALTH_MIN_ALTITUDE),
      true
    );
    const opts = buildMoeEnemyDetectionOpts({
      kintounOn: true,
      kintounFlyY: MOE_KINTOUN_STEALTH_MIN_ALTITUDE + 1,
    });
    assert.equal(opts.stealthFull, true);
  });

  it("places pet ride slot behind player on kintoun", async () => {
    const {
      kintounPetRideSlot,
      MOE_KINTOUN_PET_BEHIND_DIST,
    } = await import("../../src/lib/moeDragonKintoun.js");
    const slot = kintounPetRideSlot(10, 20, 0);
    assert.ok(Math.abs(slot.x - 10) < 0.01);
    assert.ok(Math.abs(slot.y - (20 - MOE_KINTOUN_PET_BEHIND_DIST)) < 0.01);
  });

  it("rushes kintoun cloud in then mounts", async () => {
    const {
      beginKintounApproach,
      tickKintounApproach,
      MOE_KINTOUN_APPROACH_START_DIST,
    } = await import("../../src/lib/moeDragonKintoun.js");
    const state = beginKintounApproach(0);
    assert.ok(Math.hypot(state.ox, state.oz) >= MOE_KINTOUN_APPROACH_START_DIST - 1);
    let jumped = false;
    let done = false;
    for (let i = 0; i < 240 && !done; i += 1) {
      const step = tickKintounApproach(state, 0.016);
      if (step.triggerJump) jumped = true;
      if (step.done) done = true;
    }
    assert.ok(jumped);
    assert.ok(done);
    assert.equal(state.ox, 0);
    assert.equal(state.oz, 0);
  });

  it("unlocks kintoun at dragon practice Lv80", async () => {
    const { buildPlayerDragonSkillById } = await import(
      "../../src/data/moePlayerDragonSkills.js"
    );
    assert.equal(buildPlayerDragonSkillById(79).dragon_kintoun, undefined);
    assert.equal(buildPlayerDragonSkillById(80).dragon_kintoun?.name, "筋斗雲");
  });

  it("unlocks board ride at trainer Lv30 or dragon Lv40", async () => {
    const {
      buildPlayerDragonSkillById,
      isDragonSkateboardUnlocked,
    } = await import("../../src/data/moePlayerDragonSkills.js");
    assert.equal(isDragonSkateboardUnlocked(0, { trainerLevel: 29 }), false);
    assert.equal(isDragonSkateboardUnlocked(0, { trainerLevel: 30 }), true);
    assert.equal(buildPlayerDragonSkillById(0, { trainerLevel: 30 }).dragon_skateboard?.name, "板乗り");
    assert.equal(buildPlayerDragonSkillById(39).dragon_skateboard, undefined);
    assert.equal(buildPlayerDragonSkillById(40).dragon_skateboard?.name, "板乗り");
  });

  it("migrates shinsoku slot key to board ride", async () => {
    const { migratePlayerSkillSlotKey, defaultPlayerSkillSlotOrder } =
      await import("../../src/data/moePlayerSkillSlotOrder.js");
    assert.equal(migratePlayerSkillSlotKey("ninja_shinsoku"), "dragon_skateboard");
    assert.equal(defaultPlayerSkillSlotOrder()[0], "enemy_stat_search");
    assert.equal(defaultPlayerSkillSlotOrder()[1], "worship_nature");
    assert.equal(defaultPlayerSkillSlotOrder()[5], "soul_master");
    assert.equal(defaultPlayerSkillSlotOrder().includes("light"), false);
    assert.equal(defaultPlayerSkillSlotOrder().length, 10);
  });

  it("lists nine dragon skill get entries", async () => {
    const { MOE_DRAGON_SKILL_GET_CATALOG } = await import(
      "../../src/data/moeDragonSkillGetCatalog.js"
    );
    assert.equal(MOE_DRAGON_SKILL_GET_CATALOG.length, 9);
    assert.equal(MOE_DRAGON_SKILL_GET_CATALOG[0].name, "龍神の呼吸");
    assert.equal(MOE_DRAGON_SKILL_GET_CATALOG[3].name, "板乗り");
    assert.equal(MOE_DRAGON_SKILL_GET_CATALOG[7].name, "筋斗雲");
  });
});

describe("phoenix skill get catalog", () => {
  it("lists nine phoenix skill get entries", async () => {
    const { MOE_PHOENIX_SKILL_GET_CATALOG } = await import(
      "../../src/data/moePhoenixSkillGetCatalog.js"
    );
    assert.equal(MOE_PHOENIX_SKILL_GET_CATALOG.length, 9);
    assert.equal(MOE_PHOENIX_SKILL_GET_CATALOG[0].name, "鳳凰の呼吸");
    assert.equal(MOE_PHOENIX_SKILL_GET_CATALOG[3].name, "フライングフェザー");
    assert.equal(MOE_PHOENIX_SKILL_GET_CATALOG[8].name, "フェニックス");
  });
});

describe("dragon training", () => {
  it("awards dragon exp on session complete", async () => {
    const {
      completeDragonTrainingSession,
      defaultDragonTrainingState,
      formatDragonTrainingDuration,
    } = await import("../../src/lib/moeDragonTraining.js");
    assert.equal(formatDragonTrainingDuration(125), "2分5秒");
    const base = {
      ...defaultDragonTrainingState(),
      accumulatedSec: 120,
      checked: { hunt: true, challenge: true },
    };
    const result = completeDragonTrainingSession(base, 1_700_000_000_000);
    assert.ok(result.gainAmount > 0);
    assert.ok(result.toastLines.some((l) => l.includes("龍修行EXP")));
    assert.equal(result.state.dragonTotalSec, 120);
  });

  it("toggles unified dragon timer", async () => {
    const {
      MOE_DRAGON_BUTTON_SUB_HINT,
      defaultDragonTrainingState,
      toggleDragonTrainingTimer,
    } = await import("../../src/lib/moeDragonTraining.js");
    assert.ok(MOE_DRAGON_BUTTON_SUB_HINT.includes("運動する"));
    const started = toggleDragonTrainingTimer(defaultDragonTrainingState(), 1000);
    assert.equal(started.timerRunning, true);
    const stopped = toggleDragonTrainingTimer(started, 7000);
    assert.equal(stopped.timerRunning, false);
    assert.ok(stopped.accumulatedSec >= 6);
  });

  it("grants live dragon exp every 6 seconds", async () => {
    const {
      MOE_DRAGON_EXP_PER_TICK,
      calcDragonSessionExpGain,
      defaultDragonTrainingState,
      formatDragonBonusRemain,
      formatDragonCurrentSec,
      startDragonTrainingTimer,
      tickDragonSessionExp,
    } = await import("../../src/lib/moeDragonTraining.js");
    const started = startDragonTrainingTimer(defaultDragonTrainingState(), 1000);
    const ticked = tickDragonSessionExp(started, 7000);
    assert.equal(ticked.gainAmount, MOE_DRAGON_EXP_PER_TICK);
    assert.equal(ticked.state.sessionExpTicksClaimed, 1);
    assert.equal(calcDragonSessionExpGain(12), 0.2);
    assert.equal(formatDragonCurrentSec(0), "0秒");
    assert.equal(formatDragonBonusRemain(defaultDragonTrainingState()), "ボーナスまで60分");
  });
});

describe("player experience storage", () => {
  it("normalizes proficiency tracks", async () => {
    const {
      defaultPlayerExperience,
      normalizePlayerExperience,
      awardHealProficiencyOnUse,
    } = await import("../../src/lib/moePlayerExperience.js");
    const base = defaultPlayerExperience();
    assert.equal(base.phoenix.level, 0);
    assert.ok(base.preSkills.jiriki_kaihou);
    const normalized = normalizePlayerExperience({
      phoenix: { level: 12.3, exp: 45 },
      heal: { level: 5, exp: 20 },
    });
    assert.equal(normalized.phoenix.level, 12.3);
    assert.equal(normalized.heal.exp, 20);
    const originalRandom = Math.random;
    Math.random = () => 0;
    const award = awardHealProficiencyOnUse({ level: 0, exp: 0 }, 40);
    Math.random = originalRandom;
    assert.equal(award.gained, true);
    assert.ok(award.progress.exp > 0 || award.progress.level > 0);
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

  it("builds habit ascension 5x7 then 3x3 fire hits", () => {
    const seq = resolvePhoenixHabitAscensionSequence({
      combatPhase1Damage: 7,
      combatPhase1Hits: 5,
      combatPhase2Damage: 3,
      combatPhase2Hits: 3,
      combatStepMs: 350,
    });
    assert.equal(seq.hits.length, 8);
    assert.equal(seq.hits[0].opts.fixedDamage, 7);
    assert.equal(seq.hits[7].opts.fixedDamage, 3);
    assert.equal(seq.hits[7].opts.grantExp, true);
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
  it("builds kaihou 5x7 then 3x3 fire hits", () => {
    const seq = resolveJirikiKaihouSequence(MOE_PLAYER_PRE_SKILLS[0]);
    assert.equal(seq.hits.length, 8);
    assert.equal(seq.hits[0].opts.fixedDamage, 7);
    assert.equal(seq.hits[4].opts.fixedDamage, 7);
    assert.equal(seq.hits[5].opts.fixedDamage, 3);
    assert.equal(seq.hits[7].opts.fixedDamage, 3);
    assert.equal(seq.hits[7].opts.grantExp, true);
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
    assert.equal(order[0], "jiriki_kaihou");
    assert.equal(order[1], "jiriki_seiryu");
    assert.equal(order.includes("enemy_stat_search"), false);
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
      /炎5×7＋炎3×3/
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
    assert.equal(
      moeFieldBgmTrackForMapSlot("yug_coast"),
      MOE_BGM_TRACK.AMBIENT_5
    );
    assert.equal(
      moeFieldBgmTrackForMapSlot("soles_valley"),
      MOE_BGM_TRACK.AMBIENT_3
    );
    assert.equal(MOE_FIELD_COMBAT_BGM, MOE_BGM_TRACK.AMBIENT_4);
  });
});

describe("field prefetch boot", () => {
  it("starts prefetch only from boot component", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const prefetchSrc = readFileSync(
      join(root, "src/lib/moeFieldPrefetch.js"),
      "utf8"
    );
    const bootSrc = readFileSync(
      join(root, "src/components/MoeFieldPrefetchBoot.jsx"),
      "utf8"
    );
    const gateSrc = readFileSync(
      join(root, "src/components/MoeFieldMapGate.jsx"),
      "utf8"
    );
    const canvasSrc = readFileSync(
      join(root, "src/components/MoeField3DCanvas.jsx"),
      "utf8"
    );

    assert.doesNotMatch(prefetchSrc, /\nstartMoeFieldPrefetch\(\)/);
    assert.doesNotMatch(prefetchSrc, /\nprefetchMoeFieldMap\(\)/);
    assert.match(bootSrc, /startMoeFieldPrefetch\(\)/);
    assert.match(gateSrc, /getMoeFieldPrefetchState/);
    assert.doesNotMatch(gateSrc, /startMoeFieldPrefetch/);
    assert.match(canvasSrc, /triggerGeoAbyssLavaRipple/);
    assert.match(canvasSrc, /moeGeoLavaClickFromObject/);
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
    assert.equal(parseMacroTimerMinutes("5分"), 5);
    assert.equal(parseMacroTimerMinutes("10分"), 10);
    assert.equal(parseMacroTimerMinutes("30m"), 30);
    assert.deepEqual(MOE_MACRO_TIMER_PRESET_MINUTES, [5, 10, 20, 30, 45, 60]);
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

  it("treats yug to mitoya as age home row without field enemies", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const ageConst = readFileSync(
      join(root, "src/lib/moe3dMacro2AgeConstants.js"),
      "utf8"
    );
    const yugSrc = readFileSync(
      join(root, "src/data/maps/moeYugCoastPlanned.js"),
      "utf8"
    );
    const mitoyaSrc = readFileSync(
      join(root, "src/data/maps/moeMitoyaGreatTreePlanned.js"),
      "utf8"
    );
    const l2Src = readFileSync(
      join(root, "src/lib/moe3dMacro2AgeL2Props.js"),
      "utf8"
    );
    const l4Src = readFileSync(
      join(root, "src/lib/moe3dMacro2AgeL4Fx.js"),
      "utf8"
    );

    assert.match(ageConst, /MOE_AGE_HOME_ROW_SLOT_IDS/);
    assert.match(yugSrc, /MOE_YUG_COAST_FIELD_ENABLED = false/);
    assert.match(mitoyaSrc, /MOE_MITOYA_FIELD_ENABLED = false/);
    assert.match(l2Src, /家AGE入口/);
    assert.match(l4Src, /slotId === "yug_coast"/);
    assert.match(l4Src, /fireflies/);
    const homeSrc = readFileSync(
      join(root, "src/lib/moe3dAgeHomeProps.js"),
      "utf8"
    );
    const canvasSrc = readFileSync(
      join(root, "src/components/MoeField3DCanvas.jsx"),
      "utf8"
    );
    const mitoyaL1 = readFileSync(
      join(root, "src/lib/moe3dMacro2AgeTiles.js"),
      "utf8"
    );
    const pathSrc = readFileSync(
      join(root, "src/lib/moe3dYugCoastHomePath.js"),
      "utf8"
    );
    assert.match(pathSrc, /MOE_YUG_COAST_SHOW_FIELD_HOMES = false/);
    assert.match(pathSrc, /MOE_YUG_COAST_SHOW_HUB_HOUSE = true/);
    assert.match(homeSrc, /MOE_YUG_COAST_SHOW_FIELD_HOMES/);
    assert.match(canvasSrc, /MOE_YUG_COAST_SHOW_FIELD_HOMES/);
    assert.match(canvasSrc, /MOE_YUG_COAST_SHOW_HUB_HOUSE/);
    assert.match(mitoyaL1, /moe3dYugCoastPathLocalX/);
    assert.match(mitoyaL1, /trunkH = 22/);
    assert.match(mitoyaL1, /SphereGeometry\(10/);
  });

  it("adds travel memos for bisk hub and phase3 field maps", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const altarSrc = readFileSync(join(root, "src/data/moeAltarWarps.js"), "utf8");

    assert.match(altarSrc, /bisk: "中央広場 — 転送ハブ/);
    assert.match(altarSrc, /eisis_cave: "洞窟 — スパイダー/);
    assert.match(altarSrc, /dragon_valley: "飛竜の谷/);
    assert.match(altarSrc, /travelMemo: WARP_DEST_TRAVEL_MEMO\.bisk/);
  });

  it("campfire rest fades scene and stops field bgm", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const restSrc = readFileSync(
      join(root, "src/lib/moeCampfireRestCore.js"),
      "utf8"
    );
    const bgmSrc = readFileSync(join(root, "src/lib/moeFieldBgm.js"), "utf8");
    const bgmMapSrc = readFileSync(
      join(root, "src/lib/moeFieldBgmMap.js"),
      "utf8"
    );
    const ambientSrc = readFileSync(
      join(root, "src/components/AmbientBgm.jsx"),
      "utf8"
    );
    const fieldSrc = readFileSync(
      join(root, "src/components/MoeFieldMap.jsx"),
      "utf8"
    );

    assert.match(restSrc, /休みますか/);
    assert.match(restSrc, /moeCampfireRestBlendStep/);
    assert.match(bgmSrc, /MOE_FIELD_BGM_REST_EVENT/);
    assert.match(bgmSrc, /requestMoeFieldBgmRest/);
    assert.match(bgmMapSrc, /MOE_BGM_REST_STOP_MS = 0/);
    assert.match(ambientSrc, /pauseBgmImmediate/);
    assert.match(ambientSrc, /fieldRestRef\.current\) return/);
    assert.doesNotMatch(
      ambientSrc,
      /fieldRestRef\.current = active;\s*if \(!fieldAutoRef\.current\) return/
    );
    assert.match(
      fieldSrc,
      /requestMoeFieldBgmRest\(true\);\s*\n\s*void startMoeCampfireCrackle/
    );
    const crackleSrc = readFileSync(
      join(root, "src/lib/moeCampfireCrackle.js"),
      "utf8"
    );
    const crackleOgg = readFileSync(
      join(root, "public/assets/sfx/campfire-crackle.ogg")
    );
    assert.match(crackleSrc, /MOE_CAMPFIRE_CRACKLE_URL/);
    assert.match(crackleSrc, /campfire-crackle\.ogg/);
    assert.match(crackleSrc, /opengameart\.org\/content\/fire-crackling/);
    assert.ok(crackleOgg.length > 10_000);
  });

  it("places AGE hub house and campfire at yug coast", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const houseSrc = readFileSync(
      join(root, "src/lib/moe3dAgeHubHouse.js"),
      "utf8"
    );
    const canvasSrc = readFileSync(
      join(root, "src/components/MoeField3DCanvas.jsx"),
      "utf8"
    );
    const fieldSrc = readFileSync(
      join(root, "src/components/MoeFieldMap.jsx"),
      "utf8"
    );

    assert.match(houseSrc, /altar_yug_coast/);
    assert.match(houseSrc, /AGE_HOUSE_OFF_X = -14/);
    assert.match(houseSrc, /moe3dAgeHubCampfireWorldPos/);
    assert.match(houseSrc, /AGE_HOUSE_DOOR_LOCAL_Z/);
    assert.match(houseSrc, /AGE_CAMPFIRE_DOOR_GAP/);
    assert.match(houseSrc, /MOE_AGE_TILE_FLOOR_Y = 0\.28/);
    assert.match(canvasSrc, /moe3dAgeHubHousePosition/);
    assert.match(canvasSrc, /moe3dAgeHubCampfireWorldPos/);
    assert.match(canvasSrc, /MOE_YUG_COAST_SHOW_FIELD_HOMES/);
    assert.match(canvasSrc, /MOE_YUG_COAST_SHOW_HUB_HOUSE/);
    assert.match(canvasSrc, /MOE_AGE_HUB_HOUSE/);
    assert.match(fieldSrc, /MoeAgeHubHousePanel/);
    assert.match(fieldSrc, /handleAgeHubChantSubmit/);
    assert.match(fieldSrc, /onChantSubmit=\{handleAgeHubChantSubmit\}/);
    const panelSrc = readFileSync(
      join(root, "src/components/MoeAgeHubHousePanel.jsx"),
      "utf8"
    );
    assert.match(panelSrc, /ペット敵 LV 育成表/);
    assert.doesNotMatch(panelSrc, /生命爆神/);
    assert.match(panelSrc, /moePetTrainingGuideForAgeHub/);
    const altarSrc = readFileSync(join(root, "src/data/moeAltarWarps.js"), "utf8");
    assert.match(altarSrc, /yug_coast:[\s\S]*家AGE番地の入口/);
    assert.match(altarSrc, /mitoya_great_tree:[\s\S]*巨木の上に本家/);
  });

  it("applies weak pet regen inside AGE hub house", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const regenSrc = readFileSync(
      join(root, "src/lib/moeAgeHubHouseRegen.js"),
      "utf8"
    );
    const fieldSrc = readFileSync(
      join(root, "src/components/MoeFieldMap.jsx"),
      "utf8"
    );
    const panelSrc = readFileSync(
      join(root, "src/components/MoeAgeHubHousePanel.jsx"),
      "utf8"
    );

    assert.match(regenSrc, /hp: 5/);
    assert.match(regenSrc, /intervalSec: 3/);
    assert.match(regenSrc, /室内のみの弱リジェネ/);
    assert.match(fieldSrc, /tickAgeHubHousePetRegen/);
    assert.match(fieldSrc, /nearAgeHubHouseRef\.current/);
    assert.match(fieldSrc, /!nearCampfireRef\.current/);
    assert.match(panelSrc, /MOE_AGE_HUB_HOUSE_PET_REGEN/);
  });

  it("places soles valley AGE rest campfire and save field labels", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const campsSrc = readFileSync(
      join(root, "src/lib/moe3dAgeRestCamps.js"),
      "utf8"
    );
    const canvasSrc = readFileSync(
      join(root, "src/components/MoeField3DCanvas.jsx"),
      "utf8"
    );
    const fieldSrc = readFileSync(
      join(root, "src/components/MoeFieldMap.jsx"),
      "utf8"
    );
    const labelsSrc = readFileSync(
      join(root, "src/lib/moeExternalSaveLabels.js"),
      "utf8"
    );

    assert.match(campsSrc, /altar_soles_valley/);
    assert.match(campsSrc, /moe3dSolesValleyCampfireWorldPos/);
    assert.match(campsSrc, /moe3dIsNearAgeRestCampfire/);
    assert.match(canvasSrc, /moe3dSolesValleyCampfireWorldPos/);
    assert.match(canvasSrc, /age-rest-camps/);
    assert.match(fieldSrc, /moe3dIsNearAgeRestCampfire/);
    assert.match(fieldSrc, /formatMoeExternalSaveFieldHint/);
    assert.match(labelsSrc, /soles_valley: "ソレス渓谷"/);
    assert.match(labelsSrc, /yug_coast: "ユグ海岸"/);
  });

  it("snaps bisk hub altar to map tile floor not macro overhang", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const warpSrc = readFileSync(join(root, "src/lib/moe3dAltarWarp.js"), "utf8");
    const canvasSrc = readFileSync(
      join(root, "src/components/MoeField3DCanvas.jsx"),
      "utf8"
    );
    const altarSrc = readFileSync(join(root, "src/data/moeAltarWarps.js"), "utf8");

    assert.match(warpSrc, /moe3dAltarGroundY/);
    assert.match(warpSrc, /mapSlotId === "bisk"\) return 0\.3/);
    assert.match(warpSrc, /MOE_3D_ALTAR_GROUND_SINK = 0\.15/);
    assert.match(canvasSrc, /moe3dAltarGroundY/);
    assert.match(canvasSrc, /mapTileRootY/);
    assert.match(altarSrc, /altarTz: 0\.46/);
  });

  it("places cash shop away from bisk central altar", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const hubSrc = readFileSync(
      join(root, "src/lib/moe3dBiskHubLayout.js"),
      "utf8"
    );

    assert.match(hubSrc, /CASH_SHOP_OFF_X = -17/);
    assert.match(hubSrc, /循環参照防止/);
    assert.match(hubSrc, /CASH_SHOP_OFF_Z = 13/);
  });

  it("wires bisk altar pool water sparkle L4 fx", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const canvasSrc = readFileSync(
      join(root, "src/components/MoeField3DCanvas.jsx"),
      "utf8"
    );
    const fxSrc = readFileSync(join(root, "src/lib/moe3dBiskL4Fx.js"), "utf8");

    assert.match(canvasSrc, /appendMoe3dBiskL4Fx/);
    assert.match(canvasSrc, /updateMoe3dBiskL4Fx/);
    assert.match(fxSrc, /bisk-l4-fx/);
    assert.match(fxSrc, /appendMoe3dBiskL4Fx/);
  });

  it("places bisk plaza street lanterns as L2 props", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const tileSrc = readFileSync(join(root, "src/lib/moe3dBiskTile.js"), "utf8");

    assert.match(tileSrc, /lanternSpecs/);
    assert.match(tileSrc, /emissive: 0xf59e0b/);
    assert.match(tileSrc, /tileD \* 0\.2/);
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
    assert.match(l2Src, /propsYugCoast/);
    assert.match(l2Src, /propsMitoyaGreatTree/);
    assert.match(l2Src, /mitoya_great_tree: propsMitoyaGreatTree/);
    assert.match(l2Src, /propsGeoAbyssNe/);
    assert.match(l2Src, /geo_abyss_ne: propsGeoAbyssNe/);
    const l4Src = readFileSync(
      join(root, "src/lib/moe3dMacro2AgeL4Fx.js"),
      "utf8"
    );
    assert.match(l4Src, /mitoya_great_tree/);
    assert.match(l4Src, /fde68a/);
    assert.match(l4Src, /appendGeoAbyssLavaFx/);
    const geoSrc = readFileSync(
      join(root, "src/lib/moe3dGeoAbyssLavaFx.js"),
      "utf8"
    );
    assert.match(geoSrc, /geo_abyss_ne/);
    assert.match(geoSrc, /moeGeoLavaClick/);
    assert.match(geoSrc, /triggerGeoAbyssLavaRipple/);
    assert.match(l3Src, /yug_coast:[\s\S]*0\.55, tz: 0\.34/);
    assert.match(l3Src, /soles_valley/);
    assert.match(l3Src, /MACRO2_AGE_L3_PLACEHOLDERS/);
    assert.match(tilesSrc, /appendMoe3dMacro2AgeL2Props/);
    assert.match(tilesSrc, /appendMoe3dMacro2AgeL3SpawnPads/);
    assert.match(tilesSrc, /AGE湯 · 渓谷の湯/);
    assert.match(tilesSrc, /localSize\.w \* 0\.5/);
    assert.match(tilesSrc, /const baseY = 0/);
    assert.match(tilesSrc, /frustumCulled = false/);
  });

  it("MoeField3DCanvas wires AGE terrain tiles", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const canvasSrc = readFileSync(
      join(root, "src/components/MoeField3DCanvas.jsx"),
      "utf8"
    );
    assert.match(canvasSrc, /addMoe3dMacro2AgeTiles/);
    assert.match(canvasSrc, /updateMoe3dMacro2AgeL4Fx/);
  });

  it("mitoya altar sits east of the great tree away from geo", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const altarSrc = readFileSync(
      join(root, "src/data/moeAltarWarps.js"),
      "utf8"
    );
    const l3Src = readFileSync(
      join(root, "src/lib/moe3dMacro2AgeL3Spawns.js"),
      "utf8"
    );
    const fieldSrc = readFileSync(
      join(root, "src/components/MoeFieldMap.jsx"),
      "utf8"
    );
    assert.match(
      altarSrc,
      /mitoya_great_tree:[\s\S]*altarTx: 0\.58[\s\S]*altarTz: 0\.5/
    );
    assert.match(l3Src, /mitoya_great_tree:[\s\S]*altarTx: 0\.58/);
    assert.match(fieldSrc, /fieldBgmWarpLockRef/);
    const slotSrc = readFileSync(
      join(root, "src/lib/moe3dMapSlotAtWorldPos.js"),
      "utf8"
    );
    const ageConstSrc = readFileSync(
      join(root, "src/lib/moe3dMacro2AgeConstants.js"),
      "utf8"
    );
    assert.match(ageConstSrc, /MOE_AGE_ROW_SLOT_ORDER_EAST_FIRST/);
    assert.match(ageConstSrc, /"mitoya_great_tree"/);
    assert.match(slotSrc, /MOE_AGE_MAP_SLOT_IDS\.has\(slotId\)/);
    const mitoyaLayoutSrc = readFileSync(
      join(root, "src/lib/moe3dMitoyaGreatTreeLayout.js"),
      "utf8"
    );
    assert.match(mitoyaLayoutSrc, /MOE_MITOYA_TREE_TX = 0\.38/);
    assert.match(fieldSrc, /MOE_MITOYA_TREE_TX/);
  });

  it("lists elvin bison bosses on training guide maps", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const registrySrc = readFileSync(
      join(root, "src/data/moeMonsterFieldRegistry.js"),
      "utf8"
    );
    const mountainsSrc = readFileSync(
      join(root, "src/data/maps/moeElvinMountainsPlanned.js"),
      "utf8"
    );
    assert.match(mountainsSrc, /key: "auzun_bura"/);
    assert.match(registrySrc, /key: "mountain_bison"[\s\S]*mapSlotId: "elvin_valley"/);
    assert.match(registrySrc, /key: "rough_bison"[\s\S]*mapSlotId: "elvin_valley"/);
    assert.match(registrySrc, /moeElvinMountainsActiveFieldEntries/);
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
    assert.match(slotSrc, /MOE_AGE_MAP_SLOT_IDS\.has\(slotId\)/);
  });

  it("macro-4 skill documents circle count and 20s cooldown", async () => {
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
    assert.match(skill, /残り: N サークル/);
    assert.match(skill, /デフォルト \*\*3サークル\*\*/);
    assert.match(skill, /実装完遂まで延長/);
    assert.match(skill, /時間制は使わない/);
  });
});

describe("battle log", () => {
  it("formats dq10-style damage lines and batches multi-hit", async () => {
    const {
      createMoeBattleLogState,
      formatMoeBattleDamageLine,
      formatMoeBattleEnemyAttackLine,
      pushMoeBattleLogEntry,
      queueMoeBattleDamageLog,
      flushMoeBattleDamageBatch,
      MOE_BATTLE_LOG_MAX_HISTORY,
    } = await import("../../src/lib/moeBattleLog.js");

    assert.equal(
      formatMoeBattleDamageLine("カルゴーチェ", "狂獣の牙", "スライム", [12, 34]),
      "カルゴーチェの 狂獣の牙 >> スライムに 12，34ダメ"
    );
    assert.equal(
      formatMoeBattleEnemyAttackLine("オーク兵", "太陽の精霊", 18),
      "オーク兵の 攻撃 >> 太陽の精霊に 18ダメ"
    );

    const state = createMoeBattleLogState();
    queueMoeBattleDamageLog(state, {
      key: "a\0b\0c",
      attacker: "ペット",
      skill: "アタック",
      target: "敵",
      amount: 5,
    });
    queueMoeBattleDamageLog(state, {
      key: "a\0b\0c",
      attacker: "ペット",
      skill: "アタック",
      target: "敵",
      amount: 7,
    });
    flushMoeBattleDamageBatch(state);
    assert.equal(state.entries.length, 1);
    assert.match(state.entries[0].msg, /5，7ダメ/);

    for (let i = 0; i < MOE_BATTLE_LOG_MAX_HISTORY + 5; i++) {
      pushMoeBattleLogEntry(state, { msg: `line-${i}` });
    }
    assert.equal(state.entries.length, MOE_BATTLE_LOG_MAX_HISTORY);
  });

  it("wires battle log panel in field map", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const fieldSrc = readFileSync(
      join(root, "src/components/MoeFieldMap.jsx"),
      "utf8"
    );
    const panelSrc = readFileSync(
      join(root, "src/components/MoeBattleLogPanel.jsx"),
      "utf8"
    );
    assert.match(fieldSrc, /MoeBattleLogPanel/);
    assert.match(fieldSrc, /createMoeBattleLogApi/);
    assert.match(fieldSrc, /showBattleLog = is3d/);
    assert.match(panelSrc, /バトルログ/);
    assert.match(panelSrc, /#00ff00/);
    assert.match(panelSrc, /useMoeBattleLogPanelLayout/);
    assert.match(panelSrc, /onResizeWidthPointerDown/);
    const layoutSrc = readFileSync(
      join(root, "src/lib/moeBattleLogLayout.js"),
      "utf8"
    );
    assert.match(layoutSrc, /MOE_BATTLE_LOG_LAYOUT_STORAGE_KEY/);
    assert.match(layoutSrc, /clampMoeBattleLogLayout/);
  });

  it("snaps battle log to minimap right edge", async () => {
    const {
      trySnapMoePanelDockRight,
      isNearMoePanelDockRight,
      moeDockedChildPosition,
      MOE_PANEL_DOCK_SNAP_X,
    } = await import("../../src/lib/moePanelDock.js");

    const parent = { x: 40, y: 120, width: 280, height: 200 };
    const near = trySnapMoePanelDockRight(
      { x: parent.x + parent.width + 8, y: parent.y + 10 },
      parent
    );
    assert.ok(near);
    assert.equal(near.x, parent.x + parent.width);
    assert.equal(near.y, parent.y);

    const far = trySnapMoePanelDockRight(
      { x: parent.x + parent.width + MOE_PANEL_DOCK_SNAP_X + 20, y: parent.y },
      parent
    );
    assert.equal(far, null);

    const child = moeDockedChildPosition({ x: parent.x, y: parent.y }, parent.width);
    assert.equal(child.x, 320);
    assert.equal(child.y, 120);

    assert.equal(
      isNearMoePanelDockRight(
        { x: parent.x + parent.width + 4, y: parent.y + 5 },
        parent
      ),
      true
    );
  });

  it("clamps duel time bar layout", async () => {
    const {
      clampMoeDuelTimeBarLayout,
      MOE_DUEL_TIME_BAR_MIN_WIDTH,
      MOE_DUEL_TIME_BAR_DEFAULT_WIDTH,
    } = await import("../../src/lib/moeDuelTimeBarLayout.js");

    const clamped = clampMoeDuelTimeBarLayout({
      x: -50,
      y: -50,
      width: 80,
    });
    assert.equal(clamped.width, MOE_DUEL_TIME_BAR_MIN_WIDTH);
    assert.ok(clamped.x >= 4);
    assert.ok(clamped.y >= 4);

    const panelSrc = (await import("node:fs")).readFileSync(
      new URL("../../src/components/MoeDuelTimeBarWindow.jsx", import.meta.url),
      "utf8"
    );
    assert.match(panelSrc, /useMoeDuelTimeBarLayout/);
    assert.match(panelSrc, /onResizePointerDown/);
    assert.match(panelSrc, /MOE_DUEL_TIME_BAR_DEFAULT_WIDTH/);
    assert.equal(MOE_DUEL_TIME_BAR_DEFAULT_WIDTH, 352);
  });

  it("clamps battle log panel layout", async () => {
    const {
      clampMoeBattleLogLayout,
      moeBattleLogDefaultLayout,
      MOE_BATTLE_LOG_MIN_WIDTH,
      MOE_BATTLE_LOG_MIN_HEIGHT,
    } = await import("../../src/lib/moeBattleLogLayout.js");

    const def = moeBattleLogDefaultLayout();
    assert.ok(def.width >= MOE_BATTLE_LOG_MIN_WIDTH);
    assert.ok(def.height >= MOE_BATTLE_LOG_MIN_HEIGHT);

    const clamped = clampMoeBattleLogLayout({
      x: -100,
      y: -100,
      width: 40,
      height: 30,
    });
    assert.equal(clamped.width, MOE_BATTLE_LOG_MIN_WIDTH);
    assert.equal(clamped.height, MOE_BATTLE_LOG_MIN_HEIGHT);
    assert.ok(clamped.x >= 4);
    assert.ok(clamped.y >= 4);
  });

  it("raises panel z-index on click-to-front stack", async () => {
    const {
      bringMoePanelToFront,
      moePanelResolvedZIndex,
      moePanelStackOrder,
      moePanelStackSize,
      moePanelStackZIndex,
      MOE_PANEL_DEFAULT_ORDERS,
      MOE_PANEL_STACK_BASE_Z,
      MOE_PANEL_STACK_MAX_Z,
    } = await import("../../src/lib/moePanelStack.js");

    const after = bringMoePanelToFront(
      { "battle-log": 0, "minimap-3d": 1 },
      "battle-log"
    );
    const size = moePanelStackSize(after);
    assert.ok(
      moePanelResolvedZIndex(after, "battle-log") >
        moePanelResolvedZIndex(after, "minimap-3d")
    );
    assert.equal(moePanelStackOrder(after, "battle-log"), size - 1);
    const many = bringMoePanelToFront(MOE_PANEL_DEFAULT_ORDERS, "battle-log");
    const manySize = moePanelStackSize(many);
    const topZ = moePanelStackZIndex(manySize - 1, manySize);
    const secondZ = moePanelStackZIndex(manySize - 2, manySize);
    assert.equal(topZ, MOE_PANEL_STACK_MAX_Z);
    assert.ok(topZ > secondZ);
    const { MOE_PANEL_ID_ITEM_BOX } = await import(
      "../../src/lib/moePanelStack.js"
    );
    assert.ok(MOE_PANEL_DEFAULT_ORDERS[MOE_PANEL_ID_ITEM_BOX] > 0);
    assert.equal(
      moePanelStackOrder({}, MOE_PANEL_ID_ITEM_BOX),
      MOE_PANEL_DEFAULT_ORDERS[MOE_PANEL_ID_ITEM_BOX]
    );

    const { MOE_PANEL_STACK_ID_LIST, MOE_PANEL_ID_TARGET_WINDOW } =
      await import("../../src/lib/moePanelStack.js");
    assert.equal(
      MOE_PANEL_STACK_ID_LIST.length,
      Object.keys(MOE_PANEL_DEFAULT_ORDERS).length
    );
    assert.ok(MOE_PANEL_DEFAULT_ORDERS[MOE_PANEL_ID_TARGET_WINDOW] > 0);

    const {
      MOE_PANEL_DRAG_POS_KEYS,
      MOE_PANEL_STACK_POS_STORAGE,
    } = await import("../../src/lib/moePanelStack.js");
    for (const key of MOE_PANEL_DRAG_POS_KEYS) {
      assert.ok(
        MOE_PANEL_DEFAULT_ORDERS[key] != null,
        `panel drag pos missing from stack: ${key}`
      );
    }
    assert.equal(Object.keys(MOE_PANEL_STACK_POS_STORAGE).length, 2);
  });
});

describe("phoenix rebirth once", () => {
  it("grants one charge and revives after 3 seconds", async () => {
    const {
      grantMoeRebirthOnceCharge,
      moeRebirthOnceHasCharge,
      moeRebirthOnceBeginPending,
      moeRebirthOnceIsPending,
      moeRebirthOnceReviveHp,
      MOE_REBIRTH_ONCE_DELAY_MS,
    } = await import("../../src/lib/moePhoenixRebirthOnce.js");

    const granted = grantMoeRebirthOnceCharge();
    assert.equal(granted.charges, 1);
    assert.ok(moeRebirthOnceHasCharge(granted));

    const pending = moeRebirthOnceBeginPending(1000, MOE_REBIRTH_ONCE_DELAY_MS);
    assert.ok(moeRebirthOnceIsPending(pending, 2000));
    assert.equal(moeRebirthOnceReviveHp(250), 250);
  });

  it("flags jiriki kaihou pre-skill for rebirth grant", async () => {
    const { buildPlayerPreSkillActivation } = await import(
      "../../src/lib/moePlayerPreSkillActivate.js"
    );
    const { getMoePlayerPreSkillById } = await import(
      "../../src/data/moePlayerPreSkills.js"
    );
    const skill = getMoePlayerPreSkillById("jiriki_kaihou");
    const result = buildPlayerPreSkillActivation(skill, {
      progress: { level: 100, exp: 0 },
      casterVitals: { mp: 100, mpMax: 100 },
      inDuel: true,
      enemyId: 1,
    });
    assert.equal(result.ok, true);
    assert.equal(result.grantRebirthOnce, true);
  });
});

describe("pet skill delay", () => {
  it("uses wiki band averages when delaySec is missing", async () => {
    const {
      moeDefaultDelaySecForSkillLevel,
      moePetSkillEffectiveDelaySec,
    } = await import("../../src/lib/moePetSkillDelay.js");

    assert.equal(moeDefaultDelaySecForSkillLevel(20), 17);
    assert.equal(moeDefaultDelaySecForSkillLevel(40), 17);
    assert.equal(moeDefaultDelaySecForSkillLevel(60), 28);
    assert.equal(moeDefaultDelaySecForSkillLevel(80), 35);
    assert.equal(moeDefaultDelaySecForSkillLevel(100), 55);
    assert.equal(moePetSkillEffectiveDelaySec({ level: 60 }), 28);
    assert.equal(moePetSkillEffectiveDelaySec({ level: 30, delaySec: 25 }), 25);
  });

  it("counts down pet skill delay remain seconds", async () => {
    const {
      markMoePetSkillDelay,
      moePetSkillDelayRemainSec,
    } = await import("../../src/lib/moePetAutoSkill.js");

    const skill = { id: "straight", name: "キャッツ ストレート", delaySec: 25 };
    const cooldownUntil = {};
    const nowMs = 1_000_000;
    markMoePetSkillDelay(cooldownUntil, skill, nowMs);
    assert.equal(moePetSkillDelayRemainSec(cooldownUntil, skill, nowMs), 25);
    assert.equal(
      moePetSkillDelayRemainSec(cooldownUntil, skill, nowMs + 1000),
      24
    );
    assert.equal(
      moePetSkillDelayRemainSec(cooldownUntil, skill, nowMs + 25_000),
      0
    );
  });
});

describe("pet loyalty gain", () => {
  it("requires enemy 7+ levels above pet", async () => {
    const {
      moePetLoyaltyQualifiesForGain,
      rollMoePetLoyaltyGain,
    } = await import("../../src/lib/moePetLoyaltyGain.js");

    assert.equal(moePetLoyaltyQualifiesForGain(16, 10), false);
    assert.equal(moePetLoyaltyQualifiesForGain(17, 10), true);

    const fail = rollMoePetLoyaltyGain(
      { loyalty: 50 },
      20,
      10,
      () => 0.9
    );
    assert.equal(fail.gained, false);
    assert.equal(fail.loyaltyPityMiss, true);

    const pity = rollMoePetLoyaltyGain(
      { loyalty: 50, loyaltyPityMiss: true },
      20,
      10,
      () => 0.99
    );
    assert.equal(pity.gained, true);
    assert.equal(pity.loyalty, 51);
    assert.equal(pity.loyaltyPityMiss, false);
  });
});

describe("pet auto skill", () => {
  it("uses unlearned skills in ALL (仮習得済) mode for auto AI", async () => {
    const { pickMoePetAutoSkill } = await import(
      "../../src/lib/moePetAutoSkill.js"
    );
    const { MOE_PET_SKILL_MODE_ALL } = await import(
      "../../src/lib/moePetSkillSettings.js"
    );

    const picked = pickMoePetAutoSkill({
      petId: "abinyan",
      pet: { mp: 50, hp: 80, hpMax: 100 },
      petLevel: 10,
      skills: [
        { id: "atk", name: "アタック", level: 1, type: "attack" },
        { id: "straight", name: "キャッツ ストレート", level: 30, delaySec: 25 },
      ],
      skillMode: MOE_PET_SKILL_MODE_ALL,
      loyalty: 100,
      nowMs: 0,
      cooldownUntil: {},
    });
    assert.equal(picked?.id, "straight");
  });

  it("ignores unlearned skills in learned-only mode for auto AI", async () => {
    const { pickMoePetAutoSkill } = await import(
      "../../src/lib/moePetAutoSkill.js"
    );
    const { MOE_PET_SKILL_MODE_LEARNED } = await import(
      "../../src/lib/moePetSkillSettings.js"
    );

    const picked = pickMoePetAutoSkill({
      petId: "abinyan",
      pet: { mp: 50, hp: 80, hpMax: 100 },
      petLevel: 10,
      skills: [
        { id: "atk", name: "アタック", level: 1, type: "attack" },
        { id: "straight", name: "キャッツ ストレート", level: 30, delaySec: 25 },
      ],
      skillMode: MOE_PET_SKILL_MODE_LEARNED,
      loyalty: 100,
      nowMs: 0,
      cooldownUntil: {},
    });
    assert.equal(picked, null);
  });

  it("picks highest level skill that passes loyalty MP delay and HP", async () => {
    const {
      pickMoePetAutoSkill,
      moePetUsesMp,
      markMoePetSkillDelay,
      moePetSkillDelayReady,
    } = await import("../../src/lib/moePetAutoSkill.js");
    const { MOE_PET_SKILL_MODE_ALL } = await import(
      "../../src/lib/moePetSkillSettings.js"
    );

    const skills = [
      { id: "atk", name: "アタック", level: 1, type: "attack" },
      { id: "hi", name: "火球", level: 5, mpCost: 10, delaySec: 2 },
      { id: "lo", name: "弱弾", level: 2, mpCost: 3 },
    ];
    const nowMs = 1000;
    const cooldownUntil = {};
    const picked = pickMoePetAutoSkill({
      petId: "phoenix_dragon",
      pet: { mp: 20, hp: 50, hpMax: 100 },
      petLevel: 50,
      skills,
      skillMode: MOE_PET_SKILL_MODE_ALL,
      loyalty: 100,
      nowMs,
      cooldownUntil,
    });
    assert.equal(picked?.id, "hi");

    markMoePetSkillDelay(cooldownUntil, picked, nowMs);
    assert.equal(moePetSkillDelayReady(cooldownUntil, picked, nowMs + 500), false);
    assert.equal(moePetSkillDelayReady(cooldownUntil, picked, nowMs + 2001), true);

    const lowMp = pickMoePetAutoSkill({
      petId: "phoenix_dragon",
      pet: { mp: 5, hp: 50, hpMax: 100 },
      petLevel: 50,
      skills,
      skillMode: MOE_PET_SKILL_MODE_ALL,
      loyalty: 100,
      nowMs: nowMs + 3000,
      cooldownUntil,
    });
    assert.equal(lowMp?.id, "lo");
  });

  it("falls back to lower skills when higher skills are on delay", async () => {
    const {
      pickMoePetAutoSkill,
      markMoePetSkillDelay,
      findPetCombatSkillSlotIndex,
    } = await import("../../src/lib/moePetAutoSkill.js");
    const { MOE_PET_SKILL_MODE_ALL } = await import(
      "../../src/lib/moePetSkillSettings.js"
    );

    const skills = [
      { id: "hi", name: "火球", level: 80, mpCost: 10, delaySec: 25 },
      { id: "mid", name: "中弾", level: 60, mpCost: 8, delaySec: 20 },
      { id: "lo", name: "弱弾", level: 40, mpCost: 3, delaySec: 5 },
    ];
    const slots = skills;
    const nowMs = 1000;
    const cooldownUntil = {};
    const hi = skills[0];
    const mid = skills[1];

    assert.equal(findPetCombatSkillSlotIndex(slots, hi), 0);
    assert.equal(
      findPetCombatSkillSlotIndex(
        [{ name: "キャッツ ストレート", level: 30 }],
        { name: "キャッツ ロケット", level: 80 }
      ),
      -1
    );

    markMoePetSkillDelay(cooldownUntil, hi, nowMs);
    const duringHiDelay = pickMoePetAutoSkill({
      petId: "phoenix_dragon",
      pet: { mp: 20, hp: 50, hpMax: 100 },
      petLevel: 50,
      skills,
      skillMode: MOE_PET_SKILL_MODE_ALL,
      loyalty: 100,
      nowMs: nowMs + 500,
      cooldownUntil,
    });
    assert.equal(duringHiDelay?.id, "mid");

    markMoePetSkillDelay(cooldownUntil, mid, nowMs);
    const duringHiAndMidDelay = pickMoePetAutoSkill({
      petId: "phoenix_dragon",
      pet: { mp: 20, hp: 50, hpMax: 100 },
      petLevel: 50,
      skills,
      skillMode: MOE_PET_SKILL_MODE_ALL,
      loyalty: 100,
      nowMs: nowMs + 500,
      cooldownUntil,
    });
    assert.equal(duringHiAndMidDelay?.id, "lo");
  });

  it("skips skills below loyaltyMin and ignores MP for zero-MP pets", async () => {
    const { pickMoePetAutoSkill, moePetUsesMp } = await import(
      "../../src/lib/moePetAutoSkill.js"
    );
    const { MOE_PET_SKILL_MODE_ALL } = await import(
      "../../src/lib/moePetSkillSettings.js"
    );

    assert.equal(moePetUsesMp("calgoche"), false);

    const skills = [
      { id: "secret", name: "奥義", level: 10, mpCost: 50, loyaltyMin: 100 },
      { id: "mid", name: "中技", level: 4, mpCost: 1, loyaltyMin: 50 },
    ];
    const lowLoyalty = pickMoePetAutoSkill({
      petId: "phoenix_dragon",
      pet: { mp: 100, hp: 80, hpMax: 100 },
      petLevel: 50,
      skills,
      skillMode: MOE_PET_SKILL_MODE_ALL,
      loyalty: 60,
      nowMs: 0,
      cooldownUntil: {},
    });
    assert.equal(lowLoyalty?.id, "mid");

    const noMpPet = pickMoePetAutoSkill({
      petId: "calgoche",
      pet: { mp: 0, hp: 80, hpMax: 100 },
      petLevel: 50,
      skills: [{ id: "blast", name: "爆撃", level: 3, mpCost: 99 }],
      skillMode: MOE_PET_SKILL_MODE_ALL,
      loyalty: 100,
      nowMs: 0,
      cooldownUntil: {},
    });
    assert.equal(noMpPet?.id, "blast");
  });

  it("blocks manual pet skills in auto-only mode regardless of loyalty", async () => {
    const { moePetManualSkillLoyaltyOk } = await import(
      "../../src/lib/moePetAutoSkill.js"
    );

    assert.equal(moePetManualSkillLoyaltyOk({ loyalty: 99 }, true), false);
    assert.equal(moePetManualSkillLoyaltyOk({ loyalty: 100 }, true), false);
    assert.equal(moePetManualSkillLoyaltyOk({ loyalty: 50 }, false), true);
    assert.equal(moePetManualSkillLoyaltyOk({}, true), false);
    assert.equal(moePetManualSkillLoyaltyOk({ loyalty: null }, true), false);
  });

  it("loads and saves pet loyalty gate setting", async () => {
    const {
      loadMoePetLoyaltyGate100,
      saveMoePetLoyaltyGate100,
    } = await import("../../src/lib/moePetLoyaltyGateSettings.js");

    const mockStorage = {
      store: {},
      getItem(k) {
        return this.store[k] ?? null;
      },
      setItem(k, v) {
        this.store[k] = v;
      },
    };
    globalThis.window = { localStorage: mockStorage };
    globalThis.localStorage = mockStorage;

    assert.equal(loadMoePetLoyaltyGate100(), true);
    saveMoePetLoyaltyGate100(false);
    assert.equal(loadMoePetLoyaltyGate100(), false);

    delete globalThis.window;
    delete globalThis.localStorage;
  });

  it("loads and saves pet auto skill toggle", async () => {
    const {
      loadMoePetAutoSkillEnabled,
      saveMoePetAutoSkillEnabled,
    } = await import("../../src/lib/moePetAutoSkillSettings.js");

    const mockStorage = {
      store: {},
      getItem(k) {
        return this.store[k] ?? null;
      },
      setItem(k, v) {
        this.store[k] = v;
      },
    };
    globalThis.window = { localStorage: mockStorage };
    globalThis.localStorage = mockStorage;

    assert.equal(loadMoePetAutoSkillEnabled(), true);
    saveMoePetAutoSkillEnabled(false);
    assert.equal(loadMoePetAutoSkillEnabled(), false);
    saveMoePetAutoSkillEnabled(true);
    assert.equal(loadMoePetAutoSkillEnabled(), true);

    delete globalThis.window;
    delete globalThis.localStorage;
  });
});

describe("item box layout", () => {
  it("reflows 5x4 grid to 7x3 with one blank when shortened vertically", async () => {
    const {
      moeItemBoxColsFromResize,
      moeItemBoxRowsForCols,
      moeItemBoxCellCount,
      MOE_ITEM_BOX_DEFAULT_COLS,
      MOE_ITEM_BOX_RESIZE_STEP_PX,
    } = await import("../../src/lib/moeItemBoxLayout.js");

    assert.equal(MOE_ITEM_BOX_DEFAULT_COLS, 5);
    assert.equal(moeItemBoxRowsForCols(5), 4);
    const cols = moeItemBoxColsFromResize(
      5,
      0,
      -MOE_ITEM_BOX_RESIZE_STEP_PX
    );
    assert.equal(cols, 7);
    assert.equal(moeItemBoxRowsForCols(cols), 3);
    assert.equal(moeItemBoxCellCount(cols), 21);
  });

  it("wires item box resize hook in component", async () => {
    const { readFileSync } = await import("node:fs");
    const panelSrc = readFileSync(
      new URL("../../src/components/MoeItemBox.jsx", import.meta.url),
      "utf8"
    );
    assert.match(panelSrc, /useMoeItemBoxLayout/);
    assert.match(panelSrc, /onResizePointerDown/);
    assert.match(panelSrc, /MOE_ITEM_BOX_SLOT_PX/);
  });
});

describe("enemy respawn delay", () => {
  it("sets 10-second and minute steps per level band", async () => {
    const {
      MOE_ENEMY_RESPAWN_CHOICES,
      MOE_ENEMY_RESPAWN_DEFAULT_SECONDS,
      clampMoeEnemyRespawnSeconds,
      defaultMoeEnemyRespawnSeconds,
      moeEnemyRespawnBandId,
      moeEnemyRespawnSecondsFor,
      moeEnemyRespawnMs,
      moeEnemyRespawnReady,
      moeMarkEnemyDefeated,
      normalizeMoeEnemyRespawnSeconds,
    } = await import("../../src/lib/moeEnemyRespawn.js");
    assert.equal(MOE_ENEMY_RESPAWN_CHOICES[0].sec, 10);
    assert.equal(MOE_ENEMY_RESPAWN_CHOICES.at(-1).sec, 600);
    assert.equal(MOE_ENEMY_RESPAWN_DEFAULT_SECONDS, 60);
    assert.equal(clampMoeEnemyRespawnSeconds(10), 10);
    assert.equal(clampMoeEnemyRespawnSeconds(25), 20);
    assert.equal(moeEnemyRespawnMs(10), 10_000);
    assert.equal(moeEnemyRespawnMs(60), 60_000);
    assert.equal(moeEnemyRespawnBandId({ level: 20.9 }), "lv20");
    assert.equal(moeEnemyRespawnBandId({ level: 50.3 }), "lv50");
    assert.equal(moeEnemyRespawnBandId({ level: 18, superBoss: true }), "lv150");
    assert.deepEqual(normalizeMoeEnemyRespawnSeconds("4"), {
      lv20: 240,
      lv50: 240,
      lv100: 240,
      lv150: 240,
    });
    assert.deepEqual(
      normalizeMoeEnemyRespawnSeconds({ v: 2, lv20: 10, lv50: 180, lv100: 360, lv150: 600 }),
      { lv20: 10, lv50: 180, lv100: 360, lv150: 600 }
    );
    const table = {
      ...defaultMoeEnemyRespawnSeconds(),
      lv20: 10,
      lv50: 180,
      lv100: 360,
      lv150: 600,
    };
    assert.equal(moeEnemyRespawnSecondsFor({ level: 15 }, table), 10);
    assert.equal(moeEnemyRespawnSecondsFor({ level: 41 }, table), 180);
    const dead = moeMarkEnemyDefeated({ id: 1, hp: 40, level: 41, name: "海ヘビ" }, 1_000, table);
    assert.equal(dead.respawnAt, 1_000 + 180_000);
    assert.equal(moeEnemyRespawnReady(dead, dead.respawnAt - 1), false);
    assert.equal(moeEnemyRespawnReady(dead, dead.respawnAt), true);
  });
});

describe("player look ahead", () => {
  it("nudges the on-screen player in half steps", async () => {
    const {
      MOE_PLAYER_LOOK_AHEAD_DEFAULT,
      clampMoePlayerLookAhead,
      nudgeMoePlayerLookAhead,
    } = await import("../../src/lib/moePlayerLookAhead.js");
    assert.equal(MOE_PLAYER_LOOK_AHEAD_DEFAULT, 7);
    assert.equal(clampMoePlayerLookAhead(7.2), 7);
    assert.equal(nudgeMoePlayerLookAhead(7, "down"), 7.5);
    assert.equal(nudgeMoePlayerLookAhead(7, "up"), 6.5);
    assert.equal(nudgeMoePlayerLookAhead(0, "up"), 0);
    assert.equal(nudgeMoePlayerLookAhead(14, "down"), 14);
  });
});

describe("worship nature", () => {
  it("revives only a dead pet and keeps saved hp at 0", async () => {
    const {
      moePetIsDead,
      clampLoadedMoePetHp,
      applyMoeWorshipNature,
    } = await import("../../src/lib/moePetWorshipNature.js");
    const {
      ensureWorshipNatureSlot,
    } = await import("../../src/data/moePlayerSkillSlotOrder.js");

    assert.equal(moePetIsDead({ hp: 0 }), true);
    assert.equal(moePetIsDead({ hp: 12 }), false);
    assert.equal(clampLoadedMoePetHp(0, 80, false), 0);
    assert.equal(clampLoadedMoePetHp(undefined, 80, false), 80);

    const alive = applyMoeWorshipNature({ id: "sun_spirit", hp: 40, hpMax: 80 });
    assert.equal(alive.ok, false);

    const revived = applyMoeWorshipNature({ id: "sun_spirit", hp: 0, hpMax: 80 });
    assert.equal(revived.ok, true);
    assert.equal(revived.pet.hp, 80);

    const slotted = ensureWorshipNatureSlot([
      "enemy_stat_search",
      "light",
      "heal",
      "heal-all",
      "regen",
      "banana_milk",
      "holy_record",
      "teleport",
      "ninja_shinobiashi",
      "dragon_skateboard",
    ]);
    assert.equal(slotted[1], "worship_nature");
    assert.equal(slotted.length, 10);
    assert.equal(slotted.includes("dragon_skateboard"), false);
  });

  it("names the rod and soul master, and keeps the official revive text", async () => {
    const { MOE_PLAYER_SLOT_LABELS } = await import(
      "../../src/data/moePlayerSkillSlotOrder.js"
    );
    const {
      MOE_WHITE_ANGEL_ROD_CAST_MS,
      MOE_WHITE_ANGEL_ROD_LINES,
    } = await import("../../src/lib/moeWhiteAngelRod.js");

    assert.equal(MOE_PLAYER_SLOT_LABELS.worship_nature, "ホワイトエンジェルロッド");
    assert.equal(MOE_PLAYER_SLOT_LABELS.soul_master, "ソウルマスター");
    assert.equal(MOE_WHITE_ANGEL_ROD_CAST_MS, 5000);
    assert.equal(MOE_WHITE_ANGEL_ROD_LINES.length, 3);
    assert.match(MOE_WHITE_ANGEL_ROD_LINES[0].text, /天使の息吹/);
    assert.match(MOE_WHITE_ANGEL_ROD_LINES[0].text, /0\.05レベル/);
    assert.match(MOE_WHITE_ANGEL_ROD_LINES[0].text, /経験値は失わない/);
    assert.match(MOE_WHITE_ANGEL_ROD_LINES[0].text, /アルターへ帰還/);
    assert.match(MOE_WHITE_ANGEL_ROD_LINES[1].text, /ジャッカロープ ミルク/);
    assert.match(MOE_WHITE_ANGEL_ROD_LINES[2].text, /ソウルマスター/);
    assert.match(MOE_WHITE_ANGEL_ROD_LINES[2].text, /0\.1レベル/);
  });

  it("mines a rock in five swings and rolls the four ores", async () => {
    const {
      MOE_MINING_GEM_SELL_GOLD,
      MOE_MINING_GEMS,
      MOE_MINING_ORE_RATE_NOTE,
      MOE_MINING_ORES,
      MOE_MINING_PICKUP_VANISH_MS,
      MOE_MINING_ROCK_HP,
      MOE_MINING_SWINGS,
      applyMoeMiningSwing,
      createMoeMiningChest,
      formatMoeMiningBreakNote,
      moeMiningInReach,
      moeMiningRockNearAltar,
      rollMoeMiningGem,
      rollMoeMiningOre,
    } = await import("../../src/lib/moeMining.js");

    assert.equal(
      MOE_MINING_ORES.reduce((sum, ore) => sum + ore.weight, 0),
      100
    );
    assert.equal(rollMoeMiningOre(() => 0).id, "copper_ore");
    assert.equal(rollMoeMiningOre(() => 0.59).id, "iron_ore");
    assert.equal(rollMoeMiningOre(() => 0.89).id, "silver_ore");
    assert.equal(rollMoeMiningOre(() => 0.99).id, "gold_ore");
    assert.match(MOE_MINING_ORE_RATE_NOTE, /銅59%/);
    assert.match(MOE_MINING_ORE_RATE_NOTE, /金1%/);

    assert.equal(rollMoeMiningGem(() => 0).id, "ruby");
    assert.equal(rollMoeMiningGem(() => 0.06).id, "sapphire");
    assert.equal(rollMoeMiningGem(() => 0.1).id, "diamond");
    assert.equal(rollMoeMiningGem(() => 0.13).id, "gold_gem");
    assert.equal(rollMoeMiningGem(() => 0.15), null);
    assert.equal(
      MOE_MINING_GEMS.every((gem) => gem.sellGold === MOE_MINING_GEM_SELL_GOLD),
      true
    );
    assert.equal(MOE_MINING_GEM_SELL_GOLD, 10000);
    assert.match(
      formatMoeMiningBreakNote(MOE_MINING_ORES[0], MOE_MINING_GEMS[0]),
      /銅59%/
    );

    let hp = MOE_MINING_ROCK_HP;
    let swings = 0;
    while (hp > 0 && swings < 40) {
      hp = applyMoeMiningSwing(hp, () => 0).hp;
      swings += 1;
    }
    assert.equal(hp, 0);
    assert.ok(swings >= MOE_MINING_SWINGS);
    assert.equal(moeMiningInReach(0, 0, 3, 4), true);
    assert.equal(moeMiningInReach(0, 0, 20, 0), false);
    const rock = moeMiningRockNearAltar({ x: 10, y: 20 });
    assert.equal(rock.x, 19);
    assert.equal(rock.y, 18);
    assert.equal(moeMiningRockNearAltar(null), null);
    assert.equal(MOE_MINING_PICKUP_VANISH_MS, 60000);
    const chest = createMoeMiningChest(1, 3, 4, [{ id: "copper_ore" }], 1000);
    assert.equal(chest.kind, "mining");
    assert.equal(chest.state, "closed");
    assert.equal(chest.items[0].id, "copper_ore");
    assert.equal(chest.vanishAt, 61000);

    const {
      emptyMoeMiningPickup,
      offerMoeMiningPickup,
      takeMoeMiningPickup,
    } = await import("../../src/lib/moeMining.js");
    const offered = offerMoeMiningPickup(emptyMoeMiningPickup(), [
      { id: "copper_ore", label: "銅鉱石" },
      { id: "ruby", label: "ルビー" },
    ]);
    assert.equal(offered.ok, true);
    assert.equal(offered.slots[0].id, "copper_ore");
    assert.equal(offered.slots[1].id, "ruby");
    assert.equal(offered.slots.filter(Boolean).length, 2);
    const full = offerMoeMiningPickup(
      Array.from({ length: 6 }, (_, i) => ({ id: `ore-${i}` })),
      [{ id: "extra" }]
    );
    assert.equal(full.ok, false);
    const taken = takeMoeMiningPickup(offered.slots, 0);
    assert.equal(taken.ok, true);
    assert.equal(taken.item.id, "copper_ore");
    assert.equal(taken.slots[0], null);
    assert.equal(taken.slots[1].id, "ruby");
  });

  it("drops duplicated skill-1 buttons and places the soul master west of the altar", async () => {
    const { stripRetiredPlayerSkillSlots, packPlayerSkillSlots } =
      await import("../../src/data/moePlayerSkillSlotOrder.js");
    const { moeSoulMasterRoomPos, moeSoulMasterStandPos } = await import(
      "../../src/lib/moeSoulMaster.js"
    );
    const packed = packPlayerSkillSlots(
      stripRetiredPlayerSkillSlots([
        "enemy_stat_search",
        "worship_nature",
        "light",
        "heal",
        "heal-all",
        "regen",
        "banana_milk",
        "holy_record",
        "teleport",
        "ninja_shinobiashi",
      ])
    );
    assert.equal(packed.includes("light"), false);
    assert.equal(packed.includes("teleport"), false);
    assert.equal(packed.includes("regen"), true);
    const room = moeSoulMasterRoomPos({ x: 10, y: 20 });
    const stand = moeSoulMasterStandPos({ x: 10, y: 20 });
    assert.equal(room.x, -38);
    assert.ok(stand.y > room.y);
    const { moeSoulReturnProgress, moeSoulPoyoScale, moeSoulReturnOpacity } =
      await import("../../src/lib/moeSoulMaster.js");
    assert.equal(moeSoulReturnProgress(0, 2000, 1000), 0.5);
    assert.equal(moeSoulReturnOpacity(1), 1);
    const mid = moeSoulPoyoScale(1 / 12);
    assert.ok(mid.y > 1);
    assert.ok(Math.abs(moeSoulPoyoScale(1).y - 1) < 0.001);
  });
});

describe("field fog", () => {
  it("keeps mist in forests and clears it on the kintoun and elsewhere", async () => {
    const { moeFieldFogDistances, moeFieldSlotIsForest } = await import(
      "../../src/lib/moeFieldFog.js"
    );
    assert.equal(moeFieldSlotIsForest("albeez_forest"), true);
    assert.equal(moeFieldSlotIsForest("elvin_valley"), true);
    assert.equal(moeFieldSlotIsForest("bisk_town"), false);
    const forest = moeFieldFogDistances("albeez_forest", false);
    const riding = moeFieldFogDistances("albeez_forest", true);
    const town = moeFieldFogDistances("sulfur_mine", false);
    assert.ok(forest.near < riding.near);
    assert.equal(riding.near, town.near);
    assert.equal(riding.far, town.far);
  });
});
