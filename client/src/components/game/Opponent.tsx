import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";

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
  const aiStateRef = useRef({
    lastAction: 0,
    nextActionDelay: 1000,
    currentBehavior: 'idle' as 'idle' | 'approach' | 'retreat' | 'attack' | 'jump'
  });
  
  const fighter = getFighterById(opponentFighterId);
  if (!fighter) return null;
  
  // Simple AI behavior
  useFrame((state, delta) => {
    if (battlePhase !== 'fighting') return;
    
    // Apply time scale for slow-motion
    const scaledDelta = delta * timeScale;
    
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
    const gravity = -0.5;
    
    switch (ai.currentBehavior) {
      case 'approach':
        if (opponentX < playerX) {
          moveOpponent(moveSpeed, opponentY);
        } else {
          moveOpponent(-moveSpeed, opponentY);
        }
        break;
        
      case 'retreat':
        if (opponentX < playerX) {
          moveOpponent(-moveSpeed, opponentY);
        } else {
          moveOpponent(moveSpeed, opponentY);
        }
        break;
        
      case 'attack':
        if (!opponentAttacking) {
          const attackTypes: ('punch' | 'kick' | 'special')[] = ['punch', 'kick', 'special'];
          const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)];
          opponentAttack(randomAttack);
        }
        break;
        
      case 'jump':
        opponentJump();
        break;
    }
    
    // Apply simple gravity if in air (slowed by timeScale)
    if (opponentY > 0.8) {
      moveOpponent(0, Math.max(0.8, opponentY + gravity * scaledDelta));
    }
  });
  
  return (
    <group ref={meshRef} position={[opponentX, opponentY, 0]}>
      {/* Scale and flip based on facing direction */}
      <group scale={opponentFacingRight ? [1, 1, 1] : [-1, 1, 1]}>
        {/* Body - Sonic-style proportions */}
        <group position={[0, 0.4, 0]}>
          {/* Huge Head */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <sphereGeometry args={[1.0, 24, 18]} />
            <meshToonMaterial 
              color={fighter.color}
              emissive={fighter.accentColor}
              emissiveIntensity={opponentHealth < 30 ? 0.3 : 0.1}
            />
          </mesh>
          
          {/* Eyes */}
          <mesh position={[0.3, 0.7, 0.8]} castShadow>
            <sphereGeometry args={[0.25, 16, 12]} />
            <meshToonMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.3, 0.7, 0.95]}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <meshToonMaterial color="#000000" />
          </mesh>
          
          {/* Short Wide Torso */}
          <mesh position={[0, -0.4, 0]} castShadow>
            <boxGeometry args={[1.0, 0.8, 0.7]} />
            <meshToonMaterial color={fighter.color} />
          </mesh>
          
          {/* Arms */}
          <mesh position={[-0.6, -0.3, 0]} rotation={[0, 0, opponentAttacking ? -Math.PI / 3 : 0.2]} castShadow>
            <capsuleGeometry args={[0.15, 0.6, 8, 16]} />
            <meshToonMaterial color={fighter.color} />
          </mesh>
          <mesh position={[0.6, -0.3, 0]} rotation={[0, 0, opponentAttacking ? Math.PI / 3 : -0.2]} castShadow>
            <capsuleGeometry args={[0.15, 0.6, 8, 16]} />
            <meshToonMaterial color={fighter.color} />
          </mesh>
          
          {/* Legs */}
          <mesh position={[-0.3, -1.0, 0]} castShadow>
            <capsuleGeometry args={[0.18, 0.5, 8, 16]} />
            <meshToonMaterial color={fighter.color} />
          </mesh>
          <mesh position={[0.3, -1.0, 0]} castShadow>
            <capsuleGeometry args={[0.18, 0.5, 8, 16]} />
            <meshToonMaterial color={fighter.color} />
          </mesh>
          
          {/* Massive Shoes */}
          <mesh position={[-0.3, -1.6, 0.1]} castShadow>
            <boxGeometry args={[0.5, 0.4, 1.0]} />
            <meshToonMaterial color={fighter.accentColor} />
          </mesh>
          <mesh position={[0.3, -1.6, 0.1]} castShadow>
            <boxGeometry args={[0.5, 0.4, 1.0]} />
            <meshToonMaterial color={fighter.accentColor} />
          </mesh>
        </group>
        
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
