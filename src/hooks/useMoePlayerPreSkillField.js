"use client";

import { useCallback } from "react";
import { buildPlayerPreSkillActivation } from "@/lib/moePlayerPreSkillActivate";
import {
  beginMoePhoenixHabitAscensionCooldown,
  canUseMoePhoenixHabitAscension,
} from "@/lib/moePhoenixHabitAscension";
import { grantMoeRebirthOnceCharge } from "@/lib/moePhoenixRebirthOnce";
import {
  awardPlayerPreSkillExpOnUse,
  savePlayerPreSkillProgress,
} from "@/lib/moePlayerPreSkillProgress";
import { nextMoePlayerSummonFxRequest } from "@/lib/moePlayerSummonPrefetch";
import { saveMoePlayerVitals } from "@/lib/moePlayerVitals";

/**
 * プレイヤー召喚プレスキル — フィールドでの使用・EXP・3D VFX
 * @param {{
 *   playerPreSkillProgressRef: React.MutableRefObject<import("@/lib/moePlayerPreSkillProgress.js").MoePlayerPreSkillProgressMap>,
 *   setPlayerPreSkillProgress: (map: import("@/lib/moePlayerPreSkillProgress.js").MoePlayerPreSkillProgressMap) => void,
 *   playerVitalsRef: React.MutableRefObject<{ mp?: number, mpMax?: number }>,
 *   setPlayerVitals: (v: { mp?: number, mpMax?: number }) => void,
 *   duelRef: React.MutableRefObject<{ enemyId?: number } | null>,
 *   playerSummonFxRef: React.MutableRefObject<{ current: { skillId: string, seq: number } | null }>,
 *   rebirthOnceRef?: React.MutableRefObject<{ charges?: number, pendingUntilMs?: number } | null>,
 *   habitAscensionCooldownUntilRef?: React.MutableRefObject<number>,
 *   scheduleMoeDuelSkillHits: (enemyId: number, seq: object) => void,
 *   setToast: (msg: string) => void,
 *   setSkillToast: (msg: string) => void,
 *   playSfx: (id: string) => void,
 * }} opts
 */
export function useMoePlayerPreSkillField({
  playerPreSkillProgressRef,
  setPlayerPreSkillProgress,
  playerVitalsRef,
  setPlayerVitals,
  duelRef,
  playerSummonFxRef,
  rebirthOnceRef,
  habitAscensionCooldownUntilRef,
  scheduleMoeDuelSkillHits,
  setToast,
  setSkillToast,
  playSfx,
}) {
  const toastWithPreSkillExp = useCallback(
    (skill, baseToast, skillToastMsg) => {
      const award = awardPlayerPreSkillExpOnUse(
        playerPreSkillProgressRef.current,
        skill
      );
      if (award.gained) {
        playerPreSkillProgressRef.current = award.progressMap;
        setPlayerPreSkillProgress(award.progressMap);
        savePlayerPreSkillProgress(award.progressMap);
      }
      const lines = [baseToast, ...award.toastLines].filter(Boolean);
      setToast(lines.join("\n"));
      if (skillToastMsg) setSkillToast(skillToastMsg);
    },
    [playerPreSkillProgressRef, setPlayerPreSkillProgress, setToast, setSkillToast]
  );

  const activatePlayerPreSkill = useCallback(
    (skill) => {
      const nowMs = Date.now();
      if (skill?.id === "jiriki_kaihou" && habitAscensionCooldownUntilRef) {
        const cdCheck = canUseMoePhoenixHabitAscension(
          habitAscensionCooldownUntilRef.current,
          nowMs
        );
        if (!cdCheck.ok) {
          if (cdCheck.toast) setToast(cdCheck.toast);
          return;
        }
      }

      const result = buildPlayerPreSkillActivation(skill, {
        progress: playerPreSkillProgressRef.current[skill?.id ?? ""],
        casterVitals: playerVitalsRef.current,
        inDuel: Boolean(duelRef.current),
        enemyId: duelRef.current?.enemyId ?? null,
      });
      if (!result.ok) {
        if (result.toast) setToast(result.toast);
        return;
      }

      playerVitalsRef.current = result.nextVitals;
      setPlayerVitals(result.nextVitals);
      saveMoePlayerVitals(result.nextVitals);

      const prevFx = playerSummonFxRef.current?.current;
      playerSummonFxRef.current = {
        current: nextMoePlayerSummonFxRequest(prevFx, result.skillId),
      };

      if (result.sequence && result.enemyId != null) {
        scheduleMoeDuelSkillHits(
          result.enemyId,
          result.sequence,
          skill.name ?? "スキル"
        );
      }

      if (result.grantRebirthOnce && rebirthOnceRef) {
        rebirthOnceRef.current = grantMoeRebirthOnceCharge();
      }

      if (skill?.id === "jiriki_kaihou" && habitAscensionCooldownUntilRef) {
        habitAscensionCooldownUntilRef.current =
          beginMoePhoenixHabitAscensionCooldown(nowMs);
      }

      const baseToast =
        result.grantRebirthOnce && rebirthOnceRef
          ? `${result.baseToast}\n🪽 リボーンワンス付与`
          : result.baseToast;

      toastWithPreSkillExp(skill, baseToast, result.skillToast);
      playSfx("attack");
    },
    [
      playerPreSkillProgressRef,
      playerVitalsRef,
      setPlayerVitals,
      duelRef,
      playerSummonFxRef,
      rebirthOnceRef,
      habitAscensionCooldownUntilRef,
      scheduleMoeDuelSkillHits,
      toastWithPreSkillExp,
      setToast,
      playSfx,
    ]
  );

  return { activatePlayerPreSkill };
}
