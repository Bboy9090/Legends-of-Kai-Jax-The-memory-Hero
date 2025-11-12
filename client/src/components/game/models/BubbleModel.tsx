import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface BubbleModelProps {
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

export default function BubbleModel({
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
}: BubbleModelProps) {
  
  // BUBBLE - Kirby-style round bouncy fighter
  const primaryColor = "#FF9FF3"; // Pink
  const accentColor = "#54A0FF"; // Blue
  const feetColor = "#E74C3C"; // Red feet
  
  return (
    <group ref={bodyRef} position={[0, 0.5, 0]}>
      {/* ONE BIG ROUND BODY (Kirby is all head!) */}
      <group ref={headRef} position={[0, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.55, 32, 24]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* HUGE CUTE EYES */}
        <mesh position={[-0.15, 0.10, 0.45]} castShadow>
          <sphereGeometry args={[0.14, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FFFF00" : "#0066FF"} />
        </mesh>
        <mesh position={[0.15, 0.10, 0.45]} castShadow>
          <sphereGeometry args={[0.14, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FFFF00" : "#0066FF"} />
        </mesh>
        
        {/* Pupils */}
        <mesh position={[-0.15, 0.10, 0.50]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.15, 0.10, 0.50]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Eye shine - sparkly */}
        <mesh position={[-0.12, 0.15, 0.52]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.18, 0.15, 0.52]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        
        {/* ADORABLE BLUSH - pink cheeks */}
        <mesh position={[-0.50, -0.05, 0.18]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshToonMaterial 
            color="#FFB6C1"
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh position={[0.50, -0.05, 0.18]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshToonMaterial 
            color="#FFB6C1"
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Wide open happy mouth */}
        <mesh position={[0, -0.10, 0.50]} castShadow>
          <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#E74C3C" />
        </mesh>
        
        {/* Tongue */}
        <mesh position={[0, -0.15, 0.52]} castShadow>
          <sphereGeometry args={[0.08, 12, 10]} />
          <meshToonMaterial color="#FF6B9D" />
        </mesh>
        
        {/* Bouncy sparkles when happy */}
        {emotionIntensity > 0.4 && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <mesh 
                key={`star-${i}`}
                position={[
                  Math.cos(animTime * 5 + i * Math.PI / 2) * 0.7,
                  Math.sin(animTime * 8 + i) * 0.2,
                  Math.sin(animTime * 5 + i * Math.PI / 2) * 0.4
                ]}
                rotation={[0, 0, animTime * 5 + i]}
                scale={0.15}
              >
                <sphereGeometry args={[1, 5, 4]} />
                <meshBasicMaterial 
                  color="#FFFF00"
                  transparent
                  opacity={0.7}
                />
              </mesh>
            ))}
          </>
        )}
      </group>
      
      {/* TINY ARMS - stubby! */}
      <group ref={leftArmRef} position={[-0.50, -0.05, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.22, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.30, 0]} castShadow>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.50, -0.05, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.22, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.30, 0]} castShadow>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
      </group>
      
      {/* BIG RED FEET - no legs! */}
      <group ref={leftLegRef} position={[-0.20, -0.50, 0]}>
        <mesh position={[0, -0.08, 0.10]} castShadow>
          <sphereGeometry args={[0.16, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshToonMaterial 
            color={feetColor}
            emissive={feetColor}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.20, -0.50, 0]}>
        <mesh position={[0, -0.08, 0.10]} castShadow>
          <sphereGeometry args={[0.16, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshToonMaterial 
            color={feetColor}
            emissive={feetColor}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
      
      {/* Bouncy aura */}
      <mesh position={[0, 0, 0]} scale={1.1 + Math.sin(animTime * 6) * 0.08}>
        <sphereGeometry args={[0.65, 24, 18]} />
        <meshBasicMaterial 
          color={primaryColor}
          transparent
          opacity={0.12 + emotionIntensity * 0.15}
          depthWrite={false}
        />
      </mesh>
      
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.3}>
          <sphereGeometry args={[0.75, 16, 12]} />
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
