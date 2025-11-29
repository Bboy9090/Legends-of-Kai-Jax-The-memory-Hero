import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useFluidCombat, COMBO_MOVES, AttackType, getMovementProfile } from '../../lib/stores/useFluidCombat';
import { Character, CharacterRole } from '../../lib/roster';

// Import specialized character models for spot-on designs
import MarloModel from './models/MarloModel';
import SpeedyModel from './models/SpeedyModel';
import SparkyModel from './models/SparkyModel';
import BubbleModel from './models/BubbleModel';
import KingSpikeModel from './models/KingSpikeModel';
import CaptainBlazeModel from './models/CaptainBlazeModel';
import NovaKnightModel from './models/NovaKnightModel';
import LeonardoModel from './models/LeonardoModel';
import MidnightModel from './models/MidnightModel';
import FlynnModel from './models/FlynnModel';
import JaxonModel from './models/JaxonModel';
import KaisonModel from './models/KaisonModel';
import HeroOfTimeModel from './models/HeroOfTimeModel';
import PrincessPeachModel from './models/PrincessPeachModel';
import DinoRiderModel from './models/DinoRiderModel';
import JungleKingModel from './models/JungleKingModel';
import TwinTailsModel from './models/TwinTailsModel';
import WisdomPrincessModel from './models/WisdomPrincessModel';

const ROLE_COLORS: Record<CharacterRole, string> = {
  'Vanguard': '#ef4444',
  'Blitzer': '#3b82f6',
  'Mystic': '#a855f7',
  'Support': '#22c55e',
  'Wildcard': '#f59e0b',
  'Tank': '#6b7280',
  'Sniper': '#ec4899',
  'Controller': '#06b6d4',
};

const ROLE_ACCENT_COLORS: Record<CharacterRole, string> = {
  'Vanguard': '#fca5a5',
  'Blitzer': '#93c5fd',
  'Mystic': '#d8b4fe',
  'Support': '#86efac',
  'Wildcard': '#fcd34d',
  'Tank': '#9ca3af',
  'Sniper': '#f9a8d4',
  'Controller': '#67e8f9',
};

interface FluidCombatPlayerProps {
  character: Character;
  onDamageDealt?: (damage: number, position: [number, number, number]) => void;
}

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
  lightAttack = 'lightAttack',
  heavyAttack = 'heavyAttack',
  launcher = 'launcher',
  special = 'special',
  ultimate = 'ultimate',
  dodge = 'dodge',
  run = 'run',
}

