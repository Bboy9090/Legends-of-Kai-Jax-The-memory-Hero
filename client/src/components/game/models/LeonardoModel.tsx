import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface LeonardoModelProps {
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

export default function LeonardoModel({
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
}: LeonardoModelProps) {
  
  // LEONARDO - Luigi-style tall jumper, Marlo's brother
  const primaryColor = "#95E1D3"; // Light green
  const secondaryColor = "#F38181"; // Pink instead of red
  const accentColor = "#FFD700"; // Gold
  const skinColor = "#FDBCB4"; // Peach skin
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      {/* HEAD GROUP - Slightly taller/thinner than Marlo */}
      <group ref={headRef} position={[0, 0.7, 0]}>
        {/* GREEN CAP */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.52, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Cap brim */}
        <mesh position={[0, 0.15, 0.38]} rotation={[-Math.PI / 12, 0, 0]} castShadow>
          <cylinderGeometry args={[0.48, 0.52, 0.08, 32]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        
        {/* "L" Emblem on cap */}
        <mesh position={[0, 0.25, 0.48]} castShadow>
          <circleGeometry args={[0.14, 32]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        {/* L letter - vertical */}
        <mesh position={[-0.03, 0.25, 0.49]} castShadow>
          <boxGeometry args={[0.04, 0.16, 0.02]} />
          <meshBasicMaterial color={primaryColor} />
        </mesh>
        {/* L letter - horizontal */}
        <mesh position={[0.02, 0.18, 0.49]} castShadow>
          <boxGeometry args={[0.10, 0.04, 0.02]} />
          <meshBasicMaterial color={primaryColor} />
        </mesh>
        
        {/* Head - slightly oval/taller */}
        <mesh position={[0, -0.05, 0.15]} castShadow>
          <sphereGeometry args={[0.38, 32, 24]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        <mesh position={[0, -0.02, 0.15]} scale={[1, 1.1, 1]} castShadow>
          <sphereGeometry args={[0.35, 32, 24]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        
        {/* Smaller round nose */}
        <mesh position={[0, -0.10, 0.45]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshToonMaterial color="#FFB6C1" />
        </mesh>
        
        {/* LARGE NERVOUS EYES */}
        <mesh position={[-0.11, 0.08, 0.42]} castShadow>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#00FF00" : "#87CEEB"} />
        </mesh>
        <mesh position={[0.11, 0.08, 0.42]} castShadow>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#00FF00" : "#87CEEB"} />
        </mesh>
        
        {/* Pupils */}
        <mesh position={[-0.11, 0.08, 0.45]} castShadow>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.11, 0.08, 0.45]} castShadow>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        
        {/* CURLY MUSTACHE */}
        <mesh position={[-0.15, -0.14, 0.40]} rotation={[0, 0, -Math.PI / 8]} castShadow>
          <torusGeometry args={[0.08, 0.02, 8, 12, Math.PI]} />
          <meshToonMaterial color="#654321" />
        </mesh>
        <mesh position={[0.15, -0.14, 0.40]} rotation={[0, 0, Math.PI + Math.PI / 8]} castShadow>
          <torusGeometry args={[0.08, 0.02, 8, 12, Math.PI]} />
          <meshToonMaterial color="#654321" />
        </mesh>
      </group>
      
      {/* BODY - Taller, slimmer than Marlo */}
      <mesh position={[0, -0.05, 0]} scale={[0.9, 1.05, 0.95]} castShadow>
        <boxGeometry args={[0.70, 0.95, 0.50]} />
        <meshToonMaterial 
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Overalls straps */}
      <mesh position={[-0.15, 0.28, 0.25]} castShadow>
        <boxGeometry args={[0.12, 0.55, 0.02]} />
        <meshToonMaterial color={primaryColor} />
      </mesh>
      <mesh position={[0.15, 0.28, 0.25]} castShadow>
        <boxGeometry args={[0.12, 0.55, 0.02]} />
        <meshToonMaterial color={primaryColor} />
      </mesh>
      
      {/* Pink/red shirt */}
      <mesh position={[0, 0.20, 0.24]} castShadow>
        <boxGeometry args={[0.55, 0.35, 0.02]} />
        <meshToonMaterial color={secondaryColor} />
      </mesh>
      
      {/* ARMS - Longer than Marlo */}
      <group ref={leftArmRef} position={[-0.48, 0.18, 0]}>
        <mesh position={[0, -0.45, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.75, 12, 16]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        {/* WHITE GLOVE */}
        <mesh position={[0, -0.90, 0]} castShadow>
          <boxGeometry args={[0.22, 0.24, 0.20]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.48, 0.18, 0]}>
        <mesh position={[0, -0.45, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.75, 12, 16]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        {/* WHITE GLOVE */}
        <mesh position={[0, -0.90, 0]} castShadow>
          <boxGeometry args={[0.22, 0.24, 0.20]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      {/* LEGS - Longer (better jumper!) */}
      <group ref={leftLegRef} position={[-0.20, -0.75, 0]}>
        <mesh position={[0, -0.45, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.85, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Brown boot */}
        <mesh position={[0, -1.05, 0.12]} castShadow>
          <boxGeometry args={[0.32, 0.38, 0.55]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, -1.24, 0.14]} castShadow>
          <boxGeometry args={[0.34, 0.05, 0.58]} />
          <meshToonMaterial color="#654321" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.20, -0.75, 0]}>
        <mesh position={[0, -0.45, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.85, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Brown boot */}
        <mesh position={[0, -1.05, 0.12]} castShadow>
          <boxGeometry args={[0.32, 0.38, 0.55]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, -1.24, 0.14]} castShadow>
          <boxGeometry args={[0.34, 0.05, 0.58]} />
          <meshToonMaterial color="#654321" />
        </mesh>
      </group>
      
      {/* Jump power aura */}
      {emotionIntensity > 0.4 && (
        <mesh position={[0, 0, 0]} scale={1.2 + Math.sin(animTime * 8) * 0.15}>
          <sphereGeometry args={[0.8, 24, 18]} />
          <meshBasicMaterial 
            color={primaryColor}
            transparent
            opacity={emotionIntensity * 0.25}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {/* Invulnerability flash */}
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
