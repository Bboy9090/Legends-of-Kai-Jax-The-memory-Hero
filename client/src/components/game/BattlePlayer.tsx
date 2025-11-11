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
    playerHealth,
    battlePhase,
    winner,
    timeScale,
    movePlayer,
    playerJump,
    playerAttack
  } = useBattle();
  
  const meshRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  
  const animTimeRef = useRef(0);
  const isMovingRef = useRef(false);
  const prevYRef = useRef(0.8);
  const hitAnimRef = useRef(0);
  const prevHealthRef = useRef(100);
  
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
    const moveSpeed = 0.1 * timeScale;
    const gravity = -0.5;
    
    // Track movement
    isMovingRef.current = (left || right) && !playerAttacking;
    
    // Horizontal movement (slowed by timeScale)
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
    
    // Apply gravity if in air (slowed by timeScale)
    if (playerY > 0.8) {
      movePlayer(0, Math.max(0.8, playerY + gravity * scaledDelta));
    }
    
    // Detect hit (health decreased)
    if (playerHealth < prevHealthRef.current) {
      hitAnimRef.current = 0.3; // Hit reaction duration
    }
    prevHealthRef.current = playerHealth;
    
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
      
      // Attack animations
      if (playerAttacking && playerAttackType) {
        const attackTime = animTimeRef.current * 10;
        
        if (playerAttackType === 'punch') {
          // Punch - extend arm
          rightArmRef.current.rotation.z = -Math.PI / 2;
          rightArmRef.current.position.x = 0.8;
          bodyRef.current.rotation.y = 0.2;
        } else if (playerAttackType === 'kick') {
          // Kick - extend leg
          rightLegRef.current.rotation.x = Math.PI / 3;
          bodyRef.current.rotation.x = -0.3;
        } else if (playerAttackType === 'special') {
          // Special - dramatic pose
          leftArmRef.current.rotation.z = Math.PI / 2;
          rightArmRef.current.rotation.z = -Math.PI / 2;
          bodyRef.current.position.y = 0.2 + Math.sin(attackTime) * 0.1;
          bodyRef.current.rotation.y = Math.sin(attackTime) * 0.2;
        }
      } else {
        // Reset attack poses
        bodyRef.current.rotation.x = 0;
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
