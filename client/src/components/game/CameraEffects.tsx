import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";

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
    setTimeScale
  } = useBattle();

  const shakeRef = useRef({ intensity: 0, duration: 0 });
  const prevPlayerHealthRef = useRef(100);
  const prevOpponentHealthRef = useRef(100);
  const prevPlayerAttackRef = useRef(false);
  const prevOpponentAttackRef = useRef(false);
  const originalPosRef = useRef({ x: 0, y: 0, z: 0 });
  const koSlowMoTriggeredRef = useRef(false);
  const slowMoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store original camera position
  useEffect(() => {
    originalPosRef.current = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    };
  }, [camera]);

  // Reset KO slow-mo flag when leaving KO phase
  useEffect(() => {
    if (battlePhase !== 'ko') {
      koSlowMoTriggeredRef.current = false;
    }
  }, [battlePhase]);

  // Trigger screen shake
  const triggerShake = (intensity: number, duration: number) => {
    shakeRef.current.intensity = Math.max(shakeRef.current.intensity, intensity);
    shakeRef.current.duration = Math.max(shakeRef.current.duration, duration);
  };

  // Trigger slow motion (updates battle store timeScale)
  const triggerSlowMo = (scale: number, duration: number) => {
    // Clear existing timeout to avoid overlapping resets
    if (slowMoTimeoutRef.current) {
      clearTimeout(slowMoTimeoutRef.current);
    }
    
    setTimeScale(scale);
    slowMoTimeoutRef.current = setTimeout(() => {
      setTimeScale(1.0);
      slowMoTimeoutRef.current = null;
    }, duration);
  };

  useFrame((state, delta) => {
    // Detect player damage
    if (playerHealth < prevPlayerHealthRef.current) {
      const damage = prevPlayerHealthRef.current - playerHealth;
      triggerShake(damage * 0.02, 0.2);
      
      // Slow-mo on big hits
      if (damage >= 15) {
        triggerSlowMo(0.3, 150);
      }
    }
    prevPlayerHealthRef.current = playerHealth;

    // Detect opponent damage
    if (opponentHealth < prevOpponentHealthRef.current) {
      const damage = prevOpponentHealthRef.current - opponentHealth;
      triggerShake(damage * 0.02, 0.2);
      
      // Slow-mo on big hits
      if (damage >= 15) {
        triggerSlowMo(0.3, 150);
      }
    }
    prevOpponentHealthRef.current = opponentHealth;

    // Special attack screen shake and slow-mo
    if (playerAttacking && !prevPlayerAttackRef.current && playerAttackType === 'special') {
      triggerShake(0.8, 0.4);
      triggerSlowMo(0.3, 200);
    }
    prevPlayerAttackRef.current = playerAttacking;

    if (opponentAttacking && !prevOpponentAttackRef.current && opponentAttackType === 'special') {
      triggerShake(0.8, 0.4);
      triggerSlowMo(0.3, 200);
    }
    prevOpponentAttackRef.current = opponentAttacking;

    // KO slow-mo (ONLY TRIGGER ONCE!)
    if (battlePhase === 'ko' && !koSlowMoTriggeredRef.current) {
      koSlowMoTriggeredRef.current = true;
      triggerShake(1.2, 0.5);
      triggerSlowMo(0.2, 500);
    }

    // Apply screen shake
    if (shakeRef.current.intensity > 0) {
      const shake = shakeRef.current.intensity;
      camera.position.x = originalPosRef.current.x + (Math.random() - 0.5) * shake;
      camera.position.y = originalPosRef.current.y + (Math.random() - 0.5) * shake;
      camera.position.z = originalPosRef.current.z + (Math.random() - 0.5) * shake * 0.5;

      shakeRef.current.intensity -= delta * 5;
      shakeRef.current.duration -= delta;

      if (shakeRef.current.duration <= 0 || shakeRef.current.intensity <= 0) {
        shakeRef.current.intensity = 0;
        shakeRef.current.duration = 0;
        // Reset to original position
        camera.position.x = originalPosRef.current.x;
        camera.position.y = originalPosRef.current.y;
        camera.position.z = originalPosRef.current.z;
      }
    } else {
      // Update original position when not shaking (to follow camera movement)
      originalPosRef.current.x = camera.position.x;
      originalPosRef.current.y = camera.position.y;
      originalPosRef.current.z = camera.position.z;
    }
  });

  return null;
}
