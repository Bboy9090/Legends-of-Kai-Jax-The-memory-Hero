import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface KaisonModelProps {
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

export default function KaisonModel({
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
}: KaisonModelProps) {
  
  // KAISON - Sonic + Tails + Luigi Fusion
  // Green cap, blue hedgehog quills, speed effects, cheerful hero
  const primaryColor = "#0066FF"; // Bright blue (Sonic)
  const secondaryColor = "#00C853"; // Vibrant green (Luigi)
  const accentColor = "#FFD700"; // Gold rings (Sonic)
  const speedColor = "#00E5FF"; // Cyan speed trail
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      {/* HEAD GROUP */}
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* GREEN CAP (Luigi-style) */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.55, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshToonMaterial 
            color={secondaryColor}
            emissive={secondaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Cap brim */}
        <mesh position={[0, 0.15, 0.4]} rotation={[-Math.PI / 12, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.55, 0.08, 32]} />
          <meshToonMaterial 
            color={secondaryColor}
            emissive={secondaryColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* "K" Emblem on cap */}
        <mesh position={[0, 0.25, 0.5]} castShadow>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[-0.02, 0.25, 0.51]} castShadow>
          <boxGeometry args={[0.06, 0.18, 0.02]} />
          <meshBasicMaterial color={secondaryColor} />
        </mesh>
        <mesh position={[0.04, 0.3, 0.51]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <boxGeometry args={[0.06, 0.12, 0.02]} />
          <meshBasicMaterial color={secondaryColor} />
        </mesh>
        <mesh position={[0.04, 0.2, 0.51]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.06, 0.12, 0.02]} />
          <meshBasicMaterial color={secondaryColor} />
        </mesh>
        
        {/* MASSIVE SONIC-STYLE BLUE QUILLS - Super visible! */}
        {/* Top center quill - HUGE */}
        <mesh position={[0, 0.25, -0.55]} rotation={[Math.PI / 2.2, 0, 0]} castShadow>
          <coneGeometry args={[0.20, 0.85, 8]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={speedColor}
            emissiveIntensity={0.5 + emotionIntensity * 0.4}
          />
        </mesh>
        
        {/* Back quills - Sonic's three MASSIVE main spikes */}
        {[-0.35, 0, 0.35].map((xOffset, i) => (
          <mesh 
            key={`quill-${i}`}
            position={[xOffset, 0.15, -0.50]} 
            rotation={[Math.PI / 2.5, 0, xOffset * 0.5]}
            castShadow
          >
            <coneGeometry args={[0.18, 0.75, 8]} />
            <meshToonMaterial 
              color={primaryColor}
              emissive={speedColor}
              emissiveIntensity={0.4 + emotionIntensity * 0.4}
            />
          </mesh>
        ))}
        
        {/* Side quills - VERY prominent! */}
        <mesh position={[-0.50, 0.05, -0.25]} rotation={[0, -Math.PI / 5, -Math.PI / 2.5]} castShadow>
          <coneGeometry args={[0.15, 0.65, 8]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={speedColor}
            emissiveIntensity={0.35 + emotionIntensity * 0.4}
          />
        </mesh>
        <mesh position={[0.50, 0.05, -0.25]} rotation={[0, Math.PI / 5, Math.PI / 2.5]} castShadow>
          <coneGeometry args={[0.15, 0.65, 8]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={speedColor}
            emissiveIntensity={0.35 + emotionIntensity * 0.4}
          />
        </mesh>
        
        {/* HEDGEHOG EARS - Round and fuzzy */}
        <mesh position={[-0.35, 0.25, 0.15]} rotation={[0, -Math.PI / 6, Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={speedColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0.35, 0.25, 0.15]} rotation={[0, Math.PI / 6, -Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={speedColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Inner ear pink */}
        <mesh position={[-0.35, 0.25, 0.20]} rotation={[0, -Math.PI / 6, Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.10, 12, 10]} />
          <meshToonMaterial color="#FFB6C1" />
        </mesh>
        <mesh position={[0.35, 0.25, 0.20]} rotation={[0, Math.PI / 6, -Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.10, 12, 10]} />
          <meshToonMaterial color="#FFB6C1" />
        </mesh>
        
        {/* TAILS-INSPIRED TWIN TAILS (fox tails on sides) */}
        {/* Left tail */}
        <group position={[-0.35, -0.1, -0.35]} rotation={[Math.PI / 4, -Math.PI / 6, -Math.PI / 4]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.08, 0.4, 8, 12]} />
            <meshToonMaterial 
              color="#FFA500"
              emissive="#FFD700"
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0, -0.25, 0]} castShadow>
            <coneGeometry args={[0.12, 0.25, 8]} />
            <meshToonMaterial 
              color="#FFA500"
              emissive="#FFD700"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
        
        {/* Right tail */}
        <group position={[0.35, -0.1, -0.35]} rotation={[Math.PI / 4, Math.PI / 6, Math.PI / 4]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.08, 0.4, 8, 12]} />
            <meshToonMaterial 
              color="#FFA500"
              emissive="#FFD700"
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0, -0.25, 0]} castShadow>
            <coneGeometry args={[0.12, 0.25, 8]} />
            <meshToonMaterial 
              color="#FFA500"
              emissive="#FFD700"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
        
        {/* Face - tan/peach skin tone */}
        <mesh position={[0, -0.05, 0.25]} castShadow>
          <sphereGeometry args={[0.35, 32, 24, 0, Math.PI * 2, Math.PI / 4, Math.PI / 2]} />
          <meshToonMaterial color="#FDBCB4" />
        </mesh>
        
        {/* LARGE EXPRESSIVE GREEN EYES - Sonic/anime style */}
        <mesh position={[-0.10, 0.08, 0.48]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshBasicMaterial 
            color={hitAnim > 0 ? "#00FF00" : "#228B22"}
          />
        </mesh>
        <mesh position={[0.10, 0.08, 0.48]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshBasicMaterial 
            color={hitAnim > 0 ? "#00FF00" : "#228B22"}
          />
        </mesh>
        
        {/* Eye pupils */}
        <mesh position={[-0.10, 0.08, 0.50]} castShadow>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.10, 0.08, 0.50]} castShadow>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        
        {/* Eye shine for cheerful look */}
        <mesh position={[-0.08, 0.10, 0.51]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.12, 0.10, 0.51]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Speed glow when emotional/attacking */}
        {emotionIntensity > 0.3 && (
          <>
            <mesh position={[-0.10, 0.08, 0.52]} scale={1.5 + emotionIntensity * 0.4}>
              <sphereGeometry args={[0.10, 16, 12]} />
              <meshBasicMaterial 
                color={speedColor}
                transparent
                opacity={emotionIntensity * 0.6}
              />
            </mesh>
            <mesh position={[0.10, 0.08, 0.52]} scale={1.5 + emotionIntensity * 0.4}>
              <sphereGeometry args={[0.10, 16, 12]} />
              <meshBasicMaterial 
                color={speedColor}
                transparent
                opacity={emotionIntensity * 0.6}
              />
            </mesh>
          </>
        )}
        
        {/* Cheerful smile */}
        <mesh position={[0, -0.05, 0.48]} rotation={[0, 0, Math.PI]} castShadow>
          <torusGeometry args={[0.12, 0.02, 8, 16, Math.PI]} />
          <meshToonMaterial color="#000000" />
        </mesh>
        
        {/* SPEED AURA - Wind/energy trails */}
        {emotionIntensity > 0.5 && (
          <mesh scale={1.4 + Math.sin(animTime * 12) * 0.2}>
            <sphereGeometry args={[0.5, 16, 12]} />
            <meshBasicMaterial 
              color={speedColor}
              transparent
              opacity={emotionIntensity * 0.5}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </group>
      
      {/* BODY - Green overalls (Luigi) with blue shirt (Sonic) */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.5]} />
        <meshToonMaterial 
          color={secondaryColor}
          emissive="#006400"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Overalls straps */}
      <mesh position={[-0.15, 0.2, 0.26]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.02]} />
        <meshToonMaterial color={secondaryColor} />
      </mesh>
      <mesh position={[0.15, 0.2, 0.26]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.02]} />
        <meshToonMaterial color={secondaryColor} />
      </mesh>
      
      {/* Gold buckles */}
      <mesh position={[-0.15, 0.3, 0.27]} castShadow>
        <boxGeometry args={[0.14, 0.08, 0.02]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh position={[0.15, 0.3, 0.27]} castShadow>
        <boxGeometry args={[0.14, 0.08, 0.02]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.7}
        />
      </mesh>
      
      {/* Blue shirt under overalls */}
      <mesh position={[0, 0.15, 0.25]} castShadow>
        <boxGeometry args={[0.55, 0.35, 0.02]} />
        <meshToonMaterial color={primaryColor} />
      </mesh>
      
      {/* Speed ring emblem - Sonic's gold ring */}
      <mesh position={[0, 0, 0.27]} castShadow>
        <torusGeometry args={[0.12, 0.03, 16, 32]} />
        <meshBasicMaterial 
          color={accentColor}
        />
      </mesh>
      <mesh position={[0, 0, 0.28]} scale={1.1}>
        <torusGeometry args={[0.12, 0.02, 12, 24]} />
        <meshBasicMaterial 
          color={accentColor}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Belt */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[0.75, 0.12, 0.52]} />
        <meshToonMaterial color={primaryColor} />
      </mesh>
      <mesh position={[0, -0.5, 0.27]} castShadow>
        <boxGeometry args={[0.18, 0.15, 0.02]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* ARMS - WHITE GLOVES (Sonic/Mario iconic!) */}
      <group ref={leftArmRef} position={[-0.5, 0.1, 0]}>
        {/* Shoulder */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.20, 16, 12]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Upper arm - blue shirt */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.35, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.55, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.35, 12, 16]} />
          <meshToonMaterial color="#FDBCB4" />
        </mesh>
        {/* WHITE GLOVE - Sonic style */}
        <mesh position={[0, -0.85, 0]} castShadow>
          <sphereGeometry args={[0.14, 16, 12]} />
          <meshToonMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Glove cuff with gold */}
        <mesh position={[0, -0.72, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.11, 0.08, 16]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, -0.72, 0]} scale={1.05} castShadow>
          <cylinderGeometry args={[0.13, 0.11, 0.04, 16]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.5, 0.1, 0]}>
        {/* Shoulder */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.20, 16, 12]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Upper arm */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.35, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.55, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.35, 12, 16]} />
          <meshToonMaterial color="#FDBCB4" />
        </mesh>
        {/* WHITE GLOVE */}
        <mesh position={[0, -0.85, 0]} castShadow>
          <sphereGeometry args={[0.14, 16, 12]} />
          <meshToonMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Glove cuff with gold */}
        <mesh position={[0, -0.72, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.11, 0.08, 16]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, -0.72, 0]} scale={1.05} castShadow>
          <cylinderGeometry args={[0.13, 0.11, 0.04, 16]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>
      
      {/* LEGS - Green overalls */}
      <group ref={leftLegRef} position={[-0.2, -0.7, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.5, 12, 16]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* Knee */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.65, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.45, 12, 16]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* SONIC SHOES - Red and white with gold buckle */}
        <mesh position={[0, -1.0, 0.12]} castShadow>
          <boxGeometry args={[0.32, 0.38, 0.55]} />
          <meshToonMaterial 
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* White stripe */}
        <mesh position={[0, -0.9, 0.35]} castShadow>
          <boxGeometry args={[0.33, 0.12, 0.05]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        {/* Shoe sole - white */}
        <mesh position={[0, -1.19, 0.15]} castShadow>
          <boxGeometry args={[0.34, 0.05, 0.60]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        {/* Gold buckle */}
        <mesh position={[0, -0.88, 0.37]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.05]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.2, -0.7, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.5, 12, 16]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* Knee */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.65, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.45, 12, 16]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* SONIC SHOES */}
        <mesh position={[0, -1.0, 0.12]} castShadow>
          <boxGeometry args={[0.32, 0.38, 0.55]} />
          <meshToonMaterial 
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* White stripe */}
        <mesh position={[0, -0.9, 0.35]} castShadow>
          <boxGeometry args={[0.33, 0.12, 0.05]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        {/* Shoe sole */}
        <mesh position={[0, -1.19, 0.15]} castShadow>
          <boxGeometry args={[0.34, 0.05, 0.60]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        {/* Gold buckle */}
        <mesh position={[0, -0.88, 0.37]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.05]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>
      
      {/* SPEED AURA - Blue/cyan energy */}
      <mesh position={[0, 0, 0]} scale={1.3}>
        <sphereGeometry args={[0.8, 24, 18]} />
        <meshBasicMaterial 
          color={speedColor}
          transparent
          opacity={0.15 + emotionIntensity * 0.2}
          depthWrite={false}
        />
      </mesh>
      
      {/* Floating gold rings when moving fast */}
      {emotionIntensity > 0.4 && (
        <>
          <mesh position={[Math.sin(animTime * 5) * 0.5, 0.8, 0]} rotation={[0, animTime * 5, 0]}>
            <torusGeometry args={[0.15, 0.03, 12, 24]} />
            <meshBasicMaterial 
              color={accentColor}
              transparent
              opacity={0.7}
            />
          </mesh>
          <mesh position={[-Math.sin(animTime * 5) * 0.5, 0.3, 0]} rotation={[0, -animTime * 5, 0]}>
            <torusGeometry args={[0.15, 0.03, 12, 24]} />
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
