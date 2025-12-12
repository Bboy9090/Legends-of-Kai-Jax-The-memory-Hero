import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface SpeedyModelProps {
  bodyRef: React.RefObject<Group>;
  headRef: React.RefObject<Group>;
  leftArmRef: React.RefObject<Group>;
  rightArmRef: React.RefObject<Group>;
  leftLegRef: React.RefObject<Group>;
  rightLegRef: React.RefObject<Group>;
  emotionIntensity: number;
  hitAnim: number;
  animTime: number;
  isAttacking: boolean;
  isInvulnerable: boolean;
}

export default function SpeedyModel({
  bodyRef,
  headRef,
  leftArmRef,
  rightArmRef,
  leftLegRef,
  rightLegRef,
  emotionIntensity,
  hitAnim,
  animTime,
  isAttacking,
  isInvulnerable
}: SpeedyModelProps) {
  
  // SPEEDY - Pure Sonic The Hedgehog
  const primaryColor = "#0066FF"; // Sonic blue
  const accentColor = "#FFD700"; // Gold rings
  const skinColor = "#FDBCB4"; // Peach/tan
  const eyeColor = "#00FF00"; // Green eyes
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      {/* HEAD GROUP */}
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* Main head sphere - blue */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.5, 32, 24]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* MASSIVE SONIC QUILLS - 7 spikes! */}
        {/* Top center quill */}
        <mesh position={[0, 0.2, -0.45]} rotation={[Math.PI / 2.5, 0, 0]} castShadow>
          <coneGeometry args={[0.18, 0.75, 8]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive="#00E5FF"
            emissiveIntensity={0.5 + emotionIntensity * 0.3}
          />
        </mesh>
        
        {/* Back three quills - Sonic's signature look */}
        {[-0.32, 0, 0.32].map((xOffset, i) => (
          <mesh 
            key={`back-quill-${i}`}
            position={[xOffset, 0.1, -0.45]} 
            rotation={[Math.PI / 2.8, 0, xOffset * 0.5]}
            castShadow
          >
            <coneGeometry args={[0.16, 0.7, 8]} />
            <meshToonMaterial 
              color={primaryColor}
              emissive="#00E5FF"
              emissiveIntensity={0.4 + emotionIntensity * 0.3}
            />
          </mesh>
        ))}
        
        {/* Side quills */}
        <mesh position={[-0.48, 0.05, -0.2]} rotation={[0, -Math.PI / 6, -Math.PI / 2.3]} castShadow>
          <coneGeometry args={[0.14, 0.6, 8]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive="#00E5FF"
            emissiveIntensity={0.35 + emotionIntensity * 0.3}
          />
        </mesh>
        <mesh position={[0.48, 0.05, -0.2]} rotation={[0, Math.PI / 6, Math.PI / 2.3]} castShadow>
          <coneGeometry args={[0.14, 0.6, 8]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive="#00E5FF"
            emissiveIntensity={0.35 + emotionIntensity * 0.3}
          />
        </mesh>
        
        {/* HEDGEHOG EARS */}
        <mesh position={[-0.3, 0.3, 0.15]} rotation={[0, -Math.PI / 6, Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.15, 16, 12]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        <mesh position={[0.3, 0.3, 0.15]} rotation={[0, Math.PI / 6, -Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.15, 16, 12]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Inner ears - pink */}
        <mesh position={[-0.3, 0.3, 0.20]} rotation={[0, -Math.PI / 6, Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.08, 12, 10]} />
          <meshToonMaterial color="#FFB6C1" />
        </mesh>
        <mesh position={[0.3, 0.3, 0.20]} rotation={[0, Math.PI / 6, -Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.08, 12, 10]} />
          <meshToonMaterial color="#FFB6C1" />
        </mesh>
        
        {/* Face - tan muzzle */}
        <mesh position={[0, -0.1, 0.35]} castShadow>
          <sphereGeometry args={[0.3, 32, 24]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        
        {/* LARGE GREEN EYES - Sonic's iconic eyes */}
        <mesh position={[-0.10, 0.05, 0.48]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FFFF00" : eyeColor} />
        </mesh>
        <mesh position={[0.10, 0.05, 0.48]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FFFF00" : eyeColor} />
        </mesh>
        
        {/* Pupils */}
        <mesh position={[-0.10, 0.05, 0.51]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.10, 0.05, 0.51]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        
        {/* Eye shine */}
        <mesh position={[-0.08, 0.08, 0.52]} castShadow>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.12, 0.08, 0.52]} castShadow>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Smirk/smile */}
        <mesh position={[0, -0.15, 0.48]} rotation={[0, 0, Math.PI]} castShadow>
          <torusGeometry args={[0.10, 0.02, 8, 16, Math.PI]} />
          <meshToonMaterial color="#000000" />
        </mesh>
        
        {/* Speed aura when excited */}
        {emotionIntensity > 0.5 && (
          <mesh scale={1.3 + Math.sin(animTime * 12) * 0.2}>
            <sphereGeometry args={[0.5, 16, 12]} />
            <meshBasicMaterial 
              color="#00E5FF"
              transparent
              opacity={emotionIntensity * 0.4}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </group>
      
      {/* BODY - Blue and tan */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <sphereGeometry args={[0.45, 32, 24, 0, Math.PI * 2, 0, Math.PI]} />
        <meshToonMaterial color={primaryColor} />
      </mesh>
      
      {/* Belly - tan patch */}
      <mesh position={[0, -0.05, 0.35]} castShadow>
        <sphereGeometry args={[0.35, 32, 24]} />
        <meshToonMaterial color={skinColor} />
      </mesh>
      
      {/* ARMS - Short Sonic arms */}
      <group ref={leftArmRef} position={[-0.4, 0.1, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.4, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* WHITE GLOVE */}
        <mesh position={[0, -0.6, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshToonMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Glove cuff */}
        <mesh position={[0, -0.5, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.10, 0.08, 16]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.4, 0.1, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.4, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* WHITE GLOVE */}
        <mesh position={[0, -0.6, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshToonMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Glove cuff */}
        <mesh position={[0, -0.5, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.10, 0.08, 16]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      {/* LEGS - Short hedgehog legs */}
      <group ref={leftLegRef} position={[-0.18, -0.6, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.35, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* ICONIC RED SONIC SHOES */}
        <mesh position={[0, -0.5, 0.12]} castShadow>
          <boxGeometry args={[0.30, 0.35, 0.50]} />
          <meshToonMaterial 
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* White stripe */}
        <mesh position={[0, -0.42, 0.35]} castShadow>
          <boxGeometry args={[0.31, 0.12, 0.05]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        {/* Gold buckle */}
        <mesh position={[0, -0.40, 0.37]} castShadow>
          <boxGeometry args={[0.10, 0.08, 0.05]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.8}
          />
        </mesh>
        {/* White sole */}
        <mesh position={[0, -0.68, 0.14]} castShadow>
          <boxGeometry args={[0.32, 0.05, 0.55]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.18, -0.6, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.35, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* ICONIC RED SONIC SHOES */}
        <mesh position={[0, -0.5, 0.12]} castShadow>
          <boxGeometry args={[0.30, 0.35, 0.50]} />
          <meshToonMaterial 
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* White stripe */}
        <mesh position={[0, -0.42, 0.35]} castShadow>
          <boxGeometry args={[0.31, 0.12, 0.05]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        {/* Gold buckle */}
        <mesh position={[0, -0.40, 0.37]} castShadow>
          <boxGeometry args={[0.10, 0.08, 0.05]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.8}
          />
        </mesh>
        {/* White sole */}
        <mesh position={[0, -0.68, 0.14]} castShadow>
          <boxGeometry args={[0.32, 0.05, 0.55]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      {/* SPEED AURA */}
      <mesh position={[0, 0, 0]} scale={1.2}>
        <sphereGeometry args={[0.7, 24, 18]} />
        <meshBasicMaterial 
          color="#00E5FF"
          transparent
          opacity={0.1 + emotionIntensity * 0.15}
          depthWrite={false}
        />
      </mesh>
      
      {/* Floating gold rings */}
      {emotionIntensity > 0.4 && (
        <>
          <mesh position={[Math.sin(animTime * 5) * 0.4, 0.6, 0]} rotation={[0, animTime * 5, 0]}>
            <torusGeometry args={[0.12, 0.03, 12, 24]} />
            <meshBasicMaterial 
              color={accentColor}
              transparent
              opacity={0.7}
            />
          </mesh>
          <mesh position={[-Math.sin(animTime * 5) * 0.4, 0.2, 0]} rotation={[0, -animTime * 5, 0]}>
            <torusGeometry args={[0.12, 0.03, 12, 24]} />
            <meshBasicMaterial 
              color={accentColor}
              transparent
              opacity={0.7}
            />
          </mesh>
        </>
      )}
      
      {/* Invulnerability flash */}
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.4}>
          <sphereGeometry args={[0.9, 16, 12]} />
          <meshBasicMaterial 
            color="#FFFFFF"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
