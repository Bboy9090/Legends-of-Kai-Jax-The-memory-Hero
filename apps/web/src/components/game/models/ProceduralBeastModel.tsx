import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Fighter } from "../../../lib/characters";
import { COMPLETE_BEAST_ROSTER } from "@beast-kin/shared/data/complete_beast_roster";

/**
 * ProceduralBeastModel
 * A non-placeholder fallback that looks "beast-hybrid" (horns/wings/tails/spines),
 * using the shared Beast Wars roster feature tags when available.
 */
export default function ProceduralBeastModel({ fighter }: { fighter: Fighter }) {
  const groupRef = useRef<THREE.Group>(null);

  const beast = useMemo(
    () => COMPLETE_BEAST_ROSTER.find((b) => b.id === fighter.id) || null,
    [fighter.id]
  );

  const primary = beast?.visual.primaryColor || "#1a1a1a";
  const accent = beast?.visual.accentColor || "#00f2ff";
  const features = beast?.visual.features || [];
  const hybrid = beast?.beastHybrid || "";

  const has = (key: string) => features.some((f) => f === key || f.includes(key));
  const hasWord = (re: RegExp) => features.some((f) => re.test(f));

  const isCanine = /wolf|kitsune|fox|lupine/i.test(hybrid);
  const isBird = /bird|avian|hawk|eagle|falcon/i.test(hybrid);
  const isReptile = /reptile|lizard|snake|croc|alligator/i.test(hybrid);
  const isFrog = /frog|toad|amphib/i.test(hybrid);
  const isDragon = /dragon|drake/i.test(hybrid);
  const isSpider = /spider|arachnid/i.test(hybrid);

  const hasWings = hasWord(/wing/i) || (isBird || isDragon);
  const hasHorns = hasWord(/horn/i) || isDragon || /bull|ram/i.test(hybrid);
  const hasSpines = hasWord(/spine|quill|spike/i) || isSpider || isDragon;
  const hasTails = hasWord(/tail/i) || isCanine || isDragon;

  const hasTacticalJacket = has("tactical_jacket") || hasWord(/jacket/i);
  const hasChaseBadge = has("chase_badge") || hasWord(/badge/i);
  const hasWebGear = has("web_equipment") || hasWord(/web/i);
  const hasTwinMechTails = has("two_mechanical_tails") || hasWord(/mechanical.*tail/i);
  const hasElectricAura = has("electric_aura") || hasWord(/electric/i);
  const quillCount = has("seven_electric_quills") ? 7 : hasSpines ? 6 : 0;
  const eyeColor = has("feral_amber_eyes") ? "#FFB000" : accent;

  // Some roster entries describe fur/material separate from palette
  const furColor = has("charcoal_fur") ? "#1a1a1a" : primary;
  const clothColor = hasTacticalJacket ? "#0b1020" : primary;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.6) * 0.25;
    groupRef.current.position.y = Math.sin(t * 2.0) * 0.03;
  });

  return (
    <group ref={groupRef} position={[0, 0.4, 0]} scale={[2.5, 2.5, 2.5]}>
      {/* Torso: biped silhouette (less rolly) */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.26, 0.34, 0.72, 10]} />
        <meshStandardMaterial color={furColor} metalness={0.25} roughness={0.65} />
      </mesh>

      {/* Clothing: tactical jacket / armor plate */}
      {hasTacticalJacket && (
        <>
          <mesh position={[0, 0.12, 0.26]} castShadow>
            <boxGeometry args={[0.46, 0.48, 0.08]} />
            <meshStandardMaterial
              color={clothColor}
              metalness={0.35}
              roughness={0.55}
              emissive={accent}
              emissiveIntensity={0.08}
            />
          </mesh>
          {/* Collar */}
          <mesh position={[0, 0.36, 0.12]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.50, 0.14, 0.26]} />
            <meshStandardMaterial color={clothColor} metalness={0.25} roughness={0.7} />
          </mesh>
        </>
      )}

      {/* Chase badge */}
      {hasChaseBadge && (
        <mesh position={[-0.22, 0.22, 0.26]} castShadow>
          <circleGeometry args={[0.08, 14]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      )}

      {/* Head: angular, not a sphere */}
      <group position={[0, 0.46, 0.10]}>
        <mesh castShadow receiveShadow>
          <icosahedronGeometry args={[0.22, 1]} />
          <meshStandardMaterial
            color={furColor}
            metalness={0.25}
            roughness={0.65}
            emissive={accent}
            emissiveIntensity={0.06}
          />
        </mesh>

        {/* Face builder (wolf/fox/bird/reptile/frog/spider) */}
        {isCanine && (
          <>
            {/* Snout */}
            <mesh position={[0, -0.05, 0.24]} rotation={[0.15, 0, 0]} castShadow>
              <coneGeometry args={[0.10, 0.22, 10]} />
              <meshStandardMaterial color={furColor} roughness={0.7} metalness={0.1} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.16, 0.14, 0.00]} rotation={[0.15, 0, 0.45]} castShadow>
              <coneGeometry args={[0.06, 0.18, 8]} />
              <meshStandardMaterial color={furColor} roughness={0.75} metalness={0.08} />
            </mesh>
            <mesh position={[0.16, 0.14, 0.00]} rotation={[0.15, 0, -0.45]} castShadow>
              <coneGeometry args={[0.06, 0.18, 8]} />
              <meshStandardMaterial color={furColor} roughness={0.75} metalness={0.08} />
            </mesh>
          </>
        )}

        {isBird && (
          <mesh position={[0, -0.03, 0.24]} rotation={[0.1, 0, 0]} castShadow>
            <coneGeometry args={[0.06, 0.22, 8]} />
            <meshStandardMaterial color={accent} roughness={0.45} metalness={0.25} />
          </mesh>
        )}

        {isReptile && (
          <>
            <mesh position={[0, -0.06, 0.26]} rotation={[0.05, 0, 0]} castShadow>
              <boxGeometry args={[0.16, 0.10, 0.26]} />
              <meshStandardMaterial color={furColor} roughness={0.75} metalness={0.08} />
            </mesh>
            {/* Crest */}
            <mesh position={[0, 0.16, -0.08]} rotation={[Math.PI / 2.5, 0, 0]} castShadow>
              <coneGeometry args={[0.05, 0.22, 6]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.12} />
            </mesh>
          </>
        )}

        {isFrog && (
          <mesh position={[0, -0.12, 0.18]} castShadow>
            <boxGeometry args={[0.18, 0.06, 0.14]} />
            <meshStandardMaterial color={primary} roughness={0.9} metalness={0.02} />
          </mesh>
        )}

        {isSpider && (
          <>
            {/* Extra eyes */}
            {Array.from({ length: 4 }).map((_, i) => (
              <mesh
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                position={[(-0.09 + i * 0.06), 0.06, 0.20]}
              >
                <sphereGeometry args={[0.02, 10, 8]} />
                <meshBasicMaterial color={accent} />
              </mesh>
            ))}
          </>
        )}

        {/* Eyes: narrow glowing slits */}
        <mesh position={[-0.07, 0.02, 0.18]} rotation={[0, 0.1, 0]}>
          <planeGeometry args={[0.10, 0.03]} />
          <meshBasicMaterial color={eyeColor} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0.07, 0.02, 0.18]} rotation={[0, -0.1, 0]}>
          <planeGeometry args={[0.10, 0.03]} />
          <meshBasicMaterial color={eyeColor} transparent opacity={0.9} />
        </mesh>

        {/* Horns */}
        {hasHorns && (
          <>
            <mesh position={[-0.14, 0.10, 0.03]} rotation={[0.2, 0.0, 0.6]} castShadow>
              <coneGeometry args={[0.05, 0.18, 6]} />
              <meshStandardMaterial
                color={accent}
                metalness={0.55}
                roughness={0.35}
                emissive={accent}
                emissiveIntensity={0.2}
              />
            </mesh>
            <mesh position={[0.14, 0.10, 0.03]} rotation={[0.2, 0.0, -0.6]} castShadow>
              <coneGeometry args={[0.05, 0.18, 6]} />
              <meshStandardMaterial
                color={accent}
                metalness={0.55}
                roughness={0.35}
                emissive={accent}
                emissiveIntensity={0.2}
              />
            </mesh>
          </>
        )}
      </group>

      {/* Limbs: tapered, not capsules */}
      <group position={[-0.26, 0.15, 0]} rotation={[0, 0, 0.9]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.07, 0.30, 7]} />
          <meshStandardMaterial color={furColor} roughness={0.8} metalness={0.15} />
        </mesh>
      </group>
      <group position={[0.26, 0.15, 0]} rotation={[0, 0, -0.9]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.07, 0.30, 7]} />
          <meshStandardMaterial color={furColor} roughness={0.8} metalness={0.15} />
        </mesh>
      </group>
      <group position={[-0.10, -0.28, 0.04]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.34, 7]} />
          <meshStandardMaterial color={furColor} roughness={0.85} metalness={0.1} />
        </mesh>
        {/* Foot */}
        <mesh position={[0.02, -0.26, 0.12]} castShadow>
          <boxGeometry args={[0.16, 0.08, 0.26]} />
          <meshStandardMaterial color={"#0b1020"} roughness={0.7} metalness={0.2} />
        </mesh>
      </group>
      <group position={[0.10, -0.28, 0.04]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.34, 7]} />
          <meshStandardMaterial color={furColor} roughness={0.85} metalness={0.1} />
        </mesh>
        <mesh position={[-0.02, -0.26, 0.12]} castShadow>
          <boxGeometry args={[0.16, 0.08, 0.26]} />
          <meshStandardMaterial color={"#0b1020"} roughness={0.7} metalness={0.2} />
        </mesh>
      </group>

      {/* Wings */}
      {hasWings && (
        <group position={[0, 0.14, -0.10]}>
          <mesh position={[-0.22, 0.0, 0]} rotation={[0.2, 0.5, 0.2]} castShadow>
            <planeGeometry args={[0.40, 0.22]} />
            <meshStandardMaterial
              color={primary}
              emissive={accent}
              emissiveIntensity={0.08}
              roughness={0.9}
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh position={[0.22, 0.0, 0]} rotation={[0.2, -0.5, -0.2]} castShadow>
            <planeGeometry args={[0.40, 0.22]} />
            <meshStandardMaterial
              color={primary}
              emissive={accent}
              emissiveIntensity={0.08}
              roughness={0.9}
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      )}

      {/* Spines / quills */}
      {(hasSpines || quillCount > 0) && (
        <group position={[0, 0.20, -0.18]}>
          {Array.from({ length: quillCount || 6 }).map((_, i) => (
            <mesh
              key={i}
              position={[0, 0.02 + i * 0.03, -0.02 - i * 0.04]}
              rotation={[Math.PI / 2.6, 0, 0]}
              castShadow
            >
              <coneGeometry args={[0.03, 0.16 + i * 0.03, 5]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={0.2}
                roughness={0.4}
                metalness={0.4}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Tail(s): segmented, glowing tip */}
      {hasTails && (
        <group position={[0, -0.02, -0.22]}>
          <mesh position={[0, 0, -0.08]} rotation={[0.4, 0, 0]} castShadow>
            <capsuleGeometry args={[0.035, 0.22, 6, 10]} />
            <meshStandardMaterial color={furColor} roughness={0.8} metalness={0.15} />
          </mesh>
          <mesh position={[0, -0.10, -0.18]} castShadow>
            <sphereGeometry args={[0.05, 14, 12]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.8}
              roughness={0.25}
              metalness={0.55}
            />
          </mesh>
        </group>
      )}

      {/* Twin mechanical tail-blades (Kaison-style) */}
      {hasTwinMechTails && (
        <group position={[0, -0.05, -0.24]}>
          {[-0.12, 0.12].map((x) => (
            <group key={x} position={[x, 0, 0]} rotation={[0.35, x > 0 ? -0.35 : 0.35, 0]}>
              <mesh castShadow>
                <capsuleGeometry args={[0.025, 0.24, 6, 10]} />
                <meshStandardMaterial color={"#0b1020"} roughness={0.55} metalness={0.35} />
              </mesh>
              <mesh position={[0, -0.16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <boxGeometry args={[0.10, 0.035, 0.14]} />
                <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* Electric aura */}
      {hasElectricAura && (
        <mesh position={[0, 0.10, 0]} scale={1.25}>
          <sphereGeometry args={[0.55, 18, 14]} />
          <meshBasicMaterial color={accent} transparent opacity={0.10} depthWrite={false} />
        </mesh>
      )}

      {/* Web gear (simple straps) */}
      {hasWebGear && (
        <mesh position={[0, 0.12, 0.18]} rotation={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[0.52, 0.04, 0.24]} />
          <meshStandardMaterial color={"#101424"} roughness={0.85} metalness={0.1} />
        </mesh>
      )}
    </group>
  );
}

