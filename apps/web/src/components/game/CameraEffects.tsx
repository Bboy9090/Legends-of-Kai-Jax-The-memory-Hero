import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";

/**
 * Combat presentation effects that do NOT own camera position.
 * BattleCamera is the single source of truth for framing and shake application.
 * This component only requests shake intensity and slow-motion events.
 */
export default function CameraEffects() {
  const {
    playerHealth,
    opponentHealth,
    playerAttackType,
    opponentAttackType,
    playerAttacking,
    opponentAttacking,
    battlePhase,
    setTimeScale,
  } = useBattle();

  const prevPlayerHealthRef = useRef(100);
  const prevOpponentHealthRef = useRef(100);
  const prevPlayerAttackRef = useRef(false);
  const prevOpponentAttackRef = useRef(false);
  const koSlowMoTriggeredRef = useRef(false);
  const slowMoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (battlePhase !== "ko") koSlowMoTriggeredRef.current = false;
  }, [battlePhase]);

  useEffect(() => {
    return () => {
      if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);
      useBattle.getState().setTimeScale(1.0);
    };
  }, []);

  const requestShake = (intensity: number) => {
    useBattle.getState().triggerScreenShake(Math.min(1.2, Math.max(0, intensity)));
  };

  const triggerSlowMo = (scale: number, duration: number) => {
    if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);
    setTimeScale(scale);
    slowMoTimeoutRef.current = setTimeout(() => {
      useBattle.getState().setTimeScale(1.0);
      slowMoTimeoutRef.current = null;
    }, duration);
  };

  useFrame(() => {
    if (playerHealth < prevPlayerHealthRef.current) {
      const damage = prevPlayerHealthRef.current - playerHealth;
      requestShake(Math.min(0.7, damage * 0.018));
      if (damage >= 18) triggerSlowMo(0.45, 110);
    }
    prevPlayerHealthRef.current = playerHealth;

    if (opponentHealth < prevOpponentHealthRef.current) {
      const damage = prevOpponentHealthRef.current - opponentHealth;
      requestShake(Math.min(0.7, damage * 0.018));
      if (damage >= 18) triggerSlowMo(0.45, 110);
    }
    prevOpponentHealthRef.current = opponentHealth;

    if (playerAttacking && !prevPlayerAttackRef.current && playerAttackType === "special") {
      requestShake(0.45);
      triggerSlowMo(0.5, 120);
    }
    prevPlayerAttackRef.current = playerAttacking;

    if (opponentAttacking && !prevOpponentAttackRef.current && opponentAttackType === "special") {
      requestShake(0.45);
      triggerSlowMo(0.5, 120);
    }
    prevOpponentAttackRef.current = opponentAttacking;

    if (battlePhase === "ko" && !koSlowMoTriggeredRef.current) {
      koSlowMoTriggeredRef.current = true;
      requestShake(0.8);
      triggerSlowMo(0.3, 350);
    }
  });

  return null;
}
