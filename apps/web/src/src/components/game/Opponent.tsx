import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import JaxonModel from "./models/JaxonModel";
import KaisonModel from "./models/KaisonModel";
import SpeedyModel from "./models/SpeedyModel";
import MarloModel from "./models/MarloModel";
import LeonardoModel from "./models/LeonardoModel";
import MidnightModel from "./models/MidnightModel";
import FlynnModel from "./models/FlynnModel";
import SparkyModel from "./models/SparkyModel";
import BubbleModel from "./models/BubbleModel";
import KingSpikeModel from "./models/KingSpikeModel";
import CaptainBlazeModel from "./models/CaptainBlazeModel";
import NovaKnightModel from "./models/NovaKnightModel";

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
          opponentAttack(randomAttack);
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
  
  // CHARACTER MODELS - All fighters have unique designs!
  const renderCharacterModel = () => {
    const modelProps = {
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
      isInvulnerable: false
    };

    switch (opponentFighterId) {
      case 'jaxon':
        return <JaxonModel {...modelProps} />;
      case 'kaison':
        return <KaisonModel {...modelProps} />;
      case 'speedy':
        return <SpeedyModel {...modelProps} />;
      case 'marlo':
        return <MarloModel {...modelProps} />;
      case 'leonardo':
        return <LeonardoModel {...modelProps} />;
      case 'midnight':
        return <MidnightModel {...modelProps} />;
      case 'flynn':
        return <FlynnModel {...modelProps} />;
      case 'sparky':
        return <SparkyModel {...modelProps} />;
      case 'bubble':
        return <BubbleModel {...modelProps} />;
      case 'kingspike':
        return <KingSpikeModel {...modelProps} />;
      case 'captainblaze':
        return <CaptainBlazeModel {...modelProps} />;
      case 'novaknight':
        return <NovaKnightModel {...modelProps} />;
    }
    
    // Fallback generic model for any missing fighters
    return (
      <group ref={bodyRef} position={[0, 0.4, 0]}>
        {/* DETAILED HEAD */}
        <group ref={headRef} position={[0, 0.6, 0]}>
          {/* Main head - villain helmet */}
          <mesh castShadow>
            <sphereGeometry args={[0.5, 32, 24]} />
            <meshToonMaterial 
              color={fighter.color}
              emissive={fighter.accentColor}
              emissiveIntensity={opponentHealth < 30 ? 0.8 : 0.3}
            />
          </mesh>
            
            {/* Helmet menacing glow */}
            <mesh scale={1.05}>
              <sphereGeometry args={[0.5, 32, 24]} />
              <meshBasicMaterial 
                color={fighter.accentColor}
                transparent
                opacity={opponentHealth < 30 ? 0.5 : 0.25}
                depthWrite={false}
              />
            </mesh>
            
            {/* Evil eyes - glowing red! */}
            <mesh position={[0.15, 0.1, 0.45]} castShadow>
              <boxGeometry args={[0.35, 0.12, 0.1]} />
              <meshBasicMaterial color={fighter.accentColor} />
            </mesh>
            <mesh position={[0.15, 0.1, 0.46]} scale={1.1}>
              <boxGeometry args={[0.35, 0.12, 0.05]} />
              <meshBasicMaterial 
                color={fighter.accentColor}
                transparent
                opacity={0.7}
              />
            </mesh>
            
            {/* Helmet horns/crests */}
            <mesh position={[-0.3, 0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.15, 0.4, 0.15]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            <mesh position={[0.3, 0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.15, 0.4, 0.15]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
          
          {/* ARMORED TORSO */}
          <mesh position={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[0.7, 0.9, 0.5]} />
            <meshToonMaterial 
              color={fighter.color}
              emissive={fighter.color}
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Chest armor plate */}
          <mesh position={[0, 0.1, 0.26]} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.05]} />
            <meshToonMaterial 
              color={fighter.accentColor}
              emissive={fighter.accentColor}
              emissiveIntensity={0.6}
            />
          </mesh>
          
          {/* Power core in chest */}
          <mesh position={[0, 0.1, 0.28]} castShadow>
            <sphereGeometry args={[0.15, 16, 12]} />
            <meshBasicMaterial 
              color={fighter.accentColor}
            />
          </mesh>
          
          {/* Belt with buckle */}
          <mesh position={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.75, 0.15, 0.52]} />
            <meshToonMaterial color={fighter.accentColor} />
          </mesh>
          <mesh position={[0, -0.5, 0.27]} castShadow>
            <boxGeometry args={[0.2, 0.2, 0.05]} />
            <meshToonMaterial 
              color={fighter.color}
              emissive={fighter.color}
              emissiveIntensity={0.5}
            />
          </mesh>
          
          {/* POWERFUL ARMS with spikes */}
          <group position={[-0.5, 0.1, 0]}>
            {/* Spiked shoulder */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <sphereGeometry args={[0.24, 16, 12]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.5}
              />
            </mesh>
            <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.12, 0.25, 8]} />
              <meshToonMaterial color={fighter.accentColor} />
            </mesh>
            {/* Upper arm */}
            <mesh position={[0, -0.25, 0]} castShadow>
              <capsuleGeometry args={[0.13, 0.4, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* Forearm with armor bands */}
            <mesh position={[0, -0.65, 0]} castShadow>
              <capsuleGeometry args={[0.11, 0.4, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            <mesh position={[0, -0.55, 0]} castShadow>
              <cylinderGeometry args={[0.14, 0.14, 0.1, 12]} />
              <meshToonMaterial color={fighter.accentColor} />
            </mesh>
            {/* Clawed gauntlet */}
            <mesh position={[0, -0.95, 0]} castShadow>
              <boxGeometry args={[0.20, 0.28, 0.20]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.7}
              />
            </mesh>
          </group>
          
          <group position={[0.5, 0.1, 0]}>
            {/* Spiked shoulder */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <sphereGeometry args={[0.24, 16, 12]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.5}
              />
            </mesh>
            <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.12, 0.25, 8]} />
              <meshToonMaterial color={fighter.accentColor} />
            </mesh>
            {/* Upper arm */}
            <mesh position={[0, -0.25, 0]} castShadow>
              <capsuleGeometry args={[0.13, 0.4, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* Forearm with armor bands */}
            <mesh position={[0, -0.65, 0]} castShadow>
              <capsuleGeometry args={[0.11, 0.4, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            <mesh position={[0, -0.55, 0]} castShadow>
              <cylinderGeometry args={[0.14, 0.14, 0.1, 12]} />
              <meshToonMaterial color={fighter.accentColor} />
            </mesh>
            {/* Clawed gauntlet */}
            <mesh position={[0, -0.95, 0]} castShadow>
              <boxGeometry args={[0.20, 0.28, 0.20]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.7}
              />
            </mesh>
          </group>
          
          {/* ARMORED LEGS */}
          <group position={[-0.2, -0.7, 0]}>
            {/* Thigh armor */}
            <mesh position={[0, -0.05, 0]} castShadow>
              <capsuleGeometry args={[0.15, 0.5, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* Spiked knee pad */}
            <mesh position={[0, -0.35, 0.1]} castShadow>
              <sphereGeometry args={[0.2, 16, 12]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            <mesh position={[0, -0.35, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.08, 0.2, 8]} />
              <meshToonMaterial color={fighter.accentColor} />
            </mesh>
            {/* Lower leg */}
            <mesh position={[0, -0.65, 0]} castShadow>
              <capsuleGeometry args={[0.13, 0.45, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* Heavy battle boot */}
            <mesh position={[0, -1.0, 0.15]} castShadow>
              <boxGeometry args={[0.30, 0.38, 0.65]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
          
          <group position={[0.2, -0.7, 0]}>
            {/* Thigh armor */}
            <mesh position={[0, -0.05, 0]} castShadow>
              <capsuleGeometry args={[0.15, 0.5, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* Spiked knee pad */}
            <mesh position={[0, -0.35, 0.1]} castShadow>
              <sphereGeometry args={[0.2, 16, 12]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            <mesh position={[0, -0.35, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.08, 0.2, 8]} />
              <meshToonMaterial color={fighter.accentColor} />
            </mesh>
            {/* Lower leg */}
            <mesh position={[0, -0.65, 0]} castShadow>
              <capsuleGeometry args={[0.13, 0.45, 12, 16]} />
              <meshToonMaterial color={fighter.color} />
            </mesh>
            {/* Heavy battle boot */}
            <mesh position={[0, -1.0, 0.15]} castShadow>
              <boxGeometry args={[0.30, 0.38, 0.65]} />
              <meshToonMaterial 
                color={fighter.accentColor}
                emissive={fighter.accentColor}
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
          
          {/* MENACING AURA */}
          <mesh position={[0, 0, 0]} scale={1.3}>
            <sphereGeometry args={[0.8, 24, 18]} />
            <meshBasicMaterial 
              color={fighter?.accentColor || '#FF0000'}
              transparent
              opacity={opponentHealth < 30 ? 0.25 : 0.12}
              depthWrite={false}
            />
          </mesh>
        </group>
    );
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
