import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface SparkyModelProps {
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

export default function SparkyModel({
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
}: SparkyModelProps) {
  
  // SPARKY - Pikachu-style electric critter
  const primaryColor = "#F4D03F"; // Yellow
  const accentColor = "#E74C3C"; // Red cheeks
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      <group ref={headRef} position={[0, 0.5, 0]}>
        {/* Round head */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.42, 32, 24]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* POINTY EARS - lightning bolt shaped */}
        <group position={[-0.32, 0.25, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <coneGeometry args={[0.10, 0.50, 4]} />
            <meshToonMaterial 
              color={primaryColor}
              emissive={primaryColor}
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0, 0.28, 0]} castShadow>
            <sphereGeometry args={[0.08, 16, 12]} />
            <meshToonMaterial color="#1a1a1a" />
          </mesh>
        </group>
        
        <group position={[0.32, 0.25, 0]} rotation={[0, 0, Math.PI / 6]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <coneGeometry args={[0.10, 0.50, 4]} />
            <meshToonMaterial 
              color={primaryColor}
              emissive={primaryColor}
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0, 0.28, 0]} castShadow>
            <sphereGeometry args={[0.08, 16, 12]} />
            <meshToonMaterial color="#1a1a1a" />
          </mesh>
        </group>
        
        {/* BIG CUTE EYES */}
        <mesh position={[-0.12, 0.05, 0.35]} castShadow>
          <sphereGeometry args={[0.11, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FFFF00" : "#1a1a1a"} />
        </mesh>
        <mesh position={[0.12, 0.05, 0.35]} castShadow>
          <sphereGeometry args={[0.11, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FFFF00" : "#1a1a1a"} />
        </mesh>
        
        {/* Eye shine */}
        <mesh position={[-0.09, 0.10, 0.38]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.15, 0.10, 0.38]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        
        {/* RED CHEEKS - electric pouches */}
        <mesh position={[-0.38, -0.05, 0.15]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.6 + emotionIntensity * 0.3}
          />
        </mesh>
        <mesh position={[0.38, -0.05, 0.15]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.6 + emotionIntensity * 0.3}
          />
        </mesh>
        
        {/* Cute smile */}
        <mesh position={[0, -0.08, 0.38]} rotation={[0, 0, Math.PI]} castShadow>
          <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>
        
        {/* Small nose */}
        <mesh position={[0, -0.02, 0.42]} castShadow>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Electric sparks when excited */}
        {emotionIntensity > 0.5 && (
          <>
            <mesh position={[Math.sin(animTime * 15) * 0.5, 0.3, 0]} scale={0.12}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshBasicMaterial 
                color="#FFFF00"
                transparent
                opacity={0.8}
              />
            </mesh>
            <mesh position={[-Math.sin(animTime * 15) * 0.5, 0.15, 0]} scale={0.10}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshBasicMaterial 
                color="#FFFF00"
                transparent
                opacity={0.8}
              />
            </mesh>
          </>
        )}
      </group>
      
      {/* ROUND BODY */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <sphereGeometry args={[0.48, 32, 24]} />
        <meshToonMaterial 
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Brown stripes on back */}
      {[0, 1].map((i) => (
        <mesh 
          key={`stripe-${i}`}
          position={[0, -0.10 - i * 0.25, -0.46]} 
          castShadow
        >
          <boxGeometry args={[0.60, 0.08, 0.02]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>
      ))}
      
      {/* Short arms */}
      <group ref={leftArmRef} position={[-0.42, -0.15, 0]}>
        <mesh position={[0, -0.20, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.28, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.42, -0.15, 0]}>
        <mesh position={[0, -0.20, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.28, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
      </group>
      
      {/* Short legs */}
      <group ref={leftLegRef} position={[-0.20, -0.60, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.28, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -0.38, 0.08]} castShadow>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.20, -0.60, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.28, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -0.38, 0.08]} castShadow>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>
      </group>
      
      {/* LIGHTNING BOLT TAIL */}
      <group position={[0, -0.15, -0.50]} rotation={[Math.PI / 6, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.12, 0.30, 0.02]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0.08, -0.20, 0]} castShadow>
          <boxGeometry args={[0.12, 0.20, 0.02]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0, -0.32, 0]} castShadow>
          <boxGeometry args={[0.10, 0.15, 0.02]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>
      
      {/* Electric aura */}
      <mesh position={[0, -0.1, 0]} scale={1.2}>
        <sphereGeometry args={[0.6, 24, 18]} />
        <meshBasicMaterial 
          color="#FFFF00"
          transparent
          opacity={0.08 + emotionIntensity * 0.15}
          depthWrite={false}
        />
      </mesh>
      
      {isInvulnerable && (
        <mesh position={[0, -0.1, 0]} scale={1.4}>
          <sphereGeometry args={[0.8, 16, 12]} />
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
