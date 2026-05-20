import {
  MOE_PET_DATA,
  calculatePetStats,
  petUsesPreciseWikiStats,
  roundPetStatInternal,
} from "@/data/moePets";
import {
  getMoePetExpIntoLevelFromTotal,
  getMoePetFreshTotalExpForLevel,
  getMoePetLevelFromTotalExp,
  getMoePetTotalExpFromLegacyProgress,
} from "@/data/moePetExpTable";

const STORAGE_KEY = "life-rpg-moe-pet-progress";

/** 新規ペット・リセット時の Lv（MoeFieldMap と揃える） */
export const MOE_SAVED_PET_INITIAL_LEVEL = 10;

/**
 * @typedef {{ totalExp?: number, hp?: number, mp?: number, level?: number, expIntoLevel?: number }} MoePetSlot
 * @typedef {{ activeId: string, byId: Record<string, MoePetSlot> }} MoePetSaveFile
 */

export function loadMoePetsSave() {
  if (typeof window === "undefined") {
    return { activeId: "sun_spirit", byId: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { activeId: "sun_spirit", byId: {} };
    const p = JSON.parse(raw);
    const activeId =
      typeof p.activeId === "string" && MOE_PET_DATA[p.activeId]
        ? p.activeId
        : "sun_spirit";
    const byId =
      p.byId && typeof p.byId === "object" && !Array.isArray(p.byId)
        ? p.byId
        : {};
    return { activeId, byId };
  } catch {
    return { activeId: "sun_spirit", byId: {} };
  }
}

export function writeMoePetsSave(file) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(file));
  } catch {
    /* quota / private mode */
  }
}

export function getDefaultPetForId(petId) {
  const id = MOE_PET_DATA[petId] ? petId : "sun_spirit";
  const stats = calculatePetStats(id, MOE_SAVED_PET_INITIAL_LEVEL);
  const totalExp = getMoePetFreshTotalExpForLevel(MOE_SAVED_PET_INITIAL_LEVEL);
  const precise = petUsesPreciseWikiStats(id);
  const hpM = stats?.hpMax ?? 100;
  const mpM = stats?.mpMax ?? 50;
  return {
    id,
    level: MOE_SAVED_PET_INITIAL_LEVEL,
    totalExp,
    expIntoLevel: 0,
    hp: precise ? roundPetStatInternal(hpM) : hpM,
    mp: precise ? roundPetStatInternal(mpM) : mpM,
    hpMax: hpM,
    mpMax: mpM,
    x: 120,
    y: 120,
  };
}

/**
 * スロットから UI 用ペット状態を構築（レベル・バーは totalExp から再計算）
 * @param {string} petId
 * @param {MoePetSlot | null | undefined} slot
 */
export function petFromSaveSlot(petId, slot) {
  const id = MOE_PET_DATA[petId] ? petId : "sun_spirit";
  if (!slot || typeof slot !== "object") {
    return getDefaultPetForId(id);
  }
  let totalExp = slot.totalExp;
  if (totalExp == null && slot.level != null) {
    totalExp = getMoePetTotalExpFromLegacyProgress(
      slot.level,
      slot.expIntoLevel ?? 0
    );
  }
  if (totalExp == null || Number.isNaN(Number(totalExp))) {
    return getDefaultPetForId(id);
  }
  totalExp = Math.max(0, Math.floor(Number(totalExp)));
  const level = getMoePetLevelFromTotalExp(totalExp);
  const expIntoLevel = getMoePetExpIntoLevelFromTotal(totalExp, level);
  const stats = calculatePetStats(id, level);
  const hpMax = stats?.hpMax ?? 100;
  const mpMax = stats?.mpMax ?? 50;
  const precise = petUsesPreciseWikiStats(id);
  let hp = Number(slot.hp);
  let mp = Number(slot.mp);
  if (precise) {
    hp = roundPetStatInternal(
      Math.min(hpMax, Math.max(0.01, Number.isFinite(hp) ? hp : hpMax))
    );
    mp = roundPetStatInternal(
      Math.min(mpMax, Math.max(0, Number.isFinite(mp) ? mp : mpMax))
    );
  } else {
    hp = Math.min(hpMax, Math.max(1, Math.floor(hp) || hpMax));
    mp = Math.min(mpMax, Math.max(0, Math.floor(mp) ?? mpMax));
  }
  return {
    id,
    level,
    totalExp,
    expIntoLevel,
    hp,
    mp,
    hpMax,
    mpMax,
    x: 120,
    y: 120,
  };
}

/** 初回マウント用：最後に選んでいた種族＋保存データ */
export function loadInitialMoePetFromStorage() {
  const { activeId, byId } = loadMoePetsSave();
  return petFromSaveSlot(activeId, byId[activeId]);
}

/**
 * 現在表示中ペットを byId にマージして保存
 * @param {{ id: string, totalExp?: number, hp: number, mp: number, level?: number, expIntoLevel?: number }} pet
 */
export function persistCurrentMoePet(pet) {
  const prev = loadMoePetsSave();
  const totalExp =
    pet.totalExp != null
      ? Math.max(0, Math.floor(Number(pet.totalExp)))
      : getMoePetTotalExpFromLegacyProgress(
          pet.level ?? MOE_SAVED_PET_INITIAL_LEVEL,
          pet.expIntoLevel ?? 0
        );
  const byId = {
    ...prev.byId,
    [pet.id]: {
      totalExp,
      hp: pet.hp,
      mp: pet.mp,
    },
  };
  writeMoePetsSave({ activeId: pet.id, byId });
}
