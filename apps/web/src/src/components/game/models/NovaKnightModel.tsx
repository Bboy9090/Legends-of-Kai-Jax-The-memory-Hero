import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface NovaKnightModelProps {
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

export default function NovaKnightModel({
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
}: NovaKnightModelProps) {
  
  // NOVA KNIGHT - Samus-style armored space warrior
  const primaryColor = "#E91E63"; // Pink/Magenta
  const accentColor = "#9C27B0"; // Purple
  const visorColor = "#00D4FF"; // Cyan visor
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* ICONIC HELMET */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.42, 32, 24]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.4}
          />
        </mesh>
        
        {/* Helmet crest/ridge */}
        <mesh position={[0, 0.28, -0.15]} rotation={[Math.PI / 6, 0, 0]} castShadow>
          <boxGeometry args={[0.35, 0.25, 0.12]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* GREEN VISOR - Samus iconic look */}
        <mesh position={[0, 0.02, 0.38]} castShadow>
          <sphereGeometry args={[0.28, 32, 24, 0, Math.PI * 2, 0, Math.PI / 3]} />
          <meshBasicMaterial 
            color={hitAnim > 0 ? "#FFFF00" : visorColor}
            transparent
            opacity={0.85}
          />
        </mesh>
        
        {/* Visor glow */}
        {emotionIntensity > 0.3 && (
          <mesh position={[0, 0.02, 0.40]} scale={1.1}>
            <sphereGeometry args={[0.28, 24, 18, 0, Math.PI * 2, 0, Math.PI / 3]} />
            <meshBasicMaterial 
              color={visorColor}
              transparent
              opacity={emotionIntensity * 0.5}
            />
          </mesh>
        )}
        
        {/* Helmet vents */}
        {[-0.32, 0.32].map((xPos, i) => (
          <group key={`vent-${i}`} position={[xPos, -0.08, 0.18]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.20, 0.08]} />
              <meshToonMaterial color={accentColor} />
            </mesh>
            {[0, 1, 2].map((j) => (
              <mesh key={`slot-${j}`} position={[0, 0.05 - j * 0.05, 0.05]} castShadow>
                <boxGeometry args={[0.09, 0.01, 0.02]} />
                <meshToonMaterial color="#1a1a1a" />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      
      {/* POWER SUIT BODY */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.72, 0.92, 0.55]} />
        <meshToonMaterial 
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.35}
        />
      </mesh>
      
      {/* Chest plate - purple accent */}
      <mesh position={[0, 0.12, 0.28]} castShadow>
        <sphereGeometry args={[0.32, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Energy core */}
      <mesh position={[0, 0.10, 0.30]} castShadow>
        <sphereGeometry args={[0.10, 16, 12]} />
        <meshBasicMaterial 
          color={visorColor}
        />
      </mesh>
      
      {/* Shoulder pads - HUGE spherical */}
      {[-0.52, 0.52].map((xPos, i) => (
        <mesh key={`shoulder-${i}`} position={[xPos, 0.28, 0]} castShadow>
          <sphereGeometry args={[0.28, 24, 18]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
      
      {/* Belt/waist */}
      <mesh position={[0, -0.48, 0]} castShadow>
        <boxGeometry args={[0.75, 0.12, 0.57]} />
        <meshToonMaterial color={accentColor} />
      </mesh>
      
      {/* LEFT ARM - normal */}
      <group ref={leftArmRef} position={[-0.52, 0.15, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.62, 12, 16]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Hand cannon */}
        <mesh position={[0, -0.78, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 12]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
      </group>
      
      {/* RIGHT ARM - ARM CANNON! */}
      <group ref={rightArmRef} position={[0.52, 0.15, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.62, 12, 16]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* ARM CANNON - Iconic! */}
        <mesh position={[0, -0.85, 0]} castShadow>
          <sphereGeometry args={[0.20, 16, 12]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0, -0.85, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.12, 0.35, 16]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* Cannon barrel */}
        <mesh position={[0, -0.85, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.10, 0.10, 0.12, 16]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
        {/* Charging energy */}
        {emotionIntensity > 0.5 && (
          <mesh position={[0, -0.85, 0.52]} scale={1 + Math.sin(animTime * 10) * 0.2}>
            <sphereGeometry args={[0.12, 16, 12]} />
            <meshBasicMaterial 
              color="#FFFF00"
              transparent
              opacity={emotionIntensity * 0.8}
            />
          </mesh>
        )}
      </group>
      
      {/* LEGS - Armored */}
      <group ref={leftLegRef} position={[-0.22, -0.72, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.62, 12, 16]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Armored boot */}
        <mesh position={[0, -0.82, 0.10]} castShadow>
          <boxGeometry args={[0.34, 0.38, 0.52]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0, -1.02, 0.12]} castShadow>
          <boxGeometry args={[0.36, 0.06, 0.56]} />
          <meshToonMaterial color="#9C27B0" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.22, -0.72, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.62, 12, 16]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Armored boot */}
        <mesh position={[0, -0.82, 0.10]} castShadow>
          <boxGeometry args={[0.34, 0.38, 0.52]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0, -1.02, 0.12]} castShadow>
          <boxGeometry args={[0.36, 0.06, 0.56]} />
          <meshToonMaterial color="#9C27B0" />
        </mesh>
      </group>
      
      {/* Energy shield */}
      <mesh position={[0, 0, 0]} scale={1.25}>
        <sphereGeometry args={[0.75, 24, 18]} />
        <meshBasicMaterial 
          color={visorColor}
          transparent
          opacity={0.08 + emotionIntensity * 0.15}
          depthWrite={false}
        />
      </mesh>
      
      {/* Charging aura */}
      {emotionIntensity > 0.6 && (
        <mesh position={[0, 0, 0]} scale={1.4 + Math.sin(animTime * 8) * 0.15}>
          <sphereGeometry args={[0.85, 24, 18]} />
          <meshBasicMaterial 
            color="#FFFF00"
            transparent
            opacity={emotionIntensity * 0.3}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.6}>
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
