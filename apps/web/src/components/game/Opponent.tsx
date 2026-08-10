import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import { soundManager } from "../../lib/soundEffects";
import OptimizedBeastModel from "./models/OptimizedBeastModel";
import AnatomicalBeastModel from "./models/AnatomicalBeastModel";
import { useBeastPreset } from "../../lib/stores/useBeastPreset";

export default function Opponent() {
  const { 
    opponentFighterId, 
    opponentX, 
    opponentY,
    opponentFacingRight,
    opponentAttacking,
    opponentHealth,
    playerX,
    playerY,
    battlePhase,
    timeScale,
    moveOpponent,
    opponentAttack,
    opponentJump
  } = useBattle();
  
  const meshRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  
  const aiStateRef = useRef({
    lastAction: 0,
    nextActionDelay: 1000,
    currentBehavior: 'idle' as 'idle' | 'approach' | 'retreat' | 'attack' | 'jump'
  });
  
  const animTimeRef = useRef(0);
  const emotionIntensityRef = useRef(0);
  const prevHealthRef = useRef(opponentHealth);
  const attackSoundPlayedRef = useRef(false);
  const beastPreset = useBeastPreset((s) => s.preset);

  const fighter = getFighterById(opponentFighterId);
  if (!fighter) return null;
  
  // Simple AI behavior
  useFrame((state, delta) => {
    if (battlePhase !== 'fighting') return;
    
    // Apply time scale for slow-motion
    const scaledDelta = delta * timeScale;
    
    // Update animation time for character models
    animTimeRef.current += scaledDelta;
    
    // Update emotion intensity based on health and attacking
    if (opponentAttacking) {
      emotionIntensityRef.current = 1.0;
    } else if (opponentHealth < 30) {
      emotionIntensityRef.current = 0.8;
    } else {
      emotionIntensityRef.current = Math.max(0, emotionIntensityRef.current - scaledDelta * 2);
    }
    
    const now = Date.now();
    const ai = aiStateRef.current;
    
    // AI decision making
    if (now - ai.lastAction > ai.nextActionDelay) {
      const distanceToPlayer = Math.abs(opponentX - playerX);
      const heightDiff = Math.abs(opponentY - playerY);
      
      // Decide next behavior based on distance and health
      if (opponentHealth < 30) {
        // Low health - be more defensive
        ai.currentBehavior = distanceToPlayer < 3 ? 'retreat' : 'approach';
        ai.nextActionDelay = 800;
      } else if (distanceToPlayer < 2) {
        // Close range - attack or jump
        ai.currentBehavior = Math.random() > 0.3 ? 'attack' : (heightDiff > 1 ? 'jump' : 'retreat');
        ai.nextActionDelay = 600;
      } else if (distanceToPlayer < 5) {
        // Medium range - approach or special attack
        ai.currentBehavior = Math.random() > 0.2 ? 'approach' : 'attack';
        ai.nextActionDelay = 500;
      } else {
        // Far range - approach
        ai.currentBehavior = 'approach';
        ai.nextActionDelay = 700;
      }
      
      ai.lastAction = now;
    }
    
    // Execute current behavior (slowed by timeScale)
    const moveSpeed = 0.08 * timeScale;
    const gravity = -10; // TUNED: Match player gravity!
    
    switch (ai.currentBehavior) {
      case 'approach':
        if (opponentX < playerX) {
          moveOpponent(moveSpeed, useBattle.getState().opponentY);
        } else {
          moveOpponent(-moveSpeed, useBattle.getState().opponentY);
        }
        break;
        
      case 'retreat':
        if (opponentX < playerX) {
          moveOpponent(-moveSpeed, useBattle.getState().opponentY);
        } else {
          moveOpponent(moveSpeed, useBattle.getState().opponentY);
        }
        break;
        
      case 'attack':
        if (!opponentAttacking) {
          const attackTypes: ('punch' | 'kick' | 'special')[] = ['punch', 'kick', 'special'];
          const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)];
          if (randomAttack) {
            opponentAttack(randomAttack);
          }
        }
        break;
        
      case 'jump':
        opponentJump();
        break;
    }
    
    // Apply jump velocity and gravity - SAME as player physics!
    // Re-fetch COMPLETE state after all movements/actions
    const freshState = useBattle.getState();
    let currentY = freshState.opponentY;
    let velocityY = freshState.opponentVelocityY;
    
    if (!freshState.opponentGrounded) {
      // Apply velocity to position (using FRESH Y from store)
      const newY = currentY + velocityY * scaledDelta;
      
      // Apply gravity to velocity
      velocityY += gravity * scaledDelta;
      
      // Check if landed
      if (newY <= 0.8) {
        moveOpponent(0, 0.8);
        useBattle.setState({ opponentVelocityY: 0, opponentGrounded: true });
      } else {
        moveOpponent(0, newY);
        useBattle.setState({ opponentVelocityY: velocityY });
      }
    } else if (currentY > 0.8) {
      // Fallback for edge cases
      moveOpponent(0, 0.8);
      useBattle.setState({ opponentGrounded: true });
    }
  });
  
  // CHARACTER MODELS - Beast Wars roster (no legacy IDs)
  const renderCharacterModel = () => {
    const modelProps = {
      fighter,
      bodyRef,
      headRef,
      leftArmRef,
      rightArmRef,
      leftLegRef,
      rightLegRef,
      emotionIntensity: emotionIntensityRef.current,
      hitAnim: 0,
      animTime: animTimeRef.current,
      isAttacking: opponentAttacking,
      isInvulnerable: false,
      presetOverride: beastPreset === "auto" ? null : beastPreset,
    };

    return <AnatomicalBeastModel {...modelProps} />;
  };
  
  return (
    <group ref={meshRef} position={[opponentX, opponentY, 0]}>
      {/* Scale and flip based on facing direction */}
      <group scale={opponentFacingRight ? [1, 1, 1] : [-1, 1, 1]}>
        {/* Render specialized or generic character model */}
        {renderCharacterModel()}
        
        {/* Attack visual effect */}
        {opponentAttacking && (
          <mesh position={[1.2, 0.5, 0]}>
            <sphereGeometry args={[0.4, 12, 10]} />
            <meshBasicMaterial 
              color={fighter.accentColor}
              transparent
              opacity={0.6}
            />
          </mesh>
        )}
        
        {/* Low health indicator */}
        {opponentHealth < 30 && (
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.3, 12, 10]} />
            <meshBasicMaterial 
              color="#FF0000"
              transparent
              opacity={0.5}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}
