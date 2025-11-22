import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import JaxonModel from "./models/JaxonModel";
import KaisonModel from "./models/KaisonModel";

// Use the same Controls enum as App.tsx
enum Controls {
  jump = 'jump',
  left = 'left',
  right = 'right',
  punch = 'punch',
  kick = 'kick',
  special = 'special',
  pause = 'pause',
  slide = 'slide',
  dash = 'dash',
  webSwing = 'webSwing',
  chargeKick = 'chargeKick',
  transform = 'transform',
  energyBlast = 'energyBlast'
}

export default function BattlePlayer() {
  const { 
    playerFighterId, 
    playerX, 
    playerY,
    playerZ, // 3D depth position
    playerRotation, // Facing angle in radians
    playerFacingRight, // Legacy - computed from rotation
    playerAttacking,
    playerAttackType,
    playerAttackPhase, // NEW: windup/contact/followthrough/recovery
    playerInvulnerable,
    playerHealth,
    playerMomentum, // NEW: Forward momentum (0-1)
    playerBalance, // NEW: Center of gravity stability (0-1)
    playerStance, // NEW: Stance data (weight distribution, hip rotation)
    playerCenterOfGravity, // NEW: CG tracking
    playerRecoveryFrames, // NEW: Vulnerability window
    playerOptimalDistance, // NEW: Ideal fighting range
    battlePhase,
    winner,
    timeScale,
    movePlayer,
    playerJump,
    playerAttack,
    updatePlayerBalance, // NEW: Balance physics
    updatePlayerMomentum, // NEW: Momentum decay
    updatePlayerRecoveryFrames // NEW: Recovery frame decay
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
  const prevYRef = useRef(0.8);
  const hitAnimRef = useRef(0);
  const prevHealthRef = useRef(100);
  
  // LEGENDARY ANIMATION SYSTEM - Attack phases for smooth transitions!
  const attackPhaseRef = useRef<'windup' | 'active' | 'recovery' | null>(null);
  const attackPhaseTimeRef = useRef(0);
  const emotionIntensityRef = useRef(0); // For facial expressions!
  
  const [, getKeys] = useKeyboardControls<Controls>();
  
  const fighter = getFighterById(playerFighterId);
  if (!fighter) return null;
  
  // Handle player input and animations
  useFrame((state, delta) => {
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
    const { left, right, jump, punch, kick, special } = getKeys();
    
    // Apply time scale to movement and physics  
    const moveSpeed = 0.2 * timeScale; // DOUBLED movement speed for visibility!
    const gravity = -10; // TUNED: Balanced for 0.8s airtime AND 1.8 unit apex!
    
    // Track movement
    isMovingRef.current = (left || right) && !playerAttacking;
    
    // Horizontal movement (slowed by timeScale) - ALWAYS use LATEST Y from store!
    if (left && !playerAttacking) {
      movePlayer(-moveSpeed, useBattle.getState().playerY);
    } else if (right && !playerAttacking) {
      movePlayer(moveSpeed, useBattle.getState().playerY);
    }
    
    // Jump - NOW WORKS!
    if (jump) {
      playerJump();
    }
    
    // Attacks - NOW MORE RESPONSIVE!
    if (punch && !playerAttacking) {
      playerAttack('punch');
    } else if (kick && !playerAttacking) {
      playerAttack('kick');
    } else if (special && !playerAttacking) {
      playerAttack('special');
    }
    
    // Re-fetch COMPLETE state after all movements/actions
    const freshState = useBattle.getState();
    let currentY = freshState.playerY;
    let velocityY = freshState.playerVelocityY;
    
    if (!freshState.playerGrounded) {
      // Apply velocity to position (using FRESH Y from store)
      const newY = currentY + velocityY * scaledDelta;
      
      // Apply gravity to velocity
      velocityY += gravity * scaledDelta;
      
      // Check if landed
      if (newY <= 0.8) {
        movePlayer(0, 0.8);
        useBattle.setState({ playerVelocityY: 0, playerGrounded: true });
      } else {
        movePlayer(0, newY);
        useBattle.setState({ playerVelocityY: velocityY });
      }
    } else if (currentY > 0.8) {
      // Fallback for edge cases
      movePlayer(0, 0.8);
      useBattle.setState({ playerGrounded: true });
    }
    
    // UPDATE BALANCE & MOMENTUM & RECOVERY FRAME PHYSICS - Critical for dynamic combat!
    updatePlayerBalance(scaledDelta);
    updatePlayerMomentum(scaledDelta);
    updatePlayerRecoveryFrames(scaledDelta);
    
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
      const recoveryDuration = 0.15; // Quick recovery
      
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
    
    prevYRef.current = playerY;
  });
  
  // LEGENDARY CHARACTER MODELS - Use specialized designs for Jaxon & Kaison!
  const renderCharacterModel = () => {
    if (playerFighterId === 'jaxon') {
      return (
        <JaxonModel 
          bodyRef={bodyRef}
          headRef={headRef}
          leftArmRef={leftArmRef}
          rightArmRef={rightArmRef}
          leftLegRef={leftLegRef}
          rightLegRef={rightLegRef}
          emotionIntensity={emotionIntensityRef.current}
          hitAnim={hitAnimRef.current}
          animTime={animTimeRef.current}
          isAttacking={playerAttacking}
          isInvulnerable={playerInvulnerable}
        />
      );
    }
    
    if (playerFighterId === 'kaison') {
      return (
        <KaisonModel 
          bodyRef={bodyRef}
          headRef={headRef}
          leftArmRef={leftArmRef}
          rightArmRef={rightArmRef}
          leftLegRef={leftLegRef}
          rightLegRef={rightLegRef}
          emotionIntensity={emotionIntensityRef.current}
          hitAnim={hitAnimRef.current}
          animTime={animTimeRef.current}
          isAttacking={playerAttacking}
          isInvulnerable={playerInvulnerable}
        />
      );
    }
    
    // Generic model for all other fighters
    return (
      <group ref={bodyRef} position={[0, 0.4, 0]}>
        {/* DETAILED HEAD */}
        <group ref={headRef} position={[0, 0.6, 0]}>
          {/* Main head - hero helmet with EMOTION! */}
          <mesh castShadow>
            <sphereGeometry args={[0.5, 32, 24]} />
            <meshToonMaterial 
              color={fighter.color}
              emissive={fighter.accentColor}
              emissiveIntensity={playerInvulnerable ? 0.8 : (0.3 + emotionIntensityRef.current * 0.4)}
            />
          </mesh>
            
            {/* Helmet glow rim - INTENSIFIES with emotion! */}
            <mesh scale={1.05 + emotionIntensityRef.current * 0.1}>
              <sphereGeometry args={[0.5, 32, 24]} />
              <meshBasicMaterial 
                color={fighter.accentColor}
                transparent
                opacity={0.3 + emotionIntensityRef.current * 0.4}
                depthWrite={false}
              />
            </mesh>
            
            {/* Visor/Eyes - BLAZING when emotional! */}
            <mesh position={[0.15, 0.1, 0.45]} castShadow>
              <boxGeometry args={[0.35, 0.15, 0.1]} />
              <meshBasicMaterial 
                color={fighter.accentColor}
              />
            </mesh>
            <mesh position={[0.15, 0.1, 0.46]} scale={1.1 + emotionIntensityRef.current * 0.3}>
              <boxGeometry args={[0.35, 0.15, 0.05]} />
              <meshBasicMaterial 
                color={hitAnimRef.current > 0 ? '#FF0000' : fighter.accentColor} // RED when hit!
                transparent
                opacity={0.6 + emotionIntensityRef.current * 0.4}
              />
            </mesh>
            
            {/* EMOTION AURA - appears during intense moments! */}
            {emotionIntensityRef.current > 0.5 && (
              <mesh scale={1.2 + Math.sin(animTimeRef.current * 10) * 0.1}>
                <sphereGeometry args={[0.5, 16, 12]} />
                <meshBasicMaterial 
                  color={hitAnimRef.current > 0 ? '#FF0000' : fighter.accentColor}
                  transparent
                  opacity={emotionIntensityRef.current * 0.3}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )}
            
            {/* Helmet detail stripe */}
            <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 6]}>
              <boxGeometry args={[0.8, 0.1, 0.6]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
          
          {/* MUSCULAR TORSO with costume details */}
          <mesh position={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[0.7, 0.9, 0.5]} />
            <meshToonMaterial 
              color={fighter.color}
              emissive={fighter.color}
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Chest emblem/logo */}
          <mesh position={[0, 0, 0.26]} castShadow>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshToonMaterial 
              color={fighter.accentColor}
              emissive={fighter.accentColor}
              emissiveIntensity={1.0}
            />
          </mesh>
          
          {/* Belt */}
          <mesh position={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.75, 0.15, 0.52]} />
            <meshToonMaterial color={fighter.accentColor} />
          </mesh>
          
          {/* ENHANCED ARMS with shoulder pads */}
          <group ref={leftArmRef} position={[-0.5, 0.1, 0]}>
            {/* Shoulder pad */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <sphereGeometry args={[0.22, 16, 12]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            {/* Upper arm */}
            <mesh position={[0, -0.25, 0]} castShadow>
              <capsuleGeometry args={[0.12, 0.4, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* Forearm */}
            <mesh position={[0, -0.65, 0]} castShadow>
              <capsuleGeometry args={[0.10, 0.4, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* Glowing glove/hand */}
            <mesh position={[0, -0.95, 0]} castShadow>
              <boxGeometry args={[0.18, 0.25, 0.18]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.6}
              />
            </mesh>
          </group>
          
          <group ref={rightArmRef} position={[0.5, 0.1, 0]}>
            {/* Shoulder pad */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <sphereGeometry args={[0.22, 16, 12]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            {/* Upper arm */}
            <mesh position={[0, -0.25, 0]} castShadow>
              <capsuleGeometry args={[0.12, 0.4, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* Forearm */}
            <mesh position={[0, -0.65, 0]} castShadow>
              <capsuleGeometry args={[0.10, 0.4, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* Glowing glove/hand */}
            <mesh position={[0, -0.95, 0]} castShadow>
              <boxGeometry args={[0.18, 0.25, 0.18]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.6}
              />
            </mesh>
          </group>
          
          {/* POWERFUL LEGS with knee pads */}
          <group ref={leftLegRef} position={[-0.2, -0.7, 0]}>
            {/* Thigh */}
            <mesh position={[0, -0.05, 0]} castShadow>
              <capsuleGeometry args={[0.14, 0.5, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* Knee pad */}
            <mesh position={[0, -0.35, 0.1]} castShadow>
              <sphereGeometry args={[0.18, 16, 12]} />
              <meshToonMaterial color={fighter.accentColor} />
            </mesh>
            {/* Lower leg */}
            <mesh position={[0, -0.65, 0]} castShadow>
              <capsuleGeometry args={[0.12, 0.45, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* EPIC Boot */}
            <mesh position={[0, -1.0, 0.15]} castShadow>
              <boxGeometry args={[0.28, 0.35, 0.6]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
          
          <group ref={rightLegRef} position={[0.2, -0.7, 0]}>
            {/* Thigh */}
            <mesh position={[0, -0.05, 0]} castShadow>
              <capsuleGeometry args={[0.14, 0.5, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* Knee pad */}
            <mesh position={[0, -0.35, 0.1]} castShadow>
              <sphereGeometry args={[0.18, 16, 12]} />
              <meshToonMaterial color={fighter.accentColor} />
            </mesh>
            {/* Lower leg */}
            <mesh position={[0, -0.65, 0]} castShadow>
              <capsuleGeometry args={[0.12, 0.45, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* EPIC Boot */}
            <mesh position={[0, -1.0, 0.15]} castShadow>
              <boxGeometry args={[0.28, 0.35, 0.6]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
          
          {/* ENERGY AURA - constantly glowing! */}
          <mesh position={[0, 0, 0]} scale={1.3}>
            <sphereGeometry args={[0.8, 24, 18]} />
            <meshBasicMaterial 
              color={fighter?.accentColor || '#FFFFFF'}
              transparent
              opacity={0.15}
              depthWrite={false}
            />
          </mesh>
        </group>
    );
  };
  
  return (
    <group ref={meshRef} position={[playerX, playerY, playerZ]} rotation={[0, playerRotation, 0]}>
      {/* No need to flip scale - rotation handles facing direction */}
      <group>
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
        
        {/* BALANCE METER - Shows center of gravity stability */}
        <group position={[-1.5, 2.5, 0]}>
          {/* Background bar */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.0, 0.15]} />
            <meshBasicMaterial color="#333333" transparent opacity={0.6} />
          </mesh>
          {/* Balance fill - Green when balanced, red when unstable */}
          <mesh position={[-(1.0 - playerBalance * 1.0) / 2, 0, 0]}>
            <planeGeometry args={[playerBalance * 1.0, 0.12]} />
            <meshBasicMaterial 
              color={playerBalance > 0.7 ? '#00FF00' : playerBalance > 0.4 ? '#FFFF00' : '#FF0000'} 
              transparent 
              opacity={0.9} 
            />
          </mesh>
          {/* Label */}
          <mesh position={[0, 0.2, 0]}>
            <planeGeometry args={[0.6, 0.1]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.5} />
          </mesh>
        </group>
        
        {/* MOMENTUM INDICATOR - Shows forward momentum */}
        <group position={[1.5, 2.5, 0]}>
          {/* Background bar */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.0, 0.15]} />
            <meshBasicMaterial color="#333333" transparent opacity={0.6} />
          </mesh>
          {/* Momentum fill - Cyan/blue gradient */}
          <mesh position={[-(1.0 - playerMomentum * 1.0) / 2, 0, 0]}>
            <planeGeometry args={[playerMomentum * 1.0, 0.12]} />
            <meshBasicMaterial 
              color={playerMomentum > 0.7 ? '#00FFFF' : '#0088FF'} 
              transparent 
              opacity={0.9} 
            />
          </mesh>
        </group>
        
        {/* STANCE VISUALIZATION - Shows hip rotation and weight distribution */}
        {playerStance && (
          <group position={[0, -0.5, 0]}>
            {/* Hip rotation indicator - Line showing rotation angle */}
            <mesh rotation={[0, 0, playerStance.hipRotation]}>
              <boxGeometry args={[0.8, 0.05, 0.05]} />
              <meshBasicMaterial 
                color={fighter.accentColor} 
                transparent 
                opacity={0.7} 
              />
            </mesh>
            {/* Weight distribution circles - Size shows weight on each foot */}
            <mesh position={[-0.3, -0.2, 0]}>
              <circleGeometry args={[0.15 * playerStance.weightFront, 16]} />
              <meshBasicMaterial 
                color="#FFFF00" 
                transparent 
                opacity={0.6} 
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0.3, -0.2, 0]}>
              <circleGeometry args={[0.15 * (1.0 - playerStance.weightFront), 16]} />
              <meshBasicMaterial 
                color="#FFAA00" 
                transparent 
                opacity={0.6} 
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}
        
        {/* ATTACK PHASE INDICATOR - Shows wind-up/contact/recovery */}
        {playerAttackPhase && playerAttackPhase !== 'none' && (
          <group position={[0, 3, 0]}>
            <mesh>
              <sphereGeometry args={[0.2, 16, 12]} />
              <meshBasicMaterial 
                color={
                  playerAttackPhase === 'windup' ? '#FFFF00' :
                  playerAttackPhase === 'contact' ? '#FF0000' :
                  playerAttackPhase === 'followthrough' ? '#FF8800' :
                  '#888888'
                }
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
