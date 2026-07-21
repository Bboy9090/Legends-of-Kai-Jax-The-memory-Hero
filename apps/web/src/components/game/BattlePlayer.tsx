import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import OptimizedBeastModel from "./models/OptimizedBeastModel";

export default function BattlePlayer() {
  const { 
    playerFighterId, 
    playerX, 
    playerY,
    playerFacingRight,
    playerAttacking,
    playerAttackType,
    playerInvulnerable,
    playerHealth,
    battlePhase,
    winner,
    timeScale,
    playerVelocityX,
  } = useBattle();
  
  const meshRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  
  const animTimeRef = useRef(0);
  const isMovingRef = useRef(false);
  const hitAnimRef = useRef(0);
  const prevHealthRef = useRef(100);
  
  // LEGENDARY ANIMATION SYSTEM - Attack phases for smooth transitions!
  const attackPhaseRef = useRef<'windup' | 'active' | 'recovery' | null>(null);
  const attackPhaseTimeRef = useRef(0);
  const emotionIntensityRef = useRef(0); // For facial expressions!
  
  const fighter = getFighterById(playerFighterId);
  
  // PlayerController is the sole gameplay authority; this component renders its state.
  useFrame((_state, delta) => {
    // Apply slow-motion time scale
    const scaledDelta = delta * timeScale;
    
    if (battlePhase !== 'fighting') {
      // Victory/defeat pose
      if (battlePhase === 'ko' || battlePhase === 'results') {
        if (winner === 'player' && bodyRef.current) {
          // Victory bounce
          animTimeRef.current += scaledDelta * 3;
          bodyRef.current.position.y = Math.abs(Math.sin(animTimeRef.current)) * 0.2;
          if (headRef.current) headRef.current.rotation.z = Math.sin(animTimeRef.current * 2) * 0.1;
        } else if (winner === 'opponent' && bodyRef.current) {
          // Defeat slump
          bodyRef.current.position.y = -0.3;
          bodyRef.current.rotation.z = 0.3;
        }
      }
      return;
    }
    
    animTimeRef.current += scaledDelta;
    isMovingRef.current = Math.abs(playerVelocityX) > 0.08 && !playerAttacking;
    
    // Detect hit (health decreased) - INTENSE FACIAL REACTION!
    if (playerHealth < prevHealthRef.current) {
      hitAnimRef.current = 0.3; // Hit reaction duration
      emotionIntensityRef.current = 1.0; // MAX emotion - pain/anger!
    }
    prevHealthRef.current = playerHealth;
    
    // Fade emotion intensity over time
    if (emotionIntensityRef.current > 0) {
      emotionIntensityRef.current = Math.max(0, emotionIntensityRef.current - scaledDelta * 2);
    }
    
    // ATTACK PHASE SYSTEM - Smooth wind-up, active, recovery!
    if (playerAttacking && playerAttackType) {
      attackPhaseTimeRef.current += scaledDelta;
      
      const windupDuration = 0.1;  // Quick wind-up
      const activeDuration = 0.25; // Extended strike
      if (attackPhaseTimeRef.current < windupDuration) {
        attackPhaseRef.current = 'windup';
        emotionIntensityRef.current = 0.5; // Focus
      } else if (attackPhaseTimeRef.current < windupDuration + activeDuration) {
        attackPhaseRef.current = 'active';
        emotionIntensityRef.current = 1.0; // MAX power!
      } else {
        attackPhaseRef.current = 'recovery';
        emotionIntensityRef.current = 0.2; // Cooldown
      }
    } else {
      attackPhaseRef.current = null;
      attackPhaseTimeRef.current = 0;
    }
    
    // Animate character
    if (bodyRef.current && headRef.current && leftArmRef.current && rightArmRef.current && 
        leftLegRef.current && rightLegRef.current) {
      
      // Hit reaction animation
      if (hitAnimRef.current > 0) {
        hitAnimRef.current -= scaledDelta;
        const recoil = hitAnimRef.current / 0.3;
        bodyRef.current.rotation.z = Math.sin(animTimeRef.current * 20) * recoil * 0.3;
        headRef.current.rotation.z = Math.sin(animTimeRef.current * 15) * recoil * 0.2;
      } else {
        bodyRef.current.rotation.z = 0;
      }
      
      // LEGENDARY ATTACK ANIMATIONS - Wind-up → Active → Recovery!
      if (playerAttacking && playerAttackType && attackPhaseRef.current) {
        const attackTime = animTimeRef.current * 15;
        const phase = attackPhaseRef.current;
        
        // Calculate smooth interpolation factors
        const windupProgress = phase === 'windup' ? (attackPhaseTimeRef.current / 0.1) : 1.0;
        const recoveryProgress = phase === 'recovery' ? (attackPhaseTimeRef.current - 0.35) / 0.15 : 0.0;
        
        if (playerAttackType === 'punch') {
          if (phase === 'windup') {
            // WIND-UP - Pull fist back!
            const pullback = windupProgress;
            rightArmRef.current.rotation.z = -Math.PI / 6 * pullback;
            rightArmRef.current.position.x = -0.3 * pullback;
            bodyRef.current.rotation.y = -0.2 * pullback;
          } else if (phase === 'active') {
            // ACTIVE - EXPLOSIVE PUNCH!
            rightArmRef.current.rotation.z = -Math.PI / 1.5;
            rightArmRef.current.position.x = 1.5;
            rightArmRef.current.position.z = 0.5;
            bodyRef.current.rotation.y = 0.4;
            bodyRef.current.position.x = 0.3;
            leftArmRef.current.rotation.z = Math.PI / 4;
          } else {
            // RECOVERY - Return to neutral
            const ease = 1.0 - recoveryProgress;
            rightArmRef.current.rotation.z = -Math.PI / 1.5 * ease;
            rightArmRef.current.position.x = 1.5 * ease;
            rightArmRef.current.position.z = 0.5 * ease;
            bodyRef.current.rotation.y = 0.4 * ease;
            bodyRef.current.position.x = 0.3 * ease;
          }
        } else if (playerAttackType === 'kick') {
          if (phase === 'windup') {
            // WIND-UP - Pull leg back (NO crouch to prevent ground sinking)
            const pullback = windupProgress;
            rightLegRef.current.rotation.x = -Math.PI / 6 * pullback;
            bodyRef.current.rotation.x = 0.2 * pullback;
            leftArmRef.current.rotation.z = Math.PI / 6 * pullback;
          } else if (phase === 'active') {
            // ACTIVE - POWERFUL KICK!
            rightLegRef.current.rotation.x = Math.PI / 2;
            rightLegRef.current.position.z = 1.2;
            bodyRef.current.rotation.x = -0.5;
            bodyRef.current.position.y = 0.4;
            leftArmRef.current.rotation.z = Math.PI / 3;
            rightArmRef.current.rotation.z = -Math.PI / 3;
          } else {
            // RECOVERY
            const ease = 1.0 - recoveryProgress;
            rightLegRef.current.rotation.x = Math.PI / 2 * ease;
            rightLegRef.current.position.z = 1.2 * ease;
            bodyRef.current.rotation.x = -0.5 * ease;
            bodyRef.current.position.y = 0.4 * ease;
          }
        } else if (playerAttackType === 'special') {
          if (phase === 'windup') {
            // WIND-UP - Charge energy (NO crouch to prevent ground sinking)
            const charge = windupProgress;
            bodyRef.current.scale.setScalar(1.0 - charge * 0.1); // Compress
            leftArmRef.current.rotation.z = charge * Math.PI / 6;
            rightArmRef.current.rotation.z = -charge * Math.PI / 6;
            headRef.current.rotation.x = -charge * 0.3; // Lean head back
          } else if (phase === 'active') {
            // ACTIVE - EXPLOSIVE SPECIAL!
            leftArmRef.current.rotation.z = Math.PI / 1.5;
            rightArmRef.current.rotation.z = -Math.PI / 1.5;
            leftArmRef.current.position.y = 0.3;
            rightArmRef.current.position.y = 0.3;
            bodyRef.current.position.y = 0.5 + Math.sin(attackTime) * 0.3;
            bodyRef.current.rotation.y = Math.sin(attackTime) * 0.4;
            bodyRef.current.scale.setScalar(1.0 + Math.sin(attackTime * 2) * 0.15);
          } else {
            // RECOVERY
            const ease = 1.0 - recoveryProgress;
            leftArmRef.current.rotation.z = Math.PI / 1.5 * ease;
            rightArmRef.current.rotation.z = -Math.PI / 1.5 * ease;
            bodyRef.current.position.y = 0.5 * ease;
            bodyRef.current.rotation.y = Math.sin(attackTime) * 0.4 * ease;
            bodyRef.current.scale.setScalar(1.0 + Math.sin(attackTime * 2) * 0.15 * ease);
          }
        }
      } else {
        // Reset attack poses
        bodyRef.current.rotation.x = 0;
        bodyRef.current.scale.setScalar(1.0);
        bodyRef.current.rotation.y = 0;
        
        if (isMovingRef.current) {
          // Walking animation
          const walkSpeed = 8;
          const t = animTimeRef.current * walkSpeed;
          
          leftArmRef.current.rotation.z = Math.sin(t) * 0.4;
          rightArmRef.current.rotation.z = Math.sin(t + Math.PI) * 0.4;
          leftLegRef.current.rotation.x = Math.sin(t) * 0.5;
          rightLegRef.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
          
          // Body bob
          bodyRef.current.position.y = Math.abs(Math.sin(t * 2)) * 0.08;
          headRef.current.rotation.x = Math.sin(t * 2) * 0.05;
        } else if (playerY > 1.0) {
          // Jump animation - spread arms and legs
          leftArmRef.current.rotation.z = 0.8;
          rightArmRef.current.rotation.z = -0.8;
          leftLegRef.current.rotation.x = -0.3;
          rightLegRef.current.rotation.x = -0.3;
          bodyRef.current.rotation.x = 0.2;
        } else {
          // Idle breathing animation
          const breathe = Math.sin(animTimeRef.current * 2) * 0.05;
          bodyRef.current.position.y = breathe;
          headRef.current.rotation.y = breathe * 0.5;
          
          leftArmRef.current.rotation.z = 0.1 + breathe;
          rightArmRef.current.rotation.z = -0.1 - breathe;
          leftLegRef.current.rotation.x = 0;
          rightLegRef.current.rotation.x = 0;
        }
      }
    }
    
  });

  if (!fighter) return null;
  
  // CHARACTER MODEL: always render the optimized beast GLB
  const renderCharacterModel = () => (
    <OptimizedBeastModel
      beast={fighter}
      bodyRef={bodyRef}
      headRef={headRef}
      emotionIntensity={emotionIntensityRef.current}
      hitAnim={hitAnimRef.current}
      animTime={animTimeRef.current}
      isAttacking={playerAttacking}
      isInvulnerable={playerInvulnerable}
      isMoving={isMovingRef.current}
    />
  );
  
  return (
    <group ref={meshRef} position={[playerX, playerY, 0]}>
      {/* Scale and flip based on facing direction */}
      <group scale={playerFacingRight ? [1, 1, 1] : [-1, 1, 1]}>
        {/* Render specialized or generic character model */}
        {renderCharacterModel()}
        
        {/* Attack visual effects */}
        {playerAttacking && (
          <group position={[1.5, 0.5, 0]}>
            <mesh>
              <sphereGeometry args={[0.5, 16, 12]} />
              <meshBasicMaterial 
                color={fighter.accentColor}
                transparent
                opacity={0.7}
              />
            </mesh>
            {playerAttackType === 'special' && (
              <mesh>
                <sphereGeometry args={[0.8, 16, 12]} />
                <meshBasicMaterial 
                  color={fighter.color}
                  transparent
                  opacity={0.4}
                />
              </mesh>
            )}
          </group>
        )}
      </group>
    </group>
  );
}