export default function FluidCombatPlayer({ character, onDamageDealt }: FluidCombatPlayerProps) {
  const meshRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  
  const animTimeRef = useRef(0);
  const emotionRef = useRef(0);
  const hitFlashRef = useRef(0);
  const lastDamageTimeRef = useRef(0);
  
  const [, getKeys] = useKeyboardControls<Controls>();
  
  const {
    playerX, playerY, playerZ, playerRotation, playerGrounded,
    currentAttack, attackPhase, comboCount, canCancel, isRunning,
    isDashing, iFrames, specialMeter, ultimateMeter, comboDamage,
    setMoveInput, movePlayer, jump, dash, setRunning,
    lightAttack, heavyAttack, launchAttack, specialAttack, ultimateAttack,
    updateCombat, lastHitTime, isInAttackRange,
  } = useFluidCombat();
  
  // Handle input and update combat
  useFrame((state, delta) => {
    animTimeRef.current += delta;
    
    const keys = getKeys();
    
    // Calculate movement input (relative to camera for intuitive controls)
    let moveX = 0;
    let moveZ = 0;
    
    if (keys.left) moveX -= 1;
    if (keys.right) moveX += 1;
    if (keys.forward) moveZ -= 1;
    if (keys.back) moveZ += 1;
    
    // Normalize diagonal movement
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      moveX /= len;
      moveZ /= len;
    }
    
    setMoveInput(moveX, moveZ);
    
    // Handle run toggle (Ctrl key)
    setRunning(keys.run);
    
    // Handle inputs
    if (keys.jump) jump();
    if (keys.dodge) dash();
    if (keys.lightAttack) lightAttack();
    if (keys.heavyAttack) heavyAttack();
    if (keys.launcher) launchAttack();
    if (keys.special) specialAttack();
    if (keys.ultimate) ultimateAttack();
    
    // Update physics and combat
    movePlayer(delta);
    updateCombat(delta);
    
    // Update mesh position
    if (meshRef.current) {
      meshRef.current.position.x = playerX;
      meshRef.current.position.y = playerY;
      meshRef.current.position.z = playerZ;
      meshRef.current.rotation.y = playerRotation;
    }
    
    // Animate character based on state
    animateCharacter(delta, state.clock.elapsedTime);
    
    // Track damage for effects
    if (lastHitTime !== lastDamageTimeRef.current) {
      lastDamageTimeRef.current = lastHitTime;
      hitFlashRef.current = 0.15;
      emotionRef.current = 1.0;
      
      // Notify parent of damage
      if (onDamageDealt && currentAttack) {
        const move = COMBO_MOVES[currentAttack];
        onDamageDealt(move.damage, [playerX + Math.sin(playerRotation) * 2, playerY + 1, playerZ + Math.cos(playerRotation) * 2]);
      }
    }
    
    // Fade effects
    if (hitFlashRef.current > 0) hitFlashRef.current -= delta;
    if (emotionRef.current > 0) emotionRef.current -= delta * 2;
  });
  
  const animateCharacter = (delta: number, time: number) => {
    if (!bodyRef.current || !headRef.current || !leftArmRef.current || 
        !rightArmRef.current || !leftLegRef.current || !rightLegRef.current) return;
    
    // Get character-specific movement profile
    const profile = getMovementProfile(character.role);
    
    const isMoving = Math.abs(useFluidCombat.getState().moveInput.x) > 0.1 || 
                     Math.abs(useFluidCombat.getState().moveInput.z) > 0.1;
    
    // Reset positions
    bodyRef.current.position.set(0, 0, 0);
    bodyRef.current.rotation.set(0, 0, 0);
    leftArmRef.current.position.set(0, 0, 0);
    rightArmRef.current.position.set(0, 0, 0);
    leftLegRef.current.position.set(0, 0, 0);
    rightLegRef.current.position.set(0, 0, 0);
    
    // Dodge animation - spinning dash (speed varies by archetype)
    if (isDashing) {
      bodyRef.current.rotation.y = time * (20 + profile.dashSpeed);
      bodyRef.current.position.y = 0.3;
      return;
    }
    
    // Attack animations
    if (currentAttack && attackPhase) {
      animateAttack(currentAttack, attackPhase, time);
      return;
    }
    
    // Airborne animation
    if (!playerGrounded) {
      leftArmRef.current.rotation.z = 0.6 * profile.armSwingIntensity;
      rightArmRef.current.rotation.z = -0.6 * profile.armSwingIntensity;
      leftLegRef.current.rotation.x = -0.2;
      rightLegRef.current.rotation.x = 0.2;
      bodyRef.current.rotation.x = 0.1;
      return;
    }
    
    // Running/Walking animation - uses movement profile for character-specific movement
    if (isMoving) {
      const animSpeed = profile.animationSpeed;
      const t = time * animSpeed;
      
      // Arm swing intensity varies by archetype
      const armSwing = Math.sin(t);
      const armIntensity = profile.armSwingIntensity;
      leftArmRef.current.rotation.z = armSwing * armIntensity;
      leftArmRef.current.rotation.x = Math.cos(t) * 0.4 * armIntensity;
      rightArmRef.current.rotation.z = armSwing * -armIntensity;
      rightArmRef.current.rotation.x = Math.cos(t + Math.PI) * 0.4 * armIntensity;
      
      // Leg movement intensity varies by archetype
      const legIntensity = profile.legSwingIntensity;
      const legSwing = Math.sin(t);
      leftLegRef.current.rotation.x = legSwing * legIntensity;
      leftLegRef.current.rotation.z = Math.cos(t) * 0.2 * legIntensity;
      rightLegRef.current.rotation.x = legSwing * -legIntensity;
      rightLegRef.current.rotation.z = Math.cos(t + Math.PI) * 0.2 * legIntensity;
      
      // Body bob and lean varies by archetype
      bodyRef.current.position.y = Math.abs(Math.sin(t * 2)) * profile.bounceIntensity;
      bodyRef.current.rotation.x = profile.bodyLean;
      bodyRef.current.rotation.z = Math.sin(t) * profile.bodyLean * 0.5;
      
      // Head bob
      headRef.current.rotation.x = Math.sin(t * 2) * profile.bounceIntensity * 0.5;
      headRef.current.rotation.z = Math.sin(t) * 0.05;
      return;
    }
    
    // Idle animation
    const breathe = Math.sin(time * 2) * 0.03;
    bodyRef.current.position.y = breathe;
    headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    leftArmRef.current.rotation.z = 0.1 + breathe;
    rightArmRef.current.rotation.z = -0.1 - breathe;
  };
  
  const animateAttack = (attack: AttackType, phase: 'windup' | 'active' | 'recovery', time: number) => {
    if (!bodyRef.current || !leftArmRef.current || !rightArmRef.current || 
        !leftLegRef.current || !rightLegRef.current || !headRef.current) return;
    
    const phaseProgress = phase === 'windup' ? 0.3 : phase === 'active' ? 1.0 : 0.5;
    
    // Light attacks - quick punches
    if (attack.startsWith('light')) {
      const attackNum = parseInt(attack.replace('light', '')) || 1;
      const isRightPunch = attackNum % 2 === 1;
      
      if (phase === 'windup') {
        // Pull back
        if (isRightPunch) {
          rightArmRef.current.rotation.z = -0.3;
          rightArmRef.current.position.x = -0.2;
        } else {
          leftArmRef.current.rotation.z = 0.3;
          leftArmRef.current.position.x = 0.2;
        }
        bodyRef.current.rotation.y = isRightPunch ? -0.2 : 0.2;
      } else if (phase === 'active') {
        // Strike forward!
        if (isRightPunch) {
          rightArmRef.current.rotation.z = -Math.PI / 2;
          rightArmRef.current.position.x = 0.8;
          rightArmRef.current.position.z = 0.5;
        } else {
          leftArmRef.current.rotation.z = Math.PI / 2;
          leftArmRef.current.position.x = -0.8;
          leftArmRef.current.position.z = 0.5;
        }
        bodyRef.current.rotation.y = isRightPunch ? 0.3 : -0.3;
        bodyRef.current.position.z = 0.2;
      } else {
        // Recovery - quick return
        if (isRightPunch) {
          rightArmRef.current.rotation.z = -0.2;
        } else {
          leftArmRef.current.rotation.z = 0.2;
        }
      }
      return;
    }
    
    // Heavy attacks - powerful strikes
    if (attack.startsWith('heavy')) {
      const attackNum = parseInt(attack.replace('heavy', '')) || 1;
      
      if (phase === 'windup') {
        // Wind up big
        bodyRef.current.rotation.y = -0.5;
        rightArmRef.current.rotation.z = -Math.PI / 4;
        rightArmRef.current.position.y = 0.3;
        leftArmRef.current.rotation.z = 0.3;
        bodyRef.current.position.y = -0.1;
      } else if (phase === 'active') {
        // MASSIVE STRIKE!
        bodyRef.current.rotation.y = 0.6;
        bodyRef.current.position.z = 0.4;
        rightArmRef.current.rotation.z = -Math.PI / 1.5;
        rightArmRef.current.position.x = 1.2;
        rightArmRef.current.position.z = 0.8;
        leftArmRef.current.rotation.z = Math.PI / 4;
        
        // Heavy 3 is a spinning attack
        if (attackNum === 3) {
          bodyRef.current.rotation.y = time * 20;
          leftArmRef.current.rotation.z = Math.PI / 2;
          leftArmRef.current.position.x = -0.8;
        }
      } else {
        bodyRef.current.rotation.y = 0.2;
        rightArmRef.current.rotation.z = -0.3;
      }
      return;
    }
    
    // Launcher - uppercut
    if (attack === 'launcher') {
      if (phase === 'windup') {
        bodyRef.current.position.y = -0.2;
        rightArmRef.current.rotation.z = 0.2;
        rightArmRef.current.position.y = -0.3;
      } else if (phase === 'active') {
        bodyRef.current.position.y = 0.5;
        rightArmRef.current.rotation.z = -Math.PI;
        rightArmRef.current.position.y = 1.2;
        rightArmRef.current.position.z = 0.3;
        leftLegRef.current.rotation.x = -0.3;
      } else {
        bodyRef.current.position.y = 0.3;
        rightArmRef.current.rotation.z = -Math.PI / 2;
      }
      return;
    }
    
    // Aerial attacks
    if (attack.startsWith('aerial')) {
      const attackNum = parseInt(attack.replace('aerial', '')) || 1;
      
      if (phase === 'active') {
        // Spinning aerial attacks
        bodyRef.current.rotation.y = time * 15;
        bodyRef.current.rotation.x = 0.3;
        leftArmRef.current.rotation.z = Math.PI / 3;
        rightArmRef.current.rotation.z = -Math.PI / 3;
        leftLegRef.current.rotation.x = 0.5;
        rightLegRef.current.rotation.x = -0.5;
      }
      return;
    }
    
    // Slam - diving attack
    if (attack === 'slam') {
      if (phase === 'windup') {
        bodyRef.current.position.y = 0.3;
        leftArmRef.current.rotation.z = Math.PI / 2;
        rightArmRef.current.rotation.z = -Math.PI / 2;
      } else if (phase === 'active') {
        bodyRef.current.rotation.x = Math.PI / 3;
        bodyRef.current.position.y = -0.5;
        leftArmRef.current.rotation.z = -Math.PI / 4;
        rightArmRef.current.rotation.z = Math.PI / 4;
        leftLegRef.current.rotation.x = -0.8;
        rightLegRef.current.rotation.x = -0.8;
      }
      return;
    }
    
    // Special attack - energy burst
    if (attack === 'special') {
      if (phase === 'windup') {
        bodyRef.current.scale.setScalar(0.9);
        leftArmRef.current.rotation.z = 0.3;
        rightArmRef.current.rotation.z = -0.3;
        headRef.current.rotation.x = -0.2;
      } else if (phase === 'active') {
        bodyRef.current.scale.setScalar(1.2);
        leftArmRef.current.rotation.z = Math.PI / 2;
        rightArmRef.current.rotation.z = -Math.PI / 2;
        leftArmRef.current.position.z = 0.5;
        rightArmRef.current.position.z = 0.5;
        bodyRef.current.position.y = Math.sin(time * 20) * 0.2;
      } else {
        bodyRef.current.scale.setScalar(1.0);
      }
      return;
    }
    
    // Ultimate attack - epic finisher
    if (attack === 'ultimate') {
      if (phase === 'windup') {
        bodyRef.current.position.y = 0.5;
        bodyRef.current.rotation.y = time * 5;
      } else if (phase === 'active') {
        bodyRef.current.position.y = 1.0 + Math.sin(time * 10) * 0.3;
        bodyRef.current.rotation.y = time * 30;
        leftArmRef.current.rotation.z = Math.PI / 2;
        rightArmRef.current.rotation.z = -Math.PI / 2;
        leftLegRef.current.rotation.x = Math.sin(time * 15) * 0.5;
        rightLegRef.current.rotation.x = Math.sin(time * 15 + Math.PI) * 0.5;
      }
      return;
    }
  };
  
  // Use character-specific colors if available, otherwise use role colors
  const primaryColor = character.primaryColor || ROLE_COLORS[character.role];
  const accentColor = character.accentColor || ROLE_ACCENT_COLORS[character.role];
  
  // Attack effect particles
  const attackEffects = useMemo(() => {
    if (!currentAttack || attackPhase !== 'active') return null;
    
    const move = COMBO_MOVES[currentAttack];
    const isHeavy = currentAttack.startsWith('heavy') || currentAttack === 'special' || currentAttack === 'ultimate';
    const particleCount = isHeavy ? 30 : 15;
    
    return (
      <group position={[Math.sin(playerRotation) * 1.5, 1, Math.cos(playerRotation) * 1.5]}>
        {Array.from({ length: particleCount }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2,
            ]}
          >
            <sphereGeometry args={[0.1 + Math.random() * 0.1, 8, 8]} />
            <meshBasicMaterial
              color={isHeavy ? '#ffaa00' : accentColor}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    );
  }, [currentAttack, attackPhase, playerRotation, accentColor]);
  
  // Y offset to place character on ground (models have origin at center)
  const CHARACTER_Y_OFFSET = 6.0;
  
  // Render the appropriate specialized character model
  const renderCharacterModel = () => {
    const modelProps = {
      bodyRef,
      headRef,
      leftArmRef,
      rightArmRef,
      leftLegRef,
      rightLegRef,
      emotionIntensity: emotionRef.current,
      hitAnim: hitFlashRef.current,
      animTime: animTimeRef.current,
      isAttacking: !!currentAttack,
      isInvulnerable: iFrames > 0,
    };
    
    // Select specialized model based on character ID for spot-on designs
    switch (character.id) {
      case 'mario':
        return <MarloModel {...modelProps} />;
      case 'luigi':
        return <LeonardoModel {...modelProps} />;
      case 'sonic':
        return <SpeedyModel {...modelProps} />;
      case 'pikachu':
        return <SparkyModel {...modelProps} />;
      case 'kirby':
        return <BubbleModel {...modelProps} />;
      case 'bowser':
        return <KingSpikeModel {...modelProps} />;
      case 'megaman':
        return <CaptainBlazeModel {...modelProps} />;
      case 'samus':
        return <NovaKnightModel {...modelProps} />;
      case 'link':
        return <HeroOfTimeModel {...modelProps} />;
      case 'peach':
        return <PrincessPeachModel {...modelProps} />;
      case 'yoshi':
        return <DinoRiderModel {...modelProps} />;
      case 'donkeykong':
        return <JungleKingModel {...modelProps} />;
      case 'tails':
        return <TwinTailsModel {...modelProps} />;
      case 'zelda':
        return <WisdomPrincessModel {...modelProps} />;
      case 'shadow':
        return <MidnightModel {...modelProps} />;
      case 'fox':
        return <FlynnModel {...modelProps} />;
      case 'jaxon':
        return <JaxonModel {...modelProps} />;
      case 'kaison':
        return <KaisonModel {...modelProps} />;
      default:
        // Fallback: Stylized character with role-based colors
        return (
          <group ref={bodyRef}>
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[0.4, 1, 16, 32]} />
              <meshToonMaterial 
                color={primaryColor}
                emissive={primaryColor}
                emissiveIntensity={0.3}
              />
            </mesh>
            <group ref={headRef} position={[0, 0.9, 0]}>
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.35, 32, 24]} />
                <meshToonMaterial 
                  color={primaryColor}
                  emissive={primaryColor}
                  emissiveIntensity={0.3}
                />
              </mesh>
            </group>
            <group ref={leftArmRef} position={[-0.5, 0.3, 0]}>
              <mesh castShadow receiveShadow>
                <capsuleGeometry args={[0.12, 0.6, 12, 16]} />
                <meshToonMaterial 
                  color={primaryColor}
                  emissive={primaryColor}
                  emissiveIntensity={0.3}
                />
              </mesh>
            </group>
            <group ref={rightArmRef} position={[0.5, 0.3, 0]}>
              <mesh castShadow receiveShadow>
                <capsuleGeometry args={[0.12, 0.6, 12, 16]} />
                <meshToonMaterial 
                  color={primaryColor}
                  emissive={primaryColor}
                  emissiveIntensity={0.3}
                />
              </mesh>
            </group>
            <group ref={leftLegRef} position={[-0.2, -0.5, 0]}>
              <mesh castShadow receiveShadow>
                <capsuleGeometry args={[0.14, 0.7, 12, 16]} />
                <meshToonMaterial 
                  color={primaryColor}
                  emissive={primaryColor}
                  emissiveIntensity={0.3}
                />
              </mesh>
            </group>
            <group ref={rightLegRef} position={[0.2, -0.5, 0]}>
              <mesh castShadow receiveShadow>
                <capsuleGeometry args={[0.14, 0.7, 12, 16]} />
                <meshToonMaterial 
                  color={primaryColor}
                  emissive={primaryColor}
                  emissiveIntensity={0.3}
                />
              </mesh>
            </group>
          </group>
        );
    }
  };
  
  return (
    <group ref={meshRef} position={[playerX, playerY + CHARACTER_Y_OFFSET, playerZ]}>
      {/* Specialized character model with iconic features */}
      {renderCharacterModel()}
      
      {/* Attack effects */}
      {attackEffects}
      
      {/* Combo counter above head */}
      {comboCount > 1 && (
        <group position={[0, 3.5, 0]}>
          <mesh>
            <planeGeometry args={[1.5, 0.6]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
      
      {/* Invincibility effect */}
      {iFrames > 0 && (
        <mesh scale={2}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Dash trail */}
      {isDashing && (
        <group>
          {[0.2, 0.4, 0.6].map((offset, i) => (
            <mesh
              key={i}
              position={[-Math.sin(playerRotation) * offset * 3, 0.5, -Math.cos(playerRotation) * offset * 3]}
            >
              <capsuleGeometry args={[0.3 - i * 0.1, 0.8, 8, 16]} />
              <meshBasicMaterial
                color={accentColor}
                transparent
                opacity={0.5 - i * 0.15}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
