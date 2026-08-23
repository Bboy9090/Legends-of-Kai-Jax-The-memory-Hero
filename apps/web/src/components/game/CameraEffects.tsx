import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useAccessibility } from "../../lib/stores/useAccessibility";
import {
  getImpactProfile,
  impactProfileForDamage,
  KO_IMPACT_PROFILE,
  sampleCameraShake,
  type ImpactProfile,
} from "../../game/combat/combatPresentation";

export default function CameraEffects() {
  const { camera } = useThree();
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
  const reduceMotion = useAccessibility((state) => state.reduceMotion);

  const shakeRef = useRef({ intensity: 0, duration: 0, elapsed: 0 });
  const prevPlayerHealthRef = useRef(playerHealth);
  const prevOpponentHealthRef = useRef(opponentHealth);
  const prevPlayerAttackRef = useRef(false);
  const prevOpponentAttackRef = useRef(false);
  const originalPosRef = useRef({ x: camera.position.x, y: camera.position.y, z: camera.position.z });
  const koSlowMoTriggeredRef = useRef(false);
  const slowMoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    originalPosRef.current = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };
  }, [camera]);

  useEffect(() => {
    if (battlePhase !== "ko") koSlowMoTriggeredRef.current = false;
  }, [battlePhase]);

  useEffect(() => {
    return () => {
      if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);
      setTimeScale(1);
    };
  }, [setTimeScale]);

  const triggerShake = (profile: Readonly<ImpactProfile>) => {
    const motionScale = reduceMotion ? 0.3 : 1;
    shakeRef.current.intensity = Math.max(
      shakeRef.current.intensity,
      profile.shakeIntensity * motionScale
    );
    shakeRef.current.duration = Math.max(
      shakeRef.current.duration,
      profile.shakeDurationSec * motionScale
    );
    shakeRef.current.elapsed = 0;
  };

  const triggerSlowMo = (profile: Readonly<ImpactProfile>) => {
    if (profile.slowMoDurationMs <= 0 || profile.slowMoScale >= 1) return;
    if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);

    setTimeScale(Math.max(0.1, Math.min(1, profile.slowMoScale)));
    slowMoTimeoutRef.current = setTimeout(() => {
      setTimeScale(1);
      slowMoTimeoutRef.current = null;
    }, Math.max(0, profile.slowMoDurationMs));
  };

  const triggerProfile = (profile: Readonly<ImpactProfile>) => {
    triggerShake(profile);
    triggerSlowMo(profile);
  };

  useFrame((_state, rawDelta) => {
    const delta = Math.max(0, Math.min(0.05, Number.isFinite(rawDelta) ? rawDelta : 0));

    if (playerHealth < prevPlayerHealthRef.current) {
      const damage = prevPlayerHealthRef.current - playerHealth;
      triggerProfile(impactProfileForDamage(damage, opponentAttackType));
    }
    prevPlayerHealthRef.current = playerHealth;

    if (opponentHealth < prevOpponentHealthRef.current) {
      const damage = prevOpponentHealthRef.current - opponentHealth;
      triggerProfile(impactProfileForDamage(damage, playerAttackType));
    }
    prevOpponentHealthRef.current = opponentHealth;

    if (playerAttacking && !prevPlayerAttackRef.current && playerAttackType) {
      const profile = getImpactProfile(playerAttackType);
      if (playerAttackType === "special" || playerAttackType === "ultimate") {
        triggerShake({ ...profile, shakeIntensity: profile.shakeIntensity * 0.55 });
      }
    }
    prevPlayerAttackRef.current = playerAttacking;

    if (opponentAttacking && !prevOpponentAttackRef.current && opponentAttackType) {
      const profile = getImpactProfile(opponentAttackType);
      if (opponentAttackType === "special") {
        triggerShake({ ...profile, shakeIntensity: profile.shakeIntensity * 0.5 });
      }
    }
    prevOpponentAttackRef.current = opponentAttacking;

    if (battlePhase === "ko" && !koSlowMoTriggeredRef.current) {
      koSlowMoTriggeredRef.current = true;
      triggerProfile(KO_IMPACT_PROFILE);
    }

    if (shakeRef.current.intensity > 0 && shakeRef.current.duration > 0) {
      shakeRef.current.elapsed += delta;
      const sample = sampleCameraShake(shakeRef.current.elapsed, shakeRef.current.intensity);
      camera.position.set(
        originalPosRef.current.x + sample.x,
        originalPosRef.current.y + sample.y,
        originalPosRef.current.z + sample.z
      );

      shakeRef.current.duration = Math.max(0, shakeRef.current.duration - delta);
      shakeRef.current.intensity = Math.max(0, shakeRef.current.intensity - delta * 3.8);

      if (shakeRef.current.duration <= 0 || shakeRef.current.intensity <= 0) {
        shakeRef.current.intensity = 0;
        shakeRef.current.duration = 0;
        camera.position.set(
          originalPosRef.current.x,
          originalPosRef.current.y,
          originalPosRef.current.z
        );
      }
    } else {
      originalPosRef.current = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      };
    }
  });

  return null;
}
