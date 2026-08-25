import { useEffect, useRef } from "react";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { useTouchInput } from "../../../lib/stores/useTouchInput";
import { CombatState } from "../../../game/combat/stateEnums";
import { resetAutoTarget } from "../../../game/combat/targeting";

/**
 * Mission/adventure lifecycle safety.
 *
 * Keeps temporary combat state from leaking across mission starts, district
 * sessions, encounter checkpoints, focus loss, or controller/touch hand-offs.
 */
export default function AdventureSessionGuard() {
  const missionId = useAdventure((s) => s.missionId);
  const roamSessionId = useAdventure((s) => s.roamSessionId);
  const encounterIndex = useAdventure((s) => s.encounterIndex);
  const previousEncounterRef = useRef(encounterIndex);

  useEffect(() => {
    resetAutoTarget();
    useTouchInput.getState().releaseJoystick();
    useTouchInput.setState({ pendingAttacks: [] });

    useAdventure.setState((s) => ({
      isPaused: false,
      player: {
        ...s.player,
        velocityX: 0,
        velocityZ: 0,
        speed: 0,
        isMoving: false,
        isRunning: false,
        isCombat: false,
        isAttacking: false,
        attackType: null,
        attackCooldown: 0,
        attackTimer: 0,
        combatState: CombatState.FREE,
        comboStep: 0,
        comboTimer: 0,
        dodgeTimer: 0,
        invulnTimer: 0,
        hitStunTimer: 0,
        hitStopTimer: 0,
        staminaRegenDelay: 0,
        autoTargetId: null,
        superArmor: false,
        screenShake: 0,
        timeScale: 1,
        impactFlash: null,
      },
    }));

    previousEncounterRef.current = encounterIndex;
  }, [missionId, roamSessionId]);

  useEffect(() => {
    if (encounterIndex === previousEncounterRef.current) return;
    previousEncounterRef.current = encounterIndex;

    resetAutoTarget();
    useTouchInput.getState().releaseJoystick();
    useTouchInput.setState({ pendingAttacks: [] });

    // Encounter checkpoints may heal/refill resources and intentionally flash.
    // Clear combat/camera residue without erasing that checkpoint feedback.
    useAdventure.setState((s) => ({
      player: {
        ...s.player,
        velocityX: 0,
        velocityZ: 0,
        speed: 0,
        isMoving: false,
        isRunning: false,
        isCombat: false,
        isAttacking: false,
        attackType: null,
        attackCooldown: 0,
        attackTimer: 0,
        combatState: CombatState.FREE,
        comboStep: 0,
        comboTimer: 0,
        dodgeTimer: 0,
        invulnTimer: 0,
        hitStunTimer: 0,
        hitStopTimer: 0,
        staminaRegenDelay: 0,
        autoTargetId: null,
        superArmor: false,
        screenShake: 0,
        timeScale: 1,
      },
    }));
  }, [encounterIndex]);

  return null;
}
