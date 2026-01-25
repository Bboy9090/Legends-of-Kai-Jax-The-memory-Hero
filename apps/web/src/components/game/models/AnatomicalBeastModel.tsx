import { useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Fighter } from "../../../lib/characters";
import { COMPLETE_BEAST_ROSTER } from "@beast-kin/shared/data/complete_beast_roster";

export interface AnatomicalBeastModelProps {
  fighter: Fighter;
  bodyRef: RefObject<THREE.Group>;
  headRef: RefObject<THREE.Group>;
  leftArmRef: RefObject<THREE.Group>;
  rightArmRef: RefObject<THREE.Group>;
  leftLegRef: RefObject<THREE.Group>;
  rightLegRef: RefObject<THREE.Group>;
  emotionIntensity: number;
  hitAnim: number;
  animTime: number;
  isAttacking: boolean;
  isInvulnerable: boolean;
  isMoving?: boolean;
}

/**
 * AnatomicalBeastModel
 * Goal: “actual animals fighting” (snout/jaw/ears, digitigrade legs, paws/claws),
 * driven by `COMPLETE_BEAST_ROSTER` hybrid + features.
 */
export default function AnatomicalBeastModel({
  fighter,
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
  isMoving = false,
}: AnatomicalBeastModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nebulaRef = useRef<THREE.Mesh>(null);

  const beast = useMemo(
    () => COMPLETE_BEAST_ROSTER.find((b) => b.id === fighter.id) || null,
    [fighter.id]
  );

  const primary = beast?.visual.primaryColor || fighter.color || "#1a1a1a";
  const accent = beast?.visual.accentColor || fighter.accentColor || "#00f2ff";
  const features = beast?.visual.features || [];
  const hybrid = beast?.beastHybrid || "";
  const featureKey = features.join("|");

  const has = (k: string) => features.some((f) => f === k || f.includes(k));
  const hasWord = (re: RegExp) => features.some((f) => re.test(f));

  const isCanine = /wolf|kitsune|fox|lupine/i.test(hybrid);
  const isBird = /bird|avian|hawk|eagle|falcon/i.test(hybrid) || has("eagle_head");
  const isReptile = /reptile|lizard|snake|serpent|croc|alligator/i.test(hybrid) || has("serpent_body");
  const isFrog = /frog|toad|amphib/i.test(hybrid);
  const isDragon = /dragon|drake/i.test(hybrid);
  const isSpider = /spider|arachnid/i.test(hybrid);

  const hasWings = hasWord(/wing/i) || isBird || isDragon || has("massive_wings");
  const hasHorns = hasWord(/horn/i) || isDragon || /bull|ram/i.test(hybrid);
  const hasSpines = hasWord(/spine|quill|spike/i) || isSpider || isDragon || has("electric_quills");
  const hasTails = hasWord(/tail/i) || isCanine || isDragon;

  const hasTacticalJacket = has("tactical_jacket") || hasWord(/jacket/i);
  const hasChaseBadge = has("chase_badge") || hasWord(/badge/i);
  const hasWebGear = has("web_equipment") || hasWord(/web/i);
  const hasTwinMechTails = has("two_mechanical_tails") || hasWord(/mechanical.*tail/i);

  const hasElectricAura = has("electric_aura") || has("lightning_aura") || hasWord(/electric|lightning/i);
  const hasInternalNebulae = has("internal_nebulae");
  const hasThreeMemoryTails = has("three_memory_tails");
  const hasSageEyes = has("sage_mode_eyes");

  const quillCount = has("seven_electric_quills") ? 7 : hasSpines ? 6 : 0;
  const eyeColor = hasSageEyes ? "#FFD700" : has("feral_amber_eyes") ? "#FFB000" : accent;

  const furColor = has("charcoal_fur") ? "#1a1a1a" : primary;
  const clothColor = hasTacticalJacket ? "#0b1020" : primary;

  const memoryTailGeometries = useMemo(() => {
    if (!hasThreeMemoryTails) return [] as THREE.TubeGeometry[];
    const mk = (phase: number) =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.10, -0.16),
        new THREE.Vector3(Math.sin(phase) * 0.18, 0.22, -0.34),
        new THREE.Vector3(Math.sin(phase + 1.0) * 0.34, 0.42, -0.56),
        new THREE.Vector3(Math.sin(phase + 2.0) * 0.48, 0.62, -0.74),
      ]);
    return [0, 1, 2].map((i) => new THREE.TubeGeometry(mk((i / 3) * Math.PI * 2), 36, 0.022, 8, false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fighter.id, featureKey]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = animTime || state.clock.elapsedTime;

    // Idle breathing / weight shift
    groupRef.current.position.y = Math.sin(t * 2.0) * 0.02;
    groupRef.current.rotation.y = Math.sin(t * 0.6) * 0.18;
    if (hitAnim > 0) groupRef.current.rotation.z = Math.sin(t * 22) * 0.06 * hitAnim;

    // Walk + attack motion
    const walk = isMoving ? Math.sin(t * 10) : 0;
    const atk = isAttacking ? Math.max(0, Math.sin(t * 16)) : 0;

    leftArmRef.current && (leftArmRef.current.rotation.x = -0.35 * walk + -0.65 * atk);
    rightArmRef.current && (rightArmRef.current.rotation.x = 0.35 * walk + -0.65 * atk);
    leftLegRef.current && (leftLegRef.current.rotation.x = 0.45 * walk);
    rightLegRef.current && (rightLegRef.current.rotation.x = -0.45 * walk);

    if (headRef.current) {
      headRef.current.rotation.x = 0.06 + (isAttacking ? 0.12 : 0) + emotionIntensity * 0.06;
      headRef.current.rotation.y = Math.sin(t * 1.5) * 0.06;
    }

    if (nebulaRef.current && hasInternalNebulae) {
      nebulaRef.current.rotation.y += delta * 0.8;
      const mat = nebulaRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.10 + (Math.sin(t * 1.8) * 0.5 + 0.5) * 0.20;
    }
  });

  return (
    <group ref={groupRef} scale={[2.9, 2.9, 2.9]}>
      <group ref={bodyRef} position={[0, 0.40, 0]}>
        {/* Chest + pelvis (animal proportions) */}
        <mesh castShadow receiveShadow position={[0, 0.18, 0.02]}>
          <cylinderGeometry args={[0.26, 0.32, 0.46, 10]} />
          <meshStandardMaterial color={furColor} metalness={0.18} roughness={0.75} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, -0.12, -0.02]} rotation={[0.08, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 0.34, 10]} />
          <meshStandardMaterial color={furColor} metalness={0.15} roughness={0.8} />
        </mesh>

        {/* Internal nebulae (Kai‑Jax) */}
        {hasInternalNebulae && (
          <mesh ref={nebulaRef} position={[0, 0.18, 0.03]} scale={0.95}>
            <sphereGeometry args={[0.28, 16, 12]} />
            <meshBasicMaterial
              color={accent}
              transparent
              opacity={0.22}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Tactical jacket / armor */}
        {hasTacticalJacket && (
          <>
            <mesh position={[0, 0.18, 0.22]} castShadow>
              <boxGeometry args={[0.46, 0.46, 0.08]} />
              <meshStandardMaterial
                color={clothColor}
                metalness={0.35}
                roughness={0.55}
                emissive={accent}
                emissiveIntensity={0.08}
              />
            </mesh>
            <mesh position={[0, 0.38, 0.10]} rotation={[0.18, 0, 0]} castShadow>
              <boxGeometry args={[0.50, 0.12, 0.24]} />
              <meshStandardMaterial color={clothColor} metalness={0.25} roughness={0.7} />
            </mesh>
          </>
        )}

        {hasChaseBadge && (
          <mesh position={[-0.22, 0.28, 0.22]} castShadow>
            <circleGeometry args={[0.08, 14]} />
            <meshBasicMaterial color={accent} />
          </mesh>
        )}

        {hasWebGear && (
          <mesh position={[0, 0.22, 0.12]} rotation={[0.6, 0, 0]} castShadow>
            <boxGeometry args={[0.52, 0.035, 0.22]} />
            <meshStandardMaterial color={"#101424"} roughness={0.85} metalness={0.1} />
          </mesh>
        )}

        {/* Head */}
        <group ref={headRef} position={[0, 0.62, 0.14]}>
          <mesh castShadow receiveShadow>
            <icosahedronGeometry args={[0.24, 1]} />
            <meshStandardMaterial color={furColor} metalness={0.15} roughness={0.8} />
          </mesh>

          {isCanine && (
            <>
              <mesh position={[0, -0.05, 0.26]} rotation={[0.15, 0, 0]} castShadow>
                <coneGeometry args={[0.11, 0.26, 10]} />
                <meshStandardMaterial color={furColor} roughness={0.75} metalness={0.08} />
              </mesh>
              <mesh position={[0, -0.16, 0.20]} rotation={[0.10, 0, 0]} castShadow>
                <boxGeometry args={[0.16, 0.06, 0.18]} />
                <meshStandardMaterial color={"#0a0a0f"} roughness={0.95} metalness={0.02} />
              </mesh>
              <mesh position={[-0.18, 0.16, -0.02]} rotation={[0.18, 0, 0.45]} castShadow>
                <coneGeometry args={[0.06, 0.20, 8]} />
                <meshStandardMaterial color={furColor} roughness={0.8} metalness={0.05} />
              </mesh>
              <mesh position={[0.18, 0.16, -0.02]} rotation={[0.18, 0, -0.45]} castShadow>
                <coneGeometry args={[0.06, 0.20, 8]} />
                <meshStandardMaterial color={furColor} roughness={0.8} metalness={0.05} />
              </mesh>
            </>
          )}

          {isBird && (
            <mesh position={[0, -0.02, 0.26]} rotation={[0.08, 0, 0]} castShadow>
              <coneGeometry args={[0.065, 0.24, 8]} />
              <meshStandardMaterial color={accent} roughness={0.45} metalness={0.25} />
            </mesh>
          )}

          {isReptile && (
            <>
              <mesh position={[0, -0.06, 0.28]} rotation={[0.05, 0, 0]} castShadow>
                <boxGeometry args={[0.18, 0.10, 0.28]} />
                <meshStandardMaterial color={furColor} roughness={0.78} metalness={0.06} />
              </mesh>
              <mesh position={[0, 0.18, -0.10]} rotation={[Math.PI / 2.4, 0, 0]} castShadow>
                <coneGeometry args={[0.05, 0.24, 6]} />
                <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.12} />
              </mesh>
            </>
          )}

          {isFrog && (
            <mesh position={[0, -0.14, 0.18]} castShadow>
              <boxGeometry args={[0.22, 0.06, 0.14]} />
              <meshStandardMaterial color={furColor} roughness={0.9} metalness={0.02} />
            </mesh>
          )}

          {isSpider &&
            Array.from({ length: 6 }).map((_, i) => (
              <mesh
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                position={[-0.14 + i * 0.056, 0.10, 0.20]}
              >
                <sphereGeometry args={[0.018, 10, 8]} />
                <meshBasicMaterial color={accent} />
              </mesh>
            ))}

          {/* Eyes (slits) */}
          <mesh position={[-0.08, 0.02, 0.20]} rotation={[0, 0.10, 0]}>
            <planeGeometry args={[0.12, 0.03]} />
            <meshBasicMaterial color={eyeColor} transparent opacity={0.92} />
          </mesh>
          <mesh position={[0.08, 0.02, 0.20]} rotation={[0, -0.10, 0]}>
            <planeGeometry args={[0.12, 0.03]} />
            <meshBasicMaterial color={eyeColor} transparent opacity={0.92} />
          </mesh>

          {hasHorns && (
            <>
              <mesh position={[-0.16, 0.12, -0.02]} rotation={[0.2, 0.0, 0.6]} castShadow>
                <coneGeometry args={[0.05, 0.20, 6]} />
                <meshStandardMaterial
                  color={accent}
                  metalness={0.55}
                  roughness={0.35}
                  emissive={accent}
                  emissiveIntensity={0.18}
                />
              </mesh>
              <mesh position={[0.16, 0.12, -0.02]} rotation={[0.2, 0.0, -0.6]} castShadow>
                <coneGeometry args={[0.05, 0.20, 6]} />
                <meshStandardMaterial
                  color={accent}
                  metalness={0.55}
                  roughness={0.35}
                  emissive={accent}
                  emissiveIntensity={0.18}
                />
              </mesh>
            </>
          )}
        </group>

        {/* Arms (paws/claws) */}
        <group ref={leftArmRef} position={[-0.28, 0.38, 0.02]} rotation={[0, 0, 0.55]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.08, 0.28, 8]} />
            <meshStandardMaterial color={furColor} roughness={0.85} metalness={0.08} />
          </mesh>
          <mesh position={[0, -0.20, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 0.24, 8]} />
            <meshStandardMaterial color={furColor} roughness={0.85} metalness={0.08} />
          </mesh>
          <mesh position={[0, -0.34, 0.05]} castShadow>
            <dodecahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color={"#0b1020"} roughness={0.75} metalness={0.25} />
          </mesh>
          {[-0.04, 0, 0.04].map((x) => (
            <mesh key={x} position={[x, -0.38, 0.12]} rotation={[0.25, 0, 0]} castShadow>
              <coneGeometry args={[0.012, 0.05, 5]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.15} />
            </mesh>
          ))}
        </group>

        <group ref={rightArmRef} position={[0.28, 0.38, 0.02]} rotation={[0, 0, -0.55]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.08, 0.28, 8]} />
            <meshStandardMaterial color={furColor} roughness={0.85} metalness={0.08} />
          </mesh>
          <mesh position={[0, -0.20, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 0.24, 8]} />
            <meshStandardMaterial color={furColor} roughness={0.85} metalness={0.08} />
          </mesh>
          <mesh position={[0, -0.34, 0.05]} castShadow>
            <dodecahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color={"#0b1020"} roughness={0.75} metalness={0.25} />
          </mesh>
          {[-0.04, 0, 0.04].map((x) => (
            <mesh key={x} position={[x, -0.38, 0.12]} rotation={[0.25, 0, 0]} castShadow>
              <coneGeometry args={[0.012, 0.05, 5]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.15} />
            </mesh>
          ))}
        </group>

        {/* Legs (digitigrade) */}
        <group ref={leftLegRef} position={[-0.14, 0.02, 0.02]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.34, 8]} />
            <meshStandardMaterial color={furColor} roughness={0.9} metalness={0.05} />
          </mesh>
          <mesh position={[0.02, -0.28, 0.12]} rotation={[0.55, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.28, 8]} />
            <meshStandardMaterial color={furColor} roughness={0.9} metalness={0.05} />
          </mesh>
          <mesh position={[0.04, -0.46, 0.26]} rotation={[0.10, 0, 0]} castShadow>
            <dodecahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial color={"#0b1020"} roughness={0.75} metalness={0.22} />
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.14, 0.02, 0.02]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.34, 8]} />
            <meshStandardMaterial color={furColor} roughness={0.9} metalness={0.05} />
          </mesh>
          <mesh position={[-0.02, -0.28, 0.12]} rotation={[0.55, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.28, 8]} />
            <meshStandardMaterial color={furColor} roughness={0.9} metalness={0.05} />
          </mesh>
          <mesh position={[-0.04, -0.46, 0.26]} rotation={[0.10, 0, 0]} castShadow>
            <dodecahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial color={"#0b1020"} roughness={0.75} metalness={0.22} />
          </mesh>
        </group>

        {/* Wings */}
        {hasWings && (
          <group position={[0, 0.44, -0.08]}>
            <mesh position={[-0.30, 0.0, 0]} rotation={[0.2, 0.6, 0.2]} castShadow>
              <planeGeometry args={[0.60, 0.30]} />
              <meshStandardMaterial
                color={furColor}
                emissive={accent}
                emissiveIntensity={0.08}
                roughness={0.9}
                side={THREE.DoubleSide}
                transparent
                opacity={0.92}
              />
            </mesh>
            <mesh position={[0.30, 0.0, 0]} rotation={[0.2, -0.6, -0.2]} castShadow>
              <planeGeometry args={[0.60, 0.30]} />
              <meshStandardMaterial
                color={furColor}
                emissive={accent}
                emissiveIntensity={0.08}
                roughness={0.9}
                side={THREE.DoubleSide}
                transparent
                opacity={0.92}
              />
            </mesh>
          </group>
        )}

        {/* Quills / spines */}
        {(hasSpines || quillCount > 0) && (
          <group position={[0, 0.44, -0.18]}>
            {Array.from({ length: quillCount || 6 }).map((_, i) => (
              <mesh
                key={i}
                position={[0, 0.02 + i * 0.03, -0.02 - i * 0.05]}
                rotation={[Math.PI / 2.55, 0, 0]}
                castShadow
              >
                <coneGeometry args={[0.028, 0.18 + i * 0.03, 5]} />
                <meshStandardMaterial
                  color={accent}
                  emissive={accent}
                  emissiveIntensity={0.22}
                  roughness={0.35}
                  metalness={0.35}
                />
              </mesh>
            ))}
          </group>
        )}

        {/* Tails */}
        {hasThreeMemoryTails && (
          <group position={[0, 0.08, -0.10]}>
            {memoryTailGeometries.map((geo, i) => (
              <mesh
                key={i}
                geometry={geo}
                rotation={[0, (i / 3) * Math.PI * 2, 0]}
                castShadow
              >
                <meshStandardMaterial
                  color={accent}
                  emissive={accent}
                  emissiveIntensity={0.35}
                  roughness={0.35}
                  metalness={0.35}
                  transparent
                  opacity={0.85}
                />
              </mesh>
            ))}
          </group>
        )}

        {!hasThreeMemoryTails && hasTails && !hasTwinMechTails && (
          <group position={[0, 0.14, -0.22]}>
            <mesh position={[0, 0.0, -0.10]} rotation={[0.5, 0, 0]} castShadow>
              <capsuleGeometry args={[0.035, 0.26, 6, 10]} />
              <meshStandardMaterial color={furColor} roughness={0.85} metalness={0.1} />
            </mesh>
            <mesh position={[0, -0.12, -0.26]} castShadow>
              <dodecahedronGeometry args={[0.05, 0]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} roughness={0.3} />
            </mesh>
          </group>
        )}

        {hasTwinMechTails && (
          <group position={[0, 0.10, -0.24]}>
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
      </group>

      {/* Electric aura */}
      {hasElectricAura && (
        <mesh position={[0, 1.15, 0]} scale={2.2}>
          <sphereGeometry args={[0.55, 18, 14]} />
          <meshBasicMaterial color={accent} transparent opacity={0.10} depthWrite={false} />
        </mesh>
      )}

      {/* Invulnerability flash */}
      {isInvulnerable && (
        <mesh position={[0, 1.15, 0]} scale={2.2}>
          <sphereGeometry args={[0.60, 18, 14]} />
          <meshBasicMaterial color={eyeColor} transparent opacity={0.10} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

