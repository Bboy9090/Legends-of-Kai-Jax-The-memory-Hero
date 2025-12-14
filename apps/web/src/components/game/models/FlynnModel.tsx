import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface FlynnModelProps {
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

export default function FlynnModel({
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
}: FlynnModelProps) {
  
  // FLYNN - Link-style hero with sword
  const primaryColor = "#27AE60"; // Green
  const accentColor = "#F39C12"; // Gold
  const skinColor = "#FDBCB4"; // Peach
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* Head */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.38, 32, 24]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        
        {/* ICONIC GREEN HAT - Link style */}
        <mesh position={[0, 0.25, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[0.45, 0.55, 4]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Hat brim */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.06, 32]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        
        {/* Blonde hair - pointy elf ears */}
        <mesh position={[-0.40, 0.02, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <coneGeometry args={[0.10, 0.20, 4]} />
          <meshToonMaterial color="#FFD700" />
        </mesh>
        <mesh position={[0.40, 0.02, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <coneGeometry args={[0.10, 0.20, 4]} />
          <meshToonMaterial color="#FFD700" />
        </mesh>
        
        {/* Blue eyes */}
        <mesh position={[-0.10, -0.02, 0.35]} castShadow>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FFFF00" : "#0066FF"} />
        </mesh>
        <mesh position={[0.10, -0.02, 0.35]} castShadow>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FFFF00" : "#0066FF"} />
        </mesh>
        
        {/* Pupils */}
        <mesh position={[-0.10, -0.02, 0.37]} castShadow>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.10, -0.02, 0.37]} castShadow>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        
        {/* Determined mouth */}
        <mesh position={[0, -0.12, 0.35]} castShadow>
          <boxGeometry args={[0.12, 0.02, 0.02]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>
        
        {/* Triforce glow */}
        {emotionIntensity > 0.4 && (
          <group position={[0, 0.15, 0.40]} scale={0.15}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <coneGeometry args={[0.5, 0.43, 3]} />
              <meshBasicMaterial 
                color={accentColor}
                transparent
                opacity={emotionIntensity * 0.8}
              />
            </mesh>
          </group>
        )}
      </group>
      
      {/* GREEN TUNIC */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.70, 0.90, 0.50]} />
        <meshToonMaterial 
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Belt */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <boxGeometry args={[0.72, 0.12, 0.52]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, -0.35, 0.27]} castShadow>
        <boxGeometry args={[0.15, 0.14, 0.02]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.7}
        />
      </mesh>
      
      {/* Shield on back */}
      <mesh position={[0, 0, -0.28]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 32]} />
        <meshToonMaterial 
          color="#87CEEB"
          emissive="#87CEEB"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0, 0, -0.27]} castShadow>
        <torusGeometry args={[0.32, 0.04, 8, 16]} />
        <meshToonMaterial color={accentColor} />
      </mesh>
      
      {/* Arms */}
      <group ref={leftArmRef} position={[-0.48, 0.12, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.60, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Hand/glove */}
        <mesh position={[0, -0.75, 0]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.48, 0.12, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.60, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Hand holding sword */}
        <mesh position={[0, -0.75, 0]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        {/* SWORD */}
        <group position={[0, -0.85, 0]} rotation={[0, 0, Math.PI / 4]}>
          <mesh position={[0, -0.35, 0]} castShadow>
            <boxGeometry args={[0.06, 0.70, 0.02]} />
            <meshToonMaterial 
              color="#C0C0C0"
              emissive="#FFFFFF"
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0, -0.72, 0]} castShadow>
            <coneGeometry args={[0.05, 0.12, 4]} />
            <meshToonMaterial color="#C0C0C0" />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[0.20, 0.04, 0.04]} />
            <meshToonMaterial color={accentColor} />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.06, 0.08, 0.06]} />
            <meshToonMaterial color="#0066FF" />
          </mesh>
        </group>
      </group>
      
      {/* Legs */}
      <group ref={leftLegRef} position={[-0.20, -0.68, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.62, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Brown boot */}
        <mesh position={[0, -0.82, 0.10]} castShadow>
          <boxGeometry args={[0.30, 0.32, 0.48]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, -0.99, 0.12]} castShadow>
          <boxGeometry args={[0.32, 0.05, 0.52]} />
          <meshToonMaterial color="#654321" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.20, -0.68, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.62, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Brown boot */}
        <mesh position={[0, -0.82, 0.10]} castShadow>
          <boxGeometry args={[0.30, 0.32, 0.48]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, -0.99, 0.12]} castShadow>
          <boxGeometry args={[0.32, 0.05, 0.52]} />
          <meshToonMaterial color="#654321" />
        </mesh>
      </group>
      
      {/* Courage aura */}
      {emotionIntensity > 0.5 && (
        <mesh position={[0, 0, 0]} scale={1.3}>
          <sphereGeometry args={[0.8, 24, 18]} />
          <meshBasicMaterial 
            color={accentColor}
            transparent
            opacity={emotionIntensity * 0.25}
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
