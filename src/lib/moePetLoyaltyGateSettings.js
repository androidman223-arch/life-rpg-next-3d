/** ペット — オートAIのみ（手動スキル不可） */
export const MOE_PET_LOYALTY_GATE_100_STORAGE_KEY =
  "life-rpg-moe-pet-loyalty-gate-100";

/** @returns {boolean} true = オートAIのみ（手動スキル不可） */
export function loadMoePetLoyaltyGate100() {
  if (typeof localStorage === "undefined") return true;
  const raw = localStorage.getItem(MOE_PET_LOYALTY_GATE_100_STORAGE_KEY);
  if (raw === "0" || raw === "false") return false;
  return true;
}

/** @param {boolean} enabled */
export function saveMoePetLoyaltyGate100(enabled) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(MOE_PET_LOYALTY_GATE_100_STORAGE_KEY, enabled ? "1" : "0");
}
