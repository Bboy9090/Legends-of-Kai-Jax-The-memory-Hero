import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";

enum Controls {
  jump = 'jump',
  left = 'left',
  right = 'right',
  punch = 'punch',
  kick = 'kick',
  special = 'special'
}

export default function BattlePlayer() {
  const { 
    playerFighterId, 
    playerX, 
    playerY,
    playerFacingRight,
    playerAttacking,
    playerAttackType,
    playerInvulnerable,
    battlePhase,
    movePlayer,
    playerJump,
    playerAttack
  } = useBattle();
  
  const meshRef = useRef<THREE.Group>(null);
  const [, getKeys] = useKeyboardControls<Controls>();
  
  const fighter = getFighterById(playerFighterId);
  if (!fighter) return null;
  
  // Handle player input
  useFrame((state, delta) => {
    if (battlePhase !== 'fighting') return;
    
    const { left, right, jump, punch, kick, special } = getKeys();
    
    const moveSpeed = 0.1;
    const gravity = -0.5;
    
    // Horizontal movement
    if (left && !playerAttacking) {
      movePlayer(-moveSpeed, playerY);
    } else if (right && !playerAttacking) {
      movePlayer(moveSpeed, playerY);
    }
    
    // Jump
    if (jump) {
      playerJump();
    }
    
    // Attacks
    if (punch && !playerAttacking) {
      playerAttack('punch');
    } else if (kick && !playerAttacking) {
      playerAttack('kick');
    } else if (special && !playerAttacking) {
      playerAttack('special');
    }
    
    // Apply gravity if in air
    if (playerY > 0.8) {
      movePlayer(0, Math.max(0.8, playerY + gravity * delta));
    }
  });
  
  return (
    <group ref={meshRef} position={[playerX, playerY, 0]}>
      {/* Scale and flip based on facing direction */}
      <group scale={playerFacingRight ? [1, 1, 1] : [-1, 1, 1]}>
        {/* Body - Sonic-style proportions */}
        <group position={[0, 0.4, 0]}>
          {/* Huge Head */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <sphereGeometry args={[1.0, 24, 18]} />
            <meshToonMaterial 
              color={fighter.color}
              emissive={fighter.accentColor}
              emissiveIntensity={playerInvulnerable ? 0.5 : 0.1}
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
          <mesh position={[-0.6, -0.3, 0]} rotation={[0, 0, playerAttacking ? -Math.PI / 3 : 0.2]} castShadow>
            <capsuleGeometry args={[0.15, 0.6, 8, 16]} />
            <meshToonMaterial color={fighter.color} />
          </mesh>
          <mesh position={[0.6, -0.3, 0]} rotation={[0, 0, playerAttacking ? Math.PI / 3 : -0.2]} castShadow>
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
        
        {/* Invulnerability flash */}
        {playerInvulnerable && (
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[1.5, 16, 12]} />
            <meshBasicMaterial 
              color="#FFFFFF"
              transparent
              opacity={0.3}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}
