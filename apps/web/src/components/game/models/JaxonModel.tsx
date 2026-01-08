import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";
import { EnergyAura, GlowOutline, DynamicShadow } from "../EnhancedGraphics";

interface JaxonModelProps {
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
  showElectricQuills?: boolean; // Optional: Show electric quills effect
}

export default function JaxonModel({
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
  isInvulnerable,
  showElectricQuills = false
}: JaxonModelProps) {
  
  // JAXON - Mario + Shadow Fusion
  // Red cap, black spiky quills, dark energy, edgy hero
  const primaryColor = "#DC143C"; // Deep crimson red
  const secondaryColor = "#1a1a1a"; // Dark black
  const glowColor = "#FF4500"; // Fire orange-red
  const accentColor = "#FFD700"; // Gold
  
  // Scale factor: Make character 2.5x larger for better visibility
  const SCALE = 2.5;
  
  return (
    <group ref={bodyRef} position={[0, 0.4 * SCALE, 0]} scale={[SCALE, SCALE, SCALE]}>
      {/* Dynamic shadow that follows character */}
      <DynamicShadow characterY={0.4 * SCALE} groundY={-0.4 * SCALE} maxDistance={3 * SCALE} />
      
      {/* HEAD GROUP - Better proportions (smaller head relative to body) */}
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* ICONIC RED CAP - Better material with fabric texture */}
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.55, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.2}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        
        {/* Cap brim - Fabric material */}
        <mesh position={[0, 0.15, 0.4]} rotation={[-Math.PI / 12, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.55, 0.08, 32]} />
          <meshStandardMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.1}
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>
        
        {/* "J" Emblem on cap */}
        <mesh position={[0, 0.25, 0.5]} castShadow receiveShadow>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0.25, 0.51]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.18, 0.02]} />
          <meshBasicMaterial color={primaryColor} />
        </mesh>
        
        {/* MASSIVE SHADOW-STYLE BLACK SPIKY QUILLS - Better materials with electric glow */}
        {/* Back quills - 5 HUGE angular spikes forming Shadow's iconic look */}
        {[-0.40, -0.20, 0, 0.20, 0.40].map((xOffset, i) => (
          <mesh 
            key={`quill-${i}`}
            position={[xOffset, 0.20, -0.48]} 
            rotation={[Math.PI / 2.8, 0, xOffset * 0.4]}
            castShadow
          >
            <coneGeometry args={[0.16, 0.70, 8]} />
            <meshStandardMaterial 
              color={secondaryColor}
              emissive={showElectricQuills ? "#00CED1" : "#FF0000"}
              emissiveIntensity={0.4 + emotionIntensity * 0.8}
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
        ))}
        
        {/* Side quills - Angular and sharp! Better materials */}
        <mesh position={[-0.52, 0.10, -0.25]} rotation={[0, -Math.PI / 6, -Math.PI / 2.2]} castShadow receiveShadow>
          <coneGeometry args={[0.14, 0.60, 8]} />
          <meshStandardMaterial 
            color={secondaryColor}
            emissive={showElectricQuills ? "#00CED1" : "#FF0000"}
            emissiveIntensity={0.3 + emotionIntensity * 0.7}
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
        <mesh position={[0.52, 0.10, -0.25]} rotation={[0, Math.PI / 6, Math.PI / 2.2]} castShadow receiveShadow>
          <coneGeometry args={[0.14, 0.60, 8]} />
          <meshStandardMaterial 
            color={secondaryColor}
            emissive={showElectricQuills ? "#00CED1" : "#FF0000"}
            emissiveIntensity={0.3 + emotionIntensity * 0.7}
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
        
        {/* HEDGEHOG EARS - Darker, edgier */}
        <mesh position={[-0.35, 0.28, 0.12]} rotation={[0, -Math.PI / 6, Math.PI / 6]} castShadow receiveShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshToonMaterial 
            color={secondaryColor}
            emissive="#8B0000"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0.35, 0.28, 0.12]} rotation={[0, Math.PI / 6, -Math.PI / 6]} castShadow receiveShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshToonMaterial 
            color={secondaryColor}
            emissive="#8B0000"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Inner ear - dark red */}
        <mesh position={[-0.35, 0.28, 0.17]} rotation={[0, -Math.PI / 6, Math.PI / 6]} castShadow receiveShadow>
          <sphereGeometry args={[0.10, 12, 10]} />
          <meshToonMaterial color="#8B0000" />
        </mesh>
        <mesh position={[0.35, 0.28, 0.17]} rotation={[0, Math.PI / 6, -Math.PI / 6]} castShadow receiveShadow>
          <sphereGeometry args={[0.10, 12, 10]} />
          <meshToonMaterial color="#8B0000" />
        </mesh>
        
        {/* Face - tan/peach skin tone */}
        <mesh position={[0, -0.05, 0.25]} castShadow receiveShadow>
          <sphereGeometry args={[0.35, 32, 24, 0, Math.PI * 2, Math.PI / 4, Math.PI / 2]} />
          <meshToonMaterial color="#FDBCB4" />
        </mesh>
        
        {/* INTENSE GLOWING EYES - Better shape and detail */}
        {/* Eye whites */}
        <mesh position={[-0.12, 0.05, 0.48]} castShadow receiveShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            roughness={0.3}
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0.12, 0.05, 0.48]} castShadow receiveShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            roughness={0.3}
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Iris/Pupils */}
        <mesh position={[-0.12, 0.05, 0.50]} castShadow receiveShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshStandardMaterial 
            color={hitAnim > 0 ? "#FF0000" : "#8B4513"}
            emissive={hitAnim > 0 ? "#FF4444" : "#4A2511"}
            emissiveIntensity={hitAnim > 0 ? 1.0 : 0.3}
          />
        </mesh>
        <mesh position={[0.12, 0.05, 0.50]} castShadow receiveShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshStandardMaterial 
            color={hitAnim > 0 ? "#FF0000" : "#8B4513"}
            emissive={hitAnim > 0 ? "#FF4444" : "#4A2511"}
            emissiveIntensity={hitAnim > 0 ? 1.0 : 0.3}
          />
        </mesh>
        
        {/* Eye highlights */}
        <mesh position={[-0.10, 0.07, 0.51]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.14, 0.07, 0.51]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Eye glow when emotional/attacking */}
        {emotionIntensity > 0.3 && (
          <>
            <mesh position={[-0.12, 0.05, 0.5]} scale={1.2 + emotionIntensity * 0.3}>
              <sphereGeometry args={[0.08, 16, 12]} />
              <meshBasicMaterial 
                color={glowColor}
                transparent
                opacity={emotionIntensity * 0.7}
              />
            </mesh>
            <mesh position={[0.12, 0.05, 0.5]} scale={1.2 + emotionIntensity * 0.3}>
              <sphereGeometry args={[0.08, 16, 12]} />
              <meshBasicMaterial 
                color={glowColor}
                transparent
                opacity={emotionIntensity * 0.7}
              />
            </mesh>
          </>
        )}
        
        {/* Mario-style mustache */}
        <mesh position={[0, -0.08, 0.48]} castShadow receiveShadow>
          <boxGeometry args={[0.25, 0.05, 0.08]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        
        {/* DARK ENERGY AURA - Shadow's chaos energy */}
        {emotionIntensity > 0.5 && (
          <mesh scale={1.3 + Math.sin(animTime * 10) * 0.15}>
            <sphereGeometry args={[0.5, 16, 12]} />
            <meshBasicMaterial 
              color={glowColor}
              transparent
              opacity={emotionIntensity * 0.4}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </group>
      
      {/* BODY - Better proportions and materials (torso should be longer, more humanoid) */}
      {/* Chest/Torso - more defined and proportional */}
      <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.75, 0.45]} />
        <meshStandardMaterial 
          color="#0047AB"
          roughness={0.8}
          metalness={0.1}
          emissive="#001133"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Abdominal section - adds body definition */}
      <mesh position={[0, -0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.60, 0.25, 0.40]} />
        <meshStandardMaterial 
          color="#003399"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Overalls straps - Better materials */}
      <mesh position={[-0.15, 0.2, 0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.5, 0.02]} />
        <meshStandardMaterial 
          color="#0047AB" 
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0.15, 0.2, 0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.5, 0.02]} />
        <meshStandardMaterial 
          color="#0047AB" 
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      
      {/* Gold buckles on straps - Metallic look */}
      <mesh position={[-0.15, 0.3, 0.27]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 0.08, 0.02]} />
        <meshStandardMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>
      <mesh position={[0.15, 0.3, 0.27]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 0.08, 0.02]} />
        <meshStandardMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>
      
      {/* Red shirt under overalls - Better fabric look */}
      <mesh position={[0, 0.15, 0.25]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.35, 0.02]} />
        <meshStandardMaterial 
          color={primaryColor} 
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      
      {/* Power emblem - fusion symbol - Glowing */}
      <mesh position={[0, 0, 0.27]} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 16, 12]} />
        <meshStandardMaterial 
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={1.0}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Belt - Leather-like */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.75, 0.12, 0.52]} />
        <meshStandardMaterial 
          color={secondaryColor} 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, -0.5, 0.27]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.15, 0.02]} />
        <meshStandardMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>
      
      {/* ARMS - Better proportions and materials */}
      <group ref={leftArmRef} position={[-0.5, 0.1, 0]}>
        {/* Shoulder - Better joint definition */}
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.20, 16, 12]} />
          <meshStandardMaterial 
            color={primaryColor} 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        {/* Upper arm - Better proportions (longer, more defined) */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.12, 0.45, 12, 16]} />
          <meshStandardMaterial 
            color={primaryColor} 
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>
        {/* Elbow joint */}
        <mesh position={[0, -0.55, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial 
            color="#FDBCB4" 
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        {/* Forearm - Better proportions */}
        <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.10, 0.40, 12, 16]} />
          <meshStandardMaterial 
            color="#FDBCB4" 
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        {/* WHITE GLOVE - Better fabric look */}
        <mesh position={[0, -0.98, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.30, 0.22]} />
          <meshStandardMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.1}
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
        {/* Glove cuff - Fabric detail */}
        <mesh position={[0, -0.83, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.14, 0.12, 0.10, 16]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.5, 0.1, 0]}>
        {/* Shoulder */}
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.20, 16, 12]} />
          <meshStandardMaterial 
            color={primaryColor} 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        {/* Upper arm - Better proportions */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.12, 0.45, 12, 16]} />
          <meshStandardMaterial 
            color={primaryColor} 
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>
        {/* Elbow joint */}
        <mesh position={[0, -0.55, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial 
            color="#FDBCB4" 
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        {/* Forearm - Better proportions */}
        <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.10, 0.40, 12, 16]} />
          <meshStandardMaterial 
            color="#FDBCB4" 
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        {/* WHITE GLOVE - Better fabric look */}
        <mesh position={[0, -0.98, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.30, 0.22]} />
          <meshStandardMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.1}
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
        {/* Glove cuff - Fabric detail */}
        <mesh position={[0, -0.83, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.14, 0.12, 0.10, 16]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
      </group>
      
      {/* LEGS - Better proportions and materials */}
      <group ref={leftLegRef} position={[-0.2, -0.7, 0]}>
        {/* Thigh - Better proportions (longer, more defined) */}
        <mesh position={[0, -0.08, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.15, 0.60, 12, 16]} />
          <meshStandardMaterial 
            color="#0047AB" 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        {/* Knee joint - More defined */}
        <mesh position={[0, -0.40, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshStandardMaterial 
            color="#003399" 
            roughness={0.75}
            metalness={0.15}
          />
        </mesh>
        {/* Lower leg - Better proportions */}
        <mesh position={[0, -0.70, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.13, 0.50, 12, 16]} />
          <meshStandardMaterial 
            color="#0047AB" 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        {/* ICONIC RED BOOT - Better leather/fabric look */}
        <mesh position={[0, -1.0, 0.12]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.40, 0.58]} />
          <meshStandardMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.2}
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
        {/* Boot sole - Rubber look */}
        <mesh position={[0, -1.20, 0.15]} castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.06, 0.62]} />
          <meshStandardMaterial 
            color={secondaryColor} 
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>
        {/* Gold trim - Metallic */}
        <mesh position={[0, -0.95, 0.12]} castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.10, 16]} />
          <meshStandardMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.9}
          />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.2, -0.7, 0]}>
        {/* Thigh - Better proportions */}
        <mesh position={[0, -0.08, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.15, 0.60, 12, 16]} />
          <meshStandardMaterial 
            color="#0047AB" 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        {/* Knee joint - More defined */}
        <mesh position={[0, -0.40, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshStandardMaterial 
            color="#003399" 
            roughness={0.75}
            metalness={0.15}
          />
        </mesh>
        {/* Lower leg - Better proportions */}
        <mesh position={[0, -0.70, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.13, 0.50, 12, 16]} />
          <meshStandardMaterial 
            color="#0047AB" 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        {/* ICONIC RED BOOT - Better materials */}
        <mesh position={[0, -1.0, 0.12]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.40, 0.58]} />
          <meshStandardMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.2}
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
        {/* Boot sole - Rubber look */}
        <mesh position={[0, -1.20, 0.15]} castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.06, 0.62]} />
          <meshStandardMaterial 
            color={secondaryColor} 
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>
        {/* Gold trim - Metallic */}
        <mesh position={[0, -0.95, 0.12]} castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.10, 16]} />
          <meshStandardMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.9}
          />
        </mesh>
      </group>
      
      {/* FIRE/DARK ENERGY AURA */}
      <mesh position={[0, 0, 0]} scale={1.3}>
        <sphereGeometry args={[0.8, 24, 18]} />
        <meshBasicMaterial 
          color={glowColor}
          transparent
          opacity={0.12 + emotionIntensity * 0.2}
          depthWrite={false}
        />
      </mesh>
      
      {/* Enhanced Energy Aura for high emotion states */}
      <EnergyAura 
        scale={1.2}
        color={glowColor}
        intensity={emotionIntensity}
      />
      
      {/* Enhanced Glow Outline when attacking or emotional */}
      {(isAttacking || emotionIntensity > 0.5) && (
        <GlowOutline 
          scale={1.1}
          color={isAttacking ? accentColor : glowColor}
          intensity={isAttacking ? 1.0 : emotionIntensity}
        />
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
