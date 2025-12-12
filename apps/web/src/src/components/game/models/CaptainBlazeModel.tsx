import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface CaptainBlazeModelProps {
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

export default function CaptainBlazeModel({
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
}: CaptainBlazeModelProps) {
  
  // CAPTAIN BLAZE - Fox McCloud-style space pilot
  const primaryColor = "#95A5A6"; // Gray
  const accentColor = "#3498DB"; // Blue
  const furColor = "#ECEFF1"; // Light gray/white
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* Fox head */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.40, 32, 24]} />
          <meshToonMaterial 
            color={furColor}
            emissive={furColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* FOX EARS - Pointy! */}
        <mesh position={[-0.25, 0.32, 0.08]} rotation={[0, -Math.PI / 8, -Math.PI / 4]} castShadow>
          <coneGeometry args={[0.14, 0.38, 4]} />
          <meshToonMaterial 
            color={furColor}
            emissive={furColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0.25, 0.32, 0.08]} rotation={[0, Math.PI / 8, Math.PI / 4]} castShadow>
          <coneGeometry args={[0.14, 0.38, 4]} />
          <meshToonMaterial 
            color={furColor}
            emissive={furColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Inner ears - pink */}
        <mesh position={[-0.25, 0.30, 0.12]} rotation={[0, -Math.PI / 8, -Math.PI / 4]} castShadow>
          <coneGeometry args={[0.08, 0.25, 4]} />
          <meshToonMaterial color="#FFB6C1" />
        </mesh>
        <mesh position={[0.25, 0.30, 0.12]} rotation={[0, Math.PI / 8, Math.PI / 4]} castShadow>
          <coneGeometry args={[0.08, 0.25, 4]} />
          <meshToonMaterial color="#FFB6C1" />
        </mesh>
        
        {/* HEADSET COMMUNICATOR */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <torusGeometry args={[0.42, 0.04, 12, 24]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={accentColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0.42, 0.05, 0.15]} castShadow>
          <boxGeometry args={[0.08, 0.12, 0.15]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* Microphone */}
        <mesh position={[0.35, -0.05, 0.30]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <capsuleGeometry args={[0.02, 0.20, 8, 12]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        
        {/* Determined green eyes */}
        <mesh position={[-0.12, 0.02, 0.35]} castShadow>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#00FF00" : "#27AE60"} />
        </mesh>
        <mesh position={[0.12, 0.02, 0.35]} castShadow>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#00FF00" : "#27AE60"} />
        </mesh>
        
        {/* Pupils */}
        <mesh position={[-0.12, 0.02, 0.38]} castShadow>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.12, 0.02, 0.38]} castShadow>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        
        {/* Fox snout */}
        <mesh position={[0, -0.10, 0.35]} castShadow>
          <boxGeometry args={[0.22, 0.16, 0.18]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        
        {/* Black nose */}
        <mesh position={[0, -0.10, 0.45]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Serious mouth */}
        <mesh position={[0, -0.18, 0.42]} castShadow>
          <boxGeometry args={[0.14, 0.02, 0.02]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
      </group>
      
      {/* FLIGHT SUIT */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.72, 0.92, 0.52]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Vest/armor panels */}
      <mesh position={[0, 0.15, 0.27]} castShadow>
        <boxGeometry args={[0.55, 0.50, 0.02]} />
        <meshToonMaterial 
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Star Fox emblem */}
      <mesh position={[0, 0.15, 0.28]} scale={0.18} rotation={[0, 0, 0]} castShadow>
        <sphereGeometry args={[1, 5, 4]} />
        <meshBasicMaterial 
          color="#FFD700"
        />
      </mesh>
      
      {/* Belt */}
      <mesh position={[0, -0.48, 0]} castShadow>
        <boxGeometry args={[0.74, 0.10, 0.54]} />
        <meshToonMaterial color={primaryColor} />
      </mesh>
      
      {/* Arms with reflector device on left */}
      <group ref={leftArmRef} position={[-0.50, 0.12, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.58, 12, 16]} />
          <meshToonMaterial color={accentColor} />
        </mesh>
        {/* REFLECTOR SHIELD on wrist */}
        <mesh position={[0, -0.72, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
          <meshToonMaterial 
            color="#00D4FF"
            emissive="#00D4FF"
            emissiveIntensity={0.6 + emotionIntensity * 0.3}
          />
        </mesh>
        <mesh position={[0, -0.80, 0]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial color={furColor} />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.50, 0.12, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.58, 12, 16]} />
          <meshToonMaterial color={accentColor} />
        </mesh>
        {/* Hand with BLASTER */}
        <mesh position={[0, -0.72, 0]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        {/* BLASTER GUN */}
        <group position={[0, -0.72, 0.20]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.24, 16]} />
            <meshToonMaterial color={primaryColor} />
          </mesh>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.06, 0.05, 16]} />
            <meshToonMaterial 
              color="#00D4FF"
              emissive="#00D4FF"
              emissiveIntensity={0.7}
            />
          </mesh>
        </group>
      </group>
      
      {/* Legs */}
      <group ref={leftLegRef} position={[-0.22, -0.70, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.68, 12, 16]} />
          <meshToonMaterial color={accentColor} />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.88, 0.10]} castShadow>
          <boxGeometry args={[0.32, 0.35, 0.50]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        <mesh position={[0, -1.06, 0.12]} castShadow>
          <boxGeometry args={[0.34, 0.05, 0.54]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.22, -0.70, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.68, 12, 16]} />
          <meshToonMaterial color={accentColor} />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.88, 0.10]} castShadow>
          <boxGeometry args={[0.32, 0.35, 0.50]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        <mesh position={[0, -1.06, 0.12]} castShadow>
          <boxGeometry args={[0.34, 0.05, 0.54]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
      </group>
      
      {/* Energy shield when active */}
      {emotionIntensity > 0.5 && (
        <mesh position={[0, 0, 0]} scale={1.3}>
          <sphereGeometry args={[0.8, 24, 18]} />
          <meshBasicMaterial 
            color="#00D4FF"
            transparent
            opacity={emotionIntensity * 0.35}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.5}>
          <sphereGeometry args={[1.0, 16, 12]} />
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
