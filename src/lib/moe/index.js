/**
 * MOE 共通インフラ — 整理・デバッグ・永続化の入口
 */

export { moeDevAssert, moeDevWarn, isMoeDevMode } from "@/lib/moe/moeDevAssert";
export {
  MOE_STORAGE_REGISTRY,
  auditMoeLocalStorage,
} from "@/lib/moe/moeStorageRegistry";
export {
  MOE_SUBSYSTEMS,
  printMoeSubsystemGuide,
} from "@/lib/moe/moeSubsystemGuide";
export {
  collectMoeFieldInvariantIssues,
  reportMoeFieldInvariantIssues,
} from "@/lib/moe/moeFieldInvariants";
export {
  installMoeDevRegistry,
  updateMoeDevSnapshot,
  getMoeDevSnapshot,
} from "@/lib/moe/moeDevRegistry";
